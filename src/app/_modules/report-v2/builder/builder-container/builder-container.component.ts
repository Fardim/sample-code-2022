import {
  Component,
  OnInit,
  Input,
  AfterViewInit,
  ElementRef,
  HostListener,
  OnChanges,
  Output,
  EventEmitter,
  ViewChild,
  OnDestroy,
  ViewChildren,
  QueryList,
  ChangeDetectorRef,
} from '@angular/core';
import { ReportService } from '../../_service/report.service';
import {
  Criteria,
  Widget,
  Report,
  ReportDashboardReq,
  WidgetType,
  ChartType,
  Orientation,
  DatalabelsPosition,
  LegendPosition,
  TimeseriesStartDate,
  SeriesWith,
} from '../../_models/widget';
import { UserService } from '@services/user/userservice.service';
import { Subject, Subscription } from 'rxjs';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { GridsterConfig, GridsterComponent, GridsterItemComponent } from 'angular-gridster2';
import { PieChartComponent } from './pie-chart/pie-chart.component';
import { ReportingListComponent } from './reporting-list/reporting-list.component';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { Router } from '@angular/router';
import { WidgetService } from '@services/widgets/widget.service';
import { isEqual } from 'lodash';
import { debounceTime } from 'rxjs/operators';
import { GlobaldialogService } from '@services/globaldialog.service';

