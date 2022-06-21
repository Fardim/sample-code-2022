import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericFieldControlComponent } from './generic-field-control.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MetadataModel, Heirarchy } from '@models/schema/schemadetailstable';
import { of } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Metadata } from '@modules/report/edit/container/metadatafield-control/metadatafield-control.component';
import { MatChipInputEvent } from '@angular/material/chips';
import { SharedModule } from '@modules/shared/shared.module';
import { CoreService } from '@services/core/core.service';

describe('GenericFieldControlComponent', () => {
  let component: GenericFieldControlComponent;
  let fixture: ComponentFixture<GenericFieldControlComponent>;
  let coreService: CoreService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenericFieldControlComponent ],
      imports:[
        AppMaterialModuleForSpec,
        HttpClientModule,
        ReactiveFormsModule,
        FormsModule,
        SharedModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericFieldControlComponent);
    component = fixture.componentInstance;
    coreService = fixture.debugElement.injector.get(CoreService);
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

  const h2 = new Heirarchy();
  h2.heirarchyId = '4';
  h2.heirarchyText = 'Valuation';
  hierarchy.push(h1); hierarchy.push(h2);

  const hierarchyFields = {
    1:{
      PLANT:{fieldId:'PLANT', fieldDescri:'Plant'} as MetadataModel
    },
    4:{
      VALUATION_TYPE:{fieldId:'VALUATION_TYPE', fieldDescri:'Valuation type'} as MetadataModel
    }
  }

  const metadataModeleResponse = {headers: header, grids: grid, gridFields, hierarchy, hierarchyFields};

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(), should assign pre required ', async(()=>{
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();
  }));

  it('getFields(), should get all fields by module id', async(()=>{
    // mock data
    component.moduleId = '1005';

    spyOn(coreService, 'getMetadataFieldsByModuleId').withArgs([component.moduleId]).and.returnValue(of(metadataModeleResponse));
    component.selectedFldId = ['MATL_TYPE'];
    component.getFields();
    expect(coreService.getMetadataFieldsByModuleId).toHaveBeenCalledWith([component.moduleId]);

    // mock data
    component.moduleId = '1005';
    component.selectedFldId = null;
    component.getFields();
    expect(coreService.getMetadataFieldsByModuleId).toHaveBeenCalledWith([component.moduleId]);

    component.moduleId = null;
    component.getFields();
    expect(component.getFields()).toEqual(undefined);
  }));

  it('selected(), while select dropdown data ', async(()=>{
    const option = [{ childs:[], fieldId:'MATL_TYPE', fieldDescri:'Material Type', isGroup:false } as Metadata];

    const selected:MatAutocompleteSelectedEvent = {option:{value:option[0]}} as MatAutocompleteSelectedEvent;

    component.selected(selected);

    expect(component.preSelectedCtrl.length).toEqual(1);
    expect(component.preSelectedCtrl[0]).toEqual(option[0]);

    component.isMultiSelection  = true;
    component.preSelectedCtrl = option;

    component.selected(selected);

    expect(component.preSelectedCtrl.length).toEqual(0);

    component.preSelectedCtrl = [{fieldId:'NDC_TYPE'} as Metadata];
    component.selected(selected);
    expect(component.preSelectedCtrl.length).toEqual(2);

    const selected1 = {option:{value:null}} as MatAutocompleteSelectedEvent;
    expect(component.selected(selected1)).toEqual(undefined);
  }));

  it('remove(), should remove particular selected item', async(()=>{
    const option = { childs:[], fieldId:'MATL_TYPE', fieldDescri:'Material Type', isGroup:false };
    component.preSelectedCtrl = [{fieldId:'MATL_TYPE'} as Metadata];
    component.remove(option);
    expect(component.preSelectedCtrl.length).toEqual(0);

    const option1 = { childs:[], fieldId:'MATL_TYPE', fieldDescri:'Material Type', isGroup:false };
    component.preSelectedCtrl = [{fieldId:'NDC_TYPE'} as Metadata];
    component.remove(option1);
    expect(component.preSelectedCtrl.length).toEqual(1);

    expect(component.remove(null)).toEqual(undefined);
  }));

  it('displayfn(), should return the metadata field desc', async(() => {
    const obj = {fieldDescri:'NDCTYPE'} as Metadata;
    expect(component.displayFn(obj)).toEqual('NDCTYPE');
    expect(component.displayFn(null)).toEqual(null);
  }));

  it('ngOnChanges(), should call reset when reset filter', async(()=>{
    // mock data
    const chnages:import('@angular/core').SimpleChanges = {moduleId:{currentValue:'1005', previousValue: false, firstChange:null, isFirstChange:null}};

    // call actual method
    component.ngOnChanges(chnages);

    expect(component.moduleId).toBeTruthy();

    // mock data
    const chnages2:import('@angular/core').SimpleChanges = null;
    // call actual method
    component.ngOnChanges(chnages2);
    expect(component.ngOnChanges).toBeTruthy();
  }));

  it('add(), while search and enter then value should be set ', async(()=>{
    const event = {input:{value:''}} as MatChipInputEvent;
    // call actual method
    component.add(event);
    expect(component.add).toBeTruthy();

    const event1 = {value:''} as MatChipInputEvent;
    // call actual method
    component.add(event1);
    expect(component.add).toBeTruthy();
  }));

});
