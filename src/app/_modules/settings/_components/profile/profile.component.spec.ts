
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete';
import { SharedModule } from '@modules/shared/shared.module';
import { MdoUiLibraryModule, TransientService } from 'mdo-ui-library';

import { ProfileComponent } from './profile.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserService } from '@services/user/userservice.service';
import { of, throwError } from 'rxjs';
import { UserPersonalDetails, UserPreferenceDetails } from '@models/userdetails';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let router: Router;
  let userService: UserService;
  const params = { username: 'admin' };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [
        SharedModule,
        MdoUiLibraryModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatAutocompleteModule,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [
        TransientService,
        {
          provide: ActivatedRoute,
          useValue: { params: of(params) },
        },
      ],
    }).compileComponents();
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
    userService = fixture.debugElement.injector.get(UserService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getSelectedUserDetails(), should get selected user personal details', async(() => {
    component.selectedUserFromTeamsUsername = 'admin';
    const personalDetails: UserPersonalDetails = new UserPersonalDetails();
    personalDetails.name = 'Test';
    personalDetails.publicName = 'Test';
    personalDetails.phone = 54545;
    personalDetails.pemail = 'test@test.com';
    personalDetails.semail = 'test@test.com';

    spyOn(userService, 'getSelectedUserDetails')
      .withArgs(component.selectedUserFromTeamsUsername)
      .and.returnValues(of(personalDetails), throwError({ message: 'Something went wrong' }));
    component.ngOnInit();
    expect(userService.getSelectedUserDetails).toHaveBeenCalledWith(component.selectedUserFromTeamsUsername);

    expect(component.currentUserDetails).toEqual(personalDetails);
    expect(component.currentUserDetails.name === personalDetails.name).toBeTruthy();
  }));

  it('updatePersonalDetails(), should update personal details in db of current logged in user', async(() => {
    component.createForm();
    component.currentUserDetails = {
      fname: 'test',
      lname: 'admin',
      pemail: 'test@admin.com',
      semail: 'tests@admin.com',
      phone: 9876567890,
      avtarURL: '',
      digitalSignature: '',
      fb: '',
      name: '',
      linkedin: '',
      mname: 'test',
      profileKey: {
        tenantId: '',
        userName: '',
      },
      publicName: '',
      twitter: '',
    };

    const response = {
      fname: 'test',
      lname: 'admin',
      pemail: 'test@admin.com',
      semail: 'tests@admin.com',
      phone: 9876567890,
      avtarURL: '',
      digitalSignature: '',
      fb: '',
      name: '',
      linkedin: '',
      mname: 'test',
      profileKey: {
        tenantId: '',
        userName: '',
      },
      publicName: '',
      twitter: '',
    };
    spyOn(userService, 'updateUserPersonalDetails').and.returnValues(of(response), throwError({ message: 'Something went wrong' }));
    component.updatePersonalDetails();
    expect(userService.updateUserPersonalDetails).toHaveBeenCalled();
  }));

  it('updatePersonalDetails(), should update personal details in db of selected user from teams', async(() => {
    component.createForm();
    component.selectedUserFromTeamsUsername = 'darshan4 trambadiya';
    component.currentUserDetails = {
      fname: 'test',
      lname: 'admin',
      pemail: 'test@admin.com',
      semail: 'tests@admin.com',
      phone: 9876567890,
      avtarURL: '',
      digitalSignature: '',
      fb: '',
      name: '',
      linkedin: '',
      mname: 'test',
      profileKey: {
        tenantId: '',
        userName: '',
      },
      publicName: '',
      twitter: '',
    };

    const response = {
      fname: 'test',
      lname: 'admin',
      pemail: 'test@admin.com',
      semail: 'tests@admin.com',
      phone: 9876567890,
      avtarURL: '',
      digitalSignature: '',
      fb: '',
      name: '',
      linkedin: '',
      mname: 'test',
      profileKey: {
        tenantId: '',
        userName: '',
      },
      publicName: '',
      twitter: '',
    };
    spyOn(userService, 'updateSelectedUserDetails').and.returnValues(of(response), throwError({ message: 'Something went wrong' }));
    component.updatePersonalDetails();
    expect(userService.updateSelectedUserDetails).toHaveBeenCalled();
  }));

  it('getInitials(), should return avatar name', async(() => {
    component.createForm();
    component.settingsForm.controls.firstName.setValue('Alex');
    component.settingsForm.controls.lastName.setValue('Juke');
    const result = component.getInitials();
    expect(result).toEqual('AJ');
  }));

  it('getUserPreference(), should get user preference', async(() => {
    const userPref: UserPreferenceDetails = new UserPreferenceDetails();
    spyOn(userService, 'getUserPreferenceDetails').and.returnValues(of(userPref), throwError({ message: 'Something went wrong' }));

    spyOn(userService, 'getAllLanguagesList').and.returnValues(of([]), throwError({ message: 'Something went wrong' }));
    spyOn(userService, 'getDateFormatList').and.returnValues(of([]), throwError({ message: 'Something went wrong' }));
    spyOn(userService, 'getNumberFormatList').and.returnValues(of([]), throwError({ message: 'Something went wrong' }));

    component.ngOnInit();

    expect(component.languageSettingsForm.controls.language.value).toEqual('');
  }));

  it('getSelectedPreferenceUserDetails(), should get selected user preference', async(() => {
    const userPref: UserPreferenceDetails = new UserPreferenceDetails();
    spyOn(userService, 'getSelectedUserPreferenceUserDetails').and.returnValues(
      of(userPref),
      throwError({ message: 'Something went wrong' })
    );

    spyOn(userService, 'getAllLanguagesList').and.returnValues(of([]), throwError({ message: 'Something went wrong' }));
    spyOn(userService, 'getDateFormatList').and.returnValues(of([]), throwError({ message: 'Something went wrong' }));
    spyOn(userService, 'getNumberFormatList').and.returnValues(of([]), throwError({ message: 'Something went wrong' }));

    component.createLanguageSettingsForm();

    expect(component.languageSettingsForm.controls.language.value).toEqual(null);
  }));

  it('updates personal details in database', async(() => {
    expect(component.updatePersonalDetails).toBeTruthy();
  }));

  it('checks form valid status', async(() => {
    component.createForm();
    component.submitForm();
    expect(component.updateForm).toEqual(false);
  }));

  it('opens change password dialog', async(() => {
    expect(component.openChangePasswordDialog()).toBeTruthy();
  }));

  it('setValue(), should set field value', async(() => {
    component.createForm();
    component.setValue('userName', 'Test');

    expect(component.settingsForm.controls.userName.value === 'Test').toBeTruthy();
  }));

  it('getDropdownPos(), should set dropdown position', async(() => {
    const spy = jasmine.createSpyObj(MatAutocomplete, ['closed', 'opened']);
    expect(component.getDropdownPos(spy)).toEqual('chevron-down');
  }));

  it('filter(), should filter based on key', async(() => {
    const list = ['test1', 'test2', 'test3'];
    expect(component.filter('test1', list)).toEqual(['test1']);
  }));

  it('makeLangSettingsUpdateCall(), should make http call to update language settings', async(() => {
    component.selectedUserFromTeamsUsername = '';
    const response = {
      acknowledge: true,
      errorMsg: 'Error',
      userName: 'Test Name',
    };
    spyOn(userService, 'updateUserPreferenceDetails').and.returnValues(of(response), throwError({ message: 'Something went wrong' }));

    // component.currentUserPreferences = new UserPreferenceDetails();
    component.currentUserPreferences = {
      dFormat: 'dd.MM.yyyy',
      lang: 'en',
      nFormat: 'N',
      profileKey: {
        tenantId: '1',
        userName: 'admin',
      },
      tFormat: '12',
      timeZone: 'GMT+6',
      timezone: 'GMT+6',
      decimal: 'N'
    };
    component.timeZoneList = ['IST'];
    component.makeLangSettingsUpdateCall('IST', 'timeZone', component.timeZoneList);

    expect(component.currentUserPreferences.timeZone).toEqual('IST');
  }));

  it('makeLangSettingsUpdateCall(), should make http call to update language settings', async(() => {
    component.selectedUserFromTeamsUsername = '';
    const response = {
      acknowledge: true,
      errorMsg: 'Error',
      userName: 'Test Name',
    };
    spyOn(userService, 'updateUserPreferenceDetails').and.returnValues(of(response));

    component.currentUserPreferences = {
      dFormat: 'dd.MM.yyyy',
      lang: 'en',
      nFormat: 'N',
      profileKey: {
        tenantId: '1',
        userName: 'admin',
      },
      tFormat: '12',
      timeZone: 'GMT+6',
      timezone: 'GMT+6',
      decimal: 'N'
    };
    component.timeZoneList = ['IST'];

    component.makeLangSettingsUpdateCall('IST', 'timeZone', component.timeZoneList);
    expect(component.langFormErrMsg).toEqual('Error');
  }));

  it('should call openDigitalSignatureSideSheet()', async () => {
    spyOn(router, 'navigate');
    component.openDigitalSignatureSideSheet();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/settings`, outer: `outer/settings/digital-signature` } }]);
  });
});
