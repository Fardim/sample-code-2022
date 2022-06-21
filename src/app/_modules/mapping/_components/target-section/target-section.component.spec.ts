import { SimpleChanges } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { TARGET_FIELD } from '@modules/mapping/_common/utility-methods';
import { SharedModule } from '@modules/shared/shared.module';
import { HighlightPipe } from '@modules/shared/_pipes/highlight.pipe';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { TargetSectionComponent } from './target-section.component';

describe('TargetSectionComponent', () => {
  let component: TargetSectionComponent;
  let fixture: ComponentFixture<TargetSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TargetSectionComponent ],
      imports: [ AppMaterialModuleForSpec, SharedModule],
      providers: [ HighlightPipe ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TargetSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.control = new FormControl();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test case for ngOnInit()
  it('ngOnInit(), should initiate the search control', () => {
    component.item = TARGET_FIELD[1];
    spyOn(component, 'initializeSearchControl');
    component.ngOnInit();
    expect(component.control).toBeTruthy();
    expect(component.initializeSearchControl).toHaveBeenCalled();
  });

  // Test case for isSelected()
  it('isSelected(), should return true if the item is selected', () => {
    component.currentMapping = {
      source: {
        fieldId: '1',
        description: 'source'
      },
      target: {
        uuid: '2',
        description: 'target'
      }
    };
    expect(component.isSelected('2')).toBeTruthy();
  });

  // Test case for tracking target item trackTargetItem()
  it('trackTargetItem(), should track the target item', () => {
    const uuid = component.trackTargetItem(null, TARGET_FIELD[0].mdoMappings[0]);
    expect(uuid).toEqual('c-111');
  });

  // test case for initiating search control
  it('initSearchControl(), should initiate the search control', () => {
    component.initializeSearchControl();
    expect(component.control).toBeTruthy();
  });

  // test case for filter()
  it('filter(), should return the filtered list', () => {
    const filteredList = component.filter('Field Name', TARGET_FIELD[0].mdoMappings);
    expect(filteredList.length).toEqual(1);
  });

  // test case for selectTargetField() to emit the passed target field
  it('selectTargetField(), should emit the passed target field', () => {
    spyOn(component.targetSelected, 'emit');
    component.selectTargetField(TARGET_FIELD[0].mdoMappings[0]);
    expect(component.targetSelected.emit).toHaveBeenCalled();
  });

  // test case for emitMouseEvent() to emit the passed value
  it('emitMouseEvent(), should emit the passed value', () => {
    spyOn(component.mouseOnTarget, 'emit');
    component.emitMouseEvent(true);
    expect(component.mouseOnTarget.emit).toHaveBeenCalled();
  });

  // Test case for ngOnChanges()
  it('ngOnChanges(), should initiate the search control', () => {
    component.control = new FormControl();
    const changes: SimpleChanges = {
      control: {
        currentValue: new FormControl(),
        previousValue: null,
        firstChange: false,
        isFirstChange: () => false
      },
      currentMapping: {
        currentValue: {
          source: {
            fieldId: '1',
            description: 'one'
          },
          target: {
            uuid: '2',
            description: 'two'
          }
        },
        previousValue: null,
        firstChange: false,
        isFirstChange: () => false
      }
    };
    spyOn(component, 'initializeSearchControl');
    component.ngOnChanges(changes);
    expect(component.currentMapping).toEqual(changes.currentMapping.currentValue);
    expect(component.initializeSearchControl).toHaveBeenCalled();
  });
});
