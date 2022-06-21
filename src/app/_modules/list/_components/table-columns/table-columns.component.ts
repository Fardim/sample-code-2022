import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

export type DatasetTable = {
  id: string;
  name: string;
  filterType: string,
  moduleId: string,
}

export type DatasetTableColumn = {
  id: string;
  name: string;
  dataType: string;
  maxLength: number | string;
  selected?: boolean;
}

@Component({
  selector: 'pros-table-columns',
  templateUrl: './table-columns.component.html',
  styleUrls: ['./table-columns.component.scss']
})
export class TableColumnsComponent implements OnChanges, OnInit, OnDestroy {
  @Input() table: DatasetTable;

  @Input() columns: DatasetTableColumn[] = [];

  @Input() filterCount = 0;

  @Output() updateColumns = new EventEmitter<DatasetTableColumn[]>();

  @Output() filterClicked = new EventEmitter<DatasetTable>();
  @Output() deleteTable = new EventEmitter<DatasetTable>();

  /**
   * filtered list fo input items
   */
  filteredColumns: BehaviorSubject<DatasetTableColumn[]> = new BehaviorSubject([]);

  searchSub = new Subject<string>();

  subscription: Subscription;

  constructor(private router: Router, private sharedService: SharedServiceService) { }

  ngOnChanges(changes: SimpleChanges): void {
    const columnsChanges = changes.columns;

    if (columnsChanges && columnsChanges.currentValue !== columnsChanges.previousValue) {
      this.filteredColumns.next(this.columns);
    }
  }

  ngOnInit(): void {
    this.filteredColumns.next(this.columns);
    this.searchSub.pipe(debounceTime(700)).subscribe((searchText) => this.filterData(searchText));
  }

  ngOnDestroy() {
    if (this.subscription) { this.subscription.unsubscribe(); }
  }

  /**
   * Function to search columns
   * @param searchString: string to be searched for columns.
   */
  filterData(searchString) {
    if (!searchString) {
      this.filteredColumns.next(this.columns);
      return;
    }

    this.filteredColumns.next(this.columns.filter(data => data.name.toLowerCase().includes(searchString.toLowerCase())));
  }

  onColumnSelection(column: DatasetTableColumn): void {
    column.selected = !column.selected;

    const selected = this.columns.filter(c => c.selected);

    this.updateColumns.emit(selected);
  }

  onFilterClick() {
    this.filterClicked.emit(this.table);
  }

  removeTable() {
    this.deleteTable.emit(this.table);
  }
}
