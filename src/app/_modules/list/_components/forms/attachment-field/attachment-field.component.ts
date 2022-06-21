import { Component, Inject, LOCALE_ID, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ATTACHMENT_FILE_TYPES, FieldlistContainer } from '@models/list-page/listpage';
import { CoreService } from '@services/core/core.service';
import { ListService } from '@services/list/list.service';
import { EditorService } from 'mdo-ui-library';
import { OptionsObj } from 'mdo-ui-library/_constants';
import { Observable } from 'rxjs';
import { debounceTime, map, startWith } from 'rxjs/operators';
import { FormPropertyComponent } from '../form-property';
import { fieldDataTypes, textCases } from '../text-field/text-field.component';

@Component({
  selector: 'pros-attachment-field',
  templateUrl: './attachment-field.component.html',
  styleUrls: ['./attachment-field.component.scss']
})
export class AttachmentFieldComponent extends FormPropertyComponent implements OnInit, OnChanges {

  private _fieldlistContainer: FieldlistContainer;

  get fieldlistContainer(): FieldlistContainer { return this._fieldlistContainer };

  set fieldlistContainer(newFieldListContainer: FieldlistContainer) {
    if(this._fieldlistContainer === newFieldListContainer) { return ;}
    this._fieldlistContainer = newFieldListContainer;
    this.onFieldlistContainerChange(this._fieldlistContainer);
  }

  attachmentTypeOptionCtrl = new FormControl();
  /**
   * store selecte attachment file types
   */
  options = [];

  editorConfig = {
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike', { list: 'ordered' }, { list: 'bullet' }, { color: [] }, { background: [] }], // toggle buttons
      ],
    },
    placeholder: 'Information for field on mouse hover of input',
    theme: 'snow', // or 'bubble'
  };
  /**
   * set attachment type options
   */
  attachmentTypeOptions: any[] = [
    {
      key: AttachmentType.DATA_RELATED,
      value: 'Data Related',
      tooltip: 'Will allow to upload one or more attachments when maintaining data.'
    },
    {
      key: AttachmentType.REQUEST_TYPE,
      value: 'Request Type',
      tooltip: 'Will allow to upload attachments while submitting or approving a request and decide on the request approvals.'
    }
  ];
  /**
   * attachement type options
   */
  filteredattachmentTypeOptions: OptionsObj[] = this.attachmentTypeOptions;

  attachmentFileTypeCtrl: FormControl = new FormControl();
  validateOnLoad = true;
