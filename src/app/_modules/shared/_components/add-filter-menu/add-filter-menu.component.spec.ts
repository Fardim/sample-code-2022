import { CoreService } from '@services/core/core.service';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AddFilterMenuComponent } from './add-filter-menu.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { FilterValuesComponent } from '../filter-values/filter-values.component';
import { SearchInputComponent } from '../search-input/search-input.component';
import { of } from 'rxjs';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { FilterCriteria, MetadataModel } from '@models/schema/schemadetailstable';
import { SchemaService } from '@services/home/schema.service';
import { DropDownValue } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { SimpleChanges } from '@angular/core';

describe('AddFilterMenuComponent', () => {
  let component: AddFilterMenuComponent;
  let fixture: ComponentFixture<AddFilterMenuComponent>;
  let schemaDetailService: jasmine.SpyObj<SchemaDetailsService>;
  let schemaService: jasmine.SpyObj<SchemaService>;
  let coreService: CoreService;

  beforeEach(async(() => {
    const spyObj = jasmine.createSpyObj('SchemaService', ['dropDownValues', 'generateColumnByFieldId']);
    TestBed.configureTestingModule({
      declarations: [ AddFilterMenuComponent, FilterValuesComponent, SearchInputComponent ],
      imports: [ MdoUiLibraryModule, AppMaterialModuleForSpec],
      providers: [SchemaDetailsService,
        { provide: SchemaService, useValue: spyObj }]
    })
    .compileComponents();
    schemaDetailService = TestBed.inject(SchemaDetailsService) as jasmine.SpyObj<SchemaDetailsService>;
    schemaService = TestBed.inject(SchemaService) as jasmine.SpyObj<SchemaService>;
  }));
  
  beforeEach(() => {
    fixture = TestBed.createComponent(AddFilterMenuComponent);
    component = fixture.componentInstance;
    coreService = fixture.debugElement.injector.get(CoreService);
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(`initMetadata(), should add field values to metadata dropdown`, async(() => {
    const data = ['testData1', 'testData2', 'testData3'];
    component.initMetadata(data);
    expect(component.metadaDrop.length).toEqual(3);
    expect(component.selectedValues.length).toEqual(0);
    expect(component.activateElement).toEqual(null);
    expect(component.searchDrop.length).toEqual(3);
  }));

  it(`getFldMetadata(), `, async(() => {
    const response = {
      headers: '',
      grids: '',
      hierarchy: [],
      gridFields: '',
      hierarchyFields: []
  };
  // spyOn(schemaDetailService, 'getMetadataFields').and.returnValue(of(response));
  spyOn(coreService, 'getMetadataFieldsByModuleId').and.returnValue(of(response));
  spyOn(component.metadata, 'next');

  component.moduleId = '1005';
  component.getFldMetadata();

  // component.moduleId = '1005';
  expect(coreService.getMetadataFieldsByModuleId).toHaveBeenCalledTimes(1);
  // expect(component.metadata.next).toHaveBeenCalledWith(response);

  }));

  it(`searchField(), search metadat fields according to the search field`, async(() => {
    component.searchDrop = [
      {fieldDescri:'Function Location 1', fieldId:'EQEX_FL1'} as MetadataModel,
      {fieldDescri:'Function Location 2', fieldId:'EQEX_FL2'} as MetadataModel,
      {fieldId: 'EQEX_SEQ2', fieldDescri: 'Equipment 2'} as MetadataModel
    ]
    const searchvalue = 'fun'
    component.searchField(searchvalue);
    expect(component.metadaDrop.length).toEqual(2);

    const searchvalue1 = ''
    component.searchField(searchvalue1);
    expect(component.metadaDrop.length).toEqual(3);

    const searchvalue2 = 'val'
    component.searchField(searchvalue2);
    expect(component.metadaDrop.length).toEqual(0);
  }));

  it(`dropDownValues(), get business rules service`, async(() => {
    const returnData: DropDownValue[] = [];
    schemaService.dropDownValues.and.returnValue(of(returnData));
    component.getDropdownValues('testId', '');
    expect(schemaService.dropDownValues).toHaveBeenCalled();
  }));

  it('ctrlFlds(), should get fields according to field id', async() => {
    const fld = {
      fieldId: 'APPROVAR_ID'
    } as MetadataModel

    component.moduleId = '10054';
    component.alreadySelectedValues = [
      {
        fieldId: 'APPROVAR_ID',
        values: ['AshishKr', 'SRana']
      },
      {
        fieldId: 'MATL_TYPE',
        values: ['SIL', 'GOL']
      }
    ] as FilterCriteria[]

    component.ctrlFlds(fld);
    expect(component.dropValuesCode.length).toEqual(2);

    component.moduleId = '';
    component.ctrlFlds(fld);
    expect(schemaService.generateColumnByFieldId).toHaveBeenCalled();

  })

  it(`should transform metadata, `, async(() => {
    const metadata = {
      headers: {
        dlerrdhd2747: { fieldId: 'dlerrdhd2747',  fieldDescri: '', picklist: '0'}
      },
      grids: '',
      hierarchy: [],
      gridFields: '',
      hierarchyFields: []
  };
  spyOn(component,'initGridAndHierarchyToAutocompleteDropdown');

  component.tarnsformMetada(metadata);
  expect(component.metadaDrop.length).toEqual(0);
  expect(component.searchDrop.length).toEqual(0);

  }));

  it(`should emit applied filters `, async(() => {

    const drop = [{CODE: 'MTL_GRP',  PLANTCODE: '1005'}] as DropDownValue[];
    spyOn(component.evtReadyForApply, 'emit');

    component.emitAppliedFilter(drop)

    expect(component.selectedValues).toEqual(drop);
    expect(component.activateElement).toBeNull();
    expect(component.evtReadyForApply.emit).toHaveBeenCalled();

  }));

  it(`should move to previous status `, async(() => {

    const metadata = {
      headers: {},
      grids: '',
      hierarchy: [],
      gridFields: '',
      hierarchyFields: []
    };

    spyOn(component.metadata, 'next');

    const event = new Event('click');

    component.prevState(event);
    expect(component.metadaDrop).toEqual([]);

    component.moduleId = '1005';
    component.prevState(event);

    component.metadata.next(metadata);
    component.prevState(event);

    expect(component.metadata.next).toHaveBeenCalledTimes(1);

  }));

  it('update on changes', () => {

    spyOn(component, 'getFldMetadata');
    spyOn(component, 'initMetadata');
    spyOn(component.metadata, 'next');
    spyOn(component.currentFields, 'next');

    component.ngOnInit();

    let changes:SimpleChanges = {moduleId:{currentValue:'1005', previousValue: '1005', firstChange:null, isFirstChange:null}};
    component.ngOnChanges(changes);

    changes.moduleId.currentValue = '1006';
    component.ngOnChanges(changes);

    changes.moduleId.currentValue = '';
    component.ngOnChanges(changes);

    changes = {reInilize:{currentValue:false, previousValue: false, firstChange:null, isFirstChange:null}};
    component.ngOnChanges(changes);

    changes.reInilize.currentValue = true;
    component.ngOnChanges(changes);

    component.moduleId = '1005';
    component.ngOnChanges(changes);


    changes = {fieldMetadata:{currentValue:null, previousValue: null, firstChange:null, isFirstChange:null}};
    component.ngOnChanges(changes);

    changes.fieldMetadata.currentValue = [];
    component.ngOnChanges(changes);


    expect(component.getFldMetadata).toHaveBeenCalledTimes(1);
    expect(component.initMetadata).toHaveBeenCalledTimes(4);
    expect(component.metadata.next).toHaveBeenCalledTimes(1);
    expect(component.currentFields.next).toHaveBeenCalledTimes(1);

  })

});
