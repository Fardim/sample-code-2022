import { Component, OnInit, OnChanges, ViewChild, LOCALE_ID, Inject, SimpleChanges, OnDestroy } from '@angular/core';
import { GenericWidgetComponent } from '../../generic-widget/generic-widget.component';
import { BehaviorSubject, forkJoin, Subscription } from 'rxjs';
import { PieChartWidget, WidgetHeader, ChartLegend, Criteria, BlockType, ConditionOperator, WidgetColorPalette, DisplayCriteria, WidgetType, WidgetViewDetails, WidgetView, WidgetViewRequestPayload } from '../../../_models/widget';
import { WidgetService } from 'src/app/_services/widgets/widget.service';
import { ReportService } from '../../../_service/report.service';
import { ChartOptions, LegendItem, TooltipItem, ChartEvent, Chart } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { formatNumber } from '@angular/common';
import { Userdetails } from '@models/userdetails';
import { UserService } from '@services/user/userservice.service';

@Component({
  selector: 'pros-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent extends GenericWidgetComponent implements OnInit, OnChanges, OnDestroy {

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
  pieWidget: BehaviorSubject<PieChartWidget> = new BehaviorSubject<PieChartWidget>(null);
  widgetHeader: WidgetHeader = new WidgetHeader();
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
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;
  public pieChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index'
    },
    onClick: (event?: ChartEvent, activeElements?: Array<{}>) => {
      this.stackClickFilter(event.native, activeElements);
    },
    scales:{
      x:{
        grid:{
          display:false
        },
        display:false
      },
      y:{
        grid:{
          display:false
        },
        display:false
      }
    },
    plugins: {
      datalabels: {
        display: false,
        formatter: (value, ctx) => {
          if (this.total > 0) {
            return (value * 100 / this.total).toFixed(2) + '%';
          }
        },
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

  ngOnChanges(changes: SimpleChanges): void {

    if (changes && changes.filterCriteria && changes.filterCriteria.currentValue !== changes.filterCriteria.currentValue.previousValue && !this.widgetHeader.isEnableGlobalFilter) {
      this.lablels = [];
      this.chartLegend = [];
      this.pieChartData = [{
        data: [0, 0, 0, 0,0,],
        borderAlign: 'center',
        backgroundColor: []
      }];
      this.pieWidget.next(this.pieWidget.getValue());
    }
    if (changes && changes.boxSize && changes.boxSize.previousValue !== changes.boxSize.currentValue) {
      this.boxSize = changes.boxSize.currentValue;
    }
  }

  ngOnInit(): void {
    this.getPieChartMetadata();
    this.getHeaderMetaData();
    this.pieWidget.subscribe(res => {
      if (res) {
        this.getPieChartData(this.widgetId, this.filterCriteria);
      }
    });

    // after color defined update on widget
    const afterColorDefined = this.afterColorDefined.subscribe(res => {
      if (res) {
        this.updateColorBasedOnDefined(res);
      }
    });
    this.subscriptions.push(afterColorDefined);

    const getDisplayCriteria = this.widgetService.getDisplayCriteria(this.widgetInfo.widgetId, this.widgetInfo.widgetType).subscribe(res => {
      this.displayCriteriaOption = res.displayCriteria;
    }, error => {
      console.error(`Error : ${error}`);
    });
    this.subscriptions.push(getDisplayCriteria);

    this.userService.getUserDetails().subscribe(
      (response: Userdetails) => {
        this.userDetails = response;
      }
    );
  }

  public getHeaderMetaData(): void {
    this.widgetService.getHeaderMetaData(this.widgetId).subscribe(returnData => {
      this.widgetHeader = returnData;
    }, error => console.error(`Error : ${error}`));
  }

  ngOnDestroy(): void {
    this.pieWidget.complete();
    this.pieWidget.unsubscribe();
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  /**
   * function to get meta data regarding pie chart
   */
  public getPieChartMetadata(): void {
    // for time being this is getBarChartMetadata used to fetch data from API
    this.widgetService.getBarChartMetadata(this.widgetId).subscribe(returndata => {
      this.widgetColorPalette = returndata.widgetColorPalette;
      this.pieWidget.next(returndata);
      this.getPieConfigurationData();
    }, error => {
      console.error(`Error : ${error}`);
    });
  }

  /**
   * function to get configuration of pie chart like legend positions, data lables etcetra..
   */
  public getPieConfigurationData(): void {

    // if showLegend flag will be true it show legend on Stacked bar widget
    if (this.pieWidget.getValue().isEnableLegend) {
      this.pieChartOptions.plugins.legend = {
        ...this.pieChartOptions.plugins.legend,
        display: true,
        position: this.pieWidget.getValue().legendPosition,
      };
      if(this.chart) {
        this.chart.options.plugins.legend = this.pieChartOptions.plugins.legend;
        this.chart.chart.options.plugins.legend = this.pieChartOptions.plugins.legend;
      }
    }

    //  if showCountOnStack flag will be true it show datalables on stack and position of datalables also configurable
    if (this.pieWidget.getValue().isEnableDatalabels) {
      this.pieChartOptions.plugins.datalabels = {
        ...this.pieChartOptions.plugins.datalabels,
        formatter(value, context) {
          return formatNumber(Number(value), 'en-US');
        },
        display: true,
        align: this.pieWidget.getValue().datalabelsPosition,
        anchor: this.pieWidget.getValue().datalabelsPosition,
      };
      if(this.chart){
        this.chart.options.plugins.datalabels = this.pieChartOptions.plugins.datalabels;
        this.chart.chart.options.plugins.datalabels = this.pieChartOptions.plugins.datalabels;
      }
    }
  }

  /**
   * function to get data of the pie chart
   * @param widgetId Id of the widget
   * @param critria crieteria
   */
   public getPieChartData(widgetId: number, critria: Criteria[]): void {
     forkJoin([this.widgetService.getWidgetView(String(this.reportId),String(widgetId)),this.widgetService.getWidgetData(String(widgetId), critria,'','','', this.userDetails.defLocs.toString())]).subscribe(res=>{
      this.widgetViewDetails = res[0];
      this.returndata = res[1];
      this.updateChart(this.returndata);
     },err=>{
       console.log('Error');
     })
  }

  public updateChart(returndata) {
    const res = Object.keys(returndata.aggregations);
    let arrayBuckets  = returndata.aggregations[res[0]] ? returndata.aggregations[res[0]].buckets ? returndata.aggregations[res[0]].buckets : []: [];
    if(arrayBuckets.length === 0) {
      const buckets1 = returndata.aggregations['nested#Nest_Bar'];
      const resValue = Object.keys(buckets1);
      const value = resValue.filter(data => {
        return data.includes('#BAR_CHART');
      });
      arrayBuckets  = buckets1[value[0]] ? buckets1[value[0]].buckets ? buckets1[value[0]].buckets : [] : [];
    }
    this.dataSet = [];
    arrayBuckets.forEach(bucket => {
      const key = bucket.key === '' ? this.pieWidget.value.blankValueAlias !== undefined ? this.pieWidget.value.blankValueAlias : '' : bucket.key;
      this.lablels.push(key);
      this.dataSet.push(bucket.doc_count);
    });
    if (this.pieWidget.getValue().metaData && (this.pieWidget.getValue().metaData.picklist === '0' && (this.pieWidget.getValue().metaData.dataType === 'DTMS' || this.pieWidget.getValue().metaData.dataType === 'DATS'))) {
      if (this.chartLegend.length === 0) {
        this.getDateFieldsDesc(arrayBuckets);
      } else {
        this.setLabels();
      }
    } else if (this.pieWidget.getValue().metaData && (this.pieWidget.getValue().metaData.picklist === '1' || this.pieWidget.getValue().metaData.picklist === '37' || this.pieWidget.getValue().metaData.picklist === '30')) {
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

    if (this.pieWidget.getValue().isEnabledBarPerc) {
      this.total = this.dataSet.length ? Number(this.dataSet.reduce((accumulator, currentValue) => accumulator + currentValue)) : 0;
      this.chart.chart.options = {
        ...this.chart.chart.options,
        plugins: {
          datalabels: {
            display: true,
            formatter: (value, ctx) => {
              if (this.total > 0) {
                return (value * 100 / this.total).toFixed(2) + '%';
              }
            },
          }
        },
        onClick: (event?: ChartEvent, activeElements?: Array<{}>) => {
          this.stackClickFilter(event.native, activeElements);
        },
      }
    }

    this.pieChartData = [{
      data: this.dataSet,
      type: 'pie',
      backgroundColor: this.pieChartColors[0].backgroundColor
    }];
    this.chart.data.datasets = this.pieChartData;
    this.getColor();

    // update chart after data sets change
    if (this.chart && !this.isTableView) {
      this.chart.update();
    }
    if(this.widgetViewDetails?.payload.view === WidgetView.TABLE_VIEW){
      this.isTableView = true;
      this.getTableData();
    }
    else{
      this.isTableView = false;
    }
  }

  /**
   * Update label based on configuration
   * @param buckets update lable
   */
  getFieldsDesc(buckets: any[]) {
    const fldid = this.pieWidget.getValue().fieldId;
    let locale = this.locale !== '' ? this.locale.split('-')[0] : 'EN';
    locale = locale.toUpperCase();
    const finalVal = {} as any;
    buckets.forEach(bucket => {
      let chartLegend: ChartLegend;
      let key = bucket.key === '' ? this.pieWidget.value.blankValueAlias !== undefined ? this.pieWidget.value.blankValueAlias : '' : bucket.key;
      const hits = bucket['top_hits#items'] ? bucket['top_hits#items'].hits.hits[0] : null;
      const val = hits._source.hdvs ? (hits._source.hdvs[fldid] ?
        (hits._source.hdvs[fldid] ? hits._source.hdvs[fldid].vc : null) : null) :
        (hits._source.staticFields && hits._source.staticFields[fldid]) ?
        ( hits._source.staticFields[fldid] ? hits._source.staticFields[fldid].vc : null) :
        ( hits._source[fldid] ? hits._source[fldid].vc : null);
      if(val) {
        const valArray = [];
        val.forEach(v => {
          if (v.t) {
            valArray.push(v.t);
          }
          if(v.c) {
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
      } if (this.pieWidget.getValue().metaData.picklist === '35') {
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
    const fldid = this.pieWidget.getValue().fieldId;
    const finalVal = {} as any;
    buckets.forEach(bucket=>{
      const key = bucket.key === '' ? this.pieWidget.value.blankValueAlias !== undefined ? this.pieWidget.value.blankValueAlias : '' : bucket.key;
      const hits = bucket['top_hits#items'] ? bucket['top_hits#items'].hits.hits[0] : null;
      const val = hits._source.hdvs ? (hits._source.hdvs[fldid] ?
        (hits._source.hdvs[fldid] ? hits._source.hdvs[fldid].vc : null) : null) :
        (hits._source.staticFields && hits._source.staticFields[fldid]) ?
        ( hits._source.staticFields[fldid] ? hits._source.staticFields[fldid].vc : null) :
        ( hits._source[fldid] ? hits._source[fldid].vc : null);
      if(val) {
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
    const fldid = this.pieWidget.getValue().fieldId;
    const finalVal = {} as any;
    buckets.forEach(bucket => {
      let chartLegend: ChartLegend;
      let key = bucket.key === '' ? this.pieWidget.value.blankValueAlias !== undefined ? this.pieWidget.value.blankValueAlias : '' : bucket.key;
      const hits = bucket['top_hits#items'] ? bucket['top_hits#items'].hits.hits[0] : null;
      const val = hits._source.hdvs ? (hits._source.hdvs[fldid] ?
        (hits._source.hdvs[fldid] ? hits._source.hdvs[fldid].vc : null) : null) :
        (hits._source.staticFields && hits._source.staticFields[fldid]) ?
        ( hits._source.staticFields[fldid] ? hits._source.staticFields[fldid].vc : null) :
        ( hits._source[fldid] ? hits._source[fldid].vc : null);
      if (val) {
        const valArray = [];
        val.forEach(v => {
          if (v.t) {
            valArray.push(v.t);
          }
          if(v.c) {
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
    this.setLabels();
  }

  legendClick(legendItem: LegendItem) {
    let clickedLegend = this.chartLegend[legendItem.datasetIndex] ? this.chartLegend[legendItem.datasetIndex].code : this.lablels[legendItem.datasetIndex];
    if (clickedLegend === undefined) {
      return false;
    }
    if (clickedLegend === this.pieWidget.value.blankValueAlias) {
      clickedLegend = '';
    }
    const fieldId = this.pieWidget.getValue().fieldId;
    let appliedFilters = this.filterCriteria.filter(fill => fill.fieldId === fieldId);
    this.removeOldFilterCriteria(appliedFilters);
    if (appliedFilters.length > 0) {
      const res = appliedFilters.filter(fill => fill.fieldId === fieldId && fill.widgetType === WidgetType.PIE_CHART && this.widgetHeader.isEnableGlobalFilter);
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
      appliedFilters.push(critera1);
    }
    if (this.pieWidget.getValue().metaData.dataType === 'DTMS' || this.pieWidget.getValue().metaData.dataType === 'DATS') {
      appliedFilters.shift();
      appliedFilters.push(this.applyDateFilter(clickedLegend, fieldId));
    }
    appliedFilters.forEach(app => this.filterCriteria.push(app));
    this.emitEvtFilterCriteria(this.filterCriteria);

  }
  stackClickFilter(event?: any, activeElements?: Array<any>) {
    if (activeElements && activeElements.length) {
      const option = this.chart.chart.getElementsAtEventForMode(event, 'index', { intersect: true }, false) as any;
      const clickedIndex = (option[0])._index;
      const clickedLagend = this.chartLegend[clickedIndex];
      const drpCode = this.chartLegend[clickedIndex] ? this.chartLegend[clickedIndex].code : this.lablels[clickedIndex];
      if (drpCode === undefined) {
        return false;
      }
      const fieldId = this.pieWidget.getValue().fieldId;
      let appliedFilters = this.filterCriteria.filter(fill => fill.fieldId === fieldId);
      this.removeOldFilterCriteria(appliedFilters);
      if (appliedFilters.length > 0) {
        const res = appliedFilters.filter(fill => fill.fieldId === fieldId && fill.widgetType === WidgetType.PIE_CHART && this.widgetHeader.isEnableGlobalFilter);
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
      if (this.pieWidget.getValue().metaData.dataType === 'DTMS' || this.pieWidget.getValue().metaData.dataType === 'DATS') {
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
    this.chart.data.datasets[0].backgroundColor = this.pieChartColors[0]?.backgroundColor;
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
      obj[this.pieWidget.getValue().metaData ? this.pieWidget.getValue().metaData.fieldDescri : this.pieWidget.getValue().fieldId] = this.lablels[i] + '\t';
      obj.Value = formatNumber(Number(this.dataSet[i]), 'en-US') + '\t';
      excelData.push(obj);
    }
    this.widgetService.downloadCSV('Pie-Chart', excelData);
  }

  /*
  * download chart as image
  */
  downloadImage() {
    this.widgetService.downloadImage(this.chart.toBase64Image(), 'Pie-Chart.png');
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
    req.widgetDesc = this.widgetHeader.desc;
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
    this.chart.data.labels = this.lablels;
    this.chart.chart.data.labels = this.lablels;
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
    return critera;
  }

  /**
   * Changes widget view
   */
   viewChange(value){
    const widgetViewRequest: WidgetViewRequestPayload = {
      uuid:'',
      reportId: this.reportId,
      widgetId: this.widgetId,
      view: value ? WidgetView.TABLE_VIEW : WidgetView.GRAPH_VIEW
    }
    if(this.widgetViewDetails?.payload.uuid === ''){
       this.widgetService.saveWidgetView(widgetViewRequest).subscribe(res=>{
        this.pieWidget.next(this.pieWidget.getValue());
       },err =>{
         console.log('Error')
       });
    }
    else{
      widgetViewRequest.uuid = this.widgetViewDetails?.payload.uuid;
      this.widgetService.updateWidgetView(widgetViewRequest).subscribe(res=>{
        this.pieWidget.next(this.pieWidget.getValue());
      },err =>{
        console.log('Error')
      });
    }
  }

  /**
   * @returns table dataSource
   */
   getTableData(){
    const excelData = [];
    for (let i = 0; i < this.lablels.length; i++) {
      const obj = {} as any;
      obj[this.pieWidget.getValue().metaData ? this.pieWidget.getValue().metaData.fieldDescri : this.pieWidget.getValue().fieldId] = this.lablels[i] + '\t';
      obj.Value = formatNumber(Number(this.dataSet[i]), 'en-US') + '\t';
      excelData.push(obj);
    }
    if(!this.displayedColumnsId.includes(this.pieWidget.getValue().metaData ? this.pieWidget.getValue().metaData.fieldDescri : this.pieWidget.getValue().fieldId)){
      this.displayedColumnsId.push(this.pieWidget.getValue().metaData ? this.pieWidget.getValue().metaData.fieldDescri : this.pieWidget.getValue().fieldId);
    }
    if(!this.displayedColumnsId.includes('Value')){
      this.displayedColumnsId.push('Value');
    }
    this.tableDataSource = excelData
   }
}
