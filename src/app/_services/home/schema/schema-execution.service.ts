import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SchemaExecutionRequest } from 'src/app/_models/schema/schema-execution';
import { EndpointsRuleService } from '@services/_endpoints/endpoints-rule.service';

@Injectable({
  providedIn: 'root'
})
export class SchemaExecutionService {

  constructor(
    private http: HttpClient,
    private endpointService: EndpointsRuleService
  ) { }

  public scheduleSChema(schemaExecutionReq: SchemaExecutionRequest, isRunWithCheckedData: boolean) {
    return this.http.post<any>(this.endpointService.getScheduleSchemaUrl(isRunWithCheckedData), schemaExecutionReq);
  }
}
