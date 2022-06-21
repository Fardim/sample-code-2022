import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MsteamsConfigService } from '@modules/msteams/_service/msteams-config.service';
import { TeamService } from '@services/user/team.service';
import { UserProfileService } from '@services/user/user-profile.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'pros-invite-user-login',
  templateUrl: './invite-user-login.component.html',
  styleUrls: ['./invite-user-login.component.scss'],
})
export class InviteUserLoginComponent implements OnInit, OnDestroy {
  inviteUserForm: FormGroup;
  subscription: Subscription = new Subscription();
  showErrorBanner = false;
  bannerErrorMsg = '';
  // handles show/hide of error message for password fields
  hasError = {
    password: false,
    verifyPassword: false,
  };
  verifyToken = '';
  userEmail = '';
  passwordHandling = {
    password : {
      eyeType : "eye-slash",
      displayType : "password"
    },
    verifyPassword : {
      eyeType : "eye-slash",
      displayType : "password"
    }
  }

  // for show process button
  ishowLoader: boolean = false;

  constructor(
    private msteamServices: MsteamsConfigService,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private profileServce: UserProfileService
  ) {}

  ngOnInit(): void {
    this.inviteUserForm = this.formBuilder.group(
      {
        email: new FormControl({ value: '', disabled: true }),
        password: new FormControl('', [Validators.required]),
        verifyPassword: new FormControl('', [Validators.required]),
      },
      {
        validator: this.mustMatch('password', 'verifyPassword'),
      }
    );

    this.activatedRoute.queryParams.subscribe((res) => {
      this.verifyToken = encodeURIComponent(res.s);
      // call validate URL method to validate URL from backend
      this.validateURL();
    });
  }

  // to match password and verify its password
  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (matchingControl.errors && !matchingControl.errors.mustMatch) {
        // return if another validator has already found an error on the matchingControl
        return;
      }

      // set error on matchingControl if validation fails
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  /**
   * gets hint for errors in form fields
   * @param field form field name
   */
  getHint(field) {
    let msg;
    if (
      this.inviteUserForm.controls[field].touched &&
      this.inviteUserForm.controls[field].errors &&
      this.inviteUserForm.controls[field].errors.required
    ) {
      msg = 'This is a required field';
    } else if (
      this.inviteUserForm.controls[field].touched &&
      this.inviteUserForm.controls[field].errors &&
      this.inviteUserForm.controls[field].errors.mustMatch
    ) {
      msg = `Passwords must match`;
    }

    if (msg) {
      this.hasError[field] = true;
      return msg;
    }

    this.hasError[field] = false;
    return '';
  }

  // will be called on load to check if set verify and password login URL is valid or not
  validateURL() {
    this.subscription.add(
      this.msteamServices.validateURL(this.verifyToken).subscribe(
        (res) => {
          if (res) {
            this.inviteUserForm.controls.email.setValue(res.response);
            this.userEmail = res.response;
          }
        },
        (err) => {
          if(err?.error === 'Conflict') {
            this.bannerErrorMsg = 'User already exist!';
            return;
          }
          this.bannerErrorMsg = err?.error?.errorMsg || 'Something went wrong!';
          this.showErrorBanner = true;
        }
      )
    );
  }

  submitPassword() {
    if (!this.inviteUserForm.valid) {
      Object.values(this.inviteUserForm.controls).forEach((control) => {
        control.markAsTouched();
      });
    } else {
      this.ishowLoader = true;
      const payload = {
        email: this.userEmail,
        password: this.inviteUserForm.controls.password.value,
        key : this.verifyToken
      };
      this.msteamServices
        .inviteUserUpdatePassword(payload)
        .subscribe(
          (response) => {
            if (response.acknowledge) {
              this.signInUser();
              this.ishowLoader = false;
            }
          },
          (error) => {
            this.ishowLoader = false;
            this.showErrorMessage(error);
          }
        );
    }
  }

  updateUserStatus() {
    this.profileServce
        .updateStatusMembersUrl([this.userEmail], false, 'ACTIVE', '')
        .pipe(take(1))
        .subscribe((result) => {
          if(result.acknowledge) {
            this.router.navigate(['/home']);
          }
        },error => {
          this.showErrorMessage(error);
        });
  }

  signInUser() {
    this.msteamServices.signIn(this.userEmail, this.inviteUserForm.controls.password.value).subscribe((signInResponse) => {
      localStorage.setItem('JWT-TOKEN', signInResponse['JWT-TOKEN'] ? signInResponse['JWT-TOKEN'] : '');
      localStorage.setItem('JWT-REFRESH-TOKEN', signInResponse['JWT-REFRESH-TOKEN'] ? signInResponse['JWT-REFRESH-TOKEN'] : '');
      localStorage.setItem('DMS-TOKEN', signInResponse['DMS-TOKEN'] ? signInResponse['DMS-TOKEN'] : '');
      this.updateUserStatus();
    },
    (error) => {
      this.showErrorMessage(error);
    })
  }

  showErrorMessage(error) {
    console.log('Error:',error);
    this.showErrorBanner = true;
    this.bannerErrorMsg = error.errorMsg || 'Something went wrong!';
    if(error?.error?.error === 'Conflict') {
      this.bannerErrorMsg = 'User already exist!';
      return;
    }
    this.bannerErrorMsg = error?.error?.errorMsg || 'Something went wrong!';
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onSuffixBtnClickForPassWord(fieldName: string){
    if(this.passwordHandling[fieldName].eyeType === "eye-slash") {
      this.passwordHandling[fieldName].eyeType = "eye";
      this.passwordHandling[fieldName].displayType = "text";
    } else {
      this.passwordHandling[fieldName].eyeType = "eye-slash";
      this.passwordHandling[fieldName].displayType = "password";
    }
  }
}
