import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ConnectionDescriptionComponent } from './connection-description/connection-description.component';

import { NewConnectionFlowComponent } from './new-connection-flow.component';
import { NewConnectionComponent } from './new-connection/new-connection.component';

describe('NewConnectionFlowComponent', () => {
  let component: NewConnectionFlowComponent;
  let fixture: ComponentFixture<NewConnectionFlowComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

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
    viewPort: '0 0 90 45'
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewConnectionFlowComponent, NewConnectionComponent, ConnectionDescriptionComponent ],
      imports:  [ SharedModule, RouterTestingModule, AppMaterialModuleForSpec, MdoUiLibraryModule ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }, { provide: MAT_DIALOG_DATA, useValue: {}
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewConnectionFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit, should called initialize form', () => {
    spyOn(component,'initializeForm');
    component.ngOnInit();
    expect(component.initializeForm).toHaveBeenCalled();
  })

  it('initializeForm, should initialize from', () => {
    component.initializeForm();
    expect(component.newConnectionDetailsForm).toBeDefined();
  })

  it('setActiveView, should set active view', () => {
    component.setActiveView('connection-description');
    expect(component.newConnectionDetailsForm).toBeTruthy();
    expect(component.activeView).toEqual('connection-description');
  })

  it('setActiveConnection, should set active connection', () => {
    component.setActiveConnection(connectionDetails);
    expect(component.selectedConnection).toEqual(connectionDetails);
  })

  it('closeDialog, should close dialog', () => {
    component.closeDialog(null);
    expect(mockDialogRef.close).toHaveBeenCalled();
  })
});
