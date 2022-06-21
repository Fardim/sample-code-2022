import { Component, EventEmitter, Inject, Input, LOCALE_ID, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { IconType } from '@models/list-page/listpage';
import { ActiveForm, FieldErrorLog } from '@modules/transaction/model/transaction';
import { DataControlService } from '@modules/transaction/_service/data-control.service';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import { CoreService } from '@services/core/core.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { picklistValues } from '../../../list/_components/field/field-service/field.service';
@Component({
  selector: 'pros-transaction-errors',
  templateUrl: './transaction-errors.component.html',
  styleUrls: ['./transaction-errors.component.scss']
})
export class TransactionErrorsComponent implements OnInit, OnChanges {

  @Input() dataControl;
  @Input() tabList;
  @Input() moduleId;
  @Input() allErrorsLogs: Array<FieldErrorLog> = [];
  @Output() close: EventEmitter<boolean> = new EventEmitter();
  isFieldLoading = false;
  errorFieldsIds: {[datasetId: string]: Array<string>} = {};
  fieldsWithErrors = [];
  descriptionErrorFields;
  picklistValues = picklistValues;
  defaultIcon = {
    icon: 'crop_landscape',
    iconType: IconType.MATERIAL
  }

  unsubscribeAll$: Subject<boolean> =  new Subject<any>();

  activeForm: ActiveForm;

  constructor(
    private coreService: CoreService,
    @Inject(LOCALE_ID) public locale: string,
    public transService: TransactionService,
    private dataControlService: DataControlService,
  ) { }

  ngOnInit(): void {

    this.activeForm = this.dataControlService.activeForm$.getValue();

    this.dataControlService.activeForm$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp: ActiveForm) => {
      this.activeForm = resp;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes.allErrorsLogs) {
      if(!this.allErrorsLogs.length)
        this.getErrorFieldsDetails();
      else
        this.addIconToField();
    }
  }

  addIconToField() {
    this.allErrorsLogs = this.allErrorsLogs.map(item => ({...item, icon: this.getFieldIcon(item)}));
  }

  getFieldIdToFetch() {
    const fieldIds = this.dataControlService.getControlsWithError(this.dataControl, this.moduleId);
    return fieldIds;
  }

  // display generate description error
  checkDescriptionErrors(): void {
    this.descriptionErrorFields = {};
    const errorDescObj = this.transService.getDescriptionFormData();
    if (errorDescObj && errorDescObj.frmArray) {
      const fields = [];
      errorDescObj.frmArray.controls.forEach(group => {
        for (const control in group.controls) {
          if (group.controls[control].invalid) {
            fields.push(group.value.label);
          }
        }
      });
      if (fields.length > 0)
        this.descriptionErrorFields[errorDescObj.tabId] = fields;
    }
  }

  async getErrorFieldsDetails() {
    this.errorFieldsIds = await this.getFieldIdToFetch();
    this.fieldsWithErrors = [];
    Object.keys(this.errorFieldsIds).forEach((dataSetId: string) => {
      const fields = this.errorFieldsIds[dataSetId];
      fields.forEach((fieldId) => {
        const fieldObj = this.transService.getFieldDetailById(fieldId);
        if(!fieldObj) {
          this.fieldsWithErrors.push({errMsg: `Fix errors in ${fieldId}`, icon: this.defaultIcon});
          return;
        };

        const find = picklistValues.find(f => fieldObj.fieldCtrl.dataType === f.dataType && f.pickList === fieldObj.fieldCtrl.pickList);
        const iconObj = find ? find : this.defaultIcon;

        const structures = this.transService.getHierarchyListDetails(this.activeForm, String(fieldObj.moduleId))?.hierarchyListStructure;
        const fieldName = fieldObj?.fieldCtrl?.description;
        const tabName = fieldObj?.tabDetails?.description;
        const sturctureName = this.getStructureName(fieldObj.structureId, structures);
        this.fieldsWithErrors.push({errMsg: `Fix error in ${fieldName} in ${tabName} in ${sturctureName? sturctureName.label : ''}`, icon: iconObj});
      })
    })
  }

  /**
   * @param structrure Structure of the hierarchy
   * @param id Id of the structure
   * @returns the matched hierarchy
   */
  findStructureById(structrure, id) {
    if( structrure.id === id ){
      return structrure;
    }
    let result;
    let key;
    for (key in structrure) {
        if( structrure.hasOwnProperty(key) && typeof structrure[key] === 'object' ) {
            result = this.findStructureById(structrure[key], id);
            if(result){
                return result;
            }
        }
    }
    return result;
  }

  getStructureName(structureId: number, structures) {
    if(!structures) return '';
    if(!structureId || (!Array.isArray(structures) && structures?.length === 0)) return null;
    return this.findStructureById(structures[0], structureId);
  }

  getErrorMessage(field) {
    const fieldId = field.path === "gvs" ? field.parentSegment : field.fieldId;
    const fieldObj = this.transService.getFieldDetailById(fieldId);
    if(!fieldId) return field.errMsg;
    if(!fieldObj) return `${field.fieldId}: ${field.errMsg}`;

    const structures = this.transService.getHierarchyListDetails(this.activeForm, String(fieldObj.moduleId))?.hierarchyListStructure;
    const fieldName = fieldObj?.fieldCtrl?.description;
    const tabName = fieldObj?.tabDetails?.description;
    const sturctureName = this.getStructureName(fieldObj.structureId, structures);
    return `${fieldName} in ${tabName} in ${sturctureName? sturctureName.label : ''}: ${field.errMsg}`;
  }

  getFieldIcon(field) {
    const fieldId = field.path === 'gvs' ? field.parentSegment : field.fieldId;
    if(!fieldId) return this.defaultIcon;
    const fieldObj = this.transService.getFieldDetailById(fieldId);
    if(!fieldObj) return this.defaultIcon;
    const find = picklistValues.find(f => fieldObj.fieldCtrl.dataType === f.dataType && f.pickList === fieldObj.fieldCtrl.pickList);
    return find ? find : this.defaultIcon;
  }

  closePanel() {
    this.close.emit();
  }

  getFonSet(field) {
    const icon = field?.icon?.icon;
    return  icon !== 'grid_on' && icon !== 'crop_landscape' ? 'mdo-icons-light' : null;
  }

  ngDestroy() {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
  }
}
