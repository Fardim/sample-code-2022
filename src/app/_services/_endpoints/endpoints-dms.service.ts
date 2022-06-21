import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EndpointsDmsService {

  apiUrl = environment.apiurl + '/dms';

  constructor() { }

  dummyUrl() {
    return `${this.apiUrl}/dms-files`;
  }

  upoadFileUrl() {
    return `${this.apiUrl}/doc/upload`;
  }

  downloadFileUrl(documentId, docRevision?: number) {
    return `${this.apiUrl}/doc/${documentId}?revision=${docRevision || ''}`;
  }

  downloadFileUrls() {
    return `${this.apiUrl}/doc/list`;
  }

  deleteFileUrl(documentId, docRevision?: number) {
    return `${this.apiUrl}/doc/delete/${documentId}?revision=${docRevision || ''}`;
  }
}
