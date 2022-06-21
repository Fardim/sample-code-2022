import {
  AfterViewInit, ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, ComponentFactoryResolver,
  ComponentRef, ElementRef, EventEmitter, Input,
  OnChanges, OnDestroy, OnInit, Output,
  SimpleChanges, ViewChild
} from '@angular/core';
import { UserPersonalDetails } from '@models/userdetails';
import { EditorModes, MessageDetails, MessageSentEvent } from '@modules/chat/_common/chat';
import { ContainerRefDirective } from '@modules/shared/_directives/container-ref.directive';
import { select, Store } from '@ngrx/store';
import { State as ChatState } from '@store/models/chat.model';
import { getChannelId, getPagination } from '@store/selectors/chat.selector';
import { combineLatest, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { ChatEditorComponent } from '../chat-editor/chat-editor.component';

@Component({
  selector: 'pros-message-block',
  templateUrl: './message-block.component.html',
  styleUrls: ['./message-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageBlockComponent implements OnChanges, AfterViewInit, OnInit, OnDestroy {
  @Input() message: MessageDetails;
  @Input() currentUser: UserPersonalDetails | null;
  @Input() channelId: string;

  @Output() reply: EventEmitter<any> = new EventEmitter(null);
  @Output() edit: EventEmitter<any> = new EventEmitter(null);
  @Output() delete: EventEmitter<any> = new EventEmitter(null);

  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();

  @ViewChild('actionButons') actionButons: ElementRef;
  allMessagesRequest: {
    channelId: string;
    fetchCount: number;
    fetchSize: number;
  };
  componentRef: ComponentRef<ChatEditorComponent> = null;
  constructor(
    private cdRef: ChangeDetectorRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private chatStore: Store<ChatState>) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.message) {
      this.message = changes.message.currentValue;
    }
    if (changes.currentUser?.currentValue) {
      this.currentUser = changes.currentUser.currentValue;
    }
    if (changes.channelId?.currentValue) {
      this.channelId = changes.channelId.currentValue;
    }
  }

  ngOnInit(): void {
    combineLatest([
      this.chatStore.pipe(takeUntil(this.unsubscribeAll$),select(getChannelId)),
      this.chatStore.pipe(takeUntil(this.unsubscribeAll$),select(getPagination)),
    ])
			.pipe(
				takeUntil(this.unsubscribeAll$),
				filter((response) => {
					return response[0] && response[1] ? true : false;
				})
			)
			.subscribe((response) => {
        this.allMessagesRequest = {
          channelId: response[0],
          fetchCount: response[1].fetchCount,
          fetchSize: response[1].fetchSize,
        };
      })
  }

  /**
   * Extract initials from the name
   * @param senderName name of the sender
   * @returns initials of the sender
   */
  getInitials(senderName: string): string {
    if (!senderName) {
      return '--';
    }
    const name = senderName.split(' ')?.length > 1 ? senderName.split(' ') : senderName;
    if (typeof name === 'string') {
      return name.slice(0, 2).toUpperCase();
    } else {
      return `${name[0].toUpperCase()}${name[1].toUpperCase()}`;
    }
  }

  ngAfterViewInit() {
    this.toggleActionButtons(false);
  }

  /**
   * handle the action buttons
   * @param show show or hide the action buttons
   */
  toggleActionButtons(show: boolean) {
    this.actionButons.nativeElement.style.display = show ? 'block' : 'none';
  }

  /**
   * Create an instance of the editor component and add it to the container
   * @param container container to add the editor to
   * @param initialOptions initial options to pass to the editor component
   */
  addEditor(container: ContainerRefDirective, initialOptions?: Partial<ChatEditorComponent>) {
    if (!this.componentRef) {
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(ChatEditorComponent);
      this.componentRef = container.viewContainerRef.createComponent(componentFactory);
      this.componentRef.instance.editorId = initialOptions.editorId;
      this.componentRef.instance.content = initialOptions.content;
      this.componentRef.instance.messageDetails = this.message;
      this.componentRef.instance.currentUser = this.currentUser;
      this.componentRef.instance.currentChannelId = this.channelId;
      this.componentRef.instance.editorMode = !initialOptions?.content ? EditorModes.REPLY : EditorModes.EDIT;
      this.componentRef.instance.afterMessageSent.subscribe((sentEvent: MessageSentEvent) => {
        if(sentEvent === MessageSentEvent.EDIT_SENT || sentEvent === MessageSentEvent.REPLY_SENT) {
          // setTimeout(() => {
          //   this.chatStore.dispatch(loadMessages({
          //     fetchCount: this.allMessagesRequest.fetchCount,
          //     fetchSize: this.allMessagesRequest.fetchSize,
          //     channelId: this.channelId,
          //   }));
          // }, 400);
          this.componentRef.instance.ngOnDestroy();
          container.viewContainerRef.remove();
          this.componentRef = null;
        }
      });

      // Detecting change explicitly
      // to enable the editor send button
      this.cdRef.detectChanges();
    } else {
      this.componentRef.instance.ngOnDestroy();
      container.viewContainerRef.remove();
      this.componentRef = null;
    }
  }

  /**
   * Reply to the message
   * @param container container to add the editor to
   */
  addReply(container: ContainerRefDirective) {
    this.addEditor(container, {
      editorId: 'replymessage',
      content: '',
    });
  }

  /**
   * Edit the message
   * @param container container to add the editor to
   * @param content content to edit
   */
  editContent(container: ContainerRefDirective, content: string) {
    this.addEditor(container, {
      editorId: 'editMessage',
      content,
    });
  }

  deleteMessage() {
    this.delete.emit(this.message);
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
  }
}
