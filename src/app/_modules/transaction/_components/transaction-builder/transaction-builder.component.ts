import { AfterViewInit, Component, ElementRef, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ObjectType } from '@models/core/coreModel';
import { HierarchyListItem } from '@modules/list/_components/field/hierarchy-service/hierarchy.service';
import { CoreService } from '@services/core/core.service';
import { combineLatest, forkJoin, Observable, of, Subject, Subscription } from 'rxjs';
import { filter, finalize, take, takeUntil } from 'rxjs/operators';
import { FormControl, FormGroup } from '@angular/forms';
import { MDORecord, Process, TabResponse, ProcessValue, FieldErrorLog, ChildDatasetFieldErrorLog, FlowFormDetails, TransactionTabsDetails } from '@modules/transaction/model/transaction';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import { UserService } from '@services/user/userservice.service';
import { TransientService } from 'mdo-ui-library';
import { MatDrawer } from '@angular/material/sidenav';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { RuleService } from '@services/rule/rule.service';
import { ListService } from '@services/list/list.service';
import { DatasetForm, FilterCriteria, ListValue } from '@models/list-page/listpage';
import { DataControlService } from '@modules/transaction/_service/data-control.service';
import { MatDialog } from '@angular/material/dialog';
import { RejectModuleComponent } from '../../../../_modules/shared/_components/reject-module/reject-module.component';
import { Utilities } from '@models/schema/utilities';
import { ProcessService } from '../../../../_services/process/process.service';
import { CoreCrudService } from '@services/core-crud/core-crud.service';
import { ServiceInstanceSharingService } from '@modules/transaction/_service/service-instance-sharing.service';
import { GlobaldialogService } from '@services/globaldialog.service';
import { MatTabGroup } from '@angular/material/tabs';
import { Store } from '@ngrx/store';
import { ChatState } from '@store/reducers/chat.reducer';
import { getChannelId } from '@store/selectors/chat.selector';
import { ChannelIdrequest } from '@modules/chat/_common/chat';
import { ChatService } from '@services/chat/chat.service';

@Component({
  selector: 'pros-transaction-builder',
  templateUrl: './transaction-builder.component.html',
  styleUrls: ['./transaction-builder.component.scss'],
  providers: [TransactionService, DataControlService]
})
export class TransactionBuilderComponent implements OnInit, AfterViewInit, OnDestroy {

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
   * The Description for object
   */
  objectType: ObjectType = { objectdesc: '', objectInfo: '', objectid: null };

  /**
   * Object number while chnaging ..
   */
  recordId: string;

  /**
   * Change Request ID
   */
  crId: string;

  /**
   * The process id while saving from task list
   */
  processId: string;

  activeStructure;

  tabList: Array<TabResponse> = [];

  /**
   * search string for searching the conditions
   */
  conditionSearchString='' ;
  /**
   * conditions table page index
   */
  conditionsPageIndex=1;
  /**
   * default size for one page of conditions table
   */
  conditionsPageSize=10;

  /**
   * The task list approval event id ...
   */
  dataEventId: string;

  /**
   * The the container id where the flow mapped ... this will use for approval process
   */
  processFlowContainerId: string;
  /**
   * flag for saving
   */

   saving = false;

  hierarchyListSearchTerm = '';
  hierarchyListPageIndex = 0;
  hierarchyListPageSize = 50;
  hierarchyList: HierarchyListItem[] = [];
  searchSub: Subject<string> = new Subject();

  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();

  rulesList: Array<any> = [];
  rulesDetails: Array<any> = [];

  process = Process.create;
  dataControl = new FormGroup({
    primary: new FormGroup({}),
    relatedDatasets: new FormGroup({}),
  });

  @ViewChild('drawer') drawer: MatDrawer;
  @ViewChild('chatPanel') chatPanel: MatDrawer;
  @ViewChild('matTabgroup') matTabgroup: MatTabGroup;

  isErrorExists = false;
  loadErrorField = true;
  /**
   * layout details
   */
  layoutDetails: DatasetForm;

  errorMsg: string;

  isChatEnabled: boolean = false;

  relatedDatasets: TransactionTabsDetails[] = [];

  activeDatasetId: string;

  isLoading = false;
  allErrorsLogs: Array<FieldErrorLog> = [];
  stepId: string;
  stepRules: any = {};
  activeTabId: string;
  currentTabIndex: number = 0;

  recordOptionList: Observable<Array<ListValue>> = of([]);

  @ViewChild('recordListOption') recordListOption: ElementRef<HTMLInputElement>;

  private readonly dialofConfig = {
    disableClose: true,
    width: '600px',
    minHeight: '250px',
  };
  @ViewChild('datasetsTabsHeaders') datasetsTabsHeaders: ElementRef;
  flow: FlowFormDetails;

  hasDuplicateRecords = false;

  /**
   * For copy event, control to
   * determine whether to copy
   * the record with related records or not
   */
  copyWithRelatedDatasets = new FormControl(false);

