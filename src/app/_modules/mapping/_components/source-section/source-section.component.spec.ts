import { SimpleChanges } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { SOURCE_FIELD } from '@modules/mapping/_common/utility-methods';
import { SharedModule } from '@modules/shared/shared.module';
import { HighlightPipe } from '@modules/shared/_pipes/highlight.pipe';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { SourceSectionComponent } from './source-section.component';

describe('SourceSectionComponent', () => {
  let component: SourceSectionComponent;
  let fixture: ComponentFixture<SourceSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SourceSectionComponent ],
      imports: [ AppMaterialModuleForSpec, SharedModule],
      providers: [ HighlightPipe ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SourceSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.control = new FormControl();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // test case for filter()
  it('filter(), should return the filtered list', () => {
    component.item = SOURCE_FIELD[0];
    let filteredList = component.filter('', component.item.fieldlist);
    expect(filteredList.length).toEqual(component.item.fieldlist.length);

    filteredList = component.filter('grid_Test_child_1', component.item.fieldlist);
    expect(filteredList.length).toEqual(1);
  });

  // test case for initiating search control
  it('initSearchControl(), should initiate the search control', () => {
    component.initializeSearchControl();
    expect(component.control).toBeTruthy();
  });

  // Test case for ngOnInit()
  it('ngOnInit(), should initiate the search control', () => {
    component.item = SOURCE_FIELD[0];
    spyOn(component, 'initializeSearchControl');
    component.ngOnInit();
    expect(component.control).toBeTruthy();
    expect(component.initializeSearchControl).toHaveBeenCalled();
  });

  // test case for fieldHasMapping()
  it('fieldHasMapping(), should return true if field has mapping', () => {
    component.existingMapping = [];
    let fieldHasMapping = component.fieldHasMapping('test_field_id');
    expect(fieldHasMapping).toBeFalsy();

    component.existingMapping = [
      {
        source: {
          fieldId: 'test_field_id',
          description: 'test_field_description'
        },
        target:{
          uuid: 'test_uuid',
          description: 'test_description'
        }
      }
    ];
    fieldHasMapping = component.fieldHasMapping('test_field_id');
    expect(fieldHasMapping).toBeTruthy();
  });

  // Test case for selectSourceField() and emit the selected field
  it('selectSourceField(), should select the source field and emit selected field', () => {
    component.item = SOURCE_FIELD[0];
    spyOn(component.sourceSelected, 'emit');
    component.selectSourceField(component.item.fieldlist[0]);
    expect(component.sourceSelected.emit).toHaveBeenCalled();
  });

  // test case for getMappedField() from existing mapping by targetUuid
  it('getMappedField(), should return the mapped field', () => {
    component.existingMapping = [
      {
        source: {
          fieldId: 'test_field_id',
          description: 'test_field_description'
        },
        target:{
          uuid: 'test_uuid',
          description: 'test_description'
        }
      }
    ];
    const mappedField = component.getMappedField('test_uuid');
    expect(mappedField).toEqual(component.existingMapping[0].source);
  });

  // test case for isSelected() from currentMapping using fieldId
  it('isSelected(), should return true if field is selected', () => {
    component.currentMapping = {
        source: {
          fieldId: 'test_field_id',
          description: 'test_field_description'
        },
        target:{
          uuid: 'test_uuid',
          description: 'test_description'
        }
      };
    const isSelected = component.isSelected('test_field_id');
    expect(isSelected).toBeTruthy();
  });

  // test case for showMappedTargets() and emit the fieldId
  it('showMappedTargets(), should show the mapped targets and emit the fieldId', () => {
    component.item = SOURCE_FIELD[0];
    spyOn(component.showTargets, 'emit');
    component.showMappedTargets(component.item.fieldlist[0].fieldId);
    expect(component.showTargets.emit).toHaveBeenCalled();
  });

  // test case for tracking object using index and item passed
  it('trackByFn(), should return the index and item', () => {
    const index = 0;
    const item = SOURCE_FIELD[0].fieldlist[0];
    const result = component.trackSourceItem(index, item);
    expect(result).toEqual(item.fieldId);
  });

  // test whether to show badge if cursorState is equal to fieldId passed
  it('showBadge(), should return true if cursorState is equal to fieldId', () => {
    component.cursorState = 'test_field_id';
    const showBadge = component.showBadge(true, 'test_field_id');
    expect(showBadge).toBeTruthy();
  });

  // test case for ngOnChanges() to check changes in control value and to initialize the search control
  it('ngOnChanges(), should initialize the search control', () => {
    component.control = new FormControl();
    const changes: SimpleChanges = {
      control: {
        currentValue: new FormControl(),
        previousValue: null,
        firstChange: false,
        isFirstChange: () => false
      }
    };
    spyOn(component, 'initializeSearchControl');
    component.ngOnChanges(changes);
    expect(component.initializeSearchControl).toHaveBeenCalled();
  });
});
