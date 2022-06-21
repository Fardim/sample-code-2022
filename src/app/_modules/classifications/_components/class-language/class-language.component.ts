import { ENTER } from '@angular/cdk/keycodes';
import { AfterViewChecked, ChangeDetectorRef, Component, EventEmitter, Inject, Input, LOCALE_ID, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { ActivatedRoute } from '@angular/router';
import { Class, ClassLabel, ColloquialName, Language, languages, ResultInfo } from '@modules/classifications/_models/classifications';
import { ConfirmationDialogComponent } from '@modules/shared/_components/confirmation-dialog/confirmation-dialog.component';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { map, takeWhile } from 'rxjs/operators';
import { RuleService } from '@services/rule/rule.service';
import { TransientService } from 'mdo-ui-library';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'pros-class-language',
  templateUrl: './class-language.component.html',
  styleUrls: ['./class-language.component.scss']
})
export class ClassLanguageComponent implements OnInit, AfterViewChecked {
  @Input() closable = false;
  @Output() close: EventEmitter<any> = new EventEmitter(null);
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger

  languageForm: FormGroup;

  _locale: string
  selectedLanguage: Language;
  allColloquialsList: ColloquialName[] = [];
  colloquialsList: ColloquialName[] = [];
  // classLabels: ClassLabel[] = [];
  classInfo: Class;
  subscriptionEnabled = true;
  uId: string;
  confirmModalOpened = false;
  clearAction = false;
  changesSave = false;

  allLanguages = languages;

  readonly separatorKeysCodes = [ENTER] as const;

  constructor(private ruleService: RuleService,
    private ref: ChangeDetectorRef,
    private transientService: TransientService,
    private sharedService: SharedServiceService,
    private activatedRouter: ActivatedRoute,
    public dialog: MatDialog,
    @Inject(LOCALE_ID) private locale: string
  ) {
    this._locale = this.locale?.split('-')?.[0] || 'en';
  }

  ngOnInit(): void {
    this.selectedLanguage = this.allLanguages.find(language => language.id === this._locale);

    this.initForm({
      language: '',
      code: '',
      codeLong: '',
      mod: '',
      modLong: '',
      label: ''
    });

    this.getClassInfo();
  }

  get isNoun() {
    return !!this.classInfo?.isNoun;
  }

  initForm(label: ClassLabel) {
    let formFields: {
      [key: string]: FormControl
    } = {
      uuid: new FormControl(label.uuid),
      code: new FormControl(label.code, [Validators.required]),
    };

    if (this.isNoun) {
      formFields = {
        ...formFields,
        codeLong: new FormControl(label.codeLong, [Validators.required]),
        mod: new FormControl(label.mod),
        modLong: new FormControl(label.modLong),
        colloquial: new FormControl([])
      }
    }

    this.languageForm = new FormGroup(formFields);

    if (this.isNoun) {
      if (label.mod) {
        this.languageForm.get('modLong').setValidators(Validators.required);
      }

      if (label.modLong) {
        this.languageForm.get('mod').setValidators(Validators.required);
      }
    }

    this.checkCodeModsChange();
  }


  get classLabels() {
    const arr = this.classInfo?.classLabels || [];
    // const labels: ClassLabel[] = [];

    // arr.forEach((item: any) => {
    //   const lang = this.allLanguages.find(language => (item.language?.id && language.id === item.language.id) || (language.id === item.language));

    //   if (lang) {
    //     item.language = lang;
    //     labels.push(item);
    //   }
    // });

    // return labels;

    return arr;
  }

  getLanguage(language) {
    if (language.name) {
      return language.name;
    }

    return this.allLanguages.find((l) => l?.id === language?.toLowerCase())?.name || language;
  }

  checkCodeModsChange() {
    this.languageForm.get('mod')?.valueChanges?.subscribe(val => {
      if (val) {
        this.languageForm.get('modLong').setValidators(Validators.required)
      } else {
        this.languageForm.get('modLong').clearValidators();
      }
    });

    this.languageForm.get('modLong')?.valueChanges?.subscribe(val => {
      if (val) {
        this.languageForm.get('mod').setValidators(Validators.required)
      } else {
        this.languageForm.get('mod').clearValidators();
      }
    });

    this.languageForm.updateValueAndValidity();
  }

