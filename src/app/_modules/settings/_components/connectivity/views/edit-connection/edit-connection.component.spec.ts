import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { EditConnectionComponent } from './edit-connection.component';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { ActivatedRoute, Router } from '@angular/router';
import { ConnectionService } from '@services/connection/connection.service';
import { of } from 'rxjs';

describe('EditConnectionComponent', () => {
  let component: EditConnectionComponent;
  let fixture: ComponentFixture<EditConnectionComponent>;
  let connectionService: ConnectionService;
  let router: Router;

  const connectionDetails = {
    connectionDescription: 'new-connection-11-desc1234',
    connectionId: '9e91750d-59d7-4dac-9172-6625e822e7b0',
    connectionName: 'new-connection-11',
    sapConnection: {
      hostName: 'test.com',
      password: '*****',
      user: 'nansri@gmail.com'
    }
  }

  const connDetails = {
    connDesc: 'new-connection-11-desc1234',
    connId: '9e91750d-59d7-4dac-9172-6625e822e7b0',
    connName: 'new-connection-11'
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditConnectionComponent],
      imports: [SharedModule, RouterTestingModule, AppMaterialModuleForSpec, MdoUiLibraryModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ connectionId: '9e91750d-59d7-4dac-9172-6625e822e7b0' }),
          },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditConnectionComponent);
    component = fixture.componentInstance;
    connectionService = fixture.debugElement.injector.get(ConnectionService);
    router = fixture.debugElement.injector.get(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(), should init component', () => {
    spyOn(component,'getConnectionDetails');
    spyOn(component,'createEditConnectionFrom');
    component.ngOnInit();
    expect(component.getConnectionDetails).toHaveBeenCalled();
    expect(component.createEditConnectionFrom).toHaveBeenCalled();
  })

  it('getConnectionDetails, should get connection details', () => {
    const connDetailsRes = {
      acknowledge: true,
      errorMsg: null,
      message: 'string',
      response: {
        connectionId: '9e91750d-59d7-4dac-9172-6625e822e7b0',
        fromOnBoarding: true,
        hostName: 'test.com',
        noOfInterface: 5,
        password: '*****',
        status: 'COMPLETED',
        user: 'nansri@gmail.com',
      },
    };

    component.connectionId = '9e91750d-59d7-4dac-9172-6625e822e7b0';
    spyOn(component,'patchConnectionValue');
    spyOn(connectionService, 'getConnectionDetails')
      .withArgs(component.connectionId)
      .and.returnValues(
        of(connDetailsRes)
      );
      connectionService.connectionDetail$ = of(connDetails)

      component.getConnectionDetails();
      expect(component.patchConnectionValue).toHaveBeenCalled();
      expect(component.showTestConnectionMsg).toBeFalsy();
      expect(component.connectionDetails).toEqual(connectionDetails);
  });

  it('createEditConnectionFrom, should defined edit form', () => {
    component.createEditConnectionFrom();
    expect(component.editConnectionForm).toBeDefined() ;
  })

  it('saveConnection, should edit connection', async(() => {
    component.connectionDetails.connectionId = '9e91750d-59d7-4dac-9172-6625e822e7b0';
    component.editConnectionForm.setValue({
      connectionName: connectionDetails.connectionName,
      connectionDescription: connectionDetails.connectionDescription,
      hostName: connectionDetails.sapConnection.hostName,
      user: connectionDetails.sapConnection.user,
      password: connectionDetails.sapConnection.password
    });
    spyOn(connectionService,'updateConnectionDetails').withArgs(connectionDetails).and.returnValue(of([]));
    spyOn(connectionService,'nextUpdateConnectionDetailsSubject');
    spyOn(component,'close');
    component.saveConnection();
    expect(connectionService.updateConnectionDetails).toHaveBeenCalledWith(connectionDetails);
    expect(connectionService.nextUpdateConnectionDetailsSubject).toHaveBeenCalledWith([]);
    expect(component.close).toHaveBeenCalled();
  }))

  it('close, should close edit connection sidesheet', () => {
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { outer: null } }], { queryParamsHandling: 'preserve' })
  })
});
