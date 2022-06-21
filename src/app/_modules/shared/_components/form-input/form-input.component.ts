import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';

@Component({
  selector: 'pros-form-input',
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class FormInputComponent implements OnInit, OnChanges {

  constructor() { }


  /**
   * Define an indiviual form control
   */
 @Input() control: FormControl;

  /**
   * Getting placeholder from parent
   */
  @Input() placeholder: string;

  /**
   * Getting value from parent
   */
  @Input() value: string;

  /**
   * Getting label from parent
   */
  @Input() label: string;

  /**
   * To get input type from parent
   */
  @Input() type: string;

  @Input() isHelpIcon: boolean;
  @Input() helpIcon = 'info-circle';

  /**
   * To get hint below the input field from parent
   */
  @Input() hint: string;

  /**
   * To get maximum length of input
   */
  @Input() maxLength: number;

  /**
   * To get min value in case of field type is number
   */
  @Input() minimum: number;

  /**
   * To get maximum value in case of field type is number
   */
  @Input() maximum: number;

  /**
   * To get id for the field
   */
  @Input() id: number;

  /**
   * To emit value change of input to parent
   */
  @Output() valueChange = new EventEmitter<string>();

  /**
   * To emit event on blur
   */
  @Output() emitBlurEvent = new EventEmitter<string>();

  /**
   * Flag to get value of disabled and set readonly value
   */
  @Input() set disabled(value) {
    this.readonly = value ? true : false;
  }

  readonly = false;

  /**
   * To get information of the input fields
   */
  @Input() toolTipInfo: string;
  @Input() name: string;

  /**
   * ANGULAR HOOK
   *
   */
  ngOnInit(): void {
    this.control =this.control ? this.control : new FormControl();
    this.readonly ? this.control.disable() : this.control.enable();
    if (this.value !== undefined) {
      this.control.setValue(this.value);
    }
    this.control.valueChanges.subscribe(
      (data) => {
          this.valueChange.emit(data);
      }
    );
  }


  /**
   * ANGULAR HOOK
   * To detect the changes from parent and update value
   * @param  changes: object contains prev and current value
   */

  ngOnChanges(changes: SimpleChanges) {
    if (!changes || !changes.value) return;
    if (changes.value.previousValue !== undefined && (changes.value.previousValue !== changes.value.currentValue)) {
      this.value = changes.value.currentValue;
    }
  }

  /**
   * Function to emit value of to parent on blur
   * @param value: value of form control
   */
  onBlur(value: string) {
    this.emitBlurEvent.emit(value);
  }
  /**
   * method to check if given control is required or not
   */
  get isRequired() {
    const validator = this.control.validator? this.control.validator({} as AbstractControl) : null;
    if (validator && validator.required)
      return true;
      return false

  }

}
