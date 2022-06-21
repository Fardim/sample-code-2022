import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CoreService } from '@services/core/core.service';
import { finalize, map } from 'rxjs/operators';
import { sortBy } from 'lodash';
import { FormControl, FormGroup } from '@angular/forms';
import { FieldResponse, Process, TabResponse } from '@modules/transaction/model/transaction';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
@Component({
  selector: 'pros-tab-transaction',
  templateUrl: `./transaction-tab.component.html`,
  styleUrls: ['./transaction-tab.component.scss']
})
export class TransactionTabComponent implements OnInit, OnChanges {
  @Input() tabDetails: TabResponse;
  @Input() fGroup: FormGroup;
  inputFieldObj = {
    required: false,
    numberOnly: false,
    maxLength: 100,
    minLength: 0,
    charType: '', // 'lower','camel'
    decimalPos: 10
  }
  // tabFieldList$: Observable<Array<FieldResponse>> = of([]);
  tabFieldList: Array<FieldResponse> = [];

  /**
   * Dataset id
   */
  @Input()
  moduleId: string;

  @Input()
  layoutId: string;

  @Input()
  recordId: string;

  @Input()
  process: string;

  @Input()
  activeStructures;

  @Input()
  dataControl;

  @Input() flowId: string;
  @Input() stepId: string;

  /**
   * Loading state ....
   */
  loading = true;
  generateDescriptionValue: string;
  allFields;
  patchDataMap = {};

  constructor(
    private coreService: CoreService,
    private transactionService: TransactionService
  ) { }

  ngOnInit(): void {
    let patchData = this.transactionService.getRules('',true);
    patchData[this.moduleId]?.forEach((item)=>{
      item.forEach((data)=>{
        data.conditions.forEach((fields)=>{
          if(fields.sourceField && fields.sourceValue){
            this.patchDataMap[fields.sourceField] = fields.sourceValue;
          }
          if(fields.targetField && fields.targetValue){
            this.patchDataMap[fields.targetField] = fields.targetValue;
          }
        })
      })
    })
  }

  createFieldControls(fields: Array<FieldResponse>) {
    if(fields.length) {
      fields.forEach((items: FieldResponse) => {
        if(!this.fGroup.controls[items.fieldId]) {
          const control = new FormControl('');
          this.fGroup.addControl(items.fieldId, control);
        }
      })
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes && changes.tabDetails) {
      this.tabDetails = changes.tabDetails.currentValue;
      this.getTabFields(this.tabDetails.tabid);
    }
  }

  getTabFields(tabId: string) {
    if(tabId) {
      this.coreService.getTabFields(this.moduleId, tabId, 0, 0, this.activeStructures,'en', this.flowId, this.stepId).pipe(
        map(item => sortBy(item, 'order')),
        finalize(() => {
          this.transactionService.tabFieldsLoadedSuccess();
        })
      ).subscribe((resp: Array<FieldResponse>) => {
        const fields = resp.filter((item: FieldResponse) => {
          return item.fieldType === 'FIELD';
        });
        this.createFieldControls(fields);
        this.allFields = fields;
        this.tabFieldList = resp;
        this.transactionService.addFieldsToFieldDetails(fields, this.tabDetails);
        this.loading = false;
      })
    }
  }

  isFieldHidden(field) {
    if(!field) return true;
    return field.isHidden || this.transactionService.isFieldRuleHidden(field.fieldId);
  }

  getFieldType(fldCtrl:any) {
    if(!fldCtrl) {
      return '';
    }
    switch(fldCtrl.pickList) {
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
        return 'HTML-EDITOR';
      case '53':
        return 'DATETIME';
      default :
        return 'TEXT'
    }
  }

  isShowDescription(field): boolean {
    // if(this.process === Process.view) return false;
    return field.fieldCtrl.isDescription && this.transactionService.getLayoutDetails()?.descriptionGenerator;
  }
}
