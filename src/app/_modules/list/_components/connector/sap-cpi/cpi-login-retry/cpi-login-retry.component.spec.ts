import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { ConnectionDTO } from '@models/connector/connector.model';
import { SharedModule } from '@modules/shared/shared.module';
import { SapwsService } from '@services/sapws/sapws.service';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ConnectorService } from '../../services/connector.service';

import { CpiLoginRetryComponent } from './cpi-login-retry.component';

describe('CpiLoginRetryComponent', () => {
  let component: CpiLoginRetryComponent;
  let fixture: ComponentFixture<CpiLoginRetryComponent>;
  let sapwsService: SapwsService;
  let connectorService: ConnectorService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CpiLoginRetryComponent ],
      imports: [SharedModule, AppMaterialModuleForSpec, HttpClientTestingModule]
    })
    .compileComponents();
    sapwsService = TestBed.inject(SapwsService);
    connectorService = TestBed.inject(ConnectorService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CpiLoginRetryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('createLoginForm(), should be test with pre required ', async(() => {
    component.createLoginForm();
    component.loginForm.controls.hostnameURL.setValue('New Connection');
    expect(component.loginForm.controls.hostnameURL.valid).toBeTrue();
  }));

  it('next(), should give error if form is invalid', () => {
    component.next();
    expect(component.loginForm.valid).toBeFalsy();
    expect(component.loginFormErrMsg).toEqual('Please fill all fields before submitting the request');
    
    component.loginForm = new FormGroup({
      hostnameURL: new FormControl('Master'),
      username: new FormControl('ABC'),
      userPassword: new FormControl('Pass'),
    });

    const formVal = component.loginForm.value;
    const sapData: ConnectionDTO = {
      systemURL: formVal.hostnameURL,
      password: formVal.userPassword,
      userName: formVal.username,
    }
    spyOn(sapwsService,'testConnection').withArgs(sapData).and.returnValue(of({response: true, acknowledge: true}))
    spyOn(sapwsService,'updateTablemappingData');
    spyOn(connectorService,'getNextComponent');
    component.next();
    expect(component.loginLoader).toEqual(true);
    expect(sapwsService.testConnection).toHaveBeenCalledWith(sapData);
    expect(sapwsService.updateTablemappingData).toHaveBeenCalled();
    expect(connectorService.getNextComponent).toHaveBeenCalled();
  });
});
