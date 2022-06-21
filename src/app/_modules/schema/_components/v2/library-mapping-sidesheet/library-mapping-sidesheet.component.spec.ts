import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AttributesDoc, NounModifier } from '@models/schema/noun-modifier';
import { Userdetails } from '@models/userdetails';
import { SharedModule } from '@modules/shared/shared.module';
import { NounModifierService } from '@services/home/schema/noun-modifier.service';
import { UserService } from '@services/user/userservice.service';
import { of, throwError } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { LibraryMappingSidesheetComponent } from './library-mapping-sidesheet.component';
import { NounModifierAutocompleteComponent } from './noun-modifier-autocomplete/noun-modifier-autocomplete.component';

describe('LibraryMappingSidesheetComponent', () => {
  let component: LibraryMappingSidesheetComponent;
  let fixture: ComponentFixture<LibraryMappingSidesheetComponent>;
  let nounModifierService: NounModifierService;
  let router: Router;
  let userDetails: UserService;
  const routeParams = {
    moduleId: '1005',
    schemaId: '7573837766214',
    libraryNounCode: 'Bearing',
    libraryModifierCode: 'Ball'
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibraryMappingSidesheetComponent, NounModifierAutocompleteComponent ],
      imports: [ AppMaterialModuleForSpec, RouterTestingModule, HttpClientTestingModule, SharedModule ],
      providers: [{
        provide: ActivatedRoute,
        useValue: {params: of(routeParams), queryParams: of({isMapped:'false'})}
      }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryMappingSidesheetComponent);
    component = fixture.componentInstance;

    nounModifierService = fixture.debugElement.injector.get(NounModifierService);

    component.moduleId = 'module';
    component.schemaId = 'schema';

    component.libraryNounCode = 'Bearing';
    component.libraryModifierCode = 'Ball';

    router = TestBed.inject(Router);
    userDetails = fixture.debugElement.injector.get(UserService);
  });

  // afterEach(() => {
  //   fixture.destroy();
  // });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build mapping form', () => {

    component.buildMappingForm();
    expect(component.mappingForm.value.libraryNounCode).toEqual(component.libraryNounCode);
    expect(component.mappingForm.value.libraryModCode).toEqual(component.libraryModifierCode);

  });

  it('should get local nouns list', () => {

    const result = [
      {NOUN_LONG: 'Bearing', NOUN_CODE: 'Bearing',  NOUN_ID: '17021', MODE_CODE: 'Ball'} as NounModifier
    ]

    spyOn(nounModifierService, 'getLocalNouns').withArgs('0','').and.returnValue(of(result));

    component.getLocalNouns();

    expect(nounModifierService.getLocalNouns).toHaveBeenCalledWith('0','');
    expect(component.localNounsList).toEqual(result);
  });


  it('should get local modifiers list', () => {

    const result = [
      {MODE_CODE: 'Ball', MOD_LONG: 'Ball'} as NounModifier
    ]

    spyOn(nounModifierService, 'getLocalModifier').withArgs('0', 'Bearing','').and.returnValue(of(result));

    component.getLocalModifiers('Bearing');

    expect(nounModifierService.getLocalModifier).toHaveBeenCalledWith('0', 'Bearing','');
    expect(component.LocalModifiersList).toEqual(result);
  });

  it('should get local attributes list', () => {

    const result = [
      {ATTR_DESC: 'length',  ATTR_CODE: 'length'} as AttributesDoc
    ]

    const localAttrSpy = spyOn(nounModifierService, 'getLocalAttribute').withArgs('Bearing', 'Ball','0').and.returnValue(of(result));

    component.getLocalAttributes('Bearing','Ball');

    localAttrSpy.and.returnValue(throwError({ message: 'error' }));
    component.getLocalAttributes('Bearing','Ball');
    expect(nounModifierService.getLocalAttribute).toHaveBeenCalledWith('Bearing', 'Ball', '0');
    expect(component.LocalAttributesList).toEqual(result);
  });

  it('should get already saved mapping', () => {

    const result = {
      libraryNounCode: 'Bearing',
      localNounCode: 'Bearing',
      libraryModCode: 'Ball',
      localModCode: 'Ball',
      attributeMapData: [{libraryAttributeCode: 'Length', localAttributeCode: 'Length'}]
    }
    component.isMapped = true;
    component.buildMappingForm();

    spyOn(nounModifierService, 'getAttributesMapping').withArgs('Bearing', 'Ball').and.returnValue(of(result));

    component.getAttributesMapping();

    expect(nounModifierService.getAttributesMapping).toHaveBeenCalledWith('Bearing', 'Ball');
    expect(component.mappingForm.value.localNounCode).toEqual(result.localNounCode);
    expect(component.mappingForm.value.localModCode).toEqual(result.localModCode);
    // expect(component.LocalAttributesList).toEqual(result);
  });

  it('should openNounSidesheet', () => {
    spyOn(router, 'navigate');
    component.openNounSidesheet();
    expect(router.navigate).toHaveBeenCalledWith(['', { outlets: {sb:`sb/schema/attribute-mapping/${component.moduleId}/${component.schemaId}/${component.libraryNounCode}/${component.libraryModifierCode}`,
    outer: `outer/schema/noun/${component.moduleId}/${component.mgroup}` }}], {queryParamsHandling: 'preserve'})
  });


  it('close sidesheet', () => {
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: null } }])
  });

  it('should init component', () => {
    spyOn(component, 'getLocalNouns');
    spyOn(component, 'getAttributesFromGsn');
    spyOn(component, 'buildMappingForm');
    component.ngOnInit();

    expect(component.moduleId).toEqual(routeParams.moduleId);
    expect(component.getLocalNouns).toHaveBeenCalled();

  });

  it('should getAttributesFromGsn', () => {
    spyOn(component, 'getAttributesMapping');
    spyOn(userDetails, 'getUserDetails').and.returnValue(of({plantCode: '0'}  as Userdetails));
    spyOn(nounModifierService, 'getConnecthukLibAttroibuteLib').and.returnValue(of({ATTRIBUTES: [{ATTR_CODE:'length'} as AttributesDoc]} as NounModifier));

    component.buildMappingForm();
    component.getAttributesFromGsn('Bearing', 'Ball');
    expect(component.gsnAttributes.length).toEqual(1);

  });

  it('should addAttributeMappingRow', () => {
    const attr = {ATTR_CODE:'', ATTR_DESC: 'length', localAttributeCode: 'length', localAttributeText: 'length', status: 'mapped'} as AttributesDoc;
    component.buildMappingForm();
    component.addAttributeMappingRow(attr);
    component.isMapped = true;
    component.addAttributeMappingRow(null);
    expect(component.attributeMapData.at(0).value.localAttributeCode).toEqual('length');
  });

  it('should save()', () => {

    const attr = {ATTR_CODE:'', ATTR_DESC: 'length', localAttributeCode: 'length', localAttributeText: 'length', status: 'mapped'} as AttributesDoc;

    const mappingData = {libraryNounCode: 'Bearing', libraryModCode: 'Ball', localNounCode: 'Bearing', localModCode: 'Ball',
      attributeMapData: [{libraryAttributeCode: 'length', localAttributeCode: 'length'}]};

    spyOn(nounModifierService, 'saveAttributesMapping').and.returnValue(of('success'));
    spyOn(component, 'close');
    spyOn(component, 'getLocalAttributes');

    component.buildMappingForm();
    component.save();

    component.addAttributeMappingRow(attr);
    component.patchMappingForm(mappingData);
    component.save();

    expect(nounModifierService.saveAttributesMapping).toHaveBeenCalledTimes(2);

  });

  it('should openModifierSidesheet', () => {
    spyOn(router, 'navigate');

    component.buildMappingForm();
    component.openModifierSidesheet();
    expect(router.navigate).toHaveBeenCalledWith(['', { outlets: {sb:`sb/schema/attribute-mapping/${component.moduleId}/${component.schemaId}/${component.libraryNounCode}/${component.libraryModifierCode}`,
    outer: `outer/schema/modifier/${component.moduleId}/${component.mgroup}/${component.selectedNounCode}` }}], {queryParamsHandling: 'preserve'})
  });

  it('should openAttributeSidesheet', () => {
    spyOn(router, 'navigate');
    component.buildMappingForm();
    component.setFormControlValue('localNounCode', 'Bearing');
    component.openAttributeSidesheet();
    expect(router.navigate).toHaveBeenCalledWith(['', { outlets: {sb:`sb/schema/attribute-mapping/${component.moduleId}/${component.schemaId}/${component.libraryNounCode}/${component.libraryModifierCode}`,
    outer: `outer/schema/attribute/${component.selectedNounCode}/${component.selectedModifierCode}` }}], {queryParamsHandling: 'preserve'})
  });

  it('should filterAsStatus', () => {
    const matchedStatus = {code:'matched', count: 0, text:'Matched', isSeleted: false};
    component.filterAsStatus(matchedStatus);
    expect(matchedStatus.isSeleted).toBeTrue();

    component.filterAsStatus(matchedStatus);
    expect(matchedStatus.isSeleted).toBeFalse();

  });


  it('should nounSuggestion', () => {
    component.localNounsList = [{NOUN_ID: 'Bearing'} as NounModifier];
    expect(component.nounSuggestion('Bearing')).toBeDefined()
  });

  it('should modifierSuggestion', () => {
    component.LocalModifiersList = [{NOUN_ID: 'Bearing', MODE_CODE: 'Ball'} as NounModifier];
    expect(component.modifierSuggestion('Ball')).toBeDefined()
  });

  it('should attributeSuggestion', () => {
    component.LocalAttributesList = [{ATTR_CODE:'length', ATTR_DESC: 'length'} as AttributesDoc];
    expect(component.attributeSuggestion('length')).toBeDefined();
  });

  it('should createNewWidgetFor', () => {
    spyOn(component, 'openNounSidesheet');
    spyOn(component, 'openModifierSidesheet');

    component.createNewWidgetFor('noun');
    component.createNewWidgetFor('modifier');
    component.createNewWidgetFor('other');

    expect(component.openNounSidesheet).toHaveBeenCalledTimes(1);
    expect(component.openModifierSidesheet).toHaveBeenCalledTimes(1);
  })

  it('should search the attribute', () => {
    component.classificationCategory = {
      noun: {
        source: '',
        targetCtrl: {
          MANDATORY: '',
          ATTRIBUTE_ID: '',
          ATTR_DESC: '',
          ATTR_CODE: '',
          TEXT_FIELD: '',
          DROPDOWN_FIELD:'',
          ATTRIBUTES_VALUES:'',
          LENGTH: '',
          DESC_ACTIVE:'',
          FIELD_TYPE: '',
        },
        status: 'matched'
      },
      modifier: {
        source: '',
        targetCtrl: {
          MANDATORY: '',
          ATTRIBUTE_ID: '',
          ATTR_DESC: '',
          ATTR_CODE: '',
          TEXT_FIELD: '',
          DROPDOWN_FIELD:'',
          ATTRIBUTES_VALUES:'',
          LENGTH: '',
          DESC_ACTIVE:'',
          FIELD_TYPE: '',
        },
        status: 'suggested'
      },
      attrLists:[{
          source: '',
          targetCtrl: {
            MANDATORY: '',
            ATTRIBUTE_ID: '',
            ATTR_DESC: '',
            ATTR_CODE: 'test',
            TEXT_FIELD: '',
            DROPDOWN_FIELD:'',
            ATTRIBUTES_VALUES:'',
            LENGTH: '',
            DESC_ACTIVE:'',
            FIELD_TYPE: '',
          },
          status: 'matched'
      }]
    };
    let value = {
      libraryAttributeText: '',
      libraryAttributeCode: ''
    };
    component.searchString = '';
    expect(component.canDisplayAttribute(value)).toBeTrue();
    value = {
      libraryAttributeText: 'test',
      libraryAttributeCode: ''
    };
    component.searchString = 'test';
    expect(component.canDisplayAttribute(value)).toBeTrue();
    value = {
      libraryAttributeText: '',
      libraryAttributeCode: 'test'
    };
    component.searchString = 'test';
    expect(component.canDisplayAttribute(value)).toBeTrue();
    component.statas[0].isSeleted = true;
    expect(component.canDisplayAttribute(value)).toBeTrue();
    component.statas[0].isSeleted = false;
    component.statas[1].isSeleted = true;
    expect(component.canDisplayAttribute(value)).toBeFalse();
  });

  it('should trigger Search', () => {
    component.searchAttributeVal('test');
    expect(component.searchString).toEqual('test');
  })
  it('getStatus() should get current status', () => {
    component.isMapped = true;
    expect(component.getStatus('test')).toEqual('matched');
    component.isMapped = false;
    expect(component.getStatus('test')).toEqual('unmatched');
    component.classificationCategory = {
      noun: {
        status: 'matched'
      },
      attrLists: [{
        targetCtrl: {
          ATTR_CODE: 'test'
        },
        status: 'unmatched'
      }]
    } as any;
    expect(component.getStatus('noun')).toEqual('matched');
    expect(component.getStatus('test')).toEqual('unmatched');
  })
});
