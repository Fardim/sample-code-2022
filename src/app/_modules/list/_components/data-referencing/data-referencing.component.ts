import { Component, Inject, LOCALE_ID, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dataset } from '@models/schema/schema';
import { MetadataModeleResponse } from '@models/schema/schemadetailstable';
import { Metadata } from '@modules/report/edit/container/metadatafield-control/metadatafield-control.component';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { CoreService } from '@services/core/core.service';
import { GlobaldialogService } from '@services/globaldialog.service';
import { TransientService } from 'mdo-ui-library';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'pros-data-referencing',
  templateUrl: './data-referencing.component.html',
  styleUrls: ['./data-referencing.component.scss']
})
export class DataReferencingComponent implements OnInit, OnDestroy {

  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();

  moduleId: string
  fieldId: string;
  datasetList: Dataset[] = [];
  initialDatasetList: Dataset[] = [];
  datasetListObs: Observable<Dataset[]> = of([]);

  fieldsList = [];
  fieldsListObs: Observable<any> = of([]);
  initialFieldsList = [];

  datasetSearchSub: Subject<string> = new Subject();
  fieldSearchSub: Subject<{s: string, rowIndex: number}> = new Subject();

  form: FormGroup = new FormGroup ({
    rules: new FormArray([])
  });

  submitted = false;
  isInitializing= false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private coreService: CoreService,
    public globalDialogService: GlobaldialogService,
    private transientService: TransientService,
    private sharedService: SharedServiceService,
    @Inject(LOCALE_ID) public locale: string
  ) {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.moduleId = params.moduleId;
      this.fieldId = params.fieldId;
      this.getAllObjectType('', true);
    });

    this.sharedService.getDataRefDetails().pipe(takeUntil(this.unsubscribeAll$)).subscribe(rules => {
      if(rules && rules.length) {
        rules.forEach(rule => this.addRule(rule));
      }
    });

    this.datasetSearchSub.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(s => {
      this.getAllObjectType(s);
    });

    this.fieldSearchSub.pipe(
      debounceTime(300)
    ).subscribe(data => {
      const rowIndex = data.rowIndex;
      if(rowIndex !== undefined) {
        const dataset = this.rules.at(rowIndex).get('dataset').value;
        if(dataset && dataset.datasetId) {
          this.getFieldsByModuleId(dataset.datasetId, data.s || '');
        } else {
          this.fieldsListObs = of([]);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
  }

  save() {
    this.submitted = true;
    if(!this.form.valid) {
      console.log(this.rules.value);
      this.transientService.open('Please fix below error(s).', null, { duration: 2000, verticalPosition: 'bottom'});
      return;
    }

    const rules = [];
    this.rules.value.forEach(v => {
      const rule = {
        datasetId: v.dataset.datasetId,
        datasetDesc: v.dataset.datasetDesc,
        fieldId: v.fldCtrl.fieldId,
        fldctrl: v.fldCtrl
      };
      rules.push(rule);
      return rules;
    })

    this.sharedService.setAfterDataRefSave(rules, this.fieldId);
    this.close();
  }

  addRule(rule?) {
    const dataset = rule?.datasetId && rule?.datasetDesc ? {
      datasetId: rule?.datasetId || '',
      datasetDesc: rule?.datasetDesc || ''
    } : null;

    const ctrl = rule?.fldctrl ? rule?.fldctrl : (rule?.fieldId ? { fieldId: rule?.fieldId} : null);

    const frmGrp = new FormGroup({
      dataset: new FormControl(dataset, [Validators.required, this.datasetValidator()]),
      prevDataset: new FormControl(dataset),
      fldCtrl: new FormControl(ctrl, [Validators.required, this.fieldValidator()])
    });
    this.rules.push(frmGrp);
  }

  removeRule(index) {
    this.globalDialogService.confirm({ label: 'Are you sure you want to delete this ?' }, (resp) => {
      if (resp && resp === 'yes') {
        this.rules.removeAt(index);
      }
    })
  }

  initDatasetList() {
    this.datasetListObs = of(this.initialDatasetList);
    this.isInitializing = false;
  }

  initFieldsList(rowIndex: number) {
    this.fieldsListObs = of([]);
    this.fieldSearchSub.next({s: '', rowIndex});
    this.isInitializing = false;
  }

  canSelectField(rowIndex, fieldId) {
    const datasetId = this.rules.at(rowIndex).value?.dataset?.datasetId;
    return !this.rules.value.some(rule => rule.dataset?.datasetId === datasetId && rule.fldCtrl?.fieldId === fieldId);
  }

  selectRefDataset(index) {
    const dataset = this.rules.at(index).get('dataset').value;
    const prevDataset = this.rules.at(index).get('prevDataset').value;
    if(dataset?.datasetId && (dataset?.datasetId !== prevDataset?.datasetId)) {
      this.rules.at(index).patchValue({prevDataset: dataset, fldCtrl: null});
    }
  }

  get rules() {
    return this.form.get('rules') as FormArray;
  }

  getAllObjectType(searchTerm='', initialLoad= false) {
    this.coreService.getDataSets(searchTerm, 0, 20, this.locale)
      .subscribe(resp => {
        this.datasetList = resp;
        this.datasetListObs = of(this.datasetList);
        if(initialLoad) {
          this.initialDatasetList = resp;
        }
      }, error => {
        console.error(`Error:: ${error.message}`);
    });
  }

  getFieldsByModuleId(moduleId, searchString) {
    if (!this.moduleId) { return };

    this.coreService.getMetadataFieldsByModuleId([moduleId], searchString).subscribe((metadataModeleResponse: MetadataModeleResponse) => {
      this.parseMetadataModelResponse(metadataModeleResponse);
    }, (err) => {
      console.error(`Error:: ${err.message}`);
    });
  }

  parseMetadataModelResponse(response: MetadataModeleResponse) {
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

    this.fieldsList = fldGroups;
    this.fieldsListObs = of(this.fieldsList);
  }

  displayFieldFn(obj): string {
    if (obj) {
      return obj.fieldDescri ? obj.fieldDescri : (obj.fieldDesc ? obj.fieldDesc : obj.fieldId);
    }
    return '';
  }

  displayDatasetFn(dataset): string {
    if (dataset) {
      return dataset.datasetDesc ? dataset.datasetDesc : '';
    }
    return '';
  }

  dropRule(event) {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    const formArray = this.rules;
    const dir = event.currentIndex > event.previousIndex ? 1 : -1;
    const from = event.previousIndex;
    const to = event.currentIndex;
    const temp = formArray.at(from);
    for (let i = from; i * dir < to * dir; i = i + dir) {
      const current = formArray.at(i + dir);
      formArray.setControl(i, current);
    }

    formArray.setControl(to, temp);
  }

  datasetValidator = (): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
      if(control.value) {
        if(!(control.value?.datasetId)) {
          return {datasetError: true};
        } else {
          return null;
        }
      } else {
        return null;
      }
    };
  }

  fieldValidator = (): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
      if(control.value) {
        if(!(control.value?.fieldId)) {
          return {fieldError: true};
        } else {
          return null;
        }
      } else {
        return null;
      }
    };
  }

  close() {
    this.router.navigate([{ outlets: { sb: null } }], { preserveFragment: true, queryParamsHandling: 'preserve' });
  }
}
