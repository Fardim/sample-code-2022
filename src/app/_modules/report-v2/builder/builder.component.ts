import { findIndex } from 'lodash';
import { Component, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportService } from '../_service/report.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { GlobaldialogService } from '@services/globaldialog.service';
import { forkJoin, Subscription, Subject } from 'rxjs';
import { UserService } from '@services/user/userservice.service';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { BuilderContainerComponent } from './builder-container/builder-container.component';
import { ChartType, Report, ReportDashboardReq, Widget, WidgetType } from '../_models/widget';
import { TransientService } from 'mdo-ui-library';
import { ObjectTypeResponse } from '@models/schema/schema';
import { SchemaService } from '@services/home/schema.service';
import { DuplicateReportComponent } from '@modules/report/view/duplicate-report/duplicate-report.component';
import { ExportComponent } from '@modules/report/view/export/export.component';
import { AggregationOperator } from '@modules/report/_models/widget';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { PackageType, PublishPackage, PublishToConnekthubComponent, CancelPublishComponent } from '@modules/connekthub';
import { WidgetService } from '@services/widgets/widget.service';
import { CoreService } from '@services/core/core.service';

@Component({
  selector: 'pros-builder',
  templateUrl: './builder.component.html',
  styleUrls: ['./builder.component.scss'],
})
export class BuilderComponent implements OnInit, OnDestroy {
  @ViewChild(BuilderContainerComponent) builderContainerComponent: BuilderContainerComponent;

  reportId: number;
  report: Report;
  emitClearBtnEvent: boolean;
  showClearFilterBtn = false;
  collaboratorEditPermission: boolean;
  collaboratorDeletePermission: boolean;
  collaboratorAdminPermission: boolean;
  reportExist = true;
  isClearBtnClicked = false;
  isDiscard = false;
  isNewReportProcessing = false;
  cancelMode = false;
  deleteFromNavBar = false;
  /**
   * Hold the error status code ...
   */
   errStatusCode: number;

  /**
   * If is from msteam then don't need edit and delete ..
   */
  isFromMsteam = false;

  // subscriptions: Subscription[] = [];

