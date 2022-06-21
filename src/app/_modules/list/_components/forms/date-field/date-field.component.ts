import { FieldlistContainer } from '@models/list-page/listpage';
import { EditorService } from 'mdo-ui-library';
import { CoreService } from '@services/core/core.service';
import { ListService } from '@services/list/list.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl } from '@angular/forms';
import { Component, OnInit, Inject, LOCALE_ID, OnChanges } from '@angular/core';
import { FormPropertyComponent } from '../form-property';

@Component({
  selector: 'pros-date-field',
  templateUrl: './date-field.component.html',
  styleUrls: ['./date-field.component.scss']
})
export class DateFieldComponent extends FormPropertyComponent implements OnInit, OnChanges {

  private _fieldlistContainer: FieldlistContainer;

  get fieldlistContainer(): FieldlistContainer { return this._fieldlistContainer };

  set fieldlistContainer(newFieldListContainer: FieldlistContainer) {
    if(this._fieldlistContainer === newFieldListContainer) { return ;}
    this._fieldlistContainer = newFieldListContainer;
    this.onFieldlistContainerChange(this._fieldlistContainer);
  }

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
    private editorService: EditorService,
    @Inject(LOCALE_ID) public locale: string
  ) {
    super(fb, route, router, listService, coreService, locale);
    this.patchCommonFields(this.fieldlistContainer && this.fieldlistContainer.fieldlist);
    this.createTextFormGroup(this.fieldlistContainer && this.fieldlistContainer.fieldlist);
  }

  ngOnInit() {
    super.ngOnInit();
  }
  onFieldlistContainerChange(changes) {
    this.patchCommonFields(changes.fieldlist);
    this.patchValue(changes.fieldlist);
  }


  /**
   * add control according to control type
   */
   createTextFormGroup(data?: any) {
    this.formGroup.addControl('isPastDate', new FormControl(data && data.isPastDate ? data.isPastDate : false, []));
    this.formGroup.addControl('isFutureDate', new FormControl(data && data.isFutureDate ? data.isFutureDate : false, []));
    this.formGroup.addControl('isDefault', new FormControl(data && data.isDefault ? data.isDefault : false, []));
    this.formGroup.addControl('isSearchEngine', new FormControl(data && data.isSearchEngine ? data.isSearchEngine : false, []));
    this.formGroup.addControl('isTransient', new FormControl(data && data.isTransient ? data.isTransient : false, []));
  }

  /**
   * patch form with new fieldList data. after ngonchange call this method to update with data.
   */
  patchValue(data?: any) {
    this.formGroup.patchValue({
      isPastDate: data && data.isPastDate ? data.isPastDate : false,
      isFutureDate: data && data.isFutureDate ? data.isFutureDate : false,
      isDefault: data && data.isDefault ? data.isDefault : false,
      isSearchEngine: data && data.isSearchEngine ? data.isSearchEngine : false,
      isTransient: data && data.isTransient ? data.isTransient : false
    });
  }

  /**
   * @param event isPastDate checked or not
   * if past date is checked then future date must be unchecked
   */
  onChangePastDate(event: boolean) {
    if (event) {
      this.formGroup.patchValue({
        isFutureDate: false,
      });
    }
    this.fireValidationStatus();
  }

  /**
   * @param event is Future Date chekced or not
   * if future date is checked then the post date must be unchecked
   */
  onChangeFutureDate(event: boolean) {
    if (event) {
      this.formGroup.patchValue({
        isPastDate: false,
      });
    }
    this.fireValidationStatus();
  }

  /**
   * Let field.component.ts know that the FormGroup is valid or not
   * And then update the field.component.ts with current formgroup value
   */
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
