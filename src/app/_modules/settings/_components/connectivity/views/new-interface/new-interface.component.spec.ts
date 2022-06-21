import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { ConnectionService } from '@services/connection/connection.service';
import { CoreService } from '@services/core/core.service';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { NewInterfaceComponent } from './new-interface.component';

describe('NewInterfaceComponent', () => {
  let component: NewInterfaceComponent;
  let fixture: ComponentFixture<NewInterfaceComponent>;
  let coreService: CoreService;
  let connectionService: ConnectionService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewInterfaceComponent ],
      imports:  [ SharedModule, RouterTestingModule, AppMaterialModuleForSpec, MdoUiLibraryModule ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ connectionId: '9e91750d-59d7-4dac-9172-6625e822e7b0' }),
            queryParams: of({t: 'view', moduleId: '1005'})
          },
        },
        FormBuilder
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewInterfaceComponent);
    component = fixture.componentInstance;
    coreService = fixture.debugElement.injector.get(CoreService);
    connectionService = fixture.debugElement.injector.get(ConnectionService);
    fixture.detectChanges();
  });

  it('should create', () => {
    const returnData = [
      {
        objectid: 497,
        objectdesc: '1100Dataset',
        moduleId: 497,
        moduleDescriptionRequestDTO: {
          description: '1100Dataset'
        }
      }
    ];
    const response = {
      scenarioDesc: 'scenarioDesc',
      interfaceType: 'DROPDOWN',
      active: true,
      objectType: '1',
      fileName: 'filename',
      scenarioId: 'scenarioId'
    }
    spyOn(coreService, 'getAllObjectType').and.returnValue(of(returnData));
    spyOn(coreService,'searchAllObjectType').and.returnValue(of(returnData));
    spyOn(connectionService,'getInterfaceDetail').and.returnValue(of({acknowledge: true, response: response }));
    
    expect(component).toBeTruthy();
  });

  it('ngOnInit(), should initialize', () => {

    const returnData = [
      {
        objectid: 497,
        objectdesc: '1100Dataset',
        moduleId: 497,
        moduleDescriptionRequestDTO: {
          description: '1100Dataset'
        }
      }
    ];
    const response = {
      scenarioDesc: 'scenarioDesc',
      interfaceType: 'DROPDOWN',
      active: true,
      objectType: '1',
      fileName: 'filename',
      scenarioId: 'scenarioId'
    }
    spyOn(coreService, 'getAllObjectType').and.returnValue(of(returnData));
    spyOn(coreService,'searchAllObjectType').and.returnValue(of([]));
    spyOn(connectionService,'getInterfaceDetail').and.returnValue(of({acknowledge: true, response: response }));

    spyOn(component,'createNewInterfaceForm');
    spyOn(component,'getDatasetModules');
    spyOn(component,'getCurrentConnectionId');
    component.ngOnInit();
    expect(component.createNewInterfaceForm).toHaveBeenCalled();
    expect(component.getDatasetModules).toHaveBeenCalled();
    expect(component.getCurrentConnectionId).toHaveBeenCalled();
  })

  it('createNewInterfaceForm, should defined edit form', () => {
    component.createNewInterfaceForm();
    expect(component.newInterfaceForm).toBeDefined() ;
  })

  it('getDatasetModules, should get dataset list ', (() => {
    const returnData = [
      {
        objectid: 497,
        objectdesc: '1100Dataset',
        moduleId: 497,
        moduleDescriptionRequestDTO: {
          description: '1100Dataset'
        }
      }
    ];
    const allOptions = [
      {
        moduleId: 497,
        moduleName: '1100Dataset'
      }
    ]
    spyOn(coreService, 'getAllObjectType').and.returnValue(of(returnData));
    component.getDatasetModules();

    expect(coreService.getAllObjectType).toHaveBeenCalledWith('en',20,0);
    expect(component.dataSetModules).toEqual(allOptions);
  }));

  it('displayNewInterfaceType, should return interface name', () => {
      const interfaceName = component.displayNewInterfaceType({label: 'Data upload'});
      expect(interfaceName).toEqual('Data upload');
  })
});
