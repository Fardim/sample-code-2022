import { ConnectorService } from '@modules/list/_components/connector/services/connector.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CpiConnection } from '@models/connector/connector.model';
import { IntgService } from '@services/intg/intg.service';
import { validationRegex } from '@constants/globals';

@Component({
  selector: 'pros-cpi-login',
  templateUrl: './cpi-login.component.html',
  styleUrls: ['./cpi-login.component.scss']
})
export class CpiLoginComponent implements OnInit {

  // form
  loginForm: FormGroup;
  // for error banner
  loginFormErrMsg = '';
  showErrorBanner = false;
  constructor(private connectorService: ConnectorService,
              private intgService: IntgService) { }

  ngOnInit(): void {
    this.createLoginForm();
  }

  next() {
    if(!this.loginForm.valid) {
      Object.values(this.loginForm.controls).forEach((control) => {
        control.markAsTouched();
     });
      this.loginFormErrMsg = 'Please fill all fields before submitting the request';
      this.showErrorBanner = true;
    } else {
      const updateConnection: CpiConnection = {
        connectionName: this.loginForm.controls.systemName.value,
        connectionDescription: this.loginForm.controls.systemDesc.value,
        sapConnection: {
          hostName: this.loginForm.controls.systemUrl.value,
          user:this.loginForm.controls.username.value,
          password:this.loginForm.controls.userPassword.value
        }
      }
      this.intgService.createUpdateConnection(updateConnection).subscribe((res) => {
        console.log('updateConnectionById',res);
      }, error =>{
        console.log('Error');
        this.loginFormErrMsg = error.errorMsg || 'Something went wrong, Please try again later';
        this.showErrorBanner = true;
      });
      this.connectorService.getNextComponent('interim customer activities');
    }
  }

  back() {
    this.connectorService.backClicked.next(true);
  }

  /**
   * method to create formControl
   */
  createLoginForm() {
    this.loginForm = new FormGroup({
      systemName: new FormControl('', [Validators.required]),
      systemDesc: new FormControl('', [Validators.required]),
      systemUrl: new FormControl('', [Validators.required, Validators.pattern(validationRegex.url),]),
      username: new FormControl('', [Validators.required]),
      userPassword: new FormControl('', [Validators.required]),
    });
  }
  onCancelClick() {
    this.connectorService.onCancelClick({ toRefreshApis: false, moduleId: null })
  }
}
