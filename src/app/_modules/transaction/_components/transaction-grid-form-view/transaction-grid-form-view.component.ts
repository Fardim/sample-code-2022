import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RuleTransformationReq } from '@models/transformation';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { ActiveForm, FieldCtrl, MSGFN, Process } from '@modules/transaction/model/transaction';
import { DataControlService } from '@modules/transaction/_service/data-control.service';
import { dataControlServiceFactory, transactionServiceFactory } from '@modules/transaction/_service/service-instance-sharing.service';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import { TransformationService } from '@services/transformation/transformation.service';
import * as moment from 'moment';
@Component({
  selector: 'pros-transaction-grid-form-view',
  templateUrl: './transaction-grid-form-view.component.html',
  styleUrls: ['./transaction-grid-form-view.component.scss'],
  providers: [
    {provide: TransactionService, useFactory: transactionServiceFactory},
    {provide: DataControlService, useFactory: dataControlServiceFactory}
  ]
})
export class TransactionGridFormViewComponent implements OnInit {

  moduleId: string;
  masterRecord: any = {};
  childMetadata = [];
  gridId: string;
  rowIndex = -1;
  rowdata: any = {};
  gridRowForm = new FormGroup({});
  showErrorBanner = false;
  bannerErrorMsg = 'Fix the errors before saving';
  isSubGrid = false;
  parentRowId: string;
  process = Process.create;
  activeForm: ActiveForm;

  constructor(
    private sharedService: SharedServiceService,
    private router: Router,
    private coreCrudService:TransactionService,
    private transformationService: TransformationService,
    private dataControlService: DataControlService
    ) { }

  ngOnInit(): void {

    this.activeForm = this.dataControlService.activeForm$.getValue();

    this.dataControlService.activeForm$.subscribe((resp: ActiveForm) => {
      this.activeForm = resp;
    })

    this.sharedService.getGridFormViewDetails().subscribe(resp => {
      const activeForm = this.dataControlService.activeForm$.getValue();
      if(resp) {
        this.moduleId = resp.moduleId;
        this.childMetadata = resp?.childMetadata || [];
        this.gridId = resp.gridId;
        this.rowIndex = resp.rowIndex;
        this.masterRecord = this.coreCrudService.getMasterData(activeForm.isPrimary, this.moduleId);
        this.isSubGrid = resp.isSubGrid;
        this.parentRowId = resp.parentRowId;
        this.process = resp.process;
        this.createFormControl();
        this.buildRowData();
      }
      //For giving default value to sequence field
      if(resp?.permissions?.sequenceInterval && resp?.permissions?.sequenceStart){
        const value = ((Number(resp.rowIndex)+1) *  Number(resp?.permissions?.sequenceInterval)) + Number(resp?.permissions?.sequenceStart)
        const sequenceFieldControlId = resp?.permissions?.sequenceField?.fieldId;
        this.gridRowForm.get(sequenceFieldControlId).setValue(value);
      }
    });
  }

  createFormControl() {
    this.childMetadata.forEach((item: any) => {
      const newControl = new FormControl('');
      newControl.setValidators([...this.getValidators(item)]);
      if(item.isRuleReadOnly) {
        newControl.disable();
      }
      this.gridRowForm.addControl(item.fieldId, newControl);
    });
  }

  getValidators(fieldDetails: any) {
    const validators = [];
    if(fieldDetails.isMandatory || fieldDetails.isRuleMandatory) {
      validators.push(Validators.required);
    }
    if(fieldDetails.maxChar) {
      validators.push(Validators.maxLength(fieldDetails.maxChar));
    }
    return validators;
  }

  buildRowData() {
    if(this.rowIndex !== undefined && this.rowIndex !== -1) {
      if(this.masterRecord && this.masterRecord.mdoRecordES.gvs) {
        this.rowdata = this.masterRecord.mdoRecordES.gvs[this.gridId]?.rows[this.rowIndex] ;
        this.getFieldValue();
      }
    } else {
      this.createNewRow();
    }
  }


