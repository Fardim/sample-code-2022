import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EndpointsClassicService } from './_endpoints/endpoints-classic.service';

@Injectable({
  providedIn: 'root'
})
export class TaskListFiltersService {

  constructor(public http: HttpClient, public endpointService: EndpointsClassicService) { }

  getDynamicList(item) {
    return this.http.post<any>(this.endpointService.getFilterDynamicListsUrl(), item)
  }
}
