import { Component, Inject, LOCALE_ID, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AllDatasetDetailsResponse, ChildDatasetsWithCount } from '@models/core/coreModel';
import { Dataset } from '@models/schema/schema';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { CoreService } from '@services/core/core.service';
import { GlobaldialogService } from '@services/globaldialog.service';
import { TaskListService } from '@services/task-list.service';
import { TransientService } from 'mdo-ui-library';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'pros-step-form-update',
  templateUrl: './step-form-update.component.html',
  styleUrls: ['./step-form-update.component.scss']
})
export class StepFormUpdateComponent implements OnInit, OnDestroy {

  _locale: string;

  constructor(private activateRoute: ActivatedRoute,
    private router: Router,
    private coreService: CoreService,
    private fb: FormBuilder,
    private taskListService: TaskListService,
    private transientService: TransientService,
    private sharedServices: SharedServiceService,
    public globalDialogService: GlobaldialogService,
    @Inject(LOCALE_ID) public locale: string,
  ) {
    this._locale = this.locale?.split('-')?.[0] || 'en';
  }

  get childDataset() {
    return this.stepFormUpdateForm.controls.childDataset as FormArray;
  }

  get parentChildDataset() {
    return this.stepFormUpdateForm.controls.parentChildDataset as FormArray;
  }

  isDataInvalid = false;
  stepFormUpdateForm: FormGroup;
  stepId: any;
  flowId: any;
  dataModel = { rulesModel: [], formModel: [] };
  parentFormslist: any = [];
  outlet;
  filterableDatasetOb: Dataset[] = [];
  selectedParent: any = '';
  dataArray = [];
  parentNestedOptionList: AllDatasetDetailsResponse[] = [];
  childDatasetOptionList: ChildDatasetsWithCount[] = [];
  nestedChildDatasetMapping: {[layoutId: string]: AllDatasetDetailsResponse[]} = {};
  subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.datasets();
    const paramSub = this.activateRoute.params.subscribe((params) => {
      this.stepId = params.stepId;
      this.flowId = params.id;
      this.outlet = params.outlet;
    });
    this.subscriptions.push(paramSub);

