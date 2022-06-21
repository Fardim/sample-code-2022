import { Component, OnInit } from '@angular/core';
import { Process } from '@modules/transaction/model/transaction';
import { DataControlService } from '@modules/transaction/_service/data-control.service';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import { TransactionControlComponent } from '../transaction-control/transaction-control.component';

@Component({
  selector: 'pros-transaction-time-picker',
  templateUrl: './transaction-time-picker.component.html',
  styleUrls: ['./transaction-time-picker.component.scss']
})
export class TransactionTimePickerComponent extends TransactionControlComponent implements OnInit {

  constructor(
    public transService: TransactionService,
    public dataControlService: DataControlService,
  ) {
    super(transService, dataControlService);
   }

  ngOnInit(): void {
    super.ngOnInit();
    if(!this.control.value && this.process === Process.create) {
      this.control.setValue(this.getDefaultValue());
    }
  }

  getDefaultValue() {
    return {
      start: {
        hours: 0,
        minutes: 0
      },
      end: {
        hours: 0,
        minutes: 0
      }
    };
  }

  timeChange(time) {
    const currentTime = JSON.parse(JSON.stringify(time));
    if(currentTime === this.control.value) return;
    this.control.setValue(currentTime);
  }

  /**
   * gets hint for errors in form fields
   */
   get getHint() {
    return this.getErrorHint(this.control, this.fieldObj);
  }

}
