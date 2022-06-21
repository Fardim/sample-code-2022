import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Language, languages } from '@modules/classifications/_models/classifications';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { GlobaldialogService } from '@services/globaldialog.service';

@Component({
  selector: 'pros-characteristic-languages',
  templateUrl: './characteristic-languages.component.html',
  styleUrls: ['./characteristic-languages.component.scss'],
})
export class CharacteristicLanguagesComponent implements OnInit {
  action: 'save' | 'saved' = 'saved';
  characteristicId: string;
  languages = languages;
  labelForm: FormGroup;
  selectedLanguageList: string[] = [];
  itemIndex: number = 0;

  constructor(
    private route: ActivatedRoute,
    private globalDialogService: GlobaldialogService,
    private sharedService: SharedServiceService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.route.queryParams.subscribe(params => {
      this.action = params.action;
    });

    const formValues = window.history.state.label;
    this.characteristicId = history.state.characteristicId;
    this.itemIndex = history.state.itemIndex;

    if (formValues.length) {
      while (this.labelsFormArray.length) {
        this.labelsFormArray.removeAt(0);
      }

      formValues.forEach((label) => {
        this.addLabel();
        this.selectedLanguageList.push(label.language);
      });

      this.labelsFormArray.patchValue(formValues);
    }
  }

  initForm() {
    this.labelForm = new FormGroup({
      labels: new FormArray([this.createNewLanguageLabel()]),
    });
  }

  createNewLanguageLabel(): FormGroup {
    return new FormGroup({
      uuid: new FormControl(),
      label: new FormControl('', Validators.required),
      language: new FormControl('', Validators.required),
    });
  }

  get labelsFormArray(): FormArray {
    if (this.labelForm) {
      return this.labelForm.get('labels') as FormArray;
    }
    return null;
  }

  close() {
    this.location.back();
  }

  save() {
    if (this.labelsFormArray.invalid) {
      Object.values(this.labelsFormArray.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsTouched();
          control.markAsPristine();
          this.labelForm.markAllAsTouched();
        }
      });
      return false;
    }

    const payload = {
      ...this.labelForm.value,
      itemIndex: this.itemIndex,
      characteristicId: this.characteristicId,
    };

    console.log('payload', payload);

    this.sharedService.publish({ type: this.action === 'save' ? 'CHARACTERISTICS/LABELS/SAVE' : 'CHARACTERISTICS/LABELS/SAVED', payload });
    this.close();
  }

  addLabel() {
    const labels = this.labelForm.get('labels') as FormArray;
    labels.push(this.createNewLanguageLabel());
  }

  removeItem(idx) {
    this.globalDialogService.confirm({ label: $localize`:@@delete_message:Are you sure to delete ?` }, (response) => {
      if (response === 'yes') {
        if (!this.labelsFormArray.at(idx).get('language').getError('selectedLanguage')) {
          const removedLanguage = this.labelsFormArray.at(idx).get('language').value;
          const removeItemIndex = this.selectedLanguageList.indexOf(removedLanguage);
          if (removeItemIndex > 0) {
            this.selectedLanguageList.splice(removeItemIndex, 1);
          }
        }
        this.labelsFormArray.removeAt(idx);
      }
    });
  }

  checkOptionSelected(obj: Language, ctrlIndex: number) {
    if (this.selectedLanguageList && this.selectedLanguageList.some(x => x === obj.id)) {
      this.labelsFormArray.at(ctrlIndex).get('language').setErrors({ selectedLanguage: true });
    }
    else {
      this.selectedLanguageList.push(obj.id);
    }
  }

  get validationErrors() {
    let invalidFieldsCount = 0;
    if (this.labelsFormArray) {
      this.labelsFormArray.controls.forEach((c) => {
        if (c.errors && c.errors.selectedLanguage) {
          invalidFieldsCount++;
        }
        if (c.get('label').touched || c.get('language').touched) {
          if (c.get('label').invalid && c.get('label').touched) {
            invalidFieldsCount++;
          }
          if (c.get('language').invalid && c.get('language').touched) {
            invalidFieldsCount++;
          }
        }
      });
    }
    return invalidFieldsCount ? `${invalidFieldsCount}` : '';
  }
}
