import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RoleRequestDto } from '@models/teams';
import { UserPersonalDetails } from '@models/userdetails';
import {
  EditorModes,
  EditorOutput,
  FileAttachment,
  MessageDetails,
  MessagePayload,
  MessageSentEvent,
  RawMessageObject
} from '@modules/chat/_common/chat';
import { Store } from '@ngrx/store';
import { WebsocketService } from '@services/chat/websocket.service';
import { UserProfileService } from '@services/user/user-profile.service';
import { updateMessage } from '@store/actions/chat.action';
import { ChatState } from '@store/reducers/chat.reducer';
import { DeltaParserService, EditorService } from 'mdo-ui-library';
import * as moment from 'moment';
import { BehaviorSubject, Observable, Observer } from 'rxjs';
import { getMentionCharIndex, hasValidMentionCharIndex } from '../../_common/chat-utility';
import { AttachmentDialogComponent } from '../attachment-dialog/attachment-dialog.component';
import { UserSelectionOption, UsersList } from '../users-list/users-list.component';

export const MSG_CHAR_LIMIT = 1024;
export const MENTION_CHARS = ['@', '/'];
export const ALLOWED_CHARS_VALIDATOR = /^[A-Za-zsÅÄÖåäö]*$/;

export interface MentionItem {
  denotationChar: string;
  id: string | number;
  index: number;
  value: string;
}
export class EditorState {
  characterLength: number;
  sendButtonActive?: boolean;
  lengthWarning?: boolean;
  lengthWarningType?: 'error' | 'secondary' | '';

  constructor(characterLength: number) {
    this.characterLength = characterLength;
    this.lengthWarning = characterLength >= 820;
    this.lengthWarningType = characterLength >= MSG_CHAR_LIMIT ? 'error' : '';
    if (characterLength > 820 && characterLength < MSG_CHAR_LIMIT) {
      this.lengthWarningType = 'secondary';
    }
    this.sendButtonActive = characterLength > 0 && this.lengthWarningType !== 'error';
  }
}

