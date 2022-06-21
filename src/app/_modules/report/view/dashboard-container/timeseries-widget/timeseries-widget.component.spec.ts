import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeseriesWidgetComponent } from './timeseries-widget.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FilterWidget, SeriesWith, WidgetTimeseries, AggregationOperator, ChartType, TimeSeriesWidget, AssginedColor, WidgetType, Criteria, DisplayCriteria, WidgetViewRequestPayload, WidgetView, WidgetViewDetails, Widget, WidgetViewPayload } from '@modules/report/_models/widget';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { FormControl, FormGroup } from '@angular/forms';
import { WidgetService } from '@services/widgets/widget.service';
import { of } from 'rxjs';
import { LegendItem } from 'chart.js';
import { SharedModule } from '@modules/shared/shared.module';
import { MetadataModel } from '@models/schema/schemadetailstable';
import { Userdetails } from '@models/userdetails';
import { MatDialog } from '@angular/material/dialog';

describe('TimeseriesWidgetComponent', () => {
  let component: TimeseriesWidgetComponent;
  let fixture: ComponentFixture<TimeseriesWidgetComponent>;
  let widgetService: WidgetService;
  // let htmlnative: HTMLElement;

  const mockMatDialogOpen = {
    open: jasmine.createSpy('open')
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TimeseriesWidgetComponent],
      imports: [MdoUiLibraryModule,
        HttpClientTestingModule,
        AppMaterialModuleForSpec,
        SharedModule
      ],
      providers:[
        {
          provide: MatDialog,
          useValue:mockMatDialogOpen
        },
        { provide: WidgetService }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeseriesWidgetComponent);
    component = fixture.componentInstance;
    // htmlnative = fixture.nativeElement;
    widgetService = fixture.debugElement.injector.get(WidgetService);
  });

  it('emitDateChangeValues(), emit after date change', async(() => {
    component.startDateCtrl = new FormControl();
    component.startDateCtrl.patchValue(String(new Date().getTime()));
    component.endDateCtrl = new FormControl();
    component.endDateCtrl.patchValue(String(new Date().getTime()));
    let timeseriesData: TimeSeriesWidget;
    let widgetTimeseries: WidgetTimeseries;

    widgetTimeseries = {
      widgetId: 123, fieldId: 'STATUS', seriesWith: SeriesWith.week, seriesFormat: 'dd.mm.yyyy', aggregationOperator: AggregationOperator.COUNT,
      chartType: ChartType.LINE,
      isEnableDatalabels: false,
      isEnableLegend: false,
      legendPosition: null,
      datalabelsPosition: null,
      xAxisLabel: '100',
      yAxisLabel: '100',
      scaleFrom: 0,
      scaleTo: 1000,
      stepSize: 100,
      dataSetSize: 100,
      startDate: '7',
      showTotal: false,
      groupWith: 'REQUESTOR_DATE', widgetColorPalette: null, distictWith: 'REGION', bucketFilter: null, showInPercentage: false,
      metaData: { fieldDescri: 'Requested Date' } as MetadataModel
    }

    timeseriesData = { widgetId: 123, widgetName: 'test', widgetType: null, objectType: '1005', plantCode: '0', indexName: 'do_workflow', desc: '', timeSeries: widgetTimeseries, isEnableGlobalFilter: false }

    component.timeseriesData = timeseriesData;
    component.filterCriteria = [];
    const filterWidget = new FilterWidget();
    filterWidget.fieldId = 'STATUS';
    component.emitDateChangeValues();
    expect(component.emitDateChangeValues).toBeTruthy();

    component.timeseriesData = timeseriesData;
    component.filterCriteria = [{fieldId:'STATUS',conditionFieldId:'REQUESTOR_DATE'} as Criteria];
    component.emitDateChangeValues();
    expect(component.emitDateChangeValues).toBeTruthy();
  }));

  it('emitpanAndClickevent(), emit after date change', async(() => {
    const startdate = String(new Date().getTime());
    const endDate = String(new Date().getTime());
    component.filterCriteria = [{fieldId: 'REQUESTOR_DATE', widgetType: WidgetType.TIMESERIES, conditionFieldValue:'REQUESTOR_DATE'} as Criteria];
    component.timeseriesData = {timeSeries:{groupWith: 'REQUESTOR_DATE'}} as TimeSeriesWidget;
    const filterWidget = new FilterWidget();
    filterWidget.fieldId = 'STATUS';
    component.emitpanAndClickevent(startdate, endDate);
    expect(component.emitpanAndClickevent).toBeTruthy();

  }));

  it('getTimeSeriesMetadata(), get meatadat', async(() => {

    const service = fixture.debugElement.injector.get(WidgetService);

    let timeseriesData: TimeSeriesWidget;
    let widgetTimeseries: WidgetTimeseries;

    widgetTimeseries = {
      widgetId: 123, fieldId: 'STATUS', seriesWith: SeriesWith.week, seriesFormat: 'dd.mm.yyyy', aggregationOperator: AggregationOperator.COUNT,
      chartType: ChartType.LINE,
      isEnableDatalabels: false,
      isEnableLegend: false,
      legendPosition: null,
      datalabelsPosition: null,
      xAxisLabel: '100',
      yAxisLabel: '100',
      scaleFrom: 0,
      scaleTo: 1000,
      stepSize: 100,
      dataSetSize: 100,
      startDate: '7',
      showTotal: false,
      groupWith: 'REQUESTOR_DATE', widgetColorPalette: null, distictWith: 'REGION', bucketFilter: null, showInPercentage: false,
      metaData: { fieldDescri: 'Requested Date' } as MetadataModel
    }

    timeseriesData = { widgetId: 123, widgetName: 'test', widgetType: null, objectType: '1005', plantCode: '0', indexName: 'do_workflow', desc: '', timeSeries: widgetTimeseries, isEnableGlobalFilter: false }

    component.widgetId = 123;

    spyOn(service, 'getTimeseriesWidgetInfo').withArgs(123).and.returnValue(of(timeseriesData));

    component.getTimeSeriesMetadata();

    expect(service.getTimeseriesWidgetInfo).toHaveBeenCalledWith(123);

  }));

  it('getTimeSeriesMetadata(), get meatadata for group by chart', async(() => {

    const service = fixture.debugElement.injector.get(WidgetService);

    let timeseriesData: TimeSeriesWidget;
    let widgetTimeseries: WidgetTimeseries;

    widgetTimeseries = {
      widgetId: 123, fieldId: 'REQUESTOR_DATE', seriesWith: SeriesWith.week, seriesFormat: 'dd.mm.yyyy', aggregationOperator: AggregationOperator.COUNT,
      chartType: ChartType.LINE,
      isEnableDatalabels: false,
      isEnableLegend: false,
      legendPosition: null,
      datalabelsPosition: null,
      xAxisLabel: '100',
      yAxisLabel: '100',
      scaleFrom: 0,
      scaleTo: 1000,
      stepSize: 100,
      dataSetSize: 100,
      startDate: '7',
      showTotal: false,
      groupWith: 'REQUESTOR_DATE', widgetColorPalette: null, distictWith: 'REGION', bucketFilter: null, showInPercentage: false,
      metaData: { fieldDescri: 'Requested Date' } as MetadataModel
    }

    timeseriesData = { widgetId: 123, widgetName: 'test', widgetType: null, objectType: '1005', plantCode: '0', indexName: 'do_workflow', desc: '', timeSeries: widgetTimeseries, isEnableGlobalFilter: false }
    component.widgetId = 123;
    spyOn(service, 'getTimeseriesWidgetInfo').withArgs(123).and.returnValue(of(timeseriesData));
    component.getTimeSeriesMetadata();
    expect(service.getTimeseriesWidgetInfo).toHaveBeenCalledWith(123);
    expect(component.isGroupByChart).toBeTrue();

  }));

  it('legendclick(), emit after date change', async(() => {
    const item: LegendItem = { datasetIndex: 0 } as LegendItem;
    component.chartLegend = [{ code: 'MATL_TYPE', legendIndex: 0, text: 'Material Type' }];
    const widgetTimeseries = {
      fieldId: 'STATUS',
      groupWith: 'REQUESTOR_DATE',
      distictWith: 'REGION',
      metaData: { fieldDescri: 'Requested Date' } as MetadataModel
    } as WidgetTimeseries;

    component.timeseriesData = { timeSeries: widgetTimeseries, isEnableGlobalFilter: false } as TimeSeriesWidget

    component.filterCriteria = [];
    component.legendClick(item);
    expect(component.filterCriteria.length).toEqual(1);

    component.chartLegend = [{ code: 'GM', legendIndex: 0, text: 'GM' }];
    component.timeseriesData = { timeSeries: { fieldId: 'CURRENTUSER' } as WidgetTimeseries, isEnableGlobalFilter: true } as TimeSeriesWidget
    component.filterCriteria = [{ fieldId: 'CURRENTUSER', widgetType: WidgetType.TIMESERIES, conditionFieldValue: 'admin' } as Criteria];
    component.legendClick(item);
    expect(component.filterCriteria.length).toEqual(1);

    component.chartLegend = [{ code: 'GM', legendIndex: 0, text: 'GM' }];
    component.timeseriesData = { timeSeries: { fieldId: 'CURRENTUSER' } as WidgetTimeseries, isEnableGlobalFilter: false } as TimeSeriesWidget
    component.filterCriteria = [{ fieldId: 'CURRENTUSER', widgetType: WidgetType.TIMESERIES, conditionFieldValue: 'admin' } as Criteria];
    component.legendClick(item);
    expect(component.filterCriteria.length).toEqual(2);
  }));

  it('getRandomColor(), Random Colour', async(() => {
    component.getRandomColor();
    // length should be 7
    expect(component.getRandomColor().length).toEqual(7);
    // should contains #
    expect(component.getRandomColor()).toContain('#');
  }));

  it('getUpdatedColorCode(),  getUpdatedColorCode', async(() => {
    const code = 'INP';
    const colorPalettes: AssginedColor = { code: 'INP', text: 'INP', colorCode: '#FFFFFF' };
    const colorArr = new Array();
    colorArr.push(colorPalettes);
    component.widgetColorPalette = { reportId: '123', widgetId: '133', widgetDesc: 'desc', colorPalettes: colorArr };
    component.getUpdatedColorCode(code);
    expect(component.getUpdatedColorCode(code)).toEqual('#FFFFFF');
  }));

  // fit('transformDataSets(),  transformDataSets', async(() => {
  //   const data = { _shards: { total: 1, failed: 0, successful: 1, skipped: 0 }, hits: { hits: [], total: { value: 1221, relation: 'eq' }, max_score: null }, took: 3, timed_out: false, aggregations: { 'date_histogram#date': { buckets: [{ key_as_string: '04.00.2020', doc_count: 52, 'sterms#textTerm': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 33, key: 'APP' }, { doc_count: 19, key: 'INP' }] }, key: 1588550400000 }, { key_as_string: '11.00.2020', doc_count: 46, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 33, key: 'APP' }, { doc_count: 13, key: 'INP' }] }, key: 1589155200000 }, { key_as_string: '18.00.2020', doc_count: 18, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 11, key: 'APP' }, { doc_count: 6, key: 'INP' }, { doc_count: 1, key: 'REJ' }] }, key: 1589760000000 }, { key_as_string: '25.00.2020', doc_count: 27, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 15, key: 'APP' }, { doc_count: 12, key: 'INP' }] }, key: 1590364800000 }, { key_as_string: '01.00.2020', doc_count: 322, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 294, key: 'APP' }, { doc_count: 28, key: 'INP' }] }, key: 1590969600000 }, { key_as_string: '08.00.2020', doc_count: 64, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 42, key: 'APP' }, { doc_count: 22, key: 'INP' }] }, key: 1591574400000 }, { key_as_string: '15.00.2020', doc_count: 57, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 47, key: 'APP' }, { doc_count: 10, key: 'INP' }] }, key: 1592179200000 }, { key_as_string: '22.00.2020', doc_count: 77, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 40, key: 'INP' }, { doc_count: 37, key: 'APP' }] }, key: 1592784000000 }, { key_as_string: '29.00.2020', doc_count: 173, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 111, key: 'INP' }, { doc_count: 62, key: 'APP' }] }, key: 1593388800000 }, { key_as_string: '06.00.2020', doc_count: 98, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 60, key: 'INP' }, { doc_count: 37, key: 'APP' }, { doc_count: 1, key: 'REJ' }] }, key: 1593993600000 }, { key_as_string: '13.00.2020', doc_count: 111, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 70, key: 'INP' }, { doc_count: 39, key: 'APP' }, { doc_count: 2, key: 'CNCL' }] }, key: 1594598400000 }, { key_as_string: '20.00.2020', doc_count: 149, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 111, key: 'APP' }, { doc_count: 37, key: 'INP' }, { doc_count: 1, key: 'REJ' }] }, key: 1595203200000 }, { key_as_string: '27.00.2020', doc_count: 27, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 18, key: 'INP' }, { doc_count: 9, key: 'APP' }] }, key: 1595808000000 }] } } };
  //   component.timeseriesData.timeSeries = { fieldId: 'STATUS', showTotal: true,dataSetSize:12 } as WidgetTimeseries;
  //   component.filterCriteria = [] as Criteria[];
  //   component.widgetInf.next(component.timeseriesData);

  //   component.transformDataSets(data);
  //   expect(component.transformDataSets.length).toEqual(1);

  //   component.widgetInf.next(component.timeseriesData);

  //   component.transformDataSets(data);
  //   expect(component.transformDataSets.length).toEqual(1);
  // }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(`generatedDataBasedonMonth(), generate date data based on months `, async(() => {
    const mockData = [
      {
        key_as_string: '2019-Jan-01',
        doc_count: 10
      }
    ];
    const res = component.generatedDataBasedonMonth(mockData, false);
    expect(res.length).toEqual(12);
  }));

  it('tarnsformForShowInPercentage(), transform response', async(() => {
    const data =
    {
      _shards: { total: 1, failed: 0, successful: 1, skipped: 0 },
      hits: { hits: [], total: { value: 1221, relation: 'eq' }, max_score: null }, took: 3, timed_out: false,
      aggregations: {
        'date_histogram#date': {
          buckets:
            [{
              key_as_string: '04.00.2020', doc_count: 52, 'sterms#term': {
                doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 33, key: 'APP' },
                { doc_count: 19, key: 'INP' }]
              }, key: 1588550400000
            }, { key_as_string: '11.00.2020', doc_count: 46, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 33, key: 'APP' }, { doc_count: 13, key: 'INP' }] }, key: 1589155200000 }]
        }
      }
    };
    component.timeseriesData.timeSeries = { chartType: ChartType.BAR, showTotal: false } as WidgetTimeseries;
    component.widgetInf.next(component.timeseriesData);
    component.tarnsformForShowInPercentage(data, false);
    expect(component.dataSet.length).toEqual(2);
    expect(component.dataSetlabel.length).toEqual(12);

    component.timeseriesData.timeSeries = { chartType: ChartType.BAR, showTotal: true } as WidgetTimeseries;
    component.widgetInf.next(component.timeseriesData);
    component.filterCriteria = [];
    // component.totalCount = [];
    component.tarnsformForShowInPercentage(data, true);
    expect(component.dataSet.length).toEqual(3);
    expect(component.dataSetlabel.length).toEqual(12);
  }));

  it('bucketModify(), modify bucket ', async(() => {
    const mockData = [
      {
        key_as_string: '2019-Jan-01',
        doc_count: 10
      }
    ];
    const res = component.bucketModify(mockData, false);
    expect(res.length).toEqual(11);

    const res1 = component.bucketModify(mockData, true);
    expect(res1.length).toEqual(11);
  }));

  it('updateForm(), update form element ', async(() => {
    component.dateFilters = [{id: 1, isActive: false, value: '1'}];

    component.formGroup = new FormGroup({
      field: new FormControl('')
    });

    component.timeseriesData = {timeSeries : {seriesWith: SeriesWith.week, groupWith: 'REQUESTOR_DATE'}} as TimeSeriesWidget;
    component.filterCriteria = [];
    const filterWidget = new FilterWidget();
    filterWidget.fieldId = 'STATUS';
    component.updateForm('MATL_TYPE', { id: 1, value: '7', isActive: false });

    expect(component.updateForm).toBeTruthy();
    component.timeseriesData = {timeSeries : {seriesWith: SeriesWith.day, groupWith: 'REQUESTOR_DATE'}} as TimeSeriesWidget;

    component.updateForm('MATL_TYPE', { id: 2, value: '10', isActive: false });
    expect(component.updateForm).toBeTruthy();

    component.timeseriesData = {timeSeries : {seriesWith: SeriesWith.hour, groupWith: 'REQUESTOR_DATE'}} as TimeSeriesWidget;
    component.updateForm('MATL_TYPE', { id: 2, value: '10', isActive: false });
    expect(component.updateForm).toBeTruthy();

    component.timeseriesData = {timeSeries : {seriesWith: SeriesWith.millisecond, groupWith: 'REQUESTOR_DATE'}} as TimeSeriesWidget;
    component.updateForm('MATL_TYPE', { id: 2, value: '10', isActive: false });
    expect(component.updateForm).toBeTruthy();

    component.timeseriesData = {timeSeries : {seriesWith: SeriesWith.minute, groupWith: 'REQUESTOR_DATE'}} as TimeSeriesWidget;
    component.updateForm('MATL_TYPE', { id: 2, value: '10', isActive: false });
    expect(component.updateForm).toBeTruthy();

    component.timeseriesData = {timeSeries : {seriesWith: SeriesWith.month, groupWith: 'REQUESTOR_DATE'}} as TimeSeriesWidget;
    component.updateForm('MATL_TYPE', { id: 2, value: '10', isActive: false });
    expect(component.updateForm).toBeTruthy();

    component.timeseriesData = {timeSeries : {seriesWith: SeriesWith.quarter, groupWith: 'REQUESTOR_DATE'}} as TimeSeriesWidget;
    component.updateForm('MATL_TYPE', { id: 2, value: '10', isActive: false });
    expect(component.updateForm).toBeTruthy();

    component.timeseriesData = {timeSeries : {seriesWith: SeriesWith.second, groupWith: 'REQUESTOR_DATE'}} as TimeSeriesWidget;
    component.updateForm('MATL_TYPE', { id: 2, value: '10', isActive: false });
    expect(component.updateForm).toBeTruthy();

    component.filterCriteria = [{fieldId: 'REQUESTOR_DATE', widgetType: WidgetType.TIMESERIES, conditionFieldValue:'admin'} as Criteria];
    component.timeseriesData = {timeSeries : {seriesWith: SeriesWith.year, groupWith: 'REQUESTOR_DATE'}} as TimeSeriesWidget;
    component.updateForm('MATL_TYPE', { id: 2, value: '10', isActive: false });
    expect(component.updateForm).toBeTruthy();
  }));

  it('codeTextValue()', async(() => {
    component.timeseriesData = { timeSeries: { metaData: { picklist: '1', fieldId: 'OVERDUE' } } } as TimeSeriesWidget;
    const innerBucket: any = {'top_hits#data_hits':{hits:{hits:[{_source:{hdvs:{OVERDUE:{vc:[{c:'200010', t:'testing'}]}}}}]}}};
    const fieldid = 'OVERDUE';
    expect(component.codeTextValue(innerBucket, fieldid)).toEqual('');

    component.timeseriesData = { timeSeries: { metaData: { picklist: '1', fieldId: 'MATL_GROUP' } } } as TimeSeriesWidget;
    const innerBucket2: any = {key:{c:'123'},'top_hits#data_hits':{hits:{hits:[{_source:{hdvs:{MATL_GROUP:{vc:[{c:'200010', t:'testing'}]}}}}]}}};
    const fieldid1 = 'MATL_GROUP';
    expect(component.codeTextValue(innerBucket2, fieldid1)).toEqual({ c: '200010', t: 'testing' });

    component.timeseriesData = { timeSeries: { metaData: { picklist: '1', fieldId: 'OVERDUE' } } } as TimeSeriesWidget;
    const innerBucket1: any = {key:{c:'123'},'top_hits#data_hits':{hits:{hits:[{_source:{hdvs:{MATL_GROUP:{vc:[{c:'123'}]}}}}]}}};
    expect(component.codeTextValue(innerBucket1, fieldid)).toEqual({c:'123'});
  }));

  it('dateAndCountFormat()', async(() => {
    const dataArr = { label: '2019' };
    const obj = {} as any;
    let dataObj = { x: '2005', y: 2 };
    let widgetTimeseries = { seriesWith: SeriesWith.year } as WidgetTimeseries;
    component.timeseriesData = { timeSeries: widgetTimeseries } as TimeSeriesWidget;
    component.dateAndCountFormat(dataObj, obj, dataArr);

    expect(obj.Year).toEqual('2005' + '\t');

    widgetTimeseries = { seriesWith: SeriesWith.day } as WidgetTimeseries;
    component.timeseriesData = { timeSeries: widgetTimeseries } as TimeSeriesWidget;
    dataObj = { x: '1-10-2005', y: 2 };
    component.dateAndCountFormat(dataObj, obj, dataArr);

    expect(obj.Day).toEqual(dataObj.x + '\t');

    widgetTimeseries = { seriesWith: SeriesWith.month } as WidgetTimeseries;
    component.timeseriesData = { timeSeries: widgetTimeseries } as TimeSeriesWidget;
    dataObj = { x: '1-10-2005', y: 2 };
    component.dateAndCountFormat(dataObj, obj, dataArr);

    expect(obj.Month).toEqual(dataObj.x + '\t');

    widgetTimeseries = { seriesWith: SeriesWith.quarter } as WidgetTimeseries;
    component.timeseriesData = { timeSeries: widgetTimeseries } as TimeSeriesWidget;
    dataObj = { x: '1-10-2005', y: 2 };
    component.dateAndCountFormat(dataObj, obj, dataArr);

    expect(obj.Quater).toEqual(dataObj.x + '\t');

    widgetTimeseries = { seriesWith: SeriesWith.week } as WidgetTimeseries;
    component.timeseriesData = { timeSeries: widgetTimeseries } as TimeSeriesWidget;
    dataObj = { x: '1-10-2005', y: 2 };
    component.dateAndCountFormat(dataObj, obj, dataArr);

    expect(obj.Week).toEqual(dataObj.x + '\t');
  }));

  it('dateAndCountFormat()', async(() => {
    let dataArr = { label: '2019' };
    const obj = {} as any;
    const dataObj = {};
    let widgetTimeseries = { seriesWith: SeriesWith.year } as WidgetTimeseries;
    component.timeseriesData = { timeSeries: widgetTimeseries } as TimeSeriesWidget;
    component.dateAndCountFormat(dataObj, obj, dataArr);

    expect(obj.Year).toEqual(dataArr.label + '\t');

    widgetTimeseries = { seriesWith: SeriesWith.day } as WidgetTimeseries;
    component.timeseriesData = { timeSeries: widgetTimeseries } as TimeSeriesWidget;
    dataArr = { label: '1-10-2005' };
    component.dateAndCountFormat(dataObj, obj, dataArr);

    expect(obj.Day).toEqual(dataArr.label + '\t');

    widgetTimeseries = { seriesWith: SeriesWith.month } as WidgetTimeseries;
    component.timeseriesData = { timeSeries: widgetTimeseries } as TimeSeriesWidget;
    dataArr = { label: 'November' };
    component.dateAndCountFormat(dataObj, obj, dataArr);

    expect(obj.Month).toEqual(dataArr.label + '\t');

    widgetTimeseries = { seriesWith: SeriesWith.quarter } as WidgetTimeseries;
    component.timeseriesData = { timeSeries: widgetTimeseries } as TimeSeriesWidget;
    dataArr = { label: 'Q-1' };
    component.dateAndCountFormat(dataObj, obj, dataArr);

    expect(obj.Quater).toEqual(dataArr.label + '\t');

    widgetTimeseries = { seriesWith: SeriesWith.week } as WidgetTimeseries;
    component.timeseriesData = { timeSeries: widgetTimeseries } as TimeSeriesWidget;
    dataArr = { label: 'Week-1' };
    component.dateAndCountFormat(dataObj, obj, dataArr);

    expect(obj.Week).toEqual(dataArr.label + '\t');
  }));

  it('checkTextCode() should return a string', async(() => {
    component.displayCriteriaOption = DisplayCriteria.CODE;
    const arrBucket = { code: 'admin', text: 'Administrator' };
    const arrBucket1 = { code: null, text: null };
    let res = component.checkTextCode(arrBucket);
    let res1 = component.checkTextCode(arrBucket1);

    expect(res).toEqual(arrBucket.code);
    expect(res1).toEqual('');

    component.displayCriteriaOption = DisplayCriteria.TEXT;
    res = component.checkTextCode(arrBucket);
    res1 = component.checkTextCode(arrBucket1);

    expect(res).toEqual(arrBucket.text);
    expect(res1).toEqual('');

    component.displayCriteriaOption = DisplayCriteria.CODE_TEXT;
    res = component.checkTextCode(arrBucket);

    expect(res).toEqual(`${arrBucket.code} -- ${arrBucket.text}`);
  }));

  it('viewChange(), should change widget view', async () => {
    component.isTableView = false;
    component.timeseriesData.timeSeries = { fieldId: 'STATUS', showTotal: true } as WidgetTimeseries;
    component.filterCriteria = [] as Criteria[];
    component.widgetInf.next(component.timeseriesData);

    const widgetViewDetails = {
      acknowledge: true,
      payload: {
        uuid: '',
        reportId: 123454567,
        widgetId: 45675678,
        view: WidgetView.GRAPH_VIEW,
        userName: '',
        tenantCode: 123,
        createdAt: 2,
        updatedAt: 1
      }
    } as WidgetViewDetails;

    const widgetViewRequest: WidgetViewRequestPayload = {
      uuid: '',
      reportId: 123454567,
      widgetId: 45675678,
      view: WidgetView.TABLE_VIEW
    }

    component.widgetViewDetails = {
      acknowledge : true,
      payload : {
        ...widgetViewRequest as WidgetViewPayload
      }
    }

    spyOn(widgetService, 'saveWidgetView').withArgs(widgetViewRequest).and.returnValue(of(widgetViewDetails));
    expect(component.viewChange).toBeTruthy();

    const widgetViewDetails1 = {
      acknowledge: true,
      payload: {
        uuid: '838383',
        reportId: 123454567,
        widgetId: 45675678,
        view: WidgetView.TABLE_VIEW,
        userName: '',
        tenantCode: 123,
        createdAt: 2,
        updatedAt: 1
      }
    } as WidgetViewDetails;

    const widgetViewRequest1: WidgetViewRequestPayload = {
      uuid: '838383',
      reportId: 123454567,
      widgetId: 45675678,
      view: WidgetView.TABLE_VIEW
    }

    component.widgetViewDetails = {
      acknowledge : true,
      payload : {
        ...widgetViewRequest1 as WidgetViewPayload
      }
    }
    spyOn(widgetService, 'updateWidgetView').withArgs(widgetViewRequest1).and.returnValue(of(widgetViewDetails1));
    expect(component.viewChange).toBeTruthy();
  });

  it('getTableData(), should return table data', async () => {
    component.displayedColumnsId = [];
    component.tableDataSource = [];
    component.dataSet = [{ label: 'Test1', data: [0, 4, 5, 3, 2] }];

    component.timeseriesData.timeSeries = { distictWith:'MATL_GROUP',fieldId: 'STATUS', seriesWith: SeriesWith.month, showTotal: true, metaData: { fieldDescri: 'Test1' } } as WidgetTimeseries;
    component.filterCriteria = [] as Criteria[];
    component.widgetInf.next(component.timeseriesData);

    component.getTableData();
    expect(component.displayedColumnsId.length).toEqual(2);
    expect(component.tableDataSource.length).toEqual(1);

    component.displayedColumnsId = [];
    component.tableDataSource = [];
    component.dataSet = [{ label: 'Test1', data: [0, 4, 5, 3, 2] }];

    component.timeseriesData.timeSeries = { fieldId: 'STATUS', seriesWith: SeriesWith.month, showTotal: true, metaData: { fieldDescri: 'Test1', fieldId: 'STATUS' } } as WidgetTimeseries;
    component.filterCriteria = [] as Criteria[];
    component.widgetInf.next(component.timeseriesData);

    component.getTableData();
    expect(component.displayedColumnsId.length).toEqual(2);
    expect(component.tableDataSource.length).toEqual(1);

    component.displayedColumnsId = [];
    component.tableDataSource = [];
    component.dataSet = [{ label: 'Test1', data: [0, 4, 5, 3, 2], id:{key:1} } as any];
    component.widgetInf.next(component.timeseriesData);

    component.getTableData();
    expect(component.displayedColumnsId.length).toEqual(2);
    expect(component.tableDataSource.length).toEqual(1);
  });

  // it('stackClickFilter(), should filter , after click on bar stack', async(() => {
  //   // call stack click with no argument then filter criteria should be [] array
  //   component.filterCriteria = [];
  //   const canvas = document.createElement('canvas');
  //   htmlnative.append(canvas);
  //   component.stackClickFilter();
  //   expect(component.filterCriteria.length).toEqual(0);

  //   // mock data
  //   const array = [{ _datasetIndex: 0 }];
  //   component.chartLegend = [{ code: 'MATL_TYPE', legendIndex: 0, text: 'Material Type' }];
  //   component.filterCriteria = [{ fieldId: 'MATL_TYPE' } as Criteria];
  //   component.timeseriesData = { timeSeries: { fieldId: 'MATL_TYPE' } } as any;
  //   const eleRef = htmlnative.getElementsByTagName('canvas')[0];
  //   const baseChart = new BaseChartDirective(eleRef[0], null);
  //   baseChart.chart = { canvas: eleRef, getElementAtEvent: (e: any) => [{ _datasetIndex: 0, _index: 0 } as any] } as Chart;
  //   component.chart = baseChart;
  //   component.stackClickFilter(null, array);
  //   expect(component.filterCriteria.length).toEqual(2, 'after apply filter criteria then filtercriteria length should be 1');

  //   component.chartLegend = [{ code: 'REQUESTOR_DATE', legendIndex: 0, text: 'REQUESTOR DATE' }];
  //   component.stackClickFilter(null, array);
  //   expect(component.filterCriteria.length).toEqual(3);

  //   component.chartLegend = [{ code: 'GM', legendIndex: 0, text: 'GM' }];
  //   component.filterCriteria = [{ fieldId: 'CURRENTUSER', widgetType: WidgetType.TIMESERIES, conditionFieldValue: 'admin' } as Criteria];
  //   component.timeseriesData = { timeSeries: { fieldId: 'CURRENTUSER' }, isEnableGlobalFilter: true } as TimeSeriesWidget;
  //   component.stackClickFilter(null, array);
  //   expect(component.filterCriteria.length).toEqual(1);

  //   component.chartLegend = [{ code: 'GM', legendIndex: 0, text: 'GM' }];
  //   component.filterCriteria = [];
  //   component.timeseriesData = { timeSeries: { fieldId: 'CURRENTUSER' }, isEnableGlobalFilter: true } as TimeSeriesWidget;
  //   component.stackClickFilter(null, array);
  //   expect(component.filterCriteria.length).toEqual(1);
  // }));

  it('updateValue()', async () => {
    component.dateFilters = [{
      id: 1,
      isActive: false,
      value: '1'
    }];
    const timeSeries = { timeSeries: { fieldId: 'STATUS', showTotal: true, startDate: '1' } } as TimeSeriesWidget;
    component.widgetInf.next(timeSeries);
    component.formGroup = new FormGroup({
      field: new FormControl('')
    });
    component.filterCriteria = [];
    component.updatevalues();
    console.log('date==', component.dateFilters);
    expect(component.timeseriesData).toEqual(timeSeries);
  });

  it('clearFilterCriteria(), should clear filters', async () => {
    component.timeseriesData.timeSeries = { fieldId: 'STATUS', seriesWith: SeriesWith.month, groupWith: 'CURRENTUSER', showTotal: true, metaData: { fieldDescri: 'Test1', fieldId: 'STATUS' } } as WidgetTimeseries;
    component.dateFilters = [{
      id: 1,
      isActive: false,
      value: '1'
    }];
    component.filterCriteria = [{ fieldId: 'CURRENTUSER', widgetType: WidgetType.TIMESERIES, conditionFieldValue: 'admin' } as Criteria];
    component.startDateCtrl = new FormControl();
    component.startDateCtrl.patchValue(String(new Date().getTime()));
    component.endDateCtrl = new FormControl();
    component.endDateCtrl.patchValue(String(new Date().getTime()));
    component.clearFilterCriteria();
    expect(component.endDateCtrl.value).toEqual(null);
    expect(component.startDateCtrl.value).toEqual(null);
  });

  it('tranformGroupBy()', async()=>{
    const data = { _shards: { total: 1, failed: 0, successful: 1, skipped: 0 }, hits: { hits: [], total: { value: 1221, relation: 'eq' }, max_score: null }, took: 3, timed_out: false, aggregations: { 'date_histogram#date': { buckets: [{ key_as_string: '04.00.2020', doc_count: 52, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 33, key: 'APP' }, { doc_count: 19, key: 'INP' }] }, key: 1588550400000 }, { key_as_string: '11.00.2020', doc_count: 46, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 33, key: 'APP' }, { doc_count: 13, key: 'INP' }] }, key: 1589155200000 }, { key_as_string: '18.00.2020', doc_count: 18, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 11, key: 'APP' }, { doc_count: 6, key: 'INP' }, { doc_count: 1, key: 'REJ' }] }, key: 1589760000000 }, { key_as_string: '25.00.2020', doc_count: 27, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 15, key: 'APP' }, { doc_count: 12, key: 'INP' }] }, key: 1590364800000 }, { key_as_string: '01.00.2020', doc_count: 322, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 294, key: 'APP' }, { doc_count: 28, key: 'INP' }] }, key: 1590969600000 }, { key_as_string: '08.00.2020', doc_count: 64, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 42, key: 'APP' }, { doc_count: 22, key: 'INP' }] }, key: 1591574400000 }, { key_as_string: '15.00.2020', doc_count: 57, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 47, key: 'APP' }, { doc_count: 10, key: 'INP' }] }, key: 1592179200000 }, { key_as_string: '22.00.2020', doc_count: 77, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 40, key: 'INP' }, { doc_count: 37, key: 'APP' }] }, key: 1592784000000 }, { key_as_string: '29.00.2020', doc_count: 173, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 111, key: 'INP' }, { doc_count: 62, key: 'APP' }] }, key: 1593388800000 }, { key_as_string: '06.00.2020', doc_count: 98, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 60, key: 'INP' }, { doc_count: 37, key: 'APP' }, { doc_count: 1, key: 'REJ' }] }, key: 1593993600000 }, { key_as_string: '13.00.2020', doc_count: 111, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 70, key: 'INP' }, { doc_count: 39, key: 'APP' }, { doc_count: 2, key: 'CNCL' }] }, key: 1594598400000 }, { key_as_string: '20.00.2020', doc_count: 149, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 111, key: 'APP' }, { doc_count: 37, key: 'INP' }, { doc_count: 1, key: 'REJ' }] }, key: 1595203200000 }, { key_as_string: '27.00.2020', doc_count: 27, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 18, key: 'INP' }, { doc_count: 9, key: 'APP' }] }, key: 1595808000000 }] } } };
    component.timeseriesData.timeSeries = { fieldId: 'STATUS', showTotal: true, isEnableLegend: true, isEnableDatalabels: true, legendPosition: 'top'} as WidgetTimeseries;
    component.filterCriteria = [] as Criteria[];

    component.widgetInf.next(component.timeseriesData);
    component.transformForGroupBy(data);
    expect(component.transformForGroupBy).toBeTruthy();
  });

  it('transformDataForComparison()', async()=>{
    const data1 = { _shards: { total: 1, failed: 0, successful: 1, skipped: 0 }, hits: { hits: [], total: { value: 1221, relation: 'eq' }, max_score: null }, took: 3, timed_out: false, aggregations: { 'date_histogram#date': { buckets: [{ key_as_string: '04.00.2020', doc_count: 52, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 33, key: 'APP' }, { doc_count: 19, key: 'INP' }] }, key: 1588550400000 }, { key_as_string: '11.00.2020', doc_count: 46, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 33, key: 'APP' }, { doc_count: 13, key: 'INP' }] }, key: 1589155200000 }, { key_as_string: '18.00.2020', doc_count: 18, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 11, key: 'APP' }, { doc_count: 6, key: 'INP' }, { doc_count: 1, key: 'REJ' }] }, key: 1589760000000 }, { key_as_string: '25.00.2020', doc_count: 27, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 15, key: 'APP' }, { doc_count: 12, key: 'INP' }] }, key: 1590364800000 }, { key_as_string: '01.00.2020', doc_count: 322, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 294, key: 'APP' }, { doc_count: 28, key: 'INP' }] }, key: 1590969600000 }, { key_as_string: '08.00.2020', doc_count: 64, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 42, key: 'APP' }, { doc_count: 22, key: 'INP' }] }, key: 1591574400000 }, { key_as_string: '15.00.2020', doc_count: 57, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 47, key: 'APP' }, { doc_count: 10, key: 'INP' }] }, key: 1592179200000 }, { key_as_string: '22.00.2020', doc_count: 77, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 40, key: 'INP' }, { doc_count: 37, key: 'APP' }] }, key: 1592784000000 }, { key_as_string: '29.00.2020', doc_count: 173, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 111, key: 'INP' }, { doc_count: 62, key: 'APP' }] }, key: 1593388800000 }, { key_as_string: '06.00.2020', doc_count: 98, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 60, key: 'INP' }, { doc_count: 37, key: 'APP' }, { doc_count: 1, key: 'REJ' }] }, key: 1593993600000 }, { key_as_string: '13.00.2020', doc_count: 111, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 70, key: 'INP' }, { doc_count: 39, key: 'APP' }, { doc_count: 2, key: 'CNCL' }] }, key: 1594598400000 }, { key_as_string: '20.00.2020', doc_count: 149, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 111, key: 'APP' }, { doc_count: 37, key: 'INP' }, { doc_count: 1, key: 'REJ' }] }, key: 1595203200000 }, { key_as_string: '27.00.2020', doc_count: 27, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 18, key: 'INP' }, { doc_count: 9, key: 'APP' }] }, key: 1595808000000 }] } } };
    component.timeseriesData.timeSeries = { fieldId: 'STATUS', showTotal: true, isEnableLegend: true, isEnableDatalabels: true, legendPosition: 'top', dataSetSize: 12} as WidgetTimeseries;
    component.filterCriteria = [] as Criteria[];
    component.widgetInf.next(component.timeseriesData);
    component.transformDataForComparison(data1);
    expect(component.transformDataForComparison).toBeTruthy();
  });

  it('saveDisplayCriteria(), should call saveDisplayCriteria', async(()=> {
    const service = fixture.debugElement.injector.get(WidgetService);
    component.displayCriteriaOption = DisplayCriteria.TEXT;
    component.timeseriesData = {timeSeries: {chartType:'LINE', fieldId: 'TIME_TAKEN', dataSetSize: 1, metaData: {picklist: '0'}}} as TimeSeriesWidget;
    component.widgetInf.next(component.timeseriesData);
    component.widgetId = 12345;
    component.widgetInfo = new Widget();
    component.widgetInfo.widgetType = WidgetType.FILTER;
    component.widgetInfo.widgetId = component.widgetId.toString();
    component.widgetViewDetails = {acknowledge:true,payload:{view: WidgetView.GRAPH_VIEW} as WidgetViewPayload};
    component.responseData = {timed_out:false,aggregations:{'date_histogram#date':{buckets:[{key_as_string:'2019-Jan-01','sterms#term':{buckets:[{doc_count:1282,key:'true'},{doc_count:32,key:'false'}]},key:1546300800000}]}}};
    spyOn(service,'saveDisplayCriteria').withArgs(component.widgetInfo.widgetId, component.widgetInfo.widgetType, component.displayCriteriaOption).and.returnValue(of({}));

    component.saveDisplayCriteria();

    expect(service.saveDisplayCriteria).toHaveBeenCalledWith('12345', WidgetType.FILTER, DisplayCriteria.TEXT);
  }));

  it('openColorPalette(), should open color palette dialog', async(()=>{
    component.widgetId = 72366423;
    component.reportId = 65631624;
    component.timeseriesData = {desc:'timeseries'} as TimeSeriesWidget;
    component.chartLegend = [
      {
        code:'HAWA',
        legendIndex:1,
        text: 'Hawa material'
      }
    ];
    component.openColorPalette();

    expect(mockMatDialogOpen.open).toHaveBeenCalled();
  }));

  it('ngOnChanges(), while change rule type', async(() => {
    // mock data
    const changes: import('@angular/core').SimpleChanges = { hasFilterCriteria: { currentValue: true, previousValue: false, firstChange: null, isFirstChange: null }, filterCriteria: { currentValue: true, previousValue: false, firstChange: null, isFirstChange: null }, boxSize: { currentValue: 35, previousValue: 26, firstChange: null, isFirstChange: null } };
    component.timeseriesData.timeSeries = { fieldId: 'STATUS', showTotal: true,dataSetSize:12 } as WidgetTimeseries;
    component.filterCriteria = [];
    component.widgetInf.next(component.timeseriesData);
    component.ngOnChanges(changes);
    expect(component.lablels.length).toEqual(0);
  }));

  it('openColorPalette(), should open color palette dialog', async(()=>{
    component.widgetId = 72366423;
    component.reportId = 65631624;
    component.timeseriesData = {desc:'timeseries'} as TimeSeriesWidget;
    component.chartLegend = [
      {
        code:'HAWA',
        legendIndex:1,
        text: 'Hawa material'
      }
    ];
    component.openColorPalette();
    expect(mockMatDialogOpen.open).toHaveBeenCalled();
  }));

  it('getwidgetData()', async(() => {
    const service = fixture.debugElement.injector.get(WidgetService);
    const buckets = {aggregations:{'date_histogram#date':{buckets:[{key_as_string:'2019','sterms#term':{buckets:[{'sterms#textTerm':{buckets:[{'top_hits#data_hits':{hits:{hits:[{_source:{staticFields:{STATUS:{vc:[{c:'APP',t:'Approved'}]}}}}]}},key:'APP'}]},key:'APP'},{'sterms#textTerm':{buckets:[{'top_hits#data_hits':{hits:{hits:[{_source:{staticFields:{STATUS:{vc:[{c:'CNCL',t:'Cancelled'}]}}}}]}},key:'CNCL'}]},key:'CNCL'},{'sterms#textTerm':{buckets:[{'top_hits#data_hits':{hits:{hits:[{_source:{staticFields:{STATUS:{vc:[{c:'INP',t:'In Progress'}]}}}}]}},key:'INP'}]},key:'INP'}]},key:1546261200000}]}}}
    component.userDetails = {selfServiceUserModel:{timeZone:'Asia'},defLocs:['abc']} as Userdetails;
    component.timeseriesData = {timeSeries: {chartType:'BAR', fieldId: 'STATUS', dataSetSize: 1, metaData: {picklist: '0'}}} as TimeSeriesWidget;
    component.widgetInf.next(component.timeseriesData);
    component.filterCriteria = [];
    spyOn(service,'getWidgetData').withArgs('653267432',component.filterCriteria, '', '', component.userDetails.selfServiceUserModel.timeZone, component.userDetails.defLocs.toString()).and.returnValue(of(buckets));
    component.getwidgetData(653267432);
    expect(service.getWidgetData).toHaveBeenCalledWith('653267432', component.filterCriteria, '', '', component.userDetails.selfServiceUserModel.timeZone, component.userDetails.defLocs.toString());
  }));

  it('getwidgetData()', async(() => {
    const service = fixture.debugElement.injector.get(WidgetService);
    const buckets = {aggregations:{'date_histogram#date':{buckets:[{key_as_string:'2019','nested#Nest_histogram':{'sterms#term':{buckets:[{'sterms#textTerm':{buckets:[{'top_hits#data_hits':{hits:{hits:[{_source:{IND_SECTOR:{vc:[{c:'IT',t:'IT Industry'}]}}}]}},key:'IT'}]},key:'IT'},{'sterms#textTerm':{buckets:[{'top_hits#data_hits':{hits:{hits:[{_source:{IND_SECTOR:{vc:[{c:'I',t:'Mining Industry'}]}}}]}},key:'I'}]},key:'I'}]}},key:1546261200000}]}}};
    component.userDetails = {selfServiceUserModel:{timeZone:'Asia'},defLocs:['abc']} as Userdetails;
    component.timeseriesData = {timeSeries: {chartType:'LINE', fieldId: 'STATUS', dataSetSize: 1, metaData: {picklist: '0'}}} as TimeSeriesWidget;
    component.widgetInf.next(component.timeseriesData);
    component.filterCriteria = [];
    spyOn(service,'getWidgetData').withArgs('653267432',component.filterCriteria, '', '', component.userDetails.selfServiceUserModel.timeZone, component.userDetails.defLocs.toString()).and.returnValue(of(buckets));
    component.getwidgetData(653267432);
    expect(service.getWidgetData).toHaveBeenCalledWith('653267432', component.filterCriteria, '', '', component.userDetails.selfServiceUserModel.timeZone, component.userDetails.defLocs.toString());
  }));

  it('getwidgetData()', async(() => {
    const service = fixture.debugElement.injector.get(WidgetService);
    const buckets = {aggregations:{'date_histogram#date':{buckets:[{key_as_string:'2019-Jan-01',doc_count:1471,key:1546261200000}]}}};
    component.userDetails = {selfServiceUserModel:{timeZone:'Asia'},defLocs:['abc']} as Userdetails;
    component.timeseriesData = {timeSeries: {chartType:'LINE', isEnableLegend:true, isEnableDatalabels: true, fieldId: 'REQUESTOR_DATE', groupWith: 'REQUESTOR_DATE',dataSetSize: 1, metaData: {picklist: '0'}}} as TimeSeriesWidget;
    component.widgetInf.next(component.timeseriesData);
    component.filterCriteria = [];
    component.isGroupByChart = true;
    spyOn(service,'getWidgetData').withArgs('653267432',component.filterCriteria, '', '', component.userDetails.selfServiceUserModel.timeZone, component.userDetails.defLocs.toString()).and.returnValue(of(buckets));
    component.getwidgetData(653267432);
    expect(service.getWidgetData).toHaveBeenCalledWith('653267432', component.filterCriteria, '', '', component.userDetails.selfServiceUserModel.timeZone, component.userDetails.defLocs.toString());
  }));
});
