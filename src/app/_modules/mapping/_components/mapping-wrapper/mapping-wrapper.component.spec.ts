import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { SimpleChanges } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MdoFieldlistItem, MdoMappings } from '@models/mapping';
import { SOURCE_FIELD, TARGET_FIELD } from '@modules/mapping/_common/utility-methods';
import { SharedModule } from '@modules/shared/shared.module';
import { MappingService } from '@services/mapping/mapping.service';
import { of, Subscription } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { MappingWrapperComponent } from './mapping-wrapper.component';

describe('MappingWrapperComponent', () => {
  let component: MappingWrapperComponent;
  let fixture: ComponentFixture<MappingWrapperComponent>;
  let scrollDispatcher: ScrollDispatcher;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MappingWrapperComponent ],
      imports: [AppMaterialModuleForSpec, SharedModule],
      providers: [MappingService, ScrollDispatcher]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MappingWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    scrollDispatcher = fixture.debugElement.injector.get(ScrollDispatcher);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sourceFields, should have an initial default value', () => {
    expect(component.sourceFields).toEqual([]);
  });

  it('targetFields, should have an initial default value', () => {
    expect(component.targetFields).toEqual([]);
  });

  it('existingMapping, should have an initial default value', () => {
    expect(component.existingMapping).toEqual([]);
  });

  it('sourceControl, should have an initial default value', () => {
    expect(component.sourceControl.value).toEqual('');
  });

  it('targetControl, should have an initial default value', () => {
    expect(component.targetControl.value).toEqual('');
  });

  it('mappingSourceLoader , should have an initial default value', () => {
    expect(component.mappingSourceLoader).toEqual(false);
  });

  it('mappingTargetLoader , should have an initial default value', () => {
    expect(component.mappingTargetLoader).toEqual(false);
  });

  it('mapping , should have an initial default value', () => {
    expect(component.mapping).not.toBeNull();
  });

  it('currentMapping , should have an initial default value', () => {
    expect(component.currentMapping).toEqual({
      source: { fieldId: '', description: '', data: null },
      target: { uuid: '', description: '' },
      line: null
    });
  });

  it('existingMapping , should have an initial default value', () => {
    expect(component.existingMapping.length).toEqual(0);
  });

  it('lineOptions , should have an initial default value', () => {
    expect(component.lineOptions).toEqual({
      dashed: false,
    color: '#339AF0',
    size: 1,
    path: 'straight',
    startPlug: 'disc',
    endPlug: 'arrow1',
    startPlugSize: 3,
    endPlugSize: 3,
    startPlugOutline: 1,
    endPlugOutline: 1,
    });
  });

  it('droppedOnTarget, should have an initial default value', () => {
    expect(component.droppedOnTarget).toEqual(false);
  });

  it('sourceMenuToggle, should have an initial default value', () => {
    expect(component.sourceMenuToggle).toEqual(true);
  });

  it('targetMenuToggle , should have an initial default value', () => {
    expect(component.targetMenuToggle).toEqual(true);
  });

  // it('createExistingMappings(), should create existing mapping list', () => {
  //   const result = component.createExistingMappings(TARGET_FIELD);
  //   expect(result.length).toEqual(2);
  // });

  it('selectSourceField(), should select the source field and update currentMapping', () => {
    const sourceField: MdoFieldlistItem = SOURCE_FIELD[0].fieldlist[0];

    spyOn(component, 'handleMappingError').and.callThrough();
    spyOn(component, 'disableLineDraw').and.callThrough();

    component.droppedOnTarget = true;
    component.selectSourceField(sourceField);

    expect(component.currentMapping.source.fieldId).toEqual(sourceField.fieldId);
  });

  it('selectTargetField(), should select the target field', () => {
    const targetField: MdoMappings = TARGET_FIELD[0].mdoMappings[0];

    spyOn(component, 'handleMappingError').and.callThrough();
    spyOn(component, 'addMapping');
    spyOn(component, 'disableLineDraw').and.callThrough();
    spyOn(component, 'fieldHasMapping').withArgs('c-111', false).and.returnValue(false);

    component.currentMapping.source.fieldId = '123';
    component.currentMapping.source.description = 'abc';
    component.selectTargetField(targetField);

    expect(component.currentMapping.target.uuid).toEqual('c-111');
    expect(component.addMapping).toHaveBeenCalledWith(component.currentMapping);
  });

  it('selectTargetField(), should set banner text on error', () => {
    const targetField: MdoMappings = TARGET_FIELD[0].mdoMappings[0];
    component.currentMapping.source.fieldId = '123';
    spyOn(component, 'handleMappingError').and.callThrough();
    spyOn(component, 'addMapping').and.callThrough();
    spyOn(component, 'disableLineDraw').and.callThrough();
    spyOn(component, 'fieldHasMapping').and.returnValue(true);

    component.selectTargetField(targetField);

    expect(component.bannerText).toEqual('The target field you selected has already been mapped');
    expect(component.handleMappingError).toHaveBeenCalledWith('The target field you selected has already been mapped');
  });

  it('disableLineDraw(), should remove method on an existing line and unsubscribe mouse movment', () => {
    component.movementSubscriber = new Subscription(null);
    component.disableLineDraw();
    spyOn(component.movementSubscriber, 'unsubscribe');
    const lineArea = {
      start: document.createElement('div'),
      end: document.createElement('div')
    }
    lineArea.start.id = 'start';
    lineArea.end.id = 'end';
    component.disableLineDraw();
    expect(component.movementSubscriber.unsubscribe).toHaveBeenCalled();
  });

  it('enableLineDraw(), should enable line darw and cretae a dynamic element', () => {
    const el = document.createElement('div');
    const mappingArea = document.createElement('div');
    mappingArea.id = 'mapping-area';
    el.id = 'one';
    spyOn(document, 'getElementById');
    spyOn(component, 'removeAllMappingLines').and.callThrough();
    component.enableLineDraw('one');
    expect(document.getElementById).toHaveBeenCalled();
    expect(component.removeAllMappingLines).toHaveBeenCalled();
  });

  it('showMappedTargets(), should show mapped targets', () => {
    component.existingMapping = [
      {
        source: {
          fieldId: '456',
          description: '22'
        },
        target: {
          uuid: 'c-1131',
          description: '654'
        }
      },
      {
        source: {
          fieldId: '123',
          description: 'abc'
        },
        target: {
          uuid: 'c-111',
          description: 'xyz'
        }
      }
    ];
    spyOn(component, 'removeAllMappingLines');
    spyOn(component, 'fieldHasMapping').and.returnValue(true);
    spyOn(component, 'drawSavedMappings');
    spyOn(component, 'refreshMappingPosition');
    spyOn(component, 'scrollToTargetField');
    component.showMappedTargets('123');
    expect(component.removeAllMappingLines).toHaveBeenCalled();
    expect(component.scrollToTargetField).toHaveBeenCalled();
    expect(component.drawSavedMappings).toHaveBeenCalled();
    expect(component.refreshMappingPosition).toHaveBeenCalled();
  });

  it('refreshMappingPosition(), should refresh all existing mapping positions', () => {
    component.mappingList = [
      {
        source: {
          fieldId: '456',
          description: '22'
        },
        target: {
          uuid: 'c-1131',
          description: '654'
        }
      }
    ];
    spyOn(component, 'refreshPosition').withArgs(component.mappingList[0]);
    component.refreshMappingPosition();
    expect(component.refreshPosition).toHaveBeenCalledWith(component.mappingList[0]);
  });

  it('fieldHasMapping(), should check if a field is already mapped', () => {
    component.existingMapping = [
      {
        source: {
          fieldId: '456',
          description: '22'
        },
        target: {
          uuid: 'c-1131',
          description: '654'
        }
      }
    ];
    expect(component.fieldHasMapping('456', true)).toBeTruthy();
    expect(component.fieldHasMapping('456', false)).toBeFalsy();
  });

  it('isSourceSelected(), whether a source field is selected', () => {
    component.currentMapping = {
      source: {
        fieldId: 'FLD_F380349220',
        description: 'Field Name'
      },
      target: {
        uuid: 'c-111',
        description: '/1CN/CTXSAPD0001'
      }
    };

    expect(component.isSourceSelected('FLD_F380349220')).toBeTruthy();
  });

  it('addMapping(), should create existing mapping list', () => {
    component.currentMapping = {
      source: {
        fieldId: 'FLD_F380349220',
        description: 'Field Name'
      },
      target: {
        uuid: 'c-112',
        description: '/1CN/CTXSAPD0002'
      }
    };

    component.mappingList = [];

    spyOn(component, 'updateTargetFields').withArgs(component.currentMapping).and.returnValue(TARGET_FIELD);
    component.addMapping(component.currentMapping);
    expect(component.mappingList.length).toEqual(1);
  });

  it('findSourceField(), should find the source field', () => {
    const field: MdoFieldlistItem = component.findSourceField('grid_Test_child_1', SOURCE_FIELD);
    expect(field).not.toBeNull();
  });

  it('getMappedField(), should get mapped field', () => {
    component.existingMapping = [
      {
        source: {
          fieldId: '456',
          description: '22'
        },
        target: {
          uuid: 'c-1131',
          description: '654'
        }
      }
    ];

    const res = component.getMappedField('c-1131');
    expect(res).toEqual(component.existingMapping[0].source);
  });

  it('onTabChange(), should remove all mapping', () => {
    spyOn(component, 'removeAllMappingLines');
    component.onTabChange();
    expect(component.removeAllMappingLines).toHaveBeenCalled();
  });

  it('trackSource(), should return structure id', () => {
    const res = component.trackSource(null, SOURCE_FIELD[0]);
    expect(res).toEqual('1');
  });

  it('trackTarget(), should return uuid', () => {
    const res = component.trackTarget(null, TARGET_FIELD[0]);
    expect(res).toEqual('p-111');
  });

  it('ngOnChanges(), should detect changes', () => {
    const changes: SimpleChanges = {
      mappingSourceLoader: {
        currentValue: false,
        previousValue: true,
        firstChange: false,
        isFirstChange: () => false
      },
      mappingTargetLoader: {
        currentValue: true,
        previousValue: false,
        firstChange: false,
        isFirstChange: () => false
      },
      existingMapping: {
        currentValue: [
          {
            source: {
              fieldId: '456',
              description: '22'
            },
            target: {
              uuid: 'c-1131',
              description: '654'
            }
          }
        ],
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false
      },
      reloadMappingData: {
        currentValue: true,
        previousValue: null,
        firstChange: false,
        isFirstChange: () => false
      },
    };

    component.ngOnChanges(changes);
    expect(changes.mappingSourceLoader.previousValue).toEqual(true);
    expect(changes.mappingSourceLoader.currentValue).toEqual(false);

    expect(changes.mappingTargetLoader.previousValue).toEqual(false);
    expect(changes.mappingTargetLoader.currentValue).toEqual(true);

    expect(changes.reloadMappingData.previousValue).toEqual(null);
    expect(changes.reloadMappingData.currentValue).toEqual(true);

    expect(changes.existingMapping.previousValue.length).toEqual(0);
    expect(changes.existingMapping.currentValue.length).toEqual(1);
  });

  it('onScroll(), should refresh position on scroll', () => {
    component.mappingList = [
      {
        source: {
          fieldId: '456',
          description: '22'
        },
        target: {
          uuid: 'c-1131',
          description: '654'
        }
      }
    ];
    spyOn(component, 'refreshPosition').withArgs(component.mappingList[0]);
    component.onScroll(null);
    expect(component.refreshPosition).toHaveBeenCalledWith(component.mappingList[0]);
  });

  it('ngAfterViewInit(), should call onscroll', () => {
    spyOn(scrollDispatcher, 'scrolled').and.returnValue(of(null));
    spyOn(component, 'onScroll');
    component.ngAfterViewInit();
    expect(component.onScroll).toHaveBeenCalled();
  });

  // Test case for initializeSourceSearchControl()
  it('initializeSourceSearchControl(), should init the search Control', () => {
    component.sourceFields = SOURCE_FIELD;
    spyOn(component, 'removeAllMappingLines');
    component.initializeSourceSearchControl();
    expect(component.sourceControl.valueChanges).toBeTruthy();
  });

  // Test case for initializeTargetSearchControl()
  it('initializeTargetSearchControl(), should init the search Control', () => {
    component.targetFields = TARGET_FIELD;
    spyOn(component, 'removeAllMappingLines');
    component.initializeTargetSearchControl();
    expect(component.targetControl.valueChanges).toBeTruthy();
  });

  // Test case for mappingList
  it('mappingList, should return mapping list', () => {
    component.mappingList = [
      {
        source: {
          fieldId: '456',
          description: '22'
        },
        target: {
          uuid: 'c-1131',
          description: '654'
        }
      }
    ];
    expect(component.mappingList.length).toEqual(1);
  });

  // Test case for updateRemoveMappingButtonPosition()
  it('updateRemoveMappingButtonPosition(), should update the position of remove mapping button', () => {
    const source = document.createElement('div');
    source.setAttribute('id', 'source');
    const target = document.createElement('div');
    target.setAttribute('id', 'target');

    spyOn(document, 'getElementById').withArgs('source__+__target');
    component.updateRemoveMappingButtonPosition(source, target);
    expect(document.getElementById).toHaveBeenCalledWith('source__+__target');
  });


  // Test case for drawSavedMappings()
  it('drawSavedMappings(), should draw saved mappings', () => {
    component.mappingList = [
      {
        source: {
          fieldId: '456',
          description: '22'
        },
        target: {
          uuid: 'c-1131',
          description: '654'
        }
      }
    ];
    spyOn(component, 'redrawMappingLines');
    component.drawSavedMappings(true);
    expect(component.redrawMappingLines).toHaveBeenCalled();
    component.drawSavedMappings(false);
    expect(component.redrawMappingLines).toHaveBeenCalled();
  });

  // Test case for redrawMappingLines()
  it('redrawMappingLines(), should redraw mapping lines', () => {
    component.mappingList = [
      {
        source: {
          fieldId: '456',
          description: '22'
        },
        target: {
          uuid: 'c-1131',
          description: '654'
        },
        line: {
          remove: () => { }
        }
      }
    ];
    spyOn(component, 'drawLine').withArgs(component.mappingList[0]);
    component.redrawMappingLines(component.mappingList[0]);
    expect(component.drawLine).toHaveBeenCalledWith(component.mappingList[0]);
  });

  // Test case to updateTargetFields()
  it('updateTargetFields(), should update target fields', () => {
    component.targetFields = TARGET_FIELD;
    expect(component.updateTargetFields({
      source: {
        fieldId: '456',
        description: '22'
      },
      target: {
        uuid: 'c-1131',
        description: '654'
      }}, TARGET_FIELD).length).toEqual(4);
  });

  // Test case for findAndUpdateTargetFields()
  // it('findAndUpdateTargetFields(), should find and update target fields', () => {
  //   component.targetFields = TARGET_FIELD;
  //   expect(component.findAndUpdateTargetFields({
  //     source: {
  //       fieldId: '456',
  //       description: '22'
  //     },
  //     target: {
  //       uuid: 'c-1131',
  //       description: '654'
  //     }}, TARGET_FIELD[0].mdoMappings).length).toEqual(2);
  // });

  // Test case to removeAllMappingLines()
  it('removeAllMappingLines(), should remove all mapping lines', () => {
    component.mappingList = [
      {
        source: {
          fieldId: '456',
          description: '22'
        },
        target: {
          uuid: 'c-1131',
          description: '654'
        },
        line: {
          remove: () => { }
        }
      }
    ];
    spyOn(component.mappingList[0].line, 'remove');
    component.removeAllMappingLines();
    expect(component.mappingList[0].line).toEqual(null);
  });

  // Test case for removeMapping()
  it('removeMapping(), should remove mapping', () => {
    component.mappingList = [
      {
        source: {
          fieldId: '456',
          description: '22'
        },
        target: {
          uuid: 'c-1131',
          description: '654'
        },
        line: {
          remove: () => { }
        }
      }
    ];
    spyOn(component.mappingList[0].line, 'remove');
    spyOn(component, 'updateMapping');
    component.removeMapping(document.createElement('div'));
    // expect(component.mappingList[0].line.remove()).toHaveBeenCalled();
    expect(component.updateMapping).toHaveBeenCalled();
  });
});
