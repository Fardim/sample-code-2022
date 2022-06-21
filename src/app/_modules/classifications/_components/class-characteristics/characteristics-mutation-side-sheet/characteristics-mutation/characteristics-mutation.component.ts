import { ValidationError } from './../../../../../../_models/schema/schema';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Component, EventEmitter, OnInit, Output, OnDestroy, ViewChild, ElementRef, LOCALE_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { RuleService } from '@services/rule/rule.service';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { Characteristics, Dimensions, LanguageLabel, languages, ResultInfo } from '@modules/classifications/_models/classifications';
import { TransientService } from 'mdo-ui-library';
import { UserService } from '@services/user/userservice.service';
import { MatTableDataSource } from '@angular/material/table';
import { debounceTime, takeWhile } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { CharacteristicsExpansionViewDialogComponent } from '../../characteristics-expansion-view-dialog/characteristics-expansion-view-dialog.component';
import { Subscription } from 'rxjs';

export const characteristicsField = [
  { id: 'charCode', name: $localize`:@@name:Name` },
  { id: 'language', name: $localize`:@@language:Language` },
  { id: 'charDesc', name: $localize`:@@description:Description` },
  { id: 'numCode', name: $localize`:@@num_code:Characteristic numeric code` },
  { id: 'fieldType', name: $localize`:@@characteristic_type:Characteristic type` },
  { id: 'dataType', name: $localize`:@@data_type:Data Type` },
  { id: 'length', name: $localize`:@@length:Length` },
  { id: 'decimal', name: $localize`:@@decimal_places:Decimal Places` },
  { id: 'currency', name: $localize`:@@currency:Currency` },
  { id: 'prefix', name: $localize`:@@characteristic_prefix_for_short_description:Characteristic prefix for short description` },
  { id: 'longPrefix', name: $localize`:@@characteristic_prefix_for_long_description:Characteristic prefix for long description` },
  { id: 'suffix', name: $localize`:@@characteristic_suffix_for_short_description:Characteristic suffix for short description` },
  { id: 'longSuffix', name: $localize`:@@characteristic_suffix_for_long_description:Characteristic suffix for long description` },
  { id: 'isAllowMultipleValue', name: $localize`:@@allows_maintaining_multiple_values:Allows maintaining multiple values` },
  { id: 'isManatory', name: $localize`:@@required_characteristics:Required characteristic` },
  { id: 'isAllowValueRange', name: $localize`:@@allow_maintaining_value_range:Allows maintaining value range` },
  { id: 'isAllowUpperCase', name: $localize`:@@allow_maintaining_data_in_upper_case_only:Allow maintaining data in upper case only` },
  { id: 'isAllowNegative', name: $localize`:@@allow_maintaining_negative_values:Allow maintaining negative values` },
  { id: 'isAllowNewValue', name: $localize`:@@allow_maintaining_new_value:Allow maintaining new values` },
  { id: 'enableDuplicateCheck', name: $localize`:@@enable_for_duplicate_check:Enable for duplicate check` },
  { id: 'dimensionType', name: $localize`:@@dimension:Dimension` },
  { id: 'defaultUoM', name: $localize`:@@default_unit_of_measure:Default Unit of measure` },
  { id: 'status', name: $localize`:@@status:Status` },
  { id: 'validFrom', name: $localize`:@@valid_from:Valid From` },
  { id: 'validTo', name: $localize`:@@valid_to:Valid To` },
  { id: 'helpText', name: $localize`:@@help_text:Help Text` },
  { id: 'sapChars', name: $localize`:@@sap_chars:SAP characteristics` },
];

@Component({
  selector: 'pros-characteristics-mutation',
  templateUrl: './characteristics-mutation.component.html',
  styleUrls: ['./characteristics-mutation.component.scss']
})
export class CharacteristicsMutationComponent implements OnInit, OnDestroy {
  @ViewChild('messageContainer') messageContainer: ElementRef<HTMLDivElement>;
  @Output() getCharacteristics: EventEmitter<any> = new EventEmitter<boolean>();
  @Output() closeComponent: EventEmitter<any> = new EventEmitter(null);

  _locale: string;
  dataSource: MatTableDataSource<any>;
  columns = ['selected', ...characteristicsField.map((data) => data.id)];

  form: FormGroup;
  // characteristicsData: any[];

  isHeaderChecked = false;
  isIndeterminate = false;

