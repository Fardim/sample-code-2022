import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EndpointCrossDatasetService {

  crossDatasetRuleAPIUrl = environment.apiurl + '/crossdataset';
  constructor() { }

  public createUpdateCrossDatasetRule(senarioId) {
    return `${this.crossDatasetRuleAPIUrl}/save-update-cross-dataset-rule?scenarioId=${senarioId}`;
  }

  public getCrossDatasetRuleInfo(brId) {
    return `${this.crossDatasetRuleAPIUrl}/get-cross-dataset-rule?crossDataSetRuleId=${brId}`;
  }

  public deleteCrossDatasetRule(brId) {
    return `${this.crossDatasetRuleAPIUrl}/delete-cross-dataset-rule?crossDataSetRuleId=${brId}`;
  }

  public getAllCrossDatasetRuleInfo() {
    return `${this.crossDatasetRuleAPIUrl}/get-all-cross-dataset-rule`;
  }

  public getCrossDatasetRuleByRefId(brId) {
    return `${this.crossDatasetRuleAPIUrl}/get-cross-dataset-rule-by-refId?crossDataSetRefId=${brId}`;
  }

}
