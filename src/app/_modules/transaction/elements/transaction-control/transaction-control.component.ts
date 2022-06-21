import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { ActiveForm, CheckboxOptionsMapping, FieldResponse, Process, TransactionMaterialDescName } from '@modules/transaction/model/transaction';
import { DataControlService } from '@modules/transaction/_service/data-control.service';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import * as moment from 'moment';
import { combineLatest, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, takeUntil, tap } from 'rxjs/operators';
@Component({
  selector: 'pros-transaction-control',
  template: ''
})
export class TransactionControlComponent implements OnInit, OnChanges, OnDestroy {

  /**
   * Tab details ...
   */
  @Input() tabDetails;

  /**
   * Feild response ...
   */
  @Input() fieldObj: FieldResponse;

  /**
   * The control of the form / element ...
   */
  @Input() control: FormControl;
  @Input() controlName: string;
  @Input() moduleId: string;
  @Input() layoutId: string;
  @Input() recordId: string;
  @Input() dataControl;

  @Input() generateDescriptionValue: string;
  @Input() process: string;
  @Input() useFrom: string;
  @Input() isUoM = false;
  isFieldReadOnly = false;
  oldValue: string;
  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();
  activeStructure;

  activeForm: ActiveForm;

  private subscr: Subscription;

  copyField = new FormControl(true);

  /**
   * To keep track of the new dataref record, only useful for data reference type field
   */
  newRecordDetails = null;

  constructor(
    public transService: TransactionService,
    public dataControlService: DataControlService,
  ) { }

