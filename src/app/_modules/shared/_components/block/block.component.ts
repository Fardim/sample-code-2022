import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { ConditionalOperator } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { Metadata } from '@modules/report/edit/container/metadatafield-control/metadatafield-control.component';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TragetInfo, OldValueInfo } from 'src/app/_constants';

@Component({
  selector: 'pros-block',
  templateUrl: './block.component.html',
  styleUrls: ['./block.component.scss']
})
export class BlockComponent implements OnInit, OnDestroy {

  @Input() moduleId: string;
  // holds operator list from hierarchy component
  @Input() operatorsList: any = [];
  // holds operator filtered list
  operatorsListFiltered = [];

  // holds formgroup of current block
  @Input() blockCtrl: FormGroup;

  // holds bollean input for show/hide of regex for source field
  @Input() set showRegex(val: boolean) {
    this.showBadge = val;
  }
  showBadge = false;

  // emits data for adding either parent or child block
  @Output() addNewBlock: EventEmitter<any> = new EventEmitter();
  // emits when current block should be deleted
  @Output() deleteBlock: EventEmitter<any> = new EventEmitter();

  // source fields list
  sourceFldListObs: Observable<any> = of([]);
  allSourceFields = [];
  @Input() set sourceFldList(val: any) {
    this.allSourceFields = val;
    this.sourceFldListObs = of(val);
    if (!this.blockCtrl.value.sourceFldCtrl && this.blockCtrl.value.preSelectedSourceFld) {
      if (this.blockCtrl.value.preSelectedSourceFld === this.resultCntField.fieldId) {
        this.blockCtrl.controls.sourceFldCtrl.setValue(this.resultCntField);
      } else {
        this.setFldValue('sourceFldCtrl', 'preSelectedSourceFld', this.allSourceFields);
      }
    }
  };

  // output to trigger fields list update
  @Output() updateList: EventEmitter<any> = new EventEmitter();
  @Output() updateParallelCondition: EventEmitter<any> = new EventEmitter();

  // holds boolean for changing condition for first parent of a single level
  @Input() canChangeCondition: boolean;

  // target fields list
  targetFldListObs: Observable<ConditionalOperator[]> = of([]);
  @Input() set targetFldList(val: ConditionalOperator[]) {
    this.targetFldListObs = of(val);
  };

  // old fields list
  oldFldListObs: Observable<ConditionalOperator[]> = of([]);
  @Input() set oldFldList(val: ConditionalOperator[]) {
    this.oldFldListObs = of(val);
  };

  // blocks form group
  @Input() blocksGrp: FormGroup;
  // holds possible condition
  possibleConditions = ['And', 'Or'];
  // holds subscription
  subscriptions = [];

  // holds target list metadata
  @Input() targetListMetaData: any;

  // holds old list metadata
  @Input() oldListMetaData: any

  @Input() parentMetadata: any;
  // stored for retrieving initial list when search is cleared
  @Input() initialSrcList: any;

  @Input() isShowOldValue = false;

  showTargetValueControl = true;
  showOldValueControl = true;
  // will be triggered on one go process
  @Input() set isNewModule(val: boolean) {
    if (val) {
      this.showTargetValueControl = false;
      this.blockCtrl.controls.targetInfo.setValue(TragetInfo.VALUE);

      this.showOldValueControl = false;
      this.blockCtrl.controls.oldValueInfo.setValue(OldValueInfo.VALUE);
    }
  };

  @Input() showResultCount: boolean = false;
  resultCntField: Metadata = {
    fieldId: 'RESULT_COUNT',
    fieldDescri: 'Result Count',
    isGroup: false,
    childs: []
  };
  resultCntOpeartors = ['EQUAL', 'LESS_THAN', 'LESS_THAN_EQUAL', 'GREATER_THAN', 'GREATER_THAN_EQUAL', 'RANGE'];
  @Input() submitted: boolean;
  @Input() blockNotMandatory: boolean;

  constructor() { }

  ngOnInit(): void {
    this.subscribeSearchValues('sourceFldCtrl', 'sourceList');

    this.operatorsListFiltered = this.operatorsList;
    this.blockCtrl.controls.operator.valueChanges.pipe(distinctUntilChanged(), debounceTime(300)).subscribe(val => {
      const value = val?.replace(/\s/g, '_') || '';
      this.operatorsListFiltered = this.operatorsList.map(operator => ({
        ...operator,
        childs: operator.childs.filter(child => child.toLowerCase().includes(value))
      }))
      .filter(operator => operator.childs.length);
    });
  }

