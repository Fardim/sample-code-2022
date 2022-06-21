import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AddbusinessruleComponent } from './addbusinessrule.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { BreadcrumbComponent } from 'src/app/_modules/shared/_components/breadcrumb/breadcrumb.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SvgIconComponent } from '@modules/shared/_components/svg-icon/svg-icon.component';
import { BusinessRuleType } from '../business-rules.modal';
import { Router } from '@angular/router';
import { SharedModule } from '@modules/shared/shared.module';

describe('AddbusinessruleComponent', () => {
  let component: AddbusinessruleComponent;
  let fixture: ComponentFixture<AddbusinessruleComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddbusinessruleComponent, BreadcrumbComponent, SvgIconComponent ],
      imports: [AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, SharedModule]
    })
    .compileComponents();
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddbusinessruleComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(), load pre required ', async(()=>{
    component.moduleId = '1005';
    component.schemaGroupId = '237547254672';
    component.schemaId = '327473254';
    component.ngOnInit();
    expect(component.breadcrumb.links[1].link).toEqual(`/home/schema/create-schema/${component.moduleId}/${component.schemaId}`);
  }));

  it('ngOnChanges(), while change rule type', async(()=>{
    // mock data
    const changes: import('@angular/core').SimpleChanges = {fragment:{currentValue:'missing', previousValue:'metadata',firstChange:null,isFirstChange:null}};

    component.ngOnChanges(changes);

    const changes1: import('@angular/core').SimpleChanges = {};
    component.ngOnChanges(changes1);

    expect(component.brType).toEqual(BusinessRuleType.BR_MANDATORY_FIELDS);
  }));

  it('updateBrTypeBasedOnFragement(), update brtype based on fragement', async(()=>{

    // case 1
    component.updateBrTypeBasedOnFragement('missing');
    expect(component.brType).toEqual(BusinessRuleType.BR_MANDATORY_FIELDS);
    expect(component.breadcrumb.heading).toEqual('Missing Rule');

    // case 2
    component.updateBrTypeBasedOnFragement('metadata');
    expect(component.brType).toEqual(BusinessRuleType.BR_METADATA_RULE);
    expect(component.breadcrumb.heading).toEqual('Metadata Rule');

    // case 3
    component.updateBrTypeBasedOnFragement('userdefined');
    expect(component.brType).toEqual(BusinessRuleType.BR_CUSTOM_SCRIPT);
    expect(component.breadcrumb.heading).toEqual('User Defined Rule');

    // case 4
    component.updateBrTypeBasedOnFragement('dependency');
    expect(component.brType).toEqual(BusinessRuleType.BR_DEPENDANCY_RULE);
    expect(component.breadcrumb.heading).toEqual('Dependency Rule');

    // case 5
    component.updateBrTypeBasedOnFragement('duplicate');
    expect(component.brType).toEqual(BusinessRuleType.BR_DUPLICATE_RULE);
    expect(component.breadcrumb.heading).toEqual('Duplicate Rule');

    // case 6
    component.updateBrTypeBasedOnFragement('api');
    expect(component.brType).toEqual(BusinessRuleType.BR_API_RULE);
    expect(component.breadcrumb.heading).toEqual('API Rule');

    // case 7
    component.updateBrTypeBasedOnFragement('external');
    expect(component.brType).toEqual(BusinessRuleType.BR_EXTERNALVALIDATION_RULE);
    expect(component.breadcrumb.heading).toEqual('External Validation Rule');

    // case 8
    component.updateBrTypeBasedOnFragement('regex');
    expect(component.brType).toEqual(BusinessRuleType.BR_REGEX_RULE);
    expect(component.breadcrumb.heading).toEqual('Regex Rule');

    // case default
    component.updateBrTypeBasedOnFragement('');
    expect(component.updateBrTypeBasedOnFragement).toBeTruthy();
  }));

  it('afterSaved(), should navigate', async (() =>{
    const evt = {sno:765756, brId:'77656', brType: 'TEST', refId: 6566, fields: '',apiKey:'',
      regex: '', order: 765, message: '', script: '', brInfo: '', brExpose: 765, status: '', categoryId: '',
      standardFunction: '', brWeightage: '', totalWeightage: 98765, transformation: 76, tableName: '',
      qryScript: '', dependantStatus: '', plantCode: '', percentage: 876, schemaId: '', brIdStr: ''
    }
    component.schemaId = '87234687264862';
    component.moduleId = '1005';
    spyOn(router, 'navigate');
    component.afterSaved(evt);
    component.afterSaved(null);
    expect(router.navigate).toHaveBeenCalledWith(['/home/schema/create-schema', component.moduleId, component.schemaId]);
  }));
});
