import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SimpleChanges } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Userdetails } from '@models/userdetails';
import { SharedModule } from '@modules/shared/shared.module';
import { NounModifierService } from '@services/home/schema/noun-modifier.service';
import { UserService } from '@services/user/userservice.service';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { NounModifierAutocompleteComponent, RequestFor } from './noun-modifier-autocomplete.component';

describe('NounModifierAutocompleteComponent', () => {
  let component: NounModifierAutocompleteComponent;
  let fixture: ComponentFixture<NounModifierAutocompleteComponent>;
  let nounModifierService: NounModifierService;
  let userDetailsService: UserService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NounModifierAutocompleteComponent ],
      imports:[
        AppMaterialModuleForSpec,
        HttpClientTestingModule,
        SharedModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NounModifierAutocompleteComponent);
    component = fixture.componentInstance;

    nounModifierService = fixture.debugElement.injector.get(NounModifierService);
    userDetailsService = fixture.debugElement.injector.get(UserService);
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update on inputs change', () => {

    let changes: SimpleChanges = {data: {currentValue:[], previousValue: null, firstChange: true, isFirstChange: null}};
    component.ngOnChanges(changes);
    expect(component.data).toEqual([]);

    changes = {requestFor: {currentValue:'noun', previousValue: null, firstChange: true, isFirstChange: null}};
    component.ngOnChanges(changes);
    expect(component.requestFor).toEqual('noun');
  });

  it('should mdoFieldDisplayWith', () => {
    const object = {NOUN_CODE: 'Bearing', MODE_CODE: 'Ball', ATTR_CODE: 'Length'};

    expect(component.mdoFieldDisplayWith(null)).toBeFalsy();

    component.requestFor = RequestFor.noun;
    expect(component.mdoFieldDisplayWith(object)).toEqual('Bearing');
    object.NOUN_CODE = null;
    expect(component.mdoFieldDisplayWith(object)).toEqual('');

    component.requestFor = RequestFor.moifier;
    expect(component.mdoFieldDisplayWith(object)).toEqual('Ball');
    object.MODE_CODE = null;
    expect(component.mdoFieldDisplayWith(object)).toEqual('');

    component.requestFor = RequestFor.attribute;
    expect(component.mdoFieldDisplayWith(object)).toEqual('Length');
    object.ATTR_CODE = null;
    expect(component.mdoFieldDisplayWith(object)).toEqual('');

  });

  it('should suggestedMdoFldTrkBy', () => {

    expect(component.suggestedMdoFldTrkBy(null)).toBeFalsy();

    const object = {NOUN_CODE: 'Bearing', MODE_CODE: 'Ball', ATTR_CODE: 'Length'};

    component.requestFor = RequestFor.noun;
    expect(component.suggestedMdoFldTrkBy(object)).toEqual('Bearing');
    object.NOUN_CODE = null;
    expect(component.suggestedMdoFldTrkBy(object)).toEqual('');

    component.requestFor = RequestFor.moifier;
    expect(component.suggestedMdoFldTrkBy(object)).toEqual('Ball');
    object.MODE_CODE = null;
    expect(component.suggestedMdoFldTrkBy(object)).toEqual('');

    component.requestFor = RequestFor.attribute;
    expect(component.suggestedMdoFldTrkBy(object)).toEqual('Length');
    object.ATTR_CODE = null;
    expect(component.suggestedMdoFldTrkBy(object)).toEqual('');

  });

  it('should displayDroptext', () => {

    expect(component.displayDroptext(null)).toBeFalsy();

    const object = {NOUN_CODE: 'Bearing', NOUN_LONG: 'Bearing desc', MODE_CODE: 'Ball', MOD_LONG: 'Ball desc', ATTR_CODE: 'Length', ATTR_DESC: 'Length mm'};

    component.requestFor = RequestFor.noun;
    expect(component.displayDroptext(object)).toEqual('Bearing');
    object.NOUN_CODE = null;
    expect(component.displayDroptext(object)).toEqual('Bearing desc');

    component.requestFor = RequestFor.moifier;
    expect(component.displayDroptext(object)).toEqual('Ball');
    object.MODE_CODE = null;
    expect(component.displayDroptext(object)).toEqual('Ball desc');

    component.requestFor = RequestFor.attribute;
    expect(component.displayDroptext(object)).toEqual('Length mm');
    object.ATTR_DESC = null;
    expect(component.displayDroptext(object)).toEqual('Length');

  });

  it('should getOptionVal', () => {

    expect(component.getOptionVal(null)).toBeFalsy();

    const object = {NOUN_CODE: 'Bearing', NOUN_LONG: 'Bearing desc', MODE_CODE: 'Ball', MOD_LONG: 'Ball desc', ATTR_CODE: 'Length', ATTR_DESC: 'Length mm'};

    component.requestFor = RequestFor.noun;
    expect(component.getOptionVal(object)).toEqual('Bearing');
    object.NOUN_CODE = null;
    expect(component.getOptionVal(object)).toEqual('Bearing desc');

    component.requestFor = RequestFor.moifier;
    expect(component.getOptionVal(object)).toEqual('Ball');
    object.MODE_CODE = null;
    expect(component.getOptionVal(object)).toEqual('Ball desc');

    component.requestFor = RequestFor.attribute;
    expect(component.getOptionVal(object)).toEqual('Length');
    object.ATTR_CODE = null;
    expect(component.getOptionVal(object)).toEqual('Length mm');

  });

  it('should getNouns', () => {
    spyOn(userDetailsService, 'getUserDetails').and.returnValue(of({plantCode: '0'} as Userdetails));
    spyOn(nounModifierService, 'getLocalNouns').and.returnValue(of([]));

    component.getNouns('');
    expect(userDetailsService.getUserDetails).toHaveBeenCalled();
    expect(nounModifierService.getLocalNouns).toHaveBeenCalled();

  })

  it('should getModifiers', () => {
    spyOn(userDetailsService, 'getUserDetails').and.returnValue(of({plantCode: '0'} as Userdetails));
    spyOn(nounModifierService, 'getLocalModifier').and.returnValue(of([]));

    component.getModifiers('');

    component.selectedNoun = 'Bearing';
    component.getModifiers('');

    expect(userDetailsService.getUserDetails).toHaveBeenCalledTimes(2);
    expect(nounModifierService.getLocalModifier).toHaveBeenCalledTimes(2);

  });

  it('should getModifiers', () => {
    spyOn(userDetailsService, 'getUserDetails').and.returnValue(of({plantCode: '0'} as Userdetails));
    spyOn(nounModifierService, 'getLocalAttribute').and.returnValue(of([]));

    component.getAttributes('');

    component.selectedNoun = 'Bearing';
    component.selectedModifier = 'Ball';
    component.getAttributes('');

    expect(userDetailsService.getUserDetails).toHaveBeenCalledTimes(2);
    expect(nounModifierService.getLocalAttribute).toHaveBeenCalledTimes(2);

  });

  it('should init component', () => {
    component.ngOnInit();
    expect(component.formCtrl).toBeDefined();

    component.ngOnInit();
    expect(component.formCtrl).toBeDefined();
  });

  it('should filterAutocompleteOptions', () => {

    spyOn(component, 'getNouns');
    spyOn(component, 'getModifiers');
    spyOn(component, 'getAttributes');

    component.filterAutocompleteOptions({});

    component.requestFor = RequestFor.noun;
    component.filterAutocompleteOptions('search text');

    component.requestFor = RequestFor.moifier;
    component.filterAutocompleteOptions('search text');

    component.requestFor = RequestFor.attribute;
    component.filterAutocompleteOptions('search text');

    expect(component.getNouns).toHaveBeenCalledTimes(1);
    expect(component.getModifiers).toHaveBeenCalledTimes(1);
    expect(component.getAttributes).toHaveBeenCalledTimes(1);

  })
});
