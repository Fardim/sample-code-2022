import { MdoUiLibraryModule } from 'mdo-ui-library';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CoreSchemaBrInfo } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { SharedModule } from '@modules/shared/shared.module';
import { SchemaService } from '@services/home/schema.service';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { BusinessrulelibrarySidesheetComponent } from './businessrulelibrary-sidesheet.component';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';

describe('BusinessrulelibrarySidesheetComponent', () => {
  let component: BusinessrulelibrarySidesheetComponent;
  let fixture: ComponentFixture<BusinessrulelibrarySidesheetComponent>;
  let schemaService: SchemaService;
  let router: Router;
  let sharedService: SharedServiceService


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BusinessrulelibrarySidesheetComponent],
      imports: [ MdoUiLibraryModule,
        AppMaterialModuleForSpec,
        HttpClientTestingModule,
        RouterTestingModule,
        SharedModule
      ],
      providers: [SchemaService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessrulelibrarySidesheetComponent);
    component = fixture.componentInstance;
    schemaService = fixture.debugElement.injector.get(SchemaService);
    sharedService = fixture.debugElement.injector.get(SharedServiceService);
    router = fixture.debugElement.injector.get(Router);
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('selectBusinessRule(), should select/ deselect business rules', async () => {
    component.selectedBusinessRule = [];
    const rule = {
      brId: '13454556',
      brIdStr: '134545566',
      brInfo: 'regex rule'
    } as CoreSchemaBrInfo;
    let action = component.constants.ADD;

    component.selectBusinessRule(rule, action);
    expect(component.selectedBusinessRule.length).toEqual(1);

    component.selectedBusinessRule = [
      {
        brId: '13454556',
        brIdStr: '134545566',
        brInfo: 'regex rule'
      },
      {
        brId: '13454552',
        brIdStr: '134545563',
        brInfo: 'regex rule-1'
      }
    ] as CoreSchemaBrInfo[];
    action = component.constants.REMOVE;
    component.selectBusinessRule(rule, action);

    expect(component.selectedBusinessRule.length).toEqual(1);
  })

  it('isSelected(), should check selection of business rule', async () => {
    let rule = {
      brId: '2566241'
    } as CoreSchemaBrInfo;

    component.selectedBusinessRule = [
      {
        brId: '2566241'
      },
      {
        brId: '2566242'
      }
    ] as CoreSchemaBrInfo[];

    let res = component.isSelected(rule);
    expect(res).toEqual(true);

    rule = {
      brId: '123654'
    } as CoreSchemaBrInfo

    res = component.isSelected(rule);
    expect(res).toEqual(true);
  })

  it('getBusinessRulesList(), Should get business rules list according to module Id', async () => {
    // call with module Id
    spyOn(schemaService, 'getBusinessRulesByModuleId').and.callFake(() => of([]));
    component.getBusinessRulesList('testId', null, null, null);
    expect(schemaService.getBusinessRulesByModuleId).toHaveBeenCalled();
  });

  it('getBusinessRulesBySchemaId(), get rules by schema id', async(() => {
    // mock object
    spyOn(schemaService, 'getBusinessRulesBySchemaId').withArgs(component.schemaId).and.returnValue(of([{ brIdStr: '732523' } as CoreSchemaBrInfo]));

    component.getBusinessRulesBySchemaId(component.schemaId);
    expect(schemaService.getBusinessRulesBySchemaId).toHaveBeenCalledWith(component.schemaId);
    expect(component.schemaBusinessRulesList.length).toEqual(1);
  }));

  it('ngOnInit(), check prerequired stuff ', async(() => {

    spyOn(schemaService, 'getBusinessRulesBySchemaId').withArgs(component.schemaId).and.returnValue(of([{ brIdStr: '732523' } as CoreSchemaBrInfo]));

    spyOn(schemaService, 'getBusinessRulesByModuleId').and.callFake(() => of([]));

    component.ngOnInit();

    expect(schemaService.getBusinessRulesBySchemaId).toHaveBeenCalledWith(component.schemaId);
    expect(schemaService.getBusinessRulesByModuleId).toHaveBeenCalled();
  }));

  it('saveSelection(), Add rule from side sheet ', async(() => {
    component.outlet = 'sb'
    const list = [];
    const core = new CoreSchemaBrInfo();
    component.schemaId = '1234567';
    core.brInfo = 'Test';
    core.brType = 'BR_MANDATORY_FIELDS';
    core.fields = '';
    core.message = '';
    core.brIdStr = '1234567890987654';
    const coreInfo = new CoreSchemaBrInfo();
    coreInfo.brInfo = 'Test';
    coreInfo.brType = 'BR_MANDATORY_FIELDS';
    coreInfo.fields = '';
    coreInfo.message = '';
    coreInfo.brIdStr = '1234567890987654';
    list.push(core);
    list.push(coreInfo);
    component.selectedBusinessRule = list;
    // console.log('test  ' + component.selectedBusinessRule);
    component.moduleId = '1234567';

    const coreRequest = new CoreSchemaBrInfo();
    coreRequest.brId = '';
    coreRequest.schemaId = component.schemaId;
    coreRequest.brInfo = core.brInfo;
    coreRequest.brType = core.brType;
    coreRequest.fields = core.fields;
    coreRequest.message = core.message;
    coreRequest.isCopied = true;
    coreRequest.moduleId = component.moduleId;
    coreRequest.copiedFrom = core.brIdStr;

    const coreRequestInfo = new CoreSchemaBrInfo();
    coreRequestInfo.brId = '';
    coreRequestInfo.schemaId = component.schemaId;
    coreRequestInfo.brInfo = coreInfo.brInfo;
    coreRequestInfo.brType = coreInfo.brType;
    coreRequestInfo.fields = coreInfo.fields;
    coreRequestInfo.message = coreInfo.message;
    coreRequestInfo.isCopied = true;
    coreRequestInfo.moduleId = component.moduleId;
    coreRequestInfo.copiedFrom = coreInfo.brIdStr;

    spyOn(component, 'closeDialogComponent');
    spyOn(schemaService, 'copyDuplicateRule').and.callFake(()=>of());
    spyOn(schemaService, 'createBusinessRule').and.callFake(()=>of(null));
    component.saveSelection();
    expect(schemaService.createBusinessRule).toHaveBeenCalled();

    component.outlet = '';
    spyOn(sharedService,'setAfterBrSave').and.callFake(()=>of());
    component.saveSelection();
    expect(sharedService.setAfterBrSave).toHaveBeenCalled();

  }));

  it('closeDialogComponent()', async(() => {
    spyOn(router, 'navigate');
    component.closeDialogComponent();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { [`${component.outlet}`]: null } }], { queryParamsHandling: 'preserve'});
  }));

  it('onScrollEnd(), load more rules on scroll end', async(() => {
    spyOn(component, 'getBusinessRulesList');
    component.onScrollEnd();
    expect(component.getBusinessRulesList).toHaveBeenCalledWith(component.moduleId, component.searchString, component.selectedRuleType, true);
  }));

  it('getRuleDesc(), should return rule description', async(() => {
    expect(component.getRuleDesc('BR_API_RULE')).toEqual('Custom validation');
    expect(component.getRuleDesc('testRule')).toBeFalsy();
  }));


});
