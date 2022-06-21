import { MatChipInputEvent } from '@angular/material/chips';
import { ENTER, COMMA, SPACE } from '@angular/cdk/keycodes';
import { TransientService } from 'mdo-ui-library';
import { UserPasswordPolicy, UserPasswordPolicyDto } from './../../../../_models/userdetails';
import { UserPasswordPolicyService } from './../../../../_services/user/user-password-policy.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith, take } from 'rxjs/operators';

@Component({
  templateUrl: './password-policy.component.html',
  styleUrls: ['./password-policy.component.scss']
})
export class PasswordPolicyComponent implements OnInit {

  /* Example for Multiselect with Search */
  /*** number of chips to show as selected*/
  limit = 5;

  /*** Form control for the input*/
  optionCtrl = new FormControl();

  /*** hold the list of filtered options*/
  filteredOptions: Observable<string[]>;

  /*** selected options list*/
  options: string[] = ['Two'];

  /*** Available options list*/
  allOptions: string[] = ['First Name', 'Last name', 'User id'];

  /** user defined values chiplist */
  userDefinedValues: string[] = [];

  readonly separatorKeysCodes = [ENTER, COMMA, SPACE] as const;

  /** FormGroup for password policy fields */
  passwordPolicyFormGroup: FormGroup = null;

  /** FormGroup formcontrols error check object. if error exist the hasError object will have a field of that formcontrol */
  hasError = {};

  /** get existing Password Policy from server if exist */
  userPasswordPolicy: UserPasswordPolicy = null;

  /*** Reference to the input fields for mat-autocomplete */
  @ViewChild('systemDefinedValuesInput') systemDefinedValuesInput: ElementRef<HTMLInputElement>;
  @ViewChild('userDefinedValuesInput') userDefinedValuesInput: ElementRef<HTMLInputElement>;

  /*** reference to auto-complete*/
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  /* Example for Multiselect with Search */

  lib_section_translations = {
    complexity: $localize`:@@complexity:Complexity`,
    restrictions: $localize`:@@restrictions:Restrictions`,
    others: $localize`:@@others:Others`,
  }

  // for check user set password policy first time
  isFirstTime: boolean = true;
  // if first time set password policy then wait for reponse then make another call
  isApiCallPermission: boolean = true;

  constructor(private fb: FormBuilder, private userPasswordPolicyService: UserPasswordPolicyService, private transientService: TransientService) {
    this.filteredOptions = this.optionCtrl.valueChanges.pipe(
      startWith(''),
      map((num: string | null) => num ? this._filter(num) : this.allOptions.slice()));
  }

  ngOnInit(): void {
    this.getPasswordPolicy();
  }

  /** number of userDefinedValues and systemDefinedValues to select */
  hasLimit(): boolean {
    return this.options.length > this.limit;
  }

  // /** if a UserDefinedValue selected then update the formgroups userDefinedValues field with latest value if not already exist */
  // selectedUserDefinedValues(event: MatAutocompleteSelectedEvent): void {
  //   const userDefinedValues: string[] = this.passwordPolicyFormGroup.get('userDefinedValues').value;
  //   const index = userDefinedValues.findIndex(d=> d === event.option.viewValue);
  //   if(index<0) {
  //     userDefinedValues.push(event.option.viewValue);
  //   }
  //   this.passwordPolicyFormGroup.patchValue({
  //     userDefinedValues
  //   });
  //   this.userDefinedValuesInput.nativeElement.value = '';
  //   this.optionCtrl.setValue(null);
  //   this.upsertPasswordPolicy();
  // }

  /** if a systemDefinedValues selected then update the formgroups systemDefinedValues field with latest value if not already exist */
  selectedSystemDefinedValues(event: MatAutocompleteSelectedEvent): void {
    const systemDefinedValues: string[] = this.passwordPolicyFormGroup.get('systemDefinedValues').value;
    const index = systemDefinedValues.findIndex(d=> d === event.option.viewValue);
    if(index<0) {
      systemDefinedValues.push(event.option.viewValue);
    }
    this.passwordPolicyFormGroup.patchValue({
      systemDefinedValues
    });
    this.systemDefinedValuesInput.nativeElement.value = '';
    this.optionCtrl.setValue(null);
    this.upsertPasswordPolicy();
  }

  /** Remove a userDefinedValue if exist */
  removeUserDefinedValues(opt: string) {
    const userDefinedValues: string[] = this.passwordPolicyFormGroup.get('userDefinedValues').value;
    const index = userDefinedValues.findIndex(d=> d === opt);
    if(index >=0) {
      userDefinedValues.splice(index, 1);
    }
    this.passwordPolicyFormGroup.patchValue({
      userDefinedValues
    });
    this.upsertPasswordPolicy();
  }

  /** Remove a systemDefinedValue if exist */
  removeSystemDefinedValues(opt: string) {
    const systemDefinedValues: string[] = this.passwordPolicyFormGroup.get('systemDefinedValues').value;
    const index = systemDefinedValues.findIndex(d=> d === opt);
    if(index >=0) {
      systemDefinedValues.splice(index, 1);
    }
    this.passwordPolicyFormGroup.patchValue({
      systemDefinedValues
    });
    this.upsertPasswordPolicy();
  }

