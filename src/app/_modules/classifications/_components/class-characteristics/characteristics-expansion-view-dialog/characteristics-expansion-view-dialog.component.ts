import { Utilities } from '@models/schema/utilities';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { Component, ElementRef, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { languages, Dimensions, ResultInfo, DimensionItem, LanguageLabel } from '@modules/classifications/_models/classifications';
import { RuleService } from '@services/rule/rule.service';
import { debounceTime, takeWhile } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { Location } from '@angular/common';

@Component({
  selector: 'pros-characteristics-expansion-view-dialog',
  templateUrl: './characteristics-expansion-view-dialog.component.html',
  styleUrls: ['./characteristics-expansion-view-dialog.component.scss']
})
export class CharacteristicsExpansionViewDialogComponent implements OnInit, OnDestroy {
  @ViewChild('messageContainer') messageContainer: ElementRef<HTMLDivElement>;

  subscriptionEnabled = true;

  itemIndex: number = 0;
  form: FormGroup;
  formValues;
  helpTextControl = new FormControl();
  helpTextEditorId: string;
  bannerMessage: string;

  allLanguages = languages;
  _locale: string;
  selectedLabel: LanguageLabel;

  fieldTypeList = [
    { name: 'TEXT' },
    { name: 'DROPDOWN' },
    { name: 'DATE' },
    { name: 'TIME' },
    { name: 'CURRENCY' },
    { name: 'RICH TEXT EDITOR' }
  ];
  typeList;

  dimensionTypeList: Dimensions[] = [];
  defaultMeasureList: DimensionItem[] = [];

  constructor(
    @Inject(LOCALE_ID) public locale: string,
    private ruleService: RuleService,
    private dialogRef: MatDialogRef<CharacteristicsExpansionViewDialogComponent>,
    private utilityService: Utilities,
    private fb: FormBuilder,
    private activateRoute: ActivatedRoute,
    private sharedService: SharedServiceService,
    private location: Location
  ) {
    this._locale = this.locale?.split('-')?.[0] || 'en';
    this.activateRoute.queryParams.subscribe(res => {
      this.itemIndex = res?.itemIndex;
      this.formValues = JSON.parse(res?.formValue);
      this.selectedLabel = JSON.parse(res?.selectedLabel);
    })
  }

  ngOnInit(): void {
    this.loadDimensions();

    this.initForm();

    this.form.patchValue({ ...this.formValues });
    this.initLabels();

    this.handleFieldsBehaviourforFieldType();
    this.handleFieldsBehaviour();
    this.checkForFieldTypeChange(this.form.get('fieldType').value);
    this.checkForDataTypeChange(this.form.get('dataType').value);

    this.helpTextControl.setValue(this.form.get('helpText').value);
    this.helpTextEditorId = this.utilityService.getRandomString(10);

    this.form.get('fieldType').valueChanges.subscribe(val => {
      this.checkForFieldTypeChange(val);
    });
    this.form.get('dataType').valueChanges.subscribe(val => {
      this.checkForDataTypeChange(val);
    });

    this.form.get('dimensionType').valueChanges.subscribe(val => {
      if (val) {
        this.loadUoM(val);
        this.form.get('defaultUoM').setValidators([Validators.required]);
      } else {
        this.form.get('defaultUoM').clearValidators();
        this.form.get('defaultUoM').setValue('');

        this.defaultMeasureList = [];
      }
    });

    if (this.form.get('dimensionType').value) {
      this.loadUoM(this.form.get('dimensionType').value);
    }
  }

  ngOnDestroy(): void {
    this.subscriptionEnabled = false;
  }

  get labelsFormArray(): FormArray {
    return this.form.get('labels') as FormArray;
  }

  get selectedLanguage() {
    return this.allLanguages.find((language) => language.id === this.selectedLabel?.language)?.name || '';
  }

  get selectedDimensionName() {
    const uuid = this.form.get('dimensionType')?.value;

    if (uuid) {
      return this.dimensionTypeList.find((dimension) => dimension.uuid === uuid)?.description || '';
    }

    return '';
  }

  initLabels() {
    const labels = this.formValues.labels || [];

    labels.forEach((label) => this.labelsFormArray.push(new FormControl(label)));
  }

  loadDimensions() {
    this.ruleService.getDimensions().pipe(debounceTime(1000), takeWhile(() => this.subscriptionEnabled)).subscribe((res: ResultInfo<Dimensions[]>) => {
      this.dimensionTypeList = res?.response;
      this.defaultMeasureList = [];
    });
  }


  loadUoM(uuid: string) {
    this.ruleService.getDimensionsById(uuid).pipe(debounceTime(1000), takeWhile(() => this.subscriptionEnabled)).subscribe((res: ResultInfo<Dimensions>) => {
      this.defaultMeasureList = res.response?.values || [];
    });
  }

  displayDimensionFn(dimension: string) {
    return this.dimensionTypeList?.find((d) => d.uuid === dimension)?.description;
  }

  /**
   * init Form
   */
  initForm() {
    this.form = this.fb.group({
      selected: new FormControl(false),
      charCode: new FormControl('', [Validators.required]),
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
      isAllowMultipleValue: new FormControl(true, []),

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
    });
  }

  addLabel(label: LanguageLabel) {
    const index = this.labelsFormArray.value.findIndex(l => l.language === label.language);

    if (index >= 0) {
      this.labelsFormArray.removeAt(index);
    }

    this.labelsFormArray.push(new FormControl(label));
  }

  checkForDataTypeChange(val) {
    if ((val === 'DEC' || val === 'NUMC') && this.form.get('fieldType').value === 'TEXT') {
      this.form.controls.decimal.setValidators([Validators.required, Validators.pattern('[0-9]')]);
    } else {
      this.form.controls.decimal.clearValidators();
    }
    this.form.controls.decimal.updateValueAndValidity();
  }

  checkForFieldTypeChange(val) {
    if (val !== 'DATE' || val !== 'TIME') {
      this.form.controls.length.setValidators([Validators.required, Validators.pattern('^[0-9]*$')]);
    } else {
      this.form.controls.length.clearValidators();
    }
    this.form.controls.length.updateValueAndValidity();

    if (val === 'TEXT' && (this.form.get('dataType').value === 'DEC' || this.form.get('dataType').value === 'NUMC')) {
      this.form.controls.decimal.setValidators([Validators.required, Validators.pattern('[0-9]')]);
    } else {
      this.form.controls.decimal.clearValidators();
    }
    this.form.controls.decimal.updateValueAndValidity();
  }

  /**
   * Handle editors value change event
   * @param event value of editor
   */
   onDescChange(event) {
    this.selectedLabel.label = event;
    this.addLabel(this.selectedLabel);
  }

  /**
   * Handle helptext editor change event
   * @param event value of help text
   */
  helpTextEditorValueChange(event) {
    this.form.get('helpText').setValue(event.newValue.replace('<p>', '').replace('</p>', ''));
  }

  /**
   * Handles hidden/disable behavior of fields
   * based on selection of fieldType and dataType
   */
  handleFieldsBehaviour() {
    const fieldType = this.form.get('fieldType').value;
    const dataType = this.form.get('dataType').value;

    this.form.get('isAllowUpperCase').enable();
    this.form.get('isAllowNewValue').disable();

    if (fieldType === 'TEXT' && (dataType === 'DEC' || dataType === 'NUMC')) {
      this.form.get('decimal').enable();
    } else {
      this.form.get('decimal').setValue('');
      this.form.get('decimal').disable();
    }

    if (fieldType === 'TEXT' && dataType !== 'NUMC') {
      this.form.get('isAllowValueRange').disable();
      this.form.get('isAllowValueRange').setValue(false);
    } else if (fieldType === 'TEXT' && dataType === 'NUMC') {
      this.form.get('isAllowValueRange').enable();
    }

    if ((fieldType === 'TEXT' || fieldType === 'DROPDOWN') && dataType === 'CHAR') {
      this.form.get('isAllowUpperCase').setValue(true);
    } else {
      this.form.get('isAllowUpperCase').setValue(false);
      this.form.get('isAllowUpperCase').disable();
    }

    if ((fieldType !== 'TEXT' || fieldType !== 'CURRENCY') && dataType !== 'NUMC') {
      this.form.get('isAllowNegative').enable();
    } else {
      this.form.get('isAllowNegative').setValue(false);
      this.form.get('isAllowNegative').disable();
    }

    if (fieldType === 'DROPDOWN') {
      this.form.get('isAllowNewValue').enable();
    }
  }

  handleFieldsBehaviourforFieldType() {
    this.form.get('dataType').enable();
    this.form.get('length').enable();
    this.form.get('currency').disable();
    this.form.get('isAllowValueRange').enable();

    switch (this.form.get('fieldType').value) {
      case 'TEXT':
        this.typeList = [
          { name: 'CHAR' },
          { name: 'NUMC' },
          { name: 'DEC' },
        ];

        if (!this.form.get('dataType').value) {
          this.form.get('dataType').setValue('CHAR');
        }
        break;
      case 'CURRENCY':
        this.typeList = [
          { name: 'NUMC' },
        ];

        this.form.get('dataType').setValue('NUMC');
        this.form.get('currency').enable();
        break;
      case 'DATE':
      case 'TIME':
        this.typeList = [
          { name: 'CHAR' },
        ];

        this.form.get('dataType').setValue('CHAR');
        this.form.get('dataType').disable();

        this.form.get('length').disable();
        break;
      case 'DROPDOWN':
      case 'RICH TEXT EDITOR':
        if (!this.form.get('dataType').value) {
          this.form.get('dataType').setValue('CHAR');
        }

        this.typeList = [
          { name: 'CHAR' },
          { name: 'NUMC' },
        ];

        this.form.get('isAllowValueRange').disable();
        break;
      default:
        break;
    }
  }

  onLanguageChange(ev) {
    const lang = ev.option.value;

    this.selectedLabel = this.labelsFormArray.value.find(label => label.language === lang);

    if (!this.selectedLabel) {
      this.selectedLabel = {
        language: lang,
        label: '',
      };
    } else {
      const index = this.labelsFormArray.value.indexOf(this.selectedLabel);
      this.labelsFormArray.removeAt(index);
    }

    this.labelsFormArray.push(new FormControl(this.selectedLabel));
    this.form.get('charDesc').setValue(this.selectedLabel.label);
  }

  displayLanguageFn(language: string) {
    return this.allLanguages.find((d) => d.id === language)?.name;
  }

  /**
   * Field type change event
   * @param ev value for fieldType
   */
  onFieldTypeChange(ev) {
    this.form.get('fieldType').setValue(ev.option.value);
    this.handleFieldsBehaviourforFieldType();
    this.handleFieldsBehaviour();
  }

  /**
   * Data type change event
   * @param ev value for Datatype
   */
  onDataTypeChange(ev) {
    this.form.get('dataType').setValue(ev.option.value);
    this.handleFieldsBehaviour();
  }
  /**
   * Dimension change event
   * @param ev value for dimension
   */
  onDimensionTypeChange(ev) {
    const value = ev.option.value;
    this.form.get('dimensionType').setValue(value);

    // this.loadUoM(value);
  }

  /**
   * Dewfault UoM change
   * @param ev value for defaultUoM
   */
  // onDefaultMeasureChange(ev) {
  //   this.form.get('defaultUoM').setValue(ev.option.value);
  // }

  /**
   * updated specific date
   * @param ev date parameter
   */
  validFromChanged(ev) {
    this.form.get('validFrom').setValue(ev);
  }

  /**
   * update specific date
   * @param ev date param
   */
  validToChanged(ev) {
    this.form.get('validTo').setValue(ev);
  }

  /**
   * get selected date
   * @returns date
   */
  getValidFromValue() {
    return this.form.get('validFrom').value;
  }

  /**
   * get valid ToDate
   * @returns date
   */
  getValidToValue() {
    return this.form.get('validTo').value;
  }

  /**
   * check form controls validation
   */
  checkFormValidation() {
    Object.values(this.form.controls).forEach((control) => {
      if (control.invalid) {
        control.markAsTouched();
      }
    });

    this.messageContainer?.nativeElement.scrollIntoView({ behavior: 'smooth' });

    this.bannerMessage = 'Fields are required';
  }

  /**
   * Validate, Save form & closes dialog with passing form value
   */
  saveForm() {
    this.bannerMessage = '';
    if (this.form.invalid) {
      this.checkFormValidation();

      return false;
    }

    const result: any = {};

    Object.keys(this.form.controls).forEach((c) => {
      result[c] = this.form.get(c).value;
    });

    result.uoMs = this.defaultMeasureList;
    result.typeList = this.typeList;

    this.sharedService.refreshReorderList.emit({ itemIndex: this.itemIndex,  form: result, selectedLabel: this.selectedLabel, labelsFormArray: this.labelsFormArray })
    this.location.back();
  }

  /**
   * Call save characteristics API
   */
  // saveCharacteristics() {
  //   const characteristics = {
  //     charCode: this.form.get('charCode').value,
  //     dataType: this.form.get('type').value,
  //     defaultValue: '',

  //     charDesc: this.form.get('charDesc').value,
  //     charOrder: '0',
  //     descActive: false,
  //     dimensionType: '',
  //     fieldType: '',
  //     helpText: '',
  //     isChecklist: false,
  //     isManatory: false,
  //     labels: [],
  //     length: '0',
  //     lprefix: '',
  //     lsuffix: '',
  //     numCode: '',
  //     prefix: '',
  //     sapChars: '',
  //     suffix: '',
  //     tenantId: '0'
  //   } as Characteristics;

  //   this.ruleService.saveCharacteristics(characteristics, this.uuid).subscribe((res: any) => {
  //     if (res.acknowledged) {
  //       this.transientService.open('Successfully saved !', null, { duration: 2000, verticalPosition: 'bottom' });
  //       // this.sharedService.publish({ type: 'CHARACTERISTICS/SAVED', payload: res.responses });
  //     } else {
  //     }
  //     this.closeDialog();
  //   }, (error) => {
  //   });
  // }

  /**
   * closes dialog with a optional response message
   * @param res response message
   */
  close(res?) {
    this.location.back();
    this.sharedService.refreshReorderList.emit(res);
  }

  /**
   * Clears form invalid controls on cancel
   */
  clearFormValidation() {
    Object.values(this.form.controls).forEach((control) => {
      if (control.invalid) {
        control.markAsUntouched();
      }
    });
  }

  clearSelectedDimension(element: FormGroup) {
    this.form.get('dimensionType').setValue('');
  }

  isRequiredField(field: string) {
    return this.form.get(field).hasValidator(Validators.required);
  }
}
