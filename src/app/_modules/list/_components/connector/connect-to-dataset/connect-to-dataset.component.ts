import { ConnectorService } from './../services/connector.service';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { SalesforceAdaptorService } from '@services/salesforce-adaptor.service';
import { SapwsService, TableMappingData } from '@services/sapws/sapws.service';
@Component({
  selector: 'pros-connect-to-dataset',
  templateUrl: './connect-to-dataset.component.html',
  styleUrls: ['./connect-to-dataset.component.scss'],
})
export class ConnectToDatasetComponent implements OnInit {

  @Output()
  cancelClick: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  backClick: EventEmitter<any> = new EventEmitter<any>();

  existingConnectorsList = [];
  searchConnectorCtrl = new FormControl();
  selectedConnector: Observable<any[]>;

  showConnectorData = false;
  showSalesforceConnection = false;
  selectedConnectorOption = '';

  errorMessage = '';
  showErrorBanner = false;
  // pendingConnections = ['Connection1','Connection2'];
  // pendingConn: Observable<any[]> = of(['Connection1','Connection2']);
  pendingConnections = [];
  pendingConn: Observable<any[]>;

  constructor(private adaptorService: SalesforceAdaptorService, public connectorService: ConnectorService, private sapsw: SapwsService) { }

  ngOnInit(): void {
    this.getExistingConnectorList();
    this.checkForSearchValueChange();
  }

  getExistingConnectorList() {
    this.adaptorService.getExistingConnectors().subscribe((connectorList) => {
      this.existingConnectorsList = [...connectorList];
      this.selectedConnector = of(this.existingConnectorsList);
    });

    const refToken = localStorage.getItem('JWT-REFRESH-TOKEN');
    if(refToken) {
      this.adaptorService.getPendingConnections(refToken).subscribe((connection) => {
        if(connection?.length) {
          this.pendingConnections = connection;
          this.pendingConn = of(this.pendingConnections);
        }
      });
    }
  }

  checkForSearchValueChange() {
    this.searchConnectorCtrl.valueChanges.subscribe((text) => {
      const FilteredServiceOption = this.filteredConnectorList(text);
      this.selectedConnector = of(FilteredServiceOption);
    });
  }

  filteredConnectorList(value) {
    const connectorValue = value.toLowerCase();
    return this.existingConnectorsList.filter((text) => text.title.toLowerCase().indexOf(connectorValue) === 0);
  }

  onConnectorSelect(connectorTitle): void {
    this.showConnectorData = true;
    this.showSalesforceConnection = false;
    this.selectedConnectorOption = connectorTitle;
    this.showErrorBanner = false;

    if (connectorTitle === 'Salesforce') {
      this.showSalesforceConnection = true;
    }
    this.setActiveCard(connectorTitle);

    if (connectorTitle === 'SAP CPI') {
      this.connectorService.getNextComponent('sap cpi login');
    }
  }

  setActiveCard(connectorTitle) {
    this.existingConnectorsList.map(connector => {
      if (connector.title === connectorTitle) {
        connector.isSelectedCard = true;
      } else {
        connector.isSelectedCard = false;
      }
    })
    this.selectedConnector = of(this.existingConnectorsList);
  }

  back() {
    this.connectorService.backClicked.next(true);
    if (this.showConnectorData) {
      this.showConnectorData = false;
      this.showSalesforceConnection = false;
    }
  }

  onNextClick() {
    if (!this.selectedConnectorOption) {
      this.showErrorBanner = true;
      this.errorMessage = 'Please select Connector';
    } else {
      this.showConnectorData = true;
    }
  }

  pendingConnectionSelect(connectionDetails: any) {
    if(connectionDetails?.connectionId) {
      console.log('Connection id', connectionDetails);
      this.sapsw.updateTablemappingData({ connectionId: connectionDetails.connectionId } as TableMappingData)
      this.connectorService.getNextComponent('sap cpi checklist');
    } else {
      console.error('Connection id not found', connectionDetails);
    }
  }

  onCancelClick() {
    this.connectorService.onCancelClick({ toRefreshApis: false, moduleId: null })
  }
}
