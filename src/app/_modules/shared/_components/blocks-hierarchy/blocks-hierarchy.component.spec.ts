import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, FormArray, FormGroup, FormControl } from '@angular/forms';
import { SharedModule } from '@modules/shared/shared.module';
import { MdoUiLibraryModule } from 'mdo-ui-library';

import { BlocksHierarchyComponent } from './blocks-hierarchy.component';

describe('BlocksHierarchyComponent', () => {
  let component: BlocksHierarchyComponent;
  let fixture: ComponentFixture<BlocksHierarchyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlocksHierarchyComponent ],
      imports: [SharedModule, MdoUiLibraryModule, FormsModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlocksHierarchyComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit()', async(() => {
    expect(component.ngOnInit()).toBeUndefined();
  }));

  it('setBlockFormData()', async(() => {
    const test = new FormGroup({
      blocks: new FormArray([])
    });
    const child = [{
      blockType: '',
      conditionOperator: '',
      conditionFieldId: '',
      sourceObjectType: '',
      conditionalFieldValueCtrl: '',
      targetInfo: '',
      conditionFieldValue: '',
      conditionValueFieldId: '',
      sRegex: '',
      conditionFieldStartValue: '',
      conditionFieldEndValue: '',
      childs: []
    }];

    const blksList = [{
      blockType: '',
      conditionOperator: '',
      conditionFieldId: '',
      sourceObjectType: '',
      conditionalFieldValueCtrl: '',
      targetInfo: '',
      conditionFieldValue: '',
      conditionValueFieldId: '',
      sRegex: '',
      conditionFieldStartValue: '',
      conditionFieldEndValue: '',
      childs: child
    }];
    component.setBlockFormData(blksList, test, 'blocks');

    const arr = test.controls.blocks as FormArray;
    expect(arr.controls.length).toEqual(1);
  }));

  it('addBlock()', async(() => {
    const test = new FormArray([]);
    test.push(new FormGroup({condition: new FormControl('And')}))
    expect(component.addBlock({type: 'parent'}, test)).toBeUndefined();

    const formArr = new FormArray([]);
    const formCont = new FormGroup({
      condition: new FormControl('And')
    });
    formArr.push(formCont);
    const formGrp = new FormGroup({childs: formArr});
    expect(component.addBlock({type: 'child', formGrp}, test)).toBeUndefined();
  }));

  it('removeBlock()', async(() => {
    expect(component.removeBlock(new FormArray([]), 0)).toBeUndefined();
  }));

  it('updateList()', async(() => {
    spyOn(component.updateFldList, 'emit');
    component.updateList({});
    expect(component.updateFldList.emit).toHaveBeenCalled();
  }));

  it('updateParallelCondition()', async(() => {
    const test = new FormArray([]);
    expect(component.updateParallelCondition('AND', test)).toBeUndefined();
  }));

  it('getSourceFldCtrl()', async(() => {
    expect(component.getSourceFldCtrl(undefined, '')).toBeUndefined()
    expect(component.getSourceFldCtrl({fieldDescri: 'test'}, '')).toEqual({fieldDescri: 'test'});

    component.datasetList = [{moduleId: '1234', moduleDesc: 'test'}];
    expect(component.getSourceFldCtrl({fieldDescri: 'test'}, '123')).toEqual({fieldDescri: 'test'});
    expect(component.getSourceFldCtrl({fieldDescri: 'test'}, '1234')).toEqual({fieldDescri: 'test/test'});
    expect(component.getSourceFldCtrl({fieldDesc: 'test'}, '1234')).toEqual({fieldDescri: 'test/test', fieldDesc: 'test'});
    expect(component.getSourceFldCtrl({fieldId: 'test'}, '1234')).toEqual({fieldDescri: 'test/test', fieldId: 'test'});
    expect(component.getSourceFldCtrl({fieldId: 'test/test'}, '1234')).toEqual({fieldId: 'test/test'});
  }));
});
