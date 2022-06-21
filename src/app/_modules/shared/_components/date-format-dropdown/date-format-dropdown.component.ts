import { OnInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild, OnChanges, SimpleChanges, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { debounceTime, map, startWith } from 'rxjs/operators';
import { DATE_FORMAT } from 'src/app/_constants';

@Component({
  selector: 'pros-date-format-dropdown',
  templateUrl: './date-format-dropdown.component.html',
  styleUrls: ['./date-format-dropdown.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => DateFormatDropdownComponent)
    }
  ]
})
export class DateFormatDropdownComponent implements ControlValueAccessor, OnInit, OnChanges {

  /**
   * reference to the input field
   */
  @ViewChild('optionsInput') optionsInput: ElementRef<HTMLInputElement>;

  /**
   * Hold the filtered options
   */
  filteredOptions: Observable<any[]>;

  @Input() date: Date = new Date();

  /**
   * Hold the selected value
   */
  selectedValue: any;

  /**
   * enable multiselect
   */
  @Input() multi = false;

  /**
   * enable error mode
   */
  @Input() hasError = false;

  /**
   * pass a key to identify value as a label
   */
  @Input() labelKey = 'label';

  /**
   * pass a key to identify value as a label
   */
  @Input() valueKey = 'value';

  /**
   * form field label
   */
  @Input() label = 'Date format';

  /**
   * placeholder
   */
  @Input() placeholder = 'Type to search';

  /**
   * hint for the form field
   */
  @Input() hint: string;

  /**
   * error for the form field
   */
  @Input() error: string;

  /**
   * pass a language key
   */
  @Input() i18Key: string;

  /**
   * Selected Value
   */
  @Input() value: any;

  /**
   * Selected Value
   */
  @Input() isRequired: boolean;

  /**
   * Setter for available options
   */
  @Input()
  set availableOptions(values: any[]) {
    if (values?.length) {
      this.allOptions = values;
    }
  }

  /**
   * All available options
   */
  allOptions: any[] = DATE_FORMAT;

  /**
   * Form Instance
   */
  control: FormControl = new FormControl(null);

  /**
   * Output to emit value
   */
  @Output()
  selectionChange: EventEmitter<any> = new EventEmitter();

  /**
   * To emit blur event of input to parent
   */
  @Output() afterBlur = new EventEmitter<any>();

  /**
   * onChange handler for change event
   * @param value pass the current state(string)
   */
  onChange = (value: string): void => { };

  /**
   * Register touched event
   */
  onTouched = (): void => { };

  constructor() { }

  ngOnInit(): void {
    if (this.allOptions.length) {
      this.initializeAutocomplete();
    }
  }

  /**
   * Method gets called when formcontrol value changes
   * inside a formGroup
   * @param val Pass the current value(string)
   */
  writeValue(val: string): void {
    this.setSelectedValue(val);
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
   * Method to emit blur event
   */
  registerOnBlur(): void {
    const val = typeof this.control.value === 'object' && this.control.value ?
      this.control.value[this.valueKey]: '';
      this.onChange(val);
      this.afterBlur.emit(val);
  }

  /**
   * Initialize Autocomplete
   */
  initializeAutocomplete(): void {
    this.filteredOptions = this.control.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map((searchTerm: string | null) => searchTerm ? this._filter(searchTerm) : this.allOptions.slice()));

    this.setSelectedValue(this.value);
  }

  /**
   * mehtod to filter items based on the search term
   * @param value searchTerm
   * @returns any[]
   */
  _filter(value: any): any[] {
    const filterValue = typeof value === 'string' ? value.toLowerCase() : typeof value === 'number' ? value : '';

    return this.allOptions.filter(opt => `${opt[this.labelKey]}`.toLowerCase().includes(`${filterValue}`));
  }

  /**
   * get display value for autocomplete
   * @param value pass the selected value Object
   * @returns the field label
   */
  formatValue(value: any): string {
    if (value) {
      return value[this.labelKey] ? value[this.labelKey] : value[this.valueKey];
    }
  }

  /**
   * emit the selected value
   * @param value pass the value
   */
  emitSelectedValue(value: any) {
    this.onChange(value[this.valueKey]);
    this.selectionChange.emit(value[this.valueKey]);
    this.selectedValue = value[this.valueKey];
  }

  setSelectedValue(value: any) {
    if (!value) { return; };

    const selected: any = this.allOptions.find((option) => `${option[this.valueKey]}` === `${value}`);
    this.control.setValue(selected);
  }

  /**
   * sets dropdown current state
   * @param el mat auto complete element
   * @returns icon name
   */
   getDropdownPos(el: MatAutocomplete) {
    let pos = 'chevron-down';
    try {
      if (el && el.isOpen) {
        pos = 'chevron-up';
      }
    } catch (e) {
      console.log(e);
    }

    return pos;
  }

  ngOnChanges(changes: SimpleChanges) {
    const selected = changes.value?.currentValue;
    if (selected) { this.setSelectedValue(selected); }
    if (changes.isRequired &&
      changes.isRequired.previousValue !== changes.isRequired.currentValue) {
      this.isRequired = changes.isRequired.currentValue;
    }
  }
}
