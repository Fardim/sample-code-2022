import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DoCorrectionRequest, MasterRecordChangeRequest } from '@models/schema/duplicacy';
import { EndpointsRuleService } from '@services/_endpoints/endpoints-rule.service';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CatalogCheckService {
  private refrehGroupList = new Subject();
  constructor(private endpointService: EndpointsRuleService,
    private http: HttpClient) { }
  setRefreshGroupList() {
    this.refrehGroupList.next();
  }
  getRefreshGroupList() {
    return this.refrehGroupList.asObservable();
  }

  markAsMasterRecord(request: MasterRecordChangeRequest): Observable<any> {
    return this.http.post<any>(this.endpointService.masterRecordChangeUrl(), request);
  }

  markForDeletion(objctNumber, moduleId, schemaId, runId, isForRestore: any) {
    return this.http.post<any>(this.endpointService.markForDeletionUrl(objctNumber, moduleId, schemaId, runId), null,{params:{isForRestore}});
  }
  markForExclusion(objctNumber, schemaId, groupId, status) {
    return this.http.post<any>(this.endpointService.markForExclusionUrl(schemaId, groupId), [{
      id: objctNumber,
      status
    }]);
  }
  getAllGroupIds(params) : Observable<any> {
    return this.http.post<any>(this.endpointService.duplicacyGroupsListUrl(), params )
    .pipe(
      map(data => {
        if (data){
          let groups = [];
          const response = {
            groups: [],
            searchAfter: ''
          };
          let searchAfter;
          data.bucket.buckets.map((id, ind) => {
            const ignore = [id.key.fuzzy, id.key.exact].includes('ignore');
            if (id.key.exact !== '') {
              groups = groups.concat({ groupId: id.key.exact, ignore, docCount: id.docCount, groupDesc: id.key.group, groupKey: 'exactGroupId' })
            }
            if (id.key.fuzzy !== '') {
              groups = groups.concat({ groupId: id.key.fuzzy, ignore, docCount: id.docCount, groupDesc: id.key.group, groupKey: 'fuzzyGroupId' })
            }
          });
          if (data.bucket.buckets.length !== 0) {
            console.log('after key : ' + data.bucket.buckets[data.bucket.buckets.length - 1].key);
            searchAfter = data.bucket.buckets[data.bucket.buckets.length - 1].key;
          }
          console.log('Groups ', groups);
          console.log('searchAfter ', searchAfter);
          response.groups = groups;
          response.searchAfter = searchAfter;
          return response;
        }
        return [];
      })
    );
  }

  getCatalogCheckRecords(params): Observable<any>{
    return this.http.post<any>(this.endpointService.catalogCheckRecordsUrl(), params);
  }

  doCorrection(schemaId, runId, request: DoCorrectionRequest): Observable<any> {
    return this.http.post<any>(this.endpointService.doDuplicacyCorrectionUrl(schemaId, runId), request);
  }

  approveDuplicacyCorrection(schemaId, runId, objNums, userName): Observable<any> {
    return this.http.post<any>(this.endpointService.approveDuplicacyCorrectionUrl(schemaId, runId, userName), objNums);
  }

  rejectDuplicacyCorrection(schemaId, runId, objNums, userName): Observable<any> {
    return this.http.post<any>(this.endpointService.rejectDuplicacyCorrectionUrl(schemaId, runId, userName), objNums);
  }

  public downloadExecutionDetails(schemaId: string, runId: string, responseStatus: string, groupId: string, variantId: string): Observable<any> {
    return this.http.get<any>(this.endpointService.downloadDuplicateExecutionDetailsUrl(), {params: {schemaId, runId, responseStatus, groupId, variantId}});
  }

}
