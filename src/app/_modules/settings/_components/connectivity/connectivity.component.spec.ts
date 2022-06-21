import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { ConnectionService } from '@services/connection/connection.service';
import { CoreService } from '@services/core/core.service';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ConnectivityComponent, ELEMENT_DATA } from './connectivity.component';

describe('ConnectivityComponent', () => {
  let component: ConnectivityComponent;
  let fixture: ComponentFixture<ConnectivityComponent>;
  let coreService: CoreService;
  let connectionService: ConnectionService;
  let router: Router;

  const dummyConnection = [
    {
      connectionDescription: 'new-connection-11-desc1234',
      connectionId: '9e91750d-59d7-4dac-9172-6625e822e7b0',
      connectionName: 'new-connection-11',
      systemType: 'CPI',
      tenantId: '0',
    },
    {
      connectionDescription: 'ghj',
      connectionId: 'e67d3de2-19d7-4cb6-a92a-e3d23d6992fb',
      connectionName: 'ghj',
      systemType: 'CPI',
      tenantId: '0',
    },
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConnectivityComponent],
      imports: [SharedModule, RouterTestingModule, AppMaterialModuleForSpec, MdoUiLibraryModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectivityComponent);
    component = fixture.componentInstance;
    coreService = fixture.debugElement.injector.get(CoreService);
    connectionService = fixture.debugElement.injector.get(ConnectionService);
    router = fixture.debugElement.injector.get(Router);

    component.selectedConnectionDetail = {
      connDesc: dummyConnection[0].connectionDescription,
      connId: dummyConnection[0].connectionId,
      connName: dummyConnection[0].connectionName
    };
    component.connections = dummyConnection;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(), should init component ', async(() => {
    spyOn(component, 'getCPIConnections');
    spyOn(component, 'getDatasetModules');
    spyOn(component, 'checkForInterfaceValueChange');
    spyOn(component, 'checkForDatasetSearchOption');
    spyOn(component, 'checkForConnectionUpdateChanges');
    spyOn(component, 'checkForInterfaceSearchChanges');
    spyOn(component, 'checkForSystemSearchChanges');
    component.ngOnInit();

    expect(component.getCPIConnections).toHaveBeenCalled();
    expect(component.getDatasetModules).toHaveBeenCalled();
    expect(component.checkForInterfaceValueChange).toHaveBeenCalled();
    expect(component.checkForDatasetSearchOption).toHaveBeenCalled();
    expect(component.checkForConnectionUpdateChanges).toHaveBeenCalled();
    expect(component.checkForInterfaceSearchChanges).toHaveBeenCalled();
    expect(component.checkForSystemSearchChanges).toHaveBeenCalled();
  }));

  it('checkForSystemSearchChanges ', fakeAsync(() => {
    spyOn(component, 'setInitialConnection');
    spyOn(component, '_filter');
    component.checkForSystemSearchChanges();

    component.searchConnectionSub.next('new');
    tick(1000);
    expect(component._filter).toHaveBeenCalledWith('new');
    expect(component.setInitialConnection).toHaveBeenCalled();
  }));

  // it('checkForSystemSearchChanges ', fakeAsync(() => {
  //   component.defaultConnection = dummyConnection;
  //   spyOn(component, 'setInitialConnection');
  //   component.checkForSystemSearchChanges();

  //   component.searchConnectionSub.next('');
  //   tick(1000);
  //   expect(component.connections).toEqual(dummyConnection);
  //   expect(component.setInitialConnection).toHaveBeenCalled();
  // }));

  it('checkForInterfaceSearchChanges ', fakeAsync(() => {
    spyOn(component, 'getInterfaceDetails');
    component.checkForInterfaceSearchChanges();

    component.searchInterfaceSub.next('in');
    tick(1000);
    expect(component.connections).toEqual(dummyConnection);
    expect(component.getInterfaceDetails).toHaveBeenCalledWith('9e91750d-59d7-4dac-9172-6625e822e7b0', '&fieldName=in');
  }));

  it('checkForConnectionUpdateChanges', () => {
    connectionService.updateConnectionDetail$ = of(dummyConnection[0]);
    component.checkForConnectionUpdateChanges();
    expect(ELEMENT_DATA[1].cell).toEqual('new-connection-11-desc1234');
  });

  it('updateAllOptions', () => {
    const module = { moduleId: '328', moduleDesc: 'A12123' };
    component.allDatasetOptions = [{ moduleId: '327', moduleName: 'A12123' }];
    component.updateAllOptions(module);
    expect(component.allDatasetOptions).toEqual([
      { moduleId: '327', moduleName: 'A12123' },
      { moduleId: '328', moduleName: 'A12123' },
    ]);
  });

  it('getCPIConnections', () => {
    spyOn(component, 'setInitialConnection');
    spyOn(connectionService, 'getCPIConnections').and.returnValue(of(dummyConnection));
    component.getCPIConnections();
    expect(component.isLoading).toBeFalse();
    expect(component.connections).toEqual(dummyConnection);
    // expect(component.defaultConnection).toEqual(dummyConnection);
    expect(component.setInitialConnection).toHaveBeenCalled();
  });

  it('_filter, should filter connection list', () => {
    component.connections = dummyConnection; // emit
    const availableOption = component._filter('gh');
    expect(availableOption).toEqual([dummyConnection[1]]);
  });

  it('modifybyScrollEnd(), should get dataset on scroll down', async(() => {
    component.datasetByPageIndex = 1;
    component.modifybyInfinteScrollLoading = false;
    spyOn(component, 'getDatasetModules');
    component.modifybyScrollEnd();
    expect(component.datasetByPageIndex).toEqual(2);
    expect(component.modifybyInfinteScrollLoading).toBeTruthy();
    expect(component.getDatasetModules).toHaveBeenCalled();
  }));

  it('modifybyScrollEnd(), should get dataset if result is null on scroll down', async(() => {
    const result = component.modifybyScrollEnd();
    expect(result).toBeNull();
  }));

  it('checkForDatasetSearchOption, should get dataset search list ', fakeAsync(() => {
    spyOn(component, 'searchDatasetModules');
    component.checkForDatasetSearchOption();

    component.searchModifyBySub.next('A12123');
    tick(1000);
    expect(component.datasetByPageIndex).toEqual(1);
    expect(component.searchDatasetModules).toHaveBeenCalledWith('A12123');
    // expect(component.filteredOptions).toEqual([{ moduleId: '327', moduleName: 'A12123' }]);
  }));

  it('setInitialConnection, should set initial connection value', () => {
    spyOn(component,'getConnectionDetails');
    component.setInitialConnection();
    expect(component.selectedConnectionDetail.connName).toEqual(dummyConnection[0].connectionName);
    expect(component.selectedConnectionDetail.connId).toEqual(dummyConnection[0].connectionId);
    expect(component.getConnectionDetails).toHaveBeenCalledWith(dummyConnection[0]);
  })

  it('getConnectionDetails, should set inital connection description in view', () => {
    spyOn(component,'getInterfaceDetails');
    component.getConnectionDetails(dummyConnection[0]);
    expect(ELEMENT_DATA[0].cell).toEqual(dummyConnection[0].connectionName);
    expect(ELEMENT_DATA[1].cell).toEqual(dummyConnection[0].connectionDescription);
    expect(ELEMENT_DATA[2].cell).toEqual(dummyConnection[0].systemType);
    expect(ELEMENT_DATA[3].cell).toEqual('NOT CONFIGURED');
    expect(ELEMENT_DATA[4].cell).toEqual('');
    expect(component.INTERFACES_DATA).toEqual([]);
    expect(component.DEFAULT_INTERFACE_DATA).toEqual([]);
    expect(component.selectedConnectionDetail.connDesc).toEqual(dummyConnection[0].connectionDescription);
    expect(component.getInterfaceDetails).toHaveBeenCalledWith(component.selectedConnectionDetail.connId,'');
  })

  it('checkForInterfaceValueChange, update interface details on edit interface close', () => {
    spyOn(component,'getInterfaceDetails');
    connectionService.updateInterfaceList$ = of('9e91750d-59d7-4dac-9172-6625e822e7b0');
    component.checkForInterfaceValueChange();
    expect(component.getInterfaceDetails).toHaveBeenCalledWith('9e91750d-59d7-4dac-9172-6625e822e7b0','');
  })

  it('getDatasetModules, should get dataset list ', () => {
    const returnData = [
      {
        objectid: 497,
        objectdesc: '1100Dataset',
        moduleId: 497,
        moduleDescriptionRequestDTO: {
          description: '1100Dataset',
        },
      },
    ];
    const allOptions = [
      {
        moduleId: 497,
        moduleName: '1100Dataset',
      },
    ];
    spyOn(coreService, 'getAllObjectType').and.returnValue(of(returnData));
    component.getDatasetModules();

    expect(coreService.getAllObjectType).toHaveBeenCalledWith('en', 20, 0);
    expect(component.allDatasetOptions).toEqual(allOptions);
    component.filteredOptionsObs.subscribe(resp => {
      expect(resp).toEqual(allOptions);
    });
    expect(component.datasetList).toEqual(allOptions);
  });

  it('getDatasetModules, should get dataset list ', () => {
    spyOn(coreService, 'getAllObjectType').and.returnValue(of([]));
    component.getDatasetModules();
    component.filteredOptionsObs.subscribe(resp => {
      expect(resp).toEqual([]);
    });
    expect(component.datasetList).toEqual([]);
  });

  it('getInterfaceDetails, should get interface list ', async(() => {
    component.selectedConnectionDetail.connId = '9e91750d-59d7-4dac-9172-6625e822e7b0';
    const interfaceDetails = [{
      interfaceType: 'DROPDOWN',
      name: '2342135',
      dataset: '497',
      type: 'DROPDOWN',
      flows: '',
      status: 'Active',
      interfaceId: '4c99922f-3d7c-4105-9f3a-e93d25666cb4',
    }];
    const interfaceData = {
      response: {
        content: [
          {
            scenarioId: '4c99922f-3d7c-4105-9f3a-e93d25666cb4',
            scenarioDesc: '2342135',
            objectType: '497',
            sourceSystem: '309a5eab-ee31-4527-9dcb-58e6b411d41a',
            targetSystem: '309a5eab-ee31-4527-9dcb-58e6b411d41a',
            active: true,
            enhancementNumber: null,
            isSynchronous: false,
            tenantId: '0',
            scenarioAuth: null,
            soapVersion: null,
            xslFileSNO: null,
            retryError: null,
            interfaceType: 'DROPDOWN',
            schemaRef: null,
            retryFrequency: null,
            jobId: null,
            fieldId: null,
            targetEntityType: null,
            dmsReference: '1252d809-0f06-4ca4-9633-2c523187ac5b',
            filename: 'material_multiple_segment.wsdl.xml',
            externalEntity: null,
          },
        ],
      },
    };
    spyOn(connectionService, 'getInterfaceDetails').and.returnValue(of(interfaceData));
    component.getInterfaceDetails('9e91750d-59d7-4dac-9172-6625e822e7b0', '');

    expect(component.INTERFACES_DATA).toEqual(interfaceDetails);
    expect(component.DEFAULT_INTERFACE_DATA).toEqual(interfaceDetails);
  }));

  it('getSelectedConnectionDetails, should get selected connection details', () => {
    component.connections = dummyConnection; // emit
    spyOn(component,'getConnectionDetails');
    component.getSelectedConnectionDetails(0);
    expect(component.selectedConnectionDetail.connId).toEqual(dummyConnection[0].connectionId);
    expect(component.selectedConnectionDetail.connName).toEqual(dummyConnection[0].connectionName);
    expect(component.getConnectionDetails).toHaveBeenCalledWith(dummyConnection[0]);
  });

  it('openEditConnectionSideSheet, should open edit connection sidesheet', () => {
    spyOn(connectionService, 'nextConnectionDetails');
    spyOn(router, 'navigate');
    component.openEditConnectionSideSheet();
    expect(router.navigate).toHaveBeenCalledWith(
      [
        {
          outlets: {
            sb: `sb/settings/connectivity`,
            outer: `outer/connectivity/edit-connection/${component.selectedConnectionDetail.connId}`,
          },
        },
      ],
      {
        queryParamsHandling: 'preserve',
      }
    );
    expect(connectionService.nextConnectionDetails).toHaveBeenCalledWith(component.selectedConnectionDetail);
  });

  it('openInterfaceMapping, should open interface mapping', () => {
    spyOn(router, 'navigate');
    component.openInterfaceMapping({ dataset: '497', interfaceId: '4c99922f-3d7c-4105-9f3a-e93d25666cb4' });
    expect(router.navigate).toHaveBeenCalledWith(
      [{ outlets: { sb: `sb/settings/connectivity`, outer: `outer/mapping/field-mapping/497/4c99922f-3d7c-4105-9f3a-e93d25666cb4` } }],
      { queryParamsHandling: 'preserve' }
    );
  });

  it('testSelectedConnection, should test connection, connection is successful', () => {
    spyOn(connectionService, 'testSelectedConnection').and.returnValue(of({ acknowledge: true, errorMsg: null, response: true }));
    component.testSelectedConnection();
    expect(component.showTestConnectionMsg).toBeTruthy();
    expect(component.isConnectionTestSuccess).toBeTruthy();
    expect(component.testConnectionMessage).toEqual('Test connection is successful!');
  });

  it('testSelectedConnection, should test connection, connection is unsuccessful', () => {
    spyOn(connectionService, 'testSelectedConnection').and.returnValue(of({ acknowledge: false, fieldsErrors: null, response: null }));
    component.testSelectedConnection();
    expect(component.showTestConnectionMsg).toBeTruthy();
    expect(component.isConnectionTestSuccess).toBeFalsy();
    expect(component.testConnectionMessage).toEqual(
      `Unable to reach the ${component.selectedConnectionDetail.connName}. Verify the details and try again`
    );
  });

  it('deleteConnection, should delete connection', () => {
    spyOn(connectionService, 'deleteSystem').and.returnValue(of({acknowledge: true, response: true }));
    spyOn(component, 'getConnectionDetails');
    component.deleteConnection();
    expect(component.connections).toEqual([dummyConnection[1]]);
    expect(component.getConnectionDetails).toHaveBeenCalledWith(dummyConnection[1]);
  });

  it('activateInactiveInterface, should active interface', () => {
    const interfaceDetail = {
      status: 'Inactive',
      interfaceId: '4c99922f-3d7c-4105-9f3a-e93d25666cb4',
    };
    spyOn(connectionService, 'setActiveInactiveInterface').and.returnValue(of({ acknowledge: true, response: { active: true } }));
    component.activateInactiveInterface(interfaceDetail);
    expect(interfaceDetail.status).toEqual('Active');
  });

  it('activateInactiveInterface, should in-active interface', () => {
    const interfaceDetail = {
      status: 'Active',
      interfaceId: '4c99922f-3d7c-4105-9f3a-e93d25666cb4',
    };
    spyOn(connectionService, 'setActiveInactiveInterface').and.returnValue(of({ acknowledge: true, response: { active: false } }));
    component.activateInactiveInterface(interfaceDetail);
    expect(interfaceDetail.status).toEqual('Inactive');
  });

  it('deleteInterface, should delete connection', async(() => {
    const interfaceDetails = [
      {
        dataset: '497',
        flows: '',
        interfaceId: '4c99922f-3d7c-4105-9f3a-e93d25666cb4',
        name: '2342135',
        opt: 'Dropdown pull',
        status: 'Active',
        type: 'Dropdown pull',
      },
      {
        dataset: '502',
        flows: '',
        interfaceId: '002b938b-fa63-4fd8-a2f4-2724a9fc41a2',
        name: 'sdfagsd',
        opt: 'Data upload',
        status: 'Active',
        type: 'Data upload',
      },
    ];
    component.INTERFACES_DATA = interfaceDetails;
    spyOn(connectionService, 'deleteConnectionInterface').and.returnValue(of({ response: true }));
    component.deleteInterface(interfaceDetails[0]);
    expect(connectionService.deleteConnectionInterface).toHaveBeenCalledWith(interfaceDetails[0].interfaceId);
    expect(component.INTERFACES_DATA).toEqual([interfaceDetails[1]]);
  }));

  it('openTableViewSettings, should open preview-map sidesheet', () => {
    spyOn(router, 'navigate');
    component.openTableViewSettings('preview-map');
    expect(router.navigate).toHaveBeenCalledWith(
      [{ outlets: { sb: `sb/settings/connectivity`, outer: `outer/connectivity/preview-mapping` } }],
      { queryParamsHandling: 'preserve' }
    );
  });

  it('openTableViewSettings, should open data-scope sidesheet', () => {
    spyOn(router, 'navigate');
    component.openTableViewSettings('data-scope');
    expect(router.navigate).toHaveBeenCalledWith(
      [{ outlets: { sb: `sb/settings/connectivity`, outer: `outer/connectivity/data-scope` } }],
      { queryParamsHandling: 'preserve' }
    );
  });

  it('openTableViewSettings, should open add-daxe sidesheet', () => {
    spyOn(router, 'navigate');
    component.openTableViewSettings('add-daxe');
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/settings/connectivity`, outer: `outer/connectivity/add-daxe` } }], {
      queryParamsHandling: 'preserve',
    });
  });

  it('openTableViewSettings, should open sync-freq sidesheet', () => {
    spyOn(router, 'navigate');
    component.openTableViewSettings('sync-freq');
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/settings/connectivity`, outer: `outer/connectivity/sync-freq/${component.selectedConnectionDetail.connId}` } }], {
      queryParamsHandling: 'preserve',
    });
  });

  it('openTableViewSettings, should open payload-test sidesheet', () => {
    spyOn(router, 'navigate');
    component.openTableViewSettings('payload-test');
    expect(router.navigate).toHaveBeenCalledWith(
      [{ outlets: { sb: `sb/settings/connectivity`, outer: `outer/connectivity/payload-test` } }],
      { queryParamsHandling: 'preserve' }
    );
  });

  it('openTableViewSettings, should open add-interface sidesheet', () => {
    spyOn(router, 'navigate');
    component.openTableViewSettings('add-interface');
    expect(router.navigate).toHaveBeenCalledWith(
      [
        {
          outlets: {
            sb: `sb/settings/connectivity`,
            outer: `outer/connectivity/new-interface/${component.selectedConnectionDetail.connId}`,
          },
        },
      ],
      { queryParamsHandling: 'preserve' }
    );
  });
});
