import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ConstantRule, FieldConfiguration } from '@models/schema/schemadetailstable';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'pros-constant-rule',
  templateUrl: './constant-rule.component.html',
  styleUrls: ['./constant-rule.component.scss']
})
export class ConstantRuleComponent implements OnInit {

  constRules: ConstantRule[] = []

  /**
  * list of event to consider as selection
  */
  separatorKeysCodes: number[] = [ENTER, COMMA];

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
  selectedRuleType: ConstantRule[];

  @Input()
  selectedRuleData: ConstantRule[];

  @Input() moduleId: string;

  @Input() isNewModule: boolean;

  @Input() initialSrcList: any;

  @Input() targetListMetaData: any;

  /**
  * Output property to emit transformation rule data back to parent component
  */
  @Output()
  constantRuleOutput: EventEmitter<ConstantRule[]> = new EventEmitter(null);

  @Output() updateFldList: EventEmitter<any> = new EventEmitter();

  constructor(private snackBar: MatSnackBar) { }

  /**
   * Angular hook for on init
   */
  ngOnInit(): void {
    this.constRules = Array.isArray(this.selectedRuleData) && this.selectedRuleData.length > 0 ? this.selectedRuleData : [{ fldId: '', order: 0, value: '' }];
  }

  /**
   * method to emit the final lookup data
   * @param data pass the lookup output
   */
  emitConstantRuleData(data: ConstantRule[]) {
    this.constantRuleOutput.emit(data);
  }

  addConstantRule() {
    this.constRules = [...this.constRules, { fldId: '', order: this.constRules.length, value: '' }]
  }

  removeConstantRule(idx: number) {
    if (this.constRules[idx]) {
      this.constRules.splice(idx, 1);
    }
  }

  /**
   * method to set the user selected fields and entered data...
   * @param value pass the manually entered text value
   * @param index pass the field index
   */
  setLookupTargetField(value, index: number, fieldType: string = 'fldId') {
    const field = this.constRules[index];
    field[fieldType] = value;
    field.fldCtrl = this.sourceFieldsObject.list.find(item => item.fieldId === value);

    this.emitConstantRuleData(this.constRules.map((item, idx) => {
      item.order = idx;
      return item;
    }));
  }

  updateLookupTargetField(value, index: number) {
    if (!value) {
      this.setLookupTargetField(null, index);
    }
  }

  updateList(ev) {
    this.updateFldList.emit(ev);
  }

  setLookupComparaisonValue(value, index: number) {
    const field = this.constRules[index];
    field.value = value;

    this.emitConstantRuleData(this.constRules.map((item, idx) => {
      item.order = idx;
      return item;
    }));
  }
}