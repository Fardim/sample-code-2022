import { Component, OnInit, Inject, LOCALE_ID, OnChanges } from '@angular/core';
import { FieldlistContainer } from '@models/list-page/listpage';
import { FormPropertyComponent } from '../form-property';
import { FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreService } from '@services/core/core.service';
import { ListService } from '@services/list/list.service';

@Component({
  selector: 'pros-email-field',
  templateUrl: './email-field.component.html',
  styleUrls: ['./email-field.component.scss']
})
export class EmailFieldComponent extends FormPropertyComponent implements OnInit, OnChanges {

  private _fieldlistContainer: FieldlistContainer;

  get fieldlistContainer(): FieldlistContainer { return this._fieldlistContainer };

  set fieldlistContainer(newFieldListContainer: FieldlistContainer) {
    if(this._fieldlistContainer === newFieldListContainer) { return ;}
    this._fieldlistContainer = newFieldListContainer;
    this.onFieldlistContainerChange(this._fieldlistContainer);
  }

  optionCtrl = new FormControl();
  textCaseOptionCtrl = new FormControl();
  editorConfig = {
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike', { list: 'ordered' }, { list: 'bullet' }, { color: [] }, { background: [] }], // toggle buttons
      ],
    },
    placeholder: 'information for field on mouse hover of input',
    theme: 'snow', // or 'bubble'
  };

  constructor(
    public fb: FormBuilder,
    public readonly route: ActivatedRoute,
    public router: Router,
    public listService: ListService,
    public coreService: CoreService,
    @Inject(LOCALE_ID) public locale: string
  ) {
    super(fb, route, router, listService, coreService, locale);
    this.patchCommonFields(this.fieldlistContainer && this.fieldlistContainer.fieldlist);
    this.createEmailFormGroup(this.fieldlistContainer && this.fieldlistContainer.fieldlist);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  onFieldlistContainerChange(changes) {
    this.patchCommonFields(changes.fieldlist);
    this.patchValue(changes.fieldlist);
  }

  /**
   * add control according to control type
   */
   createEmailFormGroup(data?: any) {
    this.formGroup.addControl('isSearchEngine', new FormControl(data && data.isSearchEngine ? data.isSearchEngine : false, []));
    this.formGroup.addControl('isTransient', new FormControl(data && data.isTransient ? data.isTransient : false, []));
  }

  /**
   * patch form with new fieldList data. After ngOnChange call this method to update with data.
   */
   patchValue(data?: any) {
    this.formGroup.patchValue({
      isSearchEngine: data && data.isSearchEngine ? data.isSearchEngine : false,
      isTransient: data && data.isTransient ? data.isTransient : false,
    })
  }

  fireValidationStatus(event?: any) {
    super.fireValidationStatus(this.fieldlistContainer);
  }

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