  /**
   * sets target field value
   * @param value value returned from udr-value-component
   */
  setComparisonValue(value) {
    if (typeof value === 'object') {
      if (typeof value === 'object' && (value as any).fieldId) {
        this.blockCtrl.get('targetInfo').setValue(TragetInfo.FIELD);
        this.blockCtrl.get('oldValueInfo').setValue(TragetInfo.FIELD);
        this.blockCtrl.get('preSelectedTargetFld').setValue((value as any).fieldId);
        this.blockCtrl.get('targetFldCtrl').setValue(value);
      } else {
        this.blockCtrl.get('conditionFieldStartValue').setValue(value.start);
        this.blockCtrl.get('conditionFieldEndValue').setValue(value.end);
        this.blockCtrl.get('targetInfo').setValue(TragetInfo.VALUE);
        this.blockCtrl.get('oldValueInfo').setValue(TragetInfo.VALUE);
      }
    } else {
      this.blockCtrl.get('preSelectedTargetFld').setValue(value);
      this.blockCtrl.get('targetInfo').setValue(TragetInfo.VALUE);
      this.blockCtrl.get('oldValueInfo').setValue(TragetInfo.VALUE);
    }
  }

  setOldComparisonValue(value) {
    if (typeof value === 'object') {
      if (typeof value === 'object' && (value as any).fieldId) {
        this.blockCtrl.get('oldValueInfo').setValue(OldValueInfo.FIELD);
        this.blockCtrl.get('preSelectedOldFld').setValue((value as any).fieldId);
        this.blockCtrl.get('oldFldCtrl').setValue(value);

      } else {
        this.blockCtrl.get('conditionFieldStartValue').setValue(value.start);
        this.blockCtrl.get('conditionFieldEndValue').setValue(value.end);
        this.blockCtrl.get('oldValueInfo').setValue(OldValueInfo.VALUE);
      }
    } else {
      this.blockCtrl.get('preSelectedOldFld').setValue(value);
      this.blockCtrl.get('oldValueInfo').setValue(OldValueInfo.VALUE);
    }
  }

  /**
   * holds delete state for current block
   * @returns boolean
   */
  isDeletable() {
    // should not allow delete for the first parent condition since there should be atleast one block (lookup rule when condition is an exception)
    if (this.blocksGrp && !this.blockNotMandatory) {
      const parentFormArr = this.blocksGrp.get('blocks') as FormArray;
      if (parentFormArr.controls.length === 1) {
        const childs = parentFormArr.controls[0].get('childs') as FormArray;
        if (!childs.controls.length) {
          return false;
        }
      }
    }

    // block delete for blocks with child
    let res = true;
    const formArr = this.blockCtrl.controls.childs as FormArray;
    if (formArr.controls.length) {
      res = false;
    }

    return res;
  }

  /**
   * updates fields list based on search string
   * @param ctrl search control
   * @param list fields list to be searched
   */
  subscribeSearchValues(ctrl: string, list: string) {
    const sub = this.blockCtrl.controls[ctrl].valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(200)
    ).subscribe((searchString) => {
      this.updateFldList(list, searchString);
    });

