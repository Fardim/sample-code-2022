import { Component, forwardRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import FormField from '@models/form-field';
import { MetadataModeleResponse } from '@models/schema/schemadetailstable';
import { BlocksList, BusinessRuleType, CoreSchemaBrInfo } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { Metadata } from '@modules/report/edit/container/metadatafield-control/metadatafield-control.component';
import { CoreService } from '@services/core/core.service';
import { SchemaService } from '@services/home/schema.service';
import { RuleService } from '@services/rule/rule.service';
import { TransientService } from 'mdo-ui-library';
import { of } from 'rxjs';
import { CONDITIONS } from 'src/app/_constants/brrule';

class ConditionalOperator {
  desc: string;
  childs: string[];
}
@Component({
  selector: 'pros-custom-trigger',
  templateUrl: './custom-trigger.component.html',
  styleUrls: ['./custom-trigger.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => CustomTriggerComponent)
    }]
})
export class CustomTriggerComponent extends FormField implements OnInit, OnChanges {

  udrNodeForm: FormGroup;
  operators = [];
  submitted = false;

  moduleId: string;

  fieldListFiltered = [];
  initialFieldList = [];
  udrBlockList: BlocksList = {
    blocksList: [],
    datasetList: []
  };

  /**
   * List of fields
   */
   fieldsList = [];

  parentMetadata: MetadataModeleResponse = null;

