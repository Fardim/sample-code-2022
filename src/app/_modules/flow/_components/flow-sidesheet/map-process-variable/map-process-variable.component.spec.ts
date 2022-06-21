import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { TaskListService } from '@services/task-list.service';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { MapProcessVariableComponent } from './map-process-variable.component';

describe('MapProcessVariableComponent', () => {
  let component: MapProcessVariableComponent;
  let fixture: ComponentFixture<MapProcessVariableComponent>;
  let taskListService: TaskListService;
  let router: Router;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MapProcessVariableComponent],
      imports: [
        HttpClientModule,
        HttpClientTestingModule,
        RouterTestingModule,
        SharedModule,
        MdoUiLibraryModule,
        AppMaterialModuleForSpec,
      ],
    }).compileComponents();
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapProcessVariableComponent);
    component = fixture.componentInstance;
    taskListService = fixture.debugElement.injector.get(TaskListService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('processVariables', () => {
    expect(component.processVariables).toBeDefined();
  });
  it('initialize', () => {
    // spyOn(taskListService, 'getAllProvessVMappings').and.callFake(() => of());
    spyOn(component, 'createProcessVariableForm');
    component.ngOnInit();
    // expect(taskListService.getAllProvessVMappings).toHaveBeenCalled();
    expect(component.createProcessVariableForm).toHaveBeenCalled();
  });
  it('createProcessVariableForm', () => {
    component.createProcessVariableForm();
    expect(component.processVariableForm.value).not.toBeNull();
    expect(component.processVariableForm.value).not.toBeUndefined();
  });

  it('close', () => {
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalled();
  });

  it('saveProcessVariable', () => {
    spyOn(taskListService, 'saveProcessVMapping').and.callFake(() => of());
    component.saveProcessVariable();
    expect(taskListService.saveProcessVMapping).toHaveBeenCalled();
  });
});
