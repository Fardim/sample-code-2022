import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BreadcrumbComponent } from '@modules/shared/_components/breadcrumb/breadcrumb.component';
import { DashboardContainerComponent } from '../dashboard-container/dashboard-container.component';
import { ReportService } from '../../_service/report.service';
import { SharedModule } from '@modules/shared/shared.module';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { DuplicateReportComponent } from '../duplicate-report/duplicate-report.component';
import { Router } from '@angular/router';
import { ExportComponent } from '../export/export.component';
import { Userdetails } from '@models/userdetails';
import { UserService } from '@services/user/userservice.service';
import { ReportDashboardPermission } from '@models/collaborator';
import { GlobaldialogService } from '@services/globaldialog.service';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let dialogSpy: jasmine.Spy;
  const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
  let router: Router;
  let userService: UserService;
  let reportService: ReportService;
  let globaldialogService: GlobaldialogService;

  const mockMatSnackBar = {
    open: jasmine.createSpy('open')
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardComponent, BreadcrumbComponent, DashboardContainerComponent],
      imports: [ MdoUiLibraryModule, AppMaterialModuleForSpec, FormsModule, ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule, SharedModule, MatDialogModule],
      providers: [
        ReportService, {
          provide: MatSnackBar,
          useValue: mockMatSnackBar
        },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    dialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
    router = TestBed.inject(Router);
    userService = fixture.debugElement.injector.get(UserService);
    reportService = fixture.debugElement.injector.get(ReportService);
    globaldialogService = fixture.debugElement.injector.get(GlobaldialogService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getReportInfo()', async() => {
    const userDetails = {
      plantCode: '0',
    } as Userdetails
    const reportId = 24345;

    const res = {reportName: 'test', permissons: {isEditable: true, isAdmin: true, isDeleteable: true, permissionId:7654434567 } as ReportDashboardPermission};

    spyOn(userService, 'getUserDetails').and.returnValue(of(userDetails));
    spyOn(reportService,'getReportInfo').withArgs(reportId, userDetails.plantCode).and.returnValues(of(res), throwError('Something went wrong while getting details.'));
    component.getReportInfo(reportId);

    expect(reportService.getReportInfo).toHaveBeenCalledTimes(1);
    expect(component.collaboratorAdminPermission).toBeTrue();
    expect(component.collaboratorAdminPermission).toBeTrue();
  });

  it('getReportInfo()', async() => {
    const userDetails = {
      plantCode: '0',
    } as Userdetails
    const reportId = 24345;

    const res = {reportName: 'test'};

    spyOn(userService, 'getUserDetails').and.returnValue(of(userDetails));
    spyOn(reportService,'getReportInfo').withArgs(reportId, userDetails.plantCode).and.returnValues(of(res), throwError('Something went wrong while getting details.'));
    component.getReportInfo(reportId);

    expect(reportService.getReportInfo).toHaveBeenCalledTimes(1);
    expect(component.collaboratorAdminPermission).toBeFalse();
    expect(component.collaboratorAdminPermission).toBeFalse();
  });

  it('getReportInfo()', async() => {
    const userDetails = {
      plantCode: '0',
    } as Userdetails
    const reportId = 24345;

    const res = {reportName: 'test', permissons: {isEditable: true, isAdmin: true, isDeleteable: true, permissionId:7654434567 } as ReportDashboardPermission};

    spyOn(userService, 'getUserDetails').and.returnValue(of(userDetails));
    spyOn(reportService,'getReportInfo').withArgs(reportId, userDetails.plantCode).and.returnValues(of(res), throwError('Something went wrong while getting details.'));
    component.getReportInfo(reportId);

    expect(reportService.getReportInfo).toHaveBeenCalledTimes(1);
    expect(component.collaboratorAdminPermission).toBeTrue();
    expect(component.collaboratorAdminPermission).toBeTrue();
  });

  it('should call showClearBtnEmit()', () => {
    component.showClearBtnEmit(true);
    expect(component.showClearFilterBtn).toEqual(true);
  });

  it('clearFilters(), should clear filters', () => {
    component.emitClearBtnEvent = false;
    component.clearFilters();
    expect(component.emitClearBtnEvent).toEqual(true);
  });

  it('editReport(), navigate to ', () => {
    component.reportId = 111;
    spyOn(router, 'navigate');
    component.editReport();
    expect(router.navigate).toHaveBeenCalledWith(['/home', 'report', 'dashboard-builder', component.reportId.toString()]);
  });

  it('duplicateReport(), open dialog', () => {
    component.reportId = 222;
    component.reportName = 'Test';
    component.duplicateReport();
    expect(dialogSpy).toHaveBeenCalled();
    expect(dialogSpy).toHaveBeenCalledWith(DuplicateReportComponent, { data: { reportName: 'Test', reportId: 222 }, disableClose: true, width: '600px', minHeight: '250px' });
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
    component.reportId = 222;
    component.reportName = 'Test';
    component.exportReport();
    expect(dialogSpy).toHaveBeenCalled();
    expect(dialogSpy).toHaveBeenCalledWith(ExportComponent, { data: { reportName: 'Test', reportId: 222 }, disableClose: true, width: '600px', minHeight: '150px' });
  });

  it('openSendEmailSideSheet(), open slidesheet', () => {
    component.reportId = 222;
    component.reportName = 'Test';
    spyOn(router, 'navigate');
    component.openSendEmailSideSheet();
    expect(router.navigate).toHaveBeenCalledWith(['',{ outlets: { sb: `sb/report/send-email/222`}}]);
  });


  it('importLog(), method to navigate on import log page', () => {
    component.reportId = 111;
    spyOn(router, 'navigate');
    component.importLog();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: 'sb/report/import-log/' + component.reportId } }]);
  });

  it('deleteSubscriber() shoud delete subscriber after confirm box displayed', async () => {
    component.reportId = 7654345678;
    spyOn(globaldialogService, 'confirm').and.callFake((a, b) => b('yes'));
    spyOn(reportService,'deleteReport').withArgs(component.reportId.toString()).and.returnValues(of(true), throwError('Something went wrong while getting details.'));
    component.delete();
    expect(globaldialogService.confirm).toHaveBeenCalled();
    expect(mockMatSnackBar.open).toHaveBeenCalled();
  });

  it('deleteSubscriber() shoud delete subscriber after confirm box displayed', async () => {
    component.reportId = 7654345678;
    spyOn(globaldialogService, 'confirm').and.callFake((a, b) => b('yes'));
    spyOn(reportService,'deleteReport').withArgs(component.reportId.toString()).and.returnValues(of(false), throwError('Something went wrong while getting details.'));
    component.delete();
    expect(globaldialogService.confirm).toHaveBeenCalled();
  });

  it('deleteSubscriber() shoud delete subscriber after confirm box displayed', async () => {
    component.reportId = 7654345678;
    spyOn(globaldialogService, 'confirm').and.callFake((a, b) => b('no'));
    component.delete();
    expect(globaldialogService.confirm).toHaveBeenCalled();
  });
});