  /**
   * Holds the subscription for mat tab change event
   */
  matTabChangeEvent$: Subscription | null = null;

  get transactionOutlet() {
    const routerDetails = [...(this.router as any)?.currentUrlTree?.root?.children?.outer?.segments?.map(m=> m.path) || []];
    if(routerDetails.includes('transaction')) return 'outer';
    return 'sb';
  }

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private coreService: CoreService,
      private transactionService: TransactionService,
      private userDetails: UserService,
      @Inject(LOCALE_ID) public locale: string,
      private transiantService: TransientService,
      private sharedService: SharedServiceService,
      private ruleService: RuleService,
      private dataControlService: DataControlService,
      private matDialog: MatDialog,
      private listService: ListService,
      private utilityService: Utilities,
      private processService: ProcessService,
      private coreCrudService: CoreCrudService,
      private serviceInstanceSharing: ServiceInstanceSharingService,
      private transitenService: TransientService,
      private chatStore: Store<ChatState>,
      private chatService: ChatService
    ) { }

  ngOnInit(): void {

    this.serviceInstanceSharing.setTransactionServiceInstance(this.transactionService);
    this.serviceInstanceSharing.setDataControlServiceInstance(this.dataControlService);

    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';

    this.defineTheProcess();

    combineLatest([
      this.route.queryParams.pipe(takeUntil(this.unsubscribeAll$)),
      this.route.params.pipe(takeUntil(this.unsubscribeAll$))
    ])
    .pipe(takeUntil(this.unsubscribeAll$))
    .subscribe((resp) => {

      let changed = false;

      if(resp[1] && resp[1].recordType) {
        changed = true;
      }

      if((
          resp[1]?.moduleId && (this.moduleId !== resp[1]?.moduleId)) ||
          resp[1]?.id && (this.recordId !== resp[1]?.id)
      ) {
        this.moduleId = resp[1].moduleId;
        this.transactionService.parentDatasetIdSub.next(this.moduleId);
        (this.dataControl.controls.primary as FormGroup).addControl(this.moduleId, new FormGroup({formData: new FormGroup({})}));
        // this.dataControl = new FormGroup({[this.moduleId]: new FormGroup({formData: new FormArray([])})});
        this.flowId = resp[1].flowId;
        this.processId = resp[1].processId;
        this.taskId = resp[1].taskId;
        this.layoutId = resp[1].layoutId;
        this.recordId = resp[1].id;
        this.dataEventId = resp[1].dataEventId;
        this.processFlowContainerId = resp[1].processFlowContainerId;
        this.crId = resp[1].crId;
        this.stepId = resp[1].stepId;
        this.getObjectTypeDetails();
        this.getRelatedDatasets();
        changed = true;
      }
      if(resp[1] && resp[1].activeTabId) {
        const activeTabId = resp[1].activeTabId;
        if(activeTabId !== this.activeTabId) {
          this.activeDatasetId = activeTabId.split(',')[0];
          this.activeTabId = activeTabId;
          changed = true;
        }
      } else {
        this.activeDatasetId = this.moduleId;
        changed = true;
      }
      if(changed && this.matTabgroup) {
        this.dataControlService.activeForm$.next({isPrimary: this.currentTabIndex === 0, moduleId: this.activeDatasetId, objnr: null, isNew: false, referenceRecordDetails: this.relatedDatasets[this.currentTabIndex - 1]?.dataReferenceDetails});
      }
      if(this.process === Process.copy && this.transactionOutlet === 'outer') {
        this.getRecordList('');
      }
    }, (err) => {
      console.log(err);
    });

    this.transactionService.loadDataReflayout.subscribe((resp: any) => {
      const tabsIndex = this.relatedDatasets.findIndex((item) => {
        return (
          item.dataReferenceDetails &&
          item.dataReferenceDetails.fieldId === resp.realtedDatasetTab.fieldId &&
          item.dataReferenceDetails.parentModuleId === resp.realtedDatasetTab.parentModuleId &&
          item.dataReferenceDetails.isParentModulePrimary === resp.realtedDatasetTab.isParentModulePrimary
        );
      });

      if(tabsIndex < 0)
        this.relatedDatasets.push({
          childDatasetId: resp.referenceDatasetId,
          childDescription: resp.refdataSetDesc + ' / ' + resp.description || '' ,
          layoutId: resp.formId,
          isDataRef: true,
          count: 1,
          dataReferenceDetails: resp.realtedDatasetTab,
          tabType: 'DATA-REF',
          tabId: `${resp.referenceDatasetId},${resp.realtedDatasetTab.fieldId}`,
        });
      else {
        // this.selectedDatasetIndexChanged(tabsIndex + 1);
        this.currentTabIndex = tabsIndex + 1;
        // this.transiantService.open(`Alreday added dataref record!`, '', { duration:4000 });
        return;
      }

      this.dataControlService.addRealtedDatasetTab(this.dataControl, resp.realtedDatasetTab);
      // this.selectedDatasetIndexChanged(this.relatedDatasets.length);
      this.currentTabIndex = this.relatedDatasets.length;
    });

    this.dataControlService.newChildRecordAdded.pipe(takeUntil(this.unsubscribeAll$)).subscribe((datasetId: string) => {
      const dataset = this.relatedDatasets.find((item) => item.childDatasetId === datasetId);
      if(dataset) {
        dataset.count++;
      };
    });

    if(this.process === Process.create) {
      this.sharedService.copiedMDORecord.pipe(filter((resp) => !!resp)).subscribe((resp) => {
        console.log('Recieved Copied MDORecord: ', resp);
        const activeForm = this.dataControlService.activeForm$.getValue();
        if(resp) {
          this.transactionService.setMasterData(activeForm, this.moduleId, resp, true, null, null, this.process, true);

          if(resp.relatedDatasets) {
            const { relatedDatasets } =  resp ;
            Object.keys(relatedDatasets).forEach((datasetId) => {
              (this.dataControl.controls.relatedDatasets as FormGroup).addControl(datasetId, new FormGroup({}));
              const recordList = Object.keys(relatedDatasets[datasetId]);
              recordList.forEach((record) => {
                this.dataControlService.addNewRecord({
                  dataControl: this.dataControl,
                  moduleId: datasetId,
                  isNewRecord: true,
                  navigateTo: false,
                  recordNumber: record
               });
              })
            })
          }
        }
      });
    }
    /* this.searchSub.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.hierarchyListSearchTerm = searchTerm || '';
      this.getAllStructures();
    }); */
  }

  ngAfterViewInit(): void {
    if(this.process === Process.copy && this.transactionOutlet === 'sb') {
      this.recordListOption.nativeElement.value = this.recordId;
    }

    if(this.matTabgroup) {
      this.addMatTabChangeEventSubs();
    }


    this.dataControlService.activeForm$.next(
      {
        isPrimary: true,
        moduleId: this.activeDatasetId,
        objnr: null,
        isNew: false,
        referenceRecordDetails: null
      });
  }

  getStepRules() {
    this.processService.getFormRules(this.flowId, this.locale, this.stepId).subscribe((stepRule) => {
      this.stepRules = stepRule;
    });
  }

  addMatTabChangeEventSubs() {
    this.matTabChangeEvent$ = this.matTabgroup.selectedIndexChange.pipe(takeUntil(this.unsubscribeAll$)).subscribe((tabIndex) => {
      this.currentTabIndex = tabIndex;
      this.selectedDatasetIndexChanged(tabIndex);
    });
  }

  copyWithRelatedDatasetsToggle($event) {
    if(!this.matTabChangeEvent$) this.addMatTabChangeEventSubs();
  }

  /**
   * Method to determine the process ....
   */
  defineTheProcess() {
    this.route.url.pipe(take(1)).subscribe((route) =>  {
      const url = route?.map((m) => m.path) || [];
      if(url.indexOf('view') !== -1) {
        this.process = Process.view;
      }else if(url.indexOf('change') !== -1) {
        this.process = Process.change;
      } else if(url.indexOf('approve') !== -1) {
        this.process = Process.approve;
      }else if(url.indexOf('copy') !== -1) {
        this.process = Process.copy;
      }else {
        this.process = Process.create;
      }
    });
  }

  /**
   * get the event id ....
   */
   getEventId(): string {
    const url = this.router.url;
    let processId = ProcessValue.CREATE;
    if(url.indexOf('/view/') !== -1) {
      processId = ProcessValue.SUMMARY;
    }else if(url.indexOf('/change/') !== -1) {
      processId = ProcessValue.CHANGE;
    } else if(url.indexOf('/approve/') !== -1) {
      processId = (this.dataEventId ? this.dataEventId : ProcessValue.APPROVE) as any;
    }

    return processId;
  }

  /**
   * get current module details
   */
   getObjectTypeDetails() {
    this.coreService
      .getObjectTypeDetails(this.moduleId, this.locale)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe(
        (response: any) => {
          this.objectType.objectid = response.moduleid;
          this.objectType.objectdesc = response.description;
          this.objectType.type = response.type || 'SYS';
        },
        (error) => {
          console.error(`Error : ${error.message}`);
        }
      );
  }


  /**
   * close the side sheet
   */
   close() {
    const routerDetails = (this.router as any).currentUrlTree.root.children;
    setTimeout(() => this.transactionService.clearHierarchyDetails(), 100);
    this.router.navigate([{ outlets: { [routerDetails.outer ? 'outer' : 'sb']: null } }], { preserveFragment: true, queryParamsHandling: 'preserve' });
  }

  /**
   * Get Saved payload and child rules
   */
  getMappedRecordAndChildRules() {
    let mappedData: MDORecord = {
      mdoRecordES: this.transactionService.getUpdatedGvs(this.transactionService.getMasterData(true, this.moduleId)?.mdoRecordES),
      controlData: this.transactionService.getMasterData(true, this.moduleId)?.controlData || {},
      childRecord: []
    }
    const childRecordsRules = [];
    this.relatedDatasets.forEach(ds => {
      if(ds.tabType === 'CHILD') {
        const relatedRecords = this.transactionService.getRelatedDatasetMasterData(ds.childDatasetId);
        Object.keys(relatedRecords).forEach((item: any) => {
          if(!relatedRecords[item]?.controlData) relatedRecords[item].controlData = {};
          const controlData = relatedRecords[item]?.controlData;
          controlData.eventId = controlData?.eventId || this.getEventId();
          controlData.strId =  '1';
          controlData.processFlowId = this.flowId;
          controlData.crId = relatedRecords[item].crId;
          controlData.processId = this.processId;
          controlData.taskId = this.taskId;
          controlData.moduleId = ds.childDatasetId;
          controlData.layoutId = ds.layoutId;
          controlData.processFlowContainerId = this.processFlowContainerId || '';
          controlData.recordNumber = this.process !== Process.create ?  item : null;

          const mdoRecordES = this.transactionService.getUpdatedGvs(relatedRecords[item]?.mdoRecordES);
          const rules = this.transactionService.getRuleIdList(ds.childDatasetId);
          mappedData.childRecord.push({
            mdoRecordES,
            controlData,
          });
          childRecordsRules.push({
            mdoRecordES,
            rules,
            moduleId: ds.childDatasetId,
            formId: ds.layoutId,
          });
        });
      }
    });
    console.log('Mapped data ', mappedData);
    // remove nested key from object
    mappedData = this.coreService.removeKeyFromObject(mappedData, 'isChanged');
    mappedData = this.transactionService.removeGvsFieldsWithNoRows(mappedData);
    // const _doc = this.transactionService.getMasterData();
    // _doc.controlData.eventId = _doc.controlData.eventId || 1;
    // _doc.mdoRecordES.strId = _doc.mdoRecordES.strId || '1';
    // _doc.controlData.processFlowId = this.flowId;
    // _doc.controlData.crId = this.crId;
    // _doc.controlData.processId = this.processId;
    // _doc.controlData.taskId = this.taskId;
    // _doc.controlData.layoutId = this.layoutId;
    mappedData.controlData.eventId = mappedData.controlData?.eventId || Number(this.getEventId());
    mappedData.mdoRecordES.strId = mappedData.mdoRecordES.strId || '1';
    mappedData.controlData.processFlowId = this.flowId;
    mappedData.controlData.crId = this.crId;
    mappedData.controlData.processId = this.processId;
    mappedData.controlData.taskId = this.taskId;
    mappedData.controlData.layoutId = this.layoutId;
    mappedData.controlData.processFlowContainerId = this.processFlowContainerId || '';

    return {mappedData, childRecordsRules};
  }


  /**
   * Save the form ...
   */
  save() {
    this.allErrorsLogs = [];
    this.errorMsg = '';
    this.closeErrorSideSheet();
    this.saving = true;
    if(this.isFormValid()) {

      this.errorMsg = '';

      const mappedDataAndChildRules = this.getMappedRecordAndChildRules();
      const mappedData = mappedDataAndChildRules.mappedData;
      const childRecordsRules = mappedDataAndChildRules.childRecordsRules;

      const rules = this.transactionService.getRuleIdList(this.moduleId);
      const mdoRecordES = mappedData?.mdoRecordES;
      const requestDto = {
        rules,
        mdoRecordES,
        childRecord: childRecordsRules,
        formId: this.layoutId,
      };

      if(this.stepRules && this.stepRules.rulesModel && Array.isArray(this.stepRules.rulesModel)) {
        this.stepRules.rulesModel.forEach((rule) => {
          requestDto.rules.push(rule.ruleId);
        });
      }

      console.log('requestDto: ', requestDto);
      this.ruleService.validateRule(this.moduleId, '', requestDto).pipe(finalize(()=> this.saving = false)).subscribe((resp) => {
        if(resp?.status === 'SUCCESS') {
          this.userDetails.getUserDetails().pipe(takeUntil(this.unsubscribeAll$)).subscribe(u=>{
            mappedData.controlData.userId = u.userId;
            mappedData.controlData.tenantId = u.plantCode || '0';
            mappedData.childRecord.forEach((item) => {
              item.controlData.userId = u.userId;
              item.controlData.tenantId = u.plantCode || '0';
            });
            this.coreCrudService.saveObject(this.moduleId, mappedData).subscribe(r=>{
              console.log('saved ...');
              // update the list page once saved ...
              this.sharedService.setRefreshListPage(true);
              this.transiantService.open(`Record created successfully!`, '',{duration:5000});
              this.close();

              // update the task list datatable if the rec for approval
              if(this.process === Process.approve) {
                this.sharedService.setRefreshTaskListDatatable(true);
              }

              // update the channel attribute after saved , once got object number
              try{
                if(this.process === Process.create) {
                  this.updateChannelAttributes(r?.controlData?.recordNumber || 'na');
                }
              }catch(e){
                console.error(`Error while update the attributes`);
                this.saving = false;
              }
            }, err=>{
              this.errorMsg = err?.error?.errorMsg || 'Something went wrong!';
              console.error(`Error : ${err.message}`);
              this.saving = false;
            });
          });
        }else if(resp?.status === 'ERROR') {
          if(!resp.allFieldsLogs && !resp.duplicateRuleResDTO ) this.errorMsg = 'Something went wrong!';
          this.allErrorsLogs = resp?.allFieldsLogs || [];
          if(resp.childs && Array.isArray(resp.childs)) {
            resp.childs.forEach((child: ChildDatasetFieldErrorLog) => {
              if(child.allFieldsLogs && Array.isArray(child.allFieldsLogs))
                child.allFieldsLogs.forEach((item: FieldErrorLog) => {
                  this.allErrorsLogs.push(item);
                })
            })
          }

          if(this.allErrorsLogs.length) {
            this.openErrorSideSheet();
          } else if(resp?.duplicateRuleResDTO?.resultList) {
            this.transactionService.duplicateRecordsDetails.next({
              brId: resp?.duplicateRuleResDTO.ruleId,
              resultList: resp.duplicateRuleResDTO.resultList
            })
            this.hasDuplicateRecords = true;
          }

        }
      });
    }else {
      // API call for Saving form values
      this.saving = false;
      this.openErrorSideSheet();
    }

  }
