import { Component, OnInit } from '@angular/core';
import { DataControlService } from '@modules/transaction/_service/data-control.service';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import { TransactionControlComponent } from '../transaction-control/transaction-control.component';

@Component({
  selector: 'pros-transaction-checkbox',
  templateUrl: './transaction-checkbox.component.html',
  styleUrls: ['./transaction-checkbox.component.scss']
})
export class TransactionCheckboxComponent extends TransactionControlComponent implements OnInit {

  constructor(
    public transService: TransactionService,
    public dataControlService: DataControlService,
  ) {
    super(transService, dataControlService);
   }

  ngOnInit(): void {
    super.ngOnInit();
  }

  valueChange(event){
    this.control.setValue(event);
    super.validateFieldRules();
  }
}
