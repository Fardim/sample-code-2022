import { MultiSortDirective } from './multi-sort.directive';

export class MultiSortTableDataSource<T> {
  sort: MultiSortDirective = null;

  setMultiSort(sort: MultiSortDirective) {
    this.sort = sort;
  }
}
