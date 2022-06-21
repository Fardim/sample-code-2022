import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeseriesWidgetComponent } from './timeseries-widget.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FilterWidget, SeriesWith, AggregationOperator, ChartType, AssginedColor, WidgetType, Criteria, DisplayCriteria, WidgetView, WidgetViewDetails, WidgetViewRequestPayload, WidgetViewPayload } from '@modules/report/_models/widget';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { FormControl, FormGroup } from '@angular/forms';
import { ChartDataset, LegendItem } from 'chart.js';
import { SharedModule } from '@modules/shared/shared.module';
import { MetadataModel } from '@models/schema/schemadetailstable';
import { ChartProperties, ConditionOperator, LegendPosition, TimeseriesStartDate, Widget, WidgetAdditionalProperty, WidgetColorPalette } from '@modules/report-v2/_models/widget';
import { of } from 'rxjs';
import { WidgetService } from '@services/widgets/widget.service';
import { BaseChartDirective, ThemeService } from 'ng2-charts';
import { Userdetails, UserPreferenceDetails } from '@models/userdetails';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '@services/user/userservice.service';
import { ElementRef, NgZone } from '@angular/core';

export class MockNgZone extends NgZone {
  constructor() {
    super({ enableLongStackTrace: false });
  }
}
describe('TimeseriesWidgetComponent', () => {
  let component: TimeseriesWidgetComponent;
  let fixture: ComponentFixture<TimeseriesWidgetComponent>;
  let widgetService: WidgetService;
  let userService: jasmine.SpyObj<UserService>;
  let htmlnative: HTMLElement;
  const zone: NgZone = new NgZone({ enableLongStackTrace: true });

  const mockMatDialogOpen = {
    open: jasmine.createSpy('open')
  };

  beforeEach(async(() => {
    const userServiceSpy = jasmine.createSpyObj(WidgetService, ['getUserDetails']);
    TestBed.configureTestingModule({
      declarations: [TimeseriesWidgetComponent],
      imports: [MdoUiLibraryModule,
        HttpClientTestingModule,
        AppMaterialModuleForSpec,
        SharedModule
      ],
      providers: [
        {
          provide: MatDialog,
          useValue: mockMatDialogOpen
        },
        { provide: UserService, userValue: userServiceSpy },
        { provide: WidgetService }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeseriesWidgetComponent);
    component = fixture.componentInstance;
    component.widgetInfo = new Widget();
    component.widgetInfo.chartProperties = new ChartProperties();
    htmlnative = fixture.nativeElement;
    widgetService = fixture.debugElement.injector.get(WidgetService);
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  it('ngOnInit(),  should enable pre required on this component', async(() => {
    component.widgetInfo.widgetId = '23156122';
    component.widgetId = 23156122;
    component.widgetInfo.widgetAdditionalProperties = { displayCriteria: DisplayCriteria.CODE_TEXT } as WidgetAdditionalProperty;
    spyOn(component,'getwidgetData');
    spyOn(userService, 'getUserDetails').withArgs().and.returnValue(of({ selfServiceUserModel: { timeZone: 'Asia' }, defLocs: ['abc'] } as Userdetails));

    component.ngOnInit();

    expect(component.displayCriteriaOption).toEqual(component.widgetInfo.widgetAdditionalProperties.displayCriteria);
    expect(userService.getUserDetails).toHaveBeenCalled();

    component.widgetInfo.chartProperties.chartType = ChartType.LINE;
    component.ngOnInit();

    expect(component.displayCriteriaOption).toEqual(component.widgetInfo.widgetAdditionalProperties.displayCriteria);
    expect(userService.getUserDetails).toHaveBeenCalled();
  }));

  it('emitDateChangeValues(), emit after date change', async(() => {
    component.startDateCtrl = new FormControl();
    component.startDateCtrl.patchValue(String(new Date().getTime()));
    component.endDateCtrl = new FormControl();
    component.endDateCtrl.patchValue(String(new Date().getTime()));

    component.widgetInfo.field = 'STATUS';
    component.widgetInfo.chartProperties.seriesWith = SeriesWith.week;
    component.widgetInfo.chartProperties.seriesFormat = 'dd.mm.yyyy';
    component.widgetInfo.aggregrationOp = AggregationOperator.COUNT;
    component.widgetInfo.chartProperties.chartType = ChartType.LINE;
    component.widgetInfo.chartProperties.isEnableDatalabels = false;
    component.widgetInfo.chartProperties.isEnableLegend = false;
    component.widgetInfo.chartProperties.legendPosition = null;
    component.widgetInfo.chartProperties.datalabelsPosition = null;
    component.widgetInfo.chartProperties.xAxisLabel = '100';
    component.widgetInfo.chartProperties.yAxisLabel = '100';
    component.widgetInfo.chartProperties.scaleFrom = 0;
    component.widgetInfo.chartProperties.scaleTo = 1000;
    component.widgetInfo.chartProperties.stepSize = 100;
    component.widgetInfo.chartProperties.dataSetSize = 100;
    component.widgetInfo.chartProperties.timeseriesStartDate = TimeseriesStartDate.D7;
    component.widgetInfo.chartProperties.showTotal = false;
    component.widgetInfo.groupById = 'REQUESTOR_DATE';
    component.widgetInfo.widgetColorPalette = null,
      component.widgetInfo.distictWith = 'REGION',
      component.widgetInfo.chartProperties.bucketFilter = null,
      component.widgetInfo.chartProperties.isEnabledBarPerc = false,
      component.widgetInfo.fieldCtrl = { fieldDescri: 'Requested Date' } as MetadataModel

    component.widgetInfo.widgetId = '123';
    component.widgetInfo.widgetTitle = 'test';
    component.widgetInfo.widgetType = WidgetType.TIMESERIES;
    component.widgetInfo.objectType = '1005';
    component.widgetInfo.isEnableGlobalFilter = false;

    component.filterCriteria = [];
    const filterWidget = new FilterWidget();
    filterWidget.fieldId = 'STATUS';
    component.emitDateChangeValues();
    expect(component.emitDateChangeValues).toBeTruthy();

    component.filterCriteria = [{ fieldId: 'REQUESTOR_DATE', widgetType: WidgetType.TIMESERIES, conditionFieldValue: 'admin', conditionFieldId: 'REQUESTOR_DATE' } as Criteria];
    component.emitDateChangeValues();
    expect(component.emitDateChangeValues).toBeTruthy();
  }));

  it('emitpanAndClickevent(), emit after date change', async(() => {
    const startdate = String(new Date().getTime());
    const endDate = String(new Date().getTime());

    component.widgetInfo.field = 'STATUS';
    component.widgetInfo.chartProperties.seriesWith = SeriesWith.week;
    component.widgetInfo.chartProperties.seriesFormat = 'dd.mm.yyyy';
    component.widgetInfo.aggregrationOp = AggregationOperator.COUNT;
    component.widgetInfo.chartProperties.chartType = ChartType.LINE;
    component.widgetInfo.chartProperties.isEnableDatalabels = false;
    component.widgetInfo.chartProperties.isEnableLegend = false;
    component.widgetInfo.chartProperties.legendPosition = null;
    component.widgetInfo.chartProperties.datalabelsPosition = null;
    component.widgetInfo.chartProperties.xAxisLabel = '100';
    component.widgetInfo.chartProperties.yAxisLabel = '100';
    component.widgetInfo.chartProperties.scaleFrom = 0;
    component.widgetInfo.chartProperties.scaleTo = 1000;
    component.widgetInfo.chartProperties.stepSize = 100;
    component.widgetInfo.chartProperties.dataSetSize = 100;
    component.widgetInfo.chartProperties.timeseriesStartDate = TimeseriesStartDate.D7;
    component.widgetInfo.chartProperties.showTotal = false;
    component.widgetInfo.groupById = 'REQUESTOR_DATE';
    component.widgetInfo.widgetColorPalette = null;
    component.widgetInfo.distictWith = 'REGION';
    component.widgetInfo.chartProperties.bucketFilter = null;
    component.widgetInfo.chartProperties.isEnabledBarPerc = false;
    component.widgetInfo.fieldCtrl = { fieldDescri: 'Requested Date' } as MetadataModel

    component.widgetInfo.widgetId = '123';
    component.widgetInfo.widgetTitle = 'test';
    component.widgetInfo.widgetType = WidgetType.TIMESERIES;
    component.widgetInfo.objectType = '1005';
    component.widgetInfo.isEnableGlobalFilter = false;

    component.filterCriteria = [];
    let filterWidget = new FilterWidget();
    filterWidget.fieldId = 'STATUS';
    component.emitpanAndClickevent(startdate, endDate);
    expect(component.emitpanAndClickevent).toBeTruthy();

    component.filterCriteria = [{fieldId:'MATL',conditionFieldId:'MATL'} as Criteria];
    filterWidget = new FilterWidget();
    filterWidget.fieldId = 'STATUS';
    component.emitpanAndClickevent(startdate, endDate);
    expect(component.emitpanAndClickevent).toBeTruthy();

    component.filterCriteria = [{fieldId : 'MATL_GRP', conditionFieldId:'MATL_GRP', conditionFieldValue:'M',conditionOperator:ConditionOperator.EQUAL} as Criteria];
    component.widgetInfo.groupById = 'MATL_GRP1';
    // const filterWidget1 = new FilterWidget();
    // filterWidget1.fieldId = 'STATUS';
    component.emitpanAndClickevent(startdate, endDate);
    expect(component.emitpanAndClickevent).toBeTruthy();
  }));

  it('legendclick(), emit after date change', async(() => {
    const item: LegendItem = { datasetIndex: 0 } as LegendItem;
    component.chartLegend = [{ code: 'MATL_TYPE', legendIndex: 0, text: 'Material Type' }];
    component.widgetInfo.field = 'STATUS';
    component.widgetInfo.groupById = 'REQUESTOR_DATE';
    component.widgetInfo.distictWith = 'REGION';
    component.widgetInfo.fieldCtrl = { fieldDescri: 'Requested Date' } as MetadataModel
    component.widgetInfo.isEnableGlobalFilter = false;

    component.filterCriteria = [];
    component.legendClick(item);
    expect(component.filterCriteria.length).toEqual(1);

    component.chartLegend = [{ code: 'GM', legendIndex: 0, text: 'GM' }];
    component.widgetInfo.field = 'CURRENTUSER';
    component.widgetInfo.isEnableGlobalFilter = true;
    component.filterCriteria = [{ fieldId: 'CURRENTUSER', widgetType: WidgetType.TIMESERIES, conditionFieldValue: 'admin' } as Criteria];
    component.legendClick(item);
    expect(component.filterCriteria.length).toEqual(1);

    component.chartLegend = [{ code: 'GM', legendIndex: 0, text: 'GM' }];
    component.widgetInfo.isEnableGlobalFilter = false;
    component.filterCriteria = [{ fieldId: 'CURRENTUSER', widgetType: WidgetType.TIMESERIES, conditionFieldValue: 'admin' } as Criteria];
    component.legendClick(item);
    expect(component.filterCriteria.length).toEqual(2);

    let item1: LegendItem = { datasetIndex: 0,text:'Total' } as LegendItem;
    component.chartLegend = [{ code: 'GM', legendIndex: 0, text: 'GM' }];
    component.widgetInfo.isEnableGlobalFilter = false;
    component.filterCriteria = [{ fieldId: 'CURRENTUSER', widgetType: WidgetType.TIMESERIES, conditionFieldValue: 'admin' } as Criteria];
    component.legendClick(item1);
    expect(component.filterCriteria.length).toEqual(1);

    item1 = { datasetIndex: 1,text:'Total' } as LegendItem;
    component.chartLegend = [{ code: 'GM', legendIndex: 0, text: 'GM' }];
    component.widgetInfo.isEnableGlobalFilter = false;
    component.filterCriteria = [{ fieldId: 'CURRENTUSER', widgetType: WidgetType.TIMESERIES, conditionFieldValue: 'admin' } as Criteria];
    component.legendClick(item1);
    expect(component.filterCriteria.length).toEqual(1);
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

  it('transformDataSets(),  transformDataSets', async(() => {
    component.userDetails = { selfServiceUserModel: { timeZone: 'Asia' }, defLocs: ['abc'] } as Userdetails;
    let data = { _shards: { total: 1, failed: 0, successful: 1, skipped: 0 }, hits: { hits: [], total: { value: 1221, relation: 'eq' }, max_score: null }, took: 3, timed_out: false, aggregations: { 'date_histogram#date': { buckets: [{ key_as_string: '04.00.2020', doc_count: 52, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 33, key: 'APP' }, { doc_count: 19, key: 'INP' }] }, key: 1588550400000 }, { key_as_string: '11.00.2020', doc_count: 46, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 33, key: 'APP' }, { doc_count: 13, key: 'INP' }] }, key: 1589155200000 }, { key_as_string: '18.00.2020', doc_count: 18, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 11, key: 'APP' }, { doc_count: 6, key: 'INP' }, { doc_count: 1, key: 'REJ' }] }, key: 1589760000000 }, { key_as_string: '25.00.2020', doc_count: 27, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 15, key: 'APP' }, { doc_count: 12, key: 'INP' }] }, key: 1590364800000 }, { key_as_string: '01.00.2020', doc_count: 322, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 294, key: 'APP' }, { doc_count: 28, key: 'INP' }] }, key: 1590969600000 }, { key_as_string: '08.00.2020', doc_count: 64, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 42, key: 'APP' }, { doc_count: 22, key: 'INP' }] }, key: 1591574400000 }, { key_as_string: '15.00.2020', doc_count: 57, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 47, key: 'APP' }, { doc_count: 10, key: 'INP' }] }, key: 1592179200000 }, { key_as_string: '22.00.2020', doc_count: 77, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 40, key: 'INP' }, { doc_count: 37, key: 'APP' }] }, key: 1592784000000 }, { key_as_string: '29.00.2020', doc_count: 173, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 111, key: 'INP' }, { doc_count: 62, key: 'APP' }] }, key: 1593388800000 }, { key_as_string: '06.00.2020', doc_count: 98, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 60, key: 'INP' }, { doc_count: 37, key: 'APP' }, { doc_count: 1, key: 'REJ' }] }, key: 1593993600000 }, { key_as_string: '13.00.2020', doc_count: 111, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 70, key: 'INP' }, { doc_count: 39, key: 'APP' }, { doc_count: 2, key: 'CNCL' }] }, key: 1594598400000 }, { key_as_string: '20.00.2020', doc_count: 149, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 111, key: 'APP' }, { doc_count: 37, key: 'INP' }, { doc_count: 1, key: 'REJ' }] }, key: 1595203200000 }, { key_as_string: '27.00.2020', doc_count: 27, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 18, key: 'INP' }, { doc_count: 9, key: 'APP' }] }, key: 1595808000000 }] } } };
    component.widgetInfo.field = 'STATUS';
    component.widgetInfo.chartProperties.showTotal = true;
    component.filterCriteria = [];// as Criteria[];

    component.transformDataSets(data);
    expect(component.transformDataSets.length).toEqual(1);

    const nestedData = {'nested#nested_tags': {'date_histogram#date': { buckets: [{ key_as_string: '04.00.2020', doc_count: 52, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 33, key: 'APP' }, { doc_count: 19, key: 'INP' }] }, key: 1588550400000 }, { key_as_string: '11.00.2020', doc_count: 46, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 33, key: 'APP' }, { doc_count: 13, key: 'INP' }] }, key: 1589155200000 }, { key_as_string: '18.00.2020', doc_count: 18, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 11, key: 'APP' }, { doc_count: 6, key: 'INP' }, { doc_count: 1, key: 'REJ' }] }, key: 1589760000000 }, { key_as_string: '25.00.2020', doc_count: 27, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 15, key: 'APP' }, { doc_count: 12, key: 'INP' }] }, key: 1590364800000 }, { key_as_string: '01.00.2020', doc_count: 322, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 294, key: 'APP' }, { doc_count: 28, key: 'INP' }] }, key: 1590969600000 }, { key_as_string: '08.00.2020', doc_count: 64, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 42, key: 'APP' }, { doc_count: 22, key: 'INP' }] }, key: 1591574400000 }, { key_as_string: '15.00.2020', doc_count: 57, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 47, key: 'APP' }, { doc_count: 10, key: 'INP' }] }, key: 1592179200000 }, { key_as_string: '22.00.2020', doc_count: 77, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 40, key: 'INP' }, { doc_count: 37, key: 'APP' }] }, key: 1592784000000 }, { key_as_string: '29.00.2020', doc_count: 173, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 111, key: 'INP' }, { doc_count: 62, key: 'APP' }] }, key: 1593388800000 }, { key_as_string: '06.00.2020', doc_count: 98, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 60, key: 'INP' }, { doc_count: 37, key: 'APP' }, { doc_count: 1, key: 'REJ' }] }, key: 1593993600000 }, { key_as_string: '13.00.2020', doc_count: 111, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 70, key: 'INP' }, { doc_count: 39, key: 'APP' }, { doc_count: 2, key: 'CNCL' }] }, key: 1594598400000 }, { key_as_string: '20.00.2020', doc_count: 149, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 111, key: 'APP' }, { doc_count: 37, key: 'INP' }, { doc_count: 1, key: 'REJ' }] }, key: 1595203200000 }, { key_as_string: '27.00.2020', doc_count: 27, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 18, key: 'INP' }, { doc_count: 9, key: 'APP' }] }, key: 1595808000000 }] } }};
    data = { _shards: { total: 1, failed: 0, successful: 1, skipped: 0 }, hits: { hits: [], total: { value: 1221, relation: 'eq' }, max_score: null }, took: 3, timed_out: false, aggregations: nestedData} as any;
    component.transformDataSets(data);
    expect(component.transformDataSets.length).toEqual(1);
  }));

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
    let data =
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
    component.widgetInfo.chartProperties.chartType = ChartType.BAR;
    component.widgetInfo.chartProperties.showTotal = false;
    component.tarnsformForShowInPercentage(data, false);
    expect(component.dataSet.length).toEqual(2);
    expect(component.dataSetlabel.length).toEqual(12);

    component.widgetInfo.chartProperties.chartType = ChartType.BAR;
    component.widgetInfo.chartProperties.showTotal = true;
    component.filterCriteria = [];
    // component.totalCount = [];
    component.tarnsformForShowInPercentage(data, true);
    expect(component.dataSet.length).toEqual(3);
    expect(component.dataSetlabel.length).toEqual(12);

    const nestedData = { 'nested#nested_tags': {
      'date_histogram#date': {
        buckets:
          [{
            key_as_string: '04.00.2020', doc_count: 52, 'sterms#term': {
              doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 33, key: 'APP' },
              { doc_count: 19, key: 'INP' }]
            }, key: 1588550400000
          }, { key_as_string: '11.00.2020', doc_count: 46, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 33, key: 'APP' }, { doc_count: 13, key: 'INP' }] }, key: 1589155200000 }]
      }
    }};
    data =
    {
      _shards: { total: 1, failed: 0, successful: 1, skipped: 0 },
      hits: { hits: [], total: { value: 1221, relation: 'eq' }, max_score: null }, took: 3, timed_out: false,
      aggregations: nestedData
    } as any;
    component.widgetInfo.chartProperties.chartType = ChartType.BAR;
    component.widgetInfo.chartProperties.showTotal = false;
    component.tarnsformForShowInPercentage(data, false);
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
    expect(res.length).toEqual(12);
  }));

  it('updateForm(), update form element ', async(() => {
    component.dateFilters = [{
      id: 1,
      isActive: false,
      value: '1'
    }];

    component.formGroup = new FormGroup({
      field: new FormControl('')
    });

    component.widgetInfo.field = 'MATL_TYPE';
    component.widgetInfo.chartProperties.seriesWith = SeriesWith.day;
    component.widgetInfo.chartProperties.seriesFormat = 'dd.mm.yyyy';
    component.widgetInfo.aggregrationOp = AggregationOperator.COUNT;
    component.widgetInfo.chartProperties.chartType = ChartType.LINE;
    component.widgetInfo.chartProperties.isEnableDatalabels = false;
    component.widgetInfo.chartProperties.isEnableLegend = false;
    component.widgetInfo.chartProperties.legendPosition = null;
    component.widgetInfo.chartProperties.datalabelsPosition = null;
    component.widgetInfo.chartProperties.xAxisLabel = '100';
    component.widgetInfo.chartProperties.yAxisLabel = '100';
    component.widgetInfo.chartProperties.scaleFrom = 0;
    component.widgetInfo.chartProperties.scaleTo = 1000;
    component.widgetInfo.chartProperties.stepSize = 100;
    component.widgetInfo.chartProperties.dataSetSize = 100;
    component.widgetInfo.chartProperties.timeseriesStartDate = TimeseriesStartDate.D7;
    component.widgetInfo.chartProperties.showTotal = false;
    component.widgetInfo.groupById = 'REQUESTOR_DATE';
    component.widgetInfo.widgetColorPalette = null,
      component.widgetInfo.distictWith = 'REGION',
      component.widgetInfo.chartProperties.bucketFilter = null,
      component.widgetInfo.chartProperties.isEnabledBarPerc = false,
      component.widgetInfo.fieldCtrl = { fieldDescri: 'Requested Date' } as MetadataModel

    component.widgetInfo.widgetId = '123';
    component.widgetInfo.widgetTitle = 'test';
    component.widgetInfo.widgetType = WidgetType.TIMESERIES;
    component.widgetInfo.objectType = '1005';
    component.widgetInfo.isEnableGlobalFilter = false;

    component.filterCriteria = [];
    const filterWidget = new FilterWidget();
    filterWidget.fieldId = 'STATUS';

    component.updateForm('MATL_TYPE', { id: 1, value: '7', isActive: false });
    expect(component.updateForm('MATL_TYPE', { id: 1, value: '7', isActive: false })).toBe(undefined);

    component.widgetInfo.chartProperties.seriesWith = SeriesWith.hour;
    component.updateForm('MATL_TYPE', { id: 1, value: '7', isActive: false });
    expect(component.updateForm('MATL_TYPE', { id: 1, value: '7', isActive: false })).toBe(undefined);

    component.widgetInfo.chartProperties.seriesWith = SeriesWith.minute;
    component.updateForm('MATL_TYPE', { id: 1, value: '7', isActive: false });
    expect(component.updateForm('MATL_TYPE', { id: 1, value: '7', isActive: false })).toBe(undefined);

    component.widgetInfo.chartProperties.seriesWith = SeriesWith.millisecond;
    component.updateForm('MATL_TYPE', { id: 1, value: '7', isActive: false });
    expect(component.updateForm('MATL_TYPE', { id: 1, value: '7', isActive: false })).toBe(undefined);

    component.widgetInfo.chartProperties.seriesWith = SeriesWith.month;
    component.updateForm('MATL_TYPE', { id: 1, value: '7', isActive: false });
    expect(component.updateForm('MATL_TYPE', { id: 1, value: '7', isActive: false })).toBe(undefined);

    component.widgetInfo.chartProperties.seriesWith = SeriesWith.quarter;
    component.updateForm('MATL_TYPE', { id: 1, value: '7', isActive: false });
    expect(component.updateForm('MATL_TYPE', { id: 1, value: '7', isActive: false })).toBe(undefined);

    component.widgetInfo.chartProperties.seriesWith = SeriesWith.second;
    component.updateForm('MATL_TYPE', { id: 1, value: '7', isActive: false });
    expect(component.updateForm('MATL_TYPE', { id: 1, value: '7', isActive: false })).toBe(undefined);

    component.widgetInfo.chartProperties.seriesWith = SeriesWith.week;
    component.updateForm('MATL_TYPE', { id: 1, value: '7', isActive: false });
    expect(component.updateForm('MATL_TYPE', { id: 1, value: '7', isActive: false })).toBe(undefined);

    component.widgetInfo.chartProperties.seriesWith = SeriesWith.year;
    component.updateForm('MATL_TYPE', { id: 1, value: '7', isActive: false });
    expect(component.updateForm('MATL_TYPE', { id: 1, value: '7', isActive: false })).toBe(undefined);

    component.widgetInfo.chartProperties.seriesWith = 'abb' as SeriesWith;
    component.updateForm('MATL_TYPE', { id: 1, value: '7', isActive: false });
    expect(component.updateForm('MATL_TYPE', { id: 1, value: '7', isActive: false })).toBe(undefined);
  }));

  it('codeTextValue()', async(() => {
    component.widgetInfo.fieldCtrl = { picklist: '1', fieldId: 'MATL_GROUP' } as MetadataModel;
    let innerBucket: any = { key: '200010', 'top_hits#data_hits': { hits: { hits: [{ _source: { hdvs: { MATL_GROUP: { vc: [{ c: '200010', t: 'testing' }] } } } }] } } };
    const fieldid = 'MATL_GROUP';
    expect(component.codeTextValue(innerBucket, fieldid)).toEqual({ c: '200010', t: 'testing' });

    innerBucket = { key: '200010' };
    expect(component.codeTextValue(innerBucket, fieldid)).toEqual('200010');
  }));

  it('dateAndCountFormat()', async(() => {
    const dataArr = { label: '2019' };
    const obj = {} as any;
    let dataObj;
    dataObj = 4773476;
    component.widgetInfo.chartProperties.seriesWith = SeriesWith.year;
    component.dateAndCountFormat(dataObj, obj, dataArr);
    expect(obj.Year).toEqual('2019' + '\t');
    expect(obj.Count).toEqual('4,773,476'+'\t');

    component.widgetInfo.chartProperties.seriesWith = SeriesWith.day;
    dataObj = { x: '1-10-2005', y: 2 };
    component.dateAndCountFormat(dataObj, obj, dataArr)
    expect(obj.Day).toEqual('2019' + '\t');

    component.widgetInfo.chartProperties.seriesWith = SeriesWith.month;
    dataObj = { x: '1-10-2005', y: 2 };
    component.dateAndCountFormat(dataObj, obj, dataArr);

    expect(obj.Month).toEqual('2019' + '\t');

    component.widgetInfo.chartProperties.seriesWith = SeriesWith.quarter;
    dataObj = { x: '1-10-2005', y: 2 };
    component.dateAndCountFormat(dataObj, obj, dataArr);

    expect(obj.Quarter).toEqual('2019' + '\t');

    component.widgetInfo.chartProperties.seriesWith = SeriesWith.week;
    dataObj = { x: '1-10-2005', y: 2 };
    component.dateAndCountFormat(dataObj, obj, dataArr);

    expect(obj.Week).toEqual('2019' + '\t');

    component.chartType = 'line';
    dataObj = { x: '2005', y: 2 };
    component.widgetInfo.chartProperties.seriesWith = SeriesWith.year;
    component.dateAndCountFormat(dataObj, obj, dataArr);

    expect(obj.Year).toEqual('2005');

    component.widgetInfo.chartProperties.seriesWith = SeriesWith.day;
    dataObj = { x: '1-10-2005', y: 2 };
    component.dateAndCountFormat(dataObj, obj, dataArr);

    expect(obj.Day).toEqual(dataObj.x + '\t');

    component.widgetInfo.chartProperties.seriesWith = SeriesWith.month;
    dataObj = { x: '1-10-2005', y: 2 };
    component.dateAndCountFormat(dataObj, obj, dataArr);

    expect(obj.Month).toEqual(dataObj.x);

    component.widgetInfo.chartProperties.seriesWith = SeriesWith.quarter;
    dataObj = { x: '1-10-2005', y: 2 };
    component.dateAndCountFormat(dataObj, obj, dataArr);

    expect(obj.Quarter).toEqual(dataObj.x);

    component.widgetInfo.chartProperties.seriesWith = SeriesWith.week;
    dataObj = { x: '1-10-2005', y: 2 };
    component.dateAndCountFormat(dataObj, obj, dataArr);

    expect(obj.Week).toEqual(dataObj.x);

    component.widgetInfo.chartProperties.seriesWith = SeriesWith.week;
    dataObj = { x: 1478783778787, y: 2 };
    component.dateAndCountFormat(dataObj, obj, dataArr);
    expect(obj.Week).toEqual('10-Nov-2016\t');

    component.widgetInfo.chartProperties.seriesWith = SeriesWith.year;
    dataObj = { x: 1478783778787, y: 2 };
    component.dateAndCountFormat(dataObj, obj, dataArr);
    expect(obj.Week).toEqual('10-Nov-2016\t');

    component.widgetInfo.chartProperties.seriesWith = SeriesWith.day;
    dataObj = { x: 1478783778787, y: 2 };
    component.dateAndCountFormat(dataObj, obj, dataArr);
    expect(obj.Week).toEqual('10-Nov-2016\t');

    component.widgetInfo.chartProperties.seriesWith = SeriesWith.month;
    dataObj = { x: 1478783778787, y: 2 };
    component.dateAndCountFormat(dataObj, obj, dataArr);
    expect(obj.Week).toEqual('10-Nov-2016\t');

    component.widgetInfo.chartProperties.seriesWith = SeriesWith.quarter;
    dataObj = { x: 1478783778787, y: 0 };
    component.dateAndCountFormat(dataObj, obj, dataArr);
    expect(obj.Week).toEqual('10-Nov-2016\t');

    component.widgetInfo.chartProperties.seriesWith = 'abcd' as SeriesWith;
    dataObj = { x: '1-10-2005', y: 2 };
    component.dateAndCountFormat(dataObj, obj, dataArr);

    expect(component.dateAndCountFormat).toBeTruthy();

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

    const arrBucket2 = { code: null, text: 'Admin' };
    component.displayCriteriaOption = DisplayCriteria.TEXT;
    res = component.checkTextCode(arrBucket2);
    expect(res1).toEqual('');

    const arrBucket3 = { code: null, text: 'Admin' };
    component.displayCriteriaOption = DisplayCriteria.CODE;
    res = component.checkTextCode(arrBucket3);
    expect(res1).toEqual('');

    const arrBucket4 = { code: 'Admin', text: null};
    component.displayCriteriaOption = DisplayCriteria.TEXT;
    res = component.checkTextCode(arrBucket4);
    expect(res1).toEqual('');
  }));

  it('viewChange(), should change widget view', async () => {
    component.isTableView = false;
    component.widgetInfo.chartProperties.showTotal = true;
    component.widgetInfo.field = 'STATUS'
    component.reportId = 123454567;
    component.widgetId = 45675678;
    component.filterCriteria = [] as Criteria[];
    component.userDetails = {selfServiceUserModel:{timeZone:'Asia/Calcutta'} as UserPreferenceDetails, defLocs:[]} as Userdetails;

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
      view: WidgetView.GRAPH_VIEW
    }

    component.widgetViewDetails = {
      acknowledge: true,
      payload: {
        ...widgetViewRequest as WidgetViewPayload
      }
    }

    spyOn(widgetService, 'saveWidgetView').withArgs(widgetViewRequest).and.returnValue(of(widgetViewDetails));
    component.viewChange(false);
    expect(widgetService.saveWidgetView).toHaveBeenCalledWith(widgetViewRequest);

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
      acknowledge: true,
      payload: {
        ...widgetViewRequest1 as WidgetViewPayload
      }
    }
    spyOn(widgetService, 'updateWidgetView').withArgs(widgetViewRequest1).and.returnValue(of(widgetViewDetails1));
    component.viewChange(true);
    expect(widgetService.updateWidgetView).toHaveBeenCalledWith(widgetViewRequest1);
  });

  it('getTableData(), should return table data', async () => {
    component.displayedColumnsId = [];
    component.tableDataSource = [];
    component.dataSet = [{ label: 'Test1', data: [0, 4, 5, 3, 2] }];

    component.widgetInfo.distictWith = 'MATL_GROUP';
    component.widgetInfo.field = 'STATUS';
    component.widgetInfo.chartProperties.seriesWith = SeriesWith.month;
    component.widgetInfo.chartProperties.showTotal = true;
    component.widgetInfo.isStepwiseSLA = true;
    component.widgetInfo.fieldCtrl = { fieldDescri: 'Test1' } as MetadataModel;
    component.filterCriteria = [] as Criteria[];

    component.getTableData();
    expect(component.displayedColumnsId.length).toEqual(2);
    expect(component.tableDataSource.length).toEqual(1);

    component.displayedColumnsId = [];
    component.tableDataSource = [];
    component.dataSet = [{ label: 'Test1', data: [0, 4, 5, 3, 2] }];

    component.widgetInfo.fieldCtrl = { fieldDescri: 'Test1', fieldId: 'STATUS' } as MetadataModel;
    component.filterCriteria = [] as Criteria[];

    component.getTableData();
    expect(component.displayedColumnsId.length).toEqual(2);
    expect(component.tableDataSource.length).toEqual(1);

    component.displayedColumnsId = [];
    component.tableDataSource = [];
    component.dataSet = [{ label: 'Test1', data: [0, 4, 5, 3, 2], id: { key: 1 } } as ChartDataset];

    component.getTableData();
    expect(component.displayedColumnsId.length).toEqual(2);
    expect(component.tableDataSource.length).toEqual(1);
  });

  it('stackClickFilter(), should filter , after click on bar stack', async(() => {
    // call stack click with no argument then filter criteria should be [] array
    component.filterCriteria = [];
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    component.stackClickFilter();
    expect(component.filterCriteria.length).toEqual(0);

    // mock data
    const array = [{ _datasetIndex: 0 }];
    component.chartLegend = [{ code: 'MATL_TYPE', legendIndex: 0, text: 'Material Type' }];
    component.filterCriteria = [{ fieldId: 'MATL_TYPE' } as Criteria];
    component.widgetInfo.field = 'MATL_TYPE';
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone,new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementsAtEventForMode: (e: any) => [{ _datasetIndex: 0, _index: 0 } as any] } as any;
    component.chart = baseChart;
    component.stackClickFilter(null, array);
    expect(component.filterCriteria.length).toEqual(2, 'after apply filter criteria then filtercriteria length should be 1');

    component.chartLegend = [{ code: 'REQUESTOR_DATE', legendIndex: 0, text: 'REQUESTOR DATE' }];
    component.stackClickFilter(null, array);
    expect(component.filterCriteria.length).toEqual(3);

    component.chartLegend = [{ code: 'GM', legendIndex: 0, text: 'GM' }];
    component.filterCriteria = [{ fieldId: 'CURRENTUSER', widgetType: WidgetType.TIMESERIES, conditionFieldValue: 'admin' } as Criteria];
    component.widgetInfo.field = 'CURRENTUSER';
    component.widgetInfo.isEnableGlobalFilter = true;
    component.stackClickFilter(null, array);
    expect(component.filterCriteria.length).toEqual(1);

    component.chartLegend = [{ code: 'GM', legendIndex: 0, text: 'GM' }];
    component.filterCriteria = [];
    component.widgetInfo.field = 'CURRENTUSER';
    component.widgetInfo.isEnableGlobalFilter = true;
    component.stackClickFilter(null, array);
    expect(component.filterCriteria.length).toEqual(1);
  }));

  it('updateValue()', async () => {
    component.dateFilters = [{
      id: 1,
      isActive: false,
      value: TimeseriesStartDate.D7
    }];
    // component.widgetInf = { value: {} } as any;
    component.widgetInfo.field = 'STATUS';
    component.widgetInfo.chartProperties.showTotal = true;
    component.widgetInfo.chartProperties.timeseriesStartDate = TimeseriesStartDate.D7;
    // const timeSeries = { timeSeries: { fieldId: 'STATUS', showTotal: true, startDate: '1' } } as TimeSeriesWidget;
    component.formGroup = new FormGroup({
      field: new FormControl('')
    });
    component.filterCriteria = [];
    spyOn(component, 'updateForm');
    component.updatevalues();
    expect(component.updateForm).toHaveBeenCalled();
  });

  it('clearFilterCriteria(), should clear filters', async () => {
    component.widgetInfo.field = 'STATUS';
    component.widgetInfo.groupById = 'CURRENTUSER';
    component.widgetInfo.chartProperties.showTotal = true;
    component.widgetInfo.chartProperties.seriesWith = SeriesWith.month;
    component.widgetInfo.fieldCtrl = { fieldDescri: 'Test1', fieldId: 'STATUS' } as MetadataModel;
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

  it('tranformGroupBy()', async () => {
    let data = { _shards: { total: 1, failed: 0, successful: 1, skipped: 0 }, hits: { hits: [], total: { value: 1221, relation: 'eq' }, max_score: null }, took: 3, timed_out: false, aggregations: { 'date_histogram#date': { buckets: [{ key_as_string: '04.00.2020', doc_count: 52, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 33, key: 'APP' }, { doc_count: 19, key: 'INP' }] }, key: 1588550400000 }, { key_as_string: '11.00.2020', doc_count: 46, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 33, key: 'APP' }, { doc_count: 13, key: 'INP' }] }, key: 1589155200000 }, { key_as_string: '18.00.2020', doc_count: 18, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 11, key: 'APP' }, { doc_count: 6, key: 'INP' }, { doc_count: 1, key: 'REJ' }] }, key: 1589760000000 }, { key_as_string: '25.00.2020', doc_count: 27, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 15, key: 'APP' }, { doc_count: 12, key: 'INP' }] }, key: 1590364800000 }, { key_as_string: '01.00.2020', doc_count: 322, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 294, key: 'APP' }, { doc_count: 28, key: 'INP' }] }, key: 1590969600000 }, { key_as_string: '08.00.2020', doc_count: 64, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 42, key: 'APP' }, { doc_count: 22, key: 'INP' }] }, key: 1591574400000 }, { key_as_string: '15.00.2020', doc_count: 57, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 47, key: 'APP' }, { doc_count: 10, key: 'INP' }] }, key: 1592179200000 }, { key_as_string: '22.00.2020', doc_count: 77, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 40, key: 'INP' }, { doc_count: 37, key: 'APP' }] }, key: 1592784000000 }, { key_as_string: '29.00.2020', doc_count: 173, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 111, key: 'INP' }, { doc_count: 62, key: 'APP' }] }, key: 1593388800000 }, { key_as_string: '06.00.2020', doc_count: 98, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 60, key: 'INP' }, { doc_count: 37, key: 'APP' }, { doc_count: 1, key: 'REJ' }] }, key: 1593993600000 }, { key_as_string: '13.00.2020', doc_count: 111, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 70, key: 'INP' }, { doc_count: 39, key: 'APP' }, { doc_count: 2, key: 'CNCL' }] }, key: 1594598400000 }, { key_as_string: '20.00.2020', doc_count: 149, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 111, key: 'APP' }, { doc_count: 37, key: 'INP' }, { doc_count: 1, key: 'REJ' }] }, key: 1595203200000 }, { key_as_string: '27.00.2020', doc_count: 27, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 18, key: 'INP' }, { doc_count: 9, key: 'APP' }] }, key: 1595808000000 }] } } };
    component.widgetInfo.field = 'STATUS';
    component.widgetInfo.groupById = 'CURRENTUSER';
    component.widgetInfo.chartProperties.showTotal = true;
    component.widgetInfo.chartProperties.isEnableLegend = true;
    component.widgetInfo.chartProperties.isEnableDatalabels = true;
    component.widgetInfo.chartProperties.legendPosition = LegendPosition.top;
    component.widgetInfo.chartProperties.seriesWith = SeriesWith.month;
    component.widgetInfo.fieldCtrl = { fieldDescri: 'Test1', fieldId: 'STATUS' } as MetadataModel;
    component.filterCriteria = [] as Criteria[];

    component.transformForGroupBy(data);
    expect(component.transformForGroupBy).toBeTruthy();

    const nestedData = {'nested#nested_tags': { 'date_histogram#date': { buckets: [{ key_as_string: '04.00.2020', doc_count: 52, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 33, key: 'APP' }, { doc_count: 19, key: 'INP' }] }, key: 1588550400000 }, { key_as_string: '11.00.2020', doc_count: 46, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 33, key: 'APP' }, { doc_count: 13, key: 'INP' }] }, key: 1589155200000 }, { key_as_string: '18.00.2020', doc_count: 18, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 11, key: 'APP' }, { doc_count: 6, key: 'INP' }, { doc_count: 1, key: 'REJ' }] }, key: 1589760000000 }, { key_as_string: '25.00.2020', doc_count: 27, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 15, key: 'APP' }, { doc_count: 12, key: 'INP' }] }, key: 1590364800000 }, { key_as_string: '01.00.2020', doc_count: 322, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 294, key: 'APP' }, { doc_count: 28, key: 'INP' }] }, key: 1590969600000 }, { key_as_string: '08.00.2020', doc_count: 64, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 42, key: 'APP' }, { doc_count: 22, key: 'INP' }] }, key: 1591574400000 }, { key_as_string: '15.00.2020', doc_count: 57, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 47, key: 'APP' }, { doc_count: 10, key: 'INP' }] }, key: 1592179200000 }, { key_as_string: '22.00.2020', doc_count: 77, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 40, key: 'INP' }, { doc_count: 37, key: 'APP' }] }, key: 1592784000000 }, { key_as_string: '29.00.2020', doc_count: 173, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 111, key: 'INP' }, { doc_count: 62, key: 'APP' }] }, key: 1593388800000 }, { key_as_string: '06.00.2020', doc_count: 98, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 60, key: 'INP' }, { doc_count: 37, key: 'APP' }, { doc_count: 1, key: 'REJ' }] }, key: 1593993600000 }, { key_as_string: '13.00.2020', doc_count: 111, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 70, key: 'INP' }, { doc_count: 39, key: 'APP' }, { doc_count: 2, key: 'CNCL' }] }, key: 1594598400000 }, { key_as_string: '20.00.2020', doc_count: 149, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 111, key: 'APP' }, { doc_count: 37, key: 'INP' }, { doc_count: 1, key: 'REJ' }] }, key: 1595203200000 }, { key_as_string: '27.00.2020', doc_count: 27, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 18, key: 'INP' }, { doc_count: 9, key: 'APP' }] }, key: 1595808000000 }] } }}
    data = { _shards: { total: 1, failed: 0, successful: 1, skipped: 0 }, hits: { hits: [], total: { value: 1221, relation: 'eq' }, max_score: null }, took: 3, timed_out: false, aggregations: nestedData } as any;
    component.transformForGroupBy(data);
    expect(component.transformForGroupBy).toBeTruthy();

    data = null;
    component.transformForGroupBy(data);
    expect(component.transformForGroupBy).toBeTruthy();
  });

  it('transformDataForComparison()', async () => {
    let data1 = { _shards: { total: 1, failed: 0, successful: 1, skipped: 0 }, hits: { hits: [], total: { value: 1221, relation: 'eq' }, max_score: null }, took: 3, timed_out: false, aggregations: { 'date_histogram#date': { buckets: [{ key_as_string: '04.00.2020', doc_count: 52, 'terms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 33, key: 'APP' }, { doc_count: 19, key: 'INP' }] }, key: 1588550400000 }, { key_as_string: '11.00.2020', doc_count: 46, 'terms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 33, key: 'APP' }, { doc_count: 13, key: 'INP' }] }, key: 1589155200000 }, { key_as_string: '18.00.2020', doc_count: 18, 'terms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 11, key: 'APP' }, { doc_count: 6, key: 'INP' }, { doc_count: 1, key: 'REJ' }] }, key: 1589760000000 }, { key_as_string: '25.00.2020', doc_count: 27, 'terms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 15, key: 'APP' }, { doc_count: 12, key: 'INP' }] }, key: 1590364800000 }, { key_as_string: '01.00.2020', doc_count: 322, 'terms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 294, key: 'APP' }, { doc_count: 28, key: 'INP' }] }, key: 1590969600000 }, { key_as_string: '08.00.2020', doc_count: 64, 'terms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 42, key: 'APP' }, { doc_count: 22, key: 'INP' }] }, key: 1591574400000 }, { key_as_string: '15.00.2020', doc_count: 57, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 47, key: 'APP' }, { doc_count: 10, key: 'INP' }] }, key: 1592179200000 }, { key_as_string: '22.00.2020', doc_count: 77, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 40, key: 'INP' }, { doc_count: 37, key: 'APP' }] }, key: 1592784000000 }, { key_as_string: '29.00.2020', doc_count: 173, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 111, key: 'INP' }, { doc_count: 62, key: 'APP' }] }, key: 1593388800000 }, { key_as_string: '06.00.2020', doc_count: 98, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 60, key: 'INP' }, { doc_count: 37, key: 'APP' }, { doc_count: 1, key: 'REJ' }] }, key: 1593993600000 }, { key_as_string: '13.00.2020', doc_count: 111, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 70, key: 'INP' }, { doc_count: 39, key: 'APP' }, { doc_count: 2, key: 'CNCL' }] }, key: 1594598400000 }, { key_as_string: '20.00.2020', doc_count: 149, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 111, key: 'APP' }, { doc_count: 37, key: 'INP' }, { doc_count: 1, key: 'REJ' }] }, key: 1595203200000 }, { key_as_string: '27.00.2020', doc_count: 27, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 18, key: 'INP' }, { doc_count: 9, key: 'APP' }] }, key: 1595808000000 }] } } };
    component.widgetInfo.field = 'STATUS';
    component.widgetInfo.groupById = 'CURRENTUSER';
    component.widgetInfo.chartProperties.showTotal = true;
    component.widgetInfo.chartProperties.isEnableLegend = true;
    component.widgetInfo.chartProperties.isEnableDatalabels = true;
    component.widgetInfo.chartProperties.legendPosition = LegendPosition.top;
    component.widgetInfo.fieldCtrl = { fieldDescri: 'Test1', fieldId: 'STATUS',dataType:'DATS' } as MetadataModel;
    component.filterCriteria = [] as Criteria[];
    component.transformDataForComparison(data1,true);
    expect(component.transformDataForComparison).toBeTruthy();

    const nestedData = { 'nested#nested_tags': {'date_histogram#date': { buckets: [{ key_as_string: '04.00.2020', doc_count: 52, 'terms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 33, key: 'APP' }, { doc_count: 19, key: 'INP' }] }, key: 1588550400000 }, { key_as_string: '11.00.2020', doc_count: 46, 'terms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 33, key: 'APP' }, { doc_count: 13, key: 'INP' }] }, key: 1589155200000 }, { key_as_string: '18.00.2020', doc_count: 18, 'terms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 11, key: 'APP' }, { doc_count: 6, key: 'INP' }, { doc_count: 1, key: 'REJ' }] }, key: 1589760000000 }, { key_as_string: '25.00.2020', doc_count: 27, 'terms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 15, key: 'APP' }, { doc_count: 12, key: 'INP' }] }, key: 1590364800000 }, { key_as_string: '01.00.2020', doc_count: 322, 'terms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 294, key: 'APP' }, { doc_count: 28, key: 'INP' }] }, key: 1590969600000 }, { key_as_string: '08.00.2020', doc_count: 64, 'terms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 42, key: 'APP' }, { doc_count: 22, key: 'INP' }] }, key: 1591574400000 }, { key_as_string: '15.00.2020', doc_count: 57, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 47, key: 'APP' }, { doc_count: 10, key: 'INP' }] }, key: 1592179200000 }, { key_as_string: '22.00.2020', doc_count: 77, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 40, key: 'INP' }, { doc_count: 37, key: 'APP' }] }, key: 1592784000000 }, { key_as_string: '29.00.2020', doc_count: 173, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 111, key: 'INP' }, { doc_count: 62, key: 'APP' }] }, key: 1593388800000 }, { key_as_string: '06.00.2020', doc_count: 98, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 60, key: 'INP' }, { doc_count: 37, key: 'APP' }, { doc_count: 1, key: 'REJ' }] }, key: 1593993600000 }, { key_as_string: '13.00.2020', doc_count: 111, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 70, key: 'INP' }, { doc_count: 39, key: 'APP' }, { doc_count: 2, key: 'CNCL' }] }, key: 1594598400000 }, { key_as_string: '20.00.2020', doc_count: 149, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 111, key: 'APP' }, { doc_count: 37, key: 'INP' }, { doc_count: 1, key: 'REJ' }] }, key: 1595203200000 }, { key_as_string: '27.00.2020', doc_count: 27, 'sterms#term': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 18, key: 'INP' }, { doc_count: 9, key: 'APP' }] }, key: 1595808000000 }] } } }
    data1 = { _shards: { total: 1, failed: 0, successful: 1, skipped: 0 }, hits: { hits: [], total: { value: 1221, relation: 'eq' }, max_score: null }, took: 3, timed_out: false, aggregations: nestedData } as any;
    component.transformDataForComparison(data1);
    expect(component.transformDataForComparison).toBeTruthy();
  });

  it('getwidgetData() 1', async(() => {
    const service = fixture.debugElement.injector.get(WidgetService);
    const buckets = { aggregations: { 'date_histogram#date': { buckets: [{ key_as_string: '2019', 'sterms#term': { buckets: [{ 'sterms#textTerm': { buckets: [{ 'top_hits#data_hits': { hits: { hits: [{ _source: { staticFields: { STATUS: { vc: [{ c: 'APP', t: 'Approved' }] } } } }] } }, key: 'APP' }] }, key: 'APP' }, { 'sterms#textTerm': { buckets: [{ 'top_hits#data_hits': { hits: { hits: [{ _source: { staticFields: { STATUS: { vc: [{ c: 'CNCL', t: 'Cancelled' }] } } } }] } }, key: 'CNCL' }] }, key: 'CNCL' }, { 'sterms#textTerm': { buckets: [{ 'top_hits#data_hits': { hits: { hits: [{ _source: { staticFields: { STATUS: { vc: [{ c: 'INP', t: 'In Progress' }] } } } }] } }, key: 'INP' }] }, key: 'INP' }] }, key: 1546261200000 }] } } }
    component.userDetails = { selfServiceUserModel: { timeZone: 'Asia' }, defLocs: ['abc'] } as Userdetails;
    component.widgetInfo.field = 'STATUS';
    component.widgetInfo.chartProperties.chartType = ChartType.BAR;
    component.widgetInfo.chartProperties.dataSetSize = 1;
    component.widgetInfo.chartProperties.showTotal = true;
    component.widgetInfo.fieldCtrl = { picklist: '0' } as MetadataModel;
    component.filterCriteria = [];
    component.reportId = 12345667;
    spyOn(service, 'getWidgetData').withArgs('653267432', component.filterCriteria, '', '', component.userDetails.selfServiceUserModel.timeZone, component.userDetails.defLocs.toString()).and.returnValue(of(buckets));
    component.getwidgetData(653267432);
    expect(service.getWidgetData).toHaveBeenCalledWith('653267432', component.filterCriteria, '', '', component.userDetails.selfServiceUserModel.timeZone, component.userDetails.defLocs.toString());
  }));


  it('saveDisplayCriteria(), should call saveDisplayCriteria', async(() => {
    component.widgetViewDetails = {
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
    component.dataSet = [];
    component.filterCriteria = [];
    const service = fixture.debugElement.injector.get(WidgetService);
    component.displayCriteriaOption = DisplayCriteria.TEXT;
    component.widgetInfo.chartProperties.chartType = ChartType.LINE;
    component.widgetInfo.field = 'TIME_TAKEN';
    component.widgetInfo.chartProperties.dataSetSize = 1;
    component.widgetInfo.fieldCtrl = { picklist: '0' } as MetadataModel;
    component.widgetId = 12345;
    component.widgetInfo.widgetType = WidgetType.FILTER;
    component.widgetInfo.widgetId = component.widgetId.toString();
    component.responseData = { timed_out: false, aggregations: { 'date_histogram#date': { buckets: [{ key_as_string: '2019-Jan-01', 'sterms#term': { buckets: [{ doc_count: 1282, key: 'true' }, { doc_count: 32, key: 'false' }] }, key: 1546300800000 }] } } };
    spyOn(service, 'saveDisplayCriteria').withArgs(component.widgetInfo.widgetId, component.widgetInfo.widgetType, component.displayCriteriaOption).and.returnValue(of({}));
    spyOn(component,'setLegendForChart');
    component.saveDisplayCriteria();

    expect(service.saveDisplayCriteria).toHaveBeenCalledWith('12345', WidgetType.FILTER, DisplayCriteria.TEXT);
  }));


  it('getwidgetData() 2', async(() => {
    const service = fixture.debugElement.injector.get(WidgetService);
    const buckets = { aggregations: { 'date_histogram#date': { buckets: [{ key_as_string: '2019-Jan-01', doc_count: 1471, key: 1546261200000 }] } } };
    component.userDetails = { selfServiceUserModel: { timeZone: 'Asia' }, defLocs: ['abc'] } as Userdetails;
    component.displayCriteriaOption = DisplayCriteria.TEXT;
    component.widgetInfo.chartProperties.chartType = ChartType.LINE;
    component.widgetInfo.field = 'REQUESTOR_DATE';
    component.widgetInfo.groupById = 'REQUESTOR_DATE';
    component.widgetInfo.chartProperties.dataSetSize = 1;
    component.widgetInfo.chartProperties.isEnableLegend = true;
    component.widgetInfo.chartProperties.isEnableDatalabels = true;
    component.widgetInfo.fieldCtrl = { picklist: '0' } as MetadataModel;
    component.filterCriteria = [];
    component.isGroupByChart = true;
    spyOn(service, 'getWidgetData').withArgs('653267432', component.filterCriteria, '', '', component.userDetails.selfServiceUserModel.timeZone, component.userDetails.defLocs.toString()).and.returnValue(of(buckets));
    component.getwidgetData(653267432);
    expect(service.getWidgetData).toHaveBeenCalledWith('653267432', component.filterCriteria, '', '', component.userDetails.selfServiceUserModel.timeZone, component.userDetails.defLocs.toString());
  }));


  it('openColorPalette(), should open color palette dialog', async(() => {
    component.widgetId = 72366423;
    component.reportId = 65631624;
    component.widgetInfo.widgetTitle = 'timeseries';
    component.widgetInfo.widgetColorPalette = new WidgetColorPalette();
    component.chartLegend = [
      {
        code: 'HAWA',
        legendIndex: 1,
        text: 'Hawa material'
      }
    ];
    component.openColorPalette();

    expect(mockMatDialogOpen.open).toHaveBeenCalled();
  }));

  it('ngOnChanges(), while change rule type', async(() => {
    // mock data
    const changes: import('@angular/core').SimpleChanges = { hasFilterCriteria: { currentValue: true, previousValue: false, firstChange: null, isFirstChange: null }, filterCriteria: { currentValue: true, previousValue: false, firstChange: null, isFirstChange: null }, boxSize: { currentValue: 35, previousValue: 26, firstChange: null, isFirstChange: null }, widgetInfo : {previousValue : null, currentValue : {field : 'MATL', chartProperties : {chartType : 'LINE'}, groupById:'DATECREATED'}, isFirstChange : null, firstChange : null},isWidgetApiCall : {currentValue : true, previousValue : false, isFirstChange : null, firstChange : null} };
    component.widgetInfo.field = 'STATUS';
    component.editedMode = true;
    component.widgetInfo.chartProperties.dataSetSize = 12;
    component.widgetInfo.chartProperties.showTotal = true;
    component.filterCriteria = [];
    component.widgetId = 478478;
    component.userDetails = { selfServiceUserModel: { timeZone: 'Asia' }, defLocs: ['abc'] } as Userdetails;
    spyOn(component,'getwidgetData');
    component.ngOnChanges(changes);
    expect(component.lablels.length).toEqual(0);
    const changes1: import('@angular/core').SimpleChanges = { hasFilterCriteria: { currentValue: true, previousValue: false, firstChange: null, isFirstChange: null }, filterCriteria: { currentValue: true, previousValue: false, firstChange: null, isFirstChange: null }, boxSize: { currentValue: 35, previousValue: 26, firstChange: null, isFirstChange: null }, widgetInfo : {previousValue : null, currentValue : {field : 'MATL', chartProperties : {chartType : 'BAR'}, groupById:'MATL'}, isFirstChange : null, firstChange : null},isWidgetApiCall : {currentValue : true, previousValue : false, isFirstChange : null, firstChange : null} };
    component.ngOnChanges(changes1);
    expect(component.lablels.length).toEqual(0);
  }));

  it('downloadCSV()', async(() => {
    // mock data
    component.widgetInfo.chartProperties.seriesWith = SeriesWith.month;
    component.widgetInfo.fieldCtrl = { fieldDescri: 'Industry Sector', fieldId: 'IND_SECTOR' } as MetadataModel;
    component.widgetInfo.field = 'IND_SECTOR';
    component.dataSet = [{
      label: 'Total',
      data: [
        { x: '01-Sep-21', y: 4 },
        { x: '01-Aug-21', y: 12 },
      ]
    },{
      label: 'Mining',
      data: [
        { x: '01-Sep-21', y: 2 },
        { x: '01-Aug-21', y: 6 },
      ]
    },{
      fill: false,
      label: 'Chemical industry',
      data: [
        { x: '01-Sep-21', y: 2 },
        { x: '01-Aug-21', y: 6 },
      ]
    }] as any;
    spyOn(widgetService, 'downloadCSV');
    component.downloadCSV();
    expect(widgetService.downloadCSV).toHaveBeenCalled();
  }));

  it('transformForStepWiseData(),  transformForStepWiseData', async(() => {
    component.userDetails = { selfServiceUserModel: { timeZone: 'Asia' }, defLocs: ['abc'] } as Userdetails;
    const data = { _shards: { total: 1, failed: 0, successful: 1, skipped: 0 }, hits: { hits: [], total: { value: 1221, relation: 'eq' }, max_score: null }, took: 3, timed_out: false, aggregations: { 'date_histogram#date': { buckets: [{ key_as_string: '04.00.2020', doc_count: 52, 'sterms#sla_step_wise': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 33, key: 'APP', 'sterms#steps':{buckets:[{doc_count:3,key:'01','sterms#within_1_day': {buckets:[{doc_count:3,key:'01'}]}}]}}, { doc_count: 19, key: 'INP','sterms#steps':{buckets:[{doc_count:3,key:'01','sterms#within_1_day': {buckets:[{doc_count:3,key:'01'}]}}]} }] }, key: 1588550400000 }, { key_as_string: '11.00.2020', doc_count: 46, 'sterms#sla_step_wise': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 33, key: 'APP','sterms#steps':{buckets:[{key:'01',doc_count:21,'sterms#within_1_day': {buckets:[{doc_count:3,key:'01'}]}}]} }, { doc_count: 13, key: 'INP' }] }, key: 1589155200000 }] } } };
    component.widgetInfo.field = 'STATUS';
    component.widgetInfo.chartProperties.showTotal = true;
    component.widgetInfo.chartProperties.dataSetSize = 1;
    component.filterCriteria = [{ fieldId: 'REQUESTOR_DATE', widgetType: WidgetType.TIMESERIES, conditionFieldValue: 'admin', conditionFieldId: 'REQUESTOR_DATE' } as Criteria]; // as Criteria[];
    component.transformForStepWiseData(data);
    expect(component.transformForStepWiseData).toBeTruthy();
  }));

  // it('transformDataForStepSizeBarChart(),  transformDataForStepSizeBarChart', async(() => {
  //   component.userDetails = { selfServiceUserModel: { timeZone: 'Asia' }, defLocs: ['abc'] } as Userdetails;
  //   const data = { _shards: { total: 1, failed: 0, successful: 1, skipped: 0 }, hits: { hits: [], total: { value: 1221, relation: 'eq' }, max_score: null }, took: 3, timed_out: false, aggregations: { 'date_histogram#date': { buckets: [{ key_as_string: '04.00.2020', doc_count: 52, 'sterms#sla_step_wise': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 33, key: 'APP', 'sterms#steps':{buckets:[{doc_count:3,key:'01','sterms#within_1_day': {buckets:[{doc_count:3,key:'01'}]}}]} }, { doc_count: 19, key: 'INP','sterms#steps':{buckets:[{doc_count:3,key:'01','sterms#within_1_day': {buckets:[{doc_count:3,key:'01'}]}}]} }] }, key: 1588550400000 }, { key_as_string: '11.00.2020', doc_count: 46, 'sterms#sla_step_wise': { doc_count_error_upper_bound: 0, sum_other_doc_count: 0, buckets: [{ doc_count: 33, key: 'APP','sterms#steps':{buckets:[{key:'01',doc_count:21,'sterms#within_1_day': {buckets:[{doc_count:3,key:'01'}]}}]} }, { doc_count: 13, key: 'INP' }] }, key: 1589155200000 }] } } };
  //   component.widgetInfo.field = 'STATUS';
  //   component.widgetInfo.chartProperties.chartType = ChartType.BAR;
  //   component.widgetInfo.chartProperties.dataSetSize = 1;
  //   component.widgetInfo.chartProperties.showTotal = true;
  //   component.filterCriteria = [];// as Criteria[];
  //   component.transformDataForStepSizeBarChart(data);
  //   expect(component.transformDataForStepSizeBarChart).toBeTruthy();
  // }));

  it('downloadImage()', async()=>{
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
    baseChart.data = { datasets: [{} as any] };
    component.chart = baseChart;
    spyOn(widgetService,'downloadImage').withArgs(component.chart.toBase64Image(),'Time-Series.png');
    component.downloadImage();
    expect(widgetService.downloadImage).toHaveBeenCalledWith(component.chart.toBase64Image(),'Time-Series.png');
  });

  it('getVisibleValues()', async()=>{
    component.filterCriteria = [];
    const chart = {scales:{'x-axis-0':{_table:[{time: '09 Aug,2021'},{time: '10 Aug, 2021'}]}}};
    component.getVisibleValues({chart});
    expect(component.emitpanAndClickevent).toBeTruthy();
  });


  it('getDataFormat()', async(() => {
    component.widgetInfo = {chartProperties: { seriesFormat: 'mmm-dd-yy' }  } as Widget;
    component.getDataFormat();
    expect(component.getDataFormat).toBeTruthy();
    expect(component.getDataFormat()).toEqual('MMM-DD-YY');

    component.widgetInfo = {chartProperties: { seriesFormat: 'dd-mmm-yy' }  } as Widget;
    component.getDataFormat();
    expect(component.getDataFormat).toBeTruthy();
    expect(component.getDataFormat()).toEqual('DD-MMM-YY');

    component.widgetInfo = {chartProperties: { seriesFormat: 'dd mmm, yy' }  } as Widget;
    component.getDataFormat();
    expect(component.getDataFormat).toBeTruthy();
    expect(component.getDataFormat()).toEqual('DD MMM, YY');

    component.widgetInfo = {chartProperties: { seriesFormat: 'mmm dd, yy' }  } as Widget;
    component.getDataFormat();
    expect(component.getDataFormat).toBeTruthy();
    expect(component.getDataFormat()).toEqual('MMM DD, YY');
  }));
});
