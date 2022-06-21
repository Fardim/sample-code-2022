import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { MonthOn, SchemaScheduler, SchemaSchedulerEnd, SchemaSchedulerRepeat, SchemaSchedulerRepeatMetric, WeekOn } from '@models/schema/schemaScheduler';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { SchemaService } from '@services/home/schema.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { TitleCasePipe } from '@angular/common';
import { TransientService } from 'mdo-ui-library';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'pros-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit, OnDestroy {

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
      key: this.titlecasePipe.transform(MonthOn[item]),
      value: item
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
   * To store the information of schedule (while getting)
   */
  scheduleInfo: SchemaScheduler;

  /**
   * To store scheduler id (if exist)
   */
  schedulerId: string;

  /**
   * To store schedule request information (while creating/updating)
   */
  scheduleReq: SchemaScheduler;

  /**
   * Variables to store selected start and end date objects
   */
  selectedEndDate: Date;
  selectedStartDate: Date;

  /**
   * To hold all the subscriptions
   */
  subscriptions: Subscription[] = []

  constructor(
    private schemaService: SchemaService,
    private matSnackBar: MatSnackBar,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private sharedService: SharedServiceService,
    private titlecasePipe: TitleCasePipe,
    private mdoToastService: TransientService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.schemaId = params.schemaId;
      this.schedulerId = params.scheduleId;
    })
    this.createForm();
    if (this.schedulerId && this.schedulerId !== 'new') {
      this.getScheduleInfo(this.schemaId);
    } else {
      this.selectedStartDate = new Date();
    }
  }

  /**
   * Function to create or initliaze form group for scheduler..
   */
  createForm() {
    this.form = new FormGroup({
      isEnable: new FormControl(false, [Validators.required]),
      schemaSchedulerRepeat: new FormControl(SchemaSchedulerRepeat.NONE),
      repeatValue: new FormControl(12, [Validators.required]),
      weeklyOn: new FormControl(null),
      monthOn: new FormControl(null),
      startOn: (this.schedulerId && this.schedulerId !== 'new') ? new FormControl(null) : new FormControl(moment().utc().valueOf().toString(), [Validators.required]),
      end: new FormControl(SchemaSchedulerEnd.NEVER, [Validators.required]),
      occurrenceVal: new FormControl(2),
      endOn: new FormControl(moment().utc().valueOf().toString())
    });

    // schemaSchedulerRepeat value changes
    this.form.controls.schemaSchedulerRepeat.valueChanges
    .pipe(distinctUntilChanged())
    .subscribe((schemaSchedulerRepeat) => {
      this.updateRepeatValue(schemaSchedulerRepeat);
    })

    // end value changes
    this.form.controls.end.valueChanges
    .pipe(distinctUntilChanged())
    .subscribe((end) => {
      this.updateEndValue(end);
    })
  }

  /**
   * update validation and values of fields on
   * endValue value changes
   * @param endValue pass the value to update
   */
  updateEndValue(endValue: any) {
    this.form.controls.occurrenceVal.setValidators(null);
    this.form.controls.endOn.setValidators(null);
    switch (endValue) {
      case SchemaSchedulerEnd.AFTER:
        this.form.controls.occurrenceVal.setValidators(Validators.required);
        break;
      case SchemaSchedulerEnd.ON:
        this.form.controls.endOn.setValidators(Validators.required);
        break;
    }
    this.form.updateValueAndValidity();
  }

  /**
   * update validation and values of fields on
   * schemaSchedulerRepeat value changes
   * @param schemaSchedulerRepeat pass the value to update
   */
  updateRepeatValue(schemaSchedulerRepeat: SchemaSchedulerRepeat) {
    this.form.controls.weeklyOn.clearValidators();
    this.form.controls.monthOn.clearValidators();
    this.form.controls.isEnable.setValue(true);

    switch (schemaSchedulerRepeat) {
      case SchemaSchedulerRepeat.NONE:
        this.form.controls.isEnable.setValue(false);
        this.setValue('repeatValue', 0);
        break;
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
  }

  /**
   * function to return formField
   */
  formField(field: string) {
    return this.form.get(field);
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
  setValue(field: string, value: any) {
    this.form.controls[field].setValue(value);
    this.form.updateValueAndValidity();
  }

  /**
   * Common function to recieve value from emitter and set value
   * @param field field
   * @param value value
   */
  setDateValue(field: string, value: Date) {
    this.form.controls[field].setValue(`${value.getTime()}`);
    if (field === 'startOn') {
      this.selectedStartDate = value;
    } else if (field === 'endOn') {
      this.selectedEndDate = value;
    }
  }


  /**
   * Function to submit form for scheduler..
   */
  submit() {
    this.formSubmitted = true;
    console.log(this.form.value);
    if (this.form.invalid) {
      (Object).values(this.form.controls).forEach(control => {
        if (control.invalid)
          control.markAsTouched()
      });
      return;
    }
    this.scheduleInfo = this.form.value;
    this.scheduleInfo.weeklyOn = this.form.value.weeklyOn ? this.form.value.weeklyOn.key : null;
    this.scheduleInfo.monthOn = this.form.value.monthOn ? this.form.value.monthOn.key : null;
    this.scheduleInfo.schemaId = this.schemaId;
    this.scheduleInfo.schedulerId = this.schedulerId !== 'new' ? Number(this.schedulerId) : null;
    const updateSubscription = this.schemaService.createUpdateSchedule(this.schemaId, this.scheduleInfo).subscribe((response) => {
      if (response) {
        this.close();
        this.sharedService.setScheduleInfo(response);
        this.mdoToastService.open('Schema has been scheduled.', 'Okay', {
          duration: 3000
        })
      }
    }, (error) => {
      console.log('something went wrong when scheduling schema..')
    })
    this.subscriptions.push(updateSubscription);
  }

  /**
   * Function to get refrence string for scheduler..
   */
  get getReferenceString() {
    const startValue = this.form.controls.startOn.value;
    const endValue = this.form.controls.end.value;
    const repeatValue = this.form.controls.repeatValue.value || 0;
    const endOn = this.form.controls.endOn.value;
    if (!startValue || !endValue) {
      return '';
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
    this.activatedRoute.url.subscribe(s=>{
      if(s.toString().indexOf('sb,') !== -1) {
        this.router.navigate([{ outlets: { sb: null } }], { queryParamsHandling: 'preserve' });
      } else if(s.toString().indexOf('outer,') !== -1) {
        this.router.navigate([{ outlets: { outer: null } }], { queryParamsHandling: 'preserve' });
      }
    });

  }

  /**
   * function to get schedule information
   * @param schemaId: Id of schema for which schedule info needed
   */
  getScheduleInfo(schemaId: string) {
    const scheduleSubscription = this.schemaService.getSchedule(schemaId).subscribe((response) => {
      if (response) {
        this.scheduleInfo = response;
        this.setValueForFormControl();
      }
    }, (error) => {
      console.log('Something went wrong when getting schedule information.', error.message);
    })
    this.subscriptions.push(scheduleSubscription);
  }

  /**
   * Function to set values into form controls
   */
  setValueForFormControl() {
    this.form.get('isEnable').setValue(this.scheduleInfo.isEnable);
    this.form.get('schemaSchedulerRepeat').setValue(this.scheduleInfo.schemaSchedulerRepeat);
    this.form.get('repeatValue').setValue(this.scheduleInfo.repeatValue);
    const weeklyOn = this.weekDays.find((x) => x.key === this.scheduleInfo.weeklyOn);
    this.form.get('weeklyOn').setValue(weeklyOn);
    const monthlyOn = this.repeatBys.find((x) => x.key === this.scheduleInfo.monthOn);
    this.form.get('monthOn').setValue(monthlyOn);
    this.form.get('startOn').setValue(this.scheduleInfo.startOn);
    this.form.get('end').setValue(this.scheduleInfo.end);
    this.form.get('occurrenceVal').setValue(this.scheduleInfo.occurrenceVal);
    this.form.get('endOn').setValue(this.scheduleInfo.endOn);
    this.selectedStartDate = new Date(Number(this.scheduleInfo.startOn));
    this.selectedEndDate = new Date(Number(this.scheduleInfo.endOn));
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
