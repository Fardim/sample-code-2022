import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'pros-date-picker-field',
  templateUrl: './date-picker-field.component.html',
  styleUrls: ['./date-picker-field.component.scss']
})
export class DatePickerFieldComponent implements OnInit, OnChanges {

  /**
   * Current date to set as default date
   */
  today = new Date();

  /**
   * Boolean to check which type of date-picker to show(Range-field/normal)
   */
  @Input()
  showRangeFld: boolean;

  @Input()
  selectedStrtFld: string;

  @Input()
  selectedEndFld: string;

  /**
   * To get preselected date field value from parent
   */
  @Input()
  preSelectedFld: string;

  /**
   * To set maximum valid date into date-picker
   * By default it will be as current date
   */
  @Input()
  showFutureDates = false;

  /**
   * To get minimum valid date from parent
   */
  @Input()
  minimumValidDate: any;

  @Output()
  strtValueSelected: EventEmitter<string> = new EventEmitter();

  @Output()
  endValueSelected: EventEmitter<string> = new EventEmitter();

  startDate: string;
  endDate: string;

  conditionFieldStartValue: FormControl;
  conditionFieldEndValue: FormControl;
  conditionFieldValue: FormControl;

  constructor( ) {
    this.conditionFieldStartValue = new FormControl();
    this.conditionFieldEndValue = new FormControl();
    this.conditionFieldValue = new FormControl();
   }

  /**
   * ANGULAR HOOK
   * It will be triggerd when value of @Input will be changed
   * @param changes: change object hold values
   */
  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes.minimumValidDate && changes.minimumValidDate.currentValue !== changes.minimumValidDate.previousValue) {
      const fld = Number(changes.minimumValidDate.currentValue);
      this.minimumValidDate = new Date(fld);
    }
    if(changes && changes.preSelectedFld && changes.preSelectedFld.currentValue !== changes.preSelectedFld.previousValue) {
      const fld =  Number(this.preSelectedFld);
      this.conditionFieldValue.setValue(new Date(fld));
    }
  }

  ngOnInit(): void {
    this.conditionFieldStartValue.disable({onlySelf:true,emitEvent:true})
    this.conditionFieldEndValue.disable({onlySelf:true,emitEvent:true})
    this.conditionFieldValue.disable({onlySelf:true,emitEvent:true})

    if(this.selectedStrtFld) {
      const fld =  Number(this.selectedStrtFld);
      this.conditionFieldStartValue.setValue(new Date(fld));
    }

    if(this.selectedEndFld) {
      const fld =  Number(this.selectedEndFld);
      this.conditionFieldEndValue.setValue(new Date(fld));
    }

    if(this.preSelectedFld) {
      const fld =  Number(this.preSelectedFld);
      this.conditionFieldValue.setValue(new Date(fld));
    }
  }

  changeStartDate(event: MatDatepickerInputEvent<Date>) {
    if(event.value && event.value.getTime()) {
      this.startDate = String(event.value.getTime());
      this.strtValueSelected.emit(this.startDate);
    }
  }

  changeEndtDate(event: MatDatepickerInputEvent<Date>) {
    if(event.value && event.value.getTime()) {
      this.endDate = String(event.value.getTime());
      this.endValueSelected.emit(this.endDate);
    }
  }
}
