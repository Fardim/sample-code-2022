import { SelectionModel } from '@angular/cdk/collections';
import { Component, forwardRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { ActivatedRoute, Params, Router } from '@angular/router';
import FormField from '@models/form-field';
import { Fieldlist } from '@models/list-page/listpage';
import { MdoMappings, SegmentMappings } from '@models/mapping';
import {
  BusinessRuleType,
  CoreSchemaBrInfo
} from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { CoreService } from '@services/core/core.service';
import { SchemaService } from '@services/home/schema.service';
import { RuleService } from '@services/rule/rule.service';
import { TransientService } from 'mdo-ui-library';
import { Observable, of, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'pros-target-field-transformation-rule',
  templateUrl: './target-field-transformation-rule.component.html',
  styleUrls: ['./target-field-transformation-rule.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => TargetFieldTransformationRuleComponent)
    }
  ]
})
export class TargetFieldTransformationRuleComponent extends FormField implements OnInit, OnChanges, OnDestroy {
  @Input() brType = '';
  moduleId = '';

  bussinessRuleSearchControl = new FormControl();
  businessRulesList = [];
  businessRulesObs: Observable<any> = of([]);

  selection = new SelectionModel<any>(true, []);
  selectedMappingFieldDesc: MdoMappings;
  targetFieldMappingValue = {
    targetFieldDesc: null as MdoMappings,
    mappedSourceFieldDesc: null as Fieldlist
  }
  mappedFieldDesc: Fieldlist;
  isRuleAlreadyApplied = false;

