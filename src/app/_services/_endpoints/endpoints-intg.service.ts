import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EndpointsIntgService {

  apiUrl = environment.apiurl + '/intg';

  constructor() { }

  getMappingsByURL(): string {
    return `${this.apiUrl}/get-mappings-by-url`;
  }

  getMdOMappingsUrl(): string {
    return `${this.apiUrl}/get-mdo-mappings`;
  }

  createUpdateConnection(): string {
    return `${this.apiUrl}/create-update-connection`;
  }
}