  allLanguages = languages;
  fieldTypeList = [
    { name: 'TEXT' },
    { name: 'DROPDOWN' },
    { name: 'DATE' },
    { name: 'TIME' },
    { name: 'CURRENCY' },
    { name: 'RICH TEXT EDITOR' }
  ];
  dimensionTypeList: Dimensions[] = [];

  characteristics: [];
  uuid;
  tenantId;
  subscriptionEnabled = true;
  CheckboxOptions = [
    {
      label: 'Delete',
      value: 'delete'
    }
  ];

  submitError: ValidationError = {
    status: false,
    message: ''
  };

  subScription: Subscription;
  formElementForCheckValue: any;
  classDesc;

  constructor(
    public formBuilder: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private ruleService: RuleService,
    private sharedService: SharedServiceService,
    private transientService: TransientService,
    private userService: UserService,
    @Inject(LOCALE_ID) private locale: string
  ) {
    this._locale = this.locale.split('-')[0] || 'en';
  }

  ngOnInit(): void {
    this.subScription = this.sharedService.refreshReorderList.subscribe((data) => {
      let element = this.formElementForCheckValue;
      if (data && data.form) {
        // this.selectedLabel = data.selectedLabel;
        const labelsFormArray = data.labelsFormArray;
        const labels = element.controls.labels as FormArray;
        if (labelsFormArray.value) {
          while (labels.value.length) {
            labels.removeAt(0);
          }
          labelsFormArray.value.forEach((label) => labels.push(new FormControl(label)));
        }

        setTimeout(() => {
          element.setValue({
            ...data.form,
            language: data.selectedLabel?.language || this._locale
          });
        })
        element.get('helpText').setValue(data.form.helpText);

        element.get('dataType').setValue(data.form.dataType);

        this.validateFieldTypeChange(element, data.form.fieldType);

        element.get('helpText').updateValueAndValidity();

        this.handleFieldsBehavior(element);
      }
    });
    this.uuid = window.history.state.classId;
    this.classDesc = window.history.state.classDesc;
    this.initForm();

    this.dataSource = new MatTableDataSource(this.frmArray.controls);

    this.form.valueChanges.subscribe((characteristics) => {
      // this.characteristicsData = characteristics.frmArray;
      this.updateMasterToggle();
    });

    this.loadDimensions();

    this.sharedService
      .ofType<any>('CHARACTERISTICS/LABELS/SAVED')
      .pipe(takeWhile(() => this.subscriptionEnabled))
      .subscribe((data) => {
        if (data.payload) {
          const { itemIndex } = data.payload;
          const element = this.frmArray.controls[itemIndex] as FormGroup;
          const labels = element.get('labels') as FormArray;
          const lang = element.get('language').value;

          while (labels.length) {
            labels.removeAt(0);
          }

          data.payload.labels.forEach((label) => {
            labels.push(new FormControl(label));
          });
          this.onLanguageChange(element, lang);
        }
      });
  }

  updateMasterToggle() {
    const selectedCount = this.frmArray.value.filter((char) => char.selected).length;
    this.isHeaderChecked = !!selectedCount;
    this.isIndeterminate = selectedCount > 0 && selectedCount !== this.frmArray.value.length;
  }

  /**
   * Add form
   */
  addForm() {
    const form = this.formBuilder.group({
      selected: new FormControl(false),
      charCode: new FormControl('', [Validators.required]),
      language: new FormControl(this._locale, []),
      charDesc: new FormControl('', [Validators.required]),
      numCode: new FormControl('', []),
      fieldType: new FormControl('', [Validators.required]),
      dataType: new FormControl({ value: '', disabled: true }, [Validators.required]),
      length: new FormControl({ value: '', disabled: true }, []),

      // TO FIX, property name with request Payload
      decimal: new FormControl({ value: '', disabled: true }, []),
      currency: new FormControl({ value: '', disabled: true }, []),

      prefix: new FormControl('', []),
      longPrefix: new FormControl('', []),
      suffix: new FormControl('', []),
      longSuffix: new FormControl('', []),

      // TO FIX, property name with request Payload
      isAllowMultipleValue: new FormControl(false, []),

      isManatory: new FormControl(true, []),
      labels: new FormArray([]),

      // TO FIX, property name with request Payload
      isAllowValueRange: new FormControl({ value: false, disabled: true }, []),
      isAllowUpperCase: new FormControl({ value: false, disabled: true }, []),
      isAllowNegative: new FormControl({ value: false, disabled: true }, []),
      isAllowNewValue: new FormControl({ value: false, disabled: true }, []),

      dimensionType: new FormControl('', []),

      // TO FIX, property name with request Payload
      defaultUoM: new FormControl('', []),
      status: new FormControl(true, []),
      validFrom: new FormControl('', []),
      validTo: new FormControl('', []),

      helpText: new FormControl('', []),
      sapChars: new FormControl('', []),

      // TO FIX, property name with request Payload
      enableDuplicateCheck: new FormControl(false, []),

      uoMs: new FormArray([]),
      typeList: new FormArray([])
    });

    this.frmArray.push(form);

    form.controls.fieldType.valueChanges.subscribe((val) => {
      console.log('fieldType.valueChanges', form);
      this.checkForFieldTypeChange(form, val);
    });

    form.controls.dataType.valueChanges.subscribe((val) => {
      console.log('dataType.valueChanges', val);
      this.checkForDataTypeChange(form, val);
    });

    form.controls.dimensionType.valueChanges.subscribe((val) => {
      if (val) {
        form.get('defaultUoM').setValidators([Validators.required]);
      } else {
        form.get('defaultUoM').clearValidators();
        form.get('defaultUoM').setValue('');
        const arr = form.get('uoMs') as FormArray;
        arr.clear();
      }
    });
  }