  getClassInfo() {
    this.activatedRouter.params.subscribe(params => {
      this.uId = params?.uid ?? '';
      if (this.uId) {
        forkJoin([this.ruleService.getClassInfo(this.uId), this.ruleService.getColloquialNames(this.uId)])
          .pipe(
            map(res => {
              this.classInfo = res[0].response;
              this.allColloquialsList = res[1].response.colloquialNames;
              this.setSelectedLanguage(this.selectedLanguage?.id, true);
            })).subscribe();
      }
    });

    this.activatedRouter.queryParams.subscribe(params => {
      if (params?.language) {
        this.selectedLanguage = this.allLanguages.find(language => language?.id === params.language.toLowerCase());
      }
    });
  }

  addLanguage(lang: { id: string, name: string }) {
    const classLabels = this.classInfo?.classLabels;
    if (!classLabels.some((label) => (label.language as string)?.toLowerCase() === lang?.id)) {
      this.selectedLanguage = { id: lang?.id, name: lang.name };

      const classLabel = {
        code: '',
        codeLong: '',
        mod: '',
        modLong: '',
        language: this.selectedLanguage?.id,
        label: ''
      };

      this.colloquialsList = [];
      classLabels.push(classLabel);
      this.initForm(classLabel);
    }

    this.trigger.closeMenu();
  }

