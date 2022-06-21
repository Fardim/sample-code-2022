import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { validationRegex } from '@constants/globals';
import { DataControlService } from '@modules/transaction/_service/data-control.service';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import { TransactionControlComponent } from '../transaction-control/transaction-control.component';

@Component({
  selector: 'pros-transaction-url',
  templateUrl: './transaction-url.component.html',
  styleUrls: ['./transaction-url.component.scss']
})
export class TransactionUrlComponent extends TransactionControlComponent implements OnInit {

  constructor(
    public transService: TransactionService,
    public dataControlService: DataControlService,
  ) {
    super(transService, dataControlService);
   }

  ngOnInit(): void {
    super.ngOnInit();
    this.control.addValidators(Validators.pattern(validationRegex.url));
    this.control.updateValueAndValidity({emitEvent: false});
  }

  get getHint() {
    return this.getErrorHint(this.control, this.fieldObj);
  }

  afterBlur(event) {
    super.validateFieldRules();
  }
 openURlinNewTab(url){
  window.open(url, "_blank");
 }
}