  /**
   * Initialize form
   */
  initForm() {
    this.form = this.formBuilder.group({
      frmArray: this.formBuilder.array([])
    });
    this.addForm();
  }

  /**
   * Get parent node array
   */
  get frmArray(): FormArray {
    return this.form.get('frmArray') as FormArray;
  }

  masterToggle(event) {
    console.log(event?.value);

    switch (event?.value) {
      case 'delete': {
        for (let index = this.frmArray.controls.length - 1; index >= 0; index--) {
          if (this.frmArray.at(index).value.selected) this.frmArray.removeAt(index);
        }

        this.dataSource = new MatTableDataSource(this.frmArray.controls);
        break;
      }
      case 'select_none': {
        this.frmArray.controls.forEach((control: any) => {
          control.controls.selected.setValue(false);
        });
        break;
      }
      case 'select_this_page': {
        this.frmArray.controls.forEach((control: any) => {
          control.controls.selected.setValue(true);
        });
        break;
      }
      default:
        break;
    }
    if (this.frmArray.controls.length <= 0) this.isHeaderChecked = false;
  }

  toggle(element: FormGroup) {
    element.get('selected').setValue(!element.get('selected').value);
  }

  loadDimensions() {
    this.ruleService
      .getDimensions()
      .pipe(takeWhile(() => this.subscriptionEnabled))
      .subscribe((res: ResultInfo<Dimensions[]>) => {
        this.dimensionTypeList = res.response;
      });
  }

  loadUoM(element: FormGroup, uuid: string) {
    this.ruleService
      .getDimensionsById(uuid)
      .pipe(
        debounceTime(1000),
        takeWhile(() => this.subscriptionEnabled)
      )
      .subscribe((res: ResultInfo<Dimensions>) => {
        const array = element.controls.uoMs as FormArray;

        while (array.value.length) {
          array.removeAt(0);
        }

        (res.response?.values || []).forEach((value: any) => array.push(new FormControl(value)));
      });
  }

  onLanguageChange(element: FormGroup, lang: string): void {
    element.get('language').setValue(lang);

    const selectedLabel = this.addLabel(element, lang);

    element.get('charDesc').setValue(selectedLabel.label);
  }

  onDescChange(element: FormGroup, event) {
    this.addLabel(element, element.get('language').value, event);
  }

  addLabel(element: FormGroup, lang: string, label: string = null) {
    const labelsFormArray = element.controls.labels as FormArray;
    let selectedLabel = labelsFormArray.value.find((label) => label.language?.toLowerCase() === lang);

    if (!selectedLabel) {
      selectedLabel = {
        language: lang,
        label: ''
      };
    } else {
      const index = labelsFormArray.value.indexOf(selectedLabel);
      labelsFormArray.removeAt(index);
    }

    if (label != null) {
      selectedLabel.label = label;
    }

    labelsFormArray.push(new FormControl(selectedLabel));

    return selectedLabel;
  }

  /**
   * Field type change event
   * @param ev value for fieldType
   */
  onFieldTypeChange(element: FormGroup, ev) {
    element.get('fieldType').setValue(ev.option.value);

    this.handleFieldsBehaviorForFieldType(element);
    this.handleFieldsBehavior(element);
  }

