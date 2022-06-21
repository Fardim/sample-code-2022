import { takeUntil } from 'rxjs/operators';
import { EditorService } from 'mdo-ui-library';
import { CoreService } from '@services/core/core.service';
import { ListService } from '@services/list/list.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { FieldlistContainer } from '@models/list-page/listpage';
import { Component, OnInit, OnChanges, Inject, LOCALE_ID } from '@angular/core';
import { FormPropertyComponent } from '../form-property';

@Component({
  selector: 'pros-radio-button-field',
  templateUrl: './radio-button-field.component.html',
  styleUrls: ['./radio-button-field.component.scss'],
})
export class RadioButtonFieldComponent extends FormPropertyComponent implements OnInit, OnChanges {

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

  listTypeOptionCtrl = new FormControl();

  queryParams = {};

  constructor(
    public fb: FormBuilder,
    public readonly route: ActivatedRoute,
    public router: Router,
    public listService: ListService,
    public coreService: CoreService,
    private editorService: EditorService,
    private activatedRoute: ActivatedRoute,
    @Inject(LOCALE_ID) public locale: string
  ) {
    super(fb, route, router, listService, coreService, locale);
    this.patchCommonFields(this.fieldlistContainer && this.fieldlistContainer.fieldlist);
    this.createTextFormGroup(this.fieldlistContainer && this.fieldlistContainer.fieldlist);
  }

  ngOnInit() {
    super.ngOnInit();
    this.activatedRoute.queryParams.pipe(takeUntil(this.unsubscribeAll$)).subscribe(resp => {
      this.queryParams = JSON.parse(JSON.stringify(resp));
    })
  }
  onFieldlistContainerChange(changes) {
    console.log('radio button: ', this.fieldlistContainer);
    this.patchCommonFields(changes.fieldlist);
    this.patchValue(changes.fieldlist);
  }

  /**
   * add control according to control type
   */
  createTextFormGroup(data?: any) {
    this.formGroup.addControl('isSearchEngine', new FormControl(data && data.isSearchEngine ? data.isSearchEngine : false, []));
    this.formGroup.addControl('isTransient', new FormControl(data && data.isTransient ? data.isTransient : false, []));
    this.formGroup.addControl('optionsLimit', new FormControl(data && data.optionsLimit ? data.optionsLimit : 1, [Validators.min(1), Validators.max(9)]));

    this.listTypeOptionCtrl.setValue(this.listTypeOptionCtrl.value === ('' || null) ? 'radio' : this.listTypeOptionCtrl.value);
  }

  /**
   * patch form with new fieldList data. after ngonchange call this method to update with data.
   */
  patchValue(data?: any) {
    this.formGroup.patchValue({
      isSearchEngine: data && data.isSearchEngine ? data.isSearchEngine : false,
      isTransient: data && data.isTransient ? data.isTransient : false,
      optionsLimit: data && data.optionsLimit ? data.optionsLimit : 1,
    });
  }

  /**
   * open the side sheet for the edit value
   */
  openListvaluePanel() {
    this.router.navigate(
      [
        {
          outlets: {
            sb: `sb/list/dropdown-values/${this.listTypeOptionCtrl.value}/${this.moduleId}/${this.fieldlistContainer.fieldId}`,
          },
        },
      ],
      {
        queryParams: { ...this.queryParams, limit: this.formGroup.value.optionsLimit },
        // queryParamsHandling: 'preserve',
        preserveFragment: true,
      }
    );
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
    this.router.navigate(['.'], { relativeTo: this.route, fragment: null, queryParamsHandling: 'preserve' });
  }

  getQuillEditorId(): string {
    if (!this.fieldlistContainer) return '';
    else if (this.fieldlistContainer.childrenId) return this.fieldlistContainer.childrenId;
    else if (this.fieldlistContainer.parentSubGridId) return this.fieldlistContainer.parentSubGridId;
    else return this.fieldlistContainer.fieldId;
  }
}
