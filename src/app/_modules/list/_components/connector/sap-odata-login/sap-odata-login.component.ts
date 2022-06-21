import { ConnectorService } from './../services/connector.service';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'pros-sap-odata-login',
  templateUrl: './sap-odata-login.component.html',
  styleUrls: ['./sap-odata-login.component.scss'],
})
export class SapOdataLoginComponent implements OnInit {
  // form
  sapOdataLoginForm: FormGroup;

  hasError = false;
  errorMessage = '';

  @Output() backClick: EventEmitter<any> = new EventEmitter<any>();

  // output event emitter
  @Output()
  cancelClick: EventEmitter<{ toRefreshApis: boolean; moduleId?: number }> = new EventEmitter<{
    toRefreshApis: boolean;
    moduleId?: number;
  }>();

  constructor(public connectorService: ConnectorService) {}

  ngOnInit(): void {
    this.initForm();
  }

  // Initialize the form
  initForm() {
    this.sapOdataLoginForm = new FormGroup({
      name: new FormControl(''),
      system_description: new FormControl(''),
      system_url: new FormControl(''),
      username: new FormControl(''),
      password: new FormControl(''),
    });
  }
  // show wizard on back click and reset form
  back() {
    this.backClick.emit();
  }

  // output close click event
  onCancelClick() {
    this.cancelClick.emit({ toRefreshApis: false, moduleId: null });
  }

  // on connect request
  onConnectRequest() {
    this.hasError = true;
    this.errorMessage = 'API is not integrated yet!';
    console.log('connect request handler (not yet implemented!)');
  }
}
