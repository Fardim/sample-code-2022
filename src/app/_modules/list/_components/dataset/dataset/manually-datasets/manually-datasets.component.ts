import { ConnectorService } from '@modules/list/_components/connector/services/connector.service';
import { Component, ElementRef, EventEmitter, Inject, Input, LOCALE_ID, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DataPrivacy, DataType, Owner, Persistence, SaveModuleSuccess } from '@models/core/coreModel';
import { Userdetails } from '@models/userdetails';
import { CoreService } from '@services/core/core.service';
import { UserService } from '@services/user/userservice.service';
import { Subject, Observable, Subscription } from 'rxjs';
import { /* map, startWith, debounceTime, distinctUntilChanged, */ debounceTime, distinctUntilChanged, map, startWith, take } from 'rxjs/operators';

@Component({
  selector: 'pros-manually-datasets',
  templateUrl: './manually-datasets.component.html',
  styleUrls: ['./manually-datasets.component.scss'],
})
export class ManuallyDatasetsComponent implements OnInit, OnDestroy {
  // form
  datasetForm: FormGroup;

  /*** number of chips to show as selected*/
  limit = 5;

  industryOptions: Observable<string[]>;
  parentDatasetOptions: any[] = []; // Observable<any[]>;

  /*** Available options list*/
  allIndustryOptions: string[] = ['Industry 1', 'Industry 2', 'Industry 3'];
  allparentDatasetOptions: any[] = [] // ['Parent dataset1', 'Parent dataset2', 'Parent dataset3'];
  /*** Reference to the input */
  @ViewChild('optionInput') optionInput: ElementRef<HTMLInputElement>;
  @ViewChild('parentOptionInput') parentOptionInput: ElementRef<HTMLInputElement>;

  // dummy data
  systemTypeOptions = [
    { label: 'System type1', value: 'SYSTEM_TYPE_1' },
    { label: 'System type2', value: 'SYSTEM_TYPE_2' },
    { label: 'System type3', value: 'SYSTEM_TYPE_3' },
  ];
  ownerOptions = [
    { label: 'Partner', value: 'PARTNER' },
    { label: 'Customer', value: 'CUSTOMER' },
    { label: 'MDO', value: 'MDO' },
  ];
  dataTypeOptions = [
    { label: 'Master', value: 'MASTER' },
    { label: 'Transaction', value: 'TRANSACTION' },
    { label: 'Reference', value: 'REFERENCE' },
  ];
  persistenceOptions = [
    { label: 'Condition based', value: 'CONDITION_BASED' },
    { label: 'Time bound', value: 'TIME_BOUND' },
  ];
  dataPrivacyOptions = [
    { label: 'Retention', value: 'RETENTION' },
    { label: 'TBD', value: 'TBD' }
  ];

  // to add values in array of multiselect
  selectedOptions = [];
  selectedParentDatasetOptions = [];

  // for error banner
  formErrMsg = '';
  showErrorBanner = false;

  hasError = {
    datasetName: false,
    datasetDescription: false,
  };

  // output event emitter
  @Output()
  cancelClick: EventEmitter<{toRefreshApis: boolean, moduleId?: number}> = new EventEmitter<{toRefreshApis: boolean, moduleId?: number}>();

  @Output()
  backClick: EventEmitter<any> = new EventEmitter<any>();

  // all input variables
  @Input()
  selectedDatasetId = 0;

  @Input() selectedDatasetType = null;

  subscription: Subscription = new Subscription();

  // for update
  selectedDatasetDetails: any;

  userDetails: Userdetails = new Userdetails();

  searchFieldSub: Subject<string> = new Subject();

  constructor(private coreService: CoreService, private userService: UserService, @Inject(LOCALE_ID) public locale: string, private connectorService: ConnectorService) {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
   }

  get isSystemDatasetType() {
    return this.selectedDatasetType === 'SYS';
  }

