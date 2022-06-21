import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ChatService } from '@services/chat/chat.service';
import { WebsocketService } from '@services/chat/websocket.service';
import { Subscription } from 'rxjs';
import { Message } from '@models/chat/message.model';
import { DatePipe } from '@angular/common';
import { findIndex, sortBy } from 'lodash';
import { BlockElementTypes, DeltaParserService, EditorService } from 'mdo-ui-library';
import { UserService } from '@services/user/userservice.service';
import { UserPersonalDetails } from '@models/userdetails';
import { environment } from '../../../../../../environments/environment';
import { UserProfileService } from '@services/user/user-profile.service';
import { DmsService } from '@services/dms/dms.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'pros-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss', '../chat.component.scss'],
})
export class MessageListComponent implements OnInit, OnDestroy, OnChanges {
  messageList: Message[] = [];
  fieldsPageIndex = 0;
  msgFetchCount = 50;
  subscription: Subscription = new Subscription();
  formattedMessageList = [];
  todayDate = new Date();
  textLimit = 200;
  currentChannelId = '';
  @Output()
  channelIdEmit: EventEmitter<string> = new EventEmitter();
  @Output()
  replyToMessageEmit: EventEmitter<any> = new EventEmitter();
  userdetails: UserPersonalDetails;
  allMessagesChannelId = '';
  @ViewChild('messageListContainer') public messageListContainer: ElementRef;
  isLoaderVisible = true;
  @Input() showReplyMessage: boolean;
  moduleId = 'na';
  schemaId = 'na';
  isPreviousMessageLoading = true;

  constructor(
    public chatService: ChatService,
    public datepipe: DatePipe,
    public deltaParserService: DeltaParserService,
    public editorService: EditorService,
    public websocketService: WebsocketService,
    public userService: UserService,
    public userProfileService: UserProfileService,
    private dmsService: DmsService,
    private activatedRoute: ActivatedRoute
  ) {
    // once websocket connected get channel
  }

  addNewMessageToMsgList() {
    this.subscription.add(
      this.websocketService.messages.subscribe((res) => {
        if (res) {
          const messageRes = JSON.parse(JSON.parse(res));
          if (!messageRes.deleted && !messageRes.edited) {
            this.messageList.push(messageRes);
            this.formatMessages(false);
          }

          if (messageRes.deleted) {
            this.updateMsg(messageRes, 'deleted', false);
          }

          if (messageRes.edited && !messageRes.deleted) {
            this.updateMsg(messageRes, 'edited', true);
          }
        }
      })
    );
  }

  updateMsg(messageRes, key, isMsgTextUpdate) {
    this.updateMsgList(messageRes, key, isMsgTextUpdate);
    this.updateFormattedMsgList(messageRes, key, isMsgTextUpdate);
  }

  updateMsgList(messageRes, key, isMsgTextUpdate) {
    this.messageList.forEach((message) => {
      if (message.id === messageRes.id) {
        message[key] = true;
        if (isMsgTextUpdate) {
          message.msg = messageRes.msg;
        }
      }
    });
  }

  updateFormattedMsgList(messageRes, key, isMsgTextUpdate) {
    this.formattedMessageList.forEach((formattedMsg) => {
      formattedMsg.messageDetails.forEach((element) => {
        if (element.messageId === messageRes.id) {
          element[key] = true;
          if (isMsgTextUpdate) {
            const messageText = this.editorService.quillGetHTML(this.deltaParserService.unparse([messageRes.msg]));
            element.msg = messageRes.msg;
            element.isEdit = false;
            element.messageText = messageText;
            element.isShowViewMoreBtn = this.showViewMoreBtn(messageText);
            element.isShowExtraText = false;
          }
        }
      });
    });
  }

