import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmptySpaceRule, FieldConfiguration } from '@models/schema/schemadetailstable';
import { EMPTY_SPACE_RULE_TYPES } from '@modules/admin/_components/module/business-rules/business-rules.modal';

@Component({
  selector: 'pros-empty-space-rule',
  templateUrl: './empty-space-rule.component.html',
  styleUrls: ['./empty-space-rule.component.scss']
})
export class EmptySpaceRuleComponent implements OnInit, OnChanges  {

  emptySpaceRules: EmptySpaceRule = {
    isRemoveLeadingSpace: false,
    isRemoveTraillingSpace: false,
    isRemoveAll: false, fields: []
  }

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
  selectedRuleData: EmptySpaceRule;

  @Input()
  isAppliedNewRuleForMapping: false;

  /**
  * Output property to emit transformation rule data back to parent component
  */
  @Output()
  emptySpaceRuleOutput: EventEmitter<EmptySpaceRule> = new EventEmitter(null);

  /** Zero Rule Types list getting from model */
  public get emptySpaceRuleTypeList() {
    return EMPTY_SPACE_RULE_TYPES;
  }

  constructor(private snackBar: MatSnackBar) { }

  /**
   * Angular hook for on init
   */
  ngOnInit(): void {
    if (this.selectedRuleData) {
      Object.assign(this.emptySpaceRules, this.selectedRuleData);
    }
    this.emptySpaceRules.fields = Array.isArray(this.emptySpaceRules?.fields) && this.emptySpaceRules.fields.length > 0 ? this.emptySpaceRules.fields : [{ fldId: '', order: 0 }]
  }

  /**
   * method to emit the final lookup data
   * @param data pass the lookup output
   */
  emiEmptySpaceRuleData(data: EmptySpaceRule) {
    this.emptySpaceRuleOutput.emit(data);
  }

  addZeroRule() {
    this.emptySpaceRules.fields = [...this.emptySpaceRules.fields, { fldId: '', order: this.emptySpaceRules.fields.length }]
  }

  removeZeroRule(idx: number) {
    if (this.emptySpaceRules.fields[idx]) {
      this.emptySpaceRules.fields.splice(idx, 1);
    }
  }

  /**
   * method to set the user selected fields and entered data
   * @param value pass the manually entered text value
   * @param index pass the field index
   */
  setLookupTargetField(value, index: number, fieldType: string = 'fldId') {
    const field = this.emptySpaceRules.fields[index];
    field[fieldType] = value;
    this.emptySpaceRules.fields.forEach((item, idx) => {
      item.order = idx;
      return item;
    })
    this.emiEmptySpaceRuleData(this.emptySpaceRules);
  }

  updateLookupTargetField(value, index: number) {
    if (!value) {
      this.setLookupTargetField(null, index);
    }
  }

  updateEmptySpaceOptions(key: string) {
    if (this.emptySpaceRules[key] !== undefined) {
      this.emptySpaceRules[key] = !this.emptySpaceRules[key];
      this.emiEmptySpaceRuleData(this.emptySpaceRules);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.sourceFieldsObject?.currentValue) {
      this.sourceFieldsObject = {...changes.sourceFieldsObject.currentValue}
    }
  }
}
