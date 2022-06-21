import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EndpointsChatService {
  apiurl = environment.apiurl + '/chat';

  constructor() {}

  getChatMentionList() {
    return this.apiurl + `/mention-user-list`;
  }
}
