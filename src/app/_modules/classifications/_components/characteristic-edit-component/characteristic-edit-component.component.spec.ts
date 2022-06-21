import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CharacteristicEditComponentComponent } from './characteristic-edit-component.component';
import { RuleService } from '@services/rule/rule.service';
import { SharedModule } from '@modules/shared/shared.module';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { Location } from '@angular/common';
import { of } from 'rxjs';

describe('CharacteristicEditComponentComponent', () => {
  let component: CharacteristicEditComponentComponent;
  let fixture: ComponentFixture<CharacteristicEditComponentComponent>;
  let ruleService: RuleService;
  let location: Location;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CharacteristicEditComponentComponent],
      imports: [AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, SharedModule]
    }).compileComponents();
    location = TestBed.inject(Location);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CharacteristicEditComponentComponent);
    component = fixture.componentInstance;
    ruleService = fixture.debugElement.injector.get(RuleService);

    window.history.pushState({
      characteristics: {
        uuid: 'ac78db0f-ce90-40b7-b293-8469e247870d',
        charCode: 'ARBOR',
        charDesc: 'ARBOR',
        fieldType: 'NUMC',
        numCode: '0fc09dc4-15fe-42d2-9a6e-291731ac593b',
        descActive: true,
        dimensionType: '',
        sapChars: '',
        helpText: '',
        dataType: 'NUMC',
        length: '100',
        labels: [
          {
            uuid: 'd05ef4e3-06cf-486d-85e9-abea8b29d255',
            label: 'ARBOR',
            language: 'en'
          }
        ],
        isChecklist: false,
        defaultValue: '',
        tenantId: '0'
      }
    }, '', '');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit, should init', () => {
    component.initForm();
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();
  });

  it('checkForFieldTypeChange(), should updated specific date', async () => {
    spyOn(component, 'checkForFieldTypeChange').and.callThrough();
    component.initForm();
    component.checkForFieldTypeChange('TEXT');
    expect(component.checkForFieldTypeChange).toHaveBeenCalled();
  });

  it('checkForDataTypeChange(), should updated specific date', async () => {
    spyOn(component, 'checkForDataTypeChange').and.callThrough();
    component.initForm();
    component.checkForDataTypeChange('TIME');
    expect(component.checkForDataTypeChange).toHaveBeenCalled();
  });

  it('handleFieldsBehaviour()', async () => {
    spyOn(component, 'handleFieldsBehaviour').and.callThrough();
    component.initForm();
    component.handleFieldsBehaviour();
    expect(component.handleFieldsBehaviour).toHaveBeenCalled();
  });

  it('onFieldTypeChange()', () => {
    component.initForm();
    component.onFieldTypeChange({ option: { value: 'TEXT' } });
    expect(component.typeList[0].name).toEqual('CHAR');

    component.onFieldTypeChange({ option: { value: 'CURRENCY' } });
    expect(component.typeList[0].name).toEqual('NUMC');

    component.onFieldTypeChange({ option: { value: 'DROPDOWN' } });
    expect(component.typeList[0].name).toEqual('CHAR');
  });

  it('validFromChanged(), should updated specific date', async () => {
    const ev = 'Fri Jan 07 2022 15:57:54 GMT+0530(India Standard Time)';
    component.initForm();
    component.form.controls.validFrom.setValue(ev);
    component.validFromChanged(ev);
    expect(component.form.get('validFrom').value).toEqual(ev);
  });

  it('validToChanged(), should updated specific date', async () => {
    const ev = 'Fri Jan 07 2022 15:57:54 GMT+0530(India Standard Time)';
    component.initForm();
    component.form.controls.validTo.setValue(ev);
    component.validToChanged(ev);
    expect(component.form.get('validTo').value).toEqual(ev);
  });

  it('getValidFromValue(), should return selected value', async () => {
    component.initForm();
    component.form.get('validFrom').setValue('Fri Jan 07 2022 15:57:54 GMT+0530(India Standard Time)');
    expect(component.getValidFromValue()).toEqual(component.form.get('validFrom').value);
  });

  it('getValidToValue(), should return selected value', async () => {
    component.initForm();
    component.form.get('validTo').setValue('Fri Jan 07 2022 15:57:54 GMT+0530(India Standard Time)');
    expect(component.getValidToValue()).toEqual(component.form.get('validTo').value);
  });

  it('checkFormValidation(), check form controls validation', () => {
    component.initForm();
    component.checkFormValidation();
    expect(component.bannerMessage).toEqual('Fields are required')
  });

  it('clearFormValidation(), Clears form invalid controls on cancel', () => {
    spyOn(component, 'clearFormValidation').and.callThrough();
    component.initForm();
    component.clearFormValidation();
    expect(component.clearFormValidation).toHaveBeenCalled();
  });

  it('it should close the dialog', () => {
    spyOn(location, 'back');
    component.closeDialog();
    expect(location.back).toHaveBeenCalledTimes(1);
  });


  it('saveCharacteristics(), should form invalid', () => {
    spyOn(component, 'saveCharacteristics').and.callThrough();
    spyOn(ruleService, 'saveCharacteristics').and.returnValue(of({ acknowledged: true }));

    component.initForm();
    component.saveCharacteristics();
    expect(component.form.valid).toBeFalsy();
  });
});
