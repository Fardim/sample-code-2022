import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UserInfo } from '@models/teams';
import { UserPersonalDetails } from '@models/userdetails';
import { select, Store } from '@ngrx/store';
import { ChatService } from '@services/chat/chat.service';
import { WebsocketConnectionStatus, WebsocketService } from '@services/chat/websocket.service';
import { UserService } from '@services/user/userservice.service';
import { loadMessages } from '@store/actions/chat.action';
import { ChatState } from '@store/reducers/chat.reducer';
import { selectAllMessages } from '@store/selectors/chat.selector';
import { isEqual } from 'lodash';
import { DeltaParserService, EditorService } from 'mdo-ui-library';
import { Observable, of } from 'rxjs';
import {
  ChannelIdrequest,
  MessageDetails,
  MessagePagination,
  RawMessageObject
} from '../_common/chat';
import { getMessageAttachments } from '../_common/chat-utility';

@Component({
  selector: 'pros-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  providers: [DatePipe],
})
export class ChatComponent implements OnInit, OnChanges {
  /**
   * Schema Id
   */
  @Input() schemaId = '';

  /**
   * Module Id
   */
  @Input() moduleId = '';

  /**
   * Record Id
   */
  @Input() recordId = '';

  /**
   * Cr Id
   */
  @Input() crId = '';

  /**
   * Mass Id
   */
  @Input() massId = '';

  /**
   * Custom props
   */
  @Input() customProps: string[] = [];

  currentUser: UserPersonalDetails | null = null;
  currentChannelId: string;
  messages: MessageDetails[] = [];
  canAutoScroll = true;
  lastScrollTop: any;
  pagination: MessagePagination = {
    fetchCount: 0, // Page index
    fetchSize: 50, // number of records per page
  };

  /**
   * The active user
   */
  activeUsers$: Observable<UserInfo[]> = of([]);
  dummyMesagelist: any = [];
  constructor(
    private chatService: ChatService,
    private websocketService: WebsocketService,
    private userService: UserService,
    private editorService: EditorService,
    private deltaParserService: DeltaParserService,
    private datePipe: DatePipe,
    private chatStore: Store<ChatState>,
  ) {}

  ngOnInit(): void {
    this.chatStore.pipe(select(selectAllMessages)).subscribe((response: RawMessageObject[]) => {
      this.messages = this.handleFormatAndReplies(response);
    });

    // get current user details
    this.getUserDetails().subscribe((userDetails: UserPersonalDetails) => {
      this.currentUser = userDetails;
      // Initialize websocket connection and do jwtLogin
      this.initiateSocketConnection().subscribe((response: WebsocketConnectionStatus) => {
        if (response?.connected) {
          // If connected request channel id and get all the previous messages
          this.prepareChannelIdrequest().then((payload: ChannelIdrequest) => {
            this.getChannelIdAndMessageHistory(payload);
          }).catch((error) => {
            console.error(`Error while preparing channel id request:`,  error);
          });
        }
      });
    });

    this.websocketService.activeUsers.subscribe((activeUsers: UserInfo[]) => {
      console.log('activeUsers', activeUsers);
    });
  }

  handleFormatAndReplies(messageList: RawMessageObject[]): MessageDetails[] {
    const formattedMessageList: MessageDetails[] = [];
    messageList.forEach((message: RawMessageObject) => {
      const msgObject = this.formatMessage(message);
      const parentMessage = messageList.find((msg) => msg.id === msgObject.replyFor);

      if(parentMessage) {
        msgObject.quotedMessage = this.formatMessage(parentMessage);
      }

      formattedMessageList.push(msgObject);
    });

    return formattedMessageList;
  }

