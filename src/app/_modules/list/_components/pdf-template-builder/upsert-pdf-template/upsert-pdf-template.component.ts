import { take, takeUntil } from 'rxjs/operators';
import { NotifService } from '@services/notif/notif.service';
import { UserPasswordPolicyService } from '@services/user/user-password-policy.service';
import { CoreService } from '@services/core/core.service';
import { DmsService } from '@services/dms/dms.service';
import { UserProfileService } from '@services/user/user-profile.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TemplateModel } from '@models/notif/notif.model';
import { Block, DeltaParserService } from 'mdo-ui-library';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Subject, Subscription, Observable, Subscriber } from 'rxjs';
import { MatMenuTrigger } from '@angular/material/menu';
import { Component, OnInit, ViewChild, ElementRef, Inject, LOCALE_ID, OnDestroy } from '@angular/core';
import { QuillEditorComponent } from '@modules/shared/_components/quill-editor/quill-editor.component';
import {
  dataTypes,
  HeaderData,
  IMenuItem
} from '@modules/settings/_components/email-templates-setting/dash-menu/dash-menu-base';
import { RoleRequestDto } from '@models/teams';

@Component({
  selector: 'pros-upsert-pdf-template',
  templateUrl: './upsert-pdf-template.component.html',
  styleUrls: ['./upsert-pdf-template.component.scss']
})
export class UpsertPdfTemplateComponent implements OnInit, OnDestroy {
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  @ViewChild('editor') editor!: ElementRef;
  @ViewChild('quillEditorRef') quillEditorRef!: QuillEditorComponent;
  @ViewChild('textareaEditor', { static: true, read: ElementRef }) textareaEditor: ElementRef;

  datalist$ = new BehaviorSubject<any>([]);

  headerData = HeaderData;
  insertText = '';
  denotationChar = '';
  menuDataType: dataTypes;
  cursorPosition: number;
  selectedMenuItem: { id: any; value: string } = null;
  moduleId = '';

