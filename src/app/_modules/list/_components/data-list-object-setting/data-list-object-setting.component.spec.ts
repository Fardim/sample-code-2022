import { BusinessRuleListComponent } from './../dataset-business-rule/business-rule-list/business-rule-list.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { _submenus } from '@modules/home/_components/secondary-navbar/secondary-navbar.constants';
import { SharedModule } from '@modules/shared/shared.module';
import { CoreService } from '@services/core/core.service';
import { RuleService } from '@services/rule/rule.service';
import { of, throwError } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { DataListObjectSettingComponent } from './data-list-object-setting.component';

describe('DataListObjectSettingComponent', () => {
  let component: DataListObjectSettingComponent;
  let fixture: ComponentFixture<DataListObjectSettingComponent>;
  let coreService: CoreService;
  let ruleService: RuleService;
  let router: Router;
  const settingSubmenu = _submenus.map(d=> Object.assign({}, d));
  const mockObject = {
    objectid: 187,
    moduleid: 187,
    objectdesc: 'A1 description',
    objectInfo: 'A1 description',
    description: 'A1 description',
    information: {
      en: 'A1 description'
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataListObjectSettingComponent, BusinessRuleListComponent ],
      imports: [AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule.withRoutes(
        [
          {path: 'sb/list/dataset-settings/:moduleId/forms/:moduleId', component: BusinessRuleListComponent},
        ]
      ), SharedModule, ReactiveFormsModule, FormsModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({
              moduleId: '187',
            }),
          },
        },
      ],
    })
    .compileComponents();
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataListObjectSettingComponent);
    component = fixture.componentInstance;
    coreService = fixture.debugElement.injector.get(CoreService);
    ruleService = fixture.debugElement.injector.get(RuleService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(), should called getObjectTypeDetails', async () => {
    spyOn(component, 'getObjectTypeDetails');
    component.ngOnInit();
    expect(component.moduleId).toBe('187');
    expect(component.getObjectTypeDetails).toHaveBeenCalled();
  });

  it('getObjectTypeDetails(), should get dataset details based on module id', async () => {
    component.moduleId = '187';
    component.locale = 'en';
    spyOn(router, 'navigate');
    spyOn(component,'addObjectSubmenu').and.callThrough();
    spyOn(component,'redirectToInitialTab').and.callThrough();
    spyOn(coreService, 'getObjectTypeDetails').and.returnValues(of(mockObject), of(mockObject), throwError({ message: 'api error' }));
    fixture.detectChanges();

    component.getObjectTypeDetails();
    expect(component.addObjectSubmenu).toHaveBeenCalled();
    expect(component.redirectToInitialTab).toHaveBeenCalled();
    expect(coreService.getObjectTypeDetails).toHaveBeenCalledWith(component.moduleId, component.locale);
    expect(component.objectType.objectid).toEqual(mockObject.moduleid);
    expect(component.objectType.objectdesc).toEqual(mockObject.description);
    expect(component.objectType.objectInfo).toEqual(mockObject.information.en);
  });

  it('redirectToInitialTab(), should redirect to form page', async () => {
    component.moduleId = '187';
    spyOn(router, 'navigate');
    component.redirectToInitialTab();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/list/dataset-settings/${component.moduleId}/forms/${component.moduleId}`} }], {
      queryParamsHandling: 'preserve',
    });
  });

  it('addObjectSubmenu(), should add objectType submenu', async () => {
    component.setting_submenus = settingSubmenu.map(d=> Object.assign({}, d));
    spyOn(component,'getFormObjectCount');
    component.addObjectSubmenu();
    expect(component.objectType.submenus).toEqual(settingSubmenu);
    expect(component.getFormObjectCount).toHaveBeenCalled();
  });

  it('updateSubmenuCount(), should update form submenu count', async () => {
    const resp = {
      count: 5
    }
    component.objectType.submenus = settingSubmenu.map(d=> Object.assign({}, d));
    component.objectType.submenus[4].count = 5;
    component.updateSubmenuCount(resp, 'forms');
    expect(component.objectType.submenus).toEqual(component.objectType.submenus);
  });

  it('close(), should close setting popup', async () => {
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: null } }]);
  });
});