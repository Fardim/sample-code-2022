import { Injectable } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { Utilities } from '@models/schema/utilities';
import { BehaviorSubject, Subject } from 'rxjs';
import { ActiveForm, DataReferenceTabDetails } from '../model/transaction';
import { TransactionService } from './transaction.service';

export interface RecordConfig {
  dataControl: FormGroup;
  moduleId: string;
  isNewRecord?: boolean;
  navigateTo?: boolean;
  recordNumber?: string;
  description?: string;
}

@Injectable()
export class DataControlService {

  activeForm$ = new  BehaviorSubject<ActiveForm | null>(null);

  newChildRecordAdded: Subject<string> = new Subject<string>();

  constructor(
    private utilityService: Utilities
  ) { }

  // dataControl: {
  //     "primary": {
  //       "moduleId": {
  //         // masterRecord
  //       }
  //     },
  //     "relatedDataset": {
  //       "moduledId1": {
  //         "objnr1": {
  //           // masterRecord
  //         },
  //         "objnr2": {
  //           // masterRecord
  //         },
  //         "objnr3": {
  //           //masterRecord
  //         }
  //       },
  //       "moduleId2": {
  //         "objnr1": {
  //           // masterRecord
  //         },
  //         "objnr2": {
  //           // masterRecord
  //         }
  //       }
  //     }
  // }

  getActiveForm(dataControl: FormGroup, activeForm: ActiveForm) {
    if(activeForm.isPrimary) {
      return ((dataControl.controls.primary as FormGroup).controls[activeForm.moduleId] as FormGroup).controls.formData;
    }else {
      const relatedDatasetModuleFormGroup = ((dataControl.controls.relatedDatasets as FormGroup).controls[activeForm.moduleId] as FormGroup);
      if(!activeForm.objnr) {
        const currentRecords = Object.keys(relatedDatasetModuleFormGroup.controls);
        if(currentRecords.length === 0) {
          const objnr = this.utilityService.getRandomString(12);
          relatedDatasetModuleFormGroup.addControl(objnr, new FormGroup({}));
          return relatedDatasetModuleFormGroup.contains[objnr];
        }else {
          return relatedDatasetModuleFormGroup.controls[currentRecords[0]];
        }
      }
      return ((dataControl.controls.relatedDatasets as FormGroup).controls[activeForm.moduleId] as FormGroup).controls[activeForm.objnr];
    }
  }

  getAllRecordsOfRelatedDataset(dataControl: FormGroup, activeForm: ActiveForm) {
    if(activeForm.isPrimary) {
      return (dataControl.controls.primary as FormGroup).controls[activeForm.moduleId];
    }else {
      return ((dataControl.controls.relatedDatasets as FormGroup).controls[activeForm.moduleId] as FormGroup).controls;
    }
  }

  getAllReferenceRecords(dataControl: FormGroup, activeForm: ActiveForm) {
    if(activeForm.referenceRecordDetails) {
      const parentFormDetails: ActiveForm = {moduleId: activeForm.referenceRecordDetails.parentModuleId, isPrimary: activeForm.referenceRecordDetails.isParentModulePrimary, objnr: activeForm.referenceRecordDetails.parentRecordNumber};
      const parentForm: FormGroup = this.getActiveForm(dataControl, parentFormDetails);
      return ((((parentForm.controls['dataRef'] as FormGroup)))
      .controls[activeForm.referenceRecordDetails.fieldId] as FormGroup).controls;
    }
  }

  getControByFieldName(dataControl: FormGroup, activeForm: ActiveForm, controlName: string){
    const tabArray = this.getActiveForm(dataControl, activeForm);
    let reqControl = null;
    if(tabArray.controls) {
      Object.keys(tabArray.controls as any).some((index: any) => {
        let found = false;
        Object.keys(tabArray.controls[index].controls).some((control: string) => {
          if(control === controlName) {
            reqControl = tabArray.controls[index].controls[control];
            found = true;
            return true;
          }
        });
        if(found) {
          return true;
        }
      });
    }
    return reqControl;
  }

  addNewRecord(recordConfig: RecordConfig) {
    const { dataControl, moduleId, isNewRecord, navigateTo, recordNumber, description} = recordConfig;
    const relatedDatasetModuleFormGroup = ((dataControl.controls.relatedDatasets as FormGroup).controls[moduleId] as FormGroup);
    if(!relatedDatasetModuleFormGroup) {
      return;
    };
    const objnr = recordNumber ? recordNumber : this.getTempnumber(description);
    relatedDatasetModuleFormGroup.addControl(objnr, new FormGroup({}));
    if(navigateTo)
      this.activeForm$.next({isPrimary: false, moduleId, objnr, isNew: isNewRecord});
    if(isNewRecord)
      this.newChildRecordAdded.next(moduleId);
  }

