
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { TaskListService } from '@services/task-list.service';
import { MdoUiLibraryModule, TransientService } from 'mdo-ui-library';
import { of, Subscription } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { MaintainProcessComponent } from './maintain-process.component';

describe('MaintainProcessComponent', () => {
  let component: MaintainProcessComponent;
  let fixture: ComponentFixture<MaintainProcessComponent>;
  let router: Router;
  let transientService: TransientService;
  let service: TaskListService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MaintainProcessComponent],
      imports: [RouterTestingModule, SharedModule, MdoUiLibraryModule, AppMaterialModuleForSpec]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaintainProcessComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    service = fixture.debugElement.injector.get(TaskListService);
    transientService = fixture.debugElement.injector.get(TransientService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should destroy component', () => {
    spyOn(Subscription.prototype, 'unsubscribe');
    component.ngOnDestroy();
    expect(Subscription.prototype.unsubscribe).toHaveBeenCalled();
  });
  it('search Actions List', () => {
    spyOn(component, '_filterActions')
    component.searchActionsList('e');
    expect(component._filterActions).toHaveBeenCalled();
    component.searchActionsList('');
    expect(component.actions).toEqual(component.allActions);
  });

  it('filter actions', () => {
    const data = component._filterActions('e')
    expect(data.length).toBe(2);
  });

  it('has limit', () => {
    component.limit = 2;
    component.actions = [{
      id: '1',
      name: 'Create'
    },
    { id: '2', name: 'Edit' },
    { id: '3', name: 'Summary' }];
    const data = component.hasLimit()
    expect(data).toBe(true);


  });
  it('out of has limit', () => {
    component.limit = 2;
    component.actions = [{
      id: '1',
      name: 'Create'
    }];
    const data = component.hasLimit()
    expect(data).toBe(false);
  })

  it('removeActionOptions', () => {
    component.selectedEvents = [{
      id: '1',
      name: 'Create'
    }];
    component.removeActionOptions({
      id: '1',
      name: 'Create'
    });
    expect(component.selectedActionOptions.length).toBe(0);
    expect(component.selectedActionOptions).toEqual(component.selectedEvents);
  });

  it('close', () => {
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalled();
  });

  it('close menu', () => {
    component.close();
    expect(component.searchActions.value).toBe('');
  });
  it('is Action Checked', () => {
    component.selectedActionOptions = ['Create']
    const data = component.isActionChecked('Create');
    expect(data).toBe(true);
  });
  it('selected actions', () => {
    const value = {
      id: '1',
      name: 'Create'
    };
    component.selectedActionOptions = [];
    component.selectedActions(value, true);
    expect(component.selectedActionOptions.length).toBe(1);
  });
  it(' deselected actions', () => {
    const value = {
      id: '1',
      name: 'Create'
    };
    component.selectedActionOptions = [{
      id: '1',
      name: 'Create'
    }];
    component.selectedActions(value, false);
    expect(component.selectedActionOptions.length).toBe(0);
  });
  it('menu open', () => {
    component.menuOpen();
    expect(component.isClose).toBe(false);
    expect(component.selectedActionOptions).toEqual(component.selectedEvents);
  });
  it('menu close', () => {
    component.menuClose();
    expect(component.isClose).toBe(true);
  });
  it('apply values', () => {
    component.applyValues();
    expect(component.isClose).toBe(true);
    expect(component.selectedActionOptions).toEqual(component.selectedEvents);
    expect(component.searchActions.value).toEqual('');
  });

  it('save event', () => {
    spyOn(transientService, 'open').and.callFake(() => of());
    component.saveEvent();
    expect(transientService.open).toHaveBeenCalled();
  });
  it('save event with dataset id', () => {

    component.routeParam = { datasetId: '1' };
    component.selectedEvents=[{
      id: '1',
      name: 'Create'
    }];
    spyOn(service, 'saveEventMapping').and.callFake(() => of());
    component.saveEvent();
    expect(service.saveEventMapping).toHaveBeenCalled();
  });

  it('get event with dataset id and flow id', () => {
    component.routeParam = { datasetId: '1', flowId:'2' };
    component.selectedEvents = [{
      id: '1',
      name: 'Create'
    }];
    spyOn(service, 'getAllEventsMapping').and.callFake(() => of());
    component.getEventMapping();
    expect(service.getAllEventsMapping).toHaveBeenCalled();
  });
});
