import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardContainerComponent } from './dashboard-container.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Criteria, WidgetMapInfo } from '../../_models/widget';
import { ReportService } from '@modules/report/_service/report.service';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { SharedModule } from '@modules/shared/shared.module';
import { Userdetails } from '@models/userdetails';
import { UserService } from '@services/user/userservice.service';
import { of, throwError } from 'rxjs';
import { ReportDashboardPermission } from '@models/collaborator';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';

describe('DashboardContainerComponent', () => {
  let component: DashboardContainerComponent;
  let fixture: ComponentFixture<DashboardContainerComponent>;
  let userService: UserService;
  let reportService: ReportService;
  let sharedService: SharedServiceService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardContainerComponent ],
      imports:[HttpClientTestingModule, AppMaterialModuleForSpec, SharedModule],
      providers:[ReportService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardContainerComponent);
    component = fixture.componentInstance;
    userService = fixture.debugElement.injector.get(UserService);
    reportService = fixture.debugElement.injector.get(ReportService);
    sharedService = fixture.debugElement.injector.get(SharedServiceService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('changeFilterCriteria(), should update criteria',async(()=>{
    const filterCritera = [];
    component.filterCriteria = filterCritera;
    component.changeFilterCriteria(filterCritera);
    expect(component.filterCriteria.length).toEqual(0);

    const critera = new Criteria();
    critera.conditionFieldId = 'MATL_TYPE';
    critera.conditionFieldValue = 'ZMRO';
    filterCritera.push(critera);

    component.filterCriteria = filterCritera;
    component.changeFilterCriteria(filterCritera);
    expect(component.filterCriteria.length).toEqual(1);

    critera.conditionFieldValue = 'HERS';
    component.changeFilterCriteria([critera]);
    expect(critera.conditionFieldValue).toEqual(component.filterCriteria[0].conditionFieldValue);
  }));

  it('ngAfterViewInit() should call resize', async(()=>{
    spyOn(sharedService, 'getSecondarySideNavBarState').and.returnValue(of(true));
    spyOn(component, 'resize');
    fixture.detectChanges();
    component.resize();
    expect(component.resize).toHaveBeenCalled();
  }));

  it('resize(), on resize ', async(()=>{
    component.resize();
    expect(component.rootContainer).toBeUndefined();
    fixture.detectChanges();
    component.rootContainer.nativeElement.style.width = '2000px';
    component.resize();
    expect(component.screenWidth).toEqual(2000);
  }));

  it('click(), should call click', async(() => {
    const data = 'test';
    component.click(data);
    expect(component.click).toBeTruthy();
  }));

  it('ngOnChanges(), should call reset when reset dashboard', async(() => {
    const chnages:import('@angular/core').SimpleChanges = {emitClearBtnEvent:{currentValue:true, previousValue: false, firstChange:null, isFirstChange:null}, reportId:{currentValue:null, previousValue: 4567877, firstChange:null, isFirstChange:null}};
    // component.emitClearBtnEvent = false;
    component.filterCriteria = [{fieldId:'test'} as Criteria,{fieldId:'test1'} as Criteria];
    component.ngOnChanges(chnages);
    expect(component.filterCriteria.length).toEqual(0);

    const chnages2:import('@angular/core').SimpleChanges = {emitClearBtnEvent:{currentValue:false, previousValue: false, firstChange:null, isFirstChange:null}};
    component.filterCriteria = [{fieldId:'test'} as Criteria,{fieldId:'test1'} as Criteria];
    component.ngOnChanges(chnages2);
    expect(component.filterCriteria.length).toEqual(2);

    const chnages3:import('@angular/core').SimpleChanges = {reportId:{currentValue:987654, previousValue: 4567877, firstChange:null, isFirstChange:null}};
    // component.emitClearBtnEvent = false;
    component.ngOnChanges(chnages3);
    expect(component.filterCriteria.length).toEqual(0);
    expect(component.reportId).toEqual(987654);
  }));

  it('ngOnChanges(), should update the report info', async(() => {
    component.reportId= null;
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();

    component.reportId = 8765435;
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();
  }));

  it('getReportInfo()', async() => {
    const userDetails = {
      plantCode: '0',
    } as Userdetails
    const reportId = 24345;

    const res = {widgets:[{}] as WidgetMapInfo[], permissons: {isViewable: false, permissionId:7654434567 } as ReportDashboardPermission};

    spyOn(userService, 'getUserDetails').and.returnValue(of(userDetails));
    spyOn(reportService,'getReportInfo').withArgs(reportId, userDetails.plantCode).and.returnValues(of(res), throwError('Something went wrong while getting details.'));
    component.getReportInfo(reportId);

    expect(reportService.getReportInfo).toHaveBeenCalledTimes(1);
    expect(component.widgetList).toEqual(res.widgets);
  });
});
