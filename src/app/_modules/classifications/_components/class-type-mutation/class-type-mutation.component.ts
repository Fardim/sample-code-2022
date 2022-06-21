import { Component, OnDestroy, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, LOCALE_ID, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, takeWhile } from 'rxjs/operators';

import { ClassType, CPIConnection, ResultInfo } from '@modules/classifications/_models/classifications';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { CoreService } from '@services/core/core.service';
import { RuleService } from '@services/rule/rule.service';
import { Utilities } from '@models/schema/utilities';
import { TransientService } from 'mdo-ui-library';
import { ValidationError } from '@models/schema/schema';
import { ConnectionService } from '@services/connection/connection.service';

@Component({
  selector: 'pros-class-type-mutation',
  templateUrl: './class-type-mutation.component.html',
  styleUrls: ['./class-type-mutation.component.scss']
})
export class ClassTypeMutationComponent implements OnInit, OnDestroy {
  @ViewChild('messageContainer') messageContainer: ElementRef<HTMLDivElement>;

  subscriptionEnabled = true;

  /*** hold the list of filtered options*/
  filteredOptions: Observable<string[]>;

  /*** Form control for the input*/
  optionCtrl = new FormControl();

  relatedDatasets = [];
  classTypeDetails: ClassType;
  control = new FormControl();

  @Input() closable = false;
  @Input() classTypeId: string;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @ViewChild('relatedDatasetsValuesInput') relatedDatasetsValuesInput: ElementRef<HTMLInputElement>;
  @Output() close: EventEmitter<any> = new EventEmitter(null);

  _locale: string
  // form
  classTypeForm: FormGroup;
  limit = 4;

  editorId: string;
  moduleData = [];
  cpiConnections: CPIConnection[] = [];

  submitError: ValidationError = {
    status: false,
    message: ''
  };

  constructor(
    public fb: FormBuilder,
    private sharedService: SharedServiceService,
    private utilityService: Utilities,
    private coreService: CoreService,
    private ruleService: RuleService,
    private transientService: TransientService,
    @Inject(LOCALE_ID) private locale: string,
    private connectionService: ConnectionService,
  ) {
    this._locale = this.locale.split('-')[0] || 'en';
  }

  ngOnInit(): void {
    this.editorId = this.utilityService.getRandomString(10);
    this.initForm();
    this.getClassTypeDetails();
    this.getRelatedDatasets('');
    this.loadCPIConnections();

    this.optionCtrl.valueChanges.pipe(debounceTime(700), distinctUntilChanged()).subscribe(filterString => {
      this.getRelatedDatasets(filterString);
    });
  }

  ngOnDestroy(): void {
    this.subscriptionEnabled = false;
  }

  initForm() {
    this.classTypeForm = this.fb.group({
      classType: ['', [Validators.required]],
      className: ['', [Validators.required]],
      description: [''],
      relatedDatasets: [[], []],
      nountype: [false, []],
      allowMultipleclass: [true, []],
      enableSync: [false, []],
      system: ['', []],
    });
  }

  getClassTypeDetails() {
    if (this.classTypeId) {
      this.ruleService.getClassTypeDetails(this.classTypeId).pipe(takeWhile(() => this.subscriptionEnabled)).subscribe((data: ClassType) => {
        this.classTypeDetails = data;
        this.classTypeDetails.relatedDatasets = this.classTypeDetails.relatedDatasets || [];
        this.classTypeDetails.relatedDatasets = this.classTypeDetails.relatedDatasets.filter((item) => item);
        this.relatedDatasets = this.classTypeDetails.relatedDatasets;

        this.classTypeForm.setValue({
          classType: data?.classType,
          className: data?.className,
          description: data?.description,
          relatedDatasets: [],
          nountype: data?.nountype,
          allowMultipleclass: data?.allowMultipleclass,
          enableSync: data?.enableSync,
          system: data?.system,
        });

        if (this.relatedDatasets.length) {
          this.getAllModules(data.relatedDatasets);
        }

        this.control.setValue(data?.description);
      });
    }
  }

  getRelatedDatasets(filterString) {
    this.coreService.getDataSets(filterString, 0, 0, this._locale).pipe(takeWhile(() => this.subscriptionEnabled))
      .subscribe(res => {
        this.moduleData = res;
        this.filteredOptions = this.optionCtrl.valueChanges.pipe(
          startWith(''),
          map((num: string | null) => num ? this._filter(num) : this.moduleData.slice()));
      }, (err) => {
        console.log(err);
      });
  }

