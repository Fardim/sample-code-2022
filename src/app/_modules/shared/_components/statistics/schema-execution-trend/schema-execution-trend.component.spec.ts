import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SimpleChanges } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SchemaExecutionLog } from '@models/schema/schemadetailstable';
import { SchemaVariantsModel } from '@models/schema/schemalist';
import { Userdetails } from '@models/userdetails';
import { StatisticsFilterParams } from '@modules/schema/_components/v2/statics/statics.component';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { UserService } from '@services/user/userservice.service';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { SchemaExecutionTrendComponent } from './schema-execution-trend.component';

describe('SchemaExecutionTrendComponent', () => {
  let component: SchemaExecutionTrendComponent;
  let fixture: ComponentFixture<SchemaExecutionTrendComponent>;
  let userDetailsService: UserService;
  let schemaDetailsService: SchemaDetailsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchemaExecutionTrendComponent ],
      imports: [AppMaterialModuleForSpec, HttpClientTestingModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchemaExecutionTrendComponent);
    component = fixture.componentInstance;
    userDetailsService = fixture.debugElement.injector.get(UserService);
    schemaDetailsService = fixture.debugElement.injector.get(SchemaDetailsService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(`getExecutionTrendData() , get execution trend `, async(()=>{
    // mock data ..
    const executionData: SchemaExecutionLog[] = [{ id: '143852259265109601', schemaId: '313841666644936992', variantId: 0, runId: 23392, exeStrtDate: 1611551629532, exeEndDate: 1611551661991, userId: 'Admin', plantCode: '0', total: 14, totalSuccess: 14, correctionValue: null, totalError: 0, uniqueSuccess: null, uniqueError: null, uniqueSkipped: 0, skipped: 0, outdated: null, duplicate: null, isInRunning: false, isInterrupted: false, interruptedMessage: null, successPercentage: null, errorPercentage: null, reIndexTaskId: '9Hn9jZQKTE6X4iZDsmcYjQ:42003', _index: 'localhost_180565957_do_br_*_313841666644936992_23392_170019889265108803' } as unknown as SchemaExecutionLog];
    const user = {plantCode:'0'} as Userdetails;
    component.filter =  {exe_end_date:'1611551629532', exe_start_date:'1611551661991'} as StatisticsFilterParams;

    // spy data ..
    spyOn(userDetailsService, 'getUserDetails').and.returnValue(of(user));
    spyOn(schemaDetailsService,'getSchemaExecutedStatsTrend').withArgs('123','0','0',component.filter).and.returnValue(of(executionData));

    // call actual method ..
    component.getExecutionTrendData('123', '0');

    expect(userDetailsService.getUserDetails).toHaveBeenCalled();
    expect(schemaDetailsService.getSchemaExecutedStatsTrend).toHaveBeenCalledWith('123','0','0',component.filter);
    expect(component.data.length).toEqual(1);
  }));


  it('prepareDataSet(), prepare data to make visiable on chart ..',async(()=>{
    // mock data ..
    const executionData: SchemaExecutionLog[] = [{ id: '143852259265109601', schemaId: '313841666644936992', variantId: 0, runId: 23392, exeStrtDate: 1611551629532, exeEndDate: 1611551661991, userId: 'Admin', plantCode: '0', total: 14, totalSuccess: 14, correctionValue: null, totalError: 0, uniqueSuccess: null, uniqueError: null, uniqueSkipped: 0, skipped: 0, outdated: null, duplicate: null, isInRunning: false, isInterrupted: false, interruptedMessage: null, successPercentage: null, errorPercentage: null, reIndexTaskId: '9Hn9jZQKTE6X4iZDsmcYjQ:42003', _index: 'localhost_180565957_do_br_*_313841666644936992_23392_170019889265108803' } as unknown as SchemaExecutionLog];

    // call actual method ..
    component.prepareDataSet(executionData);

    // verify ..
    expect(component.dataSet[0].data.length).toEqual(1);
    expect(component.dataSet[0].data[0].valueOf()).toEqual(0);

    expect(component.dataSet[1].data.length).toEqual(1);
    expect(component.dataSet[1].data[0].valueOf()).toEqual(14);

    component.unit = 'week';

    // call actual method ..
    component.prepareDataSet(executionData);

    // verify ..
    expect(component.dataSet[0].data.length).toEqual(1);
    expect(component.dataSet[0].data[0].valueOf()).toEqual(0);

    expect(component.dataSet[1].data.length).toEqual(1);
    expect(component.dataSet[1].data[0].valueOf()).toEqual(14);

    component.unit = 'week';

    // call actual method ..
    component.prepareDataSet(executionData);

    // verify ..
    expect(component.dataSet[0].data.length).toEqual(1);
    expect(component.dataSet[0].data[0].valueOf()).toEqual(0);

    expect(component.dataSet[1].data.length).toEqual(1);
    expect(component.dataSet[1].data[0].valueOf()).toEqual(14);

    component.unit = 'month';

    // call actual method ..
    component.prepareDataSet(executionData);

    // verify ..
    expect(component.dataSet[0].data.length).toEqual(1);
    expect(component.dataSet[0].data[0].valueOf()).toEqual(0);

    expect(component.dataSet[1].data.length).toEqual(1);
    expect(component.dataSet[1].data[0].valueOf()).toEqual(14);

    component.unit = 'year';

    // call actual method ..
    component.prepareDataSet(executionData);

    // verify ..
    expect(component.dataSet[0].data.length).toEqual(1);
    expect(component.dataSet[0].data[0].valueOf()).toEqual(0);

    expect(component.dataSet[1].data.length).toEqual(1);
    expect(component.dataSet[1].data[0].valueOf()).toEqual(14);
  }));

  it('update on changes', () => {
    const changes:SimpleChanges = {
      schemaId :{currentValue:'2', previousValue: '1', firstChange:null, isFirstChange:null},
      variantId  :{currentValue:'1', previousValue: '0', firstChange:null, isFirstChange:null},
      filter :{currentValue:{exe_end_date:'1611551629532', exe_start_date:'1611551661991', _date_filter_type:'today', _data_scope: {variantId: '1'} as SchemaVariantsModel} as StatisticsFilterParams,
              previousValue: {exe_end_date:'1629863578732', exe_start_date:'1629348762323', _date_filter_type:'this_week', _data_scope: {variantId: '0'} as SchemaVariantsModel} as StatisticsFilterParams,
              firstChange:null, isFirstChange:null
            }
    };
    component.chartOptions = {responsive: true,maintainAspectRatio: false, plugins:{tooltip:{backgroundColor: 'rgba(255,255,255,0.9)'}}}
    component.ngOnChanges(changes);
    expect(component.filter).toEqual(changes.filter.currentValue);

    // changes = {schemaId:{currentValue:'1701', previousValue: '', firstChange:null, isFirstChange:null}};
    // component.ngOnChanges(changes);
    // expect(component.controlType).toEqual('ctrl');
  });

});