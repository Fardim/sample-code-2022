import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { UserPasswordPolicy, UserPasswordPolicyActionResponse } from './../../../../_models/userdetails';
import { of, throwError } from 'rxjs';
import { TransientService } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { UserPasswordPolicyService } from '@services/user/user-password-policy.service';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { PasswordPolicyComponent } from './password-policy.component';
import { MatChipInputEvent } from '@angular/material/chips';

describe('PasswordPolicyComponent', () => {
  let component: PasswordPolicyComponent;
  let fixture: ComponentFixture<PasswordPolicyComponent>;
  let userPasswordPolicyService: UserPasswordPolicyService;
  let transientService: TransientService;
  let mockPasswordPolicy: UserPasswordPolicy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PasswordPolicyComponent ],
      imports:  [ AppMaterialModuleForSpec, SharedModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordPolicyComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
    userPasswordPolicyService = fixture.debugElement.injector.get(UserPasswordPolicyService);
    transientService = fixture.debugElement.injector.get(TransientService);
    mockPasswordPolicy = {
      uuid: '',
      minimumLength: 12,
      upperCase: true,
      lowerCase: false,
      digit: true,
      specialCharacterAllowed: false,
      initialLoginPaswordReset: false,
      historyCount: 10,
      maximumAge: 10,
      maxloginAttempts: 12,
      userDefinedValues: ['One','Two','Three'],
      systemDefinedValues: ['Six','Seven','Eight'],
      userId: '',
      tenantId: ''
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit()', () => {
    spyOn(component, 'getPasswordPolicy');
    component.ngOnInit();
    expect(component.getPasswordPolicy).toHaveBeenCalled();
  });

  it('hasLimit()', () => {
    fixture.detectChanges();
    expect(component.hasLimit()).toBeFalse();
  });

  it('getPasswordPolicy(), should get password policy', async(() => {
    spyOn(userPasswordPolicyService, 'getPasswordPolicy').and.returnValues(of(mockPasswordPolicy), throwError({ message: 'api error'}));
    spyOn(component, 'createPasswordPolicyFormGroup');

    component.getPasswordPolicy();
    expect(component.userPasswordPolicy).toBeTruthy();
    expect(component.createPasswordPolicyFormGroup).toHaveBeenCalled();

    spyOn(console, 'error');
    component.getPasswordPolicy();
    expect(console.error).toHaveBeenCalled();
    expect(component.createPasswordPolicyFormGroup).toHaveBeenCalled();

  }));

  it('createPasswordPolicyFormGroup(), should create formgroup', async(() => {
    component.createPasswordPolicyFormGroup(mockPasswordPolicy);
    expect(component.passwordPolicyFormGroup).toBeTruthy();
    const newmockPasswordPolicy = new UserPasswordPolicy();
    newmockPasswordPolicy.uuid = 'uuid';
    newmockPasswordPolicy.minimumLength = 0;
    newmockPasswordPolicy.upperCase = false;
    newmockPasswordPolicy.lowerCase = true;
    newmockPasswordPolicy.digit = false;
    newmockPasswordPolicy.specialCharacterAllowed  = true;
    newmockPasswordPolicy.initialLoginPaswordReset   = true;
    newmockPasswordPolicy.historyCount = 0;
    newmockPasswordPolicy.maximumAge = 0;
    newmockPasswordPolicy.maxloginAttempts = 0;
    newmockPasswordPolicy.userDefinedValues = null;
    newmockPasswordPolicy.systemDefinedValues = null;

    component.createPasswordPolicyFormGroup(newmockPasswordPolicy);
    expect(component.passwordPolicyFormGroup).toBeTruthy();
  }));

  it('getHint(), should get error hints', async(() => {
    component.createPasswordPolicyFormGroup(mockPasswordPolicy);
    component.passwordPolicyFormGroup.controls.minimumLength.setValue(6);
    component.passwordPolicyFormGroup.controls.minimumLength.markAsTouched();
    let msg = component.getHint('minimumLength');
    expect(msg).toEqual('Minimum value is 8');

    component.passwordPolicyFormGroup.controls.maximumAge.setValue(1000);
    component.passwordPolicyFormGroup.controls.maximumAge.markAsTouched();
    msg = component.getHint('maximumAge');
    expect(msg).toEqual('Maximum value is 999');

    component.passwordPolicyFormGroup.controls.maxloginAttempts.setValue(10);
    component.passwordPolicyFormGroup.controls.maxloginAttempts.markAsTouched();
    const field = 'maxloginAttempts';
    msg = component.getHint(field);
    expect(component.hasError[field]).toBeFalse();
  }));

  it('toggleChange(), lib-toggle-slider toggled', fakeAsync(() => {
    spyOn(component, 'upsertPasswordPolicy');
    component.toggleChange(true);
    tick(11);
    expect(component.upsertPasswordPolicy).toHaveBeenCalledTimes(1);
  }));

  it('onInputBlur(), should call upsertPasswordPolicy on blur a field', async(() => {
    spyOn(component, 'upsertPasswordPolicy');
    component.onInputBlur();
    expect(component.upsertPasswordPolicy).toHaveBeenCalledTimes(1);
  }));

  it('upsertPasswordPolicy(), should call upsertPasswordPolicy service api', async(() => {
    const successResponse: UserPasswordPolicyActionResponse = {
      id: 'anyid',
      message: 'Success',
      interrupt: false
    };
    const failResponse: UserPasswordPolicyActionResponse = {
      id: 'anyid',
      message: 'Failed',
      interrupt: false
    };
    spyOn(userPasswordPolicyService, 'policyAdd').and.returnValues(of(successResponse), of(failResponse), throwError({ message: 'api error'}));
    spyOn(transientService, 'open');
    spyOn(userPasswordPolicyService, 'validateAllFormFields');

    mockPasswordPolicy.minimumLength = 6;
    component.createPasswordPolicyFormGroup(mockPasswordPolicy);
    component.upsertPasswordPolicy();
    expect(transientService.open).toHaveBeenCalled();
    expect(userPasswordPolicyService.validateAllFormFields).toHaveBeenCalled();

    mockPasswordPolicy.minimumLength = 10;
    component.createPasswordPolicyFormGroup(mockPasswordPolicy);
    // success response
    component.upsertPasswordPolicy();

    // fail response
    component.upsertPasswordPolicy();
    expect(transientService.open).toHaveBeenCalled();

    // error response
    spyOn(console, 'error');
    component.upsertPasswordPolicy();
    expect(console.error).toHaveBeenCalled();
    expect(transientService.open).toHaveBeenCalled();

  }));

  // it('selectedUserDefinedValues()', async(() => {
  //   component.createPasswordPolicyFormGroup(mockPasswordPolicy);
  //   fixture.detectChanges();
  //   expect(fixture.componentInstance.userDefinedValuesInput).toBeDefined();
  //   const selected:MatAutocompleteSelectedEvent = {option:{value:component.allOptions[5], viewValue: component.allOptions[5]}} as MatAutocompleteSelectedEvent;
  //   component.selectedUserDefinedValues(selected);
  //   const userDefinedValues: string[] = component.passwordPolicyFormGroup.value.userDefinedValues;
  //   expect(userDefinedValues.length).toEqual(4);

  //   const result = component.selectedUserDefinedValues(selected);
  //   expect(result).toBeFalsy();
  // }));

  it('selectedSystemDefinedValues()', async(() => {
    component.createPasswordPolicyFormGroup(mockPasswordPolicy);
    fixture.detectChanges();
    expect(fixture.componentInstance.systemDefinedValuesInput).toBeDefined();
    const selected:MatAutocompleteSelectedEvent = {option:{value:component.allOptions[2], viewValue: component.allOptions[2]}} as MatAutocompleteSelectedEvent;
    component.selectedSystemDefinedValues(selected);
    const systemDefinedValues: string[] = component.passwordPolicyFormGroup.value.systemDefinedValues;
    expect(systemDefinedValues.length).toEqual(4);

    const result = component.selectedSystemDefinedValues(selected);
    expect(result).toBeFalsy();
  }));

  it('removeUserDefinedValues()', async(() => {
    fixture.detectChanges();
    component.createPasswordPolicyFormGroup(mockPasswordPolicy);
    component.removeUserDefinedValues('One');
    const userDefinedValues: string[] = component.passwordPolicyFormGroup.value.userDefinedValues;
    expect(userDefinedValues.length).toEqual(2);

    const result = component.removeUserDefinedValues('One');
    expect(result).toBeFalsy();
  }));

  it('removeSystemDefinedValues()', async(() => {
    fixture.detectChanges();
    component.createPasswordPolicyFormGroup(mockPasswordPolicy);
    component.removeSystemDefinedValues('Eight');
    const systemDefinedValues: string[] = component.passwordPolicyFormGroup.value.systemDefinedValues;
    expect(systemDefinedValues.length).toEqual(2);

    const result = component.removeSystemDefinedValues('Eight');
    expect(result).toBeFalsy();
  }));

  it('_filter()', async(() => {
    fixture.detectChanges();
    const result = component._filter('First Name');
    expect(result.length).toBeGreaterThan(0);
  }));

  it('add() remove()', async(() => {
    fixture.detectChanges();
    component.createPasswordPolicyFormGroup(mockPasswordPolicy);
    let event = { input: { value: 'kaise@yopmail.com' }, value: 'kaise@yopmail.com' } as MatChipInputEvent;
    component.add(event);
    expect(component.userDefinedValues.length).toEqual(4);

    event = { input: { value: '' }, value: '' } as MatChipInputEvent;
    let addResult = component.add(event);
    expect(addResult).toBeFalsy();

    event = { input: null, value: '' } as MatChipInputEvent;
    addResult = component.add(event);
    expect(addResult).toBeFalsy();

    component.remove('kaise@yopmail.com');
    expect(component.userDefinedValues.length).toEqual(3);
    const removeResult = component.remove('kaise@yopmail.com');
    expect(removeResult).toBeFalsy();
  }));

});
