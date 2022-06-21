import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BusinessRuleType, CoreSchemaBrInfo } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { BusinessRules } from '@modules/admin/_components/module/schema/diw-create-businessrule/diw-create-businessrule.component';
import { RULE_TYPES } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { SchemaService } from '@services/home/schema.service';
import { GLOBALCONSTANTS } from '../../../../_constants';
import { TransientService } from 'mdo-ui-library';

@Component({
  selector: 'pros-businessrulelibrary-dialog',
  templateUrl: './businessrulelibrary-dialog.component.html',
  styleUrls: ['./businessrulelibrary-dialog.component.scss']
})
export class BusinessrulelibraryDialogComponent implements OnInit {
  businessRulesList: CoreSchemaBrInfo[] = [];
  filteredBusinessRulesList: CoreSchemaBrInfo[] = [];
  selectedBusinessRule: CoreSchemaBrInfo[] = [];
  selectedBusinessRuleCopy: CoreSchemaBrInfo[] = [];
  selectedBusinessRuleIds: string[] = [];
  loader = false;
  selectedRuleType: BusinessRules;
  brsToRemove: CoreSchemaBrInfo[] =[];
  /**
   * FetchCount to fetch business rules data..
   */
  fetchCount = 0;

  businessRuleTypes: BusinessRules[] = RULE_TYPES;

  searchString = '';


  constructor(
    private dialogRef: MatDialogRef<Component>,
    private transientService: TransientService,
    @Inject(MAT_DIALOG_DATA) public data,
    private schemaService: SchemaService
  ) { }


  /**
   * Angular hook
   */
  ngOnInit(): void {
    this.getBusinessRulesList(this.data.moduleId, '', '', String(this.fetchCount));
  }

  // function to select a business rule from the list
  selectBusinessRule(rule: CoreSchemaBrInfo, action: string) {
    if (action === this.constants.ADD) {
      this.selectedBusinessRule.push(rule);
      this.selectedBusinessRuleCopy.push(rule);
    }
    if (action === this.constants.REMOVE) {
      this.selectedBusinessRule.splice(this.selectedBusinessRule.findIndex((bRule) => bRule.brId === rule.brId), 1);
      this.selectedBusinessRuleCopy.splice(this.selectedBusinessRuleCopy.findIndex((bRule) => bRule.brId === rule.brId), 1);
    }
  }

  // getter for GlobalConstants
  get constants() {
    return GLOBALCONSTANTS;
  }

  /**
   * Method to search through a rule from a list
   * using the ruleInfo as searchTerm
   */
  search(searchTerm: string) {
    this.searchString = searchTerm || '';
    searchTerm = this.searchString.trim();
    this.filteredBusinessRulesList =
      this.businessRulesList.filter((rule: CoreSchemaBrInfo) => {
        if (rule.brInfo) {
          return this.selectedRuleType ? rule.brInfo.toLowerCase().includes(searchTerm.toLowerCase()) && rule.brType === this.selectedRuleType.ruleType
            : rule.brInfo.toLowerCase().includes(searchTerm.toLowerCase());
        }
      });
  }

  /**
   * Function to decide if we can allow current business rule to be saved based on some validations
   */
  canAllowNewBR(brInfo, brList = this.data.selectedRules): boolean {
    const rules: {
      [index: string]: Array<string>
    } = {
      duplicate: [
        BusinessRuleType.BR_DUPLICATE_RULE
      ],
      classification: [
        BusinessRuleType.MRO_MANU_PRT_NUM_LOOKUP,
        BusinessRuleType.MRO_GSN_DESC_MATCH,
        BusinessRuleType.MRO_CLS_MASTER_CHECK
      ],
      dataQuality: [
        BusinessRuleType.BR_MANDATORY_FIELDS,
        BusinessRuleType.BR_METADATA_RULE,
        BusinessRuleType.BR_CUSTOM_SCRIPT,
        BusinessRuleType.BR_TRANSFORMATION,
        BusinessRuleType.MRO_MANU_PRT_NUM_IDENTI,
        BusinessRuleType.BR_REGEX_RULE
      ]
    };
    const currentRuleType = brInfo.brType;
    let error = '';
    // Find current schema view
    const ruleViewByType = (ruleType: string) => Object.keys(rules).find(ruleView => rules[ruleView].includes(ruleType)) || 'dataQuality';
    const currentRuleView = ruleViewByType(currentRuleType);
    // Check if All are same view
    const isSameView = brList.every(rule => ruleViewByType(rule.brType) === currentRuleView);
    // Check if same rule type already exists
    const isSameType = brList.find(rule => rule.brType === currentRuleType);
    if (!isSameView) {
      error = 'A rule with a different view cannot be added to a schema!';
    } else if (isSameType && currentRuleView!=='dataQuality') {
      error = `Multiple ${currentRuleView} rules cannot be added to one schema!`;
    }
    if(error) {
      this.transientService.open(error,'ok',{duration:2000});
    }
    return !Boolean(error);
  }

  /**
   * Check if a particular rule is selected
   */
  isSelected(rule: CoreSchemaBrInfo): boolean {
    const selected: CoreSchemaBrInfo[] =
      this.selectedBusinessRuleCopy.filter((selectedRule: CoreSchemaBrInfo) => selectedRule.brId === rule.brId);
    return (selected.length > 0);
  }

  /**
   * Get business rule list from the api
   */
  getBusinessRulesList(moduleId: string, searchString: string, brType: string, fetchCount: string) {
    this.loader = true;
    if (moduleId) {
      this.schemaService.getBusinessRulesByModuleId(moduleId, searchString, brType, fetchCount).subscribe((rules: CoreSchemaBrInfo[]) => {
        this.loader = false;
        if (rules && rules.length > 0) {
          this.businessRulesList = rules;
          this.filteredBusinessRulesList = rules;
          if (this.data && this.data.selectedRules && this.data.selectedRules.length > 0) {
            this.selectedBusinessRuleCopy = [...this.data.selectedRules];
          }
        }
      });
    } else {
      this.schemaService.getAllBusinessRules()
        .subscribe((rules: CoreSchemaBrInfo[]) => {
          this.loader = false;
          if (rules && rules.length > 0) {
            this.businessRulesList = rules;
            this.filteredBusinessRulesList = rules;
            if (this.data && this.data.selectedRules && this.data.selectedRules.length > 0) {
              this.selectedBusinessRuleCopy = [...this.data.selectedRules];
            }
          }
        });
    }
  }

  /**
   * function to close the dialog
   */
  closeDialogComponent() {
    this.dialogRef.close();
  }

  /**
   * save data and close the dialog
   */
  saveSelection() {
    const error = this.selectedBusinessRule.map((br, ind) => ({
      br,
      list: [...(this.data.selectedRules || []), ...this.selectedBusinessRule.slice(0, ind)]
    }))
    .find(obj => !this.canAllowNewBR(obj.br, obj.list));
    if(error) {
      return false;
    }
    this.dialogRef.close(this.selectedBusinessRule);
  }

  /**
   * select a business rule type
   */
  selectCurrentRuleType(ruleType: BusinessRules) {
    this.selectedRuleType = ruleType;
    this.search(this.searchString);
  }

  /**
   * to optimize long dynamic list rendering
   */
  trackByFn(index: number) {
    return index; // or item.id
  }
}
