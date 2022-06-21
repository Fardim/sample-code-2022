import { Component, ElementRef, EventEmitter, forwardRef, Input, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import {ENTER} from '@angular/cdk/keycodes';
import { TransientService } from 'mdo-ui-library';

@Component({
  selector: 'pros-chips-input',
  templateUrl: './chips-input.component.html',
  styleUrls: ['./chips-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => ChipsInputComponent)
    }
  ]
})
export class ChipsInputComponent implements ControlValueAccessor {

  /**
   * Pass the label to display
   */
  @Input()
  label: string;

  /**
   * Pass the hint to display
   */
  @Input()
  hint: string;

  /**
   * Pass the error text to display
   */
  @Input()
  error: string;

  /**
   * Pass the placeholder to display
   */
  @Input()
  placeholder: string;

  /**
   * Pass the values to pre-select
   */
  @Input()
  selectedValues: string[] = [];

  /**
   * Create a form control instance
   */
  control = new FormControl();

  /**
   * emit event with the changed values
   */
  @Output() valueChange: EventEmitter<string[]> = new EventEmitter(null);

  /**
   * reference to the input element
   */
  @ViewChild('inputEl') inputEl: ElementRef;

  /**
   * onChange handler for change event
   * @param value pass the current state(string)
   */
  onChange = (value: any): void => { };

  /**
   * Register touched event
   */
  onTouched = (): void => { };

  constructor(private transient: TransientService) { }

  /**
   * Add tags on key press
   * @param event key up event
   * @returns void
   */
  afterKeyPress(event: any): void {
    if(event.keyCode === ENTER && this.control.value) {
      if(this.selectedValues.indexOf(this.control.value) > -1) {
        this.transient.open('Value exists');
        return;
      }

      this.selectedValues.push(this.control.value.trim());
      this.inputEl.nativeElement.value = '';
      this.control.setValue(null);
    }

    if(event.keyCode === 8 && this.selectedValues.length && !this.control.value) {
      const value = this.selectedValues[this.selectedValues.length - 1];
      this.control.setValue(value);
      this.remove(this.selectedValues[this.selectedValues.length - 1]);
    }

    this.emitValueChange();
  }

  /**
   * Method gets called when formcontrol value changes
   * inside a formGroup
   * @param val Pass the current value(any)
   */
  writeValue(val: any): void {
    if(val) {
      Array.isArray(val)? this.selectedValues = val : this.selectedValues.push(val);
    }
  }

  /**
   * Angular method to register the change event
   * to be active only inside a formGroup
   * @param onChange function passed on change
   */
  registerOnChange(onChange: (value: any) => void): void {
    this.onChange = onChange;
  }

  /**
   * Angular method to register the touched event
   * to be active only inside a formGroup
   * @param fn function passed on touched
   */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /**
   * Method to emit value change event
   */
  emitValueChange(): void {
    this.onChange(this.selectedValues);
    this.valueChange.emit(this.selectedValues);
  }

  /**
   * remove the selected value
   * @param num selected value
   */
  remove(num: string): void {
    this.selectedValues.splice(this.selectedValues.indexOf(num), 1);
  }
}
