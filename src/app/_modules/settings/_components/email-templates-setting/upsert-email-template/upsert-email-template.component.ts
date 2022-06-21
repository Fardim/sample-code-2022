import { AfterViewInit, Component, ElementRef, Inject, LOCALE_ID, OnInit, ViewChild, HostListener } from '@angular/core';
import { FormControl, FormGroup, Validators, FormArray, FormBuilder, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { ActivatedRoute, Router } from '@angular/router';
import { TemplateModel, TemplateTypeOptions } from '@models/notif/notif.model';
import { MetadataModeleResponse } from '@models/schema/schemadetailstable';
import { RoleRequestDto } from '@models/teams';
import { CoreService } from '@services/core/core.service';
import { DmsService } from '@services/dms/dms.service';
import { NotifService } from '@services/notif/notif.service';
import { UserPasswordPolicyService } from '@services/user/user-password-policy.service';
import { UserProfileService } from '@services/user/user-profile.service';
import { Block, DeltaParserService } from 'mdo-ui-library';
import { BehaviorSubject, Observable, Subject, Subscriber, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, take, takeUntil } from 'rxjs/operators';
import { dataTypes, HeaderData, IMenuItem } from './../dash-menu/dash-menu-base';
import { QuillEditorComponent } from '@modules/shared/_components/quill-editor/quill-editor.component';
import { Dataset } from '@models/schema/schema';
import { FileSource } from '@modules/transaction/elements/from-view-attachment/from-view-attachment.component';

declare const Mention;
declare const QuillObject;

export const MENTION_CHARS = ['@', '/'];
export const ALLOWED_CHARS_VALIDATOR = /^[A-Za-zsÅÄÖåäö]*$/;

@Component({
  selector: 'pros-upsert-email-template',
  templateUrl: './upsert-email-template.component.html',
  styleUrls: ['./upsert-email-template.component.scss'],
  // encapsulation: ViewEncapsulation.None,
})
export class UpsertEmailTemplateComponent implements OnInit, AfterViewInit {
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
  selectedMenuItem: {id: any, value:string} = null;
  saving = false;

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

        ['clean'],
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
              // this.insertText = '';
              // this.searchDataset(searchTerm, dataTypes.header);
              // this.datalist$.subscribe((resp) => {
              //   setTimeout(() => {
              //     renderList(resp);
              //   }, 10);
              // });
              break;
          }
        },
        onSelect: (
          item: { dataType?: string; endnode?: any; denotationChar: string; id: string; index: string; value: string },
          insertItem
        ) => {
          if (item.dataType) {
            // const insertable = this.nextDataForMenu(item);
            // if (insertable) {
            //   insertItem(
            //     {
            //       id: item.id,
            //       value: insertable,
            //       denotationChar: item.denotationChar,
            //       index: item.index,
            //     },
            //     true
            //   );
            // }
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
        },
      },
    },
    placeholder: 'Information for field on mouse hover of input',
    theme: 'snow', // or 'bubble'
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
    subject: new FormControl('', []),
    data: new FormControl('', [Validators.required]),
    fqdn: new FormControl(''),
    templateType: new FormControl('', [Validators.required]),
    id: new FormControl(0),
    dataSet: new FormControl('', []),
    attachementDetailsModel: new FormArray([]),
  });
  searchedTermForHeaderData = 'none';
  filteredTemplateTypeOptions: { key: string; value: string }[] = [];
  templateTypeOptions = (this.filteredTemplateTypeOptions = TemplateTypeOptions);
  attachments = [];
  dataSource: FileSource[] = [];
  templateTypeOptionCtrl = new FormControl();
  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();
  attachmentTypeList = ['STATIC', 'DYNAMIC'];
  selectedAttachmentType = 'STATIC';
  selectedFile: File;

  moduleList: Dataset[] = [];
  moduleFetchSize = 10;
  moduleFetchCount = 0;
  moduleSearch = '';
  moduleLoading = false;
  searchModuleCtrl: FormControl = new FormControl();

  @HostListener('dragover', ['$event']) public onDragOver(evt) {
    evt.preventDefault();
    evt.stopPropagation();
  }

  @HostListener('drop', ['$event']) public ondrop(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.fileChange(evt.dataTransfer.files);
  }

  constructor(
    private router: Router,
    private activedRoute: ActivatedRoute,
    public userProfileService: UserProfileService,
    private dmsService: DmsService,
    public deltaParserService: DeltaParserService,
    private coreService: CoreService,
    @Inject(LOCALE_ID) public locale: string,
    private userPasswordPolicyService: UserPasswordPolicyService,
    private notifService: NotifService,
    private fb: FormBuilder,
    private dmsServive: DmsService
  ) {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
  }
  ngAfterViewInit(): void {
    // this.initializeEditorInstance();
  }

  ngOnInit(): void {
    this.activedRoute.params.subscribe((resp: any) => {
      if (resp.templateId) {
        this.currentTemplateId = +resp.templateId;
        if(this.currentTemplateId > 0) {
          this.getTemplateById();
        }
      }
    });
    this.getUserListForMentions();
    this.getModules();
    this.getModuleFields('187');
    this.templateTypeOptionCtrl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.unsubscribeAll$))
      .subscribe((searchString) => {
        const value = searchString.toLowerCase();
        this.filteredTemplateTypeOptions = searchString
          ? this.templateTypeOptions.filter((d) => d.key.toString().toLowerCase().indexOf(value) >= 0)
          : this.templateTypeOptions.slice();
      });

    this.searchModuleCtrl.valueChanges.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString) => {
      if(!(searchString && searchString.moduleId)) {
        this.moduleSearch = searchString || '';
        this.moduleList = [];
        this.moduleFetchCount = 0;
        this.getModules(this.moduleSearch);
      }
    });
  }

  /**
   * clear the editor contents
   */
  clearRichTextData() {
    this.quillEditorRef?.clearEditorData();
  }

  getTemplateById() {
    this.notifService.getTemplateById(this.currentTemplateId).pipe(take(1)).subscribe(resp => {
      const data = JSON.parse(`[${resp.data}]`);
      console.log('email data', data);
      resp.data = this.deltaParserService.unparse(data);
      this.currentTemplateDetails = resp;
      this.patchCurrentValue();
      this.getAttachments();
    });
  }

  getAttachments() {
    const staticAttachmentDmsRef: string[] = this.currentTemplateDetails.attachementDetailsModel.filter(d=> d.type === 'STATIC').map(d=> d.dmsRef);
    if(staticAttachmentDmsRef.length>0) {
      this.dmsService.downloadFiles(staticAttachmentDmsRef).pipe(take(1)).subscribe(resp => {
        resp.forEach(att => {
          this.dataSource.push({name: att.fileName, extension: att.fileName.split('.').pop(), docid: att.documentId});
        });
      })
    }
  }

  getModules(description: string = '') {
    this.moduleLoading = true;
    this.coreService
      .searchAllObjectType({ lang: 'en', fetchsize: this.moduleFetchSize, fetchcount: this.moduleFetchCount, description })
      .pipe(take(1))
      .subscribe(
        (resp) => {
          this.moduleList.push(...resp);
          this.moduleLoading = false;
        },
        (err) => {
          console.log(err);
          this.moduleLoading = false;
        }
      );
  }

  getModuleFields(moduleId: string) {
    console.log('getModuleFields');
    this.coreService.getMetadataFieldsByModuleId([moduleId], '').subscribe(
      (res: MetadataModeleResponse) => {
        // this.parseMetadataModelResponse(res);
        console.log('getModuleFields: ', res);
      },
      (error: any) => {
        console.log('getModuleFields: error: ', error);
      }
    );
  }

  patchCurrentValue() {
    // Patch Values for Existing Email Template
    this.emailTemplateForm.patchValue({
      id: this.currentTemplateId,
      templateName: this.currentTemplateDetails.templateName,
      subject: this.currentTemplateDetails.subject,
      data: this.currentTemplateDetails.data,
      fqdn: this.currentTemplateDetails.fqdn,
      templateType: this.currentTemplateDetails.templateType,
      dataSet: this.currentTemplateDetails.dataSet,
    });
    if(Array.isArray(this.currentTemplateDetails.attachementDetailsModel) && this.currentTemplateDetails.attachementDetailsModel.length>0) {
      this.currentTemplateDetails.attachementDetailsModel.forEach(attach => {
        const fg = this.fb.group({
          id: [attach.id, []],
          templateId: [attach.templateId, []],
          type: [attach.type, []],
          dmsRef: [attach.dmsRef, []],
          dataset: [attach.dataset, []],
        })
        this.attachementDetailsFormArray.push(fg);
      });
      if(this.currentTemplateDetails.attachementDetailsModel.filter(d=> d.type === 'DYNAMIC').length>0) {
        this.selectedAttachmentType = 'DYNAMIC';
      }
    }
    const findTempType = this.templateTypeOptions.find(d=> d.value === this.currentTemplateDetails.templateType);
    this.templateTypeOptionCtrl.setValue(findTempType ? findTempType.key : '');

    if(this.currentTemplateDetails.dataSet) {
      this.getModuleDetails(this.currentTemplateDetails.dataSet);
    }
  }

  getModuleDetails(moduleId: string) {
    this.coreService.getEditObjectTypeDetails(moduleId).pipe(take(1)).subscribe(resp => {
      this.searchModuleCtrl.setValue({moduleId, moduleDesc: resp.moduleDescriptionMap[this.locale][0].description});
    });
  }

  onSelectTemplateType(event) {
    this.emailTemplateForm.patchValue({
      templateType: event.option.value,
    });
    this.templateTypeOptionCtrl.setValue(event.option.viewValue);
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

  close() {
    this.router.navigate([{ outlets: { sb: `sb/settings/email-templates` } }], { queryParamsHandling: 'preserve' });
  }

  valueChange(event) {}

  afterBlur(event) {}

  fireValidationStatus(event) {
    // debugger;
    // // https://stackoverflow.com/questions/23223718/failed-to-execute-btoa-on-window-the-string-to-be-encoded-contains-characte
    // const val = this.emailTemplateForm.value.data;
    // this.encoded = btoa(unescape(encodeURIComponent(val)));
    // this.decoded = decodeURIComponent(escape(atob(this.encoded)));
  }

  showHeaderDataMenu(searchedHeaderData: string = 'all') {
    this.menuDataType = null; // force to reset the menuDataType in dash-menu-component
    const headerDataMenu = this.getHeaderDataMenu(searchedHeaderData);
    if (headerDataMenu === this.searchedTermForHeaderData) {
      this.trigger.closeMenu();
      this.searchedTermForHeaderData = 'none'
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
      value: event.map(d=> d.insertText).filter(Boolean).join('.'),
    }
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

  searchDataset(searchTerm: string, type: dataTypes) {
    if (type === dataTypes.header) {
      searchTerm = searchTerm.toLowerCase() || '';
      this.getHeaderDataMenu(searchTerm);
      this.datalist$.next(searchTerm ? this.headerData.filter((d) => d.value.indexOf(searchTerm)) : this.headerData);
    }
    // this.suggestPeople(searchTerm);
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

  onSaveTemplate() {
    this.saving = true;
    if (!this.emailTemplateForm.valid) {
      this.userPasswordPolicyService.validateAllFormFields(this.emailTemplateForm);
      return;
    }
    const payload = this.emailTemplateForm.value;
    const parsed = this.deltaParserService.parse(payload.data.ops);
    payload.data = JSON.stringify(parsed[0]);

    let formData: FormData = new FormData();
    if(this.attachments.length>0) {
      this.attachments.forEach(file => {
        formData.append('file', file, file.name);
      });
    }
    formData.append('data', new Blob([JSON.stringify(payload)], {
      type: "application/json"
    }));

    if (payload.id === 0) {
      this.notifService
        .createTemplate(formData)
        .pipe(take(1))
        .subscribe(
          (resp) => {
            this.saving = false;
            this.close();
          },
          (err) => {
            console.log(err);
            this.saving = false;
          }
        );
    } else {
      this.notifService
        .updateTemplate(formData)
        .pipe(take(1))
        .subscribe(
          (resp) => {
            this.saving = false;
            this.close();
          },
          (err) => {
            console.log(err);
            this.saving = false;
          }
        );
    }
  }

  openQuickPreviewSideSheet() {
    const payload = this.emailTemplateForm.value;
    // payload.data = JSON.stringify(this.deltaParserService.parse(payload.data.ops));
    this.notifService.nextEmailTemplate(payload);
    this.router.navigate([{ outlets: { sb: `sb/settings/email-templates/${this.currentTemplateId}`, outer: `outer/email-templates/${this.currentTemplateId}/preview` } }], { queryParamsHandling: 'preserve' });
  }

  getAttachmentType() {

  }

  attachmentTypeChanged(event) {
    this.selectedAttachmentType = event;
  }

  fileChange(fileList) {
    for (const file of fileList) {
      this.dataSource.push({name: file.name, extension: file.name.split('.').pop(), docid: ''});
      this.attachments.push(file);
    }
    (document.getElementById('fileUpload') as HTMLInputElement).value = '';
  }

  remove(i) {
    this.attachementDetailsFormArray.removeAt(i);
  }

  addDynamicAttach() {
    const fg = this.fb.group({
      id: ['', []],
      templateId: ['', [Validators.required]],
      type: ['DYNAMIC', []],
      dmsRef: [null, []],
      dataset: ['', [Validators.required]],
    })
    this.attachementDetailsFormArray.push(fg);
  }

  displayDatasetFn(dataset): string {
    if (dataset) {
      return dataset.moduleDesc ? dataset.moduleDesc : '';
    }
    return '';
  }
  selectRefDataset(event) {
    this.emailTemplateForm.patchValue({dataSet: event.option.value.moduleId});
    this.searchModuleCtrl.setValue(event.option.value);
  }

  removeSelectedFile(file: FileSource, idx: number) {
    this.dataSource.splice(idx, 1);
    const index = this.attachments.findIndex(d=> d.name === file.name);
    if(index>=0) {
      this.attachments.splice(index, 1);
    }
    if(this.attachementDetailsFormArray.value.findIndex(image => image.dmsRef === file.docid)>=0) {
      this.attachementDetailsFormArray.removeAt(this.attachementDetailsFormArray.value.findIndex(image => image.dmsRef === file.docid))
    }
  }
  downloadFile(sno: string, fileName: string) {
    if(!sno) {
      return;
    }
    this.dmsServive.downloadFile(sno).subscribe(resp => {
      if(resp) {
        const file = new window.Blob([resp], {type: 'application/octet-stream'});
        const downloadAncher = document.createElement('a');
        downloadAncher.style.display = 'none';
        const fileURL = URL.createObjectURL(file);
        downloadAncher.href = fileURL;
        downloadAncher.download = fileName;
        downloadAncher.click();
      }
    },
    error => {
      console.error(`Something went wrong, try later !`);
    });
  }
  getAttachmentIcon(attachmentName) {
    let attachmentIcon = '';
    const splitted = attachmentName.split('.');
    const attachmentExt = splitted[splitted.length - 1];

    switch (attachmentExt) {
      case 'docx':
      case 'doc': {
        attachmentIcon = 'assets/images/ext/doc.svg';
        break;
      }
      case 'jpg':
      case 'png':
      case 'jpeg': {
        attachmentIcon = 'assets/images/ext/img.svg';
        break;
      }
      case 'pdf': {
        attachmentIcon = 'assets/images/ext/pdf.svg';
        break;
      }
      case 'pptx':
      case 'ppt': {
        attachmentIcon = 'assets/images/ext/ppt.svg';
        break;
      }
      case 'txt': {
        attachmentIcon = 'assets/images/ext/txt.svg';
        break;
      }
      case 'csv':
      case 'xlxs':
      case 'xls': {
        attachmentIcon = 'assets/images/ext/xls.svg';
        break;
      }
      case 'zip': {
        attachmentIcon = 'assets/images/ext/zip.svg';
        break;
      }
      default: {
        attachmentIcon = 'assets/images/ext/none.svg';
        break;
      }
    }
    return attachmentIcon;
  }

  get attachementDetailsFormArray(): FormArray {
    return this.emailTemplateForm.get('attachementDetailsModel') as FormArray;
  }
}