    this.subscriptions.push(sub);
  }

  /**
   * finds and sets field value from provided list
   * @param fldCtrl field control name
   * @param fldId field id control name
   * @param fldList field list
   */
  setFldValue(fldCtrl, fldId, fldList) {
    const val = this.blockCtrl.controls[fldId].value;
    if (val) {
      fldList.forEach((fldGrp) => {
        fldGrp.childs.forEach((fld) => {
          if (fld.fieldId === val) {
            this.blockCtrl.controls[fldCtrl].setValue(fld);
            this.blockCtrl.controls[fldId].setValue(fld.fieldId);
          }
        });
      });
    }
  }

  /**
   * triggers fields list update
   * @param type fields type
   * @param searchStr search string
   */
   updateFldList(type, searchStr = '') {
    /*if (this.initialSrcList) {
      this.setSourceFieldList(searchStr);
    } else {*/
      this.updateList.emit({ type, searchString: searchStr });
    //}
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  /**
   * gets form control object
   * @param name form control name
   * @returns response as form control
   */
  getFormCtrl(name) {
    return this.blockCtrl.get(name) as FormControl;
  }

  /**
   * selects opeartor for current block
   * @param ev mat autocomplete event
   */
  selectOperator(ev, inputEl?) {
    if (inputEl) {
      inputEl.blur();
    }
  }

  /**
   * selects source field for current block
   * @param ev mat autocomplete event
   */
  selectSrcFld(ev, inputEl?) {
    const option = ev.option.value as Metadata;
    if(option) {
      this.blockCtrl.controls.sourceFldCtrl.setValue(option);
      this.blockCtrl.controls.preSelectedSourceFld.setValue(option.fieldId);
      this.blockCtrl.controls.sourceFldObjType.setValue(option.moduleId);
    }

    if (inputEl) {
      inputEl.blur();
    }

    if (option.fieldId === 'RESULT_COUNT') {
      this.blockCtrl.controls.targetInfo.setValue(TragetInfo.VALUE);
      if (!this.resultCntOpeartors.includes(this.blockCtrl.value.operator)) {
        this.blockCtrl.controls.operator.setValue('EQUAL');
      }

      if (this.isShowOldValue) {
        this.blockCtrl.controls.oldValueInfo.setValue(OldValueInfo.VALUE);
      }
    }
  }

  /**
   * returns display value as code or value
   * @param child child
   * @returns value or code
   */
  displayFldVal(child) {
    if (child) {
      return child.value || child.code;
    }
  }

  /**
   * used for displaying description from field object in UI...
   * @param obj metadata field
   * @returns field description
   */
  displayFn(obj): string {
    let res = null;
    if (obj) {
      const desc = obj.fieldDescri ? obj.fieldDescri : (obj.fieldDesc ? obj.fieldDesc : obj.fieldId);
      res = obj.moduleName ? (!desc.includes(`${obj.moduleName}/`) ? `${obj.moduleName}/${desc}` : desc) : desc;
    }

    return res;
  }

  /**
   * gets apt tooltip based on sent type
   * @param type field type
   * @returns tooltip value
   */
  getFieldTooltip(type) {
    let res = null;
    if (type === 'source') {
      const fld = this.blockCtrl.value.sourceFldCtrl;
      res = fld;
      if (typeof fld === 'object') {
        res = this.displayFn(fld);
      }
    } else if (type === 'operator') {
      res = this.displayOperatorFn(this.blockCtrl.value.operator);
    } else if (type === 'target') {
      res = (this.isShowOldValue) ? 'New Value' : 'Comparison Value';
      const operators = ['EMPTY', 'NOT_EMPTY', 'RANGE'];
      if (!operators.includes(this.blockCtrl.value.operator) && this.blockCtrl.value.preSelectedTargetFld) {
        if (this.blockCtrl.value.targetInfo === 'FIELD') {
          res = this.displayFn(this.blockCtrl.value.targetFldCtrl);
        } else {
          res = this.blockCtrl.value.preSelectedTargetFld;
        }
      }
    } else if (type === 'old') {
      res = 'Old Value';
      const operators = ['EMPTY', 'NOT_EMPTY', 'RANGE'];
      if (!operators.includes(this.blockCtrl.value.operator) && this.blockCtrl.value.preSelectedOldFld) {
        if (this.blockCtrl.value.oldValueInfo === 'FIELD') {
          res = this.displayFn(this.blockCtrl.value.oldFldCtrl);
        } else {
          res = this.blockCtrl.value.preSelectedOldFld;
        }
      }
    }

    return res;
  }

  /**
   * handles dropdown arrow position
   * @param el mat autocomplete element
   * @returns current dropdown icon name based on dropdown state
   */
  getDropdownPos(el: MatAutocomplete) {
    let pos = 'chevron-down';
    if (el && el.isOpen) {
      pos = 'chevron-up';
    }

    return pos;
  }

  /**
   * return user readable operator name
   * @param child operator code
   * @returns operator name
   */
  displayOperatorFn(child?: string) {
    if(child === 'EQUAL') { return 'EQUALS' }
    if(child === 'LENGTH_GREATER_THEN') { return 'LENGTH GREATER THAN' }
    if(child === 'LENGTH_LESS_THEN') { return 'LENGTH LESS THAN' }

    return child? child.replace(/_/g, ' '):'';
  }

  /**
   * returns form control value with form control name
   * @param ctrl form control name
   * @returns form value corresponding to form control
   */
  getValue(ctrl) {
    return this.blockCtrl.controls[ctrl].value || '';
  }

  /**
   * emits event to parent component for adding block
   * @param type parent / child
   */
  addblock(type) {
    const res = {
      formGrp: this.blockCtrl,
      type
    };
    this.addNewBlock.emit(res);
  }

  /**
   * emits event to parent component for removing current block
   */
  removeBlock() {
    this.deleteBlock.emit(true);
  }

  /**
   * updates condition in block
   * @param cond block condition
   */
  updateCondition(cond: string) {
    this.blockCtrl.controls.condition.setValue(cond.toUpperCase());
    this.updateParallelCondition.emit(cond.toUpperCase());
  }

  /**
   * responds with condition name for display
   * @returns condition display value
   */
  getConditionName() {
    return this.possibleConditions.find(x => x.toLowerCase() === this.blockCtrl.controls.condition.value.toLowerCase());
  }

  /**
   * restores source field list
   */
   setSourceFieldList(searchString: string) {
    if (this.initialSrcList) {
      const filterdFileds = searchString === '' ? this.initialSrcList : this.initialSrcList.filter((item) => item?.description?.includes(searchString));
      const fieldList = [{
        fieldDescri: 'Header fields',
        fieldId: 'header_fields',
        isGroup: true,
        childs: filterdFileds
      }];
      this.allSourceFields = this.initialSrcList;
      this.sourceFldListObs = of(fieldList);
    }
  }

  isResultCount() {
    return this.blockCtrl.value.preSelectedSourceFld === 'RESULT_COUNT';
  }

  canDisplay(operator) {
    if (!this.isResultCount()) {
      return true;
    }

    if (this.isResultCount() && this.resultCntOpeartors.includes(operator)) {
      return true;
    }
  }

}