  /**
   * Prepare channel id request body
   * @param customPayload pass the custom payload to override default payload
   * @returns Promise<ChannelIdrequest>
   */
  prepareChannelIdrequest(customPayload: ChannelIdrequest | any = {}): Promise<ChannelIdrequest> {
    return new Promise((resolve, reject) => {
      let payload: ChannelIdrequest = {
        pageId: customPayload?.pageId || 'na',
        moduleId: customPayload?.moduleId || this.moduleId || 'na',
        recordId: customPayload?.recordId || this.recordId || 'na',
        crId: customPayload?.crId || this.crId || 'na',
        schemaId: customPayload?.schemaId || this.schemaId || 'na',
        massId: customPayload?.massId || this.massId || 'na',
      };

      try {
        for (let prop = 0; prop < 10; prop++) {
          const customProps = customPayload[`customProp${prop + 1}`];
          payload[`customProp${prop + 1}`] = customProps? customProps : this.customProps[prop] || 'na';
        }
      } catch (error) {
        reject(error);
      }

      resolve(payload);
    });
  }

  /**
   * Method to get all the previous messages
   * based on user details, schema and module id
   */
  getChannelIdAndMessageHistory(payload: ChannelIdrequest): void {
    this.getOrCreateChannelId(payload).subscribe(
      (res: any) => {
        if (res?.channelId) {
          this.currentChannelId = res.channelId;
          this.getMessages(res.channelId);
          this.subscribeToChannel(res.channelId);
          this.websocketService._activeUsers(res.channelId);
        } else {
          console.error(`Error getting channel id: `, res);
        }
      },
      (error: HttpErrorResponse) => {
        console.log('Error while requesting channel id', error);
      }
    );
  }

  /**
   * Subscribe to a channel using channel ID
   * @param channelId pass the channel ID
   */
  subscribeToChannel(channelId: string): void {
    this.websocketService.subscribePublic(channelId);
    this.websocketService._messages().subscribe((message) => {
      const parsed = JSON.parse(JSON.parse(message));
      if(parsed?.id) {
        // Important because using Onpush strategy in scrollable messages container component
        const currentMessage: MessageDetails = this.formatMessage(parsed);

        if(currentMessage?.replyFor) {
          // If reply for is present then find the parent message and add the reply to it
          const parentMessage = this.messages.find((message) => message.id === currentMessage.replyFor);
          if(parentMessage) {
            currentMessage.quotedMessage = parentMessage;
            this.messages = [...this.messages, currentMessage];
          }
        } else {
          const messages = [...this.messages, currentMessage];
          this.messages = [];

          messages.forEach((message) => {
            if(!this.messages.find((msg) => msg.id === message.id)) {
              this.messages = [...this.messages, message];
            }
          });
        }
      }
    });
  }

  /**
   * Format incoming raw message
   * @param message incoming message
   * @returns formatted messaage of type MessageDetails
   */
  formatMessage(message: RawMessageObject): MessageDetails {
    const formattedMessage = new MessageDetails();
    const attachmentsList = getMessageAttachments(message.msg);

    if (message?.id) {
      formattedMessage.id = message?.id;
    }
    if (message?.msg) {
      formattedMessage.text = this.editorService.quillGetHTML(this.deltaParserService.unparse([message?.msg]));
    }
    if (message?.date) {
      formattedMessage.time = this.datePipe.transform(message.date, 'hh:mm a');
    }
    if (message?.date) {
      formattedMessage.date = typeof message.date === 'string'? Date.parse(message.date): message.date;
    }
    if (message?.fromUserId) {
      formattedMessage.fromUserId = message?.fromUserId;
    }
    if (message?.deleted) {
      formattedMessage.deleted = message?.deleted;
    }
    if (message?.edited) {
      formattedMessage.edited = message?.edited;
    }
    if (message?.replyFor) {
      formattedMessage.replyFor = message?.replyFor;
    }
    if (message?.replyForMsg) {
      formattedMessage.replyForMsg = message.replyForMsg;
    }
    if (message?.fromUserInfo) {
      formattedMessage.fromUserInfo = this.addFromUserInfo(message?.fromUserInfo);
    }
    if (message?.senderMessageId) {
      formattedMessage.senderMessageId = message?.senderMessageId;
    }
    if (message?.senderImage) {
      formattedMessage.senderImage = message?.senderImage;
    }
    if (message?.senderName || message?.fromUserId) {
      formattedMessage.senderName = message?.senderName || message?.fromUserId;
    }

    if (message?.userId) {
      formattedMessage.userId = message?.userId;
    }
    if (message?.channelId) {
      formattedMessage.channelId = message?.channelId;
    }
    if (message?.msg) {
      formattedMessage.rawMsg = message?.msg;
    }
    if (message?.toUserId) {
      formattedMessage.toUserId = message?.toUserId;
    }
    if (message?.toUserInfo) {
      formattedMessage.toUserInfo = message?.toUserInfo;
    }
    if (message?.sortValues) {
      formattedMessage.sortValues = message?.sortValues;
    }
    if (message?.public) {
      formattedMessage.public = message?.public;
    }

    formattedMessage.messageType = message?.msg?.type;

    if (attachmentsList?.length) {
      formattedMessage.attachmentType = 'file';
      formattedMessage.attachmentText = message?.attachmentText || '';
      formattedMessage.attachments = attachmentsList;
    }

    return formattedMessage;
  }

