import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EndpointTransformationService } from '@services/_endpoints/endpoint-transformation.service';
import { RuleTransformationReq } from '../../_models/transformation';

@Injectable({
  providedIn: 'root'
})
export class TransformationService {

  constructor(
    private http: HttpClient,
    private endpointsTransformationService: EndpointTransformationService
  ) { }

  validate(ruleTransformationReq: RuleTransformationReq) {
    return this.http.post(this.endpointsTransformationService.validateRuleUrl(), ruleTransformationReq);
  }
}
