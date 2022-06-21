import { Component, Input, OnInit, OnChanges } from '@angular/core';

@Component({
  selector: 'pros-table-view',
  templateUrl: './table-view.component.html',
  styleUrls: ['./table-view.component.scss']
})
export class TableViewComponent implements OnInit, OnChanges {
  @Input() displayedColumnsId: string[];
  @Input() tableDataSource: any;

  @Input() height;

  @Input() width;

  ngOnChanges(changes) {
    if (changes && changes.height && changes.height.previousValue !== changes.height.currentValue) {
      this.height = changes.height.currentValue;
    }
    if (changes && changes.width && changes.width.previousValue !== changes.width.currentValue) {
      this.width = changes.width.currentValue;
    }
  }
  ngOnInit() {
  }
}