@Component({
  selector: 'pros-chat-editor',
  templateUrl: './chat-editor.component.html',
  styleUrls: ['./chat-editor.component.scss'],
  providers: [EditorService],
})
export class ChatEditorComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() public editorId: string;
  @Input() public innerToolbarId = 'toolbar';
  @Input() public content: any;
  @Input() public editorMode: EditorModes;
  @Input() public currentChannelId: string;
  @Input() public currentUser: UserPersonalDetails | null;
  @Input() public messageDetails: MessageDetails | null;
  @Input() public moduleId: string;
  @ViewChild('richTextEditor') private richTextEditor: ElementRef;

  @Output() public emitPayload: EventEmitter<EditorOutput> = new EventEmitter();
  @Output() public afterMessageSent: EventEmitter<MessageSentEvent> = new EventEmitter();

  showObjectSelector: boolean;
  cursorPosition: number;
  mentionCharPosition: number;
  objectCharPosition: number;
  suggestedUserObject: UsersList;
  private editorInstance: any; // Instance for the active editor
  private mentionList = []; // List of people to be suggested
  public attachments: FileAttachment[] = []; // List of attachments
  private editorStateChange: BehaviorSubject<EditorState> = new BehaviorSubject<EditorState>(new EditorState(0));
  constructor(
    private editorService: EditorService,
    private deltaParserService: DeltaParserService,
    private userProfileService: UserProfileService,
    private dialog: MatDialog,
    private websocketService: WebsocketService,
    private chatStore: Store<ChatState>
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initializeEditorInstance(this.editorId);
    this.setUserListForMentions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.editorId?.currentValue) {
      this.editorId = changes.editorId.currentValue;
      setTimeout(() => {
        this.initializeEditorInstance(changes.editorId.currentValue);
      }, 0);
    }

    if (changes.editorMode?.currentValue !== undefined) {
      this.editorMode = changes.editorMode.currentValue;
    }

    if (changes.currentUser?.currentValue) {
      this.currentUser = changes.currentUser.currentValue;
    }

    if (changes.content?.currentValue) {
      this.content = changes.content.currentValue;
    }

    if (changes.currentChannelId?.currentValue) {
      this.currentChannelId = changes.currentChannelId.currentValue;
    }
  }

  /**
   * get the reference to message chat limit
   */
  public get msgCharLimit() {
    return MSG_CHAR_LIMIT;
  }

  /**
   * Open attachment dialog
   */
  openAttachmentDialog() {
    this.dialog
      .open(AttachmentDialogComponent, {
        data: {
          currentUser: this.currentUser,
          currentChannelId: this.currentChannelId,
          editorMode: this.editorMode,
        },
        width: '545px',
        height: '431px',
        panelClass: 'medium-dialog-container',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((attachmentPayload) => {
        if (attachmentPayload) {
          if (this.editorMode === EditorModes.REPLY) {
            attachmentPayload.payload = {
              ...attachmentPayload.payload,
              replyFor: this.messageDetails?.id,
              deleted: false,
              edited: false,
            };
          }

          this.websocketService._sendPublic(attachmentPayload?.payload, attachmentPayload?.tenantId);
          this.afterMessageSent.emit(MessageSentEvent.ATTACHMENT_SENT);
        }
      });
  }

  /**
   * Set the initial user list for mention list
   * @param searchString search term to filter users
   */
  private setUserListForMentions(searchString = '') {
    searchString = searchString?.toLowerCase() || '';
    const requestDto: RoleRequestDto = {
      pageInfo: {
        pageNumer: 0,
        pageSize: 20,
      },
      searchString,
    };

    this.getUsers(requestDto).subscribe((usersList) => {
      this.mentionList = usersList.map((userInfo, index) => {
        return {
          id: userInfo?.userName,
          value: userInfo?.fname && userInfo?.lname ? `${userInfo.fname} ${userInfo.lname}` : userInfo?.userName,
        };
      });
    });
  }

  /**
   * get list of users with user info data
   * @param body RoleRequestDto
   * @returns Observable<any>
   */
  private getUsers(body: RoleRequestDto): Observable<any> {
    return new Observable((observer: Observer<any>) => {
      this.userProfileService.getUserInfoList(body).subscribe(
        (resp) => {
          resp.acknowledge ? observer.next(resp?.listPage?.content) : observer.next([]);
          observer.complete();
        },
        (err) => {
          console.error('getUsers Error: ', err);
          observer.next([]);
          observer.complete();
        }
      );
    });
  }

  /**
   * initialize the editor instance
   * @param editorId pass a unique id for the editor
   */
  private initializeEditorInstance(editorId: string) {
    if (!editorId) {
      console.error('Editor Id is not defined');
      return;
    }

    const modules = this.editorService.getModules();
    this.editorService.loadModules(modules, true).then(() => {
      const textEditorId = '#' + editorId;
      const innerToolbarId = '#' + this.innerToolbarId;
      this.editorInstance = this.editorService.initiate(textEditorId, {
        modules: {
          mention: {
            container: '.ql-editor', // Container class name
            allowedChars: ALLOWED_CHARS_VALIDATOR, // Regex which validates the allowed characters
            mentionDenotationChars: MENTION_CHARS, // Specify the characters to be used
            defaultMenuOrientation: 'top',
            // This method will be called once we start typing with the mention Chars
            source: (searchTerm: string, renderList: any, mentionChar: string) => {
              if (mentionChar === '/') {
                this.displayObjectSelector(searchTerm, mentionChar);
              } else {
                this.displayCategorisedMentionList(searchTerm, mentionChar);
              }
            },
          },
          keyboard: {
            bindings: {
              shift_enter: {
                key: 13,
                shiftKey: true,
                handler: (range: any, ctx: any) => {
                  this.editorInstance.insertText(range.index, '\n');
                },
              },
              enter: {
                key: 13,
                handler: () => {
                  this.sendMessage();
                },
              },
            },
          },
          toolbar: {
            container: innerToolbarId,
          },
        },
        theme: 'snow',
      });

      // If content is passed from parent component
      if (this.content && this.editorInstance) {
        // If content is string then parse it
        if (typeof this.content === 'string') {
          this.editorInstance.setContents(this.editorService.convertToDelta(this.content));
        } else {
          this.editorInstance.setContents(this.content);
        }
      }
    });

    this.richTextEditor?.nativeElement.addEventListener('keydown', this.editorChangeEvent.bind(this));
    this.richTextEditor?.nativeElement.addEventListener('input', this.editorChangeEvent.bind(this));
  }

  /**
   * create a categorized mention list
   * @param searchTerm pass the searchterm to filter users
   * @param mentionChar pass the mention char
   */
  displayCategorisedMentionList(searchTerm: string, mentionChar: string) {
    searchTerm = searchTerm?.toLowerCase() || '';
    this.suggestPeople(searchTerm).subscribe((peopleList) => {
      this.suggestedUserObject = {
        defaultOptions: [{ label: 'Everyone in channel' }],
        inChannel: peopleList.map((userInfo) => {
          return {
            id: userInfo?.userName,
            name: userInfo?.value,
          };
        }),
        outsideChannel: [],
      };
    });
  }

  /**
   * display the material/object selector
   * @param searchTerm pass the search term to filter objects
   * @param mentionChar pass the mention char
   */
  displayObjectSelector(searchTerm: string, mentionChar: string) {
    console.log(mentionChar);
    searchTerm = searchTerm?.toLowerCase() || '';
    this.showObjectSelector = true;
  }

  /**
   * method to handle user selection from mention list
   * @param userSelection user selected from mention list
   */
  userSelected(userSelection: any) {
    const { selected, option } = userSelection;
    if (option === UserSelectionOption.DEFAULT) {
      this.insertUserTag(selected);
    }
    if (option === UserSelectionOption.IN_CHANNEL) {
      this.insertUserTag(selected);
    }
    if (option === UserSelectionOption.OUTSIDE_CHANNEL) {
      this.insertUserTag(selected);
    }

    this.suggestedUserObject = null;
  }

  /**
   * method to handle user selection from object list
   * @param objectDetails user selected from object list
   */
  objectSelected(objectDetails: any) {
    this.insertObjectTag(objectDetails);
    this.showObjectSelector = false;
  }

  /**
   * method to insert a user mention tag on select
   * @param selected pass the selected user object
   * @param mentionCharPosition pass the mention char position
   */
  insertUserTag(selected: any, mentionCharPosition = this.mentionCharPosition) {
    const render: MentionItem = this.renderUser(selected, mentionCharPosition);
    this.editorInstance.deleteText(mentionCharPosition, this.cursorPosition - mentionCharPosition, 'user');
    const insertAtPos = mentionCharPosition;
    this.editorInstance.insertEmbed(insertAtPos, 'mention', render, 'user');
    this.editorInstance.insertText(insertAtPos + 1, ' ', 'user');
    this.editorInstance.setSelection(insertAtPos + 2, 'user');
  }

  /**
   * method to insert a user mention tag on select
   * @param selected pass the selected user object
   * @param objectCharPosition pass the mention char position
   */
  insertObjectTag(selected: any, objectCharPosition = this.mentionCharPosition) {
    const render: MentionItem = this.renderObject(selected, objectCharPosition, '');
    this.editorInstance.deleteText(objectCharPosition, this.cursorPosition - objectCharPosition, 'user');
    const insertAtPos = objectCharPosition;
    this.editorInstance.insertEmbed(insertAtPos, 'ql-object', render, 'user');
    this.editorInstance.insertText(insertAtPos + 1, ' ', 'user');
    this.editorInstance.setSelection(insertAtPos + 2, 'user');
  }

  /**
   * Create a render object to display the user name as a mention item
   * @param userInfo pass the selected user object
   * @param index pass the mentionChar's position
   * @returns MentionItem
   */
  renderUser(userInfo: any, index: number, denotationChar = '@'): MentionItem {
    return {
      denotationChar,
      id: userInfo?.id || userInfo?.name,
      index,
      value: userInfo?.name,
    };
  }

  /**
   * Create a render object to display the object name as a mention item
   * @param userInfo pass the selected object
   * @param index pass the mentionChar's position
   * @returns UserMentionItem
   */
  renderObject(objectData: any, index: number, denotationChar = '/'): MentionItem {
    return {
      denotationChar,
      id: objectData.selected?.fieldData,
      index,
      value: `${objectData.selected?.fieldData} | ${objectData.selected?.fieldDesc}`,
    };
  }

  // change event of text editor box for below purposes
  // 1. to set hint to send message on enter visible
  // 2. to show character length when it exceeds 80%
  // 3. Disable send button when character limit exceeds 1024
  private editorChangeEvent() {
    const characterLength = this.characterLength;
    this.editorStateChange.next(new EditorState(characterLength));
    this.mentionCharPosition = this.getMentionCharPosition();
    if (this.mentionCharPosition === null) {
      this.suggestedUserObject = null;
      this.showObjectSelector = false;
    }
    if (this.attachmentMode) {
      this.emitMessage();
    }
  }

  /**
   * Get the position of mention char in the text editor
   * Utilize the utility method coming from the mention module
   * @returns Number
   */
  getMentionCharPosition(): number | null {
    const range = this.editorInstance?.getSelection();
    if (range) {
      this.cursorPosition = range.index;
      const textBeforeCursor = this.getTextBeforeCursor();
      const { mentionCharIndex } = getMentionCharIndex(textBeforeCursor, MENTION_CHARS);
      if (hasValidMentionCharIndex(mentionCharIndex, textBeforeCursor, false)) {
        return this.cursorPosition - (textBeforeCursor.length - mentionCharIndex);
      }
    }

    return null;
  }

  /**
   * method to return text before the cursor position
   * @returns string
   */
  getTextBeforeCursor(): string {
    const startPosition = Math.max(0, this.cursorPosition - 31);
    const textBeforeCursorPos = this.editorInstance.getText(startPosition, this.cursorPosition - startPosition);
    return textBeforeCursorPos;
  }

  /**
   * get result suggested
   * @param searchTerm search text
   * @returns suggested result
   */
  private suggestPeople(searchTerm: string): Observable<any> {
    return new Observable((observer: Observer<any>) => {
      observer.next(this.mentionList.filter((person) => person.value.includes(searchTerm)));
    });
  }

  public emitMessage() {
    let messageDelta = null;
    try {
      messageDelta = this.deltaParserService.parse(this.editorService.getData().ops);
    } catch (error) {
      messageDelta = [];
    }
    this.prepareMessageToSend(messageDelta[0])
      .then((payload) => {
        this.emitPayload.emit({
          payload,
          tenantId: this.currentUser?.profileKey?.tenantId || '0',
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  /**
   * Send message to the server
   */
  public sendMessage() {
    const messageDelta = this.deltaParserService.parse(this.editorService?.getData().ops);

    this.prepareMessageToSend(messageDelta[0]).then((payload: Partial<MessagePayload>) => {
      this.websocketService._sendPublic(payload, this.currentUser?.profileKey?.tenantId || '0');
      this.editorInstance.setContents('');

      // if(this.editorMode === EditorModes.REPLY) {
      //   const repliedMessage: RawMessageObject = this.getReplyMessage(payload);
      //   this.chatStore.dispatch(addMessage({ messageToAdd: repliedMessage }));
      // }

      if (this.editorMode === EditorModes.EDIT) {
        this.chatStore.dispatch(updateMessage({ message: payload.msg, id: payload.id }));
      }
    });
  }

  getReplyMessage(payload: Partial<MessagePayload>): RawMessageObject {
    const date = moment(new Date()).format();
    return {
      channelId: payload.channelId,
      date,
      deleted: payload.deleted,
      id: '',
      edited: payload.edited,
      fromUserId: this.currentUser?.profileKey?.userName || 'Unknown',
      fromUserInfo: null,
      msg: payload.msg,
      public: true,
      rawMsg: null,
      replyFor: payload.replyFor,
      replyForMsg: null,
      senderMessageId: payload.fromUserId,
      sortValues: '',
      toUserId: null,
      toUserInfo: null,
      userId: this.currentUser?.profileKey?.userName || 'Unknown',
      attachmentText: null,
      attachmentType: null,
      senderImage: '',
      senderName: '',
    };
  }

  /**
   * Prepare or format message to send
   * @param messageDelta pass the message delta in quill delta format
   * @returns Promise<any>
   */
  prepareMessageToSend(messageDelta: any): Promise<Partial<MessagePayload>> {
    let payload: Partial<MessagePayload>;
    return new Promise((resolve, reject) => {
      if (!this.currentChannelId) {
        reject('Error: No channel selected');
        return;
      }
      if (new EditorState(this.characterLength).sendButtonActive && this.currentUser) {
        payload = {
          channelId: this.currentChannelId,
          fromUserId: this.currentUser?.profileKey?.userName || 'Unknown',
          msg: messageDelta,
        };

        if (this.editorMode === EditorModes.REPLY) {
          payload = {
            ...payload,
            id: '',
            replyFor: this.messageDetails?.id,
            deleted: false,
            edited: false,
          };
        }

        if (this.editorMode === EditorModes.EDIT) {
          payload = {
            ...payload,
            id: this.messageDetails?.id,
            replyFor: '',
            deleted: false,
            edited: true,
          };
        }
        resolve(payload);
      } else {
        reject(null);
      }
    });
  }

  public get attachmentMode(): boolean {
    return this.editorMode === EditorModes.ATTACHMENT;
  }
  public get replyMode(): boolean {
    return this.editorMode === EditorModes.REPLY;
  }
  public get editMode(): boolean {
    return this.editorMode === EditorModes.EDIT;
  }
  public get normalMode(): boolean {
    return !this.attachmentMode && !this.replyMode && !this.editMode;
  }

  private get characterLength(): number {
    const textAreaEditorText = this.richTextEditor.nativeElement.innerText.trim();
    return textAreaEditorText?.length || 0;
  }

  public get editorState(): EditorState {
    return this.editorStateChange.getValue();
  }

  public get isMessageValid(): boolean {
    return this.editorService.getData().ops.length > 0;
  }

  ngOnDestroy(): void {
    this.editorInstance = null;
  }
}
