import { Component, Inject, Input, LOCALE_ID, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ActivatedRoute, Router } from '@angular/router';
import { ObjectType } from '@models/core/coreModel';
import { CoreService } from '@services/core/core.service';
import { Subscription, Observable, Subject } from 'rxjs';
import { take, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'pros-edit-dataset',
  templateUrl: './edit-dataset.component.html',
  styleUrls: ['./edit-dataset.component.scss']
})
export class EditDatasetComponent implements OnInit, OnDestroy {

  datasetformGroup: FormGroup;
  subscriptionsList: Subscription[] = [];
  parentDatasetOptions: any[] = []; // Observable<any[]>;
  allparentDatasetOptions: any[] = [];
  parentDatasetModuleIds: any[] = [];

  /*** number of chips to show as selected*/
  limit = 5;
  selectedOptions = [];
  selectedParentDatasetOptions = [];
  searchFieldSub: Subject<string> = new Subject();

  // current ModuleId
  @Input() moduleId: string;
  @Input() drawer;
  @ViewChild('parentOptionInput') parentOptionInput: ElementRef<HTMLInputElement>;

  /**
   * Hold current module details
   */
  objectType: ObjectType = { objectdesc: '', objectInfo: '', objectid: 0, parentDatasets: [],
    displayCriteria: 0, systemType: '', usermodified: '', dataPrivacy: 0, dataType: 0, type: '',
    fields: [], industrty: '', isSingleRecord: true, owner: 0, persistent: 0};

  constructor(
    private fb: FormBuilder,
    public activatedRouter: ActivatedRoute,
    private router: Router,
    private coreService: CoreService,
    @Inject(LOCALE_ID) public locale: string
  ) { }

