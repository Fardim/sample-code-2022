import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormSingleSelectComponent } from './form-single-select.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { SimpleChanges } from '@angular/core';
import { ReportService } from '@modules/report-v2/_service/report.service';
import { BlockType, ConditionOperator, DisplayCriteria, DropDownValues, OrderWith, Widget, Criteria, FieldInfo } from '@modules/report-v2/_models/widget';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { MetadataModel } from '@models/schema/schemadetailstable';
import { FormControl } from '@angular/forms';
import { WidgetService } from '@services/widgets/widget.service';

describe('FormSingleSelectComponent', () => {
  let component: FormSingleSelectComponent;
  let fixture: ComponentFixture<FormSingleSelectComponent>;
  let reportService: jasmine.SpyObj<ReportService>;
  let widgetService: jasmine.SpyObj<WidgetService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FormSingleSelectComponent],
      imports: [AppMaterialModuleForSpec, HttpClientTestingModule, MdoUiLibraryModule]
    })
      .compileComponents();
    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    widgetService = TestBed.inject(WidgetService) as jasmine.SpyObj<WidgetService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormSingleSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('getDisplayText(),should return display text, ', async(() => {
    const opt = {
      CODE: 'first',
      TEXT: 'first',
      FIELDNAME: 'column',
      langu: 'EN',
      sno: 1,
      display: ''
    } as DropDownValues

    component.displayCriteria = 'CODE_TEXT';
    const result = component.getDisplayText(opt);
    expect(result).toBe(opt.CODE + '--' + opt.TEXT);

    component.displayCriteria = 'CODE';
    const result1 = component.getDisplayText(opt);
    expect(result1).toBe(opt.CODE);

    component.displayCriteria = 'TEXT';
    const result2 = component.getDisplayText(opt);
    expect(result2).toBe(opt.TEXT);

  }));

  it('getDisplayText(), ', async(() => {
    const opt = null;
    expect(component.getDisplayText(opt)).toBe('');
  }));


  it('selectSingleDropDownValue(), select values from single drop down', async(() => {
    const value = 'BALLY';
    component.isFilterWidget = true;
    component.control = new FormControl();
    const emitEventSpy = spyOn(component.valueChange, 'emit');
    component.selectSingleDropDownValue(value);
    expect(emitEventSpy).toHaveBeenCalled();
  }));


  it('getDropDownValue(), should return dropdown values', async(() => {
    const returnData: DropDownValues[] = [{
      sno: 1,
      CODE: 'first',
      TEXT: 'test',
      langu: '',
      display: '',
      FIELDNAME: ''
    }];
    const filterWidget = new Widget()
    filterWidget.fieldCtrl = { fieldId: 'MATL_GROUP', picklist: '1' } as MetadataModel;
    filterWidget.widgetId = '13283821';
    component.widgetInfo = filterWidget;
    const criteria = [];
    const searchString = '';
    const searchAfter = '';
    component.formFieldInfo = { fields: 'MATL_GROUP',fldMetaData:{picklist:'1'}, widgetId:'13283821' ,displayCriteria:null};
    component.optionList = [];
    component.locale = '';
    component.isFetchingData = true;
    spyOn(component,'formatData');
    spyOn(reportService, 'getDropDownValues')
      .withArgs(component.formFieldInfo.widgetId,component.formFieldInfo.fields,'1',null, 'first').and.returnValue(of(returnData))
    component.getDropDownValue('first');

    // expect(component.optionList.length).toEqual(1);
    expect(reportService.getDropDownValues).toHaveBeenCalledWith(component.formFieldInfo.widgetId,component.formFieldInfo.fields,'1',null, 'first');

    component.isFilterWidget = true;
    const response = { aggregations: { 'composite#bucket': { buckets: [{ key: { FILTER: '106406009136356487' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '106406009136356487' }] } } } }] } } }, { key: { FILTER: '115186306527988711' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '115186306527988711' }] } } } }] } } }, { key: { FILTER: '130086693666196566' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '130086693666196566' }] } } } }] } } }, { key: { FILTER: '161887603277972056' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '161887603277972056' }] } } } }] } } }, { key: { FILTER: '173400567817058882' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '173400567817058882' }] } } } }] } } }, { key: { FILTER: '191553074485201096' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '191553074485201096' }] } } } }] } } }, { key: { FILTER: '209608314301990419' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '209608314301990419' }] } } } }] } } }, { key: { FILTER: '247307504273738382' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '247307504273738382' }] } } } }] } } }, { key: { FILTER: '257239960933193077' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '257239960933193077' }] } } } }] } } }, { key: { FILTER: '271471671527993003' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '271471671527993003' }] } } } }] } } }], after_key: { FILTER: '271471671527993003' } } } }

    spyOn(widgetService, 'getWidgetData').withArgs(String(component.widgetInfo.widgetId), criteria, searchString, searchAfter).and.returnValue(of(response));
    component.getDropDownValue('', '', 'first');

    // expect(component.optionList.length).toEqual(10);
    expect(widgetService.getWidgetData).toHaveBeenCalledWith(String(component.widgetInfo.widgetId), criteria, searchString, searchAfter);

    const filterWidget1 = new Widget()
    filterWidget1.fieldCtrl = { fieldId: 'MATL_GROUP', picklist: '30' } as MetadataModel;
    filterWidget1.widgetId = '13283821';
    component.widgetInfo = filterWidget1;
    component.getDropDownValue('', '', 'first');

    expect(widgetService.getWidgetData).toHaveBeenCalledWith(String(component.widgetInfo.widgetId), criteria, searchString, searchAfter);

    const filterWidget2 = new Widget()
    filterWidget2.fieldCtrl = { fieldId: 'MATL_GROUP', picklist: '0' } as MetadataModel;
    filterWidget2.widgetId = '13283821';
    component.widgetInfo = filterWidget2;
    component.getDropDownValue('', '', 'first');

    expect(widgetService.getWidgetData).toHaveBeenCalledWith(String(component.widgetInfo.widgetId), criteria, searchString, searchAfter);

    const filterWidget3 = new Widget()
    filterWidget3.fieldCtrl = { fieldId: 'MATL_GROUP', picklist: '0' } as MetadataModel;
    filterWidget3.widgetId = '13283821';
    filterWidget3.datasetType = 'diw_dataset';
    component.widgetInfo = filterWidget3;
    spyOn(component,'setFilterDropdownValues');
    component.getDropDownValue('', '', '');
    expect(component.optionList.length).toEqual(0);

    expect(widgetService.getWidgetData).toHaveBeenCalledWith(String(component.widgetInfo.widgetId), criteria, searchString, searchAfter);
  }));


  it('ngOnChanges(), should detect changes and update', async(() => {
    const change: SimpleChanges = {
      value: {
        previousValue: 'first',
        currentValue: 'test',
        firstChange: false,
        isFirstChange() { return null }
      },
      displayCriteria: {
        previousValue: 'TEXT',
        currentValue: 'CODE',
        firstChange: false,
        isFirstChange() { return null }
      },
      formFieldInfo: {
        previousValue: 'col',
        currentValue: {fields:'MATL_GROUP',fldMetaData:{picklist:'2'}},
        firstChange: false,
        isFirstChange() { return null }
      },
      filterCriteria: {
        previousValue: 'TEXT',
        currentValue: 'CODE',
        firstChange: false,
        isFirstChange() { return null }
      },
      widgetInfo: {
        previousValue: 'col',
        currentValue: {fields:'MATL_GROUP',fldMetaData:{picklist:'2'}},
        firstChange: false,
        isFirstChange() { return null }
      },
      isMenuClosed : {
        previousValue:true,
        currentValue:false,
        firstChange:false,
        isFirstChange(){return null}
      }
    };
    component.editedMode = true;
    component.widgetId = 4783748;
    const filterWidget = new Widget()
    filterWidget.fieldCtrl = { fieldId: 'MATL_GROUP', picklist: '1' } as MetadataModel;
    component.widgetInfo = filterWidget;
    component.isEnableGlobalFilter = false;

    component.formFieldInfo = { fields: 'MATL_GROUP',fldMetaData:{picklist:'1'} };
    component.filterCriteria = [];
    component.optionList = [{ CODE: 'test', TEXT: 'TEST1' } as DropDownValues];
    component.isFilterSiderSheet = true;
    component.getDropDownValue();

    expect(component.optionList.length).toEqual(1);
    component.ngOnChanges(change);
    expect(component.ngOnChanges).toBeTruthy();
    expect(component.isFetchingData).toBeTrue()
    expect(component.control.value).toEqual('')
  }));

  it('ngOnIt()', async(() => {
    component.widgetId = 3467346;
    spyOn(component,'getDropDownValue');
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();
  }));

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

    component.formFieldInfo = {fields:'MATL', widgetId : 47673,fldMetaData : {picklist : 1},displayCriteria : DisplayCriteria.CODE}
    component.control.setValue('abc');
    component.onScroll();
    expect(component.getDropDownValue).toHaveBeenCalledWith('abc', component.searchAfter);

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
  });

  it('updateObjRefDescription(), update description of objRef in filter', async(() => {
    component.locale = '';
    component.values = [{ CODE: 'KEY2', FIELDNAME: 'MATL_GROUP', TEXT: 'KEY2' } as DropDownValues]
    const buckets = [{ doc_count: 21151, key: { FILTER: 'KEY2' }, 'top_hits#items': { hits: { hits: [{ _source: { hdvs: { MATL_GROUP: { vc: [{ c: 'KEY2', t: 'Key2' }] } } } }] } } }];
    const filterWidget = new Widget();
    filterWidget.fieldCtrl = { fieldId: 'MATL_GROUP', picklist: '1', fieldType: 'CHAR', dataType: 'NUMC' } as MetadataModel;
    component.widgetInfo = filterWidget;

    component.updateObjRefDescription(buckets, 'MATL_GROUP', false);
    expect(component.values.length).toEqual(1);
  }));

  it('getFieldsMetadaDesc(), should return the dropdown value of the field', async(() => {
    const buckets = [{ doc_count: 1, key: { FILTER: '1' }, 'top_hits#items': { hits: { hits: [{ _source: { hdvs: { MATL_GROUP: { vc: [{ c: '200010' }] } } } }] } } }, { doc_count: 1, key: { FILTER: '1' }, 'top_hits#items': { hits: { hits: [{ _source: { hdvs: { MATL_GROUP: { vc: [{ c: '200010', t: 'testing' }] } } } }] } } }, { doc_count: 1, key: { FILTER: '1' }, 'top_hits#items': { hits: { hits: [{ _source: { hdvs: { MATL_GROUP: {} } } }] } } }];
    component.values = [{ CODE: '200010', FIELDNAME: 'MATL_GROUP', TEXT: '200010' } as DropDownValues, { CODE: '200010', FIELDNAME: 'MATL_GROUP', TEXT: 'testing' } as DropDownValues]
    const filterWidget = new Widget()
    filterWidget.fieldCtrl = { fieldId: 'MATL_GROUP', picklist: '1' } as MetadataModel;
    component.widgetInfo = filterWidget;
    component.getFieldsMetadaDesc(buckets, 'MATL_GROUP', false, '1');
    expect(component.values.length).toEqual(2);
    expect(component.values[0].TEXT).toEqual('200010');
    expect(component.values[1].TEXT).toEqual('testing');

    const buckets2 = [{ doc_count: 2, key: { FILTER: 'n' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { OVERDUE: { vc: [{ c: 'n' }] } } } }] } } }, { doc_count: 2, key: { FILTER: 'y' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { OVERDUE: { vc: [{ c: 'y' }] } } } }] } } }];
    component.values = [{ CODE: 'n', FIELDNAME: 'OVERDUE', TEXT: 'n' } as DropDownValues, { CODE: 'y', FIELDNAME: 'OVERDUE', TEXT: 'y' } as DropDownValues]
    const filterWidget1 = new Widget()
    filterWidget1.fieldCtrl = { fieldId: 'OVERDUE', picklist: '1' } as MetadataModel;
    component.widgetInfo = filterWidget1;
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
    component.widgetInfo = filterWidget;
    component.displayCriteria = DisplayCriteria.TEXT;
    component.sortDropdownData(dropdownData);
    expect(dropdownData.length).toEqual(2);

    filterWidget.orderWith = OrderWith.ASC;
    component.widgetInfo = filterWidget;
    component.displayCriteria = DisplayCriteria.TEXT;
    component.sortDropdownData(dropdownData);
    expect(dropdownData.length).toEqual(2);

    filterWidget.orderWith = OrderWith.ASC;
    component.widgetInfo = filterWidget;
    component.displayCriteria = DisplayCriteria.CODE;
    component.sortDropdownData(dropdownData);
    expect(dropdownData.length).toEqual(2);

    filterWidget.orderWith = OrderWith.DESC;
    component.widgetInfo = filterWidget;
    component.displayCriteria = DisplayCriteria.CODE;
    component.sortDropdownData(dropdownData);
    expect(dropdownData.length).toEqual(2);
  }));

  it('setFilterDropdownValues(), set filter dropdown default values', async(() => {
    spyOn(component, 'setFilterDropdownValues').and.callThrough();
    component.displayCriteria = DisplayCriteria.TEXT;
    component.setFilterDropdownValues('Error');
    expect(component.optionList.length).toEqual(1);

    component.displayCriteria = DisplayCriteria.CODE;
    component.setFilterDropdownValues('success');
    expect(component.optionList.length).toEqual(1);
    component.setFilterDropdownValues('');
    expect(component.optionList.length).toEqual(6);
    component.setFilterDropdownValues('abc');
    expect(component.optionList.length).toEqual(0);
  }));

  it('onFocus()', async() =>{
    const filterWidget = new Widget()
    filterWidget.fieldCtrl = { fieldId: 'MATL_GROUP', picklist: '4' } as MetadataModel;
    filterWidget.widgetId = '13283821';
    component.widgetInfo = filterWidget;
    component.formFieldInfo = { fields: 'MATL_GROUP', fldMetaData: { picklist: '4' }, widgetId:13283821, displayCriteria:'' } as FieldInfo;
    component.optionList = [];
    component.locale = '';
    component.widgetId = 13283821;
    component.control = new FormControl();
    component.control.setValue(null);
    component.onFocus();
    expect(component.onFocus).toBeTruthy();
  })

  it('formatData(), should format data', async () => {
    let response = { aggregations: { 'composite#bucket': { buckets: [{ key: { FILTER: '106406009136356487' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '106406009136356487' }] } } } }] } } }, { key: { FILTER: '115186306527988711' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '115186306527988711' }] } } } }] } } }, { key: { FILTER: '130086693666196566' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '130086693666196566' }] } } } }] } } }, { key: { FILTER: '161887603277972056' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '161887603277972056' }] } } } }] } } }, { key: { FILTER: '173400567817058882' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '173400567817058882' }] } } } }] } } }, { key: { FILTER: '191553074485201096' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '191553074485201096' }] } } } }] } } }, { key: { FILTER: '209608314301990419' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '209608314301990419' }] } } } }] } } }, { key: { FILTER: '247307504273738382' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '247307504273738382' }] } } } }] } } }, { key: { FILTER: '257239960933193077' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '257239960933193077' }] } } } }] } } }, { key: { FILTER: '271471671527993003' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '271471671527993003' }] } } } }] } } }], after_key: { FILTER: '271471671527993003' } } } }
    component.formatData(response,'MATL_TYPE', '4',false);
    expect(component.formatData).toBeTruthy();

    const nestedData = {'nested#nested_tags': { 'composite#bucket': { buckets: [{ key: { FILTER: '106406009136356487' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '106406009136356487' }] } } } }] } } }, { key: { FILTER: '115186306527988711' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '115186306527988711' }] } } } }] } } }, { key: { FILTER: '130086693666196566' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '130086693666196566' }] } } } }] } } }, { key: { FILTER: '161887603277972056' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '161887603277972056' }] } } } }] } } }, { key: { FILTER: '173400567817058882' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '173400567817058882' }] } } } }] } } }, { key: { FILTER: '191553074485201096' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '191553074485201096' }] } } } }] } } }, { key: { FILTER: '209608314301990419' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '209608314301990419' }] } } } }] } } }, { key: { FILTER: '247307504273738382' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '247307504273738382' }] } } } }] } } }, { key: { FILTER: '257239960933193077' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '257239960933193077' }] } } } }] } } }, { key: { FILTER: '271471671527993003' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '271471671527993003' }] } } } }] } } }], after_key: { FILTER: '271471671527993003' } } } }
    response = { aggregations: nestedData } as any;
    component.formatData(response,'MATL_TYPE', '4', false);
    expect(component.formatData).toBeTruthy();

    const data = {'nested#nested_tags': { 'composite#bucket': { buckets: [{ key: { FILTER: '106406009136356487' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '106406009136356487' }] } } } }] } } }, { key: { FILTER: '115186306527988711' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '115186306527988711' }] } } } }] } } }, { key: { FILTER: '130086693666196566' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '130086693666196566' }] } } } }] } } }, { key: { FILTER: '161887603277972056' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '161887603277972056' }] } } } }] } } }, { key: { FILTER: '173400567817058882' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '173400567817058882' }] } } } }] } } }, { key: { FILTER: '191553074485201096' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '191553074485201096' }] } } } }] } } }, { key: { FILTER: '209608314301990419' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '209608314301990419' }] } } } }] } } }, { key: { FILTER: '247307504273738382' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '247307504273738382' }] } } } }] } } }, { key: { FILTER: '257239960933193077' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '257239960933193077' }] } } } }] } } }, { key: { FILTER: '271471671527993003' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '271471671527993003' }] } } } }] } } }], after_key: { FILTER: '271471671527993003' } } } }
    response = { aggregations: data } as any;
    component.formatData(response,'MATL_TYPE', '4', true);
    expect(component.formatData).toBeTruthy();
  });

  it('responseToMilisecond(), method to convert searcstring to milisecond', async() =>{
    const res = '1 d 2 h 34 m 45 s';
    const result = component.responseToMilisecond(res);
    expect(result).toEqual(95685000);
  });
});
