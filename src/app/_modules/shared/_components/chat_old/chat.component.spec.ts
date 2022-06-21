import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { WebsocketService } from '@services/chat/websocket.service';
import { UserService } from '@services/user/userservice.service';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ChatComponent } from './chat.component';
import { MessageEditorComponent } from './message-editor/message-editor.component';
import { MessageListComponent } from './message-list/message-list.component';
import { Location } from '@angular/common';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  let router: Router;
  let userService: UserService;
  let websocketService: WebsocketService;
  let loc: Location;
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
      declarations: [ChatComponent, MessageListComponent, MessageEditorComponent],
      imports: [RouterTestingModule, AppMaterialModuleForSpec, SharedModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    userService = fixture.debugElement.injector.get(UserService);
    websocketService = fixture.debugElement.injector.get(WebsocketService);
    router = TestBed.inject(Router);
    loc = fixture.debugElement.injector.get(Location);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(), should called ngOnInit', async () => {
    spyOn(userService, 'getUserPersonalDetails').and.returnValue(of(userDetails));

    component.ngOnInit();
    expect(userService.getUserPersonalDetails).toHaveBeenCalled();
    expect(component.userDetails).toEqual(userDetails);
  });

  it('currentChannelIdReceived, should set current Channel Id', () => {
    component.currentChannelIdReceived('055bfb7d-8818-4d1d-8667-29c63968e934');
    expect(component.currentChannelId).toEqual('055bfb7d-8818-4d1d-8667-29c63968e934');
  });

  it('replyToMessage, should set global reply message info', () => {
    const event = {messageUniqueId:'a990abdfe7f54c71b3d42bc74b77fc4a',messageId:'a990abdf-e7f5-4c71-b3d4-2bc74b77fc4a',messageText:'<p>324235</p>',messageType:'rich_text',time:'03:59 PM',fromUserId:'bhumirami133@gmail.com',isEdit:false,deleted:false,edited:false,msg:{type:'rich_text',elements:[{type:'text',elements:[{type:'text',elements:null,raw:null,text:'324235\n',style:null,userId:null,url:null,name:null,listIndent:0}],raw:null,text:null,style:{bold:false,italic:false,strike:false,code:false,underline:false,list:null},userId:null,url:null,name:null,listIndent:0}],raw:null,text:null,style:null,userId:null,url:null,name:null,listIndent:0},replyForMsg:null};
    component.replyToMessage(event);
    expect(component.showReplyMessage).toEqual(true);
    expect(component.replyMessageInfo).toEqual(event);
  });

  it('closeReplyMessagePopup, should close reply message popup', () => {
    component.closeReplyMessagePopup();
    expect(component.showReplyMessage).toEqual(false);
    expect(component.sendButtonDisable).toEqual(true);
  });

  it('close(), should close chat component', async () => {
    // spyOn(router, 'navigate');
    // component.close();
    // expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/settings`, outer: null } }], {
    //   queryParamsHandling: 'preserve',
    // });
    spyOn(loc, 'back');
    component.close();
    expect(loc.back).toHaveBeenCalled();
  });

  it('ngOnDestroy()', async () => {
    const subscriptionSpy = spyOn(component.subscription, 'unsubscribe').and.callFake(() => null);
    component.ngOnDestroy();
    expect(subscriptionSpy).toHaveBeenCalled();
  });

  it('sendMessage(), should send message', () => {
    const event = {
      messageDetail: undefined,
      messageDelta: {type:'rich_text',elements:[{type:'text',style:null,elements:[{type:'text',text:'test2\n',user_id:null,url:null}]}]}
    }
    const tenantId = userDetails.profileKey.tenantId;
    component.currentChannelId = 'a6f45d06-67d0-4adb-9621-f9ff59333b62';
    component.userDetails = userDetails;
    component.showReplyMessage = false;
    const payload = {
      channelId: component.currentChannelId,
      fromUserId: component.userDetails.profileKey.userName,
      msg: event.messageDelta,
    };
    spyOn(websocketService,'_sendPublic');
    component.sendMessage(event);
    expect(component.sendButtonDisable).toEqual(true);
    expect(websocketService._sendPublic).toHaveBeenCalledWith(payload,tenantId);
  });

  it('sendMessage(), should send called reply message method is reply message popup is open', () => {
    const event = {
      messageDetail: undefined,
      messageDelta: {type:'rich_text',elements:[{type:'text',style:null,elements:[{type:'text',text:'test2\n',user_id:null,url:null}]}]}
    }
    component.showReplyMessage = true;
    spyOn(component,'replyMessage');
    component.sendMessage(event);
    expect(component.sendButtonDisable).toEqual(true);
    expect(component.replyMessage).toHaveBeenCalledWith(event);
  });

  it('replyMessage(), should send called reply message method is reply message popup is open', () => {
    component.replyMessageInfo = {
      messageId: '9f15a7f8-2e8e-4dbe-a4ac-eff33e691a16'
    }
    component.currentChannelId = 'a6f45d06-67d0-4adb-9621-f9ff59333b62';
    component.userDetails = userDetails;
    const tenantId = userDetails.profileKey.tenantId;
    const event = {
      messageDetail: undefined,
      messageDelta: {type:'rich_text',elements:[{type:'text',style:null,elements:[{type:'text',text:'test2\n',user_id:null,url:null}]}]}
    }

    const payload = {
      id: '',
      replyFor: component.replyMessageInfo.messageId,
      deleted: false,
      edited: false,
      channelId: component.currentChannelId,
      fromUserId: component.userDetails.profileKey.userName,
      msg: event.messageDelta,
    };
    spyOn(websocketService,'_replyPublic');
    component.replyMessage(event);
    expect(component.showReplyMessage).toEqual(false);
    expect(websocketService._replyPublic).toHaveBeenCalledWith(payload,tenantId);
  });
});
