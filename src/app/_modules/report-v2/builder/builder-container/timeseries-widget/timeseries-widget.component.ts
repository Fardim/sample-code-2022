import { Component, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GenericWidgetComponent } from '../../generic-widget/generic-widget.component';
import { ChartDataset, ChartEvent, ChartOptions, LegendItem, TooltipItem } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import * as moment from 'moment';
import { WidgetService } from 'src/app/_services/widgets/widget.service';
import { BehaviorSubject, forkJoin, Subscription } from 'rxjs';
import { ButtonArr, ChartLegend, ChartType, ConditionOperator, Criteria, DisplayCriteria, SeriesWith, WidgetColorPalette, WidgetType } from '../../../_models/widget';
import { BlockType } from '@modules/admin/_components/module/business-rules/user-defined-rule/udr-cdktree.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import _ from 'lodash';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChartType as CType } from 'chart.js';
import { Context } from 'chartjs-plugin-datalabels';
import { UserService } from '@services/user/userservice.service';
import { Userdetails } from '@models/userdetails';
import { WidgetView, WidgetViewDetails, WidgetViewRequestPayload } from '@modules/report/_models/widget';
import { formatNumber } from '@angular/common';
import { distinctUntilChanged } from 'rxjs/operators';
import * as momentAdapter from 'chartjs-adapter-moment';
import { isEqual } from 'lodash';
import { MatMenuItem } from '@angular/material/menu';

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
  public afterColorDefined: BehaviorSubject<WidgetColorPalette> = new BehaviorSubject<WidgetColorPalette>(null);
  lineChartPlugins = [];
  chartLegend: ChartLegend[] = [];
  lablels: string[] = [];
  formGroup: FormGroup;
  dateFilters = btnArray;
  startDateCtrl = new FormControl();
  endDateCtrl = new FormControl();
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;
  @ViewChild('viewasItem') viewasItem: MatMenuItem;
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
    animation: false,
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
          },
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
          showLabelBackdrop: false,
          font: {
            size: 12
          }
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
          maxRotation: 0,
          font: {
            size: 12
          }
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
          showLabelBackdrop: false,
          font: {
            size: 12
          }
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
        clip: true, // This property hides lables going beyond chart area
        formatter: ((value: any, context: Context) => {
          return value.y;
        })
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: TooltipItem<any>) => {
            let label = tooltipItem.dataset.label;
            label = label + ':' + tooltipItem.formattedValue
            return tooltipItem.label !== 'undefined' ? label : '';
          },
        },
        displayColors: true
      },
      legend: {
        display: false,
        onClick: (event: ChartEvent, legendItem: LegendItem) => {
          if (this.widgetInfo.chartProperties.chartType !== ChartType.BAR && this.widgetInfo.field !== '') {
            this.legendClick(legendItem);
          }
        }
      },
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

  labelTooltipCharLimit = 15;

  constructor(
    private widgetService: WidgetService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private userService: UserService,
    public matDialog: MatDialog) {
    super(matDialog);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  ngOnChanges(changes: import('@angular/core').SimpleChanges): void {

    if (changes && changes.hasFilterCriteria && changes.hasFilterCriteria.currentValue) {
      this.clearFilterCriteria();
    }

    if (changes && changes.filterCriteria && changes.filterCriteria.previousValue !== undefined && changes.filterCriteria.currentValue !== changes.filterCriteria.previousValue) {
      this.lablels = [];
      this.chartLegend = [];
      this.filterCriteria = this.filterCriteria.filter(item => item.fieldId !== '__DIW_STATUS');
      this.isFetchingData = true;
      this.getwidgetData(this.widgetId);
    }

    if (changes && changes.widgetInfo && changes.widgetInfo.previousValue !== undefined && !isEqual(changes.widgetInfo.currentValue, changes.widgetInfo.previousValue)) {
      this.lablels = [];
      this.chartLegend = [];
      this.chartType = this.widgetInfo.chartProperties.chartType === ChartType.LINE ? 'line' : 'bar';
      if (this.widgetInfo.field === this.widgetInfo.groupById) {
        this.isGroupByChart = true;
      } else {
        this.isGroupByChart = false;
      }
      this.updatevalues();
      this.getwidgetData(this.widgetId);
    }
  }

  ngOnInit(): void {
    if (this.widgetInfo.widgetAdditionalProperties && this.widgetInfo.widgetAdditionalProperties.displayCriteria) {
      this.displayCriteriaOption = this.widgetInfo.widgetAdditionalProperties.displayCriteria;
    }
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

    this.chartType = this.widgetInfo.chartProperties.chartType === ChartType.LINE ? 'line' : 'bar';
    if (this.widgetInfo.field === this.widgetInfo.groupById) {
      this.isGroupByChart = true;
    } else {
      this.isGroupByChart = false;
    }
    // this.updatevalues();
    // after color defined update on widget
    const afterColorDefined = this.afterColorDefined.subscribe(res => {
      if (res) {
        this.updateColorBasedOnDefined(res);
      }
    });
    this.subscriptions.push(afterColorDefined);

    const getUserDetails = this.userService.getUserDetails().pipe(distinctUntilChanged()).subscribe(res => {
      if (!isEqual(this.userDetails, res)) {
        this.userDetails = res;
        this.isFetchingData = true;
        this.getwidgetData(this.widgetId);
        this.updatevalues();
        this.afterColorDefined.next(this.widgetInfo.widgetColorPalette);
      }
    }, error => console.error(`Error : ${error.message}`));
    this.subscriptions.push(getUserDetails);
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
    switch (this.widgetInfo.chartProperties.seriesWith) {
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
    const fieldId = this.widgetInfo.groupById;
    // let appliedFilters = this.filterCriteria.filter(fill => fill.fieldId !== fieldId);
    let appliedFilters = this.filterCriteria;
    // this.removeOldFilterCriteria(appliedFilters);
    if (appliedFilters.length > 0) {
      const cri = appliedFilters.filter(fill => fill.conditionFieldId === fieldId && fill.widgetId === this.widgetId);
      if (cri.length === 0) {
        const critera: Criteria = new Criteria();
        critera.fieldId = fieldId;
        critera.conditionFieldId = fieldId;
        critera.conditionFieldEndValue = enddate;
        critera.conditionFieldStartValue = startdate;
        critera.blockType = BlockType.COND;
        critera.conditionOperator = ConditionOperator.RANGE;
        critera.widgetType = WidgetType.TIMESERIES;
        critera.widgetId = this.widgetId;
        critera.timeSeriesDateFilter = true;
        appliedFilters.push(critera);
      } else {
        const index = appliedFilters.findIndex(item => item.fieldId === fieldId);
        if (index > -1) {
          appliedFilters[index].conditionFieldEndValue = enddate;
          appliedFilters[index].conditionFieldStartValue = startdate;
        }
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
      critera.widgetId = this.widgetId;
      critera.timeSeriesDateFilter = true;
      appliedFilters.push(critera);
    }
    this.filterCriteria = appliedFilters;

    this.applyFilters();
  }

  /**
   * Set Chart properties based on metadata
   */
  setChartProperties(): void {
    /**
     * SET TICKS HERE
     */
    if (this.widgetInfo.chartProperties.scaleFrom !== null && this.widgetInfo.chartProperties.scaleFrom !== undefined
      && this.widgetInfo.chartProperties.scaleTo !== null && this.widgetInfo.chartProperties.scaleTo !== undefined
      && this.widgetInfo.chartProperties.stepSize !== null && this.widgetInfo.chartProperties.stepSize !== undefined) {
      // if (this.widgetInfo.chartProperties.chartType === ChartType.BAR || (this.widgetInfo.chartProperties.chartType === ChartType.LINE && (this.isGroupByChart || this.widgetInfo.field.toLocaleLowerCase() === 'time_taken' || this.widgetInfo.chartProperties.bucketFilter || (this.widgetInfo && ((!this.widgetInfo.field || this.widgetInfo.field === '') && this.widgetInfo.groupById && this.widgetInfo.distictWith))))) {
      if (this.widgetInfo.chartProperties.chartType === ChartType.BAR || (this.widgetInfo.chartProperties.chartType === ChartType.LINE && (this.isGroupByChart || ((this.widgetInfo.field?.toLocaleLowerCase() === 'time_taken' || this.widgetInfo.chartProperties.bucketFilter) && !this.widgetInfo.isStepwiseSLA) || (this.widgetInfo.chartProperties && ((!this.widgetInfo.field || this.widgetInfo.field === '') && this.widgetInfo.groupById && this.widgetInfo.distictWith))))) {
        this.timeSeriesOption.scales = {
          ...this.timeSeriesOption.scales,
          x: {
            title: {
              display: true,
              text: this.widgetInfo.chartProperties.xAxisLabel ? this.widgetInfo.chartProperties.xAxisLabel : '',
            },
            ticks: {
              callback: (value) => {
                return this.dataSetlabel[value].length > this.labelTooltipCharLimit
                  ? this.dataSetlabel[value].slice(0, this.labelTooltipCharLimit) + '...'
                  : this.dataSetlabel[value];
              },
              padding: this.widgetInfo.chartProperties.isEnableDatalabels && (this.widgetInfo.chartProperties.datalabelsPosition === 'start' || this.widgetInfo.chartProperties.datalabelsPosition === 'center') ? 20 : 0
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
            }
          }
        };
      } else {
        this.timeSeriesOption.scales = {
          ...this.timeSeriesOption.scales,
          x: {
            type: 'time',
            time: {
              unit: this.widgetInfo.chartProperties.seriesWith !== 'week' ? this.widgetInfo.chartProperties.seriesWith : 'day',
              stepSize: this.widgetInfo.chartProperties.seriesWith !== 'week' ? 1 : 7,
              displayFormats: {
                day: this.widgetInfo.chartProperties.seriesWith === 'week' ? 'MMM DD, YYYY' : 'MMM DD'
              }
            },
            title: {
              display: true,
              text: this.widgetInfo.chartProperties.xAxisLabel ? this.widgetInfo.chartProperties.xAxisLabel : ''
            }, ticks: {
              padding: this.widgetInfo.chartProperties.isEnableDatalabels && (this.widgetInfo.chartProperties.datalabelsPosition === 'start' || this.widgetInfo.chartProperties.datalabelsPosition === 'center') ? 20 : 0
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
            }
          }
        }
      }
    } else {
      // if (this.widgetInfo.chartProperties.chartType === ChartType.BAR || (this.widgetInfo.chartProperties.chartType === ChartType.LINE && (this.isGroupByChart || (this.widgetInfo.chartProperties && ((!this.widgetInfo.field || (this.widgetInfo.field.toLocaleLowerCase() === 'time_taken' || this.widgetInfo.chartProperties.bucketFilter && !this.widgetInfo.isStepwiseSLA)|| this.widgetInfo.field === '') && this.widgetInfo.groupById && this.widgetInfo.distictWith))))) {
      if (this.widgetInfo.chartProperties.chartType === ChartType.BAR || (this.widgetInfo.chartProperties.chartType === ChartType.LINE && (this.isGroupByChart || ((this.widgetInfo.field?.toLocaleLowerCase() === 'time_taken' || this.widgetInfo.chartProperties.bucketFilter) && !this.widgetInfo.isStepwiseSLA) || (this.widgetInfo.chartProperties && ((!this.widgetInfo.field || this.widgetInfo.field === '') && this.widgetInfo.groupById && this.widgetInfo.distictWith))))) {
        this.timeSeriesOption.scales = {
          ...this.timeSeriesOption.scales,
          x: {
            title: {
              display: true,
              text: this.widgetInfo.chartProperties.xAxisLabel ? this.widgetInfo.chartProperties.xAxisLabel : ''
            }, ticks: {
              callback: (value) => {
                return this.dataSetlabel[value].length > this.labelTooltipCharLimit
                  ? this.dataSetlabel[value].slice(0, this.labelTooltipCharLimit) + '...'
                  : this.dataSetlabel[value];
              },
              padding: this.widgetInfo.chartProperties.isEnableDatalabels && (this.widgetInfo.chartProperties.datalabelsPosition === 'start' || this.widgetInfo.chartProperties.datalabelsPosition === 'center') ? 20 : 0
            }
          },
          y: {
            title: {
              display: true,
              text: this.widgetInfo.chartProperties.yAxisLabel ? this.widgetInfo.chartProperties.yAxisLabel : ''
            },
            ticks: {
              padding: this.widgetInfo.chartProperties.isEnableDatalabels && (this.widgetInfo.chartProperties.datalabelsPosition === 'start' || this.widgetInfo.chartProperties.datalabelsPosition === 'center') ? 40 : 0
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
              unit: this.widgetInfo.chartProperties.seriesWith !== 'week' ? this.widgetInfo.chartProperties.seriesWith : 'day',
              stepSize: this.widgetInfo.chartProperties.seriesWith !== 'week' ? 1 : 7,
              displayFormats: {
                day: this.widgetInfo.chartProperties.seriesWith === 'week' ? 'MMM DD, YYYY' : 'MMM DD'
              }
            },
            title: {
              display: true,
              text: this.widgetInfo.chartProperties.xAxisLabel ? this.widgetInfo.chartProperties.xAxisLabel : ''
            }, ticks: {
              padding: this.widgetInfo.chartProperties.isEnableDatalabels && (this.widgetInfo.chartProperties.datalabelsPosition === 'start' || this.widgetInfo.chartProperties.datalabelsPosition === 'center') ? 20 : 0
            }
          },
          y: {
            title: {
              display: true,
              text: this.widgetInfo.chartProperties.yAxisLabel ? this.widgetInfo.chartProperties.yAxisLabel : ''
            },
            ticks: {
              padding: this.widgetInfo.chartProperties.isEnableDatalabels && (this.widgetInfo.chartProperties.datalabelsPosition === 'start' || this.widgetInfo.chartProperties.datalabelsPosition === 'center') ? 40 : 0
              , callback(value, index, values) {
                return formatNumber(Number(value), 'en-US');
              }
            }
          }
        };
      }
    }
    if (this.chart) {
      this.chart.options.scales = this.timeSeriesOption.scales;
      if (this.chart.chart)
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
    const fieldId = this.widgetInfo.field;
    let appliedFilters = this.filterCriteria.filter(fill => fill.fieldId === fieldId);
    this.removeOldFilterCriteria(appliedFilters);
    if (appliedFilters.length > 0) {
      const res = appliedFilters.filter(fill => fill.fieldId === fieldId && fill.widgetType === WidgetType.TIMESERIES && this.widgetInfo.isEnableGlobalFilter);
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
        critera1.conditionFieldValueText = this.chartLegend[legendItem.datasetIndex] ? this.chartLegend[legendItem.datasetIndex].text : '';
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
      critera1.widgetType = WidgetType.TIMESERIES;
      critera1.fieldCtrl = this.widgetInfo.fieldCtrl;
      critera1.conditionFieldValueText = this.chartLegend[legendItem.datasetIndex] ? this.chartLegend[legendItem.datasetIndex].text : '';
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
    const filter = this.filterCriteria.filter(filt => !filt.timeSeriesDateFilter || filt.widgetId === this.widgetId);
    forkJoin([this.widgetService.getWidgetView(String(this.reportId), String(widgetId)),
    this.widgetService.getWidgetData(String(widgetId), filter, '', '', this.userDetails?.selfServiceUserModel?.timeZone, this.userDetails?.defLocs?.toString())])
      .subscribe(res => {
        this.isFetchingData = false;
        this.widgetViewDetails = res[0];
        this.responseData = res[1];
        this.updateChart(this.responseData);
      }, err => {
        this.isFetchingData = false;
        console.log('Error');
      })
  }

  private updateChart(responseData) {
    if (responseData !== null) {
      if (this.isGroupByChart) {
        this.transformForGroupBy(responseData);
      } else if (this.widgetInfo.field && this.widgetInfo.groupById && this.widgetInfo.distictWith) {
        this.dataSet = this.transformDataForComparison(responseData, true);
      } else if ((!this.widgetInfo.field || this.widgetInfo.field === '') && this.widgetInfo.groupById && this.widgetInfo.distictWith) {
        this.transformForGroupBy(responseData, true);
      } else if ((this.widgetInfo.field === 'TIME_TAKEN' || this.widgetInfo.chartProperties.bucketFilter) && !this.widgetInfo.isStepwiseSLA) {
        this.tarnsformForShowInPercentage(responseData, this.widgetInfo.chartProperties.isEnabledBarPerc);
      } else if (this.widgetInfo.field === 'TIME_TAKEN' && this.widgetInfo.isStepwiseSLA) {
        if (this.widgetInfo.chartProperties.chartType === 'LINE') {
          this.dataSet = this.transformForStepWiseData(responseData);
        }
        else {
          this.dataSet = this.transformDataForStepSizeBarChart(responseData);
        }
      } else {
        if (this.widgetInfo.chartProperties.chartType === 'BAR') {
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

      if (this.widgetViewDetails?.payload?.view === WidgetView.TABLE_VIEW) {
        this.isTableView = true;
        this.getTableData();
      }
      else {
        this.isTableView = false;
      }

      if (this.chart && !this.isTableView) {
        this.chart.data.datasets = this.dataSet ? this.dataSet : [];
        this.chart.data.labels = this.dataSetlabel;
        this.chart.update();
        if (this.chart.chart) {
          this.chart.chart.update();
        }
      }
    }
  }

  transformDataSets(data: any): any {
    const fieldId = this.widgetInfo.field;
    const finalOutput = new Object();
    const codetextObj = {};
    const cordKeys = ['x', 'y'];
    const totalCount = [];
    let aggregation = data.aggregations['date_histogram#date'] ? data.aggregations['date_histogram#date'] : data.aggregations[''];
    if(!aggregation){
      const buckets1 = data.aggregations['nested#nested_tags'] ? data.aggregations['nested#nested_tags'] : [''];
      aggregation = buckets1['date_histogram#date'] ? buckets1['date_histogram#date'].buckets ? buckets1['date_histogram#date'].buckets : [] : [];
    }
    if (aggregation.buckets !== undefined && aggregation.buckets.length > 0) {
      aggregation.buckets.forEach(singleBucket => {
        const res = Object.keys(singleBucket);
        const value = res.filter(text => {
          return text.includes('terms#term');
        })
        const timeStamp = moment(singleBucket.key_as_string, this.getDataFormat()).valueOf();
        let arrBuckets = singleBucket[value[0]] ? singleBucket[value[0]].buckets ? singleBucket[value[0]].buckets : [] : [];
        if (arrBuckets.length === 0) {
          const buckets1 = singleBucket['nested#Nest_histogram'] ? singleBucket['nested#Nest_histogram'] : [];
          const resValue = Object.keys(buckets1);
          const nestValue = resValue.filter(nestData => {
            return nestData.includes('terms#term');
          });
          arrBuckets = buckets1[nestValue[0]] ? buckets1[nestValue[0]].buckets ? buckets1[nestValue[0]].buckets : [] : [];
        }
        arrBuckets.forEach(innerBucket => {
          const docTotalCount = innerBucket.doc_count;
          let label = innerBucket.key;
          let labelCode;
          const txtvalue = Object.keys(innerBucket);
          const txtlabel = txtvalue.filter(da => {
            return da.includes('terms#textTerm');
          })
          const textTermBucket = innerBucket[txtlabel[0]] ? innerBucket[txtlabel[0]].buckets : null;
          if (textTermBucket) {
            textTermBucket.forEach(bucket => {
              labelCode = this.codeTextValue(textTermBucket[0], fieldId);
              label = labelCode.t ? labelCode.t : labelCode.c ? labelCode.c : labelCode;
              if (this.widgetInfo.fieldCtrl.picklist === '52' || this.widgetInfo.fieldCtrl.picklist === '53') {
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
            if (this.widgetInfo.chartProperties.showTotal) {
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
            if (this.widgetInfo.chartProperties.showTotal) {
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

    if (this.widgetInfo.chartProperties.showTotal) {
      let showTotal = true;
      this.filterCriteria.forEach(filter => {
        if (filter.conditionFieldValue !== 'Total') {
          if (Object.keys(finalOutput).length <= 1) {
            showTotal = false;
          }
          const index = Object.keys(finalOutput).indexOf(filter.conditionFieldValueText);
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
    const arrKeys = ['data', 'id', 'label', 'fill', 'backgroundColor', 'borderColor', 'cubicInterpolationMode', 'type'];
    let datasets = new Array();
    Object.keys(finalOutput).forEach((status, index) => {
      const dataSet = new Object();
      dataSet[arrKeys[0]] = finalOutput[status];
      dataSet[arrKeys[1]] = status;
      dataSet[arrKeys[2]] = this.checkTextCode({ text: status, code: codetextObj[status] });
      dataSet[arrKeys[3]] = false;
      dataSet[arrKeys[6]] = 'monotone';
      dataSet[arrKeys[7]] = this.chartType;
      if (status !== 'Total') {
        dataSet[arrKeys[4]] = this.getUpdatedColorCode(status);
        dataSet[arrKeys[5]] = dataSet[arrKeys[4]];
      }
      else {
        dataSet[arrKeys[4]] = '#e4e5e5'
        dataSet[arrKeys[5]] = '#e4e5e5'
      }
      const chartLegend = { text: status, code: codetextObj[status], legendIndex: this.chartLegend.length };
      this.chartLegend.push(chartLegend);
      datasets.push(dataSet);
      this.setLegendForChart();
    });
    if (this.widgetInfo.chartProperties.dataSetSize) {
      this.chartLegend = _.take(this.chartLegend, this.widgetInfo.chartProperties.dataSetSize);
      datasets = _.take(datasets, this.widgetInfo.chartProperties.dataSetSize);
    }
    console.log(datasets);
    this.chartLegend = this.filterMetadataByEmptyValues(this.chartLegend);
    return datasets;
  }

  /**
   * Transform datasets when need comparison year wise month wise...
   * @param res server res
   */
  transformDataForComparison(res: any, forDistinct?: boolean) {
    const fieldId = this.widgetInfo.field;
    let finalOutput = new Array();
    this.dataSetlabel = [];
    const tempDataSetlabel = [];
    const objData = {};
    this.chartLegend = [];
    const totalCount = {};
    let aggregation = res ? res.aggregations['date_histogram#date'] : [];
    if(!aggregation){
      const buckets1 = res.aggregations['nested#nested_tags'] ? res.aggregations['nested#nested_tags'] : [];
      aggregation = buckets1['date_histogram#date'] ? buckets1['date_histogram#date'].buckets ? buckets1['date_histogram#date'].buckets : [] : [];
    }
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
            if (this.widgetInfo.fieldCtrl.picklist === '52' || this.widgetInfo.fieldCtrl.picklist === '53') {
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
              if (this.widgetInfo.fieldCtrl.picklist === '52' || this.widgetInfo.fieldCtrl.picklist === '53') {
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
        tempDataSetlabel.forEach((key,index) => {
          if (Object.keys(dataSet).includes(key.toString())) {
            // arrcount.push(dataSet[key.toString()]);
            const obj = {};
            const objDataVal = ['x', 'y'];
            obj[objDataVal[0]] = this.checkTextCode(this.chartLegend[index]);
            obj[objDataVal[1]] = dataSet[key.toString()]
            arrcount.push(obj);
          } else {
            // arrcount.push(0);
            arrcount.push({ x: this.checkTextCode(this.chartLegend[index]), y: 0 });
          }
          if (dataSet[key]) {
            if (totalCount[key]) {
              totalCount[key].y = totalCount[key].y + +dataSet[key];
            } else {
              // totalCount[key] = dataSet[key];
              const obj = {};
              const objDataVal = ['x', 'y'];
              obj[objDataVal[0]] = this.checkTextCode(this.chartLegend[index]);
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

    const arrKeyF = ['label', 'data', 'type', 'backgroundColor', 'borderColor','barPercentage','categoryPercentage'];
    Object.keys(objData).forEach((status, index) => {
      const label = {};
      label[arrKeyF[0]] = status;
      label[arrKeyF[1]] = objData[status];
      label[arrKeyF[2]] = this.chartType;
      label[arrKeyF[3]] = this.getUpdatedColorCode(status);
      label[arrKeyF[4]] = label[arrKeyF[3]];
      // label['order'] = 1;
      finalOutput.push(label);
    });

    if (this.widgetInfo.chartProperties.dataSetSize) {
      finalOutput = _.take(finalOutput, this.widgetInfo.chartProperties.dataSetSize);
    }

    if(finalOutput.length === 1) {
      const finaldata = {...finalOutput[0]};
      finaldata[arrKeyF[5]] = 0.5;
      finaldata[arrKeyF[6]] = 0.5;
      finalOutput[0] = {...finaldata};

    }

    // this.timeSeriesOption.scales = { x: {}, y: {} };
    this.setLegendForChart(); // calling it to set legend
    if (this.widgetInfo.chartProperties.showTotal && finalOutput.length > 1) {
      if (this.widgetInfo.chartProperties.chartType === ChartType.BAR) {
        const color = '#e4e5e5';
        let barPercentage;
        if ((finalOutput.length) % 2 === 0) {
          barPercentage = 1.05 * finalOutput.length;
        } else {
          barPercentage = 1 * finalOutput.length;
        }
        const totalDataSet =
        {
          label: 'Total',
          data: [],
          borderColor: color,
          type: this.chartType,
          xAxisId: 'total-x',
          offset: true,
          barThickness: 'flex',
          barPercentage,
          categoryPercentage: 1,
        };
        Object.values(totalCount).forEach((el: number) => {
          totalDataSet.data.push(el);
        })
        if (Object.keys(totalCount).length) {
          finalOutput.splice(Math.ceil(finalOutput.length / 2), 0, totalDataSet);
        }
        // else {
        //   // finalOutput.push(totalDataSet);
        //   finalOutput.splice(0, 0, totalDataSet);
        // }
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
        // this.timeSeriesOption.scales.xAxes.push(scale);
        const totalX = 'totalX';
        this.timeSeriesOption.scales[totalX] = { ...this.timeSeriesOption.scales[totalX], ...scaleAxes };

      }
    }
    return finalOutput;
  }

  /**
   * Transform for timeseries with grp by same fields ..
   * @param res server response
   */
  transformForGroupBy(res: any, forDistinct?: boolean) {
    let aggregation = res ? res.aggregations['date_histogram#date'] : [];
    if(!aggregation){
      const buckets1 = res.aggregations['nested#nested_tags'] ? res.aggregations['nested#nested_tags'] : [];
      aggregation = buckets1['date_histogram#date'] ? buckets1['date_histogram#date'].buckets ? buckets1['date_histogram#date'].buckets : [] : [];
    }
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
              // totalCount[ind] = data;
              const objValue = ['x', 'y'];
              objData[objValue[0]] = data.x;
              objData[objValue[1]] = data.y;
              totalCount[ind] = objData;
            }
          })
          // this.totalCount = totalCount;
          if (yearDoc[yr]) {
            const colorCode = this.getUpdatedColorCode(yr);
            finaldata.push({
              data: dataSet,
              label: `${yr}`,
              fill: false,
              type: this.chartType,
              backgroundColor: colorCode,
              borderColor: colorCode,
              cubicInterpolationMode: 'monotone',
              id: `${yr}`
            });
          }
        });

        if (finaldata.length === 1) {
          const keys = ['barPercentage', 'categoryPercentage']
          const finalOutput = { ...finaldata[0] };
          finalOutput[keys[0]] = 0.5;
          finalOutput[keys[1]] = 0.5;
          finaldata[0] = { ...finalOutput };

        }
      }

      // this.timeSeriesOption.scales = { xAxes: [{}], yAxes: [{}] };
      this.setLegendForChart(); // calling it to set legend
      const color = '#e4e5e5';
      let barPercentage;
      if (finaldata.length > 1 && (finaldata.length) % 2 === 0) {
        barPercentage = 1.05 * finaldata.length;
      } else if (finaldata.length > 1 && finaldata.length % 2 !== 0) {
        barPercentage = 1 * finaldata.length;
      }
      let totalDataSet: any =
      {
        label: 'Total',
        data: [],
        fill: false,
        type: this.chartType,
        xAxisId: 'total-x',
        borderColor: color,
        cubicInterpolationMode: 'monotone',
        id: 'Total'
      };
      if (this.widgetInfo.chartProperties.showTotal && finaldata.length > 1) {
        if (this.widgetInfo.chartProperties.chartType === ChartType.BAR) {
          totalDataSet = {
            ...totalDataSet,
            barThickness: 'flex',
            barPercentage,
            categoryPercentage: 1,
            stack: 'a',
          }
          const scaleAxes: any = {
            id: 'total-x',
            type: 'category',
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
        if (Object.keys(totalCount).length && this.chartType === 'bar') {
          if (finaldata.length > 1)
            finaldata.splice(Math.ceil(finaldata.length / 2), 0, totalDataSet);
        }
        else {
          finaldata.push(totalDataSet);
        }
        // }
      }
      this.dataSet = finaldata;
    }
  }


  tarnsformForShowInPercentage(res: any, showInPercentage: boolean) {
    let aggregation = res ? res.aggregations['date_histogram#date'] : [];
    if (!aggregation) {
      const buckets1 = res.aggregations['nested#nested_tags'] ? res.aggregations['nested#nested_tags'] : [];
      aggregation = buckets1['date_histogram#date'] ? buckets1['date_histogram#date'].buckets ? buckets1['date_histogram#date'].buckets : [] : [];
    }
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
          const newDataSet = JSON.parse(JSON.stringify(dataSet));
          newDataSet.forEach((data, index) => {
            if (totalCount[index]) {
              if (data.y !== undefined) {
                totalCount[index].y = totalCount[index].y + data.y;
              }
            } else {
              totalCount[index] = data;
            }
          })
          if (yearDoc[yr]) {
            const color = this.getUpdatedColorCode(yr);
            finaldata.push({
              data: dataSet,
              label: `${yr}`,
              fill: false,
              backgroundColor: color,
              borderColor: color,
              type: this.chartType,
              cubicInterpolationMode: 'monotone',
              id: `${yr}`
            });
          }
        });
      }

      if (finaldata.length === 1) {
        const keys = ['barPercentage', 'categoryPercentage']
        const finalOutput = { ...finaldata[0] };
        finalOutput[keys[0]] = 0.5;
        finalOutput[keys[1]] = 0.5;
        finaldata[0] = { ...finalOutput };
      }

      // this.timeSeriesOption.scales = { xAxes: [{}], yAxes: [{}] };
      this.setLegendForChart(); // calling it to set legend
      let totalDataSet: any =
      {
        label: 'Total',
        data: [],
        fill: false,
        xAxisId: 'total-x',
        type: this.chartType,
        cubicInterpolationMode: 'monotone',
        borderColor: '#e4e5e5',
        id: 'Total'
      };
      if (this.widgetInfo.chartProperties.showTotal && finaldata.length > 1) {
        this.chartLegend.push({ code: 'Total', text: 'Total', legendIndex: this.chartLegend.length });
        if (this.widgetInfo.chartProperties.chartType === ChartType.BAR) {
          let barPercentage;
          if (finaldata.length % 2 === 0) {
            barPercentage = 1.05 * finaldata.length;
          } else {
            barPercentage = 1 * finaldata.length;
          }
          totalDataSet = {
            ...totalDataSet,
            barThickness: 'flex',
            barPercentage,
            categoryPercentage: 1,
            stack: 'a',
          }
          const scaleAxes = {
            id: 'total-x',
          }
          const totalX = 'totalX';
          this.timeSeriesOption.scales[totalX] = { ...this.timeSeriesOption.scales[totalX], ...scaleAxes };
          if (this.timeSeriesOption.scales.x.grid) {
            this.timeSeriesOption.scales.x.grid.display = true;
          }
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
            if (this.chartType === 'bar')
              finaldata.splice(Math.floor(finaldata.length / 2), 0, totalDataSet);
            else {
              finaldata.push(totalDataSet);
            }
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
        let value = res.filter(text => {
          return text.includes('terms#within_1_day')
        })
        if (!value?.length) {
          value = res.filter(text => {
            {
              return text.includes('terms#more_then_1_day')
            }
          })
        }
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
        else {
          finalData.push({ x: mon, y: 0 });
        }
      } else {
        finalData.push({ x: mon, y: 0 });
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
      // finalData.push(hasdata ? (forDistinct ? (hasdata['cardinality#count'] ? hasdata['cardinality#count'].value : 0) : hasdata.doc_count) : 0)
      const objData = {};
      const keys = ['x','y'];
      objData[keys[0]] = mon;
      objData[keys[1]] = hasdata ? (forDistinct ? (hasdata['cardinality#count'] ? hasdata['cardinality#count'].value : 0) : hasdata.doc_count) : 0;
      finalData.push(objData);
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
      const groupwith = this.widgetInfo.groupById;
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
    req.widgetDesc = this.widgetInfo.widgetTitle;
    req.colorPalettes = [];
    this.chartLegend.forEach(legend => {
      req.colorPalettes.push({
        code: legend.code,
        colorCode: this.widgetInfo.widgetColorPalette[0] ? this.widgetInfo.widgetColorPalette[0].backgroundColor[legend.legendIndex] : this.getRandomColor(),
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

    const index = this.dataSet.findIndex(item=> item.label === 'Total');
    if(index > -1 && index < this.dataSet.length-1) {
      const column1 = this.dataSet.splice(index,1)[0];
      this.dataSet.push(column1);
    }

    this.dataSet.forEach((dataArr) => {
      const key = 'id'
      if (dataArr[key]) {
        column = this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.fieldCtrl.fieldId;
        dataArr.data.forEach((dataObj, dIndex) => {
          const obj = {} as any;
          const axis = 'x';
          obj[this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.fieldCtrl.fieldId] = this.chartType === 'bar' ? dataObj[axis] : dataArr.label;
          this.dateAndCountFormat(dataObj, obj, dataArr);
          excelData.push(obj);
        })
      }
      else {
        dataArr.data.forEach((dataObj, dataIndex) => {
          const obj = {} as any;
          // In case of field ID is there..
          if (this.widgetInfo.fieldCtrl.fieldId) {
            column = this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.fieldCtrl.fieldId;
            if (this.widgetInfo.fieldCtrl.fieldId.toLowerCase() === 'time_taken' && this.widgetInfo.isStepwiseSLA) {
              obj[this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.fieldCtrl.fieldId] = this.chartLegend.length > 0 ? this.chartLegend[dataIndex] : '';
            } else
              obj[this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.fieldCtrl.fieldId] = this.chartLegend.length > 0 ? this.checkTextCode(this.chartLegend[dataIndex]) : '';
            if (!this.displayedColumnsId.includes(this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.fieldCtrl.fieldId)) {
              this.displayedColumnsId.push(this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.fieldCtrl.fieldId);
            }
          }
          // In case of field ID is blank - groupWith and DistinctWith are there..
          else {
            column = this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.fieldCtrl.fieldId;
            obj[this.widgetInfo.distictWith] = this.chartLegend.length > 0 ? this.checkTextCode(this.chartLegend[dataIndex]) : '';
          }
          this.dateAndCountFormat(dataObj, obj, dataArr);
          excelData.push(obj);
        })
      }
    })

    const timeSeries = this.widgetInfo.chartProperties.seriesWith.charAt(0).toUpperCase() + this.widgetInfo.chartProperties.seriesWith.slice(1);
    excelData.forEach(item => {
      const itemObj = {};
      const index1 = tableData.findIndex(tab => tab[column] === item[column]);
      if (index1 > -1) {
        itemObj[item[timeSeries]] = item.Count;
        tableData[index1] = { ...tableData[index1], ...itemObj };
      }
      else {
        itemObj[column] = item[column];
        itemObj[item[timeSeries]] = item.Count;
        tableData.push(itemObj);
      }
    })
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
    const fieldId = this.widgetInfo.groupById;
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

        const fieldId = this.widgetInfo.field;
        let appliedFilters = this.filterCriteria.filter(fill => fill.fieldId === fieldId);
        this.removeOldFilterCriteria(appliedFilters);
        if (appliedFilters.length > 0) {
          const res = appliedFilters.filter(fill => fill.fieldId === fieldId && fill.widgetType === WidgetType.TIMESERIES && this.widgetInfo.isEnableGlobalFilter);
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
            critera1.fieldCtrl = this.widgetInfo.fieldCtrl;
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
          critera1.fieldCtrl = this.widgetInfo.fieldCtrl;
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
    if (this.widgetInfo.chartProperties.isEnableLegend) {
      this.timeSeriesOption.plugins.legend = {
        ...this.timeSeriesOption.plugins.legend,
        display: true,
        position: this.widgetInfo.chartProperties.legendPosition || 'top',
      };
    } else {
      this.timeSeriesOption.plugins.legend = {
        ...this.timeSeriesOption.plugins.legend,
        display: false
      }
    }

    if (this.chart) {
      this.chart.options.plugins.legend = this.timeSeriesOption.plugins.legend;
      if (this.chart.chart)
        this.chart.chart.options.plugins.legend = this.timeSeriesOption.plugins.legend;
    }

    if (this.widgetInfo.chartProperties.isEnableDatalabels) {
      this.timeSeriesOption.plugins.datalabels = {
        ...this.timeSeriesOption.plugins.datalabels,
        align: this.widgetInfo.chartProperties.datalabelsPosition || 'end',
        anchor: this.widgetInfo.chartProperties.datalabelsPosition || 'end',
        display: 'auto',
        formatter: ((value: any, context: Context) => {
          return formatNumber(Number(value ? value.y || value.y === 0 ? value.y : value : value), 'en-US');
        })
      };
    } else {
      this.timeSeriesOption.plugins.datalabels = {
        ...this.timeSeriesOption.plugins.datalabels,
        display:false
      }
    }

    if (this.chart) {
      this.chart.options.plugins.datalabels = this.timeSeriesOption.plugins.datalabels;
      if (this.chart.chart)
        this.chart.chart.options.plugins.datalabels = this.timeSeriesOption.plugins.datalabels;
    }

    if(this.widgetInfo.chartProperties.isEnableBenchMark) {
      const annotation1 = {
        type: 'line',
        scaleID: 'y',
        borderWidth: 1,
        borderColor: 'black',
        value: this.widgetInfo.chartProperties.benchMarkValue,
        label: {
          enabled: false
        },
      } as any;
      this.timeSeriesOption.plugins.annotation = {annotations : [annotation1]};
    } else {
      this.timeSeriesOption.plugins.annotation = {annotations : []};
    }

    if(this.chart) {
      this.chart.options.plugins.annotation = this.timeSeriesOption.plugins.annotation;
      this.chart.chart.options.plugins.annotation = this.timeSeriesOption.plugins.annotation;
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
    const hasBtn = this.dateFilters.filter(fil => fil.value === (this.widgetInfo.chartProperties.timeseriesStartDate))[0];
    if (hasBtn) {
      const index = this.dateFilters.indexOf(hasBtn);
      this.dateFilters.splice(index, 1);
      hasBtn.isActive = true;
      this.dateFilters.splice(index, 0, hasBtn);
      if (!this.widgetInfo.distictWith) {
        this.updateForm('date', hasBtn);
      }
    }
  }

  codeTextValue(innerBucket: any, fieldId: string, key: string = 'top_hits#data_hits'): any {
    let labelValue = '';
    const hits = innerBucket[key] ? innerBucket[key].hits.hits[0] : null;
    const val = hits ? hits._source.hdvs ? (hits._source.hdvs[fieldId] ?
      (hits._source.hdvs[fieldId] ? hits._source.hdvs[fieldId].vc : null) : null) :
      (hits._source.staticFields && hits._source.staticFields[fieldId]) ?
        (hits._source.staticFields[fieldId] ? hits._source.staticFields[fieldId].vc : null) :
        ( hits._source[fieldId] ? hits._source[fieldId].vc : null) : null;
    if (val) {
      if (fieldId === 'OVERDUE' || fieldId === 'FORWARDENABLED' || fieldId === 'TIME_TAKEN' || this.widgetInfo.fieldCtrl.picklist === '35') {
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
          const resCodeText = (value.code && value.text) ? (`${value.code} -- ${value.text}`) : (value.code || value.text) ? (value.code ? `${value.code} -- ${value.code}` : `${value.text} -- ${value.text}`) : '';
          return resCodeText;
      }
    }
    return '';
  }

  dateAndCountFormat(objData, obj, dataArr) {
    switch (this.widgetInfo.chartProperties.seriesWith) {
      case SeriesWith.day:
        if (this.chartType === 'line')
          obj.Day = typeof objData.x === 'string' ? objData.x + '\t' : moment(objData.x).format('DD-MMM-YYYY') + '\t';
        else {
          obj.Day = dataArr.label + '\t';
        }
        break;
      case SeriesWith.week:
        if (this.chartType === 'line') {
          obj.Week = typeof objData.x === 'string' ? objData.x : moment(objData.x).format('DD-MMM-YYYY') + '\t';
        } else {
          obj.Week = dataArr.label + '\t';
        }
        break;
      case SeriesWith.month:
        if (this.chartType === 'line') {
          obj.Month = typeof objData.x === 'string' ? objData.x : moment(objData.x).format('DD-MMM-YYYY') + '\t';
        }
        else obj.Month = dataArr.label + '\t';
        break;
      case SeriesWith.quarter:
        if (this.chartType === 'line') {
          obj.Quarter = typeof objData.x === 'string' ? objData.x : moment(objData.x).format('DD-MMM-YYYY') + '\t';
        } else {
          obj.Quarter = dataArr.label + '\t';
        }
        break;
      case SeriesWith.year:
        if (this.chartType === 'line') {
          obj.Year = typeof objData.x === 'string' ? objData.x : moment(objData.x).format('DD-MMM-YYYY') + '\t';
        } else {
          obj.Year = dataArr.label + '\t';
        }
        break;

      default:
        break;
    }
    obj.Count = objData.y || objData.y === 0 ? formatNumber(objData.y, 'en-US') + '\t' : formatNumber(objData, 'en-US') + '\t'
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
    if (!this.widgetViewDetails?.payload || this.widgetViewDetails?.payload?.uuid === '') {
      this.widgetService.saveWidgetView(widgetViewRequest).subscribe(res => {
        this.getwidgetData(this.widgetId);
      }, err => {
        console.log('Error')
      });
    }
    else {
      widgetViewRequest.uuid = this.widgetViewDetails?.payload?.uuid;
      this.widgetService.updateWidgetView(widgetViewRequest).subscribe(res => {
        this.getwidgetData(this.widgetId);
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
    this.displayedColumnsId = [];
    this.dataSet.forEach((dataArr) => {
      const key = 'id'
      if (dataArr[key]) {
        dataArr.data.forEach((dataObj, dIndex) => {
          const obj = {} as any;
          const axis = 'x';
          obj[this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.fieldCtrl.fieldId] = this.chartType === 'bar' ? dataObj[axis] : dataArr.label;
          this.dateAndCountFormat(dataObj, obj, dataArr);
          if (!this.displayedColumnsId.includes(this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.fieldCtrl.fieldId)) {
            this.displayedColumnsId.push(this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.fieldCtrl.fieldId);
          }
          excelData.push(obj);
        })
      }
      else {
        dataArr.data.forEach((dataObj, dataIndex) => {
          const obj = {} as any;
          // In case of field ID is there..
          if (this.widgetInfo.fieldCtrl.fieldId) {
            if (this.widgetInfo.fieldCtrl.fieldId.toLowerCase() === 'time_taken' && this.widgetInfo.isStepwiseSLA) {
              obj[this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.fieldCtrl.fieldId] = this.chartLegend.length > 0 ? this.chartLegend[dataIndex] : '';
            } else
              obj[this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.fieldCtrl.fieldId] = this.chartLegend.length > 0 ? this.checkTextCode(this.chartLegend[dataIndex]) : '';
            if (!this.displayedColumnsId.includes(this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.fieldCtrl.fieldId)) {
              this.displayedColumnsId.push(this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.fieldCtrl.fieldId);
            }
          }
          // In case of field ID is blank - groupWith and DistinctWith are there..
          else {
            obj[this.widgetInfo.distictWith] = this.chartLegend.length > 0 ? this.checkTextCode(this.chartLegend[dataIndex]) : '';
            if (!this.displayedColumnsId.includes(this.widgetInfo.distictWith)) {
              this.displayedColumnsId.push(this.widgetInfo.distictWith);
            }
          }
          this.dateAndCountFormat(dataObj, obj, dataArr);
          excelData.push(obj);
        })
      }
    })

    const column = this.displayedColumnsId[0];
    const timeSeries = this.widgetInfo.chartProperties.seriesWith.charAt(0).toUpperCase() + this.widgetInfo.chartProperties.seriesWith.slice(1);
    excelData.forEach(item => {
      const itemObj = {};
      const index1 = tableData.findIndex(tab => tab[column] === item[column]);
      if (index1 > -1) {
        itemObj[item[timeSeries]] = item.Count;
        tableData[index1] = { ...tableData[index1], ...itemObj };
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
    const sortedColumn = this.displayedColumnsId.splice(1,this.displayedColumnsId.length-1)
                           .sort((a,b) => Number(new Date(b)) - Number(new Date(a)))
    sortedColumn.map(item => this.displayedColumnsId.push(item));

    const index = this.displayedColumnsId.findIndex(item=> item === 'Total\t');
    if(index > -1 && index < this.displayedColumnsId.length-1) {
      const column1 = this.displayedColumnsId.splice(index,1)[0];
      this.displayedColumnsId.push(column1);
    }
    this.tableDataSource = tableData;
  }

  /**
   * transformData for stepwise line chart
   */
  transformForStepWiseData(data: any) {
    const finalOutput = new Object();
    const codetextObj = {};
    const cordKeys = ['x', 'y'];
    this.dataSetlabel = [];
    const totalCount = [];
    const aggregation = data.aggregations['date_histogram#date'] ? data.aggregations['date_histogram#date'] : data.aggregations[''];
    if (aggregation.buckets !== undefined && aggregation.buckets.length > 0) {
      aggregation.buckets.forEach((singleBucket) => {
        const res = Object.keys(singleBucket);
        const value = res.filter((text) => {
          return text.includes('terms#sla_step_wise');
        });
        const timeStamp = moment(singleBucket.key_as_string, 'YYYY-MMM-DD').valueOf();
        const arrBuckets = singleBucket[value[0]] ? (singleBucket[value[0]].buckets ? singleBucket[value[0]].buckets : []) : [];
        if (arrBuckets.length) {
          const keys = Object.keys(arrBuckets[0]).filter((text) => text.includes('terms#steps'));
          const slaBuckets = arrBuckets[0][keys[0]]
            ? arrBuckets[0][keys[0]].buckets
            : [];
          slaBuckets.forEach(slaBucket => {
            const slaKey = Object.keys(slaBucket).filter((slaData) => {
              return slaData.includes('#within_1_day') || slaData.includes('#more_then_1_day');
            });
            const stepBuckets = slaBucket[slaKey[0]] ? (slaBucket[slaKey[0]].buckets ? slaBucket[slaKey[0]].buckets : []) : [];
            stepBuckets.forEach((innerBucket) => {
              const docTotalCount = innerBucket.doc_count;
              let label = slaBucket.key;
              let labelCode;
              const txtvalue = Object.keys(innerBucket);
              const txtlabel = txtvalue.filter((da) => {
                return da.includes('terms#textTerm');
              });
              const textTermBucket = innerBucket[txtlabel[0]] ? innerBucket[txtlabel[0]].buckets : null;
              if (textTermBucket) {
                textTermBucket.forEach((bucket) => {
                  labelCode = this.codeTextValue(bucket, 'STEP', 'top_hits#items');
                  label = labelCode.t ? labelCode.t : labelCode.c ? labelCode.c : labelCode;
                });
              }
              codetextObj[label] = labelCode && labelCode.c ? labelCode.c : innerBucket.key;
              if (Object.keys(finalOutput).includes(label)) {
                const array = finalOutput[label];
                const objdt = new Object();
                objdt[cordKeys[0]] = timeStamp;
                objdt[cordKeys[1]] = docTotalCount;
                array.push(objdt);
                if (this.widgetInfo.chartProperties.showTotal) {
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
                if (this.widgetInfo.chartProperties.showTotal) {
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
      });

      if (this.widgetInfo.chartProperties.showTotal) {
        let showTotal = true;
        this.filterCriteria.forEach(filter => {
          if (filter.conditionFieldValue !== 'Total') {
            const index = Object.keys(finalOutput).indexOf(filter.conditionFieldValueText);
            if (index > -1) {
              showTotal = false;
            }
          }
        });

        if (Object.keys(finalOutput).length <= 1) {
          showTotal = false;
        }
        const total = 'Total'
        if (showTotal) {
          codetextObj[total] = 'Total';
          finalOutput[total] = totalCount;
        } else {
          delete codetextObj[total];
          delete finalOutput[total];
        }
      }
      const finalDataSet = this.formatSLAData(finalOutput);
      this.chartLegend = [];
      const arrKeys = ['data', 'id', 'label', 'fill', 'backgroundColor', 'borderColor', 'type', 'cubicInterpolationMode'];
      let datasets = new Array();
      Object.keys(finalDataSet).forEach((status, index) => {
        const dataSet = new Object();
        dataSet[arrKeys[0]] = finalDataSet[status];
        dataSet[arrKeys[1]] = status;
        dataSet[arrKeys[2]] = this.checkTextCode({ text: status, code: codetextObj[status] });
        dataSet[arrKeys[3]] = false;
        dataSet[arrKeys[6]] = this.chartType;
        dataSet[arrKeys[7]] = 'monotone';
        if (status !== 'Total') {
          dataSet[arrKeys[4]] = this.getUpdatedColorCode(status);
          dataSet[arrKeys[5]] = dataSet[arrKeys[4]];
        } else {
          dataSet[arrKeys[4]] = '#e4e5e5';
          dataSet[arrKeys[5]] = '#e4e5e5';
        }
        // const chartLegend = { text: status, code: codetextObj[status], legendIndex: this.chartLegend.length };
        // this.chartLegend.push(chartLegend);
        datasets.push(dataSet);
      });
      this.setLegendForChart();
      if (this.widgetInfo.chartProperties.dataSetSize) {
        this.chartLegend = _.take(this.chartLegend, this.widgetInfo.chartProperties.dataSetSize);
        datasets = _.take(datasets, this.widgetInfo.chartProperties.dataSetSize);
      }
      console.log(datasets, 'dataset');
      return datasets;
    }
  }

  /**
   * returns the formated data for sla chart
   * @param data array of data for time series
   */
  formatSLAData(data: any) {
    let labels = [];
    const keys = Object.keys(data);
    keys.forEach(key => {
      const label = data[key].map(item => item.x);
      labels.push(...label);
    })
    labels = Array.from(new Set(labels));
    keys.forEach(key => {
      if (data[key].length < labels.length) {
        labels.forEach((item, index) => {
          const isExist = data[key].find(el => el.x === item);
          if (!isExist) {
            const obj = { x: item, y: 0 }
            const array = [...data[key]]
            array.splice(index, 0, obj);
            data[key] = [...array]
          }
        })
      }
    })

    return data;
  }

  /**
   * Transform datasets for stepwise bar chart
   * @param res server res
   */
  transformDataForStepSizeBarChart(res: any) {
    let finalOutput = new Array();
    this.dataSetlabel = [];
    const objData = {};
    this.chartLegend = [];
    const totalCount = {};
    const aggregation = res ? res.aggregations['date_histogram#date'] : [];
    if (aggregation.buckets !== undefined && aggregation.buckets.length > 0) {
      aggregation.buckets.forEach(singleBucket => {
        let milliVal;
        const resValue = Object.keys(singleBucket);
        const value = resValue.filter(data => {
          return data.includes('terms#sla_step_wise');
        })
        const arrBuckets = singleBucket[value[0]] ? singleBucket[value[0]].buckets ? singleBucket[value[0]].buckets : [] : [];
        if (arrBuckets.length) {
          const key = Object.keys(arrBuckets[0]).filter(data => {
            return data.includes('terms#steps');
          })
          const slaBuckets = arrBuckets[0][key[0]] ? arrBuckets[0][key[0]].buckets ? arrBuckets[0][key[0]].buckets[0] ? arrBuckets[0][key[0]].buckets[0] : [] : [] : [];
          slaBuckets.forEach(slaBucket => {
          const slaKey = Object.keys(slaBucket).filter(data => {
            return data.includes('#within_1_day') || data.includes('#more_then_1_day');
          })
          const stepSizeBucket = slaBucket[slaKey[0]] ? slaBucket[slaKey[0]].buckets ? slaBucket[slaKey[0]].buckets : [] : [];
          stepSizeBucket.forEach((innerBucket: any) => {
            let array;
            let label;
            let codeValue;
            const labelCode = label = this.codeTextValue(slaBucket, 'STEP', 'top_hits#items');
            label = labelCode.t ? labelCode.t : labelCode.c ? labelCode.c : labelCode;
            codeValue = labelCode.c ? labelCode.c : labelCode;
            const labelText = { text: label, code: codeValue };
            milliVal = this.checkTextCode(labelText);
            this.chartLegend.push(singleBucket.key_as_string);
            const objDataValue = {};
            const keys = ['x', 'y'];
            if (objData[milliVal]) {
              array = [...objData[milliVal]];
              if (innerBucket.doc_count) {
                objDataValue[keys[0]] = singleBucket.key_as_string;
                objDataValue[keys[1]] = innerBucket.doc_count
                array.push({ ...objDataValue });
              }
              else {
                array.push({ x: singleBucket.key_as_string, y: 0 });
              }
            } else {
              array = new Array();
              if (innerBucket.doc_count) {
                objDataValue[keys[0]] = singleBucket.key_as_string;
                objDataValue[keys[1]] = innerBucket.doc_count
                array.push({ ...objDataValue });
              } else {
                array.push({ x: singleBucket.key_as_string, y: 0 });
              }
            }
            objData[milliVal] = array;
            // this.dataSetlabel.push(milliVal);
          });
        });
        }
      })
      this.dataSetlabel.forEach((label, index) => {
        Object.keys(objData).forEach((val, ind) => {
          if (totalCount[index]) {
            totalCount[index].y += objData[val][index].y;
          } else {
            totalCount[index] = objData[val][index];
          }
        })
      })
      const arrKeyF = ['label', 'data', 'fill', 'backgroundColor', 'borderColor', 'type','barPercentage','categoryPercentage'];
      Object.keys(objData).forEach((status, index) => {
        const colorCode = this.getUpdatedColorCode(status);
        const label = {};
        label[arrKeyF[0]] = status;
        label[arrKeyF[1]] = objData[status];
        label[arrKeyF[2]] = colorCode;
        label[arrKeyF[3]] = colorCode;
        label[arrKeyF[4]] = colorCode;
        label[arrKeyF[5]] = this.chartType;
        finalOutput.push(label);
      });

      if (finalOutput.length === 1) {
        const label = { ...finalOutput[0] };
        label[arrKeyF[6]] = 0.5;
        label[arrKeyF[7]] = 0.5;
        finalOutput[0] = label;
      }

      if (this.widgetInfo.chartProperties.dataSetSize) {
        finalOutput = _.take(finalOutput, this.widgetInfo.chartProperties.dataSetSize);
      }
    }
    this.setLegendForChart(); // calling it to set legend
    // no need to show total when total number of legend is less than or equal to 1
    if (this.widgetInfo.chartProperties.showTotal && finalOutput.length > 1) {
      if (this.widgetInfo.chartProperties.chartType === ChartType.BAR) {
        const color = '#e4e5e5';
        let barPercentage;
        if (finalOutput.length % 2 === 0) {
          barPercentage = 1.05 * finalOutput.length;
        } else {
          barPercentage = 1 * finalOutput.length;
        }
        const totalDataSet: any =
        {
          label: this.checkTextCode({ code: 'Total', text: 'Total' }),
          data: [],
          borderColor: color,
          type: this.chartType,
          xAxisId: 'total-x',
          offset: false,
          barThickness: 'flex',
          barPercentage,
          categoryPercentage: 1,
        };
        Object.values(totalCount).forEach((el: number) => {
          totalDataSet.data.push(el);
        })
        if (Object.keys(totalCount).length) {
          finalOutput.splice(Math.ceil(finalOutput.length / 2), 0, totalDataSet);
          // else {
          //   finalOutput.splice(0, 0, totalDataSet);
          // }
        }
        // else {
        //   finalOutput.push(totalDataSet);
        // }
        const scaleAxes: any = {
          id: 'total-x',
        }
        const totalX = 'totalX';
        this.timeSeriesOption.scales[totalX] = { ...this.timeSeriesOption.scales[totalX], ...scaleAxes };
      }
    }
    return finalOutput;
  }

  /**
   * Method call to get the date format
   */
   public getDataFormat() {
      switch (this.widgetInfo?.chartProperties?.seriesFormat?.toLowerCase()) {
        case 'mmm-dd-yy':
          return 'MMM-DD-YY';

      case 'dd-mmm-yy':
        return 'DD-MMM-YY';

        case 'dd mmm, yy':
          return 'DD MMM, YY';

      case 'mmm dd, yy':
        return 'MMM DD, YY';

      default:
        break;
    }
  }

  /**
   * Disable hover over for 'View as' option in menu
   */
  menuOpened() {
    this.viewasItem._handleMouseEnter = () => {};
  }
}