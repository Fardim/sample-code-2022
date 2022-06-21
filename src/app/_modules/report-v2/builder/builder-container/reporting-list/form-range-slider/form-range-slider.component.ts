import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, SimpleChanges, OnChanges } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import { isEqual } from 'lodash';

@Component({
  selector: 'pros-form-range-slider',
  templateUrl: './form-range-slider.component.html',
  styleUrls: ['./form-range-slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class FormRangeSliderComponent implements OnInit, OnChanges {

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
   * To emit value change of radio to parent
   */
  @Output() valueChange = new EventEmitter<object>();


  @Input() formFieldId: string;

  @Input() isFilterWidget: boolean;

  /**
   * that holds the pre selected values of range slider
   */
  @Input() preSelectedValue: any;
  minValue = 0;
  maxValue = 0;
  highValue = 10000000;
  lowerValue = 0;
  subscription: Subscription[] = [];
  fltrCtrl: FormControl = new FormControl();
  regex = '[0-9]{1,}[-]{0,1}[0-9]{0,}';
  appliedValueCtrl: FormControl = new FormControl();
  /**
   * that holds info that whether apply button is clicked or not
   */
  isBtnClicked: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  /**
   * ANGULAR HOOK
   *
   */

  ngOnInit(): void {
    if (!this.control) {
      this.control = new FormControl({ min: 0, max: 0 });
    } else if (!this.control.value) {
      this.control.setValue({ min: 0, max: 0 })
    }
    if (this.control.value) {
      this.fltrCtrl.setValue(this.getSelectedRangeValue());
      if (this.control.value.max)
        this.appliedValueCtrl.setValue(`${this.control.value.min} - ${this.control.value.max}`);
      this.maxValue = this.control.value.max;
      this.minValue = this.control.value.min;
    }

    if (this.appliedValueCtrl.value && this.preSelectedValue) {
      this.control.setValue({ min: this.preSelectedValue.min, max: this.preSelectedValue.max })
      this.fltrCtrl.setValue(this.getSelectedRangeValue());
      this.maxValue = this.preSelectedValue.max;
      this.minValue = this.preSelectedValue.min;
    }

    this.fltrCtrl.setValidators(Validators.pattern(this.regex));
    this.fltrCtrl.updateValueAndValidity();

    this.fltrCtrl.valueChanges.subscribe(res => {
      if (res) {
        const values = res.split('-');
        let minValue;
        let maxValue;
        if (values.length > 1) {
          minValue = values[0];
          maxValue = values[1];
        } else {
          maxValue = values[0];
        }
        this.minValue = Number(minValue);
        this.maxValue = Number(maxValue);
        this.control.setValue({ min: Number(minValue), max: Number(maxValue) })
      }
    })

    /**
     * observable that subscribes when apply button clicked
     */
    this.isBtnClicked.subscribe(res => {
      if (res) {
        if (this.control.value)
          if (!isNaN(this.minValue))
            this.appliedValueCtrl.setValue(`${this.minValue} - ${this.maxValue}`);
          else
            this.appliedValueCtrl.setValue(`0-${this.maxValue}`);
        else
          this.appliedValueCtrl.reset();
      }
    })
  }

  /**
   * angular hooks
   * To detect the changes from parent and update value
   * @param changes: object contains prev and current value
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes.control && changes.control.previousValue !== undefined && !isEqual(changes.control.previousValue, changes.control.currentValue)) {
      this.appliedValueCtrl.setValue(`${changes.control.currentValue.min} - ${changes.control.currentValue.max}`)
    }
    if (changes.preSelectedValue && !isEqual(changes.preSelectedValue.previousValue, changes.preSelectedValue.currentValue)) {
      if (!changes.preSelectedValue.currentValue) {
        this.appliedValueCtrl.setValue(null);
        this.control.setValue({ min: 0, max: 0 });
      }
      else {
        // if (!changes.preSelectedValue.previousValue) {
        this.preSelectedValue = changes.preSelectedValue.currentValue;
        if (!isNaN(this.preSelectedValue.min)) {
          this.appliedValueCtrl.setValue(`${this.preSelectedValue.min}-${this.preSelectedValue.max}`);
        } else if (this.preSelectedValue.max) {
          this.appliedValueCtrl.setValue(`0-${this.preSelectedValue.max}`);
        }
        // }
        if (this.control)
          this.control.setValue(changes.preSelectedValue.currentValue);
      }
    }

    if (changes.formFieldId && changes.formFieldId.previousValue !== undefined && changes.formFieldId.previousValue !== changes.formFieldId.currentValue) {
      this.formFieldId = changes.formFieldId.currentValue;
    }
  }

  /**
   * method called on apply button emits the value change event on parent class
   */
  applyFilter() {
    if (this.fltrCtrl.valid && (this.control.value.min < this.control.value.max) || (!this.control.value.min && this.control.value.max)) {
      const response = {
        formFieldId: this.formFieldId,
        value: this.control.value
      }
      this.isBtnClicked.next(true);
      this.valueChange.emit(response);
    }
  }


  /**
   * return the selected range value
   * @returns selected value of the range slider
   */
  getSelectedRangeValue(): string | number {
    if (this.control.value) {
      const min = this.control.value.min;
      const max = this.control.value.max;
      if (min !== null && min >= 0 && max) {
        return min + '-' + max;
      } else {
        return min ? min.toString() : max ? max.toString() : '';
      }
    }
    else return '';
  }

  /**
   * check whether the input is valid or not
   * @returns whether the input value is valid
   */
  isInValidInput() {
    if (this.fltrCtrl.hasError('pattern')) {
      return true;
    } else if (this.control.value?.min > this.control.value?.max) {
      return true;
    } else {
      return false;
    }
  }
}
