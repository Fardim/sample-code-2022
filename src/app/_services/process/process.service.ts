import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WorkflowPath, WorkflowResponse } from '@models/schema/schema';
import { SlaStepSize } from '@modules/report/_models/widget';
import { Any2tsService } from '@services/any2ts.service';
import { EndpointsProcessService } from '@services/_endpoints/endpoints-process.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProcessService {

  constructor(
    private http: HttpClient,
    private endpointsProcessService: EndpointsProcessService,
    private any2tsService: Any2tsService,
  ) { }


  getFormRules(flowId: string, lang: string, userStepId: string) {
    return this.http.get(this.endpointsProcessService.getStepsRulesUrl(), {params: {flowId, lang, userStepId}});
  }

  getworkflowData(): Observable<WorkflowResponse[]> {
    return this.http.get<any>(this.endpointsProcessService.getWorkflowDataURL()).pipe(map((data) => {
      return this.any2tsService.any2moduleidsResponse(data);
    }));
  }

  public getWorkFlowPath(ObjectType: string[]): Observable<WorkflowPath[]> {
    return this.http.post<any>(this.endpointsProcessService.getWorkFlowPathUrl(), ObjectType).pipe(map((data) => {
      return this.any2tsService.any2wfFlowResponse(data);
    }));
  }

  public getSlaSteps(flowId: string) {
    return this.http.get<SlaStepSize[]>(this.endpointsProcessService.getSlaStepSizeUrl(flowId));
  }
}
