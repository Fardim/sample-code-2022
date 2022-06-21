import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EndpointsSapwsService {
  apiUrl = environment.apiurl + '/sapws';

  constructor() { }

  public getNewDatasetMappingsUrl(): string {
    return `${this.apiUrl}/get-new-dataset-mappings`;
  }

  getSapServices(tenantCode) {
    return `${this.apiUrl}/get-sap-services?${tenantCode}`;
  }

  public testConnectionUrl() {
    return `${this.apiUrl}/test-connection`;
  }

  public saveOrUpdateConnection(tenantCode): string {
    return `${this.apiUrl}/save-update-connection?${tenantCode}`;
  }

  public fetchSAPTablesUrl(): string {
    return `${this.apiUrl}/sap/tables`;
  }

  public importInterfaceUrl(connectionId: string) {
    return `${this.apiUrl}/import-interface?connectionId=${connectionId}`;
  }

  public importInterfaceDetailsUrl() {
    return `${this.apiUrl}/import-interface-details`;
  }

  public exportInterfaceDetailsUrl() {
    return `${this.apiUrl}/export-interface-details`;
  }

  public saveOrUpdateDatascopeUrl() {
    return `${this.apiUrl}/save-update-data-scope`;
  }

  public createClassificationJobUrl() {
    return `${this.apiUrl}/create-classification-job-by-classtype`;
  }

  public testPayload(scenarioId) {
    return `${this.apiUrl}/test-payload/${scenarioId}`;
  }
}
