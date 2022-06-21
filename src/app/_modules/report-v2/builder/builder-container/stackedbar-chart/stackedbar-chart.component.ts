import { Component, OnInit, OnChanges, OnDestroy, ViewChild, LOCALE_ID, Inject, SimpleChanges } from '@angular/core';
import { ChartOptions, LegendItem, TooltipItem, ChartEvent } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { WidgetService } from 'src/app/_services/widgets/widget.service';
import { GenericWidgetComponent } from '../../generic-widget/generic-widget.component';
import { BehaviorSubject, forkJoin, Subscription } from 'rxjs';
import { Criteria, BlockType, ConditionOperator, ChartLegend, Orientation, OrderWith, WidgetColorPalette, DisplayCriteria, WidgetType, DatalabelsPosition, WidgetView, WidgetViewRequestPayload } from '../../../_models/widget';
import { ReportService } from '../../../_service/report.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Userdetails } from '@models/userdetails';
import { UserService } from '@services/user/userservice.service';
import _ from 'lodash';
import { formatNumber } from '@angular/common';
import { WidgetViewDetails } from '@modules/report/_models/widget';
import { distinctUntilChanged } from 'rxjs/operators';
import { Context } from 'chartjs-plugin-datalabels';
import { MatMenuItem } from '@angular/material/menu';

@Component({
  selector: 'pros-stackedbar-chart',
  templateUrl: './stackedbar-chart.component.html',
  styleUrls: ['./stackedbar-chart.component.scss']
})
export class StackedbarChartComponent extends GenericWidgetComponent implements OnInit, OnChanges, OnDestroy {

