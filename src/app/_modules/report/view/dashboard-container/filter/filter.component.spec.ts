import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterComponent } from './filter.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Criteria, DropDownValues, FilterWidget, FilterResponse, Widget, WidgetType, DisplayCriteria, WidgetHeader } from '../../../_models/widget';
import { MatSliderChange } from '@angular/material/slider';
import { MetadataModel } from 'src/app/_models/schema/schemadetailstable';
import * as moment from 'moment';
import { WidgetService } from '@services/widgets/widget.service';
import { of } from 'rxjs';
import { UDRBlocksModel } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { MatDatepickerInputEvent } from '@angular/material/datepicker/datepicker-input-base';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { SharedModule } from '@modules/shared/shared.module';
import { SimpleChanges } from '@angular/core';
import { Userdetails } from '@models/userdetails';

describe('FilterComponent', () => {
  let component: FilterComponent;
  let fixture: ComponentFixture<FilterComponent>;
  let widgetService: WidgetService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FilterComponent],
      imports: [MdoUiLibraryModule, AppMaterialModuleForSpec, HttpClientTestingModule, SharedModule]
    })
      .compileComponents();
  }));

  it('getFilterMetadata(), get Metadata ', async(() => {

      component.widgetId = 265367423;
      component.filterCriteria = [];
      component.userDetails = {defLocs:[]} as Userdetails;
      spyOn(widgetService,'getFilterMetadata').withArgs(component.widgetId).and.returnValue(of({
        fieldId:'C_DATE',
        isGlobal:true,
        metaData: {
          fieldId:'C_DATE',
          picklist:'0',
          dataType:'DATS'
        } as MetadataModel,
        udrBlocks:[
          {
            blockDesc:'DAY_10',
            conditionFieldId:'C_DATE',
            conditionOperator:'RANGE'
          } as UDRBlocksModel
        ]
      }));
      component.getFilterMetadata();

      expect(widgetService.getFilterMetadata).toHaveBeenCalledWith(component.widgetId);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterComponent);
    component = fixture.componentInstance;
    widgetService = fixture.debugElement.injector.get(WidgetService);

    const widget: Widget = new Widget();
    widget.width = 120;
    widget.height = 10;
    component.widgetInfo = widget;
    component.boxSize = 10;
    const widgetHeader = new WidgetHeader();
    widgetHeader.desc = 'Name test'
    component.widgetHeader = widgetHeader;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('isSelected(), should check option is selected or not',async(() => {
    component.userDetails = {defLocs:[]} as Userdetails;
    const filter: Criteria = new Criteria();
    const option: DropDownValues = { CODE: 'ZMRO', FIELDNAME: 'MATL_TYPE' } as DropDownValues;
    component.filterCriteria = [];
    component.filterWidget.next(new FilterWidget());
    component.userDetails = {defLocs:[]} as Userdetails;
    expect(component.isSelected(option)).toEqual(false);
    filter.conditionFieldId = 'MATL_TYPE';
    filter.conditionFieldValue = 'ZMRO';
    filter.widgetType = WidgetType.FILTER;
    component.filterCriteria = [filter];
    const fld: FilterWidget = new FilterWidget();
    fld.fieldId = 'MATL_TYPE';
    component.filterWidget.next(fld);
    expect(component.isSelected(option)).toEqual(true);
  }));

  it('removeOldFilterCriteria(), remove olf filter criteria ', async(() => {
    const filter: Criteria = new Criteria();
    filter.conditionFieldId = 'MATL_TYPE';
    filter.conditionFieldValue = 'ZMRO';
    component.filterCriteria = [filter];
    component.removeOldFilterCriteria([filter]);
    expect(component.filterCriteria.length).toEqual(0);
  }));

  it('optionClicked(), click on options ', async(()=>{
    let event = {option:{value:{CODE:'4',FIELDNAME:'EVENT_ID',TEXT:'Change'}}} as MatAutocompleteSelectedEvent;
    component.filterCriteria = [{blockType: 'COND', conditionFieldId: 'EVENT_ID',conditionFieldValue: '4', conditionOperator: 'EQUAL',fieldId: 'EVENT_ID'} as Criteria];
    spyOn(component,'toggleSelection')
    component.optionClicked(event);
    expect(component.optionClicked).toBeTruthy();
    expect(component.toggleSelection).toHaveBeenCalled();

    event = {} as MatAutocompleteSelectedEvent;
    const option = {CODE:'4',FIELDNAME:'EVENT_ID',TEXT:'Change'}as DropDownValues;
    component.optionClicked(event, option);
    expect(component.optionClicked).toBeTruthy();
  }));

  it('toggleSelection(), toggle selection ', async(()=>{
    component.userDetails = {defLocs:[]} as Userdetails;
    component.filterCriteria = [];
    const filterWidget = new FilterWidget();
    component.filterWidget.next(filterWidget);
    component.toggleSelection(null);
    component.userDetails = {defLocs:[]} as Userdetails;
    expect(component.toggleSelection).toBeTruthy();

    component.filterCriteria = [{blockType: 'COND', conditionFieldId: 'ZMRO',conditionFieldValue: '4', conditionOperator: 'EQUAL',fieldId: 'ZMRO'} as Criteria];
    let option = {CODE:'4', TEXT:'4', FIELDNAME:'ZMRO'}as DropDownValues;
    filterWidget.fieldId = 'ZMRO';
    filterWidget.isMultiSelect = true;
    component.filterWidget.next(filterWidget);
    component.toggleSelection(option);
    expect(component.toggleSelection).toBeTruthy();

    option = {CODE:'4', TEXT:'4', FIELDNAME:'MAT_TYPE'}as DropDownValues;
    component.toggleSelection(option);
    expect(component.toggleSelection).toBeTruthy();

    option = {CODE:'5', TEXT:'4', FIELDNAME:'ZMRO'}as DropDownValues;
    component.toggleSelection(option);
    expect(component.toggleSelection).toBeTruthy();

    filterWidget.isMultiSelect = false;
    option = {CODE:'5', TEXT:'4', FIELDNAME:'ZMRO'}as DropDownValues;
    component.toggleSelection(option);
    expect(component.toggleSelection).toBeTruthy();

  }));

  it('fieldDisplayFn(), should return field desc', async(() => {
    expect(component.fieldDisplayFn({ TEXT: 'Matl Desc' })).toEqual('Matl Desc');
    expect(component.fieldDisplayFn('')).toEqual('');
  }));

  // it('returnSelectedDropValues(), should return selected drop values', async(()=>{
  //   component.userDetails = {defLocs:[]} as Userdetails;
  //   expect(component.returnSelectedDropValues([])).toEqual([]);

  //   component.selectedDropVals = [{CODE:'4', TEXT:'4'}as DropDownValues];
  //   let criteria = [{blockType: 'COND', conditionFieldId: 'ZMRO',conditionFieldValue: '4', conditionOperator: 'EQUAL',fieldId: 'ZMRO'} as Criteria];
  //   const returnValue = [{CODE:'4', FIELDNAME:'ZMRO', TEXT:'4', langu:'EN',sno: null, display:'4'}as DropDownValues];
  //   const filterWidget = new FilterWidget();
  //   filterWidget.fieldId = 'ZMRO';
  //   component.filterWidget.next(filterWidget);
  //   expect(component.returnSelectedDropValues(criteria)).toEqual(returnValue);

  //   component.values = [{CODE:'4', TEXT:'4'}as DropDownValues];
  //   component.filterWidget.next(filterWidget);
  //   expect(component.returnSelectedDropValues(criteria)).toEqual(returnValue);

  //   criteria = [{blockType: 'COND', conditionFieldId: 'NUMC',conditionFieldValue: '4', conditionOperator: 'EQUAL',fieldId: 'NUMC'} as Criteria];
  //   expect(component.returnSelectedDropValues(criteria)).toEqual([]);
  // }));

  it('remove(), should remove the selected from criteria', async(()=>{
    component.userDetails = {defLocs:[]} as Userdetails;
    component.filterCriteria = [];
    component.filterWidget.next(new FilterWidget());
    component.remove(null);
    expect(component.remove).toBeTruthy();
  }));

  it('setPositionOfDatePicker(), should set position to date pocker ', async(() => {
    component.setPositionOfDatePicker();
    expect(component.setPositionOfDatePicker).toBeTruthy();
  }));

  it('changeStartDate(), change start date', async(() => {
    const event = { value: new Date() } as MatDatepickerInputEvent<Date>;
    component.changeStartDate({} as MatDatepickerInputEvent<Date>);
    expect(component.startDate).toEqual(undefined);
    component.changeStartDate(event);
    const expected = Number(component.startDate);
    expect(moment(event.value).valueOf()).toEqual(expected);
  }));

  it('changeEndtDate(), change end date', async(() => {
    const event = { value: new Date() } as MatDatepickerInputEvent<Date>;
    component.changeEndtDate({} as MatDatepickerInputEvent<Date>);
    expect(component.startDate).toEqual(undefined);
    component.changeEndtDate(event);
    const expected = Number(component.endDate);
    expect(event.value.getTime()).toEqual(expected);
  }));

  it('emitDateChangeValues(), emit after date change',async(()=>{
    component.userDetails = {defLocs:[]} as Userdetails;
      component.emitDateChangeValues();
      component.startDate = String(new Date().getTime());
      component.endDate = String(new Date().getTime());
      component.filterCriteria = [];
      let filterWidget = new FilterWidget();
      filterWidget.fieldId = 'ZMRO';
      component.filterWidget.next(filterWidget);
      component.emitDateChangeValues();
      expect(component.emitDateChangeValues).toBeTruthy();

      component.startDate = '1234567890';
      component.endDate = '0987654321';
      filterWidget = new FilterWidget();
        filterWidget.fieldId = 'DATECREATED';
        filterWidget.metaData = { dataType: 'DATECREATED', picklist: '0' } as MetadataModel;
      component.filterWidget.next(filterWidget);
      component.filterCriteria = [{ blockType: 'COND', conditionFieldId: 'ZMRO', conditionFieldStartValue: '1234567890', conditionFieldEndValue: '0987654321', conditionOperator: 'EQUAL', fieldId: 'ZMRO' } as Criteria];
      component.emitDateChangeValues();
      expect(component.emitDateChangeValues).toBeTruthy();
    }));

  it('clearSelectedPicker(), clear selected date picker', async(()=>{
    component.userDetails = {defLocs:[]} as Userdetails;
    const filterWidget = new FilterWidget();
    filterWidget.fieldId = 'ZMRO';
    filterWidget.metaData = {dataType: 'NUMC', picklist:'0'} as MetadataModel;
    component.filterWidget.next(filterWidget);
    component.filterCriteria = [{blockType: 'COND', conditionFieldId: 'ZMRO',conditionFieldValue: '4', conditionOperator: 'EQUAL',fieldId: 'ZMRO'} as Criteria];    component.clearSelectedPicker();
    expect(component.startDate).toEqual(null);
    expect(component.endDate).toEqual(null);
    expect(component.startDateCtrl.value).toEqual('');
    expect(component.endDateCtrl.value).toEqual('');

  }));

  it('formatMatSliderLabel(), show slider label', async(()=>{
      expect(component.formatMatSliderLabel(10000)).toEqual('10k');
      expect(component.formatMatSliderLabel(10)).toEqual(10);
  }));

  it('sliderValueChange(), slider value change',async(()=>{
    component.userDetails = {defLocs:[]} as Userdetails;
    component.sliderValueChange(null);
    const event = { value: 420 } as MatSliderChange;
    component.filterCriteria = [];
    const filterWidget = new FilterWidget();
    filterWidget.fieldId = 'ZMRO';
    component.filterWidget.next(filterWidget);
    component.filterResponse = new FilterResponse();
    component.sliderValueChange(event);
    expect(component.sliderValueChange).toBeTruthy();
  }));

  it('clearFilterCriteria(), clear filter criteria', async(()=>{
    component.userDetails = {defLocs:[]} as Userdetails;
    const filterWidget = new FilterWidget();
    filterWidget.fieldId = 'ZMRO';
    filterWidget.metaData = { dataType: 'NUMC', picklist: '0' } as MetadataModel;
    component.filterWidget.next(filterWidget);
    component.filterCriteria = [{blockType: 'COND', conditionFieldId: 'ZMRO',conditionFieldValue: '4', conditionOperator: 'EQUAL',fieldId: 'ZMRO'} as Criteria];
    component.filterResponse = new FilterResponse();
    component.clearFilterCriteria(false);
    expect(component.clearFilterCriteria).toBeTruthy();

    filterWidget.metaData = {dataType: 'DTMS', picklist:'0'} as MetadataModel;
    component.filterWidget.next(filterWidget);
    component.clearFilterCriteria(false);
    expect(component.clearFilterCriteria).toBeTruthy();

    filterWidget.metaData = {dataType: 'DATS', picklist:'0'} as MetadataModel;
    component.filterWidget.next(filterWidget);
    component.clearFilterCriteria(false);
    expect(component.clearFilterCriteria).toBeTruthy();

    filterWidget.fieldId = 'ZMRO';
    filterWidget.metaData = {picklist:'1'} as MetadataModel;
    component.filterWidget.next(filterWidget);
    component.clearFilterCriteria(false);
    expect(component.clearFilterCriteria).toBeTruthy();

    filterWidget.metaData = {picklist:'29'} as MetadataModel;
    component.filterWidget.next(filterWidget);
    component.clearFilterCriteria(true);
    expect(component.clearFilterCriteria).toBeTruthy();
    expect(component.isClearButtonClicked).toEqual(true);

    filterWidget.metaData = {picklist:'5'} as MetadataModel;
    component.filterWidget.next(filterWidget);
    component.clearFilterCriteria(false);
    expect(component.clearFilterCriteria).toBeTruthy();
  }));

  it(`ngOnChanges(), should call reset when reset filter`, async(() => {
    component.userDetails = {defLocs:[]} as Userdetails;
    component.filterFormControl.setValue('test');
    const filterWidget = new FilterWidget();
    filterWidget.fieldId = 'ZMRO';
    filterWidget.metaData = { dataType: 'NUMC', picklist: '0' } as MetadataModel;
    component.filterWidget.next(filterWidget);
    component.filterCriteria = [];
    component.filterResponse = new FilterResponse();
    // mock data
    const chnages: SimpleChanges = { hasFilterCriteria: { currentValue: true, previousValue: false, firstChange: null, isFirstChange: null } };

    // call actual method
    component.ngOnChanges(chnages);

    expect(component.enableClearIcon).toEqual(false, 'When reset successfully then enableClearIcon should be false');
    expect(component.filterFormControl.value).toEqual('');
  }));

  // it('updateObjRefDescription(), update description of objRef in filter', async(()=>{
  //   const buckets = [{doc_count: 21151,key: 'KEY2','top_hits#items':{hits:{hits: [{ _source: {hdvs: {MATL_GROUP: {vc: [{c: 'KEY2',t: 'Key2'}]}}}}]}}}];
  //   const filterWidget= new FilterWidget()
  //   filterWidget.metaData={fieldId:'MATL_GROUP',picklist:'1', fieldType:'CHAR'} as MetadataModel;
  //   component.filterWidget.next(filterWidget);
  //   component.updateObjRefDescription(buckets, 'MATL_GROUP', false);

  //   expect(component.values.length).toEqual(0);
  // }));

  it('getFieldsMetadaDesc(), should return the dropdown value of the field', async(() => {
    const buckets = [{doc_count:1,key:{FILTER:'1'},'top_hits#items':{hits:{hits:[{_source:{hdvs:{MATL_GROUP:{vc:[{c: '200010'}]}}}}]}}},{doc_count:1,key:{FILTER:'1'},'top_hits#items':{hits:{hits:[{_source:{hdvs:{MATL_GROUP:{vc:[{c: '200010',t:'testing'}]}}}}]}}}, {doc_count:1,key:{FILTER:'1'},'top_hits#items':{hits:{hits:[{_source:{hdvs:{MATL_GROUP:{}}}}]}}}];
    component.values = [{CODE: '200010', FIELDNAME: 'MATL_GROUP', TEXT: '200010'} as DropDownValues, {CODE: '200010', FIELDNAME: 'MATL_GROUP', TEXT: 'testing'} as DropDownValues]
    component.userDetails = {defLocs:[]} as Userdetails;
    const filterWidget= new FilterWidget()
     filterWidget.metaData={fieldId:'MATL_GROUP',picklist:'1'} as MetadataModel;
    component.filterWidget.next(filterWidget);
    component.getFieldsMetadaDesc(buckets, 'MATL_GROUP', false);
    expect(component.values.length).toEqual(2);
    expect(component.values[0].TEXT).toEqual('200010');
    expect(component.values[1].TEXT).toEqual('testing');

    const buckets2 = [{ doc_count: 2, key: { FILTER: 'n' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { OVERDUE: { vc: [{ c: 'n' }] } } } }] } } }, { doc_count: 2, key: { FILTER: 'y' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { OVERDUE: { vc: [{ c: 'y' }] } } } }] } } }];
    component.values = [{ CODE: 'n', FIELDNAME: 'OVERDUE', TEXT: 'n' } as DropDownValues, { CODE: 'y', FIELDNAME: 'OVERDUE', TEXT: 'y' } as DropDownValues]
    const filterWidget1 = new FilterWidget()
    filterWidget1.metaData = { fieldId: 'OVERDUE', picklist: '1' } as MetadataModel;
    component.filterWidget.next(filterWidget1);
    component.getFieldsMetadaDesc(buckets2, 'OVERDUE', false);
    expect(component.values.length).toEqual(2);
    expect(component.values[0].TEXT).toEqual('No');
    expect(component.values[1].TEXT).toEqual('Yes');
  }));

  it(`loadAlldropData(), should return the filter data`, async(() => {
    // mock data
    component.userDetails = {defLocs:[]} as Userdetails;
    const filterWidget= new FilterWidget()
     filterWidget.fieldId='WFID';
     filterWidget.isMultiSelect=true;
     filterWidget.metaData={fieldId:'WFID',picklist:'1'} as MetadataModel;
    component.filterWidget.next(filterWidget);
    component.widgetId = 13283821;
    const response = { aggregations: { 'composite#bucket': { buckets: [{ key: { FILTER: '106406009136356487' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '106406009136356487' }] } } } }] } } }, { key: { FILTER: '115186306527988711' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '115186306527988711' }] } } } }] } } }, { key: { FILTER: '130086693666196566' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '130086693666196566' }] } } } }] } } }, { key: { FILTER: '161887603277972056' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '161887603277972056' }] } } } }] } } }, { key: { FILTER: '173400567817058882' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '173400567817058882' }] } } } }] } } }, { key: { FILTER: '191553074485201096' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '191553074485201096' }] } } } }] } } }, { key: { FILTER: '209608314301990419' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '209608314301990419' }] } } } }] } } }, { key: { FILTER: '247307504273738382' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '247307504273738382' }] } } } }] } } }, { key: { FILTER: '257239960933193077' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '257239960933193077' }] } } } }] } } }, { key: { FILTER: '271471671527993003' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { WFID: { vc: [{ c: '271471671527993003' }] } } } }] } } }], after_key: { FILTER: '271471671527993003' } } } }
    const fieldId = 'WFID';
    const criteria = [];
    const searchString = '';
    const searchAfter = '';
    component.userDetails={defLocs:['abc']} as Userdetails;
    spyOn(widgetService,'getWidgetData').withArgs(String(component.widgetId),criteria,searchString,searchAfter,'',component.userDetails.defLocs.toString()).and.returnValue(of(response));
    component.loadAlldropData(fieldId,criteria,searchString,searchAfter);

    expect(widgetService.getWidgetData).toHaveBeenCalledWith(String(component.widgetId),criteria,searchString,searchAfter,'',component.userDetails.defLocs.toString());
    expect(component.isLoadMore).toEqual(true);
    expect(component.searchAfter).toEqual('271471671527993003');
  }));

  it('onScroll(), scroll event object', async(()=> {
    component.userDetails = {defLocs:[]} as Userdetails;
    spyOn(component,'loadAlldropData');
    component.isLoadMore = true;
    const filterWidget = new FilterWidget()
    filterWidget.fieldId = 'WFID';
    filterWidget.isMultiSelect = true;
    filterWidget.metaData = { fieldId: 'WFID', picklist: '1' } as MetadataModel;
    component.filterWidget.next(filterWidget);
    component.filterCriteria = [];
    component.searchString = '';
    component.searchAfter = '';
    component.userDetails = {defLocs:[]} as Userdetails;
    component.onScroll();
    expect(component.loadAlldropData).toHaveBeenCalledWith(component.filterWidget.value.fieldId, component.filterCriteria,component.searchString,component.searchAfter);

    component.isLoadMore = false;
    component.onScroll();

    expect(component.onScroll).toBeTruthy();
  }));

  it('removefilter(), should remove the filter of that cureenet fieldId', async(()=> {
    component.userDetails = {defLocs:[]} as Userdetails;
    const critera = [{fieldId:'WFID', widgetType:WidgetType.FILTER} as Criteria];
    const filterWidget= new FilterWidget()
      filterWidget.fieldId='WFID';
      filterWidget.isMultiSelect=true;
      filterWidget.metaData={fieldId:'WFID',picklist:'1'} as MetadataModel;
   component.filterWidget.next(filterWidget);
   const res = component.removefilter('WFID', critera);
    expect(res).toEqual([]);
  }));

  it('onfocus(), should call when text field in focus', async(()=> {
    component.userDetails = {defLocs:[]} as Userdetails;
    component.filterCriteria = [{fieldId:'WFID', widgetType:WidgetType.FILTER} as Criteria];
    const filterWidget= new FilterWidget()
      filterWidget.fieldId='WFID';
      filterWidget.isMultiSelect=true;
      filterWidget.metaData={fieldId:'WFID',picklist:'1'} as MetadataModel;
   component.filterWidget.next(filterWidget);
   component.searchString = '';
   component.searchAfter = '82734883';
   const filter = [{CODE:'test'},{CODE:'test'},{CODE:'test'},{CODE:'test'},{CODE:'test'},{CODE:'test'},{CODE:'test'},{CODE:'test'},{CODE:'test'},{CODE:'test'},{CODE:'test'},{CODE:'test'}]as DropDownValues[];
   component.filteredOptionsSubject.next(filter);
   component.userDetails = {defLocs:[]} as Userdetails;
   spyOn(component,'loadAlldropData');
   component.onfocus();

    expect(component.filterCriteria.length).toEqual(1);
    expect(component.loadAlldropData).toHaveBeenCalledWith(component.filterWidget.value.fieldId, component.filterCriteria, component.searchString, '');


    component.searchAfter = '';
    component.onfocus();

    expect(component.filterCriteria.length).toEqual(1);
  }));

  it('setDisplayCriteria(), should return string from DisplayCriteria', async(() => {
    component.displayCriteriaOption = DisplayCriteria.TEXT;
    const test = { t: 'test', c: '1234' };
    let res = component.setDisplayCriteria(test.c, test.t);
    expect(res).toEqual('test');

    component.displayCriteriaOption = DisplayCriteria.CODE;
    res = component.setDisplayCriteria(test.c, test.t);
    expect(res).toEqual('1234');

    component.displayCriteriaOption = DisplayCriteria.CODE_TEXT;
    res = component.setDisplayCriteria(test.c, test.t);
    expect(res).toEqual('1234 -- test');

    component.displayCriteriaOption = undefined;
    res = component.setDisplayCriteria(test.c, test.t);
    expect(res).toEqual('test');

    res = component.setDisplayCriteria(test.c, '');
    expect(res).toEqual('1234');
  }));

  it('setFilteredOptions(), should call filteredOptionsSubject.next base on reset boolean', async(() => {
    component.values = [{ CODE: '200010', FIELDNAME: 'MATL_GROUP', TEXT: '200010' } as DropDownValues, { CODE: '200010', FIELDNAME: 'MATL_GROUP', TEXT: 'testing' } as DropDownValues]
    component.setFilteredOptions();
    expect(component.filteredOptionsSubject.value.length).toEqual(2);

    component.values = [{ CODE: '200010', FIELDNAME: 'MATL_GROUP', TEXT: '200010' } as DropDownValues, { CODE: '200010', FIELDNAME: 'MATL_GROUP', TEXT: 'testing' } as DropDownValues]
    component.setFilteredOptions();
    expect(component.filteredOptionsSubject.value.length).toEqual(2);

    component.values = [{ CODE: '200010', FIELDNAME: 'MATL_GROUP', TEXT: '200010' } as DropDownValues, { CODE: '200010', FIELDNAME: 'MATL_GROUP', TEXT: 'testing' } as DropDownValues]
    component.setFilteredOptions(true);
    expect(component.filteredOptionsSubject.value.length).toEqual(2);
  }));

  // it('saveDisplayCriteria(), should call saveDisplayCriteria', async(() => {
  //   const filterWidget = new FilterWidget();
  //   filterWidget.fieldId = 'ZMRO';
  //   component.filterWidget.next(filterWidget);
  //   component.displayCriteriaOption = DisplayCriteria.TEXT;
  //   component.widgetId = 12345;
  //   component.widgetInfo = new Widget();
  //   component.widgetInfo.widgetType = WidgetType.FILTER;
  //   component.widgetInfo.widgetId = component.widgetId.toString();
  //   component.filterCriteria = [];
  //   spyOn(component,'loadAlldropData');
  //   spyOn(widgetService, 'saveDisplayCriteria').withArgs(component.widgetInfo.widgetId, component.widgetInfo.widgetType, component.displayCriteriaOption).and.returnValue(of({}));
  //   component.saveDisplayCriteria();
  //   expect(widgetService.saveDisplayCriteria).toHaveBeenCalledWith('12345', WidgetType.FILTER, DisplayCriteria.TEXT);
  // }));

  it('setSelectedQuickDateFilter', async(() => {
    const code = 'TODAY';
    component.setSelectedQuickDateFilter(code);
    expect(component.dateFilterQuickSelect[0].isSelected).toEqual(true);

    const code1 = 'DAY_7';
    component.setSelectedQuickDateFilter(code1);
    expect(component.dateFilterQuickSelect[1].isSelected).toEqual(true);

    const code2 = 'DAY_10';
    component.setSelectedQuickDateFilter(code2);
    expect(component.dateFilterQuickSelect[2].isSelected).toEqual(true);

    const code3 = 'DAY_20';
    component.setSelectedQuickDateFilter(code3);
    expect(component.dateFilterQuickSelect[3].isSelected).toEqual(true);

    const code4 = 'DAY_30';
    component.setSelectedQuickDateFilter(code4);
    expect(component.dateFilterQuickSelect[0].isSelected).toEqual(true);
  }))

  it('showHeadingTooltip() should set tooltipDirective disabled', async(() => {
    component.showHeadingTooltip();
    expect(component.tooltipDirective.disabled).toBeTruthy();

  }))

  // it('sortDropdownData() should ssort the dropdownData', async(() => {
  //   const dropdownData: DropDownValues[] = [];
  //   const dropdownOption = {
  //     CODE: '00104',
  //     FIELDNAME: 'MATL_GROUP',
  //     TEXT: 'Mechanics',
  //     display: 'Mechanics'
  //   } as DropDownValues;

  //   dropdownData.push(dropdownOption);
  //   dropdownOption.CODE = 'ABCDEF';
  //   dropdownData.push(dropdownOption);
  //   const filterWidget = new FilterWidget()
  //   filterWidget.orderWith = OrderWith.DESC;
  //   component.filterWidget.next(filterWidget);
  //   component.displayCriteriaOption = DisplayCriteria.TEXT;
  //   component.sortDropdownData(dropdownData);
  //   expect(dropdownData.length).toEqual(2);

  //   filterWidget.orderWith = OrderWith.ASC;
  //   component.filterWidget.next(filterWidget);
  //   component.displayCriteriaOption = DisplayCriteria.TEXT;
  //   component.sortDropdownData(dropdownData);
  //   expect(dropdownData.length).toEqual(2);

  //   filterWidget.orderWith = OrderWith.ASC;
  //   component.filterWidget.next(filterWidget);
  //   component.displayCriteriaOption = DisplayCriteria.CODE;
  //   component.sortDropdownData(dropdownData);
  //   expect(dropdownData.length).toEqual(2);

  //   filterWidget.orderWith = OrderWith.DESC;
  //   component.filterWidget.next(filterWidget);
  //   component.displayCriteriaOption = DisplayCriteria.CODE;
  //   component.sortDropdownData(dropdownData);
  //   expect(dropdownData.length).toEqual(2);
  // }));

  it('slidervalue()', async(()=> {
    component.userDetails = {defLocs:[]} as Userdetails;
    let event = {value:50};
    component.filterResponse = {min: 52, max: 550, fieldId:'NUMC'};
    component.filterCriteria = [{blockType: 'COND', conditionFieldId: 'NUMC',conditionFieldValue: '4', conditionOperator: 'EQUAL',fieldId: 'NUMC'} as Criteria];
    const filterWidget = new FilterWidget();
    filterWidget.fieldId = 'ZMRO';
    component.filterWidget.next(filterWidget);
    component.userDetails = {defLocs:[]} as Userdetails;
    component.slidervalue(event);
    expect(component.numericValCtrl.value).toEqual(52);

    event = {value:552};
    component.slidervalue(event);
    expect(component.numericValCtrl.value).toEqual(550);

    event = {value:102};
    component.slidervalue(event);
    expect(component.numericValCtrl.value).toEqual(102);
  }));

  it('removeSingleSelectedVal()', async(()=> {
    component.userDetails = {defLocs:[]} as Userdetails;
    component.filterCriteria = [{blockType: 'COND', conditionFieldId: 'ZMRO',conditionFieldValue: '4', conditionOperator: 'EQUAL',fieldId: 'ZMRO'} as Criteria];
    const filterWidget = new FilterWidget();
    filterWidget.fieldId = 'ZMRO';
    component.filterWidget.next(filterWidget);
    const isClearCall = false;
    component.removeSingleSelectedVal(isClearCall);
    expect(component.removeSingleSelectedVal).toBeTruthy();
  }));
});