import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuilderComponent } from './builder.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { ReportService } from '../_service/report.service';
import { BuilderContainerComponent } from './builder-container/builder-container.component';
import { ChartProperties, ChartType, Report, ReportDashboardReq, Widget, WidgetType } from '../_models/widget';
import { DuplicateReportComponent } from '@modules/report/view/duplicate-report/duplicate-report.component';
import { ExportComponent } from '@modules/report/view/export/export.component';
import { GridsterModule } from 'angular-gridster2';
import { GlobaldialogService } from '@services/globaldialog.service';
import { AggregationOperator } from '@modules/report/_models/widget';
import { Userdetails } from '@models/userdetails';
import { UserService } from '@services/user/userservice.service';
import { CancelPublishComponent, PackageType, PublishToConnekthubComponent } from '@modules/connekthub';
import { CoreService } from '@services/core/core.service';

describe('BuilderComponent', () => {
  let component: BuilderComponent;
  let fixture: ComponentFixture<BuilderComponent>;
  let dialogSpy: jasmine.Spy;
  const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
  let router: Router;
  let reportService: ReportService;
  let coreService : CoreService;
  let globalDialogService: GlobaldialogService;
  let userService: UserService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BuilderComponent, BuilderContainerComponent],
      imports: [MdoUiLibraryModule, AppMaterialModuleForSpec, RouterTestingModule, HttpClientTestingModule, SharedModule],
      providers: [
        ReportService,
        CoreService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuilderComponent);
    component = fixture.componentInstance;
    component.builderContainerComponent = TestBed.createComponent(BuilderContainerComponent).componentInstance;
    reportService = fixture.debugElement.injector.get(ReportService);
    userService = fixture.debugElement.injector.get(UserService);
    coreService = fixture.debugElement.injector.get(CoreService);
    globalDialogService = fixture.debugElement.injector.get(GlobaldialogService);
    // fixture.detectChanges();
    dialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
    router = TestBed.inject(Router);
    component.report = new Report();
    component.reportId = 111;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(), check all pre require', () => {
    component.ngOnInit();
    expect(component).toBeTruthy();
  });

  it('ngOnDestroy(), should unsubscribe from all observable', async(() => {
    spyOn(component.unsubscribe$, 'complete');
    component.ngOnDestroy();
    expect(component.unsubscribe$.complete).toHaveBeenCalled();
  }));

  it('should call showClearBtnEmit()', () => {
    component.showClearBtnEmit(true);
    expect(component.showClearFilterBtn).toEqual(true);
  });

  it('clearFilters(), should clear filters', () => {
    component.emitClearBtnEvent = false;
    component.clearFilters();
    expect(component.emitClearBtnEvent).toEqual(true);
  });

  it('editReport(), navigate to edit', () => {
    spyOn(router, 'createUrlTree').and.callThrough();
    spyOn(component, 'setEditedMode');
    component.editReport();
    expect(router.createUrlTree).toHaveBeenCalled();
    expect(component.setEditedMode).toHaveBeenCalledWith(true);
  });

  it('viewReport(), navigate to view', () => {
    spyOn(router, 'createUrlTree').and.callThrough();
    spyOn(component, 'setEditedMode');
    component.viewReport();
    expect(router.createUrlTree).toHaveBeenCalled();
    expect(component.setEditedMode).toHaveBeenCalledWith(false);
  });

  it('importLog(), navigate to import-log', () => {
    spyOn(router, 'navigate');
    component.importLog();
    expect(router.navigate).toHaveBeenCalled();
  });

  it('delete(), delete report', () => {
    spyOn(globalDialogService, 'confirm').and.callFake((a, b) => b('yes'));
    spyOn(reportService, 'deleteReport').withArgs('111').and.returnValue(of(true));
    component.deleteReport();
    expect(globalDialogService.confirm).toHaveBeenCalled();
    expect(reportService.deleteReport).toHaveBeenCalledWith('111');
  });

  it('setEditedMode(), should set editedMode', () => {
    spyOn(component, 'getAllObjectType');
    component.setEditedMode(true);
    expect(component.editedMode).toBeTruthy();
    expect(component.getAllObjectType).toHaveBeenCalled();
    component.setEditedMode(false);
    expect(component.editedMode).toBeFalsy();
  });

  it('setPanel(), should set showPropertyPanel', () => {
    component.reportExist = true;
    component.report.reportId = 111;
    component.builderContainerComponent = TestBed.createComponent(BuilderContainerComponent).componentInstance;
    // fixture.detectChanges();
    component.setPanel(true);
    expect(component.showPropertyPanel).toBeTruthy();
    spyOn(component.builderContainerComponent, 'resizeGridster');
    spyOn(component, 'setActiveWidget');
    component.setPanel(false);
    expect(component.showPropertyPanel).toBeFalsy();
    expect(component.builderContainerComponent.resizeGridster).toHaveBeenCalled();
    expect(component.setActiveWidget).toHaveBeenCalledWith(undefined);
  });

  it('discardReport(), should call discardDraftReport', () => {
    spyOn(reportService, 'discardDraftReport').withArgs(111).and.returnValue(of({}));
    component.discardReport();
    expect(reportService.discardDraftReport).not.toHaveBeenCalledWith(component.reportId);
    component.report.hasDraft = true;
    component.discardReport();
    expect(reportService.discardDraftReport).toHaveBeenCalledWith(component.reportId);
  });

  it('saveReport(), should call saveReport', () => {
    component.report.reportName = 'test';
    component.report.hasDraft = true;
    component.report.widgetReqList =  [{
      rows: 1,
      cols: 1,
      widgetType: WidgetType.COUNT,
      aggregrationOp: AggregationOperator.MEDIAN,
      fieldCtrl: { dataType: null, picklist: 1 } as any
    } as Widget];
    const response = {
      reportId: 12324,
      reportName: 'Report',
      reportDesciption: '',
      widgetReqList: [{
        rows: 1,
        cols: 1,
        widgetType: WidgetType.COUNT,
        aggregrationOp: AggregationOperator.MEDIAN,
        fieldCtrl: { dataType: null, picklist: 1 } as any
      } as Widget]
    } as Report;
    const spy = spyOn(reportService, 'saveReport').withArgs(111, component.getRequest()).and.returnValue(of(response));
    spyOn(reportService, 'saveDraft').withArgs(111, component.getRequest()).and.returnValue(of(response));
    spyOn(component, 'setActiveWidget');
    component.saveReport();
    expect(spy).toHaveBeenCalledWith(111, component.getRequest());
    expect(component.setActiveWidget).toHaveBeenCalledWith(undefined);
  });

  it('saveReport(), should call saveReport', () => {
    component.report.reportName = 'test';
    component.report.hasDraft = true;
    component.report.widgetReqList =  [{
      rows: 1,
      cols: 1,
      widgetType: WidgetType.COUNT,
      aggregrationOp: AggregationOperator.MEDIAN,
      fieldCtrl: { dataType: null, picklist: 1 } as any
    } as Widget];
    const response = {
      reportId: 12324,
      reportName: 'Report',
      reportDesciption: '',
      widgetReqList: [{
        rows: 1,
        cols: 1,
        widgetType: WidgetType.COUNT,
        aggregrationOp: AggregationOperator.MEDIAN,
        fieldCtrl: { dataType: null, picklist: 1 } as any
      } as Widget]
    } as Report
    const spy = spyOn(reportService, 'saveReport').withArgs(111, component.getRequest()).and.returnValue(of(response));
    spyOn(reportService, 'saveDraft').withArgs(111, component.getRequest()).and.returnValue(of(response));
    spyOn(component, 'setActiveWidget');
    component.saveReport();
    expect(reportService.saveDraft).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(111, component.getRequest());
    // fixture.detectChanges();
    expect(component.setActiveWidget).toHaveBeenCalledWith(undefined);
  });

  it('saveDraft(), should call saveDraft', () => {
    component.report.widgets = [];
    spyOn(reportService, 'saveDraft').withArgs(111, JSON.parse(JSON.stringify(component.getRequest()))).and.returnValue(of(new Report()));
    spyOn(component, 'setReport');
    component.saveDraft(component.getRequest());
    expect(reportService.saveDraft).toHaveBeenCalledWith(111, JSON.parse(JSON.stringify(component.getRequest())));
    // fixture.detectChanges();
    expect(component.setReport).toHaveBeenCalled();
  });

  it('saveDraft(), should save with all widgets', () => {
    component.report.widgets = [];
    spyOn(reportService, 'saveDraft').and.returnValue(of(new Report()));
    spyOn(component, 'setReport');
    component.updateAll = true;
    const request: ReportDashboardReq = new ReportDashboardReq();
    const widget = new Widget();
    widget.widgetId = '111';
    widget.widgetType = WidgetType.PIE_CHART;
    request.widgetReqList = [widget];
    component.report.widgets.push(widget);
    const widget2 = new Widget();
    widget2.widgetId = '222';
    component.report.widgets.push(widget2);
    component.saveDraft(request);
    // fixture.detectChanges();
    expect(component.setReport).toHaveBeenCalled();
    expect(reportService.saveDraft).toHaveBeenCalled();
    expect(component.updateAll).toBeFalsy();
  });

  it('getRequest(), should return ReportDashboardReq', () => {
    component.report.reportName = 'test';
    component.report.widgets = [];
    const request: ReportDashboardReq = new ReportDashboardReq();
    request.reportId = component.reportId;
    request.reportName = component.report.reportName;
    request.reportDesciption = component.report.reportDesciption;
    request.widgetReqList = component.report.widgets;
    expect(component.getRequest()).toEqual(request);
  });

  it('duplicateReport(), open dialog', () => {
    component.report.reportName = 'Test';
    component.duplicateReport();
    expect(dialogSpy).toHaveBeenCalled();
    expect(dialogSpy).toHaveBeenCalledWith(DuplicateReportComponent, { data: { reportName: 'Test', reportId: 111 }, disableClose: true, width: '600px', minHeight: '250px' });
  });

  it('showClearBtnEmit(), should enable Clear filter(s) button', () => {
    expect(component.showClearFilterBtn).toEqual(false);
    component.showClearBtnEmit(true);
    expect(component.showClearFilterBtn).toEqual(true);
    expect(component.emitClearBtnEvent).toEqual(false);
  });

  it('showClearBtnEmit(), should disenable Clear filter(s) button', () => {
    component.showClearFilterBtn = true;
    component.showClearBtnEmit(false);
    expect(component.showClearFilterBtn).toEqual(false);
    expect(component.emitClearBtnEvent).toEqual(true);
  });

  it('exportReport(), open dialog', () => {
    component.report.reportName = 'Test';
    component.exportReport();
    expect(dialogSpy).toHaveBeenCalled();
    expect(dialogSpy).toHaveBeenCalledWith(ExportComponent, { data: { reportName: 'Test', reportId: 111 }, disableClose: true, width: '600px', minHeight: '150px' });
  });

  it('openSendEmailSideSheet(), open slidesheet', () => {
    component.report.reportName = 'Test';
    spyOn(router, 'navigate');
    component.openSendEmailSideSheet();
    expect(router.navigate).toHaveBeenCalledWith(['', { outlets: { sb: `sb/report/send-email/111` } }], { queryParamsHandling: 'preserve' });
  });

  it('getCustomObjectType(), to get custom object', async(() => {
    spyOn(reportService, 'getCustomData').and.returnValue(of([]));
    component.getCustomObjectType();
    expect(component.getCustomObjectType).toBeTruthy();
  }));

  it('getAllObjectType(), get all object type', async(() => {
    const response = {
      moduleDesc: 'Material',
      moduleId: '1005',
      tenantId: '1',
    };
    spyOn(coreService, 'getDataSets').and.returnValue(of([response]));
    component.getAllObjectType();
    expect(coreService.getDataSets).toHaveBeenCalledTimes(1);
  }));

  it('getReport(), should call getReport', () => {
    component.report.widgets = [];
    component.isFromMsteam = true;
    spyOn(reportService, 'getReport').withArgs(111, true).and.returnValue(of(new Report()));
    spyOn(component, 'setReport');
    component.getReport(component.reportId);
    expect(reportService.getReport).toHaveBeenCalledWith(component.reportId, true);
    // fixture.detectChanges();
    expect(component.setReport).toHaveBeenCalled();
  });

  it('setReport(), should set report', () => {
    const widget = new Widget();
    widget.widgetId = '111';
    const report = new Report();
    report.widgetReqList = [widget];
    component.setReport(report);
    expect(component.report).toBeDefined();

    component.activeWidget = widget;
    spyOn(component, 'setActiveWidget');
    component.setReport(report);
    expect(component.setActiveWidget).toHaveBeenCalled();

    spyOn(component, 'editReport');
    report.hasDraft = true;
    component.setReport(report);
    expect(component.editReport).toHaveBeenCalled();

    widget.cols = null;
    widget.rows = null;
    widget.width = 200;
    widget.height = 200;
    report.widgetReqList = [widget];
    component.setReport(report);
    expect(component.updateAll).toBeTruthy();

    widget.widgetType = WidgetType.BAR_CHART;
    widget.chartProperties = new ChartProperties();
    widget.chartProperties.chartType = ChartType.PIE
    report.widgetReqList = [widget];
    component.setReport(report);
    expect(widget.widgetType).toBe(WidgetType.PIE_CHART);

    widget.widgetType = WidgetType.PIE_CHART;
    widget.chartProperties = new ChartProperties();
    widget.chartProperties.chartType = ChartType.BAR
    report.widgetReqList = [widget];
    component.setReport(report);
    expect(widget.widgetType).toBe(WidgetType.BAR_CHART);
  });

  it('setActiveWidget(), should set activeWidget', () => {
    const widget = new Widget();
    widget.widgetId = '111';
    component.setActiveWidget(widget);
    expect(component.activeWidget).toEqual(widget);
  });

  it('navigateToCreateNew(), navigate to create new report page' , () => {
    const userDetails = {
      currentRoleId: 'AD',
      plantCode: '0'
    } as Userdetails;
    spyOn(userService, 'getUserDetails').and.returnValue(of(userDetails));
    spyOn(reportService, 'createUpdateReport').and.returnValue(of('111'));
    spyOn(router, 'navigate');
    component.navigateToCreateNew();

    expect(router.navigate).toHaveBeenCalledWith(['home/report/edit/111/new']);
  });

  it('getDIWDataset(), to get DIW object', async(() => {
    spyOn(reportService, 'getDIWDataset').and.returnValue(of([]));
    component.getDIWDataset();
    expect(component.getDIWDataset).toBeTruthy();
  }));

  it('cancelReport(), should cancel user changes', () => {
    spyOn(component, 'deleteReport');
    component.isNewReportProcessing = true;
    component.deleteReport();
    expect(component.deleteReport).toHaveBeenCalledWith();

    spyOn(globalDialogService, 'confirm').and.callFake((a, b) => b('yes'));
    spyOn(component, 'viewReport');
    component.report.hasDraft = false;
    component.isNewReportProcessing = false;
    component.cancelReport();
    expect(globalDialogService.confirm).toHaveBeenCalled();
    expect(component.viewReport).toHaveBeenCalledWith();

    spyOn(component, 'discardReport');
    component.report.hasDraft = true;
    component.isNewReportProcessing = false;
    component.cancelReport();
    expect(component.discardReport).toHaveBeenCalledWith();
  });

  it('checkWidgetValidation(), Check if widget is valid or not', async(() => {
    component.regex = /^[^*|\":<>[\]{}`\\()';@&?$]+$/;
    const widget = {
      widgetType : WidgetType.TIMESERIES,
      widgetTitle : '',
    }
    const res = component.checkWidgetValidation(widget);
    expect(res).toEqual(true);
  }));

  it('checkWidgetValidation(), Check if widget is valid', async(() => {
    component.regex = /^[^*|\":<>[\]{}`\\()';@&?$]+$/;
    const widget = {
      widgetType : WidgetType.TIMESERIES,
      widgetTitle : 'MAL-123',
    }
    const res = component.checkWidgetValidation(widget);
    expect(res).toEqual(false);
  }));

  it('checkWidgetValidation(), Check if widget is valid or not', async(() => {
    component.regex = /^[^*|\":<>[\]{}`\\()';@&?$]+$/;
    const widget = {
      widgetType : WidgetType.TIMESERIES,
      objectType : null,
      widgetTitle : 'Test'
    }
    const res = component.checkWidgetValidation(widget);
    expect(res).toEqual(true);
  }));

  it('checkWidgetValidation(), Check if widget is valid or not', async(() => {
    component.regex = /^[^*|\":<>[\]{}`\\()';@&?$]+$/;
    const widget = {
      widgetType : WidgetType.TIMESERIES,
      objectType : '1005',
      widgetTitle : 'Test'
    }
    const res = component.checkWidgetValidation(widget);
    expect(res).toEqual(false);
  }));

  it('checkWidgetValidation(), Check if widget is valid or not', async(() => {
    component.regex = /^[^*|\":<>[\]{}`\\()';@&?$]+$/;
    const widget = {
      widgetType : WidgetType.TIMESERIES,
      objectType : '1005',
      widgetTitle : 'Test',
      isStepwiseSLA : true,
      workflowPath : ['test' , 'test1']
    }
    const res = component.checkWidgetValidation(widget);
    expect(res).toEqual(true);
  }));

  it('checkWidgetValidation(), Check if widget is valid or not', async(() => {
    component.regex = /^[^*|\":<>[\]{}`\\()';@&?$]+$/;
    const widget = {
      widgetType : WidgetType.TIMESERIES,
      objectType : '1005',
      widgetTitle : 'Test',
      isStepwiseSLA : true,
      workflowPath : []
    }
    const res = component.checkWidgetValidation(widget);
    expect(res).toEqual(true);
  }));

  it('checkWidgetValidation(), Check if widget is valid or not', async(() => {
    component.regex = /^[^*|\":<>[\]{}`\\()';@&?$]+$/;
    const widget = {
      widgetType : WidgetType.TIMESERIES,
      objectType : '1005',
      widgetTitle : 'Test',
      isStepwiseSLA : false,
      workflowPath : []
    }
    const res = component.checkWidgetValidation(widget);
    expect(res).toEqual(false);
  }));

  it('publishToLibrary(), open dialog', () => {
    component.report.reportName = 'Test';
    component.report.reportId = 111;
    component.publishToLibrary();
    expect(dialogSpy).toHaveBeenCalledWith(PublishToConnekthubComponent, { data: { name: 'Test', id: 111, brief: '', type: PackageType.DASHBOARD }, disableClose: true, width: '600px', minHeight: '250px', autoFocus: false, minWidth: '765px', panelClass: 'create-master-panel' });
  });

  it('cancelPublish(), open dialog', () => {
    component.report.chkPackageId = '1234';
    component.cancelPublish();
    expect(dialogSpy).toHaveBeenCalledWith(CancelPublishComponent, { data: { chkPackageId: component.report.chkPackageId, type: PackageType.DASHBOARD }, disableClose: true, width: '600px', minHeight: '250px', autoFocus: false, minWidth: '765px', panelClass: 'create-master-panel' });
  });

  it('canDeactivate(), show popup in case of new report and going to other view route', () => {
    component.isNewReportProcessing = true;
    component.cancelMode = false;
    spyOn(globalDialogService, 'confirm').and.callFake((a, b) => b('yes'));
    spyOn(reportService, 'deleteReport').withArgs('111').and.returnValue(of(true));
    component.canDeactivate();
    expect(globalDialogService.confirm).toHaveBeenCalled();
  });
});
