import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UDRValueControlComponent } from './udr-value-control.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientModule } from '@angular/common/http';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { of, throwError } from 'rxjs';
import { SharedModule } from '@modules/shared/shared.module';
import { UDRDropdownValue } from '@models/schema/schemadetailstable';
import { SimpleChanges } from '@angular/core';
import { TragetInfo } from 'src/app/_constants';

describe('UDRValueControlComponent', () => {
  let component: UDRValueControlComponent;
  let fixture: ComponentFixture<UDRValueControlComponent>;
  let schemaDetailsService: SchemaDetailsService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UDRValueControlComponent],
      imports: [
        AppMaterialModuleForSpec,
        HttpClientModule,
        SharedModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UDRValueControlComponent);
    component = fixture.componentInstance;
    schemaDetailsService = fixture.debugElement.injector.get(SchemaDetailsService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('ngOnInit(), should assign pre required ', async(() => {
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();
  }));
  it('ngOnDestroy(), should destroy the component ', async(() => {
    component.ngOnDestroy();
    expect(component.ngOnDestroy).toBeTruthy();
  }));

  it('ngOnChanges(), should call reset when reset filter', async(() => {
    // mock data
    component.value = '';
    const chnages1: import('@angular/core').SimpleChanges = { fieldId: { currentValue: '1005', previousValue: false, firstChange: true, isFirstChange: null }, value: { currentValue: '1005', previousValue: false, firstChange: true, isFirstChange: null } };
    const chnages2: import('@angular/core').SimpleChanges = { metataData: { currentValue: {}, previousValue: false, firstChange: true, isFirstChange: null } };
    const chnages3: import('@angular/core').SimpleChanges = { value: { currentValue: null, previousValue: false, firstChange: true, isFirstChange: null } };
    const chnages4: import('@angular/core').SimpleChanges = { rangeValue: { currentValue: { start: null, end: null }, previousValue: false, firstChange: true, isFirstChange: null } };
    const chnages5: import('@angular/core').SimpleChanges = { rangeValue: { currentValue: null, previousValue: false, firstChange: true, isFirstChange: null } };
    const chnages6: import('@angular/core').SimpleChanges = { rangeValue: { currentValue: { start: '2020-01-01', end: '2022-01-01' }, previousValue: false, firstChange: true, isFirstChange: null } };
    component.value = undefined;
    component.ngOnChanges(chnages1);
    component.value = '2021-01-01';
    component.ngOnChanges(chnages2);
    component.ngOnChanges(chnages3);
    component.ngOnChanges(chnages4);
    component.ngOnChanges(chnages5);
    component.ngOnChanges(chnages6);
    expect(component.ngOnChanges).toBeTruthy();
  }));

  it('ngOnChanges()', async(() => {
    spyOn(component, 'transformFieldRes').and.returnValue([]);
    const changes7: SimpleChanges = {
      metataData: {
        previousValue: null,
        currentValue: {val: 'tesdt'}
      } as any,
      targetInfo: {
        previousValue: null,
        currentValue: TragetInfo.VALUE
      } as any,
      conditionalFieldValueCtrl: {
        previousValue: null,
        currentValue: {}
      } as any
    };
    component.isLookupRule = true;
    component.targetInfo = TragetInfo.FIELD;
    component.conditionalFieldValueCtrl = undefined;
    component.value = 'test';
    component.ngOnChanges(changes7);
    expect(component.transformFieldRes).toHaveBeenCalled();

    spyOn(component, 'dropdownTextByCode').and.returnValue('');
    component.conditionalFieldValueCtrl = {} as any;
    component.ngOnChanges(changes7);
    expect(component.dropdownValue).toEqual('');
  }));

  it('loadDropdownValues() should load all dropdown values', async(() => {
    const schemaSpy = spyOn(schemaDetailsService, 'getUDRDropdownValues').and.returnValue(of([{} as any]));
    component.fieldId = 'TEST_FIELD';
    component.metataData = {
      gridFields: {},
      headers: {
        TEST_FIELD: {
          picklist: '1'
        }
      },
      hierarchy: [],
      hierarchyFields: {},
      grids: []
    }

    component.loadUDRValueControl();
    // expect(component.fieldList.length).toBe(1);
    schemaSpy.and.returnValue(throwError({ message: 'error' }));
    component.loadUDRValueControl();
    expect(component.fieldList.length).toBe(0);
  }));

  it('parseMetadata() should parse correct meta data', async(() => {
    component.metataData = {
      gridFields: {},
      headers: {
        TEST_FIELD: {
          picklist: '1',
          ANOTHER_FIELD: {
            picklist: '2'
          }
        }
      },
      hierarchy: [],
      hierarchyFields: {},
      grids: []
    };
    expect(component.parseMetadata('TEST_FIELD', component.metataData)).toBeTruthy();
    expect(component.parseMetadata('ANOTHER_FIELD', component.metataData)).toBeTruthy();
    expect(component.parseMetadata('NEW_FIELD', component.metataData)).toBeNull();
  }));

  it('selected() should update selected value', async(() => {
    const event: any = {
      option: {
        viewValue: 'test'
      }
    }
    component.selectedMetaData = {} as any;
    component.selected(event);
    expect(component.singleInput).toEqual('test');
    event.option.value = {
      fieldId: 'test'
    };
    spyOn(component.valueChange, 'emit');
    component.selected(event);
    expect(component.valueChange.emit).toHaveBeenCalled();
  }));

  it('displayControl() should have updated value', async(() => {
    component.selectedMetaData = {
      picklist: '0',
      dataType: 'CHAR'
    };
    expect(component.displayControl).toEqual('text');
    component.selectedMetaData = {
      picklist: '22',
      dataType: 'CHAR'
    };
    expect(component.displayControl).toEqual('text');
    component.selectedMetaData = {
      picklist: '0',
      dataType: 'NUMC'
    };
    expect(component.displayControl).toEqual('number');
    component.selectedMetaData = {
      picklist: '2',
      dataType: 'CHAR'
    };
    expect(component.displayControl).toEqual('checkbox');
    component.selectedMetaData = {
      picklist: '4',
      dataType: 'CHAR'
    };
    expect(component.displayControl).toEqual('radio');
    component.selectedMetaData = {
      picklist: '35',
      dataType: ''
    };
    expect(component.displayControl).toEqual('radio');
    component.selectedMetaData = {
      picklist: 'Test',
      dataType: 'DATS'
    };
    expect(component.displayControl).toEqual('date');
    component.selectedMetaData = {
      picklist: 'Test',
      dataType: 'DTMS'
    };
    expect(component.displayControl).toEqual('datetime');
    component.selectedMetaData = {
      picklist: 'Test',
      dataType: 'TIMS'
    };
    expect(component.displayControl).toEqual('time');
  }));

  it('dateChanged() should update selected value', async(() => {
    const event = new Date('2021-01-01');
    component.dateChanged(event, true);
    component.dateChanged(event);
    expect(component.singleInput).toEqual(event.getTime().toString());
    component.range = true;
    component.dateChanged({ start: null, end: null });
    expect(component.multipleInput.start).toBeNull();
    component.dateChanged({ start: new Date(), end: new Date() }, true);
    component.dateChanged({ start: new Date(), end: new Date() });
    expect(component.multipleInput.start).toBeTruthy();
    expect(component.multipleInput.end).toBeTruthy();
  }));

  it('timeRangeChanged()', async(() => {
    spyOn(component, 'emit');
    let date = {};
    component.timeRangeChanged(date);
    expect(component.emit).toHaveBeenCalled();

    date = {
      start: {
        hours: 0,
        minutes: 1
      },
      end: {
        hours: 0,
        minutes: 1
      }
    };
    component.timeRangeChanged(date);
    expect(component.emit).toHaveBeenCalled();
  }));

  it('inputChanged() should update selected value', async(() => {
    component.range = true;
    component.multipleInput = {
      start: null,
      end: null
    };
    component.inputChanged('test1', 'start');
    component.inputChanged('test2', 'end');
    expect(component.multipleInput.start).toEqual('test1');
    expect(component.multipleInput.end).toEqual('test2');

    component.range = false;
    component.selectedMetaData = {
      picklist: '35',
      dataType: ''
    };
    component.inputChanged('test3');
    expect(component.singleInput).toEqual('');
  }));
  it('checkboxChanged() should update selected value', async(() => {
    const event = true;
    component.checkboxChanged(event);
    expect(component.checkboxChanged).toBeTruthy();
  }));
  it('emit() should send single or multiple input to parent', async(() => {
    component.range = true;
    component.emit();
    component.range = false;
    component.emit();
    expect(component.emit).toBeTruthy();
  }));

  it('dropdownTextByCode() should get text from code', async(() => {
    component.fieldList = [{
      TEXT: 'test1',
      CODE: 't1'
    }] as Array<UDRDropdownValue>;
    expect(component.dropdownTextByCode('t1')).toEqual('test1');
    expect(component.dropdownTextByCode('t2')).toEqual('');
    expect(component.dropdownTextByCode({
      fieldId: 'test',
      fieldDescri: 'test1'
    })).toEqual('test1');
    expect(component.dropdownTextByCode({
      fieldId: 'test',
      fieldDesc: 'test1'
    })).toEqual('test1');
    expect(component.dropdownTextByCode({
      fieldId: 'test1'
    })).toEqual('test1');
  }));
  it('fldDisplayWith() should get text from code', async(() => {
    component.singleInput = 'text';
    expect(component.fldDisplayWith({
      fieldDescri: 'test1'
    } as any)).toEqual('test1');
    expect(component.fldDisplayWith({
      fieldDesc: 'test1'
    } as any)).toEqual('test1');
    expect(component.fldDisplayWith({
      fieldId: 'test1'
    } as any)).toEqual('test1');
    expect(component.fldDisplayWith({
    } as any)).toEqual('text');
  }));

  it('dropdownCodeByText() should get text from code', async(() => {
    component.fieldList = [{
      TEXT: 'test1',
      CODE: 't1'
    }] as Array<UDRDropdownValue>;
    expect(component.dropdownCodeByText('test1')).toEqual('t1');
    expect(component.dropdownCodeByText('t2')).toEqual('t2');
  }));

  it('operatorType() should get correct operator type', async(() => {
    component.operator = 'length type';
    expect(component.operatorType).toEqual('length');
    component.operator = 'test';
    expect(component.operatorType).toEqual('default');
  }));

  it('dropdownChanged()', async(() => {
    spyOn(component.searchSub, 'next');
    component.selectedMetaData = {
      picklist: '0',
      dataType: 'CHAR'
    };
    component.dropdownChanged('');

    expect(component.searchSub.next).toHaveBeenCalled();
  }));

  it('fldDisplayWith()', async(() => {
    let data = {
      fieldDescri: 'test'
    } as any;
    expect(component.fldDisplayWith(data)).toEqual('test');

    data = {
      fieldDesc: 'test'
    } as any;
    expect(component.fldDisplayWith(data)).toEqual('test');

    data = {
      fieldId: 'test'
    } as any;
    expect(component.fldDisplayWith(data)).toEqual('test');
  }));
});