  /**
   * Data type change event
   * @param ev value for Datatype
   */
  onDataTypeChange(element: FormGroup, ev) {
    element.get('dataType').setValue(ev.option.value);
    this.handleFieldsBehavior(element);
  }

  onDimensionTypeChange(element: FormGroup, ev) {
    const value = ev.option.value;
    element.get('dimensionType').setValue(value);

    this.loadUoM(element, value);
  }

  onDateChanged(element: FormGroup, field: string, ev) {
    element.get(field).setValue(ev);
  }

  setFieldHelpTextValue(element: FormGroup, value) {
    element.get('helpText').setValue(value.newValue);
  }

  getSelectedLanguage(language: string) {
    return this.allLanguages.find((d) => d.id === language)?.name || '';
  }

  getSelectedDimensionName(element: FormGroup): string {
    const uuid = element.get('dimensionType')?.value;

    let value = '';

    if (uuid) {
      value = this.dimensionTypeList.find((dimension) => dimension.uuid === uuid)?.description || '';
    }

    return value;
  }

  /**
   * get selected date
   * @returns date
   */
  getSelectedDateValue(element: FormGroup, field: string) {
    return element.get(field).value;
  }

  displayLanguageFn(language: string) {
    return this.allLanguages.find((d) => d.id === language)?.name;
  }

  displayDimensionFn(uuid: string) {
    return this.dimensionTypeList.find((d) => d.uuid === uuid)?.description || '';
  }

  validateFieldTypeChange(element: FormGroup, value: string) {
    element.get('fieldType').setValue(value);

    element.get('dataType').enable();
    element.get('length').enable();
    element.get('currency').disable();
    element.get('isAllowValueRange').enable();

    let typeList = [];

    switch (value) {
      case 'TEXT':
        typeList = [{ name: 'CHAR' }, { name: 'NUMC' }, { name: 'DEC' }];

        if (!element.get('dataType').value) {
          element.get('dataType').setValue('CHAR');
        }
        break;
      case 'CURRENCY':
        typeList = [{ name: 'NUMC' }];

        element.get('dataType').setValue('NUMC');
        element.get('currency').enable();
        break;
      case 'DATE':
      case 'TIME':
        typeList = [{ name: 'CHAR' }];
        element.get('dataType').setValue('CHAR');
        element.get('dataType').disable();

        element.get('length').disable();
        break;
      case 'DROPDOWN':
      case 'RICH TEXT EDITOR':
        typeList = [{ name: 'CHAR' }, { name: 'NUMC' }];

        if (!element.get('dataType').value) {
          element.get('dataType').setValue('CHAR');
        }

        element.get('isAllowValueRange').disable();
        break;
      default:
        break;
    }

    this.updateTypeList(element, typeList);
    this.handleFieldsBehavior(element);
  }

  updateTypeList(element: FormGroup, typeList = []) {
    const types = element.get('typeList') as FormArray;

    while (types.length) {
      types.removeAt(0);
    }

    typeList.forEach((type) => types.push(new FormControl(type)));
  }

  handleFieldsBehaviorForFieldType(element: FormGroup) {
    element.get('dataType').enable();
    element.get('length').enable();
    element.get('currency').disable();
    element.get('isAllowValueRange').enable();

    element.controls.length.addValidators(Validators.required);

    let typeList = [];

    switch (element.get('fieldType').value) {
      case 'TEXT':
        typeList = [{ name: 'CHAR' }, { name: 'NUMC' }, { name: 'DEC' }];

        element.get('dataType').setValue('CHAR');
        break;
      case 'CURRENCY':
        typeList = [{ name: 'NUMC' }];

        element.get('dataType').setValue('NUMC');
        element.get('currency').enable();
        break;
      case 'DATE':
      case 'TIME':
        typeList = [{ name: 'CHAR' }];

        element.get('dataType').setValue('CHAR');
        element.get('dataType').disable();

        element.get('length').disable();
        element.get('length').setValue('');
        element.controls.length.clearValidators();
        break;
      case 'DROPDOWN':
      case 'RICH TEXT EDITOR':
        element.get('dataType').setValue('CHAR');

        typeList = [{ name: 'CHAR' }, { name: 'NUMC' }];

        element.get('isAllowValueRange').disable();
        break;
      default:
        break;
    }

    this.updateTypeList(element, typeList);
  }