  ngOnInit(): void {
    this.subscription.add(
      this.userService.getUserPersonalDetails().subscribe((res) => {
        this.userdetails = res;
        this.processSocketConnection();
        this.getPreviousMessages();
      })
    );

    this.subscription.add(
      this.activatedRoute.params.subscribe((params) => {
        this.moduleId = params.moduleId;
        this.schemaId = params.id;
      })
    );

    this.subscription.add(
      this.websocketService.connectStatusSubject.subscribe((res) => {
        if (res) {
          this.getOrCreateChannelId();
        }
      })
    );
    this.addNewMessageToMsgList();
  }

  getPreviousMessages() {
    const payload = {
      fqdn: environment.apiurl,
      tenantId: this.userdetails.profileKey ? this.userdetails.profileKey.tenantId : 0,
      pageId: 'na',
      moduleId: this.moduleId,
      recordId: 'na',
      crId: 'na',
      schemaId: this.schemaId,
      massId: 'na',
      customProp1: 'na',
      customProp2: 'na',
      customProp3: 'na',
      customProp4: 'na',
      customProp5: 'na',
      customProp6: 'na',
      customProp7: 'na',
      customProp8: 'na',
      customProp9: 'na',
      customProp10: 'na',
    };
    this.subscription.add(
      this.chatService.getChannelId(payload).subscribe((res) => {
        this.allMessagesChannelId = res.channelId;
        this.isPreviousMessageLoading = false;
        this.getAllMessages(false);
      },
      (error: any) => {
        this.isPreviousMessageLoading = false;
        console.log('Error occure in loading previous messages: ', error);
      }
      )
    );
  }

  processSocketConnection() {
    this.subscription.add(
      this.chatService.jwtLogin().subscribe(
        () => {
          this.websocketService._connect();
        },
        (error) => {
          console.log(error);
        }
      )
    );
  }

  // once connected to socket create or subscribe to public channel here channel id will be returned
  getOrCreateChannelId() {
    const payload = {
      fqdn: environment.apiurl,
      tenantId: this.userdetails.profileKey ? this.userdetails.profileKey.tenantId : 0,
      pageId: 'na',
      moduleId: this.moduleId || 'na',
      recordId: 'MAT101',
      crId: 'na',
      schemaId: this.schemaId || 'na',
      massId: 'na',
      customProp1: 'na',
      customProp2: 'na',
      customProp3: 'na',
      customProp4: 'na',
      customProp5: 'na',
      customProp6: 'na',
      customProp7: 'na',
      customProp8: 'na',
      customProp9: 'na',
      customProp10: 'na',
    };
    this.subscription.add(
      this.chatService.getOrCreateChannelId(payload).subscribe(
        (res: any) => {
          this.currentChannelId = res.channelId;
          this.channelIdEmit.emit(this.currentChannelId);
          this.websocketService.subscribePublic(this.currentChannelId);
        },
        (error) => {
          console.error('Error in getOrCreateChannelId ::-> ', error);
        }
      )
    );
  }

  /**
   * get all message list
   * @param loadMore to load more or not
   */
  getAllMessages(loadMore: boolean) {
    if (loadMore) {
      this.fieldsPageIndex++;
    } else {
      this.fieldsPageIndex = 0;
    }
    const payload = {
      channelId: this.allMessagesChannelId,
      searchAfter: [],
      fetchCount: this.fieldsPageIndex,
      fetchSize: this.msgFetchCount,
    };
    this.subscription.add(
      this.chatService.getAllMessages(payload).subscribe(
        (res) => {
          if (res && res.length !== 0) {
            this.messageList = res.concat(this.messageList);
            this.formatMessages(loadMore);
          } else if (this.fieldsPageIndex > 0) {
            this.fieldsPageIndex--;
          }
        },
        (error) => {
          console.error(`Error : ${error.message}`);
        }
      )
    );
  }

