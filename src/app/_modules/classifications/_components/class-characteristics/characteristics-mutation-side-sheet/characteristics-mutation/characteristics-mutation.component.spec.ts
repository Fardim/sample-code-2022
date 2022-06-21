import { FormControl, Validators } from '@angular/forms';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CharacteristicsMutationComponent } from './characteristics-mutation.component';
import { RuleService } from '@services/rule/rule.service';
import { of, throwError } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { Router } from '@angular/router';


describe('CharacteristicsMutationComponent', () => {
  let component: CharacteristicsMutationComponent;
  let fixture: ComponentFixture<CharacteristicsMutationComponent>;
  let ruleService: RuleService;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CharacteristicsMutationComponent],
      imports: [AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, SharedModule],
      // providers: [{ provide: ElementRef, useValue: new MockElementRef(document.createElement('input')) }]
    }).compileComponents();
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CharacteristicsMutationComponent);
    component = fixture.componentInstance;
    ruleService = fixture.debugElement.injector.get(RuleService);
    window.history.pushState({
      classId: 'test'
    }, '', '');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have isHeaderChecked as false', async(() => {
    expect(component.isHeaderChecked).toEqual(false);
  }));

  it('ngOnInit(), should call ngOnInit', (() => {
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();
  }));

  it('addForm(), should add a field', async(() => {
    component.initForm();
    component.addForm();
    expect(component.frmArray.length).toEqual(2);
  }));

  it('close(), should close the current router', () => {
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalled();
  });

  it('closeDialog()', () => {
    spyOn(component, 'closeDialog').and.callThrough();
    component.closeDialog();
    expect(component.closeDialog).toHaveBeenCalled();
  });

  it('masterToggle(), should be checxked', () => {
    component.initForm();
    component.addForm();
    component.masterToggle({ value: 'select_this_page' });
    expect(component.frmArray.at(0).value.selected).toEqual(true);
  });

  it('masterToggle(), should not be checxked', () => {
    component.initForm();
    component.addForm();
    component.masterToggle({ value: 'select_none' });
    expect(component.frmArray.length).toEqual(2);
  });

  it('masterToggle(), default', () => {
    component.initForm();
    component.addForm();
    component.masterToggle({ value: 'no_data' });
    expect(component.frmArray.length).toEqual(2);
  });

  it('masterToggle(), deleted', () => {
    component.initForm();
    component.addForm();
    component.frmArray.at(0).value.selected = true;
    component.masterToggle({ value: 'delete' });
    expect(component.frmArray.at(0).value.selected).toEqual(false);
    expect(component.isHeaderChecked).toEqual(false);
  });

  it('updateMasterToggle()', () => {
    spyOn(component, 'updateMasterToggle').and.callThrough();
    component.updateMasterToggle();
    expect(component.isHeaderChecked).toEqual(false);
    expect(component.updateMasterToggle).toHaveBeenCalled();
  });

  it('onCharacteristicsSave(), should form invalid', () => {
    spyOn(component, 'onCharacteristicsSave').and.callThrough();
    spyOn(ruleService, 'saveCharacteristics').and.returnValue(of({ acknowledged: true }));

    component.initForm();
    component.onCharacteristicsSave();
    expect(component.form.valid).toBeFalsy();
  });

  it('onCharacteristicsSave()', () => {
    spyOn(component, 'onCharacteristicsSave').and.callThrough();
    spyOn(ruleService, 'saveCharacteristics').and.returnValue(of({ acknowledged: true }));

    component.initForm();
    component.frmArray.push(component.formBuilder.group({
      selected: new FormControl(true),
      charCode: new FormControl('Test', [Validators.required]),
      charDesc: new FormControl('', []),
      type: new FormControl('PICKLIST', [Validators.required]),
      codeLong: new FormControl('', []),
      mod: new FormControl('', []),
      modLong: new FormControl('', []),
      numCode: new FormControl('', []),
      modNumCode: new FormControl('', []),
      isNoun: new FormControl('', []),
      isCodePartOfDesc: new FormControl('', []),
      isModPartOfDesc: new FormControl('', []),
      imageUrl: new FormControl('', []),
      inheritAttributes: new FormControl('', []),
      validForm: new FormControl('', [])
    }));

    component.onCharacteristicsSave();
    expect(component.onCharacteristicsSave).toHaveBeenCalled();
  });

  it('onCharacteristicsSave(), should throw error', () => {
    spyOn(component, 'onCharacteristicsSave').and.callThrough();
    spyOn(ruleService, 'saveCharacteristics').and.returnValue(of(throwError({ errorMsg: 'error' })));

    component.initForm();
    component.frmArray.push(component.formBuilder.group({
      selected: new FormControl(true),
      charCode: new FormControl('Test', [Validators.required]),
      charDesc: new FormControl('', []),
      type: new FormControl('PICKLIST', [Validators.required]),
      codeLong: new FormControl('', []),
      mod: new FormControl('', []),
      modLong: new FormControl('', []),
      numCode: new FormControl('', []),
      modNumCode: new FormControl('', []),
      isNoun: new FormControl('', []),
      isCodePartOfDesc: new FormControl('', []),
      isModPartOfDesc: new FormControl('', []),
      imageUrl: new FormControl('', []),
      inheritAttributes: new FormControl('', []),
      validForm: new FormControl('', [])
    }));
    component.onCharacteristicsSave();
    expect(component.onCharacteristicsSave).toHaveBeenCalled();
  });

  it('onCharacteristicsSave(), should form invalid', () => {
    spyOn(component, 'saveCharacteristics').and.callThrough();
    spyOn(ruleService, 'saveCharacteristics').and.returnValue(of({ acknowledged: true }));
    component.initForm();
    component.form = component.frmArray.value;
    component.saveCharacteristics();
    expect(component.saveCharacteristics).toHaveBeenCalled();
  });

  it('onCharacteristicsSave(), should form invalid', () => {
    spyOn(component, 'saveCharacteristics').and.callThrough();
    spyOn(ruleService, 'saveCharacteristics').and.returnValue(of(throwError({ message: 'error' })));

    component.initForm();
    component.form = component.frmArray.value;
    component.saveCharacteristics();
    expect(component.saveCharacteristics).toHaveBeenCalled();
  });

  it('saveCharacteristics(), should throw error', () => {
    spyOn(component, 'saveCharacteristics').and.callThrough();
    spyOn(ruleService, 'saveCharacteristicsList').and.returnValue(of(throwError({ message: 'error' })));
    component.initForm();
    component.form = component.frmArray.value;
    component.saveCharacteristics();
    expect(component.saveCharacteristics).toHaveBeenCalled();
  });
});