  /**
   * Handles hidden/disable behavior of fields
   * based on selection of fieldType and dataType
   */
  handleFieldsBehavior(element: FormGroup) {
    const fieldType = element.get('fieldType').value;
    const dataType = element.get('dataType').value;

    element.get('isAllowUpperCase').enable();
    element.get('isAllowNewValue').disable();

    if (fieldType === 'TEXT' && (dataType === 'DEC' || dataType === 'NUMC')) {
      element.get('decimal').enable();
      element.controls.decimal.setValidators([Validators.required]);
    } else {
      element.controls.decimal.clearValidators();
      element.get('decimal').setValue('');
      element.get('decimal').disable();
    }

    if (fieldType === 'TEXT' && dataType !== 'NUMC') {
      element.get('isAllowValueRange').disable();
      element.get('isAllowValueRange').setValue(false);
    } else if (fieldType === 'TEXT' && dataType === 'NUMC') {
      element.get('isAllowValueRange').enable();
    }

    if ((fieldType === 'TEXT' || fieldType === 'DROPDOWN') && dataType === 'CHAR') {
      element.get('isAllowUpperCase').setValue(true);
    } else {
      element.get('isAllowUpperCase').setValue(false);
      element.get('isAllowUpperCase').disable();
    }

    if ((fieldType !== 'TEXT' || fieldType !== 'CURRENCY') && dataType !== 'NUMC') {
      element.get('isAllowNegative').enable();
    } else {
      element.get('isAllowNegative').setValue(false);
      element.get('isAllowNegative').disable();
    }

    if (fieldType === 'DROPDOWN') {
      element.get('isAllowNewValue').enable();
    }
  }

  checkForFieldTypeChange(element: FormGroup, val) {
    if (val !== 'DATE' || val !== 'TIME') {
      element.controls.length.setValidators([Validators.required]);
      element.controls.length.enable();
    } else {
      element.controls.length.clearValidators();
      element.controls.length.disable();
    }
    element.controls.length.updateValueAndValidity();

    if (val === 'TEXT' && (element.get('dataType').value === 'DEC' || element.get('dataType').value === 'NUMC')) {
      element.controls.decimal.enable();
      element.controls.decimal.setValidators([Validators.required]);
    } else {
      element.controls.decimal.clearValidators();
      element.controls.decimal.disable();
    }
    element.controls.decimal.updateValueAndValidity();
  }

  checkForDataTypeChange(element: FormGroup, val) {
    if ((val === 'DEC' || val === 'NUMC') && element.get('fieldType').value === 'TEXT') {
      element.controls.decimal.enable();
      element.controls.decimal.setValidators([Validators.required]);
    } else {
      element.controls.decimal.clearValidators();
      element.controls.decimal.disable();
    }
    element.controls.decimal.updateValueAndValidity();
  }

  close() {
    this.router.navigate([{ outlets: { sb: `sb/settings/classifications`, outer: null } }]);
  }

  onCharacteristicsSave() {
    this.submitError.status = false;
    if (this.form.invalid) {
      this.frmArray.controls.forEach((control: any) => {
        Object.values(control.controls).forEach((c: any) => {
          c.markAsTouched();
        });
      });

      this.submitError.status = true;
      this.submitError.message = 'Fields are required';

      this.messageContainer.nativeElement.scrollIntoView({ behavior: 'smooth' });

      return false;
    }

    if (!this.frmArray.value.length) {
      this.isHeaderChecked = false;
      this.submitError.status = true;
      this.submitError.message = 'Please select at least one characteristics';
      return false;
    }
    this.saveCharacteristics();
  }

  gettenantId() {
    this.userService.getUserDetails().subscribe((user) => {
      this.tenantId = user?.plantCode || '0';
    });
  }

