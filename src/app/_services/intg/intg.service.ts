import { EndpointsIntgService } from './../_endpoints/endpoints-intg.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConnectionDTO, CpiConnection, MDOMappingsResponse, NewDatasetMappingsResponse } from '@models/connector/connector.model';

@Injectable({
  providedIn: 'root'
})
export class IntgService {

  constructor(private http: HttpClient, private endpointsIntgService: EndpointsIntgService) { }

  getMappingsByURL(dto: ConnectionDTO) {
    return this.http.post<NewDatasetMappingsResponse>(this.endpointsIntgService.getMappingsByURL(), dto);
  }

  getMdOMappings(moduleId: string, language: string) {
    return this.http.get<MDOMappingsResponse>(`${this.endpointsIntgService.getMdOMappingsUrl()}?language=${language}&moduleId=${moduleId}`);
  }

  createUpdateConnection(connection: CpiConnection) {
    return this.http.post<MDOMappingsResponse>(this.endpointsIntgService.createUpdateConnection(), connection);
  }
}
