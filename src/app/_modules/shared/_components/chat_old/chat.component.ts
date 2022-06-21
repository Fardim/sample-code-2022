import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserPersonalDetails } from '@models/userdetails';
import { WebsocketService } from '@services/chat/websocket.service';
import { UserProfileService } from '@services/user/user-profile.service';
import { UserService } from '@services/user/userservice.service';
import { Subscription } from 'rxjs';
import { ChatService } from '@services/chat/chat.service';
import { Location } from '@angular/common';

@Component({
  selector: 'pros-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  editorInstance;
  subscription: Subscription = new Subscription();
  mentionList = [];
  sendButtonDisable = true;
  @ViewChild('chatContainer', { static: true, read: ElementRef }) chatContainer: ElementRef;
  currentChannelId = '';
  userDetails: UserPersonalDetails;
  replyMessageInfo;
  showReplyMessage = false;
  schemaId: string;

  constructor(
    public router: Router,
    public chatService: ChatService,
    public websocketService: WebsocketService,
    public userService: UserService,
    public userProfileService: UserProfileService,
    private activatedRoute: ActivatedRoute,
    private _location: Location
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.userService.getUserPersonalDetails().subscribe((res) => {
        this.userDetails = res;
      })
    );
    this.subscription.add(this.activatedRoute.params.subscribe(params => {
      this.schemaId = params.schemaId;
    }));
  }

  // send message and submit to Database
  sendMessage(event) {
    if (this.showReplyMessage) {
      this.replyMessage(event);
    } else {
      const payload = {
        channelId: this.currentChannelId,
        fromUserId: this.userDetails.profileKey.userName,
        msg: event.messageDelta,
      };
      const tenantId = this.userDetails?.profileKey ? this.userDetails?.profileKey?.tenantId : 0;
      this.websocketService._sendPublic(payload, tenantId);
    }
    this.sendButtonDisable = true;
  }

  replyMessage(event) {
    const payload = {
      id: '',
      replyFor: this.replyMessageInfo.messageId,
      deleted: false,
      edited: false,
      channelId: this.currentChannelId,
      fromUserId: this.userDetails.profileKey.userName,
      msg: event.messageDelta,
    };
    const tenantId = this.userDetails.profileKey ? this.userDetails.profileKey.tenantId : 0;
    this.websocketService._replyPublic(payload, tenantId);
    this.showReplyMessage = false;
  }

  /**
   * get updated channelId
   * @param channelId current channel Id received from backend
   */
  currentChannelIdReceived(channelId: string) {
    this.currentChannelId = channelId;
  }

  /**
   * closes digital signature sideSheet
   */
  close() {
    // this.router.navigate([{ outlets: { sb: `sb/settings`, outer: null } }], {
    //   queryParamsHandling: 'preserve',
    // });
    this._location.back();
    // this.router.navigate([`/home/schema/list/${this.schemaId}`])
  }

  replyToMessage(event) {
    this.showReplyMessage = true;
    this.replyMessageInfo = event;
  }

  scrollToBottom(event): void {
    this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
  }

  closeReplyMessagePopup() {
    this.showReplyMessage = false;
    this.sendButtonDisable = true;
  }

  // unsubscribe
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
