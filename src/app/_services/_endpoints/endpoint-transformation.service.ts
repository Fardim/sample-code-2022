import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EndpointTransformationService {

  apiUrl = environment.apiurl + '/transformation';

  constructor() { }

  validateRuleUrl() {
    return this.apiUrl + '/validate';
  }
}
