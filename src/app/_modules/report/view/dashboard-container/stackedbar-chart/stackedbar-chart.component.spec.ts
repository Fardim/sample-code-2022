import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StackedbarChartComponent } from './stackedbar-chart.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StackBarChartWidget, Criteria, WidgetHeader, PositionType, AlignPosition, AnchorAlignPosition, Orientation, OrderWith, WidgetColorPalette, Widget, WidgetType, DisplayCriteria, AggregationOperator, WidgetViewDetails, WidgetView, WidgetViewRequestPayload, WidgetViewPayload } from '../../../_models/widget';
import { BehaviorSubject, of } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { BaseChartDirective, ThemeService } from 'ng2-charts';
import { WidgetService } from 'src/app/_services/widgets/widget.service';
import { LegendItem } from 'chart.js';
import { MatDialog } from '@angular/material/dialog';
import { SharedModule } from '@modules/shared/shared.module';
import { MetadataModel } from '@models/schema/schemadetailstable';
import { ElementRef, NgZone } from '@angular/core';
import { Userdetails } from '@models/userdetails';

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
        },
        { provide: NgZone, useClass: MockNgZone }
      ]
    })
      .compileComponents();
    widgetService = TestBed.inject(WidgetService) as jasmine.SpyObj<WidgetService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StackedbarChartComponent);
    component = fixture.componentInstance;
    htmlnative = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('stackClickFilter(), should filter , after click on bar stack', async(() => {
    // call stack click with no argument then filter criteria should be [] array
    component.filterCriteria = [];
    component.stackClickFilter();
    expect(component.filterCriteria.length).toEqual(0);

    const array = [{ _datasetIndex: 0, _index: 0 }];
    component.stackbarLegend = [{ code: 'MATL_TYPE', legendIndex: 0, text: 'Material Type' }];
    component.stachbarAxis = [{ code: '10001', text: 'Mat 001 ', legendIndex: 0 }];
    const chartWidget = new StackBarChartWidget();
    chartWidget.fieldId = 'MATL_TYPE';
    chartWidget.groupById = 'MATL_GROUP';
    component.stackBarWidget = new BehaviorSubject<StackBarChartWidget>(chartWidget);
    component.filterCriteria = [{ fieldId: 'MATL_TYPE' } as Criteria, { fieldId: '10001' } as Criteria];

    // mock stacked
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementsAtEventForMode: (e: any) => [{ _datasetIndex: 0, _index: 0 } as any] } as any;
    component.chart = baseChart;
    component.stackClickFilter(null, array);
    // after apply filter criteria then filtercriteria length should be 1
    expect(component.filterCriteria.length).toEqual(4, 'after apply filter criteria then filtercriteria length should be 2');

    component.stackbarLegend = [{ code: 'GM', legendIndex: 0, text: 'GM' }];
    component.stachbarAxis = [{ code: 'no', text: 'No', legendIndex: 0 }];
    const barWidget2: StackBarChartWidget = new StackBarChartWidget();
    barWidget2.fieldId = 'CURRENTUSER';
    barWidget2.groupById = 'CLAIMED';
    component.stackBarWidget.next(barWidget2);
    component.filterCriteria = [{ fieldId: 'CURRENTUSER', widgetType: WidgetType.STACKED_BAR_CHART, conditionFieldValue: 'admin' } as Criteria, { fieldId: 'CLAIMED', widgetType: WidgetType.STACKED_BAR_CHART, conditionFieldValue: 'yes' } as Criteria];
    component.widgetHeader = { isEnableGlobalFilter: true } as WidgetHeader;
    component.stackClickFilter(null, array);
    expect(component.filterCriteria.length).toEqual(2);

    component.stackbarLegend = [{ code: 'GM', legendIndex: 0, text: 'GM' }];
    component.stachbarAxis = [{ code: 'no', text: 'No', legendIndex: 0 }];
    const barWidget3: StackBarChartWidget = new StackBarChartWidget();
    barWidget3.fieldId = 'CURRENTUSER';
    barWidget3.groupById = 'CLAIMED';
    component.stackBarWidget.next(barWidget3);
    component.filterCriteria = [];
    component.widgetHeader = { isEnableGlobalFilter: true } as WidgetHeader;
    component.stackClickFilter(null, array);
    expect(component.filterCriteria.length).toEqual(2);
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
    component.barChartLabels = barChartLbl as any[];
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

    // assign to component variable
    component.listxAxis2 = listxAxis2;
    component.barChartData = [];
    component.widgetColorPalette = new WidgetColorPalette();
    component.dataObj = { 'Label 1': [], 'Label 2': [] }

    // call actual component method
    component.updateLabelsaxis2();

    expect(listxAxis2.length).toEqual(component.barChartData.length, 'Bar chart data length equals to axis 2');
  }));

  it('getHeaderMetaData(), should call header metadata api', async(() => {
    // mock data
    component.widgetId = 12345;
    const header = new WidgetHeader();
    spyOn(widgetService, 'getHeaderMetaData').
      withArgs(component.widgetId).and.returnValue(of(header));

    //  call actual componenet method
    component.getHeaderMetaData();
    expect(component.widgetHeader).toEqual(header);
  }));

  it('ngOnInit(),  should enable pre required on this component', async(() => {
    const res = [{ key: { CLAIMED: 'n', MASSPROCESSING_ID: '432651935700873253' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { CLAIMED: { vc: [{ c: 'n', t: 'No' }] }, MASSPROCESSING_ID: { vc: [{ c: '432651935700873253' }] } } } }] } } }, { key: { CLAIMED: 'n', MASSPROCESSING_ID: '432651935700873252' }, 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { CLAIMED: { vc: [{ c: 'n', t: 'No' }] }, MASSPROCESSING_ID: { vc: [{ c: '432651935700873252', t: 'testing' }] } } } }] } } }]
    component.arrayBuckets = res;
    component.widgetId = 12345;
    component.widgetInfo = new Widget();
    component.widgetInfo.widgetType = WidgetType.STACKED_BAR_CHART;
    component.widgetInfo.widgetId = component.widgetId.toString();
    component.stackBarWidget.next(new StackBarChartWidget());
    component.userDetails={defLocs:['abc']} as Userdetails;
    // spyOn(widgetService, 'getDisplayCriteria').withArgs(component.widgetInfo.widgetId, component.widgetInfo.widgetType).and.returnValue(of({propId:'626039146695',widgetId:12345,createdBy:'initiator',createdAt:1618442609,displayCriteria:'CODE_TEXT'}));
    component.ngOnInit();
    expect(component.stackbarLegend.length).toEqual(0, 'Initial stacked bar legend length should be 0');
    expect(component.stachbarAxis.length).toEqual(0, 'Initial stacked bar axis length should be 0');
    expect(component.barChartLabels.length).toEqual(0, 'Initial stack chart lebels length should 0');
    expect(component.listxAxis2.length).toEqual(0, 'Initial stack chart Axis2 length should 0');
    expect(component.barChartData[0].data.length).toEqual(5, 'Initial stack chart data  length should 1 ');
    // expect(widgetService.getDisplayCriteria).toHaveBeenCalledWith(component.widgetInfo.widgetId, WidgetType.STACKED_BAR_CHART);
  }));

  it('should show bar orienation based on orienation value', async(() => {
    const test = new StackBarChartWidget();
    test.orientation = Orientation.VERTICAL;
    component.stackBarWidget.next(test);
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementsAtEventForMode: (e: any) => [{ _datasetIndex: 0, _index: 0 } as any] } as any;
    baseChart.chart.options = { scales: { x: {}, y: {} } };
    baseChart.options = { scales: { x: {}, y: {} } };
    component.chart = baseChart;
    component.getBarConfigurationData();
    expect('bar').toBe(component.orientation);
  }));

  it('should have true value for showLegend flag then set legend position', async(() => {
    const test = new StackBarChartWidget();
    test.isEnableLegend = true;
    test.legendPosition = PositionType.TOP;
    component.stackBarWidget.next(test);
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementsAtEventForMode: (e: any) => [{ _datasetIndex: 0, _index: 0 } as any] } as any;
    baseChart.chart.options = { scales: { x: {}, y: {} }, plugins: {} };
    baseChart.options = { scales: { x: {}, y: {} }, plugins: {} }
    component.chart = baseChart;
    component.getBarConfigurationData();
    expect(component.stackBarWidget.getValue().isEnableLegend).toBe(true);
    // expect(component.stackBarWidget.getValue().legendPosition).toBe(component.chart.chart.options.plugins.legend.position);

  }));

  it('should have true value for showCountOnStack flag then set align and anchor position', async(() => {
    const test = new StackBarChartWidget();
    test.isEnableDatalabels = true;
    test.datalabelsPosition = AlignPosition.CENTER;
    test.anchorPosition = AnchorAlignPosition.CENTER;
    component.stackBarWidget.next(test);
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementAtEvent: (e: any) => [{ _datasetIndex: 0, _index: 0 } as any] } as any;
    baseChart.options = { plugins: { datalabels: {} }, scales: { x: {}, y: {} } };
    baseChart.chart.options = baseChart.options;
    component.chart = baseChart;
    component.getBarConfigurationData();
    expect(component.stackBarWidget.getValue().isEnableDatalabels).toBe(true);
    expect(component.stackBarWidget.getValue().datalabelsPosition).toBe(component.chart.chart.options.plugins.datalabels.align.toString());
    expect(component.stackBarWidget.getValue().anchorPosition).toBe(component.chart.chart.options.plugins.datalabels.anchor.toString());

  }));

  it('should have true value for displayAxisLable flag then set xAxisLable, yAxisLable', async(() => {
    const test = new StackBarChartWidget();
    test.displayAxisLabel = true;
    test.xAxisLabel = 'X';
    test.yAxisLabel = 'Y';
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    component.stackBarWidget.next(test);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementAtEvent: (e: any) => [{ _datasetIndex: 0, _index: 0 } as any] } as any;
    baseChart.chart.options = { scales: { x: {}, y: {} } };
    baseChart.options = { scales: { x: {}, y: {} } };
    component.chart = baseChart;
    const title = 'title';
    component.getBarConfigurationData();
    expect(component.stackBarWidget.getValue().displayAxisLabel).toBe(true);
    expect(component.stackBarWidget.getValue().xAxisLabel).toBe(component.chart.chart.options.scales.x[title].text);
    expect(component.stackBarWidget.getValue().yAxisLabel).toBe(component.chart.chart.options.scales.y[title].text);
  }));

  it(`setChartAxisAndScaleRange(), should set chart axis and scale on chart option`, async(() => {
    // mock data
    const barWidget = new StackBarChartWidget();
    barWidget.orderWith = OrderWith.ROW_ASC;
    barWidget.scaleFrom = 0;
    barWidget.scaleTo = 20;
    barWidget.stepSize = 4;
    barWidget.xAxisLabel = 'Material Type';
    barWidget.yAxisLabel = 'Value';
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    component.stackBarWidget.next(barWidget);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementAtEvent: (e: any) => [{ _datasetIndex: 0, _index: 0 } as any] } as any;
    baseChart.chart.options = { scales: { x: {}, y: {} } };
    baseChart.options = { scales: { x: {}, y: {} } }
    component.chart = baseChart;
    const title = 'title';
    // call actual component function
    component.setChartAxisAndScaleRange();

    // asserts & expect
    // expect(component.chart.chart.options.scales.y.ticks).toEqual(ticks);
    // expect(component.barChartOptions.scales.xAxes[0].ticks).toEqual(undefined);
    expect(component.chart.chart.options.scales.y[title].text).toEqual(barWidget.yAxisLabel);
    expect(component.chart.chart.options.scales.x[title].text).toEqual(barWidget.xAxisLabel);

    // scenario  2
    barWidget.orientation = Orientation.HORIZONTAL;
    component.stackBarWidget.next(barWidget);

    // call actual component method
    component.setChartAxisAndScaleRange();

    // asserts & expect
    // expect(component.chart.chart.options.scales.x.ticks).toEqual(ticks);
    // expect(component.barChartOptions.scales.yAxes[0].ticks).toEqual(undefined);
    expect(component.chart.chart.options.scales.y[title].text).toEqual(barWidget.yAxisLabel);
    expect(component.chart.chart.options.scales.x[title].text).toEqual(barWidget.xAxisLabel);

    // scenario  3
    const data = new StackBarChartWidget();
    data.xAxisLabel = 'Data 1';
    component.stackBarWidget.next(data);
    // call actual component method
    component.setChartAxisAndScaleRange();

    // asserts & expect
    // expect(component.barChartOptions.scales.xAxes[0].ticks).toEqual(undefined);
    // expect(component.barChartOptions.scales.yAxes[0].ticks).toEqual(undefined);
    expect(component.chart.chart.options.scales.y[title].text).toEqual('');
    expect(component.chart.chart.options.scales.x[title].text).toEqual(data.xAxisLabel);
  }));


  it(`transformDataSets(), data transformation before rander on chart`, async(() => {
    // mock data
    const barWidget = new StackBarChartWidget();
    barWidget.orderWith = OrderWith.ROW_ASC;
    barWidget.scaleFrom = 0;
    barWidget.scaleTo = 20;
    barWidget.stepSize = 4;
    barWidget.showTotal = false;
    component.stackBarWidget.next(barWidget);
    component.filterCriteria = [];
    const resBuckets = [{ key: 'HAWA', doc_count: 10 }, { key: 'DEIN', doc_count: 3 }, { key: 'ZMRO', doc_count: 30 }];
    // call actual component method
    const actualResponse = component.transformDataSets(resBuckets);

    // expects
    expect(actualResponse.length).toEqual(2, `Data should be interval in scale range`);
    expect(actualResponse[0].doc_count).toEqual(10, `Small doc count should be on first position`);
    expect(actualResponse[1].doc_count).toEqual(3, `10 should be on second position`);

    // scenario  2
    barWidget.orderWith = OrderWith.ROW_DESC;
    barWidget.scaleTo = 30;
    barWidget.showTotal = true;
    component.stackBarWidget.next(barWidget);

    // call actual component method
    const actualResponse01 = component.transformDataSets(resBuckets);
    // expects
    expect(actualResponse01.length).toEqual(6, `Data should be interval in scale range`);
    expect(actualResponse01[0].doc_count).toEqual(30, `Top or max doc count should be on first position`);
    expect(actualResponse01[1].doc_count).toEqual(3, `10 should be on second position`);


    // scenario  3
    barWidget.dataSetSize = 1;
    barWidget.showTotal = false
    component.stackBarWidget.next(barWidget);

    // call actual component method
    const actualResponse1 = component.transformDataSets(resBuckets);

    expect(actualResponse1.length).toEqual(3, `After applied datasetSize length should be equals to dataSetSize`);

    const barWidget1 = new StackBarChartWidget();
    barWidget1.dataSetSize = 1;
    component.stackBarWidget.next(barWidget1);

    const actualResponse2 = component.transformDataSets(resBuckets);
    expect(actualResponse2.length).toEqual(3, `Data should be interval in scale range`);

    const barWidget2 = new StackBarChartWidget();
    barWidget2.orderWith = OrderWith.ROW_ASC;
    component.stackBarWidget.next(barWidget2);
    const actualResponse3 = component.transformDataSets(resBuckets);
    expect(actualResponse3.length).toEqual(3, `Data should be interval in scale range`);

    const barWidget3 = new StackBarChartWidget();
    barWidget3.orderWith = OrderWith.COL_ASC;
    component.stackBarWidget.next(barWidget3);
    const actualResponse4 = component.transformDataSets(resBuckets);
    expect(actualResponse4.length).toEqual(3, `Data should be interval in scale range`);

    const barWidget4 = new StackBarChartWidget();
    barWidget4.orderWith = OrderWith.COL_DESC;
    component.stackBarWidget.next(barWidget4);
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
  }));

  it('getDateFieldsDesc2(), get description of axis 2', async(() => {
    const res = [{ key: { STATUS__C: '', LEVEL__C: '' }, doc_count: 3, 'top_hits#items': { hits: { total: { value: 3, relation: 'eq' }, max_score: 1.0, hits: [{ _index: 'localhost_3901_do_0', _type: '_doc', _id: 'TEMP003', _score: 1.0, _source: { hdvs: { STATUS__C: { fId: 'STATUS__C', lls: { EN: { label: 'Status' } }, vls: { EN: { valueTxt: '' } }, vc: [{ c: '1600709041279' }] }, LEVEL__C: { fId: 'LEVEL__C', lls: { EN: { label: 'Level' } }, vls: { EN: { valueTxt: '' } }, vc: [{ c: '1600709041279' }] } } } }] } } }, { key: { STATUS__C: '', LEVEL__C: 'Level 3' }, doc_count: 2, 'top_hits#items': { hits: { total: { value: 2, relation: 'eq' }, max_score: 1.0, hits: [{ _index: 'localhost_3901_do_0', _type: '_doc', _id: 'TMP000000000000009', _score: 1.0, _source: { hdvs: { STATUS__C: { fId: 'STATUS__C', loc: '', lls: { EN: { label: 'Status' } }, ddv: [], msdv: [], vls: { EN: { valueTxt: '' } }, vc: [{ c: '' }] }, LEVEL__C: { fId: 'LEVEL__C', loc: '', lls: { EN: { label: 'Level' } }, ddv: [{ val: 'Level 3: $100K - $1MM', lang: 'EN' }], msdv: [], vls: { EN: { valueTxt: 'Level 3' } }, vc: [{ c: '1600709041279' }] } } } }] } } }];

    component.arrayBuckets = res;
    component.getDateFieldsDesc2('STATUS__C');

    expect(component.codeTextaxis1['']).toEqual(undefined);


  }));

  it('legendClick(), legend click ', async(() => {
    const item: LegendItem = { datasetIndex: 0 } as LegendItem;
    component.stackbarLegend = [{ code: 'MATL_TYPE', legendIndex: 0, text: 'Material Type' }];
    const stackBarWidget: StackBarChartWidget = new StackBarChartWidget();
    stackBarWidget.fieldId = 'MATL_TYPE';
    stackBarWidget.blankValueAlias = 'MATL_TYPE';
    component.stackBarWidget.next(stackBarWidget);
    component.filterCriteria = [{ fieldId: 'MATL_TYPE' } as Criteria];

    component.legendClick(item);
    expect(component.filterCriteria.length).toEqual(2);

    component.filterCriteria = [];
    component.legendClick(item);
    expect(component.filterCriteria.length).toEqual(1);

    const legendItem1: LegendItem = { datasetIndex: 0 } as LegendItem;
    component.stackbarLegend = [{ code: 'GM', legendIndex: 0, text: 'GM' }];
    const barWidget2: StackBarChartWidget = new StackBarChartWidget();
    barWidget2.fieldId = 'CURRENTUSER';
    component.stackBarWidget.next(barWidget2);
    component.filterCriteria = [{ fieldId: 'CURRENTUSER', widgetType: WidgetType.STACKED_BAR_CHART, conditionFieldValue: 'admin' } as Criteria];
    component.widgetHeader = { isEnableGlobalFilter: true } as WidgetHeader;
    component.legendClick(legendItem1);
    expect(component.filterCriteria.length).toEqual(1);
  }));

  it('openColorPalette(), should open color palette dialog', async(() => {
    component.widgetId = 72366423;
    component.reportId = 65631624;
    component.widgetHeader = { desc: 'Stacked bar Chart' } as WidgetHeader;
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
    const barWidget = new StackBarChartWidget();
    barWidget.fieldIdMetaData = { fieldDescri: 'Creation Date', fieldId: 'DATECREATED' } as MetadataModel;
    barWidget.groupByIdMetaData = { fieldDescri: 'Status', fieldId: 'STATUS' } as MetadataModel;
    barWidget.fieldId = 'DATECREATED';
    barWidget.groupById = 'STATUS';
    barWidget.aggregationOperator = AggregationOperator.GROUPBY;
    component.stackBarWidget.next(barWidget);
    component.codeTextaxis2 = {1557467445340: '5/10/2019'};
    component.codeTextaxis1 = {INP: 'INP'};
    component.arrayBuckets = [{doc_count: 1738, key:{DATECREATED: 1557467445340,STATUS: 'INP'}}];
    const excelData = [{'Creation Date': '5/10/2019\t', Status: 'INP\t',Value: '1,738'}];
    spyOn(widgetService,'downloadCSV').withArgs('StackBar-Chart', excelData);
    component.downloadCSV();
    expect(widgetService.downloadCSV).toHaveBeenCalledWith('StackBar-Chart', excelData);
  }));

  it('ngOnChanges(), while change rule type', async(() => {
    // mock data
    const changes: import('@angular/core').SimpleChanges = { filterCriteria: { currentValue: true, previousValue: false, firstChange: null, isFirstChange: null }, boxSize: { currentValue: 35, previousValue: 26, firstChange: null, isFirstChange: null } };
    component.widgetHeader = { isEnableGlobalFilter: true } as WidgetHeader;
    component.ngOnChanges(changes);
    expect(component.boxSize).toEqual(35);

    component.widgetHeader = { isEnableGlobalFilter: false } as WidgetHeader;
    spyOn(component.stackBarWidget, 'next');
    component.ngOnChanges(changes);
    expect(component.stackBarWidget.next).toHaveBeenCalled();

    const changes2: import('@angular/core').SimpleChanges = {};
    component.ngOnChanges(changes2);
    expect(component.ngOnChanges).toBeTruthy();
  }));

  it('sortByRow(), should sort by row', async(() => {
    // mock data
    const barWidget = new StackBarChartWidget();
    barWidget.orderWith = OrderWith.ROW_ASC;
    barWidget.scaleFrom = 0;
    barWidget.scaleTo = 20;
    barWidget.stepSize = 4;
    barWidget.groupById = 'LNAME'
    component.stackBarWidget.next(barWidget);
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
    const barWidget = new StackBarChartWidget();
    barWidget.orderWith = OrderWith.COL_ASC;
    barWidget.scaleFrom = 0;
    barWidget.scaleTo = 20;
    barWidget.stepSize = 4;
    barWidget.groupById = 'LNAME'
    component.stackBarWidget.next(barWidget);
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
    const barWidget = new StackBarChartWidget();
    barWidget.orderWith = OrderWith.COL_DESC;
    barWidget.scaleFrom = 0;
    barWidget.scaleTo = 20;
    barWidget.groupById = 'LNAME'
    component.stackBarWidget.next(barWidget);
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
    const barWidget: StackBarChartWidget = new StackBarChartWidget();
    barWidget.fieldId = 'CURRENTUSER';
    barWidget.groupById = 'CLAIMED';
    component.stackBarWidget.next(barWidget);
    component.getTableData();
    expect(component.displayedColumnsId.length).toEqual(3);
    expect(component.dataSource.length).toEqual(3);
  }));

  it('viewChange(), should be in table view', async(() => {
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
      view: WidgetView.TABLE_VIEW
    }

    component.widgetViewDetails = {
      acknowledge : true,
      payload : {
        ...requestBody as WidgetViewPayload
      }
    }
    component.reportId = 87628687;
    component.widgetId = 27632;
    spyOn(widgetService, 'saveWidgetView').withArgs(requestBody).and.returnValue(of(response));
    component.viewChange(true);
    expect(component.viewChange).toBeTruthy();

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
      acknowledge : true,
      payload : {
        ...requestBody1 as WidgetViewPayload
      }
    }

    spyOn(widgetService, 'updateWidgetView').withArgs(requestBody1).and.returnValue(of(response1));
    component.viewChange(true);
    expect(component.viewChange).toBeTruthy();
  }))

  it('saveDisplayCriteria(), should call saveDisplayCriteria', async(()=> {
    component.displayCriteriaOption = DisplayCriteria.TEXT;
    const barWidget: StackBarChartWidget = new StackBarChartWidget();
    barWidget.fieldId = 'DATECREATED';
    component.stackBarWidget.next(barWidget);
    component.widgetId = 12345;
    component.widgetInfo = new Widget();
    component.widgetInfo.widgetType = WidgetType.FILTER;
    component.widgetInfo.widgetId = component.widgetId.toString();
    component.widgetViewDetails = {acknowledge:true,payload:{view: WidgetView.GRAPH_VIEW} as WidgetViewPayload};
    component.returnData = {aggregations:{'sterms#BAR_CHART':{buckets:[{doc_count:1,key:'IT','top_hits#items':{hits:{hits:[{_source:{DATECREATED:{vc:[{c:'1234567890'}]}}}]}}},{doc_count:1,key:'I','top_hits#items':{hits:{hits:[{_source:{DATECREATED:{vc:[{c:'0987654321'}]}}}]}}}]}}};
    spyOn(widgetService,'saveDisplayCriteria').withArgs(component.widgetInfo.widgetId, component.widgetInfo.widgetType, component.displayCriteriaOption).and.returnValue(of({}));

    component.saveDisplayCriteria();

    expect(widgetService.saveDisplayCriteria).toHaveBeenCalledWith('12345', WidgetType.FILTER, DisplayCriteria.TEXT);
  }));

  it('getDateFieldsDesc1()', async()=>{
    const res = [{ key: { STATUS__C: '', LEVEL__C: 'level_1' }, 'top_hits#items': { hits: { hits: [{ _source: { hdvs: { STATUS__C: { vc: [{ c: '' }] }, LEVEL__C: { vc: [{ c: 'level_1' }] } } } }] } } }, { key: { STATUS__C: '', LEVEL__C: 'Level_3' }, 'top_hits#items': { hits: { hits: [{ _source: { hdvs: { STATUS__C: { vc: [{ c: '' }] }, LEVEL__C: { vc: [{ c: 'Level_3', t: 'Level 3' }] } } } }] } } }];

    component.arrayBuckets = res;
    component.getDateFieldsDesc1('MATL_TYPE');
    expect(component.getDateFieldsDesc1).toBeTruthy();
  });

  it('getFieldsMetadaDescaxis1ForNonFld()', async()=>{
    const res = [{ key: { STATUS__C: '', LEVEL__C: 'level_1' }, 'top_hits#items': { hits: { hits: [{ _source: { hdvs: { STATUS__C: { vc: [{ c: '' }] }, LEVEL__C: { vc: [{ c: 'level_1' }] } } } }] } } }, { key: { STATUS__C: '', LEVEL__C: 'Level_3' }, 'top_hits#items': { hits: { hits: [{ _source: { hdvs: { STATUS__C: { vc: [{ c: '' }] }, LEVEL__C: { vc: [{ c: 'Level_3', t: 'Level 3' }] } } } }] } } }];

    component.arrayBuckets = res;
    component.getFieldsMetadaDescaxis1ForNonFld('MATL_TYPE');
    expect(component.getFieldsMetadaDescaxis1ForNonFld).toBeTruthy();
  });

  it('getFieldsMetadaDescaxis2Nondef()', async()=>{
    const res = [{ key: { STATUS__C: '', LEVEL__C: 'level_1' }, 'top_hits#items': { hits: { hits: [{ _source: { hdvs: { STATUS__C: { vc: [{ c: '' }] }, LEVEL__C: { vc: [{ c: 'level_1' }] } } } }] } } }, { key: { STATUS__C: '', LEVEL__C: 'Level_3' }, 'top_hits#items': { hits: { hits: [{ _source: { hdvs: { STATUS__C: { vc: [{ c: '' }] }, LEVEL__C: { vc: [{ c: 'Level_3', t: 'Level 3' }] } } } }] } } }];

    component.arrayBuckets = res;
    component.getFieldsMetadaDescaxis2Nondef('MATL_TYPE');
    expect(component.getFieldsMetadaDescaxis2Nondef).toBeTruthy();
  });

  it('downloadImage()', async()=>{
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
    baseChart.data = { datasets: [{} as any] };
    component.chart = baseChart;
    spyOn(widgetService,'downloadImage').withArgs(component.chart.toBase64Image(),'StackBar-Chart.png');
    component.downloadImage();
    expect(widgetService.downloadImage).toHaveBeenCalledWith(component.chart.toBase64Image(),'StackBar-Chart.png');
  });
});
