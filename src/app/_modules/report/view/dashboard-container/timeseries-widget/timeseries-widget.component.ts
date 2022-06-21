import { Component, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GenericWidgetComponent } from '../../generic-widget/generic-widget.component';
import { ChartDataset, ChartEvent, ChartOptions, LegendItem, TooltipItem } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import * as moment from 'moment';
import { WidgetService } from 'src/app/_services/widgets/widget.service';
import { BehaviorSubject, forkJoin, Subscription } from 'rxjs';
import { ButtonArr, ChartLegend, ChartType, ConditionOperator, Criteria, DisplayCriteria, SeriesWith, TimeSeriesWidget, WidgetColorPalette, WidgetType, WidgetView, WidgetViewDetails, WidgetViewRequestPayload } from '../../../_models/widget';
import { BlockType } from '@modules/admin/_components/module/business-rules/user-defined-rule/udr-cdktree.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import _ from 'lodash';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChartType as CType } from 'chart.js';
import { Context } from 'chartjs-plugin-datalabels';
import { UserService } from '@services/user/userservice.service';
import { Userdetails } from '@models/userdetails';
import * as momentAdapter from 'chartjs-adapter-moment'
import { formatNumber } from '@angular/common';
const btnArray: ButtonArr[] = [
  { id: 0, value: 'millisecond', isActive: false },
  { id: 1, value: '7', isActive: false },
  { id: 2, value: '10', isActive: false },
  { id: 3, value: '20', isActive: false },
  { id: 4, value: '30', isActive: false }
];

@Component({
  selector: 'pros-timeseries-widget',
  templateUrl: './timeseries-widget.component.html',
  styleUrls: ['./timeseries-widget.component.scss']
})
export class TimeseriesWidgetComponent extends GenericWidgetComponent implements OnInit, OnChanges, OnDestroy {

  chartType: CType;
  responseData: any;
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

  timeDateFormat: any;
  dataSet: ChartDataset[] = [{ data: [] }];
  dataSetlabel: string[] = [];
  widgetInf: BehaviorSubject<TimeSeriesWidget> = new BehaviorSubject<TimeSeriesWidget>(null);
  public afterColorDefined: BehaviorSubject<WidgetColorPalette> = new BehaviorSubject<WidgetColorPalette>(null);
  timeseriesData: TimeSeriesWidget = {} as TimeSeriesWidget;
  lineChartPlugins = [];
  chartLegend: ChartLegend[] = [];
  lablels: string[] = [];
  formGroup: FormGroup;
  dateFilters = btnArray;
  startDateCtrl = new FormControl();
  endDateCtrl = new FormControl();
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;
  isTableView = false;
  displayedColumnsId: string[] = [];
  tableDataSource: any = [];
  widgetViewDetails: WidgetViewDetails;


  /**
   * Check for it is group by timeseries
   */
  isGroupByChart = false;

