import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { CoreService } from '@services/core/core.service';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { EmailFieldComponent } from './email-field.component';

describe('EmailFieldComponent', () => {
  let component: EmailFieldComponent;
  let fixture: ComponentFixture<EmailFieldComponent>;
  let coreService: CoreService;
  let router: Router;
  const queryParams = { f: '1' };
  const routeParams = { moduleId: '91' };
  const panel = 'property-panel';
  const mockFieldList = {
    fieldId: '123456',
    fieldName: 'Test Email Field',
    attachmentSize: '',
    dataType: 'EMAIL',
    dateModified: 0,
    decimalValue: '',
    fileTypes: '',
    pickList: '0',
    maxChar: 10,
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
    structureId: '1234',
    childfields: [],

    icon: 'Text',
  };
  const mockFieldlistContainer = {
    fieldId: '1' ,
    isNew: true,
    editvalue: true,
    fieldlist: mockFieldList,
  };
  const mockData = {
    fieldId: 'uuid' ,
    fieldName: 'fieldName',
    maxChar: 50,
    fieldDataType: 'CHAR',
    textCase: 'CAMEL',
    helpText: 'helpText',
    isPastDate: false,
    isFutureDate: false,
    isDefault: false,
    isSearchEngine: false,
    isTransient: false,
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailFieldComponent ],
      imports: [AppMaterialModuleForSpec, SharedModule, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of(routeParams), queryParams: of(queryParams), fragment: of(panel), snapshot: {} } },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailFieldComponent);
    component = fixture.componentInstance;

    coreService = fixture.debugElement.injector.get(CoreService);
    router = TestBed.inject(Router);
    // spyOn(coreService, 'getFieldDetails').and.returnValues(of(mockFieldList));
    (component as any)._fieldlistContainer = mockFieldlistContainer;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('createEmailFormGroup() with data', () => {
    component.createEmailFormGroup(mockData);
    expect(component.formGroup).toBeTruthy();
  });

  it('patchValue(data?: any)', async(() => {
    component.createEmailFormGroup(mockData);
    component.patchValue(mockData);
    expect(component.formGroup.value.isSearchEngine).toBeFalse();

    mockData.isSearchEngine = true;
    mockData.isTransient = true;
    component.createEmailFormGroup(mockData);
    component.patchValue(mockData);
    expect(component.formGroup.value.isSearchEngine).toBeTrue();
  }));

  it('fireValidationStatus(event?: any)', fakeAsync(() => {
    spyOn(coreService, 'nextUpdateFieldFormValidationStatusSubject');
    spyOn(coreService, 'nextUpdateFieldPropertySubject');
    component.fireValidationStatus(null);
    expect(coreService.nextUpdateFieldFormValidationStatusSubject).toHaveBeenCalled();
    tick(10);
    expect(coreService.nextUpdateFieldPropertySubject).toHaveBeenCalled();
  }));

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
});