  ngOnInit(): void {
    // const locale = this.transService.getLocale();

    this.activeForm = this.dataControlService.activeForm$.getValue();

    this.dataControlService.activeForm$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp: ActiveForm) => {
      this.activeForm = resp;
    });

    if(this.useFrom === TransactionMaterialDescName) return;
    this.transService.savedRecordData$
    .pipe(
      filter(resp => resp === 'INITIAL' || resp === this.fieldObj.fieldId),
      takeUntil(this.unsubscribeAll$))
      .subscribe((resp: any) => {

        this.newRecordDetails = null;
        const record = this.transService.getMasterData(this.activeForm.isPrimary, this.moduleId, this.activeForm?.objnr, this.activeForm?.referenceRecordDetails)?.mdoRecordES;
        if ((this.fieldObj?.structureId === 1) && record && record.hdvs) {

          if(this.process === Process.copy) {
            const isCopied = record.hdvs?.[this.controlName]?.isCopied;

            if(isCopied === undefined) {
              this.copyField.setValue(true);
            }else {
              this.copyField.setValue(isCopied, {emitEvent: false});
            }
          }
          let value;
          if(this.isDataRef && (record?.hdvs?.[this.controlName]?.mdoRecord)) {
            this.newRecordDetails = record.hdvs[this.controlName].mdoRecord;
          }
          if(this.isListField() || this.isDataRef || this.isAttachmentField()) {
            value = record.hdvs[this.controlName]?.vc?.filter(v => !!v.c).map(v => {
              return {code: v.c, text: v.t}
            });
          } else {
            value = record.hdvs[this.controlName]?.vc[0]?.c || null;
          }
          if (this.fieldObj && this.isDateField() && value) {
              value = new Date(Number(value));
          }else if(this.fieldObj && this.isDateTimeField() && value) {
              value = new Date(Number(value));
          }else if(this.fieldObj && this.isTimeField() && value) {
                const time = value.split(',');
                if(time.length > 1) {
                  const start = new Date(Number(time[0]));
                  const end = new Date(Number(time[1]));
                  value = {
                    start: {
                      hours: start.getHours(),
                      minutes: start.getMinutes(),
                    },
                    end: {
                      hours: end.getHours(),
                      minutes: end.getMinutes(),
                    },
                  };
                }
          }else if(this.fieldObj && this.isCheckboxField()) {
            if(CheckboxOptionsMapping.checked.includes(value)) value = true;
            else if(CheckboxOptionsMapping.unchecked.includes(value))value = false;
          }
          if (this.control) {
            if (!value) {
              value = this.control.value;
            }
            this.control.patchValue(value, { emitEvent: false});
            setTimeout(() => this.updateDisplayedValue(value), 100);
            // check oc value changed
            if(record.hdvs[this.controlName] && record.hdvs[this.controlName]?.isChanged)
              return;
            // to set old value of the field
            const oldVal  = (record.hdvs[this.controlName]?.bc && record.hdvs[this.controlName]?.bc[0]) || null;
            if(oldVal && oldVal.c === value.c && oldVal.t === value.t) {
              console.warn(`The old and new value both are same .... can't update to control`);
              return;
            }
            this.oldValue = oldVal ? (oldVal.t || oldVal.c) : null;
          }
        }
      });

      combineLatest([this.transService.hierarchyKeyFieldDetails.pipe(
          filter(v => v && v.updatedModule === this.moduleId)
        ),
        this.transService.savedRecordData$])
        .subscribe((resp: any) => {
          // hierarchy structure
          const record = this.transService.getMasterData(this.activeForm.isPrimary, this.moduleId, this.activeForm?.objnr, this.activeForm?.referenceRecordDetails)?.mdoRecordES;
          if(this.fieldObj?.structureId > 1) {
            const activeKeyFieldDetails = resp[0] ? resp[0][this.moduleId] : null;
            if(!activeKeyFieldDetails) return;
            if(activeKeyFieldDetails.isMultiField && activeKeyFieldDetails.multiFieldOptions.length !== 0) {
              activeKeyFieldDetails.multiFieldOptions.forEach(element => {
                this.setActiveFieldDetails(record ,element);
              });
            } else {
              this.setActiveFieldDetails(record, activeKeyFieldDetails);
            }
          }
        });

      this.transService.runAllRules$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp: boolean) => {
      if (resp && this.process !== Process.view) {
        this.validateFieldRules(this.isListField(), true);
      }
    });

    this.copyField.valueChanges.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp) => {
      this.updateFieldStatus(resp);
    });
  }

  setActiveFieldDetails(resp1, activeKeyFieldDetails) {
    const hyvs = resp1? resp1.hyvs : this.transService.getMasterData(this.activeForm.isPrimary, this.moduleId, this.activeForm.objnr, this.activeForm.referenceRecordDetails)?.mdoRecordES?.hyvs;

    let row;
    // hold default values
    let def;
    if (hyvs) {
      if(this.fieldObj?.structureId === activeKeyFieldDetails.structureId) {
        row = hyvs[activeKeyFieldDetails.structureId]?.rows?.
        find(r => (r[activeKeyFieldDetails.keyFieldId]?.vc[0]?.c === activeKeyFieldDetails.keyFieldValueCode)
        && (!activeKeyFieldDetails.parentKeyFieldValueCode || (r[activeKeyFieldDetails.parentKeyFieldId]?.vc[0]?.c === activeKeyFieldDetails.parentKeyFieldValueCode)));
        def = hyvs[activeKeyFieldDetails.structureId]?.def || {};
      } else if (this.fieldObj?.structureId === activeKeyFieldDetails.parentStructureId) {
        row = hyvs[activeKeyFieldDetails.parentStructureId]?.rows?.
          find(r => r[activeKeyFieldDetails.parentKeyFieldId]?.vc[0]?.c === activeKeyFieldDetails.parentKeyFieldValueCode);
          def = hyvs[activeKeyFieldDetails.parentStructureId]?.def || {};
      }
    }
    if(row) {
      let value;

      if(this.process === Process.copy) {
        const isCopied = row[this.controlName].isCopied;
        this.copyField.setValue(isCopied, {emitEvent: false});
      }

      if(this.isListField() || this.isDataRef) {
        value = row[this.controlName]?.vc?.filter(v => !!v.c).map(v => {
          return {code: v.c, text: v.t}
        });
      } else {
        value = row[this.controlName]?.vc[0]?.c || null;
      }
      if(this.fieldObj && this.isDateField()){
        if(!value && this.process === Process.create) value = new Date();
        else value = new Date(Number(value));
      }
      else if(this.fieldObj && this.isDateTimeField()) {
        if(!value && this.process === Process.create) value = new Date();
        else value = new Date(Number(value));
      }

      let emitEvent = false;

      // check if the value is null or empty then check default value , if the process is create
      if(this.process === Process.create) {
        if((!value || !value.c || value.c === undefined ) && (this.isListField() || this.isDataRef)) {
          value = def[this.controlName]?.vc?.filter(v => !!v.c).map(v => {
            return {code: v.c, text: v.t}
          });
          emitEvent = true;
        } else if((!value || !value.c || value.c === undefined )) {
          value = def[this.controlName]?.vc[0]?.c || null;
          emitEvent = true;
        }
      }

      this.control?.setValue(value, {emitEvent});
      setTimeout(() => this.updateDisplayedValue(value), 100) ;
      // check oc value changed
      if (row[this.controlName] && row[this.controlName]?.isChanged)
        return;
      // to set old value of the field
      const oldVal = (row[this.controlName]?.bc && row[this.controlName]?.bc[0]) || null;
      if (oldVal && oldVal.c === value.c && oldVal.t === value.t) {
        console.warn(`The old and new value both are same .... can't update to control`);
        return;
      }
      // to set old value of the field
      this.oldValue = (row[this.controlName]?.bc && row[this.controlName]?.bc[0]?.c) || null;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.activeForm = this.dataControlService.activeForm$.getValue();

    if (this.useFrom === TransactionMaterialDescName) {
      if(this.process === Process.change || this.process === Process.approve || this.process === Process.view){
        const locale = this.transService.getLocale();
        const record = this.transService.getMasterData(this.activeForm.isPrimary, this.moduleId)?.mdoRecordES;
        if (record?.descriptions && record.descriptions[0] && record.descriptions[0]?.attributes) {
          const { attributes } = record.descriptions[0];
          if (attributes[locale] && attributes[locale].attrs && attributes[locale].attrs[this.fieldObj.fieldId]) {
            if(this.process === Process.view)
              this.isFieldReadOnly = true;

            const fieldDet = attributes[locale].attrs[this.fieldObj.fieldId];
            if (this.isUoM) {
              if (fieldDet.uom && fieldDet.uom.oc && fieldDet.uom.oc[0])
                this.oldValue = fieldDet.uom.oc[0].c || fieldDet.uom.oc[0].t;
            } else {
              if (fieldDet.oc && fieldDet.oc[0])
                this.oldValue = fieldDet.oc[0].c || fieldDet.oc[0].t;
            }
          }
        }
      }
      return;
    }

    if(changes && changes.generateDescriptionValue) {
      this.control.patchValue(changes.generateDescriptionValue.currentValue);
    }
    if (changes && changes.tabDetails) {
      this.tabDetails = changes.tabDetails.currentValue;
      if (this.tabDetails.isTabReadOnly || this.fieldObj?.fieldCtrl?.isReadOnly || this.fieldObj?.fieldCtrl?.isKeyField) {
        this.isFieldReadOnly = true;
      }
      if (this.fieldObj && this.control) {
        const validators = this.transService.getFieldValidators(this.fieldObj);
        this.control.setValidators([...validators]);
        /* const keyFieldDetails = this.transService.hierarchyKeyFieldDetails.getValue();
        if(keyFieldDetails && keyFieldDetails[this.moduleId]&& keyFieldDetails[this.moduleId].structureId !== this.fieldObj.structureId)
          this.isFieldReadOnly = true;
          // console.log("structureId", this.fieldObj.structureId, keyFieldDetails); */

      this.activeStructure = this.transService.getHierarchyListDetails(this.activeForm, this.moduleId);

      if(this.activeStructure && this.fieldObj) {
        if( this.activeStructure.activeStructId !== this.fieldObj.structureId ||
            this.process === Process.view ||
            this.process === Process.copy ||
            this.fieldObj?.fieldCtrl.isKeyField ||
            this.fieldObj?.isReadOnly
          ) {
            this.control.disable({emitEvent: false});
            this.isFieldReadOnly = true;
          }else {
            this.control.enable({emitEvent: false});
            this.isFieldReadOnly = false;
          }
        }

        if(this.isDataRef && !this.activeForm.isPrimary && (`${this.fieldObj.fieldCtrl?.refDataset?.datasetId}` === `${this.moduleId}`)) {
          this.control?.disable({emitEvent: false});
          this.isFieldReadOnly = true;
        }
      }
    }

    if (changes && changes.control && changes.control.previousValue !== changes.control.currentValue && changes.control.isFirstChange) {
      /**
       * Update the value to the actual object ...
       */
      if(this.subscr)
        this.subscr.unsubscribe();

      this.subscr = this.control.valueChanges.pipe(distinctUntilChanged(), takeUntil(this.unsubscribeAll$)).subscribe(r => {
        if (this.isDateField() || this.isDateTimeField()) {
          r = moment(r).utc().valueOf();
        } else if (this.isListField() || this.isDataRef) {
          if(typeof r === 'string') r = [{code: r, text: r}];
          r = r ? r.map(v => {
            return {c: v.code, t:v.text};
          }): [{c: null, t: null}];
        }else if(this.isTimeField()) {
          r = this.getTimeRange(r);
        }
        if (this.fieldObj.structureId === 1) {
          this.transService.updateHdvs(this.activeForm, this.moduleId, this.activeForm.objnr, this.fieldObj.fieldId, Array.isArray(r) ? r : [r], this.process, false, this.isListField() || this.isDataRef, this.fieldObj.description, this.activeForm.referenceRecordDetails);
        } else {
          this.transService.updateHyvs(this.activeForm, this.moduleId, this.activeForm.objnr, this.fieldObj.structureId, this.fieldObj.fieldId, Array.isArray(r) ? r : [r], this.process, this.isListField() || this.isDataRef, this.activeForm.referenceRecordDetails);
        }
      });
    }
  }

  getTimeRange(time: any): string {
    const start = time?.start;
    const end = time?.end;
    const startMoment =  moment(this.getTimeObj(start)).utc().valueOf();
    const endMoment =  moment(this.getTimeObj(end)).utc().valueOf();
    return `${startMoment},${endMoment}`;
  }

  getTimeObj(time) {
    return {
      year: new Date().getFullYear(),
      month : new Date().getMonth(),
      day : new Date().getDay(),
      hour: time?.hours || 0,
      minute: time?.minutes || 0,
      second: 0,
      millisecond: 0
    };
  }

  get isRequired() {
    if(this.isDataRef && (this.fieldObj.fieldCtrl.refDataset.datasetId === this.transService.parentDatasetIdSub.getValue())) {
      return false;
    }
    if(this.control.validator) {
      const validator = this.control.validator({} as AbstractControl);
      if (validator && validator.required) {
        return true;
      }
    }
    return false;
  }

  isDateField(): boolean {
    return (this.fieldObj?.fieldCtrl?.pickList === '52');
  }

  isTimeField(): boolean {
    return (this.fieldObj?.fieldCtrl?.pickList === '54');
  }

  isDateTimeField(): boolean {
    return (this.fieldObj?.fieldCtrl?.pickList === '53');
  }

  isListField(): boolean {
    return (this.fieldObj?.fieldCtrl?.pickList === '1') || (this.fieldObj?.fieldCtrl?.pickList === '37');
  }

  isCheckboxField(): boolean {
    return (this.fieldObj?.fieldCtrl?.pickList === '2');
  }

  isAttachmentField(): boolean {
    return (this.fieldObj?.fieldCtrl?.pickList === '38');
  }

  get isDataRef() {
    return (this.fieldObj?.fieldCtrl?.pickList === '30');
  }

  /**
   * gets hint for errors in form fields
   */
  getErrorHint(fieldError, fieldObj): string {
    let msg;
    if (fieldError.errors) {
      if (fieldError.errors.required) {
        msg = 'This is a required field';
      } else if (fieldError.errors.invalidNumber) {
        msg = 'Please Enter Number Only';
      } else if (fieldError.errors.maxlength) {
        msg = 'Maximum Letters of ' + fieldError.errors.maxlength.requiredLength;
      } else if (fieldError.errors.minlength) {
        msg = 'Minimum Letters of ' + fieldError.errors.minlength.requiredLength;
      } else if (fieldError.errors.invalidCharCase) {
        const charType = fieldObj.charType;
        const capitalized = charType.charAt(0).toUpperCase() + charType.slice(1);
        msg = capitalized + ' Case are Allowed';
      } else if (fieldError.errors.invalidDecimal) {
        msg = 'Decimal Character Only with Position of ' + fieldObj.decimalPos;
      } else if (fieldError.errors.pattern) {
        msg = 'Please Enter Valid URL';
      }
    }

    return msg;
  }

  rulesForControlAsSource() {
    const controlRules = [];
    const rules = this.transService.getRules(this.moduleId);
    rules.forEach((item: any) => {
      item.forEach((mapping: any) => {
        mapping.conditions.forEach((cond: any) => {
          if (cond.sourceField === this.controlName) {
            controlRules.push(cond);
          }
        })
      })
    });
    return controlRules;
  }

  rulesForControlAsTarget() {
    const controlRules = [];
    const rules = this.transService.getRules(this.moduleId);
    rules.forEach((item: any) => {
      item.forEach((mapping: any) => {
        mapping.conditions.forEach((cond: any) => {
          if (cond.targetField === this.controlName) {
            controlRules.push(cond);
          }
        })
      })
    });
    return controlRules;
  }

  validateFieldRules(isDropDown = false, isInitialRun = false) {
    const rules = this.rulesForControlAsSource();
    if(rules.length && isDropDown && !isInitialRun) {
      const dependentSourceSet = new Set();
      rules.forEach((item: any) => {
        dependentSourceSet.add(item.targetField)
      })
      this.transService.updateDependentDropdownOptions.next(dependentSourceSet);
    }
    const updateValidators = {
      sourceValue: this.getCurrentValue(),
      rules,
      moduleId: this.moduleId,
    }

    if(rules.length)
      this.transService.updateValidators.next(updateValidators);
    const ruleIds = this.fieldObj?.fieldCtrl?.ruleIds;
    if(!isInitialRun && ruleIds && ruleIds.length) {
      console.log('Run Transformation Rule: ', this.fieldObj);
      this.transService.runTransformationRule(
        this.activeForm,
        ruleIds,
        this.moduleId,
        this.activeForm.objnr,
        this.activeForm.referenceRecordDetails,
        this.process,
        this.fieldObj
      );
    }
  }

  getCurrentValue(){
    const value = this.control?.value;
    if(!this.isListField()) return value;
    if(Array.isArray(value) && value[0] && value[0].code) return value[0].code;
    return value;
  }

  /**
   * Determine the value change ...
   * @param pre the previous value
   * @param curr the current value ...
   * @returns will return true if need to trigger valueChange otherwise return false
   */
  // customDistinctUntilChanged(pre: any, curr: any): boolean {
  //   if(typeof pre ==='object' && typeof curr === 'object') {
  //     return !((pre || []).map(m=>m.code).toString() === (curr || []).map(m=>m.code).toString());
  //   } else {
  //     return !(pre === curr);
  //   }
  // }

  /**
   * Dummy method to call child one on field value changes
   * @param newValue field new value
   */
  updateDisplayedValue(newValue) {}

  updateFieldStatus(isCopied: boolean) {
    const activeForm = this.dataControlService.activeForm$.getValue();

    if (this.fieldObj.structureId === 1) {
      this.transService.updateCopyStatusHdvs(this.activeForm, this.moduleId, activeForm.objnr, this.fieldObj.fieldId, this.fieldObj.description, activeForm.referenceRecordDetails, isCopied);
    } else {
      this.transService.updateCopyStatusHyvs(this.activeForm, this.moduleId, activeForm.objnr, this.fieldObj.structureId, this.fieldObj.fieldId, activeForm.referenceRecordDetails, isCopied);
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
  }
}