  createNewRow() {
    const newRowData = this.coreCrudService?.createNewRow(this.isSubGrid, this.parentRowId, this.childMetadata);
    this.childMetadata = [...newRowData.childMetadata];
    const gridInfo = this.masterRecord?.mdoRecordES?.gvs[this?.gridId];
    if (gridInfo?.def) {
      Object.keys(gridInfo.def).forEach(key => {
        const fieldData = newRowData.row[key];
        fieldData && gridInfo.def[key].vc?.forEach(o => {
          if (o.c) {
            fieldData.vc[0]['c'] = o.c;
          }
        });
      })
    }
    this.rowdata = { ...newRowData.row };
    if (gridInfo?.def) {
      this.getFieldValue();
    }
  }

  getFieldValue() {
    if(this.rowdata) {
      for(const control of Object.keys(this.gridRowForm.controls)) {
        let value;
        const fieldType = this.getFieldType(this.getFieldDetailsById(control)?.pickList);
        if(fieldType === 'DROPDOWN') {
          value = [];
          this.rowdata[control]?.vc?.forEach(o => {
            if(o.c) {
              value.push({code: o.c, text: o.t});
            }
          });
        } else if(fieldType === 'ATTACHMENT') {
          value = this.rowdata[control]?.vc || [];
        } else {
          value = this.rowdata[control]?.vc[0]?.c || '';
        }
        this.gridRowForm.patchValue({
          [control]: value,
        })
      }
    }
  }

  setFieldValue(fieldId, value, fieldType) {
    let formValue = [{c: value, t: null}];
    switch(fieldType) {
      case 'DATEPICKER':
        formValue[0].c = moment(value).utc().valueOf();
        break;
      case 'RADIO':
      case 'DROPDOWN':
        formValue = [];
        value.forEach(o => {
          formValue.push({c: o.code, t: o.text});
        });
        break;
      case 'ATTACHMENT':
        formValue = value;
        break;
      case 'HTML-EDITOR':
        formValue[0].c = value.newValue;
        break;
    }
    if(this.rowdata) {
      let fieldData = this.rowdata[fieldId];
      if(this.process === Process.change || this.process === Process.approve) {
        fieldData.oc = fieldData?.vc?.some(option => option.c !== null) ? fieldData.vc : [{c: '', t: null}];
      }

      if(!fieldData)  fieldData = {};
      fieldData.vc = formValue;
    }
    this.runTransformationRule(fieldId);
  }

  runTransformationRule(fieldId: string) {
    const fieldCtrl = this.getFieldDetailsById(fieldId);
    const ruleIds = fieldCtrl?.ruleIds;
    this.masterRecord = this.coreCrudService.getMasterData(this.activeForm.isPrimary, this.moduleId);
    const reqPayload = JSON.parse(JSON.stringify(this.masterRecord)) || {};
    if (!reqPayload?.mdoRecordES) reqPayload.mdoRecordES = {gvs: {}};
    if(!reqPayload?.mdoRecordES?.gvs) reqPayload.mdoRecordES.gvs = {};
    reqPayload.mdoRecordES.gvs[this.gridId] = {
      rows: [this.rowdata],
    };

    if(ruleIds?.length && this.masterRecord.mdoRecordES) {
      const payload: RuleTransformationReq = {
        brIds: ruleIds,
        doc: reqPayload.mdoRecordES
      }
      this.transformationService.validate(payload).subscribe((resp: any) => {
        console.log('transaformation rule payload: ', resp);
        if(resp && resp.gvs && resp.gvs[this.gridId]) {
          const updatedFields = resp.gvs[this.gridId].rows;
          updatedFields.forEach((fId: string) => {
            this.rowdata[fId] = updatedFields[fId];
          });
        }
      });
    }
  }

