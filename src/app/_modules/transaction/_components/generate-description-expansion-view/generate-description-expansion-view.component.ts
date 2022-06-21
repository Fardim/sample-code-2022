import { map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { Utilities } from '@models/schema/utilities';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FieldResponse, TabResponse, GridResponse } from '@modules/transaction/model/transaction';
import { Subject, combineLatest } from 'rxjs';
import { Component, OnInit, Inject, LOCALE_ID, OnDestroy } from '@angular/core';
import { CoreService } from '@services/core/core.service';
import { sortBy } from 'lodash';

@Component({
  selector: 'pros-generate-description-expansion-view',
  templateUrl: './generate-description-expansion-view.component.html',
  styleUrls: ['./generate-description-expansion-view.component.scss']
})
export class GenerateDescriptionExpansionViewComponent implements OnInit, OnDestroy {
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

  process: string;

  stepId = '';

  loading = false;

  tabDetails: TabResponse = null;
  tabFieldList: FieldResponse[] = [];

  fieldDetails: GridResponse[] = [];

  childFields: { fieldId: string; fieldDescri: string }[] = [];
  subGridFields: { fieldId: string; fieldDescri: string }[] = [];
  activeSubGridTabIndex: number;
  setActiveSubGridData: any = {};

  activeStructures = [1];

  activeRowId: string;

  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    @Inject(LOCALE_ID) public locale: string,
    private coreService: CoreService,
    private transactionService: TransactionService,
    private utilityService: Utilities,
    private sharedService: SharedServiceService
  ) {}

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
            this.process = resp[1].process;
            this.activeStructures = resp[3];
            this.stepId = resp[1].stepId;

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
      // this.getFieldDetails();
      this.loading = false;
    });
  }

  // getFieldDetails() {
  //   if (this.fieldObj?.fieldCtrl?.grid.length) {
  //     this.fieldDetails = this.fieldObj?.fieldCtrl?.grid;
  //   }
  // }

  isShowDescription(field): boolean {
    return field.fieldCtrl.isDescription && this.transactionService.getLayoutDetails()?.descriptionGenerator;
  }

  /**
   * close the side sheet
   */

  close() {
    // this.sharedService.setAfterDescGeneratorExpansionViewClose({fieldId: this.fieldId, fg: this.frmGroup});
    this.router.navigate([{ outlets: { outer: null } }], { preserveFragment: true, queryParamsHandling: 'preserve' });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
  }
}
