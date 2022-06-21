import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { CoreService } from '@services/core/core.service';
import { TaskListService } from '@services/task-list.service';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { StepFormUpdateComponent } from './step-form-update.component';

describe('StepFormUpdateComponent', () => {
  let component: StepFormUpdateComponent;
  let fixture: ComponentFixture<StepFormUpdateComponent>;
  let sharedService: SharedServiceService;
  let taskListService: TaskListService;
  let coreService: CoreService;
  let router: Router;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StepFormUpdateComponent],
      imports: [HttpClientModule, HttpClientTestingModule, RouterTestingModule, SharedModule, MdoUiLibraryModule, AppMaterialModuleForSpec]
    })
      .compileComponents();
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepFormUpdateComponent);
    component = fixture.componentInstance;
    sharedService = fixture.debugElement.injector.get(SharedServiceService);
    taskListService = fixture.debugElement.injector.get(TaskListService);
    coreService = fixture.debugElement.injector.get(CoreService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('childDataset', () => {
    expect(component.childDataset).toBeDefined();
  });

  it('initialize', () => {
    spyOn(sharedService, 'getFlowStepData').and.callFake(() => of());
    spyOn(component, 'createStepFormUpdateFrm')
    component.ngOnInit();
    expect(sharedService.getFlowStepData).toHaveBeenCalled();
    expect(component.createStepFormUpdateFrm).toHaveBeenCalled();
  });

  it('processPatchData', () => {
    component.dataModel = {
      formModel: [{ dataSetId: '1', datasetDesc: 'Description', formId: '1', formDesc: 'Description', isPrimary: true },
      { dataSetId: '2', datasetDesc: 'Description', formId: '2', formDesc: 'Description', isPrimary: false }],
      rulesModel: []
    };
    component.processPatchData();
    expect(component.filterableDatasetOb.length).toBe(1);
    expect(component.parentFormslist.length).toBe(1);
    expect(component.stepFormUpdateForm.value.parentDataset).toBeDefined();
    expect(component.stepFormUpdateForm.value.parentForm).toBeDefined();
    expect(component.childDataset.length).toBe(1);
  });

  it('process Save Data', () => {
    const arr = new FormArray(
      [new FormControl('')]);
    component.stepFormUpdateForm = (component as any).fb.group({
      childDataset: arr,
      parentDataset: { moduleId: '1' },
      parentForm: { layoutId: '1' }
    });
    component.stepFormUpdateForm.setValue({
      childDataset: [{
        childDatasetId: '1',
        childFormId: '2',
      }],
      parentDataset: { moduleId: '1' },
      parentForm: { layoutId: '1' }
    });
    const result = component.processSaveData()
    expect(result.length).toBe(2);
  });

  it('save Form Data', () => {
    const arr = new FormArray(
      [new FormControl('')]);
    component.stepFormUpdateForm = (component as any).fb.group({
      childDataset: arr,
      parentDataset: { moduleId: '1' },
      parentForm: { layoutId: '1' }
    });
    component.stepFormUpdateForm.setValue({
      childDataset: [{
        childDatasetId: '1',
        childFormId: '2',
      }],
      parentDataset: { moduleId: '1' },
      parentForm: { layoutId: '1' }
    });
    spyOn(taskListService, 'saveUpdateRuleForm').and.callFake(() => of());
    component.saveFormData();
    expect(taskListService.saveUpdateRuleForm).toHaveBeenCalled();
  });
  it('save invalid Form Data', () => {
    const arr = new FormArray(
      [new FormControl('')]);
    component.stepFormUpdateForm = (component as any).fb.group({
      childDataset: arr,
      parentDataset: [''],
      parentForm: ['']
    });
    component.stepFormUpdateForm.setValue({
      childDataset: [{
        childDatasetId: '',
        childFormId: '',
      }],
      parentDataset: { moduleId: '1' },
      parentForm: { layoutId: '1' }
    });
    component.saveFormData();
    expect(component.isDataInvalid).toBe(true);
  });

  it('createStepFormUpdateFrm', () => {
    component.createStepFormUpdateFrm();
    expect(component.stepFormUpdateForm.value).not.toBeNull();
    expect(component.stepFormUpdateForm.value).not.toBeUndefined();
  });
  it('newchildDataset', () => {
    const newChildDataset = component.newchildDataset();
    expect(newChildDataset.value.childDatasetId).toEqual('');
  });
  it('addChildDataset', () => {
    const childDatasetCount = component.childDataset.length;
    component.addChildDataset();
    expect(component.childDataset.length).toBe(childDatasetCount + 1);
  });
  it('isDataExist', () => {
    const arr = new FormArray(
      [
        new FormControl({
          childDatasetId: '',
          childFormId: '',
        })]);
    const isDataExist = component.isDataExist(arr);
    expect(isDataExist).toBe(false);
  })
  it('close', () => {
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalled();
  });

  it('datasets', () => {
    spyOn(coreService, 'getDataSets').and.callFake(() => of());
    component.datasets();
    expect(coreService.getDataSets).toHaveBeenCalled();
  });

  it('setParentForm', () => {
    spyOn(coreService, 'getLayoutList').and.callFake(() => of());
    component.setParentForm('1');
    expect(coreService.getLayoutList).toHaveBeenCalled();
  });

  it('changeParentDataset', () => {
    spyOn(component, 'addChildDataset')
    spyOn(component, 'setParentForm')
    component.changeParentDataset('1');
    expect(component.stepFormUpdateForm.value.parentForm).toBeDefined();
    expect(component.parentFormslist.length).toBe(0);
    expect(component.addChildDataset).toHaveBeenCalled();
    expect(component.setParentForm).toHaveBeenCalled();
  });

  it('resetParentDataset', () => {
    component.selectedParent = { moduleId: '1', moduleDesc: 'english description', tenantId: '0' };
    component.filterableDatasetOb = []
    component.resetParentDataset();
    expect(component.filterableDatasetOb.length).toBe(1);
    component.filterableDatasetOb = [{ moduleId: '1', moduleDesc: 'english description', tenantId: '0' }]
    component.resetParentDataset();
    expect(component.filterableDatasetOb.length).toBe(1);
    expect(component.stepFormUpdateForm.value.parentDataset).toBeDefined();
  });

  it('getTitleParent', () => {
    const obj = { moduleDesc: 'Missing Rule' };
    let result = component.getTitleParent(obj);
    expect(result).toBe('Missing Rule');
    result = component.getTitleParent('');
    expect(result).toBe('');
  });

  it('getFormParent', () => {
    const obj = { description: 'Missing Rule' };
    let result = component.getFormParent(obj);
    expect(result).toBe('Missing Rule');
    result = component.getFormParent('');
    expect(result).toBe('');
  });

});