  deleteLanguage(lang: string) {

    if (this.confirmModalOpened || this.clearAction)
      return;

    this.changesSave = true;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px'
    });

    this.confirmModalOpened = true;

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.languageForm.reset();
        this.colloquialsList = [];
        const index = this.classInfo?.classLabels.findIndex((x: any) => x.language?.toLowerCase() === lang?.toLowerCase());
        if (index > -1) {
          this.classInfo.classLabels.splice(index, 1);
        }

        const language = (this.classLabels[0]?.language as string)?.toLowerCase();

        this.selectedLanguage = this.allLanguages.find(l => l?.id === language);

        this.setSelectedLanguage(language, true);
      }
      this.confirmModalOpened = false;
    });
  }

  closeDialog() {
    this.close.emit();
  }

  setSelectedLanguage(language: string, byPassValidation = false): boolean {
    if (byPassValidation || this.languageChangeConfirmation()) {
      this.languageForm.reset();
      this.colloquialsList = [];
      this.selectedLanguage = this.allLanguages.find(l => l?.id === language);

      const classLabel = this.classLabels.find((sel: any) => sel.language?.toLowerCase() === language);
      if (this.allColloquialsList) {
        const colloquials = this.allColloquialsList.filter((x: any) => x.language?.toLowerCase() === this.selectedLanguage?.id);
        this.colloquialsList = colloquials;
      }
      if (classLabel) {
        this.initForm(classLabel);

        this.changesSave = false;
      }
      return true;
    }
    return false;
  }

  languageChangeConfirmation(): boolean {
    if (!this.changesSave && !this.isFormValid()) {

      this.transientService.alert({
        data: { dialogTitle: '', label: 'Please enter valid data' },
        disableClose: true,
        autoFocus: false,
        width: '600px',
        panelClass: 'create-master-panel',
      }, (response) => { });

    }
    else {
      return true;
    }
  }

  isFormValid(): boolean {
    const classLabel = this.classLabels.find((sel: any) => sel.language?.toLowerCase() === this.selectedLanguage?.id)
    const form = this.languageForm;
    if (classLabel) {
      classLabel.code = form.get('code').value;

      if (this.isNoun) {
        classLabel.codeLong = form.get('codeLong').value;
        classLabel.mod = form.get('mod').value;
        classLabel.modLong = form.get('modLong').value;

        if (
          form.get('code').value.trim() &&
          form.get('codeLong').value.trim() &&
          (
            !form.get('mod').value.trim() ||
            ((form.get('mod').value.trim() &&
              form.get('modLong').value.trim()))
          )) {
          Object.values(this.languageForm.controls).forEach((control) => {
            if (control.invalid) {
              control.markAsTouched();
            }
          });

          return true;
        }
      } else if (form.get('code').value.trim()) {
        return true;
      }
    }
    else {
      Object.values(this.languageForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsTouched();
        }
      });

      return true;
    }

    Object.values(this.languageForm.controls).forEach((control) => {
      if (control.invalid) {
        control.markAsTouched();
      }
    });

    return false;
  }

  getUpdatedData() {
    const updatedClassLabel: ClassLabel = this.languageForm.value;
    const classLabels = this.classLabels;
    if (classLabels.length && this.selectedLanguage) {
      const classLable = classLabels.filter((sel: any) => sel.language?.toLowerCase() === this.selectedLanguage?.id?.toLowerCase())
      const index = classLabels.indexOf(classLable[0]);

      if (classLable.length > 0 && index > -1) {
        const uuid = classLabels[index].uuid;
        classLabels[index] = updatedClassLabel;
        classLabels[index].uuid = uuid;
        classLabels[index].language = this.selectedLanguage;
      }
      else {
        classLabels.push(updatedClassLabel);
      }
    }
    else {
      if (updatedClassLabel.code || updatedClassLabel.mod || updatedClassLabel.language) {
        classLabels.push(updatedClassLabel);
      }
    }

    const payload = {
      ...this.classInfo,
      classLabels: classLabels.map((label: any) => {
        return {
          ...label,
          codeLong: label.code,
          language: (label.language?.id || label.language)?.toLowerCase(),
        }
      }),
    };

    return payload;
  }

  save() {
    if (this.languageForm.invalid) {
      Object.values(this.languageForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsTouched();
        }
      });
      return false;
    }
    const payload = this.getUpdatedData();

    payload.referenceCode = this.classInfo.classType.uuid;
    payload.colloquialNames = this.colloquialsList;
    payload.inheritAttributes = payload.inheritAttributes || false;
    payload.validFrom = payload.validFrom || '0';


    console.log('save', payload);

    this.ruleService.saveUpdateClass(payload).pipe(takeWhile(() => this.subscriptionEnabled)).subscribe((data: ResultInfo<Class>) => {
      if (data?.response) {
        this.transientService.open('Successfully saved!', null, { duration: 2000, verticalPosition: 'bottom' });
        this.sharedService.publish({ type: 'CLASS/LANGUAGES/SAVED', payload: data.response });
      }
      this.close.emit();
    }, (error) => {
      this.transientService.open(error?.message || 'Something went wrong!', null, { duration: 2000, verticalPosition: 'bottom' });
    });
  }

  ngAfterViewChecked(): void {
    this.ref.detectChanges();
  }

  addColloquial(event: MatChipInputEvent): void {
    const input = event.input;
    const value = (event.value || '').trim();
    let order = this.colloquialsList.length;

    if (value) {
      let colloquial = this.colloquialsList
        .find((sel: any) => sel.colloquialName?.trim().toLowerCase() === value?.toLowerCase());

      if (!colloquial) {
        colloquial = {
          calloquialName: value,
          collorder: order++,
          language: this.selectedLanguage?.id,
          xref: ''
        };

        this.colloquialsList.push(colloquial);
        this.allColloquialsList.push(colloquial);

        this.languageForm.patchValue({ colloquials: this.colloquialsList });
      }
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  remove(colloquial: ColloquialName): void {
    const colloquialsName = this.colloquialsList.filter((sel: ColloquialName) => sel.calloquialName === colloquial.calloquialName)
    const index = this.colloquialsList.indexOf(colloquialsName[0]);

    if (index >= 0) {
      this.colloquialsList.splice(index, 1);
    }
  }

  isRequiredField(field: string) {
    return this.languageForm.get(field).hasValidator(Validators.required);
  }
}

