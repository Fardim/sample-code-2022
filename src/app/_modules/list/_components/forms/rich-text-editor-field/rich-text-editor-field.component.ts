import { ListService } from '@services/list/list.service';
import { FieldlistContainer } from '@models/list-page/listpage';
import { distinctUntilChanged, takeUntil, debounceTime } from 'rxjs/operators';
import { CoreService } from '@services/core/core.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormPropertyComponent } from '../form-property';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Inject, LOCALE_ID, OnChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { OptionsObj } from 'mdo-ui-library/_constants';

@Component({
  selector: 'pros-rich-text-editor-field',
  templateUrl: './rich-text-editor-field.component.html',
  styleUrls: ['./rich-text-editor-field.component.scss']
})
export class RichTextEditorFieldComponent extends FormPropertyComponent implements OnInit, OnChanges, AfterViewInit {
  private _fieldlistContainer: FieldlistContainer;

  get fieldlistContainer(): FieldlistContainer { return this._fieldlistContainer };

  set fieldlistContainer(newFieldListContainer: FieldlistContainer) {
    if(this._fieldlistContainer === newFieldListContainer) { return ;}
    this._fieldlistContainer = newFieldListContainer;
    this.onFieldlistContainerChange(this._fieldlistContainer);
  }

  fieldDataTypeOptions: any[] = [
    {
      key: fieldDataTypes.CHAR,
      value: 'CHAR',
      tooltip: 'Accept all kind of data viz; character, numeric and special characters.'
    },
    {
      key: fieldDataTypes.NUMC,
      value: 'Numeric Value',
      tooltip: 'Accept only numeric values.'
    },
    {
      key: fieldDataTypes.DEC,
      value: 'Decimal Value',
      tooltip: 'Accepts numeric values with defined decimal places.'
    },
    {
      key: fieldDataTypes.ALTN,
      value: 'Alternate Number',
      tooltip: 'Used for storing the record number w.r.t the target integraton system.'
    },
    // {
    //   key: fieldDataTypes.ISCN,
    //   value: 'Integration Scenario',
    //   tooltip: 'Used for capturing the Interface Scenario ID for MDO to determine target integration system.'
    // },
    // {
    //   key: fieldDataTypes.REQ,
    //   value: 'Request Type',
    //   tooltip: 'Used to capture additional information while submitting or approving a request and decide on the request approvals.'
    // },
  ];
  filteredfieldDataTypeOptions: any[] = this.fieldDataTypeOptions;
  /**
   * Reference to the input
   */
  @ViewChild('optionsInput') optionInput: ElementRef<HTMLInputElement>;
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
    this.createRichTextFormGroup(this.fieldlistContainer && this.fieldlistContainer.fieldlist);
  }

  ngOnInit() {
    super.ngOnInit();
    this.optionCtrl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.unsubscribeAll$))
      .subscribe((searchString) => {
        this.filteredfieldDataTypeOptions = searchString ? this._filter(searchString) : this.fieldDataTypeOptions.slice();
      });
  }
  onFieldlistContainerChange(changes) {
    this.patchCommonFields(changes.fieldlist);
    this.patchValue(changes.fieldlist);
  }

  ngAfterViewInit() {

  }

  /**
   * mehtod to filter items based on the searchterm
   * @param value searchTerm
   * @returns string[]
   */
  _filter(value: string): OptionsObj[] {
    const filterValue = value.toLowerCase();

    return this.fieldDataTypeOptions.filter((num) => num.value.toString().toLowerCase().indexOf(filterValue) >= 0);
  }

  /**
   * add control according to control type
   */
  createRichTextFormGroup(data?: any) {
    this.formGroup.addControl(
      'dataType',
      new FormControl(data && data.dataType ? data.dataType : fieldDataTypes.CHAR, [Validators.required])
    );
    this.formGroup.addControl('isSearchEngine', new FormControl(data && data.isSearchEngine ? data.isSearchEngine : false, []));
    this.formGroup.addControl('isTransient', new FormControl(data && data.isTransient ? data.isTransient : false, []));

    this.optionCtrl.setValue(data && data.dataType ? data.dataType : fieldDataTypes.CHAR);
  }

  /**
   * patch form with new fieldList data. after ngonchange call this method to update with data.
   */
  patchValue(data?: any) {
    this.formGroup.patchValue({
      dataType: fieldDataTypes.CHAR,
      isSearchEngine: data && data.isSearchEngine ? data.isSearchEngine : false,
      isTransient: data && data.isTransient ? data.isTransient : false
    });
  }

  onChangeDescriptionType(event: boolean) {
    if (event) {
      this.formGroup.patchValue({
        isSearchEngine: true,
      });
    }
    this.fireValidationStatus();
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
    this.router.navigate(['.'], { relativeTo: this.route, fragment: null, queryParamsHandling: 'preserve' });
  }

  getQuillEditorId(): string {
    if (!this.fieldlistContainer) return '';
    else if (this.fieldlistContainer.childrenId) return this.fieldlistContainer.childrenId;
    else if (this.fieldlistContainer.parentSubGridId) return this.fieldlistContainer.parentSubGridId;
    else return this.fieldlistContainer.fieldId;
  }
}

export enum fieldDataTypes {
  CHAR = 'CHAR',
  NUMC = 'NUMC',
  DEC = 'DEC',
  ALTN = 'ALTN',
  ISCN = 'ISCN',
  REQ = 'REQ',
}
export enum textCases {
  CAMEL = 'CAMEL',
  UPPER = 'UPPER',
  LOWER = 'LOWER',
  NONE = 'NONE',
}
