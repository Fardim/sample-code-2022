import { Component, Inject, LOCALE_ID, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { Utilities } from '@models/schema/utilities';
import { RuleService } from '@services/rule/rule.service';
import { UserService } from '@services/user/userservice.service';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { TransientService } from 'mdo-ui-library';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, take, takeWhile } from 'rxjs/operators';
import { Characteristics, DimensionItem, Dimensions, Language, LanguageLabel, languages, ResultInfo } from '@modules/classifications/_models/classifications';


@Component({
  selector: 'pros-characteristic-edit-component',
  templateUrl: './characteristic-edit-component.component.html',
  styleUrls: ['./characteristic-edit-component.component.scss']
})
export class CharacteristicEditComponentComponent implements OnInit, OnDestroy {
  subscriptionEnabled = true;

  action: 'edit' | 'duplicate';
  uuid: string;
  characteristicId: string;
  totalCount: number;
  form: FormGroup;
  formValues: any = {};
  tanentId: string
  helpTextControl = new FormControl();
  descriptionEditorId: string;
  helpTextEditorId: string;
  bannerMessage: string;

  isDecimalRequired = false;
  isLenghtRequired = false;

  allLanguages = languages;
  _locale: string;
  selectedLanguage: Language;
  title = '';
  fieldTypeList = [
    { name: 'TEXT' },
    { name: 'DROPDOWN' },
    { name: 'DATE' },
    { name: 'TIME' },
    { name: 'CURRENCY' },
    { name: 'RICH TEXT EDITOR' }
  ];
  typeList;

  dimensionTypeList: Dimensions[]= [];

  defaultMeasureList: DimensionItem[] = [];
  classHeading;

  constructor(
    private router: Router,
    private location: Location,
    private utilityService: Utilities,
    private ruleService: RuleService,
    private userService: UserService,
    private transientService: TransientService,
    private sharedService: SharedServiceService,
    public fb: FormBuilder,
    private route: ActivatedRoute,
    @Inject(LOCALE_ID) public locale: string,
    ) {
    this._locale = this.locale?.split('-')?.[0] || 'en';
    this.route.params.subscribe((params) => {
      this.action = params.action;
      if (params?.id) {
        this.uuid = params.id;
      }
    });
  }