  private readonly dialofConfig = {
    disableClose: true,
    width: '600px',
    minHeight: '250px',
  };
  editedMode: boolean;
  activeWidget: Widget;
  showPropertyPanel: boolean;
  dataSets: ObjectTypeResponse[];
  customDataSets: ObjectTypeResponse[];
  diwDataSets: ObjectTypeResponse[];
  isBluckProcessing = false;
  noRefreshValue = false;
  /** Update widget from V1 to V2 */
  updateAll: boolean;
  // added regex for dashboar/report name validation
  regex = /^[^*|\":<>[\]{}`\\()';?$]+$/;
  exportChkSuccessful: boolean;
  fetchCount = 0;
  isSavingBulkReport = true;
  apiQueueArr = [];

  //Variable For Storing Widget Data
  storeWidgetData: any;
  public unsubscribe$ = new Subject();

  constructor(
    public activatedRouter: ActivatedRoute,
    public reportService: ReportService,
    private snackbar: MatSnackBar,
    private sharedService: SharedServiceService,
    private router: Router,
    private globalDialogService: GlobaldialogService,
    private userService: UserService,
    private matDialog: MatDialog,
    private transientService: TransientService,
    private schemaService: SchemaService,
    private location: Location,
    private toasterService: TransientService,
    private widgetService: WidgetService,
    private coreService : CoreService,
    @Inject(LOCALE_ID) public locale: string
  ) { }

  // show popup in case of new report and going to other view route
  canDeactivate(): boolean {
    if (this.isNewReportProcessing && !this.cancelMode) {
      this.globalDialogService.confirm(
        {
          label: 'Are you sure do not want to save the dashboard?\nAction cannot be undone. Click Yes to proceed.'
        },
        (response) => {
          if (response && response === 'yes') {
            this.isNewReportProcessing = false;
            this.deleteHandler();
            return true;
          } else {
            return false;
          }
        }
      );
    } else {
      return true;
    }
  }

  ngOnDestroy(): void {
    // if(this.subscriptions) {
    //   this.subscriptions.forEach((sub) => {
    //     if(sub) {
    //       sub.unsubscribe();
    //     }
    //   });
    // }
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    this.activatedRouter.url.pipe(takeUntil(this.unsubscribe$)).subscribe((urlSegment) => {
      console.log('URL:', urlSegment);
      if (urlSegment[0].path === 'edit') {
        // for new file creation
        if (urlSegment[2] && urlSegment[2].path === 'new') {
          this.isNewReportProcessing = true;
          this.deleteFromNavBar = false;
        }
        this.setEditedMode(true);
      } else {
        this.setEditedMode(false);
      }
    });

    this.activatedRouter.params.pipe(takeUntil(this.unsubscribe$)).subscribe((params) => {
      console.log('params', params);

      this.reportId = params.id;
      if (params.id === 'new') {
        this.reportExist = false;
      } else if (this.reportId) {
        this.emitClearBtnEvent = false;
        this.showClearFilterBtn = false;
        this.reportExist = true;
        this.getReport(this.reportId);
      }
    });

    this.activatedRouter.queryParams.pipe(takeUntil(this.unsubscribe$)).subscribe(p=>{
      this.errStatusCode = p.e ? p.e : '';
    });

    this.reportService.deleteFromNavBar().pipe(takeUntil(this.unsubscribe$)).subscribe((res) => {
      if (this.isNewReportProcessing && res) {
        this.deleteFromNavBar = true;
        this.reportService.deleteReport(this.reportId.toString()).subscribe(() => {
          this.isNewReportProcessing = false;
        });
      }
    });
    // const isFrmMsteam = this.sharedService.getIsFromMsTeamLogedIn().subscribe((res) => {
    //   this.isFromMsteam = res;
    // });
    this.isFromMsteam = this.router.url.indexOf('/nonav/report') !== -1 ? true : false;

    this.widgetService.disableSave().subscribe(response => {
      this.isBluckProcessing = response;
    });

    // call when table list configure is saved to get new report data
    this.sharedService.onTableListConfigureSaved().subscribe(() => {
      this.getReport(this.reportId);
    })
  }

  /**
   * Get Report
   */
  getReport(reportId: number) {
    // const usub = this.userService.getUserDetails().pipe(distinctUntilChanged()).subscribe(user => {
    //   const repInfo = this.reportService.getReportInfo(reportId, user.plantCode).subscribe(res => {
    //     this.collaboratorEditPermission = res.permissons ? res.permissons.isEditable : false;
    //     this.collaboratorDeletePermission = res.permissons ? res.permissons.isDeleteable : false;
    //     this.collaboratorAdminPermission = res.permissons ? res.permissons.isAdmin : false;
    //   }, error => {
    //     console.log(`Error ${error}`);
    //   });
    //   this.subscriptions.push(repInfo);
    // });
    // this.subscriptions.push(usub);

    this.reportService.getReport(reportId, this.isFromMsteam).pipe(takeUntil(this.unsubscribe$)).subscribe(
      (report) => {
        this.collaboratorEditPermission = report.permissons ? report.permissons.isEditable : false;
        this.collaboratorDeletePermission = report.permissons ? report.permissons.isDeleteable : false;
        this.collaboratorAdminPermission = report.permissons ? report.permissons.isAdmin : false;
        this.setReport(report);
      },
      (error) => {
        this.errStatusCode = error?.status || 500;
        this.reportExist = false;
        console.log(`Error ${error}`);
      }
    );
  }

  setReport(report: Report) {
    report.reportId = report.reportIdStr ? report.reportIdStr : this.reportId;
    if (report.widgetReqList) {
      report.widgetReqList.forEach((widget) => {
        if (!widget.cols && !widget.rows && widget.width && widget.height) {
          // V1 to V2: 200 = noOfboxes, 10 = minCols of GridsterConfig
          widget.cols = Math.round((widget.width / 200) * 10);
          widget.rows = Math.round((widget.height / 200) * 10);
          widget.x = Math.round((widget.x / 200) * 10);
          widget.y = Math.round((widget.y / 200) * 10);
          this.updateAll = true;
        }
        if (widget.chartProperties && widget.widgetType === WidgetType.BAR_CHART && widget.chartProperties.chartType === ChartType.PIE) {
          widget.widgetType = WidgetType.PIE_CHART;
        } else if (
          widget.chartProperties &&
          widget.widgetType === WidgetType.PIE_CHART &&
          widget.chartProperties.chartType === ChartType.BAR
        ) {
          widget.widgetType = WidgetType.BAR_CHART;
        }
      });
      report.widgets = report.widgetReqList;
    }
    this.report = report;
    if (this.activeWidget) {
      this.setActiveWidget(this.report.widgets.find((w) => w.widgetId.toString() === this.activeWidget.widgetId.toString()));
    }
    if (!this.editedMode && this.report.hasDraft && !(this.isFromMsteam)) {
      this.editReport();
    }
  }

  setActiveWidget(widget: Widget) {
    this.activeWidget = widget;
  }

  clearFilters() {
    this.emitClearBtnEvent = true;
    this.isClearBtnClicked = true;
  }

  showClearBtnEmit(isTrue: boolean) {
    this.showClearFilterBtn = isTrue;
    this.emitClearBtnEvent = isTrue ? false : true;
  }
  // To delete from delete button
  deleteReport(msg: string = '') {
    this.globalDialogService.confirm({ label: msg === '' ? 'Are you sure to delete ?' : msg }, (response) => {
      if (response && response === 'yes') {
        if (this.deleteHandler()) {
          this.isNewReportProcessing = false;
        }
      }
    });
  }
  // Handler function for deletion
  deleteHandler() {
    this.reportService.deleteReport(this.reportId.toString()).subscribe(
      (res) => {
        if (res) {
          this.sharedService.setReportListData(false, true);

          this.snackbar.open(`Successfully Deleted`, 'Close', { duration: 3000 });

          return true;
        }
      },
      (err) => console.error(`Error: ${err}`)
    );
    return false;
  }

  editReport() {
    this.sharedService.setTogglePrimaryEmit();
    const url = this.router.createUrlTree(['../../edit', this.reportId.toString()], { relativeTo: this.activatedRouter }).toString();
    this.location.go(url);
    this.setEditedMode(true);
    this.showPropertyPanel = false;
  }

  viewReport() {
    this.sharedService.setTogglePrimaryEmit();
    const url = this.router.createUrlTree(['../../view', this.reportId.toString()], { relativeTo: this.activatedRouter }).toString();
    this.location.go(url);
    this.setEditedMode(false);
  }

  setEditedMode(editedMode: boolean) {
    this.editedMode = editedMode;
    if (this.editedMode) {
      if (!this.dataSets) {
        this.getAllObjectType();
      }
      // if (!this.customDataSets) {
      //   this.getCustomObjectType();
      // }
      if (!this.diwDataSets) {
        this.getDIWDataset();
      }
    } else {
    }
  }

  duplicateReport() {
    this.matDialog.open(DuplicateReportComponent, {
      data: {
        reportName: this.report.reportName,
        reportId: this.reportId,
      },
      ...this.dialofConfig,
    });
  }

  exportReport() {
    this.matDialog.open(ExportComponent, {
      data: {
        reportName: this.report.reportName,
        reportId: this.reportId,
      },
      ...this.dialofConfig,
      minHeight: '150px',
    });
  }

  publishToLibrary() {
    const publishPackage: PublishPackage = {
      id: this.report.reportId,
      name: this.report.reportName || '',
      brief: this.report.reportDesciption || '',
      type: PackageType.DASHBOARD
    };
    this.matDialog.open(PublishToConnekthubComponent, {
      data: publishPackage,
      ...this.dialofConfig,
      disableClose: true,
      autoFocus: false,
      minWidth: '765px',
      panelClass: 'create-master-panel'
    }).afterClosed().subscribe((dialogData: any) => {
      if (dialogData.successfully) {
        this.exportChkSuccessful = true;
      }
      if (dialogData.returnId) {
        this.report.chkPackageId = dialogData.returnId;
      }
    })
  }

  cancelPublish() {
    if (this.report.chkPackageId) {
      this.matDialog.open(CancelPublishComponent, {
        data: {
          chkPackageId: this.report.chkPackageId,
          type: PackageType.DASHBOARD
        },
        ...this.dialofConfig,
        disableClose: true,
        autoFocus: false,
        minWidth: '765px',
        panelClass: 'create-master-panel'
      }).afterClosed().subscribe((dialogData: any) => {
        if (dialogData.successfully) {
          this.widgetService.updatepackageId(this.report.reportId, null).pipe().subscribe(report => {
            this.report.chkPackageId = null;
          });
        }
      })
    }
  }

  /*
    Open Sidesheet for Send email
  */
  openSendEmailSideSheet() {
    this.router.navigate(['', { outlets: { sb: `sb/report/send-email/` + this.reportId } }], { queryParamsHandling: 'preserve' });
  }

  /**
   * method to navigate on import log page
   */
  importLog() {
    this.router.navigate([{ outlets: { sb: 'sb/report/import-log/' + this.reportId } }],{ queryParamsHandling: 'preserve' });
  }

  setPanel(value: boolean) {
    this.showPropertyPanel = value;
    this.builderContainerComponent.resizeGridster();
    if (!this.showPropertyPanel) {
      this.setActiveWidget(undefined);
    }
  }

  discardReport() {
    if (this.report.hasDraft) {
      this.isBluckProcessing = true;
      this.reportService.discardDraftReport(this.reportId).subscribe((res) => {
        this.getReport(this.reportId);
        this.isDiscard = true;
      }, error => {}, () => this.isBluckProcessing = false);
    }
  }

  saveReport() {
    if (!this.report.hasDraft) {
      // When user edits the report and he don't want to change anything then he should be able to save the report.
      this.viewReport();
      return;
    }
    // this.reportName.markAsTouched()

    // if (this.widgetList.length <= 0) {
    //   this.toasterService.open(`Please configure at least one widget`, 'Close', { duration: 2000 });
    //   return false;
    // }

    // for (const widget of this.widgetList) {
    //   if (widget.widgetType === WidgetType.TABLE_LIST) {
    //     const setDatesetError = () => {
    //       this.datasetCtrl.setErrors(Validators.required);
    //       this.datasetCtrl.markAsTouched({ onlySelf: true });
    //     };
    //     const setColumnsError = () => {
    //       this.fieldCtrl.setErrors(Validators.required);
    //       this.fieldCtrl.markAsTouched({ onlySelf: true });
    //     };

    //     if (!widget.objectType && (!widget.widgetTableFields || widget.widgetTableFields.length === 0)) {
    //       this.toasterService.open(`Highlighted fields can’t be empty`, 'Close', { duration: 2000 });
    //       this.showStyle(widget);
    //       this.ref.detectChanges(); // This is needed if the right sidebar is close
    //       setDatesetError();
    //       setColumnsError();
    //       return false;
    //     }

    //     if (!widget.objectType) {
    //       this.toasterService.open(`Highlighted fields can’t be empty`, 'Close', { duration: 2000 });
    //       this.showStyle(widget);
    //       this.ref.detectChanges(); // This is needed if the right sidebar is close
    //       setDatesetError();
    //       return false;
    //     }

    //     if (!widget.widgetTableFields || widget.widgetTableFields.length === 0) {
    //       this.toasterService.open(`Highlighted fields can’t be empty`, 'Close', { duration: 2000 });
    //       this.showStyle(widget);
    //       this.ref.detectChanges(); // This is needed if the right sidebar is close
    //       setColumnsError();
    //       return false;
    //     }
    //   }
    // }

    let report = this.getRequest();
    if (report.reportName === undefined || report.reportName.trim() === '') {
      this.toasterService.open(`Please enter the report name`, 'Close', { duration: 2000 });
      return false;
    }
    if (!report.widgetReqList?.length && (report.reportName === '' || !this.regex.test(report.reportName))) {
      this.toasterService.open(`Please enter correct report name`, 'Close', { duration: 2000 });
      return;
    }
    let invalidWidgetValue = false;
    const invalidWidgetNames = [];
    report.widgetReqList?.forEach((w) => {
      invalidWidgetValue = this.checkWidgetValidation(w);
      if(invalidWidgetValue){
        invalidWidgetNames.push(w.widgetTitle);
      }
    });
    if (invalidWidgetNames.length) {
      this.transientService.open(`Please fill in the mandatory fields for ${invalidWidgetNames[0]}`, 'Close', { duration: 5000 });
      return;
    }
    if (report.widgetReqList) {
      const reportData = report.widgetReqList.filter((rep) => rep.widgetType === WidgetType.COUNT);
      const isError = reportData.some((rep) => {
        if (
          rep.widgetType === WidgetType.COUNT &&
          rep.aggregrationOp &&
          rep.aggregrationOp !== AggregationOperator.COUNT &&
          !(rep.fieldCtrl && (rep.fieldCtrl.dataType === 'NUMC' || rep.fieldCtrl.dataType === 'DEC'))
        ) {
          return true;
        }
      });
      if (isError) {
        return;
      }
    }

    this.isBluckProcessing = true;
    this.reportService.saveReport(this.reportId, report).pipe(takeUntil(this.unsubscribe$)).subscribe(
        (res) => {
          if(res) {
            this.sharedService.setReportListData(false,this.editedMode);
            this.viewReport();
            this.isNewReportProcessing = false;
            this.transientService.open(`Successfully saved change(s)`, 'Close', { duration: 3000 });
            this.setActiveWidget(undefined);
            this.getReport(this.reportId);
          } else {
            this.transientService.open(`Something went wrong`, 'Close', { duration: 5000 });
          }
        },
        (errro) => {
          this.transientService.open(`Something went wrong`, 'Close', { duration: 5000 });
        }, () => this.isBluckProcessing = false
      );
  }

  saveDraftQueue(apiQueueArr){
    forkJoin(apiQueueArr).pipe(takeUntil(this.unsubscribe$)).subscribe(
      (report: Array<Report>) => {
        if(this.noRefreshValue){
          this.report.hasDraft = report[report.length-1].hasDraft;
        }
        this.isDiscard = false;
        this.isSavingBulkReport = true;
      },
      (errro)=>{
        this.isSavingBulkReport = true;
        this.transientService.open('Something went wrong','Close',{duration:5000});
      },
      ()=>(this.isBluckProcessing = false)
    );
  }

  saveDraft(request: ReportDashboardReq) {
    this.isBluckProcessing = true;

    const report1 = this.getRequest();
    request = JSON.parse(JSON.stringify(request));
    if (this.updateAll || this.report.hasDraft === false) {
      this.report.widgets.forEach((widget) => {
        if (
          request.widgetReqList &&
          request.widgetReqList.length > 0 &&
          !request.widgetReqList.some((w) => w.widgetId.toString() === widget.widgetId.toString())
        ) {
          request.widgetReqList.push(widget);
        }
      });
      this.updateAll = false;
    }
    let noRefresh = false;
    if (request.noRefresh) {
      noRefresh = true;
      delete request.noRefresh;
    }
    request.widgetReqList.forEach(wid => {
      if (wid.widgetType === WidgetType.PIE_CHART || (wid.chartProperties && wid.chartProperties.chartType === ChartType.PIE)) {
        wid.widgetType = WidgetType.BAR_CHART;
      }
    });

    //response template
    this.storeWidgetData = {
      chkPackageId:null,
      createdAt:null,
      createdBy:null,
      fromES:null,
      hasDraft:true,
      permissions:null,
      plantCode:null,
      reportId:request.reportId,
      reportIdStr:null,
      reportName : request.reportName,
      updatedAt:null,
      widgetReqList : report1.widgetReqList,
      widgets : null
    }

    //variable for storing widgets temporarily
    let tempStore = [];
    this.storeWidgetData.widgetReqList.forEach((ele)=>{
      tempStore.push(ele);
    })

    let index=this.findWidgetIdIndex(this.storeWidgetData,request);
    if(index !== -1){
      tempStore[index] = request.widgetReqList[0];
    } else{

      if(request.widgetReqList.length !== 0){
        tempStore.push(request.widgetReqList[0]);
      }

    }
    this.storeWidgetData.widgetReqList = tempStore
    this.setReport(this.storeWidgetData);
    if(!this.isSavingBulkReport) {
      this.noRefreshValue = noRefresh;
      const apiOb = this.reportService.saveDraft(this.reportId,request);
      this.apiQueueArr.push(apiOb);
      return;
    }
    this.isSavingBulkReport = false;

    this.reportService.saveDraft(this.reportId, request).pipe(takeUntil(this.unsubscribe$)).subscribe(
      (report) => {
        if (noRefresh) {
          this.report.hasDraft = report.hasDraft;
        }
        this.isDiscard = false;
        this.isSavingBulkReport = true;
        if(this.apiQueueArr.length){
          this.saveDraftQueue(this.apiQueueArr);
          this.apiQueueArr = [];
        }
      },
      (errro) => {
        this.isSavingBulkReport = true;
        this.transientService.open(`Something went wrong`, 'Close', { duration: 5000 });
      },
      () => (this.isBluckProcessing = false)
    );
    // this.setReport(this.JSONBulk);
  }

//Finds index of widgets in widgetReqList
  findWidgetIdIndex(res,request)
  {
    let ans = res.widgetReqList.findIndex((ele)=> ele.widgetId == request.widgetReqList[0].widgetId);
    return ans;
  }

  checkWidgetValidation(w) {
    let invalidWidgetValue = false;
    if (w.widgetType !== WidgetType.HTML && w.widgetType !== WidgetType.IMAGE) {
      if (w.widgetTitle === '' || !this.regex.test(w.widgetTitle)) {
        invalidWidgetValue = true;
      }
      if (w.objectType !== undefined && w.objectType === null) {
        invalidWidgetValue = true;
      }
      if (w.isStepwiseSLA && (!w.workflowPath || (w.workflowPath && w.workflowPath.length !== 1))) {
        invalidWidgetValue = true;
      }
      if (w.aggregrationOp !== undefined && w.aggregrationOp === null && (w.widgetType === 'BAR_CHART' ||
      w.widgetType === 'PIE_CHART' ||
      w.widgetType === 'STACKED_BAR_CHART' ||
      w.widgetType === 'TIMESERIES' ||
      (w.widgetType === 'COUNT' && w.datasetType !== 'diw_dataset'))) {
        invalidWidgetValue = true;
      }
    }
    return invalidWidgetValue;
  }

  getRequest(): ReportDashboardReq {
    const request: ReportDashboardReq = new ReportDashboardReq();
    request.reportId = this.reportId;
    request.reportName = this.report.reportName;
    request.reportDesciption = this.report.reportDesciption;
    request.widgetReqList = this.report.widgets;
    return request;
  }

  getAllObjectType() {
    /**
     * i.e. Get datasets params for ('',0,20,this.locale,[])
     * Searchstring ''
     * page 0
     * pageSize 20
     * language locale
     * moduleIds []
     */
    this.coreService.getDataSets('',0,20,this.locale,[]).pipe(takeUntil(this.unsubscribe$)).subscribe(
        (res : any) => {
          this.dataSets = res;
        },
        (error) => console.error(`Error: ${error}`)
      );
  }

  getCustomObjectType() {
    this.reportService.getCustomData().pipe(takeUntil(this.unsubscribe$)).subscribe(
      (res) => {
        this.customDataSets = res;
      },
      (error) => console.error(`Error: ${error}`)
    );
  }

  getDIWDataset() {
    const payload = {
      from: 0,
      schemaCriteria: [],
      searchString: "",
      size: 20,
      sort: {}
    }
    this.schemaService.getDiwDataset(payload).pipe(takeUntil(this.unsubscribe$)).subscribe((res)=>{
      if(res)
        this.diwDataSets = res;
      },
      (error) => console.error(`Error: ${error}`)
    );
  }

  // navigate to create new report page
  navigateToCreateNew() {
    this.isNewReportProcessing = true;
    this.userService
      .getUserDetails()
      .pipe(takeUntil(this.unsubscribe$), distinctUntilChanged())
      .subscribe((user) => {
        const request: ReportDashboardReq = new ReportDashboardReq();
        request.reportId = '';
        request.reportName = 'Untitled';
        request.widgetReqList = [];
        this.reportService.createUpdateReport(request, user.plantCode).pipe(takeUntil(this.unsubscribe$)).subscribe((res) => {
          this.router.navigate([`home/report/edit/${res}/new`]);
        });
      });
  }

  cancelReport() {
    if (this.isNewReportProcessing) {
      this.deleteReport('Are you sure want to continue without saving the changes.');
      this.cancelMode = true;
      // this.isNewReportProcessing = false;
    } else {
      this.globalDialogService.confirm({ label: 'Are you sure want to continue without saving the changes.' }, (response) => {
        if (response && response === 'yes') {
          if (this.report.hasDraft) {
            this.viewReport();
            this.report.widgets = [];
            this.discardReport();
          } else {
            this.viewReport();
          }
        }
      });
    }
  }

  @HostListener('window:load', ['$event'])
  public onLoad(event) {
    this.activatedRouter.url.pipe(takeUntil(this.unsubscribe$)).subscribe((urlSegment) => {
      if (urlSegment[0].path === 'edit') {
        if (urlSegment[2].path === 'new') {
          this.isNewReportProcessing = true;
          this.deleteFromNavBar = false;
          this.cancelReport();
        }
      }
    });
  }
}
