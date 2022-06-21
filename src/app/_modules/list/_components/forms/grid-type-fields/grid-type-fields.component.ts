import { Component, Inject, LOCALE_ID, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { editorConfig, FieldlistContainer } from '@models/list-page/listpage';
import { CoreService } from '@services/core/core.service';
import { ListService } from '@services/list/list.service';
import { dropdownFieldDataTypes } from '../dropdown-field/dropdown-field.component';
import { FormPropertyComponent } from '../form-property';
import { fieldDataTypes, textCases } from '../text-field/text-field.component';

@Component({
  selector: 'pros-grid-type-fields',
  templateUrl: './grid-type-fields.component.html',
  styleUrls: ['./grid-type-fields.component.scss']
})
export class GridTypeFieldsComponent extends FormPropertyComponent implements OnInit, OnChanges{

  private _fieldlistContainer: FieldlistContainer;

  get fieldlistContainer(): FieldlistContainer { return this._fieldlistContainer };

  set fieldlistContainer(newFieldListContainer: FieldlistContainer) {
    if(this._fieldlistContainer === newFieldListContainer) { return ;}
    this._fieldlistContainer = newFieldListContainer;
    this.onFieldlistContainerChange(this._fieldlistContainer);
  }

  optionCtrl = new FormControl();
  textCaseOptionCtrl = new FormControl();
  editorConfig = editorConfig;

  constructor(
    public fb: FormBuilder,
    public readonly route: ActivatedRoute,
    public router: Router,
    public listService: ListService,
    public coreService: CoreService,
    @Inject(LOCALE_ID) public locale: string
  ) {
    super(fb, route, router, listService, coreService, locale);
    this.type = 'url';
    this.patchCommonFields(this.fieldlistContainer && this.fieldlistContainer.fieldlist);
    this.createURLFormGroup(this.fieldlistContainer && this.fieldlistContainer.fieldlist);
  }

  ngOnInit(): void{
    super.ngOnInit();
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
   }

  onFieldlistContainerChange(changes) {
    this.patchCommonFields(changes.fieldlist);
    this.patchValue(changes.fieldlist);
  }

  /**
   * add control according to control type
   */
  createURLFormGroup(data?: any) {
    this.formGroup.addControl(
      'dataType',
      new FormControl(data && data.dataType ? data.dataType : fieldDataTypes.CHAR, [Validators.required])
    );
    this.formGroup.addControl('textCase', new FormControl(data && data.textCase ? data.textCase : textCases.NONE, []));
    this.formGroup.addControl('isKeyField', new FormControl(data && data.isKeyField ? data.isKeyField : false, []));
    this.formGroup.addControl('isDescription', new FormControl(data && data.isDescription ? data.isDescription : false, []));
    this.formGroup.addControl('isSearchEngine', new FormControl(data && data.isSearchEngine ? data.isSearchEngine : false, []));
    this.formGroup.addControl('isTransient', new FormControl(data && data.isTransient ? data.isTransient : false, []));
    this.formGroup.addControl('isWorkFlow', new FormControl(data && data.isWorkFlow ? data.isWorkFlow : false, []));
    this.formGroup.addControl('decimalValue', new FormControl(data && data.decimalValue ? data.decimalValue : 0, []));
    this.optionCtrl.setValue(data && data.dataType ? data.dataType : fieldDataTypes.CHAR);
    this.textCaseOptionCtrl.setValue(data && data.textCase ? data.textCase : textCases.NONE);
  }

  /**
   * patch form with new fieldList data. after ngonchange call this method to update with data.
   */
  patchValue(data?: any) {
    this.formGroup.patchValue({
      dataType: data && data.dataType ? data.dataType : dropdownFieldDataTypes.CHAR,
      isKeyField: data && data.isKeyField ? data.isKeyField : false,
      isCriteriaField: data && data.isCriteriaField ? data.isCriteriaField : false,
      isWorkFlowCriteria: data && data.isWorkFlowCriteria ? data.isWorkFlowCriteria : false,
      isNumSettingCriteria: data && data.isNumSettingCriteria ? data.isNumSettingCriteria : false,
      isSearchEngine: data && data.isSearchEngine ? data.isSearchEngine : false,
      isWorkFlow: data && data.isWorkFlow ? data.isWorkFlow : false,
      isPermission: data && data.isPermission ? data.isPermission : false,
      isTransient: data && data.isTransient ? data.isTransient : false,
    })
  }

  fireValidationStatus(event?: any) {
    super.fireValidationStatus(this.fieldlistContainer);
  }

  close() {
    this.coreService.nextUpdateFieldPropertySubject({fieldId: this.fieldlistContainer.fieldId, isNew: this.fieldlistContainer.isNew, fieldlist: this.formGroup.value});
    this.coreService.closeEditDatasetFormDrawe(true);
    this.router.navigate(['.'], { relativeTo: this.route, fragment: null, queryParamsHandling: 'preserve' });
  }

  ngOnDestroy = () => {
    super.ngOnDestroy();
  }

  getQuillEditorId(): string {
    if (!this.fieldlistContainer) return '';
    else if (this.fieldlistContainer.childrenId) return this.fieldlistContainer.childrenId;
    else if (this.fieldlistContainer.parentSubGridId) return this.fieldlistContainer.parentSubGridId;
    else return this.fieldlistContainer.fieldId;
  }

}

