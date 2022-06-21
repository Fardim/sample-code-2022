import { OnInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { LookupFields } from '@models/schema/schemadetailstable';
import { Observable } from 'rxjs';
import { debounceTime, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'pros-option-filter',
  templateUrl: './option-filter.component.html',
  styleUrls: ['./option-filter.component.scss']
})
export class OptionFilterComponent implements OnInit, OnChanges {

  /**
   * reference to the input field
   */
  @ViewChild('optionsInput') optionsInput: ElementRef<HTMLInputElement>;

  /**
   * Hold the filtered options
   */
  filteredOptions: Observable<any[]>;

  /**
   * Setter for available options
   */
  @Input()
  set availableOptions(values: LookupFields[]) {
    if(values?.length) {
      this.allOptions = values;
      this.initializeAutocomplete();
    }
  }
  /**
   * All available options
   */
  allOptions: LookupFields[] = [];

  /**
   * Selected Value
   */
  @Input()
  value: any;

  /**
   * Input field Placeholder
   */
  @Input()
  placeholder: string = 'Type to search';

  /**
   * Output to emit value
   */
  @Output()
  selectionChange: EventEmitter<any> = new EventEmitter();

  /**
   * Output to emit value
   */
   @Output()
   inputBlur: EventEmitter<any> = new EventEmitter();

  /**
   * Form Instance
   */
  optionCtrl: FormControl = new FormControl('');

  constructor() { }

  ngOnInit(): void {}

  /**
   * Initialize Autocomplete
   */
  initializeAutocomplete(): void {
    this.filteredOptions = this.optionCtrl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map((searchTerm: string | null) => searchTerm ? this._filter(searchTerm) : this.allOptions.slice()));

    this.setPreSelectedValue();
  }

  /**
   * Set default/pre-selected value
   */
  setPreSelectedValue() {
    const selected: LookupFields = this.allOptions.find((option) => option.fieldId === this.value);
    this.optionCtrl.setValue(selected);
  }

  /**
   * mehtod to filter items based on the search term
   * @param value searchTerm
   * @returns any[]
   */
  _filter(value: any): any[] {
    const filterValue = typeof value === 'string'? value.toLowerCase() : '';

    return this.allOptions.filter(opt => opt.fieldDescri.toLowerCase().includes(filterValue));
  }

  /**
   * get display value for autocomplete
   * @param value pass the selected value Object
   * @returns the field label
   */
   formatValue(value: any): string {
    if(value) {
      return value.fieldDescri? value.fieldDescri: value.fieldId;
    }

    return '';
  }

  /**
   * emit the selected value
   * @param value pass the value
   */
  emitSelectedValue(value: any) {
    this.selectionChange.emit(value.fieldId);
  }

  /**
   * emit the input value
   * @param value pass the value
   */
   emitInputValue(e: any) {
    this.inputBlur.emit(e.target.value);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.value?.currentValue) {
      this.value = changes.value.currentValue;
      this.setPreSelectedValue();
    }
  }
}
