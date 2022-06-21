import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserPasswordDetails } from '@models/userdetails';
import { UserService } from '@services/user/userservice.service';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'pros-change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.scss']
})
export class ChangePasswordDialogComponent implements OnInit {

  // form group for change password fields
  changeForm: FormGroup;

  // validation pattern for new password
  patterns = {
    pwdPattern: '^(?=.*\\d.*\\d)(?=.*[a-zA-Z])(?!.*\\s).{8,}$',
    noSpace: '^(?!.*\\s).{8,}$',
    minTwoNumbers: '^(?=.*\\d.*\\d).{8,}$',
    minOneLetter: '^(?=.*[a-zA-Z]).{8,}$'
  };

  // error message to be displayed in banner
  bannerMessage;

  // handles show/hide of error message for password fields
  hasError = {
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false
  };

  passwordHandling = {
    currentPassword: {
      eyeType: "eye-slash",
      displayType: "password"
    },
    newPassword:{
      eyeType: "eye-slash",
      displayType: "password"
    },
    verifyPassword: {
      eyeType: "eye-slash",
      displayType: "password"
    }
  }

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.createForm();
  }

  /**
   * creates new form for password fields
   */
  createForm() {
    this.changeForm = this.fb.group({
      currentPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [Validators.required, Validators.minLength(8), Validators.pattern(this.patterns.pwdPattern)]),
      confirmNewPassword: new FormControl('', [Validators.required, Validators.minLength(8), Validators.pattern(this.patterns.pwdPattern)])
    }, {
      validator: this.MustMatch('newPassword', 'confirmNewPassword')
    });

    return true;;
  }

  /**
   * closes dialog with a optional response message
   * @param res response message
   */
  closeDialog(res?) {
    this.dialogRef.close(res);
  }

  /**
   * checks password validation and updates password
   */
  changePassword() {
    this.bannerMessage = '';

    if (this.changeForm.invalid) {
      (Object).values(this.changeForm.controls).forEach(control => {
        if(control.invalid) {
          control.markAsTouched();
        }
      });
      return false;
    }

    if (this.changeForm.controls.newPassword.value !== this.changeForm.controls.confirmNewPassword.value) {
      this.bannerMessage = 'Password and confirm password did not match';
    } else if (this.changeForm.controls.currentPassword.value === this.changeForm.controls.newPassword.value) {
      this.bannerMessage = 'Cannot set current password as new password';
    }

    if (this.bannerMessage) {
      return false;
    }

    const data: UserPasswordDetails = {
      confirmPassword: this.changeForm.controls.confirmNewPassword.value,
      newPassword: this.changeForm.controls.newPassword.value,
      oldPassword: this.changeForm.controls.currentPassword.value
    }
    this.userService.getUserDetails().pipe(distinctUntilChanged()).subscribe(user=>{
      this.userService.updatePassword(data, user.orgId).subscribe((res) => {
        if (res && res.errorMsg) {
          this.bannerMessage = res.errorMsg;
        } else {
          this.closeDialog('Password changed successfully');
        }
      }, (err) => {
        if (err && err.error) {
          this.bannerMessage = err.error.errorMsg || '';
        }
        console.log(err);
      });
    });
  }

  MustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        const matchingControl = formGroup.controls[matchingControlName];

        // set error on matchingControl if validation fails
        if (control.value !== matchingControl.value) {
            matchingControl.setErrors({ mustMatch: true });
        } else {
            matchingControl.setErrors(null);
        }
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

  /**
   * Check the new password Validators , depend on basic logic
   * Please enter password 8 characters, no space , 2 numbers , 1 latter
   */
  get passwordHints(): string {
    if(this.changeForm.controls.newPassword.errors?.required) {
      return `Please enter password`;
    }
    let text = `Password should contains minimum of `;
    if(this.changeForm.controls.newPassword.errors?.minlength) {
      text += `8 characters, `;
    }

    if(this.changeForm.controls.newPassword.errors?.pattern) {
      if(this.changeForm.controls.newPassword.value.match(this.patterns.noSpace) === null) {
        text += `no space, `;
      }

      if(this.changeForm.controls.newPassword.value.match(this.patterns.minTwoNumbers) === null) {
        text += `2 numbers, `;
      }

      if(this.changeForm.controls.newPassword.value.match(this.patterns.minOneLetter) === null) {
        text += `1 letter, `;
      }

    }
    return text.substring(0,text.lastIndexOf(','));
  }

  /**
   * Validator for match the new password with confirm password
   */
  get cofirmPasswordHint(): string {
    if((this.changeForm.controls.confirmNewPassword.touched || this.changeForm.controls.confirmNewPassword.dirty) && this.changeForm.controls.confirmNewPassword.errors?.mustMatch) {
      return `Confirm password doesn't match with password`;
    }
    return ``;
  }
}
