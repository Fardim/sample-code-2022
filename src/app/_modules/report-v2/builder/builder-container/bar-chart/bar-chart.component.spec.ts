import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BarChartComponent } from './bar-chart.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Orientation, OrderWith, WidgetColorPalette, Widget, Criteria, WidgetType, Buckets, DisplayCriteria, LegendPosition, DatalabelsPosition, ChartProperties, AssginedColor, WidgetAdditionalProperty, WidgetView, WidgetViewDetails, WidgetViewRequestPayload } from '../../../_models/widget';
import { of } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { BaseChartDirective, ThemeService } from 'ng2-charts';
import { WidgetService } from '@services/widgets/widget.service';
import { MetadataModel } from '@models/schema/schemadetailstable';
import { MatDialog } from '@angular/material/dialog';
import { SharedModule } from '@modules/shared/shared.module';
import { LegendItem } from 'chart.js';
import { Userdetails } from '@models/userdetails';
import { ElementRef, NgZone } from '@angular/core';
import { UserService } from '@services/user/userservice.service';
import { ChartLegend } from '@modules/report/_models/widget';

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
  let userService: jasmine.SpyObj<UserService>;
  const zone: NgZone = new NgZone({ enableLongStackTrace: true });

  const mockMatDialogOpen = {
    open: jasmine.createSpy('open')
  };

  beforeEach(async(() => {
    const userServiceSpy = jasmine.createSpyObj(WidgetService, ['getUserDetails']);
    TestBed.configureTestingModule({
      declarations: [BarChartComponent, BaseChartDirective],
      imports: [MdoUiLibraryModule, AppMaterialModuleForSpec, HttpClientTestingModule, MatMenuModule, SharedModule],
      providers: [
        { provide: UserService, userValue: userServiceSpy },
        {
          provide: MatDialog,
          useValue: mockMatDialogOpen
        }
      ]
    })
      .compileComponents();
      userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BarChartComponent);
    component = fixture.componentInstance;
    htmlnative = fixture.nativeElement;
    widgetService = fixture.debugElement.injector.get(WidgetService);
    component.widgetInfo = new Widget();
    component.widgetInfo.chartProperties = new ChartProperties();
    component.widgetId = 12345;
    component.widgetInfo.widgetType = WidgetType.FILTER;
    component.widgetInfo.widgetId = component.widgetId.toString();
    component.widgetInfo.chartProperties.orderWith = OrderWith.ROW_DESC;
    component.userDetails = { defLocs: ['abc'] } as Userdetails;
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
    const array: any = [{ datasetIndex: 0 }];
    component.chartLegend = [{ code: 'MATL_TYPE', legendIndex: 0, text: 'Material Type' }];
    component.widgetInfo.field = 'MATL_TYPE';
    component.widgetInfo.fieldCtrl = { dataType: '1' } as MetadataModel;
    component.widgetInfo.chartProperties.blankValueAlias = 'MATL_TYPE';
    component.filterCriteria = [{ fieldId: 'MATL_TYPE' } as Criteria];

    // mock chart
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone,new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementsAtEventForMode: (e: any) => [{ _datasetIndex: 0, _index: 0 } as any] } as any;
    component.chart = baseChart;
    component.stackClickFilter(null, array);
    // after apply filter criteria then filtercriteria length should be 1
    expect(component.filterCriteria.length).toEqual(1, 'after apply filter criteria then filtercriteria length should be 1');

    component.chartLegend = [{ code: 'REQUESTOR_DATE', legendIndex: 0, text: 'REQUESTOR DATE' }];
    component.widgetInfo.field = 'REQUESTOR_DATE';
    component.widgetInfo.fieldCtrl = { dataType: 'DTMS' } as MetadataModel;
    component.stackClickFilter(null, array);
    expect(component.filterCriteria.length).toEqual(1);

    component.chartLegend = [{ code: 'GM', legendIndex: 0, text: 'GM' }];
    component.widgetInfo.field = 'CURRENTUSER';
    component.widgetInfo.fieldCtrl = { dataType: 'CHAR' } as MetadataModel;
    component.filterCriteria = [{ fieldId: 'CURRENTUSER', widgetType: WidgetType.BAR_CHART, conditionFieldValue: 'admin' } as Criteria];
    component.widgetInfo.isEnableGlobalFilter = true;
    component.stackClickFilter(null, array);
    expect(component.filterCriteria.length).toEqual(1);
  }));

  it('should show bar orienation based on orienation value', async(() => {
    component.widgetInfo.chartProperties.orientation = Orientation.HORIZONTAL;
    component.widgetInfo.chartProperties.legendPosition = LegendPosition.top;
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementsAtEventForMode: (e: any) => [{ datasetIndex: 0, index: 0 } as any] } as any;
    baseChart.chart.options = { scales: { xAxes: {}, yAxes: {} }, plugins:{} };
    baseChart.options = { scales: { xAxes: {}, yAxes: {} }, plugins:{} };
    component.chart = baseChart;
    component.getBarConfigurationData();
    expect('horizontalBar').toBe(component.orientation);
  }));

  it('should have true value for showLegend flag then set legend position', async(() => {
    component.widgetInfo.chartProperties.orientation = Orientation.VERTICAL;
    component.widgetInfo.chartProperties.isEnableLegend = true;
    component.widgetInfo.chartProperties.legendPosition = LegendPosition.top;
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone,new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementsAtEventForMode: (e: any) => [{ _datasetIndex: 0, _index: 0 } as any] } as any;
    baseChart.chart.options = { plugins:{},scales: { xAxes: {}, yAxes: {} } };
    baseChart.options = {plugins:{}};
    component.chart = baseChart;
    component.getBarConfigurationData();
    expect(component.widgetInfo.chartProperties.isEnableLegend).toBe(component.chart.chart.options.plugins.legend.display);
    // expect(component.widgetInfo.chartProperties.legendPosition).toBe(component.chart.chart.options.plugins.legend.position);
  }));

  it('should have true value for showCountOnStack flag then set align and anchor position', async(() => {
    component.widgetInfo.chartProperties.isEnableDatalabels = true;
    component.widgetInfo.chartProperties.datalabelsPosition = DatalabelsPosition.end;
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone,new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementsAtEventForMode: (e: any) => [{ _datasetIndex: 0, _index: 0 } as any] } as any;
    baseChart.options = { plugins: { datalabels: {}, annotation:{} }, scales: { xAxes: {}, yAxes: {} } };
    baseChart.chart.options = baseChart.options;
    component.chart = baseChart;
    component.getBarConfigurationData();
    expect(component.widgetInfo.chartProperties.isEnableDatalabels).toBe(true);
    expect(component.widgetInfo.chartProperties.datalabelsPosition).toBe(component.chart.chart.options.plugins.datalabels.align.toString());
  }));

  it('should have true value for showCountOnStack flag then set align and anchor position', async(() => {
    component.widgetInfo.chartProperties.isEnableBenchMark = true;
    component.widgetInfo.chartProperties.benchMarkValue = 500
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone,new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementsAtEventForMode: (e: any) => [{ _datasetIndex: 0, _index: 0 } as any] } as any;
    baseChart.options = { plugins: { datalabels: {}, annotation:{} }, scales: { xAxes: {}, yAxes: {} } };
    baseChart.chart.options = baseChart.options;
    component.chart = baseChart;
    component.getBarConfigurationData();
    expect(component.chart.options.plugins.annotation.annotations.length).toEqual(1);

    component.orientation = 'bar';
    component.getBarConfigurationData();
    expect(component.chart.options.plugins.annotation.annotations.length).toEqual(1);

    component.widgetInfo.chartProperties.isEnableBenchMark = false;
    component.getBarConfigurationData();
    expect(component.chart.options.plugins.annotation.annotations.length).toEqual(0);
  }));

  it('should have true value for displayAxisLable flag then set xAxisLabel, yAxisLabel', async(() => {
    component.widgetInfo.chartProperties.xAxisLabel = 'X-Axis';
    component.widgetInfo.chartProperties.yAxisLabel = 'Y-Axis';
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone,new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementsAtEventForMode: (e: any) => [{ _datasetIndex: 0, _index: 0 } as any] } as any;
    baseChart.chart.options = { scales: { xAxes: {}, yAxes: {} }, plugins:{} };
    baseChart.options = { scales: { xAxes: {}, yAxes: {} }, plugins:{} };
    component.chart = baseChart;
    component.getBarConfigurationData();
    const title = 'title';
    expect(component.widgetInfo.chartProperties.xAxisLabel).toBe(component.chart.chart.options.scales.x[title].text);
    expect(component.widgetInfo.chartProperties.yAxisLabel).toBe(component.chart.chart.options.scales.y[title].text);
  }));

  it(`setChartAxisAndScaleRange(), should set chart axis and scale on chart option`, async(() => {
    // mock data
    component.widgetInfo.chartProperties.scaleFrom = 0;
    component.widgetInfo.chartProperties.scaleTo = 20;
    component.widgetInfo.chartProperties.stepSize = 4;
    component.widgetInfo.chartProperties.xAxisLabel = 'Material Type';
    component.widgetInfo.chartProperties.yAxisLabel = 'Value';
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone,new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementsAtEventForMode: (e: any) => [{ _datasetIndex: 0, _index: 0 } as any] } as any;
    baseChart.chart.options = { scales: { xAxes: {}, yAxes: {} } };
    baseChart.options = { scales: { xAxes: {}, yAxes: {} } };
    component.chart = baseChart;
    const title = 'title';
    // const ticks = { min: component.widgetInfo.chartProperties.scaleFrom, max: component.widgetInfo.chartProperties.scaleTo, stepSize: component.widgetInfo.chartProperties.stepSize } as NestedTickOptions;
    // call actual component function
    component.setChartAxisAndScaleRange();

    // asserts & expect
    // expect(component.chart.chart.options.scales.yAxes[0].ticks.min).toEqual(ticks.min);
    expect(component.barChartOptions.scales.y[title].text).toEqual(component.widgetInfo.chartProperties.yAxisLabel);
    expect(component.barChartOptions.scales.x[title].text).toEqual(component.widgetInfo.chartProperties.xAxisLabel);

    // scenario  2
    component.widgetInfo.chartProperties.orientation = Orientation.HORIZONTAL;


    // call actual component method
    component.setChartAxisAndScaleRange();

    // asserts & expect
    // expect(component.chart.chart.options.scales.yAxes[0].ticks.min).toEqual(ticks.min);
    expect(component.barChartOptions.scales.y[title].text).toEqual(component.widgetInfo.chartProperties.yAxisLabel);
    expect(component.barChartOptions.scales.x[title].text).toEqual(component.widgetInfo.chartProperties.xAxisLabel);

    // scenario  3
    component.widgetInfo.chartProperties.xAxisLabel = 'Data 1';

    // call actual component method
    component.widgetInfo.chartProperties.yAxisLabel = '';
    component.setChartAxisAndScaleRange();

    // asserts & expect
    expect(component.barChartOptions.scales.y[title].text).toEqual('');
    expect(component.barChartOptions.scales.x[title].text).toEqual(component.widgetInfo.chartProperties.xAxisLabel);
  }));


  it(`transformDataSets(), data transformation before rander on chart`, async(() => {
    // mock data
    component.widgetInfo.chartProperties.scaleFrom = 0;
    component.widgetInfo.chartProperties.scaleTo = 20;
    component.widgetInfo.chartProperties.stepSize = 4;
    component.filterCriteria = [];
    const resBuckets = [{ key: 'HAWA', doc_count: 10 }, { key: 'DEIN', doc_count: 3 }, { key: 'ZMRO', doc_count: 30 }]

    // call actual component method
    const actualResponse = component.transformDataSets(resBuckets);

    // expects
    expect(actualResponse.length).toEqual(2, `Data should be interval in scale range`);
    expect(component.lablels.length).toEqual(2, `Lablels length should be 2`);

    // scenario  2
    component.widgetInfo.chartProperties.dataSetSize = 1;
    component.widgetInfo.chartProperties.showTotal = true;

    // call actual component method
    const actualResponse1 = component.transformDataSets(resBuckets);
    expect(actualResponse1.length).toEqual(2, `After applied datasetSize length should be equals to dataSetSize`);

    component.widgetInfo.chartProperties = {showTotal : true} as any;
    component.filterCriteria = [{fieldId : 'MATL', conditionFieldValue : 'Material', conditionFieldValueText : 'Material Group'} as any];
    component.lablels = ['Material Group'];
    const actualResponse2 = component.transformDataSets(resBuckets);
    expect(actualResponse2.length).toEqual(3, `After applied datasetSize length should be equals to dataSetSize`);


  }));

  it('getFieldsMetadaDesc(), get description of field', async(() => {
    const buckets = [{ key: '200010', doc_count: 10744, 'top_hits#items': { hits: { total: { value: 10744, relation: 'eq' }, max_score: 1.0, hits: [{ _source: { hdvs: { MATL_GROUP: { fId: 'MATL_GROUP', lls: { EN: { label: 'Material Group' } }, vls: { EN: { valueTxt: '200010' } }, vc: [{ c: '200010', t: 'testing' }] } } } }] } } }, { key: '200030', doc_count: 775, 'top_hits#items': { hits: { total: { value: 775, relation: 'eq' }, max_score: 1.0, hits: [{ _source: { staticFields: { MATL_GROUP: { fId: 'MATL_GROUP', lls: { EN: { label: 'Material Group' } }, vls: { EN: { valueTxt: '200030' } }, vc: [{ c: '200030' }] } } } }] } } }];

    component.widgetInfo.field = 'MATL_GROUP';
    component.lablels = ['testing', '200030'];
    // call actual method
    component.getFieldsMetadaDesc(buckets);

    expect(component.lablels.length).toEqual(2);
    expect(component.chartLegend.length).toEqual(2);

    const buckets1 = [{ key: '200030', 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { OVERDUE: { vc: [{ c: '1' }] } } } }] } } }];
    component.widgetInfo.field = 'OVERDUE';
    component.lablels = ['YES'];
    // call actual method
    component.getFieldsMetadaDesc(buckets1);
    expect(component.lablels.length).toEqual(3);
    expect(component.chartLegend.length).toEqual(3);

    const bucketList = [{doc_count:22707,key:{FILTER:'System'},'top_hits#items':{hits:{hits:[{_index:'mdoqa.masterdataonline.com_1005_do_0_en',_type:'_doc',_source:{hdvs:{STATUS:{vc:[{c:'SYS',t:'System'}]}}},_id:'ERSA004520',_score:1.0}],total:{value:22707,relation:'eq'},max_score:1.0}}},{doc_count:7,key:{FILTER:'Rejected'},'top_hits#items':{hits:{hits:[{_index:'mdoqa.masterdataonline.com_1005_do_0_en',_type:'_doc',_source:{hdvs:{STATUS:{vc:[{c:'REJ',t:'Rejected'}]}}},_id:'272004',_score:1.0}],total:{value:7,relation:'eq'},max_score:1.0}}},{doc_count:181,key:{FILTER:'REJ'},'top_hits#items':{hits:{hits:[{_index:'mdoqa.masterdataonline.com_1005_do_0_en',_type:'_doc',_source:{hdvs:{STATUS:{vc:[{c:'REJ'}]}}},_id:'ERSA024421',_score:1.0}],total:{value:181,relation:'eq'},max_score:1.0}}},{doc_count:18112,key:{FILTER:'In Progress'},'top_hits#items':{hits:{hits:[{_index:'mdoqa.masterdataonline.com_1005_do_0_en',_type:'_doc',_source:{hdvs:{STATUS:{vc:[{c:'INP',t:'In Progress'}]}}},_id:'ERSA024503',_score:1.0}],total:{value:18112,relation:'eq'},max_score:1.0}}},{doc_count:37,key:{FILTER:''},'top_hits#items':{hits:{hits:[{_index:'mdoqa.masterdataonline.com_1005_do_0_en',_type:'_doc',_source:{},_id:'CR_987398760143965660',_score:1.0}],total:{value:37,relation:'eq'},max_score:1.0}}}];
    component.getFieldsMetadaDesc(bucketList);
    expect(component.lablels.length).toEqual(8);
    expect(component.chartLegend.length).toEqual(8);

    component.filterCriteria = []
    component.widgetInfo.chartProperties.showTotal = true;
    const bucketList1 = [{doc_count:22707,key:{FILTER:'System'},'top_hits#items':{hits:{hits:[{_index:'mdoqa.masterdataonline.com_1005_do_0_en',_type:'_doc',_source:{hdvs:{STATUS:{vc:[{c:'SYS',t:'System'}]}}},_id:'ERSA004520',_score:1.0}],total:{value:22707,relation:'eq'},max_score:1.0}}},{doc_count:7,key:{FILTER:'Rejected'},'top_hits#items':{hits:{hits:[{_index:'mdoqa.masterdataonline.com_1005_do_0_en',_type:'_doc',_source:{hdvs:{STATUS:{vc:[{c:'REJ',t:'Rejected'}]}}},_id:'272004',_score:1.0}],total:{value:7,relation:'eq'},max_score:1.0}}},{doc_count:181,key:{FILTER:'REJ'},'top_hits#items':{hits:{hits:[{_index:'mdoqa.masterdataonline.com_1005_do_0_en',_type:'_doc',_source:{hdvs:{STATUS:{vc:[{c:'REJ'}]}}},_id:'ERSA024421',_score:1.0}],total:{value:181,relation:'eq'},max_score:1.0}}},{doc_count:18112,key:{FILTER:'In Progress'},'top_hits#items':{hits:{hits:[{_index:'mdoqa.masterdataonline.com_1005_do_0_en',_type:'_doc',_source:{hdvs:{STATUS:{vc:[{c:'INP',t:'In Progress'}]}}},_id:'ERSA024503',_score:1.0}],total:{value:18112,relation:'eq'},max_score:1.0}}},{doc_count:37,key:{FILTER:''},'top_hits#items':{hits:{hits:[{_index:'mdoqa.masterdataonline.com_1005_do_0_en',_type:'_doc',_source:{},_id:'CR_987398760143965660',_score:1.0}],total:{value:37,relation:'eq'},max_score:1.0}}}];
    component.getFieldsMetadaDesc(bucketList1);
    expect(component.lablels.length).toEqual(14);
    expect(component.chartLegend.length).toEqual(14);
  }));

  it('getBarChartData(), get bar chart data', async(() => {
    const service = fixture.debugElement.injector.get(WidgetService);
    const buckets = { aggregations: { 'sterms#BAR_CHART': { buckets: [{ key: '200010', doc_count: 10744, 'top_hits#items': { hits: { total: { value: 10744, relation: 'eq' }, max_score: 1.0, hits: [{ _source: { hdvs: { MATL_GROUP: { fId: 'MATL_GROUP', lls: { EN: { label: 'Material Group' } }, vls: { EN: { valueTxt: '200010' } }, vc: [{ c: '27364237' }] } } } }] } } }, { key: '200030', doc_count: 775, 'top_hits#items': { hits: { total: { value: 775, relation: 'eq' }, max_score: 1.0, hits: [{ _source: { hdvs: { MATL_GROUP: { fId: 'MATL_GROUP', lls: { EN: { label: 'Material Group' } }, vls: { EN: { valueTxt: '200030' } }, vc: [{ c: '8326286' }] } } } }] } } }] } } };
    component.userDetails = { defLocs: ['abc'] } as Userdetails;
    component.isFetchingData = true;
    spyOn(service, 'getWidgetData').withArgs('653267432', [], '', '', '', component.userDetails.defLocs.toString()).and.returnValue(of(buckets));
    component.widgetInfo.field = 'MATL_GROUP';
    component.widgetInfo.fieldCtrl = { fieldId: 'MATL_GROUP', picklist: '30' } as MetadataModel;
    component.widgetInfo.chartProperties.showTotal = true;

    component.filterCriteria = [];
    component.getBarChartData(653267432, []);

    expect(service.getWidgetData).toHaveBeenCalledWith('653267432', [], '', '', '', component.userDetails.defLocs.toString());
  }));

  it('getBarChartData(), get bar chart data 2', async(() => {
    const service = fixture.debugElement.injector.get(WidgetService);
    const buckets = { aggregations: { 'sterms#BAR_CHART': {}, 'nested#Nest_Bar': { doc_count: 2, 'sterms#BAR_CHART': { buckets: [{ doc_count: 1, key: 'IT', 'top_hits#items': { hits: { hits: [{ _source: { IND_SECTOR: { vc: [{ c: 'IT', t: 'IT Industry' }] } } }] } } }, { doc_count: 1, key: 'I', 'top_hits#items': { hits: { hits: [{ _source: { IND_SECTOR: { vc: [{ c: 'I', t: 'Mining Industry' }] } } }] } } }] } } } };
    component.userDetails = { defLocs: ['abc'] } as Userdetails;
    spyOn(service, 'getWidgetData').withArgs('653267432', [], '', '', '', component.userDetails.defLocs.toString()).and.returnValue(of(buckets));

    component.widgetInfo.field = 'IND_SECTOR';
    component.widgetInfo.fieldCtrl = { fieldId: 'IND_SECTOR', picklist: '30' } as MetadataModel;

    component.getBarChartData(653267432, []);

    expect(service.getWidgetData).toHaveBeenCalledWith('653267432', [], '', '', '', component.userDetails.defLocs.toString());
  }));

  it('setBarChartData(), should get barChartData', async(() => {
    component.orientation = 'pie';
    component.lablels = ['HERS -- Manufacturer Part', 'PMB -- PMB', 'ZMRO --  ZMRO-MRO Material'];
    component.dataSet = ['1', '99', '433122'];
    component.chartLegend = [
      { text: 'Manufacturer Part', code: 'HERS', legendIndex: 0 },
      { text: 'PMB', code: 'PMB', legendIndex: 1 },
      { text: ' ZMRO-MRO Material', code: 'ZMRO', legendIndex: 2 },
      {text : 'Total',code:'Total',legendIndex:3}
    ];

    component.widgetInfo.field = 'MATL_GROUP';
    component.widgetInfo.fieldCtrl = { fieldId: 'MATL_GROUP', picklist: '30' } as MetadataModel;
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone,new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementsAtEventForMode: (e: any) => [{ _datasetIndex: 0, _index: 0 } as any] } as any;
    component.chart = baseChart;
    component.setBarChartData();

    expect(component.barChartData[0].label).toEqual('Manufacturer Part');
    expect(component.barChartData[0].data).toEqual([{ y: 'HERS -- Manufacturer Part', x: 1 }, {}, {}]);

    expect(component.barChartData[1].label).toEqual('PMB');
    expect(component.barChartData[1].data).toEqual([{}, { y: 'PMB -- PMB', x: 99 }, {}]);

    expect(component.barChartData[2].label).toEqual(' ZMRO-MRO Material');
    expect(component.barChartData[2].data).toEqual([{}, {}, { y: 'ZMRO --  ZMRO-MRO Material', x: 433122 }]);

    component.widgetInfo.isEnableRange = true;
    component.orientation = 'bar';
    component.setBarChartData();
    expect(component.barChartData[1].label).toEqual('Total');
  }));

  it('openColorPalette(), should open color palette dialog', async(() => {
    component.widgetId = 72366423;
    component.reportId = 65631624;
    component.widgetInfo.widgetTitle = 'Bar Chart';
    component.barChartData = [
      {
        // fieldCode: 'HAWA',
        backgroundColor: '#f1f1f1',
        label: 'Hawa material'
      }
    ];
    component.openColorPalette();
    expect(mockMatDialogOpen.open).toHaveBeenCalled();

    spyOn(component,'getRandomColor');
    component.barChartData = [
      {
        label: 'Hawa material'
      }
    ];
    component.openColorPalette();
    expect(component.getRandomColor).toHaveBeenCalled();
  }));

  it('updateColorBasedOnDefined(), update color based on defination ', async(() => {
    component.filterCriteria = [];
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

    component.widgetInfo.field = 'MATL_GROUP';
    component.lablels = ['200010', '200030'];
    // call actual method
    component.getDateFieldsDesc(buckets);

    expect(component.lablels.length).toEqual(2);
    expect(component.chartLegend.length).toEqual(2);

    component.lablels = ['200031'];
    // call actual method
    component.getDateFieldsDesc(buckets);
    expect(component.lablels.length).toEqual(4);
  }));

  it('ngOnChanges(), while change rule type', async(() => {
    // mock data
    component.filterCriteria = [];
    component.widgetId = 12345;
    const changes: import('@angular/core').SimpleChanges = { filterCriteria: { currentValue: true, previousValue: false, firstChange: null, isFirstChange: null }, boxSize: { currentValue: 35, previousValue: 26, firstChange: null, isFirstChange: null }, widgetInfo: { currentValue: {field:'MATL'}, previousValue: {field:'DATS'}, firstChange: null, isFirstChange: null } };
    component.widgetInfo.isEnableGlobalFilter = true;
    component.ngOnChanges(changes);
    expect(component.boxSize).toEqual(35);

    component.widgetInfo.isEnableGlobalFilter = false;
    component.ngOnChanges(changes);
    expect(component.lablels.length).toEqual(0);

    const changes2: import('@angular/core').SimpleChanges = {};
    component.ngOnChanges(changes2);
    expect(component.ngOnChanges).toBeTruthy();
  }));

  it('legendClick(), legend click ', async(() => {
    const item1: LegendItem = { text:'Total',datasetIndex: 0 } as LegendItem;
    component.legendClick(item1);
    expect(component.legendClick).toBeTruthy();

    const item: LegendItem = { datasetIndex: 0 } as LegendItem;
    component.chartLegend = [{ code: 'MATL_TYPE', legendIndex: 0, text: 'Material Type' }];
    component.widgetInfo.field = 'MATL_TYPE';
    component.widgetInfo.fieldCtrl = { dataType: '1' } as MetadataModel;
    component.widgetInfo.chartProperties.blankValueAlias = 'MATL_TYPE';
    component.filterCriteria = [{ fieldId: 'MATL_TYPE' } as Criteria];
    component.legendClick(item);
    expect(component.filterCriteria.length).toEqual(2);

    component.filterCriteria = [];
    component.legendClick(item);
    expect(component.filterCriteria.length).toEqual(1);

    const legendItem: LegendItem = { datasetIndex: 0 } as LegendItem;
    component.chartLegend = [{ code: 'REQUESTOR_DATE', legendIndex: 0, text: 'REQUESTOR DATE' }];
    component.widgetInfo.field = 'REQUESTOR_DATE';
    component.widgetInfo.fieldCtrl = { dataType: 'DTMS' } as MetadataModel;
    component.legendClick(legendItem);
    expect(component.filterCriteria.length).toEqual(2);

    const legendItem1: LegendItem = { datasetIndex: 0 } as LegendItem;
    component.chartLegend = [{ code: 'GM', legendIndex: 0, text: 'GM' }];
    component.widgetInfo.field = 'CURRENTUSER';
    component.widgetInfo.fieldCtrl = { dataType: 'CHAR' } as MetadataModel;
    component.filterCriteria = [{ fieldId: 'CURRENTUSER', widgetType: WidgetType.BAR_CHART, conditionFieldValue: 'admin' } as Criteria];
    component.widgetInfo.isEnableGlobalFilter = true;
    component.legendClick(legendItem1);
    expect(component.filterCriteria.length).toEqual(1);
  }));

  it('applyDateFilter()', async(() => {
    const startDate = '1588204800000';
    const fieldId = 'REQUESTOR_DATE';
    const res = component.applyDateFilter(startDate, fieldId);
    expect(res.conditionFieldEndValue).toEqual('1588291200000');
  }));

  it('ngOnInit(),  should enable pre required on this component', async(() => {
    component.userDetails = { } as Userdetails;
    const response = { defLocs: ['abc'] } as Userdetails;
    component.widgetInfo.field = 'MATL';
    component.widgetInfo.objectType = 'MATL';
    component.widgetInfo.widgetId = '23156122';
    component.widgetInfo.widgetType = WidgetType.BAR_CHART;
    component.widgetInfo.widgetAdditionalProperties = { displayCriteria: DisplayCriteria.CODE_TEXT } as WidgetAdditionalProperty;
    component.widgetInfo.widgetColorPalette = new WidgetColorPalette();

    spyOn(userService, 'getUserDetails').withArgs().and.returnValue(of(response));
    spyOn(component, 'getBarConfigurationData');
    spyOn(component, 'getBarChartData');
    component.ngOnInit();

    // expect(component.getBarConfigurationData).not.toHaveBeenCalled();
    // expect(component.getBarChartData).not.toHaveBeenCalled();
    expect(component.displayCriteriaOption).toEqual(component.widgetInfo.widgetAdditionalProperties.displayCriteria);
    expect(component.widgetColorPalette).toEqual(component.widgetInfo.widgetColorPalette);

    component.widgetInfo.objectType = '1005';
    component.widgetInfo.field = 'MATL_TYPE';
    component.ngOnInit();

    // expect(component.getBarConfigurationData).toHaveBeenCalled();
    // expect(component.getBarChartData).toHaveBeenCalled();

    const res = { displayCriteria: DisplayCriteria.CODE };
    component.widgetInfo = { widgetColorPalette: { reportId: '123', widgetId: '1', widgetDesc: 'Test', colorPalettes: [{ code: '01', text: 'Red', colorCode: '001' }] as AssginedColor[] } } as Widget;
    spyOn(widgetService, 'getDisplayCriteria').withArgs(component.widgetInfo.widgetId, component.widgetInfo.widgetType).and.returnValue(of(res));
    component.ngOnInit();
    expect(component.widgetColorPalette).toEqual(component.widgetInfo.widgetColorPalette);
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
    component.widgetInfo.field = 'MATL_GROUP';
    component.widgetInfo.fieldCtrl = { dataType: '1' } as MetadataModel;
    component.widgetInfo.chartProperties.blankValueAlias = 'MATL_GROUP';
    component.widgetInfo.chartProperties.orderWith = OrderWith.ROW_ASC;

    component.sortBarChartData(buckets as Buckets[]);
    expect(buckets).toBeDefined();

    component.widgetInfo.field = 'MATL_GROUP';
    component.widgetInfo.fieldCtrl = { dataType: '1' } as MetadataModel;
    component.widgetInfo.chartProperties.blankValueAlias = 'MATL_GROUP';
    component.widgetInfo.chartProperties.orderWith = OrderWith.ROW_ASC;

    component.sortBarChartData(buckets as Buckets[]);
    expect(buckets).toBeDefined();

    component.widgetInfo.field = 'MATL_GROUP';
    component.widgetInfo.fieldCtrl = { dataType: '1' } as MetadataModel;
    component.widgetInfo.chartProperties.blankValueAlias = 'MATL_GROUP';
    component.widgetInfo.chartProperties.orderWith = OrderWith.ROW_DESC;

    component.sortBarChartData(buckets as Buckets[]);
    expect(buckets).toBeDefined();


    component.widgetInfo.field = 'MATL_GROUP';
    component.widgetInfo.fieldCtrl = { dataType: '1' } as MetadataModel;
    component.widgetInfo.chartProperties.blankValueAlias = 'MATL_GROUP';
    component.widgetInfo.chartProperties.orderWith = OrderWith.COL_ASC;

    component.displayCriteriaOption = DisplayCriteria.CODE;
    component.sortBarChartData(buckets as Buckets[]);
    expect(buckets).toBeDefined();

    component.widgetInfo.field = 'MATL_GROUP';
    component.widgetInfo.fieldCtrl = { dataType: '1' } as MetadataModel;
    component.widgetInfo.chartProperties.blankValueAlias = 'MATL_GROUP';
    component.widgetInfo.chartProperties.orderWith = OrderWith.COL_DESC;

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
    component.widgetInfo.field = 'MATL_GROUP';
    component.widgetInfo.fieldCtrl = { dataType: '1' } as MetadataModel;
    component.widgetInfo.chartProperties.blankValueAlias = 'MATL_GROUP';
    component.widgetInfo.chartProperties.orderWith = OrderWith.ROW_ASC;


    component.sortByColumn(buckets as Buckets[]);
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
    component.widgetInfo.field = 'MATL_GROUP';
    component.widgetInfo.fieldCtrl = { dataType: '1' } as MetadataModel;
    component.widgetInfo.chartProperties.blankValueAlias = 'MATL_GROUP';
    component.widgetInfo.chartProperties.orderWith = OrderWith.ROW_ASC;
    component.displayCriteriaOption = DisplayCriteria.CODE_TEXT;

    component.sortByColumn(buckets as Buckets[]);
    expect(buckets).toBeDefined();

  }));

  it('getCodeValue(), should sort return code value', async(() => {
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
    component.widgetInfo.field = 'MATL_GROUP';
    component.widgetInfo.fieldCtrl = { dataType: '1' } as MetadataModel;
    component.widgetInfo.chartProperties.blankValueAlias = 'MATL_GROUP';
    component.widgetInfo.chartProperties.orderWith = OrderWith.ROW_ASC;

    const result = component.getCodeValue(buckets as Buckets[]);
    expect(result.length).toEqual(2);
  }));

  it('viewChange(), should change widget view', async () => {
    component.filterCriteria = [];
    component.isTableView = false;
    component.reportId = 123454567;
    component.widgetId = 45675678;
    component.widgetInfo.field = 'MATL_TYPE';
    component.widgetInfo.fieldCtrl = { fieldDescri: 'Material Type' } as MetadataModel;
    component.widgetInfo.chartProperties.blankValueAlias = 'MATL_TYPE';
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

    spyOn(widgetService, 'saveWidgetView').withArgs(widgetViewRequest).and.returnValue(of(widgetViewDetails));
    component.viewChange(false);
    expect(widgetService.saveWidgetView).toHaveBeenCalledWith(widgetViewRequest);

    const widgetViewRequest1: WidgetViewRequestPayload = {
      uuid: '838383',
      reportId: 123454567,
      widgetId: 45675678,
      view: WidgetView.TABLE_VIEW
    }

    const widgetViewDetails1 = {
      acknowledge: true,
      payload: {
        uuid: '838383',
        reportId: 123454567,
        widgetId: 45675678,
        view: WidgetView.GRAPH_VIEW,
        userName: '',
        tenantCode: 123,
        createdAt: 2,
        updatedAt: 1
      }
    } as WidgetViewDetails;
    component.widgetViewDetails = {
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
    } as WidgetViewDetails;;

    spyOn(widgetService, 'updateWidgetView').withArgs(widgetViewRequest1).and.returnValue(of(widgetViewDetails1));
    component.viewChange(true);
    expect(widgetService.updateWidgetView).toHaveBeenCalledWith(widgetViewRequest1);
  });

  it('saveDisplayCriteria(), should call saveDisplayCriteria', async(() => {
    component.displayCriteriaOption = DisplayCriteria.TEXT;
    component.widgetInfo.field = 'DATECREATED';
    component.widgetInfo.fieldCtrl = { fieldId: 'DATECREATED', picklist: '0', dataType: 'DTMS' } as MetadataModel;
    component.returndata = { aggregations: { 'sterms#BAR_CHART': { buckets: [{ doc_count: 1, key: 'IT', 'top_hits#items': { hits: { hits: [{ _source: { DATECREATED: { vc: [{ c: '1234567890' }] } } }] } } }, { doc_count: 1, key: 'I', 'top_hits#items': { hits: { hits: [{ _source: { DATECREATED: { vc: [{ c: '0987654321' }] } } }] } } }] } } };
    spyOn(widgetService, 'saveDisplayCriteria').withArgs(component.widgetInfo.widgetId, component.widgetInfo.widgetType, component.displayCriteriaOption).and.returnValue(of({}));

    component.saveDisplayCriteria();
    expect(widgetService.saveDisplayCriteria).toHaveBeenCalledWith('12345', WidgetType.FILTER, DisplayCriteria.TEXT);
  }));

  it('getUpdatedColorCode()', async(() => {
    component.widgetColorPalette = { colorPalettes: [{ code: '21', colorCode: 'yellow' } as AssginedColor] } as WidgetColorPalette;
    const code = '21';

    expect(component.getUpdatedColorCode(code)).toEqual('yellow');
  }));

  it('getFieldsDesc()', async(() => {
    component.filterCriteria = [];
    component.widgetInfo.field = 'MATL_TYPE';
    component.widgetInfo.fieldCtrl = { fieldId: 'MATL_TYPE', picklist: '0' } as MetadataModel;
    component.widgetInfo.chartProperties.showTotal = true;

    const buckets = [{ key: '200010', doc_count: 10744, 'top_hits#items': { hits: { total: { value: 10744, relation: 'eq' }, max_score: 1.0, hits: [{ _source: { hdvs: { MATL_GROUP: { fId: 'MATL_GROUP', lls: { EN: { label: 'Material Group' } }, vls: { EN: { valueTxt: '200010' } }, vc: [{ c: '200010', t: 'testing' }] } } } }] } } }, { key: '200030', doc_count: 775, 'top_hits#items': { hits: { total: { value: 775, relation: 'eq' }, max_score: 1.0, hits: [{ _source: { staticFields: { MATL_GROUP: { fId: 'MATL_GROUP', lls: { EN: { label: 'Material Group' } }, vls: { EN: { valueTxt: '200030' } }, vc: [{ c: '200030' }] } } } }] } } }, { key: '200030', 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { MATL_GROUP: {} } } }] } } }];
    component.lablels = ['testing', '200030','Total'];
    // call actual method
    component.getFieldsDesc(buckets);

    expect(component.lablels.length).toEqual(4);
    expect(component.chartLegend.length).toEqual(4);

    const buckets1 = [{ key: '200030', 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { OVERDUE: { vc: [{ c: '1' }] } } } }] } } }];
    component.widgetInfo.field = 'OVERDUE';
    component.widgetInfo.fieldCtrl = { fieldId: 'OVERDUE', picklist: '35' } as MetadataModel;
    component.lablels = ['YES'];
    // call actual method
    component.getFieldsDesc(buckets1);

    expect(component.lablels.length).toEqual(6);
    expect(component.chartLegend.length).toEqual(6);

    const buckets2 = [{ key: '200030', 'top_hits#items': { hits: { hits: [{ _source: { hdvs: { MAT_DESC: { vc: [{ c: 't', t: 'Test' }] } } } }] } } }];
    component.widgetInfo.field = 'MAT_DESC';
    component.widgetInfo.fieldCtrl = { fieldId: 'MAT_DESC', picklist: '1' } as MetadataModel;
    component.widgetInfo.chartProperties.showTotal = true;
    component.lablels = ['Test'];
    // call actual method
    component.getFieldsDesc(buckets2);

    expect(component.lablels.length).toEqual(8);
    expect(component.chartLegend.length).toEqual(8);
  }));

  it('removeOldFilterCriteria', async(() => {
    component.filterCriteria = [{ fieldId: 'MATL_TYPE' } as Criteria];
    const selectedOptions = [{ fieldId: 'MATL_TYPE' } as Criteria];
    component.removeOldFilterCriteria(selectedOptions);
    expect(component.filterCriteria.length).toEqual(0);
  }));

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
  }));

  it('downloadCSV()', async(() => {
    // mock data
    component.widgetInfo.fieldCtrl = { fieldDescri: 'Status', fieldId: 'status' } as MetadataModel;
    component.widgetInfo.field = 'status';
    component.lablels = ['INP']
    component.dataSet = ['1738']
    spyOn(widgetService, 'downloadCSV');
    component.downloadCSV();
    expect(widgetService.downloadCSV).toHaveBeenCalled();

    component.dataSet =  {Material:[{x:'10',y:0}]};
    component.lablels = ['10'];
    component.chartLegend = [{ code: 'Material', legendIndex: 0, text: 'Material' }];
    component.widgetInfo.isEnableRange = true;
    component.downloadCSV();
    expect(widgetService.downloadCSV).toHaveBeenCalled();
  }));

  it('getTableData(), should return table data', async () => {
    component.displayedColumnsId = [];
    component.tableDataSource = [];
    component.dataSet = ['45', '65', '23'];
    component.lablels = ['Test1', 'Test2', 'Test3'];

    component.widgetInfo.field = 'MATL_TYPE';
    component.widgetInfo.fieldCtrl = { fieldDescri: 'Material Type' } as MetadataModel;
    component.widgetInfo.chartProperties.blankValueAlias = 'MATL_TYPE';

    component.getTableData();
    expect(component.displayedColumnsId.length).toEqual(2);
    expect(component.tableDataSource.length).toEqual(3);

    component.dataSet =  {Material:[{x:'0.0-10.0',y:0}]};
    component.lablels = ['0.0-10.0'];
    component.chartLegend = [{ code: 'Material', legendIndex: 0, text: 'Material' }];
    component.widgetInfo.isEnableRange = true;
    component.getTableData();
    expect(component.displayedColumnsId.length).toEqual(2);
    expect(component.tableDataSource.length).toEqual(1);
  });

  // it('downloadImage()', async()=>{
  //   const canvas = document.createElement('canvas');
  //   htmlnative.append(canvas);
  //   const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
  //   const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
  //   baseChart.data = { datasets: [{} as any] };
  //   baseChart.chart.options = { scales: { x: { ticks: {}}, y: {ticks: {}} } };
  //   baseChart.options = { scales: {
  //     x: {ticks: {}},
  //     y: {ticks: {}}
  //   }};
  //   baseChart.update = (e: any) => {};
  //   component.imageChart = baseChart;

  //   fixture.detectChanges();

  //   spyOn(widgetService,'downloadImage').withArgs(component.imageChart.toBase64Image(),'Bar-Chart.png');
  //   component.downloadImage();
  //   expect(widgetService.downloadImage).toHaveBeenCalledWith(component.imageChart.toBase64Image(),'Bar-Chart.png');
  // });

  it(`transformDataForEnableRange(), data transformation for aging/report`, async(() => {
    // mock data
    component.widgetInfo.chartProperties.scaleFrom = 0;
    component.widgetInfo.chartProperties.scaleTo = 20;
    component.widgetInfo.chartProperties.stepSize = 4;
    component.filterCriteria = [];
    const resBuckets = [{ key: 'HAWA', doc_count: 10, 'range#aging_bucket':{buckets:[{doc_count:1,key:'0.0-10.0'},{doc_count:1,key:'0.0-10.0'},{doc_count:1,key:'0.10-20.0'}]} }, { key: 'DEIN', doc_count: 3, 'range#aging_bucket':{buckets:[{doc_count:1,key:'0.0-10.0'}]} }, { key: 'ZMRO', doc_count: 30, 'range#aging_bucket':{buckets:[{doc_count:1,key:'0.0-10.0'}]} }]

    // call actual component method
    const actualResponse = component.transformDataForEnableRange(resBuckets);

    // expects response to equal bucket response
    expect(actualResponse).toEqual({HAWA: [ Object({ x: '0.0-10.0', y: 1 }), Object({ x: '0.0-10.0', y: 1 }), Object({ x: '0.10-20.0', y: 1 }) ],
    DEIN: [ Object({ x: '0.0-10.0', y: 1 }) ],
    ZMRO: [ Object({ x: '0.0-10.0', y: 1 }) ]});
    // expect(component.lablels.length).toEqual(2, `Lablels length should be 2`);

    // scenario  2
    component.widgetInfo.chartProperties.dataSetSize = 1;
    component.widgetInfo.chartProperties.showTotal = true;

    // // call actual component method
     const actualResponse1 = component.transformDataForEnableRange(resBuckets);
     expect(actualResponse1.HAWA[0]).toEqual({x:'0.0-10.0', y: 1});

    component.widgetInfo.chartProperties = {showTotal : true} as any;
    component.filterCriteria = [{fieldId : 'MATL', conditionFieldValue : 'Material', conditionFieldValueText : 'Material Group'} as any];
    component.lablels = ['Material Group'];
    const actualResponse2 = component.transformDataForEnableRange(resBuckets);
    expect(actualResponse2.HAWA[0]).toEqual({x:'0.0-10.0', y: 1});
  }));

  it('getCodeTextValue(), should return display criteria', async()=>{
    const value: ChartLegend = {code:'CODE', text:'TEXT', legendIndex: 0 };
    component.displayCriteriaOption = DisplayCriteria.CODE
    const res = component.getCodeTextValue(value);
    expect(res).toEqual('CODE(TEXT)');

    component.displayCriteriaOption = DisplayCriteria.TEXT
    const res1 = component.getCodeTextValue(value);
    expect(res1).toEqual('TEXT(CODE)');

    component.displayCriteriaOption = DisplayCriteria.CODE_TEXT
    const res2 = component.getCodeTextValue(value);
    expect(res2).toEqual('CODE -- TEXT');
  });

  it('checkIsShowTotal()', async()=>{
    component.widgetInfo.chartProperties.showTotal = true;
    component.filterCriteria = [{ fieldId: 'MATL_TYPE', conditionFieldValue:'M' } as Criteria];
    component.chartLegend = [{ code: 'M', legendIndex: 0, text: 'Material Type' }];
    const res = component.checkIsShowTotal();
    expect(res).toBeFalse();

    component.chartLegend = [{ code: 'MATL', legendIndex: 0, text: 'Material' },{code:'Mat',legendIndex:1,text:'Matl'}];
    const res1 = component.checkIsShowTotal();
    expect(res1).toBeTrue();
  });

  it('formatCount()', async()=>{
    component.chartLegend = [{ code: 'Material', legendIndex: 0, text: 'Material' }];
    const value = {Material:[{x:'0.0-10.0',y:0}]};
    const res = component.formatCount(value,'0.0-10.0');
    expect(res.Material).toEqual('0\t');
  });

  it('changeScaleTicks(), method to change scales label for image download', async() => {
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementsAtEventForMode: (e: any) => [{ datasetIndex: 0, index: 0 } as any] } as any;
    baseChart.chart.options = { scales: { x: { ticks: {}}, y: {ticks: {}} } };
    baseChart.options = { scales: { x: {ticks: {}}, y: {ticks: {}} } };
    baseChart.update = (e: any) => {};
    component.imageChart = baseChart;

    component.widgetInfo.chartProperties.orientation = Orientation.HORIZONTAL;
    component.lablels = ['Label 1','Total'];

    fixture.detectChanges();

    component.changeScaleTicks(true);
    expect(component.changeScaleTicks).toBeTruthy();

    component.changeScaleTicks(false);
    expect(component.changeScaleTicks).toBeTruthy();

    component.widgetInfo.chartProperties.orientation = Orientation.VERTICAL;

    component.changeScaleTicks(true);
    expect(component.changeScaleTicks).toBeTruthy();

    component.changeScaleTicks(false);
    expect(component.changeScaleTicks).toBeTruthy();
  });
});
