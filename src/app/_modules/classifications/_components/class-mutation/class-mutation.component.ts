import { ENTER } from '@angular/cdk/keycodes';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, LOCALE_ID, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { ValidationError } from '@models/schema/schema';

import { Userdetails } from '@models/userdetails';
import { Class, ClassType, ColloquialName, ColloquialNames, ResultInfo } from '@modules/classifications/_models/classifications';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { DmsService } from '@services/dms/dms.service';
import { RuleService } from '@services/rule/rule.service';
import { UserService } from '@services/user/userservice.service';
import { BlockElementTypes, TransientService } from 'mdo-ui-library';
import { forkJoin } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'pros-class-mutation',
  templateUrl: './class-mutation.component.html',
  styleUrls: ['./class-mutation.component.scss']
})
export class ClassMutationComponent implements OnInit, OnDestroy {
  @ViewChild('messageContainer') messageContainer: ElementRef<HTMLDivElement> ;

  @Input() closable = false;
  @Input() classType: ClassType;
  @Input() classDetails = {} as Class;
  @Input() classId: string;
  @Input() parent = '';
  @Output() close: EventEmitter<any> = new EventEmitter(null);

  readonly separatorKeysCodes = [ENTER] as const;

  subscriptionEnabled = true;
  loading = false;
  tenantId: string;
  classLabels = [];
  colloquials: ColloquialNames[] = [];

  fields = [
    { id: 'classType', value: '', type: 'ALL' },
    { id: 'code', value: '', type: 'ALL' },
    { id: 'codeLong', value: '', type: 'ALL' },
    { id: 'mod', value: '', type: 'NOUN' },
    { id: 'modLong', value: '', type: 'NOUN' },
    { id: 'numCod', value: '', type: 'NOUN' },
    { id: 'numMod', value: '', type: 'NOUN' },
    { id: 'description', value: '', type: 'ALL' },
    { id: 'colloquialName', value: '', type: 'ALL' },
    { id: 'imageUrl', value: [], type: 'NOUN' },
    { id: 'validFrom', value: '', type: 'ALL' },
    { id: 'inheritAttributes', value: true, type: 'ALL' },
    { id: 'isNoun', value: false, type: 'ALL' },
    { id: 'isCodePartOfDesc', value: false, type: 'NOUN' },
    { id: 'isModPartOfDesc', value: false, type: 'NOUN' },
    { id: 'referenceType', value: '', type: 'NOUN' },
    { id: 'referenceCode', value: '', type: 'NOUN' },
    { id: 'sapClass', value: '', type: 'NOUN' },
  ];

  // form
  classForm: FormGroup;
  limit = 1;

  moduleData = [];
  imageUrls = [];
  attachments = [];
  selectedFileNames = '';

  submitError: ValidationError = {
    status: false,
    message: ''
  };

  isModRequired = false;
  isModLongRequired = false;

  constructor(
    public fb: FormBuilder,
    private ruleService: RuleService,
    private sharedService: SharedServiceService,
    private transientService: TransientService,
    private dmsService: DmsService,
    private userService: UserService,
    @Inject(LOCALE_ID) public locale: string
  ) {
    this.locale = this.locale?.split('-')?.[0] || 'en';
  }

  ngOnInit(): void {
    this.initForm();
    this.loadData();
    this.userService.getUserDetails().subscribe((resp: Userdetails) => {
      this.tenantId = resp.plantCode;
    });
  }

  get isNoun() {
    return !!(this.classDetails?.uuid ? this.classDetails.isNoun : this.classType?.nountype);
  }

  get selectedColloquials() {
    return this.colloquials?.filter(c => c.language === this.locale) || [];
  }

  get disabled() {
    return this.classDetails?.classType?.enableSync && this.classDetails?.classType?.nountype;
  }

  loadData() {
    this.getClassDetails();
    this.loadColloquails();
  }

  onModValueChange(value) {
    this.isModLongRequired = !!value.trim();

    if (value.trim()) {
      this.classForm.get('modLong').setValidators(Validators.required);
    } else {
      this.classForm.get('modLong').removeValidators(Validators.required);
    }
  }

  onModLongValueChange(value) {
    this.isModRequired = !!value.trim();

    if (value.trim()) {
      this.classForm.get('mod').setValidators(Validators.required);
    } else {
      this.classForm.get('mod').removeValidators(Validators.required);
    }
  }