  /**
   * Flag for make filter visiable ..
   */
  showFilterOption = false;
  /**
   * Timeseries chart option config see chart.js for more details
   */
  timeSeriesOption: ChartOptions = {
    responsive: true,
    parsing: false,
    normalized: true,
    interaction: {
      mode: 'nearest',
      intersect: false
    },
    scales: {
      x: {
        type: 'time',
        time: {
          displayFormats: {
            quarter: 'MMM YYYY',
            hours: 'HH',
            month: 'MMM YYYY',
            year: 'YYYY',
            minutes: 'mm',
            day: 'DD'
          }
        },
        adapters: {
          date: {
            locale: momentAdapter
          }
        },
        title: {
          display: false,
          text: ''
        },
        ticks: {
          maxRotation: 0,
          showLabelBackdrop: false
        },
        grid: {
          display: true,
          offset: false
        },
        stacked: true
      },
      y: {
        title: {
          display: false,
          text: ''
        }, ticks: {
          maxRotation: 0
        },
        grid: {
          display: true
        },
        beginAtZero: true,
        stacked: false
      },
      totalX: {
        type: 'category',
        title: {
          display: false,
          text: ''
        },
        ticks: {
          maxRotation: 0,
          showLabelBackdrop: false
        },
        grid: {
          display: false,
        },
        display: false,
        axis: 'x',
        stacked: true
      }
    },
    plugins: {
      datalabels: {
        display: false,
        formatter: ((value: any) => {
          return value.y;
        })
      },
      zoom: {
        pan: {
          enabled: false,
          onPan() { console.log('pan') }
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true
          },
          mode: 'x',
          onZoom() { console.log('Zoom') }
        }
      },
      legend: {
        display: false,
        onClick: (event, legendItem: any) => {
          if (this.timeseriesData.timeSeries.chartType !== ChartType.BAR && this.timeseriesData.timeSeries.fieldId !== '') {
            this.legendClick(legendItem);
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: TooltipItem<any>) => {
            let label = tooltipItem.dataset.label;
            label = label + ':' + tooltipItem.formattedValue
            return tooltipItem.label !== 'undefined' ? label : '';
          }
        },
        displayColors: true
      }
    },
    onClick: (event?: ChartEvent, activeElements?: Array<{}>) => {
      console.log('No filter will be applied while we click on bar/line/dots/datalabels.');
      // this.stackClickFilter(event, activeElements);
    }
  };

  /**
   * When reset filter from main container value should be true
   */
  @Input()
  hasFilterCriteria: boolean;

  isLoading = true;

  subscriptions: Subscription[] = [];

  userDetails: Userdetails = new Userdetails();
  // totalCount: any;

  constructor(
    private widgetService: WidgetService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private userService: UserService,
    public matDialog: MatDialog) {
    super(matDialog);
  }

  ngOnDestroy(): void {
    this.widgetInf.complete();
    this.widgetInf.unsubscribe();
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  ngOnChanges(changes: import('@angular/core').SimpleChanges): void {

    if (changes && changes.hasFilterCriteria && changes.hasFilterCriteria.currentValue) {
      this.clearFilterCriteria();
    }

    if (changes && changes.filterCriteria && changes.filterCriteria.currentValue !== changes.filterCriteria.previousValue && changes.filterCriteria.currentValue !== undefined) {
      this.lablels = [];
      this.chartLegend = [];
      this.widgetInf.next(this.widgetInf.getValue());
    }
  }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      date: new FormControl(''),
    });


    const startDateCtrl = this.startDateCtrl.valueChanges.subscribe(data => {
      this.emitDateChangeValues();
    });
    this.subscriptions.push(startDateCtrl);

    const endDateCtrl = this.endDateCtrl.valueChanges.subscribe(data => {
      this.emitDateChangeValues();
    });
    this.subscriptions.push(endDateCtrl);

    const getDisplayCriteria = this.widgetService.getDisplayCriteria(this.widgetInfo.widgetId, this.widgetInfo.widgetType).subscribe(res => {
      this.displayCriteriaOption = res.displayCriteria;
    }, error => {
      console.error(`Error : ${error}`);
    });
    this.subscriptions.push(getDisplayCriteria);

    this.getTimeSeriesMetadata();
    const widgeInf = this.widgetInf.subscribe(metadata => {
      if (metadata) {
        this.getwidgetData(this.widgetId);
        if (this.isLoading) {
          this.updatevalues();
          this.isLoading = false;
          this.afterColorDefined.next(metadata.timeSeries.widgetColorPalette);
        }
      }
    });
    this.subscriptions.push(widgeInf);
    // after color defined update on widget
    const afterColorDefined = this.afterColorDefined.subscribe(res => {
      if (res) {
        this.updateColorBasedOnDefined(res);
      }
    });
    this.subscriptions.push(afterColorDefined);

    this.userService.getUserDetails().subscribe(res => {
      this.userDetails = res;
    }, error => console.error(`Error : ${error.message}`));
  }

  /**
   * Method to handle pan events
   */

  getVisibleValues({ chart }) {
    const x = chart.scales['x-axis-0'];
    const startdate = moment(moment.unix(Number(x._table[0].time) / 1000).format('MM/DD/YYYY HH:mm'));
    const enddate = moment(moment.unix(Number(x._table[1].time) / 1000).format('MM/DD/YYYY HH:mm'));
    const strtDate = Date.parse(startdate.toString()).toString();
    const enDate = Date.parse(enddate.toString()).toString();
    this.emitpanAndClickevent(strtDate, enDate);
  }

  /**
   * Method to handle button click events
   */

  updateForm(field: string, value: ButtonArr) {
    this.dateFilters.forEach(ele => {
      if (ele.id === value.id) {
        value.isActive = true
      } else {
        ele.isActive = false;
      }
    })
    const control = this.formGroup.get(field) as FormControl;
    if (control != null) {
      control.patchValue(value.value);
    }
    let endDatemilli: string;
    switch (this.timeseriesData.timeSeries.seriesWith) {
      case SeriesWith.day:
        const date = moment().subtract(value.value, 'd').format('MM/DD/YYYY HH:mm');
        endDatemilli = Date.parse(date.toString()).toString();
        break;

      case SeriesWith.hour:
        const hour = moment().subtract(value.value, 'hours').format('MM/DD/YYYY HH:mm');
        endDatemilli = Date.parse(hour.toString()).toString();
        break;

      case SeriesWith.millisecond:
        const millisecond = moment().subtract(value.value, 'h').format('MM/DD/YYYY HH:mm');
        endDatemilli = Date.parse(millisecond.toString()).toString();
        break;

      case SeriesWith.minute:
        const minute = moment().subtract(value.value, 'minutes').format('MM/DD/YYYY HH:mm');
        endDatemilli = Date.parse(minute.toString()).toString();
        break;

      case SeriesWith.month:
        const month = moment().subtract(value.value, 'M').format('MM/DD/YYYY HH:mm');
        endDatemilli = Date.parse(month.toString()).toString();
        break;

      case SeriesWith.quarter:
        const quarter = moment().subtract(value.value, 'quarter').format('MM/DD/YYYY HH:mm');
        endDatemilli = Date.parse(quarter.toString()).toString();
        break;

      case SeriesWith.second:
        const second = moment().subtract(value.value, 'seconds').format('MM/DD/YYYY HH:mm');
        endDatemilli = Date.parse(second.toString()).toString();
        break;

      case SeriesWith.week:
        const week = moment().subtract((Number(value.value) * 7), 'd').format('MM/DD/YYYY HH:mm');
        endDatemilli = Date.parse(week.toString()).toString();
        break;

      case SeriesWith.year:
        const year = moment().subtract(value.value, 'y').format('MM/DD/YYYY HH:mm');
        endDatemilli = Date.parse(year.toString()).toString();
        break;

      default:
        break;
    }
    const strtdatemilli = Date.parse(moment().format('MM/DD/YYYY HH:mm').toString()).toString();
    this.emitpanAndClickevent(endDatemilli, strtdatemilli);
  }

  emitpanAndClickevent(startdate: string, enddate: string): void {
    if (startdate === enddate) {
      startdate = String(moment().startOf('day').toDate().getTime());
      enddate = String(moment().endOf('day').toDate().getTime());;
    }
    const fieldId = this.timeseriesData.timeSeries.groupWith;
    let appliedFilters = this.filterCriteria.filter(fill => fill.fieldId === fieldId);
    this.removeOldFilterCriteria(appliedFilters);
    if (appliedFilters.length > 0) {
      const cri = appliedFilters.filter(fill => fill.conditionFieldValue === fieldId);
      if (cri.length === 0) {
        const critera: Criteria = new Criteria();
        critera.fieldId = fieldId;
        critera.conditionFieldId = fieldId;
        critera.conditionFieldEndValue = enddate;
        critera.conditionFieldStartValue = startdate;
        critera.blockType = BlockType.COND;
        critera.conditionOperator = ConditionOperator.RANGE;
        critera.widgetType = WidgetType.TIMESERIES;
        appliedFilters.push(critera);
      }
    } else {
      appliedFilters = [];
      const critera: Criteria = new Criteria();
      critera.fieldId = fieldId;
      critera.conditionFieldId = fieldId;
      critera.conditionFieldEndValue = enddate;
      critera.conditionFieldStartValue = startdate;
      critera.blockType = BlockType.COND;
      critera.conditionOperator = ConditionOperator.RANGE;
      critera.widgetType = WidgetType.TIMESERIES;
      appliedFilters.push(critera);
    }
    appliedFilters.forEach(app => this.filterCriteria.push(app));

    this.applyFilters();
  }

  /**
   * Get Metadata of Time series chart
   */

  getTimeSeriesMetadata(): void {
    const timeSeriesWidgetInfo = this.widgetService.getTimeseriesWidgetInfo(this.widgetId).subscribe(res => {
      this.timeseriesData = res;
      this.chartType = this.timeseriesData.timeSeries.chartType === ChartType.LINE ? 'line' : 'bar';
      this.widgetInf.next(res);
      if (res.timeSeries.fieldId === res.timeSeries.groupWith) {
        this.isGroupByChart = true;
      } else {
        this.isGroupByChart = false;
      }
    }, error => console.error(`Error : ${error}`));
    this.subscriptions.push(timeSeriesWidgetInfo);
  }

  /**
   * Set Chart properties based on metadata
   */
  setChartProperties(): void {
    /**
     * SET TICKS HERE
     */
    const metadata = this.widgetInf.getValue() ? this.widgetInf.getValue() : {} as TimeSeriesWidget;
    if (this.timeseriesData.timeSeries.scaleFrom !== null && this.timeseriesData.timeSeries.scaleFrom !== undefined
      && this.timeseriesData.timeSeries.scaleTo !== null && this.timeseriesData.timeSeries.scaleTo !== undefined
      && this.timeseriesData.timeSeries.stepSize !== null && this.timeseriesData.timeSeries.stepSize !== undefined) {
      const ticks = { stepSize: this.timeseriesData.timeSeries.stepSize };
      if (this.timeseriesData.timeSeries.chartType === ChartType.BAR || (this.timeseriesData.timeSeries.chartType === ChartType.LINE && (this.isGroupByChart || metadata.timeSeries.fieldId.toLocaleLowerCase() === 'time_taken' || metadata.timeSeries.bucketFilter || (metadata.timeSeries && ((!metadata.timeSeries.fieldId || metadata.timeSeries.fieldId === '') && metadata.timeSeries.groupWith && metadata.timeSeries.distictWith))))) {
        this.timeSeriesOption.scales = {
          ...this.timeSeriesOption.scales,
          x: {
            title: {
              display: true,
              text: this.timeseriesData.timeSeries.xAxisLabel ? this.timeseriesData.timeSeries.xAxisLabel : '',
            },
            ticks: {
              padding: this.timeseriesData.timeSeries.isEnableDatalabels && (this.timeseriesData.timeSeries.datalabelsPosition === 'start' || this.timeseriesData.timeSeries.datalabelsPosition === 'center') ? 20 : 0
            }
          },
          y: {
            title: {
              display: true,
              text: this.timeseriesData.timeSeries.yAxisLabel ? this.timeseriesData.timeSeries.yAxisLabel : ''
            },
            min: this.timeseriesData.timeSeries.scaleFrom,
            max: this.timeseriesData.timeSeries.scaleTo,
            ticks: {
              ...ticks,
              callback(value, index, values) {
                return formatNumber(Number(value), 'en-US');
              }
            }
          }
        };
      } else {
        this.timeSeriesOption.scales = {
          ...this.timeSeriesOption.scales,
          x: {
            type: 'time',
            time: {
              unit: this.timeseriesData.timeSeries.seriesWith,
              stepSize: 1,
            },
            title: {
              display: true,
              text: this.timeseriesData.timeSeries.xAxisLabel ? this.timeseriesData.timeSeries.xAxisLabel : ''
            }, ticks: {
              padding: this.timeseriesData.timeSeries.isEnableDatalabels && (this.timeseriesData.timeSeries.datalabelsPosition === 'start' || this.timeseriesData.timeSeries.datalabelsPosition === 'center') ? 20 : 0
            }
          },
          y: {
            title: {
              display: true,
              text: this.timeseriesData.timeSeries.yAxisLabel ? this.timeseriesData.timeSeries.yAxisLabel : ''
            },
            min: this.timeseriesData.timeSeries.scaleFrom,
            max: this.timeseriesData.timeSeries.scaleTo,
            ticks: {
              ...ticks,
              callback(value, index, values) {
                return formatNumber(Number(value), 'en-US');
              }
            }
          }
        }
      }
    } else {
      if (this.timeseriesData.timeSeries.chartType === ChartType.BAR || (this.timeseriesData.timeSeries.chartType === ChartType.LINE && (this.isGroupByChart || metadata.timeSeries.fieldId.toLocaleLowerCase() === 'time_taken' || metadata.timeSeries.bucketFilter || (metadata.timeSeries && ((!metadata.timeSeries.fieldId || metadata.timeSeries.fieldId === '') && metadata.timeSeries.groupWith && metadata.timeSeries.distictWith))))) {
        this.timeSeriesOption.scales = {
          ...this.timeSeriesOption.scales,
          x: {
            title: {
              display: true,
              text: this.timeseriesData.timeSeries.xAxisLabel ? this.timeseriesData.timeSeries.xAxisLabel : ''
            }, ticks: {
              padding: this.timeseriesData.timeSeries.isEnableDatalabels && (this.timeseriesData.timeSeries.datalabelsPosition === 'start' || this.timeseriesData.timeSeries.datalabelsPosition === 'center') ? 20 : 0
            }
          },
          y: {
            title: {
              display: true,
              text: this.timeseriesData.timeSeries.yAxisLabel ? this.timeseriesData.timeSeries.yAxisLabel : ''
            },
            ticks: {
              padding: this.timeseriesData.timeSeries.isEnableDatalabels && (this.timeseriesData.timeSeries.datalabelsPosition === 'start' || this.timeseriesData.timeSeries.datalabelsPosition === 'center') ? 40 : 0
              , callback(value, index, values) {
                return formatNumber(Number(value), 'en-US');
              }
            }
          }
        };
      } else {
        this.timeSeriesOption.scales = {
          ...this.timeSeriesOption.scales,
          x: {
            type: 'time',
            time: {
              unit: this.timeseriesData.timeSeries.seriesWith,
              stepSize: 1,
            },
            title: {
              display: true,
              text: this.timeseriesData.timeSeries.xAxisLabel ? this.timeseriesData.timeSeries.xAxisLabel : ''
            }, ticks: {
              padding: this.timeseriesData.timeSeries.isEnableDatalabels && (this.timeseriesData.timeSeries.datalabelsPosition === 'start' || this.timeseriesData.timeSeries.datalabelsPosition === 'center') ? 20 : 0
            }
          },
          y: {
            title: {
              display: true,
              text: this.timeseriesData.timeSeries.yAxisLabel ? this.timeseriesData.timeSeries.yAxisLabel : ''
            },
            ticks: {
              padding: this.timeseriesData.timeSeries.isEnableDatalabels && (this.timeseriesData.timeSeries.datalabelsPosition === 'start' || this.timeseriesData.timeSeries.datalabelsPosition === 'center') ? 40 : 0,
              callback(value, index, values) {
                return formatNumber(Number(value), 'en-US');
              }
            }
          }
        };
      }
    }
    if (this.chart) {
      this.chart.options.scales = this.timeSeriesOption.scales;
      this.chart.chart.options.scales = this.timeSeriesOption.scales;
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
   * Event handle when Clicks on dot
   */

  // timeClickFilter(event?: MouseEvent, activeElements?: Array<any>) {
  //   const option = this.chart.chart.getElementAtEvent(event) as any;
  //   if(option.length > 0){
  //     const clickedIndex = (option[0])._index;
  //     const clickedLagend = this.chartLegend[clickedIndex];
  //     const drpCode = this.chartLegend[clickedIndex] ? this.chartLegend[clickedIndex].code : this.lablels[clickedIndex];
  //   }
  // }

  /**
   * handled for legend click
   */

  legendClick(legendItem: LegendItem): void {
    const clickedLegend = this.chartLegend[legendItem.datasetIndex] ? this.chartLegend[legendItem.datasetIndex].code : '';
    if (clickedLegend === '' || legendItem.text === 'Total' || legendItem.text === 'Total -- Total') {
      return;
    }
    const fieldId = this.timeseriesData.timeSeries.fieldId;
    let appliedFilters = this.filterCriteria.filter(fill => fill.fieldId === fieldId);
    this.removeOldFilterCriteria(appliedFilters);
    if (appliedFilters.length > 0) {
      const res = appliedFilters.filter(fill => fill.fieldId === fieldId && fill.widgetType === WidgetType.TIMESERIES && this.timeseriesData.isEnableGlobalFilter);
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
        critera1.widgetType = WidgetType.TIMESERIES;
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
      critera1.widgetType = WidgetType.TIMESERIES;
      appliedFilters.push(critera1);
    }
    appliedFilters.forEach(app => this.filterCriteria.push(app));
    this.applyFilters();
  }

  /**
   * function to generate random colors for chart
   */
  public getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  /**
   * function to get widget data according to widgetID
   * @param widgetId ID of the widget
   */
  getwidgetData(widgetId: number): void {
    this.dataSet = [{ data: [] }];
    forkJoin([this.widgetService.getWidgetView(String(this.reportId), String(widgetId)),
    this.widgetService.getWidgetData(String(widgetId), this.filterCriteria, '', '', this.userDetails.selfServiceUserModel.timeZone, this.userDetails.defLocs.toString())])
      .subscribe(res => {
        this.widgetViewDetails = res[0];
        this.responseData = res[1];
        this.updateChart(this.responseData);
      }, err => {
        console.log('Error');
      })
  }

  private updateChart(responseData) {
    if (responseData !== null) {
      const metadata = this.widgetInf.getValue() ? this.widgetInf.getValue() : {} as TimeSeriesWidget;
      if (this.isGroupByChart) {
        this.transformForGroupBy(responseData);
      } else if (metadata.timeSeries && (metadata.timeSeries.fieldId && metadata.timeSeries.groupWith && metadata.timeSeries.distictWith)) {
        this.dataSet = this.transformDataForComparison(responseData, true);
      } else if (metadata.timeSeries && ((!metadata.timeSeries.fieldId || metadata.timeSeries.fieldId === '') && metadata.timeSeries.groupWith && metadata.timeSeries.distictWith)) {
        this.transformForGroupBy(responseData, true);
      } else if (metadata.timeSeries.fieldId === 'TIME_TAKEN' || metadata.timeSeries.bucketFilter) {
        this.tarnsformForShowInPercentage(responseData, metadata.timeSeries.showInPercentage);
      } else {
        if (this.timeseriesData.timeSeries.chartType === 'BAR') {
          this.dataSet = this.transformDataForComparison(responseData);
        } else {
          this.showFilterOption = true;
          this.dataSet = this.transformDataSets(responseData);
        }
        if (this.filterCriteria.length === 0) {
          this.dateFilters.forEach(ele => {
            ele.isActive = false;
          });
          this.startDateCtrl.setValue(null);
          this.endDateCtrl.setValue(null);
        }
      }

      if (this.chart && !this.isTableView) {
        this.chart.data.datasets = this.dataSet;
        this.chart.update();
      }
    }

    if (this.widgetViewDetails.payload.view === WidgetView.TABLE_VIEW) {
      this.isTableView = true;
      this.getTableData();
    }
    else {
      this.isTableView = false;
    }
  }

  transformDataSets(data: any): any {
    const fieldId = this.timeseriesData.timeSeries.fieldId;
    const finalOutput = new Object();
    const codetextObj = {};
    const cordKeys = ['x', 'y'];
    const totalCount = [];
    const aggregation = data.aggregations['date_histogram#date'] ? data.aggregations['date_histogram#date'] : data.aggregations[''];
    if (aggregation.buckets !== undefined && aggregation.buckets.length > 0) {
      aggregation.buckets.forEach(singleBucket => {
        const res = Object.keys(singleBucket);
        const value = res.filter(text => {
          return text.includes('terms#term');
        })
        const timeStamp = moment(singleBucket.key_as_string, 'MMM-DD-YY').valueOf();
        let arrBuckets = singleBucket[value[0]] ? singleBucket[value[0]].buckets ? singleBucket[value[0]].buckets : []: [];
        if(arrBuckets.length === 0) {
          const buckets1 = singleBucket['nested#Nest_histogram'] ? singleBucket['nested#Nest_histogram'] : [];
          const resValue = Object.keys(buckets1);
          const nestValue = resValue.filter(nestData => {
            return nestData.includes('terms#term');
          });
          arrBuckets  = buckets1[nestValue[0]] ? buckets1[nestValue[0]].buckets ? buckets1[nestValue[0]].buckets : [] : [];
        }
        arrBuckets.forEach(innerBucket => {
          const docTotalCount = innerBucket.doc_count;
          let label = innerBucket.key;
          const txtvalue = Object.keys(innerBucket);
          const txtlabel = txtvalue.filter(da => {
            return da.includes('terms#textTerm');
          })
          const textTermBucket = innerBucket[txtlabel[0]] ? innerBucket[txtlabel[0]].buckets : null;
          let labelCode = innerBucket.key;
          if (textTermBucket) {
            textTermBucket.forEach(bucket => {
              labelCode = this.codeTextValue(textTermBucket[0], fieldId);
              label = labelCode.t ? labelCode.t : labelCode.c ? labelCode.c : labelCode;
              if (this.timeseriesData.timeSeries.metaData.dataType === 'DTMS' || this.timeseriesData.timeSeries.metaData.dataType === 'DATS') {
                label = new Date(Number(label)).toLocaleDateString();
              }
            })
          }
          codetextObj[label] = labelCode && labelCode.c ? labelCode.c : innerBucket.key;
          if (Object.keys(finalOutput).includes(label)) {
            const array = finalOutput[label];
            const objdt = new Object();
            objdt[cordKeys[0]] = timeStamp;
            objdt[cordKeys[1]] = docTotalCount;
            array.push(objdt);
            if (this.widgetInf.getValue().timeSeries.showTotal) {
              if (totalCount.length) {
                const index = totalCount.findIndex(item => item.x === timeStamp);
                if (index > -1) {
                  totalCount[index].y = totalCount[index].y + docTotalCount;
                }
                else {
                  const total = new Object();
                  total[cordKeys[0]] = timeStamp;
                  total[cordKeys[1]] = docTotalCount;
                  totalCount.push(total);
                }
              }
              else {
                const total = new Object();
                total[cordKeys[0]] = timeStamp;
                total[cordKeys[1]] = docTotalCount;
                totalCount.push(total);
              }
            }
            finalOutput[label] = array;

          } else {
            const objdt = new Object();
            objdt[cordKeys[0]] = timeStamp;
            objdt[cordKeys[1]] = docTotalCount;
            const array = new Array();
            array.push(objdt);
            if (this.widgetInf.getValue().timeSeries.showTotal) {
              if (totalCount.length) {
                const index = totalCount.findIndex(item => item.x === timeStamp);
                if (index > -1) {
                  totalCount[index].y = totalCount[index].y + docTotalCount;
                }
                else {
                  const total = new Object();
                  total[cordKeys[0]] = timeStamp;
                  total[cordKeys[1]] = docTotalCount;
                  totalCount.push(total);
                }
              }
              else {
                const total = new Object();
                total[cordKeys[0]] = timeStamp;
                total[cordKeys[1]] = docTotalCount;
                totalCount.push(total);
              }
            }
            finalOutput[label] = array;
          }
        });
      });
    }

    if (this.widgetInf.getValue().timeSeries.showTotal) {
      let showTotal = true;
      this.filterCriteria.forEach(filter => {
        if (filter.conditionFieldValue !== 'Total') {
          const index = Object.keys(finalOutput).indexOf(filter.conditionFieldValue);
          if (index > -1) {
            showTotal = false;
          }
        }
      });
      const total = 'Total'
      if (showTotal) {
        codetextObj[total] = 'Total';
        finalOutput[total] = totalCount;
      } else {
        delete codetextObj[total];
        delete finalOutput[total];
      }
    }

    /**
     * TRANSFORM _ DATASETS
     */
    this.chartLegend = [];
    const arrKeys = ['data', 'id', 'label', 'fill', 'border', 'borderColor', 'pointBorderColor','pointHoverBackgroundColor', 'pointBackgroundColor','pointHoverBorderColor'];
    let datasets = new Array();
    Object.keys(finalOutput).forEach((status, index) => {
      const dataSet = new Object();
      dataSet[arrKeys[0]] = finalOutput[status];
      dataSet[arrKeys[1]] = status;
      dataSet[arrKeys[2]] = this.checkTextCode({ text: status, code: codetextObj[status] });
      dataSet[arrKeys[3]] = false;
      dataSet[arrKeys[4]] = this.getUpdatedColorCode(status);
      dataSet[arrKeys[5]] = dataSet[arrKeys[4]];
      dataSet[arrKeys[6]] = this.chartType;
      dataSet[arrKeys[7]] = 'monotone';
      const chartLegend = { text: status, code: codetextObj[status], legendIndex: this.chartLegend.length };
      this.chartLegend.push(chartLegend);
      datasets.push(dataSet);
      this.setLegendForChart();
    });

    if (this.timeseriesData.timeSeries.dataSetSize) {
      this.chartLegend = _.take(this.chartLegend, this.timeseriesData.timeSeries.dataSetSize);
      datasets = _.take(datasets, this.timeseriesData.timeSeries.dataSetSize);
    }
    console.log(datasets);

    return datasets;
  }

  /**
   * Transform datasets when need comparison year wise month wise...
   * @param res server res
   */
  transformDataForComparison(res: any, forDistinct?: boolean) {
    const fieldId = this.timeseriesData.timeSeries.fieldId;
    let finalOutput = new Array();
    this.dataSetlabel = [];
    const tempDataSetlabel = [];
    const objData = {};
    this.chartLegend = [];
    const totalCount = {};
    const aggregation = res ? res.aggregations['date_histogram#date'] : [];
    if (aggregation.buckets !== undefined && aggregation.buckets.length > 0) {
      aggregation.buckets.forEach(singleBucket => {
        const milliVal = singleBucket.key_as_string;
        const resValue = Object.keys(singleBucket);
        const value = resValue.filter(data => {
          return data.includes('terms#term');
        })
        let arrBuckets = singleBucket[value[0]] ? singleBucket[value[0]].buckets ? singleBucket[value[0]].buckets : [] : [];
        if (arrBuckets.length === 0) {
          const buckets1 = singleBucket['nested#Nest_histogram'] ? singleBucket['nested#Nest_histogram'] : [];
          const resKeys = Object.keys(buckets1);
          const nestValue = resKeys.filter(nestData => {
            return nestData.includes('terms#term');
          });
          arrBuckets = buckets1[nestValue[0]] ? buckets1[nestValue[0]].buckets ? buckets1[nestValue[0]].buckets : [] : [];
        }
        const arrcount = new Array();
        const dataSet = new Object();
        arrBuckets.forEach(arrBucket => {
          const bucket = arrBuckets.filter(fil => fil.key === arrBucket.key)[0];
          const count = bucket ? (forDistinct ? (bucket['cardinality#count'] ? bucket['cardinality#count'].value : 0) : bucket.doc_count) : 0;
          let label = '';
          let codeValue = '';
          if (forDistinct) {
            const labelCode = this.codeTextValue(arrBucket, fieldId);
            label = labelCode.t ? labelCode.t : labelCode;
            codeValue = labelCode.c ? labelCode.c : labelCode;
            if (this.timeseriesData.timeSeries.metaData.dataType === 'DTMS' || this.timeseriesData.timeSeries.metaData.dataType === 'DATS') {
              label = new Date(Number(label)).toLocaleDateString();
            }
          } else {
            const txtvalue = Object.keys(bucket);
            const txtlabel = txtvalue.filter(data => {
              return data.includes('terms#textTerm');
            })
            const textTermBucket = bucket && bucket[txtlabel[0]] ? bucket[txtlabel[0]].buckets : [];
            textTermBucket.forEach(innerBucket => {
              const labelCode = label = this.codeTextValue(innerBucket, fieldId);
              label = labelCode.t ? labelCode.t : labelCode.c ? labelCode.c : labelCode;
              codeValue = labelCode.c ? labelCode.c : labelCode;
              if (this.timeseriesData.timeSeries.metaData.dataType === 'DTMS' || this.timeseriesData.timeSeries.metaData.dataType === 'DATS') {
                label = new Date(Number(label)).toLocaleDateString();
              }
            });
          }
          const chartLegend = { text: label, code: codeValue, legendIndex: this.chartLegend.length };
          const exist = this.chartLegend.filter(map => map.code === codeValue);
          if (exist.length === 0) {
            this.chartLegend.push(chartLegend);
            if (this.dataSetlabel.indexOf(codeValue) === -1) {
              label.length > 0 ? tempDataSetlabel.push(label) : tempDataSetlabel.push(arrBucket.key);
              this.dataSetlabel.push(this.checkTextCode(chartLegend));
            }
          }
          dataSet[label] = count;
        });
        tempDataSetlabel.forEach(key => {
          if (Object.keys(dataSet).includes(key.toString())) {
            const obj = {};
            const objDataVal = ['x', 'y'];
            obj[objDataVal[0]] = key;
            obj[objDataVal[1]] = dataSet[key.toString()]
            arrcount.push(obj);
          } else {
            arrcount.push({ x: 0, y: 0 });
          }
          if (dataSet[key]) {
            if (totalCount[key]) {
              totalCount[key].y = totalCount[key].y + +dataSet[key];
            } else {
              const obj = {};
              const objDataVal = ['x', 'y'];
              obj[objDataVal[0]] = key;
              obj[objDataVal[1]] = dataSet[key];
              totalCount[key] = obj;
            }
          }
        });
        // Prepare datasets for comparison in timeseries
        if (objData[milliVal] !== undefined) {
          const oldArray = objData[milliVal];
          const lengthOfArr = arrcount.length > oldArray.length ? oldArray.length : arrcount.length;
          for (let i = 0; i < lengthOfArr.length; i++) {
            arrcount[i] = arrcount[i] + oldArray[i];
            if (totalCount[i]) {
              totalCount[i] = totalCount[i] + arrcount[i];
            } else {
              totalCount[i] = arrcount[i];
            }
          }
        }
        // this.totalCount = totalCount;
        objData[milliVal] = arrcount;
      });
    }

    const arrKeyF = ['label', 'data', 'type', 'backgroundColor', 'borderColor'];
    Object.keys(objData).forEach((status, index) => {
      const label = {};
      label[arrKeyF[0]] = status;
      label[arrKeyF[1]] = objData[status];
      label[arrKeyF[2]] = this.chartType;
      label[arrKeyF[3]] = this.getUpdatedColorCode(status);
      label[arrKeyF[4]] = label[arrKeyF[3]];
      finalOutput.push(label);
    });

    if (this.timeseriesData.timeSeries.dataSetSize) {
      finalOutput = _.take(finalOutput, this.timeseriesData.timeSeries.dataSetSize);
    }
    // this.timeSeriesOption.scales = { x: {}, y: {}, totalX: {} };
    this.setLegendForChart(); // calling it to set legend
    if (this.widgetInf.getValue().timeSeries.showTotal) {
      if (this.timeseriesData.timeSeries.chartType === ChartType.BAR) {
        const color = '#e4e5e5';
        const totalDataSet =
        {
          label: 'Total',
          data: [],
          type: this.chartType,
          xAxisId: 'total-x',
          offset: true,
          barThickness: 'flex',
          barPercentage: 1.30 * (finalOutput.length),
          categoryPercentage: 1,
          backgroundColor: color,
          borderColor:color,
          xAxisID: 'bar-x-Total',
        };
        Object.values(totalCount).forEach((el: number) => {
          totalDataSet.data.push(el);
        })
        if (Object.keys(totalCount).length) {
          finalOutput.splice(Math.ceil(finalOutput.length / 2), 0, totalDataSet);
          // finalOutput.push(totalDataSet);
          // this.totalCount = totalCount;
        }
        else {
          finalOutput.splice(Math.ceil(finalOutput.length / 2), 0, totalDataSet);
          // finalOutput.push(totalDataSet);
        }
        const scaleAxes = {
          id: 'total-x',
          offset: false,
          display: false,
          grid: {
            offset: false,
            display: false
          },
          stacked: true
        }
        const totalX = 'totalX';
        this.timeSeriesOption.scales[totalX] = { ...this.timeSeriesOption.scales[totalX], ...scaleAxes }
      }
    }
    return finalOutput;
  }

  /**
   * Transform for timeseries with grp by same fields ..
   * @param res server response
   */
  transformForGroupBy(res: any, forDistinct?: boolean) {
    const aggregation = res ? res.aggregations['date_histogram#date'] : [];
    const totalCount = {};
    if (aggregation && aggregation.buckets) {
      const yearDoc = {};
      aggregation.buckets.forEach(fil => {
        let date = fil.key_as_string ? fil.key_as_string : [];
        if (date) {
          date = date.split('-');
          if (yearDoc[date[0]]) {
            yearDoc[date[0]].push(fil);
          } else {
            yearDoc[date[0]] = [fil];
          }
        }
      });

      this.dataSetlabel = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const finaldata = [];
      if (yearDoc) {
        Object.keys(yearDoc).forEach((yr) => {
          const dataSet = this.generatedDataBasedonMonth(yearDoc[yr], forDistinct);
          dataSet.forEach((data, ind) => {
            const objData = {};
            if (totalCount[ind]) {
              totalCount[ind].y = totalCount[ind].y + data.y;
            } else {
              const objValue = ['x', 'y'];
              objData[objValue[0]] = data.x;
              objData[objValue[1]] = data.y;
              totalCount[ind] = objData;
            }
          })
          // this.totalCount = totalCount;
          if (yearDoc[yr]) {
            const colorCode = this.getUpdatedColorCode(yr)
            finaldata.push({
              data: dataSet,
              label: `${yr}`,
              fill: false,
              type: this.chartType,
              backgroundColor: colorCode,
              borderColor: colorCode,
              cubicInterpolationMode: 'monotone'
            });
          }
        });
      }

      this.setLegendForChart(); // calling it to set legend
      const color = this.getUpdatedColorCode('total')
      let totalDataSet: any =
      {
        label: 'Total',
        data: [],
        fill: false,
        type: this.chartType,
        xAxisId: 'total-x',
        backgroundColor: color,
        borderColor: color,
        cubicInterpolationMode: 'monotone',
        hoverBackgroundColor: '#e4e5e5',
        pointBackgroundColor: '#e4e5e5',
        pointHoverBackgroundColor: '#e4e5e5',
        pointBorderColor: '#e4e5e5',
        pointHoverBorderColor: '#e4e5e5',
      };
      if (this.widgetInf.getValue().timeSeries.showTotal) {
        if (this.timeseriesData.timeSeries.chartType === ChartType.BAR) {
          totalDataSet = {
            ...totalDataSet,
            barThickness: 'flex',
            barPercentage: finaldata.length > 1 ? 1.3 * (finaldata.length) : 2.5,
            categoryPercentage: 1,
            stack: 'a',
          }
          const scaleAxes = {
            id: 'total-x',
            offset: true,
            display: false,
            grid: {
              offset: false,
              display: false
            },
            stacked: true
          }
          const totalX = 'totalX';
          this.timeSeriesOption.scales[totalX] = { ...this.timeSeriesOption.scales[totalX], ...scaleAxes };
        }
        Object.values(totalCount).forEach((el: number) => {
          totalDataSet.data.push(el);
        })
        if (Object.keys(totalCount).length) {
          if (this.timeseriesData.timeSeries.chartType === ChartType.BAR) {
            if (finaldata.length > 1)
              finaldata.splice(Math.ceil(finaldata.length / 2), 0, totalDataSet);
            else
              finaldata.splice(0, 0, totalDataSet);
          }
          else {
            finaldata.push(totalDataSet);
          }
        }
      }
      this.dataSet = finaldata;
    }
  }


  tarnsformForShowInPercentage(res: any, showInPercentage: boolean) {
    const aggregation = res ? res.aggregations['date_histogram#date'] : [];
    const totalCount = {};
    if (aggregation && aggregation.buckets) {
      const yearDoc = {};

      aggregation.buckets.forEach(fil => {
        let date = fil.key_as_string ? fil.key_as_string : [];
        if (date) {
          date = date.split('-');
          if (yearDoc[date[0]]) {
            yearDoc[date[0]].push(fil);
          } else {
            yearDoc[date[0]] = [fil];
          }
        }
      });
      this.dataSetlabel = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const finaldata = [];
      if (yearDoc) {
        Object.keys(yearDoc).forEach((yr) => {
          const dataSet = this.bucketModify(yearDoc[yr], showInPercentage);
          dataSet.forEach((data, index) => {
            if (totalCount[index]) {
              if (data.y !== undefined) {
                totalCount[index].y = totalCount[index].y + data.y;
              }
            } else {
              totalCount[index] = data;
            }
          })
          if (yearDoc[yr]) {
            finaldata.push({
              data: dataSet,
              label: `${yr}`,
              fill: false,
              backgroundColor: this.getUpdatedColorCode(yr),
              type: this.chartType
            });
          }
        });
      }
      // this.timeSeriesOption.scales = { xAxes: [{}], yAxes: [{}] };
      this.setLegendForChart(); // calling it to set legend
      const totalDataSet =
      {
        label: 'Total',
        data: [],
        fill: false,
        xAxisID: '',
        backgroundColor: '#e4e5e5',
        borderColor: '#e4e5e5',
        hoverBackgroundColor: '#e4e5e5',
        pointBackgroundColor: '#e4e5e5',
        pointHoverBackgroundColor: '#e4e5e5',
        pointBorderColor: '#e4e5e5',
        pointHoverBorderColor: '#e4e5e5',
      };
      if (this.widgetInf.getValue().timeSeries.showTotal) {
        if (this.timeseriesData.timeSeries.chartType === ChartType.BAR) {
          if (this.timeSeriesOption.scales.x.grid) {
            this.timeSeriesOption.scales.x.grid.display = true;
          }
          totalDataSet.xAxisID = 'bar-x-Total';
        }
        Object.values(totalCount).forEach((el: number) => {
          totalDataSet.data.push(el);
        })

        let showTotal = true;
        this.filterCriteria.forEach(filter => {
          const index = this.dataSetlabel.indexOf(filter.conditionFieldValue);
          if (index > -1) {
            showTotal = false;
          }
        });
        if (showTotal) {
          if (Object.keys(totalCount).length) {
            finaldata.push(totalDataSet);
          }
        }
      }
      this.dataSet = finaldata;
    }
  }

  /**
   * Transformer helper ..
   * @param data year data
   */
  bucketModify(data: any, showInPercentage: boolean): any[] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const finalData = [];
    months.forEach(mon => {
      const hasdata = data.filter(fil => fil.key_as_string.indexOf(mon) !== -1)[0];
      if (hasdata) {
        const totalInMonth = hasdata.doc_count ? hasdata.doc_count : 0;
        const res = Object.keys(hasdata);
        const value = res.filter(text => {
          return text.includes('terms#term')
        })
        const inFilterBucket = hasdata[value[0]] ? hasdata[value[0]].buckets : [];
        const bucket = inFilterBucket.filter(fil => fil.key !== '')[0];
        const objData = {};
        if (bucket) {
          let val = bucket.doc_count ? bucket.doc_count : 0;
          if (val > 0 && showInPercentage) {
            const per = (val / totalInMonth);
            val = Math.round((per + Number.EPSILON) * 100 * 100) / 100;
          }
          const objAxes = ['x', 'y']
          objData[objAxes[0]] = mon;
          objData[objAxes[1]] = val;
          finalData.push(objData);
        }
      } else {
        finalData.push({});
      }

    });
    return finalData;
  }


  /**
   * Transformer helper ..
   * @param data year data
   */
  generatedDataBasedonMonth(data: any, forDistinct: boolean): any[] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const finalData = [];
    months.forEach(mon => {
      const hasdata = data.filter(fil => fil.key_as_string.indexOf(mon) !== -1)[0];
      const objData = {};
      const objValue = ['x', 'y']
      objData[objValue[0]] = mon;
      objData[objValue[1]] = hasdata ? (forDistinct ? (hasdata['cardinality#count'] ? hasdata['cardinality#count'].value : 0) : hasdata.doc_count) : 0;
      finalData.push(objData)
    });
    return finalData;
  }

  /**
   * EMIT EVENT WHEN DATE CHANGES
   */

  emitDateChangeValues() {
    if (this.startDateCtrl.value && this.endDateCtrl.value) {
      if (this.startDateCtrl.value === this.endDateCtrl.value) {
        this.endDateCtrl.setValue(String(Number(this.startDateCtrl.value) + 24 * 60 * 60 * 1000));
      }
      const groupwith = this.timeseriesData.timeSeries.groupWith;
      let filterApplied = this.filterCriteria.filter(fill => fill.conditionFieldId === groupwith);
      this.removeOldFilterCriteria(filterApplied);
      if (filterApplied.length) {
        filterApplied[0].conditionFieldStartValue = moment(this.startDateCtrl.value).valueOf().toString();
        filterApplied[0].conditionFieldEndValue = moment(this.endDateCtrl.value).valueOf().toString();
      } else {
        filterApplied = [];
        const critera: Criteria = new Criteria();
        critera.fieldId = groupwith;
        critera.conditionFieldId = groupwith;
        critera.conditionFieldEndValue = moment(this.endDateCtrl.value).valueOf().toString();
        critera.conditionFieldStartValue = moment(this.startDateCtrl.value).valueOf().toString();
        critera.blockType = BlockType.COND;
        critera.conditionOperator = ConditionOperator.RANGE;
        filterApplied.push(critera);
      }
      filterApplied.forEach(op => this.filterCriteria.push(op));
      this.applyFilters();
      this.dateFilters.forEach(ele => {
        ele.isActive = false;
      })


    }
  }

  /**
   * Open Color palette...
   */
  openColorPalette() {
    const req: WidgetColorPalette = new WidgetColorPalette();
    req.widgetId = String(this.widgetId);
    req.reportId = String(this.reportId);
    req.widgetDesc = this.timeseriesData.desc;
    req.colorPalettes = [];
    this.chartLegend.forEach(legend => {
      req.colorPalettes.push({
        code: legend.code,
        colorCode: this.timeseriesData[0] ? this.timeseriesData[0].backgroundColor[legend.legendIndex] : this.getRandomColor(),
        text: legend.text
      });
    });
    super.openColorPalette(req);
  }

  getUpdatedColorCode(code: string): string {
    if (this.widgetColorPalette && this.widgetColorPalette.colorPalettes) {
      const res = this.widgetColorPalette.colorPalettes.filter(fil => fil.code === code)[0];
      if (res) {
        return res.colorCode;
      }

    }
    return this.getRandomColor();
  }

  /**
   * Update stacked color based on color definations
   */

  updateColorBasedOnDefined(res: WidgetColorPalette) {
    this.widgetColorPalette = res;
  }

  /**
   * Download data into CSV
   */
  downloadCSV(): void {
    const excelData = [];
    const tableData = [];
    let column;
    const timeSeries = this.timeseriesData.timeSeries.seriesWith.charAt(0).toUpperCase() + this.timeseriesData.timeSeries.seriesWith.slice(1);
    this.dataSet.forEach((dataArr) => {
      const key = 'id'
      if (dataArr[key]) {
        dataArr.data.forEach((dataObj, index) => {
          const obj = {} as any;
          obj[this.timeseriesData.timeSeries.metaData ? this.timeseriesData.timeSeries.metaData.fieldDescri : this.timeseriesData.timeSeries.metaData.fieldId] = dataArr[key];
          column = this.timeseriesData.timeSeries.metaData ? this.timeseriesData.timeSeries.metaData.fieldDescri : this.timeseriesData.timeSeries.metaData.fieldId;
          this.dateAndCountFormat(dataObj, obj, dataArr);
          excelData.push(obj);
        })
      }
      else {
        dataArr.data.forEach((dataObj, index) => {
          const obj = {} as any;
          // In case of field ID is there..
          if (this.timeseriesData.timeSeries.metaData.fieldId) {
            obj[this.timeseriesData.timeSeries.metaData ? this.timeseriesData.timeSeries.metaData.fieldDescri : this.timeseriesData.timeSeries.metaData.fieldId] = this.chartLegend.length > 0 ? (this.chartLegend[index].text.length > 0 ? this.chartLegend[index].text + '\t' : this.chartLegend[index].code + '\t') : this.dataSetlabel[index] + '\t';
            column = this.timeseriesData.timeSeries.metaData ? this.timeseriesData.timeSeries.metaData.fieldDescri : this.timeseriesData.timeSeries.metaData.fieldId;
          }
          // In case of field ID is blank - groupWith and DistinctWith are there..
          else {
            obj[this.timeseriesData.timeSeries.distictWith] = this.chartLegend.length > 0 ? (this.chartLegend[index].text.length > 0 ? this.chartLegend[index].text + '\t' : this.chartLegend[index].code + '\t') : this.dataSetlabel[index] + '\t';
            column = this.timeseriesData.timeSeries.metaData ? this.timeseriesData.timeSeries.metaData.fieldDescri : this.timeseriesData.timeSeries.metaData.fieldId;
          }
          // checking format of data to be downloaded..
          this.dateAndCountFormat(dataObj, obj, dataArr);
          excelData.push(obj);
        })
      }
    })

    excelData.forEach(item => {
      const itemObj = {};
      const index = tableData.findIndex(tab => tab[column] === item[column]);
      if (index > -1) {
        itemObj[item[timeSeries]] = item.Count;
        tableData[index] = { ...tableData[index], ...itemObj };
      }
      else {
        itemObj[column] = item[column];
        itemObj[item[timeSeries]] = item.Count;
        tableData.push(itemObj);
      }
    })
    console.log('tabledata', tableData);
    this.widgetService.downloadCSV('Time-Chart', tableData);
  }


  /*
    * download chart as image
    */
  downloadImage() {
    this.widgetService.downloadImage(this.chart.toBase64Image(), 'Time-Series.png');
  }

  clearFilterCriteria() {
    this.startDateCtrl.setValue(null);
    this.endDateCtrl.setValue(null);
    const fieldId = this.timeseriesData.timeSeries.groupWith;
    const appliedFilters = this.filterCriteria.filter(fill => fill.fieldId === fieldId);
    this.removeOldFilterCriteria(appliedFilters);

    this.dateFilters.forEach(f => {
      f.isActive = false;
    });

    this.emitEvtFilterCriteria(this.filterCriteria);
  }


  /**
   * After click on stack br / line then should emit through this function ..
   * @param event canvas evnet ..
   * @param activeElements get active element ..
   */
  stackClickFilter(event?: MouseEvent, activeElements?: Array<any>) {
    if (this.chart && activeElements.length > 0) {
      const option = this.chart.chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false) as any;
      if (option && option[0] && this.chartLegend[(option[0]._index)]) {
        const axislabel = this.chartLegend[(option[0]._index)];

        const fieldId = this.timeseriesData.timeSeries.fieldId;
        let appliedFilters = this.filterCriteria.filter(fill => fill.fieldId === fieldId);
        this.removeOldFilterCriteria(appliedFilters);
        if (appliedFilters.length > 0) {
          const res = appliedFilters.filter(fill => fill.fieldId === fieldId && fill.widgetType === WidgetType.TIMESERIES && this.timeseriesData.isEnableGlobalFilter);
          if (res.length !== 0) {
            res.forEach(val => {
              val.conditionFieldValue = axislabel.code;
            })
          }
          const cri = appliedFilters.filter(fill => fill.conditionFieldValue === axislabel.code);
          if (cri.length === 0) {
            const critera1: Criteria = new Criteria();
            critera1.fieldId = fieldId;
            critera1.conditionFieldId = fieldId;
            critera1.conditionFieldValue = axislabel.code;
            critera1.blockType = BlockType.COND;
            critera1.conditionOperator = ConditionOperator.EQUAL;
            critera1.widgetType = WidgetType.TIMESERIES;
            appliedFilters.push(critera1);
          }
        } else {
          appliedFilters = [];
          const critera1: Criteria = new Criteria();
          critera1.fieldId = fieldId;
          critera1.conditionFieldId = fieldId
          critera1.conditionFieldValue = axislabel.code;
          critera1.blockType = BlockType.COND;
          critera1.conditionOperator = ConditionOperator.EQUAL;
          critera1.widgetType = WidgetType.TIMESERIES;
          appliedFilters.push(critera1);
        }
        appliedFilters.forEach(app => this.filterCriteria.push(app));
        this.applyFilters();
      }
    }
  }

  /**
   * function to set legend position and visibility
   */
  setLegendForChart(): void {
    if (this.timeseriesData.timeSeries.isEnableLegend) {
      this.timeSeriesOption.plugins.legend = {
        ...this.timeSeriesOption.plugins.legend,
        display: true,
        position: this.timeseriesData.timeSeries.legendPosition || 'top',
      };
      if (this.chart) {
        this.chart.options.plugins.legend = this.timeSeriesOption.plugins.legend;
        this.chart.chart.options.plugins.legend = this.timeSeriesOption.plugins.legend;
      }
    }

    if (this.timeseriesData.timeSeries.isEnableDatalabels) {
      this.timeSeriesOption.plugins.datalabels = {
        ...this.timeSeriesOption.plugins.datalabels,
        align: this.timeseriesData.timeSeries.datalabelsPosition || 'end',
        anchor: this.timeseriesData.timeSeries.datalabelsPosition || 'end',
        display: 'auto',
        formatter: ((value: any, context: Context) => {
          return formatNumber(Number(value ? value.y ? value.y : value : value), 'en-US');
        })
      };
      if (this.chart) {
        this.chart.options.plugins.datalabels = this.timeSeriesOption.plugins.datalabels;
        this.chart.chart.options.plugins.datalabels = this.timeSeriesOption.plugins.datalabels;
      }
    }
    this.setChartProperties();
  }

  applyFilters() {
    this.emitEvtFilterCriteria(this.filterCriteria);
    // this.lablels = [];
    // this.chartLegend = [];
    // this.widgetInf.next(this.widgetInf.getValue());
  }

  updatevalues() {
    console.log('widget info===', this.widgetInf)
    this.timeseriesData = this.widgetInf.getValue();
    const hasBtn = this.dateFilters.filter(fil => fil.value === (this.timeseriesData.timeSeries.startDate))[0];
    if (hasBtn) {
      const index = this.dateFilters.indexOf(hasBtn);
      this.dateFilters.splice(index, 1);
      hasBtn.isActive = true;
      this.dateFilters.splice(index, 0, hasBtn);
      if (!this.timeseriesData.timeSeries.distictWith) {
        this.updateForm('date', hasBtn);
      }
    }
  }

  codeTextValue(innerBucket: any, fieldId: string): any {
    let labelValue = '';
    const hits = innerBucket['top_hits#data_hits'] ? innerBucket['top_hits#data_hits'].hits.hits[0] : null;
    const val = hits ? hits._source.hdvs ? (hits._source.hdvs[fieldId] ?
      (hits._source.hdvs[fieldId] ? hits._source.hdvs[fieldId].vc : null) : null) :
      (hits._source.staticFields && hits._source.staticFields[fieldId]) ?
        (hits._source.staticFields[fieldId] ? hits._source.staticFields[fieldId].vc : null) : null :
      (hits._source[fieldId] ? hits._source[fieldId].vc : null);
    if (val) {
      if (fieldId === 'OVERDUE' || fieldId === 'FORWARDENABLED' || fieldId === 'TIME_TAKEN' || this.timeseriesData.timeSeries.metaData.picklist === '35') {
        labelValue = this.getFields(fieldId, val[0].c);
      } else {
        labelValue = val[0];
      }
    } else {
      labelValue = innerBucket.key;
    }
    return labelValue;
  }

  saveDisplayCriteria() {
    const saveDisplayCriteria = this.widgetService.saveDisplayCriteria(this.widgetInfo.widgetId, this.widgetInfo.widgetType, this.displayCriteriaOption).subscribe(res => {
      this.updateChart(this.responseData)
    }, error => {
      console.error(`Error : ${error}`);
      this.snackBar.open(`Something went wrong`, 'Close', { duration: 3000 });
    });
    this.subscriptions.push(saveDisplayCriteria);
  }

  checkTextCode(value: { code: string; text: string; }): string {
    if (value.code || value.text) {
      switch (this.displayCriteriaOption) {
        case DisplayCriteria.CODE:
          return value.code ? value.code : value.text;
        case DisplayCriteria.TEXT:
          return value.text ? value.text : value.code;
        default:
          const resCodeText = (value.code && value.text) ? (`${value.code} -- ${value.text}`) : (value.code ? `${value.code} -- ${value.code}` : `${value.text} -- ${value.text}`);
          return resCodeText;
      }
    }
    return '';
  }

  dateAndCountFormat(objData, obj, dataArr) {
    switch (this.timeseriesData.timeSeries.seriesWith) {
      case SeriesWith.day:
        obj.Day = objData.x ? objData.x + '\t' : dataArr.label + '\t';
        break;

      case SeriesWith.week:
        obj.Week = objData.x ? objData.x + '\t' : dataArr.label + '\t';
        break;

      case SeriesWith.month:
        obj.Month = objData.x ? objData.x + '\t' : dataArr.label + '\t';
        break;

      case SeriesWith.quarter:
        obj.Quater = objData.x ? objData.x + '\t' : dataArr.label + '\t';
        break;

      case SeriesWith.year:
        obj.Year = objData.x ? objData.x + '\t' : dataArr.label + '\t';
        break;

      default:
        break;
    }
    obj.Count = objData.y ? formatNumber(objData.y, 'en-US') + '\t' : formatNumber(objData, 'en-US') + '\t'
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
    if (this.widgetViewDetails?.payload.uuid === '') {
      this.widgetService.saveWidgetView(widgetViewRequest).subscribe(res => {
        this.widgetInf.next(this.widgetInf.getValue());
      }, err => {
        console.log('Error')
      });
    }
    else {
      widgetViewRequest.uuid = this.widgetViewDetails?.payload.uuid;
      this.widgetService.updateWidgetView(widgetViewRequest).subscribe(res => {
        this.widgetInf.next(this.widgetInf.getValue());
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
    const tableData = [];
    this.dataSet.forEach((dataArr) => {
      const key = 'id'
      if (dataArr[key]) {
        dataArr.data.forEach((dataObj, index) => {
          const obj = {} as any;
          obj[this.timeseriesData.timeSeries.metaData ? this.timeseriesData.timeSeries.metaData.fieldDescri : this.timeseriesData.timeSeries.metaData.fieldId] = dataArr.label;
          this.dateAndCountFormat(dataObj, obj, dataArr);
          if (!this.displayedColumnsId.includes(this.timeseriesData.timeSeries.metaData ? this.timeseriesData.timeSeries.metaData.fieldDescri : this.timeseriesData.timeSeries.metaData.fieldId)) {
            this.displayedColumnsId.push(this.timeseriesData.timeSeries.metaData ? this.timeseriesData.timeSeries.metaData.fieldDescri : this.timeseriesData.timeSeries.metaData.fieldId);
          }
          excelData.push(obj);
        })
      }
      else {
        dataArr.data.forEach((dataObj, index) => {
          const obj = {} as any;
          // In case of field ID is there..
          if (this.timeseriesData.timeSeries.metaData.fieldId) {
            obj[this.timeseriesData.timeSeries.metaData ? this.timeseriesData.timeSeries.metaData.fieldDescri : this.timeseriesData.timeSeries.metaData.fieldId] = this.chartLegend.length > 0 ? this.checkTextCode(this.chartLegend[index]) : '';
            if (!this.displayedColumnsId.includes(this.timeseriesData.timeSeries.metaData ? this.timeseriesData.timeSeries.metaData.fieldDescri : this.timeseriesData.timeSeries.metaData.fieldId)) {
              this.displayedColumnsId.push(this.timeseriesData.timeSeries.metaData ? this.timeseriesData.timeSeries.metaData.fieldDescri : this.timeseriesData.timeSeries.metaData.fieldId);
            }
          }
          // In case of field ID is blank - groupWith and DistinctWith are there..
          else {
            obj[this.timeseriesData.timeSeries.distictWith] = this.chartLegend.length > 0 ? this.checkTextCode(this.chartLegend[index]) : '';
            if (!this.displayedColumnsId.includes(this.timeseriesData.timeSeries.distictWith)) {
              this.displayedColumnsId.push(this.timeseriesData.timeSeries.distictWith);
            }
          }
          this.dateAndCountFormat(dataObj, obj, dataArr);
          excelData.push(obj);
        })
      }
    })

    const column = this.displayedColumnsId[0];
    const timeSeries = this.timeseriesData.timeSeries.seriesWith.charAt(0).toUpperCase() + this.timeseriesData.timeSeries.seriesWith.slice(1);
    excelData.forEach(item => {
      const itemObj = {};
      const index = tableData.findIndex(tab => tab[column] === item[column]);
      if (index > -1) {
        itemObj[item[timeSeries]] = item.Count;
        tableData[index] = { ...tableData[index], ...itemObj };
      }
      else {
        itemObj[column] = item[column];
        itemObj[item[timeSeries]] = item.Count;
        tableData.push(itemObj);
      }
      if (!this.displayedColumnsId.includes(item[timeSeries])) {
        this.displayedColumnsId.push(item[timeSeries]);
      }
    })
    this.tableDataSource = tableData;
  }
}