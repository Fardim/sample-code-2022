import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MsteamsConfigService } from '@modules/msteams/_service/msteams-config.service';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { InviteUserLoginComponent } from './invite-user-login.component';

describe('InviteUserLoginComponent', () => {
  let component: InviteUserLoginComponent;
  let fixture: ComponentFixture<InviteUserLoginComponent>;
  // let msTeamService: MsteamsConfigService;
  // eslint-disable-next-line
  let router: Router;
  const mockValues = {
    password: 'welcome12',
    verifyPassword: 'welcome12',
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InviteUserLoginComponent],
      providers: [MsteamsConfigService, FormBuilder],
      imports: [HttpClientTestingModule, AppMaterialModuleForSpec, MdoUiLibraryModule, RouterTestingModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InviteUserLoginComponent);
    component = fixture.componentInstance;
    // msTeamService = fixture.debugElement.injector.get(MsteamsConfigService);
    router = fixture.debugElement.injector.get(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getHint(), should get error hints', async(() => {
    component.ngOnInit();

    component.inviteUserForm.controls.verifyPassword.markAsTouched();
    let msg = component.getHint('verifyPassword');
    expect(msg).toEqual('This is a required field');

    Object.keys(mockValues).forEach((field) => {
      component.inviteUserForm.controls[field].setValue(mockValues[field]);
    });
    msg = component.getHint('password');
    expect(msg).toEqual('');

    component.inviteUserForm.controls.password.setValue('Test1234');
    component.inviteUserForm.controls.password.markAsTouched();
    component.inviteUserForm.controls.verifyPassword.setValue('Test1235');
    component.inviteUserForm.controls.password.markAsTouched();
    msg = component.getHint('verifyPassword');
    expect(msg).toEqual(`Passwords must match`);
  }));

  it('submitPassword(), should give error if form is invalid', () => {
    component.submitPassword();
    expect(component.inviteUserForm.valid).toBeFalsy();
  });

  // it('validateURL(), validate url', async(() => {
  //   spyOn(msTeamService, 'validateURL');
  //   component.validateURL();
  //   expect(msTeamService.validateURL).toHaveBeenCalled();
  // }));

  // it('submitPassword(), should submit details if form is valid', () => {
  //   component.inviteUserForm.controls['email'].setValue('admin@gmail.com');
  //   component.inviteUserForm.controls['password'].setValue('admin123');
  //   component.inviteUserForm.controls['verifyPassword'].setValue('admin123');
  //   spyOn(msTeamService, 'inviteUserUpdatePassword');
  //   const payload = {
  //     email: 'admin@gmail.com',
  //     password: 'admin123',
  //   };
  //   component.submitPassword();
  //   expect(msTeamService.inviteUserUpdatePassword).toHaveBeenCalledWith(payload);
  // });
});
