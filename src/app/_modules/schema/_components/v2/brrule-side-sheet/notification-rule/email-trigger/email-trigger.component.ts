import { Component, forwardRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import FormField from '@models/form-field';
import { FieldConfiguration } from '@models/schema/schemadetailstable';
import { EmailFieldData, emailFieldIDs } from '../notification-rule.modal';

@Component({
  selector: 'pros-email-trigger',
  templateUrl: './email-trigger.component.html',
  styleUrls: ['./email-trigger.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => EmailTriggerComponent)
    }]
})
export class EmailTriggerComponent extends FormField implements OnInit, OnChanges {

  /**
   * source field array from a module
   */
   @Input()
   sourceFieldsObject: FieldConfiguration = {
     valueKey: '',
     labelKey: '',
     list: []
   };

  emailFieldList = [];

  selectedEmailFields: emailFieldIDs[] = [];

  submitted = false;

  constructor() {
    super();
   }

  ngOnInit(): void {
    this.filterEmailTypeFields();

    this.selectedEmailFields = Array.isArray(this.selectedEmailFields) && this.selectedEmailFields.length > 0 ? this.selectedEmailFields : [{ fieldId: '' }];
  }

  filterEmailTypeFields() {
    this.emailFieldList = this.sourceFieldsObject.list.filter(field => field.dataType === 'EMAIL' && field.pickList === '0');
  }

  /**
   * method to set the user selected fields and entered data
   * @param value pass the manually entered text value
   * @param index pass the field index
   */
  setEmailField(value, index: number, fieldType: string = 'fieldId') {
    const field = this.selectedEmailFields[index];
    field[fieldType] = value;
    this.selectedEmailFields.forEach((item, idx) => {
      return item;
    })

    this.onChange({emailFields: this.selectedEmailFields, isFormValid: this.selectedEmailFields.every(field => field.fieldId)});
  }

  updateEmailField(value, index: number) {
    if (!value) {
      this.setEmailField(null, index);
    }
  }

  addEmailField() {
    this.selectedEmailFields = [...this.selectedEmailFields, { fieldId: '' }]
  }

  removeEmailField(index) {
    if (this.selectedEmailFields[index]) {
      this.selectedEmailFields.splice(index, 1);
    }
    this.onChange({emailFields: this.selectedEmailFields});
  }

  writeValue(fieldData: EmailFieldData): void {
    if (fieldData.hasOwnProperty('isFormSaved')) {
      this.submitted = fieldData?.isFormSaved || false;
    }

    if(fieldData?.isUpdated) {
      this.selectedEmailFields = fieldData?.emailFieldIds;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.sourceFieldsObject.currentValue) {
      this.sourceFieldsObject = changes.sourceFieldsObject.currentValue;
      this.filterEmailTypeFields();
    }
  }
}
