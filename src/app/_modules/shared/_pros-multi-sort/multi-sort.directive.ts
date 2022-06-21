import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TableData } from '@modules/shared/_pros-multi-sort/table-data';
import { MultiSortTableDataSource } from '@modules/shared/_pros-multi-sort/multi-sort-data-source';
import { Directive, OnChanges, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSort, MatSortable, SortDirection } from '@angular/material/sort';

@Directive({
  selector: '[prosMultiSort]',
  exportAs: 'prosMultiSort'
})
export class MultiSortDirective extends MatSort implements OnInit, OnChanges, OnDestroy {

  @Input() dataSource: MultiSortTableDataSource<any> = null;
  @Input() columns: {id: string; name: string}[] = [];
  @Output() sortingFields: EventEmitter<{sortBy: string, sortDirection: string}[]> = new EventEmitter<{sortBy: string, sortDirection: string}[]>();
  table: TableData<any>;
  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();
  sortFields: {sortBy: string, sortDirection: string}[] = [];

  start = 'asc' as 'asc' | 'desc';

  actives: string[] = [];
  directions: SortDirection[] = [];

  ngOnInit(): void {
    super.ngOnInit();

    this.table = new TableData<any>(
      this.columns
    );
    this.table.dataSource = this.dataSource;
    this.table.sortObservable.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp) => {
      this.mapSortFields();
    });
    this.sortChange.subscribe(resp => {
      this.table.onSortEvent();
    });
  }

  ngOnChanges(): void {
    this.table = new TableData<any>(
      this.columns
    );
    this.table.dataSource = this.dataSource;
  }

  mapSortFields() {
    this.sortFields = this.table.sortParams.map((v, i) => {
      return {
        sortBy: v,
        sortDirection: this.table.sortDirs[i]
      };
    });
    this.sortingFields.emit(this.sortFields);
  }
  ngOnDestroy() {
    super.ngOnDestroy();
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
  }

  sort(sortable: MatSortable): void {
    this.updateMultipleSorts(sortable);
    super.sort(sortable);
  }

  updateMultipleSorts(sortable: MatSortable): void {
    const i = this.actives.findIndex(activeId => activeId === sortable.id);

    if (this.isActive(sortable)) {
      if (this.activeDirection(sortable) === (sortable.start ? sortable.start : this.start)) {
        this.directions.splice(i, 1, this.getNextSortDirection(sortable));
      } else {
        this.actives.splice(i, 1);
        this.directions.splice(i, 1);
      }
    } else {
      this.actives.push(sortable.id);
      this.directions.push(sortable.start ? sortable.start : this.start);
    }
  }

  isActive(sortable: MatSortable) {
    const i = this.actives.findIndex(activeId => activeId === sortable.id);
    return i > -1;
  }

  activeDirection(sortable: MatSortable): 'asc' | 'desc' {
    const i = this.actives.findIndex(activeId => activeId === sortable.id);
    return this.directions[i] || (sortable.start ? sortable.start : this.start);
  }

}
