import { Component, OnInit, OnChanges, ViewChild, LOCALE_ID, Inject, SimpleChanges, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { GenericWidgetComponent } from '../../generic-widget/generic-widget.component';
import { forkJoin, Subscription } from 'rxjs';
import { ChartLegend, Criteria, BlockType, ConditionOperator, WidgetColorPalette, DisplayCriteria, WidgetType, WidgetViewDetails, WidgetView, WidgetViewRequestPayload, LegendPosition } from '../../../_models/widget';
import { WidgetService } from 'src/app/_services/widgets/widget.service';
import { ReportService } from '../../../_service/report.service';
import { ChartOptions, TooltipItem, LegendItem, ChartEvent, Chart, ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { formatNumber } from '@angular/common';
import { Userdetails } from '@models/userdetails';
import { UserService } from '@services/user/userservice.service';
import { distinctUntilChanged } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { OutsideLabelsPlugin } from './pie-chart-labels-plugin';
import { MatMenuItem } from '@angular/material/menu';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';

@Component({
  selector: 'pros-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent extends GenericWidgetComponent implements OnInit, OnChanges, OnDestroy {

  readonly LegendPosition = LegendPosition;

  plugins: ChartConfiguration['plugins'] = [];
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
  displayCriteriaOption = this.displayCriteriaOptions[0].value;
  chartLegend: ChartLegend[] = [];
  lablels: string[] = [];
  dataSet: string[] = [];
  userDetails: Userdetails;
  total = 0;
  orientation = 'pie';
  isTableView = false;
  tableDataSource: any = [];
  displayedColumnsId: string[] = [];
  widgetViewDetails: WidgetViewDetails;
  @ViewChild('mainChart', { read: BaseChartDirective }) chart: BaseChartDirective;
  @ViewChild('imageChart', { read: BaseChartDirective }) imageChart: BaseChartDirective;
  @ViewChild('viewasItem') viewasItem: MatMenuItem;
  @ViewChild('contentRef', { read: ElementRef }) contentRef: ElementRef<HTMLElement>;

  public pieChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index'
    },
    onClick: (event?: ChartEvent, activeElements?: Array<{}>) => {
      this.stackClickFilter(event.native, activeElements);
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        display: false
      },
      y: {
        grid: {
          display: false
        },
        display: false
      }
    },
    plugins: {
      piechartLabels: {
        display: false
      },
      datalabels: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: TooltipItem<any>) => {
            let datalabel = tooltipItem.label;
            const value = ': ' + tooltipItem.formattedValue;
            datalabel += value;
            return datalabel.toString();
          }
        },
        displayColors: false
      },
      legend: {
        display: false,
        labels: {
          boxWidth: 15,
          boxHeight: 15,
          generateLabels: (chart: Chart) => {
            const array: LegendItem[] = [];
            chart.data.labels.forEach((l, idx) => {
              const item = { text: l, datasetIndex: idx, fillStyle: chart.data.datasets[0].backgroundColor[idx] } as LegendItem;
              array.push(item);
            });
            return array;
          }
        },
        onClick: (event: ChartEvent, legendItem: LegendItem) => {
          // call protype of stacked bar chart componenet
          this.legendClick(legendItem);
        },

      },
    },
    elements: {
      arc: {
        borderWidth: 0
      }
    }

  };

  // Properties for downing images for mainly legends
  public pieChartImmageOptions: ChartOptions;
  /** Add height so piechartLabels don't overlap */
  legendHeight = 0;
  /** This stop the scroll bar increasing over the download */
  imageCanvasDisplay = 'none';

  public pieChartColors: Array<any> = [
    {
      backgroundColor: [],

    }
  ];

  public pieChartData: any[] = [
    {
      data: [0, 0, 0, 0, 0, 0],
      borderAlign: 'center',
      backgroundColor: []
    },
  ];
  returndata: any;
  subscriptions: Subscription[] = [];
  scrollHeight = 0;
  legendScrollHeight = 0;
  computedSizeHeight = 0;
  legendList: { lablel: string; backgroundColor: string; show?: boolean, datasetIndex: number }[];
  showLegendFilter: boolean;

  constructor(
    private widgetService: WidgetService,
    private reportService: ReportService,
    private snackBar: MatSnackBar,
    @Inject(LOCALE_ID) public locale: string,
    public matDialog: MatDialog,
    private userService: UserService,
    private sharedService: SharedServiceService
  ) {
    super(matDialog);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.filterCriteria && changes.filterCriteria.previousValue !== undefined && changes.filterCriteria.currentValue !== changes.filterCriteria.previousValue && !this.widgetInfo.isEnableGlobalFilter) {
      this.scrollHeight = 0;
      this.legendHeight = 0;
      this.lablels = [];
      this.chartLegend = [];
      this.pieChartData = [{
        data: [0, 0, 0, 0, 0,],
        borderAlign: 'center',
        backgroundColor: []
      }];
      this.filterCriteria = this.filterCriteria.filter(item => item.fieldId !== '__DIW_STATUS');
      this.sharedService.setFilterCriteriaData(this.filterCriteria);
      if (this.userDetails) {
        this.isFetchingData = true;
        this.getPieChartData(this.widgetId, this.filterCriteria);
      }
    }

    if (changes && changes.boxSize && changes.boxSize.previousValue !== changes.boxSize.currentValue) {
      this.boxSize = changes.boxSize.currentValue;
    }

    if (changes && changes.widgetInfo && changes.widgetInfo.previousValue !== undefined && !isEqual(changes.widgetInfo.previousValue, changes.widgetInfo.currentValue)) {
      this.lablels = [];
      this.chartLegend = [];
      this.getPieConfigurationData();
      this.getPieChartData(this.widgetId, this.filterCriteria);
    }
  }

  ngOnInit(): void {
    if (this.widgetInfo.widgetColorPalette) {
      this.widgetColorPalette = this.widgetInfo.widgetColorPalette;
    }
    if (this.widgetInfo.widgetAdditionalProperties && this.widgetInfo.widgetAdditionalProperties.displayCriteria) {
      this.displayCriteriaOption = this.widgetInfo.widgetAdditionalProperties.displayCriteria;
    }
    this.getPieConfigurationData();
    const getUserDetails = this.userService.getUserDetails().pipe(distinctUntilChanged()).subscribe(
      (response: Userdetails) => {
        if (!isEqual(response, this.userDetails)) {
          this.userDetails = response;
          if (this.widgetInfo.objectType && this.widgetInfo.field) {
            this.isFetchingData = true;
            this.getPieChartData(this.widgetId, this.filterCriteria);
          }
        }
      }
    );
    this.subscriptions.push(getUserDetails);

    // after color defined update on widget
    const afterColorDefined = this.afterColorDefined.subscribe(res => {
      if (res) {
        this.updateColorBasedOnDefined(res);
      }
    });
    this.subscriptions.push(afterColorDefined);
  }

  computeGraphSize() {
    this.computedSizeHeight = this.widgetInfo.height + this.scrollHeight;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  /**
   * function to get configuration of pie chart like legend positions, data lables etcetra..
   */
  public getPieConfigurationData(): void {
    // if showLegend flag will be true it show legend on Stacked bar widget
    // if (this.widgetInfo.chartProperties.isEnableLegend) {
    //   this.pieChartOptions.plugins.legend = {
    //     ...this.pieChartOptions.plugins.legend,
    //     display: true,
    //     align: 'end',
    //     position: this.widgetInfo.chartProperties.legendPosition
    //   };
    // }
    // else {
    //   this.pieChartOptions.plugins.legend = {
    //     ...this.pieChartOptions.plugins.legend,
    //     display: false,
    //   };
    // }
    // if (this.chart) {
    //   this.chart.options.plugins.legend = this.pieChartOptions.plugins.legend;
    //   this.chart.chart.options.plugins.legend = this.pieChartOptions.plugins.legend;
    // }
    //  if showCountOnStack flag will be true it show datalables on stack and position of datalables also configurable
    if (this.widgetInfo.chartProperties?.isEnableDatalabels) {
      this.plugins = [OutsideLabelsPlugin];
      this.pieChartOptions.plugins.piechartLabels = {
        ...this.pieChartOptions.plugins.piechartLabels,
        display: true,
        isEnabledBarPerc: this.widgetInfo.chartProperties?.isEnabledBarPerc,
        legendPosition: this.widgetInfo.chartProperties?.legendPosition,
        scrollHeight: (value: number) => {
          if (this.scrollHeight === 0) {
            this.scrollHeight = value;
            this.computeGraphSize();
            // console.log('this.scrollHeight', this.scrollHeight);
          }
        },
        formatter: this.formatter
      };
      // this.plugins = [ OutsideLabelsPlugin ];
      // this.pieChartOptions.plugins.datalabels = {
      //   ...this.pieChartOptions.plugins.datalabels,
      //   display: true,
      //   align: this.pieWidget.getValue().datalabelsPosition,
      //   anchor: this.pieWidget.getValue().datalabelsPosition,
      // };
      // this.chart.options.plugins.datalabels = this.pieChartOptions.plugins.datalabels;
      // this.chart.chart.options.plugins.datalabels = this.pieChartOptions.plugins.datalabels;
    } else {
      this.scrollHeight = 0;
      this.computeGraphSize();
      this.pieChartOptions.plugins.piechartLabels = {
        ...this.pieChartOptions.plugins.piechartLabels,
        display:false
      }
    }
    if (this.chart) {
      this.chart.options.plugins.piechartLabels = this.pieChartOptions.plugins.piechartLabels;
      this.chart.chart.options.plugins.piechartLabels = this.pieChartOptions.plugins.piechartLabels;
    }
  }

  formatter(value: number): string {
    if (this.total > 0) {
      return (value * 100 / this.total).toFixed(2) + '%';
    } else {
      return value.toString();
    }
  }

  /**
   * function to get data of the pie chart
   * @param widgetId Id of the widget
   * @param critria crieteria
   */
  public getPieChartData(widgetId: number, critria: Criteria[]): void {
    forkJoin([this.widgetService.getWidgetView(String(this.reportId), String(widgetId)), this.widgetService.getWidgetData(String(widgetId), critria, '', '', '', this.userDetails?.defLocs?.toString())]).subscribe(res => {
      this.widgetViewDetails = res[0];
      this.returndata = res[1];
      this.isFetchingData = false;
      this.updateChart(this.returndata);
    }, err => {
      console.log('Error');
      this.isFetchingData = false;
    })
  }

  updateChart(returndata) {
    if (this.widgetViewDetails?.payload?.view === WidgetView.TABLE_VIEW) {
      this.isTableView = true;
    }
    else {
      this.isTableView = false;
    }
    const res = Object.keys(returndata.aggregations);
    let arrayBuckets = returndata.aggregations[res[0]] ? returndata.aggregations[res[0]].buckets ? returndata.aggregations[res[0]].buckets : [] : [];
    if (arrayBuckets.length === 0) {
      const buckets1 = returndata.aggregations['nested#Nest_Bar'] ? returndata.aggregations['nested#Nest_Bar'] : returndata.aggregations['nested#nested_tags'] ? returndata.aggregations['nested#nested_tags'] :[];
      if (buckets1) {
        const resValue = Object.keys(buckets1);
        const value = resValue.filter(data => {
          return data.includes('#BAR_CHART');
        });
        arrayBuckets = buckets1[value[0]] ? buckets1[value[0]].buckets ? buckets1[value[0]].buckets : [] : [];
      }
    }
    this.dataSet = [];
    this.lablels = [];
    this.chartLegend = []
    // if (arrayBuckets.length > 20) {
    //   arrayBuckets.length = 20;
    // }
    arrayBuckets.forEach(bucket => {
      const key = bucket.key === '' ? this.widgetInfo.chartProperties?.blankValueAlias ? this.widgetInfo.chartProperties?.blankValueAlias : 'Undefined' : bucket.key;
      this.lablels.push(key);
      this.dataSet.push(bucket.doc_count);
    });
    if (this.widgetInfo.fieldCtrl && (this.widgetInfo.fieldCtrl.picklist === '0' && (this.widgetInfo.fieldCtrl.dataType === 'DTMS' || this.widgetInfo.fieldCtrl.dataType === 'DATS'))) {
      if (this.chartLegend.length === 0) {
        this.getDateFieldsDesc(arrayBuckets);
      } else {
        this.setLabels();
      }
    } else if (this.widgetInfo.fieldCtrl && (this.widgetInfo.fieldCtrl.picklist === '1' || this.widgetInfo.fieldCtrl.picklist === '37' || this.widgetInfo.fieldCtrl.picklist === '30')) {
      if (this.chartLegend.length === 0) {
        this.getFieldsMetadaDesc(arrayBuckets);
      } else {
        this.setLabels();
      }
    } else {
      if (this.chartLegend.length === 0) {
        this.getFieldsDesc(arrayBuckets);
      } else {
        this.setLabels();
      }
    }

    if (this.widgetInfo.chartProperties?.isEnableDatalabels && this.dataSet && this.dataSet.length > 0) {
      let longest: string;
      if (this.widgetInfo.chartProperties?.isEnabledBarPerc) {
        this.total = Number(this.dataSet.reduce((accumulator, currentValue) => accumulator + currentValue));
        longest = this.dataSet.map(value => this.formatter(Number(value))).sort((a, b) => b.length - a.length)[0];
      } else {
        longest = this.dataSet.map(value => Number(value)).sort((a, b) => b - a)[0].toString();
      }
      if (longest) {
          this.pieChartOptions = {
            ...this.pieChartOptions,
            layout: {
                padding: {
                    left: this.widgetInfo.chartProperties?.legendPosition === LegendPosition.left ? 0 : longest.length * 8,
                    right: this.widgetInfo.chartProperties?.legendPosition === LegendPosition.right ? 0 : longest.length * 8
                }
            }
          };
      }
    }
    // if (this.widgetInfo.chartProperties.isEnabledBarPerc) {
    //   this.total = this.dataSet.length ? Number(this.dataSet.reduce((accumulator, currentValue) => accumulator + currentValue)) : 0;
    //   const dataTotal = this.total;
    //   this.pieChartOptions.plugins.datalabels = {
    //     ...this.pieChartOptions.plugins.datalabels,
    //     formatter(value, context) {
    //       return ((value * 100) / dataTotal).toFixed(2) + '%';
    //     },
    //     display: true,
    //     align: this.widgetInfo.chartProperties.datalabelsPosition,
    //     anchor: this.widgetInfo.chartProperties.datalabelsPosition,
    //   };
    // } else if(this.widgetInfo.chartProperties.isEnableDatalabels){
    //   this.total = this.dataSet.length ? Number(this.dataSet.reduce((accumulator, currentValue) => accumulator + currentValue)) : 0;
    //   const dataTotal = this.total;
    //   this.pieChartOptions.plugins.datalabels = {
    //     ...this.pieChartOptions.plugins.datalabels,
    //     formatter(value, context) {
    //       return ((value * dataTotal) / 100);
    //     },
    //     display: true,
    //     align: this.widgetInfo.chartProperties.datalabelsPosition,
    //     anchor: this.widgetInfo.chartProperties.datalabelsPosition,
    //   };
    // }

    if (this.chart) {
      this.chart.options.plugins.datalabels = this.pieChartOptions.plugins.datalabels;
      if (this.chart.chart) {
        this.chart.chart.options.plugins.datalabels = this.pieChartOptions.plugins.datalabels;
        this.imageChart.chart.options.plugins.datalabels = this.pieChartOptions.plugins.datalabels;
      }
    }

    this.pieChartData = [{
      data: this.dataSet,
      type: 'pie',
      backgroundColor: this.pieChartColors[0]?.backgroundColor
    }];
    if (this.chart) {
      this.chart.data.datasets = this.pieChartData;
      this.imageChart.data.datasets = this.pieChartData;
    }
    this.getColor();

    if (this.widgetViewDetails?.payload?.view === WidgetView.TABLE_VIEW) {
      this.isTableView = true;
      this.getTableData();
    }
    else {
      this.isTableView = false;
    }

    this.getLegendData();

    // update chart after data sets change
    if (this.chart && !this.isTableView) {
      this.chart.update();
      this.imageChart.update();
    }
  }

  @HostListener('window:resize', [])
  getLegendData() {
    if (!this.widgetInfo.chartProperties?.isEnableLegend) {
      return;
    }

    const legendList: { lablel: string; backgroundColor: string; show?: boolean, datasetIndex: number }[] = [];
    this.pieChartData[0].data.forEach((value, index) => {
      legendList.push({
        lablel: this.lablels[index] ? this.lablels[index] : 'undefined',
        backgroundColor: this.pieChartData[0].backgroundColor[index],
        datasetIndex: index
      });
    });

    if (this.contentRef) {
      const screenSize = (this.widgetInfo.chartProperties?.legendPosition === LegendPosition.top || this.widgetInfo.chartProperties?.legendPosition === LegendPosition.bottom) ? this.contentRef.nativeElement.clientWidth : this.contentRef.nativeElement.clientHeight;

      let listWidth = 0;
      if (this.widgetInfo.chartProperties?.legendPosition === LegendPosition.top || this.widgetInfo.chartProperties?.legendPosition === LegendPosition.bottom) {
        this.legendList = legendList.map((value, index) => {
          listWidth += (value.lablel.length * 9) + 14;

          if (listWidth < screenSize - 36) {
            value.show = true;
          }
          return value;
        });
      } else {
        this.legendList = legendList.map((value, index) => {
          listWidth += 36;

          if (listWidth < screenSize - 36) {
            value.show = true;
          }
          return value;
        });
      }
    } else {
      this.legendList = legendList;
    }
    this.showLegendFilter = this.legendList.some(l => !l.show);
  }

  /**
   * Update label based on configuration
   * @param buckets update lable
   */
  getFieldsDesc(buckets: any[]) {
    const fldid = this.widgetInfo.field;
    let locale = this.locale !== '' ? this.locale.split('-')[0] : 'EN';
    locale = locale.toUpperCase();
    const finalVal = {} as any;
    buckets.forEach(bucket => {
      let key = bucket.key === '' ? this.widgetInfo.chartProperties?.blankValueAlias ? this.widgetInfo.chartProperties?.blankValueAlias : 'Undefined' : bucket.key;
      let chartLegend: ChartLegend;
      // let key = bucket.key;
      const hits = bucket['top_hits#items'] ? bucket['top_hits#items'].hits.hits[0] : null;
      const val = hits._source.hdvs ? (hits._source.hdvs[fldid] ?
        (hits._source.hdvs[fldid] ? hits._source.hdvs[fldid].vc : null) : null) :
        (hits._source.staticFields && hits._source.staticFields[fldid]) ?
          (hits._source.staticFields[fldid] ? hits._source.staticFields[fldid].vc : null) :
          (hits._source[fldid] ? hits._source[fldid].vc : null);
      if (val) {
        const valArray = [];
        val.forEach(v => {
          if (v.t) {
            valArray.push(v.t);
          }
          if (v.c) {
            key = v.c;
          }
        });
        const finalText = valArray.toString();
        if (finalText) {
          finalVal[key] = finalText
        } else {
          finalVal[key] = key;
        }
      } else {
        finalVal[key] = key;
      } if (this.widgetInfo.fieldCtrl.picklist === '35') {
        finalVal[key] = this.getFields(fldid, key);
      }
      chartLegend = { text: finalVal[key], code: key, legendIndex: this.chartLegend.length };
      this.chartLegend.push(chartLegend);
    });
    this.setLabels();
  }

  /**
   * Update label based on configuration
   * @param buckets update lable
   */
  getDateFieldsDesc(buckets: any[]) {
    const fldid = this.widgetInfo.field;
    const finalVal = {} as any;
    this.chartLegend = [];
    buckets.forEach(bucket => {
      const key = bucket.key === '' ? this.widgetInfo.chartProperties?.blankValueAlias ? this.widgetInfo.chartProperties?.blankValueAlias : 'Undefined' : bucket.key;
      const hits = bucket['top_hits#items'] ? bucket['top_hits#items'].hits.hits[0] : null;
      const val = hits._source.hdvs ? (hits._source.hdvs[fldid] ?
        (hits._source.hdvs[fldid] ? hits._source.hdvs[fldid].vc : null) : null) :
        (hits._source.staticFields && hits._source.staticFields[fldid]) ?
          (hits._source.staticFields[fldid] ? hits._source.staticFields[fldid].vc : null) :
          (hits._source[fldid] ? hits._source[fldid].vc : null);
      if (val) {
        const valArray = [];
        val.forEach(v => {
          if (v.c) {
            valArray.push(v.c);
          }
        });
        const finalText = (Number(valArray));
        if (finalText) {
          finalVal[key] = new Date(finalText).toLocaleDateString();
        } else {
          finalVal[key] = new Date(Number(key)).toLocaleDateString();
        }
      } else {
        finalVal[key] = new Date(Number(key)).toLocaleDateString();
      }
    });

    // update lablels
    this.lablels.forEach(cod => {
      let chartLegend: ChartLegend;
      if (cod) {
        const hasData = finalVal[cod];
        if (hasData) {
          chartLegend = { text: hasData, code: cod, legendIndex: this.chartLegend.length };
        } else {
          chartLegend = { text: cod, code: cod, legendIndex: this.chartLegend.length };
        }
      } else {
        chartLegend = { text: cod, code: cod, legendIndex: this.chartLegend.length };
      }
      this.chartLegend.push(chartLegend);
    });
    this.setLabels();
  }

  /**
   * Http call for get description of fields code
   *
   */
  getFieldsMetadaDesc(buckets: any[]) {
    const fldid = this.widgetInfo.field;
    const finalVal = {} as any;
    this.chartLegend = [];
    buckets.forEach(bucket => {
      let key = bucket.key === '' ? this.widgetInfo.chartProperties.blankValueAlias ? this.widgetInfo.chartProperties.blankValueAlias : 'Undefined' : bucket.key;
      let chartLegend: ChartLegend;
      const hits = bucket['top_hits#items'] ? bucket['top_hits#items'].hits.hits[0] : null;
      const val = hits._source.hdvs ? (hits._source.hdvs[fldid] ?
        (hits._source.hdvs[fldid] ? hits._source.hdvs[fldid].vc : null) : null) :
        (hits._source.staticFields && hits._source.staticFields[fldid]) ?
          (hits._source.staticFields[fldid] ? hits._source.staticFields[fldid].vc : null) :
          (hits._source[fldid] ? hits._source[fldid].vc : null);
      if (val) {
        const valArray = [];
        val.forEach(v => {
          if (v.t) {
            valArray.push(v.t);
          }
          if (v.c) {
            key = v.c;
          }
        });
        const finalText = valArray.toString();
        if (finalText) {
          finalVal[key] = finalText
        } else {
          finalVal[key] = key;
        }
      } else {
        finalVal[key] = key;
      } if (fldid === 'OVERDUE' || fldid === 'FORWARDENABLED' || fldid === 'TIME_TAKEN') {
        finalVal[key] = this.getFields(fldid, key);
      }
      chartLegend = { text: finalVal[key], code: key, legendIndex: this.chartLegend.length };
      this.chartLegend.push(chartLegend);
    });
    this.chartLegend = this.filterMetadataByEmptyValues(this.chartLegend);
    this.setLabels();
  }

  legendClick(legendItem: LegendItem) {
    let clickedLegend = this.chartLegend[legendItem.datasetIndex] ? this.chartLegend[legendItem.datasetIndex].code : this.lablels[legendItem.datasetIndex];
    if (clickedLegend === undefined) {
      return false;
    }
    if (clickedLegend === this.widgetInfo.chartProperties?.blankValueAlias) {
      clickedLegend = '';
    }
    const fieldId = this.widgetInfo.field;
    let appliedFilters = this.filterCriteria.filter(fill => fill.fieldId === fieldId);
    this.removeOldFilterCriteria(appliedFilters);
    if (appliedFilters.length > 0) {
      const res = appliedFilters.filter(fill => fill.fieldId === fieldId && fill.widgetType === WidgetType.PIE_CHART && this.widgetInfo.isEnableGlobalFilter);
      if (res.length !== 0) {
        res.forEach(val => {
          val.conditionFieldValue = clickedLegend;
        });
      }
      const cri = appliedFilters.filter(fill => fill.conditionFieldValue === clickedLegend);
      if (cri.length === 0) {
        const critera1: Criteria = new Criteria();
        critera1.fieldId = fieldId;
        critera1.conditionFieldId = fieldId;
        critera1.conditionFieldValue = clickedLegend;
        critera1.blockType = BlockType.COND;
        critera1.conditionOperator = ConditionOperator.EQUAL;
        critera1.widgetType = WidgetType.PIE_CHART;
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
      critera1.widgetType = WidgetType.PIE_CHART;
      critera1.fieldCtrl= this.widgetInfo.fieldCtrl;
      appliedFilters.push(critera1);
    }
    if (this.widgetInfo.fieldCtrl.dataType === 'DTMS' || this.widgetInfo.fieldCtrl.dataType === 'DATS') {
      appliedFilters.shift();
      appliedFilters.push(this.applyDateFilter(clickedLegend, fieldId));
    }
    appliedFilters.forEach(app => this.filterCriteria.push(app));
    this.emitEvtFilterCriteria(this.filterCriteria);

  }
  stackClickFilter(event?: Event, activeElements?: Array<any>) {
    if (activeElements && activeElements.length) {
      const option = this.chart.chart.getElementsAtEventForMode(event, 'index', { intersect: true }, false) as any;
      const clickedIndex = (option[0]).index;
      const clickedLagend = this.chartLegend[clickedIndex];
      const drpCode = this.chartLegend[clickedIndex] ? this.chartLegend[clickedIndex].code : this.lablels[clickedIndex];
      if (drpCode === undefined) {
        return false;
      }
      const fieldId = this.widgetInfo.field;
      let appliedFilters = this.filterCriteria.filter(fill => fill.fieldId === fieldId);
      this.removeOldFilterCriteria(appliedFilters);
      if (appliedFilters.length > 0) {
        const res = appliedFilters.filter(fill => fill.fieldId === fieldId && fill.widgetType === WidgetType.PIE_CHART && this.widgetInfo.isEnableGlobalFilter);
        if (res.length !== 0) {
          res.forEach(val => {
            val.conditionFieldValue = clickedLagend.code;
          })
        }
        const cri = appliedFilters.filter(fill => fill.conditionFieldValue === clickedLagend.code);
        if (cri.length === 0) {
          const critera1: Criteria = new Criteria();
          critera1.fieldId = fieldId;
          critera1.conditionFieldId = fieldId;
          critera1.conditionFieldValue = drpCode;
          critera1.blockType = BlockType.COND;
          critera1.conditionOperator = ConditionOperator.EQUAL;
          critera1.widgetType = WidgetType.PIE_CHART;
          appliedFilters.push(critera1);
        }
      } else {
        appliedFilters = [];
        const critera1: Criteria = new Criteria();
        critera1.fieldId = fieldId;
        critera1.conditionFieldId = fieldId
        critera1.conditionFieldValue = drpCode;
        critera1.blockType = BlockType.COND;
        critera1.conditionOperator = ConditionOperator.EQUAL;
        critera1.widgetType = WidgetType.PIE_CHART;
        appliedFilters.push(critera1);
      }
      if (this.widgetInfo.fieldCtrl.dataType === 'DTMS' || this.widgetInfo.fieldCtrl.dataType === 'DATS') {
        appliedFilters.shift();
        appliedFilters.push(this.applyDateFilter(drpCode, fieldId));
      }
      appliedFilters.forEach(app => this.filterCriteria.push(app));
      this.emitEvtFilterCriteria(this.filterCriteria);
    }
  }


  public getColor(): void {
    this.pieChartColors = [];
    this.pieChartData[0].data.forEach((element, index) => {
      const codeText = this.chartLegend.filter(fil => fil.legendIndex === index)[0];
      if (index === 0) {
        this.pieChartColors.push({
          backgroundColor: [codeText ? this.getUpdatedColorCode(codeText.code) : this.getRandomColor()]
        });
      } else {
        this.pieChartColors[0].backgroundColor.push(codeText ? this.getUpdatedColorCode(codeText.code) : this.getRandomColor());
      }
    });
    if(this.chart) {
      this.chart.data.datasets[0].backgroundColor = this.pieChartColors[0]?.backgroundColor || [];
      this.imageChart.data.datasets[0].backgroundColor = this.pieChartColors[0]?.backgroundColor || [];
      this.chart.update();
    }
  }

  public getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  /*
  * download chart data as CSV
  */
  downloadCSV(): void {
    const excelData = [];
    for (let i = 0; i < this.lablels.length; i++) {
      const obj = {} as any;
      obj[this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.field] = this.lablels[i] + '\t';
      obj.Value = formatNumber(Number(this.dataSet[i]), 'en-US') + '\t';
      excelData.push(obj);
    }
    this.widgetService.downloadCSV('Pie-Chart', excelData);
  }

  /*
  * download chart as image
  */
  downloadImage() {
    if (this.widgetInfo.chartProperties?.isEnableLegend) {
      this.imageCanvasDisplay = 'block';
      this.pieChartImmageOptions = JSON.parse(JSON.stringify(this.pieChartOptions));
      window.setTimeout(() => { // This is here because the Dom is not updating fast enough.
        const legend: any = {
          ...this.pieChartOptions.plugins.legend,
          display: true,
          align: 'end',
          position: this.widgetInfo.chartProperties?.legendPosition
        };
        if (this.imageChart) {
          this.imageChart.options.plugins.legend = legend;
          this.imageChart.chart.options.plugins.legend = legend;
          if (this.widgetInfo.chartProperties?.legendPosition === LegendPosition.top) {
            if (this.legendHeight === 0) {
              this.legendHeight = (this.imageChart.chart as any).legend.maxHeight;
            }
            this.imageChart.options.plugins.piechartLabels.legendTop = this.legendHeight;
            this.imageChart.chart.options.plugins.piechartLabels.legendTop = this.legendHeight;
          }
          (this.imageChart.chart.options.animation as any).onComplete = () => {
            this.widgetService.downloadImage(this.imageChart.toBase64Image(), 'Pie-Chart.png');
            this.imageCanvasDisplay = 'none';
            (this.imageChart.chart.options.animation as any).onComplete = () => {};
          }
          this.imageChart.update();
        }
      }, 100);
    } else {
      this.widgetService.downloadImage(this.chart.toBase64Image(), 'Pie-Chart.png');
    }
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


  emitEvtFilterCriteria(critera: Criteria[]): void {
    this.evtFilterCriteria.emit(critera);
  }

  /**
   * Open Color palette...
   */
  openColorPalette() {
    const req: WidgetColorPalette = new WidgetColorPalette();
    req.widgetId = String(this.widgetId);
    req.reportId = String(this.reportId);
    req.widgetDesc = this.widgetInfo.widgetTitle;
    req.colorPalettes = [];

    this.pieChartData[0].data.forEach((data, index) => {
      const colorCode = this.pieChartData[0].backgroundColor[index];
      const codeTxtObj = this.chartLegend.filter(fil => fil.legendIndex === index)[0];
      if (codeTxtObj) {
        req.colorPalettes.push({
          code: codeTxtObj.code,
          text: codeTxtObj.text,
          colorCode
        });
      }
    });
    super.openColorPalette(req);
  }

  /**
   * Update stacked color based on color definations
   * @param res updated color codes
   */
  updateColorBasedOnDefined(res: WidgetColorPalette) {
    this.widgetColorPalette = res;
    this.getColor();
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

  setLabels() {
    switch (this.displayCriteriaOption) {
      case DisplayCriteria.CODE:
        this.lablels = this.chartLegend.map(map => map.code);
        break;
      case DisplayCriteria.TEXT:
        this.lablels = this.chartLegend.map(map => map.text);
        break;
      default:
        this.lablels = this.chartLegend.map(map => map.code + ' -- ' + map.text);
        break;
    }
    if (this.chart) {
      this.chart.data.labels = this.lablels;
      this.imageChart.data.labels = this.lablels;
      if (this.chart.chart) {
        this.chart.chart.data.labels = this.lablels;
        this.imageChart.chart.data.labels = this.lablels;
        this.chart.chart.update();
      }
    }
  }

  saveDisplayCriteria() {
    const saveDisplayCriteria = this.widgetService.saveDisplayCriteria(this.widgetInfo.widgetId, this.widgetInfo.widgetType, this.displayCriteriaOption).subscribe(res => {
      this.updateChart(this.returndata);
    }, error => {
      console.error(`Error : ${error}`);
      this.snackBar.open(`Something went wrong`, 'Close', { duration: 3000 });
    });
    this.subscriptions.push(saveDisplayCriteria);
  }

  applyDateFilter(strtdate: string, fieldId: string): Criteria {
    const strtDate = strtdate;
    const endDate = String(Number(strtdate) + 24 * 60 * 60 * 1000);
    const critera: Criteria = new Criteria();
    critera.fieldId = fieldId;
    critera.conditionFieldId = fieldId;
    critera.conditionFieldEndValue = endDate;
    critera.conditionFieldStartValue = strtDate;
    critera.blockType = BlockType.COND;
    critera.conditionOperator = ConditionOperator.RANGE;
    critera.widgetType = WidgetType.PIE_CHART;
    critera.fieldCtrl = this.widgetInfo.fieldCtrl;
    return critera;
  }

  /**
   * Changes widget view
   */
  viewChange(value) {
    const widgetViewRequest: WidgetViewRequestPayload = {
      uuid: '',
      reportId: this.reportId,
      widgetId: this.widgetId,
      view: value ? WidgetView.TABLE_VIEW : WidgetView.GRAPH_VIEW
    }
    if (!this.widgetViewDetails?.payload?.uuid) {
      this.widgetService.saveWidgetView(widgetViewRequest).subscribe(res => {
        this.getPieChartData(this.widgetId, this.filterCriteria);
      }, err => {
        console.log('Error')
      });
    }
    else {
      widgetViewRequest.uuid = this.widgetViewDetails?.payload?.uuid;
      this.widgetService.updateWidgetView(widgetViewRequest).subscribe(res => {
        this.getPieChartData(this.widgetId, this.filterCriteria);
      }, err => {
        console.log('Error')
      });
    }
  }

  /**
   * @returns table dataSource
   */
  getTableData() {
    const excelData = [];
    for (let i = 0; i < this.lablels.length; i++) {
      const obj = {} as any;
      obj[this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.field] = this.lablels[i] + '\t';
      obj.Value = formatNumber(Number(this.dataSet[i] ? this.dataSet[i] : ''), 'en-US') + '\t';
      excelData.push(obj);
    }
    if (!this.displayedColumnsId.includes(this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.field)) {
      this.displayedColumnsId.push(this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.field);
    }
    if (!this.displayedColumnsId.includes('Value')) {
      this.displayedColumnsId.push('Value');
    }
    this.tableDataSource = excelData;
  }

  /**
   * Disable hover over for 'View as' option in menu
   */
  menuOpened() {
    this.viewasItem._handleMouseEnter = () => {};
  }
}
