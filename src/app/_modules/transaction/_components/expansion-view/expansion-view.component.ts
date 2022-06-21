import { take } from 'rxjs/internal/operators/take';
import { FieldResponse, TabResponse, GridResponse } from '@modules/transaction/model/transaction';
import { Component, Inject, LOCALE_ID, OnInit, OnDestroy, forwardRef, Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreService } from '@services/core/core.service';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { map, takeUntil, tap, switchMap } from 'rxjs/operators';
import { sortBy } from 'lodash';
import { SelectionModel } from '@angular/cdk/collections';
import { TransactionGridDataSource } from '@modules/transaction/elements/transaction-grid/transaction-grid-data-source';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import { dataControlServiceFactory, transactionServiceFactory } from '../../_service/service-instance-sharing.service';
import { DataControlService } from '@modules/transaction/_service/data-control.service';
@Component({
  selector: 'pros-expansion-view',
  templateUrl: './expansion-view.component.html',
  styleUrls: ['./expansion-view.component.scss'],
  providers: [
    {provide: TransactionService, useFactory: transactionServiceFactory},
    {provide: DataControlService, useFactory: dataControlServiceFactory}
  ]
})
export class ExpansionViewComponent implements OnInit, OnDestroy {
  /**
   * Dataset id
   */
  moduleId: string;

  /**
   * Current layout id
   */
  layoutId: string;

  /**
   * Flow id of the process
   */
  flowId: string;

  /**
   * The task id / inbox request id for the user
   */
  taskId: string;

  /**
   * Tab Id of the Grid where the Grid is inside
   */
  tabId: string;

  /**
   * Field Id of the Grid
   */
  fieldId: string = '';

  /**
   * Grid field details by network call
   */
  fieldObj: FieldResponse = null;
  /**
   * Object number while chnaging ..
   */
  recordId: string;

  /**
   * if isSubGrid true then the Parent Grid Id
   */
  parentRowId = '';

  stepId = '';

  loading = false;

  tabDetails: TabResponse = null;
  tabFieldList: FieldResponse[] = [];

  fieldDetails: GridResponse[] = [];

  pageSize = 5;
  pageIndex = 1;
  searchTerm = '';
  totalCount = 0;

  staticColumns: string[] = ['_select', '_settings'];

  displayedColumns: BehaviorSubject<string[]> = new BehaviorSubject(this.staticColumns);
  childFields: { fieldId: string; fieldDescri: string }[] = [];
  subGridFields: { fieldId: string; fieldDescri: string }[] = [];
  activeSubGridTabIndex: number;
  setActiveSubGridData: any = {};

  activeStructures: any = [1];

  selection = new SelectionModel<any>(true, []);

  activeRowId: string;

  dataSource: TransactionGridDataSource;

  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    @Inject(LOCALE_ID) public locale: string,
    private coreService: CoreService,
    private sharedService: SharedServiceService,
    private transactionService: TransactionService
  ) {
  }

  ngOnInit(): void {

    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';


    combineLatest([
      this.route.queryParams.pipe(takeUntil(this.unsubscribeAll$)),
      this.route.params.pipe(takeUntil(this.unsubscribeAll$)),
      this.route.fragment.pipe(takeUntil(this.unsubscribeAll$)),
      this.transactionService.activeStructures$.pipe(takeUntil(this.unsubscribeAll$)),
    ])
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe(
        (resp) => {
          if(resp.length) {
            this.moduleId = resp[1].moduleId;
            this.flowId = resp[1].flowId;
            this.layoutId = resp[1].layoutId;
            this.recordId = resp[1].recordId;
            this.tabId = resp[1].tabId;
            this.taskId = resp[1].taskId;
            this.fieldId = resp[1].fieldId;
            this.stepId = resp[1].stepId;
            // this.activeStructures = resp[3];
            // const masterRecord: MDORecord = this.transactionService.getMasterData(this.moduleId);
            // this.expansionviewStore.dispatch(new expansionviewActions.SetMasterData(masterRecord));
            this.getTabDetails();
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  /**
   * get the tab details of the grid
   */
  getTabDetails() {
    this.coreService.getDatasetFormTabBytCode(this.layoutId, this.tabId).pipe(
      take(1),
      tap((resp: TabResponse) => (this.tabDetails = resp)),
      switchMap((resp: TabResponse) => {
        return this.coreService.getTabFields(this.moduleId, this.tabId, 0, 0, this.activeStructures, 'en', this.flowId, this.stepId)
        .pipe(
          take(1),
          map((item) => sortBy(item, 'order')),
        )
      })
    ).subscribe((resp: Array<FieldResponse>) => {
      const fields = resp.filter((item: FieldResponse) => {
        return item.fieldType === 'FIELD';
      });
      this.tabFieldList = resp;
      this.transactionService.addFieldsToFieldDetails(fields, this.tabDetails);
      this.fieldObj = this.tabFieldList.find(d=> d.fieldId === this.fieldId);
      this.getFieldDetails();
      this.loading = false;
    });
  }

  getFieldDetails() {
    if (this.fieldObj?.fieldCtrl?.grid.length) {
      this.fieldDetails = this.fieldObj?.fieldCtrl?.grid;
    }
  }

  /**
   * close the side sheet
   */

  close() {
    this.sharedService.setAfterExpansionViewClose({[this.fieldId]: true});
    this.router.navigate([{ outlets: { outer: null } }], { preserveFragment: true, queryParamsHandling: 'preserve' });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
  }
}

