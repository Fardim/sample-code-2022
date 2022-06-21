import { ListService } from '@services/list/list.service';
import { FieldlistContainer } from '@models/list-page/listpage';
import { distinctUntilChanged, takeUntil, debounceTime } from 'rxjs/operators';
import { CoreService } from '@services/core/core.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormPropertyComponent } from '../form-property';
import { AbstractControl, FormBuilder, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Component, OnInit, Inject, LOCALE_ID, OnChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { OptionsObj } from 'mdo-ui-library/_constants';
import { EditorService } from 'mdo-ui-library';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';

@Component({
  selector: 'pros-text-field',
  templateUrl: './text-field.component.html',
  styleUrls: ['./text-field.component.scss'],
})
export class TextFieldComponent extends FormPropertyComponent implements OnInit, OnChanges, AfterViewInit {
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

  textCasesOptions: OptionsObj[] = [
    {
      key: textCases.CAMEL,
      value: 'Camel Case',
    },
    {
      key: textCases.UPPER,
      value: 'Upper Case',
    },
    {
      key: textCases.LOWER,
      value: 'Lower Case',
    },
    {
      key: textCases.NONE,
      value: 'None',
    },
  ];
  filteredtextCasesOptions: OptionsObj[] = this.textCasesOptions;
  /**
   * Reference to the input
   */
  @ViewChild('optionsInput') optionInput: ElementRef<HTMLInputElement>;
  isDataTypeValid = true;
  textCaseOptionCtrl = new FormControl();
  dataTypeOptionCtrl = new FormControl();

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
    public sharedService: SharedServiceService,
    @Inject(LOCALE_ID) public locale: string
  ) {
    super(fb, route, router, listService, coreService, locale);
    this.type = 'text';
    this.patchCommonFields(this.fieldlistContainer && this.fieldlistContainer.fieldlist);
    this.createTextFormGroup(this.fieldlistContainer && this.fieldlistContainer.fieldlist);
  }

  ngOnInit() {
    super.ngOnInit();
    this.dataTypeOptionCtrl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.unsubscribeAll$))
      .subscribe((searchString) => {
        const value = searchString && searchString.value ? '' : searchString ? searchString : '';
        this.filteredfieldDataTypeOptions = value ? this._filter(value) : this.fieldDataTypeOptions.slice();

        if(this.formGroup.controls.dataType.errors?.required) {
          this.isDataTypeValid = false;
          this.fireValidationStatus();
        }
        else if(this.formGroup.controls.dataType.errors?.dataTypeError) {
          this.isDataTypeValid = true;
          this.fireValidationStatus();
        }
      });

    this.textCaseOptionCtrl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.unsubscribeAll$))
      .subscribe((searchString) => {
        // const value = searchString ? searchString.toLowerCase() : '';
        const value = searchString && searchString.value ? '' : searchString ? searchString : '';
        this.filteredtextCasesOptions = value
          ? this.textCasesOptions.filter((d) => d.value.toString().toLowerCase().indexOf(value) >= 0)
          : this.textCasesOptions.slice();
      });

    this.sharedService.getAfterDataRefSave().pipe(takeUntil(this.unsubscribeAll$)).subscribe(resp => {
      if(resp) {
        const rules = this.sharedService.getDatasetRefArr(this.fieldId);
        this.formGroup.patchValue({refrules: rules || []});
        this.sharedService.setDataRefDetails(null);
        this.fireValidationStatus();
      }
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
  createTextFormGroup(data?: any) {
    this.formGroup.addControl('dataType', new FormControl(data && data.dataType ? data.dataType : fieldDataTypes.CHAR, [Validators.required, this.dataTypeValidator()]));
    this.formGroup.addControl('textCase', new FormControl(data && data.textCase ? data.textCase : textCases.NONE, []));
    this.formGroup.addControl('isKeyField', new FormControl(data && data.isKeyField ? data.isKeyField : false, []));
    this.formGroup.addControl('isDescription', new FormControl(data && data.isDescription ? data.isDescription : false, []));
    this.formGroup.addControl('isSearchEngine', new FormControl(data && data.isSearchEngine ? data.isSearchEngine : false, []));
    this.formGroup.addControl('isTransient', new FormControl(data && data.isTransient ? data.isTransient : false, []));
    this.formGroup.addControl('isWorkFlow', new FormControl(data && data.isWorkFlow ? data.isWorkFlow : false, []));
    this.formGroup.addControl('decimalValue', new FormControl(data && data.decimalValue ? data.decimalValue : 0, []));
    this.formGroup.addControl('isReference', new FormControl(data && data.isReference ? data.isReference : 0, []));
    this.formGroup.addControl('refrules', new FormControl(data && data.refrules ? data.refrules : null, []));

    const foundTextCase = this.textCasesOptions.find(d=> data && d.key === data.textCase);
    this.textCaseOptionCtrl.setValue(foundTextCase ? foundTextCase : {
      key: textCases.NONE,
      value: 'None',
    });
    const found = this.fieldDataTypeOptions.find(d=> data && d.key === data.dataType);
    this.dataTypeOptionCtrl.setValue(found ? found: null);
  }

  /**
   * patch form with new fieldList data. after ngonchange call this method to update with data.
   */
  patchValue(data?: any) {
    // data.dataType = 'NUMC';
    this.formGroup.patchValue({
      dataType: data && data.dataType ? data.dataType : fieldDataTypes.CHAR,
      textCase: data && data.textCase ? data.textCase : textCases.NONE,
      isKeyField: data && data.isKeyField ? data.isKeyField : false,
      isDescription: data && data.isDescription ? data.isDescription : false,
      isSearchEngine: data && data.isSearchEngine ? data.isSearchEngine : false,
      isTransient: data && data.isTransient ? data.isTransient : false,
      isWorkFlow: data && data.isWorkFlow ? data.isWorkFlow : false,
      decimalValue: data && data.decimalValue ? data.decimalValue : 0,
      isReference: data && data.isReference ? data.isReference : false,
      refrules: data && data.refrules ? data.refrules : null
    });

    if(!this.isDataTypeValid) {
      this.formGroup.controls.dataType.setValue(null);
    }

    const foundTextCase = this.textCasesOptions.find(d=> data && d.key === data.textCase);
    this.textCaseOptionCtrl.setValue(foundTextCase ? foundTextCase : {
      key: textCases.NONE,
      value: 'None',
    });
    // this.textCaseOptionCtrl.setValue(data && data.textCase ? data.textCase : textCases.NONE);
    const found = this.fieldDataTypeOptions.find(d=> data && d.key === data.dataType);
    this.dataTypeOptionCtrl.setValue(found ? found: null);
  }

  onSelectTextCase(event) {
    this.formGroup.patchValue({
      textCase: event.option.value.key,
    });
    this.textCaseOptionCtrl.setValue(null);
    this.fireValidationStatus();
  }
  onSelectDataType(event) {
    this.formGroup.patchValue({
      dataType: event.option.value.key,
    });
    this.dataTypeOptionCtrl.setValue(null);
    this.fireValidationStatus();
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
    this.coreService.closeEditDatasetFormDrawe(true);
    this.router.navigate(['.'], { relativeTo: this.route, fragment: null, queryParamsHandling: 'preserve' });
  }

  getQuillEditorId(): string {
    if (!this.fieldlistContainer) return '';
    else if (this.fieldlistContainer.childrenId) return this.fieldlistContainer.childrenId;
    else if (this.fieldlistContainer.parentSubGridId) return this.fieldlistContainer.parentSubGridId;
    else return this.fieldlistContainer.fieldId;
  }

  /**
   * open side sheet for the data referencing.
   */
  openDataReferencing() {
    this.sharedService.setDataRefDetails(this.formGroup.value?.refrules || []);
    this.router.navigate([{ outlets: { sb: `sb/list/data-referencing/${this.moduleId}/${this.fieldlistContainer.fieldId.replace('new', '')}` } }], {
      queryParamsHandling: 'preserve',
      preserveFragment: true,
    });
  }

  dataTypeValidator = (): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
      if(control.value) {
        if(!(Object.values(fieldDataTypes).includes(control.value))) {
          return {dataTypeError: true};
        } else {
          return null;
        }
      } else {
        return null;
      }
    };
  }

  /**
   * Should return field descriptions
   * @param obj curret render object
   */
  displayFn(obj: any): string {
    return obj ? obj.value : null;
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
