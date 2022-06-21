import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EndpointsCoreService } from '@services/_endpoints/endpoints-core.service';
import { Observable } from 'rxjs';
import { MappingData, MappingDatasetRequest, MappingRequestBody, MdoFieldMapping, SaveMappingResponse } from '@models/mapping';

@Injectable({
  providedIn: 'root',
})
export class MappingService {

  constructor(private http: HttpClient, public endpointService: EndpointsCoreService) {}

  public getExistingMappings(scenarioId: string | number, fetchCount = 0, fetchSize = 20, searchTerm = ''): Observable<MappingData> {
    return this.http.get<MappingData>(this.endpointService.getExistingMappingsUrl(scenarioId, fetchCount, fetchSize, searchTerm));
  }

  public getExternalMappings(scenarioId: string | number): Observable<MappingData> {
    return this.http.get<MappingData>(this.endpointService.getExternalMappingsUrl(scenarioId));
  }

  public saveOrUpdateMapping(body: MappingRequestBody, scenarioId: string | number): Observable<SaveMappingResponse> {
    return this.http.post<SaveMappingResponse>(this.endpointService.saveOrUpdateMappingUrl(scenarioId), body);
  }

  public getMdoMappings(language: string, moduleId: string | number, fetchCount = 0, fetchSize = 0, searchTerm = ''): Observable<MdoFieldMapping> {
    return this.http.get<MdoFieldMapping>(this.endpointService.getMdoMappingUrl(language, moduleId, fetchCount, fetchSize, searchTerm));
  }

  public createNewDatasetMapping(body: MappingDatasetRequest) {
    return this.http.post<any>(this.endpointService.createNewDatasetMappingUrl(), body);
  }
}