  businessRulesObs = of([]);
  businessRulesList = [];
  bussinessRuleSearchControl = new FormControl();
  showGrouping:boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRouter: ActivatedRoute,
    private coreService: CoreService,
    private ruleService: RuleService,
    private schemaService: SchemaService,
    private transientService: TransientService
  ) {
    super();
  }

  ngOnInit(): void {
    this.activatedRouter.params.subscribe(res => {
      this.moduleId = res.moduleId;
      this.getFieldsByModuleId(this.moduleId);
    })
    this.initUDRForm();
    this.operators = this.possibleOperators();
    this.getBusinessRuleList('BR_CUSTOM_SCRIPT', this.moduleId, '')
    this.checkForBusinessRuleChanges('BR_CUSTOM_SCRIPT');
  }

  initUDRForm() {
    this.udrNodeForm = this.formBuilder.group({
      udrId: [''],
      blocks: this.formBuilder.array([])
    });

    this.udrNodeForm.valueChanges.subscribe(value => {
      this.onChange({customTrigger: value, isFormValid: this.isUDRBlockValid()});
    })
  }

  updateBusinessRule($event) {
    this.udrNodeForm.get('udrId').setValue($event.option.value.brIdStr);
  }

  isUDRBlockValid() {
    return this.udrNodeForm.get('blocks').value.every(block => block?.preSelectedSourceFld) || this.udrNodeForm.get('udrId').value;
  }

  displayWith(rule) {
    return rule?.brInfo || '';
  }

  /**
   * Return all possible operators
   */
   possibleOperators(): ConditionalOperator[] {
    // get generic operators
    const genericOp: ConditionalOperator = new ConditionalOperator();
    genericOp.desc = CONDITIONS.common.desc;
    genericOp.childs = CONDITIONS.common.operators;

    // for numeric number field
    const onlyNum: ConditionalOperator = new ConditionalOperator();
    onlyNum.desc = CONDITIONS.numeric.desc;
    onlyNum.childs = CONDITIONS.numeric.operators;

    // for special operators
    const specialOpe: ConditionalOperator = new ConditionalOperator();
    specialOpe.desc = CONDITIONS.special.desc;
    specialOpe.childs = CONDITIONS.special.operators;

    return [genericOp, onlyNum, specialOpe];
  }

  /**
   * function to get the fields on basis of module
   */
   getFieldsByModuleId(moduleId) {
    if (!moduleId) { return };

    this.coreService.getMetadataFieldsByModuleId([moduleId]).subscribe((metadataModeleResponse: MetadataModeleResponse) => {
      this.parseMetadataModelResponse(metadataModeleResponse);
    }, (err) => {
      if (this.parentMetadata) {
        this.parseMetadataModelResponse(this.parentMetadata);
      }
    });
  }

  updateUDRFldList(ev) {
    if (typeof (ev?.searchString) !== 'string') {
      return;
    };
    if (this.udrNodeForm.get('udrId').value) {
      this.transientService.confirm({
        data: { label: 'Your already selected UDR rule will be removed' },
        autoFocus: false,
        width: '400px',
        panelClass: 'create-master-panel',
      }, (response) => {
        if (response === 'yes') {
          this.udrNodeForm.get('udrId').setValue('');
          this.bussinessRuleSearchControl.setValue('');
        } else {
          this.udrBlockList = {
            ...this.udrBlockList,
            blocksList: []
          };
          return;
        }
      });
    }

    this.coreService.getMetadataFieldsByModuleId([this.moduleId], ev.searchString).subscribe((res) => {
      this.parseMetadataModelResponse(res);
    }, error => {
      console.error('Error while getting field list', error);
    });
  }

  parseMetadataModelResponse(metadataModeleResponse: MetadataModeleResponse, resetFields = true) {
    if (!metadataModeleResponse) {
      return;
    }

    this.fieldsList = [];
    this.parentMetadata = metadataModeleResponse;
    const keys = Object.keys(metadataModeleResponse.headers);
    keys.forEach((key) => {
      this.fieldsList.push(metadataModeleResponse.headers[key])
    });

    this.initialFieldList = [...this.fieldsList];
    this.fieldListFiltered = this.transformFieldRes(metadataModeleResponse);
    this.fieldListFiltered = [{
      fieldDescri: 'Header fields',
      fieldId: 'header_fields',
      isGroup: true,
      childs: this.fieldsList
    }];
  }

  transformFieldRes(response: MetadataModeleResponse): Metadata[] {
    const metadata: Metadata[] = [];

    // for header
    const headerChilds: Metadata[] = [];
    if(response.headers) {
      Object.keys(response.headers).forEach(header=>{
        const res = response.headers[header];
        headerChilds.push({
          fieldId: res.fieldId,
          fieldDescri: res.fieldDescri,
          isGroup: false,
          childs: []
        });
      });
    }

    if (this.showGrouping) {
      metadata.push({
        fieldId: 'header_fields',
        fieldDescri: 'Header fields',
        isGroup: true,
        childs: headerChilds
      });
    } else {
      headerChilds.forEach(child => metadata.push(child));
    }

    // for grid response transformations
    if(response && response.grids) {
      Object.keys(response.grids).forEach(grid=>{
        const childs : Metadata[] = [];
        if(response.gridFields && response.gridFields.hasOwnProperty(grid)) {
          Object.keys(response.gridFields[grid]).forEach(fld=>{
            const fldCtrl = response.gridFields[grid][fld];
              childs.push({
                fieldId: fldCtrl.fieldId,
                fieldDescri: fldCtrl.fieldDescri,
                isGroup: false,
                childs:[],
                fieldType: {
                  fieldId: grid,
                  fieldDescri: response.grids[grid].fieldDescri
                },
                fldCtrl
              });
          });
        }

        if (this.showGrouping) {
          metadata.push({
            fieldId: grid,
            fieldDescri: response.grids[grid].fieldDescri,
            isGroup: true,
            childs
          });
        } else {
          childs.forEach(child => metadata.push(child));
        }
      })
    }

    // for hierarchy response transformations
    if(response && response.hierarchy) {
      response.hierarchy.forEach(hierarchy => {
        const childs: Metadata[] = [];
        if(response.hierarchyFields && response.hierarchyFields.hasOwnProperty(hierarchy.heirarchyId)) {
          Object.keys(response.hierarchyFields[hierarchy.heirarchyId]).forEach(fld=>{
            const fldCtrl = response.hierarchyFields[hierarchy.heirarchyId][fld];
              childs.push({
                fieldId: fldCtrl.fieldId,
                fieldDescri: fldCtrl.fieldDescri,
                isGroup: false,
                childs:[],
                fieldType: {
                  fieldId: hierarchy.heirarchyId,
                  fieldDescri: hierarchy.heirarchyText
                },
                fldCtrl
              });
          });
        }

        if (this.showGrouping) {
          metadata.push({
            fieldId: hierarchy.heirarchyId,
            fieldDescri: hierarchy.heirarchyText,
            isGroup: true,
            childs
          });
        } else {
          childs.forEach(child => metadata.push(child));
        }

      });
    }
    return metadata;
  }

  checkForBusinessRuleChanges(brType) {
    this.bussinessRuleSearchControl.valueChanges.subscribe((value: string) => {
      if (typeof value === 'string' && value?.toLocaleLowerCase()) {
        this.getBusinessRuleList(brType, this.moduleId, value);
      } else {
        this.getBusinessRuleList(brType, this.moduleId, '');
      }
    })
  }

  getBusinessRuleList(businessRuleType, moduleId, searchString) {
    this.ruleService
      .getBusinessRulesByTypes(
        ([businessRuleType] as BusinessRuleType[]) || [],
        [moduleId],
        '0',
        '20',
        searchString || ''
      ).subscribe((res) => {
        if (res) {
          this.businessRulesList = res;
          this.businessRulesObs = of(res);
        }
      }, error => {
        console.log('Error:',error);
      });
  }

  writeValue(fieldData): void {
    if (fieldData.hasOwnProperty('isFormSaved')) {
      this.submitted = fieldData?.isFormSaved || false;
    }

    if (fieldData?.isUpdated) {

      if (fieldData?.udrId && !fieldData?.blockedList?.length) {
        this.getBusinessRuleInfo(fieldData?.udrId);
      }

      if (fieldData?.blockedList) {
        this.udrBlockList = {
          ...this.udrBlockList,
          blocksList: fieldData?.blockedList || []
        };
      }
    }
  }

  getBusinessRuleInfo(udrId) {
    this.schemaService.getBusinessRuleInfo(udrId).subscribe((businessRuleInfo: CoreSchemaBrInfo) => {
      if (businessRuleInfo) {
        this.bussinessRuleSearchControl.patchValue(businessRuleInfo);
        this.udrNodeForm.get('udrId').setValue(businessRuleInfo.brIdStr);
      }
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.fieldListFiltered?.currentValue) {
      this.fieldListFiltered = changes.fieldListFiltered.currentValue;
    }
  }
}
