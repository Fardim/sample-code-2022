import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AllMessagesRequest, ChannelIdrequest } from '@modules/chat/_common/chat';
import { Store } from '@ngrx/store';
import { EndpointWebsocketService } from '@services/_endpoints/endpoint-websocket.service';
import { EndpointsNotifService } from '@services/_endpoints/endpoints-notif.service';
import { ChatState } from '@store/reducers/chat.reducer';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  messageList = [
    {
      id: '3531dae1-1911-4665-b958-f020808f1eb0',
      senderMessageId: null,
      replyFor: null,
      replyForMsg: null,
      deleted: false,
      edited: false,
      userId: 'cm.public',
      channelId: 'e6e3d836-00b1-489e-a642-0395377ce276',
      date: '2022-03-04T11:11:33.839+00:00',
      rawMsg: null,
      msg: {
        type: 'rich_text',
        elements: [
          {
            type: 'text',
            elements: [
              {
                type: 'text',
                elements: null,
                raw: null,
                text: '1\n',
                style: null,
                userId: null,
                url: null,
                name: null,
                listIndent: 0,
              },
            ],
            raw: null,
            text: null,
            style: null,
            userId: null,
            url: null,
            name: null,
            listIndent: 0,
          },
        ],
        raw: null,
        text: null,
        style: null,
        userId: null,
        url: null,
        name: null,
        listIndent: 0,
      },
      fromUserId: 'luv200@gmail.com',
      fromUserInfo: null,
      toUserId: null,
      toUserInfo: null,
      sortValues: null,
      public: true,
    },
  ];

  chatMentions = [
    { id: 1, value: 'Shahnshah', initials: 'SH' },
    { id: 2, value: 'Sandeep', initials: 'SA' },
    { id: 3, value: 'Rahul', initials: 'RA' },
    { id: 4, value: 'Alex', initials: 'AL' },
  ];

  constructor(
    private http: HttpClient,
    private endpointWebsocketService: EndpointWebsocketService,
    private endpointNotifService: EndpointsNotifService
    ) {}

  getAllMessages(payload: AllMessagesRequest): Observable<any> {
    return this.http.get(this.endpointWebsocketService.retrieveMessages(payload.channelId), {
      params: {
        fetchSize: `${payload.fetchSize}`,
        fetchCount: `${payload.fetchCount}`,
      },
    });
  }

  getMentionsList() {
    return of(this.chatMentions);
    // return this.http.get<any[]>(this.endpointsService.getChatMentionList());
  }

  getOrCreateChannelId(payload): Observable<any> {
    const formData = new FormData();
    // eslint-disable-next-line guard-for-in
    for (const key in payload) {
      formData.append(key, payload[key]);
    }
    const httpOptions = {
      observe: 'response' as const,
    };
    return this.http.post<any>(this.endpointWebsocketService.getOrCreateChannelId(), formData, httpOptions).pipe(
      map((m) => {
        localStorage.setItem('C-TOKEN', m.headers.get('ctoken'));
        return m.body;
      })
    );
  }

  jwtLogin(): Observable<any> {
    return this.http.post<any>(this.endpointWebsocketService.jwtLogin(), null);
  }

  dummyUserCreds(payload) {
    const formData = new FormData();
    formData.append('userId', payload.userId);
    formData.append('fqdn', environment.apiurl);
    formData.append('tenantId', payload.tenantId);

    return this.http.post<any>('https://dev-play.masterdataonline.com/notif/dummyUserCreds', formData).pipe(
      catchError((err) => {
        console.log('---------- err :: ', err);
        return of(err.error.text);
      })
    );
  }

  getChannelId(payload: ChannelIdrequest): Observable<any> {
    let urlWithSearchParam = this.endpointWebsocketService.getChannelIdUrl();
    // eslint-disable-next-line guard-for-in
    const str = [];
    for (const p in payload)
      if (payload.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(payload[p]));
      }
    str.join('&');
    str.forEach((el, i) => {
      if (i === 0) {
        urlWithSearchParam += '?' + el;
      } else {
        urlWithSearchParam += '&' + el;
      }
    });
    return this.http.get<any>(urlWithSearchParam);
  }

  /**
   * Udate the channel attribute ...
   * @param request the update channel request
   * @returns will return the Observable
   */
  public updateChannelAttribute(request : ChannelIdrequest): Observable<boolean> {
    return this.http.put<boolean>(this.endpointNotifService.updateChannelAttributeUri(),request);
  }
}
