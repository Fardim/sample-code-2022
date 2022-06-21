import { ConnectorService } from '@modules/list/_components/connector/services/connector.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SapwsService, TableMappingData } from '@services/sapws/sapws.service';
import { ConnectionDTO } from '@models/connector/connector.model';

@Component({
  selector: 'pros-cpi-login-retry',
  templateUrl: './cpi-login-retry.component.html',
  styleUrls: ['./cpi-login-retry.component.scss']
})
export class CpiLoginRetryComponent implements OnInit {

  // form
  loginForm: FormGroup;
  // for error banner
  loginFormErrMsg = '';
  loginLoader = false;
  constructor(private connectorService: ConnectorService,
              private sapwsService: SapwsService) { }

  ngOnInit(): void {
    this.createLoginForm();
  }

  next() {
    if(!this.loginForm.valid) {
      Object.values(this.loginForm.controls).forEach((control) => {
        control.markAsTouched();
     });
      this.loginFormErrMsg = 'Please fill all fields before submitting the request';
    } else {
      this.loginForm.disable();
      this.loginLoader = true;
      this.loginFormErrMsg = '';
      const sapData: ConnectionDTO = {
        systemURL: this.loginForm.controls.hostnameURL.value,
        password: this.loginForm.controls.userPassword.value,
        userName: this.loginForm.controls.username.value,
      }
      this.sapwsService.testConnection(sapData).subscribe((res) => {
        if(res?.response === true && res?.acknowledge === true) {
          this.sapwsService.updateTablemappingData({
            password: sapData.password,
            url: sapData.systemURL,
            username: sapData.userName
          } as TableMappingData);
          this.connectorService.getNextComponent('sap cpi package selection');
        } else {
          this.raiseError();
        }
      }, (error) =>{
        console.error(error);
        this.raiseError();
      });
    }
  }

  raiseError(errMsg?: string) {
    this.loginLoader = false;
    this.loginForm.enable();
    this.loginFormErrMsg = errMsg || 'Something went wrong. Please check the SAP Cloud Connector configutrations and retry.';
  }

  back() {
    this.connectorService.backClicked.next(true);
  }

  onCancelClick() {
    this.connectorService.onCancelClick({ toRefreshApis: false, moduleId: null })
  }

  /**
   * method to create formControl
   */
   createLoginForm() {
    // this.loginForm = new FormGroup({
    //   hostnameURL: new FormControl('https://cpi-non-production-bwvnkkkk.it-cpi002-rt.cfapps.ap10.hana.ondemand.com', [Validators.required]),
    //   username: new FormControl('sb-51b0f500-d936-4c09-9c20-6844effc3698!b2260|it-rt-cpi-non-production-bwvnkkkk!b80', [Validators.required]),
    //   userPassword: new FormControl('a41e0637-d4a7-4aaa-ad4e-c8f5fc4928d2$jFyUTnpAvkXgXz7y1_yPpF6UuPIWYMLxC6c5S0W8Y4o=', [Validators.required]),
    // });
    this.loginForm = new FormGroup({
      hostnameURL: new FormControl('', [Validators.required]),
      username: new FormControl('', [Validators.required]),
      userPassword: new FormControl('', [Validators.required]),
    });

    this.loginForm.valueChanges.subscribe((data) => {
      if(data) { this.loginFormErrMsg = ''; }
     })
  }
}
