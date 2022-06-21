import { TaskListService } from '@services/task-list.service';
import { of } from 'rxjs';
import { SharedModule } from '@modules/shared/shared.module';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { Router, ActivatedRoute } from '@angular/router';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { TaskListTableViewSettingsComponent } from './task-list-table-view-settings.component';

describe('TaskListTableViewSettingsComponent', () => {
  let component: TaskListTableViewSettingsComponent;
  let fixture: ComponentFixture<TaskListTableViewSettingsComponent>;
  let router: Router;
  let sharedServices: SharedServiceService;
  let taskListService: TaskListService;
  const params = { node: 'inbox' };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TaskListTableViewSettingsComponent],
      imports: [ AppMaterialModuleForSpec, RouterTestingModule, SharedModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { params: of(params) },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskListTableViewSettingsComponent);
    component = fixture.componentInstance;
    sharedServices = fixture.debugElement.injector.get(SharedServiceService);
    taskListService = fixture.debugElement.injector.get(TaskListService);
    router = TestBed.inject(Router);
    const fieldList = [
      { fldId: 'description', order: 1 },
      { fldId: 'labels', order: 2 },
      { fldId: 'sent', order: 3 },
      { fldId: 'dueby', order: 4 },
      { fldId: 'requestby', order: 5 },
      { fldId: 'sentby', order: 6 },
    ];
    spyOn(taskListService, 'getHeadersForNode')
      .withArgs('inbox')
      .and.callFake(() => of(fieldList));
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have node inbox', () => {
    component.ngOnInit();
    expect(component.node).toEqual('inbox');
  });

  it('getTableViewDetails() should call', () => {
    spyOn(component, 'getTableViewDetails');
    component.ngOnInit();

    expect(component.getTableViewDetails).toHaveBeenCalled();
  });

  it('getFldMetadata())', () => {
    spyOn(component, 'getFldMetadata');
    component.ngOnInit();

    expect(component.getFldMetadata).toHaveBeenCalled();
  });

  it('metadataFldLst suggestedFlds length exist', () => {
    component.node = 'inbox';
    fixture.detectChanges();
    component.getFldMetadata();

    expect(component.metadataFldLst.length).toBeGreaterThan(1);
    expect(component.suggestedFlds.length).toBeGreaterThan(1);
  });

  it('close()', () => {
    spyOn(router, 'navigate');
    fixture.detectChanges();
    component.close();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: null } }], {
      queryParamsHandling: 'preserve',
    });
  });

  it('isChecked(), is checked ', () => {
    component.viewDetails = [{ fldId: 'dueby', order: '0', fldDesc: 'Due by' }];
    expect(component.isChecked({ fldId: 'dueby', fldDesc: 'Due by' })).toEqual(true);
    expect(component.isChecked({ fldId: 'sent', fldDesc: 'Sent' })).toBeFalse();
  });

  it('should selectionChange', () => {
    fixture.detectChanges();
    component.viewDetails = [{ fldId: 'sent', order: '0', fldDesc: 'Sent' }];
    component.selectionChange({ fldId: 'sent', fldDesc: 'Sent' });
    expect(component.viewDetails.length).toEqual(0);

    component.selectionChange({ fldId: 'new', fldDesc: 'New' });
    expect(component.viewDetails.length).toEqual(1);
  });

  it('throw error when node is undefined', () => {
    component.ngOnInit();
    component.node = '';
    expect(() => component.getFldMetadata()).toThrowError('node cant be null or empty');
  });
  it('getTableViewDetails()', fakeAsync(() => {
    component.node = 'inbox';
    component.getTableViewDetails();
    tick();
    expect(taskListService.getHeadersForNode).toHaveBeenCalledWith('inbox');
    tick();
    expect(component.viewDetails.length).toBeGreaterThan(1);
  }));

  it('segmentChange(), visible only columns should be shown', () => {
    component.selectedSegment = 'visbleOnly';
    component.selectedMetadataFldList = [];
    component.viewDetails = [{ fldId: 'dueby', fldDesc: 'Due by', order: '0' }];
    component.metadataFldLst = [{ fldId: 'dueby', fldDesc: 'Due by' }];
    component.segmentChange();
    expect(component.selectedMetadataFldList.length).toBe(1);
  });

  it('segmentChange(), all columns should be shown', () => {
    component.selectedSegment = 'all';
    component.selectedMetadataFldList = [];
    component.viewDetails = [{ fldId: 'dueby', fldDesc: 'Due by', order: '0' },{ fldId: 'label', fldDesc: 'Label', order: '1' }];
    component.metadataFldLst = [{ fldId: 'dueby', fldDesc: 'Due by' } , { fldId: 'label', fldDesc: 'Label' }];
    component.segmentChange();
    expect(component.selectedMetadataFldList.length).toBe(2);
  });

  it('should save', fakeAsync(() => {
    spyOn(component, 'close');
    spyOn(sharedServices, 'settaskinboxViewDetailsData');
    spyOn(taskListService, 'saveOrUpdateTasklistHeaders').and.returnValue(
      of({
        acknowledge: true,
        errorMsg: null,
      })
    );

    component.viewDetails = [{ fldId: 'dueby', fldDesc: 'Due by', order: '0' }];
    component.metadataFldLst = [{ fldId: 'dueby', fldDesc: 'Due by' }];
    component.node = 'inbox';

    component.save();
    tick();
    expect(sharedServices.settaskinboxViewDetailsData).toHaveBeenCalledWith({
      node: 'inbox',
      viewDetails: [{ fldId: 'dueby', fldDesc: 'Due by', order: '1' }],
    });
    expect(taskListService.saveOrUpdateTasklistHeaders).toHaveBeenCalledWith(component.node, [{ fldId: 'dueby', order: 1 }]);
    tick();
    expect(component.close).toHaveBeenCalled();
  }));

  it('ngOnDestroy()', () => {
    spyOn(component.unsubscribeAll$, 'unsubscribe');
    component.ngOnDestroy();
    expect(component.unsubscribeAll$.unsubscribe).toHaveBeenCalled();
  });
});
