import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { RoleRequestDto } from '@models/teams';
import { DmsService } from '@services/dms/dms.service';
import { UserProfileService } from '@services/user/user-profile.service';
import { BlockElementTypes, DeltaParserService, EditorService } from 'mdo-ui-library';
import { Observable, Subscriber, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'pros-message-editor',
  templateUrl: './message-editor.component.html',
  styleUrls: ['./message-editor.component.scss'],
  providers: [EditorService]
})
export class MessageEditorComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @Input() textEditorId: string;
  @Input() innerToolbarId: string;
  @Input() componentName: string;
  @Input() showReplyMessage: boolean;
  @Input() messageDetail: any;
  @Output() sendMessageEmit = new EventEmitter<any>();
  @Output() scrollToBottomEmit = new EventEmitter<any>();
  @ViewChild('currentLength', { static: true, read: ElementRef }) currentLength: ElementRef;
  @ViewChild('textareaEditor', { static: true, read: ElementRef }) textareaEditor: ElementRef;
  @ViewChild('lengthIndicator', { static: true, read: ElementRef }) lengthIndicator: ElementRef;
  @ViewChild('enterHint', { static: true, read: ElementRef }) enterHint: ElementRef;
  editorInstance;
  mentionList = [];
  isMentionListOpen = false;
  sendButtonDisable = true;
  subscription: Subscription = new Subscription();
  lengthIndicatorColor = 'secondary';
  attachments: any[] = [];
  messageLength = 0;

  constructor(
    public editorService: EditorService,
    public userProfileService: UserProfileService,
    public deltaParserService: DeltaParserService,
    public cd: ChangeDetectorRef,
    private dmsService: DmsService
  ) { }

  ngOnInit(): void {
    this.getUserListForMentions();
  }

  ngAfterViewInit() {
    this.initializeEditorInstance();
  }

  ngOnChanges() {
    if ( this.showReplyMessage && this.editorInstance ) {
      this.editorInstance.focus();
    }
    if ( !this.showReplyMessage && this.editorInstance ) {
      this.clearInput();
    }
  }

  getUserListForMentions() {
    const requestDto: RoleRequestDto = {
      pageInfo: {
        pageNumer: 0,
        pageSize: 20,
      },
      searchString: '',
    };
    this.subscription.add(
      this.userProfileService
        .getUserInfoList(requestDto)
        .pipe(take(1))
        .subscribe(
          (resp) => {
            if (resp.acknowledge) {
              this.setMentionList(resp.listPage.content);
            }
          },
          (err) => {
            console.log(err);
          }
        )
    );
  }

  setMentionList(userlist) {
    userlist.forEach((res, i) => {
      const userInfo = res;
      this.mentionList.push({
        id: i,
        value: userInfo?.fname && userInfo?.lname ? `${userInfo.fname} ${userInfo.lname}` : userInfo?.userName,
      });
    });
  }

  initializeEditorInstance() {
    const textEditorId = '#' + this.textEditorId;
    const innerToolbarId = '#' + this.innerToolbarId;
    this.editorInstance = this.editorService.initiate(textEditorId, {
      modules: {
        mention: {
          container: '.ql-editor', // Container class name
          allowedChars: /^[A-Za-zsÅÄÖåäö]*$/, // Regex which validates the allowed characters
          mentionDenotationChars: ['@', '#'], // Specify the characters to be used
          defaultMenuOrientation: 'top',
          // This method will be called once we start typing with the mention Chars
          source: (searchTerm: string, renderList: any, mentionChar: string) => {
            // Method to find the matching items
            this.suggestPeople(searchTerm).subscribe((matchedPeople) => {
              renderList(matchedPeople); // Once we have the matching results we give that back to this callback method
            });
          },
          onOpen: () => {
            this.isMentionListOpen = true;
          },
          onClose: () => {
            this.isMentionListOpen = false;
          },
        },
        keyboard: {
          bindings: {
            shift_enter: {
              key: 13,
              shiftKey: true,
              handler: (range, ctx) => {
                this.editorInstance.insertText(range.index, '\n');
              },
            },
            enter: {
              key: 13,
              handler: (range) => {
                this.sendMessage();
              },
            },
          },
        },
        toolbar: {
          container: innerToolbarId,
        }
      },
      theme: 'snow',
    });

    if ( this.messageDetail && this.componentName === 'message-list') {
      this.clearInput();
      const messageText = this.deltaParserService.unparse([this.messageDetail.msg]);
      this.editorService.setData(messageText.ops);
      this.sendButtonDisable = false;
      this.cd.detectChanges();
    }

    this.textareaEditor.nativeElement.addEventListener('keydown', this.editorChangeEvent.bind(this));
    this.textareaEditor.nativeElement.addEventListener('input', this.editorChangeEvent.bind(this));
  }

  // change event of text editor box for below purposes
  // 1. to set hint to send message on enter visible
  // 2. to show character length when it exceeds 80%
  // 3. Disable send button when character limit exceeds 1024
  editorChangeEvent() {
    const textAreaEditorText = this.textareaEditor.nativeElement.innerText.trim();
    const characterLength = textAreaEditorText.length;
    this.messageLength = characterLength;
    this.currentLength.nativeElement.innerText = characterLength.toString();
    if (textAreaEditorText && !this.isMentionListOpen) {
      if (characterLength >= 1) {
        this.sendButtonDisable = false;
        // this.enterHint.nativeElement.style.display = 'block'; // show enter hint if atleast one character is inserted
      }
      if (characterLength < 820) {
        // as per requirement set to 80% of 1024
        this.lengthIndicator.nativeElement.style.display = 'none';
      }
      if (characterLength >= 820) {
        // as per requirement set to 80% of 1024
        this.lengthIndicator.nativeElement.style.display = 'block';
      }
      if (characterLength >= 1024) {
        this.lengthIndicatorColor = 'error';
        this.sendButtonDisable = true;
      }
      if (characterLength > 820 && characterLength < 1024) {
        this.lengthIndicatorColor = 'secondary';
        this.sendButtonDisable = false;
      }
      if (characterLength > 240) {
        this.scrollToBottom();
      }
    } else {
      this.sendButtonDisable = true;
      // this.enterHint.nativeElement.style.display = 'none';
      this.lengthIndicator.nativeElement.style.display = 'none';
    }
  }

  sendMessage() {
    const messageDelta = this.deltaParserService.parse(this.editorService.getData().ops);
    if ( !this.invalidMessage ) {
      if (this.attachments) {
        this.attachments.forEach(attachment => {
          if (!attachment.uploadError && attachment.uploaded) {
            messageDelta[0].elements.push(attachment.block);
          }
        });
      }
      this.sendMessageEmit.emit({messageDetail: this.messageDetail, messageDelta: messageDelta[0]});
      this.clearInput();
      this.attachments = [];
      this.messageLength = 0;
    }
  }

  clearInput(): void {
      const collection = document.getElementsByClassName('ql-editor');
      if (collection.length) {
        Array.from(collection).forEach((element) => {
          element.innerHTML = '';
        });
      }
  }

  scrollToBottom() {
    this.scrollToBottomEmit.emit(true);
  }

  /**
   * get result suggested
   * @param searchTerm search text
   * @returns suggested result
   */
   suggestPeople(searchTerm: string): Observable<any> {
    return new Observable((subscriber: Subscriber<any>) => {
      subscriber.next(this.mentionList.filter((person) => person.value.includes(searchTerm)));
    });
  }

  removeAttachment(index): void {
    this.attachments.splice(index, 1);
  }

  uploadAttachements(files: File[]): void {
    if (!files) {
      return;
    }
    for(const file of files) {
      const block = {
        type: BlockElementTypes.LINK,
        url: '',
        fileName: file.name
      }
      const attachment = {
        file,
        block,
        uploadError: false,
        uploaded: false,
        uploadProgress:0
      };
      this.dmsService.uploadFile(file).subscribe(resp => {
        if(resp) {
          attachment.block.url = resp + file.name;
          attachment.uploaded = true;
          attachment.uploadProgress = 100;
        }
      }, error => {
        console.error(`Error:: ${error.message}`);
        attachment.uploadError = true;
        attachment.uploaded = false;
      });
      this.attachments.push(attachment);
    };
  }

  /**
   * get file icon based on file name
   * @param attachmentName attached file name added
   */
  getAttachmentIcon(attachmentName) {
    let attachmentIcon = '';
    const attachmentExt = attachmentName.split('.')[1];
    switch (attachmentExt) {
      case 'docx':
      case 'doc': {
        attachmentIcon = '/assets/images/ext/doc.svg';
        break;
      }
      case 'jpg':
      case 'png':
      case 'jpeg': {
        attachmentIcon = '/assets/images/ext/img.svg';
        break;
      }
      case 'pdf': {
        attachmentIcon = '/assets/images/ext/pdf.svg';
        break;
      }
      case 'ppt': {
        attachmentIcon = '/assets/images/ext/ppt.svg';
        break;
      }
      case 'txt': {
        attachmentIcon = '/assets/images/ext/txt.svg';
        break;
      }
      case 'xls': {
        attachmentIcon = '/assets/images/ext/xls.svg';
        break;
      }
      case 'zip': {
        attachmentIcon = '/assets/images/ext/zip.svg';
        break;
      }
      default: {
        attachmentIcon = '/assets/images/ext/none.svg';
        break;
      }
    }
    return attachmentIcon;
  }

  /**
   * check if the send action is alowed base on the message content
   */
  get invalidMessage() {
    return !!(( !this.attachments.length && !this.messageLength ) || (this.messageLength >= 1024)
    || (this.attachments.length && this.attachments.some(attachment => attachment.uploadError || !attachment.uploaded)));
  }

  /**
   * truncate attachment name after 25 chars
   * @param attachmentName attachment name
   * @returns truncated name
   */
  truncateAttachmentName(attachmentName: string) {
    if(attachmentName.length < 25) {
      return attachmentName;
    }

    const name = attachmentName.split('.');
    if(name.length > 1) {
      return name[0].substr(0, 25 - name[1].length ).toString() + '...' + name[1];
    }
    return name[0].substr(0, 25);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
