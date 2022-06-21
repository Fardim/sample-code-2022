import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';

@Component({
  selector: 'pros-schedule-sync-value',
  templateUrl: './schedule-sync-value.component.html',
  styleUrls: ['./schedule-sync-value.component.scss'],
})
export class ScheduleSyncValueComponent implements OnInit {
  scheduleForm: FormGroup;

  @Input() repeatSegmentList = [
    { label: 'None', value: 'none' },
    { label: 'Hourly', value: 'hourly' },
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
  ];

  @Input() scheduleSyncValues;

  frequencyOptionList = [
    { label: 'Monday', value: 'MON', checked: true },
    { label: 'Tuesday', value: 'TUS', checked: false },
    { label: 'Wednesday', value: 'WED', checked: false },
    { label: 'Thursday', value: 'THU', checked: false },
    { label: 'Friday', value: 'FRI', checked: false },
    { label: 'Saturday', value: 'SAT', checked: false },
    { label: 'Sunday', value: 'SUN', checked: false },
  ];

  repeatByMonthOption = [
    { label: 'Day of Month', value: 'DOM', checked: false },
    { label: 'Day of Week', value: 'DOW', checked: false },
  ];

  startOptionList = [
    { label: 'Now', value: 'now' },
    { label: 'After 1 hour', value: 'afterHour' },
    { label: 'After 1 day', value: 'afterDay' },
    { label: 'Custom', value: 'custom' },
  ];

  endOptionList = [
    { label: 'Never', value: 'NEVER' },
    { label: 'After', value: 'AFTER' },
    { label: 'On', value: 'ON' },
  ];

  today = new Date();
  showCustomDateSelection = false;

  everyInputLabel = '';

  businessRuleSync = false;

  /**
   * will start on using date and time
   */
  @Input() showStartWithDateTime = false;

  /**
   * emit event with the changed values
   */
  @Output() valueChange: EventEmitter<any> = new EventEmitter(null);

  constructor(private formBuilder: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.createScheduleSyncForm();

    if (this.router.url.includes('business-rule')) {
      this.businessRuleSync = true;
    }
  }

  createScheduleSyncForm() {

    this.scheduleForm = this.formBuilder.group({
      repeat: [this.repeatSegmentList[0].value, Validators.required],
      repeatLabel: [''],
      every: ['1', Validators.required],
      repeatMonthDay: ['DOM'],
      repeatOnWeek: ['MON'],
      starts: [''],
      customDate: ['', Validators.required],
      ends: ['NEVER', Validators.required],
      occurrence: [''],
      occurrenceDate: ['']
    });
    this.everyInputLabel = this.repeatSegmentList[0].value;

    if (Object.keys(this.scheduleSyncValues).length !== 0) {
      this.patchSyncFormValues();
    }
  }

  patchSyncFormValues() {
    const repeatValue = this.repeatSegmentList.find(repeat => repeat.label === this.scheduleSyncValues?.repeat?.label);
    this.scheduleForm.get('repeat').setValue(repeatValue?.value || '');

    this.patchEndsFieldsValue();
    this.repeatSegmentChange(repeatValue?.value || '', this.scheduleSyncValues)
  }

  patchEndsFieldsValue() {
    if (!this.scheduleSyncValues?.ends && !this.scheduleSyncValues?.occurrence) {
      this.scheduleForm.get('ends').setValue('NEVER');
    }

    if (this.scheduleSyncValues?.ends) {
      this.scheduleForm.get('ends').setValue('ON');
      this.scheduleForm.get('occurrenceDate').setValue(this.scheduleSyncValues?.ends);
    }

    if (this.scheduleSyncValues?.occurrence) {
      this.scheduleForm.get('ends').setValue('AFTER');
      this.scheduleForm.get('occurrence').setValue(this.scheduleSyncValues?.occurrence);
    }
  }

  getOnDateValue() {
    return this.scheduleForm.get('occurrenceDate')?.value || '';
  }

  repeatSegmentChange(event, syncValue?) {
    this.scheduleForm.get('customDate').setValue((syncValue?.starts) || '');
    this.setRequiredValidator('every');
    this.removeRequiredValidator('repeatMonthDay');
    this.removeRequiredValidator('repeatOnWeek');
    switch (event) {
      case 'none':
        this.everyInputLabel = 'none';
        this.scheduleForm.get('repeatLabel').setValue('none');
        break;

      case 'hourly':
        this.everyInputLabel = 'Hours';
        this.scheduleForm.get('every').setValue(syncValue?.every || '12');
        this.scheduleForm.get('repeatLabel').setValue('hours');
        break;

      case 'daily':
        this.everyInputLabel = 'Days';
        this.scheduleForm.get('every').setValue(syncValue?.every || '1');
        this.scheduleForm.get('repeatLabel').setValue('days');
        break;

      case 'weekly':
        this.everyInputLabel = 'Weeks';
        this.scheduleForm.get('every').setValue(syncValue?.every || '1');
        this.scheduleForm.get('repeatLabel').setValue('weeks');
        this.setRequiredValidator('repeatOnWeek');
        break;

      case 'monthly':
        this.everyInputLabel = 'Months';
        this.scheduleForm.get('every').setValue(syncValue?.every || '1');
        this.scheduleForm.get('repeatLabel').setValue('months');
        this.setRequiredValidator('repeatMonthDay');
        break;

      case 'yearly':
        this.everyInputLabel = 'Years';
        this.removeRequiredValidator('every');
        break;

      default:
        break;
    }
    this.emitValueChange();
  }

  getCustomDateValue() {
    return this.scheduleForm.get('customDate')?.value || '';
  }

  setRequiredValidator(control) {
    this.scheduleForm.get(control).setValidators([Validators.required]);
    this.scheduleForm.get(control).updateValueAndValidity();
  }

  removeRequiredValidator(control) {
    this.scheduleForm.get(control).setValidators([]);
    this.scheduleForm.get(control).updateValueAndValidity();
  }

  endsSegmentChange(selectedSegment) {}

  startSegmentChange(event) {
    this.showCustomDateSelection = event === 'custom' ? true : false;
  }

  onFrequencyChange(event, frequency) {
    this.frequencyOptionList.map((option) => {
      option.checked = option.label === frequency.label ? true : false;
    });

    this.scheduleForm.get('repeatOnWeek').setValue(frequency.value);
    this.emitValueChange();
  }

  dateChanged($event, type) {
    this.scheduleForm.get('customDate').setValue($event);
    this.emitValueChange();
  }

  onDateChanged($event) {
    this.scheduleForm.get('occurrenceDate').setValue($event);
    this.emitValueChange();
  }

  everyInputValueChanged(event) {
    this.emitValueChange();
  }

  repeatByValueChange(event) {
    this.repeatByMonthOption.map((option) => {
      option.checked = option.label === event.label ? true : false;
    });

    this.scheduleForm.get('repeatMonthDay').setValue(event.value);
    this.emitValueChange();
  }

  emitValueChange() {
    this.valueChange.emit({formValue: this.scheduleForm.value, isFormValid: this.scheduleForm.valid});
  }

  getFormattedCustomDate() {
    return moment(this.scheduleForm.get('customDate').value).format('YYYY-MM-DD');
  }

  getOccurrenceDate() {
    return moment(this.scheduleForm.get('occurrenceDate').value).format('YYYY-MM-DD');
  }

  close() {
    this.router.navigate([{ outlets: { outer: null } }], { preserveFragment: true, queryParamsHandling: 'preserve' });
  }
}
