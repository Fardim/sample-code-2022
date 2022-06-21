import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EndpointsConnectionService {
  apiUrl = environment.apiurl + '/sapws';
  cpiApiUrl = environment.apiurl + '/intg';

  constructor() {}

  public getAllConnections(size) {
    return `${this.apiUrl}/getAll-connections?size=${size}`;
  }

  public getCPIConnections() {
    return `${this.cpiApiUrl}/cpi-connections`;
  }

  public getCPIConnectionByIdUrl(uuid) {
    return `${this.cpiApiUrl}/connection/${uuid}`;
  }

  public getConnectionDetails(uuid) {
    return `${this.apiUrl}/get-connection/${uuid}`;
  }

  public getInterfaceDetails(connectionId,queryParam) {
    let interfaceListUrl = `${this.apiUrl}/getAll-interface-details?systemId=${connectionId}`;
    if(queryParam) {
      interfaceListUrl += `${queryParam}`
    }
    return interfaceListUrl;
  }

  public saveNewInterfaceDetails() {
    return `${this.apiUrl}/save-update-interface-details`;
  }

  public activeInactiveInterface(interfaceId) {
    return `${this.apiUrl}/active-inactive-interface-details/${interfaceId}`;
  }

  public deleteConnectionInterface(interfaceId) {
    return `${this.apiUrl}/delete-interface-details/${interfaceId}`;
  }

  public deleteSystem(systemId) {
    return `${this.apiUrl}/delete-connection/${systemId}`;
  }

  public testSelectedConnection(connectionId) {
    return `${this.apiUrl}/test-connection/${connectionId}`;
  }

  public updateConnectionDetails() {
    return `${this.cpiApiUrl}/create-update-connection`;
  }

  public saveFrequencySync() {
    return `${this.apiUrl}/cron-expression-generate`;
  }

  public duplicateInterfaceUrl(interfaceId) {
    return `${this.apiUrl}/duplicate-interface-details?scenarioId=${interfaceId}`;
  }

  public getInterfaceDetailUrl(interfaceId) {
    return `${this.apiUrl}/get-interface-details/${interfaceId}`;
  }

  public getDataScopeDetails(interfaceId) {
    return `${this.apiUrl}/get-data-scope/${interfaceId}`;
  }

  public postDataScopeDetails() {
    return `${this.apiUrl}/save-update-data-scope`;
  }
}
