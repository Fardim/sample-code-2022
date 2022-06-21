import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EndpointWebsocketService {
  apiurl = environment.apiurl + '/notif';

  constructor() {}

  retrieveMessages(channelId) {
    return this.apiurl + `/getMessages/${channelId}`;
  }

  getOrCreateChannelId(){
    return this.apiurl + `/getOrCreateChannelId`;
  }

  jwtLogin() {
    return this.apiurl + `/jwtLogin`;
  }

  getChannelIdUrl(){
    return this.apiurl + `/getChannelId`;
  }

  createTemplate() {
    return this.apiurl + `/create-template`;
  }

  updateTemplate(templateType: string) {
    return this.apiurl + `/update-template-body/?type=${templateType}`;
  }
}
