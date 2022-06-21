import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { SapwsService } from '@services/sapws/sapws.service';
import { TransientService } from 'mdo-ui-library';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { ConnectionDescriptionComponent } from './connection-description.component';

describe('ConnectionDescriptionComponent', () => {
  let component: ConnectionDescriptionComponent;
  let fixture: ComponentFixture<ConnectionDescriptionComponent>;
  let sapwsService: SapwsService;
  let transientService: TransientService;

  const connectionDetails = {
    description: 'SAP description',
    height: 45,
    i18n_subtitle: '@@sap_odata_subtitle',
    i18n_title: '@@sap_odata',
    iconTitle: 'SAP',
    id: 'sap_cpi',
    isSelectedCard: false,
    selectLink: '#',
    subtitle: 'About this adapter',
    title: 'SAP CPI',
    viewPort: '0 0 90 45',
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConnectionDescriptionComponent],
      imports: [SharedModule, RouterTestingModule, AppMaterialModuleForSpec],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectionDescriptionComponent);
    component = fixture.componentInstance;
    sapwsService = fixture.debugElement.injector.get(SapwsService);
    transientService = fixture.debugElement.injector.get(TransientService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit', () => {
    spyOn(component, 'initializeForm');
    component.ngOnInit();
    expect(component.initializeForm).toHaveBeenCalled();
  });

  it('initializeForm, should initialize form', () => {
    component.initializeForm();
    expect(component.createConnectionForm).toBeDefined();
  });

  it('close', () => {
    spyOn(component.afterClose, 'emit');
    component.close(null);
    expect(component.afterClose.emit).toHaveBeenCalledWith(null);
  });

  it('createConnection, should create new connection', () => {
    component.connectionDetails = connectionDetails;
    const body = {
      connectionDescription: 'desc',
      connectionName: 'test_connection1',
      sapConnection: {
        hostName: 'test.com',
        password: '************',
        user: 'nansri@gmail.com',
      },
    };
    component.createConnectionForm.patchValue({
      systemName: 'test_connection1',
      systemDesc: 'desc',
      systemUrl: 'test.com',
      username: 'nansri@gmail.com',
      userPassword: '************',
    });
    const data = {
        connectionDescription: 'desc',
        connectionId: '5d4dfbf5-2150-443e-97d4-d74d10b7ef36',
        connectionName: 'test_connection1',
        systemType: 'CPI',
        tenantId: '0',
    };
    spyOn(sapwsService, 'createOrUpdateCpiConnection')
      .withArgs(body)
      .and.returnValue(
        of(data)
      );
    spyOn(transientService, 'open');
    spyOn(component, 'close');
    component.createConnection();
    expect(component.saveLoader).toBeFalsy();
    expect(sapwsService.createOrUpdateCpiConnection).toHaveBeenCalledWith(body);
    expect(transientService.open).toHaveBeenCalledWith('Connection Successfully Created', 'Dismiss');
    expect(component.close).toHaveBeenCalledWith(data);
  });

  it('createConnection, should show banner if connection not successfully created', () => {
    component.connectionDetails = connectionDetails;
    const body = {
      connectionDescription: 'desc',
      connectionName: 'test_connection1',
      sapConnection: {
        hostName: 'test.com',
        password: '************',
        user: '********',
      },
    };
    component.createConnectionForm.patchValue({
      systemName: 'test_connection1',
      systemDesc: 'desc',
      systemUrl: 'test.com',
      username: '********',
      userPassword: '************',
    });
    spyOn(sapwsService, 'createOrUpdateCpiConnection')
      .withArgs(body)
      .and.returnValue(
        of({})
      );
    component.createConnection();
    expect(component.saveLoader).toBeFalsy();
    expect(component.bannerText).toEqual('Error while creating connection');
  });

  it('goBack', () => {
    spyOn(component.navigate, 'emit');
    component.goBack();
    expect(component.navigate.emit).toHaveBeenCalledWith('connection-description');
  });
});
