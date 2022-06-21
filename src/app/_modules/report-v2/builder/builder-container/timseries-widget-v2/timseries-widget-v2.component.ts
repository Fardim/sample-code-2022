import { Component, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Userdetails } from '@models/userdetails';
import {
  ButtonArr,
  ChartLegend,
  ChartType,
  Criteria,
  DisplayCriteria,
  WidgetColorPalette,
  WidgetViewDetails,
  ConditionOperator,
  WidgetType,
  SeriesWith,
  WidgetView,
  WidgetViewRequestPayload,
} from '@modules/report-v2/_models/widget';
import { ChartDataset, ChartEvent, ChartOptions, LegendItem, TooltipItem } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { BehaviorSubject, forkJoin, Subscription } from 'rxjs';
import * as momentAdapter from 'chartjs-adapter-moment';
import { Context } from 'chartjs-plugin-datalabels/types/context';
import { GenericWidgetComponent } from '../../generic-widget/generic-widget.component';
import { ChartType as CType } from 'chart.js';
import { MatDialog } from '@angular/material/dialog';
import { isEqual } from 'lodash';
import { BlockType } from '@modules/admin/_components/module/business-rules/user-defined-rule/udr-cdktree.service';
import { WidgetService } from '@services/widgets/widget.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '@services/user/userservice.service';
import * as moment from 'moment';
import { distinctUntilChanged } from 'rxjs/operators';
import { formatNumber } from '@angular/common';
import _ from 'lodash';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';

const btnArray: ButtonArr[] = [
  { id: 0, value: 'millisecond', isActive: false },
  { id: 1, value: '7', isActive: false },
  { id: 2, value: '10', isActive: false },
  { id: 3, value: '20', isActive: false },
  { id: 4, value: '30', isActive: false },
];

