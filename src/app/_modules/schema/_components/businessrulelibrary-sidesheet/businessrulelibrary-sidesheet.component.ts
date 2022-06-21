import { Component, OnInit } from '@angular/core';
import { BusinessRuleType, CoreSchemaBrInfo } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { BusinessRules } from '@modules/admin/_components/module/schema/diw-create-businessrule/diw-create-businessrule.component';
import { RULE_TYPES } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { SchemaService } from '@services/home/schema.service';
import { GLOBALCONSTANTS } from '../../../../_constants';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { TransientService } from 'mdo-ui-library';

@Component({
  selector: 'pros-businessrulelibrary-sidesheet',
  templateUrl: './businessrulelibrary-sidesheet.component.html',
  styleUrls: ['./businessrulelibrary-sidesheet.component.scss']
})
export class BusinessrulelibrarySidesheetComponent implements OnInit {
  /**
   * selected schema id
   */
  schemaId: string;

  /**
   * selected module id
   */
  moduleId: string;

  /**
   * hold the business rules list
   */
  businessRulesList: CoreSchemaBrInfo[] = [];

  /**
   * hold the business rules list
   */
   businessRulesListObs: Observable<CoreSchemaBrInfo[]> = of([]);

  /**
   * hold the filtered business rules
   */
  filteredBusinessRulesList: CoreSchemaBrInfo[] = [];

  /**
   * hold the selected rules
   */
  selectedBusinessRule: CoreSchemaBrInfo[] = [];

  /**
   * selected business rule type
   */
  selectedRuleType = '';

  /**
   * To hold the outlet name.
   */
  outlet: string;

  /**
   * fetch count to fetch business rule data.
   */
  fetchCount = 0;

  /**
   * hold the business rule types
   */
  businessRuleTypes: BusinessRules[] = RULE_TYPES;

  /**
   * To hold schema business rule details
   */
  schemaBusinessRulesList: CoreSchemaBrInfo[] = [];

  /**
   * To store bRs info which should be deleted
   */
  BusinessRulesToBeDelete: CoreSchemaBrInfo[] = [];

  /**
   * pre selected business rules
   */
  alreadySelectedBrs: CoreSchemaBrInfo[] = [];

  brSearchSubject: Subject<string> = new Subject();

  /**
   * search string
   */
  searchString = '';

  /**
   * flag to identify the listed rule is only transformation rules
   */
  isOnlyTransformation: boolean;

  crossDatasetRuleInfo = {
    isForCrossDatasetRule: false,
    selectedBrRuleId: ''
  };

  loader = false;
  constructor(
    private schemaService: SchemaService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private transientSesrvice: TransientService,
    private sharedService: SharedServiceService
  ) { }


  /**
   * Angular hook
   */
  ngOnInit(): void {
    console.log(this.router);
    this.activatedRoute.params.subscribe((params) => {
      this.outlet = params.outlet;
      this.schemaId = params.schemaId;
      this.moduleId = params.moduleId;
    });
    this.activatedRoute.queryParamMap.subscribe(q=>{
      this.isOnlyTransformation = q.has('t') && q.get('t') ==='true' ? true : false;

      this.crossDatasetRuleInfo.isForCrossDatasetRule = q.has('businessRule') && q.get('businessRule') === 'BR_CROSS_DATASET_RULE';
      this.crossDatasetRuleInfo.selectedBrRuleId = q.has('selectedBrRuleId') ? q.get('selectedBrRuleId') : '';
      this.selectedRuleType = q.has('ruleType') ? q.get('ruleType') : '';
    });

    if (!this.crossDatasetRuleInfo.isForCrossDatasetRule) {
      this.getBusinessRulesBySchemaId(this.schemaId);
    }
    this.getBusinessRulesList(this.moduleId, this.searchString, this.selectedRuleType);

    this.brSearchSubject.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe(searchTxt => {
      this.searchString = searchTxt || '';
      this.getBusinessRulesList(this.moduleId, this.searchString, this.selectedRuleType);
    });


  }


  /**
   * Function to get business rules according to schema Id
   * @param schemaId : schema ID
   */
  getBusinessRulesBySchemaId(schemaId: string) {
    this.schemaService.getBusinessRulesBySchemaId(schemaId).subscribe((response) => {
      this.schemaBusinessRulesList = response;
      this.alreadySelectedBrs = [...this.schemaBusinessRulesList];
    }, (error) => {
      console.log('Something went wrong while getting schema Brs', error.message);
    })
  }

