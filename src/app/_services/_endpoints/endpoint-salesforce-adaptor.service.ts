import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ExistingConnectorsList } from '../../_modules/list/_components/connector/connectors.constants';
@Injectable({
  providedIn: 'root'
})
export class EndpointSalesforceAdaptorService {

  apiUrl = environment.apiurl
  salesForceObjList = [
    {
      name: 'Accounts',
    },
    {
      name: 'Leads',
    },
    {
      name: 'Opportunities',
    },
  ];

  constructor() { }

  existingConnectorsList = [...ExistingConnectorsList];

  public getAllExistingConnectors() {
    return of(this.existingConnectorsList);
  }

  public getObjectList() {
    return of(this.salesForceObjList);
  }

  public getPendingConnections() {
    return `${this.apiUrl}/intg/cpi-connections`;
  }
}
