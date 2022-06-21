import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { CpiConnection, MDOMappingsResponse } from '@models/connector/connector.model';
import { IntgService } from '@services/intg/intg.service';
import { SapwsService } from '@services/sapws/sapws.service';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ConnectorService } from '../../services/connector.service';

import { CpiLoginComponent } from './cpi-login.component';

describe('CpiLoginComponent', () => {
  let component: CpiLoginComponent;
  let fixture: ComponentFixture<CpiLoginComponent>;
  let sapwsService: SapwsService;
  let connectorService: ConnectorService;
  let intgService: IntgService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CpiLoginComponent ],
      imports: [MdoUiLibraryModule, AppMaterialModuleForSpec, HttpClientTestingModule]
    })
    .compileComponents();
    sapwsService = TestBed.inject(SapwsService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CpiLoginComponent);
    component = fixture.componentInstance;
    connectorService = fixture.debugElement.injector.get(ConnectorService);
    intgService = fixture.debugElement.injector.get(IntgService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('createLoginForm(), should be test with pre required ', async(() => {
    component.createLoginForm();
    component.loginForm.controls.systemName.setValue('New Connection');
    expect(component.loginForm.controls.systemName.valid).toBeTrue();
  }));

  it('next(), should give error if form is invalid', () => {
    component.next();
    expect(component.loginForm.valid).toBeFalsy();
    expect(component.loginFormErrMsg).toEqual('Please fill all fields before submitting the request');
    expect(component.showErrorBanner).toEqual(true);

    component.loginForm = new FormGroup({
      systemName: new FormControl('Name'),
      systemDesc: new FormControl('New'),
      systemUrl: new FormControl('Master'),
      username: new FormControl('ABC'),
      userPassword: new FormControl('Pass'),
    });

    const updateConnection: CpiConnection = {
      connectionName: component.loginForm.value.systemName,
      connectionDescription: component.loginForm.value.systemDesc,
      sapConnection: {
        hostName: component.loginForm.value.systemUrl,
        user: component.loginForm.value.username,
        password: component.loginForm.value.userPassword,
      }
    }
    const response: MDOMappingsResponse = new MDOMappingsResponse();
    spyOn(intgService,'createUpdateConnection').withArgs(updateConnection).and.returnValue(of(response))
    component.next();
    expect(intgService.createUpdateConnection).toHaveBeenCalledWith(updateConnection);
  });
});