reject(){
  const mastedData = this.transactionService.getMasterData(true, this.moduleId);
  // const controlData = new ControlData();
  mastedData.controlData.eventId = Number(this.getEventId());
  mastedData.controlData.strId = '1';
  mastedData.controlData.processFlowId = this.flowId;
  // mastedData.controlData.crId = this.crId;
  mastedData.controlData.processId = this.processId;
  mastedData.controlData.taskId = this.taskId;
  // mastedData.controlData.moduleId = this.moduleId;
  // mastedData.controlData.layoutId = this.layoutId;

  mastedData.controlData.processFlowContainerId = this.processFlowContainerId;
  mastedData.controlData.targetUserId = '';

  this.matDialog
      .open(RejectModuleComponent, {
        data: mastedData,
        ...this.dialofConfig,
        disableClose: true,
        autoFocus: false,
        minWidth: '765px',
        panelClass: 'create-master-panel',
      })
      .afterClosed()
      .subscribe((dialogData: any) => {
        if (dialogData && dialogData.status === 'saved') {
          console.log(`Reject successfully ... {}`, dialogData);
          this.close();
        }
      });
}
  /**
   * Method to check form validations
   */
   isFormValid() {
    return this.dataControl.valid;
  }

  /**
   * Open Error Validations
   */
  openErrorSideSheet() {
    this.isErrorExists = true;
    this.drawer.open();
  }

  closeErrorSideSheet() {
    this.isErrorExists = false;
    this.drawer.close();
  }

  navigateToNode(structureId: number) {
    this.router.navigate([],
      {
        relativeTo: this.route,
        queryParams: { ...this.route.snapshot.queryParams, s: structureId },
        queryParamsHandling: 'merge',
      });
  }

  getRelatedDatasets() {
    if(!this.flowId) {
      console.log(`Flow not found continue with form ... ${this.layoutId}`);
      this.getLayoutDetails();
      return;
    }
    console.log('Record number ', this.recordId);
    this.isLoading = true;

    if(this.recordId) {
      forkJoin([this.coreCrudService.getRelatedDatasetsWithCount(this.moduleId,this.recordId, 0, 20, '', this.locale),
        this.listService.getFlowList(this.moduleId, this.getEventId())])
        .pipe(finalize(() => setTimeout(() => this.isLoading = false, 30)))
        .subscribe(resp => {
            const childDatasets = resp[0] || [];
            const flowsList = resp[1] ? resp[1].flows : [] || [];
            this.flow = flowsList.find(f => f.flowId === this.flowId);
            this.stepId = this.flow ? this.flow.stepId : this.stepId;
            if(!!this.stepId) this.getStepRules();

            childDatasets.forEach(ds => {
              const flow = flowsList.find(f => f.flowId === this.flowId);
              if(!flow) {
                return;
              }
              const layoutId = flow.relatedDatasetsForms?.find(d => d.dataSetId === ds.childDatasetId)?.formId;
              const tabIndex = this.relatedDatasets.findIndex((tab) => {
                return (tab.childDatasetId === ds.childDatasetId &&
                        tab.tabId === ds.childDatasetId &&
                        tab.layoutId === layoutId
                  );
              });
              if(tabIndex < 0) {
                this.relatedDatasets.push({
                  childDatasetId: ds.childDatasetId,
                  childDescription: ds.childDescription,
                  layoutId,
                  isDataRef: false,
                  count: ds?.count?.count || 0,
                  tabType: 'CHILD',
                  tabId: ds.childDatasetId
                });
              }
              (this.dataControl.controls.relatedDatasets as FormGroup).addControl(ds.childDatasetId, new FormGroup({}));
            });

            if(this.flow) {
              this.flow.forms.forEach((form) => {
                form.referenceDatasets.forEach((refDS: any) => {
                  this.transactionService.setDatasetRefDetails(form.formId, refDS.referenceDatasetId, refDS);
                });
              });
              this.flow.relatedDatasetsForms.forEach(ds=>{
                const layoutId = this.flow.relatedDatasetsForms?.find(d => d.dataSetId === ds.dataSetId)?.formId;
                const tabIndex = this.relatedDatasets.findIndex((tab) => {
                  return (tab.childDatasetId === ds.dataSetId &&
                          tab.tabId === ds.dataSetId &&
                          tab.layoutId === layoutId
                    );
                });
                if(tabIndex < 0) {
                  this.relatedDatasets.push({
                    childDatasetId: ds.dataSetId,
                    childDescription: ds.datasetDesc,
                    layoutId,
                    isDataRef: false,
                    count: 0,
                    tabType: 'CHILD',
                    tabId: ds.dataSetId
                  });
                  (this.dataControl.controls.relatedDatasets as FormGroup).addControl(ds.dataSetId, new FormGroup({}));
                }

                ds.referenceDatasets.forEach((refDS: any) => {
                  this.transactionService.setDatasetRefDetails(ds.formId, refDS.referenceDatasetId, refDS);
                });
              });

            }
        })

    } else {
      this.listService.getFlowList(this.moduleId, this.getEventId())
      .pipe(finalize(() => setTimeout(() => this.isLoading = false, 30)))
      .subscribe(resp => {
        const res  = resp.flows || [];
        const flow = res?.find(f=> f.flowId === this.flowId);
        this.flow = flow;
        this.stepId = this.flow ? this.flow.stepId : '';
        if(!!this.stepId) this.getStepRules();
        if(flow) {
          flow.forms.forEach((form) => {
            form.referenceDatasets.forEach((refDS: any) => {
              this.transactionService.setDatasetRefDetails(form.formId, refDS.referenceDatasetId, refDS);
            });
          });
          flow.relatedDatasetsForms.forEach(ds=>{
            const layoutId = flow.relatedDatasetsForms?.find(d => d.dataSetId === ds.dataSetId)?.formId;
            this.relatedDatasets.push({
              childDatasetId: ds.dataSetId,
              childDescription: ds.datasetDesc,
              layoutId,
              isDataRef: false,
              count: 0,
              tabType: 'CHILD',
              tabId: ds.dataSetId
            });
            (this.dataControl.controls.relatedDatasets as FormGroup).addControl(ds.dataSetId, new FormGroup({}));

            ds.referenceDatasets.forEach((refDS: any) => {
              this.transactionService.setDatasetRefDetails(ds.formId, refDS.referenceDatasetId, refDS);
            });
          });

        }
      })
    }

  }

  get selectedDatasetIndex() {
    if(!this.activeDatasetId) return 0;
    if(this.activeDatasetId === this.moduleId) return 0;
    else if (this.relatedDatasets?.length) {
      const index = this.relatedDatasets.findIndex(dataset => dataset.tabId === this.activeTabId);
      return (index > -1) ? (index + 1) : 0;
    }
  }

  getNewOutletRoute(activeTabId: string, outletName: string, tabIndex: number = 0): string {
    const currentOutletRouteArray = this.getSegmentRoute(outletName);
    let index;
    if(this.process === Process.approve){
      index =  currentOutletRouteArray.length - 5;
    }else {
      index = currentOutletRouteArray.length - 4;
    }

    currentOutletRouteArray[index] = activeTabId;

    const recordTypeIndex = currentOutletRouteArray.findIndex((path) => path === 'parent' || path === 'child');

    if(recordTypeIndex > 0) {
      currentOutletRouteArray[recordTypeIndex] = tabIndex === 0 ? 'parent' : 'child';
    }
    return currentOutletRouteArray.join('/');
  }

  selectedDatasetIndexChanged(index) {
    const tabId = (index === 0) ? this.moduleId : this.relatedDatasets[index-1]?.tabId;
    if(tabId) {
      this.isLoading = true;
      setTimeout(() => this.isLoading = false, 10);

      if(this.transactionOutlet === 'sb') {
        const newSbRoute = this.getNewOutletRoute(tabId, 'sb', index);
        this.router.navigate(
          [{
            outlets: {
              sb: newSbRoute
            }
          }],
          { queryParamsHandling: 'merge', preserveFragment: true });
        }else if(this.transactionOutlet === 'outer') {
          const sbRoute = this.getSegmentRoute('sb');
          const newOuterRoute = this.getNewOutletRoute(tabId, 'outer', index);
          console.log('newOuterRoute: ', newOuterRoute);
          this.router.navigate(
            [{
              outlets: {
                sb: sbRoute,
                outer: newOuterRoute
              }
            }],
            { queryParamsHandling: 'merge', preserveFragment: true });
          }

      }
  }

  get activeLayoutId() {
    if(this.activeDatasetId === this.moduleId) {
      return this.layoutId;
    } else {
      const dataset = this.relatedDatasets.find(ds => ds.tabId === this.activeTabId);
      return dataset?.layoutId || null;
    }
  }

  /**
   * Add the tab into view port ...
   * @param tab the tab which will going to add on view port ...
   */
  addTabToViewPort(tab) {
    const idx = this.relatedDatasets.findIndex(f => f.childDatasetId === tab.childDatasetId);
    this.relatedDatasets.splice(idx,1);
    const lastTabIdx = this.possibleTabs - 2 ;
    this.relatedDatasets.splice(lastTabIdx, 0 , tab);
    this.selectedDatasetIndexChanged(lastTabIdx+1);
  }

  get possibleTabs() {
    let maxAllowedTabs = 2;
    if(this.datasetsTabsHeaders) {
      maxAllowedTabs =  Math.trunc((this.datasetsTabsHeaders.nativeElement.offsetWidth - 36) / 200);
    }
    return maxAllowedTabs;
  }

  /**
   * Toggle to open and close the chat window
   */
  toggleChatWindow() {
    this.isChatEnabled = !this.isChatEnabled;
    if(this.isChatEnabled) {
      this.chatPanel.open();
    } else {
      this.chatPanel.close();
    }
    console.log('Chat window is ', this.isChatEnabled);
  }

  getLayoutDetails(): void {
      this.coreService
        .getDatasetFormDetail(this.moduleId, this.layoutId)
        .pipe(take(1))
        .subscribe((resp: DatasetForm) => {
          const formData = {
            flowId : '',
            flowDesc: resp.description,
            forms: [],
          }
          this.flow = formData;
        }, error => {
          console.error(`Error:: ${error.errorMsg}`);
      });
    }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.transactionService.resetTransactioinService();
    this.dataControlService.activeForm$.next(null);
    this.unsubscribeAll$.unsubscribe();
    this.serviceInstanceSharing.resetServiceInstances();
    this.matTabChangeEvent$ = null;

    if(this.process !== Process.copy) {
      this.sharedService.copiedMDORecord.next(null);
    }
  }

  openDuplicateRecordsList() {
    const brId = this.transactionService.duplicateRecordsDetails.getValue()?.brId;
    if(!brId) {
      console.error('brId is required ! ', brId);
      return;
    }
    this.router.navigate([{ outlets: { sb: [...(this.router as any).currentUrlTree.root.children.sb.segments.map(m=> m.path)],
      outer: `outer/transaction/${this.moduleId}/duplicate-datatable/${brId}` } }],
      { queryParamsHandling: 'merge', preserveFragment: true });
  }

  removeRecordFromCopiedRecord(mappedData: any) {
    return {
      ...mappedData,
      controlData: {
        ...mappedData.controlData,
        recordNumber: '',
      }
    }
  }


  resetRecordNumbers(obj, key) {
    for (const i in obj) {
      if (!obj.hasOwnProperty(i)) continue;
      if (typeof obj[i] === 'object') {
        this.resetRecordNumbers(obj[i], key);
      } else if (i === key) {
        obj[key] = '';
      }
    }
    return obj;
  }

  setRandomUUID(obj, key) {
    for (const i in obj) {
      if (!obj.hasOwnProperty(i)) continue;
      if (i === key) {
        obj[key] =  {
          fId: "UUID",
          vc: [
              {
                  c: this.utilityService.getRandomString(12),
                  t: null
              }
          ],
          oc: null,
          bc: null,
          ls: null,
          mdoRecord: null
        };
      }
      if (typeof obj[i] === 'object' && i !== key) {
        this.setRandomUUID(obj[i], key);
      }
    }
    return obj;
  }

  removeUnselectedFieldsFromCopiedRecord(record) {
    for (const i in record) {
      if(typeof record?.[i] === 'object' && record[i]?.hasOwnProperty('isCopied') && !record?.[i]?.isCopied) {
        if(!Array.isArray(record))
          delete record[i];
        else {
          record = record.splice(Number(i) , 1);
        }
      }else if(typeof record?.[i] === 'object') {
        this.removeUnselectedFieldsFromCopiedRecord(record[i]);
      }
    }
    return record;
  }
  /**
   * Initiate the copy record
   * It should emit the selected subset of fields of the current record
   * Open the new record creation with the emitted fields values pre-populated
   */
   copyRecord() {

    if(this.transactionOutlet === 'sb') {
      let masterData = this.transactionService.getMasterData();
      masterData = this.removeUnselectedFieldsFromCopiedRecord(masterData);
      masterData = this.coreService.removeKeyFromObject(masterData, 'isCopied');
      masterData = this.resetRecordNumbers(masterData, 'recordNumber');
      masterData = this.setRandomUUID(masterData, 'UUID');
      console.log('Sent Copied MDORecord: ', masterData);
      this.sharedService.copiedMDORecord.next(masterData);
      this.router.navigate([{
        outlets: { sb: [
          ...(this.router as any).currentUrlTree.root.children.sb.segments.map(m=> {
            let path = m.path;

            switch(m.path) {
              case 'copy':
                path = 'create';
                break;
              case this.recordId:
                path = 'new';
                break;
              default:
                path = m.path;
            }
            return path;
          })
        ]}}]);
    }
    else if(this.transactionOutlet === 'outer') {
      this.transitenService.confirm(
        {
          data: { dialogTitle: 'Confirmation', label: `Data for the new request will get over-written by the data from the copied record.\nPlease confirm to continue.` },
          disableClose: true,
          autoFocus: false,
          width: '700px',
          panelClass: 'create-master-panel'
        },
        (response) => {
          if ('yes' === response) {
          let masterData = this.transactionService.getMasterData();
          masterData = this.removeUnselectedFieldsFromCopiedRecord(masterData);
          masterData = this.coreService.removeKeyFromObject(masterData, 'isCopied');
          masterData = this.resetRecordNumbers(masterData, 'recordNumber');
          masterData = this.setRandomUUID(masterData, 'UUID');
          console.log('Sent Copied MDORecord: ', masterData);
          this.sharedService.copiedMDORecord.next(masterData);
          this.router.navigate([{
            outlets: {
              sb: this.getSegmentRoute('sb'),
              outer: null
            }
          }])
        }
      });
    }
   }

   getRecordList(str: string): void {

    const request: FilterCriteria = new FilterCriteria();
    const parentModuleId = this.transactionService.parentDatasetIdSub.getValue();
    // request.fieldId = refObjFld?.fieldId;
    request.esFieldPath = `hdvs.${request.fieldId}`;
    request.operator = 'CONTAINS';
    request.values = [str];

    this.listService.getTableData(parentModuleId, '', 1, [request] as any, '').subscribe(res => {
      this.recordOptionList = of(res);
    }, error => {
      console.error(`Error : ${error.message}`);
    });
   }

   getSegmentRoute(outlet: string) {
    return [...(this.router as any)?.currentUrlTree?.root?.children?.[outlet]?.segments?.map(m => m.path) || ''];
   }

   copyRecordSelected($event) {
     const recordId = $event?.option?.value?.id;

     this.dataControl = new FormGroup({
       primary: new FormGroup({}),
       relatedDatasets: new FormGroup({})
     });

     this.transactionService.resetTransactioinService();

     if(recordId) {
        const sbRoute = this.getSegmentRoute('sb');
        let outerRoute  = this.getSegmentRoute('outer');

        const index = outerRoute.findIndex((i) => i === this.recordId);

        if(index > -1) outerRoute[index] = recordId;

        this.router.navigate([{
          outlets: {
            sb: sbRoute,
            outer: outerRoute
          }
        }]);

     }
   }

   openCopyRecordSS() {
     const parentModuleId = this.transactionService.parentDatasetIdSub.getValue();

     const currentSbRoute = this.getSegmentRoute('sb');

     this.router.navigate([{
       outlets: {
         sb: currentSbRoute,
         outer: `outer/transaction/${parentModuleId}/copy/${this.flowId}/${this.layoutId}/${parentModuleId}/undefined/${parentModuleId}/all/all/parent`
       }
     }],
    {
      queryParamsHandling: 'preserve',
      preserveFragment: true
    }
    )
   }

   /**
   * get display value for autocomplete
   * @param value pass the selected value Object
   * @returns the field label
   */
  formatValue(value: ListValue): string {
    if (value) {
      return value.text || value.id;
    }
  }


  /**
   * Once the record saved , update the chat attribute ... to access for MD5 HASH
   */
  updateChannelAttributes(recordNumber: string) {
    this.chatStore.select(getChannelId).pipe(takeUntil(this.unsubscribeAll$)).subscribe(r=>{
      if(r) {
        let payload: ChannelIdrequest = {
          pageId: 'na',
          moduleId: this.moduleId,
          recordId: recordNumber || 'na',
          crId: this.crId || 'na',
          schemaId: 'na',
          massId: 'na',
        };

        for (let prop = 0; prop < 10; prop++) {
          payload[`customProp${prop + 1}`] = 'na';
        }

        payload.channelId = r;

        if(this.process === Process.create) {
          this.chatService.updateChannelAttribute(payload).subscribe(s=>{
            console.log(`Saved the channel attribute `);
          },err=> console.error(`Error : ${err?.error?.message}`));
        }

      }
    });
  }

}
