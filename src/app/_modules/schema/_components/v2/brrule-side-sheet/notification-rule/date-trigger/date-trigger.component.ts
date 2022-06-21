import { Component, forwardRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import FormField from '@models/form-field';
import { FieldConfiguration } from '@models/schema/schemadetailstable';
import * as moment from 'moment';
import { DatePatchValue, DateRepeatEvent, RepeatSegmentList } from '../notification-rule.modal';

@Component({
  selector: 'pros-date-trigger',
  templateUrl: './date-trigger.component.html',
  styleUrls: ['./date-trigger.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => DateTriggerComponent)
    }]
})
export class DateTriggerComponent extends FormField implements OnInit, OnChanges {

  dateTriggerFormGroup: FormGroup;

  submitted = false;

  /**
   * source field array from a module
   */
  @Input()
  sourceFieldsObject: FieldConfiguration = {
    valueKey: '',
    labelKey: '',
    list: []
  };

  dateFieldList = [];

  constructor(
    private fb: FormBuilder
  ) {
    super();
  }

  ngOnInit(): void {
    this.createDateTriggerForm();
    this.filterEmailFields();
  }

  createDateTriggerForm() {
    this.dateTriggerFormGroup = this.fb.group({
      date: ['', Validators.required],
      dateRepeat: [{}]
    }),

    this.dateTriggerFormGroup.valueChanges.subscribe(formData => {
      const startDate = (formData?.dateRepeat?.start && typeof formData.dateRepeat.start === 'number') ? formData.dateRepeat.start : Date.parse(formData.dateRepeat.start);
      const endDate = (formData?.dateRepeat?.end && typeof formData.dateRepeat.end === 'number') ? formData.dateRepeat.end : Date.parse(formData.dateRepeat.end);
      const payload = {
        fieldArr: [{
          fieldId: formData.date,
          anyValue: true
        }],
        end: endDate ? endDate : null,
        interval: formData.dateRepeat.interval || '',
        reminder: formData.dateRepeat.reminder || 'NONE',
        repeatCount: formData.dateRepeat.repeatCount || null,
        start: startDate ? startDate : ''
      }
      this.onChange({datePayload: payload, isFormValid: this.dateTriggerFormGroup.valid && formData?.date.includes('FLD_')});
    })
  }

  filterEmailFields() {
    this.dateFieldList = this.sourceFieldsObject.list.filter(field => field.pickList === '52');
  }

  setDateField($event) {
    this.dateTriggerFormGroup.get('date').setValue($event);
  }

  getDateFieldValue() {
    return this.dateTriggerFormGroup.get('date').value;
  }

  repeatValueChanges($event: DateRepeatEvent) {
    const dateRepeat = {
      start: $event?.formValue?.customDate,
      ...$event?.formValue?.occurrenceDate && {
        end: $event.formValue.occurrenceDate
      },
      interval: $event?.formValue?.every,
      repeatCount: $event?.formValue?.occurrence,
      reminder: RepeatSegmentList.find(repeat => repeat.label.toLocaleLowerCase() === $event?.formValue?.repeat.toLocaleLowerCase())?.value
    }
    this.dateTriggerFormGroup.get('dateRepeat').setValue(dateRepeat);
  }

  writeValue(formData: DatePatchValue): void {

    if (formData.hasOwnProperty('isFormSaved')) {
      this.submitted = formData?.isFormSaved || false;
    }
    if (formData?.isUpdated) {
      this.dateTriggerFormGroup.get('date').patchValue(formData.date || '');
      this.dateTriggerFormGroup.get('dateRepeat').patchValue(formData.dateRepeat || {});
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.sourceFieldsObject.currentValue) {
      this.sourceFieldsObject = Object.assign({}, changes?.sourceFieldsObject.currentValue);
      this.filterEmailFields();
    }
  }
}
