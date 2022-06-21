import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { StepRulesUpdateComponent } from './step-rules-update.component';
import { TransientService } from 'mdo-ui-library';
import { TaskListService } from '@services/task-list.service';

describe('StepRulesUpdateComponent', () => {
  let component: StepRulesUpdateComponent;
  let fixture: ComponentFixture<StepRulesUpdateComponent>;
  let router: Router;
  let sharedService: SharedServiceService;
  let transientService: TransientService;
  let taskListService: TaskListService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StepRulesUpdateComponent],
      imports: [HttpClientModule, HttpClientTestingModule, RouterTestingModule, SharedModule, MdoUiLibraryModule, AppMaterialModuleForSpec],
    })
      .compileComponents();
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepRulesUpdateComponent);
    component = fixture.componentInstance;
    sharedService = fixture.debugElement.injector.get(SharedServiceService);
    transientService = fixture.debugElement.injector.get(TransientService);
    taskListService = fixture.debugElement.injector.get(TaskListService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('initialize', () => {
    spyOn(sharedService, 'getFlowStepData').and.callFake(() => of());
    spyOn(component, 'getAllBusinessRules');
    component.ngOnInit();
    expect(sharedService.getFlowStepData).toHaveBeenCalled();
    expect(component.getAllBusinessRules).toHaveBeenCalled();
  });

  it('setBRStatus', () => {
    const data = [{ brId: '1', isAssigned: true }, { brId: '2', isAssigned: false }];
    component.stepData = { rules: [{ ruleId: '1' }] };
    component.setBRStatus(data);
    expect(component.allBrData).toEqual(data);
    expect(component.brData).toEqual(data)
  });
  it('close', () => {
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalled();
  });
  it('getRuleDesc(), should return rule description', async(() => {
    expect(component.getRuleDesc('BR_API_RULE')).toEqual('Custom validation');
    expect(component.getRuleDesc('testRule')).toBeFalsy();
  }));
  it('getAssignedRules', () => {
    component.allBrData = [{ brId: '1', isAssigned: true }, { brId: '2', isAssigned: false }];
    component.getAssignedRules();
    expect(component.brData).toEqual([{ brId: '1', isAssigned: true }]);
  })
  it('getUnAssignedRules', () => {
    component.allBrData = [{ brId: '1', isAssigned: true }, { brId: '2', isAssigned: false }];
    component.getUnAssignedRules();
    expect(component.brData).toEqual([{ brId: '2', isAssigned: false }]);
  });
  it('getRuleByRuleType', () => {
    component.allBrData = [{ brId: '1', isAssigned: true, ruleDesc: 'Missing Rule' }, { brId: '2', isAssigned: false, ruleDesc: 'Metadata Rule' }];
    component.getRuleByRuleType('All');
    expect(component.brData).toEqual(component.allBrData);
    component.getRuleByRuleType({ ruleDesc: 'Missing Rule' });
    expect(component.brData).toEqual([{ brId: '1', isAssigned: true, ruleDesc: 'Missing Rule' }]);
  });
  it('saveRuleData with reference datasetid', () => {
    component.allBrData = [{ brId: '1', isAssigned: true, ruleDesc: 'Missing Rule', brType: '' }, { brId: '2', isAssigned: false, ruleDesc: 'Metadata Rule', brType: '' }];
    component.referenceDatasetId = 0;
    spyOn(transientService, 'open').and.callFake(() => of());
    component.saveRuleData();
    expect(transientService.open).toHaveBeenCalled();

  });
  it('saveRuleData without reference datasetid', () => {
    component.referenceDatasetId = 1;
    spyOn(taskListService, 'saveUpdateRuleForm').and.callFake(() => of());
    component.saveRuleData();
    expect(taskListService.saveUpdateRuleForm).toHaveBeenCalled();
  });
  it('assignRule',()=>{
    const arr= [{isAssigned:true}];
    component.assignRule(arr[0]);
    expect(arr[0].isAssigned).toBe(false);
  })

});
