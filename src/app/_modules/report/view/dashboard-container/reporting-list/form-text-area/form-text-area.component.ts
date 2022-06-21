import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ChangeDetectionStrategy, OnChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'pros-form-textarea',
  templateUrl: './form-text-area.component.html',
  styleUrls: ['./form-text-area.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class FormTextAreaComponent implements OnInit,OnChanges {

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

  @Input() title : string;

  isApplied : boolean;

  textCtrl : FormControl = new FormControl();


  /**
   * ANGULAR HOOK
   *
   */
  ngOnInit(): void {
    if (!this.control) {
      this.control = new FormControl();
    }
    if(this.isTableFilter === 'false') {
      this.control.valueChanges.pipe(debounceTime(500)).subscribe(value=>{
        this.applyFilter(value);
      })
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
  applyFilter(value?) {
    if(this.isTableFilter === 'false') {
      this.control.setValue(value);
    }
    this.isApplied = true;
    const response = {
      formFieldId: this.formFieldId,
      value
    }
    this.valueChange.emit(response);
  }
}
