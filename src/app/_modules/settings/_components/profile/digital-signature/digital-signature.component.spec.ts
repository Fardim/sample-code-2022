import { SharedModule } from '@shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { UserPersonalDetails } from '@models/userdetails';
import { UserService } from '@services/user/userservice.service';
import { of, throwError } from 'rxjs';
import SignaturePad from 'signature_pad';

import { DigitalSignatureComponent } from './digital-signature.component';

describe('DigitalSignatureComponent', () => {
  let component: DigitalSignatureComponent;
  let fixture: ComponentFixture<DigitalSignatureComponent>;
  let router: Router;
  let userService: UserService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DigitalSignatureComponent],
      imports: [RouterTestingModule, AppMaterialModuleForSpec, HttpClientTestingModule, SharedModule],
    }).compileComponents();
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DigitalSignatureComponent);
    component = fixture.componentInstance;
    userService = fixture.debugElement.injector.get(UserService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngAfterViewInit(), load pre required ', async(() => {
    spyOn(component, 'ngAfterViewInit').and.callThrough();
    component.ngAfterViewInit();
    expect(component.ngAfterViewInit).toBeTruthy();

    component.signaturePad = new SignaturePad(component.signaturePadElement.nativeElement);
    spyOn(component, 'getUserDetails').and.callThrough();
    component.getUserDetails();
    expect(component.getUserDetails).toHaveBeenCalled();
  }));

  it('close(), should close digital signsture sidesheet', async () => {
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/settings`, outer: null } }], {
      queryParamsHandling: 'preserve',
    });
  });

  it('save(), shouldvalidate signature if it is empty', async () => {
    component.isSignatureEmpty = false;
    component.signaturePad = new SignaturePad(component.signaturePadElement.nativeElement);
    spyOn(component.signaturePad, 'isEmpty').and.returnValue(true);
    component.save();
    expect(component.isSignatureEmpty).toEqual(true);
  });

  it('save(), should save signature if it is not empty', async () => {
    component.isSignatureEmpty = false;
    component.currentUserPersonalDetails = new UserPersonalDetails();
    component.currentUserPersonalDetails.name = 'Test';
    component.currentUserPersonalDetails.publicName = 'Test';
    component.currentUserPersonalDetails.phone = 54545;
    component.currentUserPersonalDetails.pemail = 'test@test.com';
    component.currentUserPersonalDetails.semail = 'test@test.com';

    component.signaturePad = new SignaturePad(component.signaturePadElement.nativeElement);
    spyOn(component.signaturePad, 'isEmpty').and.returnValue(false);
    component.save();
    expect(component.isSignatureEmpty).toEqual(false);
    spyOn(component, 'saveUpdateUserDetails');
    component.saveUpdateUserDetails();
    expect(component.saveUpdateUserDetails).toHaveBeenCalled();
  });

  it('getUserDetails(), should get personal details', async(() => {
    component.signaturePad = new SignaturePad(component.signaturePadElement.nativeElement);

    const personalDetails: UserPersonalDetails = new UserPersonalDetails();
    personalDetails.name = 'Test';
    personalDetails.publicName = 'Test';
    personalDetails.phone = 54545;
    personalDetails.pemail = 'test@test.com';
    personalDetails.semail = 'test@test.com';

    spyOn(userService, 'getUserPersonalDetails').and.returnValues(of(personalDetails), throwError({ message: 'Something went wrong' }));
    component.getUserDetails();
    expect(userService.getUserPersonalDetails).toHaveBeenCalled();
    expect(component.currentUserPersonalDetails).toEqual(personalDetails);
    expect(component.currentUserPersonalDetails.name === personalDetails.name).toBeTruthy();
  }));

  it('clearSignature(), should clear signature and save details', async(() => {
    component.currentUserPersonalDetails = new UserPersonalDetails();
    component.currentUserPersonalDetails.name = 'Test';
    component.currentUserPersonalDetails.publicName = 'Test';
    component.currentUserPersonalDetails.phone = 54545;
    component.currentUserPersonalDetails.pemail = 'test@test.com';
    component.currentUserPersonalDetails.semail = 'test@test.com';
    component.currentUserPersonalDetails.digitalSignature = 'dummy URL';

    component.signaturePad = new SignaturePad(component.signaturePadElement.nativeElement);

    spyOn(component, 'clearSignature').and.callThrough();
    component.clearSignature();
    expect(component.clearSignature).toHaveBeenCalled();
    expect(component.currentUserPersonalDetails.digitalSignature).toEqual(null);

    spyOn(component.signaturePad, 'clear');

    spyOn(component, 'saveUpdateUserDetails');
    component.saveUpdateUserDetails();
    expect(component.saveUpdateUserDetails).toHaveBeenCalled();
  }));

  it('saveUpdateUserDetails(), should save userdetails with updated digital signature value', async (done) => {
    const personalDetails = new UserPersonalDetails();
    const response = {
      acknowledge: true,
      errorMsg: 'Error',
      userName: 'Test Name',
    };
    spyOn(userService, 'updateUserPersonalDetails').and.returnValue(of(response));

    const closeSpy = spyOn(component, 'close').and.callFake(() => null);
    component.saveUpdateUserDetails();
    // @ts-ignore
    component.userService.updateUserPersonalDetails(personalDetails).subscribe(() => {
      expect(closeSpy).toHaveBeenCalled();
      done();
    });
  });
});
