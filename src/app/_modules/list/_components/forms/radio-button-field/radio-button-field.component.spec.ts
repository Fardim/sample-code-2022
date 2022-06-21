import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { Router, ActivatedRoute } from '@angular/router';
import { CoreService } from '@services/core/core.service';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { RadioButtonFieldComponent } from './radio-button-field.component';

describe('RadioButtonFieldComponent', () => {
  let component: RadioButtonFieldComponent;
  let fixture: ComponentFixture<RadioButtonFieldComponent>;
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
    optionsLimit: 1,
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
    optionsLimit: 1
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RadioButtonFieldComponent ],
      imports: [AppMaterialModuleForSpec, SharedModule, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of(routeParams), queryParams: of(queryParams), fragment: of(panel), snapshot: {} } },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RadioButtonFieldComponent);
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

  it('patchValue(data?: any)', async(() => {
    component.createTextFormGroup(mockData);
    component.patchValue(mockData);
    expect(component.formGroup.value.isSearchEngine).toBeFalse();

    mockData.isSearchEngine = true;
    mockData.isTransient = true;
    component.createTextFormGroup(mockData);
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

  it('openListvaluePanel()', async(() => {
    fixture.detectChanges();

    spyOn(router, 'navigate');
    component.openListvaluePanel();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/list/dropdown-values/${component.listTypeOptionCtrl.value}/${component.moduleId}/${(component as any)._fieldlistContainer.fieldId}` } }], {queryParams: { ...component.queryParams, limit: component.formGroup.value.optionsLimit }, preserveFragment: true})
  }));

});
