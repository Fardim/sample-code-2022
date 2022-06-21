import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';

@Component({
  selector: 'pros-tile-item',
  templateUrl: './tile-item.component.html',
  styleUrls: ['./tile-item.component.scss']
})
export class TileItemComponent implements OnInit, OnChanges {

  @Input() icon: string;
  @Input() title: string;
  @Input() description: string;
  @Input() action: string;
  @Input() actionButtonText: string;
  @Input() svgIconSize = 80;
  @Input() svgIconHeight = 80;
  @Input() svgIconViewBox = "0 0 262 251";
  @Input() disableClose: boolean = false;

  @Output() closeClicked: EventEmitter<string> = new EventEmitter<string>();
  constructor() { }

  ngOnInit(): void {
  }

  closeTile(action?: string) {
    this.closeClicked.emit(action);
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.disableClose?.currentValue !== undefined) {
      this.disableClose = changes.disableClose.currentValue;
    }
  }
}
