import { Component, OnInit } from '@angular/core';
import { DataControlService } from '@modules/transaction/_service/data-control.service';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import { TransactionControlComponent } from '../transaction-control/transaction-control.component';

@Component({
  selector: 'pros-transaction-html-editor',
  templateUrl: './transaction-html-editor.component.html',
  styleUrls: ['./transaction-html-editor.component.scss']
})
export class TransactionHtmlEditorComponent extends TransactionControlComponent implements OnInit {

  constructor(
    public transService: TransactionService,
    public dataControlService: DataControlService,
  ) {
    super(transService, dataControlService);
   }

  ngOnInit(): void {
    super.ngOnInit();
  }

  editorValueChange($event) {
    this.transService.updateHdvs(this.activeForm, this.moduleId, null, $event.editorId, [$event.newValue], this.process);
  }
}
