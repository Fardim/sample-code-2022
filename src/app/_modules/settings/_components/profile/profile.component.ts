import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TransientService } from 'mdo-ui-library';
import { ChangePasswordDialogComponent } from './change-password-dialog/change-password-dialog.component';
import { Observable, of, Subscription } from 'rxjs';
import { debounceTime, map, startWith, take } from 'rxjs/operators';
import { UserService } from '@services/user/userservice.service';
import { UserPersonalDetails, UserPreferenceDetails } from '@models/userdetails';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { ActivatedRoute, Router } from '@angular/router';
import { DECIMAL_SEPARATOR, THOUSAND_SEPARATOR } from 'src/app/_constants';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';

@Component({
  selector: 'pros-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  // Form group for the language settings
  languageSettingsForm: FormGroup;

  // stores user preferences
  currentUserPreferences: UserPreferenceDetails = null;

  // holds the list of filtered options
  filteredLangList: Observable<string[]>;
  filteredTimeZoneList: Observable<string[]>;
  filteredTimeFormatList: Observable<string[]>;
  filteredNumberFormatList: Observable<string[]>;

  // Language settings list
  languagesList: string[];
  timeZoneList: string[];
  dateFormatList: string[];
  timeFormatList: string[];
  numberFormatList: string[];

  // settings form
  settingsForm: FormGroup;

  // updates form after user stops editing
  updateForm = false;

  // stores user personal details obtained from db
  currentUserDetails: UserPersonalDetails;

  // stores error message on personal details update
  formErrMsg;

  // stores error message on language settings update
  langFormErrMsg;

  selectedUserFromTeamsUsername = '';
  subscription: Subscription = new Subscription();
  isValidAvtarURL = false;
  /**
   * show skeleton on initial load
   */
  showSkeleton = false;

  timeFormatOptions = [
    { key: '12 hour', value: '12' },
    { key: '24 hour', value: '24' },
  ];

  decimalSeparator = DECIMAL_SEPARATOR;
  thousandSeparator = THOUSAND_SEPARATOR;

  directProfile = false;

  constructor(
    private dialog: MatDialog,
    private libToast: TransientService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private sharedService: SharedServiceService
  ) { }

  ngOnInit(): void {
    this.createForm();
    this.createLanguageSettingsForm();

    // get UserId from url
    this.subscription.add(
      this.route.params.subscribe((params) => {
        if (params.username) {
          this.selectedUserFromTeamsUsername = params.username;
          this.getUserPersonalDetailsById();
          this.getSelectedPreferenceUserDetails();
        } else {
          this.getUserPersonalDetails();
          this.getUserPreference();
        }
      })
    );
    this.subscription.add(
      this.route.fragment.subscribe(resp => {
        if(resp === 'direct-to-profile') {
          this.directProfile = true;
        }
      })
    );
  }

  /**
   * selected user's personal details
   */
  getUserPersonalDetailsById() {
    this.showSkeleton = true;
    this.subscription.add(
      this.userService.getSelectedUserDetails(this.selectedUserFromTeamsUsername).subscribe(
        (data) => {
          this.showSkeleton = false;
          if (data) {
            this.currentUserDetails = data;
            this.setValueForFormControl(data);
          }
        },
        (err) => {
          this.showSkeleton = false;
          console.log(err);
        }
      )
    );
  }

  // /**
  //  * to check if current user's avatar is a correct URL or not
  //  */
  // checkIfUserProfileHasValidURL() {
  //   return this.currentUserDetails && this.currentUserDetails.avtarURL
  //     ? this.currentUserDetails.avtarURL.match(
  //       /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
  //     )
  //     : false;
  // }

  /**
   * fetches data list for all language settings
   */
  getLanguageSettingsList() {
    this.userService.getAllLanguagesList().subscribe(
      (data) => {
        if (data) {
          this.languagesList = data;
          this.filteredLangList = of(this.languagesList);
        }
      },
      (err) => {
        console.log(err);
      }
    );

    this.userService.getDateFormatList().subscribe(
      (data) => {
        if (data) {
          this.dateFormatList = data;
        }
      },
      (err) => {
        console.log(err);
      }
    );

    this.userService.getNumberFormatList().subscribe(
      (data) => {
        if (data) {
          this.numberFormatList = data;
        }
      },
      (err) => {
        console.log(err);
      }
    );

    this.timeZoneList = ['UTC', 'IST', 'AST'];
    this.timeFormatList = ['12', '24'];
  }

  /**
   * gets current user preference and sets in form fields
   */
  getUserPreference() {
    this.userService.getUserPreferenceDetails().subscribe(
      (data) => {
        if (data) {
          this.currentUserPreferences = data;
          this.languageSettingsForm.patchValue({
            language: data.lang || '',
            timeZone: data.timezone || '',
            dateFormat: data.dFormat || '',
            timeFormat: data.tFormat || '',
            numberFormat: data.nFormat || '',
            decimal: data.decimal || '',
          });
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  /**
   * get selected user's preference
   */
  getSelectedPreferenceUserDetails() {
    this.userService.getSelectedUserPreferenceUserDetails(this.selectedUserFromTeamsUsername).subscribe(
      (data) => {
        if (data) {
          this.currentUserPreferences = data;
          this.languageSettingsForm.patchValue({
            language: data.lang || '',
            timeZone: data.timezone || '',
            dateFormat: data.dFormat || '',
            timeFormat: data.tFormat || '',
            numberFormat: data.nFormat || '',
            decimal: data.decimal || '',
          });
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  /**
   * creates language settings form
   */
  createLanguageSettingsForm() {
    this.languageSettingsForm = new FormGroup({
      language: new FormControl(),
      timeZone: new FormControl(),
      dateFormat: new FormControl(),
      timeFormat: new FormControl(),
      numberFormat: new FormControl(),
      grouping: new FormControl(),
      decimal: new FormControl(),
    });

    this.languageSettingsForm.valueChanges.subscribe((data) => {
      if (data.grouping && data.decimal) {
        if (data.grouping === data.decimal) {
          this.langFormErrMsg = 'The thousand and decimal separators cannot be identical.';
          this.languageSettingsForm.controls.grouping.setErrors({ incorrect: true });
          this.languageSettingsForm.controls.decimal.setErrors({ incorrect: true });
        } else {
          this.langFormErrMsg = '';
          this.languageSettingsForm.controls.grouping.setErrors(null);
          this.languageSettingsForm.controls.decimal.setErrors(null);
        }
      }
    });
    this.getLanguageSettingsList();
    this.getUserPreference();
    this.setupFilteredList();
  }

  /**
   * sets up filter for mat auto complete in all form fields
   */
  setupFilteredList() {
    this.filteredLangList = this.languageSettingsForm.controls.language.valueChanges.pipe(
      debounceTime(100),
      startWith(''),
      map((num: string | null) =>
        num
          ? this.filter(num, this.languagesList)
          : this.languagesList
            ? this.languagesList.slice()
            : this.languagesList
      )
    );

    this.filteredTimeZoneList = this.languageSettingsForm.controls.timeZone.valueChanges.pipe(
      debounceTime(100),
      startWith(''),
      map((num: string | null) =>
        num ? this.filter(num, this.timeZoneList) : this.timeZoneList ? this.timeZoneList.slice() : this.timeZoneList
      )
    );

    this.filteredTimeFormatList = this.languageSettingsForm.controls.timeFormat.valueChanges.pipe(
      debounceTime(100),
      startWith(''),
      map((num: string | null) =>
        num
          ? this.filter(num, this.timeFormatList)
          : this.timeFormatList
            ? this.timeFormatList.slice()
            : this.timeFormatList
      )
    );

    this.filteredNumberFormatList = this.languageSettingsForm.controls.numberFormat.valueChanges.pipe(
      debounceTime(100),
      startWith(''),
      map((num: string | null) =>
        num
          ? this.filter(num, this.numberFormatList)
          : this.numberFormatList
            ? this.numberFormatList.slice()
            : this.numberFormatList
      )
    );
  }

  /**
   * filters data list
   * @param value filter value
   * @param list current list to filter
   */
  filter(value: string, list): string[] {
    const filterValue = value.toLowerCase();
    if (list) {
      return list.filter((num) => num.toLowerCase().indexOf(filterValue) === 0);
    }
  }

  /**
   * fetches user personal details from db
   */
  getUserPersonalDetails() {
    this.showSkeleton = true;
    this.userService
      .getUserPersonalDetails()
      .pipe(take(1))
      .subscribe(
        (data) => {
          if (data) {
            this.showSkeleton = false;
            this.currentUserDetails = data;
            this.setValueForFormControl(data);
          }
        },
        (err) => {
          this.showSkeleton = false;
          console.log(err);
        }
      );
  }

  /**
   * creates form for settings profile
   */
  createForm() {
    this.settingsForm = new FormGroup({
      userName: new FormControl({ value: '', disabled: true }),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      preferredName: new FormControl('', [Validators.required]),
      phone: new FormControl(null, [Validators.required]),
      primaryEmail: new FormControl('', [Validators.email, Validators.required]),
      secondaryEmail: new FormControl('', [Validators.email])
    });
  }

  /**
   * updates user detals in database
   */
  updatePersonalDetails() {
    const personalDetails: UserPersonalDetails = this.currentUserDetails;
    personalDetails.profileKey.userName = this.settingsForm.controls.userName.value;
    personalDetails.fname = this.settingsForm.controls.firstName.value;
    personalDetails.lname = this.settingsForm.controls.lastName.value;
    personalDetails.publicName = this.settingsForm.controls.preferredName.value;
    personalDetails.phone = this.settingsForm.controls.phone.value;
    personalDetails.pemail = this.settingsForm.controls.primaryEmail.value;
    personalDetails.semail = this.settingsForm.controls.secondaryEmail.value;
    if (this.selectedUserFromTeamsUsername === '') {
      this.userService.updateUserPersonalDetails(personalDetails).subscribe((res) => {
        this.formErrMsg = res && res.errorMsg ? res.errorMsg : '';
        this.showToastMessage();
      });
    } else {
      this.userService
        .updateSelectedUserDetails(personalDetails, this.selectedUserFromTeamsUsername)
        .subscribe((res: any) => {
          this.formErrMsg = res && res.errorMsg ? res.errorMsg : '';
          this.showToastMessage();
        });
    }

    return true;
  }

  /**
   * updates current values in profile form
   * @param data existing data for updating in form
   */
  setValueForFormControl(data) {
    if (data.profileKey && data.profileKey.userName) {
      this.settingsForm.controls.userName.setValue(data.profileKey.userName);
    }
    if (data.fname) {
      this.settingsForm.controls.firstName.setValue(data.fname);
    }

    if (data.lname) {
      this.settingsForm.controls.lastName.setValue(data.lname);
    }

    if (data.publicName) {
      this.settingsForm.controls.preferredName.setValue(data.publicName);
    }

    if (data.phone) {
      this.settingsForm.controls.phone.setValue(data.phone);
    }

    if (data.pemail) {
      this.settingsForm.controls.primaryEmail.setValue(data.pemail);
    }

    if (data.semail) {
      this.settingsForm.controls.secondaryEmail.setValue(data.semail);
    }
  }

  /**
   * sets values to the specified field in form
   * @param field form field
   * @param val field value
   */
  setValue(field, val) {
    this.settingsForm.get(field).setValue(val);
  }

  getInitials() {
    const fName = this.settingsForm.controls.firstName.value;
    const lName = this.settingsForm.controls.lastName.value;
    const primaryEmail = this.settingsForm.controls.primaryEmail.value;
    const secondaryEmail = this.settingsForm.controls.secondaryEmail.value;
    if (fName.length >= 1 || lName.length >= 1) {
      return (fName[0] ? fName[0] : '') + (lName[0] ? lName[0] : '');
    } else {
      return primaryEmail[0] ? primaryEmail[0] : secondaryEmail[0] || '?';
    }
  }

  /**
   * checks form for valid form values
   */
  submitForm() {
    if (this.settingsForm.invalid) {
      Object.values(this.settingsForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsTouched();
        }
      });
      return false;
    }
    this.updateForm = true;
    setTimeout(() => {
      if (this.updateForm) {
        this.updatePersonalDetails();
      }
    }, 1000);
  }

  /**
   * opens change password dialog
   */
  openChangePasswordDialog() {
    const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: '500px',
      data: {},
      panelClass: 'change-password-dialog',
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((msg) => {
      if (msg) {
        this.libToast.open(msg, 'Okay', {
          duration: 2000,
        });
      }
    });

    return true;
  }

  /**
   * updates language settings
   * @param field form field name
   */
  updateLanguageSettings(field, event?: any) {
    const val = this.languageSettingsForm.controls[field].value;
    if (field === 'language') {
      this.makeLangSettingsUpdateCall(event.option.value, 'lang', this.languagesList);
      // TOFIX: Temporary until apis are fixed.
      this.navigateToSelectedLanguage(event.option.value);
    } else if (field === 'dateFormat') {
      this.makeLangSettingsUpdateCall(val, 'dFormat', this.dateFormatList);
    } else if (field === 'numberFormat') {
      this.makeLangSettingsUpdateCall(val, 'nFormat', this.numberFormatList);
    } else if (field === 'decimal') {
      this.makeLangSettingsUpdateCall(val, 'decimal', this.numberFormatList);
    } else if (field === 'timeZone') {
      this.makeLangSettingsUpdateCall(val, 'timezone', this.timeZoneList);
    } else if (field === 'timeFormat') {
      this.makeLangSettingsUpdateCall(event, 'tFormat', this.timeFormatList);
    }
  }

  navigateToSelectedLanguage(language: string) {
    let hrefStringSplit = window.location.href.split('/');
    hrefStringSplit[4] = language.toLowerCase();
    window.location.href = hrefStringSplit.join('/');
  }

  /**
   * should make http call to update language settings
   * @param val updated value
   * @param langProperty property name as on http response w.r.t updated field
   * @param list list corresponding to updated field
   */
  makeLangSettingsUpdateCall(val, langProperty, list) {
    if (!this.currentUserPreferences) {
      this.currentUserPreferences = {
        dFormat: '',
        lang: '',
        nFormat: '',
        decimal: '',
        profileKey: {
          tenantId: this.currentUserDetails?.profileKey.tenantId,
          userName: this.currentUserDetails?.profileKey.userName,
        },
        tFormat: '',
        timeZone: '',
        timezone: '',
      };
    }
    if (!this.currentUserPreferences?.profileKey?.tenantId || !this.currentUserPreferences?.profileKey?.userName) { return; } // save only when valid value for tenantId and username
    if (val && this.currentUserPreferences[langProperty] !== val) {
      this.currentUserPreferences[langProperty] = val;
      if (this.selectedUserFromTeamsUsername === '') {
        this.userService.updateUserPreferenceDetails(this.currentUserPreferences).subscribe((res) => {
          this.langFormErrMsg = res && res.errorMsg ? res.errorMsg : '';
          // Only change language if no error and not from a teams selection.
          if (langProperty === 'lang' && this.langFormErrMsg === '') {
            this.navigateToSelectedLanguage(val);
          }
          this.showToastMessage();
        });
      } else {
        this.userService
          .updateSelectedUserPreferenceDetails(this.currentUserPreferences, this.selectedUserFromTeamsUsername)
          .subscribe((res) => {
            this.langFormErrMsg = res && res.errorMsg ? res.errorMsg : '';
            this.showToastMessage();
          });
      }
    }
  }

  /**
   * Opens profile saved toast message
   */
  showToastMessage() {
    this.libToast.open('Profile saved successfully', '', { duration: 3000 });
  }

  /**
   * sets dropdown current state
   * @param el mat auto complete element
   * @returns icon name
   */
  getDropdownPos(el: MatAutocomplete) {
    let pos = 'chevron-down';
    try {
      if (el && el.isOpen) {
        pos = 'chevron-up';
      }
    } catch (e) {
      console.log(e);
    }

    return pos;
  }

  /**
   * opens digital signature side sheet
   */
  openDigitalSignatureSideSheet() {
    if(this.directProfile) {
      this.router.navigate([{ outlets: { sb: `sb/profile`, outer: `outer/settings/digital-signature` } }], {preserveFragment: true});
    } else {
      this.router.navigate([{ outlets: { sb: `sb/settings`, outer: `outer/settings/digital-signature` } }]);
    }
  }

  ChangeAvatar(event: any) {
    this.currentUserDetails.avtarURL = event.base64;
    this.updatePersonalDetails();
  }

  close() {
      this.router.navigate([{ outlets: { sb: null } }]);
  }

  ngOnDestroy(): void {
    if (this.updateForm && this.selectedUserFromTeamsUsername) {
      this.sharedService.isUserDetailsUpdated.next(true);
    }
    if(this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
