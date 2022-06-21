import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ImportInterfaceDetailsRequest } from '@models/mapping';
import { Package } from '@modules/connekthub';
import { EndpointsCoreService } from '@services/_endpoints/endpoints-core.service';
import { EndpointsSapwsService } from '@services/_endpoints/endpoints-sapws.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConnectionDTO, CpiConnection, ImportRequestDTO, NewDatasetMappingsResponse, SapRequestDTO, SAPResponseEntity } from './../../_models/connector/connector.model';


export interface StandardPackageDatascopeRequest {
  jsonData: string;
  scenarioId: string;
  tenantId: string;
  uuid?: string;
}
export interface TableMappingData {
  serviceName?: string;
  serviceURL?: string;
  url: string;
  username: string;
  password: string;
  tableName: string;
  pageSize?: number;
  pageNumber?: number;
  connectionId?: string;
  datasetName: string;
  standardPkg: Package;
  selectedPackageOption: string;
  syncData: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SapwsService {

  tableMappingDataConfig: TableMappingData = {
    password: '',
    tableName: '',
    url: '',
    username: '',
    connectionId: '',
    pageNumber: 1,
    pageSize: 20,
    serviceName: '',
    serviceURL: '',
    datasetName: '',
    standardPkg: null,
    selectedPackageOption: '',
    syncData: false
  };
  private tableMappingData: BehaviorSubject<TableMappingData> = new BehaviorSubject<TableMappingData>(null);
  constructor(
    private http: HttpClient,
    private endpointsSapwsService: EndpointsSapwsService,
    private endpointCoreService: EndpointsCoreService) {}

  get tableMappingSubscription(): Observable<TableMappingData> {
    return this.tableMappingData.asObservable();
  }

  get tableMapping(): TableMappingData {
    return this.tableMappingData.getValue();
  }

  set tableMapping(data: TableMappingData) {
    this.tableMappingData.next(data);
  }

  updateTablemappingData(data: TableMappingData) {
    if(data.serviceName) { this.tableMappingDataConfig.serviceName = data.serviceName; }
    if(data.serviceURL) { this.tableMappingDataConfig.serviceURL = data.serviceURL; }
    if(data.url) { this.tableMappingDataConfig.url = data.url; }
    if(data.username) { this.tableMappingDataConfig.username = data.username; }
    if(data.password) { this.tableMappingDataConfig.password = data.password; }
    if(data.connectionId) { this.tableMappingDataConfig.connectionId = data.connectionId; }
    if(data.tableName) { this.tableMappingDataConfig.tableName = data.tableName; }
    if(data.pageSize) { this.tableMappingDataConfig.pageSize = data.pageSize; }
    if(data.pageNumber) { this.tableMappingDataConfig.pageNumber = data.pageNumber; }
    if(data.standardPkg) { this.tableMappingDataConfig.standardPkg = data.standardPkg; }
    if(data.selectedPackageOption) { this.tableMappingDataConfig.selectedPackageOption = data.selectedPackageOption; }
    if(data?.syncData !== undefined) { this.tableMappingDataConfig.syncData = data.syncData; }

    this.tableMapping = this.tableMappingDataConfig;
  }

  getNewDatasetMappings(sapRequestDTO: SapRequestDTO) {
    return this.http.post<NewDatasetMappingsResponse>(this.endpointsSapwsService.getNewDatasetMappingsUrl(), sapRequestDTO);
  }

  getSapServices(sapConnectionDTO: ConnectionDTO) {
    let tenantCode = '0';
    try {
      tenantCode = JSON.parse(JSON.parse(atob(localStorage.getItem('JWT-TOKEN').split('.')[1])).sub).tenantCode;
      console.log('Tenant code: ' + tenantCode);
    } catch (e) {
      console.log('Error');
    }
    return this.http.post<any>(this.endpointsSapwsService.getSapServices(tenantCode), sapConnectionDTO);
  };

  testConnection(sapConnectionDTO: ConnectionDTO) {
    return this.http.post<any>(this.endpointsSapwsService.testConnectionUrl(), sapConnectionDTO);
  };

  saveOrUpdateConnection(connection: CpiConnection) {
    let tenantCode = '0';
    try {
      tenantCode = JSON.parse(JSON.parse(atob(localStorage.getItem('JWT-TOKEN').split('.')[1])).sub).tenantCode;
    } catch (e) {
      console.log('Error');
    }
    return this.http.post<any>(this.endpointsSapwsService.saveOrUpdateConnection(tenantCode), connection);
  }

  createOrUpdateCpiConnection(connection: CpiConnection) {
    return this.http.post<any>(this.endpointCoreService.createOrUpdateCpiConnectionUrl(), connection);
  }

  fetchSAPTables(dto: SapRequestDTO) {
    return this.http.post<string[]>(this.endpointsSapwsService.fetchSAPTablesUrl(), dto);
  }

  importInterfaceDetails(file: File, payload: ImportInterfaceDetailsRequest) {
    const formData = new FormData();
    formData.append('requestDTO', new Blob([JSON.stringify(payload)], {type: 'application/json'}));
    if (file) { formData.append('file', file); }
    const ckhToken = localStorage.getItem('LIB-JWT-TOKEN');
    const headersConfig = {
      'Authorization-CKH': `Bearer ${ckhToken}`
		};
		const headers = new HttpHeaders(headersConfig);
    return this.http.post<SAPResponseEntity<any>>(`${this.endpointsSapwsService.importInterfaceDetailsUrl()}`, formData, {
      headers
    });
  }

  importInterfaceCKH(file: File, connectionId: string) {
    const formData = new FormData();
    formData.append('file', file);
    const ckhToken = localStorage.getItem('LIB-JWT-TOKEN');
    const headersConfig = {
      'Authorization-CKH': `Bearer ${ckhToken}`
		};
		const headers = new HttpHeaders(headersConfig);
    return this.http.post<SAPResponseEntity<any>>(`${this.endpointsSapwsService.importInterfaceUrl(connectionId)}`, formData, {
      observe: 'response',
      headers
    });
  }

  importInterfaceFile(file: File, connectionId: string) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<SAPResponseEntity<any>>(`${this.endpointsSapwsService.importInterfaceUrl(connectionId)}`, formData);
  }

  exportInterfaceDetails(scenarioIds: string[]) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<SAPResponseEntity<any>>(`${this.endpointsSapwsService.exportInterfaceDetailsUrl()}`, { scenarioIds }, { headers });
  }

  saveOrUpdateDatascope(dataset: StandardPackageDatascopeRequest) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<SAPResponseEntity<any>>(`${this.endpointsSapwsService.saveOrUpdateDatascopeUrl()}`, {
      ...dataset
    }, { headers });
  }

  createClassificationJob(payload){
    return this.http.post(`${this.endpointsSapwsService.createClassificationJobUrl()}`,payload);
  }

  testPayload(scenarioId: string, payload) {
    return this.http.post(`${this.endpointsSapwsService.testPayload(scenarioId)}`,payload);
  }
}