  // format messages from message list to bind with chat groups and change date formatting
  formatMessages(loadMore) {
    this.formattedMessageList = [];
    // order messages by date to set latest one at bottom
    this.messageList = sortBy(this.messageList, (o) => Date.parse(o.date));
    // based on multiple dates create a chat group and if date already exists in formattedmessage array do not enter new group
    this.messageList.forEach((message) => {
      if (message.isUnread) {
        // for today's date create a group with 'Today' marking
        this.formattedMessageList.push({
          date: 'New',
          messageDetails: [],
        });
      } else if (
        new Date(message.date).setHours(0, 0, 0, 0) === this.todayDate.setHours(0, 0, 0, 0) &&
        new Date(message.date).getFullYear() === this.todayDate.getFullYear() &&
        findIndex(this.formattedMessageList, (m) => {
          return m.date === 'Today';
        }) < 0
      ) {
        // for today's date create a group with 'Today' marking
        this.formattedMessageList.push({
          date: 'Today',
          messageDetails: [],
        });
      } else if (
        new Date(message.date).setHours(0, 0, 0, 0) !== this.todayDate.setHours(0, 0, 0, 0) &&
        new Date(message.date).getFullYear() === this.todayDate.getFullYear() &&
        findIndex(this.formattedMessageList, (m) => {
          return m.date === this.datepipe.transform(message.date, 'dd MMM');
        }) < 0
      ) {
        this.formattedMessageList.push({
          date: this.datepipe.transform(message.date, 'dd MMM'),
          messageDetails: [],
        });
      } else if (
        new Date(message.date).getFullYear() !== this.todayDate.getFullYear() &&
        findIndex(this.formattedMessageList, (m) => {
          return m.date === this.datepipe.transform(message.date, 'dd MMM y');
        }) < 0
      ) {
        this.formattedMessageList.push({
          date: this.datepipe.transform(message.date, 'dd MMM y'),
          messageDetails: [],
        });
      }
    });

    this.formattedMessageList.forEach((formattedMessage) => {
      this.messageList.forEach((message, i) => {
        if (
          (formattedMessage.date === 'New' && message.isUnread === true) ||
          formattedMessage.date === this.datepipe.transform(message.date, 'dd MMM') ||
          formattedMessage.date === this.datepipe.transform(message.date, 'dd MMM y') ||
          (formattedMessage.date === 'Today' && new Date(message.date).setHours(0, 0, 0, 0) === this.todayDate.setHours(0, 0, 0, 0))
        ) {
          const messageTextHTML = this.editorService.quillGetHTML(this.deltaParserService.unparse([message.msg]));
          const attachmentsList = this.getMessageAttachments(message);
          formattedMessage.messageDetails.push({
            messageUniqueId: message.id.replace(/-/g, ''),
            messageId: message.id,
            messageText: messageTextHTML,
            messageType: message.msg.type,
            senderImage: message.senderImage,
            senderName: message.senderName,
            time: this.datepipe.transform(message.date, 'hh:mm a'),
            attachement: attachmentsList,
            attachmentType: attachmentsList.length ? 'file' : message.attachmentType,
            attachmentText: message.attachmentText,
            fromUserId: message.fromUserId,
            isEdit: false,
            deleted: message.deleted,
            edited: message.edited,
            msg: message.msg,
            replyForMsg: !message.replyForMsg ? message.replyForMsg : this.addReplyForMsg(message.replyForMsg),
            isShowViewMoreBtn: this.showViewMoreBtn(messageTextHTML),
            isShowExtraText: false,
            fromUserInfo: this.addFromUserInfo(message.fromUserInfo),
          });
        }
      });
    });
    this.isLoaderVisible = false;
    if (!loadMore) {
      this.scrollToBottom();
    }
  }

  addFromUserInfo(userInfo) {
    let username = '';
    if (userInfo?.fname && userInfo?.fname !== 'null') {
      username += userInfo?.fname + ' ';
    }
    if (userInfo?.lname && userInfo?.lname !== 'null') {
      username += userInfo?.lname;
    }
    if (userInfo?.userName && userInfo?.fname === 'null' && userInfo?.lname === 'null' && userInfo?.userName !== 'null') {
      username += userInfo?.userName;
    }
    const userDetails = {
      senderImage: userInfo?.avtarURL !== 'null' ? userInfo?.avtarURL : '',
      senderName: username,
    };
    return userDetails;
  }

