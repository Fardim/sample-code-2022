import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PieChartComponent } from './pie-chart.component';
import { Criteria, WidgetColorPalette, Widget, WidgetType, LegendPosition, DatalabelsPosition, ChartProperties, DisplayCriteria, WidgetViewDetails, WidgetView, WidgetViewRequestPayload, WidgetAdditionalProperty } from '../../../_models/widget';
import { WidgetService } from 'src/app/_services/widgets/widget.service';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatMenuModule } from '@angular/material/menu';
import { of } from 'rxjs';
import { LegendItem } from 'chart.js';
import { BaseChartDirective, ThemeService } from 'ng2-charts';
import { MetadataModel } from '@models/schema/schemadetailstable';
import { MatDialog } from '@angular/material/dialog';
import { SharedModule } from '@modules/shared/shared.module';
import { Userdetails } from '@models/userdetails';
import { UserService } from '@services/user/userservice.service';
import { ElementRef, NgZone } from '@angular/core';

export class MockNgZone extends NgZone {
  constructor() {
    super({ enableLongStackTrace: false });
  }
}

describe('PieChartComponent', () => {
  let component: PieChartComponent;
  let fixture: ComponentFixture<PieChartComponent>;
  let widgetService: jasmine.SpyObj<WidgetService>;
  let userService: jasmine.SpyObj<UserService>;
  let htmlnative: HTMLElement;
  const zone: NgZone = new NgZone({ enableLongStackTrace: true });
  const mockMatDialogOpen = {
    open: jasmine.createSpy('open')
  };
  beforeEach(async(() => {
    const widgetServiceSpy = jasmine.createSpyObj(WidgetService, ['downloadCSV', 'getHeaderMetaData', 'getDisplayCriteria']);
    const userServiceSpy = jasmine.createSpyObj(WidgetService, ['getUserDetails']);
    TestBed.configureTestingModule({
      declarations: [PieChartComponent],
      imports: [MdoUiLibraryModule, AppMaterialModuleForSpec, HttpClientTestingModule, MatMenuModule, SharedModule],
      providers: [
        { provide: WidgetService, userValue: widgetServiceSpy },
        { provide: UserService, userValue: userServiceSpy },
        {
          provide: MatDialog,
          useValue: mockMatDialogOpen
        }
      ]
    })
      .compileComponents();
    widgetService = TestBed.inject(WidgetService) as jasmine.SpyObj<WidgetService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PieChartComponent);
    component = fixture.componentInstance;
    htmlnative = fixture.nativeElement;
    component.widgetInfo = new Widget();
    component.widgetInfo.chartProperties = new ChartProperties();
    component.userDetails = { defLocs: ['abc'] } as Userdetails;
    component.reportId = 12345;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('stackClickFilter(), should filter , after click on bar stack', async(() => {
    // call stack click with no argument then filter criteria should be [] array
    component.filterCriteria = [];
    component.stackClickFilter();
    expect(component.filterCriteria.length).toEqual(0);

    // mock data
    const array = [{ _datasetIndex: 0 }];
    component.chartLegend = [{ code: 'MATL_TYPE', legendIndex: 0, text: 'Material Type' }];
    component.widgetInfo.field = 'MATL_TYPE';
    component.widgetInfo.fieldCtrl = { dataType: '1' } as MetadataModel;
    component.widgetInfo.chartProperties.blankValueAlias = 'MATL_TYPE';
    component.filterCriteria = [{ fieldId: 'MATL_TYPE' } as Criteria];

    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementsAtEventForMode: (e: any) => [{ _datasetIndex: 0, index: 0 } as any] } as any;
    component.chart = baseChart;
    component.imageChart = baseChart;
    component.stackClickFilter(null, array);
    // after apply filter criteria then filtercriteria length should be 1
    expect(component.filterCriteria.length).toEqual(2, 'after apply filter criteria then filtercriteria length should be 1');

    component.chartLegend = [{ code: 'REQUESTOR_DATE', legendIndex: 0, text: 'REQUESTOR DATE' }];
    component.widgetInfo.field = 'REQUESTOR_DATE';
    component.widgetInfo.fieldCtrl = { dataType: 'DTMS' } as MetadataModel;
    component.stackClickFilter(null, array);
    expect(component.filterCriteria.length).toEqual(3);

    component.chartLegend = [{ code: 'GM', legendIndex: 0, text: 'GM' }];
    component.widgetInfo.field = 'CURRENTUSER';
    component.widgetInfo.fieldCtrl = { dataType: 'CHAR' } as MetadataModel;
    component.filterCriteria = [{ fieldId: 'CURRENTUSER', widgetType: WidgetType.PIE_CHART, conditionFieldValue: 'admin' } as Criteria];
    component.widgetInfo.isEnableGlobalFilter = true;
    component.stackClickFilter(null, array);
    expect(component.filterCriteria.length).toEqual(1);
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

  it('should have true value for showLegend flag then set legend position', async(() => {
    component.widgetInfo.chartProperties.isEnableLegend = true;
    component.widgetInfo.chartProperties.legendPosition = LegendPosition.top;
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
    baseChart.chart = { canvas: eleRef, getElementsAtEventForMode: (e: any) => [{ _datasetIndex: 0, _index: 0 } as any] } as any;
    baseChart.chart.options = { plugins: {}, scales: { xAxes: {}, yAxes: {} } };
    baseChart.options = { plugins: {}, scales: { xAxes: {}, yAxes: {} } };
    component.chart = baseChart;
    component.imageChart = baseChart;
    component.getPieConfigurationData();
    expect(component.widgetInfo.chartProperties.isEnableLegend).toBe(true);
    // expect(component.widgetInfo.chartProperties.legendPosition).toBe(component.chart.chart.options.legend.position);

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
    component.imageChart = baseChart;
    component.getPieConfigurationData();
    expect(component.widgetInfo.chartProperties.isEnableDatalabels).toBe(true);

    component.pieChartOptions.plugins.piechartLabels.scrollHeight(10);
    expect(component.scrollHeight).toBe(10);
  }));

  it('ngOnInit(),  should enable pre required on this component', async(() => {
    component.widgetId = 12345;
    component.widgetInfo.widgetType = WidgetType.PIE_CHART;
    component.widgetInfo.widgetId = component.widgetId.toString();
    component.widgetInfo.objectType = '1005';
    component.widgetInfo.field = 'MATL_TYPE';
    component.userDetails = { defLocs: ['abcd'] } as Userdetails;
    spyOn(component, 'getPieChartData');
    component.widgetInfo.widgetAdditionalProperties = { displayCriteria: DisplayCriteria.CODE_TEXT } as WidgetAdditionalProperty;
    component.widgetInfo.widgetColorPalette = new WidgetColorPalette();
    spyOn(userService, 'getUserDetails').withArgs().and.returnValue(of({ defLocs: ['abc'] } as Userdetails));
    component.ngOnInit();
    expect(component.chartLegend.length).toEqual(0, 'Initial pie legend length should be 0');
    expect(component.lablels.length).toEqual(0, 'Initial pie lebels length should 0');
    expect(component.pieChartData[0].data.length).toEqual(6, 'Initial pie data  length should 6');
    expect(component.displayCriteriaOption).toEqual(component.widgetInfo.widgetAdditionalProperties.displayCriteria);
    expect(component.widgetColorPalette).toEqual(component.widgetInfo.widgetColorPalette);
    expect(userService.getUserDetails).toHaveBeenCalled();
  }));

  it('legendClick(), should show paticular stack , after click on stack', async(() => {
    // call stack click with no argument then filter criteria should be [] array
    component.filterCriteria = [];
    const legendItem = {} as LegendItem;
    legendItem.datasetIndex = 0;
    // component.chartLegend = [{'legendIndex': 0, 'code':'HERS', 'text':'test'}];
    component.legendClick(legendItem);
    expect(component.filterCriteria.length).toEqual(0);

    component.filterCriteria = [];
    component.chartLegend = [{ code: 'MATL_TYPE', text: 'MATL_TYPE', legendIndex: 0 }];
    const legendItem1 = {} as LegendItem;
    legendItem.datasetIndex = 0;
    component.widgetInfo.chartProperties.blankValueAlias = 'MATL_TYPE';
    component.legendClick(legendItem1);
    expect(component.filterCriteria.length).toEqual(0);

    // mock data
    component.chartLegend = [{ code: 'ZMRO', text: 'ZMRO', legendIndex: 0 }];
    component.filterCriteria = [];
    component.widgetInfo.field = 'MATL_TYPE';
    component.widgetInfo.fieldCtrl = { dataType: 'char' } as MetadataModel;
    component.filterCriteria = [];
    component.legendClick(legendItem);
    // after apply filter criteria then filtercriteria length should be 1
    expect(component.filterCriteria.length).toEqual(1, 'after apply filter criteria then filtercriteria length should be 1');

    component.widgetInfo.fieldCtrl = { dataType: 'DATS' } as MetadataModel;
    component.filterCriteria = [{ blockType: 'COND', conditionFieldId: 'MATL_TYPE', conditionFieldValue: '4', conditionOperator: 'EQUAL', fieldId: 'MATL_TYPE', widgetType: WidgetType.PIE_CHART } as Criteria];
    component.legendClick(legendItem);
    expect(component.filterCriteria.length).toEqual(2, 'after apply filter criteria then filtercriteria length should be 2');
  }));

  it('should test downloadCSV()', async(() => {
    component.lablels = ['No'];
    component.widgetInfo.field = 'CLAIMED';
    component.widgetInfo.fieldCtrl = { fieldDescri: 'Claimed', fieldId: 'CLAIMED' } as MetadataModel;
    component.dataSet = ['1870'];
    const excelData = [{ Claimed: 'No	', Value: '1,870	' }];
    spyOn(widgetService, 'downloadCSV').withArgs('Pie-Chart', excelData);
    component.downloadCSV();
    expect(widgetService.downloadCSV).toHaveBeenCalledWith('Pie-Chart', excelData);
  }));

  it('getFieldsMetadaDesc(), get description of field', async(() => {
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
    baseChart.data = { datasets: [{} as any] };
    component.chart = baseChart;
    component.imageChart = baseChart;
    const buckets = [{ key: '200010', doc_count: 10744, 'top_hits#items': { hits: { total: { value: 10744, relation: 'eq' }, max_score: 1.0, hits: [{ _source: { hdvs: { MATL_GROUP: { fId: 'MATL_GROUP', lls: { EN: { label: 'Material Group' } }, vls: { EN: { valueTxt: '200010' } }, vc: [{ c: '200010', t: 'testing' }] } } } }] } } }, { key: '200030', doc_count: 775, 'top_hits#items': { hits: { total: { value: 775, relation: 'eq' }, max_score: 1.0, hits: [{ _source: { staticFields: { MATL_GROUP: { fId: 'MATL_GROUP', lls: { EN: { label: 'Material Group' } }, vls: { EN: { valueTxt: '200030' } }, vc: [{ c: '200030' }] } } } }] } } }, { key: '200030', 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { MATL_GROUP: {} } } }] } } }];

    component.widgetInfo.field = 'MATL_GROUP';
    component.lablels = [];
    // call actual method
    component.getFieldsMetadaDesc(buckets);
    expect(component.chartLegend.length).toEqual(3);

    component.widgetInfo.field = 'MATL_GROUP';
    component.lablels = ['testing', '200030'];
    // call actual method
    component.getFieldsMetadaDesc(buckets);

    expect(component.lablels.length).toEqual(3);
    expect(component.chartLegend.length).toEqual(3);

    const buckets1 = [{ key: '200030', 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { OVERDUE: { vc: [{ c: '1' }] } } } }] } } }];
    component.widgetInfo.field = 'OVERDUE';
    component.lablels = ['YES'];
    // call actual method
    component.getFieldsMetadaDesc(buckets1);
    expect(component.lablels.length).toEqual(1);
    expect(component.chartLegend.length).toEqual(1);
  }));

  it('getDateFieldsDesc(), get description of field', async(() => {
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
    baseChart.data = { datasets: [{} as any] };
    component.chart = baseChart;
    component.imageChart = baseChart;
    const buckets = [{ key: '200010', doc_count: 10744, 'top_hits#items': { hits: { total: { value: 10744, relation: 'eq' }, max_score: 1.0, hits: [{ _source: { hdvs: { MATL_GROUP: { fId: 'MATL_GROUP', lls: { EN: { label: 'Material Group' } }, vls: { EN: { valueTxt: '200010' } }, vc: [{ c: '1600709041279' }] } } } }] } } }, { key: '200030', doc_count: 775, 'top_hits#items': { hits: { total: { value: 775, relation: 'eq' }, max_score: 1.0, hits: [{ _source: { hdvs: { MATL_GROUP: { fId: 'MATL_GROUP', lls: { EN: { label: 'Material Group' } }, vls: { EN: { valueTxt: '200030' } }, vc: [{ c: '1600709041279' }] } } } }] } } }];

    component.widgetInfo.field = 'MATL_GROUP';
    component.lablels = ['200010', '200030'];
    // call actual method
    component.getDateFieldsDesc(buckets);

    expect(component.lablels.length).toEqual(2);
    expect(component.chartLegend.length).toEqual(2);
  }));

  it('getPieChartData(), get pie chart data', async(() => {
    component.reportId = '1245' as any;
    const service = fixture.debugElement.injector.get(WidgetService);
    const buckets = { aggregations: { 'sterms#BAR_CHART': { buckets: [{ key: '200010', doc_count: 10744, 'top_hits#items': { hits: { total: { value: 10744, relation: 'eq' }, max_score: 1.0, hits: [{ _source: { hdvs: { MATL_GROUP: { fId: 'MATL_GROUP', lls: { EN: { label: 'Material Group' } }, vls: { EN: { valueTxt: '200010' } }, vc: [{ c: '200010' }] } } } }] } } }, { key: '200030', doc_count: 775, 'top_hits#items': { hits: { total: { value: 775, relation: 'eq' }, max_score: 1.0, hits: [{ _source: { hdvs: { MATL_GROUP: { fId: 'MATL_GROUP', lls: { EN: { label: 'Material Group' } }, vls: { EN: { valueTxt: '200030' } }, vc: [{ c: '200030' }] } } } }] } } }] } } };
    const viewRes: any = { acknowledged: true, payload: { uuid: '703606229926', reportId: 1245, widgetId: 1234, userName: 'INITIATOR', tenantCode: '0', createdAt: 1636330129885, updatedAt: 1636587006600, view: 'GRAPH' } };
    component.isFetchingData = true;
    component.userDetails = { defLocs: ['abc'] } as Userdetails;
    spyOn(service, 'getWidgetData').withArgs('1234', [], '', '', '', component.userDetails.defLocs.toString()).and.returnValue(of(buckets));
    spyOn(service, 'getWidgetView').withArgs('1245', '1234').and.returnValue(of(viewRes));
    component.widgetInfo.field = 'MATL_GROUP';
    component.widgetInfo.fieldCtrl = { fieldId: 'MATL_GROUP', picklist: '30' } as MetadataModel;

    component.widgetColorPalette = new WidgetColorPalette();

    component.getPieChartData(1234, []);

    expect(service.getWidgetData).toHaveBeenCalledWith('1234', [], '', '', '', component.userDetails.defLocs.toString());
    expect(service.getWidgetView).toHaveBeenCalledWith('1245', '1234');
  }));

  it('updateChart(), should update chart', async(() => {
    component.returndata = { aggregations: { 'sterms#BAR_CHART': { buckets: [{ key: '200010', doc_count: 10744, 'top_hits#items': { hits: { total: { value: 10744, relation: 'eq' }, max_score: 1.0, hits: [{ _source: { hdvs: { MATL_GROUP: { fId: 'MATL_GROUP', lls: { EN: { label: 'Material Group' } }, vls: { EN: { valueTxt: '200010' } }, vc: [{ c: '200010' }] } } } }] } } }, { key: '200030', doc_count: 775, 'top_hits#items': { hits: { total: { value: 775, relation: 'eq' }, max_score: 1.0, hits: [{ _source: { hdvs: { MATL_GROUP: { fId: 'MATL_GROUP', lls: { EN: { label: 'Material Group' } }, vls: { EN: { valueTxt: '200030' } }, vc: [{ c: '200030' }] } } } }] } } }] } } };
    component.isFetchingData = true;
    component.userDetails = { defLocs: ['abc'] } as Userdetails;
    component.widgetInfo.field = 'MATL_GROUP';
    component.widgetInfo.fieldCtrl = { fieldId: 'MATL_GROUP', picklist: '30' } as MetadataModel;

    component.widgetColorPalette = new WidgetColorPalette();
    component.widgetInfo.chartProperties.isEnableDatalabels = true;
    component.widgetInfo.chartProperties.isEnabledBarPerc = true;

    component.updateChart(component.returndata);
    expect(component.lablels).not.toEqual([]);
    expect(component.total).toEqual(11519);

    component.widgetInfo.chartProperties.isEnabledBarPerc = false;
    component.total = 0;
    component.returndata = { _shards: { total: 1, failed: 0, successful: 1, skipped: 0 }, hits: { hits: [], total: { value: 10000, relation: 'gte' }, max_score: null }, took: 27, timed_out: false, aggregations: { 'nested#nested_tags': { doc_count: 161, 'sterms#BAR_CHART': { doc_count_error_upper_bound: 0, sum_other_doc_count: 25, buckets: [{ doc_count: 3, key: '2688', 'top_hits#items': { hits: { hits: [{ _index: 'mdoqa.masterdataonline.com_1005_do_0_en', _type: '_doc', _source: { PLAN_SUB_ID1: { vc: [{ c: '2688' }] } }, _id: 'ERSA9', _nested: { field: 'gvs.PLANT_SUB_GRID_1017.rows', offset: 0 }, _score: 1 }], total: { value: 3, relation: 'eq' }, max_score: 1 } } }, { doc_count: 3, key: '2687', 'top_hits#items': { hits: { hits: [{ _index: 'mdoqa.masterdataonline.com_1005_do_0_en', _type: '_doc', _source: { PLAN_SUB_ID1: { vc: [{ c: '2687' }] } }, _id: 'ERSA8', _nested: { field: 'gvs.PLANT_SUB_GRID_1017.rows', offset: 0 }, _score: 1 }], total: { value: 3, relation: 'eq' }, max_score: 1 } } }, { doc_count: 3, key: '2686', 'top_hits#items': { hits: { hits: [{ _index: 'mdoqa.masterdataonline.com_1005_do_0_en', _type: '_doc', _source: { PLAN_SUB_ID1: { vc: [{ c: '2686' }] } }, _id: 'ERSA7', _nested: { field: 'gvs.PLANT_SUB_GRID_1017.rows', offset: 0 }, _score: 1 }], total: { value: 3, relation: 'eq' }, max_score: 1 } } }, { doc_count: 4, key: '2685', 'top_hits#items': { hits: { hits: [{ _index: 'mdoqa.masterdataonline.com_1005_do_0_en', _type: '_doc', _source: { PLAN_SUB_ID1: { vc: [{ c: '2685' }] } }, _id: 'ERSA6', _nested: { field: 'gvs.PLANT_SUB_GRID_1017.rows', offset: 0 }, _score: 1 }], total: { value: 4, relation: 'eq' }, max_score: 1 } } }, { doc_count: 24, key: '2684', 'top_hits#items': { hits: { hits: [{ _index: 'mdoqa.masterdataonline.com_1005_do_0_en', _type: '_doc', _source: { PLAN_SUB_ID1: { vc: [{ c: '2684' }] } }, _id: 'ERSA5', _nested: { field: 'gvs.PLANT_SUB_GRID_1017.rows', offset: 0 }, _score: 1 }], total: { value: 24, relation: 'eq' }, max_score: 1 } } }, { doc_count: 1, key: '039', 'top_hits#items': { hits: { hits: [{ _index: 'mdoqa.masterdataonline.com_1005_do_0_en', _type: '_doc', _source: { PLAN_SUB_ID1: { vc: [{ c: '039' }] } }, _id: 'ERSA140', _nested: { field: 'gvs.PLANT_SUB_GRID_1017.rows', offset: 0 }, _score: 1 }], total: { value: 1, relation: 'eq' }, max_score: 1 } } }, { doc_count: 1, key: '038', 'top_hits#items': { hits: { hits: [{ _index: 'mdoqa.masterdataonline.com_1005_do_0_en', _type: '_doc', _source: { PLAN_SUB_ID1: { vc: [{ c: '038' }] } }, _id: 'ERSA138', _nested: { field: 'gvs.PLANT_SUB_GRID_1017.rows', offset: 2 }, _score: 1 }], total: { value: 1, relation: 'eq' }, max_score: 1 } } }, { doc_count: 1, key: '037', 'top_hits#items': { hits: { hits: [{ _index: 'mdoqa.masterdataonline.com_1005_do_0_en', _type: '_doc', _source: { PLAN_SUB_ID1: { vc: [{ c: '037' }] } }, _id: 'ERSA136', _nested: { field: 'gvs.PLANT_SUB_GRID_1017.rows', offset: 2 }, _score: 1 }], total: { value: 1, relation: 'eq' }, max_score: 1 } } }, { doc_count: 1, key: '036', 'top_hits#items': { hits: { hits: [{ _index: 'mdoqa.masterdataonline.com_1005_do_0_en', _type: '_doc', _source: { PLAN_SUB_ID1: { vc: [{ c: '036' }] } }, _id: 'ERSA139', _nested: { field: 'gvs.PLANT_SUB_GRID_1017.rows', offset: 2 }, _score: 1 }], total: { value: 1, relation: 'eq' }, max_score: 1 } } }, { doc_count: 1, key: '035', 'top_hits#items': { hits: { hits: [{ _index: 'mdoqa.masterdataonline.com_1005_do_0_en', _type: '_doc', _source: { PLAN_SUB_ID1: { vc: [{ c: '035' }] } }, _id: 'ERSA134', _nested: { field: 'gvs.PLANT_SUB_GRID_1017.rows', offset: 1 }, _score: 1 }], total: { value: 1, relation: 'eq' }, max_score: 1 } } }] } } } };

    component.updateChart(component.returndata);
    expect(component.total).toEqual(0);
  }));

  it('openColorPalette(), should open color palette dialog', async(() => {
    component.widgetId = 72366423;
    component.reportId = 65631624;
    component.widgetInfo.widgetTitle = 'Stacked bar Chart';
    component.pieChartData = [
      {
        fieldCode: 'HAWA',
        backgroundColor: '#f1f1f1',
        label: 'Hawa material',
        data: [213, 324, 223423]
      }
    ];
    component.chartLegend = [{
      code: 'HAWA',
      legendIndex: 0,
      text: 'Testing'
    }]
    component.openColorPalette();
    expect(mockMatDialogOpen.open).toHaveBeenCalled();
  }));

  it('updateColorBasedOnDefined(), update color based on defination ', async(() => {
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
    baseChart.data = { datasets: [{} as any] };
    component.chart = baseChart;
    component.imageChart = baseChart;
    const req: WidgetColorPalette = new WidgetColorPalette();
    req.widgetId = '23467283';
    component.pieChartData = [
      {
        fieldCode: 'HAWA',
        backgroundColor: '#f1f1f1',
        label: 'Hawa material',
        data: [213, 324, 223423]
      }
    ];
    component.chartLegend = [{
      code: 'HAWA',
      legendIndex: 0,
      text: 'Testing'
    }]
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

  it('ngOnChanges(), while change rule type', async(() => {
    // mock data
    component.filterCriteria = [];
    component.editedMode = true;
    component.widgetId = 12345;
    const changes: import('@angular/core').SimpleChanges = { filterCriteria: { currentValue: true, previousValue: false, firstChange: null, isFirstChange: null }, boxSize: { currentValue: 35, previousValue: 26, firstChange: null, isFirstChange: null }, widgetInfo: { currentValue: { field: 'MATL' }, previousValue: { field: 'DATS' }, firstChange: null, isFirstChange: null } };
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

  it('applyDateFilter()', async(() => {
    const startDate = '1588204800000';
    const fieldId = 'REQUESTOR_DATE';
    const res = component.applyDateFilter(startDate, fieldId);
    expect(res.conditionFieldEndValue).toEqual('1588291200000');
  }));

  it('viewChange(), should change widget view', async () => {
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
  });

  it('saveDisplayCriteria(), should call saveDisplayCriteria', async(() => {
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
    baseChart.options = { scales: { xAxes: {}, yAxes: {} }, plugins: {} };
    baseChart.data = { datasets: [{} as any], labels: [] };
    component.chart = baseChart;
    component.imageChart = baseChart;
    component.displayCriteriaOption = DisplayCriteria.TEXT;
    component.widgetInfo.field = 'DATECREATED';
    component.widgetInfo.fieldCtrl = { fieldId: 'DATECREATED', picklist: '0', dataType: 'DTMS' } as MetadataModel;
    component.widgetId = 12345;
    component.widgetInfo.widgetType = WidgetType.FILTER;
    component.widgetInfo.widgetId = component.widgetId.toString();
    component.returndata = { aggregations: { 'sterms#BAR_CHART': { buckets: [{ doc_count: 1, key: 'IT', 'top_hits#items': { hits: { hits: [{ _source: { DATECREATED: { vc: [{ c: '1234567890' }] } } }] } } }, { doc_count: 1, key: 'I', 'top_hits#items': { hits: { hits: [{ _source: { DATECREATED: { vc: [{ c: '0987654321' }] } } }] } } }] } } };
    spyOn(widgetService, 'saveDisplayCriteria').withArgs(component.widgetInfo.widgetId, component.widgetInfo.widgetType, component.displayCriteriaOption).and.returnValue(of({}));

    component.saveDisplayCriteria();

    expect(widgetService.saveDisplayCriteria).toHaveBeenCalledWith('12345', WidgetType.FILTER, DisplayCriteria.TEXT);
  }));

  it('getFieldsDesc()', async(() => {
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
    baseChart.data = { datasets: [{} as any] };
    component.chart = baseChart;
    component.imageChart = baseChart;
    const buckets = [{ key: '200010', doc_count: 10744, 'top_hits#items': { hits: { total: { value: 10744, relation: 'eq' }, max_score: 1.0, hits: [{ _source: { hdvs: { MATL_GROUP: { fId: 'MATL_GROUP', lls: { EN: { label: 'Material Group' } }, vls: { EN: { valueTxt: '200010' } }, vc: [{ c: '200010', t: 'testing' }] } } } }] } } }, { key: '200030', doc_count: 775, 'top_hits#items': { hits: { total: { value: 775, relation: 'eq' }, max_score: 1.0, hits: [{ _source: { staticFields: { MATL_GROUP: { fId: 'MATL_GROUP', lls: { EN: { label: 'Material Group' } }, vls: { EN: { valueTxt: '200030' } }, vc: [{ c: '200030' }] } } } }] } } }, { key: '200030', 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { MATL_GROUP: {} } } }] } } }];

    component.widgetInfo.field = 'MATL_GROUP';
    component.widgetInfo.fieldCtrl = { fieldId: 'MATL_GROUP', picklist: '0' } as MetadataModel;
    component.lablels = [];
    // call actual method
    component.getFieldsDesc(buckets);
    expect(component.chartLegend.length).toEqual(3);

    component.widgetInfo.field = 'MATL_TYPE';
    component.widgetInfo.fieldCtrl = { fieldId: 'MATL_TYPE', picklist: '0' } as MetadataModel;

    expect(component.chartLegend.length).toEqual(3);

    const buckets1 = [{ key: '200030', 'top_hits#items': { hits: { hits: [{ _source: { staticFields: { OVERDUE: { vc: [{ c: '1' }] } } } }] } } }];
    component.widgetInfo.field = 'OVERDUE';
    component.widgetInfo.fieldCtrl = { fieldId: 'OVERDUE', picklist: '35' } as MetadataModel;
    component.lablels = ['YES'];

    // call actual method
    component.getFieldsDesc(buckets1);

    expect(component.chartLegend.length).toEqual(4);
  }));

  it('setLables', async(() => {
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
    baseChart.data = { datasets: [{} as any] };
    component.chart = baseChart;
    component.imageChart = baseChart;
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

  it('getColor(), get pie chart color', async(() => {
    component.pieChartData = [
      {
        fieldCode: 'MATL_TYPE',
        backgroundColor: '#f1f1f1',
        label: 'Material Type',
        data: [213, 324, 223423]
      }
    ];

    component.chartLegend = [{ code: 'MATL_TYPE', legendIndex: 0, text: 'Material Type' }];
    expect(component.pieChartColors.length).toEqual(1);
  }));

  it('downloadImage()', async () => {
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    const eleRef = new ElementRef(htmlnative.getElementsByTagName('canvas')[0]);
    const baseChart = new BaseChartDirective(eleRef, zone, new ThemeService());
    baseChart.data = { datasets: [{} as any] };
    component.chart = baseChart;
    component.imageChart = baseChart;
    spyOn(widgetService, 'downloadImage').withArgs(component.chart.toBase64Image(), 'Pie-Chart.png');
    component.downloadImage();
    expect(widgetService.downloadImage).toHaveBeenCalledWith(component.chart.toBase64Image(), 'Pie-Chart.png');
  });

  it('downloadImage(), Should display legend on image', () => {
    component.pieChartData = [
      {
        fieldCode: 'HAWA',
        backgroundColor: '#f1f1f1',
        label: 'Hawa material',
        data: [213, 324, 223423]
      }
    ];
    component.lablels = ['Hawa material', 'Computers', null]
    component.legendList = [{ lablel: 'Hawa material', backgroundColor: '#', datasetIndex: 0, show: true }, { lablel: 'Computers', backgroundColor: 'f', datasetIndex: 1, show: true }, { lablel: 'undefined', backgroundColor: '1', datasetIndex: 2, show: true }];
    component.widgetInfo.chartProperties.isEnableLegend = true;
    component.widgetInfo.chartProperties.legendPosition = LegendPosition.top;
    component.widgetInfo.chartProperties.isEnableDatalabels = true;
    const canvas = document.createElement('canvas');
    htmlnative.append(canvas);
    component.getPieConfigurationData();
    fixture.detectChanges();
    // spyOn(component.imageChart, 'update');
    spyOn(window, 'setTimeout');
    component.downloadImage();
    // expect(component.imageChart.update).toHaveBeenCalled();
    expect(window.setTimeout).toHaveBeenCalled();
  });

  it('getLegendData()', () => {
    component.pieChartData = [
      {
        fieldCode: 'HAWA',
        backgroundColor: '#f1f1f1',
        label: 'Hawa material',
        data: [213, 324, 223423]
      }
    ];
    component.lablels = ['Hawa material', 'Computers', null]
    component.widgetInfo.chartProperties.isEnableLegend = true;
    component.widgetInfo.chartProperties.legendPosition = LegendPosition.top;
    fixture.detectChanges();
    component.getLegendData();
    expect(component.legendList).toEqual([{ lablel: 'Hawa material', backgroundColor: '#', datasetIndex: 0, show: true }, { lablel: 'Computers', backgroundColor: 'f', datasetIndex: 1, show: true }, { lablel: 'undefined', backgroundColor: '1', datasetIndex: 2, show: true }]);

    component.widgetInfo.chartProperties.legendPosition = LegendPosition.right;
    component.getLegendData();
    expect(component.legendList).toEqual([{ lablel: 'Hawa material', backgroundColor: '#', datasetIndex: 0, show: true }, { lablel: 'Computers', backgroundColor: 'f', datasetIndex: 1, show: true }, { lablel: 'undefined', backgroundColor: '1', datasetIndex: 2, show: true }]);
  });
});
