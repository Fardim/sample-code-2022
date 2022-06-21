import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Dataset } from '@models/schema/schema';
import { BusinessRuleType } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { BusinessRules } from '@modules/admin/_components/module/schema/diw-create-businessrule/diw-create-businessrule.component';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { FlowListComponent } from './flow-list.component';
import { Router } from '@angular/router';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { of, Subscription } from 'rxjs';

describe('FlowListComponent', () => {
  let component: FlowListComponent;
  let fixture: ComponentFixture<FlowListComponent>;
  let router: Router;
  let sharedService: SharedServiceService
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FlowListComponent],
      imports: [HttpClientModule, HttpClientTestingModule, RouterTestingModule, SharedModule,MdoUiLibraryModule, AppMaterialModuleForSpec]
    })
      .compileComponents();
      router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlowListComponent);
    component = fixture.componentInstance;
    sharedService = fixture.debugElement.injector.get(SharedServiceService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should test brRuleFilterDesc', () => {
    component.appliedBrList = [];
    expect(component.brRuleFilterDesc).toBe('All');
    component.appliedBrList = [{ ruleDesc: 'Rule Description', ruleId: '1', ruleType: BusinessRuleType.BR_API_RULE }]
    expect(component.brRuleFilterDesc).toBe('Rule Description');
    component.appliedBrList = [{ ruleDesc: 'Rule Description', ruleId: '1', ruleType: BusinessRuleType.BR_API_RULE },
    { ruleDesc: 'Rule Description Data', ruleId: '1', ruleType: BusinessRuleType.BR_API_RULE }]
    expect(component.brRuleFilterDesc).toBe(2);
  });

  it('should test brDatasetDesc', () => {
    component.appliedDatasetList = [];
    expect(component.brDatasetDesc).toBe('All');
    component.appliedDatasetList = [{ moduleDesc: 'Rule Description', moduleId: '1',tenantId:'0' }]
    expect(component.brDatasetDesc).toBe('Rule Description');
    component.appliedDatasetList = [{ moduleDesc: 'Rule Description', moduleId: '1',tenantId:'0' },
    { moduleDesc: 'Rule Description', moduleId: '2',tenantId:'0' }]
    expect(component.brDatasetDesc).toBe(2);
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

  it('is dataset applied check', () => {
    const dataset = { moduleDesc: 'Dataset 1', moduleId: '1', tenantId: '0' };
    component.appliedDatasetList = [dataset];
    const value = component.isDatasetAppliedChecked(dataset);
    expect(value).toBe(true);

  })
  it('is dataset not applied check', () => {
    const dataset = { moduleDesc: 'Dataset 1', moduleId: '1', tenantId: '0' };
    component.appliedDatasetList = [dataset];
    const value = component.isDatasetAppliedChecked(new Dataset());
    expect(value).toBe(false);

  })
  it('add Filter From BrRule', () => {
    component.appliedBrList = [];
    const brRule = { ruleId: '1', ruleType: BusinessRuleType.BR_API_RULE, ruleDesc: 'Test rule check' }
    component.addFilterFromBrRule(brRule, true);
    expect(component.appliedBrList[0]).toBe(brRule);
  })

  it('add Filter From already present BrRule', () => {
    const brRule = { ruleId: '1', ruleType: BusinessRuleType.BR_API_RULE, ruleDesc: 'Test rule check' }
    component.appliedBrList = [brRule];
    component.addFilterFromBrRule(brRule, true);
    expect(component.appliedBrList.length).toBe(0);
  })

  it('add Filter From dataset', () => {
    component.appliedDatasetList = [];
    const dataset = { moduleDesc: 'Dataset 1', moduleId: '1', tenantId: '0' };
    component.addFilterFromDataset(dataset, true);
    expect(component.appliedDatasetList[0]).toBe(dataset);
  })

  it('add Filter From already present dataset', () => {
    const dataset = { moduleDesc: 'Dataset 1', moduleId: '1', tenantId: '0' };
    component.appliedDatasetList = [dataset];
    component.addFilterFromDataset(dataset, true);
    expect(component.appliedDatasetList.length).toBe(0);
  })

  it('open sidesheet', () => {
    const element= {id:'process_1'};
    spyOn(sharedService,'setFlowData').and.callFake(()=>of());
    spyOn(router, 'navigate');
    component.openSidesheet(element);
    expect(sharedService.setFlowData).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalled();
  })

  it('apply filter BRTYPE',()=>{
    spyOn(component,'updateFilterCriteria')
    component.apply('BRTYPE')
    expect(component.updateFilterCriteria).toHaveBeenCalled();
  })

  it('apply filter DATASETS',()=>{
    spyOn(component,'updateFilterCriteria')
    component.apply('DATASETS')
    expect(component.updateFilterCriteria).toHaveBeenCalled();
  })

  it('should destroy component', () => {
    spyOn(Subscription.prototype, 'unsubscribe');
    component.ngOnDestroy();
    expect(Subscription.prototype.unsubscribe).toHaveBeenCalled();
  });

  it('updateFilterCriteria', () => {
    spyOn(Subscription.prototype, 'unsubscribe');
    component.ngOnDestroy();
    expect(Subscription.prototype.unsubscribe).toHaveBeenCalled();
  });
});