  /**
   * to check if we can show view more button for particular message
   * @param messageHTML current message HTML
   * @returns true/false
   */
  showViewMoreBtn(messageHTML) {
    const span = document.createElement('span');
    span.innerHTML = messageHTML;
    return span.innerText.length > this.textLimit ? true : false;
  }

  addReplyForMsg(replyMsg) {
    const messageTextHTML = this.editorService.quillGetHTML(this.deltaParserService.unparse([replyMsg.msg]));
    const replyMsgObj = {
      messageId: replyMsg.id,
      messageText: messageTextHTML,
      time: this.setReplyMsgDate(replyMsg.date),
      isTextTruncated: this.checkReplyMsgLength(messageTextHTML),
      fromUserInfo: this.addFromUserInfo(replyMsg.fromUserInfo),
    };
    return replyMsgObj;
  }

  checkReplyMsgLength(messageText) {
    const span = document.createElement('span');
    span.innerHTML = messageText;
    return span.innerText.length > 80 ? true : false;
  }

  setReplyMsgDate(msgDate) {
    if (new Date(msgDate).setHours(0, 0, 0, 0) === this.todayDate.setHours(0, 0, 0, 0)) {
      return 'Today';
    } else {
      return this.datepipe.transform(msgDate, 'd MMM');
    }
  }

  editMessage(message) {
    // setTimeout(() => {
    // let selectedMsg = document.getElementById(i);
    // selectedMsg.scrollIntoView();
    // }, 0);
    this.formattedMessageList.forEach((formattedMessage) => {
      const messageDetails = formattedMessage.messageDetails;
      this.initializeEditorBasedOnMsgId(message, messageDetails);
    });
  }

  initializeEditorBasedOnMsgId(message, messageDetails) {
    messageDetails.forEach((element) => {
      if (element.messageId !== message.messageId) {
        element.isEdit = false;
      } else {
        element.isEdit = true;
      }
    });
  }

  sendMessage(event) {
    const messageDetail = event.messageDetail;
    messageDetail.edited = true;
    const payload = {
      id: messageDetail.messageId,
      replyFor: '',
      deleted: messageDetail.deleted,
      edited: messageDetail.edited,
      channelId: this.currentChannelId,
      fromUserId: messageDetail.fromUserId,
      msg: event.messageDelta,
    };
    const tenantId = this.userdetails.profileKey ? this.userdetails.profileKey.tenantId : 0;
    this.websocketService._sendPublic(payload, tenantId);
    messageDetail.isEdit = false;
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const messageList = this.messageListContainer.nativeElement;
      messageList.scrollTop = messageList.scrollHeight;
    }, 100);
  }

  getMessageText(text: string) {
    return text === '<p></p>' || text === '<p><br></p>' ? '' : text;
  }

  deleteMessage(message) {
    const payload = {
      id: message.messageId,
      channelId: this.currentChannelId,
      fromUserId: message.fromUserId,
      msg: message.msg,
    };
    this.websocketService._deletePublic(payload);
  }

  /**
   * generate initals from sender name
   * @param senderName - user who has send message
   */
  getInitials(senderName) {
    let initals = '';
    const splitName = senderName.split(' ');
    splitName.forEach((m) => {
      initals += m.charAt(0);
    });
    return initals;
  }

  replyToMessage(messageData): void {
    this.replyToMessageEmit.emit(messageData);
  }

  getMessageAttachments(message) {
    const attachments = [];
    if (message.msg.elements) {
      const files = message.msg.elements.filter((el) => el.type === BlockElementTypes.LINK);
      files.forEach((file) => {
        attachments.push({
          sno: file.url.substr(0, 36),
          attachmentName: file.url.substr(36),
        });
      });
    }
    return attachments;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.showReplyMessage && changes.showReplyMessage.currentValue) {
      this.showReplyMessage = changes.showReplyMessage.currentValue;
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