  /**
   * mehtod to filter items based on the searchterm
   * @param value searchTerm
   * @returns string[]
   */
  _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allOptions.filter(num => num.toLowerCase().indexOf(filterValue) === 0);
  }

  /** call api to get existing user Password Policy */
  getPasswordPolicy() {
    this.userPasswordPolicyService.getPasswordPolicy().pipe(take(1)).subscribe((resp) => {
      this.userPasswordPolicy = resp;
      this.createPasswordPolicyFormGroup(this.userPasswordPolicy);
    }, error => {
      console.error(`Error: ${error}`);
      this.createPasswordPolicyFormGroup(this.userPasswordPolicy);
    });
  }

  /** Create the formgroup with or without an existing passwrod policy */
  createPasswordPolicyFormGroup(passwordPolicy?: UserPasswordPolicy) {
    if (passwordPolicy?.uuid ) {
      this.isFirstTime = false;
    } else {
      this.isFirstTime = true;
    }
    this.passwordPolicyFormGroup = this.fb.group({
      uuid: [passwordPolicy && passwordPolicy.uuid? passwordPolicy.uuid : '', []],
      minimumLength: [passwordPolicy && passwordPolicy.minimumLength ? passwordPolicy.minimumLength : 8, [Validators.min(8)]],
      upperCase: [passwordPolicy && passwordPolicy.upperCase ? passwordPolicy.upperCase : false, []],
      lowerCase: [passwordPolicy && passwordPolicy.lowerCase ? passwordPolicy.lowerCase : false, []],
      digit: [passwordPolicy && passwordPolicy.digit ? passwordPolicy.digit : false, []],
      specialCharacterAllowed: [passwordPolicy && passwordPolicy.specialCharacterAllowed ? passwordPolicy.specialCharacterAllowed : false, []],
      initialLoginPaswordReset: [passwordPolicy && passwordPolicy.initialLoginPaswordReset ? passwordPolicy.initialLoginPaswordReset : false, []],
      historyCount: [passwordPolicy && passwordPolicy.historyCount ? passwordPolicy.historyCount : 10, [Validators.min(3), Validators.max(999)]],
      maximumAge: [passwordPolicy && passwordPolicy.maximumAge ? passwordPolicy.maximumAge : 10, [Validators.min(1), Validators.max(999)]],
      maxloginAttempts: [passwordPolicy && passwordPolicy.maxloginAttempts ? passwordPolicy.maxloginAttempts : 10, [Validators.min(3), Validators.max(999)]],
      userDefinedValues: [passwordPolicy && passwordPolicy.userDefinedValues ? passwordPolicy.userDefinedValues : [], []],
      systemDefinedValues: [passwordPolicy && passwordPolicy.systemDefinedValues ? passwordPolicy.systemDefinedValues : [], []],
    });
  }

  /**
   * gets hint for errors in form fields
   * @param field form field name
   */
   getHint(field) {
    let msg;

    if (this.passwordPolicyFormGroup.controls[field].errors && this.passwordPolicyFormGroup.controls[field].errors.min) {
      msg = $localize`:@@min_error:Minimum value is ${this.passwordPolicyFormGroup.controls[field].errors.min.min}:min_value:`;
    } else if(this.passwordPolicyFormGroup.controls[field].errors && this.passwordPolicyFormGroup.controls[field].errors.max) {
      msg = $localize`:@@max_error:Maximum value is ${this.passwordPolicyFormGroup.controls[field].errors.max.max}:max_value:`;
    }

    if (msg) {
      this.hasError[field] = true;
      return msg;
    }

    this.hasError[field] = false;
    return '';
  }

  /** when a lib-slider-toggle changed fire the upsertPasswordPolicy */
  toggleChange(event: boolean) {
    setTimeout(() => {
      this.upsertPasswordPolicy();
    }, 10);
  }

  /** when a lib-input changed fire the upsertPasswordPolicy */
  onInputBlur() {
    this.upsertPasswordPolicy();
  }

  /** upsertPasswordPolicy, call the api endpoint */
  upsertPasswordPolicy() {
    if(this.isApiCallPermission){
    if(!this.passwordPolicyFormGroup.valid) {
      this.userPasswordPolicyService.validateAllFormFields(this.passwordPolicyFormGroup);
      this.transientService.open($localize`:@@invalid_fields:All fields are not valid. Please check`, 'ok', {
        duration: 2000
      });
    } else {
      if(this.isFirstTime) {
        this.isApiCallPermission = false;
      } else  {
        this.isApiCallPermission = true;
      }
      const model: UserPasswordPolicyDto = this.passwordPolicyFormGroup.value;
      this.userPasswordPolicyService.policyAdd(model).pipe(take(1)).subscribe(resp => {
        if(resp.message === 'Success') {
          if(this.isFirstTime){
            this.passwordPolicyFormGroup.patchValue({
              uuid: resp?.id?.toString()
            })
            this.isApiCallPermission = true;
          }
          // this.getPasswordPolicy();
        } else {
          this.transientService.open($localize`:@@update_failed:Update Failed`, 'ok', {
            duration: 2000
          });
        }
      }, error => {
        console.error(`Error: ${error}`);
        this.transientService.open($localize`:@@update_failed:Update Failed`, 'ok', {
          duration: 2000
        });
      });
    }

  }
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = (event.value || '').trim().toLowerCase();
    this.userDefinedValues = this.passwordPolicyFormGroup.get('userDefinedValues').value;
    const index = this.userDefinedValues.indexOf(value);

    // Add our fruit
    if (value && index < 0) {
      this.userDefinedValues.push(value);
      this.passwordPolicyFormGroup.patchValue({userDefinedValues: this.userDefinedValues});
      this.upsertPasswordPolicy();
    }

    // Clear the input value
    if (input) {
      input.value = '';
    }

  }

  remove(userVal: string): void {
    const index = this.userDefinedValues.indexOf(userVal);

    if (index >= 0) {
      this.userDefinedValues.splice(index, 1);
    }
  }
}
