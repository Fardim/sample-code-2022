import { Component, Input, OnInit } from '@angular/core';
import { DataControlService } from '@modules/transaction/_service/data-control.service';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import { TransactionControlComponent } from '../transaction-control/transaction-control.component';

@Component({
  selector: 'pros-transaction-input',
  templateUrl: './transaction-input.component.html',
  styleUrls: ['./transaction-input.component.scss']
})
export class TransactionInputComponent extends TransactionControlComponent implements OnInit {
  @Input() patchRuleData;

  constructor(public transService: TransactionService, public dataControlService: DataControlService) {
    super(transService, dataControlService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    if (this.patchRuleData) {
      this.control.setValue(this.patchRuleData);
    }
  }

  /**
   * gets hint for errors in form fields
   */
  get getHint() {
    if (this.control.pristine) return;
    return this.getErrorHint(this.control, this.fieldObj);
  }

  afterBlur() {
    this.updateFormControlValue();
    super.validateFieldRules();
  }

  updateFormControlValue() {
    const fieldCtrl = this.fieldObj?.fieldCtrl;
    if (fieldCtrl?.dataType === 'CHAR' && ['22', '0'].includes(fieldCtrl.pickList)) {
      let value = this.control.value ?? '';
      if (fieldCtrl.textCase === 'UPPER') {
        value = `${value}`.toUpperCase();
      } else if (fieldCtrl.textCase === 'LOWER') {
        value = `${value}`.toLowerCase();
      } else if (fieldCtrl.textCase === 'CAMEL') {
        value = `${value}`[0].toLowerCase() + `${value}`.slice(1);
      }
      this.control.setValue(value);
    }

    if (fieldCtrl?.dataType === 'DEC') {
      let value = this.control.value ?? '';
      let decimalValues = this.fieldObj.fieldCtrl?.decimalValue;

      if (value && decimalValues) {
        value = parseFloat(value).toFixed(decimalValues);
        // Check after parsing that the value is valid decimal.  If not set it as null.
        if (isNaN(value)) {
          this.control.setValue(null);
        } else {
          this.control.setValue(value);
        }
      }
    }
  }
}
