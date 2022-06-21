import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ZeroRule, FieldConfiguration } from '@models/schema/schemadetailstable';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ZERO_RULE_TYPES, ZeroRuleTypes } from '@modules/admin/_components/module/business-rules/business-rules.modal';

@Component({
  selector: 'pros-zero-rule',
  templateUrl: './zero-rule.component.html',
  styleUrls: ['./zero-rule.component.scss']
})
export class ZeroRuleComponent implements OnInit, OnChanges {

 zeroRules: ZeroRule = {type: ZeroRuleTypes.ADD_LEADING_ZERO, fields: []}

  /**
   * source field array from a module
   */
  @Input()
  sourceFieldsObject: FieldConfiguration = {
    valueKey: '',
    labelKey: '',
    list: []
  };

  /**
   * Input property to check if the parent form has been submitted
   */
  @Input()
  submitted = false;

  /**
   * Hold the selected rule type e.g. Regex or Lookup
   */
  @Input()
  selectedRuleType: string;

  @Input()
  selectedRuleData: ZeroRule;

  @Input()
  isAppliedNewRuleForMapping: false;

  /**
  * Output property to emit transformation rule data back to parent component
  */
  @Output()
  zeroRuleOutput: EventEmitter<ZeroRule> = new EventEmitter(null);

  /** Zero Rule Types list getting from model */
  public get zeroRuleTypeList() {
    return ZERO_RULE_TYPES;
  }

  constructor(private snackBar: MatSnackBar) { }

  /**
   * Angular hook for on init
   */
  ngOnInit(): void {
    if (this.selectedRuleData) {
      Object.assign(this.zeroRules, this.selectedRuleData);
    }
    this.zeroRules.fields = Array.isArray(this.selectedRuleData?.fields) && this.selectedRuleData.fields.length > 0 ? this.selectedRuleData.fields : [{ fldId: '', order: 0 }];
  }

  /**
   * method to emit the final lookup data
   * @param data pass the lookup output
   */
  emitConstantRuleData(data: ZeroRule) {
    this.zeroRuleOutput.emit(data);
  }

  addZeroRule() {
    this.zeroRules.fields = [...this.zeroRules.fields, { fldId: '', order: this.zeroRules.fields.length }]
  }

  removeZeroRule(idx: number) {
    if (this.zeroRules.fields[idx]) {
     this.zeroRules.fields.splice(idx, 1);
    }
  }

  /**
   * method to set the user selected fields and entered data
   * @param value pass the manually entered text value
   * @param index pass the field index
   */
  setLookupTargetField(value, index: number,fieldType:string = 'fldId') {
    const field = this.zeroRules.fields[index];
    field[fieldType] = value;
    field.fldCtrl = this.sourceFieldsObject.list.find(item => item.fieldId === value);
    this.zeroRules.fields.forEach((item, idx) => {
      item.order = idx;
      return item;
    });
    this.emitConstantRuleData(this.zeroRules);
  }

  updateLookupTargetField(value, index: number) {
    if (!value) {
      this.setLookupTargetField(null, index);
    }
  }

  updateZeroRuleType(value: string) {
    this.zeroRules.type = value;
    this.emitConstantRuleData(this.zeroRules);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.sourceFieldsObject?.currentValue) {
      this.sourceFieldsObject = {...changes.sourceFieldsObject.currentValue}
    }
  }
}
