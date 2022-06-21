import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Process } from '@modules/transaction/model/transaction';
import { DataControlService } from '@modules/transaction/_service/data-control.service';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import * as moment from 'moment';
import { TransactionControlComponent } from '../transaction-control/transaction-control.component';

@Component({
  selector: 'pros-transaction-date-picker',
  templateUrl: './transaction-date-picker.component.html',
  styleUrls: ['./transaction-date-picker.component.scss']
})
export class TransactionDatePickerComponent extends TransactionControlComponent implements OnInit {
  minDate: Date;
  maxDate: Date;
  constructor(
    public transService: TransactionService,
    public dataControlService: DataControlService,
    public datePipe: DatePipe
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

  getDateString(dateVal): string {
    return dateVal ? `${this.datePipe.transform(dateVal, 'mediumDate')}` : '';
  }

  /**
   * gets hint for errors in form fields
   */
   get getHint() {
    return this.getErrorHint(this.control, this.fieldObj);
  }

  onDateChange($event) {
    if(this.control.value ===  $event) return;
    this.control.setValue($event);
  }

}