  editorConfig = {
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'], // toggled buttons
        ['blockquote', 'code-block', 'image'],

        [{ header: 1 }, { header: 2 }], // custom button values
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
        [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
        [{ direction: 'rtl' }], // text direction

        [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
        [{ header: [1, 2, 3, 4, 5, 6, false] }],

        [{ color: [] }, { background: [] }], // dropdown with defaults from theme
        [{ font: [] }],
        [{ align: [] }],

        ['clean']
      ],
      mention: {
        container: '.ql-editor', // Container class name
        allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/, // Regex which validates the allowed characters
        mentionDenotationChars: ['@', '/', ':r', ':f'], // Specify the characters to be used
        renderLoading: () => null,
        dataAttributes: ['id', 'value', 'dataType', 'endnode', 'denotationChar', 'link', 'target', 'disabled'],
        showDenotationChar: false,
        // This method will be called once we start typing with the mention Chars
        source: (searchTerm: string, renderList: any, mentionChar: string) => {
          // Method to find the matching items
          // Method must be async or an Observable for this to work with http requests
          switch (mentionChar) {
            case '@':
              this.suggestPeople(searchTerm).subscribe((matchedPeople) => {
                console.log('@ entered: ', matchedPeople);
                renderList(matchedPeople); // Once we have the matching results we give that back to this callback method
              });
              break;
            case '/':
              this.showHeaderDataMenu(searchTerm);
              break;
          }
        },
        onSelect: (
          item: { dataType?: string; endnode?: any; denotationChar: string; id: string; index: string; value: string },
          insertItem
        ) => {
          if (item.dataType) {
          } else {
            insertItem(item);
          }
        },
        onPositionChange: (position: any) => {
          console.log('position', position);
        }
      },
      imageUploader: {
        upload: (file: any) => {
          return new Promise((resolve, reject) => {
            this.dmsService.uploadFile(file).subscribe(
              (resp) => {
                if (resp) {
                  resolve(`https://dev-play.masterdataonline.com/dms/doc/${resp}`);
                }
              },
              (error) => {
                reject('Some error occured!');
              }
            );
          });
        }
      }
    },
    placeholder: 'Information for field on mouse hover of input',
    theme: 'snow' // or 'bubble'
  };
  currentTemplateId: number;
  currentTemplateDetails: TemplateModel = null;
  mentionList = [];
  subscription: Subscription = new Subscription();
  menuX = 300;
  menuY = 300;
  objectTypeList = [];
  dataSetSearchLoader = false;
  templateBody: Block;
  editorInstance;
  emailTemplateForm: FormGroup = new FormGroup({
    templateName: new FormControl('', [Validators.required]),
    data: new FormControl('', [Validators.required]),
    fqdn: new FormControl(''),
    id: new FormControl(0)
  });
  searchedTermForHeaderData = 'none';
  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private router: Router,
    private activedRoute: ActivatedRoute,
    public userProfileService: UserProfileService,
    private dmsService: DmsService,
    public deltaParserService: DeltaParserService,
    private coreService: CoreService,
    @Inject(LOCALE_ID) public locale: string,
    private userPasswordPolicyService: UserPasswordPolicyService,
    private notifService: NotifService
  ) {}

  ngOnInit(): void {
    this.activedRoute.params.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp: any) => {
      this.moduleId = resp.moduleId;
      if (resp.templateId) {
        this.currentTemplateId = +resp.templateId;
        if (this.currentTemplateId > 0) {
          this.getTemplateById();
        }
      }
    });
    this.getUserListForMentions();
  }

  /**
   * clear the editor contents
   */
  clearRichTextData() {
    this.quillEditorRef?.clearEditorData();
  }

  getTemplateById() {
    this.notifService
      .getTemplateById(this.currentTemplateId)
      .pipe(take(1))
      .subscribe((resp) => {
        const data = JSON.parse(`[${resp.data}]`);
        resp.data = this.deltaParserService.unparse(data);
        this.currentTemplateDetails = resp;
        this.patchCurrentValue();
      });
  }

  patchCurrentValue() {
    this.emailTemplateForm.patchValue({
      id: this.currentTemplateId,
      templateName: this.currentTemplateDetails.templateName,
      data: this.currentTemplateDetails.data,
      fqdn: this.currentTemplateDetails.fqdn
    });
  }

  templateBodyUpdated($event) {
    // const parsed = this.deltaParserService.parse($event?.ops || []);
    // this.templateBody = parsed?.length? parsed[0]: null;
  }

  getMenuCoordinates() {
    if (this.editor) {
      if (this.editor) {
        this.menuX = this.editor.nativeElement.offsetLeft + 20;
        this.menuY = this.editor.nativeElement.offsetTop + 20;
      }
    }
  }

  showHeaderDataMenu(searchedHeaderData: string = 'all') {
    this.menuDataType = null; // force to reset the menuDataType in dash-menu-component
    const headerDataMenu = this.getHeaderDataMenu(searchedHeaderData);
    if (headerDataMenu === this.searchedTermForHeaderData) {
      this.trigger.closeMenu();
      this.searchedTermForHeaderData = 'none';
    } else {
      this.menuDataType = dataTypes.header;
      this.searchedTermForHeaderData = headerDataMenu;
      this.trigger.openMenu();
    }
  }

  selectedFlow(event: IMenuItem[]) {
    this.menuDataType = null;
    this.trigger.closeMenu();
    const objectData = {
      id: event[event.length - 1].id,
      value: event
        .map((d) => d.insertText)
        .filter(Boolean)
        .join('.')
    };
    this.selectedMenuItem = objectData;
  }

  closeMenu(event?: any) {
    this.trigger.closeMenu();
  }

  getHeaderDataMenu(headerDataString: string = 'all') {
    switch (headerDataString) {
      case '':
        return 'all';
      case 'd':
      case 'D':
        return 'dataset';
      case 'f':
      case 'F':
        return 'flow';
      case 'i':
      case 'I':
        return 'image';
      default:
        return 'none';
    }
  }

  /**
   * get result suggested
   * @param searchTerm search text
   * @returns suggested result
   */
  suggestPeople(searchTerm: string): Observable<any> {
    this.datalist$.next(this.mentionList.filter((person) => person.value.includes(searchTerm)));
    return new Observable((subscriber: Subscriber<any>) => {
      subscriber.next(this.mentionList.filter((person) => person.value.includes(searchTerm)));
    });
  }

  getUserListForMentions() {
    const requestDto: RoleRequestDto = {
      pageInfo: {
        pageNumer: 0,
        pageSize: 20
      },
      searchString: ''
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
        value: userInfo?.fname && userInfo?.lname ? `${userInfo.fname} ${userInfo.lname}` : userInfo?.userName
      });
    });
  }

  onSaveTemplate() {
    if (!this.emailTemplateForm.valid) {
      this.userPasswordPolicyService.validateAllFormFields(this.emailTemplateForm);
      return;
    }
    const payload = this.emailTemplateForm.value;
    const parsed = this.deltaParserService.parse(payload.data.ops);
    payload.data = JSON.stringify(parsed[0]);
    // if (payload.id === 0) {
    //   this.notifService
    //     .createTemplate(payload)
    //     .pipe(take(1))
    //     .subscribe(
    //       (resp) => {
    //         this.close();
    //       },
    //       (err) => console.log(err)
    //     );
    // } else {
    //   this.notifService
    //     .updateTemplate(payload)
    //     .pipe(take(1))
    //     .subscribe(
    //       (resp) => {
    //         this.close();
    //       },
    //       (err) => console.log(err)
    //     );
    // }
  }

  close() {
    this.router.navigate([{ outlets: { sb: `sb/list/dataset-settings/${this.moduleId}/pdf-template-builder/${this.moduleId}`, outer: null } }], {
      queryParamsHandling: 'preserve'
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.complete();
  }
}
