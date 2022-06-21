import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatMenuModule } from '@angular/material/menu';
import { SharedModule } from '@modules/shared/shared.module';
import { AuditComponent } from './audit.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { LogsService } from '@services/logs.service';

describe('AuditComponent', () => {
  let component: AuditComponent;
  let fixture: ComponentFixture<AuditComponent>;
  let router: Router;
  let logsService: LogsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AuditComponent],
      imports: [BrowserAnimationsModule, MdoUiLibraryModule, HttpClientTestingModule, MatMenuModule, SharedModule, RouterTestingModule],
      providers: [
        LogsService,
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ mid: 1, rid: 1 })
          }
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditComponent);
    component = fixture.componentInstance;
    logsService = fixture.debugElement.injector.get(LogsService);
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should ngOnInit()', () => {
    spyOn(logsService, 'getModuleLogsAuditData').and.returnValue(of([]));
    component.ngOnInit();
    expect(logsService.getModuleLogsAuditData).toHaveBeenCalled();
  });

  // it('handleOpenExpansionPanel() set data if exists', () => {
  //   component.handleOpenExpansionPanel({
  //     wfvs_details: [{
  //       key: 'key',
  //       value: 'value'
  //     }]
  //   });

  //   expect(component.tableDataSource.length).toEqual(1);
  // });

  it('getInitials(), should return avatar name', async(() => {
    const resultFL = component.getInitials('Alex Juke');
    expect(resultFL).toEqual('AJ');

    const resultF = component.getInitials('Alex');
    expect(resultF).toEqual('C');

    const resultN = component.getInitials('');
    expect(resultN).toEqual('C');
  }));

  it('close()', () => {
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: null } }], {
      queryParams: { mid: null, rid: null },
      queryParamsHandling: 'merge'
    });
  });
});
