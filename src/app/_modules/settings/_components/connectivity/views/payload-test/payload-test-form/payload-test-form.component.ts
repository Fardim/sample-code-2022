import { Component, forwardRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import FormField from '@models/form-field';
import { transformedPayloadTestData } from '../../../connectivity';

@Component({
  selector: 'pros-payload-test-form',
  templateUrl: './payload-test-form.component.html',
  styleUrls: ['./payload-test-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => PayloadTestFormComponent)
    }]
})
export class PayloadTestFormComponent extends FormField implements OnInit {
  payloadFormData;
  formGroup: FormGroup;

  @ViewChild('drawer') drawer: MatDrawer;

  openAutoGrid = false;

  selectedIndex;

  step = 0;

  payloadCtrl = new FormArray([]);

  existingMappingValue = [];

  constructor(private fb: FormBuilder,private matDialog: MatDialog) {
    super();
  }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      payloadTestData: this.fb.array([]),
    })

    this.formGroup.get('payloadTestData').valueChanges.subscribe(value => {
      this.onChange(value);
    })
  }

  get payloadTestData(): FormArray {
    return this.formGroup.get('payloadTestData') as FormArray;
  }

  setStep(index: number) {
    this.step = index;
  }

  addPayloadTestArray(value) {
    const control = this.payloadCtrl;
    value.forEach(element => {
      const tableData = element.elementData.elementTableData;
      control.push(this.patchValues(element.elementData.materialGroup, element.elementData.materialType, element.elementData.baseUnitOfMeasure, tableData))
    });
  }

  patchValues(materialGroup, materialType,baseUnitOfMeasure, elementTableData) {
    return this.fb.group({
      materialType: [materialType],
      materialGroup: [materialGroup],
      baseUnitOfMeasure: [baseUnitOfMeasure],
      elementTableData: this.fb.control(elementTableData)
    })
  }

  writeValue(value: any) {
    this.payloadFormData = [];
    if (!value?.initialValue) {
      this.transformData(value);
      return;
    }
    this.payloadTestValue(value.existingMappingValue);
  }

  /**
   * patch payload test form value after save
   */
  transformData(value: transformedPayloadTestData[]) {
    const existingMappingValue = [];
    value.forEach(element => {
      const mappingObj = {};
      element.structureFieldList.forEach(field => {
        const picklist = this.getFieldType(field, element.structureFieldList);
        element.structureFields.forEach(structureFields => {
          if (picklist !== 'GRID' && field.fieldId === structureFields.fieldId) {
            field.fieldValue = structureFields.fieldValue;
          } else if(field.fieldId === structureFields.fieldId) {
            field.gridFields = structureFields.childFields
          }
        });
      });
      mappingObj['description'] = element.structureName;
      mappingObj['structureid'] = element.structureId;
      mappingObj['fieldlist'] = element.structureFieldList;
      existingMappingValue.push(mappingObj);
    });
    this.payloadTestValue(existingMappingValue);
  }

  getTestData(i) {
    return this.payloadTestData.at(i).get('structureFields') as FormArray;
  }

  payloadTestValue(existingMappingValue) {
    const payloadTestValue1 = this.formGroup.get('payloadTestData') as FormArray;
    existingMappingValue.forEach(mappingValue => {
      payloadTestValue1.push(this.patchMappingValue(mappingValue));
    })
  }

  patchMappingValue(mappingValue) {
    return this.fb.group({
      structureName: [mappingValue?.description || ''],
      structureId: [mappingValue?.structureid || ''],
      structureFields: this.fb.array(this.patchFieldListValues(mappingValue)),
      structureFieldList: [mappingValue?.fieldlist]
    })
  }

  patchFieldListValues(mappingValue) {
    const fieldListCtrl = [];
    mappingValue?.fieldlist?.forEach(field => {
      fieldListCtrl.push(
        this.patchFieldValue(mappingValue, field)
      );
    });
    return fieldListCtrl;
  }

  patchFieldValue(mappingValue, field) {
    return this.fb.group({
      structureId: [mappingValue?.structureid || ''],
      fieldId: [field?.fieldId || ''],
      fieldName: [field?.description || ''],
      fieldValue: [field?.fieldValue || ''],
      fieldPickList: [field?.pickList || ''],
      childFields: (field.gridFields) ? this.fb.control(field.gridFields) : this.fb.control({
        fieldId: field?.fieldId || '',
        childFieldDetails: field?.childfields || [],
        gridFieldValue: this.addGridValues(field?.childfields),
        gridRowValue: [this.addGridRowValues(field?.childfields)],
        newRow: false
      })
    })
  }

  addGridRowValues(childFields) {
    const gridRow = {};
    childFields.forEach(childField => {
      gridRow[childField.fieldId] = ''
    });
    return gridRow;
  }

  addGridValues(childFields) {
    const childFieldGridRows = [];
    childFields.forEach(childField => {
      childFieldGridRows.push(this.patchChildGridValue(childField));
    });
    return childFieldGridRows;
  }

  patchChildGridValue(childField) {
    return {
      fieldId: childField?.fieldId || '',
      fieldName: childField?.description || '',
      fieldValue: childField?.fieldValue || ''
    }
  }

  addGridRow(structureIndex: number,fieldIndex: number,field) {
    const fieldValue = field.value;
    const payloadTestValue1 = this.formGroup.get('payloadTestData') as FormArray;
    const structureFields = payloadTestValue1.at(structureIndex).get('structureFields') as FormArray;
    const childGrid = structureFields.at(fieldIndex).get('childFields');
    const gridRowValue = childGrid.value.gridRowValue;

    if(gridRowValue.length === 0) {
      const newElement = {};
      fieldValue.childFields.gridFieldValue.forEach(field => {
        newElement[field.fieldId] = ''
      });
      childGrid.patchValue({
        ...childGrid.value,
        newRow: true,
        gridRowValue: [newElement]
      })
    } else {
      childGrid.patchValue({
        ...childGrid.value,
        newRow: true,
        gridRowValue: [...gridRowValue]
      })
    }
  }

  patchValues1(element) {
    const elementGroup = {};
    const dataKeys = Object.keys(element);
    dataKeys.map((key) => {
        elementGroup[key] = element[key] ? element[key] : '';
    });
    return this.fb.group(elementGroup);
  }

  maintainData(i) {
    this.selectedIndex = +i;
    this.openAutoGrid = true;
    this.drawer.open();
  }

  getFieldType(field, fieldList) {
    const pickList = fieldList?.find(f => f.fieldId === field?.fieldId)?.pickList;
    switch(pickList) {
      case '1':
      case '37':
        return 'DROPDOWN';
      case '38':
        return 'ATTACHMENT';
      case '15':
        return 'GRID';
      case '4':
        return 'RADIO';
      case '2':
        return 'CHECKBOX';
      case '55':
        return 'URL';
      case '54':
        return 'TIMEPICKER';
      case '52':
        return 'DATEPICKER';
      case '22':
        return 'TEXTAREA';
      case '36':
        return 'TOGGLE';
      case '30':
        return 'DATA-REF';
      case '31':
        return 'HTML-EDITOR'
      default :
        return 'TEXT'
    }
  }
}