import { Component, Inject, Input, LOCALE_ID, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ActiveForm, TabResponse } from '@modules/transaction/model/transaction';
import { DataControlService } from '@modules/transaction/_service/data-control.service';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import { CoreCrudService } from '@services/core-crud/core-crud.service';
import { UserService } from '@services/user/userservice.service';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'pros-transaction-tabs',
  templateUrl: './transaction-tabs.component.html',
  styleUrls: ['./transaction-tabs.component.scss'],
})
export class TransactionTabsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() tabs: Array<TabResponse>;
  tabsObs: Observable<Array<TabResponse>> = of([]);
  @Input() tabsArray: FormGroup;
  /**
   * subscription array to hold all services subscriptions
   */
  subscriptions: Subscription[] = [];
  @Input() recordId: string;

  /**
   * The dataste id ...
   */
  @Input()
  moduleId: string;

  /**
   * Current process
   */
  @Input()
  process: string;

  /**
   * Layout id for the form
   */
  @Input()
  layoutId: string;

  /**
   * Change Request id for the form
   */
  @Input()
  crId: string;
  @Input()
  activeStructures;

  @Input()
  dataControl;

  @Input()
  isChildDataset: boolean;

  @Input()
  relatedDatasets = [];

  @Input()
  dataEventId: string;

  @Input() flowId: string;
  @Input() stepId: string;

  tenantId: string;
  userId: string;

  isLoadingTemplate = false;

  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();

  activeForm: ActiveForm;

  constructor(
    private router: Router,
    @Inject(LOCALE_ID) public locale: string,
    private userService: UserService,
    private transactionService: TransactionService,
    private coreCrudService: CoreCrudService,
    private dataControlService: DataControlService,
  ) {}

  ngOnInit(): void {

    this.activeForm = this.dataControlService.activeForm$.getValue();

    this.dataControlService.activeForm$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp: ActiveForm) => {
      this.activeForm = resp;
    })

    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    const template = this.transactionService.getMappedTempateByDatasetId(this.moduleId);
    if(!template && !this.isChildDataset) {
      const subscription = this.userService
        .getUserDetails()
        .pipe(distinctUntilChanged())
        .subscribe((user) => {
          if (user?.plantCode) {
            this.tenantId = user?.plantCode;
            this.userId = user?.userId;
            this.isLoadingTemplate = true;
            const parentDatasetId = this.transactionService.parentDatasetIdSub.getValue();
            if (this.recordId && this.moduleId === parentDatasetId) {
              const dto = {
                getAllData: true,
                getWfvs: true,
                keyFields: {},
              };
              const subs = this.coreCrudService
                .getMDOCrRecord(this.moduleId, this.recordId, this.locale, '1', user?.plantCode, dto, this.crId, this.dataEventId)
                .subscribe((resp: any) => {
                  const masterData = {
                    controlData: this.getControlData(),
                    mdoRecordES: resp
                  };
                  this.transactionService.setMasterData(this.activeForm.isPrimary, this.moduleId, masterData, false);
                  this.isLoadingTemplate = false;
                });
                this.subscriptions.push(subs);
            } else {
              const subs = this.coreCrudService.getTransactionDetails(this.moduleId, this.locale, user.plantCode, this.layoutId)
              .pipe(finalize(() => this.isLoadingTemplate = false))
              .subscribe(
                (response) => {
                  let data;
                  if(!this.isChildDataset) {
                    data = response;
                    this.transactionService.setMasterData(this.activeForm.isPrimary, this.moduleId, data, true);
                  }
                  this.isLoadingTemplate = false;
                },
                (error) => console.error(`Error : ${error.message}`)
              );
              this.subscriptions.push(subs);
            }
          }
        });
      // });
      this.subscriptions.push(subscription);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.tabs) {
      this.tabsObs = of(changes.tabs.currentValue);
      this.createTabsFormGroup(changes.tabs.currentValue);
    }
  }


  createTabsFormGroup(tabs: Array<TabResponse>) {
    for (const tab of tabs) {
      if(!this.tabsArray.controls.tabid)
        this.tabsArray.addControl(tab.tabid, new FormGroup({}));
    }
  }

  getControlData() {
    const controlData = {
      crId: this.crId,
      draft: false,
      eventId: 0,
      language: this.locale,
      layoutId: this.layoutId,
      massId: null,
      moduleId: this.moduleId,
      parentCrId: null,
      processId: null,
      recordNumber: this.recordId,
      referenceId: null,
      roleId: null,
      taskId: null,
      tenantId: this.tenantId,
      userId: this.userId,
      processFlowContainerId: '',
      processFlowId: ''
    };
    return controlData;
  }

  scrollTo(tabid) {
    if(tabid) {
      document.getElementById(tabid).scrollIntoView({
        behavior: 'smooth'
      });
    }
  }
  ngOnDestroy(): void {
      this.unsubscribeAll$.next(false);
      this.subscriptions.forEach((item) => item.unsubscribe());
      this.unsubscribeAll$.unsubscribe();
  }
}
