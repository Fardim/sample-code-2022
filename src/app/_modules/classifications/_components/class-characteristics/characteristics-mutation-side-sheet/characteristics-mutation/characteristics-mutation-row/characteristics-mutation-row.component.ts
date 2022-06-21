import { Utilities } from '@models/schema/utilities';
import { Component, EventEmitter, Inject, Input, LOCALE_ID, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TransientService } from 'mdo-ui-library';
import { CharacteristicsExpansionViewDialogComponent } from '../../../characteristics-expansion-view-dialog/characteristics-expansion-view-dialog.component';
import { RuleService } from '@services/rule/rule.service';
import { debounceTime, takeWhile } from 'rxjs/operators';
import { Dimensions, ResultInfo, languages, DimensionItem, LanguageLabel } from '@modules/classifications/_models/classifications';
import { Router } from '@angular/router';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';

@Component({
  selector: 'pros-characteristics-mutation-row',
  templateUrl: './characteristics-mutation-row.component.html',
  styleUrls: ['./characteristics-mutation-row.component.scss']
})
export class CharacteristicsMutationRowComponent implements OnInit, OnDestroy {
  @Input() characteristicsForm: FormGroup;

  @Output() deleteRow = new EventEmitter<void>();
  @Output() duplicateRow = new EventEmitter<void>();

  subscriptionEnabled = true;

  descriptionControl = new FormControl();
  helpTextControl = new FormControl();
  descriptionEditorId: string;
  helpTextEditorId: string;

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

  constructor(private dialog: MatDialog,
    private libToast: TransientService,
    private utilityService: Utilities,
    private router: Router,
    private sharedService: SharedServiceService,
    private ruleService: RuleService,
    @Inject(LOCALE_ID) public locale: string,
  ) {
    this._locale = this.locale?.split('-')?.[0] || 'en';
    this.descriptionEditorId = this.utilityService.getRandomString(10);
    this.helpTextEditorId = this.utilityService.getRandomString(10);
  }

  ngOnInit(): void {
    this.selectedLabel = {
      language: this._locale,
      label: '',
    };

    this.addLabel(this.selectedLabel);

    this.loadDimensions();

    this.sharedService.ofType<any>('CHARACTERISTICS/LABELS/SAVED').pipe(takeWhile(() => this.subscriptionEnabled))
      .subscribe((data) => {
        if (data.payload) {
            const labels = this.characteristicsForm.get('labels') as FormArray;
            while (labels.length) {
              labels.removeAt(0);
            }
             data.payload.labels.forEach(label => { labels.push(new FormControl(label))});
        }
      });

      this.characteristicsForm.get('fieldType').valueChanges.subscribe(val => {
      if (val !== 'DATE' || val !== 'TIME') {
        this.characteristicsForm.controls.length.setValidators([Validators.required, Validators.pattern('^[0-9]*$')]);
      } else {
        this.characteristicsForm.controls.length.clearValidators();
      }
      this.characteristicsForm.controls.length.updateValueAndValidity();

      if (val === 'TEXT' || this.characteristicsForm.get('dataType').value === 'DEC') {
        this.characteristicsForm.controls.decimal.setValidators([Validators.required, Validators.pattern('[0-9]')]);
      } else {
        this.characteristicsForm.controls.decimal.clearValidators();
      }
      this.characteristicsForm.controls.decimal.updateValueAndValidity();
    });

    this.characteristicsForm.get('dataType').valueChanges.subscribe(val => {
      if (val === 'DEC' || this.characteristicsForm.get('fieldType').value === 'TEXT') {
        this.characteristicsForm.controls.decimal.setValidators([Validators.required, Validators.pattern('[0-9]')]);
      } else {
        this.characteristicsForm.controls.decimal.clearValidators();
      }
      this.characteristicsForm.controls.decimal.updateValueAndValidity();
    });
  }

  ngOnDestroy(): void {
    this.subscriptionEnabled = false;
  }

  get selectedLanguage() {
    return this.allLanguages.find((language) => language.id === this.selectedLabel?.language)?.name;
  }

  get labelsFormArray(): FormArray {
    return this.characteristicsForm.get('labels') as FormArray;
  }