  save() {
    if(this.isFormValid()) {
      this.masterRecord = this.coreCrudService.getMasterData(this.activeForm.isPrimary, this.moduleId);
      if (!this.masterRecord?.mdoRecordES?.gvs) {
        this.masterRecord = {
          mdoRecordES: {
            gvs: {}
          }
        }
      }
      if(!this.masterRecord?.mdoRecordES?.gvs[this.gridId]) {
        this.masterRecord.mdoRecordES.gvs[this.gridId] = {
          rows: [],
        };
      }
      if(this.rowIndex !== undefined && this.rowIndex !== -1) {
        if(this.masterRecord && this.masterRecord.mdoRecordES.gvs) {
          if(!this.rowdata?.MSGFN || this.rowdata?.MSGFN?.vc?.c !== MSGFN.create) {
            this.rowdata.MSGFN = {
              bc: null,
              fid: 'MSGFN',
              ls: null,
              oc: null,
              vc: [{
                c: MSGFN.change,
                t: ''
              }]
            }
          }
          this.masterRecord.mdoRecordES.gvs[this.gridId].rows[this.rowIndex] = this.rowdata ;
        }
      } else {
        this.masterRecord.mdoRecordES.gvs[this.gridId].rows.splice(0, 0, this.rowdata);
      }
      const outerOutlet = (this.router as any).currentUrlTree.root.children.outer ? [...(this.router as any).currentUrlTree.root.children.outer.segments.map(m => m.path)] : [];
      if (outerOutlet.length > 0 && outerOutlet.includes('applicable-sidesheet')) {
        this.coreCrudService.setMasterData(this.activeForm.isPrimary, this.moduleId, this.masterRecord, false, 0);
      }
      this.sharedService.setAfterGridFormRowSave(this.gridId);
      this.close();
    }else {
      this.showErrorBanner = true;
    }
  }

  isFormValid(): boolean {
    return this.gridRowForm.valid;
  }

  /**
   * Checks the field type
   */
  getFieldType(pickList: string) {
    switch(pickList) {
      case '1':
      case '37':
        return 'DROPDOWN';
      case '38':
        return 'ATTACHMENT';
      case '15':
        return 'GRID';
      case '4':
        return 'RADIO';
      case '2':
        return 'CHECKBOX';
      case '55':
        return 'URL';
      case '54':
        return 'TIMEPICKER';
      case '52':
        return 'DATEPICKER';
      case '22':
        return 'TEXTAREA';
      case '36':
        return 'TOGGLE';
      case '30':
        return 'DATA-REF';
      case '31':
        return 'HTML-EDITOR'
      default :
        return 'TEXT'
    }
  }

  getFieldDetailsById(fieldId) {
    return this.childMetadata.find(f => f.fieldId === fieldId);
  }

  /**
   * close the side sheet
   */
   close() {
    this.router.navigate([{ outlets: { sb3: null } }], { preserveFragment: true, queryParamsHandling: 'preserve' });

    // this.router.navigate([{ outlets: { ...this.getOutlets() } }], { preserveFragment: true, queryParamsHandling: 'preserve' });
  }

  getOutlets() {
    const outlets: any = {};
    const outerOutlet = (this.router as any).currentUrlTree.root.children.outer ? [...(this.router as any).currentUrlTree.root.children.outer.segments.map(m=> m.path)] : [];
    if (outerOutlet.length > 0 && outerOutlet.includes('applicable-sidesheet')) {
      outlets.sb3 = null;
    } else {
      outlets.outer = null;
    }
    return outlets;
  }

  updateFormControlValue(fieldCtrl: FieldCtrl, control:FormControl) {
    let value = control.value;
    if (fieldCtrl?.dataType === 'CHAR' && ['22', '0'].includes(fieldCtrl.pickList)) {
      value = value ?? '';
      if (fieldCtrl.textCase === 'UPPER') {
        value = `${value}`.toUpperCase();
      } else if (fieldCtrl.textCase === 'LOWER') {
        value = `${value}`.toLowerCase();
      } else if (fieldCtrl.textCase === 'CAMEL') {
        value = `${value}`[0].toLowerCase() + `${value}`.slice(1);
      }
    }
    control.setValue(value);
  }

}