  ngOnInit(): void {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    this.getObjectTypeDetails();
    this.getParentDatasetList(this.locale, '');

    this.searchFieldSub.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString: any) => {
      const searchQuery = searchString.target.value;
      this.parentDatasetOptions = searchQuery
        ? this.allparentDatasetOptions.filter((num) => num.moduleDescriptionRequestDTO?.description.toLowerCase().indexOf(searchQuery.toLowerCase()) === 0)
        : this.allparentDatasetOptions.slice();

    });
  }

  getObjectTypeDetails() {
    const sub = this.coreService.getEditObjectTypeDetails(this.moduleId).subscribe(
      (response: any) => {
        console.log(response);
        this.objectType.objectid = response.moduleid;
        this.objectType.objectdesc = response.moduleDescriptionMap[this.locale][0].description;
        this.objectType.objectInfo = response.moduleDescriptionMap[this.locale][0].information;
        this.objectType.parentDatasets = response.parentModuleIds;
        this.objectType.displayCriteria = response.displayCriteria;
        this.objectType.systemType = response.systemType;
        this.objectType.usermodified = response.usermodified;
        this.objectType.dataPrivacy = response.dataPrivacy;
        this.objectType.dataType = response.dataType;
        this.objectType.type = response.type;

        this.objectType.fields = response.fields ? response.fields : [];
        this.objectType.industrty = response.industry ? response.industry : '';
        this.objectType.isSingleRecord = response.isSingleRecord ? response.isSingleRecord : true;
        this.objectType.owner = response.owner ? response.owner : 0;
        this.objectType.persistent = response.persistent ? response.persistent : 0;


        this.createDatasetFormGroup(this.objectType)
      },
      (error) => {
        console.error(`Error : ${error.message}`);
      }
    );
    this.subscriptionsList.push(sub);
  }

  createDatasetFormGroup(datasetForm?) {
    this.datasetformGroup = this.fb.group({
      objectName: [datasetForm && datasetForm.objectInfo ? datasetForm.objectInfo : '', [Validators.required, Validators.maxLength(50)]],
      objectDesc: [datasetForm && datasetForm.objectdesc ? datasetForm.objectdesc : '', [Validators.maxLength(50)]],
      objectParentDataset: [],
      objectDisplayCriteria: [datasetForm && datasetForm.displayCriteria ? datasetForm.displayCriteria : ''],
      objectSystemType: [datasetForm && datasetForm.systemType ? datasetForm.systemType : ''],
      objectusermodified: [datasetForm && datasetForm.usermodified ? datasetForm.usermodified : ''],
      objectDataPrivacy: [datasetForm && datasetForm.dataPrivacy ? datasetForm.dataPrivacy : 0],
      objectDataType: [datasetForm && datasetForm.dataType ? datasetForm.dataType: 0],
      objectType: [datasetForm && datasetForm.type ? datasetForm.type : ''],

      objectFields: [datasetForm && datasetForm.fields ? datasetForm.fields : []],
      objectIndustry: [datasetForm && datasetForm.industry ? datasetForm.industry : ''],
      objectIsSingleRecord: [datasetForm && datasetForm.isSingleRecord ? datasetForm.isSingleRecord : true],
      objectOwner: [datasetForm && datasetForm.owner ? datasetForm.owner : 0],
      objectPersistent: [datasetForm && datasetForm.persistent ? datasetForm.persistent : 0]

    });

    this.datasetformGroup.controls.objectParentDataset.valueChanges.subscribe((searchString: any) => {
      const searchQuery = searchString;
      if(!this.allparentDatasetOptions.find((option) => option.moduleId === searchString)) {
        this.parentDatasetOptions = searchQuery ? this._filterParentDataset(searchQuery) : this.allparentDatasetOptions.slice();
      }
    });
    setTimeout(() => {
      document.getElementById('edit_dataset_first_field').focus();
    }, 100);
  }

  updateDatasetValue() {

      this.selectedParentDatasetOptions.forEach((selectedParentDataset) => {
        this.parentDatasetModuleIds.push(selectedParentDataset.moduleId);
      });

    const reqPayload = {
      moduledescription: {
        [this.locale]: {
          information: this.datasetformGroup.value.objectName,
          description: this.datasetformGroup.value.objectDesc,
        }
      },
      parentModuleIds: this.parentDatasetModuleIds,
      displayCriteria: this.datasetformGroup.value.objectDisplayCriteria,
      systemType: this.datasetformGroup.value.objectSystemType,
      usermodified: this.datasetformGroup.value.objectusermodified,
      dataPrivacy: this.datasetformGroup.value.objectDataPrivacy,
      dataType: this.datasetformGroup.value.objectDataType,
      type: this.datasetformGroup.value.objectType,
      fields: this.datasetformGroup.value.objectFields,
      industry: this.datasetformGroup.value.objectIndustry,
      isSingleRecord: this.datasetformGroup.value.objectIsSingleRecord,
      owner: this.datasetformGroup.value.objectOwner,
      persistent: this.datasetformGroup.value.objectPersistent
    }
    console.log(reqPayload);

    this.coreService.nextUpdateDataSetInfoSubject({objectName: this.datasetformGroup.value.objectName, objectdesc: this.datasetformGroup.value.objectDesc,
      objectParentModuleIds: this.parentDatasetModuleIds, objectId: this.moduleId})
    this.coreService
        .updateDatasetInfo(this.moduleId, reqPayload)
        .pipe(take(1))
        .subscribe((resp) => {
        });
  }

  /**
   * mehtod to filter items based on the searchterm
   * @param value searchTerm
   * @returns string[]
   */
  _filterParentDataset(value: string): any[] {
    const filterValue = value.toLowerCase();

    return this.allparentDatasetOptions.filter((num) => num.moduleDescriptionRequestDTO?.description.toLowerCase().indexOf(filterValue) === 0);
  }

  /**
   * to check if limit is extended
   * @param isParentDataset is from parent dataset select or from industry select
   * @returns boolean
   */
   hasLimit(isParentDataset): boolean {
    return isParentDataset ? this.selectedParentDatasetOptions.length > this.limit : this.selectedOptions.length > this.limit;
  }

  /*** method to add item to selected items for multisleect of parent dataset
   * @param event item
   */
   selectedParentDataset(event: MatAutocompleteSelectedEvent): void {
     console.log(event);
     if(!this.selectedParentDatasetOptions.find((option) => option.moduleId === event.option.value)) {
      this.selectedParentDatasetOptions.push({moduleId: event.option.value, description: event.option.viewValue});
      this.updateDatasetValue();
    }

    // @ts-ignore
    document.getElementById('parentOptionInput').value = '';
  }

   /**
    * Remove parent dataset from selected parent dataset options
    * @param parent dataset selected parent dataset
    */
    removeParentDatasetOptions(parentDataset: string): void {
      const index = this.selectedParentDatasetOptions.indexOf(parentDataset);

      if (index >= 0) {
        this.selectedParentDatasetOptions.splice(index, 1);
        this.updateDatasetValue();
      }
    }

  // close() {
  //   if (this.drawer) {
  //     this.drawer.close();
  //   }
  //   this.router.navigate([`/home/list/fields/${this.moduleId}`]);
  // }

  ngOnDestroy(): void {
    this.subscriptionsList.forEach((subs) => subs.unsubscribe());
  }

  getParentDatasetList(lang, searchQuery)
  {
    let subscription: Observable<any>;
    subscription = this.coreService.getSearchedParentModules(lang, searchQuery).pipe(take(1));

    subscription.subscribe((resp: any) => {
       if (resp.length > 0) {
        console.log(resp);
        this.allparentDatasetOptions = resp;
        this.parentDatasetOptions = this.allparentDatasetOptions;

        // Map Description for each Parent Datasets

        this.objectType.parentDatasets.forEach(parentDatasetId => {

          this.allparentDatasetOptions.forEach(parentDataset => {
            if(parentDataset.moduleId === parentDatasetId) {
              this.selectedParentDatasetOptions.push({moduleId: parentDatasetId, description: parentDataset.moduleDescriptionRequestDTO.description})
            }
          })

        });
      }

    });
  }
}