  addLabel(label: LanguageLabel) {
    const index = this.labelsFormArray.value.findIndex(l => l.language === label.language);

    if (index >= 0) {
      this.labelsFormArray.removeAt(index);
    }

    this.labelsFormArray.push(new FormControl(label));
  }

  loadDimensions() {
    this.ruleService.getDimensions().pipe(debounceTime(1000), takeWhile(() => this.subscriptionEnabled)).subscribe((res: ResultInfo<Dimensions[]>) => {
      this.dimensionTypeList = res.response;
      this.defaultMeasureList = [];
    });
  }

  loadUoM(uuid: string) {
    this.ruleService.getDimensionsById(uuid).pipe(debounceTime(1000), takeWhile(() => this.subscriptionEnabled)).subscribe((res: ResultInfo<Dimensions>) => {
      this.defaultMeasureList = res.response?.values || [];
    });
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
    this.characteristicsForm.get('charDesc').setValue(this.selectedLabel.label);
    this.descriptionControl.setValue(this.selectedLabel.label);
  }

  displayDimensionFn(dimension: string) {
    return this.dimensionTypeList?.find((d) => d.uuid === dimension)?.description;
  }

  displayLanguageFn(language: string) {
    return this.allLanguages.find((d) => d.id === language)?.name;
  }

  validateFieldTypeChange(value: string) {
    this.characteristicsForm.get('fieldType').setValue(value);

    this.characteristicsForm.get('dataType').enable();
    this.characteristicsForm.get('length').enable();
    this.characteristicsForm.get('currency').disable();
    this.characteristicsForm.get('isAllowValueRange').enable();

    switch (value) {
      case 'TEXT':
        this.typeList = [
          { name: 'CHAR' },
          { name: 'NUMC' },
          { name: 'DEC' },
        ];

        if (!this.characteristicsForm.get('dataType').value) {
          this.characteristicsForm.get('dataType').setValue('CHAR');
        }
        break;
      case 'CURRENCY':
        this.typeList = [
          { name: 'NUMC' },
        ];

        this.characteristicsForm.get('dataType').setValue('NUMC');
        this.characteristicsForm.get('currency').enable();
        break;
      case 'DATE':
      case 'TIME':
        this.typeList = [
          { name: 'CHAR' },
        ];
        this.characteristicsForm.get('dataType').setValue('CHAR');
        this.characteristicsForm.get('dataType').disable();

        this.characteristicsForm.get('length').disable();
        break;
      case 'DROPDOWN':
      case 'RICH TEXT EDITOR':
        this.typeList = [
          { name: 'CHAR' },
          { name: 'NUMC' },
        ];

        if (!this.characteristicsForm.get('dataType').value) {
        this.characteristicsForm.get('dataType').setValue('CHAR');
        }

        this.characteristicsForm.get('isAllowValueRange').disable();
        break;
      default:
        break;
    }
    this.handleFieldsBehaviour();
  }

  onFieldTypeChange(ev) {
    this.validateFieldTypeChange(ev.option.value);
  }

  onDataTypeChange(ev) {
    this.characteristicsForm.get('dataType').setValue(ev.option.value);
    this.handleFieldsBehaviour();
  }

  onDimensionTypeChange(ev) {
    const value = ev.option.value;
    this.characteristicsForm.get('dimensionType').setValue(value);

    this.loadUoM(value);
  }

  onDefaultMeasureChange(ev) {
    this.characteristicsForm.get('defaultUoM').setValue(ev.option.value);
  }

