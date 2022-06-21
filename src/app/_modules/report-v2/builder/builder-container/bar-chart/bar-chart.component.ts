import { Component, OnInit, OnChanges, ViewChild, LOCALE_ID, Inject, SimpleChanges, OnDestroy } from '@angular/core';
import { WidgetService } from 'src/app/_services/widgets/widget.service';
import { GenericWidgetComponent } from '../../generic-widget/generic-widget.component';
import {
  Criteria,
  ChartLegend,
  ConditionOperator,
  BlockType,
  Orientation,
  WidgetColorPalette,
  DisplayCriteria,
  WidgetType,
  Buckets,
  FieldCodeText,
  OrderWith,
  DatalabelsPosition,
  WidgetViewDetails,
  WidgetView,
  WidgetViewRequestPayload,
} from '../../../_models/widget';
import { forkJoin, Subscription } from 'rxjs';
import { ChartOptions, TooltipItem, LegendItem, ChartEvent, ActiveElement } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { formatNumber } from '@angular/common';
import { Userdetails } from '@models/userdetails';
import { UserService } from '@services/user/userservice.service';
import { distinctUntilChanged } from 'rxjs/operators';
import { Context } from 'chartjs-plugin-datalabels/types/context';
import { isEqual } from 'lodash';
import { MatMenuItem } from '@angular/material/menu';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';