  @Input() targetFields: SegmentMappings[] = [];
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
  @Input() componentName = '';
  subscriptionsList: Subscription[] = [];
  showNullState = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private ruleService: RuleService,
    private schemaService: SchemaService,
    private sharedService: SharedServiceService,
    private router: Router,
    private transientService: TransientService,
    private coreService: CoreService
  ) {
    super();
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: Params) => {
      if (params.moduleId) {
        this.moduleId = params.moduleId;
      }
    });
    this.getBusinessRuleList(this.brType, this.moduleId, '');
    this.getTargetFieldDetails();
  }

  checkForBusinessRuleChanges() {
    this.bussinessRuleSearchControl.valueChanges.subscribe((value: string) => {
      if (value?.toLocaleLowerCase()) {
        this.getBusinessRuleList(this.brType, this.moduleId, value);
      } else {
        this.getBusinessRuleList(this.brType, this.moduleId, '');
      }
    });
  }

  getTargetFieldDetails() {
    this.subscriptionsList.push(this.sharedService.getTargetFieldDetails().subscribe((response: any) => {
      this.showNullState = (!response) ? true : false;
      if (response?.type === 'fieldSelected') {
        this.setSelectedTargetFieldValue(response);
      } else if (response?.type === 'new') {
        this.addNewTransformationRule(response);
      } else if (response?.type === 'edit') {
        this.editSelectedTransformationRule(response);
      } else if (response?.type === 'mapping-applied') {
        this.removeAppliedRule(response);
      }
    }));
  }

  setSelectedTargetFieldValue(response) {
    this.selection.clear();
    this.targetFieldMappingValue.targetFieldDesc = response.fieldDetails as MdoMappings;
    if (this.targetFieldMappingValue.targetFieldDesc?.translation?.transalationIds.length) {
      this.targetFieldMappingValue.targetFieldDesc?.translation?.transalationIds.forEach((ruleId) => {
        this.getBusinessRuleInfo(ruleId);
      });
    }
    if (this.targetFieldMappingValue.targetFieldDesc.mdoFieldId) {
      this.getFieldDetails();
    }
    this.checkForBusinessRuleChanges();
    this.filterBusinessRulesBasedOnMapping();
  }

  addNewTransformationRule(response) {
    const brRule = {
      ...response.response,
      transInfo: response?.requestPayload?.transInfo
    };
    this.selection.select(brRule);
    this.patchSelectedBussinessRuleValue();
  }

  editSelectedTransformationRule(response) {
    const brRule = {
      ...response.response,
      transInfo: response?.requestPayload?.transInfo
    };

    const rules = this.selection.selected.map((rule) => {
      if (rule.brId === brRule.brId) {
        rule = { ...brRule };
      }
      return rule;
    });

    this.selection = new SelectionModel<any>(true, rules);
    this.patchSelectedBussinessRuleValue();
  }

  removeAppliedRule(response) {
    if (response?.fieldValue?.fieldId === this.targetFieldMappingValue.targetFieldDesc?.fieldId) {
      this.selection.clear();
    }
  }

  getFieldDetails() {
    this.coreService
      .getFieldDetails(this.moduleId, this.targetFieldMappingValue.targetFieldDesc.mdoFieldId)
      .subscribe(
        (resp: Fieldlist) => {
          this.mappedFieldDesc = resp;
        },
        (error) => {
          console.error(`Error:: ${error.message}`);
          this.mappedFieldDesc = null;
        }
      );
  }

  getBusinessRuleList(businessRuleType, moduleId, searchString) {
    this.ruleService
      .getBusinessRulesByTypes(
        ([businessRuleType] as BusinessRuleType[]) || [],
        [moduleId],
        '0',
        '20',
        searchString || ''
      )
      .subscribe(
        (res) => {
          if (res) {
            res.forEach((brRule) => {
              this.getBusinessRuleInfo(brRule.brIdStr, brRule);
            });
            this.businessRulesList = res;

            // Todo: remove setTimeout when respons for transinfo is coming with business rule listing API
            setTimeout(() => {
              if (this.targetFieldMappingValue.targetFieldDesc) {
                this.filterBusinessRuleListBasedOnMapping(res);
                return;
              }
            }, 500);

            this.businessRulesObs = of(res);
          }
        },
        (error) => {
          console.log('Error:', error);
          this.transientService.open('Something went wrong!', null, { duration: 1000, verticalPosition: 'bottom' });
        }
      );
  }

  filterBusinessRuleListBasedOnMapping(businessRulesList) {
    const businessRuleList = [];
    businessRulesList.forEach(rule => {
     if (this.targetFieldMappingValue?.targetFieldDesc?.mdoFieldId && ['zero', 'lookup', 'empty_space'].includes(rule?.transInfo?.type)) {
        businessRuleList.push(rule);
      } else if (!this?.targetFieldMappingValue?.targetFieldDesc?.mdoFieldId && rule?.transInfo?.type === 'constant') {
        businessRuleList.push(rule);
      }
    })

    this.businessRulesObs = of(businessRuleList);
  }

  filterBusinessRulesBasedOnMapping() {
    let businessRules;

    if (this.targetFieldMappingValue.targetFieldDesc?.mdoFieldId) {
      businessRules = this.businessRulesList.filter(
        (rule) =>
          rule?.transInfo &&
          ((rule?.transInfo?.type !== 'constant' && rule?.transInfo?.type !== 'date') ||
            (rule?.transInfo?.type === 'date' && this.mappedFieldDesc.pickList === '52'))
      );
    } else {
      businessRules = this.businessRulesList.filter((rule) => rule?.transInfo && rule?.transInfo?.type === 'constant');
    }

    this.businessRulesObs = of(businessRules);
  }

  getBusinessRuleInfo(ruleId, businessRule?) {
    let transInfo = null;

    this.schemaService
      .getBusinessRuleInfo(ruleId)
      .pipe(
        finalize(() => {
          if (businessRule) {
            businessRule.transInfo = transInfo;
          }
        })
      )
      .subscribe(
        (businessRuleInfo: CoreSchemaBrInfo) => {
          transInfo = businessRuleInfo?.transInfo ?? null;

          if (!businessRule && businessRuleInfo) {
            this.selection.select(businessRuleInfo);
          }
        },
        (error) => {
          transInfo = null;
          this.transientService.open('Something went wrong!', null, { duration: 1000, verticalPosition: 'bottom' });
        }
      );
  }

  isRuleSelected(selectedRule) {
    const index = this.selection.selected.findIndex((rule) => rule?.brId === selectedRule?.brId);
    return index !== -1;
  }

  deleteTranslationRules(mdoMapping) {
    let translationRule = mdoMapping?.translation?.transalationIds;

    translationRule.forEach((ruleId) => {
      this.getBusinessRuleInfo(ruleId);
    });
  }

  deleteBusinessRule(businessRule) {
    businessRule.isRuleDeleted = true;

    this.selection.select(businessRule);

    this.patchSelectedBussinessRuleValue();
  }

  ruleSelectionChanges(rule) {
    const index = this.selection.selected.findIndex((appliedRules) => appliedRules.brId !== rule.brId && appliedRules?.transInfo?.type === rule?.transInfo?.type);
    if (index !== -1) {
      this.openAlertPopup(
        `Cannot add multiple ${rule?.transInfo?.type} type transformation rule to a target field. `,
        rule
      );
      return;
    }

    if (index === -1) {
      this.updateTargetFields(this.targetFields, rule);
    }

    this.patchSelectedBussinessRuleValue();
  }

  updateTargetFields(segmentList = this.targetFields, rule) {
    if (segmentList?.length) {
      return segmentList.map((field: SegmentMappings) => {
        this.findAndUpdateTargetFields(field?.mdoMappings, rule);

        field.segmentMappings = this.updateTargetFields(field?.segmentMappings, rule);

        return field;
      });
    }

    return [];
  }

  // find and update the target fields

  findAndUpdateTargetFields(mdoMappings: MdoMappings[], rule) {
    let updatedMdoMappings = [];

    if (mdoMappings?.length) {
      updatedMdoMappings = mdoMappings.map((mdoMapping: MdoMappings) => {
        if (mdoMapping?.translation?.transalationIds?.length) {
          if (mdoMapping.translation.transalationIds.includes(rule?.brId.toString())) {
            this.isRuleAlreadyApplied = true;

            this.openAlertPopup(
              'This rule contains multiple field transformations. Please select a different rule.',
              rule
            );

            return;
          }
        }
      });
    }
  }

  openAlertPopup(alertMessage, rule) {
    this.transientService.alert(
      {
        data: { dialogTitle: 'Alert', label: alertMessage },
        disableClose: true,
        autoFocus: false,
        width: '600px',
        panelClass: 'create-master-panel'
      },
      (response) => {
        this.selection.toggle(rule);

        this.patchSelectedBussinessRuleValue();
      }
    );
  }

  patchSelectedBussinessRuleValue() {
    const payload = this.selection.selected
      .filter((businessRule) => !businessRule?.isRuleDeleted)
      .map((rule) => rule.brIdStr);
    this.targetFieldMappingValue.targetFieldDesc.translation = {
      transalationIds: payload
    };

    this.onChange({ disableSaveMapping: payload.length });
  }

  openBusinessRuleSideSheet(type, businessRule?) {
    this.autocomplete.closePanel()
    let routerLink = '';
    this.sharedService.setMappingPositionOnScroll(true);
    if (type === 'new') {
      routerLink = `sb3/schema/business-rule/${this.moduleId}/new/transformation/sb3`;
    } else {
      routerLink = `sb3/schema/business-rule/${this.moduleId}/null/${businessRule?.brIdStr}/sb3`;
    }

    this.router.navigate(['', { outlets: { sb3: routerLink } }], {
      queryParams: { mappingRule: true, ruleType: this.brType }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.targetFields?.currentValue) {
      this.targetFields = changes?.targetFields?.currentValue;
    }
  }

  ngOnDestroy(): void {
      this.selection.clear();
      this.sharedService.setTargetFieldSelected(null);
      this.subscriptionsList.forEach(sub => sub.unsubscribe());
  }
}
