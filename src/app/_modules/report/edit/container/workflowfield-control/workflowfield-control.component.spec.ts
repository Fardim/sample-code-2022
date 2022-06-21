import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Metadata, WorkflowfieldControlComponent } from './workflowfield-control.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MetadataModel } from '@models/schema/schemadetailstable';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { SharedModule } from '@modules/shared/shared.module';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { of } from 'rxjs';

describe('WorkflowfieldControlComponent', () => {
  let component: WorkflowfieldControlComponent;
  let fixture: ComponentFixture<WorkflowfieldControlComponent>;
  let schemaDetailsService: jasmine.SpyObj<SchemaDetailsService>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkflowfieldControlComponent ],
      imports:[HttpClientTestingModule, AppMaterialModuleForSpec, SharedModule],
      providers:[
      ]
    })
    .compileComponents();
    schemaDetailsService = TestBed.inject(SchemaDetailsService) as jasmine.SpyObj<SchemaDetailsService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowfieldControlComponent);
    component = fixture.componentInstance;
  });
// mock data
const statics1 = [
  {fieldId:'MATL_GROUP', fieldDescri:'Material Group'}as MetadataModel,
  {fieldId:'MATL_TYPE', fieldDescri:'Material Type'} as MetadataModel
]
const statics2 = [
  {fieldId:'MATL_GROUP', fieldDescri:'Material Group'}as MetadataModel,
  {fieldId:'WFID', fieldDescri:'Material Type'} as MetadataModel
]



const workFlowModeleResponse = {static: statics1};
const workFlowModeleResponse2 = {static: statics2};

  it('should create', () => {
    expect(component).toBeTruthy();
  });

   // mockdata
   const staticFields = [
    {fieldId:'MATL_GROUP', fieldDescri:'Material Group'}as MetadataModel,
    {fieldId:'MATL_TYPE', fieldDescri:'Material Type'} as MetadataModel
  ]
  const dynamicFields = [
    {fieldId:'material_Desc', fieldDescri:'material desc'} as MetadataModel, {fieldId:'loc_date', fieldDescri:'location date', dataType:'DTMS'} as MetadataModel
  ]
  const workFlowModeleResponse3 = {static: staticFields, dynamic: dynamicFields};


  it(`transformFieldRes(), in TIMESERIES widget`, async(()=>{
    // call actual method
    component.widgetType='TIMESERIES';
    component.controlFor='Field';
    const actualResonse =  component.transformFieldRes(workFlowModeleResponse);

    // asserts
    expect(actualResonse.length).toEqual(1, 'length should be equlas to 1 ');
  }));

  it(`transformFieldRes(), in BAR Chart widget`, async(()=>{
    // call actual method
    component.widgetType='BAR_CHART';
    const actualResonse =  component.transformFieldRes(workFlowModeleResponse2);

    // asserts
    expect(actualResonse.length).toEqual(1, 'length should be equlas to 1 ');
  }));

  it(`transformFieldRes(), in STACKED_BAR_CHART widget`, async(()=>{
    // call actual method
    component.widgetType='STACKED_BAR_CHART';
    const actualResonse =  component.transformFieldRes(workFlowModeleResponse2);

    // asserts
    expect(actualResonse.length).toEqual(1, 'length should be equlas to 1 ');
  }));

  it(`transformFieldRes(), in STACKED_BAR_CHART widget`, async(()=>{
    // call actual method
    component.widgetType='STACKED_BAR_CHART';
    const actualResonse =  component.transformFieldRes(workFlowModeleResponse2);

    // asserts
    expect(actualResonse.length).toEqual(1, 'length should be equlas to 1 ');
  }));

  it('getField(), call http for get all fields', async(() => {
    component.objectType = '1005';
    component.selectedFldId = 'NDC_TYPE'

    spyOn(schemaDetailsService,'getWorkflowFields').withArgs(component.objectType.split(',')).and.returnValue(of(workFlowModeleResponse3));
    component.getField();

    expect(schemaDetailsService.getWorkflowFields).toHaveBeenCalledWith(component.objectType.split(','));

    component.objectType = null;
    component.getField();
    expect(component.getField()).toEqual(undefined);
  }));

  it(`returnSelectedFldCtrl(), should return selected field control`, async(()=>{
    // mock data
    const fieldId  ='MATL_GROUP';
    const fields = component.transformFieldRes(workFlowModeleResponse3);
    component.fields = fields;

    // call actual componenet function
    let actualRes =  component.returnSelectedFldCtrl(fieldId);
    expect(actualRes.fieldId).toEqual(fieldId,`When return data then field id should equals ${fieldId}`);

    // call with unknown fields
    actualRes =  component.returnSelectedFldCtrl('TEST0001');
    expect(actualRes).toBe(undefined,`When call with uknown field  should equals undefined !`);

    component.controlFor = 'GroupWith';
    component.widgetType = 'TIMESERIES';
    let res = component.transformFieldRes(workFlowModeleResponse3);

    expect(res.length).toEqual(2, 'length should be equlas to 1 ');

    component.controlFor = 'Field';
    component.widgetType = 'TIMESERIES';
    res = component.transformFieldRes(workFlowModeleResponse3);

    expect(res.length).toEqual(2, 'length should be equlas to 1 ');
  }));


  it('displayFn(), help for display fieldDescription on dropdown ', async(()=>{
    // mock data
    const obj = {fieldId:'MATL_TYPE', fieldDescri:'Material Type'} as Metadata;

    // call actual function
    expect(component.displayFn(obj)).toEqual('Material Type');

    expect(component.displayFn(null)).toEqual(null);
  }));

  it('selected() Should emit after value change', async(() => {
    const option = {} as Metadata;
    expect(component.selected(option)).toEqual(undefined);
  }));
});
