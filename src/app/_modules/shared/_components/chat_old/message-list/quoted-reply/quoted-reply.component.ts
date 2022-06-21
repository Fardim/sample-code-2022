import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'pros-quoted-reply',
  templateUrl: './quoted-reply.component.html',
  styleUrls: ['./quoted-reply.component.scss']
})
export class QuotedReplyComponent implements OnChanges {

  @Input() messageDetail: any;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.messageDetail && changes.messageDetail.currentValue) {
      this.messageDetail = changes.messageDetail.currentValue;
    }
  }
}
