import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EndpointsClassicService } from './_endpoints/endpoints-classic.service';

@Injectable({
  providedIn: 'root'
})
export class WorkflowBuilderService {

  recipientsListSample = [
    'Bilel', 'Nikhil', 'Sandeep', 'Saurabh'
  ];

  workflowFieldsSample = [
    { id: 1, label: 'Moving price R', key: 'movingPriceR', type: 'input' },
    { id: 2, label: 'Price control', key: 'priceControl', type: 'select', options: ['option 1', 'option 2'] },
    { id: 3, label: 'Storage bin', key: 'storageBin', type: 'input' }
  ];


  customEventsSample = [
    { id: 1, label: 'Date check' },
    { id: 2, label: 'Update status' },
    { id: 3, label: 'Value edit' }
  ];

  constructor(private http: HttpClient,
    public endpointService: EndpointsClassicService) { }


  getRecipientList(data): Observable<any> {
    // return of(this.recipientsListSample) ;
    return this.http.get<any>(this.endpointService.getLoadRecipientsListUrl(), { params: data });
  }

  getWorkflowFields(data): Observable<any> {
    // return of(this.workflowFieldsSample) ;
    return this.http.get(this.endpointService.getWfFieldsListUrl(), { params: data });
  }

  getLoadApi(data): Observable<any> {
    return this.http.get(this.endpointService.getLoadApisUrl(), { params: data });
  }

  saveWfDefinition(data): Observable<any> {

    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');

    return this.http.post(this.endpointService.getSaveWfDefinitionUrl(), null, { params: data, headers });
  }
  getFieldOptions(data): Observable<any> {
    return this.http.get(this.endpointService.getFieldOptionsUrl(), { params: data });
  }
  getwfDefinition(data): Observable<any> {
    return this.http.get(this.endpointService.getloadWfDefinitionUrl(), { params: data });
  }

}
