import { Component, OnInit } from '@angular/core';
import { Process } from '@modules/transaction/model/transaction';
import { DataControlService } from '@modules/transaction/_service/data-control.service';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import * as moment from 'moment';
import { TransactionControlComponent } from '../transaction-control/transaction-control.component';

@Component({
  selector: 'pros-transaction-date-time-picker',
  templateUrl: './transaction-date-time-picker.component.html',
  styleUrls: ['./transaction-date-time-picker.component.scss']
})
export class TransactionDateTimePickerComponent extends TransactionControlComponent implements OnInit {
  minDate: Date;
  maxDate: Date;
  constructor(
    public transService: TransactionService,
    public dataControlService: DataControlService,
  ) {
    super(transService, dataControlService);
   }

  ngOnInit(): void {
    super.ngOnInit();
    const dt = new Date();
    if(this.fieldObj && this.fieldObj.fieldCtrl && this.fieldObj.fieldCtrl.isPastDate) {
      this.minDate = moment().subtract(100, 'years').toDate()
      this.maxDate = new Date();
    } else if(this.fieldObj && this.fieldObj.fieldCtrl && this.fieldObj.fieldCtrl.isFutureDate) {
      this.minDate = new Date();
      this.maxDate = moment().add(100,'years').toDate()
    }
    else if(!this.control.value && this.process === Process.create && this.fieldObj.fieldCtrl.isDefault) {
      this.minDate = new Date();
      this.maxDate = new Date();
      this.control.setValue(new Date());
    } else{
      this.minDate = moment().subtract(100, 'years').toDate()
      this.maxDate = moment().add(100,'years').toDate()
    }
  }

  get SelectedDate() {
    const controlValue = this.control.value;
    return controlValue ? controlValue : new Date();
  }

  isValidDate(d) {
    return d instanceof Date && !Number.isNaN(d);
  }

  timeChange(time) {
    const currentTime = new Date(time);
    if(this.isValidDate(this.control.value) && currentTime.getTime() === this.control.value.getTime()) return;
    this.control.setValue(currentTime);
  }

  /**
   * gets hint for errors in form fields
   */
   get getHint() {
    return this.getErrorHint(this.control, this.fieldObj);
  }

}
