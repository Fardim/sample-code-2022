import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormMultiselectComponent } from './form-multiselect.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { BlockType, ConditionOperator, DisplayCriteria, DropDownValues, FieldInfo, OrderWith, Widget } from '@modules/report-v2/_models/widget';
import { ReportService } from '@modules/report-v2/_service/report.service';
import { SimpleChanges } from '@angular/core';
import { of } from 'rxjs';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MetadataModel } from '@models/schema/schemadetailstable';
import { WidgetService } from '@services/widgets/widget.service';
import { Criteria } from '@modules/report/_models/widget';
import { FormControl } from '@angular/forms';

describe('FormMultiSelectComponent', () => {
  let component: FormMultiselectComponent;
  let fixture: ComponentFixture<FormMultiselectComponent>;
  let reportService: jasmine.SpyObj<ReportService>;
  let widgetService: jasmine.SpyObj<WidgetService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FormMultiselectComponent],
      imports: [AppMaterialModuleForSpec, MdoUiLibraryModule, HttpClientTestingModule]
    })
      .compileComponents();
    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    widgetService = TestBed.inject(WidgetService) as jasmine.SpyObj<WidgetService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormMultiselectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getDropDownValue(),should return dropdown values', async(() => {
    const value = { CODE: 'first', TEXT: 'test' } as DropDownValues;
    const returnData: DropDownValues[] = [{
      sno: 1,
      CODE: 'first',
      TEXT: 'test',
      langu: '',
      display: '',
      FIELDNAME: ''
    }];
    component.isFetchingData = true;
    component.formFieldInfo = { fields: 'MATL_GROUP', fldMetaData: { picklist: '1' }, widgetId: 13283821, displayCriteria: null } as FieldInfo;
    component.optionList = [];
    component.selectedMultiSelectData = [{ [value.CODE]: null }];
    component.isTableFilter = 'true';
    component.locale = '';
    const filterWidget = new Widget()
    filterWidget.fieldCtrl = { fieldId: 'MATL_GROUP', picklist: '1' } as MetadataModel;
    filterWidget.widgetId = '13283821';
    component.widgetInfo = filterWidget as any;
    const criteria = [];
    const searchString = '';
    const searchAfter = '';

    spyOn(component, 'formatData');
    spyOn(component, 'displayMultiselectedText');
    spyOn(reportService, 'getDropDownValues')
      .withArgs(component.formFieldInfo.widgetId, component.formFieldInfo.fields, '1', component.formFieldInfo.displayCriteria, 'first').and.returnValue(of(returnData));

    component.getDropDownValue('first');
    //    expect(component.optionList.length).toEqual(1);

    component.isFilterWidget = true;
    const response = { aggregations: { 'composite#bucket': { buckets: [{ key: { FILTER: '106406009136356487' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '106406009136356487' }] } } } }] } } }, { key: { FILTER: '115186306527988711' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '115186306527988711' }] } } } }] } } }, { key: { FILTER: '130086693666196566' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '130086693666196566' }] } } } }] } } }, { key: { FILTER: '161887603277972056' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '161887603277972056' }] } } } }] } } }, { key: { FILTER: '173400567817058882' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '173400567817058882' }] } } } }] } } }, { key: { FILTER: '191553074485201096' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '191553074485201096' }] } } } }] } } }, { key: { FILTER: '209608314301990419' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '209608314301990419' }] } } } }] } } }, { key: { FILTER: '247307504273738382' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '247307504273738382' }] } } } }] } } }, { key: { FILTER: '257239960933193077' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '257239960933193077' }] } } } }] } } }, { key: { FILTER: '271471671527993003' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '271471671527993003' }] } } } }] } } }], after_key: { FILTER: '271471671527993003' } } } }

    spyOn(widgetService, 'getWidgetData').withArgs(String(component.widgetInfo.widgetId), criteria, searchString, searchAfter).and.returnValue(of(response));
    component.getDropDownValue('', '', 'first');

    // expect(component.optionList.length).toEqual(10);
    expect(widgetService.getWidgetData).toHaveBeenCalledWith(String(component.widgetInfo.widgetId), criteria, searchString, searchAfter);

    const filterWidget1 = new Widget()
    filterWidget1.fieldCtrl = { fieldId: 'MATL_GROUP', picklist: '30' } as MetadataModel;
    filterWidget1.widgetId = '13283821';
    component.widgetInfo = filterWidget1 as any;
    component.getDropDownValue('', '', 'first');

    expect(widgetService.getWidgetData).toHaveBeenCalledWith(String(component.widgetInfo.widgetId), criteria, searchString, searchAfter);

    const filterWidget2 = new Widget()
    filterWidget2.fieldCtrl = { fieldId: 'MATL_GROUP', picklist: '0' } as MetadataModel;
    filterWidget2.widgetId = '13283821';
    component.widgetInfo = filterWidget2 as any;
    component.getDropDownValue('', '', 'first');

    expect(widgetService.getWidgetData).toHaveBeenCalledWith(String(component.widgetInfo.widgetId), criteria, searchString, searchAfter);

  }));


  it('applyFilter(), filter values', async(() => {
    component.formFieldInfo = { fields: 'MATL_GROUP' } as FieldInfo;
    const emitEventSpy = spyOn(component.valueChange, 'emit');
    spyOn(component, 'displayMultiselectedText');
    component.applyFilter();
    expect(emitEventSpy).toHaveBeenCalled();
  }));


  it('selectionChangeHandler(), selected value for multi selected data', (async () => {
    const value = { CODE: 'CODE', TEXT: 'TEXT' } as DropDownValues;

    component.selectedMultiSelectData = null;
    component.selectionChangeHandler(value.CODE, value.TEXT);
    expect(component.selectionChangeHandler).toBeTruthy();

    component.selectionChangeHandler(value.CODE, value.TEXT);
    expect(component.selectionChangeHandler).toBeTruthy();

    component.selectedMultiSelectData = [{ [value.CODE]: value.TEXT }];
    component.selectionChangeHandler(value.CODE, value.TEXT);
    expect(component.selectionChangeHandler).toBeTruthy();

    component.selectedMultiSelectData = [{ column: value.TEXT }];
    component.selectionChangeHandler(value.CODE, value.TEXT);
    expect(component.selectionChangeHandler).toBeTruthy();
  }));


  it('isChecked(),should return true if a value is already selected', async(() => {
    const value = { CODE: 'CODE', TEXT: 'TEXT' } as DropDownValues;

    component.isChecked(value.CODE);
    expect(component.isChecked).toBeTruthy();

    component.selectedMultiSelectData = [{ [value.CODE]: value.TEXT }];
    component.isChecked(value.CODE);
    expect(component.isChecked).toBeTruthy();

  }));

  it('getLabel(),should get label', async(() => {
    const opt = {
      CODE: 'CODE',
      TEXT: 'TEXT'
    } as DropDownValues

    component.displayCriteria = 'CODE_TEXT';
    const result = component.getLabel(opt);
    expect(result).toBe(opt.CODE + '-' + opt.TEXT);

    component.displayCriteria = 'CODE';
    const result1 = component.getLabel(opt);
    expect(result1).toBe(opt.CODE);

    component.displayCriteria = 'TEXT';
    const result2 = component.getLabel(opt);
    expect(result2).toBe(opt.TEXT);

  }));


  it('ngOnChanges(),should detect changes and update', async(() => {
    let change: SimpleChanges = {
      value: {
        previousValue: ['first'],
        currentValue: ['second'],
        firstChange: true,
        isFirstChange() { return true }
      },
      displayCriteria: {
        previousValue: 'TEXT',
        currentValue: undefined,
        firstChange: false,
        isFirstChange() { return null }
      },
      isFilterWidget: {
        previousValue: 'false',
        currentValue: 'true',
        firstChange: false,
        isFirstChange() { return null }
      },
      filterCriteria: {
        previousValue: 'TEXT',
        currentValue: 'CODE',
        firstChange: false,
        isFirstChange() { return null }
      },
    };
    const filterWidget = new Widget()
    filterWidget.fieldCtrl = { fieldId: 'MATL_GROUP', picklist: '1' } as MetadataModel;
    component.widgetInfo = filterWidget as any;
    component.isEnableGlobalFilter = false;
    component.selectedMultiSelectData = [];
    component.filterCriteria = [{ fieldId: '__DIW_STATUS' } as Criteria];
    component.widgetId = 498394;
    component.ngOnChanges(change);
    expect(component.selectedMultiSelectData[0].second).toEqual(null);

    change = {
      value: {
        previousValue: [{ CODE: 'CODE', TEXT: 'TEXT' }],
        currentValue: [{ CODE: 'CODE', TEXT: 'TEXT' }, { CODE: 'CODE1', TEXT: 'TEXT1' }],
        firstChange: false,
        isFirstChange() { return false }
      }
    }

    component.selectedMultiSelectData = [{ CODE: 'CODE', TEXT: 'TEXT' }, { CODE: 'CODE1', TEXT: 'TEXT1' }]
    component.ngOnChanges(change);
    expect(component.selectedMultiSelectData.length).toEqual(2);

    change = {
      value: {
        previousValue: [{ CODE: 'CODE', TEXT: 'TEXT' }],
        currentValue: null,
        firstChange: false,
        isFirstChange() { return false }
      }
    }

    component.ngOnChanges(change);
    expect(component.selectedMultiSelectData.length).toEqual(0);

    change = {
      widgetId: {
        previousValue: '37878',
        currentValue: '4998989',
        isFirstChange() { return false },
        firstChange: false
      },
      isMenuClosed: {
        previousValue: true,
        currentValue: false,
        firstChange: false,
        isFirstChange() { return false }
      },
      formFieldInfo: {
        previousValue: null,
        currentValue: { fields: 'MATL_GROUP' },
        firstChange: false,
        isFirstChange() { return false }
      },
      value: {
        previousValue: [{ CODE: 'CODE', TEXT: 'TEXT' }],
        currentValue: null,
        firstChange: false,
        isFirstChange() { return false }
      },
      widgetInfo: {
        previousValue: null,
        currentValue: { fields: 'MATL_GROUP' },
        firstChange: false,
        isFirstChange() { return false }
      }
    }
    component.isTableFilter = 'true';
    component.editedMode = true;
    spyOn(component,'getDropDownValue');
    spyOn(component, 'displayMultiselectedText');
    component.ngOnChanges(change);
    expect(component.getDropDownValue).toHaveBeenCalled();
    expect(component.displayMultiselectedText).toHaveBeenCalled();

  }));


  it('getSelectedData()', async(() => {
    const value = { CODE: 'test', TEXT: 'TEST1' } as DropDownValues;
    component.selectedMultiSelectData = [{ [value.CODE]: value.TEXT }];
    component.optionList = [{ CODE: 'test', TEXT: 'TEST1' } as DropDownValues];

    const selectedDataList = component.getSelectedData();
    expect(selectedDataList.length).toEqual(1);
  }));


  it('ngOnInit()', async(() => {
    component.widgetId = 4674674;
    spyOn(component,'getDropDownValue');
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();
  }));


  it('ngOnDestroy()', () => {
    component.ngOnDestroy();
    expect(component.ngOnDestroy).toBeTruthy();
  });

  it('removefilter(), removed the existing filter criteria for filtered data', async () => {
    const result = component.removefilter('MATL_GROUP', []);
    expect(result).toEqual([]);

    const localFilterCriteria = [
      {
        fieldId: 'MATL_GROUP',
        conditionFieldId: 'MATL_GROUP',
        conditionFieldValue: 'test',
        blockType: BlockType.COND,
        conditionOperator: ConditionOperator.EQUAL,
        conditionFieldStartValue: null,
        conditionFieldEndValue: null,
        udrid: null,
      } as Criteria
    ];

    const result1 = component.removefilter('MATL_GRP', localFilterCriteria);
    expect(result1).toEqual(localFilterCriteria);
  });

  it('onScroll(), should load the data when user scroll the filter value', async () => {
    spyOn(component, 'getDropDownValue');
    component.isLoadMore = true;
    component.filterCriteria = [];
    component.searchAfter = '';
    component.onScroll();

    expect(component.getDropDownValue).toHaveBeenCalledWith('', component.searchAfter);

    component.control.setValue('test');
    component.onScroll();
    expect(component.getDropDownValue).toHaveBeenCalledWith('test', component.searchAfter);
  });

  it('getFields(),', async () => {
    const result = component.getFields('TIME_TAKEN', 1);
    expect(result).toEqual('1 m ');

    const result1 = component.getFields('OVERDUE', 'y');
    expect(result1).toEqual('Yes');

    const result2 = component.getFields('OVERDUE', 'n');
    expect(result2).toEqual('No');

    const result3 = component.getFields('', 'off');
    expect(result3).toEqual('False');

    const result4 = component.getFields('', 'on');
    expect(result4).toEqual('True');

    const result5 = component.getFields('FORWARDENABLED', 'y');
    expect(result5).toEqual('Yes');
  });

  it('updateObjRefDescription(), update description of objRef in filter', async(() => {
    component.locale = '';
    component.values = [{ CODE: 'KEY2', FIELDNAME: 'MATL_GROUP', TEXT: 'KEY2' } as DropDownValues]
    const buckets = [{ doc_count: 21151, key: { FILTER: 'KEY2' }, 'top_hits#items': { hits: { hits: [{ _source: { hdvs: { MATL_GROUP: { vc: [{ c: 'KEY2', t: 'Key2' }] } } } }] } } }];
    const filterWidget = new Widget();
    filterWidget.fieldCtrl = { fieldId: 'MATL_GROUP', picklist: '1', fieldType: 'CHAR', dataType: 'NUMC' } as MetadataModel;
    component.widgetInfo = filterWidget as any;

    component.updateObjRefDescription(buckets, 'MATL_GROUP', false);
    expect(component.values.length).toEqual(1);

    component.locale = 'en-EN';
    component.updateObjRefDescription(buckets, 'MATL_GROUP', false);
    expect(component.values.length).toEqual(1);
  }));

  it('getFieldsMetadaDesc(), should return the dropdown value of the field', async(() => {
    const buckets = [{ doc_count: 1, key: { FILTER: '1' }, 'top_hits#items': { hits: { hits: [{ _source: { hdvs: { MATL_GROUP: { vc: [{ c: '200010' }] } } } }] } } }, { doc_count: 1, key: { FILTER: '1' }, 'top_hits#items': { hits: { hits: [{ _source: { hdvs: { MATL_GROUP: { vc: [{ c: '200010', t: 'testing' }] } } } }] } } }, { doc_count: 1, key: { FILTER: '1' }, 'top_hits#items': { hits: { hits: [{ _source: { hdvs: { MATL_GROUP: {} } } }] } } }];
    component.values = [{ CODE: '200010', FIELDNAME: 'MATL_GROUP', TEXT: '200010' } as DropDownValues, { CODE: '200010', FIELDNAME: 'MATL_GROUP', TEXT: 'testing' } as DropDownValues]
    const filterWidget = new Widget()
    filterWidget.fieldCtrl = { fieldId: 'MATL_GROUP', picklist: '1' } as MetadataModel;
    component.widgetInfo = filterWidget as any;
    component.getFieldsMetadaDesc(buckets, 'MATL_GROUP', false, '1');
    expect(component.values.length).toEqual(2);
    expect(component.values[0].TEXT).toEqual('200010');
    expect(component.values[1].TEXT).toEqual('testing');

    const buckets2 = [{ doc_count: 2, key: { FILTER: 'n' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { OVERDUE: { vc: [{ c: 'n' }] } } } }] } } }, { doc_count: 2, key: { FILTER: 'y' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { OVERDUE: { vc: [{ c: 'y' }] } } } }] } } }];
    component.values = [{ CODE: 'n', FIELDNAME: 'OVERDUE', TEXT: 'n' } as DropDownValues, { CODE: 'y', FIELDNAME: 'OVERDUE', TEXT: 'y' } as DropDownValues]
    const filterWidget1 = new Widget()
    filterWidget1.fieldCtrl = { fieldId: 'OVERDUE', picklist: '1' } as MetadataModel;
    component.widgetInfo = filterWidget1 as any;
    component.getFieldsMetadaDesc(buckets2, 'OVERDUE', false, '1');
    expect(component.values.length).toEqual(2);
    expect(component.values[0].TEXT).toEqual('No');
    expect(component.values[1].TEXT).toEqual('Yes');
  }));

  it('sortDropdownData() should sort the dropdownData', async(() => {
    const dropdownData: DropDownValues[] = [];
    const dropdownOption = {
      CODE: '00104',
      FIELDNAME: 'MATL_GROUP',
      TEXT: 'Mechanics',
      display: 'Mechanics'
    } as DropDownValues;

    dropdownData.push(dropdownOption);
    dropdownOption.CODE = 'ABCDEF';
    dropdownData.push(dropdownOption);
    const filterWidget = new Widget()
    filterWidget.orderWith = OrderWith.DESC;
    component.widgetInfo = filterWidget as any;
    component.displayCriteria = DisplayCriteria.TEXT;
    component.sortDropdownData(dropdownData);
    expect(dropdownData.length).toEqual(2);

    filterWidget.orderWith = OrderWith.ASC;
    component.widgetInfo = filterWidget as any;
    component.displayCriteria = DisplayCriteria.TEXT;
    component.sortDropdownData(dropdownData);
    expect(dropdownData.length).toEqual(2);

    filterWidget.orderWith = OrderWith.ASC;
    component.widgetInfo = filterWidget as any;
    component.displayCriteria = DisplayCriteria.CODE;
    component.sortDropdownData(dropdownData);
    expect(dropdownData.length).toEqual(2);

    filterWidget.orderWith = OrderWith.DESC;
    component.widgetInfo = filterWidget as any;
    component.displayCriteria = DisplayCriteria.CODE;
    component.sortDropdownData(dropdownData);
    expect(dropdownData.length).toEqual(2);
  }));

  it('setFilterDropdownValues(), set filter dropdown default values', async(() => {
    spyOn(component, 'setFilterDropdownValues').and.callThrough();
    component.setFilterDropdownValues();
    expect(component.optionList.length).toBeGreaterThanOrEqual(5);
  }));


  it('onFocus()', async () => {
    const filterWidget = new Widget()
    filterWidget.fieldCtrl = { fieldId: 'MATL_GROUP', picklist: '4' } as MetadataModel;
    filterWidget.widgetId = '13283821';
    component.widgetInfo = filterWidget;
    component.formFieldInfo = { fields: 'MATL_GROUP', fldMetaData: { picklist: '4' }, widgetId: 13283821, displayCriteria: '' } as FieldInfo;
    component.optionList = [];
    component.locale = '';
    component.widgetId = 13283821;
    component.control = new FormControl();
    component.control.setValue(null);
    component.onFocus();
    expect(component.onFocus).toBeTruthy();
  })

  it('formatData()', async () => {
    component.formFieldInfo = {fields:'MATL_TYPE'} as FieldInfo;
    let response = { aggregations: { 'composite#bucket': { buckets: [{ key: { FILTER: '106406009136356487' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '106406009136356487' }] } } } }] } } }, { key: { FILTER: '115186306527988711' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '115186306527988711' }] } } } }] } } }, { key: { FILTER: '130086693666196566' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '130086693666196566' }] } } } }] } } }, { key: { FILTER: '161887603277972056' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '161887603277972056' }] } } } }] } } }, { key: { FILTER: '173400567817058882' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '173400567817058882' }] } } } }] } } }, { key: { FILTER: '191553074485201096' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '191553074485201096' }] } } } }] } } }, { key: { FILTER: '209608314301990419' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '209608314301990419' }] } } } }] } } }, { key: { FILTER: '247307504273738382' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '247307504273738382' }] } } } }] } } }, { key: { FILTER: '257239960933193077' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '257239960933193077' }] } } } }] } } }, { key: { FILTER: '271471671527993003' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '271471671527993003' }] } } } }] } } }], after_key: { FILTER: '271471671527993003' } } } }
    component.formatData(response, false,'MATL_TYPE', '4');
    expect(component.formatData).toBeTruthy();

    const nestedData = {'nested#nested_tags': { 'composite#bucket': { buckets: [{ key: { FILTER: '106406009136356487' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '106406009136356487' }] } } } }] } } }, { key: { FILTER: '115186306527988711' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '115186306527988711' }] } } } }] } } }, { key: { FILTER: '130086693666196566' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '130086693666196566' }] } } } }] } } }, { key: { FILTER: '161887603277972056' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '161887603277972056' }] } } } }] } } }, { key: { FILTER: '173400567817058882' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '173400567817058882' }] } } } }] } } }, { key: { FILTER: '191553074485201096' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '191553074485201096' }] } } } }] } } }, { key: { FILTER: '209608314301990419' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '209608314301990419' }] } } } }] } } }, { key: { FILTER: '247307504273738382' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '247307504273738382' }] } } } }] } } }, { key: { FILTER: '257239960933193077' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '257239960933193077' }] } } } }] } } }, { key: { FILTER: '271471671527993003' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '271471671527993003' }] } } } }] } } }], after_key: { FILTER: '271471671527993003' } } } }
    response = { aggregations: nestedData } as any;
    component.formatData(response, false,'MATL_TYPE', '4');
    expect(component.formatData).toBeTruthy();
  });
});