@Component({
  selector: 'pros-builder-container',
  templateUrl: './builder-container.component.html',
  styleUrls: ['./builder-container.component.scss'],
})
export class BuilderContainerComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input()
  reportId: number;

  @Input()
  editedMode: boolean;

  @Input()
  emitClearBtnEvent: boolean;

  @Input()
  emtClearBtnClickedEvent: boolean;

  @Input()
  report: Report;

  @Input()
  widgetList: Widget[];

  @Input()
  activeWidget: Widget;

  @Output()
  activeWidgetChange: EventEmitter<Widget> = new EventEmitter<Widget>();

  @Output()
  getReport: EventEmitter<null> = new EventEmitter<null>();

  @Output()
  emitSetPanel: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  saveDraft: EventEmitter<ReportDashboardReq> = new EventEmitter<ReportDashboardReq>();

  @Output()
  emitFilterApplied: EventEmitter<boolean> = new EventEmitter<boolean>();

  screenWidth = 0;
  noOfboxes = 200; // Initial 200
  boxSize: number;

  filterCriteria: Criteria[] = [];

  subscriptions: Subscription[] = [];

  maximumFilterWidgetCount: number;
  additionalFilterWidgetCount: number;
  maxFilterHeight;
  currentDraggedElementType: WidgetType;
  @ViewChild('rootContainer') rootContainer: ElementRef<HTMLElement>;
  @ViewChild(GridsterComponent) gridsterComponent: GridsterComponent;
  @ViewChildren('pieChart') pieChartComponent: QueryList<PieChartComponent>;
  @ViewChildren(BarChartComponent) barChartComponent: QueryList<BarChartComponent>;
  @ViewChildren(ReportingListComponent) reportingListComponent: QueryList<ReportingListComponent>;
  @ViewChild('filter') filter: ElementRef<HTMLElement>;

  options: GridsterConfig;

  addWidgetList = [
    { key: WidgetType.FILTER, value: 'Filter' },
    { key: WidgetType.COUNT, value: 'Metric' },
    { key: WidgetType.TABLE_LIST, value: 'Table list' },
    { key: WidgetType.BAR_CHART, value: 'Bar/pie chart' },
    { key: WidgetType.STACKED_BAR_CHART, value: 'Stacked bar chart' },
    { key: WidgetType.IMAGE, value: 'Image' },
    { key: WidgetType.HTML, value: 'HTML editor' },
    { key: WidgetType.TIMESERIES, value: 'Time series' },
    { key: WidgetType.DATASET_LIST, value: 'List' },
  ];
  searchWidgetList = this.addWidgetList;
  showPropertyPanel: boolean;
  filteredData: Widget[];
  filteredWidgetList: Widget[] = [];

  batchSave: Widget[] = [];
  saveQueue: Subject<Widget> = new Subject<Widget>();

  constructor(
    private reportService: ReportService,
    private userService: UserService,
    private sharedService: SharedServiceService,
    private router: Router,
    private widgetService: WidgetService,
    private globalDialogService: GlobaldialogService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  ngOnChanges(changes: import('@angular/core').SimpleChanges): void {
    if (changes && changes.emitClearBtnEvent && changes.emitClearBtnEvent.currentValue) {
      this.filterCriteria = [];
      this.emitFilterApplied.emit(false);
    }

    if (changes && changes.reportId && changes.reportId.currentValue !== changes.reportId.previousValue) {
      this.filterCriteria = [];
    }

    if (changes && changes.editedMode && changes.editedMode.currentValue !== changes.editedMode.previousValue) {
      this.changeEditedMode();
      if (changes.editedMode.previousValue !== undefined)
        setTimeout(() => {
          this.resize();
        }, 50);
    }

    if (changes && changes.widgetList && !isEqual(changes.widgetList.currentValue, changes.widgetList.previousValue)) {
      const filteredWidgetList = changes.widgetList?.currentValue?.filter((item) => item.widgetType === WidgetType.FILTER);
      this.widgetService.setFilterWidgetList(filteredWidgetList);
      this.widgetList = changes.widgetList?.currentValue?.filter((item) => item.widgetType !== WidgetType.FILTER);
      this.getFilteredWidgetData(this.editedMode);
    }
  }

  ngAfterViewInit(): void {
    this.resize();
    const sharedSub = this.sharedService.getSecondarySideNavBarState().subscribe((res) => {
      this.resize();
      this.resizeGridster();
    });
    this.subscriptions.push(sharedSub);
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    const saveQueue = this.saveQueue.pipe(debounceTime(2000)).subscribe((widget) => {
      this.saveGridsterProp();
    });
    this.subscriptions.push(saveQueue);
  }

  public changeEditedMode() {
    if (this.editedMode) {
      this.options = {
        itemChangeCallback: (item: Widget, itemComponent: GridsterItemComponent) => {
          console.log('itemChange', item);
          item.width = Math.floor(itemComponent.width / this.boxSize);
          item.height = Math.floor(itemComponent.height / this.boxSize);
          this.addToBatchSave(item);
        },
        itemResizeCallback: (item) => {
          console.log('itemResized', item);
        },
        draggable: {
          enabled: true,
        },
        resizable: {
          enabled: true,
        },
        swap: true,
        pushItems: true,
        disablePushOnDrag: false,
        disablePushOnResize: false,
        pushDirections: { north: true, east: true, south: true, west: true },
        pushResizeItems: false,
        gridType: 'scrollVertical',
        minCols: 10,
        maxCols: 10,
        minRows: 5,
        maxRows: 100,
        margin: 12,
      };
    } else {
      this.options = {
        itemChangeCallback: (item: Widget) => {
          console.log('itemChange not in editedMode:', item);
        },
        itemResizeCallback: (item) => {
          console.log('itemResized', item);
        },
        draggable: {
          enabled: false,
        },
        resizable: {
          enabled: false,
        },
        swap: false,
        pushItems: false,
        disablePushOnDrag: false,
        disablePushOnResize: false,
        pushDirections: { north: false, east: false, south: false, west: false },
        pushResizeItems: false,
        gridType: 'scrollVertical',
        minCols: 10,
        maxCols: 10,
        minRows: 5,
        maxRows: 100,
        margin: 12,
      };
    }
  }

  changeFilterCriteria(criteria: Criteria[], isFilter?: boolean) {
    if (criteria.length !== 0) {
      this.filterCriteria = new Array();
      criteria.forEach((loop) => this.filterCriteria.push(loop));
      this.emitFilterApplied.emit(this.filterCriteria.length ? true : false);
    } else {
      this.emitFilterApplied.emit(false);
    }
  }

  @HostListener('window:resize')
  resize() {
    if (this.rootContainer) {
      this.screenWidth = this.rootContainer.nativeElement.clientWidth;
      this.boxSize = this.screenWidth / this.noOfboxes;
      if (this.filter) {
        this.maxFilterHeight = this.filter.nativeElement.clientHeight + 52 + 8;
      }
      this.getFilteredWidgetData(this.editedMode);
    }
  }

  searchWidget(searchString: string) {
    if (searchString) {
      this.searchWidgetList = this.addWidgetList.filter((w) =>
        w.value ? w.value.toLocaleLowerCase().indexOf(searchString.toLocaleLowerCase()) !== -1 : false
      );
    } else {
      this.searchWidgetList = this.addWidgetList;
    }
  }

  addWidget(widgetType: WidgetType) {
    // this.widgetList.push({ x: 0, y: 0, cols: 1, rows: 1, widgetType, widgetId: Number(new Date().getTime()) } as any);
    let cols = 2;
    let rows = 2;
    switch (widgetType) {
      case WidgetType.COUNT:
        cols = 1;
        rows = 1;
        break;
      case WidgetType.TABLE_LIST || WidgetType.DATASET_LIST:
        cols = 4;
        rows = 3;
        break;
      case WidgetType.TIMESERIES:
        cols = 3;
        rows = 3;
        break;
    }
    const widget = new Widget();
    const gridsterItem = this.gridsterComponent.getFirstPossiblePosition({ x: 0, y: 0, cols, rows });
    widget.x = gridsterItem.x;
    widget.y = gridsterItem.y;
    widget.cols = gridsterItem.cols;
    widget.rows = gridsterItem.rows;
    widget.widgetType = widgetType;
    widget.widgetId = String(new Date().getTime());

    // add chart properties on widget list
    if (
      widget.widgetType === WidgetType.BAR_CHART ||
      widget.widgetType === WidgetType.STACKED_BAR_CHART ||
      widget.widgetType === WidgetType.TIMESERIES
    ) {
      widget.chartProperties = {
        chartType: ChartType.BAR,
        orientation: Orientation.VERTICAL,
        isEnableDatalabels: false,
        datalabelsPosition: DatalabelsPosition.center,
        isEnableLegend: false,
        legendPosition: LegendPosition.top,
        xAxisLabel: '',
        yAxisLabel: '',
        orderWith: null,
        scaleFrom: null,
        scaleTo: null,
        stepSize: null,
        dataSetSize: null,
        seriesWith: SeriesWith.day,
        seriesFormat: null,
        blankValueAlias: null,
        timeseriesStartDate: TimeseriesStartDate.D7,
        isEnabledBarPerc: false,
        bucketFilter: null,
        hasCustomSLA: false,
        showTotal: false,
      };
    }

    const request: ReportDashboardReq = this.getRequest();
    request.widgetReqList = [widget];
    this.saveDraft.emit(request);
    return widget;
  }

  addToBatchSave(widget: Widget) {
    const index = this.batchSave.findIndex((w) => w.widgetId === widget.widgetId);
    if (index !== -1) {
      this.batchSave.splice(index, 1);
    }
    this.batchSave.push(widget);
    this.saveQueue.next();
  }

  saveGridsterProp() {
    const request: ReportDashboardReq = this.getRequest();
    request.widgetReqList = this.batchSave;
    request.noRefresh = true;
    // console.log('request:', request);
    this.saveDraft.emit(request);
    this.batchSave = [];
  }

  getRequest() {
    const request: ReportDashboardReq = new ReportDashboardReq();
    request.reportId = this.reportId;
    request.reportName = this.report.reportName;
    request.reportDesciption = this.report.reportDesciption;
    return request;
  }

  setActiveWidget(widget: Widget) {
    this.activeWidgetChange.emit(widget);
  }

  setPanel(value: boolean) {
    this.emitSetPanel.emit(value);
  }

  resizeGridster() {
    if (this.gridsterComponent) {
      this.gridsterComponent.optionsChanged();
    }
  }

  /**
   * delete widget save as draft
   * @param widgetId Selected widget id
   */
  deleteWidgetDraft(widgetId: number) {
      this.globalDialogService.confirm({ label: 'Are you sure you want to delete ?' }, (resp) => {
        if (resp && resp === 'yes') {
          this.reportService.deleteWidget(this.reportId, widgetId).subscribe((res) => {
            this.setActiveWidget(undefined);
            this.setPanel(false);
            let index = this.widgetList.findIndex((wid) => String(wid.widgetId) === String(widgetId));
            if (index !== -1) {
              this.widgetList.splice(index, 1);
            }

            index = this.report.widgets.findIndex((wid) => String(wid.widgetId) === String(widgetId));
            if (index !== -1) {
              this.report.widgets.splice(index,1);
            }

            index = this.filteredWidgetList.findIndex((wid) => String(wid.widgetId) === String(widgetId));
            if (index !== -1) {
              this.filteredWidgetList.splice(index, 1);
            }
          });
        } else {
          return;
        }
      });
  }

  openFilterSideSheet() {
    this.router.navigate([{ outlets: { sb: `sb/report-v2/filters-list/${this.reportId}` } }]);
  }

  getFilteredWidgetData(editedMode) {
    this.filteredWidgetList = this.widgetService.getFilterWidgetList;
    if (!editedMode && this.rootContainer) {
      this.screenWidth = this.rootContainer.nativeElement.clientWidth;
      this.maximumFilterWidgetCount = Math.floor((this.screenWidth - 40 - 24) / 155);
      const filterWidgetData = this.widgetService.getFilterWidgetList;
      if (!this.filteredWidgetList.length || filterWidgetData.length > this.maximumFilterWidgetCount) {
        if (filterWidgetData.length > this.maximumFilterWidgetCount)
          this.additionalFilterWidgetCount = filterWidgetData.length - this.maximumFilterWidgetCount;
        this.filteredWidgetList = filterWidgetData.slice(0, this.maximumFilterWidgetCount);
      } else {
        this.additionalFilterWidgetCount = null;
        this.filteredWidgetList = filterWidgetData;
      }
    } else {
      this.filteredWidgetList = this.widgetService.getFilterWidgetList;
    }
  }

  trackByfn(index, item) {
    return item.widgetId;
  }
}