    this.createStepFormUpdateFrm();
    const dataSub = this.sharedServices.getFlowStepData().subscribe((stepData: any) => {
      if (stepData) {
        this.dataModel.rulesModel = stepData.rules || [];
        this.dataModel.formModel = stepData.forms || [];
        if (this.dataModel.formModel.length > 0) {
          this.processPatchData();
        } else {
          this.datasets();
          // this.addChildDataset();
        }
      }
    });
    this.subscriptions.push(dataSub);
  }


  processPatchData() {
    const parentData = this.dataModel.formModel.find((x: any) => !!x.isPrimary);
    this.filterableDatasetOb.push({ moduleId: parentData.dataSetId, moduleDesc: parentData.datasetDesc, tenantId: '' });
    this.parentFormslist.push({ layoutId: parentData.formId, description: parentData.formDesc });
    this.stepFormUpdateForm.patchValue({
      parentDataset: { moduleId: parentData.dataSetId, moduleDesc: parentData.datasetDesc, tenantId: '' },
      parentForm: { layoutId: parentData.formId, description: parentData.formDesc }
    });
    this.getChildDatasets(parentData.dataSetId);
    if(parentData && parentData.refrenceDataSet && Array.isArray(parentData.refrenceDataSet)) {
      parentData.refrenceDataSet.forEach((item: any) => {
       const value = {
          dataSetId: item.referenceDatasetId,
          formId: item.formId,
          datasetDesc: item.dataSetDesc,
          formDesc: item.formDesc
        };
        this.addNewChild(value);
      });
    }
    if(parentData?.formId)
      this.getAllDatasetDetails(parentData.formId);
    this.selectedParent = { moduleId: parentData.dataSetId, moduleDesc: parentData.datasetDesc, tenantId: '' };
    const childData = this.dataModel.formModel.filter((x: any) => !x.isPrimary);// this.formModel
    childData.forEach((element: any) => {
      const valueObj: any = {
        dataSetId: element.dataSetId,
        formId: element.formId,
        formDesc: element.formDesc,
        datasetDesc: element.datasetDesc,
      };

      if(element && element.refrenceDataSet && Array.isArray(element.refrenceDataSet)) {
        const refDataset = [];
        element.refrenceDataSet.forEach((item: any) => {
          refDataset.push({
              dataSetId: item.referenceDatasetId,
              formId: item.formId,
              formDesc: item.dataSetDesc,
              datasetDesc: item.formDesc
           });
         });
         valueObj.refrenceDataSet = refDataset;
      }
      this.addChildDataset(valueObj);
    });
  }
  processSaveData() {
    const childData = this.stepFormUpdateForm.value.childDataset;
    const saveDataArr = [];
    if (this.stepFormUpdateForm.value.parentDataset?.moduleId?.length > 0 && this.stepFormUpdateForm.value.parentForm?.layoutId?.length > 0) {
      const nestedChilds = this.stepFormUpdateForm.value?.parentChildDataset;
      const data: any = { dataSetId: this.stepFormUpdateForm.value.parentDataset.moduleId, formId: this.stepFormUpdateForm.value.parentForm.layoutId, isPrimary: true };
      data.referenceDatset = [];
      nestedChilds.forEach((item) => {
        data.referenceDatset.push({
          dataSetDesc:item.datasetDesc,
          formDesc:item.formDesc,
          formId: item.formId,
          referenceDatasetId: item.dataSetId,
          refernceFrom: 'PARENT',
        });
      })
      saveDataArr.push(data);
    }

    childData.forEach(element => {
      if (element?.childDatasetObj.dataSetId && element.childDatasetObj.formId) {
        const nestedChilds = element.nestedDataSet;
        const data: any = { dataSetId: element.childDatasetObj.dataSetId, formId: element.childDatasetObj.formId, isPrimary: false };
        data.referenceDatset = [];
        nestedChilds.forEach((item) => {
          data.referenceDatset.push({
            formId: item.nestedChildDatasetObj.formId,
            referenceDatasetId: item.nestedChildDatasetObj.dataSetId,
            refernceFrom: 'CHILD'
          });
        })
        saveDataArr.push(data);;
      }
    });
    return saveDataArr;
  }
  saveFormData() {
    const formData = this.processSaveData();
    if (formData.length > 0 && formData.length === this.stepFormUpdateForm.value.childDataset.length + 1) {
      this.taskListService.saveUpdateRuleForm(this.flowId, this.stepId, formData, this.dataModel.rulesModel).subscribe(res => {
        this.transientService.open(res?.message, null, { duration: 2000, verticalPosition: 'bottom' });
        this.sharedServices.updateStepsData(true);
        this.close();
      }, error => {
        console.error(`Error:: ${error.message}`);
      });
    } else {
      this.isDataInvalid = true;
    }
  }

  newchildDataset(valueObj?) {
    return this.fb.group({
      childDatasetObj: this.fb.group({
        dataSetId: [valueObj?.dataSetId || '', Validators.required],
        formId: [valueObj?.formId || '', Validators.required],
        datasetDesc: [valueObj?.datasetDesc || ''],
        formDesc: [valueObj?.formDesc || '']
      }),
      nestedDataSet: this.getNestedArray(valueObj?.refrenceDataSet || [])
    });
  }

  getNestedArray(refrenceDataSet) {
    const fArray = this.fb.array([]);
    refrenceDataSet.forEach((item: any) => {
      fArray.push(this.fb.group({
        nestedChildDatasetObj: this.fb.group({
          dataSetId: [item?.dataSetId || '', Validators.required],
          formId: [item?.formId || '', Validators.required],
          datasetDesc: [item?.datasetDesc || ''],
          formDesc: [item?.formDesc || '']
      })}))
    });
    return fArray;
  }

  createStepFormUpdateFrm() {
    this.stepFormUpdateForm = this.fb.group({
      parentDataset: [''],
      parentForm: [''],
      childDataset: this.fb.array([]),
      parentChildDataset: this.fb.array([])
    });
    this.stepFormUpdateForm.controls.parentDataset.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe((obj: any) => {
      if (typeof (obj) === 'object') {
        this.datasets(obj.moduleDesc);
        this.getChildDatasets(obj.moduleId);
      } else {
        if (!obj) {
          this.parentFormslist = [];
          this.stepFormUpdateForm.patchValue({
            parentForm: ''
          });
          (this.stepFormUpdateForm.controls.childDataset as FormArray).clear();
        }
        this.datasets(obj);
      }
    });

    this.stepFormUpdateForm.controls.parentForm.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe((obj: any) => {
      if(obj.layoutId)
        this.getAllDatasetDetails(obj.layoutId);
      if (typeof (obj) === 'object') {
        this.setParentForm(this.stepFormUpdateForm.controls.parentDataset.value.moduleId, obj.description);
      } else {
        this.setParentForm(this.stepFormUpdateForm.controls.parentDataset.value.moduleId, obj);
      }
    });

  }

  getChildDatasets(parentDatasetId: string) {
    this.coreService.getRelatedDatasets(parentDatasetId, 0, 20, '', this.locale).subscribe(res => {
      if (res) {
        this.childDatasetOptionList = res;
      }
    });
  }

  close() {
    this.router.navigate([{ outlets: { [this.outlet]: null } }], { queryParamsHandling: 'preserve' });
  }

  removeDataset(i: any, type: string, parentIndex: number) {
    if (type === 'child') {
      this.dataArray = this.dataArray.filter(obj => {
        return obj.index !== i;
      });
      this.childDataset.removeAt(i);
    } else if (type === 'parent') {
      this.parentChildDataset.removeAt(i);
    } else if (type === 'nested_child') {
      this.getNestedDataset(parentIndex).removeAt(i);
    }
  }

  get isAllowAddNewChild(): boolean {
    const { value } = this.childDataset;

    return !(this.childDatasetOptionList.length === value.length);
  }

  addChildDataset(valueObj?) {
    // if (this.isAllowAddNewChild)
      this.childDataset.push(this.newchildDataset(valueObj));
  }
  /**
   * Get all datasets list ...
   */
  datasets(s?: string) {
    this.coreService.getDataSets(s).subscribe(res => {
      if (res) {
        this.filterableDatasetOb = res;
      }
    });
  }

  isDataExist(childDataset: FormArray) {
    return childDataset?.controls?.length > 0 && childDataset.controls.some((data: FormControl) => {
      return data.value.dataSetId !== '' && data.value.flowId !== '';
    });
  }

  changeParentDataset(moduleId: any) {
    this.stepFormUpdateForm.patchValue({
      parentForm: ''
    });
    (this.stepFormUpdateForm.controls.childDataset as FormArray).clear();
    this.addChildDataset();
    this.selectedParent = this.stepFormUpdateForm.controls.parentDataset.value;
    this.parentFormslist = [];
    this.setParentForm(moduleId, '');
  }
  resetParentDataset() {
    const index = this.filterableDatasetOb.findIndex(x => x.moduleId === this.selectedParent.moduleId);
    if (index < 0) {
      this.filterableDatasetOb.push(this.selectedParent);
    }
    this.stepFormUpdateForm.patchValue({
      parentDataset: this.selectedParent
    });
  }

  parentOptionSelected(moduleId: any, parent: any) {
    // if data in child dataset show confirmation
    if (moduleId === this.selectedParent.moduleId) return;
    const childDataset = this.stepFormUpdateForm.controls.childDataset as FormArray;
    const isExist = this.isDataExist(childDataset);
    if (isExist || this.stepFormUpdateForm.controls.parentForm?.value?.description?.length > 0) {
      this.transientService.confirm(
        {
          data: { dialogTitle: 'Confirmation', label: 'Selecting another parent dataset would reset all selections. Do you want to continue ?' },
          disableClose: true,
          autoFocus: false,
          panelClass: 'create-master-panel',
          width: '350px'
        },
        (response) => {
          if (response && response === 'yes') {
            this.changeParentDataset(moduleId);
          } else {
            this.resetParentDataset();
          }
        }
      );
    } else {
      this.selectedParent = parent;
      this.setParentForm(moduleId, '');
    }
  }

  setParentForm(moduleId: any, s?: string) {
    this.coreService.getLayoutList(Number(moduleId), 0, 20, '', '', {}, s, true).subscribe(res => {
      if (res) {
        this.parentFormslist = res;
      }
    });
  }

  getTitleParent(obj: any) {
    if (typeof (obj) !== 'object')
      return '';
    else
      return obj.moduleDesc;
  }


  getFormParent(obj: any) {
    if (typeof (obj) !== 'object')
      return '';
    else
      return obj.description;
  }

  get isAllowAddNewParentChild(): boolean {
    const { parentChildDataset, parentDataset, parentForm } = this.stepFormUpdateForm.value;

    return (!(this.parentNestedOptionList.length === parentChildDataset.length) && parentDataset && parentForm);
  }

  addNewChild(valueObj?) {
    // const selectedParenForm = this.stepFormUpdateForm?.value?.parentForm;
    // if(selectedParenForm && selectedParenForm.layoutId) {
    //   this.getAllDatasetDetails(selectedParenForm.layoutId);
    // }
    // if (this.isAllowAddNewParentChild)
      this.parentChildDataset.push(this.fb.group({
        dataSetId: [valueObj?.dataSetId || '', Validators.required],
        formId: [valueObj?.formId || '', Validators.required],
        datasetDesc: [valueObj?.datasetDesc || ''],
        formDesc: [valueObj?.formDesc || '']
      }));
  }

  getAllDatasetDetails(layoutId) {
    this.coreService.getAllDatasetDetails(layoutId, this._locale, 50, 0).subscribe((resp) => {
      if(resp && Array.isArray(resp)) {
        const mapResp = resp.map((i: any) => { return {...i, childDatasetId: i.moduleId, childDescription: i.moduleDesc}});
        this.parentNestedOptionList = mapResp;
        this.nestedChildDatasetMapping[layoutId] = mapResp;
      }
    });
  }

  loadNestedChildOptions(layout: string) {
    if(layout)
      this.getAllDatasetDetails(layout);
  }

  getNestedDataset(empIndex: number): FormArray {
    return this.childDataset.at(empIndex).get('nestedDataSet') as FormArray
  }

  addDataset(i: number, valueObj?) {
    // debugger;
    // if (this.isAllowAddNestedChild(i)) {
      const nestedCtrl = this.getNestedDataset(i);
      nestedCtrl.push(this.fb.group({
        nestedChildDatasetObj: this.fb.group({
          dataSetId: valueObj?.dataSetId || '',
          datasetDesc: valueObj?.datasetDesc || '',
          formId: valueObj?.formId || '',
          formDesc: valueObj?.formDesc || ''
        })
      }));
    // }
  }

  getNestedOptions(formId: number) {
    if(!this.nestedChildDatasetMapping[formId]) return [];
    return this.nestedChildDatasetMapping[formId];
  }

  getNestedChildCount(index: number): number {
    return this.getNestedDataset(index) && this.getNestedDataset(index).length;
  }

  isAllowAddNestedChild(i: number): boolean {
    return !(this.getNestedChildCount(i) === this.parentNestedOptionList.length);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

}