  ngOnInit(): void {
    this.selectedDatasetType = localStorage.getItem('selectedDatasetType');
    this.subscription.add(
      this.userService.getUserDetails().subscribe((response: Userdetails) => {
        this.userDetails = response;
      })
    );

    // new dataset form
    this.createDatasetForm();
    this.getParentDatasetList(this.locale, '');

    // for industry multiselect
    this.industryOptions = this.datasetForm.controls.industry.valueChanges.pipe(
      startWith(''),
      map((industry: string | null) => (industry ? this._filter(industry) : this.allIndustryOptions.slice()))
    );

    // for parent dataset multiselect
    /*this.parentDatasetOptions = this.datasetForm.controls.parentDataset.valueChanges.pipe(
      startWith(''),
      map((parentDataset: string | null) =>
        parentDataset ? this._filterParentDataset(parentDataset) : this.allparentDatasetOptions.slice()
      )
    );*/

    if (this.selectedDatasetId !== 0) {
      this.getDatasetDetails();
    }

     this.searchFieldSub.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString: any) => {
      const searchQuery = searchString.target.value;
      this.parentDatasetOptions = searchQuery
        ? this.allparentDatasetOptions.filter((num) => num.moduleDescriptionRequestDTO?.description.toLowerCase().indexOf(searchQuery.toLowerCase()) === 0)
        : this.allparentDatasetOptions.slice();

    });

    this.datasetForm.controls.parentDataset.valueChanges.subscribe((searchString: any) => {
      const searchQuery = searchString;
      if(!this.allparentDatasetOptions.find((option) => option.moduleId === searchString)) {
        this.parentDatasetOptions = searchQuery ? this._filterParentDataset(searchQuery) : this.allparentDatasetOptions.slice();
      }
    });
  }

  getHint(field) {
    let msg;
    if (this.requiredFieldError(field)) {
      msg = 'This is a required field';
    } else if (this.whiteSpaceFieldError(field)) {
      msg = `WhiteSpace not allowed`;
    }

    if (msg) {
      this.hasError[field] = true;
      return msg;
    }

    this.hasError[field] = false;
    return '';
  }

  requiredFieldError(field) {
    return ((this.datasetForm.controls[field].invalid && (this.datasetForm.controls[field]?.touched || this.datasetForm.controls[field].dirty)) &&
      this.datasetForm.controls[field].errors &&
      this.datasetForm.controls[field].errors.required)
  }

  whiteSpaceFieldError(field) {
    return ((this.datasetForm.controls[field].invalid && (this.datasetForm.controls[field]?.touched || this.datasetForm.controls[field].dirty)) &&
      this.datasetForm.controls[field].errors &&
      this.datasetForm.controls[field].errors.whitespace)
  }

  showBanner() {
    return this.showErrorBanner || ((this.requiredFieldError('datasetName') || this.whiteSpaceFieldError('datasetName')) || (this.requiredFieldError('datasetDescription') || this.whiteSpaceFieldError('datasetDescription')))
  }

  // get dataset details by selected dataset
  getDatasetDetails() {
    this.subscription.add(
      this.coreService.getDatasetDetails(this.selectedDatasetId).subscribe((res: any) => {
        this.selectedDatasetDetails = res;
        this.setFormValues();
      })
    );
  }

  // set form values from selected details
  setFormValues() {
    this.datasetForm.controls.datasetId.setValue(this.selectedDatasetId);
    this.datasetForm.controls.datasetName.setValue(this.selectedDatasetDetails.datasetName);
    this.datasetForm.controls.datasetDescription.setValue(this.selectedDatasetDetails.datasetDescription);
    this.datasetForm.controls.datasetCompanyId.setValue(this.selectedDatasetDetails.datasetCompanyId);
    this.datasetForm.controls.singleRecordDataset.setValue(this.selectedDatasetDetails.singleRecordDataset);
    // this.datasetForm.controls.appName.setValue(this.selectedDatasetDetails.appName);
    // this.selectedOptions = this.selectedDatasetDetails.industry;
    this.datasetForm.controls.systemType.setValue(this.selectedDatasetDetails.systemType);
    this.datasetForm.controls.owner.setValue(this.selectedDatasetDetails.owner);
    this.datasetForm.controls.datatype.setValue(this.selectedDatasetDetails.datatype);
    this.datasetForm.controls.persistence.setValue(this.selectedDatasetDetails.persistence);
    this.datasetForm.controls.dataPrivacy.setValue(this.selectedDatasetDetails.dataPrivacy);
    this.datasetForm.controls.type.setValue(this.selectedDatasetDetails.type);
    this.datasetForm.controls.systemDataset.setValue(this.selectedDatasetDetails.type === 'SYS' ? true : false );
    this.selectedParentDatasetOptions = this.selectedDatasetDetails.parentDataset;
  }

  // will create form on init
  createDatasetForm() {
    const filedValidators: { [key: string]: any } = [
      { datasetName: [Validators.required, this.noWhitespaceValidator] },
      { datasetDescription: [Validators.required, this.noWhitespaceValidator] }
    ];
    ['industry', 'owner', 'datatype', 'persistence', 'dataPrivacy'].forEach(field => {
      filedValidators[field] = this.isSystemDatasetType ? [Validators.required] : [];
    });
    this.datasetForm = new FormGroup({
      datasetId: new FormControl({ value: '1', disabled: true }),
      datasetName: new FormControl('', filedValidators['datasetName']),
      datasetDescription: new FormControl('', filedValidators['datasetDescription']),
      datasetCompanyId: new FormControl({ value: '10', disabled: true }),
      singleRecordDataset: new FormControl(false),
      appName: new FormControl(''),
      industry: new FormControl('', filedValidators['industry']),
      systemType: new FormControl('SYSTEM_TYPE_1'),
      owner: new FormControl('PARTNER', filedValidators['owner']),
      datatype: new FormControl('MASTER', filedValidators['datatype']),
      persistence: new FormControl('CONDITION_BASED', filedValidators['persistence']),
      dataPrivacy: new FormControl('RETENTION', filedValidators['dataPrivacy']),
      parentDataset: new FormControl([]),
      systemDataset: new FormControl(false),
      type: new FormControl(this.selectedDatasetType)
    });
  }

  /**
   * mehtod to filter items based on the searchterm
   * @param value searchTerm
   * @returns string[]
   */
  _filter(value: string): string[] {
    const filterValue = value?.toLowerCase();

    return this.allIndustryOptions.filter((num) => num?.toLowerCase()?.indexOf(filterValue) === 0);
  }

  /**
   * mehtod to filter items based on the searchterm
   * @param value searchTerm
   * @returns string[]
   */
  _filterParentDataset(value: string): any[] {
    const filterValue = value?.toLowerCase() || '';

    return this.allparentDatasetOptions.filter((num) => num.moduleDescriptionRequestDTO?.description.toLowerCase().includes(filterValue));
  }

  /**
   * to check if limit is extended
   * @param isParentDataset is from parent dataset select or from industry select
   * @returns boolean
   */
  hasLimit(isParentDataset): boolean {
    return isParentDataset ? this.selectedParentDatasetOptions.length > this.limit : this.selectedOptions.length > this.limit;
  }

  /*** method to add item to selected items for multisleect
   * @param event mat autocomplete event
   */
  selected(event: MatAutocompleteSelectedEvent): void {
      // this.selectedOptions.push(event.option.viewValue);
      this.datasetForm.controls.industry.setValue(event.option.value);
  }

  /*** method to add item to selected items for multisleect of parent dataset
   * @param event item
   */
  selectedParentDataset(event: MatAutocompleteSelectedEvent): void {
    if(!this.selectedParentDatasetOptions.find((option) => option.moduleId === event.option.value)) {
      this.selectedParentDatasetOptions.push({moduleId: event.option.value, description: event.option.viewValue});
    }
    console.log(this.selectedParentDatasetOptions);
    // this.datasetForm.controls.parentDataset.setValue(this.selectedParentDatasetOptions);
    // @ts-ignore
    document.getElementById('parentOptionInput').value = '';
  }

  /**
   * Remove industry from selected industry options
   * @param industry selected industry
   */
  removeIndustryOption(industry: string): void {
    const index = this.selectedOptions.indexOf(industry);

    if (index >= 0) {
      this.selectedOptions.splice(index, 1);
    }
  }

  /**
   * Remove parent dataset from selected parent dataset options
   * @param moduleId dataset selected parent dataset id
   */
   removeParentDatasetOptions(moduleId: string): void {
    const index = this.selectedParentDatasetOptions.findIndex(option => option.moduleId === moduleId);

    if (index >= 0) {
      this.selectedParentDatasetOptions.splice(index, 1);
    }
  }

  // create  button click check if form is valid or not and if not show banner
  onSubmitClick() {
    if (!this.datasetForm.valid) {
      Object.values(this.datasetForm.controls).forEach((control) => {
         control.markAsTouched();
      });
      this.formErrMsg = 'Please correct errors below before saving the dataset';
      this.showErrorBanner = true;
    } else {
      const parentDatasetModuleIds = [];
      this.selectedParentDatasetOptions.forEach((selectedParentDataset) => {
        /* parentDatasetModuleIds.push(ParentDataset[selectedParentDataset.description.toUpperCase().replace(' ', '')]); */
        parentDatasetModuleIds.push(selectedParentDataset.moduleId);
      });
      const payload = {
        dataPrivacy: DataPrivacy[this.datasetForm.controls.dataPrivacy.value],
        dataType: DataType[this.datasetForm.controls.datatype.value],
        displayCriteria: '25',
        industry: this.selectedOptions.join(','),
        isSingleRecord: this.datasetForm.controls.singleRecordDataset.value,
        moduledescription: {
          en: {
            description: this.datasetForm.controls.datasetDescription.value,
            information: this.datasetForm.controls.datasetName.value,
          },
        },
        owner: Owner[this.datasetForm.controls.owner.value],
        persistent: Persistence[this.datasetForm.controls.persistence.value],
        systemType: this.datasetForm.controls.systemType.value,
        usermodified: this.userDetails.userName ? this.userDetails.userName : this.userDetails.email,
        type: this.datasetForm.controls.type.value,
        parentModuleIds: parentDatasetModuleIds
      };

      console.log(payload);

      this.subscription.add(
        this.coreService.saveModule(payload).subscribe((res: SaveModuleSuccess) => {

          if (res) {
            this.cancelClick.emit({toRefreshApis: true, moduleId: +res.moduleid});
            this.connectorService.onCancelClick({toRefreshApis: true, moduleId: +res.moduleid});
            if(this.selectedDatasetId === 0) {
              this.coreService.createRootStructure(res.moduleid, this.locale).subscribe();
            }
          }
        })
      );
    }
  }

  changeSystemDataset(event: boolean) {
    if(event) {
      this.datasetForm.controls.type.setValue('SYS');
    } else {
      this.datasetForm.controls.type.setValue(this.selectedDatasetType ? this.selectedDatasetType : 'STD');
    }
  }
  // download dataset configuration
  downloadDatasetConfig() {
    console.log(this.datasetForm.value); // TODO : For now added to handle event
  }

  // upload dataset configuration
  uploadDataset() {
    console.log(this.datasetForm.value); // TODO : For now added to handle event
  }

  // output close click event
  onCancelClick() {
    this.cancelClick.emit({toRefreshApis: false, moduleId: null});
    this.connectorService.onCancelClick({toRefreshApis: false, moduleId: null});
  }

  // show wizard on back click and reset form
  back() {
    this.backClick.emit();
    this.connectorService.backClicked.next(true);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getParentDatasetList(lang, searchQuery)
  {
    let subscription: Observable<any>;
    subscription = this.coreService.getSearchedParentModules(lang, searchQuery).pipe(take(1));

    subscription.subscribe((resp: any) => {
       if (resp.length > 0) {
       this.allparentDatasetOptions = resp;
       this.parentDatasetOptions = this.allparentDatasetOptions
      }
    });
  }

  // Custom Validator for checking blank space in input fields
  noWhitespaceValidator(control: FormControl) {
    const isWhitespacePresent = (control.value || '').trim().length === 0;
    const isValid = !isWhitespacePresent;
    return isValid ? null : { whitespace: true };
  }
}