  /**
   * function to select a business rule from the list...
   */
  selectBusinessRule(rule: CoreSchemaBrInfo, action: string) {
    const findBR = (list: Array<CoreSchemaBrInfo>) => list.find(br => (br.brIdStr === rule.brIdStr) || (br.copiedFrom === rule.brIdStr));
    const deletedBR = findBR(this.BusinessRulesToBeDelete);
    if(deletedBR) {
      this.BusinessRulesToBeDelete.splice(this.BusinessRulesToBeDelete.indexOf(deletedBR), 1);
      return;
    }
    const existingBR = findBR(this.alreadySelectedBrs);
    if (existingBR) {
      this.BusinessRulesToBeDelete.push(existingBR);
      return;
    }
    if (action === this.constants.ADD) {
      if (this.crossDatasetRuleInfo.isForCrossDatasetRule && this.selectedBusinessRule.length) {
        this.transientSesrvice.alert({
          data: { dialogTitle: '', label: 'Can not assign more than one Business rule' },
          disableClose: true,
          autoFocus: false,
          width: '600px',
          panelClass: 'create-master-panel',
        }, (response) => { });
      } else {
        this.selectedBusinessRule.push(rule);
      }
    } else {
      const br = this.selectedBusinessRule.filter((businessRule) => businessRule.brIdStr === rule.brIdStr)[0];
      const index = this.selectedBusinessRule.indexOf(br);
      this.selectedBusinessRule.splice(index, 1)
    }
  }

  /**
   * Function to get constants(ADD/REMOVE)
   */
  get constants() {
    return GLOBALCONSTANTS;
  }


  /**
   * Check if a particular rule is selected
   */
  isSelected(rule: CoreSchemaBrInfo): boolean {
    const selected = this.selectedBusinessRule.filter((selectedRule: CoreSchemaBrInfo) => selectedRule.brIdStr === rule.brIdStr);
    const alreadySelected = this.alreadySelectedBrs.filter((selectedRule: CoreSchemaBrInfo) => (selectedRule.brIdStr === rule.brIdStr) || (selectedRule.copiedFrom === rule.brIdStr));
    const deletedBRs = this.BusinessRulesToBeDelete.filter((selectedRule: CoreSchemaBrInfo) => (selectedRule.brIdStr === rule.brIdStr) || (selectedRule.copiedFrom === rule.brIdStr));
    return (selected.length > 0 || alreadySelected.length > 0 && !deletedBRs.length);
  }

  /**
   * Get business rule list from the api
   * @param moduleId moduleId
   * @param searchString string to be searched
   * @param brType type of busiess rule
   * @param loadMore load more
   */
  getBusinessRulesList(moduleId: string, searchString: string, brType: string, loadMore?: boolean) {
    if(loadMore) {
      this.fetchCount++;
    } else {
      this.fetchCount = 0;
    }
    if(this.isOnlyTransformation) {
      if (!loadMore) {
        this.loader = true;
      }
      this.schemaService.transformationRules(moduleId, this.fetchCount, 40, searchString).subscribe(rules=>{
        if (!loadMore) {
          this.loader = false;
        }
        if(loadMore) {
          if(rules && rules.length) {
            this.businessRulesList = [...this.businessRulesList, ...rules];
          } else {
            this.fetchCount--;
          }
        } else {
          this.businessRulesList = rules || [];
        }
      });
    } else {
      if (!loadMore) {
        this.loader = true;
      }
      this.schemaService.getBusinessRulesByModuleId(moduleId, searchString, brType, `${this.fetchCount}`, 40).pipe(
        finalize(() => {
          if (!loadMore) {
            this.loader = false;
          }
          if (this.crossDatasetRuleInfo.isForCrossDatasetRule && this.crossDatasetRuleInfo.selectedBrRuleId) {
            this.selectedBusinessRule = this.businessRulesList.filter(rule => rule.brIdStr === this.crossDatasetRuleInfo.selectedBrRuleId);
          }
        })
      ).subscribe((rules: CoreSchemaBrInfo[]) => {
        if (!loadMore) {
          this.loader = false;
        }
        if(loadMore) {
          if(rules && rules.length) {
            this.businessRulesList = [...this.businessRulesList, ...rules];
          } else {
            this.fetchCount--;
          }
        } else {
          this.businessRulesList = rules || [];
        }
      }, error => {
        console.log('Error:',error);
      });
    }

  }

