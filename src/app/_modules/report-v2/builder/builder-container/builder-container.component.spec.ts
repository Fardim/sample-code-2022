import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuilderContainerComponent } from './builder-container.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Criteria, WidgetType, Widget, Report, ReportDashboardReq } from '../../_models/widget';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { SharedModule } from '@modules/shared/shared.module';
import { GridsterComponent } from 'angular-gridster2';
import { SimpleChanges } from '@angular/core';
import { of } from 'rxjs';
import { ReportService } from '@modules/report-v2/_service/report.service';
import { RouterTestingModule } from '@angular/router/testing';
import { WidgetService } from '@services/widgets/widget.service';
import { MatDialog } from '@angular/material/dialog';

describe('BuilderContainerComponent', () => {
  let component: BuilderContainerComponent;
  let fixture: ComponentFixture<BuilderContainerComponent>;
  let widgetService: WidgetService;
  let dialogSpy: jasmine.Spy;
  const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BuilderContainerComponent],
      imports: [HttpClientTestingModule, AppMaterialModuleForSpec, SharedModule, RouterTestingModule],
      providers: [ReportService, WidgetService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuilderContainerComponent);
    component = fixture.componentInstance;
    widgetService = fixture.debugElement.injector.get(WidgetService);
    dialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
    component.report = new Report();
    component.reportId = 111;
    component.options = {
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
      minCols: 4,
      // maxCols: 5,
      minRows: 5,
      maxRows: 100,
      margin: 5,
    };
    component.widgetList = [];
    component.maxFilterHeight = 68;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('changeFilterCriteria(), should update criteria', async(() => {
    const filterCritera = [];
    component.filterCriteria = filterCritera;
    component.changeFilterCriteria(filterCritera);
    expect(filterCritera).toEqual(component.filterCriteria);

    const critera = new Criteria();
    critera.conditionFieldId = 'MATL_TYPE';
    critera.conditionFieldValue = 'ZMRO';
    filterCritera.push(critera);

    component.filterCriteria = filterCritera;
    component.changeFilterCriteria(filterCritera);
    expect(filterCritera).toEqual(component.filterCriteria);

    critera.conditionFieldValue = 'HERS';
    component.changeFilterCriteria([critera]);
    expect(critera.conditionFieldValue).toEqual(component.filterCriteria[0].conditionFieldValue);
  }));

  it('ngAfterViewInit() should call resize', () => {
    spyOn(component, 'resize');
    fixture.detectChanges();
    component.resize();
    expect(component.resize).toHaveBeenCalled();
  });

  it('ngOnDestroy(), should unsubscribe from all observable', async(() => {
    const sub = of({}).subscribe();
    component.subscriptions.push(sub);
    spyOn(component.subscriptions[0], 'unsubscribe');
    component.ngOnDestroy();
    expect(component.subscriptions[0].unsubscribe).toHaveBeenCalled();
  }));

  it('ngOnChanges(), should call reset when reset dashboard', async(() => {
    const chnages: SimpleChanges = {
      emitClearBtnEvent: { currentValue: true, previousValue: false, firstChange: null, isFirstChange: null },
    };
    // component.emitClearBtnEvent = false;
    component.filterCriteria = [{ fieldId: 'test' } as Criteria, { fieldId: 'test1' } as Criteria];
    component.ngOnChanges(chnages);
    expect(component.filterCriteria.length).toEqual(0);

    const chnages2: SimpleChanges = {
      emitClearBtnEvent: { currentValue: false, previousValue: false, firstChange: null, isFirstChange: null },
    };
    component.filterCriteria = [{ fieldId: 'test' } as Criteria, { fieldId: 'test1' } as Criteria];
    component.ngOnChanges(chnages2);
    expect(component.filterCriteria.length).toEqual(2);

    const chnages3: SimpleChanges = { editedMode: { currentValue: true, previousValue: false, firstChange: null, isFirstChange: null } };
    spyOn(component, 'changeEditedMode');
    spyOn(component, 'resize');
    component.ngOnChanges(chnages3);
    expect(component.changeEditedMode).toHaveBeenCalled();

    const changes3: SimpleChanges = {
      widgetList: {
        currentValue: [{ widgetType: WidgetType.FILTER, widgetId: '4878478' }],
        previousValue: [],
        firstChange: null,
        isFirstChange: null,
      },
    };
    spyOn(component, 'getFilteredWidgetData');
    spyOn(widgetService, 'setFilterWidgetList');
    component.ngOnChanges(changes3);
    expect(component.changeEditedMode).toHaveBeenCalled();
  }));

  it('ngOnInit(), check all pre require', async(() => {
    component.subscriptions = [];

    component.ngOnInit();
    expect(component.subscriptions.length).toEqual(1, 'Size should be 1');
  }));

  it('changeEditedMode(), should set options', async(() => {
    component.changeEditedMode();
    expect(component.options.swap).toBeFalsy();
    expect(component.options.pushItems).toBeFalsy();
    expect(component.options.disablePushOnDrag).toBeFalsy();
    expect(component.options.draggable.enabled).toBeFalsy();
    expect(component.options.resizable.enabled).toBeFalsy();

    component.editedMode = true;
    component.changeEditedMode();
    expect(component.options.swap).toBeTruthy();
    expect(component.options.pushItems).toBeTruthy();
    expect(component.options.disablePushOnDrag).toBeFalsy();
    expect(component.options.draggable.enabled).toBeTruthy();
    expect(component.options.resizable.enabled).toBeTruthy();
  }));

  it('searchWidget(), should set searchWidgetList', async(() => {
    component.searchWidget('bar');
    expect(component.searchWidgetList).not.toEqual(component.addWidgetList);

    component.searchWidget('');
    expect(component.searchWidgetList).toEqual(component.addWidgetList);
  }));

  it('addWidget(), should add a widget', () => {
    component.gridsterComponent = TestBed.createComponent(GridsterComponent).componentInstance;
    const spy = spyOn(component.gridsterComponent, 'getFirstPossiblePosition').and.returnValue({ x: 0, y: 0, cols: 2, rows: 2 });
    // spy on event emitter
    spyOn(component.saveDraft, 'emit');
    let widget = component.addWidget(WidgetType.BAR_CHART);
    expect(component.saveDraft.emit).toHaveBeenCalled();
    expect(widget.cols).toBe(2);
    expect(widget.rows).toBe(2);

    spy.and.returnValue({ x: 0, y: 0, cols: 1, rows: 1 });
    widget = component.addWidget(WidgetType.COUNT);
    expect(widget.cols).toBe(1);
    expect(widget.rows).toBe(1);

    spy.and.returnValue({ x: 0, y: 0, cols: 4, rows: 3 });
    widget = component.addWidget(WidgetType.TABLE_LIST);
    expect(widget.cols).toBe(4);
    expect(widget.rows).toBe(3);

    spy.and.returnValue({ x: 0, y: 0, cols: 3, rows: 3 });
    widget = component.addWidget(WidgetType.TIMESERIES);
    expect(widget.cols).toBe(3);
    expect(widget.rows).toBe(3);
  });

  it('resizeGridster(), should resize Gridster', () => {
    component.gridsterComponent = TestBed.createComponent(GridsterComponent).componentInstance;
    // spy on event emitter
    fixture.detectChanges();
    spyOn(component.gridsterComponent, 'optionsChanged');
    component.resizeGridster();
    expect(component.gridsterComponent.optionsChanged).toHaveBeenCalled();
  });

  it('setActiveWidget(), should call emit', () => {
    const widget = new Widget();
    component = TestBed.createComponent(BuilderContainerComponent).componentInstance;
    // spy on event emitter
    spyOn(component.activeWidgetChange, 'emit').withArgs(widget);
    component.setActiveWidget(widget);
    fixture.detectChanges();
    expect(component.activeWidgetChange.emit).toHaveBeenCalledWith(widget);
  });

  it('setPanel(), should call emit', () => {
    // spy on event emitter
    component = TestBed.createComponent(BuilderContainerComponent).componentInstance;
    spyOn(component.emitSetPanel, 'emit').withArgs(true);
    component.setPanel(true);
    fixture.detectChanges();
    expect(component.emitSetPanel.emit).toHaveBeenCalledWith(true);
  });

  it('addToBatchSave(), should add to batch save', () => {
    spyOn(component.saveQueue, 'next');
    const widget = new Widget();
    widget.x = 1;
    widget.y = 0;
    widget.widgetId = '111';
    component.addToBatchSave(widget);
    expect(component.batchSave).toEqual([widget]);
    expect(component.saveQueue.next).toHaveBeenCalled();

    component.batchSave = [widget];
    component.addToBatchSave(widget);
    expect(component.batchSave.length).toBe(1);
    expect(component.saveQueue.next).toHaveBeenCalled();
  });

  it('saveGridsterProp(), should save changed values', () => {
    const widget = new Widget();
    widget.x = 1;
    widget.y = 0;
    component.batchSave.push(widget);
    spyOn(component.saveDraft, 'emit');
    const request: ReportDashboardReq = new ReportDashboardReq();
    request.reportId = component.reportId;
    request.reportName = component.report.reportName;
    request.reportDesciption = component.report.reportDesciption;
    request.widgetReqList = component.batchSave;
    request.noRefresh = true;
    component.saveGridsterProp();
    fixture.detectChanges();
    expect(component.saveDraft.emit).toHaveBeenCalledWith(request);
    expect(component.batchSave).toEqual([]);
  });

  it('getRequest(), should add to batch save', () => {
    component.report.reportName = 'test';
    component.report.reportDesciption = 'test';
    const request: ReportDashboardReq = new ReportDashboardReq();
    request.reportId = component.reportId;
    request.reportName = 'test';
    request.reportDesciption = 'test';
    const test = component.getRequest();
    expect(test).toEqual(request);
  });

  it('deleteWidgetDraft(), should delete widget', async(() => {
    const widget = new Widget();
    widget.widgetId = '111';
    component.widgetList = [widget];
    component.filteredWidgetList = [widget];
    component.reportId = 222;
    component.deleteWidgetDraft(111);
    expect(dialogSpy).toHaveBeenCalled();
  }));
  it('trackByFunc(), should track current widget change', async () => {
    const item = { widgetId: '1234' };
    expect(component.trackByfn(0, item)).toEqual('1234');
  });
});
