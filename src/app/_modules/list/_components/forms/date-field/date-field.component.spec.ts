import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { Router, ActivatedRoute } from '@angular/router';
import { CoreService } from '@services/core/core.service';
import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';

import { DateFieldComponent } from './date-field.component';

describe('DateFieldComponent', () => {
  let component: DateFieldComponent;
  let fixture: ComponentFixture<DateFieldComponent>;
  let coreService: CoreService;
  let router: Router;
  const queryParams = { f: '1' };
  const routeParams = { moduleId: '1005' };
  const panel = 'property-panel';
  const mochFieldList = {
    fieldId: '1',
    fieldName: 'First name',
    attachmentSize: '',
    dataType: 'CHAR',
    dateModified: 0,
    decimalValue: '',
    fileTypes: '',
    pickList: '0',
    maxChar: 4,
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
      en: 'Material Type',
      fr: 'Material Type Fr',
    },
    longtexts: {
      en: 'Material Type',
      fr: 'Material Type Fr',
    },
    moduleId: '1',
    shortText: {
      en: {
        description: 'Material Type',
        information: 'Material information',
      },
      fr: {
        description: 'Material Type',
        information: 'Material Information',
      },
      ab: {
        description: 'Material Type',
        information: 'Material information',
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
    fieldlist: mochFieldList,
  };
  const mockData = {
    fieldId: 'uuid',
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
      declarations: [DateFieldComponent],
      imports: [AppMaterialModuleForSpec, SharedModule, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of(routeParams), queryParams: of(queryParams), fragment: of(panel), snapshot: {} } },
        FormBuilder
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateFieldComponent);
    component = fixture.componentInstance;
    coreService = fixture.debugElement.injector.get(CoreService);
    router = TestBed.inject(Router);
    // spyOn(coreService, 'getFieldDetails').and.returnValues(of(mochFieldList));
    (component as any)._fieldlistContainer = mockFieldlistContainer;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('createTextFormGroup() with data', () => {
    component.createTextFormGroup(mockData);
    expect(component.formGroup).toBeTruthy();
  });

  it('close()', () => {
    spyOn(router, 'navigate');
    (component as any)._fieldlistContainer = {
      fieldId: 'uuid',
      isNew: false,
      fieldlist: null,
    };
    component.close();
    const extras: any = { relativeTo: component.route };
    extras.fragment = null;
    extras.queryParamsHandling = 'preserve';
    expect(router.navigate).toHaveBeenCalledWith(['.'], extras);
  });

  it('onChangePastDate(event: boolean)', async(() => {
    component.onChangePastDate(true);
    expect(component.formGroup.value.isFutureDate).toBeFalse();
  }));

  it('onChangeFutureDate(event: boolean)', async(() => {
    component.createTextFormGroup(mockData);
    component.onChangeFutureDate(true);
    expect(component.formGroup.value.isPastDate).toBeFalse();
  }));

  it('patchValue(data?: any)', async(() => {
    component.createTextFormGroup(mockData);
    component.patchValue(mockData);
    expect(component.formGroup.value.isPastDate).toBeFalse();

    mockData.isPastDate = true;
    mockData.isFutureDate  = true;
    mockData.isDefault = true;
    mockData.isSearchEngine = true;
    mockData.isTransient = true;
    component.createTextFormGroup(mockData);
    component.patchValue(mockData);
    expect(component.formGroup.value.isPastDate).toBeTrue();
  }));

  it('fireValidationStatus(event?: any)', fakeAsync(() => {
    spyOn(coreService, 'nextUpdateFieldFormValidationStatusSubject');
    spyOn(coreService, 'nextUpdateFieldPropertySubject');
    component.fireValidationStatus(null);
    expect(coreService.nextUpdateFieldFormValidationStatusSubject).toHaveBeenCalled();
    tick(10);
    expect(coreService.nextUpdateFieldPropertySubject).toHaveBeenCalled();
  }));

});
