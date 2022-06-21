import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EndpointsProcessService } from './_endpoints/endpoints-process.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogsService {

  /**
   * Constructor of @class LogsService
   */
  constructor(
    public endpointsProcessService: EndpointsProcessService,
    private http: HttpClient
  ) { }

  /**
   * Function to get Module Logs from Service
   * @param moduleId dataset id
   * @param referenceNo object / reference number
   */
   getModuleLogsAuditData(moduleId: string, referenceNo: string, pageNo: number, pageSize: number, locale: string): Observable<any> {
    return this.http.get(this.endpointsProcessService.getModuleAllLogs(moduleId, referenceNo, pageNo, pageSize, locale));
  }

}