  displayCriteriaOptions = [
    {
      key: 'Text',
      value: DisplayCriteria.TEXT
    },
    {
      key: 'Code',
      value: DisplayCriteria.CODE
    },
    {
      key: 'Code and Text',
      value: DisplayCriteria.CODE_TEXT
    }
  ];
  displayCriteriaOption: DisplayCriteria = this.displayCriteriaOptions[0].value;
  orientation = 'bar';
  stackBardata: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  stackbarLegend: ChartLegend[] = [];
  stachbarAxis: ChartLegend[] = [];
  public codeTextaxis1 = {} as any;
  public codeTextaxis2 = {} as any;
  dataObj = new Object();
  labels: string[] = new Array();
  arrayBuckets: any[];
  listxAxis2: any[] = new Array();
  barChartLabels: string[] = new Array();
  barChartData: any[] = [{ data: [0, 0, 0, 0, 0], label: 'Loading..', stack: 'a' }];
  labelTooltipCharLimit = 15;
  barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
          right: 20
      }
    },
    interaction: {
      mode: 'nearest'
    },
    parsing: {
      xAxisKeys: 'x',
      yAxisKeys: 'y'
    },
    animation: false,
    normalized: true,
    onClick: (event?: ChartEvent, activeElements?: Array<{}>) => {
      this.stackClickFilter(event.native, activeElements);
    },
    plugins: {
      datalabels: {
        display: false,
        clip: true, // This property hides lables going beyond chart area
        formatter: (value, context: Context) => {
          if (context.chart.options.indexAxis === 'y') {
            return value ? value.x : '';
          }
          return value ? value.y : '';
        },
      },
      legend: {
        display: false,
        onClick: (event: ChartEvent, legendItem: LegendItem) => {
          // call protype of stacked bar chart componenet
          this.legendClick(legendItem);
        }
      },
      tooltip: {
        // mode: 'nearest',
        callbacks: {
          label: (tooltipItem: TooltipItem<any>) => {
            const dstLabel = tooltipItem.dataset.label;
            const yLabel = tooltipItem.formattedValue;
            return dstLabel + ': ' + yLabel;
          }
        }
      },
    },
    scales: {
      x: {
        title: {
          display: false
        },
        stacked: true,
        ticks: {
          minRotation: 0,
          maxRotation: 50
        }
      },
      y: {
        title: {
          display: false
        },
        stacked: true
      }
    }
  };
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;
  @ViewChild('imageChart', { read: BaseChartDirective }) imageChart: BaseChartDirective;
  @ViewChild('viewasItem') viewasItem: MatMenuItem;
  returnData: any;
  subscriptions: Subscription[] = [];
  isTableView: boolean;
  widgetViewDetails: WidgetViewDetails;
  dataSource = [] as any[];
  displayedColumnsId: string[] = [];
  userDetails: Userdetails;
  legendCodeTextList = [];

  constructor(
    private widgetService: WidgetService,
    private reportService: ReportService,
    private snackBar: MatSnackBar,
    @Inject(LOCALE_ID) public locale: string,
    public matDialog: MatDialog,
    private userService: UserService
  ) {
    super(matDialog);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.filterCriteria && changes.filterCriteria.previousValue !== undefined && changes.filterCriteria.currentValue !== changes.filterCriteria.previousValue && !this.widgetInfo.isEnableGlobalFilter && !changes.filterCriteria.isFirstChange()) {
      this.resetChart();
      if (this.userDetails) {
        this.filterCriteria = this.filterCriteria.filter(item => item.fieldId !== '__DIW_STATUS');
        this.isFetchingData = true;
        this.getstackbarChartData(this.widgetId, this.filterCriteria);
      }
    }

    if (changes && changes.boxSize && changes.boxSize.previousValue !== changes.boxSize.currentValue) {
      this.boxSize = changes.boxSize.currentValue;
    }

    if (changes && changes.widgetInfo && changes.widgetInfo.previousValue !== undefined && !_.isEqual(changes.widgetInfo.previousValue, changes.widgetInfo.currentValue)) {
      this.resetChart();
      this.getBarConfigurationData();
      this.getstackbarChartData(this.widgetId, this.filterCriteria);
    }
  }

  ngOnInit(): void {
    if (this.widgetInfo.widgetColorPalette) {
      this.widgetColorPalette = this.widgetInfo.widgetColorPalette;
    }

    if (this.widgetInfo.widgetAdditionalProperties && this.widgetInfo.widgetAdditionalProperties.displayCriteria) {
      this.displayCriteriaOption = this.widgetInfo.widgetAdditionalProperties.displayCriteria;
    }

    this.getBarConfigurationData();

    this.stackBardata.subscribe(data => {
      if (data && this.barChartData.length === 0) {
        if (Object.keys(this.codeTextaxis1).length === 0 && this.widgetInfo.groupByIdCtrl && (this.widgetInfo.groupByIdCtrl.picklist === '0' || (this.widgetInfo.groupByIdCtrl.picklist === '52' || this.widgetInfo.groupByIdCtrl.picklist === '53'))) {
          this.getDateFieldsDesc1(this.widgetInfo.groupById);
        } else if (Object.keys(this.codeTextaxis1).length === 0 && this.widgetInfo.groupByIdCtrl && (this.widgetInfo.groupByIdCtrl.picklist === '1' || this.widgetInfo.groupByIdCtrl.picklist === '37' || this.widgetInfo.groupByIdCtrl.picklist === '30')) {
          this.getFieldsMetadaDescaxis1(this.widgetInfo.groupById);
        } else if (Object.keys(this.codeTextaxis1).length === 0 && this.widgetInfo.groupByIdCtrl?.picklist === '0') {
          this.getFieldsMetadaDescaxis1ForNonFld(this.widgetInfo.groupById);
        }
        else {
          this.updateLabelsaxis1();
        }

        if (Object.keys(this.codeTextaxis2).length === 0 && this.widgetInfo.fieldCtrl && (this.widgetInfo.fieldCtrl.picklist === '0' || (this.widgetInfo.fieldCtrl.picklist === '52' || this.widgetInfo.fieldCtrl.picklist === '53'))) {
          this.getDateFieldsDesc2(this.widgetInfo.field);
        } else if (Object.keys(this.codeTextaxis2).length === 0 && this.widgetInfo.fieldCtrl != null && (this.widgetInfo.fieldCtrl.picklist === '1' || this.widgetInfo.fieldCtrl.picklist === '37' || this.widgetInfo.fieldCtrl.picklist === '30')) {
          this.getFieldsMetadaDescaxis2(this.widgetInfo.field);
        } else if (Object.keys(this.codeTextaxis2).length === 0 && this.widgetInfo.fieldCtrl != null && this.widgetInfo.fieldCtrl.picklist === '0') {
          this.getFieldsMetadaDescaxis2Nondef(this.widgetInfo.field);
        } else {
          this.updateLabelsaxis2();
        }
      } else {
        this.updateLabelsaxis1();
      }

      // update chart after data sets change
      if (this.chart) {
        try {
          this.chart.data.labels = this.barChartLabels;
          this.chart.data.datasets = this.barChartData;
          this.chart.update();
        } catch (ex) { console.error(`Error : ${ex}`) }
      }

    });

    // after color defined update on widget
    const afterColorDefined = this.afterColorDefined.subscribe(res => {
      if (res) {
        this.updateColorBasedOnDefined(res);
      }
    });
    this.subscriptions.push(afterColorDefined);

    const getUserDetails = this.userService.getUserDetails().pipe(distinctUntilChanged()).subscribe(
      (response: Userdetails) => {
        if (!_.isEqual(this.userDetails, response)) {
          this.userDetails = response;
          if (this.widgetInfo.objectType && this.widgetInfo.field) {
            this.isFetchingData = true;
            this.resetChart();
            this.getstackbarChartData(this.widgetId, this.filterCriteria);
          }
        }
      }
    );
    this.subscriptions.push(getUserDetails);
  }

  public getBarConfigurationData(): void {
    // bar orientation based on orientation value
    this.orientation = this.widgetInfo.chartProperties.orientation === 'VERTICAL' ? 'bar' : 'horizontalBar';

    // if showLegend flag will be true it show legend on Stacked bar widget
    if (this.widgetInfo.chartProperties.isEnableLegend) {
      this.barChartOptions.plugins.legend = {
        ...this.barChartOptions.plugins.legend,
        display: true,
        position: this.widgetInfo.chartProperties.legendPosition,
      };
    } else {
      this.barChartOptions.plugins.legend = {
        ...this.barChartOptions.plugins.legend,
        display: false
      };
    }

    if (this.chart) {
      this.chart.options.plugins.legend = this.barChartOptions.plugins.legend;
      this.chart.chart.options.plugins.legend = this.barChartOptions.plugins.legend;
    }
    // if showCountOnStack flag will be true it show datalables on stack and position of datalables also configurable
    if (this.widgetInfo.chartProperties.isEnableDatalabels) {
      this.barChartOptions.plugins.datalabels = {
        ...this.barChartOptions.plugins.datalabels,
        formatter(value, context) {
          // return value ? formatNumber(Number(value.y), 'en-US') : '';
          if (context.chart.options.indexAxis === 'y') {
            return value ? formatNumber(value.x, 'en-US') : '';
          }
          return value ? formatNumber(value.y, 'en-US') : '';
        },
        align: this.widgetInfo.chartProperties.datalabelsPosition,
        anchor: this.widgetInfo.chartProperties.datalabelsPosition,
        display: 'auto'
      };
      if (this.widgetInfo.chartProperties.datalabelsPosition === DatalabelsPosition.end) {
        // Datalabel was being cut off the screen when the height was small.
        this.barChartOptions.plugins.datalabels.offset = -4;
        this.barChartOptions.plugins.datalabels.padding = 0;
      }
    } else {
      this.barChartOptions.plugins.datalabels = {
        ...this.barChartOptions.plugins.datalabels,
        display: false
      }
    }

    if (this.chart) {
      this.chart.options.plugins.datalabels = this.barChartOptions.plugins.datalabels;
      this.chart.chart.options.plugins.datalabels = this.barChartOptions.plugins.datalabels;
    }

    if (this.widgetInfo.chartProperties.isEnableBenchMark){
      const annotation = {
        type: 'line',
        borderWidth: 1,
        borderColor: 'black',
        value: this.widgetInfo.chartProperties.benchMarkValue
      } as any;
      if (this.widgetInfo.chartProperties.orientation === Orientation.VERTICAL){
        annotation.scaleID = 'y';
      } else {
        annotation.scaleID = 'x';
      }
      this.barChartOptions.plugins.annotation = {annotations:[annotation]};
    } else {
      this.barChartOptions.plugins.annotation = {
        annotations : []
     }
    }
    if (this.chart) {
      this.chart.options.plugins.annotation = this.barChartOptions.plugins.annotation;
      this.chart.chart.options.plugins.annotation = this.barChartOptions.plugins.annotation;
    }


    // show axis labels and scales range
    this.setChartAxisAndScaleRange();
  }

  public getstackbarChartData(widgetId: number, criteria: Criteria[]): void {
    forkJoin([this.widgetService.getWidgetData(String(widgetId), criteria, '', '', '', this.userDetails?.defLocs?.toString()), this.widgetService.getWidgetView(String(this.reportId), String(widgetId))]).subscribe(res => {
      this.widgetViewDetails = res[1];
      this.returnData = res[0];
      this.isFetchingData = false;
      this.updateChart(this.returnData);
    }, err => {
      this.isFetchingData = false;
    });
  }

  private resetChart() {
    // reset while filter applied
    this.stackbarLegend = [];
    this.stachbarAxis = [];
    this.barChartLabels = new Array();
    this.listxAxis2 = new Array();
    this.labels = [];
    this.codeTextaxis1 = {};
    this.codeTextaxis2 = {};
    this.barChartData = [{ data: [{ x: 0, y: 0 }], label: 'Loading..', stack: 'a', barThickness: 'flex' }];
  }

  private updateChart(returnData) {
    const res = Object.keys(returnData.aggregations);
    this.arrayBuckets = returnData.aggregations[res[0]] ? returnData.aggregations[res[0]].buckets : [];
    if (!this.arrayBuckets) {
      const buckets1 = returnData.aggregations['nested#nested_tags'] ? returnData.aggregations['nested#nested_tags'] : [];
      this.arrayBuckets = buckets1['composite#STACKED_BAR_CHART'] ? buckets1['composite#STACKED_BAR_CHART'].buckets ? buckets1['composite#STACKED_BAR_CHART'].buckets : [] : [];
    }
    this.dataObj = new Object();
    this.labels = [];
    this.barChartLabels = new Array();
    // transform data before go for render
    this.arrayBuckets = this.transformDataSets(this.arrayBuckets);
    if (this.widgetViewDetails?.payload?.view === WidgetView.TABLE_VIEW) {
      this.isTableView = true;
      this.barChartData = [];
      this.stackBardata.next(this.returnData);
      this.arrayBuckets.forEach(singleBucket => {
        this.setLegendCodeText(singleBucket);
      });
      this.getTableData();
    } else {
      this.isTableView = false;
      this.arrayBuckets.forEach(singleBucket => {
        if (this.barChartLabels.indexOf(singleBucket.key[this.widgetInfo.groupById] === '' ? this.widgetInfo.chartProperties.blankValueAlias !== undefined ? this.widgetInfo.chartProperties.blankValueAlias : '' : singleBucket.key[this.widgetInfo.groupById]) === -1) {
          const mtl = singleBucket.key[this.widgetInfo.groupById];
          const hits = singleBucket['top_hits#items'] ? singleBucket['top_hits#items'].hits.hits[0] : null;
          const val = hits ? (hits._source.hdvs ? (hits._source.hdvs[this.widgetInfo.groupById] ?
            (hits._source.hdvs[this.widgetInfo.groupById] ? hits._source.hdvs[this.widgetInfo.groupById].vc : null) : null) :
            (hits._source.staticFields && hits._source.staticFields[this.widgetInfo.groupById]) ?
              (hits._source.staticFields[this.widgetInfo.groupById] ? hits._source.staticFields[this.widgetInfo.groupById].vc : null) : (hits._source[this.widgetInfo.field] ? hits._source[this.widgetInfo.field].vc : null)) : null;

          const valCode = val ? (val[0].c ? val[0].c : mtl) : val;
          this.barChartLabels.push(singleBucket.key[this.widgetInfo.groupById] === '' ? this.widgetInfo.chartProperties.blankValueAlias !== undefined ? this.widgetInfo.chartProperties.blankValueAlias : '' : singleBucket.key[this.widgetInfo.groupById]);
          this.stachbarAxis.push({ legendIndex: this.stachbarAxis.length, code: singleBucket.key[this.widgetInfo.groupById] === '' ? this.widgetInfo.chartProperties.blankValueAlias !== undefined ? this.widgetInfo.chartProperties.blankValueAlias : '' : valCode, text: val ? this.checkTextCode(val[0]) : mtl});
          if (singleBucket.key[this.widgetInfo.groupById] === '' ? this.widgetInfo.chartProperties.blankValueAlias !== undefined ? this.widgetInfo.chartProperties.blankValueAlias : '' : singleBucket.key[this.widgetInfo.groupById] !== '' && this.labels.indexOf(singleBucket.key[this.widgetInfo.groupById] === '' ? this.widgetInfo.chartProperties.blankValueAlias !== undefined ? this.widgetInfo.chartProperties.blankValueAlias : '' : singleBucket.key[this.widgetInfo.groupById]) === -1) {
            this.labels.push(singleBucket.key[this.widgetInfo.groupById] === '' ? this.widgetInfo.chartProperties.blankValueAlias !== undefined ? this.widgetInfo.chartProperties.blankValueAlias : '' : singleBucket.key[this.widgetInfo.groupById]);
          }
        }
        if (this.listxAxis2.indexOf(singleBucket.key[this.widgetInfo.field]) === -1) {
          this.setLegendCodeText(singleBucket);
          this.stackbarLegend = this.filterMetadataByEmptyValues(this.stackbarLegend);
        }
      });

      // // maintaining alias here
      // this.stackbarLegend.forEach(legend => {
      //   if (legend.code === '') {
      //     legend.code = this.widgetInfo.chartProperties.blankValueAlias !== undefined ? this.widgetInfo.chartProperties.blankValueAlias : '';
      //   }
      // });



      // for (let i = 0; i < this.listxAxis2.length; i++) {
      //   if (this.listxAxis2[i] === '') {
      //     this.listxAxis2[i] = this.widgetInfo.chartProperties.blankValueAlias !== undefined ? this.widgetInfo.chartProperties.blankValueAlias : '';
      //   }
      // }

      if (Object.keys(this.dataObj).length !== 0) {
        this.arrayBuckets.forEach(singleBucket => {
          let xval1 = singleBucket.key[this.widgetInfo.groupById];
          const xval2 = singleBucket.key[this.widgetInfo.field];
          xval1 = xval1 === '' ? this.widgetInfo.chartProperties.blankValueAlias !== undefined ? this.widgetInfo.chartProperties.blankValueAlias : xval1 : xval1;
          const arr = this.dataObj[xval2] ? this.dataObj[xval2] : {};
          const xpos1 = this.barChartLabels.indexOf(xval1);
          const count = singleBucket.doc_count;
          arr[xpos1] = count;
          this.dataObj[xval2] = arr;
        });
        this.barChartData.splice(0, 1);
      }
      this.stackBardata.next(returnData);
    }
  }

  setLegendCodeText(singleBucket){
    const mtl = singleBucket.key[this.widgetInfo.field];
    const arr: any[] = [0];
    // const val = mtl === '' ? this.widgetInfo.chartProperties.blankValueAlias !== undefined ? this.widgetInfo.chartProperties.blankValueAlias : '' : mtl;
    this.dataObj[mtl] = arr;
    this.listxAxis2.push(mtl);
    const hits = singleBucket['top_hits#items'] ? singleBucket['top_hits#items'].hits.hits[0] : null;
    const val = hits ? (hits._source.hdvs ? (hits._source.hdvs[this.widgetInfo.field] ?
      (hits._source.hdvs[this.widgetInfo.field] ? hits._source.hdvs[this.widgetInfo.field].vc : null) : null) :
      (hits._source.staticFields && hits._source.staticFields[this.widgetInfo.field]) ?
        (hits._source.staticFields[this.widgetInfo.field] ? hits._source.staticFields[this.widgetInfo.field].vc : null) : (hits._source[this.widgetInfo.field] ? hits._source[this.widgetInfo.field].vc : null)) : null;

    const valCode = val ? (val[0].c ? val[0].c : mtl) : val;
    const valText = val ? (val[0].t ? val[0].t : mtl) : val;
    this.stackbarLegend.push({ code: valCode, legendIndex: this.stackbarLegend.length, text: val ? this.checkTextCode(val[0]) : mtl})
    this.legendCodeTextList.push({code : valCode , text : valText, codeText : `${valCode} -- ${valText}`});
  }

  public getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  /**
   * After click on chart legend
   * legendItem
   */
  legendClick(legendItem: LegendItem) {
    if (legendItem.text === 'Total' || legendItem.text === 'Total -- Total') {
      return;
    }
    let clickedLegend = this.stackbarLegend[legendItem.datasetIndex] ? this.stackbarLegend[legendItem.datasetIndex].code : '';
    if (clickedLegend === this.widgetInfo.chartProperties.blankValueAlias) {
      clickedLegend = '';
    }
    const fieldId = this.widgetInfo.field;
    let appliedFilters = this.filterCriteria.filter(fill => fill.fieldId === fieldId);
    this.removeOldFilterCriteria(appliedFilters);
    if (appliedFilters.length > 0) {
      const res = appliedFilters.filter(fill => fill.fieldId === fieldId && fill.widgetType === WidgetType.STACKED_BAR_CHART && this.widgetInfo.isEnableGlobalFilter);
      if (res.length !== 0) {
        res.forEach(val => {
          val.conditionFieldValue = clickedLegend;
        })
      }
      const cri = appliedFilters.filter(fill => fill.conditionFieldValue === clickedLegend);
      if (cri.length === 0) {
        const critera1: Criteria = new Criteria();
        critera1.fieldId = fieldId;
        critera1.conditionFieldId = fieldId;
        critera1.conditionFieldValue = clickedLegend;
        critera1.blockType = BlockType.COND;
        critera1.conditionOperator = ConditionOperator.EQUAL;
        critera1.widgetType = WidgetType.STACKED_BAR_CHART;
        critera1.conditionFieldValueText = this.displayCriteriaOption === DisplayCriteria.TEXT ? this.stackbarLegend[legendItem.datasetIndex] ? this.stackbarLegend[legendItem.datasetIndex].text : '' : clickedLegend;
        critera1.fieldCtrl = this.widgetInfo.fieldCtrl;
        appliedFilters.push(critera1);
      }
    } else {
      appliedFilters = [];
      const critera1: Criteria = new Criteria();
      critera1.fieldId = fieldId;
      critera1.conditionFieldId = fieldId
      critera1.conditionFieldValue = clickedLegend;
      critera1.blockType = BlockType.COND;
      critera1.conditionOperator = ConditionOperator.EQUAL;
      critera1.widgetType = WidgetType.STACKED_BAR_CHART;
      critera1.conditionFieldValueText = this.stackbarLegend[legendItem.datasetIndex] ? this.stackbarLegend[legendItem.datasetIndex].text : '';
      critera1.fieldCtrl = this.widgetInfo.fieldCtrl;
      appliedFilters.push(critera1);
    }
    appliedFilters.forEach(app => this.filterCriteria.push(app));
    this.emitEvtFilterCriteria(this.filterCriteria);
  }

  /**
   * Remove old filter criteria for field
   * selectedOptions as parameter
   */
  removeOldFilterCriteria(selectedOptions: Criteria[]) {
    selectedOptions.forEach(option => {
      this.filterCriteria.splice(this.filterCriteria.indexOf(option), 1);
    });
  }

  getFieldsMetadaDescaxis1ForNonFld(fieldId: string) {
    this.arrayBuckets.forEach(bucket => {
      const key = bucket.key[fieldId] === '' ? this.widgetInfo.chartProperties.blankValueAlias !== undefined ? this.widgetInfo.chartProperties.blankValueAlias : '' : bucket.key[fieldId];
      const hits = bucket['top_hits#items'] ? bucket['top_hits#items'].hits.hits[0] : null;
      const val = hits ? (hits._source.hdvs ? (hits._source.hdvs[fieldId] ?
        (hits._source.hdvs[fieldId] ? hits._source.hdvs[fieldId].vc : null) : null) :
        (hits._source.staticFields && hits._source.staticFields[fieldId]) ?
          (hits._source.staticFields[fieldId] ? hits._source.staticFields[fieldId].vc : null) : (hits._source[fieldId] ? hits._source[fieldId].vc : null)) : null;
      if (val) {
        const valArray = [];
        val.forEach(v => {
          valArray.push(this.checkTextCode(v));
        });
        const finalText = valArray.toString();
        if (finalText) {
          this.codeTextaxis1[key] = finalText;
        } else {
          this.codeTextaxis1[key] = key;
        }
      } else {
        this.codeTextaxis1[key] = key;
      }
    });
    this.updateLabelsaxis1();
  }

  getFieldsMetadaDescaxis1(fieldId: string) {
    this.arrayBuckets.forEach(bucket => {
      const key = bucket.key[fieldId] === '' ? this.widgetInfo.chartProperties.blankValueAlias !== undefined ? this.widgetInfo.chartProperties.blankValueAlias : '' : bucket.key[fieldId];
      const hits = bucket['top_hits#items'] ? bucket['top_hits#items'].hits.hits[0] : null;
      const val = hits ? hits._source.hdvs ? (hits._source.hdvs[fieldId] ?
        (hits._source.hdvs[fieldId] ? hits._source.hdvs[fieldId].vc : null) : null) :
        (hits._source.staticFields && hits._source.staticFields[fieldId]) ?
          (hits._source.staticFields[fieldId] ? hits._source.staticFields[fieldId].vc : null) : (hits._source[fieldId] ? hits._source[fieldId].vc : null) : null;
      if (val !== null) {
        const valArray = [];
        val.forEach(v => {
          valArray.push(this.checkTextCode(v));
        });
        const finalText = valArray.toString();
        if (finalText) {
          this.codeTextaxis1[key] = finalText;
        } else {
          this.codeTextaxis1[key] = key;
        }
      } else {
        this.codeTextaxis1[key] = key;
      } if (fieldId === 'OVERDUE' || fieldId === 'FORWARDENABLED' || fieldId === 'TIME_TAKEN') {
        this.codeTextaxis1[key] = this.getFields(fieldId, key);
      }
    });
    this.updateLabelsaxis1();
  }

  getDateFieldsDesc1(fieldId: string) {
    this.arrayBuckets.forEach(bucket => {
      const key = bucket.key[fieldId] === '' ? this.widgetInfo.chartProperties.blankValueAlias !== undefined ? this.widgetInfo.chartProperties.blankValueAlias : '' : bucket.key[fieldId];
      const hits = bucket['top_hits#items'] ? bucket['top_hits#items'].hits.hits[0] : null;
      const val = hits ? (hits._source.hdvs ? (hits._source.hdvs[fieldId] ?
        (hits._source.hdvs[fieldId] ? hits._source.hdvs[fieldId].vc : null) : null) :
        (hits._source.staticFields && hits._source.staticFields[fieldId]) ?
          (hits._source.staticFields[fieldId] ? hits._source.staticFields[fieldId].vc : null) : (hits._source[fieldId] ? hits._source[fieldId].vc : null)) : null;
      if (val !== null) {
        const valArray = [];
        val.forEach(v => {
          valArray.push(this.checkTextCode(v));
        });
        const finalText = Number(valArray);
        if (finalText) {
          this.codeTextaxis1[key] = new Date(finalText).toLocaleDateString();
        } else {
          this.codeTextaxis1[key] = new Date(key).toLocaleDateString();
        }
      } else {
        this.codeTextaxis1[key] = new Date(key).toLocaleDateString();
      }
    });
    this.updateLabelsaxis1();
  }

  updateLabelsaxis1(): void {
    for (let i = 0; i < this.barChartLabels.length; i++) {
      const lbl = this.barChartLabels[i] as any === '' ? this.widgetInfo.chartProperties.blankValueAlias !== undefined ? this.widgetInfo.chartProperties.blankValueAlias : '' : this.barChartLabels[i] as any;
      this.barChartLabels[i] = this.codeTextaxis1[lbl] ? this.codeTextaxis1[lbl] : lbl;
    }


    if (this.widgetInfo.chartProperties.dataSetSize) {
      this.barChartLabels = _.take(this.barChartLabels, this.widgetInfo.chartProperties.dataSetSize);
    }
  }


  getFieldsMetadaDescaxis2Nondef(fieldId: string) {
    this.arrayBuckets.forEach(bucket => {
      const key = bucket.key[fieldId];
      const hits = bucket['top_hits#items'] ? bucket['top_hits#items'].hits.hits[0] : null;
      const val = hits ? hits._source.hdvs ? (hits._source.hdvs[fieldId] ?
        (hits._source.hdvs[fieldId] ? hits._source.hdvs[fieldId].vc : null) : null) :
        (hits._source.staticFields && hits._source.staticFields[fieldId]) ?
          (hits._source.staticFields[fieldId] ? hits._source.staticFields[fieldId].vc : null) : (hits._source[fieldId] ? hits._source[fieldId].vc : null) : null;
      if (val) {
        const valArray = [];
        val.forEach(v => {
          valArray.push(this.checkTextCode(v));
        });
        const finalText = valArray.toString();
        if (finalText) {
          this.codeTextaxis2[key] = finalText;
        } else {
          this.codeTextaxis2[key] = key;
        }
      } else {
        this.codeTextaxis2[key] = key;
      }
    });
    this.updateLabelsaxis2();
  }

  getDateFieldsDesc2(fieldId: string) {
    let locale = this.locale !== '' ? this.locale.split('-')[0] : 'EN';
    locale = locale.toUpperCase();
    this.arrayBuckets.forEach(bucket => {
      const key = bucket.key[fieldId];
      const hits = bucket['top_hits#items'] ? bucket['top_hits#items'].hits.hits[0] : null;
      const val = hits ? hits._source.hdvs ? (hits._source.hdvs[fieldId] ?
        (hits._source.hdvs[fieldId] ? hits._source.hdvs[fieldId].vc : null) : null) :
        (hits._source.staticFields && hits._source.staticFields[fieldId]) ?
          (hits._source.staticFields[fieldId] ? hits._source.staticFields[fieldId].vc : null) : (hits._source[fieldId] ? hits._source[fieldId].vc : null) : null;
      if (val) {
        const valArray = [];
        val.forEach(v => {
          valArray.push(this.checkTextCode(v));
        });
        const finalText = Number(valArray);
        if (finalText) {
          this.codeTextaxis2[key] = new Date(finalText).toLocaleDateString();
        } else {
          this.codeTextaxis2[key] = new Date(key).toLocaleDateString();
        }
      } else {
        this.codeTextaxis2[key] = new Date(key).toLocaleDateString();
      }
    });
    this.updateLabelsaxis2();
  }

  getFieldsMetadaDescaxis2(fieldId: string) {
    let locale = this.locale !== '' ? this.locale.split('-')[0] : 'EN';
    locale = locale.toUpperCase();
    this.arrayBuckets.forEach(bucket => {
      const key = bucket.key[fieldId];
      const hits = bucket['top_hits#items'] ? bucket['top_hits#items'].hits.hits[0] : null;
      const val = hits ? (hits._source.hdvs ? (hits._source.hdvs[fieldId] ?
        (hits._source.hdvs[fieldId] ? hits._source.hdvs[fieldId].vc : null) : null) :
        (hits._source.staticFields && hits._source.staticFields[fieldId]) ?
          (hits._source.staticFields[fieldId] ? hits._source.staticFields[fieldId].vc : null) : (hits._source[fieldId] ? hits._source[fieldId].vc : null)) : null;
      if (val) {
        const valArray = [];
        val.forEach(v => {
          valArray.push(this.checkTextCode(v));
        });
        const finalText = valArray.toString();
        if (finalText) {
          this.codeTextaxis2[key] = finalText;
        } else {
          this.codeTextaxis2[key] = key;
        }
      } else {
        this.codeTextaxis2[key] = key;
      } if (fieldId === 'OVERDUE' || fieldId === 'FORWARDENABLED' || fieldId === 'TIME_TAKEN') {
        this.codeTextaxis2[key] = this.getFields(fieldId, key);
      }
    });
    this.updateLabelsaxis2();
  }

  updateLabelsaxis2(): void {
    this.barChartData = [];
    this.listxAxis2.forEach(singleLis => {
      const singleobj = {} as any;
      // singleobj.data = this.dataObj[singleLis];
      if (this.widgetInfo?.chartProperties?.orientation === Orientation.HORIZONTAL) {
        singleobj.data = this.dataObj[singleLis].map((item, index) => { return { y: index, x: item } });
      } else {
        singleobj.data = this.dataObj[singleLis].map((item, index) => { return { x: index, y: item } });
      }
      if (singleLis) {
        let barLegendIndex =  this.legendCodeTextList.findIndex(legend => (legend.code !== null ? legend.code === singleLis : legend.text !== null ? legend.text.includes(singleLis) : false));
        barLegendIndex = barLegendIndex === -1 ? this.legendCodeTextList.findIndex((legend) => (legend.text != null ? legend.text.includes(singleLis) : false)) : barLegendIndex;
        singleobj.label = barLegendIndex > -1 ? this.displayCriteriaOption === DisplayCriteria.CODE ? this.legendCodeTextList[barLegendIndex].code : (this.displayCriteriaOption ===  DisplayCriteria.TEXT ? this.legendCodeTextList[barLegendIndex].text : this.legendCodeTextList[barLegendIndex].codeText) : singleLis;
      } else {
        singleobj.label = singleLis;
      }
      singleobj.fieldCode = singleLis;
      singleobj.stack = 'a';
      singleobj.type = 'bar';
      // singleobj.backgroundColor=this.getRandomColor();
      if (singleLis !== 'Total') {
        singleobj.backgroundColor = this.getUpdatedColorCode(singleobj.fieldCode);
        singleobj.borderColor = this.getRandomColor();
      }
      else {
        singleobj.backgroundColor = '#e4e5e5';
        singleobj.borderColor = '#e4e5e5';
        singleobj.hoverBackgroundColor = '#e4e5e5';
      }


      this.barChartData.push(singleobj);
    });
    for (let i = 0; i < this.barChartLabels.length; i++) {
      const lbl = this.barChartLabels[i] as any;
      this.barChartLabels[i] = this.codeTextaxis1[lbl] ? this.codeTextaxis1[lbl] : lbl || '';
    }
    if (this.chart) {
      // this.chart.data.datasets = this.barChartData;
      if (this.widgetInfo?.chartProperties.orientation === Orientation.HORIZONTAL) {
        this.chart.options.indexAxis = 'y';
      } else {
        this.chart.options.indexAxis = 'x';
      }
    }
  }

  /**
   * Aftre click on chart stack
   */
  stackClickFilter(event?: Event, activeElements?: Array<any>) {
    if (this.chart && activeElements.length > 0) {
      const option = this.chart.chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false) as any;
      const xval1Index = option[0].datasetIndex;
      const xval2Index = option[0].index;

      const xvalCode1 = this.stackbarLegend[xval1Index] ? this.stackbarLegend[xval1Index].code : null;
      const xvalCode2 = this.stachbarAxis[xval2Index] ? this.stachbarAxis[xval2Index].code : null;
      if (xvalCode1 && xvalCode2) {
        if (xvalCode1 === 'Total' || xvalCode2 === 'Total') {
          return false;
        }
        let fieldId = this.widgetInfo.field;
        let appliedFilters = this.filterCriteria.filter(fill => fill.fieldId === fieldId);
        this.removeOldFilterCriteria(appliedFilters);
        // for xaxis 1
        if (appliedFilters.length > 0) {
          const res = appliedFilters.filter(fill => fill.fieldId === fieldId && fill.widgetType === WidgetType.STACKED_BAR_CHART && this.widgetInfo.isEnableGlobalFilter);
          if (res.length !== 0) {
            res.forEach(val => {
              val.conditionFieldValue = xvalCode1;
            })
          }
          const cri = appliedFilters.filter(fill => fill.conditionFieldValue === xvalCode1);
          if (cri.length === 0) {
            const critera1: Criteria = new Criteria();
            critera1.fieldId = fieldId;
            critera1.conditionFieldId = fieldId;
            critera1.conditionFieldValue = xvalCode1;
            critera1.blockType = BlockType.COND;
            critera1.conditionOperator = ConditionOperator.EQUAL;
            critera1.widgetType = WidgetType.STACKED_BAR_CHART;
            critera1.conditionFieldValueText = this.displayCriteriaOption === DisplayCriteria.TEXT ? this.stackbarLegend[xval1Index] ? this.stackbarLegend[xval1Index].text : '' : this.stackbarLegend[xval1Index].code
            critera1.fieldCtrl = this.widgetInfo.fieldCtrl;
            appliedFilters.push(critera1);
          }
        } else {
          appliedFilters = [];
          const critera1: Criteria = new Criteria();
          critera1.fieldId = fieldId;
          critera1.conditionFieldId = fieldId
          critera1.conditionFieldValue = xvalCode1;
          critera1.blockType = BlockType.COND;
          critera1.conditionOperator = ConditionOperator.EQUAL;
          critera1.widgetType = WidgetType.STACKED_BAR_CHART;
          critera1.conditionFieldValueText = this.displayCriteriaOption === DisplayCriteria.TEXT ? this.stackbarLegend[xval1Index] ? this.stackbarLegend[xval1Index].text : '' : this.stackbarLegend[xval1Index].code
          critera1.fieldCtrl = this.widgetInfo.fieldCtrl;
          appliedFilters.push(critera1);
        }
        appliedFilters.forEach(app => this.filterCriteria.push(app));
        fieldId = this.widgetInfo.groupById;
        appliedFilters = this.filterCriteria.filter(fill => fill.fieldId === fieldId);
        this.removeOldFilterCriteria(appliedFilters);
        // for xaxis2
        if (appliedFilters.length > 0) {
          const res = appliedFilters.filter(fill => fill.fieldId === fieldId && fill.widgetType === WidgetType.STACKED_BAR_CHART && this.widgetInfo.isEnableGlobalFilter);
          if (res.length !== 0) {
            res.forEach(val => {
              val.conditionFieldValue = xvalCode2;
            })
          }
          const cri = appliedFilters.filter(fill => fill.conditionFieldValue === xvalCode2);
          if (cri.length === 0) {
            const critera1: Criteria = new Criteria();
            critera1.fieldId = fieldId;
            critera1.conditionFieldId = fieldId;
            critera1.conditionFieldValue = xvalCode2;
            critera1.blockType = BlockType.COND;
            critera1.conditionOperator = ConditionOperator.EQUAL;
            critera1.widgetType = WidgetType.STACKED_BAR_CHART;
            critera1.fieldCtrl = this.widgetInfo.fieldCtrl;
            appliedFilters.push(critera1);
          }
        } else {
          appliedFilters = [];
          const critera1: Criteria = new Criteria();
          critera1.fieldId = fieldId;
          critera1.conditionFieldId = fieldId
          critera1.conditionFieldValue = xvalCode2;
          critera1.blockType = BlockType.COND;
          critera1.conditionOperator = ConditionOperator.EQUAL;
          critera1.widgetType = WidgetType.STACKED_BAR_CHART;
          critera1.fieldCtrl = this.widgetInfo.fieldCtrl;
          appliedFilters.push(critera1);
        }
        appliedFilters.forEach(app => this.filterCriteria.push(app));
        this.emitEvtFilterCriteria(this.filterCriteria);
      }
    }
  }

  downloadCSV(): void {
    const excelData = [];
    this.arrayBuckets.forEach(singleBucket => {
      const legendIndex = this.legendCodeTextList.findIndex(legend => (legend.code === singleBucket.key[this.widgetInfo.field] || legend.text === singleBucket.key[this.widgetInfo.field] || legend.codeText === singleBucket.key[this.widgetInfo.field]));
      const obj = {};
      obj[this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.field] = legendIndex > -1 ? (this.displayCriteriaOption === DisplayCriteria.CODE ? this.legendCodeTextList[legendIndex].code : (this.displayCriteriaOption === DisplayCriteria.TEXT ? this.legendCodeTextList[legendIndex].text : this.legendCodeTextList[legendIndex].codeText)) : '';
      obj[this.widgetInfo.groupByIdCtrl ? this.widgetInfo.groupByIdCtrl.fieldDescri : this.widgetInfo.groupById] = this.codeTextaxis1 ? this.codeTextaxis1[singleBucket.key[this.widgetInfo.groupById] === '' ? this.widgetInfo.chartProperties.blankValueAlias !== undefined ? this.widgetInfo.chartProperties.blankValueAlias : '' : singleBucket.key[this.widgetInfo.groupById]] + '\t' : '';
      obj[this.widgetInfo.aggregrationOp ? this.widgetInfo.aggregrationOp === 'GROUPBY' ? 'Value' : this.widgetInfo.aggregrationOp : this.widgetInfo.aggregrationOp] = formatNumber(singleBucket.doc_count, 'en-US');
      excelData.push(obj);
    });
    this.widgetService.downloadCSV('StackBar-Chart', excelData);
  }

  downloadImage() {
    this.changeScaleTicks(true);
    this.widgetService.downloadImage(this.imageChart.toBase64Image(), 'StackBar-Chart1.png');
    this.changeScaleTicks(false);
  }

  emitEvtFilterCriteria(critera: Criteria[]): void {
    this.evtFilterCriteria.emit(critera);
  }

  /**
   * Before render chart transformation
   * @param resBuckets response from server
   */
  transformDataSets(resBuckets: any[]): any[] {
    // ckeck configuration
    let finalDataSet: any[] = [];
    const groupBY = this.widgetInfo.groupById;
    // perform sort
    const total: any[] = [];
    const orderWith = this.widgetInfo.chartProperties.orderWith;
    if (orderWith) {
      if (orderWith === OrderWith.ROW_ASC) {
        resBuckets = this.sortByRow(groupBY, resBuckets);
      } else if (orderWith === OrderWith.ROW_DESC) {
        resBuckets = this.sortByRow(groupBY, resBuckets);
        resBuckets.reverse();
      } else if (orderWith === OrderWith.COL_ASC) {
        resBuckets = this.sortByColumnAsc(groupBY, resBuckets);
      } else if (orderWith === OrderWith.COL_DESC) {
        resBuckets = this.sortByColumnDesc(groupBY, resBuckets);
      }
    }
    if (this.widgetInfo.chartProperties.scaleFrom !== null && this.widgetInfo.chartProperties.scaleFrom !== undefined
      && this.widgetInfo.chartProperties.scaleTo !== null && this.widgetInfo.chartProperties.scaleTo !== undefined
      && this.widgetInfo.chartProperties.stepSize !== null && this.widgetInfo.chartProperties.stepSize !== undefined) {

      const insideRange = resBuckets.filter(bucket => {
        if (this.widgetInfo.chartProperties.scaleFrom <= bucket.doc_count && this.widgetInfo.chartProperties.scaleTo >= bucket.doc_count) {
          return bucket;
        }
      });
      finalDataSet = insideRange;
    } else {
      finalDataSet = resBuckets;
    }
    if (this.widgetInfo.chartProperties.showTotal) {
      let showTotal = true;
      // boolean value to store that whether filter is applied only on group by id or not
      let isFilterApplied = true;
      // check filter is applied for both groupbyId and field id or not
      if (this.filterCriteria.length === 1) {
        const index = this.filterCriteria.findIndex(item => item.conditionFieldId === this.widgetInfo.field);
        if (index > -1) {
          isFilterApplied = false;
        }

      } else if (this.filterCriteria.length > 1) {
        const indexAxis1 = this.filterCriteria.findIndex(item => item.conditionFieldId === this.widgetInfo.groupById);
        const indexAxis2 = this.filterCriteria.findIndex(item => item.conditionFieldId === this.widgetInfo.field);
        // isFilterApplied false if filter is applied for both groupbyId and field Id or for FieldID
        if (indexAxis1 > -1 && indexAxis2 > -1 || indexAxis1 === -1 && indexAxis2 > -1) {
          isFilterApplied = false;
        } else {
          isFilterApplied = true;
        }
      }
      this.filterCriteria.forEach(item => {
        if (item.conditionOperator === ConditionOperator.EQUAL) {
          const ind = finalDataSet.findIndex(data => data.key[item.conditionFieldId] === item.conditionFieldValueText)
          if (ind > -1) {
            showTotal = false;
          }
        }
      })
      if (showTotal && isFilterApplied) {
        finalDataSet.forEach(item => {
          const groupById = this.widgetInfo.groupById;
          const fieldId = this.widgetInfo.field;
          const key = item.key[groupById];
          const index = total.findIndex(el => el.key[groupById] === key);
          if (index > -1) {
            total[index].doc_count = total[index].doc_count + item.doc_count;
          } else {
            total.push({ doc_count: item.doc_count, key: { [groupById]: item.key[groupById], [fieldId]: 'Total' } })
          }
        })
        finalDataSet.push(...total);
      }
    }
    return finalDataSet;
  }

  /**
   * Use for set scale range and axis labels
   */
  setChartAxisAndScaleRange() {
    if (this.widgetInfo.chartProperties.scaleFrom !== null && this.widgetInfo.chartProperties.scaleFrom !== undefined
      && this.widgetInfo.chartProperties.scaleTo !== null && this.widgetInfo.chartProperties.scaleTo !== undefined
      && this.widgetInfo.chartProperties.stepSize !== null && this.widgetInfo.chartProperties.stepSize !== undefined) {
      if (this.widgetInfo.chartProperties.orientation === Orientation.HORIZONTAL) {
        this.barChartOptions = {
          ...this.barChartOptions, indexAxis: 'y' }
        this.barChartOptions.scales = {
          x: {
            title: {
              display: true,
              text: this.widgetInfo.chartProperties.xAxisLabel ? this.widgetInfo.chartProperties.xAxisLabel : ''
            },
            min: this.widgetInfo.chartProperties.scaleFrom,
            max: this.widgetInfo.chartProperties.scaleTo,
            ticks: {
              stepSize: this.widgetInfo.chartProperties.stepSize,
              callback(value, index, values) {
                return formatNumber(Number(value), 'en-US');
              }
            },
            grid: {
              tickLength: 0
            }
          },
          y: {
            title: {
              display: true,
              text: this.widgetInfo.chartProperties.yAxisLabel ? this.widgetInfo.chartProperties.yAxisLabel : ''
            },
            ticks: {
              callback: (value) => {
                // added condition when we don't have labels or labels according to ticks
                  return this.barChartLabels[value]?.length > this.labelTooltipCharLimit
                    ? this.barChartLabels[value].slice(0, this.labelTooltipCharLimit) + '...'
                    : this.barChartLabels[value];
              },
              padding: this.widgetInfo.chartProperties.isEnableDatalabels && (this.widgetInfo.chartProperties.datalabelsPosition === 'start' || this.widgetInfo.chartProperties.datalabelsPosition === 'center') ? 40 : 20
            },
            grid: {
              tickLength: 0
            }
          }
        }
      } else {
        this.barChartOptions.scales = {
          x: {
            title: {
              display: true,
              text: this.widgetInfo.chartProperties.xAxisLabel ? this.widgetInfo.chartProperties.xAxisLabel : ''
            },
            ticks: {
              callback: (value) => {
                return this.barChartLabels[value]?.length > this.labelTooltipCharLimit
                  ? this.barChartLabels[value].slice(0, this.labelTooltipCharLimit) + '...'
                  : this.barChartLabels[value];
              },
              // padding: this.widgetInfo.chartProperties.isEnableDatalabels && (this.widgetInfo.chartProperties.datalabelsPosition === 'start' || this.widgetInfo.chartProperties.datalabelsPosition === 'center') ? 20 : 0
              padding: 20
            },
            grid: {
              tickLength: 0
            }
          },
          y: {
            title: {
              display: true,
              text: this.widgetInfo.chartProperties.yAxisLabel ? this.widgetInfo.chartProperties.yAxisLabel : ''
            },
            min: this.widgetInfo.chartProperties.scaleFrom,
            max: this.widgetInfo.chartProperties.scaleTo,
            ticks: {
              stepSize: this.widgetInfo.chartProperties.stepSize,
              callback(value, index, values) {
                return formatNumber(Number(value), 'en-US');
              }
            },
            grid: {
              tickLength: 0
            }
          }
        }
      }
    } else {
      if (this.widgetInfo.chartProperties.orientation === Orientation.HORIZONTAL) {
        this.barChartOptions = {
          ...this.barChartOptions, indexAxis: 'y' }
        this.barChartOptions.scales = {
          x: {
            title: {
              display: true,
              text: this.widgetInfo.chartProperties.xAxisLabel ? this.widgetInfo.chartProperties.xAxisLabel : ''
            },
            ticks: {
              // padding: this.widgetInfo.chartProperties.isEnableDatalabels && (this.widgetInfo.chartProperties.datalabelsPosition === 'start' || this.widgetInfo.chartProperties.datalabelsPosition === 'center') ? 20 : 0
              padding: 20
              , callback(value, index, values) {
                return formatNumber(Number(value), 'en-US');
              }
            },
            grid: {
              tickLength: 0
            }
          },
          y: {
            title: {
              display: true,
              text: this.widgetInfo.chartProperties.yAxisLabel ? this.widgetInfo.chartProperties.yAxisLabel : ''
            },
            ticks: {
              callback: (value) => {
                return this.barChartLabels[value]?.length > this.labelTooltipCharLimit
                  ? this.barChartLabels[value].slice(0, this.labelTooltipCharLimit) + '...'
                  : this.barChartLabels[value];
              },
              // padding: this.widgetInfo.chartProperties.isEnableDatalabels && (this.widgetInfo.chartProperties.orientation === Orientation.HORIZONTAL) && (this.widgetInfo.chartProperties.datalabelsPosition === 'start' || this.widgetInfo.chartProperties.datalabelsPosition === 'center') ? 20 : 0
              padding: 20
            },
            grid: {
              tickLength: 0
            }
          },
        }
      } else {
        this.barChartOptions.indexAxis = 'x';
        this.barChartOptions.scales = {
          x: {
            title: {
              display: true,
              text: this.widgetInfo.chartProperties.xAxisLabel ? this.widgetInfo.chartProperties.xAxisLabel : ''
            },
            ticks: {
              callback: (value) => {
                return this.barChartLabels[value]?.length > this.labelTooltipCharLimit
                  ? this.barChartLabels[value].slice(0, this.labelTooltipCharLimit) + '...'
                  : this.barChartLabels[value];
              },
              // padding: this.widgetInfo.chartProperties.isEnableDatalabels && (this.widgetInfo.chartProperties.datalabelsPosition === 'start' || this.widgetInfo.chartProperties.datalabelsPosition === 'center') ? 20 : 0
              padding: 20
            },
            grid: {
              tickLength: 0
            }
          },
          y: {
            title: {
              display: true,
              text: this.widgetInfo.chartProperties.yAxisLabel ? this.widgetInfo.chartProperties.yAxisLabel : ''
            },
            ticks: {
              // padding: this.widgetInfo.chartProperties.isEnableDatalabels && (this.widgetInfo.chartProperties.datalabelsPosition === 'start' || this.widgetInfo.chartProperties.datalabelsPosition === 'center') ? 20 : 0,
              padding: 20,
              callback(value, index, values) {
                return formatNumber(Number(value), 'en-US');
              }
            },
            grid: {
              tickLength: 0
            }
          },
        }
      }
    }
    if (this.chart) {
      this.chart.options.scales = this.barChartOptions.scales;
      if (this.chart.chart)
        this.chart.chart.options.scales = this.barChartOptions.scales;
    }
  }

  /**
   * Open color palette ..
   */
  openColorPalette() {
    const req: WidgetColorPalette = new WidgetColorPalette();
    req.widgetId = String(this.widgetId);
    req.reportId = String(this.reportId);
    req.widgetDesc = this.widgetInfo.widgetTitle;
    req.colorPalettes = [];
    this.barChartData.forEach(row => {
      req.colorPalettes.push({ code: row.fieldCode, colorCode: row.backgroundColor, text: row.label });
    });
    console.log(req);
    super.openColorPalette(req);
  }

  /**
   * Update stacked color based on color definations
   * @param res updated color codes
   */
  updateColorBasedOnDefined(res: WidgetColorPalette) {
    this.widgetColorPalette = res;
    this.resetChart();
    this.getstackbarChartData(this.widgetId, this.filterCriteria);
  }

  /**
   * Update color on widget based on defined
   * If not defined the pick random color
   * @param code resposne code
   */
  getUpdatedColorCode(code: string): string {
    if (this.widgetColorPalette && this.widgetColorPalette.colorPalettes) {
      const res = this.widgetColorPalette.colorPalettes.filter(fil => fil.code === code)[0];
      if (res) {
        return res.colorCode;
      }

    }
    return this.getRandomColor();
  }

  checkTextCode(v: { c: string; t: string; }): string {
    if (v.c || v.t) {
      switch (this.displayCriteriaOption) {
        case DisplayCriteria.CODE:
          const resCode = v.c ? v.c : v.t;
          return resCode;
        case DisplayCriteria.TEXT:
          const resText = v.t ? v.t : v.c;
          return resText;
        default:
          return v.c && v.t ? `${v.c || ''} -- ${v.t || ''}` : (v.c || v.t) ? (v.c ? `${v.c} -- ${v.c}` : `${v.t} -- ${v.t}`) : '';
      }
    }
    return '';
  }

  saveDisplayCriteria() {
    const saveDisplayCriteria = this.widgetService.saveDisplayCriteria(this.widgetInfo.widgetId, this.widgetInfo.widgetType, this.displayCriteriaOption).subscribe(res => {
      this.resetChart();
      this.updateChart(this.returnData);
    }, error => {
      console.error(`Error : ${error}`);
      this.snackBar.open(`Something went wrong`, 'Close', { duration: 3000 });
    });
    this.subscriptions.push(saveDisplayCriteria);
  }

  sortByRow(groupBY: string, resBuckets: any[]) {
    const sortedGroups = _.sortBy(resBuckets, (e) => {
      return e.doc_count;
    });

    const groupedArray = _.groupBy(sortedGroups, (e) => {
      return e.key[groupBY];
    });

    const mappedGroups = _.map(groupedArray, (x) => {
      return _.assign({}, {
        name: x[0].key[groupBY],
        total: _.sumBy(x, 'doc_count')
      });
    });

    const sortMapped = _.sortBy(mappedGroups, (e) => {
      return e.total;
    });
    return _.sortBy(resBuckets, x => _.findIndex(sortMapped, y => x.key[groupBY] === y.name));
  }

  sortByColumnAsc(groupBY: string, resBuckets: any[]) {
    resBuckets.sort((a, b) => {
      if (isNaN(parseFloat(a.key[groupBY]))) {
        return a?.key[groupBY]?.localeCompare(b.key[groupBY]);
      } else {
        return parseInt(a.key[groupBY], 10) - parseInt(b.key[groupBY], 10);
      }
    })
    return resBuckets;
  }

  sortByColumnDesc(groupBY: string, resBuckets: any[]) {
    resBuckets.sort((a, b) => {
      if (isNaN(parseFloat(a.key[groupBY]))) {
        return b?.key[groupBY]?.localeCompare(a.key[groupBY]);
      } else {
        return parseInt(b.key[groupBY], 10) - parseInt(a.key[groupBY], 10);
      }
    })
    return resBuckets;
  }

  viewChange(value) {
    const requestBody: WidgetViewRequestPayload = {
      uuid: '',
      reportId: this.reportId,
      widgetId: this.widgetId,
      view: value ? WidgetView.TABLE_VIEW : WidgetView.GRAPH_VIEW
    }
    if (this.widgetViewDetails?.payload.uuid) {
      requestBody.uuid = this.widgetViewDetails?.payload?.uuid;
      this.widgetService.updateWidgetView(requestBody).subscribe(res => {
        this.resetChart();
        this.getstackbarChartData(this.widgetId, this.filterCriteria);
      })
    } else {
      this.widgetService.saveWidgetView(requestBody).subscribe(res => {
        this.resetChart();
        this.getstackbarChartData(this.widgetId, this.filterCriteria);
      })
    }
  }

  getTableData() {
    const excelData = [];
    this.arrayBuckets.forEach(singleBucket => {
      const legendIndex = this.legendCodeTextList.findIndex(legend => (legend.code === singleBucket.key[this.widgetInfo.field] || legend.text === singleBucket.key[this.widgetInfo.field] || legend.codeText === singleBucket.key[this.widgetInfo.field]));
      const obj = {};
      obj[this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.field] = legendIndex > -1 ? (this.displayCriteriaOption === DisplayCriteria.CODE ? this.legendCodeTextList[legendIndex].code : (this.displayCriteriaOption === DisplayCriteria.TEXT ? this.legendCodeTextList[legendIndex].text : this.legendCodeTextList[legendIndex].codeText)) : '';
      obj[this.widgetInfo.groupByIdCtrl ? this.widgetInfo.groupByIdCtrl.fieldDescri : this.widgetInfo.groupById] = this.codeTextaxis1 ? this.codeTextaxis1[singleBucket.key[this.widgetInfo.groupById] === '' ? this.widgetInfo.chartProperties.blankValueAlias !== undefined ? this.widgetInfo.chartProperties.blankValueAlias : '' : singleBucket.key[this.widgetInfo.groupById]] + '\t' : '';
      // obj[this.widgetInfo.groupByIdCtrl ? this.widgetInfo.groupByIdCtrl.fieldDescri : this.widgetInfo.groupById] = this.codeTextaxis1 ? this.codeTextaxis1[singleBucket.key[this.widgetInfo.groupById]] : '';
      obj[this.widgetInfo.aggregrationOp ? this.widgetInfo.aggregrationOp === 'GROUPBY' ? 'Value' : this.widgetInfo.aggregrationOp : this.widgetInfo.aggregrationOp] = formatNumber(singleBucket.doc_count, 'en-US');
      excelData.push(obj);
    });
    this.displayedColumnsId = [];
    if (excelData.length) {
      this.displayedColumnsId.push(...Object.keys(excelData[0]));
    }
    this.dataSource = [...excelData]
  }

  /**
   * Disable hover over for 'View as' option in menu
   */
  menuOpened() {
    this.viewasItem._handleMouseEnter = () => {};
  }

  /**
   * method to change scales label for image download
   */
    changeScaleTicks(image: boolean) {
      const scaleObj = ['x','y'];
      if(image) {
        if (this.widgetInfo.chartProperties.orientation === Orientation.HORIZONTAL) {
          const ticks = {
            ...this.imageChart.options.scales[scaleObj[1]].ticks,
            callback: (value) => {
              return this.barChartLabels[value];
            }
          }
          this.imageChart.options.scales[scaleObj[1]].ticks = ticks;
          this.imageChart.chart.options.scales[scaleObj[1]].ticks = ticks;
        } else {
          const ticks = {
            ...this.imageChart.options.scales[scaleObj[0]].ticks,
            callback: (value) => {
              return this.barChartLabels[value];
            }
          }
          this.imageChart.options.scales[scaleObj[0]].ticks = ticks;
          this.imageChart.chart.options.scales[scaleObj[0]].ticks = ticks;
        }
      } else {
        if (this.widgetInfo.chartProperties.orientation === Orientation.HORIZONTAL) {
          const ticks = {
            ...this.imageChart.options.scales[scaleObj[1]].ticks,
            callback: (value) => {
              return this.barChartLabels[value]?.length > this.labelTooltipCharLimit
              ? this.barChartLabels[value].slice(0, this.labelTooltipCharLimit) + '...'
              : this.barChartLabels[value];
            }
          }
          this.imageChart.options.scales[scaleObj[1]].ticks = ticks;
          this.imageChart.chart.options.scales[scaleObj[1]].ticks = ticks;
        } else {
          const ticks = {
            ...this.imageChart.options.scales[scaleObj[0]].ticks,
            callback: (value) => {
              return this.barChartLabels[value]?.length > this.labelTooltipCharLimit
              ? this.barChartLabels[value].slice(0, this.labelTooltipCharLimit) + '...'
              : this.barChartLabels[value];
            }
          }
          this.imageChart.options.scales[scaleObj[0]].ticks = ticks;
          this.imageChart.chart.options.scales[scaleObj[0]].ticks = ticks;
        }
      }

      this.imageChart?.update({
        duration: 0
      });
    }
}
