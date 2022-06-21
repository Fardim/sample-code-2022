import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { VirtualDatasetService } from '@services/list/virtual-dataset/virtual-dataset.service';
import { DatasetTable, DatasetTableColumn } from '../table-columns/table-columns.component';

@Component({
  selector: 'pros-join-step',
  templateUrl: './join-step.component.html',
  styleUrls: ['./join-step.component.scss']
})
export class JoinStepComponent implements OnInit, OnChanges {
  @Input() tables: DatasetTable[] = [];
  @Input() columns: DatasetTableColumn[][] = [[], []];
  @Input() filterCounts: number[] = [];

  @Output() filterClicked = new EventEmitter<{ index: number; table: DatasetTable }>();

  @Output() deleteTable = new EventEmitter<{ index: number, table: DatasetTable }>();

  leftTable: DatasetTable = null;
  rightTable: DatasetTable = null;

  leftColumns: DatasetTableColumn[] = [];
  rightColumns: DatasetTableColumn[] = [];

  leftFilterCount = 0;
  rightFilterCount = 10;

  constructor(private router: Router, private virtualDatasetService: VirtualDatasetService) { }

  ngOnChanges(changes: SimpleChanges): void {
    const tablesChanges = changes.tables;
    if (tablesChanges && tablesChanges.currentValue && tablesChanges.currentValue !== tablesChanges.previousValue) {
      this.syncPropsChanges();
    }
  }

  ngOnInit(): void {
  }

  syncPropsChanges() {
    const [table1, table2] = this.tables || [];
    const [columns1, columns2] = this.columns;
    const [leftFilterCount, rightFilterCount] = this.filterCounts;

    this.leftTable = table1;
    this.rightTable = table2;

    this.leftColumns = columns1 || [];
    this.rightColumns = columns2 || [];
    this.leftFilterCount = leftFilterCount;
    this.rightFilterCount = rightFilterCount;
    this.virtualDatasetService.leftColumns = this.leftColumns;
    this.virtualDatasetService.rightColumns = this.rightColumns;
  }

  editJoinProperties() {
    this.router.navigate([{ outlets: { sb: `sb/list/vd/join/properties` } }]);
  }

  onFilterClick(index: number, table: DatasetTable) {
    this.filterClicked.emit({ index, table });
  }

  removeTable(index: number, table: DatasetTable) {
    this.deleteTable.emit({ index, table });
  }
}