  initForm() {
    this.classForm = this.fb.group({});
    this.fields.map(f => {
      if (this.isNoun) {
        if (f.type === 'ALL' || f.type === 'NOUN') {
          this.classForm.addControl(f.id, this.fb.control(f.value));
          if (f.id === 'code' || f.id === 'codeLong' || f.id === 'description')
            this.classForm.get(f.id)?.setValidators(Validators.required);
        }
      }
      else {
        if (f.type === 'ALL' || f.type === 'CLASS') {
          this.classForm.addControl(f.id, this.fb.control(f.value));
          if (f.id === 'description')
            this.classForm.get(f.id)?.setValidators(Validators.required);
        }
      }
    })

    this.classForm.get('classType').setValue(this.classType?.classType);
    this.classForm.get('code')?.setValidators(Validators.required);
    this.classForm.get('isNoun').setValue(this.isNoun);
  }

  getClassDetails() {
    if (this.classId) {
      this.ruleService.getClassDetails(this.classId).pipe(takeWhile(() => this.subscriptionEnabled)).subscribe((data: ResultInfo<Class>) => {
        this.classDetails = data.response;
        this.initForm();
        this.classLabels = this.classDetails?.classLabels || [];
        const label = this.classLabels.find(x => x.language.toLowerCase() === this.locale);
        if (label) {
          this.classForm.get('code').setValue(label.code);
          this.classForm.get('codeLong').setValue(label.codeLong);

          if (this.classForm.get('mod')) {
            this.classForm.get('mod').setValue(label.mod);
          }

          if (this.classForm.get('modeLong')) {
            this.classForm.get('modeLong').setValue(label.modeLong);
          }
        }
        this.classForm.patchValue(data.response);
        this.classForm.get('classType').setValue(data.response.classType.classType);
        this.imageUrls = this.classDetails.imageUrl || [];
      });
    }
  }

  loadColloquails() {
    this.ruleService.getColloquialNames(this.classId).pipe(takeWhile(() => this.subscriptionEnabled)).subscribe(resp => {
      this.colloquials = resp.response.colloquialNames;
    });
  }

  async save() {
    this.submitError.status = false;

    try {
      this.loading = true;
      if (this.classForm.invalid) {
        Object.values(this.classForm.controls).forEach((control) => {
          if (control.invalid) {
            control.markAsTouched();
          }
        });
        this.loading = false;
        return false;
      }

      if (!this.isNoun)
        this.classForm.get('codeLong').setValue(this.classForm.get('code').value);

      if (this.isNoun) {
        await this.uploadImages();
        if (!this.classForm.get('imageUrl')?.value.length) {
          this.classForm.get('imageUrl').setValue('');
          // this.classForm.get('imageUrl').setValue(this.attachments.map(x => x.id));
        }
      }

      const formData = this.classForm.value;
      let labelFound = false;
      const label = this.classLabels.find(x => x.language.toLowerCase() === this.locale);

      if (label) {
        labelFound = true;
        label.code = formData.code;
        label.codeLong = formData.codeLong;
        label.mod = formData.mod || '';
        label.modLong = formData.modLong || '';
      }

      if (!labelFound) {
        this.classLabels.push({
          code: formData.code,
          codeLong: formData.codeLong,
          mod: formData?.mod,
          modLong: formData?.modLong,
          language: this.locale,
        });
      }

      const payload = {
        classLabels: this.classLabels,
        classType: this.classDetails?.classType,
        code: formData.code,
        codeLong: formData.codeLong,
        mod: formData?.mod || '',
        modLong:  formData?.modLong || '',
        numCod: formData?.numCod || '',
        numMod: formData?.numMod || '',
        description: formData.description,
        imageUrl: this.imageUrls || [],
        validFrom: formData.validFrom ? new Date(formData.validFrom).getTime() + '' : '0',
        isNoun: formData?.isNoun || false,
        isCodePartOfDesc: formData?.isCodePartOfDesc || '',
        isModPartOfDesc: formData?.isModPartOfDesc || '',
        referenceType: formData?.referenceType || '',
        referenceCode: this.classType?.uuid,
        sapClass: formData?.sapClass || '',
        uuid: this.classId,
        colloquialNames: this.colloquials,
        parentUuid: this.parent,
        inheritAttributes: formData?.inheritAttributes || false,
        tenantId: this.tenantId,
      }

      this.ruleService.saveUpdateClass(payload).pipe(takeWhile(() => this.subscriptionEnabled)).subscribe((data: ResultInfo<Class>) => {
        if (data?.response) {
          this.transientService.open('Successfully saved!', null, { duration: 2000, verticalPosition: 'bottom' });
          this.sharedService.publish({ type: this.classId ? 'CLASS/UPDATED' : 'CLASS/CREATED', payload: data.response });
        }
        this.loading=false;
        this.close.emit();
      }, (err) => {
        this.loading = false;

        this.messageContainer.nativeElement.scrollIntoView({ behavior: 'smooth' });

        this.submitError = {
          status: true,
          message: err.error?.errorMsg || 'Something went wrong!',
        };

        setTimeout(() => {
          this.submitError.status = false;
        }, 4000);
      });
    }
    catch(error){
      this.loading = false;

      this.messageContainer.nativeElement.scrollIntoView({ behavior: 'smooth' });

      this.submitError = {
        status: true,
        message: error?.message || 'Something went wrong!',
      };

      setTimeout(() => {
        this.submitError.status = false;
      }, 4000);
    }
  }