@Component({
  selector: 'pros-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent extends GenericWidgetComponent implements OnInit, OnChanges, OnDestroy {
  displayCriteriaOptions = [
    {
      key: 'Text',
      value: DisplayCriteria.TEXT,
    },
    {
      key: 'Code',
      value: DisplayCriteria.CODE,
    },
    {
      key: 'Code and Text',
      value: DisplayCriteria.CODE_TEXT,
    },
  ];
  displayCriteriaOption: DisplayCriteria = this.displayCriteriaOptions[0].value;
  chartLegend: ChartLegend[] = [];
  lablels: string[] = [];
  dataSet: any = [];
  userDetails: Userdetails;
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;
  @ViewChild('viewasItem') viewasItem: MatMenuItem;
  @ViewChild('imageChart', { read: BaseChartDirective }) imageChart: BaseChartDirective;
  orientation = 'bar';
  total = 0;
  isTableView = false;
  displayedColumnsId: string[] = [];
  tableDataSource: any = [];
  widgetViewDetails: WidgetViewDetails;

  minBarSizeThreshold = 5;
  maxBarSizeThreshold = 100;
  minBarWidth = 10;
  computedSize = {
    height: 0,
    width: 0
  }
  isDownloading = false;
  defaultComputedWidth = 30;
  // axis label character limit
  labelTooltipCharLimit = 15;

  public barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest',
    },
    layout: {
      padding: {
          right: 20
      }
    },
    parsing: false,
    animation: false,
    normalized: true,
    onClick: (event?: ChartEvent, activeElements?: ActiveElement[]) => {
      this.stackClickFilter(event.native, activeElements);
    },
    plugins: {
      datalabels: {
        display: false,
        clip: true, // This property hides lables going beyond chart area
        color: 'black',
        formatter: (value, context: Context) => {
          if (context.chart.options.indexAxis === 'y') {
            return value.x;
          }
          return value.y;
        },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: TooltipItem<any>) => {
            if (isNaN(parseInt(tooltipItem.formattedValue, 10))) {
              return '';
            }
            // console.log('format number====',formatNumber(Number(tooltipItem.formattedValue ? tooltipItem.formattedValue : ''), 'en-US'),'tooltip formated value====',tooltipItem.formattedValue)
            return `${tooltipItem.formattedValue}`;
          },
        },
        displayColors: false,
      },
      legend: {
        display: false,
        onClick: (event: ChartEvent, legendItem: LegendItem) => {
          // call protype of stacked bar chart componenet
          this.legendClick(legendItem);
        },
      },
    },
    scales: {
      x: {
        title: {
          display: false,
        },
        ticks: {
          minRotation: 0,
          maxRotation: 50,
        },
      },
      y: {
        title: {
          display: false,
        },
      },
    },
  };

  public barChartData: any[] = [
    {
      label: 'Loading..',
      stack: 'a',
      barThickness: 80,
      data: [{ x: 0, y: 0 }],
    },
  ];
  returndata: any;
  subscriptions: Subscription[] = [];

  constructor(
    private widgetService: WidgetService,
    private snackBar: MatSnackBar,
    @Inject(LOCALE_ID) public locale: string,
    public matDialog: MatDialog,
    private userService: UserService,
    private sharedService: SharedServiceService
  ) {
    super(matDialog);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes &&
      changes.filterCriteria &&
      changes.filterCriteria.previousValue !== undefined &&
      changes.filterCriteria.previousValue !== changes.filterCriteria.currentValue &&
      !this.widgetInfo.isEnableGlobalFilter
    ) {
      this.lablels = [];
      this.chartLegend = [];
      this.barChartData = [];
      this.filterCriteria = this.filterCriteria.filter((item) => item.fieldId !== '__DIW_STATUS');
      this.sharedService.setFilterCriteriaData(this.filterCriteria);
      this.isFetchingData = true;
      this.getBarChartData(this.widgetId, this.filterCriteria);
    }
    if (changes && changes.boxSize && changes.boxSize.previousValue !== changes.boxSize.currentValue) {
      this.boxSize = changes.boxSize.currentValue;
    }

    if (
      changes &&
      changes.widgetInfo &&
      changes.widgetInfo.previousValue !== undefined &&
      !isEqual(changes.widgetInfo.previousValue, changes.widgetInfo.currentValue)
    ) {
      this.lablels = [];
      this.chartLegend = [];
      this.barChartData = [];
      this.getBarConfigurationData();
      this.getBarChartData(this.widgetId, this.filterCriteria);
    }
  }

  ngOnInit(): void {
    if (this.widgetInfo.widgetColorPalette) {
      this.widgetColorPalette = this.widgetInfo.widgetColorPalette;
    }
    if (this.widgetInfo.widgetAdditionalProperties && this.widgetInfo.widgetAdditionalProperties.displayCriteria) {
      this.displayCriteriaOption = this.widgetInfo.widgetAdditionalProperties.displayCriteria;
    }

    this.computedSize = {
      width: this.widgetInfo.width ? this.widgetInfo.width : 0,
      height: this.widgetInfo.height ? this.widgetInfo.height : 0
    }

    const getUserDetails = this.userService
      .getUserDetails()
      .pipe(distinctUntilChanged())
      .subscribe((response: Userdetails) => {
        if (!isEqual(this.userDetails, response)) {
          this.userDetails = response;
          if (this.widgetInfo.objectType && this.widgetInfo.field) {
            this.isFetchingData = true;
            this.getBarConfigurationData();
            this.getBarChartData(this.widgetId, this.filterCriteria);
          }
        }
      });
    this.subscriptions.push(getUserDetails);

    // after color defined update on widget
    const afterColorDefined = this.afterColorDefined.subscribe((res) => {
      if (res) {
        this.updateColorBasedOnDefined(res);
      }
    });
    this.subscriptions.push(afterColorDefined);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  public getBarConfigurationData(): void {
    // Bar orientation
    this.orientation = this.widgetInfo.chartProperties.orientation === Orientation.VERTICAL ? 'bar' : 'horizontalBar';
    if (this.widgetInfo.chartProperties.orientation === Orientation.HORIZONTAL) {
      this.barChartOptions.indexAxis = 'y';
    } else {
      this.barChartOptions.indexAxis = 'x';
    }

    // if showLegend flag will be true it show legend on Bar widget
    if (this.widgetInfo.chartProperties.isEnableLegend) {
      this.barChartOptions.plugins.legend = {
        ...this.barChartOptions.plugins.legend,
        display: true,
        position: this.widgetInfo.chartProperties.legendPosition,
      };
    } else {
      this.barChartOptions.plugins.legend = {
        ...this.barChartOptions.plugins.legend,
        display: false,
      };
    }
    if (this.chart) {
      this.chart.options.plugins.legend = this.barChartOptions.plugins.legend;
      this.chart.chart.options.plugins.legend = this.barChartOptions.plugins.legend;
    }

    // if showCountOnStack flag will be true it show datalables on stack and position of datalables also configurable
    if (this.widgetInfo.chartProperties.isEnableDatalabels) {
      const scope = this;
      this.barChartOptions.plugins.datalabels = {
        ...this.barChartOptions.plugins.datalabels,
        formatter(value, context) {
          let formattedValue;
          if (scope.orientation === 'bar') {
            formattedValue = value.y;
          } else {
            formattedValue = value.x;
          }
          return formatNumber(Number(formattedValue ? formattedValue : ''), 'en-US');
        },
        display: 'auto',
        align: this.widgetInfo.chartProperties.datalabelsPosition,
        anchor: this.widgetInfo.chartProperties.datalabelsPosition,
      };
      if (this.widgetInfo.chartProperties.datalabelsPosition === DatalabelsPosition.end) {
        // Datalabel was being cut off the screen when the height was small.
        this.barChartOptions.plugins.datalabels.offset = -4;
        this.barChartOptions.plugins.datalabels.padding = 0;
      }
    } else {
      this.barChartOptions.plugins.datalabels = {
        ...this.barChartOptions.plugins.datalabels,
        display: false,
      };
    }

    if (this.chart) {
      this.chart.options.plugins.datalabels = this.barChartOptions.plugins.datalabels;
      if (this.chart.chart) this.chart.chart.options.plugins.datalabels = this.barChartOptions.plugins.datalabels;
    }

    if(this.widgetInfo.chartProperties.isEnableBenchMark) {
      const annotation1 = {
        type: 'line',
        borderWidth: 1,
        borderColor: 'black',
        value: this.widgetInfo.chartProperties.benchMarkValue,
        label: {
          enabled: false
        },
      } as any;
      if(this.orientation === 'bar') {
        annotation1.scaleID = 'y';
      } else {
        annotation1.scaleID = 'x'
      }
      this.barChartOptions.plugins.annotation = {annotations : [annotation1]};
    } else {
      this.barChartOptions.plugins.annotation = {annotations : []}
    }

    if(this.chart) {
      this.chart.options.plugins.annotation = this.barChartOptions.plugins.annotation;
      this.chart.chart.options.plugins.annotation = this.barChartOptions.plugins.annotation;
    }

    // set scale range and axis lebels
    this.setChartAxisAndScaleRange();
  }

  public getBarChartData(widgetId: number, critria: Criteria[]): void {
    forkJoin([
      this.widgetService.getWidgetView(String(this.reportId), String(widgetId)),
      this.widgetService.getWidgetData(String(widgetId), critria, '', '', '', this.userDetails?.defLocs?.toString()),
    ]).subscribe(
      (res) => {
        this.widgetViewDetails = res[0];
        this.returndata = res[1];
        this.isFetchingData = false;
        this.updateChart(this.returndata);
      },
      (err) => {
        console.log('Error');
        this.isFetchingData = false;
      }
    );
  }

  private updateChart(returndata) {
    const res = Object.keys(returndata.aggregations);
    let arrayBuckets = returndata.aggregations[res[0]]
      ? returndata.aggregations[res[0]].buckets
        ? returndata.aggregations[res[0]].buckets
        : []
      : [];
    if (arrayBuckets.length === 0) {
      const buckets1 = returndata.aggregations['nested#Nest_Bar']
        ? returndata.aggregations['nested#Nest_Bar']
        : returndata.aggregations['nested#nested_tags']
        ? returndata.aggregations['nested#nested_tags']
        : [];
      if (buckets1) {
        const resValue = Object.keys(buckets1);
        const value = resValue.filter((data) => {
          return data.includes('#BAR_CHART');
        });
        arrayBuckets = buckets1[value[0]] ? (buckets1[value[0]].buckets ? buckets1[value[0]].buckets : []) : [];
      } else {
        arrayBuckets = [];
      }
    }
    this.dataSet = [];
    this.lablels = [];
    this.chartLegend = [];
    this.sortBarChartData(arrayBuckets);
    if (this.widgetInfo.isEnableRange) {
      // transform data when aging report enable
      this.dataSet = this.transformDataForEnableRange(arrayBuckets);
    } else {
      // transform data when aging report disabled
      this.dataSet = this.transformDataSets(arrayBuckets);
    }

    this.filterByEmptyLabels();
    // update barchartLabels
    if (
      this.widgetInfo.fieldCtrl &&
      this.widgetInfo.fieldCtrl.picklist === '0' &&
      (this.widgetInfo.fieldCtrl.dataType === 'DTMS' || this.widgetInfo.fieldCtrl.dataType === 'DATS')
    ) {

        this.getDateFieldsDesc(arrayBuckets);

        this.setLabels();

    } else if (
      this.widgetInfo.fieldCtrl &&
      (this.widgetInfo.fieldCtrl.picklist === '1' ||
        this.widgetInfo.fieldCtrl.picklist === '37' ||
        this.widgetInfo.fieldCtrl.picklist === '30')
    ) {
      this.getFieldsMetadaDesc(arrayBuckets);
      this.setLabels();
    } else {
      this.getFieldsDesc(arrayBuckets);
      this.setLabels();
    }
    this.setBarChartData();

    // compute graph size
    this.computeGraphSize();

    if (this.widgetViewDetails?.payload?.view === WidgetView.TABLE_VIEW) {
      this.isTableView = true;
      this.getTableData();
    } else {
      this.isTableView = false;
    }

    // update chart after data sets change
    if (this.chart && !this.isTableView) {
      this.chart.update();
    }
  }

  // when labels are empty in particular fields case update datasets accordingly
  filterByEmptyLabels() {
    const fieldId = this.widgetInfo.field;
    if (
      fieldId === 'STATUS' ||
      fieldId === 'USERMODIFIED' ||
      fieldId === 'DATECREATED' ||
      fieldId === 'DATEMODIFIED' ||
      fieldId === 'USERID' ||
      fieldId === 'ROLEID' ||
      fieldId === 'DEFAULTROLE' ||
      fieldId === 'EVENT_ID' ||
      fieldId === 'CLAIMED' ||
      fieldId === 'REQUESTOR_DATE' ||
      fieldId === 'CR_STATUS' ||
      fieldId === 'REQUESTOR_NAME' ||
      fieldId === 'CURRENTUSER' ||
      fieldId === 'PREVIOUSUSER'
    ) {
      this.lablels.forEach((label, index) => {
        if (!label) {
          this.dataSet.splice(index, 1);
        }
      });
    }
  }

  /**
   * Set barChartData of ChartDataSets[]. This get the legends to show in chart with labels
   */
  setBarChartData() {
    const barChartData: any[] = [];
    let dataIndex = 0;
    const axis = ['x', 'y'];
    this.chartLegend.forEach((legend, index) => {
      const data: any[] = [];
      if (this.widgetInfo.isEnableRange) {
        const key = Object.keys(this.dataSet).find(
          (item) => item.toString() === legend.text.toString() || item.toString() === legend.code.toString() || item === legend.text + ' -- ' + legend.code
        );
        if (this.orientation === 'bar') {
          data.push(...this.dataSet[key]);
        } else {
          const tempDataSet = this.dataSet[key].map((item) => {
            const tempData = {};
            tempData[axis[0]] = item[axis[1]];
            tempData[axis[1]] = item[axis[0]];
            return tempData;
          });
          data.push(...tempDataSet);
        }
      } else {
        this.dataSet.forEach((d, dIndex) => {
          let tempData = {};
          if (dIndex === dataIndex) {
            // data.push(+d);
            if (this.orientation === 'bar') {
              tempData[axis[1]] = +d;
              tempData[axis[0]] = this.lablels[index];
            } else {
              tempData[axis[0]] = +d;
              tempData[axis[1]] = this.lablels[index];
            }
          } else {
            // data.push(null);
            tempData = {};
          }
          data.push({ ...tempData });
        });
      }

      dataIndex = dataIndex + 1;
      let obj = {};
      if (legend.text !== 'Total') {
        obj = {
          data,
          label: this.getCodeTextValue(this.chartLegend[index]),
          backgroundColor: this.getUpdatedColorCode(legend.text),
          type: 'bar',
        };
      } else {
        obj = {
          data,
          label: this.getCodeTextValue(this.chartLegend[index]),
          borderColor: '#e4e5e5',
          stack: 'a',
          type: 'bar',
        };
        if (this.widgetInfo.isEnableRange && legend.text === 'Total') {
          // add bar percentage value according to chartlegend count
          let barPercentage;
          if (this.chartLegend.length > 2 && (this.chartLegend.length - 1) % 2 === 0) {
            barPercentage = 1.01 * this.chartLegend.length;
          } else if (this.chartLegend.length > 2 && (this.chartLegend.length - 1) % 2 !== 0) {
            barPercentage = 1 * (this.chartLegend.length - 1);
          } else {
            barPercentage = 3;
          }
          obj = {
            ...obj,
            xAxisId: 'total-x',
            offset: true,
            barThickness: 'flex',
            barPercentage,
            categoryPercentage: this.chartLegend.length > 2 ? 1 : 0.5,
          };
        }
      }
      if (!this.widgetInfo.isEnableRange) {
        const stack = 'stack';
        obj[stack] = 'a';
      }

      if (this.widgetInfo.isEnableRange && legend.text === 'Total') {
        if (barChartData.length > 1) {
          barChartData.splice(Math.floor((this.chartLegend.length - 1) / 2), 0, obj);
        }
      } else {
        if (legend.text !== 'Total' || barChartData.length > 1) barChartData.push(obj);
      }
    });
    if (barChartData.length) {
      this.barChartData = barChartData;
    } else {
      this.barChartData = [
        {
          label: 'Loading..',
          stack: 'a',
          barThickness: 80,
          data: [{ x: 0, y: 0 }],
        },
      ];
    }

    if (this.chart) {
      this.chart.data.datasets = this.barChartData;
    }
  }

  /**
   * Update label based on configuration
   * @param buckets update lable
   */
  getFieldsDesc(buckets: any[]) {
    const fldid = this.widgetInfo.field;
    // let locale = this.locale !== '' ? this.locale.split('-')[0] : 'EN';
    // locale = locale.toUpperCase();
    const finalVal = {} as any;
    buckets.forEach((bucket) => {
      let key =
        bucket.key === ''
          ? this.widgetInfo.chartProperties.blankValueAlias
            ? this.widgetInfo.chartProperties.blankValueAlias
            : ' '
          : bucket.key;
      const hits = bucket['top_hits#items'] ? bucket['top_hits#items'].hits.hits[0] : null;
      const val = hits._source.hdvs
        ? hits._source.hdvs[fldid]
          ? hits._source.hdvs[fldid]
            ? hits._source.hdvs[fldid].vc
            : null
          : null
        : hits._source.staticFields && hits._source.staticFields[fldid]
        ? hits._source.staticFields[fldid]
          ? hits._source.staticFields[fldid].vc
          : null
        : hits._source[fldid]
        ? hits._source[fldid].vc
        : null;
      if (val) {
        const valTextArray = [];
        val.forEach((v) => {
          if (v.t) {
            valTextArray.push(v.t);
          }
          if (v.c) {
            key = v.c;
          }
        });
        const finalText = valTextArray.toString();
        if (finalText) {
          finalVal[key] = finalText;
        } else {
          finalVal[key] = key;
        }
      } else {
        finalVal[key] = key;
      }
      if (this.widgetInfo.fieldCtrl.picklist === '35') {
        finalVal[key] = this.getFields(fldid, key);
      }
      let chartLegend: ChartLegend;
      chartLegend = { text: finalVal[key], code: key, legendIndex: this.chartLegend.length };
      this.chartLegend.push(chartLegend);
    });
    if (this.widgetInfo.chartProperties.showTotal && this.checkIsShowTotal()) {
      const chartLegend = { text: 'Total', code: 'Total', legendIndex: this.chartLegend.length };
      this.chartLegend.push(chartLegend);
    }
    this.chartLegend = this.filterMetadataByEmptyValues(this.chartLegend);
    this.setLabels();
  }

  setLabels() {
    if (!this.widgetInfo.isEnableRange) {
      switch (this.displayCriteriaOption) {
        case DisplayCriteria.CODE:
          const valueCode = this.chartLegend.map(item => {return item.code});
          this.lablels = this.chartLegend.map((map) => {
            const isDuplicate = valueCode.filter(item => item === map.code);
            return isDuplicate.length === 1 ? map.code : map.code + '(' + map.text + ')'
          });
          // this.lablels = this.chartLegend.map((map) => map.code);
          break;
        case DisplayCriteria.TEXT:
          const valueText = this.chartLegend.map(item => {return item.text});
          this.lablels = this.chartLegend.map((map) => {
            const isDuplicate = valueText.filter(item => item === map.text);
            return isDuplicate.length === 1 ? map.text : map.text + '(' + map.code + ')'
          });
          // this.lablels = this.chartLegend.map((map) => map.text);
          break;
        default:
          this.lablels = this.chartLegend.map((map) => map.code + ' -- ' + map.text);
          break;
      }
    }
    if (this.chart) {
      this.chart.data.labels = this.lablels;
    }
  }

  /**
   * Update label based on configuration
   * @param buckets update lable
   */
  getDateFieldsDesc(buckets: any[]) {
    const fldid = this.widgetInfo.field;
    const finalVal = {} as any;
    let chartLegend: ChartLegend;
    buckets.forEach((bucket) => {
      const key =
        bucket.key === ''
          ? this.widgetInfo.chartProperties.blankValueAlias
            ? this.widgetInfo.chartProperties.blankValueAlias
            : ' '
          : bucket.key;
      const hits = bucket['top_hits#items'] ? bucket['top_hits#items'].hits.hits[0] : null;
      const val = hits._source.hdvs
        ? hits._source.hdvs[fldid]
          ? hits._source.hdvs[fldid]
            ? hits._source.hdvs[fldid].vc
            : null
          : null
        : hits._source.staticFields && hits._source.staticFields[fldid]
        ? hits._source.staticFields[fldid]
          ? hits._source.staticFields[fldid].vc
          : null
        : hits._source[fldid]
        ? hits._source[fldid].vc
        : null;
      if (val) {
        const valArray = [];
        val.forEach((v) => {
          if (v.c) {
            valArray.push(v.c);
          }
        });
        const finalText = Number(valArray);
        if (finalText) {
          finalVal[key] = new Date(finalText).toLocaleDateString();
        } else {
          finalVal[key] = new Date(Number(key)).toLocaleDateString();
        }
      } else {
        finalVal[key] = new Date(Number(key)).toLocaleDateString();
      }
      chartLegend = { text: finalVal[key], code: key, legendIndex: this.chartLegend.length };
      this.chartLegend.push(chartLegend);
    });

    // update lablels
    // this.lablels.forEach((cod) => {
    //   let chartLegend: ChartLegend;
    //   if (cod) {
    //     const hasData = finalVal[cod];
    //     if (hasData) {
    //       chartLegend = { text: hasData, code: cod, legendIndex: this.chartLegend.length };
    //     } else {
    //       chartLegend = { text: cod, code: cod, legendIndex: this.chartLegend.length };
    //     }
    //   } else {
    //     chartLegend = { text: cod, code: cod, legendIndex: this.chartLegend.length };
    //   }
    //   this.chartLegend.push(chartLegend);
    // });
    this.chartLegend = this.filterMetadataByEmptyValues(this.chartLegend);
    this.setLabels();
  }

  /**
   * Http call for get description of fields code
   *
   */
  getFieldsMetadaDesc(buckets: any[]) {
    const fldid = this.widgetInfo.field;
    const finalVal = {} as any;
    buckets.forEach((bucket) => {
      let key =
        bucket.key === ''
          ? this.widgetInfo.chartProperties.blankValueAlias
            ? this.widgetInfo.chartProperties.blankValueAlias
            : ' '
          : bucket.key;
      let chartLegend: ChartLegend;
      // let key = bucket.key;
      const hits = bucket['top_hits#items'] ? bucket['top_hits#items'].hits.hits[0] : null;
      const val = hits._source.hdvs
        ? hits._source.hdvs[fldid]
          ? hits._source.hdvs[fldid]
            ? hits._source.hdvs[fldid].vc
            : null
          : null
        : hits._source.staticFields && hits._source.staticFields[fldid]
        ? hits._source.staticFields[fldid]
          ? hits._source.staticFields[fldid].vc
          : null
        : hits._source[fldid]
        ? hits._source[fldid].vc
        : null;
      if (val) {
        const valArray = [];
        val.forEach((v) => {
          if (v.t) {
            valArray.push(v.t);
          }
          if (v.c) {
            key = v.c;
          }
        });
        const finalText = valArray.toString();
        if (finalText) {
          finalVal[key] = finalText;
        } else {
          finalVal[key] = key;
        }
      } else {
        finalVal[key] = key;
      }
      if (fldid === 'OVERDUE' || fldid === 'FORWARDENABLED' || fldid === 'TIME_TAKEN') {
        finalVal[key] = this.getFields(fldid, key);
      }
      chartLegend = { text: finalVal[key], code: key, legendIndex: this.chartLegend.length };
      this.chartLegend.push(chartLegend);
    });
    if (this.widgetInfo.chartProperties.showTotal && this.checkIsShowTotal()) {
      const chartLegend = { text: 'Total', code: 'Total', legendIndex: this.chartLegend.length };
      this.chartLegend.push(chartLegend);
    }
    this.chartLegend = this.filterMetadataByEmptyValues(this.chartLegend);
    this.setLabels();
  }

  stackClickFilter(event?: Event, activeElements?: ActiveElement[]) {
    if (activeElements && activeElements.length) {
      const option = this.chart.chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false) as any;
      const clickedIndex = option[0].datasetIndex;
      const clickedLagend = this.chartLegend[clickedIndex];
      let drpCode = this.chartLegend[clickedIndex] ? this.chartLegend[clickedIndex].code : this.lablels[clickedIndex];
      if (drpCode === undefined || drpCode === 'Total') {
        return false;
      }
      if (drpCode === this.widgetInfo.chartProperties.blankValueAlias) {
        drpCode = '';
      }
      const fieldId = this.widgetInfo.field;
      let appliedFilters = this.filterCriteria.filter((fill) => fill.fieldId === fieldId);
      this.removeOldFilterCriteria(appliedFilters);
      if (appliedFilters.length > 0) {
        const res = appliedFilters.filter(
          (fill) => fill.fieldId === fieldId && fill.widgetType === WidgetType.BAR_CHART && this.widgetInfo.isEnableGlobalFilter
        );
        if (res.length !== 0) {
          res.forEach((val) => {
            val.conditionFieldValue = clickedLagend.code;
          });
        }
        const cri = appliedFilters.filter((fill) => fill.conditionFieldValue === clickedLagend.code);
        if (cri.length === 0) {
          const critera1: Criteria = new Criteria();
          critera1.fieldId = fieldId;
          critera1.conditionFieldId = fieldId;
          critera1.conditionFieldValue = drpCode;
          critera1.blockType = BlockType.COND;
          critera1.conditionOperator = ConditionOperator.EQUAL;
          critera1.conditionFieldValueText = this.lablels[clickedIndex];
          critera1.widgetType = WidgetType.BAR_CHART;
          critera1.fieldCtrl = this.widgetInfo.fieldCtrl;
          appliedFilters.push(critera1);
        }
      } else {
        appliedFilters = [];
        const critera1: Criteria = new Criteria();
        critera1.fieldId = fieldId;
        critera1.conditionFieldId = fieldId;
        critera1.conditionFieldValue = drpCode;
        critera1.blockType = BlockType.COND;
        critera1.conditionOperator = ConditionOperator.EQUAL;
        critera1.widgetType = WidgetType.BAR_CHART;
        critera1.conditionFieldValueText = this.lablels[clickedIndex];
        critera1.fieldCtrl = this.widgetInfo.fieldCtrl;
        appliedFilters.push(critera1);
      }
      if (this.widgetInfo.fieldCtrl.picklist === '53' || this.widgetInfo.fieldCtrl.picklist === '52') {
        appliedFilters.shift();
        appliedFilters.push(this.applyDateFilter(drpCode, fieldId));
      }
      appliedFilters.forEach((app) => this.filterCriteria.push(app));
      this.emitEvtFilterCriteria(this.filterCriteria);
    }
  }

  /*
   * download chart data as CSV
   */
  downloadCSV(): void {
    const excelData = [];
    let columns = [];
    for (let i = 0; i < this.lablels.length; i++) {
      let obj = {} as any;
      if (!this.widgetInfo.isEnableRange) {
        obj[this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.field] = this.lablels[i] + '\t';
        obj.Value = formatNumber(Number(this.dataSet[i] ? this.dataSet[i] : ''), 'en-US') + '\t';
        excelData.push(obj);
      } else {
        obj[this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.field] = this.lablels[i]
          ? this.lablels[i]
          : ' ' + '\t'; // added empty string for null values
        obj = { ...obj, ...this.formatCount(this.dataSet, this.lablels[i]) };
        if (!columns.length) {
          columns = [...Object.keys(obj)];
        }
        excelData.push(obj);
      }
    }
    this.widgetService.downloadCSV('Bar-Chart', excelData);
  }

  /*
   * download chart as image
   */
  downloadImage() {
    this.changeScaleTicks(true);
    this.widgetService.downloadImage(this.imageChart.toBase64Image(), 'Bar-Chart.png');
    this.changeScaleTicks(false);
  }

  /**
   * After click on chart legend
   * legendItem
   */
  legendClick(legendItem: LegendItem) {
    if (legendItem.text === 'Total' || legendItem.text === 'Total -- Total') {
      return;
    }
    let clickedLegend = this.chartLegend[legendItem.datasetIndex] ? this.chartLegend[legendItem.datasetIndex].code : '';
    if (clickedLegend === this.widgetInfo.chartProperties.blankValueAlias) {
      clickedLegend = '';
    }
    const fieldId = this.widgetInfo.field;
    let appliedFilters = this.filterCriteria.filter((fill) => fill.fieldId === fieldId);
    this.removeOldFilterCriteria(appliedFilters);

    if (appliedFilters.length > 0) {
      const res = appliedFilters.filter(
        (fill) => fill.fieldId === fieldId && fill.widgetType === WidgetType.BAR_CHART && this.widgetInfo.isEnableGlobalFilter
      );
      if (res.length !== 0) {
        res.forEach((val) => {
          val.conditionFieldValue = clickedLegend;
        });
      }
      const cri = appliedFilters.filter((fill) => fill.conditionFieldValue === clickedLegend);
      if (cri.length === 0) {
        const critera1: Criteria = new Criteria();
        critera1.fieldId = fieldId;
        critera1.conditionFieldId = fieldId;
        critera1.conditionFieldValue = clickedLegend;
        critera1.blockType = BlockType.COND;
        critera1.conditionOperator = ConditionOperator.EQUAL;
        critera1.conditionFieldValueText =
          this.displayCriteriaOption === DisplayCriteria.TEXT
            ? this.chartLegend[legendItem.datasetIndex]
              ? this.chartLegend[legendItem.datasetIndex].text
              : ''
            : clickedLegend;
        critera1.widgetType = WidgetType.BAR_CHART;
        critera1.fieldCtrl = this.widgetInfo.fieldCtrl;
        appliedFilters.push(critera1);
      }
    } else {
      appliedFilters = [];
      const critera1: Criteria = new Criteria();
      critera1.fieldId = fieldId;
      critera1.conditionFieldId = fieldId;
      critera1.conditionFieldValue = clickedLegend;
      critera1.blockType = BlockType.COND;
      critera1.conditionOperator = ConditionOperator.EQUAL;
      critera1.widgetType = WidgetType.BAR_CHART;
      critera1.fieldCtrl = this.widgetInfo.fieldCtrl;
      critera1.conditionFieldValueText =
        this.displayCriteriaOption === DisplayCriteria.TEXT
          ? this.chartLegend[legendItem.datasetIndex]
            ? this.chartLegend[legendItem.datasetIndex].text
            : this.widgetInfo.chartProperties.blankValueAlias
          : clickedLegend;
      appliedFilters.push(critera1);
    }
    if (this.widgetInfo.fieldCtrl.picklist === '53' || this.widgetInfo.fieldCtrl.picklist === '52') {
      appliedFilters.shift();
      appliedFilters.push(this.applyDateFilter(clickedLegend, fieldId));
    }
    appliedFilters.forEach((app) => this.filterCriteria.push(app));
    this.emitEvtFilterCriteria(this.filterCriteria);
  }

  /**
   * Remove old filter criteria for field
   * selectedOptions as parameter
   */
  removeOldFilterCriteria(selectedOptions: Criteria[]) {
    selectedOptions.forEach((option) => {
      this.filterCriteria.splice(this.filterCriteria.indexOf(option), 1);
    });
  }

  emitEvtFilterCriteria(critera: Criteria[]): void {
    this.evtFilterCriteria.emit(critera);
  }

  /**
   * Use for set scale range and axis labels
   */
  setChartAxisAndScaleRange() {
    if (
      this.widgetInfo.chartProperties.scaleFrom !== null &&
      this.widgetInfo.chartProperties.scaleFrom !== undefined &&
      this.widgetInfo.chartProperties.scaleTo !== null &&
      this.widgetInfo.chartProperties.scaleTo !== undefined &&
      this.widgetInfo.chartProperties.stepSize !== null &&
      this.widgetInfo.chartProperties.stepSize !== undefined
    ) {
      if (this.widgetInfo.chartProperties.orientation === Orientation.HORIZONTAL) {
        this.barChartOptions.scales = {
          x: {
            title: {
              display: true,
              text: this.widgetInfo.chartProperties.xAxisLabel ? this.widgetInfo.chartProperties.xAxisLabel : '',
            },
            min: this.widgetInfo.chartProperties.scaleFrom,
            max: this.widgetInfo.chartProperties.scaleTo,
            ticks: {
              stepSize: this.widgetInfo.chartProperties.stepSize,
              callback: (value, index, values) => {
                return formatNumber(Number(value ? value : ''), 'en-US');
              },
            },
            grid: {
              tickLength: 0
            },
            stacked:false
          },
          y: {
            title: {
              display: true,
              text: this.widgetInfo.chartProperties.yAxisLabel ? this.widgetInfo.chartProperties.yAxisLabel : '',
            },
            ticks: {
              // added callback to limit charcaters
              callback: (value) => {
                return this.lablels[value]?.length > this.labelTooltipCharLimit
                  ? this.lablels[value].slice(0, this.labelTooltipCharLimit) + '...'
                  : this.lablels[value];
              },
              padding:
                this.widgetInfo.chartProperties.isEnableDatalabels &&
                (this.widgetInfo.chartProperties.datalabelsPosition === 'start' ||
                  this.widgetInfo.chartProperties.datalabelsPosition === 'center')
                  ? 40
                  : 20,
            },
            grid: {
              tickLength: 0
            },
            stacked:false
          },
        };
      } else {
        this.barChartOptions.scales = {
          x: {
            title: {
              display: true,
              text: this.widgetInfo.chartProperties.xAxisLabel ? this.widgetInfo.chartProperties.xAxisLabel : '',
            },
            ticks: {
              callback: (value) => {
                return this.lablels[value]?.length > this.labelTooltipCharLimit
                  ? this.lablels[value].slice(0, this.labelTooltipCharLimit) + '...'
                  : this.lablels[value];
              },
              padding: 20
                // this.widgetInfo.chartProperties.isEnableDatalabels &&
                // (this.widgetInfo.chartProperties.datalabelsPosition === 'start' ||
                //   this.widgetInfo.chartProperties.datalabelsPosition === 'center')
                //   ? 20
                //   : 0,
            },
            grid: {
              tickLength: 0
            },
            stacked:false
          },
          y: {
            title: {
              display: true,
              text: this.widgetInfo.chartProperties.yAxisLabel ? this.widgetInfo.chartProperties.yAxisLabel : '',
            },
            min: this.widgetInfo.chartProperties.scaleFrom,
            max: this.widgetInfo.chartProperties.scaleTo,
            ticks: {
              stepSize: this.widgetInfo.chartProperties.stepSize,
              callback: (value, index, values) => {
                return formatNumber(Number(value ? value : ''), 'en-US');
              },
            },
            grid: {
              tickLength: 0
            },
            stacked:false
          },
        };
      }
    } else {
      if (this.widgetInfo.chartProperties.orientation === Orientation.HORIZONTAL) {
        this.barChartOptions.scales = {
          x: {
            title: {
              display: true,
              text: this.widgetInfo.chartProperties.xAxisLabel ? this.widgetInfo.chartProperties.xAxisLabel : '',
            },
            ticks: {
              padding: 20,
                // this.widgetInfo.chartProperties.isEnableDatalabels &&
                // (this.widgetInfo.chartProperties.datalabelsPosition === 'start' ||
                //   this.widgetInfo.chartProperties.datalabelsPosition === 'center')
                //   ? 20
                //   : 0,
              callback(value, index, values) {
                return formatNumber(Number(value ? value : ''), 'en-US');
              },
            },
            grid: {
              tickLength: 0
            },
            stacked:false
          },
          y: {
            title: {
              display: true,
              text: this.widgetInfo.chartProperties.yAxisLabel ? this.widgetInfo.chartProperties.yAxisLabel : '',
            },
            ticks: {
              callback: (value) => {
                return this.lablels[value]?.length > this.labelTooltipCharLimit
                  ? this.lablels[value].slice(0, this.labelTooltipCharLimit) + '...'
                  : this.lablels[value];
              },
              padding:
                this.widgetInfo.chartProperties.isEnableDatalabels &&
                this.widgetInfo.chartProperties.orientation === Orientation.HORIZONTAL &&
                (this.widgetInfo.chartProperties.datalabelsPosition === 'start' ||
                  this.widgetInfo.chartProperties.datalabelsPosition === 'center')
                  ? 40
                  : 20,
            },
            grid: {
              tickLength: 0
            },
            stacked:true
          },
        };
      } else {
        this.barChartOptions.scales = {
          x: {
            title: {
              display: true,
              text: this.widgetInfo.chartProperties.xAxisLabel ? this.widgetInfo.chartProperties.xAxisLabel : '',
            },
            ticks: {
              callback: (value) => {
                return this.lablels[value]?.length > this.labelTooltipCharLimit
                  ? this.lablels[value].slice(0, this.labelTooltipCharLimit) + '...'
                  : this.lablels[value];
              },
              padding: 20
                // this.widgetInfo.chartProperties.isEnableDatalabels &&
                // this.widgetInfo.chartProperties.orientation === Orientation.VERTICAL &&
                // (this.widgetInfo.chartProperties.datalabelsPosition === 'start' ||
                //   this.widgetInfo.chartProperties.datalabelsPosition === 'center')
                //   ? 20
                //   : 0,
            },
            grid: {
              tickLength: 0
            },
            stacked:true
          },
          y: {
            title: {
              display: true,
              text: this.widgetInfo.chartProperties.yAxisLabel ? this.widgetInfo.chartProperties.yAxisLabel : '',
            },
            ticks: {
              padding:
                this.widgetInfo.chartProperties.isEnableDatalabels &&
                (this.widgetInfo.chartProperties.datalabelsPosition === 'start' ||
                  this.widgetInfo.chartProperties.datalabelsPosition === 'center')
                  ? 40
                  : 20,
              callback: (value, index, values) => {
                return formatNumber(Number(value ? value : ''), 'en-US');
              },
            },
            grid: {
              tickLength: 0
            },
            stacked:false
          },
        };
      }
    }
    if (this.chart) {
      this.chart.options.scales = this.barChartOptions.scales;
      this.chart.chart.options.scales = this.barChartOptions.scales;
    }
  }

  /**
   * Before render chart transformation
   * @param resBuckets response from server
   */
  transformDataSets(resBuckets: any[]): string[] {
    // ckeck configuration
    const finalDataSet: string[] = [];
    let total = 0;
    if (
      this.widgetInfo.chartProperties.scaleFrom !== null &&
      this.widgetInfo.chartProperties.scaleFrom !== undefined &&
      this.widgetInfo.chartProperties.scaleTo !== null &&
      this.widgetInfo.chartProperties.scaleTo !== undefined &&
      this.widgetInfo.chartProperties.stepSize !== null &&
      this.widgetInfo.chartProperties.stepSize !== undefined
    ) {
      const insideRange = resBuckets.filter((bucket) => {
        if (this.widgetInfo.chartProperties.scaleFrom <= bucket.doc_count && this.widgetInfo.chartProperties.scaleTo >= bucket.doc_count) {
          return bucket;
        }
      });
      if (this.widgetInfo.chartProperties.dataSetSize) {
        for (let i = 0; i < this.widgetInfo.chartProperties.dataSetSize; i++) {
          if (insideRange[i]) {
            this.lablels.push(insideRange[i].key);
            finalDataSet.push(insideRange[i].doc_count);
            total = total + insideRange[i].doc_count;
          }
        }
      } else {
        insideRange.forEach((bucket) => {
          this.lablels.push(bucket.key);
          finalDataSet.push(bucket.doc_count);
          total = total + bucket.doc_count;
        });
      }
    } else {
      resBuckets.forEach((bucket) => {
        const key =
          bucket.key === ''
            ? this.widgetInfo.chartProperties.blankValueAlias
              ? this.widgetInfo.chartProperties.blankValueAlias
              : ' '
            : bucket.key;
        this.lablels.push(key);
        finalDataSet.push(bucket.doc_count);
        total = total + bucket.doc_count;
      });
    }

    if (this.widgetInfo.chartProperties.showTotal) {
      let showTotal = true;
      this.filterCriteria.forEach((item) => {
        const ind = this.lablels.indexOf(item.conditionFieldValueText);
        if (ind > -1) {
          showTotal = false;
        }
      });
      if (showTotal) {
        this.lablels.push('Total');
        finalDataSet.push(total.toString());
      }
    }
    return finalDataSet;
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
    this.barChartData.forEach((legend) => {
      req.colorPalettes.push({
        code: legend.label,
        colorCode: legend.backgroundColor ? legend.backgroundColor : this.getRandomColor(),
        text: legend.label,
      });
    });
    super.openColorPalette(req);
  }

  /**
   * Update stacked color based on color definations
   * @param res updated color codes
   */
  updateColorBasedOnDefined(res: WidgetColorPalette) {
    this.widgetColorPalette = res;
    this.getBarChartData(this.widgetId, this.filterCriteria);
  }

  /**
   * Update color on widget based on defined
   * If not defined the pick random color
   * @param code resposne code
   */
  getUpdatedColorCode(code: string): string {
    if (this.widgetColorPalette && this.widgetColorPalette.colorPalettes) {
      const res = this.widgetColorPalette.colorPalettes.filter((fil) => fil.code === code)[0];
      if (res) {
        return res.colorCode;
      }
    }
    return this.getRandomColor();
  }

  /**
   * Return random color in hexa
   */
  public getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  getComputedSize(initialWidth: number) {
    if (!this.dataSet.length) return initialWidth;

    const barWidth = initialWidth / this.dataSet.length;

    if (barWidth < this.minBarWidth) {
      return this.minBarWidth * this.dataSet.length;
    } else {
      // this.minBarWidth = barWidth;
      return initialWidth;
    }
  }

  computeGraphSize() {
    if (this.orientation === 'bar') {
      this.computedSize.height = this.widgetInfo.height;
      this.computedSize.width = this.getComputedSize(this.widgetInfo.width);
    } else {
      this.computedSize.height = this.getComputedSize(this.widgetInfo.height);
      this.computedSize.width = this.widgetInfo.width;
    }
  }

  saveDisplayCriteria() {
    const saveDisplayCriteria = this.widgetService
      .saveDisplayCriteria(this.widgetInfo.widgetId, this.widgetInfo.widgetType, this.displayCriteriaOption)
      .subscribe(
        (res) => {
          this.chartLegend = [];
          this.updateChart(this.returndata);
        },
        (error) => {
          console.error(`Error : ${error}`);
          this.snackBar.open(`Something went wrong`, 'Close', { duration: 3000 });
        }
      );
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
    critera.widgetType = WidgetType.BAR_CHART;
    return critera;
  }

  /*  This methods sorts the bar chart rowwsie/ column wise. depending on sorting criteria */
  sortBarChartData(buckets: Buckets[]) {
    const fields = this.sortByColumn(buckets);
    const sortBy = this.widgetInfo.chartProperties?.orderWith;
    if (sortBy === OrderWith.ROW_DESC) {
      buckets?.sort((a, b) => parseFloat(b.doc_count) - parseFloat(a.doc_count));
    } else if (sortBy === OrderWith.ROW_ASC) {
      buckets?.sort((a, b) => parseFloat(a.doc_count) - parseFloat(b.doc_count));
    } else if (sortBy === OrderWith.COL_ASC) {
      buckets.sort((a, b) => {
        return fields.indexOf(a.key) - fields.indexOf(b.key);
      });
    } else {
      buckets.sort((a, b) => {
        return fields.indexOf(b.key) - fields.indexOf(a.key);
      });
    }
  }

  /* This method sorts the chart based on Column */
  sortByColumn(buckets: Buckets[]): string[] {
    let fields: string[] = [];
    if (this.displayCriteriaOption === DisplayCriteria.TEXT) {
      const codeValues = this.getCodeValue(buckets);
      fields = codeValues
        .sort((a, b) => a?.t?.localeCompare(b.t))
        .map((x) => {
          return x.c;
        });
    } else if (this.displayCriteriaOption === DisplayCriteria.CODE || this.displayCriteriaOption === DisplayCriteria.CODE_TEXT) {
      const codeValues = this.getCodeValue(buckets);
      const sortedCodes = codeValues.sort((a, b) => {
        if (isNaN(parseFloat(a.c))) {
          return a?.c?.localeCompare(b.c);
        } else {
          return parseInt(a.c, 10) - parseInt(b.c, 10);
        }
      });
      fields = sortedCodes.map((x) => {
        return x.c;
      });
    }

    return fields;
  }

  /*  Get Code values */
  getCodeValue(buckets: Buckets[]): FieldCodeText[] {
    const fieldCodeText: FieldCodeText[] = [];
    const fldid = this.widgetInfo.field;
    buckets.forEach((bucket) => {
      const key = bucket.key;
      const hits = bucket['top_hits#items'] ? bucket['top_hits#items'].hits.hits[0] : null;
      const val = hits._source
        ? hits._source.hdvs
          ? hits._source.hdvs[fldid]
            ? hits._source.hdvs[fldid]
              ? hits._source.hdvs[fldid].vc
              : null
            : null
          : hits._source.staticFields && hits._source.staticFields[fldid]
          ? hits._source.staticFields[fldid]
            ? hits._source.staticFields[fldid].vc
            : null
          : hits._source[fldid]
          ? hits._source[fldid].vc
          : null
        : null;

      const fieldCode: FieldCodeText = {
        c: val ? val[0].c : null,
        t: val ? val[0].t : null,
        p: '',
      };
      fieldCodeText.push(fieldCode);
    });

    return fieldCodeText;
  }

  /**
   * Changes widget view
   */
  viewChange(value) {
    const widgetViewRequest: WidgetViewRequestPayload = {
      uuid: '',
      reportId: this.reportId,
      widgetId: this.widgetId,
      view: value ? WidgetView.TABLE_VIEW : WidgetView.GRAPH_VIEW,
    };
    if (!this.widgetViewDetails?.payload?.uuid) {
      this.widgetService.saveWidgetView(widgetViewRequest).subscribe(
        (res) => {
          this.getBarChartData(this.widgetId, this.filterCriteria);
        },
        (err) => {
          console.log('Error');
        }
      );
    } else {
      widgetViewRequest.uuid = this.widgetViewDetails?.payload?.uuid;
      this.widgetService.updateWidgetView(widgetViewRequest).subscribe(
        (res) => {
          this.getBarChartData(this.widgetId, this.filterCriteria);
        },
        (err) => {
          console.log('Error');
        }
      );
    }
  }

  /**
   * @returns table dataSource
   */
  getTableData() {
    const excelData = [];
    let columns = [];
    this.displayedColumnsId = [];

    for (let i = 0; i < this.lablels.length; i++) {
      let obj = {} as any;
      if (!this.widgetInfo.isEnableRange) {
        obj[this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.field] = this.lablels[i]
          ? this.lablels[i]
          : ' ' + '\t'; // added empty string for null values in label
        obj.Value = formatNumber(Number(this.dataSet[i] ? this.dataSet[i] : ''), 'en-US') + '\t';
        excelData.push(obj);
      } else {
        obj[this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.field] = this.lablels[i]
          ? this.lablels[i]
          : ' ' + '\t'; // added empty string for null values
        obj = { ...obj, ...this.formatCount(this.dataSet, this.lablels[i]) };
        if (!columns.length) {
          columns = [...Object.keys(obj)];
        }
        excelData.push(obj);
      }
    }
    if (!this.displayedColumnsId.includes(this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.field)) {
      this.displayedColumnsId.push(this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.field);
    }
    if (columns.length > 0) {
      columns.forEach((item) => {
        const legend = this.chartLegend.find(
          (chartlegend) => chartlegend.text === item || chartlegend.code === item || chartlegend.code + ' -- ' + chartlegend.text === item
        );
        if (legend && !this.displayedColumnsId.includes(this.getCodeTextValue(legend))) {
          this.displayedColumnsId.push(this.getCodeTextValue(legend));
        }
      });
    } else {
      this.displayedColumnsId.push('Value');
    }
    this.tableDataSource = excelData;
  }

  /**
   * call to transform data when aging report is enable
   * @param resBuckets array that have details
   * @returns transformed data
   */
  transformDataForEnableRange(resBuckets) {
    const finalDataSet: any = {};
    const total = [];
    if (
      this.widgetInfo.chartProperties.scaleFrom !== null &&
      this.widgetInfo.chartProperties.scaleFrom !== undefined &&
      this.widgetInfo.chartProperties.scaleTo !== null &&
      this.widgetInfo.chartProperties.scaleTo !== undefined &&
      this.widgetInfo.chartProperties.stepSize !== null &&
      this.widgetInfo.chartProperties.stepSize !== undefined
    ) {
      const insideRange = resBuckets.filter((bucket) => {
        if (this.widgetInfo.chartProperties.scaleFrom <= bucket.doc_count && this.widgetInfo.chartProperties.scaleTo >= bucket.doc_count) {
          return bucket;
        }
      });
      if (this.widgetInfo.chartProperties.dataSetSize) {
        for (let i = 0; i < this.widgetInfo.chartProperties.dataSetSize; i++) {
          if (insideRange[i]) {
            const agingBuckets = insideRange[i]['range#aging_bucket'].buckets;
            const dataset = [];
            agingBuckets.forEach((singleBucket) => {
              const objKeys = ['x', 'y'];
              const objValue = {};
              objValue[objKeys[0]] = singleBucket.key;
              objValue[objKeys[1]] = singleBucket.doc_count;
              const index = total.findIndex((item) => item.x === singleBucket.key);
              if (index > -1) {
                total[index].y = total[index].y + singleBucket.doc_count;
              } else {
                const totalCount = {};
                totalCount[objKeys[0]] = singleBucket.key;
                totalCount[objKeys[1]] = singleBucket.doc_count;
                total.push(totalCount);
                this.lablels.push(singleBucket.key);
              }
              dataset.push(objValue);
            });
            finalDataSet[insideRange[i].key] = dataset;
          }
        }
        if (this.widgetInfo.chartProperties.showTotal) {
          const total1 = 'Total';
          finalDataSet[total1] = total;
        }
      } else {
        resBuckets.forEach((bucket) => {
          const key =
            bucket.key === ''
              ? this.widgetInfo.chartProperties.blankValueAlias
                ? this.widgetInfo.chartProperties.blankValueAlias
                : ' '
              : bucket.key;
          const agingBuckets = bucket['range#aging_bucket'].buckets;
          const dataset = [];
          agingBuckets.forEach((singleBucket) => {
            const objKeys = ['x', 'y'];
            const objValue = {};
            objValue[objKeys[0]] = singleBucket.key;
            objValue[objKeys[1]] = singleBucket.doc_count;
            const index = total.findIndex((item) => item.x === singleBucket.key);
            if (index > -1) {
              total[index].y = total[index].y + singleBucket.doc_count;
            } else {
              const totalCount = {};
              totalCount[objKeys[0]] = singleBucket.key;
              totalCount[objKeys[1]] = singleBucket.doc_count;
              total.push(totalCount);
              this.lablels.push(singleBucket.key);
            }
            dataset.push(objValue);
          });
          finalDataSet[key] = dataset;
        });
        if (this.widgetInfo.chartProperties.showTotal) {
          const total1 = 'Total';
          finalDataSet[total1] = total;
        }
      }
    } else {
      resBuckets.forEach((bucket) => {
        const agingBuckets = bucket['range#aging_bucket'].buckets;
        const dataset = [];
        agingBuckets.forEach((singleBucket) => {
          const objKeys = ['x', 'y'];
          const objValue = {};
          objValue[objKeys[0]] = singleBucket.key;
          objValue[objKeys[1]] = singleBucket.doc_count;
          const index = total.findIndex((item) => item.x === singleBucket.key);
          if (index > -1) {
            total[index].y = total[index].y + singleBucket.doc_count;
          } else {
            const totalCount = {};
            totalCount[objKeys[0]] = singleBucket.key;
            totalCount[objKeys[1]] = singleBucket.doc_count;
            total.push(totalCount);
            this.lablels.push(singleBucket.key);
          }
          dataset.push(objValue);
        });
        finalDataSet[bucket.key] = dataset;
      });

      if (this.widgetInfo.chartProperties.showTotal) {
        const total1 = 'Total';
        finalDataSet[total1] = total;
      }
    }
    return finalDataSet;
  }

  /**
   * it return the the formatted value according to display criteria
   * @param value value of the element
   * @returns string type value
   */
  getCodeTextValue(value: ChartLegend): string {
    let isDuplicate = [];
    let valueText = [];
    switch (this.displayCriteriaOption) {
      case DisplayCriteria.CODE:
        valueText = this.chartLegend.map(item => {return item.code});
        isDuplicate = valueText.filter(item => item === value.code);
        // return value.code;
        return isDuplicate.length === 1 ? value.code : value.code + '(' + value.text + ')';
      case DisplayCriteria.TEXT:
        // return value.text;
        valueText = this.chartLegend.map(item => {return item.text});
        isDuplicate = valueText.filter(item => item === value.text);
        return isDuplicate.length === 1 ? value.text : value.text + '(' + value.code + ')';
      default:
        return value.code + ' -- ' + value.text;
    }
  }

  /**
   * check whether we need to show total or not
   * @returns boolean value
   */
  checkIsShowTotal(): boolean {
    if (this.widgetInfo.chartProperties.showTotal) {
      let showTotal = true;
      if (this.chartLegend.length <= 1) {
        return false;
      }
      this.filterCriteria.forEach((item) => {
        const ind = this.chartLegend.findIndex((legend) => legend.code === item.conditionFieldValue);
        if (ind > -1) {
          showTotal = false;
        }
      });
      if (showTotal) {
        return true;
      } else {
        return false;
      }
    }
  }

  /**
   * return the formated value for dataset
   * @param value object that contains the value of dataset
   * @param column column name
   * @returns return the formated count
   */
  formatCount(value, column): any {
    const obj = {};
    Object.keys(value).forEach((key) => {
      if (key !== '') {
        const selectedValue = value[key].find((item) => item.x === column);
        const legend = this.getCodeTextValue(
          this.chartLegend.find(
            (chartlegend) => String(chartlegend.text) === String(key) || String(chartlegend.code) === String(key) || String(chartlegend.code + ' -- ' + chartlegend.text) === String(key)
          )
        );
        obj[legend] = formatNumber(Number(selectedValue?.y ? selectedValue.y : ''), 'en-US') + '\t';
      }
    });
    return obj;
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
            return this.lablels[value];
          }
        }
        this.imageChart.options.scales[scaleObj[1]].ticks = ticks;
        this.imageChart.chart.options.scales[scaleObj[1]].ticks = ticks;
      } else {
        const ticks = {
          ...this.chart.options.scales[scaleObj[0]].ticks,
          callback: (value) => {
            return this.lablels[value];
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
            return this.lablels[value]?.length > this.labelTooltipCharLimit
            ? this.lablels[value].slice(0, this.labelTooltipCharLimit) + '...'
            : this.lablels[value];
          }
        }
        this.imageChart.options.scales[scaleObj[1]].ticks = ticks;
        this.imageChart.chart.options.scales[scaleObj[1]].ticks = ticks;
      } else {
        const ticks = {
          ...this.imageChart.options.scales[scaleObj[0]].ticks,
          callback: (value) => {
            return this.lablels[value]?.length > this.labelTooltipCharLimit
            ? this.lablels[value].slice(0, this.labelTooltipCharLimit) + '...'
            : this.lablels[value];
          }
        }
        this.imageChart.options.scales[scaleObj[0]].ticks = ticks;
        this.imageChart.chart.options.scales[scaleObj[0]].ticks = ticks;
      }
    }

    this.imageChart.update({
      duration: 0
    });
  }
}
