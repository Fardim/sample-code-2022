import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ChangeDetectionStrategy, OnChanges } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'pros-form-checkbox',
  templateUrl: './form-checkbox.component.html',
  styleUrls: ['./form-checkbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class FormCheckboxComponent implements OnInit,OnChanges {

  constructor() { }


  /**
   * Define an indiviual form control
   */
  @Input() control: FormControl;

  /**
   * Getting placeholder from parent
   */
  @Input() placeholder: string;

  @Input() isTableFilter: string;

  /**
   * To emit value change of input to parent
   */
  @Output() valueChange = new EventEmitter<object>();

  @Input() value: string;

  @Input() formFieldId: string;

  @Input() label : string;

  isApplied : boolean;


  /**
   * ANGULAR HOOK
   *
   */
  ngOnInit(): void {
    if (!this.control) {
      this.control = new FormControl();
    }
  }

/**
 * ANGULAR HOOK
 * To detect the changes from parent and update value
 * @param  changes: object contains prev and current value
 */

  ngOnChanges(changes: SimpleChanges) {
    if(changes.formFieldId && changes.formFieldId.previousValue !== undefined && changes.formFieldId.previousValue !== changes.formFieldId.currentValue) {
        this.formFieldId = changes.formFieldId.currentValue;
        this.control.setValue(changes.controls.currentValue);
    }
  }

  /**
   * apply filter and emit the output event
   */
  applyFilter(event?) {
    if(this.isTableFilter === 'false') {
      this.control.setValue(event);
    }
    this.isApplied = true;
    const response = {
      formFieldId: this.formFieldId,
      value: this.control.value
    }
    this.valueChange.emit(response);
  }

  isChecked() {
    if(this.control.value) {
      return true;
    }
  }
}