  uploadImages() {
    return new Promise<void>((resolve, reject) => {
      if (this.attachments.length) {
        const observables = [];
        this.attachments.forEach(attachment=>{
          if (!attachment?.id)
            observables.push(this.uploadImage(attachment));
        })
        return forkJoin(observables).pipe(takeWhile(() => this.subscriptionEnabled)).subscribe((res) => {
          console.log('upload-file', res);
          this.imageUrls = res;
          resolve();
        }, (err) => {
          this.transientService.open('Something went wrong while uploading file', null, { duration: 2000, verticalPosition: 'bottom' });
          reject(err);
        });
      } else {
        resolve();
      }
    });
  }

  uploadImage(attachment){
    return this.dmsService.uploadFile(attachment.file).pipe(map(imageUrl => {
        attachment.id = imageUrl;

        return imageUrl;
      })
    );
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
        case 'ppt': {
          attachmentIcon = 'assets/images/ext/ppt.svg';
          break;
        }
        case 'txt': {
          attachmentIcon = 'assets/images/ext/txt.svg';
          break;
        }
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

    /**
     * truncate attachment name after 25 chars
     * @param attachmentName attachment name
     * @returns truncated name
     */
    truncateAttachmentName(attachmentName: string) {
      if (attachmentName.length < 25) {
        return attachmentName;
      }

      const name = attachmentName.split('.');
      if (name.length > 1) {
        return name[0].substr(0, 25 - name[1].length).toString() + '...' + name[1];
      }
      return name[0].substr(0, 25);
    }

    removeAttachment(index): void {
      this.attachments.splice(index, 1);
    }

    uploadAttachments(files: File[]): void {
      if (!files) {
        return;
      }
      for (const file of files) {
        console.log(file.name);
        const block = {
          type: BlockElementTypes.LINK,
          url: '',
          fileName: file.name,
        };
        const attachment = {
          id:'',
          status:'',
          file,
          block,
          uploadError: false,
          uploaded: false,
          uploadProgress: 0,
        };
        this.attachments.push(attachment);
      }
    }

  editorValueChange(event) {
    this.classForm.get('description').setValue(event.newValue);
  }

  addColloquial(event: MatChipInputEvent): void {
    const input = event.input;
    const value = (event.value || '').trim();
    let order = this.colloquials.length;

    if (value) {
      let colloquial = this.colloquials
        .find((sel: any) => sel.colloquialName?.trim().toLowerCase() === value?.toLowerCase());

      if (!colloquial) {
        colloquial = {
          calloquialName: value,
          collorder: order++,
          language: this.locale,
          xref: ''
        };

        this.colloquials.push(colloquial);
      }
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  removeColloquial(colloquial: ColloquialName): void {
    const item = this.colloquials.find((sel: ColloquialName) => sel.language === this.locale &&  sel.calloquialName === colloquial.calloquialName)
    const index = this.colloquials.indexOf(item);

    if (index >= 0) {
      this.colloquials.splice(index, 1);
    }
  }

  closeDialog() {
    this.close.emit();
  }

  ngOnDestroy(): void {
    this.subscriptionEnabled = false;
  }
}
