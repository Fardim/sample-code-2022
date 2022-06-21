import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { SalesforceAdaptorService } from '@services/salesforce-adaptor.service';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ExistingConnectorsList } from '../connectors.constants';
import { SalesforceConnectionComponent } from '../salesforce-connection/salesforce-connection.component';
import { ConnectToDatasetComponent } from './connect-to-dataset.component';

describe('ConnectToDatasetComponent', () => {
  let component: ConnectToDatasetComponent;
  let fixture: ComponentFixture<ConnectToDatasetComponent>;
  let adaptorService: SalesforceAdaptorService;
  const existingConnectorsList = [...ExistingConnectorsList];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnectToDatasetComponent, SalesforceConnectionComponent ],
      imports: [SharedModule, AppMaterialModuleForSpec],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectToDatasetComponent);
    component = fixture.componentInstance;
    adaptorService = fixture.debugElement.injector.get(SalesforceAdaptorService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit, should init', () => {
    spyOn(component,'getExistingConnectorList');
    spyOn(component,'checkForSearchValueChange');
    component.ngOnInit();
    expect(component.getExistingConnectorList).toHaveBeenCalled();
    expect(component.checkForSearchValueChange).toHaveBeenCalled();
  })

  it('getExistingConnectorList(), should get connector list', () => {
    spyOn(adaptorService,'getExistingConnectors').and.returnValue(of(existingConnectorsList));
    spyOn(adaptorService,'getPendingConnections').and.returnValue(of([]));
    component.getExistingConnectorList();
    expect(component.existingConnectorsList).toEqual(existingConnectorsList);
  })

  it('filteredConnectorList(), should filter connecter list based on key value', () => {
    const filteredValue = component.filteredConnectorList('SAP CPI');
    expect(filteredValue).toEqual([ExistingConnectorsList[0]]);
  })

  it('onConnectorSelect(), should select connector', () => {
    const selectedConnector = 'Salesforce';
    component.onConnectorSelect(selectedConnector);
    expect(component.showConnectorData).toBeTruthy();
    expect(component.selectedConnectorOption).toEqual(selectedConnector);
    expect(component.showErrorBanner).toBeFalsy();
    expect(component.showSalesforceConnection).toBeTruthy();
  })

  it('back(), should go to previous tab', () => {
    component.showConnectorData = true;
    component.back();
    expect(component.showConnectorData).toBeFalsy();
    expect(component.showSalesforceConnection).toBeFalsy();
  })

  it('onNextClick() should go to next screen', () => {
    component.selectedConnectorOption = '';

    component.onNextClick();
    expect(component.showErrorBanner).toBeTruthy();
    expect(component.errorMessage).toEqual('Please select Connector');
  })
});