@Component({
  selector: 'pros-timseries-widget-v2',
  templateUrl: './timseries-widget-v2.component.html',
  styleUrls: ['./timseries-widget-v2.component.scss'],
})
export class TimseriesWidgetV2Component extends GenericWidgetComponent implements OnInit, OnChanges, OnDestroy {
  chartType: CType;
  responseData: any;
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
    layout: {
      padding: {
          right: 20,
          top: 15
      }
    },
    interaction: {
      mode: 'nearest',
      intersect: false,
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
            day: 'DD',
          },
        },
        adapters: {
          date: {
            locale: momentAdapter,
          },
        },
        title: {
          display: false,
          text: '',
        },
        ticks: {
          maxRotation: 0,
          showLabelBackdrop: false,
          font: {
            size: 12,
          },
        },
        grid: {
          display: true,
          offset: false,
        },
        stacked: true,
      },
      y: {
        title: {
          display: false,
          text: '',
        },
        ticks: {
          maxRotation: 0,
          font: {
            size: 12,
          },
        },
        grid: {
          display: true,
        },
        beginAtZero: true,
        stacked: false,
      },
      totalX: {
        type: 'category',
        title: {
          display: false,
          text: '',
        },
        ticks: {
          maxRotation: 0,
          showLabelBackdrop: false,
          font: {
            size: 12,
          },
        },
        grid: {
          display: false,
        },
        display: false,
        axis: 'x',
        stacked: true,
      },
    },
    plugins: {
      datalabels: {
        display: false,
        clip: true, // This property hides lables going beyond chart area
        formatter: (value: any, context: Context) => {
          return value.y;
        },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: TooltipItem<any>) => {
            let label = tooltipItem.dataset.label;
            label = label + ':' + tooltipItem.formattedValue;
            return tooltipItem.label !== 'undefined' ? label : '';
          },
        },
        displayColors: true,
      },
      legend: {
        display: false,
        onClick: (event: ChartEvent, legendItem: LegendItem) => {
          if (this.widgetInfo.chartProperties.chartType !== ChartType.BAR && this.widgetInfo.field !== '') {
            this.legendClick(legendItem);
          }
        },
      },
    },
    onClick: (event?: ChartEvent, activeElements?: Array<{}>) => {
      console.log('No filter will be applied while we click on bar/line/dots/datalabels.');
      // this.stackClickFilter(event, activeElements);
    },
  };

  /**
   * When reset filter from main container value should be true
   */
  @Input()
  hasFilterCriteria: boolean;

  isLoading = true;

  subscriptions: Subscription = new Subscription();

  userDetails: Userdetails = new Userdetails();
  // totalCount: any;

  labelTooltipCharLimit = 15;

  periodOptions = [
    {
      key: 'Day',
      value: $localize`:@@day:day`
    },
    {
      key: 'Week',
      value: $localize`:@@week:week`
    },
    {
      key: 'Month',
      value: $localize`:@@month:month`
    },
    {
      key: 'Quarter',
      value: $localize`:@@quarter:quarter`
    },
    {
      key: 'Year',
      value: $localize`:@@year:year`
    }
  ];
  selectedPeriodOption = null;
  activeDateFormat = null;

  constructor(
    public matDialog: MatDialog,
    private widgetService: WidgetService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private sharedService: SharedServiceService
  ) {
    super(matDialog);
  }

  ngOnInit(): void {
    if (this.widgetInfo.widgetAdditionalProperties && this.widgetInfo.widgetAdditionalProperties.displayCriteria) {
      this.displayCriteriaOption = this.widgetInfo.widgetAdditionalProperties.displayCriteria;
    }
    this.formGroup = this.fb.group({
      date: new FormControl(''),
    });

    const startDateCtrl = this.startDateCtrl.valueChanges.subscribe((data) => {
      this.emitDateChangeValues();
    });
    this.subscriptions.add(startDateCtrl);

    const endDateCtrl = this.endDateCtrl.valueChanges.subscribe((data) => {
      this.emitDateChangeValues();
    });
    this.subscriptions.add(endDateCtrl);

    this.chartType = this.widgetInfo.chartProperties.chartType === ChartType.LINE ? 'line' : 'bar';
    if (this.widgetInfo.field === this.widgetInfo.groupById) {
      this.isGroupByChart = true;
    } else {
      this.isGroupByChart = false;
    }

    // after color defined update on widget
    const afterColorDefined = this.afterColorDefined.subscribe((res) => {
      if (res) {
        this.updateColorBasedOnDefined(res);
      }
    });
    this.subscriptions.add(afterColorDefined);

    const getUserDetails = this.userService
      .getUserDetails()
      .pipe(distinctUntilChanged())
      .subscribe(
        (res) => {
          if (!isEqual(this.userDetails, res)) {
            this.userDetails = res;
            this.getwidgetData(this.widgetId);
            this.updatevalues();
            this.afterColorDefined.next(this.widgetInfo.widgetColorPalette);
          }
        },
        (error) => console.error(`Error : ${error.message}`)
      );
    this.subscriptions.add(getUserDetails);
  }

  emitEvtFilterCriteria(critera: Criteria[]): void {
    const index = critera.findIndex(cri => cri.timeSeriesDateFilter === true);
    let timeFilter = [];
    if(index > -1) {
      // remove timeseries date filters
      timeFilter = critera.splice(index,1)
    }

    this.evtFilterCriteria.emit(critera);
    if(timeFilter.length) {
      this.getwidgetData(this.widgetId,timeFilter);
    }
    this.sharedService.setFilterCriteriaData(critera);
  }

  ngOnChanges(changes: import('@angular/core').SimpleChanges): void {
    if (changes && changes.hasFilterCriteria && changes.hasFilterCriteria.currentValue) {
      this.clearFilterCriteria();
    }

    if (
      changes &&
      changes.filterCriteria &&
      changes.filterCriteria.previousValue !== undefined &&
      changes.filterCriteria.currentValue !== changes.filterCriteria.previousValue &&
      !this.widgetInfo.isEnableGlobalFilter
    ) {
      this.lablels = [];
      this.chartLegend = [];
      this.filterCriteria = this.filterCriteria.filter((item) => item.fieldId !== '__DIW_STATUS');
      this.getwidgetData(this.widgetId);
    }

    if (
      changes &&
      changes.widgetInfo &&
      changes.widgetInfo.previousValue !== undefined &&
      !isEqual(changes.widgetInfo.currentValue, changes.widgetInfo.previousValue)
    ) {
      this.lablels = [];
      this.chartLegend = [];
      this.chartType = this.widgetInfo.chartProperties.chartType === ChartType.LINE ? 'line' : 'bar';
      if (this.widgetInfo.field === this.widgetInfo.groupById) {
        this.isGroupByChart = true;
      } else {
        this.isGroupByChart = false;
      }
      this.getwidgetData(this.widgetId);
    }
  }

  updatevalues() {
    const hasBtn = this.dateFilters.filter((fil) => fil.value === this.widgetInfo.chartProperties.timeseriesStartDate)[0];
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

  /**
   * Method to handle button click events
   */

  updateForm(field: string, value: ButtonArr) {
    this.dateFilters.forEach((ele) => {
      if (ele.id === value.id) {
        value.isActive = true;
      } else {
        ele.isActive = false;
      }
    });
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
        const week = moment()
          .subtract(Number(value.value) * 7, 'd')
          .format('MM/DD/YYYY HH:mm');
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
      enddate = String(moment().endOf('day').toDate().getTime());
    }
    const fieldId = this.widgetInfo.groupById;
    // let appliedFilters = this.filterCriteria.filter((fill) => fill.fieldId !== fieldId);
    let appliedFilters = this.filterCriteria;
    // this.removeOldFilterCriteria(appliedFilters);
    if (appliedFilters.length > 0) {
      const cri = appliedFilters.filter((fill) => fill.conditionFieldId === fieldId && fill.widgetId === this.widgetId);
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

  changePeriodView(){

    this.getwidgetData(this.widgetId);
  }

  clearFilterCriteria() {
    this.startDateCtrl.setValue(null);
    this.endDateCtrl.setValue(null);
    const fieldId = this.widgetInfo.groupById;
    const appliedFilters = this.filterCriteria.filter((fill) => fill.fieldId === fieldId);
    this.removeOldFilterCriteria(appliedFilters);

    this.dateFilters.forEach((f) => {
      f.isActive = false;
    });

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

  /**
   * handled for legend click
   */

  legendClick(legendItem: LegendItem): void {
    const clickedLegend = this.chartLegend[legendItem.datasetIndex] ? this.chartLegend[legendItem.datasetIndex].code : '';
    if (clickedLegend === '' || legendItem.text === 'Total' || legendItem.text === 'Total -- Total') {
      return;
    }
    const fieldId = this.widgetInfo.field;
    let appliedFilters = this.filterCriteria.filter((fill) => fill.fieldId === fieldId);
    this.removeOldFilterCriteria(appliedFilters);
    if (appliedFilters.length > 0) {
      const res = appliedFilters.filter(
        (fill) => fill.fieldId === fieldId && fill.widgetType === WidgetType.TIMESERIES && this.widgetInfo.isEnableGlobalFilter
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
        critera1.widgetType = WidgetType.TIMESERIES;
        critera1.conditionFieldValueText = this.chartLegend[legendItem.datasetIndex] ? this.chartLegend[legendItem.datasetIndex].text : '';
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
      critera1.widgetType = WidgetType.TIMESERIES;
      critera1.fieldCtrl = this.widgetInfo.fieldCtrl;
      critera1.conditionFieldValueText = this.chartLegend[legendItem.datasetIndex] ? this.chartLegend[legendItem.datasetIndex].text : '';
      appliedFilters.push(critera1);
    }
    appliedFilters.forEach((app) => this.filterCriteria.push(app));
    this.applyFilters();
  }

  applyFilters() {
    this.emitEvtFilterCriteria(this.filterCriteria);
  }

  /**
   * function to get widget data according to widgetID
   * @param widgetId ID of the widget
   */
  getwidgetData(widgetId: number,timeFilter?: Criteria[]): void {
    if(timeFilter && timeFilter.length) {
      this.filterCriteria.push(timeFilter[0]);
    }
    this.dataSet = [{ data: [] }];
    const filter = this.filterCriteria.filter(filt => !filt.timeSeriesDateFilter || filt.widgetId === this.widgetId);
    forkJoin([
      this.widgetService.getWidgetView(String(this.reportId), String(widgetId)),
      this.widgetService.getWidgetData(
        String(widgetId),
        filter,
        '',
        '',
        this.userDetails?.selfServiceUserModel?.timeZone,
        this.userDetails?.defLocs?.toString(),
        this.selectedPeriodOption
      ),
    ]).subscribe(
      (res) => {
        this.widgetViewDetails = res[0];
        this.responseData = res[1];
        this.updateChart(this.responseData);

      },
      (err) => {
        console.log('Error');
      }
    );
  }

  private updateChart(responseData) {
    this.dataSet = [];
    if (responseData !== null) {
      if (this.isGroupByChart) {
        this.transformForGroupBy(responseData);
      } else if (this.widgetInfo.field && this.widgetInfo.groupById && this.widgetInfo.distictWith) {
        this.dataSet = this.transformDataForComparison(responseData, true);
      } else if ((!this.widgetInfo.field || this.widgetInfo.field === '') && this.widgetInfo.groupById && this.widgetInfo.distictWith) {
        this.transformForGroupBy(responseData, true);
      } else if (
        (this.widgetInfo.field === 'TIME_TAKEN' || this.widgetInfo.chartProperties.bucketFilter) &&
        !this.widgetInfo.isStepwiseSLA
      ) {
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
          this.dateFilters.forEach((ele) => {
            ele.isActive = false;
          });
          this.startDateCtrl.setValue(null);
          this.endDateCtrl.setValue(null);
        }
      }

      this.activeDateFormat = this.selectedPeriodOption ? this.selectedPeriodOption : this.widgetInfo.chartProperties.seriesWith;
      if((this.widgetInfo.chartProperties.chartType === ChartType.LINE) || (this.widgetInfo.field === 'TIME_TAKEN' && this.widgetInfo.isStepwiseSLA)) {
        this.changeSeriesFormat();
      }
      if (this.widgetViewDetails?.payload?.view === WidgetView.TABLE_VIEW) {
        this.isTableView = true;
        this.getTableData();
      } else {
        this.isTableView = false;
      }
      if (this.chart && !this.isTableView) {
        this.chart.data.datasets = this.dataSet ? this.dataSet : [];
        this.formatLegendBySerieswith();
        this.chart.data.labels = this.dataSetlabel;
        this.chart.update();
        if (this.chart.chart) {
          this.chart.chart.update();
        }
      }
    }
  }

  formatLegendBySerieswith(){
    if(this.activeDateFormat) {

      this.chart.data.datasets.map((dataset) => {
          if(dataset.label && dataset.label.indexOf('-') > -1 && moment(dataset.label).isValid()){
            switch(this.activeDateFormat){
              case SeriesWith.day:{
                if(this.widgetInfo.chartProperties.chartType !== ChartType.LINE)
                dataset.label = moment(dataset.label).format(this.getDataFormat());
                break;
              }
              case SeriesWith.year:{
                if(this.widgetInfo.chartProperties.chartType !== ChartType.LINE)
                dataset.label = moment(dataset.label).format('YYYY');
                break;
              }
              case SeriesWith.week:{
                if(this.widgetInfo.chartProperties.chartType !== ChartType.LINE)
                dataset.label = moment(dataset.label).endOf('week').format(this.getDataFormat());
                break;
              }
              case SeriesWith.month : {
                if(this.widgetInfo.chartProperties.chartType !== ChartType.LINE)
                dataset.label = moment(dataset.label).format('MMM YYYY');
                break;
              }
              case SeriesWith.quarter:{
                const quarter1 = Math.floor((new Date(dataset.label).getMonth() / 3));
                const startQuarter = new Date(new Date(dataset.label).getFullYear(), quarter1 * 3, 1);
                const lastQuarter = new Date(startQuarter.getFullYear(), startQuarter.getMonth() + 3, 0);
                if(this.widgetInfo.chartProperties.chartType !== ChartType.LINE)
                dataset.label = moment(startQuarter).format('MMM') + '-' + moment(lastQuarter).format('MMM') + ' ' + + moment(lastQuarter).format('YYYY')
                break;
              }
            }

        }
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
      const key = 'id';
      if (dataArr[key] || dataArr[key] === '') {
        dataArr.data.forEach((dataObj, dIndex) => {
          const obj = {} as any;
          const axis = 'x';
          obj[this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.fieldCtrl.fieldId] =
            this.chartType === 'bar' ? dataObj[axis] : dataArr.label;
          this.dateAndCountFormat(dataObj, obj, dataArr);
          if (
            !this.displayedColumnsId.includes(
              this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.fieldCtrl.fieldId
            )
          ) {
            this.displayedColumnsId.push(
              this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.fieldCtrl.fieldId
            );
          }
          excelData.push(obj);
        });
      } else {
        dataArr.data.forEach((dataObj, dataIndex) => {
          const obj = {} as any;
          // In case of field ID is there..
          // tslint:disable-next-line: no-string-literal
          const chartLegendIndex = this.chartLegend.findIndex((legend) =>( legend.code === dataObj['x'] || legend.text === dataObj['x'] || legend.code + ' -- ' + legend.text === dataObj['x']));
          if (this.widgetInfo.fieldCtrl.fieldId) {
            if (this.widgetInfo.fieldCtrl.fieldId.toLowerCase() === 'time_taken' && this.widgetInfo.isStepwiseSLA) {
              obj[this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.fieldCtrl.fieldId] =
                this.chartLegend.length > 0 && this.chartLegend.length-1 >= dataIndex ? this.chartLegend[chartLegendIndex] : '';
            } else
              obj[this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.fieldCtrl.fieldId] =
                this.chartLegend.length > 0 && this.chartLegend.length-1 >= dataIndex ? this.checkTextCode(this.chartLegend[chartLegendIndex]) : '';
            if (
              !this.displayedColumnsId.includes(
                this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.fieldCtrl.fieldId
              )
            ) {
              this.displayedColumnsId.push(
                this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.fieldCtrl.fieldId
              );
            }
          }
          // In case of field ID is blank - groupWith and DistinctWith are there..
          else {
            obj[this.widgetInfo.distictWith] = this.chartLegend.length > 0 ? this.checkTextCode(this.chartLegend[chartLegendIndex]) : '';
            if (!this.displayedColumnsId.includes(this.widgetInfo.distictWith)) {
              this.displayedColumnsId.push(this.widgetInfo.distictWith);
            }
          }
          this.dateAndCountFormat(dataObj, obj, dataArr);
          excelData.push(obj);
        });
      }
    });

    const column = this.displayedColumnsId[0];
    const timeSeries =
      this.activeDateFormat.charAt(0).toUpperCase() + this.activeDateFormat.slice(1);
    excelData.forEach((item) => {
      const itemObj = {};
      const index1 = tableData.findIndex((tab) => tab[column] === item[column]);
      if (index1 > -1) {
        itemObj[item[timeSeries]] = item.Count;
        tableData[index1] = { ...tableData[index1], ...itemObj };
      } else {
        itemObj[column] = item[column];
        itemObj[item[timeSeries]] = item.Count;
        tableData.push(itemObj);
      }
      if (!this.displayedColumnsId.includes(item[timeSeries])) {
        this.displayedColumnsId.push(item[timeSeries]);
      }
    });

    if(this.widgetInfo.chartProperties.chartType === ChartType.LINE) {
      this.displayedColumnsId.sort(this.sortDateFormat);
    }

    const index = this.displayedColumnsId.findIndex((item) => item === 'Total\t');
    if (index > -1 && index < this.displayedColumnsId.length - 1) {
      const column1 = this.displayedColumnsId.splice(index, 1)[0];
      this.displayedColumnsId.push(column1);
    }
    this.tableDataSource = tableData;
  }

  dateAndCountFormat(objData, obj, dataArr) {
    const seriesFormat = this.widgetInfo?.chartProperties?.seriesFormat ? this.getDataFormat() : 'DD-MMM-YY';
    switch (this.activeDateFormat) {
      case SeriesWith.day:
        if (this.chartType === 'line')
          obj.Day = typeof objData.x === 'string' ? objData.x + '\t' : moment(objData.x).format(seriesFormat) + '\t';
        else {
          obj.Day = dataArr.label + '\t';
        }
        break;
      case SeriesWith.week:
        if (this.chartType === 'line') {
          obj.Week = typeof objData.x === 'string' ? objData.x + '\t' : moment.isDate(objData.x) ? moment(objData.x).endOf('week').format(seriesFormat) : moment(objData.x).format(seriesFormat) + '\t';
        } else {
          obj.Week = moment(dataArr.label).isValid() ? moment(dataArr.label).endOf('week').format(seriesFormat) : dataArr.label + '\t';
        }
        break;
      case SeriesWith.month:
        if (this.chartType === 'line') {
          obj.Month = typeof objData.x === 'string' ? objData.x + '\t' : moment(objData.x).format(seriesFormat) + '\t';
        } else obj.Month = moment(dataArr.label).isValid() ? moment(dataArr.label).format('MMM YYYY') + '\t' : dataArr.label + '\t'
        break;
      case SeriesWith.quarter:
        if (this.chartType === 'line') {
          obj.Quarter = typeof objData.x === 'string' ? objData.x + '\t': this.formatAsQuarter(objData.x) + '\t';
        } else {
          obj.Quarter = this.formatAsQuarter(dataArr.label) + '\t';
        }
        break;
      case SeriesWith.year:
        if (this.chartType === 'line') {
          obj.Year = typeof objData.x === 'string' ? objData.x + '\t' : moment(objData.x).format(seriesFormat) + '\t';
        } else {
          obj.Year = dataArr.label + '\t';
        }
        break;

      default:
        break;
    }
    obj.Count = objData.y || objData.y === 0 ? formatNumber(objData.y, 'en-US') + '\t' : formatNumber(objData, 'en-US') + '\t';
  }

  formatAsQuarter(label){
    if(moment(label).isValid()){
      const quarter1 = Math.floor((new Date(label).getMonth() / 3));
      const startQuarter = new Date(new Date(label).getFullYear(), quarter1 * 3, 1);
      const lastQuarter = new Date(startQuarter.getFullYear(), startQuarter.getMonth() + 3, 0);
      return moment(startQuarter).format('MMM') + '-' + moment(lastQuarter).format('MMM') + ' ' + + moment(lastQuarter).format('YYYY')
    }
    else{
      return label;
    }
  }

  /**
   * After click on stack br / line then should emit through this function ..
   * @param event canvas evnet ..
   * @param activeElements get active element ..
   */
  stackClickFilter(event?: MouseEvent, activeElements?: Array<any>) {
    if (this.chart && activeElements.length > 0) {
      const option = this.chart.chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false) as any;
      if (option && option[0] && this.chartLegend[option[0]._index]) {
        const axislabel = this.chartLegend[option[0]._index];

        const fieldId = this.widgetInfo.field;
        let appliedFilters = this.filterCriteria.filter((fill) => fill.fieldId === fieldId);
        this.removeOldFilterCriteria(appliedFilters);
        if (appliedFilters.length > 0) {
          const res = appliedFilters.filter(
            (fill) => fill.fieldId === fieldId && fill.widgetType === WidgetType.TIMESERIES && this.widgetInfo.isEnableGlobalFilter
          );
          if (res.length !== 0) {
            res.forEach((val) => {
              val.conditionFieldValue = axislabel.code;
            });
          }
          const cri = appliedFilters.filter((fill) => fill.conditionFieldValue === axislabel.code);
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
          critera1.conditionFieldId = fieldId;
          critera1.conditionFieldValue = axislabel.code;
          critera1.blockType = BlockType.COND;
          critera1.conditionOperator = ConditionOperator.EQUAL;
          critera1.widgetType = WidgetType.TIMESERIES;
          critera1.fieldCtrl = this.widgetInfo.fieldCtrl;
          appliedFilters.push(critera1);
        }
        appliedFilters.forEach((app) => this.filterCriteria.push(app));
        this.applyFilters();
      }
    }
  }

  transformDataSets(data: any): any {
    const fieldId = this.widgetInfo.field;
    const finalOutput = new Object();
    const codetextObj = {};
    const cordKeys = ['x', 'y'];
    const totalCount = [];
    let aggregationBucket = [];
    let aggregation = data.aggregations['date_histogram#date'] ? data.aggregations['date_histogram#date'] : data.aggregations[''];
    if (!aggregation) {
      const buckets1 = data.aggregations['nested#nested_tags'] ? data.aggregations['nested#nested_tags'] : [''];
      aggregation = buckets1['date_histogram#date']
        ? buckets1['date_histogram#date'].buckets
          ? buckets1['date_histogram#date'].buckets
          : []
        : [];
    }
    // added condition for grid field
    aggregationBucket = aggregation.buckets !== undefined && aggregation.buckets.length > 0 ? aggregation.buckets : aggregation;

    if (aggregationBucket !== undefined && aggregationBucket.length > 0) {
      aggregationBucket.forEach((singleBucket) => {
        const res = Object.keys(singleBucket);
        const value = res.filter((text) => {
          return text.includes('terms#term');
        });
        const timeStamp = moment(singleBucket.key_as_string, this.getDataFormat()).valueOf();
        let arrBuckets = singleBucket[value[0]] ? (singleBucket[value[0]].buckets ? singleBucket[value[0]].buckets : []) : [];
        if (arrBuckets.length === 0) {
          const buckets1 = singleBucket['nested#Nest_histogram'] ? singleBucket['nested#Nest_histogram'] : [];
          const resValue = Object.keys(buckets1);
          const nestValue = resValue.filter((nestData) => {
            return nestData.includes('terms#term');
          });
          arrBuckets = buckets1[nestValue[0]] ? (buckets1[nestValue[0]].buckets ? buckets1[nestValue[0]].buckets : []) : [];
        }
        arrBuckets.forEach((innerBucket) => {
          const docTotalCount = innerBucket.doc_count;
          let label = innerBucket.key;
          let labelCode;
          const txtvalue = Object.keys(innerBucket);
          const txtlabel = txtvalue.filter((da) => {
            return da.includes('terms#textTerm');
          });
          const textTermBucket = innerBucket[txtlabel[0]] ? innerBucket[txtlabel[0]].buckets : null;
          if (textTermBucket) {
            textTermBucket.forEach((bucket) => {
              labelCode = this.codeTextValue(textTermBucket[0], fieldId);
              label = labelCode.t ? labelCode.t : labelCode.c ? labelCode.c : labelCode;
              if (this.widgetInfo.fieldCtrl.dataType === 'DTMS' || this.widgetInfo.fieldCtrl.dataType === 'DATS') {
                label = new Date(Number(label)).toLocaleDateString();
              }
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
                const index = totalCount.findIndex((item) => item.x === timeStamp);
                if (index > -1) {
                  totalCount[index].y = totalCount[index].y + docTotalCount;
                } else {
                  const total = new Object();
                  total[cordKeys[0]] = timeStamp;
                  total[cordKeys[1]] = docTotalCount;
                  totalCount.push(total);
                }
              } else {
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
                const index = totalCount.findIndex((item) => item.x === timeStamp);
                if (index > -1) {
                  totalCount[index].y = totalCount[index].y + docTotalCount;
                } else {
                  const total = new Object();
                  total[cordKeys[0]] = timeStamp;
                  total[cordKeys[1]] = docTotalCount;
                  totalCount.push(total);
                }
              } else {
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
      this.filterCriteria.forEach((filter) => {
        if (filter.conditionFieldValue !== 'Total') {
          const index = Object.keys(finalOutput).indexOf(filter.conditionFieldValueText);
          if (index > -1) {
            showTotal = false;
          }
        }
      });
      const total = 'Total';
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
      } else {
        dataSet[arrKeys[4]] = '#e4e5e5';
        dataSet[arrKeys[5]] = '#e4e5e5';
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
   * Transform datasets for stepwise bar chart
   * @param res server res
   */
  transformDataForStepSizeBarChart(res: any) {
    let finalOutput = new Array();
    this.dataSetlabel = [];
    const objData = {};
    this.chartLegend = [];
    const totalCount = [];
    let aggregation = res ? res.aggregations['date_histogram#date'] : [];
    if (!aggregation) {
      const buckets1 = res.aggregations['nested#nested_tags'] ? res.aggregations['nested#nested_tags'] : [];
      aggregation = buckets1['date_histogram#date']
        ? buckets1['date_histogram#date']
          ? buckets1['date_histogram#date']
          : []
        : [];
    }
    if (aggregation.buckets !== undefined && aggregation.buckets.length > 0) {
      aggregation.buckets.forEach((singleBucket) => {
        let milliVal;
        const resValue = Object.keys(singleBucket);
        const value = resValue.filter((data) => {
          return data.includes('terms#sla_step_wise');
        });
        const arrBuckets = singleBucket[value[0]] ? (singleBucket[value[0]].buckets ? singleBucket[value[0]].buckets : []) : [];
        if (arrBuckets.length) {
          const key = Object.keys(arrBuckets[0]).filter((data) => {
            return data.includes('terms#steps');
          });
          const slaBuckets = arrBuckets[0][key[0]]
            ? arrBuckets[0][key[0]].buckets
            : [];
            slaBuckets.forEach(slaBucket => {
              const slaKey = Object.keys(slaBucket).filter((data) => {
                return data.includes('#within_1_day') || data.includes('#more_then_1_day');
              });
              const stepSizeBucket = slaBucket[slaKey[0]] ? (slaBucket[slaKey[0]].buckets ? slaBucket[slaKey[0]].buckets : []) : [];
              stepSizeBucket.forEach((innerBucket: any) => {
                let array;
                let label;
                let codeValue;
                const labelCode = (label = this.codeTextValue(slaBucket, 'STEP', 'top_hits#items'));
                label = labelCode.t ? labelCode.t : labelCode.c ? labelCode.c : labelCode;
                codeValue = labelCode.c ? labelCode.c : labelCode;
                const labelText = { text: label, code: codeValue };
                milliVal = this.checkTextCode(labelText);
                const legendIndex = this.chartLegend.findIndex(item => item === singleBucket.key_as_string);
                if(legendIndex === -1) {
                  this.chartLegend.push(singleBucket.key_as_string);
                }
                const objDataValue = {};
                const keys = ['x', 'y'];
                if (objData[milliVal]) {
                  array = [...objData[milliVal]];
                  if (innerBucket.doc_count) {
                    objDataValue[keys[0]] = singleBucket.key_as_string;
                    objDataValue[keys[1]] = innerBucket.doc_count;
                    array.push({ ...objDataValue });
                  }
                  // else {
                  //   array.push({ x: singleBucket.key_as_string, y: 0 });
                  // }
                } else {
                  array = new Array();
                  if (innerBucket.doc_count) {
                    objDataValue[keys[0]] = singleBucket.key_as_string;
                    objDataValue[keys[1]] = innerBucket.doc_count;
                    array.push({ ...objDataValue });
                  }
                  //  else {
                  //   array.push({ x: singleBucket.key_as_string, y: 0 });
                  // }
                }
                objData[milliVal] = array;
                // this.dataSetlabel.push(milliVal);
              });
            });
        }
      });

      const objDataKeys = Object.keys(objData);
      objDataKeys.forEach((label) => {
        const data = JSON.parse(JSON.stringify(objData[label]));
        data.forEach(totalData => {
          const timeIndex = totalCount.findIndex(item => item.x === totalData.x);
          if (timeIndex > -1) {
            totalCount[timeIndex].y += totalData.y;
          } else {
            totalCount.push(totalData);
          }
        });
      });

      const arrKeyF = ['label', 'data', 'fill', 'backgroundColor', 'borderColor', 'type', 'barPercentage', 'categoryPercentage'];
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
    if (this.widgetInfo.chartProperties.showTotal && finalOutput.length > 1) {
      if (this.widgetInfo.chartProperties.chartType === ChartType.BAR) {
        const color = '#e4e5e5';
        let barPercentage;
        let categoryPercentage;
        if (finalOutput.length % 2 === 0) {
          barPercentage = 1.2 * (finalOutput.length);
          categoryPercentage = 1;
        } else {
          barPercentage = 2.20 * (finalOutput.length);
          categoryPercentage = .54;
        }

        // for sorting legends
        finalOutput.sort((a:any, b: any) => {
          return a.label.localeCompare(b.label);
        });

        const totalDataSet: any = {
          label: this.checkTextCode({ code: 'Total', text: 'Total' }),
          data: [],
          borderColor: color,
          type: this.chartType,
          xAxisId: 'total-x',
          offset: false,
          barThickness: 'flex',
          barPercentage,// width for bar
          categoryPercentage,
        };

        const format = 'MM-DD-YY'
        totalCount.sort((c:any,d:any) => {
          const a = moment(c.x).format(format)
          const b = moment(d.x).format(format)
          const aDate = new Date(a).getTime();
          const bDate = new Date(b).getTime();
          return aDate - bDate;
        })

        Object.values(totalCount).forEach((el: number) => {
          totalDataSet.data.push(el);
        });
        if (Object.keys(totalCount).length) {
          if (finalOutput.length % 2 === 0) {
            finalOutput.splice(Math.ceil(finalOutput.length / 2), 0, totalDataSet);
          } else {
            finalOutput.splice(Math.ceil(finalOutput.length / 2)-1, 0, totalDataSet);
          }
        }

        const scaleAxes: any = {
          id: 'total-x',
          stacked: false
        };
        const totalX = 'totalX';
        this.timeSeriesOption.scales[totalX] = { ...this.timeSeriesOption.scales[totalX], ...scaleAxes };
      }
    }
    return finalOutput;
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
    let aggregation = data ? data.aggregations['date_histogram#date'] : [];
    if (!aggregation) {
      const buckets1 = data.aggregations['nested#nested_tags'] ? data.aggregations['nested#nested_tags'] : [];
      aggregation = buckets1['date_histogram#date']
        ? buckets1['date_histogram#date']
          ? buckets1['date_histogram#date']
          : []
        : [];
    }
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
                codetextObj[label] = labelCode && labelCode.c ? labelCode.c : slaBucket.key;
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
      const finalDataSet = finalOutput;
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
    keys.forEach((key) => {
      const label = data[key].map((item) => item.x);
      labels.push(...label);
    });
    labels = Array.from(new Set(labels));
    keys.forEach((key) => {
      if (data[key].length < labels.length) {
        labels.forEach((item, index) => {
          const timeStamp = moment(item).format('YYYY-MMM-DD');
          const isExist = data[key].find((el) => el.x === timeStamp);
          if (!isExist) {
            const obj = { x: timeStamp, y: 0 };
            const array = [...data[key]];
            array.splice(index, 0, obj);
            data[key] = [...array];
            // this.dataSetlabel = item;
          }
        });
      }
    });
    return data;
  }

  tarnsformForShowInPercentage(res: any, showInPercentage: boolean) {
    let aggregation = res ? res.aggregations['date_histogram#date'] : [];
    if (!aggregation) {
      const buckets1 = res.aggregations['nested#nested_tags'] ? res.aggregations['nested#nested_tags'] : [];
      aggregation = buckets1['date_histogram#date']
        ? buckets1['date_histogram#date']
          ? buckets1['date_histogram#date']
          : []
        : [];
    }
    const totalCount = [];
    if (aggregation && aggregation.buckets) {
      const yearDoc = [];

      aggregation.buckets.forEach((fil) => {
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
      this.dataSetlabel = [];
      let finaldata = [];
      const finalDataSet = [];
      if (yearDoc.length > 0) {
        Object.keys(yearDoc).forEach((fil) => {
          finaldata = []
          const dataSet = this.bucketModify(yearDoc[fil], showInPercentage);
          const newDataSet = JSON.parse(JSON.stringify(dataSet));
          newDataSet.forEach((data, index) => {
            const totalIndex = totalCount.findIndex(tot => tot.x === data.x);
            if (totalIndex > -1) {
              if (data.y !== undefined) {
                totalCount[totalIndex].y = totalCount[totalIndex].y + data.y;
              }
            } else {
              totalCount.push(data);
            }
            finaldata.push(JSON.parse(JSON.stringify(data)));
          });
          // finaldata.push(dataSet[0]);

          if(yearDoc[fil]) {
            const color = this.getUpdatedColorCode('');
            finalDataSet.push({
              data: finaldata,
              label: `${fil}`,
              fill: false,
              backgroundColor: color,
              borderColor: color,
              type: this.chartType,
              cubicInterpolationMode: 'monotone',
              id: `${fil}`,
            });
          }
        });
      }

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
      // console.log(finaldata.length);

      if (this.widgetInfo.chartProperties.showTotal) {

        this.chartLegend.push({ code: 'Total', text: 'Total', legendIndex: this.chartLegend.length });
        if (this.widgetInfo.chartProperties.chartType === ChartType.BAR) {
          totalDataSet = {
            ...totalDataSet,
            barThickness: 'flex',
            barPercentage: 6,// width for bar
            categoryPercentage: .3,
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

        if (Object.keys(totalCount).length) {
          finalDataSet.push(totalDataSet);
        }
      }
      this.setLegendForChart();
      this.dataSet = finalDataSet;
    }
  }

  /**
   * Transformer helper ..
   * @param data year data
   */
  bucketModify(data: any, showInPercentage: boolean): any[] {
    const finalData = [];
    data.forEach(bucketData => {
      if (bucketData) {
        const totalInMonth = bucketData.doc_count ? bucketData.doc_count : 0;
        const res = Object.keys(bucketData);
        let value = res.filter((text) => {
          return text.includes('terms#within_1_day');
        });
        if (!value?.length) {
          value = res.filter((text) => {
            {
              return text.includes('terms#more_then_1_day');
            }
          });
        }
        const inFilterBucket = bucketData[value[0]] ? bucketData[value[0]].buckets : [];
        const bucket = inFilterBucket.filter((fil) => fil.key !== '')[0];
        const objData = {};
        if (bucket) {
          let val = bucket.doc_count ? bucket.doc_count : 0;
          if (val > 0 && showInPercentage) {
            const per = val / totalInMonth;
            val = Math.round((per + Number.EPSILON) * 100 * 100) / 100;
          }
          if(val > 0){
          const objAxes = ['x', 'y'];
          objData[objAxes[0]] = bucketData.key_as_string;
          objData[objAxes[1]] = val;
          finalData.push(objData);
          }
        }
        const index = this.dataSetlabel.findIndex(ind => ind === bucketData.key_as_string);
        if(index === -1) {
          this.dataSetlabel.push(bucketData.key_as_string);
        }
      } else {
        finalData.push({ x: ``, y: 0 });
      }
    })
    return finalData;
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
    const totalCount = [];
    let aggregationBucket = [];
    let aggregation = res ? res.aggregations['date_histogram#date'] : [];
    if (!aggregation) {
      const buckets1 = res.aggregations['nested#nested_tags'] ? res.aggregations['nested#nested_tags'] : [];
      aggregation = buckets1['date_histogram#date']
        ? buckets1['date_histogram#date'].buckets
          ? buckets1['date_histogram#date'].buckets
          : []
        : [];
    }
    // added condition for grid field data
    aggregationBucket = aggregation.buckets !== undefined && aggregation.buckets.length > 0 ? aggregation.buckets : aggregation;

    if (aggregationBucket !== undefined && aggregationBucket.length > 0) {
      aggregationBucket.forEach((singleBucket) => {
        const milliVal = singleBucket.key_as_string;
        const resValue = Object.keys(singleBucket);
        const value = resValue.filter((data) => {
          return data.includes('terms#term');
        });
        let arrBuckets = singleBucket[value[0]] ? (singleBucket[value[0]].buckets ? singleBucket[value[0]].buckets : []) : [];
        if (arrBuckets.length === 0) {
          const buckets1 = singleBucket['nested#Nest_histogram'] ? singleBucket['nested#Nest_histogram'] : [];
          const resKeys = Object.keys(buckets1);
          const nestValue = resKeys.filter((nestData) => {
            return nestData.includes('terms#term');
          });
          arrBuckets = buckets1[nestValue[0]] ? (buckets1[nestValue[0]].buckets ? buckets1[nestValue[0]].buckets : []) : [];
        }
        const arrcount = new Array();
        const dataSet = new Object();
        arrBuckets.forEach((arrBucket) => {
          const bucket = arrBuckets.filter((fil) => fil.key === arrBucket.key)[0];
          const count = bucket
            ? forDistinct
              ? bucket['cardinality#count']
                ? bucket['cardinality#count'].value
                : 0
              : bucket.doc_count
            : 0;
          let label = '';
          let codeValue = '';
          if (forDistinct) {
            const labelCode = this.codeTextValue(arrBucket, fieldId);
            label = labelCode.t ? labelCode.t : labelCode;
            codeValue = labelCode.c ? labelCode.c : labelCode;
            if (this.widgetInfo.fieldCtrl.dataType === 'DTMS' || this.widgetInfo.fieldCtrl.dataType === 'DATS') {
              label = new Date(Number(label)).toLocaleDateString();
            }
          } else {
            const txtvalue = Object.keys(bucket);
            const txtlabel = txtvalue.filter((data) => {
              return data.includes('terms#textTerm');
            });
            const textTermBucket = bucket && bucket[txtlabel[0]] ? bucket[txtlabel[0]].buckets : [];
            textTermBucket.forEach((innerBucket) => {
              const labelCode = (label = this.codeTextValue(innerBucket, fieldId));
              label = labelCode.t ? labelCode.t : labelCode.c ? labelCode.c : labelCode;
              codeValue = labelCode.c ? labelCode.c : labelCode;
              if (this.widgetInfo.fieldCtrl.dataType === 'DTMS' || this.widgetInfo.fieldCtrl.dataType === 'DATS') {
                label = new Date(Number(label)).toLocaleDateString();
              }
            });
          }
          const chartLegend = { text: label, code: codeValue, legendIndex: this.chartLegend.length };
          const exist = this.chartLegend.filter((map) => map.code === codeValue);
          if (exist.length === 0) {
            this.chartLegend.push(chartLegend);
            // labels.push(label);
            if (this.dataSetlabel.indexOf(codeValue) === -1) {
              label.length > 0 ? tempDataSetlabel.push(label) : tempDataSetlabel.push(arrBucket.key);
            }
          }
          dataSet[label] = count;
        });
        tempDataSetlabel.forEach((key, index) => {
          if (Object.keys(dataSet).includes(key.toString())) {
            // arrcount.push(dataSet[key.toString()]);
            const obj = {};
            const objDataVal = ['x', 'y'];
            obj[objDataVal[0]] = this.checkTextCode(this.chartLegend[index]);
            // obj[objDataVal[0]] = milliVal;
            obj[objDataVal[1]] = dataSet[key.toString()];
            arrcount.push(obj);
          }
          //  else {
          //   // arrcount.push(0);
          //   arrcount.push({ x: this.checkTextCode(this.chartLegend[index]), y: 0 });
          // }
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

    const arrKeyF = ['label', 'data', 'type', 'backgroundColor', 'borderColor', 'barPercentage', 'categoryPercentage'];
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

    if (finalOutput.length === 1) {
      const finaldata = { ...finalOutput[0] };
      finaldata[arrKeyF[5]] = 0.5;
      finaldata[arrKeyF[6]] = 0.5;
      finalOutput[0] = { ...finaldata };
    }

    // this.timeSeriesOption.scales = { x: {}, y: {} };
    this.setLegendForChart(); // calling it to set legend

    if (this.widgetInfo.chartProperties.showTotal && finalOutput.length > 1) {
      if (this.widgetInfo.chartProperties.chartType === ChartType.BAR) {
        const color = '#e4e5e5';
        let barPercentage;
        let categoryPercentage;
        if(finalOutput.length === 2) {
          barPercentage = 1.20 * finalOutput.length;
          categoryPercentage = 1;
        }
        else if ((finalOutput.length) % 2 === 0) {
          barPercentage = 1.1 * finalOutput.length;
          categoryPercentage = .9;
        } else {
          barPercentage = 1.05 * finalOutput.length;
          categoryPercentage = .95;
        }
        const totalDataSet =
        {
          label: 'Total',
          data: [],
          borderColor: color,
          type: this.chartType,
          barThickness: 'flex',
          barPercentage,
          categoryPercentage
        };
        Object.values(totalCount).forEach((el: number) => {
          totalDataSet.data.push(el);
        })
        if (Object.keys(totalCount).length) {
          // finalOutput.push(totalDataSet);
          if (finalOutput.length % 2 === 0) {
            finalOutput.splice(Math.ceil(finalOutput.length / 2), 0, totalDataSet);
          } else {
            finalOutput.splice(Math.ceil(finalOutput.length / 2)-1, 0, totalDataSet);
          }
        }
      }
    }

    return finalOutput;
  }

  codeTextValue(innerBucket: any, fieldId: string, key: string = 'top_hits#data_hits'): any {
    let labelValue = '';
    const hits = innerBucket[key] ? innerBucket[key].hits.hits[0] : null;
    const val = hits
      ? hits._source.hdvs
        ? hits._source.hdvs[fieldId]
          ? hits._source.hdvs[fieldId]
            ? hits._source.hdvs[fieldId].vc
            : null
          : null
        : hits._source.staticFields && hits._source.staticFields[fieldId]
        ? hits._source.staticFields[fieldId]
          ? hits._source.staticFields[fieldId].vc
          : null
        : hits._source[fieldId]
        ? hits._source[fieldId].vc
        : null
      : null;
    if (val) {
      if (
        fieldId === 'OVERDUE' ||
        fieldId === 'FORWARDENABLED' ||
        fieldId === 'TIME_TAKEN' ||
        this.widgetInfo.fieldCtrl.picklist === '35'
      ) {
        labelValue = this.getFields(fieldId, val[0].c);
      } else {
        labelValue = val[0];
      }
    } else {
      labelValue = innerBucket.key;
    }
    return labelValue;
  }

  checkTextCode(value: { code: string; text: string }): string {
    if (value.code || value.text) {
      switch (this.displayCriteriaOption) {
        case DisplayCriteria.CODE:
          return value.code ? value.code : value.text;
        case DisplayCriteria.TEXT:
          return value.text ? value.text : value.code;
        default:
          const resCodeText =
            value.code && value.text
              ? `${value.code} -- ${value.text}`
              : value.code || value.text
              ? value.code
                ? `${value.code} -- ${value.code}`
                : `${value.text} -- ${value.text}`
              : '';
          return resCodeText;
      }
    }
    return '';
  }

  saveDisplayCriteria() {
    const saveDisplayCriteria = this.widgetService
      .saveDisplayCriteria(this.widgetInfo.widgetId, this.widgetInfo.widgetType, this.displayCriteriaOption)
      .subscribe(
        (res) => {
          this.updateChart(this.responseData);

        },
        (error) => {
          console.error(`Error : ${error}`);
          this.snackBar.open(`Something went wrong`, 'Close', { duration: 3000 });
        }
      );
    this.subscriptions.add(saveDisplayCriteria);
  }

  /**
   * Transform for timeseries with grp by same fields ..
   * @param res server response
   */
  transformForGroupBy(res: any, forDistinct?: boolean) {
    let aggregationBucket = [];
    let aggregation = res ? res.aggregations['date_histogram#date'] : [];
    if (!aggregation) {
      const buckets1 = res.aggregations['nested#nested_tags'] ? res.aggregations['nested#nested_tags'] : [];
      aggregation = buckets1['date_histogram#date']
        ? buckets1['date_histogram#date'].buckets
          ? buckets1['date_histogram#date'].buckets
          : []
        : [];
    }
    const totalCount = [];
    // added condition for grid field
    aggregationBucket = aggregation && aggregation.buckets ? aggregation.buckets : aggregation;

    if (aggregationBucket && aggregationBucket.length) {
      const yearDoc = [];
      aggregationBucket.forEach((fil) => {
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

      this.dataSetlabel = [];
      let finaldata = [];
      const finalDataSet = [];
      if (yearDoc.length > 0) {
        Object.keys(yearDoc).forEach((fil) => {
          finaldata = [];
          const dataSet = this.generatedDataBasedonMonth(yearDoc[fil], forDistinct);
          const newDataSet = JSON.parse(JSON.stringify(dataSet));
          newDataSet.forEach((data, index) => {
            const totalIndex = totalCount.findIndex(tot => tot.x === data.x);
            if (totalIndex > -1) {
              if (data.y !== undefined) {
                totalCount[totalIndex].y = totalCount[totalIndex].y + data.y;
              }
            } else {
              totalCount.push(data);
            }
            finaldata.push(JSON.parse(JSON.stringify(data)));
          });
          if(yearDoc[fil]) {
            const color = this.getUpdatedColorCode('');
            finalDataSet.push({
              data: finaldata,
              label: `${fil}`,
              fill: false,
              backgroundColor: color,
              borderColor: color,
              type: this.chartType,
              cubicInterpolationMode: 'monotone',
              id: `${fil}`,
            });
          }
        });
      }

      const colorTotal = '#e4e5e5';
      let totalDataSet: any = {
        label: 'Total',
        data: [],
        fill: false,
        type: this.chartType,
        xAxisId: 'total-x',
        borderColor: colorTotal,
        cubicInterpolationMode: 'monotone',
        id: 'Total',
      };
      if (this.widgetInfo.chartProperties.showTotal && finalDataSet.length > 1) {
        if (this.widgetInfo.chartProperties.chartType === ChartType.BAR) {
          totalDataSet = {
            ...totalDataSet,
            barThickness: 'flex',
            barPercentage: 10,
            categoryPercentage: .2,
            stack: 'a',
          };
          const scaleAxes: any = {
            id: 'total-x',
            type: 'category',
            offset: true,
            display: false,
            grid: {
              offset: false,
              display: false,
            },
            stacked: true,
          };
          const totalX = 'totalX';
          this.timeSeriesOption.scales[totalX] = { ...this.timeSeriesOption.scales[totalX], ...scaleAxes };
        }
        Object.values(totalCount).forEach((el: number) => {
          totalDataSet.data.push(el);
        });
        if (Object.keys(totalCount).length) {
          finalDataSet.push(totalDataSet);
        }
      }

      this.setLegendForChart();
      this.dataSet = finalDataSet;
    }
  }

  /**
   * Transformer helper ..
   * @param data year data
   */
  generatedDataBasedonMonth(data: any, forDistinct: boolean): any[] {
    const finalData = [];
    const hasdata = data;
    const objData = {};
    const keys = ['x', 'y'];
    hasdata.forEach(item =>{
      objData[keys[0]] = item.key_as_string;
      objData[keys[1]] = item
        ? forDistinct
          ? item['cardinality#count']
            ? item['cardinality#count'].value
            : 0
          : item.doc_count
        : 0;
      finalData.push(JSON.parse(JSON.stringify(objData)));
      const index = this.dataSetlabel.findIndex(ind => ind === item.key_as_string);
      if(index === -1) {
        this.dataSetlabel.push(item.key_as_string);
      }
    })
    return finalData;
  }

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
   * EMIT EVENT WHEN DATE CHANGES
   */

  emitDateChangeValues() {
    if (this.startDateCtrl.value && this.endDateCtrl.value) {
      if (this.startDateCtrl.value === this.endDateCtrl.value) {
        this.endDateCtrl.setValue(String(Number(this.startDateCtrl.value) + 24 * 60 * 60 * 1000));
      }
      const groupwith = this.widgetInfo.groupById;
      let filterApplied = this.filterCriteria.filter((fill) => fill.conditionFieldId === groupwith);
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
      filterApplied.forEach((op) => this.filterCriteria.push(op));
      this.applyFilters();
      this.dateFilters.forEach((ele) => {
        ele.isActive = false;
      });
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
    this.chartLegend.forEach((legend) => {
      req.colorPalettes.push({
        code: legend.code,
        colorCode: this.widgetInfo.widgetColorPalette[0]
          ? this.widgetInfo.widgetColorPalette[0].backgroundColor[legend.legendIndex]
          : this.getRandomColor(),
        text: legend.text,
      });
    });
    super.openColorPalette(req);
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
        display: false,
      };
    }

    if (this.chart) {
      this.chart.options.plugins.legend = this.timeSeriesOption.plugins.legend;
      this.chart.chart.options.plugins.legend = this.timeSeriesOption.plugins.legend;
    }

    if (this.widgetInfo.chartProperties.isEnableDatalabels) {
      this.timeSeriesOption.plugins.datalabels = {
        ...this.timeSeriesOption.plugins.datalabels,
        align: this.widgetInfo.chartProperties.datalabelsPosition || 'end',
        anchor: this.widgetInfo.chartProperties.datalabelsPosition || 'end',
        display: 'auto',
        formatter: (value: any, context: Context) => {
          return formatNumber(Number(value ? (value.y || value.y === 0 ? value.y : value) : value), 'en-US');
        },
      };
    } else {
      this.timeSeriesOption.plugins.datalabels = {
        ...this.timeSeriesOption.plugins.datalabels,
        display: false,
      };
    }

    if (this.chart) {
      this.chart.options.plugins.datalabels = this.timeSeriesOption.plugins.datalabels;
      if (this.chart.chart) this.chart.chart.options.plugins.datalabels = this.timeSeriesOption.plugins.datalabels;
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

  /**
   * Set Chart properties based on metadata
   */
  setChartProperties(): void {
    /**
     * SET TICKS HERE
     */
    if (
      this.widgetInfo.chartProperties.scaleFrom !== null &&
      this.widgetInfo.chartProperties.scaleFrom !== undefined &&
      this.widgetInfo.chartProperties.scaleTo !== null &&
      this.widgetInfo.chartProperties.scaleTo !== undefined &&
      this.widgetInfo.chartProperties.stepSize !== null &&
      this.widgetInfo.chartProperties.stepSize !== undefined
    ) {
      // if (this.widgetInfo.chartProperties.chartType === ChartType.BAR || (this.widgetInfo.chartProperties.chartType === ChartType.LINE && (this.isGroupByChart || this.widgetInfo.field.toLocaleLowerCase() === 'time_taken' || this.widgetInfo.chartProperties.bucketFilter || (this.widgetInfo && ((!this.widgetInfo.field || this.widgetInfo.field === '') && this.widgetInfo.groupById && this.widgetInfo.distictWith))))) {
      if (
        this.widgetInfo.chartProperties.chartType === ChartType.BAR ||
        (this.widgetInfo.chartProperties.chartType === ChartType.LINE &&
          (this.isGroupByChart ||
            ((this.widgetInfo.field.toLocaleLowerCase() === 'time_taken' || this.widgetInfo.chartProperties.bucketFilter) &&
              !this.widgetInfo.isStepwiseSLA) ||
            (this.widgetInfo.chartProperties &&
              (!this.widgetInfo.field || this.widgetInfo.field === '') &&
              this.widgetInfo.groupById &&
              this.widgetInfo.distictWith)))
      ) {
        this.timeSeriesOption.scales = {
          ...this.timeSeriesOption.scales,
          x: {
            title: {
              display: true,
              text: this.widgetInfo.chartProperties.xAxisLabel ? this.widgetInfo.chartProperties.xAxisLabel : '',
            },
            ticks: {
              callback: (value) => {
                const formattedDate = this.formtByTimePeriod(this.chart.data.labels[value]);
                return formattedDate.length > this.labelTooltipCharLimit
                  ? formattedDate.slice(0, this.labelTooltipCharLimit) + '...'
                  : formattedDate;
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
            }
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
              callback(value, index, values) {
                return formatNumber(Number(value), 'en-US');
              },
            },
            grid: {
              tickLength: 0
            }
          },
        };
      } else {
        this.timeSeriesOption.scales = {
          ...this.timeSeriesOption.scales,
          x: {
            type: 'time',
            time: {
              unit: this.widgetInfo.chartProperties.seriesWith,
              stepSize: 1,
              // displayFormats: {
              //   day: this.widgetInfo?.chartProperties?.seriesFormat ? this.getDataFormat() : 'MMM-DD-YY'
              // }
            },
            title: {
              display: true,
              text: this.widgetInfo.chartProperties.xAxisLabel ? this.widgetInfo.chartProperties.xAxisLabel : '',
            },
            ticks: {
              callback: (value) => {
                const formattedDate = this.formtByTimePeriod(this.chart.data.labels[value]);
                return formattedDate.length > this.labelTooltipCharLimit
                  ? formattedDate.slice(0, this.labelTooltipCharLimit) + '...'
                  : formattedDate;
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
            }
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
              callback(value, index, values) {
                return formatNumber(Number(value), 'en-US');
              },
            },
            grid: {
              tickLength: 0
            }
          },
        };
      }
    } else {
      // if (this.widgetInfo.chartProperties.chartType === ChartType.BAR || (this.widgetInfo.chartProperties.chartType === ChartType.LINE && (this.isGroupByChart || (this.widgetInfo.chartProperties && ((!this.widgetInfo.field || (this.widgetInfo.field.toLocaleLowerCase() === 'time_taken' || this.widgetInfo.chartProperties.bucketFilter && !this.widgetInfo.isStepwiseSLA)|| this.widgetInfo.field === '') && this.widgetInfo.groupById && this.widgetInfo.distictWith))))) {
      if (
        this.widgetInfo.chartProperties.chartType === ChartType.BAR ||
        (this.widgetInfo.chartProperties.chartType === ChartType.LINE &&
          (this.isGroupByChart ||
            ((this.widgetInfo.field.toLocaleLowerCase() === 'time_taken' || this.widgetInfo.chartProperties.bucketFilter) &&
              !this.widgetInfo.isStepwiseSLA) ||
            (this.widgetInfo.chartProperties &&
              (!this.widgetInfo.field || this.widgetInfo.field === '') &&
              this.widgetInfo.groupById &&
              this.widgetInfo.distictWith)))
      ) {
        this.timeSeriesOption.scales = {
          ...this.timeSeriesOption.scales,
          x: {
            title: {
              display: true,
              text: this.widgetInfo.chartProperties.xAxisLabel ? this.widgetInfo.chartProperties.xAxisLabel : '',
            },
            ticks: {
              callback: (value) => {
                const formattedDate = this.formtByTimePeriod(this.chart.data.labels[value]);
                return formattedDate.length > this.labelTooltipCharLimit
                  ? formattedDate.slice(0, this.labelTooltipCharLimit) + '...'
                  : formattedDate;
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
            }
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
              callback(value, index, values) {
                return formatNumber(Number(value), 'en-US');
              },
            },
            grid: {
              tickLength: 0
            }
          },
        };
      } else {
        this.timeSeriesOption.scales = {
          ...this.timeSeriesOption.scales,
          x: {
            type: 'time',
            time: {
              unit: this.widgetInfo.chartProperties.seriesWith,
              stepSize: 1,
              // displayFormats: {
              //   day: this.widgetInfo?.chartProperties?.seriesFormat ? this.getDataFormat() : 'MMM-DD-YY'
              // }
            },
            title: {
              display: true,
              text: this.widgetInfo.chartProperties.xAxisLabel ? this.widgetInfo.chartProperties.xAxisLabel : '',
            },
            ticks: {
              callback: (value) => {
                // added condition when we don't have labels or labels according to ticks
                if (this.chart.data.labels && this.chart.data.labels[value]?.length) {
                  const formattedDate = this.formtByTimePeriod(this.chart.data.labels[value]);
                  return formattedDate.length > this.labelTooltipCharLimit
                    ? formattedDate.slice(0, this.labelTooltipCharLimit) + '...'
                    : formattedDate;
                } else {
                  return value;
                }
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
            }
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
              callback(value, index, values) {
                return formatNumber(Number(value), 'en-US');
              },
            },
            grid: {
              tickLength: 0
            }
          },
        };
      }
    }
    if (this.chart) {
      this.chart.options.scales = this.timeSeriesOption.scales;
      if (this.chart.chart) this.chart.chart.options.scales = this.timeSeriesOption.scales;

    }
  }

  formtByTimePeriod(label){
    if(moment(label).isValid()){
        switch(this.selectedPeriodOption){
          case SeriesWith.day:{
            if(this.widgetInfo.chartProperties.chartType !== ChartType.LINE)
              return moment(label).format(this.getDataFormat());
            else return label;
            break;
          }
          case SeriesWith.year:{
            if(this.widgetInfo.chartProperties.chartType !== ChartType.LINE)
              return moment(label).format('YYYY');
            else return label;
            break;
          }
          case SeriesWith.week:{
            if(this.widgetInfo.chartProperties.chartType !== ChartType.LINE)
              return moment(label).endOf('week').format(this.getDataFormat());
            else return label;
            break;
          }
          case SeriesWith.month : {
            if(this.widgetInfo.chartProperties.chartType !== ChartType.LINE)
              return moment(label).format('MMM YYYY');
            else return label;
            break;
          }
          case SeriesWith.quarter:{
            const quarter1 = Math.floor((new Date(label).getMonth() / 3));
            const startQuarter = new Date(new Date(label).getFullYear(), quarter1 * 3, 1);
            const lastQuarter = new Date(startQuarter.getFullYear(), startQuarter.getMonth() + 3, 0);
            if(this.widgetInfo.chartProperties.chartType !== ChartType.LINE)
              return moment(startQuarter).format('MMM') + '-' + moment(lastQuarter).format('MMM') + ' ' + + moment(lastQuarter).format('YYYY')
            else return label;
            break;
          }
          default:{
            return label;
          }
        }
    }else{
      return label;
    }
  }

  /*
   * download chart as image
   */
  downloadImage() {
    this.changeScaleTicks(true);
    this.widgetService.downloadImage(this.chart.toBase64Image(), 'Time-Series.png');
    this.changeScaleTicks(false);
  }

  /**
   * Download data into CSV
   */
  downloadCSV(): void {
    const excelData = [];
    const tableData = [];
    let column;
    const newDataSet = JSON.parse(JSON.stringify(this.dataSet));

    const index = newDataSet.findIndex(item=> item.label === 'Total');
    if(index > -1 && index < newDataSet.length-1) {
      const column1 = newDataSet.splice(index,1)[0];
      newDataSet.push(column1);
    }
    newDataSet.forEach((dataArr) => {
      const key = 'id';
      if (dataArr[key] || dataArr[key] === '') {
        column = this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.fieldCtrl.fieldId;
        dataArr.data.forEach((dataObj, dIndex) => {
          const obj = {} as any;
          const axis = 'x';
          obj[this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.fieldCtrl.fieldId] =
            this.chartType === 'bar' ? dataObj[axis] : dataArr.label;
          this.dateAndCountFormat(dataObj, obj, dataArr);
          excelData.push(obj);
        });
      } else {
        dataArr.data.forEach((dataObj, dataIndex) => {
          const obj = {} as any;
          // In case of field ID is there..
          if (this.widgetInfo.fieldCtrl.fieldId) {
            column = this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.fieldCtrl.fieldId;
            if (this.widgetInfo.fieldCtrl.fieldId.toLowerCase() === 'time_taken' && this.widgetInfo.isStepwiseSLA) {
              obj[this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.fieldCtrl.fieldId] =
                this.chartLegend.length > 0 && this.chartLegend.length-1 >= dataIndex ? this.chartLegend[dataIndex] : '';
            } else
              obj[this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.fieldCtrl.fieldId] =
                this.chartLegend.length > 0 && this.chartLegend.length-1 >= dataIndex ? this.checkTextCode(this.chartLegend[dataIndex]) : '';
            if (
              !this.displayedColumnsId.includes(
                this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.fieldCtrl.fieldId
              )
            ) {
              this.displayedColumnsId.push(
                this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.fieldCtrl.fieldId
              );
            }
          }
          // In case of field ID is blank - groupWith and DistinctWith are there..
          else {
            column = this.widgetInfo.fieldCtrl ? this.widgetInfo.fieldCtrl.fieldDescri : this.widgetInfo.fieldCtrl.fieldId;
            obj[this.widgetInfo.distictWith] = this.chartLegend.length > 0 ? this.checkTextCode(this.chartLegend[dataIndex]) : '';
          }
          this.dateAndCountFormat(dataObj, obj, dataArr);
          excelData.push(obj);
        });
      }
    });

    const timeSeries =
      this.activeDateFormat.charAt(0).toUpperCase() + this.activeDateFormat.slice(1);
    excelData.forEach((item) => {
      const itemObj = {};
      const index1 = tableData.findIndex((tab) => tab[column] === item[column]);
      if (index1 > -1) {
        itemObj[item[timeSeries]] = item.Count;
        tableData[index1] = { ...tableData[index1], ...itemObj };
      } else {
        itemObj[column] = item[column];
        itemObj[item[timeSeries]] = item.Count;
        tableData.push(itemObj);
      }
    });

    if(this.widgetInfo.chartProperties.chartType === ChartType.LINE && (timeSeries === 'Quarter' || timeSeries === 'Month')) {
      const dataArray = [];
      tableData.forEach(tData => {
        if(tData[column] !== 'Total') {
          dataArray.push(Object.keys(tData).length);
        }
      });
      const index11 = dataArray.indexOf(Math.max(...dataArray));
      const newData = tableData.splice(index11,1);
      tableData.splice(0,0,newData[0])
    }

    this.widgetService.downloadCSV('Time-Chart', tableData);
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
    if (!this.widgetViewDetails?.payload || !this.widgetViewDetails?.payload?.uuid) {
      this.widgetService.saveWidgetView(widgetViewRequest).subscribe(
        (res) => {
          this.getwidgetData(this.widgetId);
        },
        (err) => {
          console.log('Error');
        }
      );
    } else {
      widgetViewRequest.uuid = this.widgetViewDetails?.payload?.uuid;
      this.widgetService.updateWidgetView(widgetViewRequest).subscribe(
        (res) => {
          this.getwidgetData(this.widgetId);
        },
        (err) => {
          console.log('Error');
        }
      );
    }
  }

  /**
   * Update stacked color based on color definations
   */

  updateColorBasedOnDefined(res: WidgetColorPalette) {
    this.widgetColorPalette = res;
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

      case 'mmm d, yy':
        return 'MMM D, YY';

      default:
        break;
    }
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  /**
   * method to change the x-axis time format
   */
  changeSeriesFormat() {
    const format = this.widgetInfo?.chartProperties?.seriesFormat ? this.getDataFormat() : 'MMM-DD-YY'
    this.dataSetlabel = [];
    const axis = 'x';
    const monthName = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    if(this.activeDateFormat === SeriesWith.week) {
        this.dataSet.forEach(dataArr => {
          dataArr.data.forEach(week => {
            week[axis] =  String(moment(new Date(week[axis])).endOf('week').format(format));
            const index1 = this.dataSetlabel.findIndex(item => item === week[axis]);
            if(index1 === -1) this.dataSetlabel.push(week[axis]);
          });
        });
      this.dataSetlabel.sort(this.sortDateFormat);
    } else if (this.activeDateFormat === SeriesWith.year) {
      this.dataSet.forEach(dataArr => {
        dataArr.data.forEach(year => {
          year[axis] = String(new Date(year[axis]).getFullYear());
          const index1 = this.dataSetlabel.findIndex(item => item === year[axis]);
          if(index1 === -1) {
            this.dataSetlabel.push(year[axis]);
          }
        });
      });
      this.dataSetlabel.sort(this.sortDateFormat);
    } else if (this.activeDateFormat === SeriesWith.month) {
      this.dataSet.forEach(dataArr => {
        dataArr.data.forEach(month1 => {
          const month = new Date(month1[axis]).getMonth();
          const year = new Date(month1[axis]).getFullYear();
          month1[axis] = monthName[month] + ' ' + year;
          const index1 = this.dataSetlabel.findIndex(item => item === month1[axis]);
          if(index1 === -1) {
            this.dataSetlabel.push(month1[axis]);
          }
        });
      });
      this.dataSetlabel.sort(this.sortDateFormat);
    } else if (this.activeDateFormat === SeriesWith.quarter) {
      this.dataSet.forEach(dataArr => {
        dataArr.data.forEach(quad => {
          const quarterStart = String(moment(new Date(quad[axis])).startOf('quarter').toDate().getMonth());
          const quarterEnd = String(moment(new Date(quad[axis])).endOf('quarter').toDate().getMonth());
          const year = new Date(quad[axis]).getFullYear();

          quad[axis] = monthName[quarterStart] + '-' + monthName[quarterEnd] + ' ' + year;
          const index1 = this.dataSetlabel.findIndex(item => item === quad[axis]);
          if(index1 === -1) this.dataSetlabel.push(quad[axis]);
        });
      });
      this.dataSetlabel.sort(this.sortDateFormat);
    } else if (this.activeDateFormat === SeriesWith.day) {
      this.dataSet.forEach(dataArr => {
        dataArr.data.forEach(day => {
          day[axis] = moment(day[axis]).format(format);
          const index1 = this.dataSetlabel.findIndex(item => item === day[axis]);
          if(index1 === -1) this.dataSetlabel.push(day[axis]);
        });
      });
      this.dataSetlabel.sort(this.sortDateFormat);
    }
    const time = 'time';
    delete this.timeSeriesOption.scales.x.type;
    delete this.timeSeriesOption.scales.x[time];
  }

  /**
   * method to sort date
   */
  sortDateFormat = (a,b) => {
    const monthName = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const getDate = date => {
      const year1 = date.split(' ');
      return year1;
    }
    if(this.activeDateFormat === SeriesWith.quarter) {
      const aDate = getDate(a);
      const bDate = getDate(b);
      const aMonth = aDate[0].split('-');
      const bMonth = bDate[0].split('-');

      return  aDate[1] - bDate[1] || monthName.indexOf(aMonth[0]) - monthName.indexOf(bMonth[0]);
    } else if (this.activeDateFormat === SeriesWith.month) {
      const aDate = getDate(a);
      const bDate = getDate(b);

      return aDate[1] - bDate[1] || monthName.indexOf(aDate[0]) - monthName.indexOf(bDate[0]);
    } else if (this.activeDateFormat === SeriesWith.day || this.activeDateFormat === SeriesWith.week) {
      const aDate = new Date(a).getTime();
      const bDate = new Date(b).getTime();

      return aDate - bDate;
    } else if (this.activeDateFormat === SeriesWith.year) {
      const aDate = getDate(a);
      const bDate = getDate(b);
      return aDate - bDate;
    }
  }

  /**
   * method to change scales label for image download
   */
   changeScaleTicks(image: boolean) {
    const scaleObj = 'x';
    if(image) {
      const ticks = {
        ...this.chart.options.scales[scaleObj].ticks,
        callback: (value) => {
        const formattedDate = this.formtByTimePeriod(this.chart.data.labels[value]);
          return formattedDate;
        }
      }
      this.chart.options.scales[scaleObj].ticks = ticks;
      this.chart.chart.options.scales[scaleObj].ticks = ticks;
    } else {
      const ticks = {
        ...this.chart.options.scales[scaleObj].ticks,
        callback: (value) => {
          const formattedDate = this.formtByTimePeriod(this.chart.data.labels[value]);
          return formattedDate.length > this.labelTooltipCharLimit
            ? formattedDate.slice(0, this.labelTooltipCharLimit) + '...'
            : formattedDate;
        }
      }
      this.chart.options.scales[scaleObj].ticks = ticks;
      this.chart.chart.options.scales[scaleObj].ticks = ticks;
    }

    this.chart?.update({
      duration: 0
    });
  }
}
