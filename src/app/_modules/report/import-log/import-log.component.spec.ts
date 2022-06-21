import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportLogComponent } from './import-log.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { ReportService } from '../_service/report.service';
import { of} from 'rxjs';
import { ImportLogs } from '../_models/import-log';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ImportLogComponent', () => {
  let component: ImportLogComponent;
  let fixture: ComponentFixture<ImportLogComponent>;
  let router: Router;
  let reportService: ReportService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ImportLogComponent],
      imports: [RouterTestingModule, AppMaterialModuleForSpec, MdoUiLibraryModule, HttpClientTestingModule],
      providers: [ReportService]
    })
      .compileComponents();
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportLogComponent);
    component = fixture.componentInstance;
    reportService = fixture.debugElement.injector.get(ReportService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit, loaded pre required', (() => {
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();
    component.getWarningList();
    expect(component.getWarningList).toBeTruthy();

  }));

  it('close(), should close the current router', () => {
    spyOn(router, 'navigate');
    component.close();
    expect(component.close).toBeTruthy();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: null } }]);
  });

  it('getWarningList(), get warning list', () => {
    const returnData: ImportLogs[] =
      [{
        messageId: '236823642',
        reportId: '87347237572',
        category: 'DUPLICATE REPORT',
        message: 'Customer Module',
        status: 'OPEN',
        createdAt: '1/02/2021',
        updatedAt: '12/04/2021',
        updatedBy: '123'
      },
      {
        message: 'Customer Module',
        messageId: '23682364',
        reportId: '87347237573',
        category: 'Missing Module',
        status: 'OPEN',
        updatedAt: '12/12/20',
        createdAt: '13/04/2020',
        updatedBy: '123',
      }
      ];
    component.reportId = '87347237573';
    component.pageSize = 10;
    component.currentPage = 0;
    component.dataSource = [];
    spyOn(reportService, 'getImportLogList').and.callFake(()=>of(returnData))
    component.initializeForm();
    component.getWarningList();
    expect(component.dataSource.length).toEqual(2);
    expect(component.frmArray.length).toEqual(2);

    component.getWarningList(true);
    expect(component.dataSource.length).toEqual(4);
    expect(component.frmArray.length).toEqual(4);
  })

  it('change status, change status of the warning', () => {
    component.dataSource =
      [{
        messageId: '23682364',
        reportId: '87347237573',
        category: 'DUPLICATE REPORT',
        message: 'Customer Module',
        status: 'OPEN',
        createdAt: '1/02/2021',
        updatedAt: '12/04/2021',
        updatedBy: '123'
      },
      {
        message: 'Customer Module',
        messageId: '236823642',
        reportId: '87347237573',
        category: 'Missing Module',
        status: 'OPEN',
        updatedAt: '12/12/20',
        createdAt: '13/04/2020',
        updatedBy: '123',
      }
      ];

      const returnData = {
        messageId: '23682364',
        reportId: '87347237573',
        category: 'DUPLICATE REPORT',
        message: 'Customer Module',
        status: 'CLOSED',
        createdAt: '1/02/2021',
        updatedAt: '12/04/2021',
        updatedBy: '123'
      }
    spyOn(reportService, 'updateImportLogStatus').and.callFake(()=>of(returnData))
    component.changeStatus(0, 'CLOSED');
    expect(component.dataSource[0].status).toEqual('CLOSED');
  })

});
