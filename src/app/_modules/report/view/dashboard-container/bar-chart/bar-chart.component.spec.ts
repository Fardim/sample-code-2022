import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BarChartComponent } from './bar-chart.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BarChartWidget, Orientation, OrderWith, WidgetHeader, WidgetColorPalette, Widget, Criteria, PositionType, AlignPosition, AnchorAlignPosition, WidgetType, DisplayCriteria, WidgetView, AssginedColor, WidgetViewPayload } from '../../../_models/widget';
import { of } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { BaseChartDirective, ThemeService } from 'ng2-charts';
import { WidgetService } from '@services/widgets/widget.service';
import { MetadataModel } from '@models/schema/schemadetailstable';
import { MatDialog } from '@angular/material/dialog';
import { SharedModule } from '@modules/shared/shared.module';
import { LegendItem } from 'chart.js';
import { ElementRef, NgZone } from '@angular/core';
import { Userdetails } from '@models/userdetails';
import { Buckets } from '@modules/report-v2/_models/widget';

export class MockNgZone extends NgZone {
  constructor() {
    super({ enableLongStackTrace: false });
  }
}

describe('BarChartComponent', () => {
  let component: BarChartComponent;
  let fixture: ComponentFixture<BarChartComponent>;
  let htmlnative: HTMLElement;
  let widgetService: WidgetService;
  const zone: NgZone = new NgZone({ enableLongStackTrace: true });

  const mockMatDialogOpen = {
    open: jasmine.createSpy('open')
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BarChartComponent, BaseChartDirective],
      imports: [MdoUiLibraryModule, AppMaterialModuleForSpec, HttpClientTestingModule, MatMenuModule, SharedModule],
      providers: [
        {
          provide: MatDialog,
          useValue: mockMatDialogOpen
        },
        { provide: NgZone, useClass: MockNgZone }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BarChartComponent);
    component = fixture.componentInstance;
    htmlnative = fixture.nativeElement;
    widgetService = fixture.debugElement.injector.get(WidgetService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('stackClickFilter(), should filter , after click on bar stack', async(() => {
    // call stack click with no argument then filter criteria should be [] array
    component.filterCriteria = [];
    component.stackClickFilter();
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    expect(component.filterCriteria.length).toEqual(0);

    // mock data
    const array = [{ datasetIndex: 0, element: {} as any, index: 0 }];
    component.chartLegend = [{ code: 'MATL_TYPE', legendIndex: 0, text: 'Material Type' }];
    const barWidget: BarChartWidget = new BarChartWidget();
    barWidget.fieldId = 'MATL_TYPE';
    barWidget.metaData = { dataType: '1' } as MetadataModel;
    barWidget.blankValueAlias = 'MATL_TYPE';
    component.barWidget.next(barWidget);
    component.filterCriteria = [{ fieldId: 'MATL_TYPE' } as Criteria];

    // mock chart
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementsAtEventForMode: (e: any) => [{ _datasetIndex: 0, _index: 0 } as any] } as any;
    component.chart = baseChart;
    component.stackClickFilter(null, array);
    // after apply filter criteria then filtercriteria length should be 1
    expect(component.filterCriteria.length).toEqual(1, 'after apply filter criteria then filtercriteria length should be 1');

    component.chartLegend = [{ code: 'REQUESTOR_DATE', legendIndex: 0, text: 'REQUESTOR DATE' }];
    const barWidget1: BarChartWidget = new BarChartWidget();
    barWidget1.fieldId = 'REQUESTOR_DATE';
    barWidget1.metaData = { dataType: 'DTMS' } as MetadataModel;
    component.barWidget.next(barWidget1);
    component.stackClickFilter(null, array);
    expect(component.filterCriteria.length).toEqual(1);

    component.chartLegend = [{ code: 'GM', legendIndex: 0, text: 'GM' }];
    const barWidget2: BarChartWidget = new BarChartWidget();
    barWidget2.fieldId = 'CURRENTUSER';
    barWidget2.metaData = { dataType: 'CHAR' } as MetadataModel;
    component.barWidget.next(barWidget2);
    component.filterCriteria = [{ fieldId: 'CURRENTUSER', widgetType: WidgetType.BAR_CHART, conditionFieldValue: 'admin' } as Criteria];
    component.widgetHeader = { isEnableGlobalFilter: true } as WidgetHeader;
    component.stackClickFilter(null, array);
    expect(component.filterCriteria.length).toEqual(1);
  }));

  it('should show bar orienation based on orienation value', async(() => {
    const test = new BarChartWidget();
    test.orientation = Orientation.HORIZONTAL;
    test.legendPosition = PositionType.TOP;
    component.barWidget.next(test);
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementAtEvent: (e: any) => [{ _datasetIndex: 0, _index: 0 } as any] } as any;
    baseChart.chart.options = { scales: { xAxes: {}, yAxes: {} } };
    baseChart.options = { scales: { xAxes: {}, yAxes: {} } };
    component.chart = baseChart;
    component.getBarConfigurationData();
    expect('horizontalBar').toBe(component.orientation);
    expect(component.barChartOptions.plugins.zoom.pan.enabled).toBeFalsy();
    expect(component.barChartOptions.plugins.zoom.zoom.wheel.enabled).toBeFalsy();
  }));

  it('should have true value for showLegend flag then set legend position', async(() => {
    const test = new BarChartWidget();
    test.orientation = Orientation.VERTICAL;
    test.isEnableLegend = true;
    test.legendPosition = PositionType.TOP;
    component.barWidget.next(test);
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementAtEvent: (e: any) => [{ _datasetIndex: 0, _index: 0 } as any] } as any;
    baseChart.chart.options = { scales: { xAxes: {}, yAxes: {} }, plugins: {} };
    baseChart.options = { scales: { xAxes: {}, yAxes: {} }, plugins: {} };
    component.chart = baseChart;
    component.getBarConfigurationData();
    // expect(component.barWidget.getValue().isEnableLegend).toBe(component.chart.chart.options.position.legend.display);
    // expect(component.barWidget.getValue().legendPosition).toBe(component.chart.chart.options.legend.position);
    expect(component.barChartOptions.plugins.zoom.pan.enabled).toBeTruthy();
    expect(component.barChartOptions.plugins.zoom.zoom.wheel.enabled).toBeTruthy();
  }));

  it('should have true value for showCountOnStack flag then set align and anchor position', async(() => {
    const test = new BarChartWidget();
    test.isEnableDatalabels = true;
    test.datalabelsPosition = AlignPosition.CENTER;
    test.anchorPosition = AnchorAlignPosition.CENTER
    component.barWidget.next(test);
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementAtEvent: (e: any) => [{ _datasetIndex: 0, _index: 0 } as any] } as any;
    baseChart.options = { plugins: { datalabels: {} }, scales: { xAxes: {}, yAxes: {} } };
    baseChart.chart.options = baseChart.options;
    component.chart = baseChart;
    component.getBarConfigurationData();
    expect(component.barWidget.getValue().isEnableDatalabels).toBe(true);
    expect(component.barWidget.getValue().datalabelsPosition).toBe(component.chart.chart.options.plugins.datalabels.align.toString());
    expect(component.barWidget.getValue().anchorPosition).toBe(component.chart.chart.options.plugins.datalabels.anchor.toString());
  }));

  it('should have true value for displayAxisLable flag then set xAxisLabel, yAxisLabel', async(() => {
    const test = new BarChartWidget();
    test.displayAxisLabel = true;
    test.xAxisLabel = 'X-Axis';
    test.yAxisLabel = 'Y-Axis';
    component.barWidget.next(test);
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementAtEvent: (e: any) => [{ _datasetIndex: 0, _index: 0 } as any] } as any;
    baseChart.chart.options = { scales: { x: {}, y: {} } };
    baseChart.options = { scales: { x: {}, y: {} } };
    component.chart = baseChart;
    component.getBarConfigurationData();
    expect(component.barWidget.getValue().displayAxisLabel).toBe(true);
    const title = 'title';
    expect(component.barWidget.getValue().xAxisLabel).toBe(component.chart.chart.options.scales.x[title].text);
    expect(component.barWidget.getValue().yAxisLabel).toBe(component.chart.chart.options.scales.y[title].text);
  }));

  it(`setChartAxisAndScaleRange(), should set chart axis and scale on chart option`, async(() => {
    // mock data
    const barWidget = new BarChartWidget();
    barWidget.orderWith = OrderWith.ASC;
    barWidget.scaleFrom = 0;
    barWidget.scaleTo = 20;
    barWidget.stepSize = 4;
    barWidget.xAxisLabel = 'Material Type';
    barWidget.yAxisLabel = 'Value';
    component.barWidget.next(barWidget);
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementAtEvent: (e: any) => [{ _datasetIndex: 0, _index: 0 } as any] } as any;
    baseChart.chart.options = { scales: { x: {}, y: {} } };
    baseChart.options = { scales: { x: {}, y: {} } }
    component.chart = baseChart;
    const ticks = { stepSize: barWidget.stepSize };
    // call actual component function
    component.setChartAxisAndScaleRange();

    // asserts & expect
    const title = 'title';
    expect(component.chart.chart.options.scales.y.ticks).toEqual(ticks);
    expect(component.barChartOptions.scales.x.ticks).toEqual({ padding: 0 });
    expect(component.chart.chart.options.scales.y[title].text).toEqual(barWidget.yAxisLabel);
    expect(component.chart.chart.options.scales.x[title].text).toEqual(barWidget.xAxisLabel);

    // scenario  2
    barWidget.orientation = Orientation.HORIZONTAL;
    component.barWidget.next(barWidget);

    // call actual component method
    component.setChartAxisAndScaleRange();

    // asserts & expect
    expect(component.chart.chart.options.scales.x.ticks).toEqual(ticks);
    // expect(component.barChartOptions.scales.yAxes[0].ticks).toEqual(undefined);
    expect(component.chart.chart.options.scales.y[title].text).toEqual(barWidget.yAxisLabel);
    expect(component.chart.chart.options.scales.x[title].text).toEqual(barWidget.xAxisLabel);

    // scenario  3
    const data = new BarChartWidget();
    data.xAxisLabel = 'Data 1';
    component.barWidget.next(data);

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
    const barWidget = new BarChartWidget();
    barWidget.orderWith = OrderWith.ASC;
    barWidget.scaleFrom = 0;
    barWidget.scaleTo = 20;
    barWidget.stepSize = 4;
    component.filterCriteria = [];
    component.barWidget.next(barWidget);
    const resBuckets = [{ key: 'HAWA', doc_count: 10 }, { key: 'DEIN', doc_count: 3 }, { key: 'ZMRO', doc_count: 30 }]

    // call actual component method
    const actualResponse = component.transformDataSets(resBuckets);

    // expects
    expect(actualResponse.length).toEqual(2, `Data should be interval in scale range`);
    expect(component.lablels.length).toEqual(2, `Lablels length should be 2`);

    // scenario  2
    barWidget.dataSetSize = 1;
    barWidget.showTotal = true;
    component.barWidget.next(barWidget);

    // call actual component method
    const actualResponse1 = component.transformDataSets(resBuckets);
    // console.log('actual response===',actualResponse1);
    expect(actualResponse1.length).toEqual(2, `After applied datasetSize length should be equals to dataSetSize`);


  }));

  it('getFieldsMetadaDesc(), get description of field', async(() => {
    const buckets = [{ key: '200010', doc_count: 10744, 'top_hits#items': { hits: { total: { value: 10744, relation: 'eq' }, max_score: 1.0, hits: [{ _source: { hdvs: { MATL_GROUP: { fId: 'MATL_GROUP', lls: { EN: { label: 'Material Group' } }, vls: { EN: { valueTxt: '200010' } }, vc: [{ c: '200010', t: 'testing' }] } } } }] } } }, { key: '200030', doc_count: 775, 'top_hits#items': { hits: { total: { value: 775, relation: 'eq' }, max_score: 1.0, hits: [{ _source: { staticFields: { MATL_GROUP: { fId: 'MATL_GROUP', lls: { EN: { label: 'Material Group' } }, vls: { EN: { valueTxt: '200030' } }, vc: [{ c: '200030' }] } } } }] } } }];

    const dat: BarChartWidget = new BarChartWidget();
    dat.fieldId = 'MATL_GROUP';
    dat.metaData = {picklist: '35'} as MetadataModel;
    component.barWidget.next(dat);
    component.lablels = [];
    component.getFieldsMetadaDesc(buckets);
    expect(component.chartLegend.length).toEqual(2);

    const data: BarChartWidget = new BarChartWidget();
    data.fieldId = 'MATL_GROUP';
    component.barWidget.next(data);
    component.lablels = ['testing', '200030'];
    // call actual method
    component.getFieldsMetadaDesc(buckets);

    expect(component.lablels.length).toEqual(4);
    expect(component.chartLegend.length).toEqual(4);

    const buckets1 = [{ key: '200030', 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { OVERDUE: { vc: [{ c: '1' }] } } } }] } } }];
    const data1: BarChartWidget = new BarChartWidget();
    data1.fieldId = 'OVERDUE';
    component.barWidget.next(data1);
    component.lablels = ['YES'];
    // call actual method
    component.getFieldsMetadaDesc(buckets1);
    expect(component.lablels.length).toEqual(5);
    expect(component.chartLegend.length).toEqual(5);


    const buckets2 = [{ key: '200030', 'top_hits#items': { hits: { hits: [{ _source: { hdvs: { MAT_DESC: { vc: [{ c: 't', t: 'Test' }] } } } }] } } }];
    const data2: BarChartWidget = new BarChartWidget();
    data2.fieldId = 'MAT_DESC';
    data2.metaData = { fieldId: 'MAT_DESC', picklist: '1' } as MetadataModel;
    data2.showTotal = true;
    component.barWidget.next(data2);
    component.lablels = ['Test'];
    // call actual method
    component.getFieldsMetadaDesc(buckets2);

    expect(component.lablels.length).toEqual(7);
    expect(component.chartLegend.length).toEqual(7);
  }));

  it('getBarChartData(), get bar chart data', async(() => {
    const service = fixture.debugElement.injector.get(WidgetService);
    const buckets = { aggregations: { 'sterms#BAR_CHART': { buckets: [{ key: '200010', doc_count: 10744, 'top_hits#items': { hits: { total: { value: 10744, relation: 'eq' }, max_score: 1.0, hits: [{ _source: { hdvs: { MATL_GROUP: { fId: 'MATL_GROUP', lls: { EN: { label: 'Material Group' } }, vls: { EN: { valueTxt: '200010' } }, vc: [{ c: '27364237' }] } } } }] } } }, { key: '200030', doc_count: 775, 'top_hits#items': { hits: { total: { value: 775, relation: 'eq' }, max_score: 1.0, hits: [{ _source: { hdvs: { MATL_GROUP: { fId: 'MATL_GROUP', lls: { EN: { label: 'Material Group' } }, vls: { EN: { valueTxt: '200030' } }, vc: [{ c: '8326286' }] } } } }] } } }] } } };
    component.userDetails={defLocs:['abc']} as Userdetails;
    spyOn(service, 'getWidgetData').withArgs('653267432', [], '', '', '', component.userDetails.defLocs.toString()).and.returnValue(of(buckets));

    const barWidget: BarChartWidget = new BarChartWidget();
    barWidget.fieldId = 'MATL_GROUP';
    barWidget.metaData = { fieldId: 'MATL_GROUP', picklist: '30' } as MetadataModel;
    barWidget.showTotal = true;
    component.barWidget.next(barWidget);

    component.widgetInfo = new Widget();
    component.filterCriteria = [];
    component.getBarChartData(653267432, []);

    expect(service.getWidgetData).toHaveBeenCalledWith('653267432', [], '', '', '', component.userDetails.defLocs.toString());
  }));

  it('setBarChartData(), should get barChartData', async(() => {
    component.lablels = ['HERS -- Manufacturer Part', 'PMB -- PMB', 'Total -- Total'];
    component.dataSet = ['1', '99', '100'];
    component.chartLegend = [
      { text: 'Manufacturer Part', code: 'HERS', legendIndex: 0 },
      { text: 'PMB', code: 'PMB', legendIndex: 1 },
      { text: 'Total', code: 'Total', legendIndex: 2 }
    ];

    const barWidget: BarChartWidget = new BarChartWidget();
    barWidget.fieldId = 'MATL_GROUP';
    barWidget.metaData = { fieldId: 'MATL_GROUP', picklist: '30' } as MetadataModel;
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementAtEvent: (e: any) => [{ _datasetIndex: 0, _index: 0 } as any] } as any;
    component.chart = baseChart;
    component.barWidget.next(barWidget);

    component.widgetInfo = new Widget();
    component.setBarChartData();

    expect(component.barChartData[0].label).toEqual(component.lablels[0]);
    expect(component.barChartData[0].data).toEqual([{ x: 'HERS -- Manufacturer Part', y: 1 }, {}, {}]);

    expect(component.barChartData[1].label).toEqual(component.lablels[1]);
    expect(component.barChartData[1].data).toEqual([{}, { x: 'PMB -- PMB', y: 99 }, {}]);

    expect(component.barChartData[2].label).toEqual(component.lablels[2]);
    expect(component.barChartData[2].data).toEqual([{}, {}, { x: 'Total -- Total', y: 100 }]);
  }));

  it('openColorPalette(), should open color palette dialog', async(() => {
    component.widgetId = 72366423;
    component.reportId = 65631624;
    component.widgetHeader = { desc: 'Bar Chart' } as WidgetHeader;
    component.barChartData = [
      {
        // fieldCode: 'HAWA',
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
    req.colorPalettes = [{
      code: 'HAWA',
      colorCode: '#f1f1f1',
      text: 'Hawa material'
    }];

    component.updateColorBasedOnDefined(req);
    expect(component.widgetColorPalette.widgetId).toEqual(req.widgetId);
  }));

  it('getDateFieldsDesc(), get description of field', async(() => {
    const buckets = [{ key: '200010', doc_count: 10744, 'top_hits#items': { hits: { total: { value: 10744, relation: 'eq' }, max_score: 1.0, hits: [{ _source: { hdvs: { MATL_GROUP: { fId: 'MATL_GROUP', lls: { EN: { label: 'Material Group' } }, vls: { EN: { valueTxt: '200010' } }, vc: [{ c: '1600709041279' }] } } } }] } } }, { key: '200030', doc_count: 775, 'top_hits#items': { hits: { total: { value: 775, relation: 'eq' }, max_score: 1.0, hits: [{ _source: { hdvs: { MATL_GROUP: { fId: 'MATL_GROUP', lls: { EN: { label: 'Material Group' } }, vls: { EN: { valueTxt: '200030' } }, vc: [{ c: '1600709041279' }] } } } }] } } }];

    const dat: BarChartWidget = new BarChartWidget();
    dat.fieldId = 'MATL_GROUP';
    dat.metaData = {picklist: '35'} as MetadataModel;
    component.barWidget.next(dat);
    component.lablels = [];
    component.getDateFieldsDesc(buckets);
    expect(component.chartLegend.length).toEqual(0);

    const data: BarChartWidget = new BarChartWidget();
    data.fieldId = 'MATL_GROUP';
    component.barWidget.next(data);
    component.lablels = ['200010', '200030'];
    // call actual method
    component.getDateFieldsDesc(buckets);

    expect(component.lablels.length).toEqual(2);
    expect(component.chartLegend.length).toEqual(2);
  }));

  it('ngOnChanges(), while change rule type', async(() => {
    // mock data
    const changes: import('@angular/core').SimpleChanges = { filterCriteria: { currentValue: true, previousValue: false, firstChange: null, isFirstChange: null }, boxSize: { currentValue: 35, previousValue: 26, firstChange: null, isFirstChange: null } };
    component.widgetHeader = { isEnableGlobalFilter: true } as WidgetHeader;
    component.ngOnChanges(changes);
    expect(component.boxSize).toEqual(35);

    component.widgetHeader = { isEnableGlobalFilter: false } as WidgetHeader;
    component.ngOnChanges(changes);
    expect(component.lablels.length).toEqual(0);

    const changes2: import('@angular/core').SimpleChanges = {};
    component.ngOnChanges(changes2);
    expect(component.ngOnChanges).toBeTruthy();
  }));

  it('legendClick(), legend click ', async(() => {
    const item: LegendItem = { datasetIndex: 0 } as LegendItem;
    component.chartLegend = [{ code: 'MATL_TYPE', legendIndex: 0, text: 'Material Type' }];
    const barWidget: BarChartWidget = new BarChartWidget();
    barWidget.fieldId = 'MATL_TYPE';
    barWidget.metaData = { dataType: '1' } as MetadataModel;
    barWidget.blankValueAlias = 'MATL_TYPE';
    component.barWidget.next(barWidget);
    component.filterCriteria = [{ fieldId: 'MATL_TYPE' } as Criteria];
    component.legendClick(item);
    expect(component.filterCriteria.length).toEqual(2);

    component.filterCriteria = [];
    component.legendClick(item);
    expect(component.filterCriteria.length).toEqual(1);

    const legendItem: LegendItem = { datasetIndex: 0 } as LegendItem;
    component.chartLegend = [{ code: 'REQUESTOR_DATE', legendIndex: 0, text: 'REQUESTOR DATE' }];
    const barWidget1: BarChartWidget = new BarChartWidget();
    barWidget1.fieldId = 'REQUESTOR_DATE';
    barWidget1.metaData = { dataType: 'DTMS' } as MetadataModel;
    component.barWidget.next(barWidget1);
    component.legendClick(legendItem);
    expect(component.filterCriteria.length).toEqual(2);

    const legendItem1: LegendItem = { datasetIndex: 0 } as LegendItem;
    component.chartLegend = [{ code: 'GM', legendIndex: 0, text: 'GM' }];
    const barWidget2: BarChartWidget = new BarChartWidget();
    barWidget2.fieldId = 'CURRENTUSER';
    barWidget2.metaData = { dataType: 'CHAR' } as MetadataModel;
    component.barWidget.next(barWidget2);
    component.filterCriteria = [{ fieldId: 'CURRENTUSER', widgetType: WidgetType.BAR_CHART, conditionFieldValue: 'admin' } as Criteria];
    component.widgetHeader = { isEnableGlobalFilter: true } as WidgetHeader;
    component.legendClick(legendItem1);
    expect(component.filterCriteria.length).toEqual(1);
  }));

  it('applyDateFilter()', async(() => {
    const startDate = '1588204800000';
    const fieldId = 'REQUESTOR_DATE';
    const res = component.applyDateFilter(startDate, fieldId);
    expect(res.conditionFieldEndValue).toEqual('1588291200000');
  }));

  it('ngOnInit(), check the prerequired stuff', async(() => {

    component.widgetInfo = { widgetId: '23156122', widgetType: WidgetType.BAR_CHART } as Widget;

    spyOn(component, 'getBarChartMetadata');
    spyOn(component, 'getHeaderMetaData');
    // spyOn(widgetService, 'getDisplayCriteria').withArgs(component.widgetInfo.widgetId, component.widgetInfo.widgetType).and.returnValue(of({displayCriteria: 'CODE'}));
    component.ngOnInit();

    expect(component.getBarChartMetadata).toHaveBeenCalled();
    expect(component.getHeaderMetaData).toHaveBeenCalled();
    // expect(widgetService.getDisplayCriteria).toHaveBeenCalledWith(component.widgetInfo.widgetId, component.widgetInfo.widgetType);
  }));

  it('getHeaderMetaData(), get header info for bar widget', async(() => {
    spyOn(widgetService, 'getHeaderMetaData').withArgs(component.widgetId).and.returnValue(of({ widgetId: 2423432 } as WidgetHeader));
    component.getHeaderMetaData();
    expect(widgetService.getHeaderMetaData).toHaveBeenCalledWith(component.widgetId);
    expect(component.widgetHeader.widgetId).toEqual(2423432);

  }));

  it('getBarChartMetadata(), get metadata for bar chart ', async(() => {
    spyOn(widgetService, 'getBarChartMetadata').withArgs(component.widgetId).and.returnValue(of({ widgetColorPalette: { reportId: '32423423' } } as BarChartWidget));
    spyOn(component, 'getBarConfigurationData');

    component.getBarChartMetadata();

    expect(widgetService.getBarChartMetadata).toHaveBeenCalledWith(component.widgetId);
    expect(component.getBarConfigurationData).toHaveBeenCalled();
    expect(component.widgetColorPalette.reportId).toEqual('32423423');

  }));

  it('getBarChartData(), get bar chart data', async(()=>{
    const service = fixture.debugElement.injector.get(WidgetService);
    const buckets = {aggregations:{'sterms#BAR_CHART':{},'nested#Nest_Bar':{doc_count:2,'sterms#BAR_CHART':{buckets:[{doc_count:1,key:'IT','top_hits#items':{hits:{hits:[{_source:{IND_SECTOR:{vc:[{c:'IT',t:'IT Industry'}]}}}]}}},{doc_count:1,key:'I','top_hits#items':{hits:{hits:[{_source:{IND_SECTOR:{vc:[{c:'I',t:'Mining Industry'}]}}}]}}}]}}}};
    component.userDetails={defLocs:['abc']} as Userdetails;
    spyOn(service,'getWidgetData').withArgs('653267432',[],'','','',component.userDetails.defLocs.toString()).and.returnValue(of(buckets));

    const barWidget: BarChartWidget = new BarChartWidget();
    barWidget.fieldId = 'IND_SECTOR';
    barWidget.metaData = {fieldId:'IND_SECTOR',picklist:'30'} as MetadataModel;

    component.barWidget.next(barWidget);

    component.widgetInfo = new Widget();
    component.getBarChartData(653267432, []);

    expect(service.getWidgetData).toHaveBeenCalledWith('653267432', [], '', '', '', component.userDetails.defLocs.toString());
  }));

  it('saveDisplayCriteria(), should call saveDisplayCriteria', async(()=> {
    component.displayCriteriaOption = DisplayCriteria.TEXT;
    const barWidget: BarChartWidget = new BarChartWidget();
    barWidget.fieldId = 'DATECREATED';
    barWidget.metaData = {fieldId:'DATECREATED',picklist:'0', dataType:'DTMS'} as MetadataModel;
    component.barWidget.next(barWidget);
    component.widgetId = 12345;
    component.widgetInfo = new Widget();
    component.widgetInfo.widgetType = WidgetType.FILTER;
    component.widgetInfo.widgetId = component.widgetId.toString();
    component.widgetViewDetails = {acknowledge:true,payload:{view: WidgetView.GRAPH_VIEW} as WidgetViewPayload};
    component.returndata = { aggregations: { 'sterms#BAR_CHART': { buckets: [{ doc_count: 1, key: 'IT', 'top_hits#items': { hits: { hits: [{ _source: { DATECREATED: { vc: [{ c: '1234567890' }] } } }] } } }, { doc_count: 1, key: 'I', 'top_hits#items': { hits: { hits: [{ _source: { DATECREATED: { vc: [{ c: '0987654321' }] } } }] } } }] } } };
    spyOn(widgetService, 'saveDisplayCriteria').withArgs(component.widgetInfo.widgetId, component.widgetInfo.widgetType, component.displayCriteriaOption).and.returnValue(of({}));

    component.saveDisplayCriteria();
    expect(widgetService.saveDisplayCriteria).toHaveBeenCalledWith('12345', WidgetType.FILTER, DisplayCriteria.TEXT);
  }));

  it('zoomOut()', async(() => {
    component.minBarWidth = 10;
    component.zoomStep = 5;
    component.orientation = 'horizontalBar';
    component.widgetInfo = { height: 25, width: 35 } as Widget;
    component.dataSet = [];
    component.zoomOut();

    expect(component.computedSize.height).toEqual(25);
  }));
  it('sortBarChartData(), should sort bar chart ', async(() => {
    const buckets = [
      {
        doc_count: '120804',
        key: '00104',
        'top_hits#items': {
          hits: {
            hits: [
              {
                _index: 'dev-classic.masterdataonline.com_1005_do_0_en',
                _type: '_doc',
                _source: {
                  hdvs: {
                    MATL_GROUP: {
                      vc: [
                        {
                          c: '00104',
                          t: 'Mechanics'
                        }
                      ]
                    }
                  }
                },
                _id: 'ERSA008053',
                _score: 1
              }
            ],
            total: {
              value: 120804,
              relation: 'eq'
            },
            max_score: 1
          }
        }
      },
      {
        doc_count: '160',
        key: '23153100',
        'top_hits#items': {
          hits: {
            hits: [
              {
                _index: 'dev-classic.masterdataonline.com_1005_do_0_en',
                _type: '_doc',
                _source: {
                  hdvs: {
                    MATL_GROUP: {
                      vc: [
                        {
                          c: '23153100',
                          t: 'Industrial Machinery'
                        }
                      ]
                    }
                  }
                },
                _id: 'ERSA120208',
                _score: 1
              }
            ],
            total: {
              value: 160,
              relation: 'eq'
            },
            max_score: 1
          }
        }
      }]
    const barWidget: BarChartWidget = new BarChartWidget();
    barWidget.fieldId = 'MATL_GROUP';
    barWidget.metaData = { dataType: '1' } as MetadataModel;
    barWidget.blankValueAlias = 'MATL_GROUP';
    barWidget.orderWith = OrderWith.ROW_ASC;
    barWidget.fieldId = 'MATL_GROUP';
    barWidget.metaData = { dataType: '1' } as MetadataModel;
    barWidget.blankValueAlias = 'MATL_GROUP';
    barWidget.orderWith = OrderWith.COL_ASC;
    component.barWidget.next(barWidget);
    component.displayCriteriaOption = DisplayCriteria.CODE;
    component.sortBarChartData(buckets as Buckets[]);
    expect(buckets).toBeDefined();

    barWidget.fieldId = 'MATL_GROUP';
    barWidget.metaData = { dataType: '1' } as MetadataModel;
    barWidget.blankValueAlias = 'MATL_GROUP';
    barWidget.orderWith = OrderWith.COL_DESC;
    component.barWidget.next(barWidget);
    component.sortBarChartData(buckets as Buckets[]);
    expect(buckets).toBeDefined();
  }));

  it('sortByColumn(), should sort bar chart by column ', async(() => {
    const buckets = [
      {
        doc_count: '120804',
        key: '00104',
        'top_hits#items': {
          hits: {
            hits: [
              {
                _index: 'dev-classic.masterdataonline.com_1005_do_0_en',
                _type: '_doc',
                _source: {
                  hdvs: {
                    MATL_GROUP: {
                      vc: [
                        {
                          c: '00104',
                          t: 'Mechanics'
                        }
                      ]
                    }
                  }
                },
                _id: 'ERSA008053',
                _score: 1
              }
            ],
            total: {
              value: 120804,
              relation: 'eq'
            },
            max_score: 1
          }
        }
      },
      {
        doc_count: '160',
        key: '23153100',
        'top_hits#items': {
          hits: {
            hits: [
              {
                _index: 'dev-classic.masterdataonline.com_1005_do_0_en',
                _type: '_doc',
                _source: {
                  hdvs: {
                    MATL_GROUP: {
                      vc: [
                        {
                          c: '23153100',
                          t: 'Industrial Machinery'
                        }
                      ]
                    }
                  }
                },
                _id: 'ERSA120208',
                _score: 1
              }
            ],
            total: {
              value: 160,
              relation: 'eq'
            },
            max_score: 1
          }
        }
      }]
    const barWidget: BarChartWidget = new BarChartWidget();
    barWidget.fieldId = 'MATL_GROUP';
    barWidget.metaData = { dataType: '1' } as MetadataModel;
    barWidget.blankValueAlias = 'MATL_GROUP';
    barWidget.orderWith = OrderWith.ROW_ASC;
    component.barWidget.next(barWidget);

    component.sortByColumn(buckets as Buckets[]);
    expect(buckets).toBeDefined();
  }));
  it('zoomIn()', async(() => {
    component.minBarWidth = 25;
    component.zoomStep = 5;
    component.orientation = 'horizontalBar';
    component.widgetInfo = { height: 25, width: 35 } as Widget;
    component.dataSet = ['test'];
    component.zoomIn();

    expect(component.computedSize.height).toEqual(30);
  }));

  it('getUpdatedColorCode()', async(() => {
    component.widgetColorPalette = { colorPalettes: [{ code: '21', colorCode: 'yellow' } as AssginedColor] } as WidgetColorPalette;
    const code = '21';

    expect(component.getUpdatedColorCode(code)).toEqual('yellow');
  }));

  it('getFieldsDesc()', async(() => {
    const barWidget: BarChartWidget = new BarChartWidget();
    barWidget.fieldId = 'MATL_TYPE';
    barWidget.metaData = { fieldId: 'MATL_TYPE', picklist: '0' } as MetadataModel;
    component.barWidget.next(barWidget);
    const buckets = [{ key: '200010', doc_count: 10744, 'top_hits#items': { hits: { total: { value: 10744, relation: 'eq' }, max_score: 1.0, hits: [{ _source: { hdvs: { MATL_GROUP: { fId: 'MATL_GROUP', lls: { EN: { label: 'Material Group' } }, vls: { EN: { valueTxt: '200010' } }, vc: [{ c: '200010', t: 'testing' }] } } } }] } } }, { key: '200030', doc_count: 775, 'top_hits#items': { hits: { total: { value: 775, relation: 'eq' }, max_score: 1.0, hits: [{ _source: { staticFields: { MATL_GROUP: { fId: 'MATL_GROUP', lls: { EN: { label: 'Material Group' } }, vls: { EN: { valueTxt: '200030' } }, vc: [{ c: '200030' }] } } } }] } } }, { key: '200030', 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { MATL_GROUP: {} } } }] } } }];
    component.lablels = ['testing', '200030'];
    // call actual method
    component.getFieldsDesc(buckets);

    expect(component.lablels.length).toEqual(3);
    expect(component.chartLegend.length).toEqual(3);

    const buckets1 = [{ key: '200030', 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { OVERDUE: { vc: [{ c: '1' }] } } } }] } } }];
    const data1: BarChartWidget = new BarChartWidget();
    data1.fieldId = 'OVERDUE';
    data1.metaData = { fieldId: 'OVERDUE', picklist: '35' } as MetadataModel;
    component.barWidget.next(data1);
    component.lablels = ['YES'];
    // call actual method
    component.getFieldsDesc(buckets1);

    expect(component.lablels.length).toEqual(4);
    expect(component.chartLegend.length).toEqual(4);


    const buckets2 = [{ key: '200030', 'top_hits#items': { hits: { hits: [{ _source: { hdvs: { MAT_DESC: { vc: [{ c: 't', t: 'Test' }] } } } }] } } }];
    const data2: BarChartWidget = new BarChartWidget();
    data2.fieldId = 'MAT_DESC';
    data2.metaData = { fieldId: 'MAT_DESC', picklist: '1' } as MetadataModel;
    data2.showTotal = true;
    component.barWidget.next(data2);
    component.lablels = ['Test'];
    // call actual method
    component.getFieldsDesc(buckets2);

    expect(component.lablels.length).toEqual(6);
    expect(component.chartLegend.length).toEqual(6);
  }));

  it('removeOldFilterCriteria', async(() => {
    component.filterCriteria = [{ fieldId: 'MATL_TYPE' } as Criteria];
    const selectedOptions = [{ fieldId: 'MATL_TYPE' } as Criteria];
    component.removeOldFilterCriteria(selectedOptions);
    expect(component.filterCriteria.length).toEqual(0);
  }))

  it('setLables', async(() => {
    component.chartLegend = [{ code: 'MATL_TYPE', legendIndex: 0, text: 'Material Type' }];
    component.displayCriteriaOption = DisplayCriteria.CODE;
    component.setLabels();
    expect(component.lablels.length).toEqual(1);

    component.displayCriteriaOption = DisplayCriteria.TEXT;
    component.setLabels();
    expect(component.lablels.length).toEqual(1);

    component.displayCriteriaOption = DisplayCriteria.CODE_TEXT;
    component.setLabels();
    expect(component.lablels.length).toEqual(1);
  }))

  it('getTableData(), should return table data', async () => {
    component.displayedColumnsId = [];
    component.tableDataSource = [];
    component.dataSet = ['45', '65', '23'];
    component.lablels = ['Test1', 'Test2', 'Test3'];

    const pieWidget: BarChartWidget = new BarChartWidget();
    pieWidget.fieldId = 'MATL_TYPE';
    pieWidget.metaData = { fieldDescri: 'Material Type' } as MetadataModel;
    pieWidget.blankValueAlias = 'MATL_TYPE';
    component.barWidget.next(pieWidget);

    component.getTableData();
    expect(component.displayedColumnsId.length).toEqual(2);
    expect(component.tableDataSource.length).toEqual(3);
  });

  it('getCodeValue(), should sort return code value', async(() => {
    const barWidget: BarChartWidget = new BarChartWidget();
    barWidget.fieldId = 'MATL_GROUP';
    barWidget.metaData = { dataType: '1' } as MetadataModel;
    barWidget.blankValueAlias = 'MATL_GROUP';
    barWidget.orderWith = OrderWith.ROW_ASC;
    expect(component.getCodeValue).toBeTruthy();
  }));

  it('downloadImage()', async()=>{
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
    baseChart.data = { datasets: [{} as any] };
    component.chart = baseChart;
    spyOn(widgetService,'downloadImage').withArgs(component.chart.toBase64Image(),'Bar-Chart.png');
    component.downloadImage();
    expect(widgetService.downloadImage).toHaveBeenCalledWith(component.chart.toBase64Image(),'Bar-Chart.png');
  });
});
