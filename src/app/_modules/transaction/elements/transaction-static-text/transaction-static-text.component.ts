import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'pros-transaction-static-text',
  templateUrl: './transaction-static-text.component.html',
  styleUrls: ['./transaction-static-text.component.scss']
})
export class TransactionStaticTextComponent implements OnInit {

  @Input() staticTextBody: string;
  constructor() { }

  ngOnInit(): void {
  }

}
