import { CoreService } from '@services/core/core.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AppMaterialModuleForSpec } from '../../../../../app-material-for-spec.module';
import { SharedModule } from '../../../../shared/shared.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RichTextEditorFieldComponent } from './rich-text-editor-field.component';

describe('RichTextEditorFieldComponent', () => {
  let component: RichTextEditorFieldComponent;
  let fixture: ComponentFixture<RichTextEditorFieldComponent>;
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
  } as any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RichTextEditorFieldComponent],
      imports: [AppMaterialModuleForSpec, SharedModule, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of(routeParams), queryParams: of(queryParams), fragment: of(panel), snapshot: {} } },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RichTextEditorFieldComponent);
    component = fixture.componentInstance;
    coreService = fixture.debugElement.injector.get(CoreService);
    router = TestBed.inject(Router);
    // spyOn(listService, 'getFieldProperties').and.returnValues(of(textFieldData));
    spyOn(coreService, 'getFieldDetails').and.returnValues(of(mochFieldList));
  });

  it('should create', () => {
    fixture.detectChanges();
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
    component.createRichTextFormGroup(data);
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
      helpText: 'helpText',
      isSearchEngine: true,
      isCriteriaField: true,
      isWorkFlow: true,
      isPermission: true,
      isNumSettingCriteria: true,
      isTransient: true,
    };
    component.patchValue(data);
    expect(component.formGroup).toBeTruthy();
  });
});
