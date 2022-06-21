import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { UserPersonalDetails } from '@models/userdetails';
import { DateWiseMessageList, DeleteMessageRequest, MessageDetails } from '@modules/chat/_common/chat';
import { select, Store } from '@ngrx/store';
import { WebsocketService } from '@services/chat/websocket.service';
import { removeMessage } from '@store/actions/chat.action';
import { ChatState } from '@store/reducers/chat.reducer';
import { getMessagesLoadingState } from '@store/selectors/chat.selector';
import { sortBy } from 'lodash';
import * as moment from 'moment';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'pros-scrollable-messages-container',
  templateUrl: './scrollable-messages-container.component.html',
  styleUrls: ['./scrollable-messages-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
})
export class ScrollableMessagesContainerComponent implements OnInit, OnChanges, OnDestroy {
  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();
  /**
   * message MessageDetails[]
   * hold the messages recieved from the parent component
   */
  @Input() messages: MessageDetails[] = [];
  @Input() currentUser: UserPersonalDetails | null;
  @Input() channelId: string;

  /**
   * Reference to the bottom(hidden div) of the messages container
   */
  @ViewChild('scrollBottom') scrollBottom: ElementRef<any>;

  /**
   * Holds all the messages
   */
  allMessages: BehaviorSubject<MessageDetails[]> = new BehaviorSubject([]);

  /**
   * Holds all the messages categorised by date
   */
  formattedMessageList: DateWiseMessageList[] = [];
  messagesLoading: boolean = false;
  constructor(private datepipe: DatePipe, private websocketService: WebsocketService, private chatStore: Store<ChatState>) {}

  ngOnInit(): void {
    this.chatStore.pipe(takeUntil(this.unsubscribeAll$),select(getMessagesLoadingState)).subscribe((state) => {
      this.messagesLoading = state === 'loading';
    });

    this.allMessages.subscribe((messages: MessageDetails[]) => {
      this.formattedMessageList = [];
      if(messages.length > 0) {
        this.categoriseMessagesByDate([...messages]);
        this.autoScroll();
      }
    });

    if (this.messages?.length > 0) {
      this.allMessages.next([...this.messages]);
    }
  }

  /**
   * Categorize messages by date
   * @param messages DateWiseMessageList[]
   */
  categoriseMessagesByDate(messageList: MessageDetails[]): void {
    // Sort date wise
    messageList = sortBy(messageList, (message: MessageDetails) => message.date);

    // this gives an object with dates as keys
    const groups = messageList.reduce((groups, message) => {
      const dateString = moment(message?.date).format();
      const date = dateString? `${dateString}`.split('T')[0] : 'unknown';

      if(!groups[date]?.length) {
        groups[date] = [];
      }

      groups[date].push(message);

      return groups;
    }, {});

    // Edit: to add it in the array format instead
    const groupArrays: DateWiseMessageList[] = Object.keys(groups).map((date) => {
      return {
        date: this.getDateCategorylabel(date),
        messageDetails: groups[date],
      };
    });

    this.formattedMessageList = groupArrays;
  }

  /**
   * Return date label as New, Today, Yesterday, or date
   * based on the date string
   * @param date pass the date string
   */
  getDateCategorylabel(date: string): string {
    const today = new Date();
    const yesterday = new Date(today.setDate(today.getDate() - 1));
    const dateObj = new Date(date);

    if (this.getDateStringToMatch(dateObj) === this.getDateStringToMatch(today)) {
      return 'Today';
    } else if (this.getDateStringToMatch(dateObj) === this.getDateStringToMatch(yesterday)) {
      return 'Yesterday';
    } else if (this.getDateStringToMatch(dateObj) === this.getDateStringToMatch(new Date())) {
      return 'New';
    } else {
      return this.getDateStringToMatch(dateObj);
    }
  }

  /**
   * get date string in DD MMM YYYY format
   */
  getDateStringToMatch(date: Date) {
    let converted = null;
    try {
      converted = this.datepipe.transform(date, 'dd MMM');
    } catch (error) {
      converted = '';
    }
    return converted;
  }

  /**
   * Automatically scrolls the messages container to the bottom
   */
  autoScroll() {
    if (!this.messages.length) {
      return;
    }
    setTimeout(() => this.scrollBottom?.nativeElement.scrollIntoView({ behavior: 'auto' }), 50);
  }

  /**
   * delete selected message
   */
  deleteMessage(message: MessageDetails) {
    const payload: DeleteMessageRequest = {
      id: message?.id,
      channelId: this.channelId,
      fromUserId: message?.fromUserId,
      msg: message?.rawMsg,
    };

    this.websocketService._deletePublic(payload);
    this.chatStore.dispatch(removeMessage({ messageIdToRemove: message.id }));
  }

  /**
   * detect changes and update the messages
   * @param changes SimpleChanges
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.messages?.currentValue.length > 0) {
      this.messages = changes.messages.currentValue;
      this.allMessages.next([...changes.messages.currentValue]);
    }
    if (changes.currentUser?.currentValue) {
      this.currentUser = changes.currentUser.currentValue;
    }
    if (changes.channelId?.currentValue) {
      this.channelId = changes.channelId.currentValue;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
  }
}