  addFromUserInfo(userInfo: any) {
    let username = '';
    if (userInfo?.fname && userInfo?.fname !== 'null') {
      username += userInfo?.fname + ' ';
    }
    if (userInfo?.lname && userInfo?.lname !== 'null') {
      username += userInfo?.lname;
    }
    if (
      userInfo?.userName &&
      userInfo?.fname === 'null' &&
      userInfo?.lname === 'null' &&
      userInfo?.userName !== 'null'
    ) {
      username += userInfo?.userName;
    }
    const userDetails = {
      senderImage: userInfo?.avtarURL !== 'null' ? userInfo?.avtarURL : '',
      senderName: username,
    };

    return userDetails;
  }

  /**
   * make an api call to get all the messages
   * @param channelId pass the channel Id
   * @param pagination pass the pagination object
   */
  getMessages(channelId: string, pagination: MessagePagination = null): void {
    if (pagination && !isEqual(this.pagination, pagination)) {
      this.pagination = pagination;
    }

    const payload: any = { channelId, ...this.pagination };
    this.chatStore.dispatch(loadMessages(payload));
  }

  /**
   * get channel id
   * @param payload ChannelIdrequest
   * @returns Observable<any>
   */
  getOrCreateChannelId(payload: ChannelIdrequest): Observable<any> {
    console.log('calling get or create channel Id with payload: ', payload);
    return new Observable((observer) => {
      this.chatService.getOrCreateChannelId(payload).subscribe(
        (res) => {
          observer.next(res);
          observer.complete();
        },
        (err) => {
          console.error(`Error getting channel id: ${err}`);
          observer.error(err);
          observer.complete();
        }
      );
    });
  }

  /**
   * Get the currently logged in user details
   * @returns Observable<UserPersonalDetails | null>
   */
  getUserDetails(): Observable<UserPersonalDetails | null> {
    console.log('getting user details');
    return new Observable((observer) => {
      this.userService.getUserPersonalDetails().subscribe(
        (res: UserPersonalDetails) => {
          if (!!res) {
            observer.next(res);
          } else {
            observer.next(null);
          }
          observer.complete();
        },
        (err) => {
          observer.next(null);
          console.error(`Error getting User Details: ${err}`);
          observer.complete();
        }
      );
    });
  }

  /**
   * Initialize the socket connection
   * @returns Observable<WebsocketConnectionStatus>
   */
  initiateSocketConnection(): Observable<WebsocketConnectionStatus> {
    return new Observable((observer) => {
      this.chatService.jwtLogin().subscribe(
        (res: any) => {
          this.websocketService._connect().subscribe(
            (response: WebsocketConnectionStatus) => {
              observer.next(response);
              observer.complete();
            },
            (err) => {
              observer.error(err);
              observer.complete();
            }
          );
        },
        (error) => {
          observer.error(error);
          observer.complete();
        }
      );
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.crId?.currentValue) {
      this.crId = changes.crId.currentValue;
    }
    if(changes.massId?.currentValue) {
      this.massId = changes.massId.currentValue;
    }
    if(changes.recordId?.currentValue) {
      this.recordId = changes.recordId.currentValue;
    }
    if(changes.customProps?.currentValue?.length) {
      this.customProps = changes.customProps.currentValue;
    }
  }
}
