import { FieldlistContainer, ReferenceDataset, ReferenceDatasetResponse } from '@models/list-page/listpage';
import { CoreService } from '@services/core/core.service';
import { ListService } from '@services/list/list.service';
import { FormPropertyComponent } from '../form-property';
import { Router, ActivatedRoute } from '@angular/router';
import { AbstractControl, FormBuilder, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { RuleService } from '@services/rule/rule.service';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { Dataset } from '@models/schema/schema';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, takeUntil } from 'rxjs/operators';
import { MetadataModeleResponse } from '@models/schema/schemadetailstable';
import { Metadata } from '@modules/report/edit/container/metadatafield-control/metadatafield-control.component';
import { ObjectStatus } from '@modules/transaction/model/transaction';
import { DatasetResponse } from '@models/core/coreModel';

@Component({
  selector: 'pros-dataset-reference-field',
  templateUrl: './dataset-reference-field.component.html',
  styleUrls: ['./dataset-reference-field.component.scss']
})
export class DatasetReferenceFieldComponent extends FormPropertyComponent implements OnInit {
  private _fieldlistContainer: FieldlistContainer;

  get fieldlistContainer(): FieldlistContainer { return this._fieldlistContainer };

  set fieldlistContainer(newFieldListContainer: FieldlistContainer) {
    if(this._fieldlistContainer === newFieldListContainer) { return ;}
    this._fieldlistContainer = newFieldListContainer;
    this.onFieldlistContainerChange(this._fieldlistContainer);
  }


