import { Component, OnInit } from '@angular/core';
import { DataControlService } from '@modules/transaction/_service/data-control.service';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import { TransactionControlComponent } from '../transaction-control/transaction-control.component';

@Component({
  selector: 'pros-transaction-textarea',
  templateUrl: './transaction-textarea.component.html',
  styleUrls: ['./transaction-textarea.component.scss']
})
export class TransactionTextareaComponent extends TransactionControlComponent implements OnInit {

  constructor(
    public transService: TransactionService,
    public dataControlService: DataControlService,
  ) {
    super(transService, dataControlService);
   }
  ngOnInit(): void {
    super.ngOnInit();
  }

  afterBlur() {
    super.validateFieldRules();
  }
}
