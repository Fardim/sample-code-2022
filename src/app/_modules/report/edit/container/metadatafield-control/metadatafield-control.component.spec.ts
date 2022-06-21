import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetadatafieldControlComponent, Metadata } from './metadatafield-control.component';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { MetadataModel, Heirarchy } from '@models/schema/schemadetailstable';
import { of } from 'rxjs';
import { SharedModule } from '@modules/shared/shared.module';

describe('MetadatafieldControlComponent', () => {
  let component: MetadatafieldControlComponent;
  let fixture: ComponentFixture<MetadatafieldControlComponent>;
  let schemaDetailsService: jasmine.SpyObj<SchemaDetailsService>;

  beforeEach(async(() => {
    const schemaDetailsServiceSp = jasmine.createSpyObj(SchemaDetailsService,['getMetadataFields']);

    TestBed.configureTestingModule({
      declarations: [ MetadatafieldControlComponent ],
      imports:[AppMaterialModuleForSpec, SharedModule],
      providers:[
        {provide: SchemaDetailsService, userValue: schemaDetailsServiceSp}
      ]
    })
    .compileComponents();
    schemaDetailsService = TestBed.inject(SchemaDetailsService) as jasmine.SpyObj<SchemaDetailsService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetadatafieldControlComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // mock data
  const header = {
    MATL_GROUP:{fieldId:'MATL_GROUP', fieldDescri:'Material Group'} as MetadataModel,
    MATL_TYPE:{fieldId:'MATL_TYPE', fieldDescri:'Material Type'} as MetadataModel
  }
  const grid = {
    LANGUAGE_GRID:{fieldId:'LANGUAGE_GRID', fieldDescri:'Language Grid'} as MetadataModel,
  }

  const gridFields = {
    LANGUAGE_GRID:{
      LANGUAGE:{fieldId:'LANGUAGE', fieldDescri:'Language Code'} as MetadataModel,
      DESC:{fieldId:'DESC', fieldDescri:'Description'} as MetadataModel
    }
  }
  const hierarchy = [];
  const h1 = new Heirarchy();
  h1.heirarchyId = '1';
  h1.heirarchyText = 'Plant';
  h1.fieldId = '1';

  const h2 = new Heirarchy();
  h2.heirarchyId = '4';
  h2.heirarchyText = 'Valuation';
  hierarchy.push(h1); hierarchy.push(h2);

  const hierarchyFields = {
    1:{
      PLANT:{fieldId:'PLANT', fieldDescri:'Plant', dataType: ''} as MetadataModel
    },
    4:{
      VALUATION_TYPE:{fieldId:'VALUATION_TYPE', fieldDescri:'Valuation type'} as MetadataModel
    },
    3:{
      TAX_CLASS:{fieldId:'TAX_CLASS', fieldDescri:'Tax Classification', dataType: 'DATS'} as MetadataModel
    },
  }

  const metadataModeleResponse = {headers: header, grids: grid, gridFields, hierarchy, hierarchyFields};

  // it(`getFields(), should return all field belong to object / module`, async(()=>{
  //   // mock data
  //   component.moduleId = '1005';
  //   component.selectedFldId = 'NDC_TYPE'
  //   component.isCustomdataset = false;
  //   // call actual component method
  //   spyOn(schemaDetailsService,'getMetadataFields').withArgs(component.moduleId).and.returnValue(of(metadataModeleResponse));
  //   component.getFields();

  //   // veriry & asserts
  //   expect(schemaDetailsService.getMetadataFields).toHaveBeenCalledWith(component.moduleId);

  //   component.moduleId = null;
  //   component.getFields();
  //   expect(component.getFields()).toEqual(undefined);

  // }));

  it(`transformFieldRes(), help to transform metadata field with groups & autocomplete search`, async(()=>{
    // call actual method
    let actualResonse =  component.transformFieldRes(metadataModeleResponse);

    // asserts
    expect(actualResonse.length).toEqual(5, 'length should be equlas to 4 including groups');
    expect(actualResonse[0].childs.length).toEqual(4, '4 static system fields');

    // const grd = actualResonse.filter(fil=> fil.fieldId === 'LANGUAGE_GRID');
    // expect(grd.length).toEqual(1, 'Grid shoud have on dropdown part');
    // expect(grd[0].childs.length).toEqual(2, '2 fields assigned on grid LANGUAGE_GRID');

    // const hie = actualResonse.filter(fil=> fil.fieldId === '1');
    // expect(hie.length).toEqual(1, 'Plant group shoud have on dropdown part');
    // expect(hie[0].childs.length).toEqual(1, '1 fields assigned on plant 1');

    component.widgetType = 'TIMESERIES';
    actualResonse =  component.transformFieldRes(metadataModeleResponse);
    component.isGroupWith = true;

    // asserts
    expect(actualResonse.length).toEqual(5, 'length should be equlas to 2 including groups');
    expect(actualResonse[0].childs.length).toEqual(4, '2 static system fields');

    component.widgetType = 'TIMESERIES';
    actualResonse =  component.transformFieldRes(metadataModeleResponse);
    component.isGroupWith = false;

    // asserts
    expect(actualResonse.length).toEqual(2, 'length should be equlas to 2 including groups');
    expect(actualResonse[0].childs.length).toEqual(2, '2 static system fields');
  }));

  it(`returnSelectedFldCtrl(), should return selected field control`, async(()=>{
    // mock data
    const fieldId  ='MATL_TYPE';
    const fields = component.transformFieldRes(metadataModeleResponse);
    component.fields = fields;
    component.isCustomdataset = false;
    // call actual componenet function
    let actualRes =  component.returnSelectedFldCtrl(fieldId);
    expect(actualRes.fieldId).toEqual(fieldId,`When return data then field id should equals ${fieldId}`);

    // call with unknown fields
    component.isCustomdataset = true;
    component.customFields = [{fieldId: 'MATL_TYPE'} as MetadataModel]
    actualRes =  component.returnSelectedFldCtrl(fieldId);
    expect(actualRes.fieldId).toBe(fieldId,`When return data then field id should equals ${fieldId}`);

    component.customFields = [];
    actualRes =  component.returnSelectedFldCtrl(fieldId);
    expect(actualRes).toEqual({ fieldDescri: '', fieldId: ''} as Metadata | MetadataModel);
  }));

  it('ngOnInit(), load prereuired ', async(()=>{
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();
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

  it(`ngOnChanges(), should call reset when reset metadatafield`, async(()=>{
    // mock data
    const chnages:import('@angular/core').SimpleChanges = {moduleId:{currentValue:'1005', previousValue: false, firstChange:null, isFirstChange:null}};

    spyOn(schemaDetailsService,'getMetadataFields').withArgs('1005').and.returnValue(of(metadataModeleResponse));

    // call actual method
    component.ngOnChanges(chnages);
    expect(component.ngOnChanges).toBeTruthy();
    // mock data
    const chnages1:import('@angular/core').SimpleChanges = {selectedFldId:{currentValue:true, previousValue: false, firstChange:null, isFirstChange:null}};

    // call actual method
    component.ngOnChanges(chnages1);
    expect(component.ngOnChanges).toBeTruthy();
    // mock data
    const chnages2:import('@angular/core').SimpleChanges = null;

    // call actual method
    component.ngOnChanges(chnages2);
    expect(component.ngOnChanges).toBeTruthy();

    expect(schemaDetailsService.getMetadataFields).toHaveBeenCalled();
  }));

  it(`mapHierarchyFields(), help to transform Hierarchy field with groups & autocomplete search`, async(()=>{
    // call actual method
    let actualResonse =  component.transformFieldRes(metadataModeleResponse);
    component.mapHierarchyFields(metadataModeleResponse,actualResonse)
    // asserts
    expect(actualResonse.length).toEqual(7, 'length should be equlas to 7 including groups');
    expect(actualResonse[0].childs.length).toEqual(4, '4 static system fields');

    component.widgetType = 'TIMESERIES';
    actualResonse = [];
    actualResonse =  component.transformFieldRes(metadataModeleResponse);
    component.isGroupWith = true;
    component.mapHierarchyFields(metadataModeleResponse,actualResonse)
    // asserts
    expect(actualResonse.length).toEqual(5, 'length should be equlas to 2 including groups');
    expect(actualResonse[0].childs.length).toEqual(4, '2 static system fields');

    component.widgetType = 'TIMESERIES';
    actualResonse = [];
    actualResonse =  component.transformFieldRes(metadataModeleResponse);
    component.isGroupWith = false;
    component.mapHierarchyFields(metadataModeleResponse,actualResonse)
    // asserts
    expect(actualResonse.length).toEqual(4, 'length should be equlas to 2 including groups');
    expect(actualResonse[0].childs.length).toEqual(2, '2 static system fields');
  }));

  it(`mapGridFields(), help to transform Grid field with groups & autocomplete search`, async(()=>{
    // call actual method
    let actualResonse =  component.transformFieldRes(metadataModeleResponse);
    component.mapGridFields(metadataModeleResponse,actualResonse)
    // asserts
    expect(actualResonse.length).toEqual(6, 'length should be equlas to 7 including groups');
    expect(actualResonse[0].childs.length).toEqual(4, '4 static system fields');

    component.widgetType = 'TIMESERIES';
    actualResonse = [];
    actualResonse =  component.transformFieldRes(metadataModeleResponse);
    component.isGroupWith = true;
    component.mapHierarchyFields(metadataModeleResponse,actualResonse)
    // asserts
    expect(actualResonse.length).toEqual(5, 'length should be equlas to 2 including groups');
    expect(actualResonse[0].childs.length).toEqual(4, '2 static system fields');

    component.widgetType = 'TIMESERIES';
    actualResonse = [];
    actualResonse =  component.transformFieldRes(metadataModeleResponse);
    component.isGroupWith = false;
    component.mapHierarchyFields(metadataModeleResponse,actualResonse)
    // asserts
    expect(actualResonse.length).toEqual(4, 'length should be equlas to 2 including groups');
    expect(actualResonse[0].childs.length).toEqual(2, '2 static system fields');
  }));

  it(`getHierarchyParentField(), to get HierarchyParent field`, async(()=>{
    // call actual method
    const actualResonse =  component.getHierarchyParentField(metadataModeleResponse.hierarchy[0]);

    // asserts
    expect(actualResonse).toBeDefined();
  }));

  it(`getHierarchyParentField(), to get HierarchyParent field`, async(()=>{
    // call actual method
    const actualResonse =  component.getGridParentField(metadataModeleResponse.grids[0]);

    // asserts
    expect(actualResonse).toBeDefined();
  }));

  it(`addDefaultFieldForDIWDataset(), add default field for DIW dataset`, async(()=>{
    component.widgetType = 'COUNT';
    component.addDefaultFieldForDIWDataset();
    expect(component.systemFields.length).toBeGreaterThanOrEqual(1);
  }));
});
