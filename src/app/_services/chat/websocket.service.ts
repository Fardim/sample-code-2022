import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { UserInfo } from '@models/teams';

export interface WebsocketConnectionStatus {
  connected: boolean;
  message?: string;
  details?: any;
}

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private webSocketEndPoint = `${environment.apiurl}/notif/mdo-websocket`;

  public messages: Subject<any> = new Subject<any>();

  public connectStatusSubject: Subject<boolean> = new Subject<boolean>();

  public activeUsers: Subject<UserInfo[]> = new Subject();

  stompClient: any;

  constructor() {}

  _connect(): Observable<WebsocketConnectionStatus> {
    const _this = this;
    const _token = localStorage.getItem('JWT-TOKEN');

    return new Observable((observer) => {
      const ws = new SockJS(this.webSocketEndPoint);

      this.stompClient = Stomp.over(ws);
      _this.stompClient.connect(
        {
          'X-Authorization': `Bearer ${_token}`,
        },
        (frame: any) => {
          observer.next({ connected: true, message: 'Connection successfull', details: frame });
          _this.connectStatusSubject.next(true);
          observer.complete();
        },
        (error: any) => {
          observer.error({ connected: false, message: 'Unable to connect to WebSocket', details: error });
          _this.connectStatusSubject.next(false);
          observer.complete();
        }
      );
    })
  }

  _disconnect() {
    if (this.stompClient !== null) {
      this.stompClient.disconnect();
    }
  }

  /**
   * Attempt to connect again if failed ..
   */
  errorCallBack(error) {
    console.log('errorCallBack -> ' + error);
    setTimeout(() => {
      this?._connect();
    }, 5000);
  }

  // _sendPrivate(fromUserId: string, toUserId: string, message) {
  //   const cm = { channelId: this.channelId.getValue(), fromUserId, toUserId, msg: message };
  //   this.stompClient.send('/notif/send.message/' + this.channelId.getValue(), { channelId: this.channelId.getValue() }, JSON.stringify(cm));
  // }

  _sendPublic(payload, headerTenantId) {
    const ctoken = localStorage.getItem('C-TOKEN');
    this.stompClient.send(
      '/notif/send.message/' + payload.channelId,
      { channelId: payload.channelId, fqdn: environment.apiurl, tenantId: headerTenantId, 'X-Authorization': 'Bearer ' + ctoken },
      JSON.stringify(payload)
    );
  }

  _deletePublic(payload) {
    const ctoken = localStorage.getItem('C-TOKEN');
    this.stompClient.send('/notif/delete.message/' + payload.channelId, { channelId: payload.channelId , 'X-Authorization': 'Bearer ' + ctoken}, JSON.stringify(payload));
  }

  _replyPublic(payload, headerTenantId) {
    const ctoken = localStorage.getItem('C-TOKEN');
    this.stompClient.send(
      '/notif/reply.message/' + payload.channelId,
      { channelId: payload.channelId, fqdn: environment.apiurl, tenantId: headerTenantId, 'X-Authorization': 'Bearer ' + ctoken },
      JSON.stringify(payload)
    );
  }

  private onMessageReceived(message) {
    this.messages.next(JSON.stringify(message.body));
  }

  // subscribePrivate(req: ChannelReq) {
  //   this.http
  //     .post<string>(this.channelRequest, req)
  //     .pipe(take(1))
  //     .subscribe((res) => {
  //       const headers = { channelId: res };
  //       this.channelId.next(res);
  //       this.stompClient.subscribe(
  //         '/user/topic/channel/' + res + '.private.messages',
  //         function (msg) {
  //           this.onMessageReceived(msg);
  //         },
  //         headers
  //       );
  //     });
  // }

  subscribePublic(channelId: string) {
    const ctoken = localStorage.getItem('C-TOKEN');
    const headers = { channelId, 'X-Authorization': 'Bearer ' + ctoken  };
    this.stompClient.subscribe(
      '/topic/channel.' + channelId + '.public.messages',
      (msg: any) => {
        this.onMessageReceived(msg);
      },
      headers
    );
  }

  retrieveMessages(payload) {
    const ctoken = localStorage.getItem('C-TOKEN');
    return this.stompClient.send('/notif/getMessages/' + payload.channelId, { channelId: payload.channelId, 'X-Authorization': 'Bearer ' + ctoken  }, JSON.stringify(payload));
  }

  _messages(): Observable<any> {
    return this.messages.asObservable();
  }

  /**
   * Get all the active users ...
   * @param channelId the current channel token
   */
  _activeUsers(channelId: string) {
    const ctoken = localStorage.getItem('C-TOKEN');
    const headers = { channelId, 'X-Authorization': 'Bearer ' + ctoken  };
    this.stompClient.subscribe(
      '/topic/channel.' + channelId + '.active.users',
      (users: any) => {
        users = JSON.parse(users.body);
        const rUsers: UserInfo[] = [];
        users?.forEach(u=>{
          rUsers.push({userName: u.userId});
        });
        this.activeUsers.next(users);
      },
      headers
    );
  }
}
