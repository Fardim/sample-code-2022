import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { SectionPropertyComponent } from './section-property.component';

describe('SectionPropertyComponent', () => {
  let component: SectionPropertyComponent;
  let fixture: ComponentFixture<SectionPropertyComponent>;
  // let coreService: CoreService;
  // let router: Router;
  const queryParams = { t: '2' };
  const routeParams = { moduleId: '1005', formId: '1' };
  const panel = 'property-panel';

  const mockdata = {
    tcode: 'cdc7673f-1764-41fb-8e16-89285704db65',
    tabText: 'Header',
    information: 'This is header tab',
    isTabReadOnly: false,
    isTabHidden: true,
    layoutId: '7e0e61ea-ea19-4ce2-ad51-b5e98452bf42',
    tabOrder: 1,
    udrId: null,
    fields: [
      {
        metadata: [
          {
          }
        ],
        description: 'Dropdown Type',
        dataType: 'CHAR',
        pickList: '1',
        maxChar: 4,
        structureId: 1,
        fieldId: 'GENFLD0020',
        isMandatory: true,
        isReadOnly: false,
        isHidden: false,
        moduleId: 154,
        isAdd: false,
        isDelete: false,
        order: 20,
        url: null,
        fieldType: 'FIELD',
        tabFieldUuid: '99865c67-2631-49c0-bcc8-9e021aae3c69'
      }
    ]
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SectionPropertyComponent],
      imports: [AppMaterialModuleForSpec, SharedModule, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of(routeParams), queryParams: of(queryParams), fragment: of(panel), snapshot: {} } },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SectionPropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // coreService = fixture.debugElement.injector.get(CoreService);
    // router = TestBed.inject(Router);
    // spyOn(coreService, 'getFieldDetails').and.returnValues(of(mockdata));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('createSectionFormGroup() with data', () => {
    component.createSectionFormGroup(mockdata);
    expect(component.sectionformGroup).toBeTruthy();

    component.createSectionFormGroup(null);
    expect(component.sectionformGroup).toBeTruthy();
  });

  it('onChangeSetionState() on change the section state', () => {
    component.sectionProperty = mockdata;
    const mockevent1 = { option: { value: 'Editable' } }
    component.onChangeSetionState(mockevent1);
    expect(component.sectionProperty.isTabReadOnly).toEqual(false);
    const mockevent2 = { option: { value: 'Non-Editable' } }
    component.onChangeSetionState(mockevent2);
    expect(component.sectionProperty.isTabReadOnly).toEqual(true);
    const mockevent3 = { option: { value: 'Hidden' } }
    component.onChangeSetionState(mockevent3);
    expect(component.sectionProperty.isTabHidden).toEqual(true);
  })

  it('onChangeNameValue(), should emit with current saved value', async(() => {
    spyOn(component.updateSectionProperty, 'emit').and.callFake(() => { return null; })

    component.onChangeNameValue(null);
    expect(component.updateSectionProperty.emit).toHaveBeenCalledTimes(1);
  }));
  it('patchValue()', () => {
    component.createSectionFormGroup(null);
    component.patchValue(mockdata);
    expect(component.sectionformGroup).toBeTruthy()
  })

  // it('close()', () => {
  //   spyOn(router, 'navigate');
  //   component.close();
  //   const extras: any = { relativeTo: component.route };
  //   extras.fragment = null;
  //   extras.queryParamsHandling = 'preserve';
  //   expect(router.navigate).toHaveBeenCalledWith(['.'], extras);
  // });
});
