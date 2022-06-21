import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormRadioButtonGroupComponent } from './form-radio-button-group.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { FormControl } from '@angular/forms';
import { ReportService } from '@modules/report-v2/_service/report.service';
import { DropDownValues } from '@modules/report/_models/widget';
import { of } from 'rxjs';
import { SimpleChanges } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { BlockType, ConditionOperator, DisplayCriteria, FieldInfo, OrderWith, Widget } from '@modules/report-v2/_models/widget';
import { MetadataModel } from '@models/schema/schemadetailstable';
import { WidgetService } from '@services/widgets/widget.service';
import { Criteria } from '@modules/report/_models/widget';

describe('FormRadioButtonGroupComponent', () => {
  let component: FormRadioButtonGroupComponent;
  let fixture: ComponentFixture<FormRadioButtonGroupComponent>;
  let reportService: jasmine.SpyObj<ReportService>;
  let widgetService: jasmine.SpyObj<WidgetService>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FormRadioButtonGroupComponent],
      imports: [AppMaterialModuleForSpec, HttpClientTestingModule, MdoUiLibraryModule],
      providers: [ReportService, WidgetService]
    })
      .compileComponents();
    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    widgetService = TestBed.inject(WidgetService) as jasmine.SpyObj<WidgetService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormRadioButtonGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getDropDownValue(), should return dropdown values', async(() => {
    // const returnData: DropDownValues[] = [{
    //   sno: 1,
    //   CODE: 'first',
    //   TEXT: 'test',
    //   langu: '',
    //   display: '',
    //   FIELDNAME: ''
    // }];
    const filterWidget = new Widget()
    filterWidget.fieldCtrl = { fieldId: 'MATL_GROUP', picklist: '4' } as MetadataModel;
    filterWidget.widgetId = '13283821';
    component.widgetInfo = filterWidget as any;
    const criteria = [];
    const searchString = '';
    const searchAfter = '';
    component.formFieldInfo = { fields: 'MATL_GROUP', fldMetaData: { picklist: '4' }, widgetId:13283821, displayCriteria:'' } as FieldInfo;
    component.optionList = [];
    component.locale = '';
    component.isFilterWidget = false;
    component.isFetchingData = true;

    component.widgetId = 13283821;
    // expect(component.optionList.length).toEqual(0);
    const response = { aggregations: { 'composite#bucket': { buckets: [{ key: { FILTER: '106406009136356487' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '106406009136356487' }] } } } }] } } }, { key: { FILTER: '115186306527988711' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '115186306527988711' }] } } } }] } } }, { key: { FILTER: '130086693666196566' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '130086693666196566' }] } } } }] } } }, { key: { FILTER: '161887603277972056' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '161887603277972056' }] } } } }] } } }, { key: { FILTER: '173400567817058882' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '173400567817058882' }] } } } }] } } }, { key: { FILTER: '191553074485201096' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '191553074485201096' }] } } } }] } } }, { key: { FILTER: '209608314301990419' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '209608314301990419' }] } } } }] } } }, { key: { FILTER: '247307504273738382' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '247307504273738382' }] } } } }] } } }, { key: { FILTER: '257239960933193077' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '257239960933193077' }] } } } }] } } }, { key: { FILTER: '271471671527993003' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '271471671527993003' }] } } } }] } } }], after_key: { FILTER: '271471671527993003' } } } }
    spyOn(reportService, 'getRadioButtonValues')
      .withArgs(component.widgetId, component.formFieldInfo.fields, '', '4', '').and.returnValue(of(response));
    component.getDropDownValue('');
    expect(reportService.getRadioButtonValues).toHaveBeenCalledWith(component.widgetId, component.formFieldInfo.fields, '', '4', '');



    component.isFilterWidget = true;
    spyOn(widgetService, 'getWidgetData').withArgs(String(component.widgetInfo.widgetId), criteria, searchString, searchAfter).and.returnValue(of(response));
    component.getDropDownValue('', '', true);
    expect(component.optionList.length).toEqual(10);
    expect(widgetService.getWidgetData).toHaveBeenCalledWith(String(component.widgetInfo.widgetId), criteria, searchString, searchAfter);

    const filterWidget1 = new Widget()
    filterWidget1.fieldCtrl = { fieldId: 'MATL_GROUP', picklist: '30' } as MetadataModel;
    filterWidget1.widgetId = '13283821';
    component.widgetInfo = filterWidget1;
    component.getDropDownValue('', '', true);

    expect(widgetService.getWidgetData).toHaveBeenCalledWith(String(component.widgetInfo.widgetId), criteria, searchString, searchAfter);

    const filterWidget2 = new Widget()
    filterWidget2.fieldCtrl = { fieldId: 'MATL_GROUP', picklist: '0' } as MetadataModel;
    filterWidget2.widgetId = '13283821';
    component.widgetInfo = filterWidget2;
    component.getDropDownValue('', '', true);

    expect(widgetService.getWidgetData).toHaveBeenCalledWith(String(component.widgetInfo.widgetId), criteria, searchString, searchAfter);
  }));


  it('ngOnIt()', async(() => {
    component.widgetId = 4673647;
    spyOn(component,'getDropDownValue');
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();
  }));

  it('ngOnChanges()', async(() => {
    component.control = new FormControl();
    component.control.setValue('test1')
    component.optionList = [{ key: 'test1', value: 'test1' }];
    const changes: SimpleChanges = {};
    component.widgetId = 47873874;
    component.ngOnChanges(changes);
    expect(component.ngOnChanges).toBeTruthy();
    const change1: SimpleChanges = {
      formFieldInfo: {
        previousValue: null,
        currentValue: { fields: 'activityCheck',widgetId:4777676 },
        firstChange: false,
        isFirstChange() { return false }
      },
      control: {
        previousValue: false,
        currentValue: true,
        firstChange: false,
        isFirstChange() { return false }
      },
      value: {
        previousValue: false,
        currentValue: true,
        firstChange: false,
        isFirstChange() { return false }
      }
    };

    spyOn(component,'getDropDownValue');
    component.ngOnChanges(change1);
    expect(component.getDropDownValue).toHaveBeenCalled();

    component.isFilterWidget = true;
    const change: SimpleChanges = {
      value: {
        previousValue: false,
        currentValue: [{ CODE: 'test1', TEXT: 'test1' }],
        firstChange: false,
        isFirstChange() { return false }
      },
      widgetInfo: {
        previousValue: null,
        currentValue: { fields: 'activityCheck',widgetId:4777676 },
        firstChange: false,
        isFirstChange() { return false }
      },
      isMenuClosed: {
        previousValue: null,
        currentValue: false,
        firstChange: false,
        isFirstChange() { return false }
      },
      filterCriteria: {
        previousValue: null,
        currentValue: {fieldId:'MATL_GRP'},
        firstChange: false,
        isFirstChange() { return false }
      },
    };
    component.editedMode = true;
    component.widgetInfo = { widgetId: '12435' } as Widget;
    component.filterCriteria = [];
    component.isEnableGlobalFilter = false
    component.ngOnChanges(change);
    expect(component.ngOnChanges).toBeTruthy();
  }));

  it('applyFilter()', async () => {
    component.formFieldInfo = { fields: 'MATL_GROUP' } as FieldInfo;
    component.control = new FormControl();
    component.control.setValue('test1')
    component.optionList = [{ key: 'test1', value: 'test1' }];

    const emitEventSpy = spyOn(component.valueChange, 'emit');
    component.applyFilter();
    expect(component.previousSelectedValue).toEqual('test1');
    expect(emitEventSpy).toHaveBeenCalled();
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

    const result5 = component.getFields('FORWARDENABLED', 'n');
    expect(result5).toEqual('No');

    const result6 = component.getFields('FORWARDENABLED', 'y');
    expect(result6).toEqual('Yes');
  });

  it('getFieldsMetadaDesc(), should return the dropdown value of the field', async(() => {
    const buckets = [{ doc_count: 1, key: { FILTER: '1' }, 'top_hits#items': { hits: { hits: [{ _source: { hdvs: { MATL_GROUP: { vc: [{ c: 'on' }] } } } }] } } }, { doc_count: 1, key: { FILTER: 'on' }, 'top_hits#items': { hits: { hits: [{ _source: { hdvs: { MATL_GROUP: { vc: [{ c: 'off', t: 'Off' }] } } } }] } } }, { doc_count: 1, key: { FILTER: 'on' }, 'top_hits#items': { hits: { hits: [{ _source: { hdvs: { MATL_GROUP: {} } } }] } } }];
    component.values = [{ CODE: 'on', FIELDNAME: 'MATL_GROUP', TEXT: 'TRUE' } as DropDownValues, { CODE: 'off', FIELDNAME: 'MATL_GROUP', TEXT: 'FALSE' } as DropDownValues]
    const filterWidget = new Widget()
    filterWidget.fieldCtrl = { fieldId: 'MATL_GROUP', picklist: '35' } as MetadataModel;
    component.widgetInfo = filterWidget;
    component.getFieldsMetadaDesc(buckets, 'MATL_GROUP', false, '35');
    expect(component.values.length).toEqual(1);
    expect(component.values[0].TEXT).toEqual('True');

    // const buckets2 = [{ doc_count: 2, key: { FILTER: 'n' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { OVERDUE: { vc: [{ c: 'n' }] } } } }] } } }, { doc_count: 2, key: { FILTER: 'y' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { OVERDUE: { vc: [{ c: 'y' }] } } } }] } } }];
    // component.values = [{ CODE: 'n', FIELDNAME: 'OVERDUE', TEXT: 'n' } as DropDownValues, { CODE: 'y', FIELDNAME: 'OVERDUE', TEXT: 'y' } as DropDownValues]
    // const filterWidget1 = new Widget()
    // filterWidget1.fieldCtrl = { fieldId: 'OVERDUE', picklist: '1' } as MetadataModel;
    // component.widgetInfo = filterWidget1;
    // component.getFieldsMetadaDesc(buckets2, 'OVERDUE', false, '1');
    // expect(component.values.length).toEqual(2);
    // expect(component.values[0].TEXT).toEqual('No');
    // expect(component.values[1].TEXT).toEqual('Yes');
  }));

  it('sortDropdownData() should sort the dropdownData', async(() => {
    const dropdownData: any[] = [];
    const dropdownOption = {
      value: '00104',
      FIELDNAME: 'MATL_GROUP',
      key: 'Mechanics',
      display: 'Mechanics'
    };

    dropdownData.push(dropdownOption);
    dropdownOption.value = 'ABCDEF';
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

  it('formatData()', async () => {
    let response = { aggregations: { 'composite#bucket': { buckets: [{ key: { FILTER: '106406009136356487' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '106406009136356487' }] } } } }] } } }, { key: { FILTER: '115186306527988711' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '115186306527988711' }] } } } }] } } }, { key: { FILTER: '130086693666196566' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '130086693666196566' }] } } } }] } } }, { key: { FILTER: '161887603277972056' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '161887603277972056' }] } } } }] } } }, { key: { FILTER: '173400567817058882' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '173400567817058882' }] } } } }] } } }, { key: { FILTER: '191553074485201096' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '191553074485201096' }] } } } }] } } }, { key: { FILTER: '209608314301990419' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '209608314301990419' }] } } } }] } } }, { key: { FILTER: '247307504273738382' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '247307504273738382' }] } } } }] } } }, { key: { FILTER: '257239960933193077' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '257239960933193077' }] } } } }] } } }, { key: { FILTER: '271471671527993003' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '271471671527993003' }] } } } }] } } }], after_key: { FILTER: '271471671527993003' } } } }
    component.formatData(response, false,'MATL_TYPE', '4');
    expect(component.formatData).toBeTruthy();

    const nestedData = {'nested#nested_tags': { 'composite#bucket': { buckets: [{ key: { FILTER: '106406009136356487' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '106406009136356487' }] } } } }] } } }, { key: { FILTER: '115186306527988711' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '115186306527988711' }] } } } }] } } }, { key: { FILTER: '130086693666196566' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '130086693666196566' }] } } } }] } } }, { key: { FILTER: '161887603277972056' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '161887603277972056' }] } } } }] } } }, { key: { FILTER: '173400567817058882' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '173400567817058882' }] } } } }] } } }, { key: { FILTER: '191553074485201096' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '191553074485201096' }] } } } }] } } }, { key: { FILTER: '209608314301990419' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '209608314301990419' }] } } } }] } } }, { key: { FILTER: '247307504273738382' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '247307504273738382' }] } } } }] } } }, { key: { FILTER: '257239960933193077' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '257239960933193077' }] } } } }] } } }, { key: { FILTER: '271471671527993003' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '271471671527993003' }] } } } }] } } }], after_key: { FILTER: '271471671527993003' } } } }
    response = { aggregations: nestedData } as any;
    component.formatData(response, false,'MATL_TYPE', '4');
    expect(component.formatData).toBeTruthy();
  });


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

});