  getRecordForRelatedModuledId(dataControl: FormGroup, activeForm: ActiveForm): FormArray | null {
    const records = this.getAllRecordsOfRelatedDataset(dataControl, activeForm);
    if(!records[activeForm.objnr]) return null;
    return records[activeForm.objnr];
  }

  getFirsrtRecordForRelatedModuledId(dataControl: FormGroup, activeForm: ActiveForm): FormArray | null {
    const records = this.getAllRecordsOfRelatedDataset(dataControl, activeForm);
    const objrList = Object.keys(records || {});
    if(!objrList.length) return null;
    return records[objrList[0]];
  }

  getControlsWithError(dataControl: FormGroup, primaryDatasetId) {
    const invalidFieldIds = {};
    const primaryDataset =  (((dataControl.controls.primary as FormGroup).controls[primaryDatasetId] as FormGroup).controls.formData as FormGroup).controls;
    Object.keys(primaryDataset).forEach((item: any) => {
      Object.keys((primaryDataset[item] as FormGroup).controls).forEach((fieldId: any) => {
        if((primaryDataset[item] as FormGroup).controls[fieldId].invalid) {
          if(!invalidFieldIds[primaryDatasetId]) invalidFieldIds[primaryDatasetId] = [];
          invalidFieldIds[primaryDatasetId].push(fieldId);
        }
      })
    });
    const relatedDataset = (dataControl.controls.relatedDatasets as FormGroup).controls;
    Object.keys(relatedDataset).forEach((item) => {
      const records = (relatedDataset[item] as FormGroup).controls;
      Object.keys(records).forEach((record) => {
        const fields = (records[record] as FormGroup).controls;
        Object.keys(fields).forEach((field) => {
          const fieldLists = (fields[field] as FormGroup).controls;
          Object.keys((fieldLists)).forEach(fid => {
            if(fieldLists[fid].invalid) {
              if(!invalidFieldIds[item]) invalidFieldIds[item] = [];
              invalidFieldIds[item].push(fid);
            }
          })
        })
      })
    });
    return invalidFieldIds;
  }

  addRealtedDatasetTab(dataControl: FormGroup, relatedDatasetDetails: DataReferenceTabDetails) {
    const activeFormDetails = this.activeForm$.getValue();
    const parentForm: FormGroup = this.getActiveForm(dataControl, activeFormDetails);
    const controlArray = Object.keys(parentForm.controls);
    if(!controlArray.includes('dataRef')){
      parentForm.addControl('dataRef', new FormGroup({
        [relatedDatasetDetails.fieldId]: new FormGroup({
          [relatedDatasetDetails.relatedDatasetObjnr]: new FormGroup({})
        })
      }));
      return;
    }
    if(!(parentForm.controls.dataRef as FormGroup).controls[relatedDatasetDetails.fieldId]) {
      (parentForm.controls.dataRef as FormGroup).addControl(relatedDatasetDetails.fieldId, new FormGroup({
        [relatedDatasetDetails.relatedDatasetObjnr]: new FormGroup({}),
      }));
      return;
    }
    ((parentForm.controls.dataRef as FormGroup).controls[relatedDatasetDetails.fieldId] as FormGroup)
    .addControl(relatedDatasetDetails.relatedDatasetObjnr, new FormGroup({}));
  }

  getReferenceRecordForm(dataControl: FormGroup, referenceRecordDetails: any){
    const parentFormDetails: ActiveForm = {moduleId: referenceRecordDetails.parentModuleId, isPrimary: referenceRecordDetails.isParentModulePrimary, objnr: referenceRecordDetails.parentRecordNumber};
    const parentForm: FormGroup = this.getActiveForm(dataControl, parentFormDetails);
    return ((((parentForm.controls['dataRef'] as FormGroup)))
    .controls[referenceRecordDetails.fieldId] as FormGroup)
    .controls[referenceRecordDetails.relatedDatasetObjnr];
  }

  getTempnumber(description : String){
    const lastindex = description.length;
    const tempNumber = description.charAt(0) + description.charAt(lastindex-1) + String(Math.floor(Math.random() * 10000));
    return tempNumber;
  }
}
