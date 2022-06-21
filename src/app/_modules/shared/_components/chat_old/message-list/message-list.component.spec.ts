import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { ChatService } from '@services/chat/chat.service';
import { WebsocketService } from '@services/chat/websocket.service';
import { UserService } from '@services/user/userservice.service';
import { BehaviorSubject, of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { environment } from '../../../../../../environments/environment';
import { MessageEditorComponent } from '../message-editor/message-editor.component';
import { MessageListComponent } from './message-list.component';

describe('MessageListComponent', () => {
  let component: MessageListComponent;
  let fixture: ComponentFixture<MessageListComponent>;
  // let userProfileService: UserProfileService;
  let chatService: ChatService;
  let websocketService: WebsocketService;
  let userService: UserService;

  const messageRes = {
    messageUniqueId: 'bbada6e33d7f49c9befc036cb595a172',
    messageId: 'bbada6e3-3d7f-49c9-befc-036cb595a172',
    messageText: '<p>sfsadf3435</p>',
    messageType: 'rich_text',
    time: '05:16 PM',
    fromUserId: 'bhumirami133@gmail.com',
    isEdit: false,
    deleted: false,
    edited: false,
    msg:
      {
        type: 'rich_text',
        elements:
          [
            {
              type: 'text',
              elements:
                [
                  {
                    type: 'text',
                    elements: null,
                    raw: null,
                    text: 'sfsadf3435\n',
                    style: null,
                    userId: null,
                    url: null,
                    name: null,
                    listIndent: 0,
                  },
                ],
              raw: null,
              text: null,
              style:
                {
                  bold: false,
                  italic: false,
                  strike: false,
                  code: false,
                  underline: false,
                  list: null,
                },
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
    replyForMsg: null,
  }

  const replyMsgRes = {
    id: '881d1a31-857f-4b6e-98d4-abe4f5cd3466',
    senderMessageId: 'null',
    replyFor: 'null',
    replyForMsg: null,
    deleted: false,
    edited: false,
    userId: 'cm.public',
    channelId: 'a6f45d06-67d0-4adb-9621-f9ff59333b62',
    date: '2021-09-21T10:53:00.710+00:00',
    rawMsg: 'null',
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
              text: 'wefew\n',
              style: null,
              userId: null,
              url: null,
              name: null,
              listIndent: 0,
            },
          ],
          raw: null,
          text: null,
          style: {
            bold: false,
            italic: false,
            strike: false,
            code: false,
            underline: false,
            list: null,
          },
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
    fromUserId: 'bhumirami133@gmail.com',
    toUserId: 'null',
    sortValues: [],
    public: true,
  };

  const dummyMessageList = [{
    id: 'bda7ae91-240e-4f87-8465-f2d205c2338e',
    replyFor: 'null',
    replyForMsg: null,
    deleted: false,
    edited: false,
    date: '2021-09-29T10:16:49.764+00:00',
    msg: {
        type: 'rich_text',
        elements: [{
            type: 'text',
            elements: [{
                type: 'text',
                elements: null,
                raw: null,
                text: 'test test 111\n',
                style: null,
                userId: null,
                url: null,
                name: null,
                listIndent: 0
            }],
            raw: null,
            text: null,
            style: null,
            userId: null,
            url: null,
            name: null,
            listIndent: 0
        }],
        raw: null,
        text: null,
        style: null,
        userId: null,
        url: null,
        name: null,
        listIndent: 0
    },
    fromUserId: 'bhumirami133@gmail.com',
    senderName: '',
    senderImage: '',
    attachmentType: '',
    attachmentText: '',
    attachmentList: [],
    isUnread: false,
    fromUserInfo: {

    }
  }]

  const userDetails = {
    name: '',
    avtarURL: null,
    digitalSignature: null,
    fb: null,
    fname: 'alex',
    linkedin: null,
    lname: 'fdf',
    mname: null,
    pemail: 'alex123@gmail.com',
    phone: 12222,
    profileKey: {
      userName: 'bhumirami133@gmail.com',
      tenantId: '0'
    },
    publicName: 'publicName',
    semail: '',
    twitter: null
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MessageListComponent, MessageEditorComponent],
      providers: [HttpClientTestingModule, DatePipe, {
        provide: ActivatedRoute,
        useValue: {
          params: of({
            moduleId: '187',
            id: '1'
          }),
        },
      },],
      imports: [AppMaterialModuleForSpec, SharedModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageListComponent);
    component = fixture.componentInstance;
    // userProfileService = fixture.debugElement.injector.get(UserProfileService);
    chatService = fixture.debugElement.injector.get(ChatService);
    websocketService = fixture.debugElement.injector.get(WebsocketService);
    userService = fixture.debugElement.injector.get(UserService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('replyToMessage, should emit message Data', () => {
    spyOn(component.replyToMessageEmit, 'emit');
    component.replyToMessage(messageRes);
    expect(component.replyToMessageEmit.emit).toHaveBeenCalledWith(messageRes);
  });

  it('ngOnDestroy()', async () => {
    const subscriptionSpy = spyOn(component.subscription, 'unsubscribe').and.callFake(() => null);
    component.ngOnDestroy();
    expect(subscriptionSpy).toHaveBeenCalled();
  });

  it('deleteMessage, should delete the selected message', () => {
    component.currentChannelId = 'a6f45d06-67d0-4adb-9621-f9ff59333b62';
    const payload = {
      id: messageRes.messageId,
      channelId: component.currentChannelId,
      fromUserId: messageRes.fromUserId,
      msg: messageRes.msg,
    };

    component.currentChannelId = 'a6f45d06-67d0-4adb-9621-f9ff59333b62';
    spyOn(websocketService, '_deletePublic');
    component.deleteMessage(messageRes);
    expect(websocketService._deletePublic).toHaveBeenCalledWith(payload);
  });

  it('setReplyMsgDate, should set reply message date to given date', () => {
    component.todayDate = new Date();
    const msgDate = '2021-09-22T06:16:28.016+00:00';
    const replyMsgDate = component.setReplyMsgDate(msgDate);
    component.replyToMessage(messageRes);
    expect(replyMsgDate).toEqual('22 Sep');
  });

  it('setReplyMsgDate, should set reply message date to today', () => {
    component.todayDate = new Date();
    const msgDate = new Date();
    const replyMsgDate = component.setReplyMsgDate(msgDate);
    component.replyToMessage(messageRes);
    expect(replyMsgDate).toEqual('Today');
  });

  it('getAllMessages, should initially called get messages from ngOninit', () => {
    component.allMessagesChannelId = 'a6f45d06-67d0-4adb-9621-f9ff59333b62';
    spyOn(chatService, 'getAllMessages').and.returnValue(of([replyMsgRes]));
    spyOn(component, 'formatMessages');
    const payload = {
      channelId: component.allMessagesChannelId,
      searchAfter: [],
      fetchCount: 0,
      fetchSize: 50
    };

    component.getAllMessages(false);
    expect(component.fieldsPageIndex).toEqual(0);
    expect(chatService.getAllMessages).toHaveBeenCalledWith(payload);
    expect(component.formatMessages).toHaveBeenCalledWith(false);
  });

  it('getAllMessages, should get messages from list id if res is blank from getMessage API', () => {
    component.allMessagesChannelId = 'a6f45d06-67d0-4adb-9621-f9ff59333b62';
    component.fieldsPageIndex = 0;
    spyOn(chatService, 'getAllMessages').and.returnValue(of([]));
    spyOn(component, 'formatMessages');
    const payload = {
      channelId: component.allMessagesChannelId,
      searchAfter: [],
      fetchCount: 1,
      fetchSize: 50
    };

    component.getAllMessages(true);
    expect(component.fieldsPageIndex).toEqual(0);
    expect(chatService.getAllMessages).toHaveBeenCalledWith(payload);
  });

  it('getAllMessages, should called get messages from list to get Old messages', () => {
    component.allMessagesChannelId = 'a6f45d06-67d0-4adb-9621-f9ff59333b62';
    component.fieldsPageIndex = 0;
    spyOn(chatService, 'getAllMessages').and.returnValue(of([replyMsgRes]));
    spyOn(component, 'formatMessages');
    const payload = {
      channelId: component.allMessagesChannelId,
      searchAfter: [],
      fetchCount: 1,
      fetchSize: 50
    };

    component.getAllMessages(true);
    expect(component.fieldsPageIndex).toEqual(1);
    expect(chatService.getAllMessages).toHaveBeenCalledWith(payload);
    expect(component.formatMessages).toHaveBeenCalledWith(true);
  });

  it('addReplyForMsg, should add replyMsgObj in messages', () => {
    const payload = {
      messageId: replyMsgRes.id,
      messageText: '<p>wefew</p>',
      time: '21 Sep',
      isTextTruncated: false,
      fromUserInfo: {
        senderImage: undefined,
        senderName: ''
      }
    }
    const replyMsgData = component.addReplyForMsg(replyMsgRes);
    expect(replyMsgData).toEqual(payload);
  })

  it('getOrCreateChannelId, should add or create channel id', () => {
    component.userdetails = userDetails;
    const payload = {
      fqdn: environment.apiurl,
      tenantId: '0',
      pageId: 'na',
      moduleId: '187',
      recordId: 'MAT101',
      crId: 'na',
      schemaId: '1',
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
      customProp10: 'na'
    }

    const currentChannelId = 'a6f45d06-67d0-4adb-9621-f9ff59333b62';
    spyOn(component.channelIdEmit, 'emit');
    spyOn(websocketService, 'subscribePublic');
    spyOn(chatService,'getOrCreateChannelId').and.returnValue(of({channelId: 'a6f45d06-67d0-4adb-9621-f9ff59333b62'}));

    component.getOrCreateChannelId();
    expect(chatService.getOrCreateChannelId).toHaveBeenCalledWith(payload);
    expect(component.currentChannelId).toEqual(currentChannelId);
    expect(component.channelIdEmit.emit).toHaveBeenCalledWith(currentChannelId);
    expect(websocketService.subscribePublic).toHaveBeenCalledWith(currentChannelId);
  })

  it('getPreviousMessages, should get previous message', () => {
    component.userdetails = userDetails;
    const payload = {
      fqdn: environment.apiurl,
      tenantId: '0',
      pageId: 'na',
      moduleId: '187',
      recordId: 'na',
      crId: 'na',
      schemaId: '1',
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
      customProp10: 'na'
    }

    const currentChannelId = 'a6f45d06-67d0-4adb-9621-f9ff59333b62';
    spyOn(chatService,'getChannelId').and.returnValue(of({channelId: 'a6f45d06-67d0-4adb-9621-f9ff59333b62'}));
    spyOn(component,'getAllMessages');

    component.getPreviousMessages();
    expect(chatService.getChannelId).toHaveBeenCalledWith(payload);
    expect(component.allMessagesChannelId).toEqual(currentChannelId);
    expect(component.getAllMessages).toHaveBeenCalledWith(false);
  })

  it('showViewMoreBtn, should show view more button if message text length is grater than 500', () => {
    component.textLimit = 500;
    const messageHTML = '<p>test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test</p>';
    const showMsgBtn = component.showViewMoreBtn(messageHTML);
    expect(showMsgBtn).toEqual(true);
  })

  it('showViewMoreBtn, should hide view more button if message text length is less than 500', () => {
    component.textLimit = 500;
    const messageHTML = '<p>test test test tes test test test test test tes test tes test test test test test test test test test tes test test</p>';
    const showMsgBtn = component.showViewMoreBtn(messageHTML);
    expect(showMsgBtn).toEqual(false);
  })

  it('addNewMessageToMsgList, should add Newly created message to message list', () => {
    const res1 = '\"{\\\"id\\\":\\\"709f3f83-714d-4438-ba8f-b8ef503a3b15\\\",\\\"senderMessageId\\\":null,\\\"replyFor\\\":null,\\\"replyForMsg\\\":null,\\\"deleted\\\":false,\\\"edited\\\":false,\\\"userId\\\":\\\"cm.public\\\",\\\"channelId\\\":\\\"a6f45d06-67d0-4adb-9621-f9ff59333b62\\\",\\\"date\\\":\\\"2021-09-29T09:45:50.602+00:00\\\",\\\"rawMsg\\\":null,\\\"msg\\\":{\\\"type\\\":\\\"rich_text\\\",\\\"elements\\\":[{\\\"type\\\":\\\"text\\\",\\\"elements\\\":[{\\\"type\\\":\\\"text\\\",\\\"elements\\\":null,\\\"raw\\\":null,\\\"text\\\":\\\"test\\\\n\\\",\\\"style\\\":null,\\\"userId\\\":null,\\\"url\\\":null,\\\"name\\\":null,\\\"listIndent\\\":0}],\\\"raw\\\":null,\\\"text\\\":null,\\\"style\\\":null,\\\"userId\\\":null,\\\"url\\\":null,\\\"name\\\":null,\\\"listIndent\\\":0}],\\\"raw\\\":null,\\\"text\\\":null,\\\"style\\\":null,\\\"userId\\\":null,\\\"url\\\":null,\\\"name\\\":null,\\\"listIndent\\\":0},\\\"fromUserId\\\":\\\"bhumirami133@gmail.com\\\",\\\"toUserId\\\":null,\\\"sortValues\\\":null,\\\"public\\\":true}\"';
    const messageRes1 = JSON.parse(JSON.parse(res1));
    websocketService.messages = new BehaviorSubject<any>(res1);
    spyOn(component,'formatMessages');
    component.addNewMessageToMsgList();
    websocketService.messages.subscribe((res) => {
      expect(component.formatMessages).toHaveBeenCalledWith(false);
      expect(component.messageList).toEqual([messageRes1]);
    })
  })

  it('addNewMessageToMsgList, should call updateMsg frunciton with deleted key', () => {
    const res1 = '\"{\\\"id\\\":\\\"98e750df-1c77-41d8-a444-e2c474082222\\\",\\\"senderMessageId\\\":\\\"null\\\",\\\"replyFor\\\":\\\"null\\\",\\\"replyForMsg\\\":null,\\\"deleted\\\":true,\\\"edited\\\":false,\\\"userId\\\":\\\"cm.public\\\",\\\"channelId\\\":\\\"a6f45d06-67d0-4adb-9621-f9ff59333b62\\\",\\\"date\\\":\\\"2021-09-29T09:38:11.670+00:00\\\",\\\"rawMsg\\\":\\\"null\\\",\\\"msg\\\":{\\\"type\\\":\\\"rich_text\\\",\\\"elements\\\":[{\\\"type\\\":\\\"text\\\",\\\"elements\\\":[{\\\"type\\\":\\\"text\\\",\\\"elements\\\":null,\\\"raw\\\":null,\\\"text\\\":\\\"test\\\\n\\\",\\\"style\\\":null,\\\"userId\\\":null,\\\"url\\\":null,\\\"name\\\":null,\\\"listIndent\\\":0}],\\\"raw\\\":null,\\\"text\\\":null,\\\"style\\\":null,\\\"userId\\\":null,\\\"url\\\":null,\\\"name\\\":null,\\\"listIndent\\\":0}],\\\"raw\\\":null,\\\"text\\\":null,\\\"style\\\":null,\\\"userId\\\":null,\\\"url\\\":null,\\\"name\\\":null,\\\"listIndent\\\":0},\\\"fromUserId\\\":\\\"bhumirami133@gmail.com\\\",\\\"toUserId\\\":\\\"null\\\",\\\"sortValues\\\":[],\\\"public\\\":true}\"';
    const messageRes1 = JSON.parse(JSON.parse(res1));
    websocketService.messages = new BehaviorSubject<any>(res1);
    spyOn(component,'updateMsg');
    component.addNewMessageToMsgList();
    websocketService.messages.subscribe((res) => {
      expect(component.updateMsg).toHaveBeenCalledWith(messageRes1, 'deleted', false);
    })
  })

  it('addNewMessageToMsgList, should call updateMsg frunciton with edited key', () => {
    const res1 = '\"{\\\"id\\\":\\\"bda7ae91-240e-4f87-8465-f2d205c2338e\\\",\\\"senderMessageId\\\":null,\\\"replyFor\\\":\\\"null\\\",\\\"replyForMsg\\\":null,\\\"deleted\\\":false,\\\"edited\\\":true,\\\"userId\\\":\\\"cm.public\\\",\\\"channelId\\\":\\\"a6f45d06-67d0-4adb-9621-f9ff59333b62\\\",\\\"date\\\":\\\"2021-09-29T10:05:16.248+00:00\\\",\\\"rawMsg\\\":null,\\\"msg\\\":{\\\"type\\\":\\\"rich_text\\\",\\\"elements\\\":[{\\\"type\\\":\\\"text\\\",\\\"elements\\\":[{\\\"type\\\":\\\"text\\\",\\\"elements\\\":null,\\\"raw\\\":null,\\\"text\\\":\\\"test test\\\\n\\\",\\\"style\\\":null,\\\"userId\\\":null,\\\"url\\\":null,\\\"name\\\":null,\\\"listIndent\\\":0}],\\\"raw\\\":null,\\\"text\\\":null,\\\"style\\\":null,\\\"userId\\\":null,\\\"url\\\":null,\\\"name\\\":null,\\\"listIndent\\\":0}],\\\"raw\\\":null,\\\"text\\\":null,\\\"style\\\":null,\\\"userId\\\":null,\\\"url\\\":null,\\\"name\\\":null,\\\"listIndent\\\":0},\\\"fromUserId\\\":\\\"bhumirami133@gmail.com\\\",\\\"toUserId\\\":\\\"null\\\",\\\"sortValues\\\":null,\\\"public\\\":true}\"';
    const messageRes1 = JSON.parse(JSON.parse(res1));
    websocketService.messages = new BehaviorSubject<any>(res1);
    spyOn(component,'updateMsg');
    component.addNewMessageToMsgList();
    websocketService.messages.subscribe((res) => {
      expect(component.updateMsg).toHaveBeenCalledWith(messageRes1, 'edited', true);
    })
  })

  it('updateMsg, should call function to update message list and formatted message list with deleted key', () => {
    const res1 = '\"{\\\"id\\\":\\\"98e750df-1c77-41d8-a444-e2c474082222\\\",\\\"senderMessageId\\\":\\\"null\\\",\\\"replyFor\\\":\\\"null\\\",\\\"replyForMsg\\\":null,\\\"deleted\\\":true,\\\"edited\\\":false,\\\"userId\\\":\\\"cm.public\\\",\\\"channelId\\\":\\\"a6f45d06-67d0-4adb-9621-f9ff59333b62\\\",\\\"date\\\":\\\"2021-09-29T09:38:11.670+00:00\\\",\\\"rawMsg\\\":\\\"null\\\",\\\"msg\\\":{\\\"type\\\":\\\"rich_text\\\",\\\"elements\\\":[{\\\"type\\\":\\\"text\\\",\\\"elements\\\":[{\\\"type\\\":\\\"text\\\",\\\"elements\\\":null,\\\"raw\\\":null,\\\"text\\\":\\\"test\\\\n\\\",\\\"style\\\":null,\\\"userId\\\":null,\\\"url\\\":null,\\\"name\\\":null,\\\"listIndent\\\":0}],\\\"raw\\\":null,\\\"text\\\":null,\\\"style\\\":null,\\\"userId\\\":null,\\\"url\\\":null,\\\"name\\\":null,\\\"listIndent\\\":0}],\\\"raw\\\":null,\\\"text\\\":null,\\\"style\\\":null,\\\"userId\\\":null,\\\"url\\\":null,\\\"name\\\":null,\\\"listIndent\\\":0},\\\"fromUserId\\\":\\\"bhumirami133@gmail.com\\\",\\\"toUserId\\\":\\\"null\\\",\\\"sortValues\\\":[],\\\"public\\\":true}\"';
    const messageRes1 = JSON.parse(JSON.parse(res1));
    spyOn(component,'updateMsgList');
    spyOn(component,'updateFormattedMsgList');

    component.updateMsg(messageRes1, 'deleted', false);
    expect(component.updateMsgList).toHaveBeenCalledWith(messageRes1, 'deleted', false);
    expect(component.updateFormattedMsgList).toHaveBeenCalledWith(messageRes1, 'deleted', false);
  })

  it('addNewMessageToMsgList, should call function to update message list and formatted message list with edited key', () => {
    const res1 = '\"{\\\"id\\\":\\\"bda7ae91-240e-4f87-8465-f2d205c2338e\\\",\\\"senderMessageId\\\":null,\\\"replyFor\\\":\\\"null\\\",\\\"replyForMsg\\\":null,\\\"deleted\\\":false,\\\"edited\\\":true,\\\"userId\\\":\\\"cm.public\\\",\\\"channelId\\\":\\\"a6f45d06-67d0-4adb-9621-f9ff59333b62\\\",\\\"date\\\":\\\"2021-09-29T10:05:16.248+00:00\\\",\\\"rawMsg\\\":null,\\\"msg\\\":{\\\"type\\\":\\\"rich_text\\\",\\\"elements\\\":[{\\\"type\\\":\\\"text\\\",\\\"elements\\\":[{\\\"type\\\":\\\"text\\\",\\\"elements\\\":null,\\\"raw\\\":null,\\\"text\\\":\\\"test test\\\\n\\\",\\\"style\\\":null,\\\"userId\\\":null,\\\"url\\\":null,\\\"name\\\":null,\\\"listIndent\\\":0}],\\\"raw\\\":null,\\\"text\\\":null,\\\"style\\\":null,\\\"userId\\\":null,\\\"url\\\":null,\\\"name\\\":null,\\\"listIndent\\\":0}],\\\"raw\\\":null,\\\"text\\\":null,\\\"style\\\":null,\\\"userId\\\":null,\\\"url\\\":null,\\\"name\\\":null,\\\"listIndent\\\":0},\\\"fromUserId\\\":\\\"bhumirami133@gmail.com\\\",\\\"toUserId\\\":\\\"null\\\",\\\"sortValues\\\":null,\\\"public\\\":true}\"';
    const messageRes1 = JSON.parse(JSON.parse(res1));
    spyOn(component,'updateMsgList');
    spyOn(component,'updateFormattedMsgList');

    component.updateMsg(messageRes1, 'edited', true);
    expect(component.updateMsgList).toHaveBeenCalledWith(messageRes1, 'edited', true);
    expect(component.updateFormattedMsgList).toHaveBeenCalledWith(messageRes1, 'edited', true);
  })

  it('updateMsgList, should update message\'s edited key and message text from message list', () => {
    component.messageList = dummyMessageList;
    const res1 = '\"{\\\"id\\\":\\\"bda7ae91-240e-4f87-8465-f2d205c2338e\\\",\\\"senderMessageId\\\":null,\\\"replyFor\\\":\\\"null\\\",\\\"replyForMsg\\\":null,\\\"deleted\\\":false,\\\"edited\\\":true,\\\"userId\\\":\\\"cm.public\\\",\\\"channelId\\\":\\\"a6f45d06-67d0-4adb-9621-f9ff59333b62\\\",\\\"date\\\":\\\"2021-09-29T10:18:43.162+00:00\\\",\\\"rawMsg\\\":null,\\\"msg\\\":{\\\"type\\\":\\\"rich_text\\\",\\\"elements\\\":[{\\\"type\\\":\\\"text\\\",\\\"elements\\\":[{\\\"type\\\":\\\"text\\\",\\\"elements\\\":null,\\\"raw\\\":null,\\\"text\\\":\\\"test test 1111\\\\n\\\",\\\"style\\\":null,\\\"userId\\\":null,\\\"url\\\":null,\\\"name\\\":null,\\\"listIndent\\\":0}],\\\"raw\\\":null,\\\"text\\\":null,\\\"style\\\":null,\\\"userId\\\":null,\\\"url\\\":null,\\\"name\\\":null,\\\"listIndent\\\":0}],\\\"raw\\\":null,\\\"text\\\":null,\\\"style\\\":null,\\\"userId\\\":null,\\\"url\\\":null,\\\"name\\\":null,\\\"listIndent\\\":0},\\\"fromUserId\\\":\\\"bhumirami133@gmail.com\\\",\\\"toUserId\\\":\\\"null\\\",\\\"sortValues\\\":null,\\\"public\\\":true}\"';
    const messageRes1 = JSON.parse(JSON.parse(res1));
    component.updateMsgList(messageRes1, 'edited', true);
    expect(component.messageList[0].edited).toEqual(true);
    expect(component.messageList[0].msg).toEqual(messageRes1.msg);
  })

  it('updateMsgList, should update message\'s deleted keyfrom message list', () => {
    component.messageList = dummyMessageList;
    const res1 = '\"{\\\"id\\\":\\\"bda7ae91-240e-4f87-8465-f2d205c2338e\\\",\\\"senderMessageId\\\":null,\\\"replyFor\\\":\\\"null\\\",\\\"replyForMsg\\\":null,\\\"deleted\\\":true,\\\"edited\\\":false,\\\"userId\\\":\\\"cm.public\\\",\\\"channelId\\\":\\\"a6f45d06-67d0-4adb-9621-f9ff59333b62\\\",\\\"date\\\":\\\"2021-09-29T10:18:43.162+00:00\\\",\\\"rawMsg\\\":null,\\\"msg\\\":{\\\"type\\\":\\\"rich_text\\\",\\\"elements\\\":[{\\\"type\\\":\\\"text\\\",\\\"elements\\\":[{\\\"type\\\":\\\"text\\\",\\\"elements\\\":null,\\\"raw\\\":null,\\\"text\\\":\\\"test test 1111\\\\n\\\",\\\"style\\\":null,\\\"userId\\\":null,\\\"url\\\":null,\\\"name\\\":null,\\\"listIndent\\\":0}],\\\"raw\\\":null,\\\"text\\\":null,\\\"style\\\":null,\\\"userId\\\":null,\\\"url\\\":null,\\\"name\\\":null,\\\"listIndent\\\":0}],\\\"raw\\\":null,\\\"text\\\":null,\\\"style\\\":null,\\\"userId\\\":null,\\\"url\\\":null,\\\"name\\\":null,\\\"listIndent\\\":0},\\\"fromUserId\\\":\\\"bhumirami133@gmail.com\\\",\\\"toUserId\\\":\\\"null\\\",\\\"sortValues\\\":null,\\\"public\\\":true}\"';
    const messageRes1 = JSON.parse(JSON.parse(res1));
    component.updateMsgList(messageRes1, 'deleted', false);
    expect(component.messageList[0].deleted).toEqual(true);
  })

  it('checkReplyMsgLength, should truncate message text if text length is grater than 80', () => {
    const messageHTML = '<p>test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test test test tes test test test test test tes test test test test test tes test test</p>';
    const showMsgBtn = component.checkReplyMsgLength(messageHTML);
    expect(showMsgBtn).toEqual(true);
  })

  it('checkReplyMsgLength, should not truncate message text if message text length is less than 80', () => {
    const messageHTML = '<p>test test test tes test</p>';
    const showMsgBtn = component.checkReplyMsgLength(messageHTML);
    expect(showMsgBtn).toEqual(false);
  })

  it('addFromUserInfo, should add from user info', () => {
    const fromUserInfo = {
      userName: 'Test1',
      avtarURL: 'avtarURL',
      fname: 'Test',
      lname: '1'
    }
    const senderUserDetails = {
      senderImage: 'avtarURL',
      senderName: 'Test 1'
    }
    const userInfo = component.addFromUserInfo(fromUserInfo);
    expect(userInfo).toEqual(senderUserDetails);
  })

  it('initializeEditorBasedOnMsgId, should initialized editor based on message id if message id is same', () => {
    const messageDetails = [messageRes];
    component.initializeEditorBasedOnMsgId(messageRes, messageDetails);
    expect(messageRes.isEdit).toEqual(true);
  })

  it('initializeEditorBasedOnMsgId, should not initialized editor based on message id if message id is different', () => {
    const message = {
      messageId: '709f3f83-714d-4438-ba8f-b8ef503a3b15',
      isEdit: false
    }
    const messageDetails = [messageRes];
    component.initializeEditorBasedOnMsgId(message, messageDetails);
    expect(messageDetails[0].isEdit).toBe(false);
  })

  it('ngOnInit(), should called ngOnInit', async () => {
    spyOn(userService, 'getUserPersonalDetails').and.returnValue(of(userDetails));
    spyOn(component,'processSocketConnection');
    spyOn(component,'getPreviousMessages');
    component.ngOnInit();
    expect(userService.getUserPersonalDetails).toHaveBeenCalled();
    expect(component.processSocketConnection).toHaveBeenCalled();
    expect(component.getPreviousMessages).toHaveBeenCalled();
    expect(component.userdetails).toEqual(userDetails);
  });

  it('formatMessages(), should initially scroll to last message ', async () => {
    spyOn(component,'scrollToBottom');
    component.formatMessages(false);
    expect(component.scrollToBottom).toHaveBeenCalled();
  });

  it('editMessage(), should called initializeEditorBasedOnMsgId method ', async () => {
    component.formattedMessageList = [{
      date: 'Today',
      messageDetails: [messageRes]
    }]
    spyOn(component,'initializeEditorBasedOnMsgId');
    component.editMessage(messageRes);
    expect(component.initializeEditorBasedOnMsgId).toHaveBeenCalledWith(messageRes,component.formattedMessageList[0].messageDetails);
  });

  it('sendMessage(), should send edited message', () => {
    const event = {
      messageDetail: messageRes,
      messageDelta: {type:'rich_text',elements:[{type:'text',style:null,elements:[{type:'text',text:'test2\n',user_id:null,url:null}]}]}
    }
    const tenantId = userDetails.profileKey.tenantId;
    component.userdetails = userDetails;
    const payload = {
      id: event.messageDetail.messageId,
      replyFor: '',
      deleted: event.messageDetail.deleted,
      edited: true,
      channelId: component.currentChannelId,
      fromUserId: event.messageDetail.fromUserId,
      msg: event.messageDelta,
    };
    spyOn(websocketService,'_sendPublic');
    component.sendMessage(event);
    expect(messageRes.edited).toEqual(true);
    expect(messageRes.isEdit).toEqual(false);
    expect(websocketService._sendPublic).toHaveBeenCalledWith(payload,tenantId);
  });

  it('getInitials(), should set initials if sender\'s image is not available', () => {
    const initials = component.getInitials('abc xyz');
    expect(initials).toEqual('ax');
  });
});