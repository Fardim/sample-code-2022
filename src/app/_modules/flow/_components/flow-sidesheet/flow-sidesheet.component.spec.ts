import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BusinessRuleType } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { BusinessRules } from '@modules/admin/_components/module/schema/diw-create-businessrule/diw-create-businessrule.component';
import { SharedModule } from '@modules/shared/shared.module';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { of, Subscription } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { FlowSidesheetComponent } from './flow-sidesheet.component';

describe('FlowSidesheetComponent', () => {
  let component: FlowSidesheetComponent;
  let fixture: ComponentFixture<FlowSidesheetComponent>;
  let router: Router;
  let sharedService: SharedServiceService
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FlowSidesheetComponent],
      imports: [HttpClientModule, HttpClientTestingModule, RouterTestingModule, SharedModule, MdoUiLibraryModule, AppMaterialModuleForSpec]
    })
      .compileComponents();
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlowSidesheetComponent);
    component = fixture.componentInstance;
    sharedService = fixture.debugElement.injector.get(SharedServiceService);
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

  it('set Flow Details', () => {
    const obj = { name: 'Test Flow' };
    component.flowData = [];
    component.setFlowDetails(obj);
    expect(component.flowData).toEqual([{
      header: 'Flow Name',
      cell: 'Test Flow'
    }, {
      header: 'Reference Dataset',
      cell: ''
    }])
  });

  it('set steps data', () => {
    spyOn(component, 'setFormRuleData')
    component.setStepsData({ nodes: [{ type: 'HumanTaskNode' },{ type: 'WorkItemNode' }] });
    expect(component.setFormRuleData).toHaveBeenCalled();
  });
  it('close', () => {
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalled();
  })
  it('should test brRuleFilterDesc', () => {
    component.appliedBrList = [];
    expect(component.brRuleFilterDesc).toBe('All');
    component.appliedBrList = [{ ruleDesc: 'Rule Description', ruleId: '1', ruleType: BusinessRuleType.BR_API_RULE }]
    expect(component.brRuleFilterDesc).toBe('Rule Description');
    component.appliedBrList = [{ ruleDesc: 'Rule Description', ruleId: '1', ruleType: BusinessRuleType.BR_API_RULE },
    { ruleDesc: 'Rule Description Data', ruleId: '1', ruleType: BusinessRuleType.BR_API_RULE }]
    expect(component.brRuleFilterDesc).toBe(2);
  });
  it('is applied check', () => {
    const brRule = { ruleId: '1', ruleType: BusinessRuleType.BR_API_RULE, ruleDesc: 'Test rule check' }
    component.appliedBrList = [brRule];
    const value = component.isBrAppliedChecked(brRule);
    expect(value).toBe(true);

  })
  it('is not applied check', () => {
    const brRule = { ruleId: '1', ruleType: BusinessRuleType.BR_API_RULE, ruleDesc: 'Test rule check' }
    component.appliedBrList = [brRule];
    const value = component.isBrAppliedChecked(new BusinessRules());
    expect(value).toBe(false);

  })

  it('map Process Variable', () => {
    spyOn(router, 'navigate');
    component.mapProcessVariable();
    expect(router.navigate).toHaveBeenCalled();
  })

  it('maintain Process', () => {
    spyOn(router, 'navigate');
    component.maintainProcess();
    expect(router.navigate).toHaveBeenCalled();
  })

  it('get title', () => {
    expect(component.getTitle({ ruleType: 'BR_MANDATORY_FIELDS' })).toBe('Missing Rule');
  })


  it('edit step forms', () => {
    component.stepsData = [{ id: 1,forms:[{isPrimary:true}] }];
    spyOn(sharedService, 'setFlowStepData').and.callFake(() => of());
    spyOn(router, 'navigate');
    component.editStepForms(1);
    expect(sharedService.setFlowStepData).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalled();
  })
  it('edit step interfaces', () => {
    component.stepsData = [{ id: '1' }];
    spyOn(sharedService, 'setFlowStepData').and.callFake(() => of());
    spyOn(router, 'navigate');
    component.editStepInterfaces('1');
    expect(sharedService.setFlowStepData).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalled();

  })


   it('edit step interfaces if no data', () => {
    component.stepsData = [];
    spyOn(sharedService, 'setFlowStepData').and.callFake(() => of());
    spyOn(router, 'navigate');
    component.editStepInterfaces('1');
    expect(sharedService.setFlowStepData).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalled();
  })

  it('edit step rules', () => {
    component.stepsData = [{ id: '1' }];
    spyOn(sharedService, 'setFlowStepData').and.callFake(() => of());
    spyOn(router, 'navigate');
    component.editStepRules('1');
    expect(sharedService.setFlowStepData).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalled();

  })
   it('edit step rules if no data', () => {
    component.stepsData = [];
    spyOn(sharedService, 'setFlowStepData').and.callFake(() => of());
    spyOn(router, 'navigate');
    component.editStepRules('1');
    expect(sharedService.setFlowStepData).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalled();
  })
  it('get parent Object', () => {
    component.stepsData = [{ id: 1,forms:[{isPrimary:true,dataSetId:'1'}] }];
    let result= component.getParentDataset();
    expect(result).toEqual('1');
    component.stepsData = [];
    result= component.getParentDataset();
    expect(result).toEqual('');
  })
});