  handleFieldsBehaviour() {
    const fieldType = this.characteristicsForm.get('fieldType').value;
    const dataType = this.characteristicsForm.get('dataType').value;

    this.characteristicsForm.get('isAllowUpperCase').enable();
    this.characteristicsForm.get('isAllowNewValue').disable();

    if (fieldType === 'TEXT' && dataType === 'DEC') {
      this.characteristicsForm.get('decimal').enable();
    } else {
      this.characteristicsForm.get('decimal').setValue('');
      this.characteristicsForm.get('decimal').disable();
    }

    if (fieldType === 'TEXT' && dataType !== 'NUMC') {
      this.characteristicsForm.get('isAllowValueRange').disable();
      this.characteristicsForm.get('isAllowValueRange').setValue(false);
    } else if (fieldType === 'TEXT' && dataType === 'NUMC') {
      this.characteristicsForm.get('isAllowValueRange').enable();
    }

    if ((fieldType === 'TEXT' || fieldType === 'DROPDOWN') && dataType === 'CHAR') {
      this.characteristicsForm.get('isAllowUpperCase').setValue(true);
    } else {
      this.characteristicsForm.get('isAllowUpperCase').setValue(false);
      this.characteristicsForm.get('isAllowUpperCase').disable();
    }

    if ((fieldType !== 'TEXT' || fieldType !== 'CURRENCY') && dataType !== 'NUMC') {
      this.characteristicsForm.get('isAllowNegative').enable();
    } else {
      this.characteristicsForm.get('isAllowNegative').setValue(false);
      this.characteristicsForm.get('isAllowNegative').disable();
    }

    if (fieldType === 'DROPDOWN') {
      this.characteristicsForm.get('isAllowNewValue').enable();
    }
  }

  editorValueChange(event) {
    const value = event.newValue; // .replace('<p>', '').replace('</p>', '');
    this.characteristicsForm.get('charDesc').setValue(value);
    this.selectedLabel.label = value;
    this.addLabel(this.selectedLabel);
  }

  helpTextEditorValueChange(event) {
    this.characteristicsForm.get('helpText').setValue(event.newValue/*.replace('<p>', '').replace('</p>', '')*/);
  }


  /**
   * updated specific date
   * @param ev date parameter
   */
  validFromChanged(ev) {
    this.characteristicsForm.get('validFrom').setValue(ev);
  }

  /**
   * updated specific date
   * @param ev date parameter
   */
  validToChanged(ev) {
    this.characteristicsForm.get('validTo').setValue(ev);
  }

  /**
   * get selected date
   * @returns date
   */
  getValidFromValue() {
    return this.characteristicsForm.get('validFrom').value;
  }

  /**
   * get selected date
   * @returns date
   */
  getValidToValue() {
    return this.characteristicsForm.get('validTo').value;
  }

  onNewLanguage() {
    this.router.navigate(['', {
      outlets: {
        sb: `sb/settings/classifications`,
        outer: `outer/classifications/characteristics/new`,
        sb3: `sb3/classifications/characteristics/languages`
      }
    }], { state: { label: this.characteristicsForm.controls.labels.value } });
  }

  openDialog() {
    console.log('this.characteristicsForm.value', this.characteristicsForm.value);
    const dialogRef = this.dialog.open(CharacteristicsExpansionViewDialogComponent, {
      width: '700px',
      height: '600px',
      data: { formValue: this.characteristicsForm.value, isService: false, selectedLabel: this.selectedLabel },
      panelClass: 'change-password-dialog',
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((data) => {
      if (data && data.form) {
        // Object.values(this.characteristicsForm.controls).forEach((c) => {
        //   c.enable();
        // });

        console.log('data.form', data.form);

        this.selectedLabel = data.selectedLabel;
        const labelsFormArray = data.labelsFormArray;

        if (labelsFormArray.value) {
          while(this.labelsFormArray.value.length) {
            this.labelsFormArray.removeAt(0);
          }

          labelsFormArray.value.forEach(label => this.labelsFormArray.push(new FormControl(label)));
        }

        this.characteristicsForm.setValue(data.form);

        this.descriptionControl.setValue(data.form.charDesc);
        this.helpTextControl.setValue(data.form.helpText);

        this.characteristicsForm.get('dataType').setValue(data.form.dataType);
        this.validateFieldTypeChange(data.form.fieldType);

        this.helpTextControl.updateValueAndValidity();

        this.handleFieldsBehaviour();
      } else if (data && data.msg) {
        this.libToast.open(data.msg, 'Okay', {
          duration: 2000,
        });
      }
    });
  }

  onDelete() {
    this.deleteRow.emit();
  }

  onDuplicate() {
    this.duplicateRow.emit();
  }
}