  getAllModules(moduleIds: string[]) {
    this.coreService.searchAllObjectType({ lang: this.locale, fetchsize: 50, fetchcount: 0, description: '' }, moduleIds).pipe(takeWhile(() => this.subscriptionEnabled))
      .subscribe((data) => {
        console.log('data', data);
        this.classTypeForm.get('relatedDatasets')?.setValue(data);
      });
  }

  loadCPIConnections() {
    this.connectionService.getCPIConnections().pipe(takeWhile(() => this.subscriptionEnabled)).subscribe((items: CPIConnection[]) => {
      this.cpiConnections = items;
    });
  }

  hasLimit(): boolean {
    return this.classTypeForm.get('relatedDatasets').value.length > this.limit;
  }

  selectedRelatedDatasetsValues(event: MatAutocompleteSelectedEvent): void {
    const relatedDatasets = this.classTypeForm.get('relatedDatasets').value;
    const obj = relatedDatasets.find(d => d.moduleId === event.option.value.moduleId);

    if (obj) {
      this.removeRelatedDatasetsValues(obj);
    } else {
      relatedDatasets.push(event.option.value);
      this.relatedDatasets.push(event.option.value.moduleId);

      this.classTypeForm.patchValue({
        relatedDatasets
      });
    }

    this.relatedDatasetsValuesInput.nativeElement.value = '';
    this.optionCtrl.setValue(null);
  }

  isItemChecked(opt) {
    const obj = this.relatedDatasets.find(d => d === opt.moduleId);

    return !!obj;
  }

  removeRelatedDatasetsValues(opt) {
    const relatedDatasets = this.classTypeForm.get('relatedDatasets').value;
    const index = relatedDatasets.findIndex(d => d.moduleId === opt.moduleId);
    if (index >= 0) {
      relatedDatasets.splice(index, 1);
      this.relatedDatasets = this.relatedDatasets.filter(x => x !== opt.moduleId);
    }
    this.classTypeForm.patchValue({
      relatedDatasets
    });
  }

  save() {
    this.submitError.status = false;

    if (!this.classTypeForm.value.enableSync) {
      this.classTypeForm.get('system').disable();
    } else {
      this.classTypeForm.get('system').enable();
    }

    if (this.classTypeForm.invalid) {
      Object.values(this.classTypeForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsTouched();
        }
      });
      return false;
    }

    const payload: ClassType = {
      ...this.classTypeForm.value,
      classType: this.classTypeForm.value.classType.toUpperCase(),
      classes: this.classTypeDetails?.classes,
      allowHierachy: this.classTypeDetails?.allowHierachy,
      allowMultidataset: this.classTypeDetails?.allowMultidataset,
      uuid: this.classTypeId,
      classTypeId: this.classTypeId,
      relatedDatasets: this.relatedDatasets,
    };

    this.ruleService.saveUpdateClassType(payload).pipe(takeWhile(() => this.subscriptionEnabled)).subscribe((res: ResultInfo<ClassType>) => {
      if (res.success) {
        this.transientService.open('Successfully saved!', null, { duration: 2000, verticalPosition: 'bottom' });
        this.sharedService.publish({ type: this.classTypeId ? 'CLASS_TYPE/UPDATED' : 'CLASS_TYPE/CREATED', payload: res.data });
      }
      this.close.emit();
    }, (err) => {
      this.messageContainer.nativeElement.scrollIntoView({ behavior: 'smooth' });

      this.submitError = {
        status: true,
        message: err.error?.errorMsg || 'Something went wrong!',
      };

      setTimeout(() => {
        this.submitError.status = false;
      }, 4000);
    });
  }

  editorValueChange(event) {
    this.classTypeForm.get('description').setValue(event.newValue);
  }

  closeDialog() {
    this.close.emit();
  }

  /**
   * method to filter items based on the search term
   * @param value searchTerm
   * @returns string[]
   */
  _filter(value: string): string[] {
    const filterValue = value?.toLowerCase();

    return filterValue ? this.moduleData.filter(m => m.moduleDesc.toLowerCase().indexOf(filterValue) === 0) : this.moduleData;
  }
}
