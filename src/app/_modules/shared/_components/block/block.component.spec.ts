import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatMenuModule } from '@angular/material/menu';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { FormArray, FormGroup, FormControl, FormsModule } from '@angular/forms';

import { BlockComponent } from './block.component';
import { SharedModule } from '@modules/shared/shared.module';
import { TragetInfo } from 'src/app/_constants';
import { Metadata } from '@modules/report/edit/container/metadatafield-control/metadatafield-control.component';

describe('BlockComponent', () => {
  let component: BlockComponent;
  let fixture: ComponentFixture<BlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockComponent ],
      imports: [MdoUiLibraryModule, MatMenuModule, MatAutocompleteModule, FormsModule, SharedModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockComponent);
    component = fixture.componentInstance;
    component.blockCtrl = new FormGroup({
      sourceFldCtrl: new FormControl(''),
      preSelectedSourceFld: new FormControl(''),
      operator: new FormControl(''),
      preSelectedTargetFld: new FormControl(''),
      targetInfo: new FormControl(''),
      targetFldCtrl: new FormControl(''),
      conditionFieldStartValue: new FormControl(''),
      conditionFieldEndValue: new FormControl(''),
      childs: new FormArray([new FormControl('')]),
      sourceFldObjType: new FormControl(''),
      condition: new FormControl('')
    });
    component.allSourceFields = [
      {
        childs: [
          {
            fieldId: '1234'
          }
        ]
      }
    ];
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOninit(), component init', async(() => {
    expect(component.ngOnInit()).toBeUndefined();
  }));

  it('setComparisonValue()', async(() => {
    component.setComparisonValue('test');
    expect(component.blockCtrl.value.targetInfo).toEqual(TragetInfo.VALUE);

    component.setComparisonValue({fieldId: '1234'});
    expect(component.blockCtrl.value.targetInfo).toEqual(TragetInfo.FIELD);

    component.setComparisonValue({start: 'start', end: 'end'});
    expect(component.blockCtrl.value.targetInfo).toEqual(TragetInfo.VALUE);
  }));

  it('setFldValue()', async(() => {
    component.blockCtrl.controls.preSelectedSourceFld.setValue('1234');
    expect(component.setFldValue('sourceFldCtrl', 'preSelectedSourceFld', component.allSourceFields)).toBeUndefined();

    component.blockCtrl.controls.preSelectedSourceFld.setValue('12345');
    expect(component.setFldValue('sourceFldCtrl', 'preSelectedSourceFld', component.allSourceFields)).toBeUndefined();

    component.blockCtrl.controls.preSelectedSourceFld.setValue(undefined);
    expect(component.setFldValue('sourceFldCtrl', 'preSelectedSourceFld', component.allSourceFields)).toBeUndefined();
  }));

  it('updateFldList()', async(() => {
    component.initialSrcList = ['test'];
    component.updateFldList('', '');
    expect(component.allSourceFields).toEqual(component.initialSrcList);

    component.initialSrcList = null;
    spyOn(component.updateList, 'emit');
    component.updateFldList('', 'test');
    expect(component.updateList.emit).toHaveBeenCalled();
  }));

  it('getFormCtrl()', async(() => {
    component.blockCtrl.controls.preSelectedSourceFld.setValue('1234');
    const res = component.getFormCtrl('preSelectedSourceFld');
    expect(res.value).toEqual('1234');
  }));

  it('selectOperator()', async(() => {
    const el = document.createElement('input');
    expect(component.selectOperator({}, el)).toBeUndefined();

    expect(component.selectOperator({})).toBeUndefined();
  }));

  it('selectSrcFld()', async(() => {
    const data: Metadata = {
      fieldId: '1234',
      fieldDescri: 'test',
      isGroup: false,
      childs: [],
      moduleId: '123'
    };
    component.selectSrcFld({option: {value: data}});

    expect(component.blockCtrl.value.preSelectedSourceFld).toEqual('1234');
  }));

  it('display Funcitons', async(() => {
    expect(component.displayFldVal({value: 'test'})).toEqual('test');
    expect(component.displayFldVal({code: 'test'})).toEqual('test');

    const data: Metadata = {
      fieldId: '1234',
      fieldDescri: 'test',
      isGroup: false,
      childs: [],
      moduleName: 'Test'
    };
    expect(component.displayFn(data)).toEqual('Test/test');
    expect(component.displayFn(undefined)).toEqual(null);

    expect(component.displayOperatorFn('EQUAL')).toEqual('EQUALS');
    expect(component.displayOperatorFn('LENGTH_GREATER_THEN')).toEqual('LENGTH GREATER THAN');
    expect(component.displayOperatorFn('LENGTH_LESS_THEN')).toEqual('LENGTH LESS THAN');
    expect(component.displayOperatorFn('NOT_EQUALS')).toEqual('NOT EQUALS');

    expect(component.getDropdownPos(undefined)).toEqual('chevron-down');
  }));

  it('getValue()', async(() => {
    component.blockCtrl.controls.preSelectedSourceFld.setValue('1234');
    expect(component.getValue('preSelectedSourceFld')).toEqual('1234');
  }));

  it('addblock()', async(() => {
    expect(component.addblock('child')).toBeUndefined();
  }));

  it('removeBlock()', async(() => {
    spyOn(component.deleteBlock, 'emit');
    component.removeBlock();
    expect(component.deleteBlock.emit).toHaveBeenCalled();
  }));

  it('setSourceFieldList()', async(() => {
    component.initialSrcList = undefined;
    expect(component.setSourceFieldList('')).toBeUndefined();
  }));

  it('isResultCount()', async(() => {
    component.isResultCount();
    component.canDisplay('NOT_EQUAL');

    component.blockCtrl.controls.preSelectedSourceFld.setValue('RESULT_COUNT');
    component.canDisplay('NOT_EQUAL');

    expect(component.blockCtrl.value.operator).toEqual('');
  }));

  it('getConditionName()', async(() => {
    component.blockCtrl.controls.condition.setValue('AND');
    component.possibleConditions = ['And']
    expect(component.getConditionName()).toEqual('And');
  }));

  it('updateCondition()', async(() => {
    spyOn(component.updateParallelCondition, 'emit');
    component.updateCondition('And');
    expect(component.updateParallelCondition.emit).toHaveBeenCalled();
  }));

  it('isDeletable()', async(() => {
    expect(component.isDeletable()).toBeFalse();

    const arr = new FormArray([]);
    const ctrl = new FormGroup({
      test: new FormControl(''),
      childs: new FormArray([])
    });
    arr.push(ctrl);
    component.blocksGrp = new FormGroup({
      blocks: arr
    });
    expect(component.isDeletable()).toBeFalse();

    const arr1 = new FormArray([]);
    const ctrl1 = new FormGroup({
      test: new FormControl(''),
      childs: new FormArray([ctrl])
    });
    arr1.push(ctrl1);
    component.blocksGrp = new FormGroup({
      blocks: arr1
    });
    expect(component.isDeletable()).toBeFalse();

    component.blocksGrp = new FormGroup({
      blocks: new FormArray([])
    });
    expect(component.isDeletable()).toBeFalse();
  }));

  it('getFieldTooltip()', async(() => {
    expect(component.getFieldTooltip('src')).toEqual(null);

    component.blockCtrl.controls.sourceFldCtrl.setValue('test');
    expect(component.getFieldTooltip('source')).toEqual('test');

    const data: Metadata = {
      fieldId: 'test',
      fieldDescri: 'test',
      isGroup: false,
      childs: []
    };
    component.blockCtrl.controls.sourceFldCtrl.setValue(data);
    expect(component.getFieldTooltip('source')).toEqual('test');

    component.blockCtrl.controls.operator.setValue('EQUAL');
    expect(component.getFieldTooltip('operator')).toEqual('EQUALS');

    component.blockCtrl.controls.operator.setValue('EMPTY');
    expect(component.getFieldTooltip('target')).toEqual('Comparison Value');

    component.blockCtrl.controls.operator.setValue('EQUALS');
    component.blockCtrl.controls.preSelectedTargetFld.setValue(undefined);
    expect(component.getFieldTooltip('target')).toEqual('Comparison Value');

    component.blockCtrl.controls.targetInfo.setValue(TragetInfo.VALUE);
    component.blockCtrl.controls.preSelectedTargetFld.setValue('test');
    expect(component.getFieldTooltip('target')).toEqual('test');

    component.blockCtrl.controls.targetInfo.setValue(TragetInfo.FIELD);
    component.blockCtrl.controls.targetFldCtrl.setValue(data);
    expect(component.getFieldTooltip('target')).toEqual('test');
  }));
});
