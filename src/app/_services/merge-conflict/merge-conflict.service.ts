import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConflictedRecord, ConflictedRecordDetails } from '@models/merge-conflict/mergeConflictModel';
import { EndpointsClassicService } from '@services/_endpoints/endpoints-classic.service';

@Injectable({
  providedIn: 'root'
})
export class MergeConflictService {

  constructor(private http: HttpClient,
      private endpointsService: EndpointsClassicService) { }

  getConflictedRecordsList(massId: string, crId: string, pageNo, pageSize, searchTerm) {
    return this.http.get<ConflictedRecord[]>(this.endpointsService.getConflictedRecordsListUrl(), {params: {crId, massId, pageNo, pageSize, s: searchTerm}});
  }

  getConflictedRecordDetails(crId: string) {
    return this.http.get<ConflictedRecordDetails>(this.endpointsService.getConflictedRecordDetailsUrl(), { params: {crId}});
  }

  saveConflicResolve(resolvedRecords, massId) {
    return this.http.post<any>(this.endpointsService.saveConflicResolveUrl(), resolvedRecords, {params: {massId}});
  }

  resetConflictCR(crId) {
    return this.http.post<any>(this.endpointsService.resetConflictCrUrl(), null, {params: {crId}});
  }
}
