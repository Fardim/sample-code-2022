import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { CoreService } from '@services/core/core.service';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { UrlFieldsComponent } from './url-fields.component';

describe('UrlFieldsComponent', () => {
  let component: UrlFieldsComponent;
  let fixture: ComponentFixture<UrlFieldsComponent>;
  let coreService: CoreService;
  let router: Router;
  const queryParams = { f: '1' };
  const routeParams = { moduleId: '91' };
  const panel = 'property-panel';
  const mochFieldList = {
    fieldId: '24341',
    fieldName: 'Test Field',
    attachmentSize: '',
    dataType: 'CHAR',
    dateModified: 0,
    decimalValue: '',
    fileTypes: '',
    pickList: '55',
    maxChar: 9,
    isHeirarchy: false,
    isCriteriaField: false,
    isWorkFlow: false,
    isGridColumn: false,
    parentField: '',
    isDescription: false,
    textCase: 'UPPER',
    isSearchEngine: true,
    isFutureDate: false,
    isPastDate: false,
    isNoun: false,
    displayCriteria: null,
    helptexts: {
      en: 'Testing Type',
      fr: 'Testing Type Fr',
    },
    longtexts: {
      en: 'Testing Type',
      fr: 'Testing Type Fr',
    },
    moduleId: '1',
    shortText: {
      en: {
        description: 'Testing Type',
        information: 'Testing information',
      },
      fr: {
        description: 'Testing Type',
        information: 'Testing Information',
      },
      ab: {
        description: 'Testing Type',
        information: 'Testing information',
      },
    },
    optionsLimit: 1,
    structureId: '1234',
    childfields: [],

    icon: 'Text',
  }as any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UrlFieldsComponent],
      imports: [AppMaterialModuleForSpec, SharedModule, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of(routeParams), queryParams: of(queryParams), fragment: of(panel), snapshot: {} } },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UrlFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    coreService = fixture.debugElement.injector.get(CoreService);
    router = TestBed.inject(Router);
    spyOn(coreService, 'getFieldDetails').and.returnValues(of(mochFieldList));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('createTextFormGroup() with data', () => {
    const data = {
      fieldId: 'uuid',
      fieldName: 'fieldName',
      fieldLength: 50,
      fieldDataType: 'CHAR',
      textCase: 'CAMEL',
      helpText: 'helpText',
      key: true,
      search: true,
      descriptionField: true,
      workflowReference: true,
      transient: true,
    };
    component.createURLFormGroup(data);
    expect(component.formGroup).toBeTruthy();
  });

  it('close()', () => {
    spyOn(router, 'navigate');
    (component as any)._fieldlistContainer = {
      fieldId: 'uuid',
      isNew: false,
      fieldlist: null
    };
    component.close();
    const extras: any = { relativeTo: component.route };
    extras.fragment = null;
    extras.queryParamsHandling = 'preserve';
    expect(router.navigate).toHaveBeenCalledWith(['.'], extras);
  });

  it('patchValue() with data', () => {
    const data = {
      fieldId: 'uuid',
      fieldName: 'fieldName',
      fieldLength: 50,
      dataType: 'CHAR',
      textCase: 'CAMEL',
      helpText: 'helpText',
      isKeyField: true,
      isSearchEngine: true,
      isCriteriaField: true,
      descriptionField: true,
      isWorkFlow: true,
      isPermission: true,
      isNumSettingCriteria: true,
      isTransient: true,
    };
    component.patchValue(data);
    expect(component.formGroup).toBeTruthy();
  });
});