  editorConfig = {
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike', { list: 'ordered' }, { list: 'bullet' }, { color: [] }, { background: [] }], // toggle buttons
      ],
    },
    placeholder: 'information for field on mouse hover of input',
    theme: 'snow', // or 'bubble'
  };


  // dummy data
  systemTypeOptions = [
    { label: 'CODE', value: 'CODE' },
    { label: 'TEXT', value: 'TEXT' },
    { label: 'CODE AND TEXT', value: 'CODE AND TEXT' },
  ];

  datasetSearchSub: Subject<string> = new Subject();
  datasetListObs: Observable<Dataset[]> = of([]);
  selectedDataset: ReferenceDataset;

  fieldSearchSub: Subject<string> = new Subject();
  fieldsListObs: Observable<any> = of([]);

  refDatasetStatusOptions = Object.keys(ObjectStatus).map((s) => ObjectStatus[s]);
  refDatasetStatusOptionsObs: Observable<string[]> = of(this.refDatasetStatusOptions);

  refDataset;
  refDatasetField;
  refDatasetObj;
  isLoading;

  constructor(
    public fb: FormBuilder,
    public router: Router,
    public route: ActivatedRoute,
    public listService: ListService,
    public ruleService: RuleService,
    public coreService: CoreService,
    public sharedService: SharedServiceService,
    @Inject(LOCALE_ID) public locale: string
  ) {
    super(fb, route, router, listService, coreService, locale);
    this.patchCommonFields(this.fieldlistContainer && this.fieldlistContainer.fieldlist);
    this.createFormGroup(this.fieldlistContainer && this.fieldlistContainer.fieldlist);

    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
  }

  ngOnInit(): void {
    super.ngOnInit();

    if(!(this.fieldlistContainer && this.fieldlistContainer.isNew)) {
      this.isLoading = true;
      this.getReferenceField(this.locale, '');
    }
    else {
      this.fireValidationStatus();
    }

    this.sharedService.getAfterDataRefSave().pipe(takeUntil(this.unsubscribeAll$)).subscribe(resp => {
      if(resp) {
        const rules = this.sharedService.getDatasetRefArr(this.fieldId);
        this.formGroup.patchValue({refrules: rules || []});
        console.log('Reference rules on field property ', rules);
        this.sharedService.setDataRefDetails(null);
        this.fireValidationStatus();
      }
    });

    this.sharedService.getAfterBrSave().subscribe(resp => {
      if(resp && resp.brId) {
        this.formGroup.patchValue({lookupRuleId: resp.brId});
        this.fireValidationStatus();
      }
    })

    this.datasetSearchSub.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(s => {
      this.getAllObjectType(s);
    });

    this.fieldSearchSub.pipe(
      debounceTime(300)
    ).subscribe(searchTerm => {
      const datasetId = this.formGroup?.value?.refDataset?.datasetId;
      if(datasetId) {
        this.getFieldsByModuleId(datasetId, searchTerm || '');
      } else {
        this.fieldsListObs = of([]);
      }
    });

    this.sharedService.getAfterBrSave().subscribe((res) => {
      this.sharedService.setDataRefDetails(res);
    });
  }

  onFieldlistContainerChange(changes) {
    this.patchCommonFields(changes.fieldlist);
    this.patchValue(changes.fieldlist);
  }


  /**
   * add control according to control type
   */
   createFormGroup(data?: any) {
    this.formGroup.addControl(
      'dataType',
      new FormControl(data && data.dataType ? data.dataType : dropdownFieldDataTypes.CHAR, [Validators.required])
    );
    this.formGroup.addControl('isSearchEngine', new FormControl(data && data.isSearchEngine ? data.isSearchEngine : false, []));
    this.formGroup.addControl('isTransient', new FormControl(data && data.isTransient ? data.isTransient : false, []));
    this.formGroup.addControl('isReference', new FormControl(true, []));
    this.formGroup.addControl('isCheckList', new FormControl(data && data.isCheckList ? data.isCheckList : false, []));
    this.formGroup.addControl('pickList', new FormControl('30', [Validators.required]));
    this.formGroup.addControl('displayCriteria', new FormControl(data && data.displayCriteria ? data.displayCriteria : null, []));
    this.formGroup.addControl('refrules', new FormControl(data && data.refrules ? data.refrules : null, []));
    this.formGroup.addControl('lookupRuleId', new FormControl(data && data.lookupRuleId ? data.lookupRuleId : null));
    /* this.formGroup.addControl('refDataset', new FormControl(data && data.refDataset ? data.refDataset : null, [Validators.required, this.refDatasetValidator()])); */
    this.selectedDataset = data && data.refDataset ? data.refDataset : null;
    /* this.formGroup.addControl('refDatasetField', new FormControl(data && data.refDatasetField ? data.refDatasetField : null, [Validators.required, this.datasetFieldValidator()])); */
    this.formGroup.addControl('refDatasetStatus', new FormControl(data && data.refDatasetStatus ? data.refDatasetStatus : null, []));

    this.refDataset = new FormControl(null, [Validators.required, this.refDatasetValidator()]);
    this.formGroup.addControl('refDataset', this.refDataset);

    this.refDatasetField = new FormControl(null, [Validators.required, this.datasetFieldValidator()]);
    this.formGroup.addControl('refDatasetField', this.refDatasetField);

  }

  fireValidationStatus(event?: any) {
    super.fireValidationStatus(this.fieldlistContainer);
  }

  /**
   * patch form with new fieldList data. after ngonchange call this method to update with data.
   */
  patchValue(data?: any) {
    console.log(data);
    this.formGroup.patchValue({
      dataType: data && data.dataType ? data.dataType : dropdownFieldDataTypes.CHAR,
      isSearchEngine: data && data.isSearchEngine ? data.isSearchEngine : false,
      isReference: true,
      isTransient: data && data.isTransient ? data.isTransient : false,
      isCheckList: false,
      pickList: '30',
      displayCriteria: data && data.displayCriteria ? data.displayCriteria : null,
      refrules: data && data.refrules ? data.refrules : null,
      refDataset: this.refDataset.value ? this.refDataset.value : null,
      refDatasetField: this.refDatasetField.value ? this.refDatasetField.value : null,
      refDatasetStatus: data && data.refDatasetStatus ? data.refDatasetStatus : null
    });
    this.selectedDataset = data && data.refDataset ? data.refDataset : null;
  }

  /**
   * open side sheet for the data referencing.
   */
  openDataReferencing() {
    this.sharedService.setDataRefDetails(this.formGroup.value?.refrules || []);
    this.router.navigate([{ outlets: { sb: `sb/list/data-referencing/${this.moduleId}/${this.fieldlistContainer.fieldId.replace('new', '')}` } }], {
      queryParamsHandling: 'preserve',
      preserveFragment: true,
    });
  }

  openDataFiltering() {
    this.sharedService.setDataRefDetails(this.formGroup.value);
    this.router.navigate([{ outlets: { sb: `sb/list/data-filtering/${this.moduleId}/${this.fieldlistContainer.fieldId.replace('new', '')}` } }], {
      queryParamsHandling: 'preserve',
      preserveFragment: true,
    });
  }

  /**
   * close the side sheet
   */
  close() {
    this.coreService.nextUpdateFieldPropertySubject({fieldId: this.fieldlistContainer.fieldId, isNew: this.fieldlistContainer.isNew, fieldlist: this.formGroup.value});
    this.coreService.closeEditDatasetFormDrawe(true);
    this.router.navigate(['.'], { relativeTo: this.route, fragment: null, queryParamsHandling: 'preserve' });
  }

  getQuillEditorId(): string {
    if (!this.fieldlistContainer) return '';
    else if (this.fieldlistContainer.childrenId) return this.fieldlistContainer.childrenId;
    else if (this.fieldlistContainer.parentSubGridId) return this.fieldlistContainer.parentSubGridId;
    else return this.fieldlistContainer.fieldId;
  }

  getAllObjectType(searchTerm='') {
    this.coreService.getDataSets(searchTerm, 0, 20, this.locale)
      .subscribe(datasetList => {
        this.datasetListObs = of(datasetList);
      }, error => {
        console.error(`Error:: ${error.message}`);
    });
  }

  getReferenceField(lang: string, searchQuery: string) {
    this.coreService.getSearchedParentModules(lang, searchQuery).subscribe((resp: DatasetResponse[]) => {
       if(resp.length) {
        this.patchReferenceField(resp);
      }
    }, error => {
      console.error(`Error:: ${error.message}`);
      this.isLoading = false;
    });
  }

  patchReferenceField(datasetList: DatasetResponse[]) {
    this.coreService.getReferenceField(this.moduleId, this.fieldId).subscribe((response: ReferenceDatasetResponse) => {
      console.log(response);
      this.refDatasetObj = response;
      const field = datasetList.find((dataset) => dataset.moduleId === response.referencedModuleId);
      if(field) {
        this.formGroup.controls.refDataset.setValue({datasetId: field.moduleId, datasetDesc: field.moduleDescriptionRequestDTO.description});
        this.getFieldsByModuleId(field.moduleId, '', true);
      }
      else {
        this.formGroup.controls.refDataset.setValue(null);
        this.formGroup.controls.refDatasetField.setValue(null);
        this.fireValidationStatus();
      }
    }, error => {
      console.error(`Error:: ${error.message}`);
      this.isLoading = false;
    })
  }

  displayDatasetFn(dataset): string {
    if (dataset) {
      return dataset.datasetDesc ? dataset.datasetDesc : '';
    }
    return '';
  }

  displayFieldFn(obj): string {
    if (obj) {
      return obj.fieldDescri ? obj.fieldDescri : (obj.fieldDesc ? obj.fieldDesc : obj.fieldId);
    }
    return '';
  }

  onSelectRefDataset(refDataset: ReferenceDataset) {
    const prevDatasetId = this.selectedDataset?.datasetId;
    if(refDataset?.datasetId && (refDataset?.datasetId !== prevDatasetId)) {
      this.fieldsListObs = of([]);
      this.getFieldsByModuleId(refDataset.datasetId, '');
      this.formGroup.patchValue({refDatasetField: null});
      this.selectedDataset = refDataset;
      this.fireValidationStatus();
    }
  }

  updateDsRecStatus(status) {
    const selectedStatus = this.formGroup.value?.refDatasetStatus || [];
    const index = selectedStatus.findIndex(s => s === status);
    if(index !== -1) {
      selectedStatus.splice(index, 1)
    } else {
      selectedStatus.push(status);
    }
    this.formGroup.patchValue({refDatasetStatus: selectedStatus});
    this.fireValidationStatus();
  }

  filterDsRecStatusOptions(searchTerm) {
    const filteredOptions = this.refDatasetStatusOptions.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    this.refDatasetStatusOptionsObs = of(filteredOptions);
  }

  getFieldsByModuleId(moduleId, searchString, onLoad = false) {
    if (!this.moduleId) { return };

    this.coreService.getMetadataFieldsByModuleId([moduleId], searchString).subscribe((metadataModeleResponse: MetadataModeleResponse) => {
      this.parseMetadataModelResponse(metadataModeleResponse, onLoad);
    }, (err) => {
      console.error(`Error:: ${err.message}`);
      this.isLoading = false;
    });
  }

  parseMetadataModelResponse(response: MetadataModeleResponse, onLoad: boolean) {
    const fldGroups = [];
    // for header
    const headerChilds: Metadata[] = [];
    if(response.headers) {
      Object.keys(response.headers).forEach(header=>{
        const res = response.headers[header];
        headerChilds.push({
          fieldId: res.fieldId,
          fieldDescri: res.fieldDescri,
          isGroup: false,
          childs: [],
          moduleId: this.moduleId
        });
      });
    }
    fldGroups.push({
      fieldId: 'header_fields',
      fieldDescri: 'Header fields',
      isGroup: true,
      childs: headerChilds,
      moduleId: this.moduleId
    });

    // for grid response transformations
    if(response && response.grids) {
      Object.keys(response.grids).forEach(grid=>{
        const childs : Metadata[] = [];
        if(response.gridFields && response.gridFields.hasOwnProperty(grid)) {
          Object.keys(response.gridFields[grid]).forEach(fld=>{
            const fldCtrl = response.gridFields[grid][fld];
              childs.push({
                fieldId: fldCtrl.fieldId,
                fieldDescri: fldCtrl.fieldDescri,
                isGroup: false,
                childs:[],
                moduleId: this.moduleId
              });
          });
        }
        fldGroups.push({
          fieldId: grid,
          fieldDescri: response.grids[grid].fieldDescri,
          isGroup: true,
          childs,
          moduleId: this.moduleId
        });
      })
    }

    // for hierarchy response transformations
    if(response && response.hierarchyFields) {
      Object.keys(response.hierarchyFields).forEach(hkey => {
        const childs: Metadata[] = [];
        Object.keys(response.hierarchyFields[hkey]).forEach(fld=>{
          const fldCtrl = response.hierarchyFields[hkey][fld];
          childs.push({
            fieldId: fldCtrl.fieldId,
            fieldDescri: fldCtrl.fieldDescri,
            isGroup: false,
            childs:[],
            moduleId: this.moduleId
          });
        });
        fldGroups.push({
          fieldId: `Hierarchy_${hkey}`,
          fieldDescri: `Hierarchy ${hkey}`,
          isGroup: true,
          childs,
          moduleId: this.moduleId
        });
      });
    }
    this.fieldsListObs = of(fldGroups);

    if(onLoad) {
      fldGroups.forEach(group => {
        const childField = group.childs.find(child => child.fieldId === this.refDatasetObj.searchFields);
        if(childField) {
          this.formGroup.controls.refDatasetField.setValue(childField);
        }
      });

      this.isLoading = false;
      this.fireValidationStatus();
    }
  }

  refDatasetValidator = (): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
      if(control.value) {
        if(!(control.value?.datasetId)) {
          return {refDatasetError: true};
        } else {
          return null;
        }
      } else {
        return null;
      }
    };
  }

  datasetFieldValidator = (): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
      if(control.value) {
        if(!(control.value?.fieldId)) {
          return {datasetFieldError: true};
        } else {
          return null;
        }
      } else {
        return null;
      }
    };
  }
}

export enum dropdownFieldDataTypes {
  CHAR = 'CHAR',
  REQ = 'REQ',
  STATUS = 'STATUS',
  CLASS = 'CLASS',
}
