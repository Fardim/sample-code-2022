import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MonthOn, SchemaScheduler, SchemaSchedulerEnd,
  SchemaSchedulerRepeat, SchemaSchedulerRepeatMetric,
  WeekOn } from '@models/schema/schemaScheduler';
import { SchemaService } from '@services/home/schema.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'pros-schedule-dialog',
  templateUrl: './schedule-dialog.component.html',
  styleUrls: ['./schedule-dialog.component.scss']
})
export class ScheduleDialogComponent implements OnInit, OnDestroy {

  /**
   * Schema id recieved from parent
   */
  @Input() schemaId: string;

  @Input() isEnable: boolean;
  /**
   * Flag to check if form is submitted
   */
  formSubmitted: boolean;
  /**
   * form object
   */
  form: FormGroup;
  /**
   * Looping variable for intervals
   */
  repeatInterval = Object.keys(SchemaSchedulerRepeat).map((x) => {
    return {
      label: this.titlecasePipe.transform(x),
      value: x
    }
  });
  /**
   * Looping variable for weekdays
   */
  weekDays = Object.keys(WeekOn).map(item => {
    return {
      value: this.titlecasePipe.transform(WeekOn[item]),
      key: item
    }
  })
  /**
   * Looping variable for month
   */
  repeatBys = Object.keys(MonthOn).map(item => {
    return {
      value: this.titlecasePipe.transform(MonthOn[item]),
      key: item
    }
  });
  /**
   * Looping variable for end
   */
  schedulerEndOptions = Object.keys(SchemaSchedulerEnd).map((x) => {
    return {
      label: x,
      value: x
    }
  });

  today = new Date();

  /**
   * To store the information of schedule
   */
  scheduleInfo: SchemaScheduler;

  /**
   * To hold all the subscriptions
   */
  subscriptions: Subscription[] = []

  constructor(
    public dialogRef: MatDialogRef<ScheduleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private schemaService: SchemaService,
    private titlecasePipe: TitleCasePipe
  ) { }

  ngOnInit(): void {

    this.createForm();

    this.form.controls.schemaSchedulerRepeat.valueChanges.subscribe((repeatValue) => {
      this.form.controls.weeklyOn.setValidators(null);
      this.form.controls.monthOn.setValidators(null);
      switch (repeatValue) {
        case SchemaSchedulerRepeat.HOURLY:
          this.setValue('repeatValue', 12);
          break;
        case SchemaSchedulerRepeat.DAILY:
          this.setValue('repeatValue', 2);
          break;
        case SchemaSchedulerRepeat.WEEKLY:
          this.setValue('repeatValue', 2);
          this.form.controls.weeklyOn.setValidators(Validators.required);
          break;
        case SchemaSchedulerRepeat.MONTHLY:
          this.setValue('repeatValue', 2);
          this.form.controls.monthOn.setValidators(Validators.required);
          break;
        case SchemaSchedulerRepeat.YEARLY:
          this.setValue('repeatValue', 2);
          break;
      }
      this.form.updateValueAndValidity();
      this.form.controls.weeklyOn.updateValueAndValidity();
      this.form.controls.monthOn.updateValueAndValidity();
    });

    this.form.controls.end.valueChanges.subscribe((ends) => {
      this.form.controls.occurrenceVal.setValidators(null);
      this.form.controls.endOn.setValidators(null);
      switch (ends) {
        case SchemaSchedulerEnd.AFTER:
          this.form.controls.occurrenceVal.setValidators(Validators.required);
          break;
        case SchemaSchedulerEnd.ON:
          this.form.controls.endOn.setValidators(Validators.required);
          break;
      }
      this.form.controls.occurrenceVal.updateValueAndValidity();
      this.form.controls.endOn.updateValueAndValidity();
    });

    if(this.data.currentScheduler) {
      this.scheduleInfo = this.data.currentScheduler
      this.setValueForFormControl(this.scheduleInfo);
    }
  }

