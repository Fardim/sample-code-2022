import { EndpointsConnectionService } from '../_endpoints/endpoints-connection.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConnectionMDOModel, GetConnectionAPI } from '@models/connector/connector.model';

@Injectable({
  providedIn: 'root',
})

export class ConnectionService {

  updateInterfaceList: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  updateInterfaceList$ = this.updateInterfaceList.asObservable();

  updateConnectionDetail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  updateConnectionDetail$ = this.updateConnectionDetail.asObservable();

  connectionDetail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  connectionDetail$ = this.connectionDetail.asObservable();

  interfaces: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  interfaces$ = this.interfaces.asObservable();

  constructor(
    private http: HttpClient,
    private endpointsConnectionService: EndpointsConnectionService) { }

  public getAllConnections(size) {
    return this.http.get(`${this.endpointsConnectionService.getAllConnections(size)}`);
  }

  public getCPIConnections() {
    return this.http.get<ConnectionMDOModel[]>(`${this.endpointsConnectionService.getCPIConnections()}`);
  }

  public getConnectionById(uuid: string) {
    return this.http.get<ConnectionMDOModel>(`${this.endpointsConnectionService.getCPIConnectionByIdUrl(uuid)}`);
  }

  public getConnectionDetails(uuid): Observable<GetConnectionAPI> {
    return this.http.get<GetConnectionAPI>(`${this.endpointsConnectionService.getConnectionDetails(uuid)}`);
  }

  public getInterfaceDetails(connectionId,queryParam) {
    return this.http.get(`${this.endpointsConnectionService.getInterfaceDetails(connectionId,queryParam)}`);
  }

  public saveNewInterfaceDetails(payload, file) {
    const formData = new FormData();
    formData.append('interfaceDetails', new Blob([JSON.stringify(payload)], {type: 'application/json'}));
    if (file) {
      formData.append('file', file);
    }
    return this.http.post(`${this.endpointsConnectionService.saveNewInterfaceDetails()}`,formData);
  }

  public setActiveInactiveInterface(interfaceId) {
    return this.http.get(`${this.endpointsConnectionService.activeInactiveInterface(interfaceId)}`);
  }

  public deleteConnectionInterface(interfaceId) {
    return this.http.delete(`${this.endpointsConnectionService.deleteConnectionInterface(interfaceId)}`);
  }

  public deleteSystem(systemId) {
    return this.http.delete(`${this.endpointsConnectionService.deleteSystem(systemId)}`);
  }

  public testSelectedConnection(connectionId) {
    return this.http.get(`${this.endpointsConnectionService.testSelectedConnection(connectionId)}`);
  }

  public updateConnectionDetails(payload) {
    return this.http.post(`${this.endpointsConnectionService.updateConnectionDetails()}`, payload);
  }

  public saveSyncFrequency(payload) {
    return this.http.post(`${this.endpointsConnectionService.saveFrequencySync()}`,payload);
  }

  public duplicateInterface(interfaceId) {
    return this.http.get(`${this.endpointsConnectionService.duplicateInterfaceUrl(interfaceId)}`);
  }

  public getInterfaceDetail(interfaceId) {
    return this.http.get(`${this.endpointsConnectionService.getInterfaceDetailUrl(interfaceId)}`);
  }

  public getDataScopeDetails(interfaceId) {
    return this.http.get(`${this.endpointsConnectionService.getDataScopeDetails(interfaceId)}`);
  }

  public postDataScopeDetails(payload) {
    return this.http.post(`${this.endpointsConnectionService.postDataScopeDetails()}`,payload);
  }

  nextUpdateInterfaceListSubject(updateList) {
    this.updateInterfaceList.next(updateList);
  }

  nextUpdateConnectionDetailsSubject(updateConnection) {
    this.updateConnectionDetail.next(updateConnection);
  }

  nextConnectionDetails(connectionDetail) {
    this.connectionDetail.next(connectionDetail);
  }

  updateInterfaces(interfaces) {
    this.interfaces.next(interfaces);
  }
}
