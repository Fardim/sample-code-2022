import { SelectionModel } from '@angular/cdk/collections';
import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import FormField from '@models/form-field';
import { FilterBusinessList } from '@models/list-page/listpage';
import { crossDataSetRulesColumns } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { CrossDatasetService } from '@services/cross-dataset.service';
import { TransientService } from 'mdo-ui-library';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { CrossDatasetRuleDataSource } from './cross-dataset-rule-datasource';

@Component({
  selector: 'pros-cross-dataset-list',
  templateUrl: './cross-dataset-list.component.html',
  styleUrls: ['./cross-dataset-list.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => CrossDatasetListComponent)
  }]
})
export class CrossDatasetListComponent extends FormField implements OnInit {

  formListHasData = false;
  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();

  /**
   * moduleId from param
   */
  @Input() moduleId = '';

  recordsPageIndex = 1;
  recordsPageSize = 10;
  totalCount = 0;

  /**
   * show skeleton on initial load
   */
  showSkeleton = false;

  /**
   * forms search by string
   */
  searchFieldSub: Subject<string> = new Subject();

  /**
   * material table datasource
   */
  dataSource: CrossDatasetRuleDataSource = undefined;
  filterData: FilterBusinessList = new FilterBusinessList();
  selection = new SelectionModel<any>(true, []);
  totalData = {};

  displayedColumns: string[] = [
    'action',
    'ruleName'
  ];
  columns = crossDataSetRulesColumns;

  constructor(
    private transientService: TransientService,
    private crossDatasetService: CrossDatasetService
  ) {
    super();
    this.dataSource = new CrossDatasetRuleDataSource(this.crossDatasetService);
  }

  ngOnInit(): void {

    this.showSkeleton = true;
    this.dataSource.reset();
    this.getTableData();

    this.dataSource.loading$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp) => {
      if (!resp) {
        this.showSkeleton = false;
      }
    });

    this.dataSource.hasDataSubject.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp) => {
      if (resp) {
        this.formListHasData = resp;
      }
    });

    this.dataSource.totalData.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp: any) => {
      if (resp) {
        this.totalCount = resp?.totalElements;
        this.totalData = resp;
      }
    });

    this.searchFieldSub.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString) => {
      this.filterData.ruleName = searchString;
      this.recordsPageIndex = 1;
      this.dataSource.reset();
      this.getTableData();
    });
  }

  getTableData() {
    this.dataSource.getData(+this.moduleId, +(this.recordsPageIndex - 1), +this.recordsPageSize, this.filterData.ruleName);
  }

  /**
   * get page records
   */
  onPageChange(event: PageEvent) {
    if (this.recordsPageIndex !== event.pageIndex) {
      this.recordsPageIndex = event.pageIndex;
      this.getTableData();
    }
  }

  // display page records range
  get displayedRecordsRange(): string {
    const endRecord =
      this.recordsPageIndex * this.recordsPageSize < this.totalCount ? this.recordsPageIndex * this.recordsPageSize : this.totalCount;
    return this.totalCount ? `${(this.recordsPageIndex - 1) * this.recordsPageSize + 1} to ${endRecord} of ${this.totalCount}` : '';
  }

  updatePageIndexOnDelete(){
    if((this.totalCount-1) % this.recordsPageSize == 0){
      this.recordsPageIndex = (this.totalCount-1)/this.recordsPageSize;
      this.getTableData();
    } else{
      this.getTableData();
    }
  }

  getLabel(dynCol) {
    return this.columns.find((d) => d.id === dynCol)?.name;
  }

  deleteBusinessRule(data) {
    this.transientService.confirm(
      {
        data: { dialogTitle: 'Confirmation', label: 'Are you sure you want delete this cross dataset rule?' },
        disableClose: true,
        autoFocus: false,
        width: '600px',
        panelClass: 'create-master-panel',
      },
      (response) => {
        if (response === 'yes') {
          this.crossDatasetService.deleteCrossDatasetRule(data.uuid).subscribe(res => {
            if (res) {
              this.transientService.open('Deleted successfully','close', { duration: 3000 });
              this.updatePageIndexOnDelete();
            }
          }, err => console.error(`Error : ${err.message}`));
        }
      }
    );
  }

  createUpdateCrossDatasetRule(row?) {
    const ruleId = row && row?.uuid ? row?.uuid : '';
    this.onChange({editCrossDataset: true, ruleId});
  }

  close() {
    this.onChange({closeDataListSideSheet: true});
  }
}