  /**
   * Function to create or initliaze form group for scheduler..
   */
  createForm() {
    this.form = new FormGroup({
      isEnable: new FormControl(false, [Validators.required]),
      schemaId: new FormControl(this.schemaId, [Validators.required]),
      schemaSchedulerRepeat: new FormControl(SchemaSchedulerRepeat.HOURLY, [Validators.required]),
      repeatValue: new FormControl(2, [Validators.required]),
      weeklyOn: new FormControl(null),
      monthOn: new FormControl(null),
      startOn: new FormControl(moment().utc().valueOf().toString(), [Validators.required]),
      end: new FormControl(null, [Validators.required]),
      occurrenceVal: new FormControl(2),
      endOn: new FormControl(moment().utc().valueOf().toString())
    })
  }

  /**
   * Getter fuinction to convert the hours text to metric
   */
  get getMetricHours() {
    return SchemaSchedulerRepeatMetric[this.form.controls.schemaSchedulerRepeat.value]
  }


  /**
   * Common function to recieve value from emitter and set value
   * @param field field
   * @param value value
   */
  setValue(field, value) {
    this.form.controls[field].setValue(value);
  }

  /**
   * Function to submit form for scheduler..
   */
  submit() {
    this.formSubmitted = true;
    const schedule: SchemaScheduler = {...this.form.value};
    schedule.weeklyOn = this.form.value.weeklyOn ? this.form.value.weeklyOn.key : null;
    schedule.monthOn = this.form.value.monthOn ? this.form.value.monthOn.key : null;
    this.dialogRef.close(schedule)
  }

  /**
   * Function to get refrence string for scheduler..
   */
  get getReferenceString() {
    const startValue = this.form.controls.startOn.value
    const endValue = this.form.controls.end.value;
    const repeatValue = this.form.controls.repeatValue.value;
    const endOn = this.form.controls.endOn.value;
    if (!startValue || !endValue || !repeatValue) {
      return ''
    }
    const startStr = `starting from ${moment(parseInt(startValue, 10)).format('MM/DD/YYYY')} `;
    let endStr;
    if (endValue === SchemaSchedulerEnd.AFTER) {
      endStr = `ending  ${this.form.controls.end.value} ${this.form.controls.occurrenceVal.value} occurrences`
    } else if (endValue === SchemaSchedulerEnd.ON) {
      endStr = `ending ${this.form.controls.end.value} ${moment(parseInt(endOn, 10)).format('MM/DD/YYYY')}`
    } else {
      endStr = 'ending NEVER';
    }
    return `Occurs every ${repeatValue} ${this.getMetricHours ? this.getMetricHours : ''} ${startStr} and ${endStr}`
  }

  /**
   * Function to close schedule side sheet
   */
  close() {
    this.dialogRef.close();
  }

  /**
   * function to get schedule information
   * @param schemaId: Id of schema for which schedule info needed
   */
  getScheduleInfo(schemaId: string) {
    const scheduleSubscription = this.schemaService.getSchedule(schemaId).subscribe((response) => {
      this.scheduleInfo = response;
      if (response) {
        this.setValueForFormControl(response);
      }
    }, (error) => {
      console.log('Something went wrong when getting schedule information.', error.message);
    })
    this.subscriptions.push(scheduleSubscription);
  }

  /**
   * Function to set values into form controls
   */
  setValueForFormControl(response) {
    this.form.get('isEnable').setValue(response.isEnable);
    this.form.get('schemaSchedulerRepeat').setValue(response.schemaSchedulerRepeat);
    this.form.get('repeatValue').setValue(response.repeatValue);
    const weeklyOn = this.weekDays.find((x) => x.key === response.weeklyOn);
    this.form.get('weeklyOn').setValue(weeklyOn);
    const monthlyOn = this.repeatBys.find((x) => x.key === response.monthOn);
    this.form.get('monthOn').setValue(monthlyOn);
    this.form.get('startOn').setValue(response.startOn);
    this.form.get('end').setValue(response.end);
    this.form.get('occurrenceVal').setValue(response.occurrenceVal);
    this.form.get('endOn').setValue(response.endOn);
  }

  /**
   * ANGULAR HOOK
   * It will be called once when component will be destroyed
   */
  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe()
    })
  }
}