  saveCharacteristics() {
    const characteristicsRequestData = [];
    const defaultUoM = [];
    this.gettenantId();

    this.frmArray.value.forEach((characteristic, index) => {
      const language = [{ label: characteristic.charDesc, language: this._locale } as LanguageLabel];
      defaultUoM.push(characteristic.defaultUoM || '');

      characteristicsRequestData.push({
        charCode: characteristic.charCode?.toUpperCase(),
        labels: characteristic.labels?.length ? characteristic.labels : language,
        fieldType: characteristic.fieldType,
        dataType: characteristic.dataType,
        length: characteristic.length,
        prefix: characteristic.prefix,
        longPrefix: characteristic.longPrefix,
        suffix: characteristic.suffix,
        longSuffix: characteristic.longSuffix,
        isManatory: characteristic.isManatory,
        numCode: characteristic.numCode,
        dimensionType: characteristic.dimensionType,
        helpText: characteristic.helpText,
        sapChars: characteristic.sapChars,

        decimal: characteristic.decimal || '',
        currency: characteristic.currency || '',
        isAllowMultipleValue: characteristic.isAllowMultipleValue,
        isAllowValueRange: characteristic.isAllowValueRange,
        isAllowUpperCase: characteristic.isAllowUpperCase,
        isAllowNegative: characteristic.isAllowNegative,
        isAllowNewValue: characteristic.isAllowNewValue,
        defaultUoM,
        status: characteristic.status,
        validFrom: new Date(characteristic.validFrom).getTime() || '0',
        validTo: new Date(characteristic.validTo).getTime() || '0',

        defaultValue: '',
        charDesc: characteristic.charDesc,
        charOrder: ++index + '',
        descActive: false,
        isChecklist: false,
        tenantId: this.tenantId,
        language: undefined,
        uoMs: undefined
      } as Characteristics);
    });

    this.ruleService.saveCharacteristicsList(characteristicsRequestData, this.uuid).subscribe(
      (res: any) => {
        if (res.acknowledged) {
          this.transientService.open('Successfully saved !', null, { duration: 2000, verticalPosition: 'bottom' });
          this.sharedService.publish({ type: 'CHARACTERISTICS/SAVED', payload: res.responses });

          this.closeDialog();
        } else {
          this.messageContainer.nativeElement.scrollIntoView({ behavior: 'smooth' });
          this.submitError.status = true;
          this.submitError.message = res.errorMsg || 'Something went wrong. Please try again later.';
        }
      },
      (err) => {
        this.messageContainer.nativeElement.scrollIntoView({ behavior: 'smooth' });
        this.submitError.status = true;
        this.submitError.message = err.error?.errorMsg || 'Something went wrong. Please try again later.';
      }
    );
  }

  clearSelectedDimension(element: FormGroup) {
    element.get('dimensionType').setValue('');
  }

  isRequiredField(element: FormGroup, field: string) {
    return element.get(field).hasValidator(Validators.required);
  }

  closeDialog() {
    this.closeComponent.emit();
  }

  ngOnDestroy(): void {
    this.subscriptionEnabled = false;
  }

  newChars() {
    this.addForm();
    this.dataSource = new MatTableDataSource(this.frmArray.controls);
  }

  onNewLanguage(element: FormGroup) {
    const itemIndex = this.frmArray.controls.findIndex((item) => item === element);

    this.router.navigate(
      [
        '',
        {
          outlets: {
            sb: `sb/settings/classifications`,
            outer: `outer/classifications/characteristics/new`,
            sb3: `sb3/classifications/characteristics/languages`
          }
        }
      ],
      { state: { itemIndex, label: element.controls.labels.value } }
    );
  }

  openDialog(element: FormGroup) {
    this.formElementForCheckValue = element;
    const labels = element.controls.labels as FormArray;
    const lang = element.controls.language.value;

    const selectedLabel = labels.value.find((label) => label.language === lang);
    const itemIndex = this.frmArray.controls.findIndex((item) => item === element);

    this.router.navigate(
      [
        '',
        {
          outlets: {
            sb: `sb/settings/classifications`,
            outer: `outer/classifications/characteristics/new`,
            sb3: `sb3/classifications/characteristics/ExpansionView`
          }
        }
      ],
      {
        queryParams: {
          itemIndex,
          formValue: JSON.stringify(element.value),
          isService: false,
          selectedLabel: JSON.stringify(selectedLabel)
        }
      }
    );
  }

  onDeleteRow(index: number): void {
    if (!this.frmArray?.length) {
      return;
    }
    this.frmArray.removeAt(index);
    this.dataSource = new MatTableDataSource(this.frmArray.controls);
  }

  onDuplicateRow(element: FormGroup): void {
    this.addForm();

    const arrayKeys = ['labels', 'uoMs', 'typeList'];

    const fg = this.frmArray.controls[this.frmArray.controls.length - 1] as FormGroup;
    Object.keys(element.value)?.forEach((key: string) => {
      const control: any = fg.controls[key];
      const value = element.get(key).value;

      if (!arrayKeys.includes(key)) {
        control.setValue(value);
      } else {
        value.forEach((value) => control.push(new FormControl(value)));
      }
    });

    this.handleFieldsBehaviorForFieldType(fg);
    this.handleFieldsBehavior(fg);

    this.dataSource = new MatTableDataSource(this.frmArray.controls);
  }
}