  /**
   * function to close the dialog
   */
  closeDialogComponent() {
    this.sharedService.setAfterBrSave(null);
    this.router.navigate([{ outlets: { [`${this.outlet}`]: null } }], { queryParamsHandling: 'preserve'})
  }

  /**
   * save data and close the dialog
   */
  saveSelection() {
    const error = this.selectedBusinessRule.map((br, ind) => ({
      br,
      list: [...(this.schemaBusinessRulesList || []), ...this.selectedBusinessRule.slice(0, ind)]
    }))
    .find(obj => !this.canAllowNewBR(obj.br, obj.list));
    if(error) {
      return false;
    }
    if (this.outlet === 'sb') {
      let count = 0;
      console.log('test  ' + this.selectedBusinessRule);
      const forkObj= {};
      this.BusinessRulesToBeDelete.forEach((businessRule) => {
        forkObj[count++] = this.schemaService.deleteBr(businessRule.brIdStr);
      });
      this.selectedBusinessRule.forEach(businessRule => {
        const request: CoreSchemaBrInfo = new CoreSchemaBrInfo();

        request.brIdStr = '';
        request.schemaId = this.schemaId;
        request.brInfo = businessRule.brInfo;
        request.brType = businessRule.brType;
        request.fields = businessRule.fields;
        request.message = businessRule.message;
        request.isCopied = true;
        request.moduleId = this.moduleId;
        request.copiedFrom = businessRule.brIdStr;
        console.log('--------- ', request);
        if(businessRule.brType === 'BR_DUPLICATE_CHECK') {
          forkObj[count++] = this.schemaService.copyDuplicateRule(request);
        } else {
          forkObj[count++] = this.schemaService.createBusinessRule(request);
        }
      });
      forkJoin(forkObj).subscribe(() => {
        this.sharedService.setAfterBrSave(true);
        this.closeDialogComponent();
      });
    } else if (this.outlet === 'sb3') {
      this.sharedService.setAfterBrSave(this.selectedBusinessRule);
      this.closeDialogComponent();
    }
    else {
      if (this.router.url.includes('schema/check-data')) {
        const forkObj = {};
        let count = 0;
        this.BusinessRulesToBeDelete.forEach((businessRule) => {
          forkObj[count++] = this.schemaService.deleteBr(businessRule.brIdStr);
        });
        forkJoin(forkObj).subscribe(() => {
          this.sharedService.setAfterBrSave('delete');
        });
      }
      this.selectedBusinessRule.forEach((businessRule) => {
        businessRule.isCopied = true;
        businessRule.schemaId = null;
        businessRule.copiedFrom = null;
        businessRule.dontMapped = this.isOnlyTransformation ? true : false;
      })
      this.sharedService.setAfterBrSave(this.selectedBusinessRule);
    }
    this.closeDialogComponent();
  }

  /**
   * Function to decide if we can allow current business rule to be saved based on some validations
   */
  canAllowNewBR(brInfo, brList = this.schemaBusinessRulesList): boolean {
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
      this.transientSesrvice.open(error,'ok',{duration:2000});
    }
    return !Boolean(error);
  }
  /**
   * select a business rule type
   */
  selectCurrentRuleType(ruleType: string) {
    if(ruleType !== this.selectedRuleType) {
      this.selectedRuleType = ruleType;
      this.getBusinessRulesList(this.moduleId, this.searchString, this.selectedRuleType);
    }
  }

  /**
   * to optimize long dynamic list rendering
   */
  trackByFn(index: number) {
    return index; // or item.id
  }

  /**
   * load more rules on scroll end
   */
  onScrollEnd() {
    this.getBusinessRulesList(this.moduleId, this.searchString, this.selectedRuleType, true);
  }

  /**
   * to convert rule type into rule description
   * @param ruleType ruleType of a business rule object
   */
   public getRuleDesc(ruleType: string) {
    return RULE_TYPES.find(rule => rule.ruleType === ruleType)?.ruleDesc;
  }

}
