import { Component, forwardRef, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import FormField from '@models/form-field';
import { MetadataModeleResponse } from '@models/schema/schemadetailstable';
import { CONDITIONS } from 'src/app/_constants/brrule';
import { BlocksList, CoreSchemaBrInfo } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { ActivatedRoute } from '@angular/router';
import { CoreService } from '@services/core/core.service';
import { fieldValue, FieldValueData } from '../notification-rule.modal';

class ConditionalOperator {
  desc: string;
  childs: string[];
}
@Component({
  selector: 'pros-field-value-trigger',
  templateUrl: './field-value-trigger.component.html',
  styleUrls: ['./field-value-trigger.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => FieldValueTriggerComponent)
    }]
})
export class FieldValueTriggerComponent extends FormField implements OnInit {

  udrNodeForm: FormGroup;
  operators = [];
  submitted = false;

  moduleId: string;

  fieldListFiltered = [];
  initialFieldList = [];
  udrBlockList = {
    blocksList: [],
    datasetList: []
  };

  /**
   * List of fields
   */
   fieldsList = [];

  parentMetadata: MetadataModeleResponse = null;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRouter: ActivatedRoute,
    private coreService: CoreService
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
  }

  getBlockObject(data, i) {
    return {
      uuid: "",
      udrId: '',
      condition: "AND",
      conditionFieldId: data.fieldId,
      conditionValueFieldId: "",
      conditionFieldValue: data.newValue,
      oldFieldValue: data.oldValue,
      blockType: "AND",
      conditionOperator: "EQUAL",
      blockDesc: "and",
      moduleId: this.moduleId,
      tenantId: "",
      sRegex: null,
      conditionalFieldValueCtrl: {},
      conditionalFieldIdCtrl: {},
      order: i,
      blockCond: "WHEN",
      targetInfo: "VALUE",
      oldValueInfo: "VALUE",
      oldFldCtrl: null,
      targetObjectType: this.moduleId,
      sourceObjectType: this.moduleId,
      id: null,
    }
  }

  initUDRForm() {
    this.udrNodeForm = this.formBuilder.group({
      blocks: this.formBuilder.array([]),
      isFormValid: [false]
    });

    let fieldData = [];

    this.udrNodeForm.valueChanges.subscribe(response => {
      if (response?.blocks) {
        fieldData = response.blocks.map(res => {
          const udrFieldData = {
            fieldId: res.preSelectedSourceFld,
            oldValue: res.preSelectedOldFld,
            newValue: res.preSelectedTargetFld,
            anyValue: !res.preSelectedOldFld && !res.preSelectedTargetFld
          }

          return udrFieldData;
        })

        const formValid = fieldData.every(field => field.fieldId !== null && field.fieldId !== '');

        if(fieldData.length) {
          this.onChange({fieldValueTrigger: fieldData, isFormValid: formValid})
        }
      }
    })
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
    this.fieldListFiltered = [{
      fieldDescri: 'Header fields',
      fieldId: 'header_fields',
      isGroup: true,
      childs: this.fieldsList
    }];
  }

  writeValue(formData: FieldValueData): void {
    if (formData.hasOwnProperty('isFormSaved')) {
      this.submitted = formData?.isFormSaved || false;
    }
    if (formData?.isUpdated) {
      this.transferFieldObjectIntoUDRObject(formData.fieldValues);
    }
  }

  transferFieldObjectIntoUDRObject(response: fieldValue[]) {
    this.udrBlockList.blocksList = response.map((data,i) => {
      return this.getBlockObject(data, i)
    })
  }
}
