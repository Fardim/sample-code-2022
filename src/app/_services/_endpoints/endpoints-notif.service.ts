import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EndpointsNotifService {

  apiUrl = environment.apiurl + '/notif';

  constructor() { }

  getTemplateUrl() {
    return `${this.apiUrl}/get-template`;
  }
  getTemplateByIdUrl(templateId: string) {
    return `${this.apiUrl}/get-template-by-id/${templateId}`;
  }
  createTemplateUrl() {
    return `${this.apiUrl}/create-template`;
  }
  updateTemplateUrl() {
    return `${this.apiUrl}/update-template`;
  }

  deleteTemplateById(templateId) {
    return `${this.apiUrl}/delete-template/${templateId}`
  }

  /**
   * The endpoint for update attribute
   * @returns will return the uri...
   */
  public updateChannelAttributeUri(): string {
    return `${this.apiUrl}/channel/_update/attributes`;
  }
}