/**
 * list of all attachment type
 */
  attachmentFileType = ATTACHMENT_FILE_TYPES;
  filteredAttachmentFileType: Observable<any[]>;
  constructor(
    public fb: FormBuilder,
    public readonly route: ActivatedRoute,
    public router: Router,
    public listService: ListService,
    public coreService: CoreService,
    private editorService: EditorService,
    @Inject(LOCALE_ID) public locale: string
  ) {
    super(fb, route, router, listService, coreService, locale);
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    this.type = 'attachment';
    this.patchCommonFields(this.fieldlistContainer && this.fieldlistContainer.fieldlist);
    this.createAttachmentFormGroup(this.fieldlistContainer && this.fieldlistContainer.fieldlist);
    console.log('Field');
    this.initFilter();
  }


  onFieldlistContainerChange(changes: FieldlistContainer) {
    this.patchCommonFields(changes.fieldlist);
    this.patchValue(changes.fieldlist);

    if(this.validateOnLoad) {
      this.patchAttachmentFilesType();
      this.validateOnLoad = false;
    }
  }

  initFilter() {
    this.filteredAttachmentFileType = this.attachmentFileTypeCtrl.valueChanges.pipe(
      debounceTime(400),
      startWith(''),
      map(value => this._filter(value))
    );
  }

  /**
   * method to filter dropdown values based on the typed string
   * @param value pass the value to be looked up in the list of values
   */
  _filter(value: any): any[] {
    let availableOptions = this.attachmentFileType;
    if(value){
      const filterValue = (isNaN(value))? value.toLowerCase(): value;
      availableOptions = this.attachmentFileType.filter(option => this.getLowerCaseLabel(option?.key).includes(filterValue));
    }

    return availableOptions;
  }

  /**
   * convert string to lowercase
   * @param value pass the string to be converted to lowercase
   */
  getLowerCaseLabel(value: any) {
    return value? value.toLowerCase(): '';
  }

  /**
   * add control according to control type.
   */
  createAttachmentFormGroup(data?: any) {
    this.formGroup.addControl(
      'dataType',
      new FormControl(data && data.dataType ? data.dataType : fieldDataTypes.CHAR, [Validators.required])
    );
    this.formGroup.addControl('textCase', new FormControl(data && data.textCase ? data.textCase : textCases.NONE, []));
    this.formGroup.addControl('isKeyField', new FormControl(data && data.isKeyField ? data.isKeyField : false, []));
    this.formGroup.addControl('isDescription', new FormControl(data && data.isDescription ? data.isDescription : false, []));
    this.formGroup.addControl('isSearchEngine', new FormControl(data && data.isSearchEngine ? data.isSearchEngine : false, []));
    this.formGroup.addControl('isTransient', new FormControl(data && data.isTransient ? data.isTransient : false, []));
    this.formGroup.addControl('fileTypes', new FormControl(data && data.fileTypes ? data.fileTypes : '', [Validators.required]));
    this.formGroup.addControl('isCheckList', new FormControl(data && data.isCheckList ? data.isCheckList : false, []));
    this.formGroup.addControl('attachmentSize', new FormControl(data && data.attachmentSize ? data.attachmentSize : 100, [Validators.required, Validators.min(1)]));
    this.attachmentTypeOptionCtrl.setValue(data && data.textCase ? data.textCase : AttachmentType.DATA_RELATED);
  }

  /**
   * patch form with new fieldList data. after ngonchange call this method to update with data.
   */
  patchValue(data?: any) {
    this.formGroup.patchValue({
      dataType: data && data.dataType ? data.dataType : fieldDataTypes.CHAR,
      textCase: data && data.textCase ? data.textCase : textCases.NONE,
      isKeyField: data && data.isKeyField ? data.isKeyField : false,
      isDescription: data && data.isDescription ? data.isDescription : false,
      isSearchEngine: data && data.isSearchEngine ? data.isSearchEngine : false,
      isTransient: data && data.isTransient ? data.isTransient : false,
      fileTypes: data && data.fileTypes ? data.fileTypes : '',
      isCheckList: data && data.isCheckList ? data.isCheckList : false,
      attachmentSize: data && data.attachmentSize ? data.attachmentSize : 100,
    });
    this.bindSelectedAttachmentFilesValues();
  }

  fireValidationStatus(event?: any) {
    super.fireValidationStatus(this.fieldlistContainer);
  }

  /**
   * bind the attachment file Types value in selected options.
   */
  bindSelectedAttachmentFilesValues() {
    if (this.formGroup.value.fileTypes !== '') {
    const fileTypes = this.formGroup.value.fileTypes.split(',');
    this.options = [];
      fileTypes.forEach(e => {
        const f = ATTACHMENT_FILE_TYPES.filter((d) => d.value === e);
        this.options.push(f[0]);
      });
    }
  }
  /**
   * patch attachment files value in formgroup.
   */
  patchAttachmentFilesType() {
    const values = this.options.map(e => e.value).join(',');
    this.formGroup.patchValue({
      fileTypes: values
    });
      this.fireValidationStatus();
  }
  /**
   * set selected attachment file type values
   */
  selected(value) {
    if (this.options.indexOf(value) === -1) {
      this.options.push(value);
      this.patchAttachmentFilesType();
    }
  }
  /**
   * remove selected attachement files type value
   */
  remove(value) {
    const index = this.options.indexOf(value);
    if (index !== -1) {
      this.options.splice(index, 1);
      this.patchAttachmentFilesType();
    }
  }

  /**
   * close the side sheet
   */
  close() {
    this.coreService.nextUpdateFieldPropertySubject({
      fieldId: this.fieldlistContainer.fieldId,
      isNew: this.fieldlistContainer.isNew,
      fieldlist: this.formGroup.value,
    });
    this.coreService.closeEditDatasetFormDrawe(true);
    this.router.navigate(['.'], { relativeTo: this.route, fragment: null, queryParamsHandling: 'preserve' });
  }

  getQuillEditorId(): string {
    if (!this.fieldlistContainer) return '';
    else if (this.fieldlistContainer.childrenId) return this.fieldlistContainer.childrenId;
    else if (this.fieldlistContainer.parentSubGridId) return this.fieldlistContainer.parentSubGridId;
    else return this.fieldlistContainer.fieldId;
  }
}

export enum AttachmentType{
  DATA_RELATED = 'Data Related',
  REQUEST_TYPE = 'Request Type'
}
