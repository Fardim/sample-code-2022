import { Component, OnDestroy, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, LOCALE_ID, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';

import { ClassType, CPIConnection, ResultInfo } from '@modules/classifications/_models/classifications';
import { Utilities } from '@models/schema/utilities';
import { ValidationError } from '@models/schema/schema';
import { RuleService } from '@services/rule/rule.service';
import { debounceTime, distinctUntilChanged, takeWhile } from 'rxjs/operators';
import { UserService } from '@services/user/userservice.service';

@Component({
  selector: 'pros-class-type-translate',
  templateUrl: './class-type-translate.component.html',
  styleUrls: ['./class-type-translate.component.scss']
})
export class ClassTypeTranslateComponent implements OnInit, OnDestroy {
  @ViewChild('messageContainer') messageContainer: ElementRef<HTMLDivElement>;



  subscriptionEnabled = true;

  /*** hold the list of filtered options*/
  filteredOptions: Observable<string[]>;

  /*** Form control for the input*/
  optionCtrl = new FormControl();
  page = 1;
  relatedDatasets = [];
  classTypeDetails: ClassType;
  control = new FormControl();
  classTypesList = [];
  sourceLang = 'English';
  selectedClassTypes = [];
  languagesList = [];
  selectedlanguages = [];

  @Input() closable = false;
  @Input() classTypeId: string;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @ViewChild('relatedDatasetsValuesInput') relatedDatasetsValuesInput: ElementRef<HTMLInputElement>;
  @Output() close: EventEmitter<any> = new EventEmitter(null);

  _locale: string
  // form
  classTypeForm: FormGroup;
  limit = 4;
  translated:boolean = false;

  editorId: string;
  moduleData = [];
  cpiConnections: CPIConnection[] = [];

  submitError: ValidationError = {
    status: false,
    message: ''
  };

  constructor(
    public fb: FormBuilder,
    private utilityService: Utilities,
    private ruleService: RuleService,
    private userService: UserService,
    @Inject(LOCALE_ID) private locale: string
  ) {
    this._locale = this.locale.split('-')[0] || 'en';
  }

  ngOnInit(): void {
    this.editorId = this.utilityService.getRandomString(10);
    this.loadClassTypes();
    this.loadLanguages();
    setTimeout(() => {
      this.initForm();
    }, 2000);
  }

  loadClassTypes(){
    this.ruleService.getAllClassTypes(this.page, 100, '', []).pipe(debounceTime(1000), distinctUntilChanged(), takeWhile(() => this.subscriptionEnabled)).subscribe((data) => {
      if (data?.response) {
        data.response?.forEach((item: ClassType) => {
          this.classTypesList.push({label: item.className, value: item.className, id: item.uuid});
        });
        console.log(this.classTypesList);
      }
    });
  }

  loadLanguages(){
    this.userService.getAllLanguagesList().subscribe(
      (data) => {
        if (data) {
          data.forEach((item: string) => {
            this.languagesList.push({label: item, value: item});
          });
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  ngOnDestroy(): void {
    this.subscriptionEnabled = false;
  }

  initForm() {
    const srcLangName = this._locale === 'en'? 'English': this._locale;
    this.classTypeForm = this.fb.group({
      currentLanguage: [srcLangName, [Validators.required]],
      classTypes: ['', [Validators.required]],
      languages: ['', [Validators.required]]
    });
  }

  toggleClassType(id) {
      // this.classTypes.map((type, index) => {
      //     if(type.id == id){
      //       this.classTypes[index].selected = !this.classTypes[index].selected;
      //     }
      // });
  }

  toggleLanguage(id) {
    // this.languages.map((type, index) => {
    //     if(type.id == id){
    //       this.languages[index].selected = !this.languages[index].selected;
    //     }
    // });
  }

  hasLimit(): boolean {
    return this.classTypeForm.get('relatedDatasets').value.length > this.limit;
  }

  closeDialog() {
    this.close.emit();
  }

  selected(event){

  }

  setClassTypes(event){
    this.selectedClassTypes = [];
    event.forEach((ct) => {
      let selitem = this.classTypesList.filter((item) => item.value == ct);
      console.log(selitem);
      this.selectedClassTypes.push(selitem[0]['id']);
    });
    this.classTypeForm.patchValue({
      classTypes: this.selectedClassTypes,
      languages: this.selectedlanguages
    });
  }

  setLangague(event){
    this.selectedlanguages = event;
    this.classTypeForm.patchValue({
      classTypes: this.selectedClassTypes,
      languages: this.selectedlanguages
    });
  }

  save() {
    if (!this.classTypeForm.valid) {
      Object.values(this.classTypeForm.controls).forEach((control) => {
        control.markAsTouched();
     });
    } else {
      this.ruleService.translateClassTypes(this.selectedClassTypes, this._locale, this.selectedlanguages.map((langCode) => langCode.toLowerCase())).subscribe((res: ResultInfo<ClassType>) => {
        this.closeDialog();
      }, err => {
          this.submitError = {
              status: true,
              message: err.error?.errorMsg || 'Something went wrong!',
            };

            setTimeout(() => {
              this.submitError.status = false;
            }, 4000);
      })
    }
  }

}
