import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SchemaListModuleList, SchemaListDetails, SchemaRunningDetails } from 'src/app/_models/schema/schemalist';
import { map } from 'rxjs/operators';
import { Any2tsService } from '../../any2ts.service';
import { EndpointsRuleService } from '@services/_endpoints/endpoints-rule.service';

@Injectable({
  providedIn: 'root'
})
export class SchemalistService {
  constructor(
    private endpointService: EndpointsRuleService,
    private http: HttpClient,
    private any2tsService: Any2tsService
  ) { }

  public getSchemaList(): Observable<SchemaListModuleList[]> {
    return this.http.get<SchemaListModuleList[]>(this.endpointService.getSchemaListByGroupIdUrl());
  }

  public getAllSchemaList(offset: number, searchStr = '', count = 40): Observable<SchemaRunningDetails[]> {
    return this.http.get<SchemaRunningDetails[]>(this.endpointService.getAllRunningSchemaList(offset, count, searchStr));
  }
  public updateSchemaBadgeInfo(schemaId: string): Observable<any> {
    return this.http.post<any>(this.endpointService.updateSchemaBadgeInfo(schemaId), {});
  }

  public getSchemaDetailsBySchemaId(schemaId: string): Observable<SchemaListDetails> {
    return this.http.get<any>(this.endpointService.getSchemaDetailsBySchemaIdUrl(schemaId)).pipe(map(data => {
      return this.any2tsService.any2SchemaDetailsWithCount(data);
    }));
  }



}
