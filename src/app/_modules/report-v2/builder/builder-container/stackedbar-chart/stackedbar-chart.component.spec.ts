import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StackedbarChartComponent } from './stackedbar-chart.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Criteria, Orientation, OrderWith, WidgetColorPalette, Widget, WidgetType, DisplayCriteria, AggregationOperator, LegendPosition, DatalabelsPosition, ChartProperties, WidgetViewDetails, WidgetView, WidgetViewRequestPayload, WidgetViewPayload, WidgetAdditionalProperty } from '../../../_models/widget';
import { MatMenuModule } from '@angular/material/menu';
import { BaseChartDirective, ThemeService } from 'ng2-charts';
import { WidgetService } from 'src/app/_services/widgets/widget.service';
import { LegendItem } from 'chart.js';
import { MatDialog } from '@angular/material/dialog';
import { SharedModule } from '@modules/shared/shared.module';
import { MetadataModel } from '@models/schema/schemadetailstable';
import { of } from 'rxjs';
import { Userdetails } from '@models/userdetails';
import { ElementRef, NgZone } from '@angular/core';

export class MockNgZone extends NgZone {
  constructor() {
    super({ enableLongStackTrace: false });
  }
}
describe('StackedbarChartComponent', () => {
  let component: StackedbarChartComponent;
  let fixture: ComponentFixture<StackedbarChartComponent>;
  let htmlnative: HTMLElement;
  let widgetService: jasmine.SpyObj<WidgetService>;
  const zone: NgZone = new NgZone({ enableLongStackTrace: true });

  const mockMatDialogOpen = {
    open: jasmine.createSpy('open')
  };

  beforeEach(async(() => {
    const widgetServiceSpy = jasmine.createSpyObj(WidgetService, ['downloadCSV', 'getHeaderMetaData', 'getWidgetData', 'getDisplayCriteria']);
    TestBed.configureTestingModule({
      declarations: [StackedbarChartComponent],
      imports: [MdoUiLibraryModule, AppMaterialModuleForSpec, HttpClientTestingModule, MatMenuModule, SharedModule],
      providers: [
        { provide: WidgetService, userValue: widgetServiceSpy },
        {
          provide: MatDialog,
          useValue: mockMatDialogOpen
        }
      ]
    })
      .compileComponents();
    widgetService = TestBed.inject(WidgetService) as jasmine.SpyObj<WidgetService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StackedbarChartComponent);
    component = fixture.componentInstance;
    htmlnative = fixture.nativeElement;
    component.widgetInfo = new Widget();
    component.widgetInfo.chartProperties = new ChartProperties();
    component.userDetails = { defLocs: ['abc'] } as Userdetails;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('stackClickFilter(), should filter , after click on bar stack', async(() => {
    // call stack click with no argument then filter criteria should be [] array
    component.filterCriteria = [];
    component.stackClickFilter();
    expect(component.filterCriteria.length).toEqual(0);

    const array = [{ datasetIndex: 0, index: 0 }];
    component.stackbarLegend = [{ code: 'MATL_TYPE', legendIndex: 0, text: 'Material Type' }];
    component.stachbarAxis = [{ code: '10001', text: 'Mat 001 ', legendIndex: 0 }];
    component.widgetInfo.field = 'MATL_TYPE';
    component.widgetInfo.groupById = 'MATL_GROUP';
    component.filterCriteria = [{ fieldId: 'MATL_TYPE' } as Criteria, { fieldId: '10001' } as Criteria];

    // mock stacked
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone,new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementsAtEventForMode: (e: any) => [{ datasetIndex: 0, index: 0 } as any] } as any;
    component.chart = baseChart;
    component.stackClickFilter(null, array);
    // after apply filter criteria then filtercriteria length should be 1
    expect(component.filterCriteria.length).toEqual(4, 'after apply filter criteria then filtercriteria length should be 4');

    component.stackbarLegend = [{ code: 'GM', legendIndex: 0, text: 'GM' }];
    component.stachbarAxis = [{ code: 'no', text: 'No', legendIndex: 0 }];
    component.widgetInfo.field = 'CURRENTUSER';
    component.widgetInfo.groupById = 'CLAIMED';
    component.filterCriteria = [{ fieldId: 'CURRENTUSER', widgetType: WidgetType.STACKED_BAR_CHART, conditionFieldValue: 'admin' } as Criteria, { fieldId: 'CLAIMED', widgetType: WidgetType.STACKED_BAR_CHART, conditionFieldValue: 'yes' } as Criteria];
    component.widgetInfo.isEnableGlobalFilter = true;
    component.stackClickFilter(null, array);
    expect(component.filterCriteria.length).toEqual(2);

    component.stackbarLegend = [{ code: 'GM', legendIndex: 0, text: 'GM' }];
    component.stachbarAxis = [{ code: 'no', text: 'No', legendIndex: 0 }];
    component.widgetInfo.field = 'CURRENTUSER';
    component.widgetInfo.groupById = 'CLAIMED';
    component.filterCriteria = [];
    component.widgetInfo.isEnableGlobalFilter = true;
    component.stackClickFilter(null, array);
    expect(component.filterCriteria.length).toEqual(2);

    component.stackbarLegend = [{ code: 'Total', legendIndex: 0, text: 'Total' }];
    component.stachbarAxis = [{ code: 'Total', text: 'Total', legendIndex: 0 }];
    const res = component.stackClickFilter(null, array);
    expect(res).toBeFalse();
  }));


  it('getRandomColor(), Random Colour', async(() => {
    component.getRandomColor();
    // length should be 7
    expect(component.getRandomColor().length).toEqual(7);
    // should contains #
    expect(component.getRandomColor()).toContain('#');
  }));

  it('removeOldFilterCriteria(), remove olf filter criteria ', async(() => {
    const filter: Criteria = new Criteria();
    filter.conditionFieldId = 'MATL_TYPE';
    filter.conditionFieldValue = 'ZMRO';
    component.filterCriteria = [filter];
    component.removeOldFilterCriteria([filter]);
    expect(component.filterCriteria.length).toEqual(0, 'after remove filter criteria length should be 0');
  }));

  it('updateLabelsaxis1(), update axis label', async(() => {
    // create mock data
    const barChartLbl = ['Label 1', 'Label 2'];
    const lablDesc = { 'Label 1': 'Label 1 desc' };

    // asign to component variable
    component.barChartLabels = barChartLbl as string[];
    component.codeTextaxis1 = lablDesc;

    // call actual method
    component.updateLabelsaxis1();

    expect(barChartLbl.length).toEqual(component.barChartLabels.length, 'Bar chart labels length should equal');
    expect(lablDesc['Label 1']).toEqual(component.barChartLabels[0], 'Code description should equal');
    expect('Label 2').toEqual(component.barChartLabels[1], 'If description is not available then return code');


  }));


  it('updateLabelsaxis2(), update axis 2 labels', async(() => {
    // mock data
    const listxAxis2 = ['Label 1', 'Total'];
    component.barChartLabels = ['Label 1','Total'];
    component.codeTextaxis1 = {'Label 1':'Label 1',Total:'Total'};
    component.dataObj = {'Label 1':[1,2],Total: [1,2]};

    // assign to component variable
    component.listxAxis2 = listxAxis2;
    component.barChartData = [];
    component.widgetColorPalette = new WidgetColorPalette();

    // call actual component method
    component.updateLabelsaxis2();

    expect(listxAxis2.length).toEqual(component.barChartData.length, 'Bar chart data length equals to axis 2');

    component.widgetInfo.chartProperties.orientation = Orientation.HORIZONTAL;
    component.updateLabelsaxis2();
    expect(listxAxis2.length).toEqual(component.barChartData.length, 'Bar chart data length equals to axis 2');
  }));

  it('ngOnInit(),  should enable pre required on this component', async(() => {
    const res = [{ key: { CLAIMED: 'n', MASSPROCESSING_ID: '432651935700873253' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { CLAIMED: { vc: [{ c: 'n', t: 'No' }] }, MASSPROCESSING_ID: { vc: [{ c: '432651935700873253' }] } } } }] } } }, { key: { CLAIMED: 'n', MASSPROCESSING_ID: '432651935700873252' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { CLAIMED: { vc: [{ c: 'n', t: 'No' }] }, MASSPROCESSING_ID: { vc: [{ c: '432651935700873252', t: 'testing' }] } } } }] } } }]
    component.arrayBuckets = res;

    component.widgetId = 12345;
    component.widgetInfo.widgetType = WidgetType.STACKED_BAR_CHART;
    component.widgetInfo.widgetId = component.widgetId.toString();
    component.userDetails = { defLocs: ['abc'] } as Userdetails;
    component.widgetInfo.widgetAdditionalProperties = { displayCriteria: DisplayCriteria.CODE_TEXT } as WidgetAdditionalProperty;
    component.widgetInfo.widgetColorPalette = new WidgetColorPalette();
    const stack : any = {};
    component.stackBardata.next(stack);
    component.barChartData = [];
    spyOn(component,'getBarConfigurationData');
    spyOn(component,'getstackbarChartData');
    // spyOn(widgetService, 'getDisplayCriteria').withArgs(component.widgetInfo.widgetId, component.widgetInfo.widgetType).and.returnValue(of({propId:'626039146695',widgetId:12345,createdBy:'initiator',createdAt:1618442609,displayCriteria:'CODE_TEXT'}));
    component.ngOnInit();
    expect(component.stackbarLegend.length).toEqual(0, 'Initial stacked bar legend length should be 0');
    expect(component.stachbarAxis.length).toEqual(0, 'Initial stacked bar axis length should be 0');
    expect(component.barChartLabels.length).toEqual(0, 'Initial stack chart lebels length should 0');
    expect(component.listxAxis2.length).toEqual(0, 'Initial stack chart Axis2 length should 0');
    // expect(component.barChartData[0].data.length).toEqual(5, 'Initial stack chart data  length should 5');
    expect(component.displayCriteriaOption).toEqual(component.widgetInfo.widgetAdditionalProperties.displayCriteria);
    expect(component.widgetColorPalette).toEqual(component.widgetInfo.widgetColorPalette);
    // expect(widgetService.getDisplayCriteria).toHaveBeenCalledWith(component.widgetInfo.widgetId, WidgetType.STACKED_BAR_CHART);

    component.widgetInfo.groupById = 'MATL';
    component.widgetInfo.field = 'DAT'
    component.widgetInfo.objectType = '12345566';

    component.widgetInfo.groupByIdCtrl = {picklist: '0'} as any;
    component.widgetInfo.fieldCtrl = {picklist: '0'} as any;
    component.ngOnInit();
    expect(component.widgetColorPalette).toEqual(component.widgetInfo.widgetColorPalette);

    component.widgetInfo.groupByIdCtrl = {dataType: 'DTMS',picklist: '0'} as any;
    component.widgetInfo.fieldCtrl = {dataType: 'DTMS',picklist: '0'} as any;
    component.ngOnInit();
    expect(component.widgetColorPalette).toEqual(component.widgetInfo.widgetColorPalette);

    component.widgetInfo.groupByIdCtrl = {picklist: '30'} as any;
    component.widgetInfo.fieldCtrl = {picklist: '30'} as any;
    component.ngOnInit();
    expect(component.widgetColorPalette).toEqual(component.widgetInfo.widgetColorPalette);
  }));

  it('should show bar orienation based on orienation value', async(() => {
    component.isFetchingData = false;
    component.widgetInfo.chartProperties.orientation = Orientation.VERTICAL;
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone,new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementsAtEventForMode: (e: any) => [{ _datasetIndex: 0, index: 0 } as any] } as any;
    baseChart.chart.options = { scales: { x: {}, y: {} }, plugins:{} };
    baseChart.options = { scales: { x: {}, y: {} },plugins:{} };
    component.chart = baseChart;
    component.getBarConfigurationData();
    expect('bar').toBe(component.orientation);
  }));

  it('should have true value for showLegend flag then set legend position', async(() => {
    component.widgetInfo.chartProperties.isEnableLegend = true;
    component.widgetInfo.chartProperties.legendPosition = LegendPosition.top;
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone,new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementsAtEventForMode: (e: any) => [{ _datasetIndex: 0, _index: 0 } as any] } as any;
    baseChart.chart.options = { plugins:{},scales: { xAxes: {}, yAxes: {} } };
    baseChart.options = { plugins:{} };
    component.chart = baseChart;
    component.getBarConfigurationData();
    expect(component.widgetInfo.chartProperties.isEnableLegend).toBe(true);
    // expect(component.widgetInfo.chartProperties.legendPosition).toBe(component.chart.chart.options.plugins.legend.position);

  }));

  it('should have true value for showCountOnStack flag then set align and anchor position', async(() => {
    component.widgetInfo.chartProperties.isEnableDatalabels = true;
    component.widgetInfo.chartProperties.datalabelsPosition = DatalabelsPosition.center;
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementsAtEventForMode: (e: any) => [{ _datasetIndex: 0, _index: 0 } as any] } as any;
    baseChart.options = { plugins: { datalabels: {} }, scales: { xAxes: {}, yAxes: {} } };
    baseChart.chart.options = baseChart.options;
    component.chart = baseChart;
    component.getBarConfigurationData();
    expect(component.widgetInfo.chartProperties.isEnableDatalabels).toBe(true);
    expect(component.widgetInfo.chartProperties.datalabelsPosition).toBe(component.chart.chart.options.plugins.datalabels.align.toString());

  }));

  it('should have true value for displayAxisLable flag then set xAxisLable, yAxisLable', async(() => {
    component.widgetInfo.chartProperties.xAxisLabel = 'X';
    component.widgetInfo.chartProperties.yAxisLabel = 'Y';
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementsAtEventForMode: (e: any) => [{ _datasetIndex: 0, _index: 0 } as any] } as any;
    baseChart.chart.options = { scales: { x: {title:{}}, y: {title:{}} }, plugins:{} };
    baseChart.options = { scales: { xAxes: {}, yAxes: {} },  plugins:{} };
    component.chart = baseChart;
    // component.barChartOptions ={ plugins:{}};
    component.getBarConfigurationData();
    const title = 'title'
    expect(component.widgetInfo.chartProperties.xAxisLabel).toBe(component.chart.chart.options.scales.x[title].text);
    expect(component.widgetInfo.chartProperties.yAxisLabel).toBe(component.chart.chart.options.scales.y[title].text);
  }));

  it(`setChartAxisAndScaleRange(), should set chart axis and scale on chart option`, async(() => {
    // mock data
    component.widgetInfo.chartProperties.orderWith = OrderWith.ROW_ASC;
    component.widgetInfo.chartProperties.scaleFrom = 0;
    component.widgetInfo.chartProperties.scaleTo = 20;
    component.widgetInfo.chartProperties.stepSize = 4;
    component.widgetInfo.chartProperties.xAxisLabel = 'Material Type';
    component.widgetInfo.chartProperties.yAxisLabel = 'Value';
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementsAtEventForMode: (e: any) => [{ datasetIndex: 0, index: 0 } as any] } as any;
    baseChart.chart.options = { scales: { x: {}, y: {} } };
    baseChart.options = { scales: { x: {}, y: {} } };
    component.chart = baseChart;

    // const ticks = { min: component.widgetInfo.chartProperties.scaleFrom, max: component.widgetInfo.chartProperties.scaleTo, stepSize: component.widgetInfo.chartProperties.stepSize } as NestedTickOptions;
    // call actual component function
    component.setChartAxisAndScaleRange();
    const title = 'title';
    // asserts & expect
    // expect(component.chart.chart.options.scales.yAxes[0].ticks.min).toEqual(ticks.min);
    // expect(component.barChartOptions.scales.xAxes[0].ticks).toEqual(undefined);
    expect(component.chart.options.scales.y[title].text).toEqual(component.widgetInfo.chartProperties.yAxisLabel);
    expect(component.chart.options.scales.x[title].text).toEqual(component.widgetInfo.chartProperties.xAxisLabel);

    // scenario  2
    component.widgetInfo.chartProperties.orientation = Orientation.HORIZONTAL;

    // call actual component method
    component.setChartAxisAndScaleRange();

    // asserts & expect
    // expect(component.chart.chart.options.scales.yAxes[0].ticks.min).toEqual(ticks.min);
    // expect(component.barChartOptions.scales.yAxes[0].ticks).toEqual(undefined);
    expect(component.chart.options.scales.y[title].text).toEqual(component.widgetInfo.chartProperties.yAxisLabel);
    expect(component.chart.options.scales.x[title].text).toEqual(component.widgetInfo.chartProperties.xAxisLabel);

    // scenario  3
    component.widgetInfo.chartProperties.xAxisLabel = 'Data 1';
    component.widgetInfo.chartProperties.yAxisLabel = '';
    // call actual component method
    component.setChartAxisAndScaleRange();

    // asserts & expect
    // expect(component.barChartOptions.scales.xAxes[0].ticks).toEqual(undefined);
    // expect(component.barChartOptions.scales.yAxes[0].ticks).toEqual(undefined);
    expect(component.chart.options.scales.y[title].text).toEqual('');
    expect(component.chart.options.scales.x[title].text).toEqual(component.widgetInfo.chartProperties.xAxisLabel);
  }));


  it(`transformDataSets(), data transformation before rander on chart`, async(() => {
    // mock data
    component.widgetInfo.chartProperties.orderWith = OrderWith.ROW_ASC;
    component.widgetInfo.chartProperties.scaleFrom = 0;
    component.widgetInfo.chartProperties.scaleTo = 20;
    component.widgetInfo.chartProperties.stepSize = 4;
    component.widgetInfo.chartProperties.showTotal = false;
    component.filterCriteria = [];
    const resBuckets = [{ key: 'HAWA', doc_count: 10 }, { key: 'DEIN', doc_count: 3 }, { key: 'ZMRO', doc_count: 30 }];
    // call actual component method
    const actualResponse = component.transformDataSets(resBuckets);

    // expects
    expect(actualResponse.length).toEqual(2, `Data should be interval in scale range`);
    expect(actualResponse[0].doc_count).toEqual(10, `Small doc count should be on first position`);
    expect(actualResponse[1].doc_count).toEqual(3, `10 should be on second position`);

    // scenario  2
    component.widgetInfo.chartProperties.orderWith = OrderWith.ROW_DESC;
    component.widgetInfo.chartProperties.scaleTo = 30;
    component.widgetInfo.chartProperties.showTotal = true;

    // call actual component method
    const actualResponse01 = component.transformDataSets(resBuckets);
    // expects
    expect(actualResponse01.length).toEqual(6, `Data should be interval in scale range`);
    expect(actualResponse01[0].doc_count).toEqual(30, `Top or max doc count should be on first position`);
    expect(actualResponse01[1].doc_count).toEqual(3, `10 should be on second position`);


    // scenario  3
    component.widgetInfo.chartProperties.dataSetSize = 1;
    component.widgetInfo.chartProperties.showTotal = false

    // call actual component method
    const actualResponse1 = component.transformDataSets(resBuckets);

    expect(actualResponse1.length).toEqual(3, `After applied datasetSize length should be equals to dataSetSize`);

    component.widgetInfo.chartProperties.dataSetSize = 1;

    const actualResponse2 = component.transformDataSets(resBuckets);
    expect(actualResponse2.length).toEqual(3, `Data should be interval in scale range`);

    component.widgetInfo.chartProperties.orderWith = OrderWith.ROW_ASC;
    const actualResponse3 = component.transformDataSets(resBuckets);
    expect(actualResponse3.length).toEqual(3, `Data should be interval in scale range`);

    component.widgetInfo.chartProperties.orderWith = OrderWith.COL_ASC;
    const actualResponse4 = component.transformDataSets(resBuckets);
    expect(actualResponse4.length).toEqual(3, `Data should be interval in scale range`);

    component.widgetInfo.chartProperties.orderWith = OrderWith.COL_DESC;
    const actualResponse5 = component.transformDataSets(resBuckets);
    expect(actualResponse5.length).toEqual(3, `Data should be interval in scale range`);
  }));

  it('getFieldsMetadaDescaxis1(), get description of axis 1', async(() => {
    const res = [{ key: { CLAIMED: 'n', MASSPROCESSING_ID: '432651935700873253' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { CLAIMED: { vc: [{ c: 'n', t: 'No' }] }, MASSPROCESSING_ID: { vc: [{ c: '432651935700873253' }] } } } }] } } }, { key: { CLAIMED: 'n', MASSPROCESSING_ID: '432651935700873252' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { CLAIMED: { vc: [{ c: 'n', t: 'No' }] }, MASSPROCESSING_ID: { vc: [{ c: '432651935700873252', t: 'testing' }] } } } }] } } }]

    component.arrayBuckets = res;
    component.getFieldsMetadaDescaxis1('MASSPROCESSING_ID');

    expect(component.codeTextaxis1['432651935700873253']).toEqual('432651935700873253');
    expect(component.codeTextaxis1['432651935700873252']).toEqual('testing');

    const res1 = [{ key: { CLAIMED: 'n', OVERDUE: '1' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { CLAIMED: { vc: [{ c: 'n', t: 'No' }] }, OVERDUE: { vc: [{ c: '1' }] } } } }] } } }]

    component.arrayBuckets = res1;
    component.getFieldsMetadaDescaxis1('OVERDUE');

    expect(component.codeTextaxis1['1']).toEqual('Yes');
  }));

  it('getFieldsMetadaDescaxis2(), get description of axis 2', async(() => {
    const res = [{ key: { STATUS__C: '', LEVEL__C: 'level_1' }, 'top_hits#items': { hits: { hits: [{ _source: { hdvs: { STATUS__C: { vc: [{ c: '' }] }, LEVEL__C: { vc: [{ c: 'level_1' }] } } } }] } } }, { key: { STATUS__C: '', LEVEL__C: 'Level_3' }, 'top_hits#items': { hits: { hits: [{ _source: { hdvs: { STATUS__C: { vc: [{ c: '' }] }, LEVEL__C: { vc: [{ c: 'Level_3', t: 'Level 3' }] } } } }] } } }];

    component.arrayBuckets = res;
    component.getFieldsMetadaDescaxis2('LEVEL__C');

    expect(component.codeTextaxis2.level_1).toEqual('level_1');
    expect(component.codeTextaxis2.Level_3).toEqual('Level 3');

    const res1 = [{ key: { CLAIMED: 'n', OVERDUE: '1' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { CLAIMED: { vc: [{ c: 'n', t: 'No' }] }, OVERDUE: { vc: [{ c: '1' }] } } } }] } } }]

    component.arrayBuckets = res1;
    component.getFieldsMetadaDescaxis2('OVERDUE');

    expect(component.codeTextaxis2['1']).toEqual('Yes');

    const res2 = [{ key: { CLAIMED: 'n', OVERDUE: '1' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { CLAIMED: { vc: [{ c: 'n', t: 'No' }] }, OVERDUE: { vc: [{ c: '1' }] } } } }] } } }]

    component.arrayBuckets = res2;
    component.locale = '';
    component.getFieldsMetadaDescaxis2('OVERDUE');

    expect(component.codeTextaxis2['1']).toEqual('Yes');
  }));

  it('getDateFieldsDesc2(), get description of axis 2', async(() => {
    const res = [{ key: { STATUS__C: '', LEVEL__C: '' }, doc_count: 3, 'top_hits#items': { hits: { total: { value: 3, relation: 'eq' }, max_score: 1.0, hits: [{ _index: 'localhost_3901_do_0', _type: '_doc', _id: 'TEMP003', _score: 1.0, _source: { hdvs: { STATUS__C: { fId: 'STATUS__C', lls: { EN: { label: 'Status' } }, vls: { EN: { valueTxt: '' } }, vc: [{ c: '1600709041279' }] }, LEVEL__C: { fId: 'LEVEL__C', lls: { EN: { label: 'Level' } }, vls: { EN: { valueTxt: '' } }, vc: [{ c: '1600709041279' }] } } } }] } } }, { key: { STATUS__C: '', LEVEL__C: 'Level 3' }, doc_count: 2, 'top_hits#items': { hits: { total: { value: 2, relation: 'eq' }, max_score: 1.0, hits: [{ _index: 'localhost_3901_do_0', _type: '_doc', _id: 'TMP000000000000009', _score: 1.0, _source: { hdvs: { STATUS__C: { fId: 'STATUS__C', loc: '', lls: { EN: { label: 'Status' } }, ddv: [], msdv: [], vls: { EN: { valueTxt: '' } }, vc: [{ c: '' }] }, LEVEL__C: { fId: 'LEVEL__C', loc: '', lls: { EN: { label: 'Level' } }, ddv: [{ val: 'Level 3: $100K - $1MM', lang: 'EN' }], msdv: [], vls: { EN: { valueTxt: 'Level 3' } }, vc: [{ c: '1600709041279' }] } } } }] } } }];

    component.arrayBuckets = res;
    component.getDateFieldsDesc2('STATUS__C');

    expect(component.codeTextaxis1['']).toEqual(undefined);

    component.locale = '';
    expect(component.codeTextaxis1['']).toEqual(undefined);
  }));

  it('legendClick(), legend click ', async(() => {
    const item: LegendItem = { datasetIndex: 0 } as LegendItem;
    component.stackbarLegend = [{ code: 'MATL_TYPE', legendIndex: 0, text: 'Material Type' }];
    component.widgetInfo.field = 'MATL_TYPE';
    component.widgetInfo.chartProperties.blankValueAlias = 'MATL_TYPE';
    component.filterCriteria = [{ fieldId: 'MATL_TYPE' } as Criteria];

    component.legendClick(item);
    expect(component.filterCriteria.length).toEqual(2);

    component.filterCriteria = [];
    component.legendClick(item);
    expect(component.filterCriteria.length).toEqual(1);

    const legendItem1: LegendItem = { datasetIndex: 0 } as LegendItem;
    component.stackbarLegend = [{ code: 'GM', legendIndex: 0, text: 'GM' }];
    component.widgetInfo.field = 'CURRENTUSER';
    component.widgetInfo.chartProperties.blankValueAlias = '';
    component.filterCriteria = [{ fieldId: 'CURRENTUSER', widgetType: WidgetType.STACKED_BAR_CHART, conditionFieldValue: 'admin' } as Criteria];
    component.widgetInfo.isEnableGlobalFilter = true;
    component.legendClick(legendItem1);
    expect(component.filterCriteria.length).toEqual(1);
  }));

  it('openColorPalette(), should open color palette dialog', async(() => {
    component.widgetId = 72366423;
    component.reportId = 65631624;
    component.widgetInfo.widgetTitle = 'Stacked bar Chart';
    component.barChartData = [
      {
        fieldCode: 'HAWA',
        backgroundColor: '#f1f1f1',
        label: 'Hawa material'
      }
    ];
    component.openColorPalette();
    expect(mockMatDialogOpen.open).toHaveBeenCalled();
  }));

  it('updateColorBasedOnDefined(), update color based on defination ', async(() => {
    component.filterCriteria = [];
    const req: WidgetColorPalette = new WidgetColorPalette();
    req.widgetId = '23467283';

    component.updateColorBasedOnDefined(req);
    expect(component.widgetColorPalette.widgetId).toEqual(req.widgetId);

  }));

  it('getUpdatedColorCode(), get updated color based on code', async(() => {
    const req: WidgetColorPalette = new WidgetColorPalette();
    req.colorPalettes = [{
      code: 'HAWA',
      colorCode: '#f1f1f1',
      text: 'Hawa material'
    }];
    component.widgetColorPalette = req;
    const actualRes = component.getUpdatedColorCode('HAWA');
    expect(actualRes).toEqual('#f1f1f1');

  }));

  it('checkTextCode(), should return string from DisplayCriteria', async(() => {
    component.displayCriteriaOption = DisplayCriteria.TEXT;
    const test = { t: 'test', c: '1234' };
    let res = component.checkTextCode(test);
    expect(res).toEqual('test');

    component.displayCriteriaOption = DisplayCriteria.CODE;
    res = component.checkTextCode(test);
    expect(res).toEqual('1234');

    component.displayCriteriaOption = DisplayCriteria.CODE_TEXT;
    res = component.checkTextCode(test);
    expect(res).toEqual('1234 -- test');
  }));

  it('downloadCSV()', async(() => {
    // mock data
    component.widgetInfo.fieldCtrl = { fieldDescri: 'Creation Date', fieldId: 'DATECREATED' } as MetadataModel;
    component.widgetInfo.groupByIdCtrl = { fieldDescri: 'Status', fieldId: 'STATUS' } as MetadataModel;
    component.widgetInfo.field = 'DATECREATED';
    component.widgetInfo.groupById = 'STATUS';
    component.widgetInfo.aggregrationOp = AggregationOperator.GROUPBY;
    component.codeTextaxis2 = { 1557467445340: '5/10/2019' };
    component.codeTextaxis1 = { INP: 'INP' };

    component.arrayBuckets = [{ doc_count: 1738, key: { DATECREATED: 1557467445340, STATUS: 'INP' } }];
    const excelData = [{ 'Creation Date': '5/10/2019\t', Status: 'INP\t', Value: '1,738' }];
    spyOn(widgetService, 'downloadCSV');
    component.downloadCSV();

    // expect(widgetService.downloadCSV).toHaveBeenCalledWith('StackBar-Chart', excelData);
    expect(widgetService.downloadCSV).toHaveBeenCalled();
  }));

  it('ngOnChanges(), while change rule type', async(() => {
    // mock data
    const changes: import('@angular/core').SimpleChanges = { filterCriteria: { currentValue: true, previousValue: false, firstChange: null, isFirstChange: () => false }, boxSize: { currentValue: 35, previousValue: 26, firstChange: null, isFirstChange: null }, widgetInfo :{firstChange : null, isFirstChange : null, previousValue : null, currentValue :{field : 'MATL_GRP'}},isWidgetApiCall:{currentValue : true, previousValue : false, isFirstChange : () => false , firstChange :  null} };
    component.filterCriteria = [{fieldId: '__DIW_STATUS'} as Criteria];
    component.widgetInfo.isEnableGlobalFilter = true;
    spyOn(component, 'getstackbarChartData');
    spyOn(component, 'getBarConfigurationData');
    component.ngOnChanges(changes);
    expect(component.boxSize).toEqual(35);

    component.widgetInfo.isEnableGlobalFilter = false;
    component.ngOnChanges(changes);
    expect(component.getstackbarChartData).toHaveBeenCalled();

    const changes2: import('@angular/core').SimpleChanges = {};
    component.ngOnChanges(changes2);
    expect(component.ngOnChanges).toBeTruthy();
  }));

  it('sortByRow(), should sort by row', async(() => {
    // mock data
    component.widgetInfo.chartProperties.orderWith = OrderWith.ROW_ASC;
    component.widgetInfo.chartProperties.scaleFrom = 0;
    component.widgetInfo.chartProperties.scaleTo = 20;
    component.widgetInfo.chartProperties.stepSize = 4;
    component.widgetInfo.groupById = 'LNAME'

    const resBuckets = [{
      doc_count: 1039,
      key: { LNAME: 'User', FNAME: 'APP' },
      FNAME: 'APP',
      LNAME: 'User'
    },
    {
      doc_count: 1050,
      key: { LNAME: 'Logs', FNAME: 'Admin' },
      FNAME: 'Admin',
      LNAME: 'Logs',
    }
    ];
    // call actual component method
    const actualResponse = component.sortByRow('LNAME', resBuckets);

    // expects
    expect(actualResponse.length).toEqual(2, `Data should be interval in scale range`);
    expect(actualResponse[0].doc_count).toEqual(1039, `Small doc count should be on first position`);
    expect(actualResponse[1].doc_count).toEqual(1050, `10 should be on second position`);

  }));

  it('sortByColumnAsc(), should sort by row', async(() => {
    // mock data
    component.widgetInfo.chartProperties.orderWith = OrderWith.COL_ASC;
    component.widgetInfo.chartProperties.scaleFrom = 0;
    component.widgetInfo.chartProperties.scaleTo = 20;
    component.widgetInfo.chartProperties.stepSize = 4;
    component.widgetInfo.groupById = 'LNAME'

    const resBuckets = [{
      doc_count: 1039,
      key: { LNAME: 'User', FNAME: 'APP' },
      FNAME: 'APP',
      LNAME: 'User'
    },
    {
      doc_count: 1050,
      key: { LNAME: 'Logs', FNAME: 'Admin' },
      FNAME: 'Admin',
      LNAME: 'Logs',
    }
    ];
    // call actual component method
    const actualResponse = component.sortByColumnAsc('LNAME', resBuckets);

    // expects
    expect(actualResponse.length).toEqual(2, `Data should be interval in scale range`);
    expect(actualResponse[0].doc_count).toEqual(1050, `Small doc count should be on first position`);
    expect(actualResponse[1].doc_count).toEqual(1039, `10 should be on second position`);

  }));

  it('sortByColumnDesc(), should sort by row', async(() => {
    // mock data
    component.widgetInfo.chartProperties.orderWith = OrderWith.COL_DESC;
    component.widgetInfo.chartProperties.scaleFrom = 0;
    component.widgetInfo.chartProperties.scaleTo = 20;
    component.widgetInfo.groupById = 'LNAME'

    const resBuckets = [{
      doc_count: 1039,
      key: { LNAME: 'User', FNAME: 'APP' },
      FNAME: 'APP',
      LNAME: 'User'
    },
    {
      doc_count: 1050,
      key: { LNAME: 'Logs', FNAME: 'Admin' },
      FNAME: 'Admin',
      LNAME: 'Logs',
    }
    ];
    // call actual component method
    const actualResponse = component.sortByColumnDesc('LNAME', resBuckets);
    // expects
    expect(actualResponse.length).toEqual(2, `Data should be interval in scale range`);
    expect(actualResponse[0].doc_count).toEqual(1039, `Small doc count should be on first position`);
    expect(actualResponse[1].doc_count).toEqual(1050, `10 should be on second position`);

  }));

  it('getTableData(), get table data', async(() => {
    component.arrayBuckets = [{ key: 'ZMRO', doc_count: 30 },
    { key: 'DEIN', doc_count: 3 },
    { key: 'HAWA', doc_count: 10 }];
    component.widgetInfo.field = 'CURRENTUSER';
    component.widgetInfo.groupById = 'CLAIMED';
    component.getTableData();
    expect(component.displayedColumnsId.length).toEqual(3);
    expect(component.dataSource.length).toEqual(3);
  }));

  it('viewChange(), should be in table view', async(() => {
    component.filterCriteria = [];
    component.reportId = 87628687;
    component.widgetId = 27632;
    const response: WidgetViewDetails = {
      acknowledge: true,
      payload: {
        uuid: '',
        reportId: 87628687,
        widgetId: 27632,
        view: WidgetView.TABLE_VIEW,
        userName: 'string',
        tenantCode: 438748,
        createdAt: 4937837484,
        updatedAt: 478787
      }
    }

    const requestBody: WidgetViewRequestPayload = {
      uuid: '',
      reportId: 87628687,
      widgetId: 27632,
      view: WidgetView.GRAPH_VIEW
    }

    component.widgetViewDetails = {
      acknowledge: true,
      payload: {
        ...requestBody as WidgetViewPayload
      }
    }
    spyOn(widgetService, 'saveWidgetView').withArgs(requestBody).and.returnValue(of(response));
    component.viewChange(false);
    expect(widgetService.saveWidgetView).toHaveBeenCalledWith(requestBody);

    const response1: WidgetViewDetails = {
      acknowledge: true,
      payload: {
        uuid: '34232',
        reportId: 87628687,
        widgetId: 27632,
        view: WidgetView.TABLE_VIEW,
        userName: 'string',
        tenantCode: 438748,
        createdAt: 4937837484,
        updatedAt: 478787
      }
    }

    const requestBody1: WidgetViewRequestPayload = {
      uuid: '34232',
      reportId: 87628687,
      widgetId: 27632,
      view: WidgetView.TABLE_VIEW
    }

    component.widgetViewDetails = {
      acknowledge: true,
      payload: {
        ...requestBody1 as WidgetViewPayload
      }
    }

    spyOn(widgetService, 'updateWidgetView').withArgs(requestBody1).and.returnValue(of(response1));
    component.viewChange(true);
    expect(widgetService.updateWidgetView).toHaveBeenCalledWith(requestBody1);
  }))

  it('saveDisplayCriteria(), should call saveDisplayCriteria', async(() => {
    component.displayCriteriaOption = DisplayCriteria.TEXT;
    component.widgetInfo.field = 'DATECREATED';
    component.widgetId = 12345;
    component.widgetInfo.widgetType = WidgetType.FILTER;
    component.widgetInfo.widgetId = component.widgetId.toString();
    component.widgetViewDetails = { acknowledge: true, payload: { view: WidgetView.GRAPH_VIEW } as WidgetViewPayload };
    component.returnData = { aggregations: { 'sterms#BAR_CHART': { buckets: [{ doc_count: 1, key: 'IT', 'top_hits#items': { hits: { hits: [{ _source: { DATECREATED: { vc: [{ c: '1234567890' }] } } }] } } }, { doc_count: 1, key: 'I', 'top_hits#items': { hits: { hits: [{ _source: { DATECREATED: { vc: [{ c: '0987654321' }] } } }] } } }] } } };
    spyOn(widgetService, 'saveDisplayCriteria').withArgs(component.widgetInfo.widgetId, component.widgetInfo.widgetType, component.displayCriteriaOption).and.returnValue(of({}));

    component.saveDisplayCriteria();

    expect(widgetService.saveDisplayCriteria).toHaveBeenCalledWith('12345', WidgetType.FILTER, DisplayCriteria.TEXT);
  }));

  it('getDateFieldsDesc1()', async () => {
    const res = [{ key: '200010', doc_count: 10744, 'top_hits#items': { hits: { total: { value: 10744, relation: 'eq' }, max_score: 1.0, hits: [{ _source: { hdvs: { MATL_GROUP: { fId: 'MATL_GROUP', lls: { EN: { label: 'Material Group' } }, vls: { EN: { valueTxt: '200010' } }, vc: [{ c: '1600709041279' }] } } } }] } } }, { key: '200030', doc_count: 775, 'top_hits#items': { hits: { total: { value: 775, relation: 'eq' }, max_score: 1.0, hits: [{ _source: { hdvs: { MATL_GROUP: { fId: 'MATL_GROUP', lls: { EN: { label: 'Material Group' } }, vls: { EN: { valueTxt: '200030' } }, vc: [{ c: '1600709041279' }] } } } }] } } }];

    component.arrayBuckets = res;
    component.getDateFieldsDesc1('MATL_GROUP');
    expect(component.getDateFieldsDesc1).toBeTruthy();
  });

  it('getFieldsMetadaDescaxis1ForNonFld()', async () => {
    const res = [{ key: { STATUS__C: '', LEVEL__C: 'level_1' }, 'top_hits#items': { hits: { hits: [{ _source: { hdvs: { STATUS__C: { vc: [{ c: '' }] }, LEVEL__C: { vc: [{ c: 'level_1' }] } } } }] } } }, { key: { STATUS__C: '', LEVEL__C: 'Level_3' }, 'top_hits#items': { hits: { hits: [{ _source: { hdvs: { STATUS__C: { vc: [{ c: '' }] }, LEVEL__C: { vc: [{ c: 'Level_3', t: 'Level 3' }] } } } }] } } }];

    component.arrayBuckets = res;
    component.getFieldsMetadaDescaxis1ForNonFld('MATL_TYPE');
    expect(component.getFieldsMetadaDescaxis1ForNonFld).toBeTruthy();
  });

  it('getFieldsMetadaDescaxis2Nondef()', async () => {
    const res = [{ key: { STATUS__C: '', LEVEL__C: 'level_1' }, 'top_hits#items': { hits: { hits: [{ _source: { hdvs: { STATUS__C: { vc: [{ c: '' }] }, LEVEL__C: { vc: [{ c: 'level_1' }] } } } }] } } }, { key: { STATUS__C: '', LEVEL__C: 'Level_3' }, 'top_hits#items': { hits: { hits: [{ _source: { hdvs: { STATUS__C: { vc: [{ c: '' }] }, LEVEL__C: { vc: [{ c: 'Level_3', t: 'Level 3' }] } } } }] } } }];

    component.arrayBuckets = res;
    component.getFieldsMetadaDescaxis2Nondef('MATL_TYPE');
    expect(component.getFieldsMetadaDescaxis2Nondef).toBeTruthy();
  });

  // it('downloadImage()', async()=>{
  //   const canvas = document.createElement('canvas');
  //   htmlnative.append(canvas);
  //   const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
  //   const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
  //   baseChart.data = { datasets: [{} as any] };
  //   component.imageChart = baseChart;
  //   spyOn(widgetService,'downloadImage').withArgs(component.imageChart.toBase64Image(),'StackBar-Chart.png');
  //   component.downloadImage();
  //   expect(widgetService.downloadImage).toHaveBeenCalledWith(component.imageChart.toBase64Image(),'StackBar-Chart.png');
  // });

  it('should show bench mark value', async(() => {
    component.widgetInfo.chartProperties.isEnableBenchMark = true;
    component.widgetInfo.chartProperties.benchMarkValue = 1200;
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementsAtEventForMode: (e: any) => [{ _datasetIndex: 0, _index: 0 } as any] } as any;
    baseChart.options = { plugins: { annotation: {annotations: {}} }, scales: { xAxes: {}, yAxes: {} } };
    baseChart.chart.options = baseChart.options;
    component.chart = baseChart;
    component.getBarConfigurationData();
    expect(component.widgetInfo.chartProperties.isEnableBenchMark).toBe(true);
    expect(component.widgetInfo.chartProperties.benchMarkValue).toBe(component.chart.chart.options.plugins.annotation.annotations[0].value);

    component.widgetInfo.chartProperties.orientation = Orientation.VERTICAL;
    component.getBarConfigurationData();
    expect(component.widgetInfo.chartProperties.isEnableBenchMark).toBe(true);
    expect(component.widgetInfo.chartProperties.benchMarkValue).toBe(component.chart.chart.options.plugins.annotation.annotations[0].value);
  }));

  // it('changeScaleTicks(), method to change scales label for image download', async() => {
  //   const canvas = document.createElement('canvas');
  //   htmlnative.append(canvas);
  //   const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
  //   const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
  //   baseChart.chart = { canvas: eleRef, getElementsAtEventForMode: (e: any) => [{ datasetIndex: 0, index: 0 } as any] } as any;
  //   baseChart.chart.options = { scales: { x: {}, y: {} } };
  //   baseChart.options = { scales: { x: {}, y: {} } };
  //   component.imageChart = baseChart;

  //   component.widgetInfo.chartProperties.orientation = Orientation.HORIZONTAL;
  //   component.barChartLabels = ['Label 1','Total'];

  //   component.changeScaleTicks(true);
  //   expect(component.changeScaleTicks).toBeTruthy();

  //   component.changeScaleTicks(false);
  //   expect(component.changeScaleTicks).toBeTruthy();

  //   component.widgetInfo.chartProperties.orientation = Orientation.VERTICAL;

  //   component.changeScaleTicks(true);
  //   expect(component.changeScaleTicks).toBeTruthy();

  //   component.changeScaleTicks(false);
  //   expect(component.changeScaleTicks).toBeTruthy();
  // });
});