  ngOnInit(): void {
    this.classHeading = this.sharedService.classForCharacteristics.description;
    this.sharedService.ofType<any>('CHARACTERISTICS/LABELS/SAVED').pipe(takeWhile(() => this.subscriptionEnabled))
      .subscribe((data) => {
        console.log('CLASS_TYPE/SAVED', data.payload.labels);
        if (data.payload) {
            while (this.labelsFormArray.length) {
              this.labelsFormArray.removeAt(0);
            }
             data.payload.labels.forEach(label => { this.labelsFormArray.push(new FormControl(label))});
        }
      });

    this.selectedLanguage = this.allLanguages.find((language) => language.id === this._locale);

    this.loadDimensions();

    this.formValues = window.history.state.characteristics
    this.totalCount = window.history.state.totalCount;

    this.characteristicId = this.formValues.uuid;

    this.initForm();
    this.form.patchValue({ ...this.formValues });

    while (this.labelsFormArray.length) {
      this.labelsFormArray.removeAt(0);
    }

    this.formValues.labels.forEach(label => { this.labelsFormArray.push(new FormControl(label)) });

    const l = this.formValues.labels.find(label => label.language === this._locale);
    if (l) {
      this.form.get('charDesc').setValue(l.label);
    }

    this.handleFieldsBehaviourforFieldType();
    this.handleFieldsBehaviour();
    this.checkForFieldTypeChange(this.form.get('fieldType').value);
    this.checkForDataTypeChange(this.form.get('dataType').value);

    this.helpTextControl.setValue(this.form.get('helpText').value);
    this.descriptionEditorId = this.utilityService.getRandomString(10);
    this.helpTextEditorId = this.utilityService.getRandomString(10);

    this.form.get('fieldType').valueChanges.subscribe(val => {
      this.checkForFieldTypeChange(val);
    });
    this.form.get('dataType').valueChanges.subscribe(val => {
      this.checkForDataTypeChange(val);
    });

    this.title = this.action === 'duplicate' ? $localize`:@@duplicate_characteristic:Duplicate characteristic` : $localize`:@@edit_characteristic:Edit characteristic`;
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

  get selectedDimensionName() {
    const uuid = this.form.get('dimensionType')?.value;

    let value = ''

    if (uuid) {
      value = this.dimensionTypeList.find((dimension) => dimension.uuid === uuid)?.description || '';
    }

    // if (!value) {
    //   this.defaultMeasureList = [];
    //   this.form.get('defaultUoM').setValue('');
    // }

    return value;
  }

  /**
   * init Form
   */
  initForm() {
    this.form = this.fb.group({
      uuid: new FormControl(''),
      selected: new FormControl(false),
      charCode: new FormControl('', [Validators.required]),
      charDesc: new FormControl('', [Validators.required]),
      charOrder: new FormControl(''),
      numCode: new FormControl('', []),
      fieldType: new FormControl('', [Validators.required]),
      dataType: new FormControl({ value: '', disabled: true }, [Validators.required]),
      length: new FormControl({ value: '', disabled: true }, []),

      labels: new FormArray([new FormGroup({
        uuid: new FormControl('', []),
        language: new FormControl('', []),
        label: new FormControl('', []),
      })]),

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

      // TO FIX, property name with request Payload
      isAllowValueRange: new FormControl({ value: false, disabled: true }, []),
      isAllowUpperCase: new FormControl({ value: false, disabled: true }, []),
      isAllowNegative: new FormControl({ value: false, disabled: true }, []),
      isAllowNewValue: new FormControl({ value: false, disabled: true }, []),
      enableDuplicateCheck: new FormControl(false, []),

      dimensionType: new FormControl('', []),

      // TO FIX, property name with request Payload
      defaultUoM: new FormControl('', []),
      status: new FormControl(true, []),
      validFrom: new FormControl('', []),
      validTo: new FormControl('', []),

      helpText: new FormControl('', []),
      sapChars: new FormControl('', [])
    });
  }

  loadDimensions() {
    this.ruleService.getDimensions().pipe(takeWhile(() => this.subscriptionEnabled)).subscribe((res: ResultInfo<Dimensions[]>) => {
      this.dimensionTypeList = res.response;
      this.defaultMeasureList = [];
    });
  }

  loadUoM(uuid: string) {
    this.ruleService.getDimensionsById(uuid).pipe(debounceTime(1000), takeWhile(() => this.subscriptionEnabled)).subscribe((res: ResultInfo<Dimensions>) => {
      this.defaultMeasureList = res.response?.values || [];
    });
  }

  displayLanguageFn(language: string) {
    return this.allLanguages.find((d) => d.id === language)?.name;
  }

  displayDimensionFn(dimension: string) {
    const value = this.dimensionTypeList?.find((d) => d.uuid === dimension)?.description || '';

    return value;
  }

  checkForDataTypeChange(val) {
    if (val === 'DEC' || this.form.get('fieldType').value === 'TEXT') {
      this.form.controls.decimal.setValidators([Validators.required, Validators.pattern('[0-9]')]);
      this.isDecimalRequired = true;
    } else {
      this.isDecimalRequired = false;
      this.form.controls.decimal.clearValidators();
    }
    this.form.controls.decimal.updateValueAndValidity();
  }

  checkForFieldTypeChange(val) {
    if (val !== 'DATE' || val !== 'TIME') {
      this.form.controls.length.setValidators([Validators.required, Validators.pattern('^[0-9]*$')]);
      this.isLenghtRequired = true;
    } else {
      this.isLenghtRequired = false;
      this.form.controls.length.clearValidators();
    }
    this.form.controls.length.updateValueAndValidity();

    if (val === 'TEXT' || this.form.get('dataType').value === 'DEC') {
      this.form.controls.decimal.setValidators([Validators.required, Validators.pattern('[0-9]')]);
      this.isDecimalRequired = true;
    } else {
      this.isDecimalRequired = false;
      this.form.controls.decimal.clearValidators();
    }
    this.form.controls.decimal.updateValueAndValidity();
  }

  /**
   * Handle editors value change event
   * @param event value of editor
   */
  editorValueChange(event) {
    this.form.get('charDesc').setValue(event.newValue.replace('<p>', '').replace('</p>', ''));
  }

  /**
   * Handle helptext editor change event
   * @param event value of help text
   */
  helptextEditorValueChange(event) {
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

    if (fieldType === 'TEXT' && dataType === 'DEC') {
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

        if (this.form.get('dataType') === undefined || this.form.get('dataType').value === '') {
          this.form.get('dataType').setValue('CHAR');
        }
        break;
      case 'CURRENCY':
        this.typeList = [
          { name: 'NUMC' },
        ];

        if (this.form.get('dataType') === undefined || this.form.get('dataType').value === '') {
          this.form.get('dataType').setValue('NUMC');
        }
        this.form.get('currency').enable();
        break;
      case 'DATE':
      case 'TIME':
        this.typeList = [
          { name: 'TEXT' },
        ];

        if (this.form.get('dataType') === undefined || this.form.get('dataType').value === '') {
          this.form.get('dataType').setValue('CHAR');
          this.form.get('dataType').disable();
        }

        this.form.get('length').disable();
        this.isLenghtRequired = false;
        break;
      case 'DROPDOWN':
      case 'RICH TEXT EDITOR':
        if (!this.form.get('dataType')) {
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
    this.selectedLanguage = this.allLanguages.find((language) => language.id === ev.option.value);
  }

  onDimensionTypeChange(ev) {
    this.form.get('dimensionType').setValue(ev.option.value);

    // this.loadUoM(ev.option.value);
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
    this.bannerMessage = 'Fields are required';
  }

  /**
   * Validate, Save form & closes dialog with passing form value
   */
  save() {
    this.bannerMessage = '';
    if (this.form.invalid) {
      this.checkFormValidation();
      return false;
    }
    this.saveCharacteristics();
  }

  setTenantId() {
    this.userService.getUserDetails().subscribe(user => {
      this.tanentId = user.plantCode
    });
  }

  openLanguageSheet() {
    this.router.navigate(['', {
      outlets: {
        sb: `sb/settings/classifications`,
        outer: `outer/characteristics/${this.uuid}/edit`,
        sb3: `sb3/classifications/characteristics/languages`
      }
    }], {
      queryParamsHandling: 'preserve',
      state: { label: this.form.controls.labels.value }
    });
  }

  /**
   * Call save characteristics API
   */
  saveCharacteristics() {
    const labels = (this.labelsFormArray.value || []) as LanguageLabel[];

    if (this.selectedLanguage) {
      let label = labels.find((l) => l.language === this.selectedLanguage?.id);

      if (!label) {
        label = { language: this.selectedLanguage?.id, label: '' };
        labels.push(label);
      }

      label.label = this.form.get('charDesc').value || '';
    }

    if (this.action === 'duplicate') {
      labels.forEach(label => {
        label.uuid = undefined;
      });
    }

    console.log('labels', labels);

    const characteristics = {
      ...this.formValues,
      uuid: this.action === 'edit' ? this.formValues.uuid : undefined,
      charOrder: this.action === 'edit' ? this.formValues.charOrder : this.totalCount + '',
      charCode: this.form.get('charCode').value.toUpperCase(),
      charDesc: this.form.get('charDesc').value,
      numCode: this.form.get('numCode').value,
      fieldType: this.form.get('fieldType').value,
      dataType: this.form.get('dataType').value,
      length: this.form.get('length').value,
      prefix: this.form.get('prefix').value,
      longPrefix: this.form.get('longPrefix').value,
      suffix: this.form.get('suffix').value,
      longSuffix: this.form.get('longSuffix').value,
      isManatory: this.form.get('isManatory').value,
      dimensionType: this.form.get('dimensionType').value,
      helpText: this.form.get('helpText').value,
      decimal: this.form.get('decimal').value || '',
      currency: this.form.get('currency').value || '',
      isAllowMultipleValue: this.form.get('isAllowMultipleValue').value || false,
      isAllowValueRange: this.form.get('isAllowValueRange').value || false,
      isAllowUpperCase: this.form.get('isAllowUpperCase').value || false,
      isAllowNegative: this.form.get('isAllowNegative').value || false,
      isAllowNewValue: this.form.get('isAllowNewValue').value || false,
      enableDuplicateCheck: this.form.get('enableDuplicateCheck').value || false,
      defaultUoM: Array.isArray(this.form.get('defaultUoM').value) ? this.form.get('defaultUoM').value : (this.form.get('defaultUoM').value ? [this.form.get('defaultUoM').value] : []),
      status: this.form.get('status').value,
      sapChars: this.form.get('sapChars').value,
      validFrom: this.parseDate(this.form.get('validFrom').value),
      validTo: this.parseDate(this.form.get('validTo').value),
      labels,
      tenantId: this.tanentId,
    } // as Characteristics;

    // const characteristics = this.form.value;
    // this.sharedService.publish({ type: 'CHARACTERISTICS/SAVED', payload: this.formValues });
    // this.transientService.open('Successfully saved !', null, { duration: 2000, verticalPosition: 'bottom' });


    this.ruleService.saveCharacteristics<Characteristics,  ResultInfo<Characteristics>>(characteristics, this.uuid)
      .subscribe((res) => {
        if (res.acknowledged) {
          console.log(res);

          if (this.action === 'duplicate') {
            this.saveDropdownList(res.response);
          } else {
            this.transientService.open('Successfully saved!', null, { duration: 2000, verticalPosition: 'bottom' });
            this.sharedService.publish({ type: 'CHARACTERISTICS/SAVED', payload: res.response });
            this.closeDialog();
          }
        } else {
          this.bannerMessage = 'Something went wrong. Please try again after some time.';
        }
      }, (err) => {
        this.bannerMessage = err.error?.errorMsg || 'Something went wrong. Please try again after some time.';
      });
  }

  parseDate(value: string) {
    let time = 0;

    if (value) {
      time = new Date(value).getTime();

      if (isNaN(time)) {
        time = new Date(parseInt(value, 10)).getTime();
      }

      if (isNaN(time)) {
        time = 0;
      }
    }

    return time + '' || '';
  }

  saveDropdownList(characteristic: Characteristics) {
    if (this.action === 'duplicate') {
      const dto: { searchString: string; parent: any } = {
        searchString: '',
        parent: {},
      };

      this.ruleService.getDropvals('0', this.characteristicId, this._locale, dto).pipe(take(1))
        .subscribe((res) => {
          const contents = res.content.map((content) => ({ code: content.code, text: content.text, editcode: false, editvalue: false, }))

          if (contents.length) {
            this.ruleService.saveDropvals(contents, '0', characteristic.uuid, this._locale).subscribe((res) => {
              this.transientService.open('Successfully duplicated!', null, { duration: 2000, verticalPosition: 'bottom' });
              this.sharedService.publish({ type: 'CHARACTERISTICS/SAVED', payload: characteristic });
              this.closeDialog();
            }, (err) => {
              this.bannerMessage = err.error?.errorMsg || 'Something went wrong. Please try again after some time.';
            });
          } else {
            this.transientService.open('Successfully duplicated!', null, { duration: 2000, verticalPosition: 'bottom' });
            this.sharedService.publish({ type: 'CHARACTERISTICS/SAVED', payload: characteristic });
            this.closeDialog();
          }
        }, (err) => {
          this.bannerMessage = err.error?.errorMsg || 'Something went wrong. Please try again after some time.';
        });
    }
  }

  clearSelectedDimension(element: FormGroup) {
    this.form.get('dimensionType').setValue('');
  }

  isRequiredField(field: string) {
    return this.form.get(field).hasValidator(Validators.required);
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

  closeDialog() {
    this.location.back()
  }
}
