import { OnInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild, OnChanges, SimpleChanges, forwardRef, Inject, LOCALE_ID } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CoreService } from '@services/core/core.service';
import { Observable } from 'rxjs';
import { debounceTime, startWith } from 'rxjs/operators';

export interface DatasetModules {
  moduleName: string;
  moduleId: number;
}

@Component({
  selector: 'pros-dataset-search',
  templateUrl: './dataset-search.component.html',
  styleUrls: ['./dataset-search.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => DatasetSearchComponent)
    }
  ]
})
export class DatasetSearchComponent implements ControlValueAccessor, OnInit, OnChanges {

  /**
   * Loader indication for search
   */
  searchLoader = false;

  /**
   * reference to the input field
   */
  @ViewChild('optionsInput') optionsInput: ElementRef<HTMLInputElement>;

  /**
   * Hold the filtered options
   */
  filteredOptions: any[];

  /**
   * enable multiselect
   */
  @Input() multi = false;

  /**
   * enable multicheck
   */
   @Input() multiCheck = false;

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
  @Input() label = 'value';

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
   * Label tooltip
   */
  @Input() tooltip: string;

  /**
   * Setter for available options
   */
  @Input()
  set availableOptions(values: any[]) {
    if (values?.length) {
      this.allOptions = values;
      this.initializeAutocomplete();
      this.setSelectedValue(this.value);
    }
  }

  /**
   * All available options
   */
  allOptions: any[] = [];

  /**
   * All selected options
   */
   selectedOptions: any[] = [];

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

  constructor(@Inject(LOCALE_ID) public locale: string, private coreService: CoreService) {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
  }

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
    this.filteredOptions = this.allOptions;
    this.control.valueChanges.pipe(
        startWith(''),
        debounceTime(300))
        .subscribe(value => {
          if(value){
            this.searchDatasetModules(value).subscribe((res) => {
              this.filteredOptions = res;
            });
          }
        });
  }

  searchDatasetModules(searchTerm = ''): Observable<any[]> {
    const body = {
      lang: this.locale,
      fetchsize: 20,
      fetchcount: 0,
      description: !!searchTerm && typeof searchTerm === 'string'? searchTerm.toLowerCase(): '',
    };

    return new Observable((observer) => {
      this.searchLoader = true;
      if(!searchTerm) {
        this.searchLoader = false;
        this.filteredOptions = this.allOptions;
        observer.next(this.allOptions);
        return;
      }
      return this.coreService.searchAllObjectType(body).subscribe((response) => {
        return !response?.length ? (() => {
          observer.next([]);
          this.searchLoader = false;
        }) : observer.next(response.map((module) => {
          this.updateAllOptions(module);
          return {
            moduleId: module.moduleId,
            moduleName: module.moduleDesc,
          }
        }));
      }, err => {
        this.searchLoader = false;
        console.error('error while searching modules', err);
        observer.next([]);
      });
    });
  }

  updateAllOptions(module: any) {
    const isExist = this.allOptions.find((option) => option.moduleId === module.moduleId);
    if(!isExist) {
      this.allOptions.push({
        moduleName: module.moduleDesc,
        moduleId: module.moduleId
      });
    }
  }

  /**
   * get display value for autocomplete
   * @param value pass the selected value Object
   * @returns the field label
   */
  formatValue(value: any): string {
    if (value && !this.multiCheck) {
      return value[this.labelKey] ? value[this.labelKey] : value[this.valueKey];
    }
  }

  /**
   * emit the selected value
   * @param value pass the value
   */
  emitSelectedValue(value: any) {
    if(this.multiCheck){
      if (this.selectedOptions.indexOf(value[this.valueKey]) == -1) {
        this.selectedOptions.push(value[this.valueKey]);
      } else {
        this.selectedOptions.splice(this.selectedOptions.indexOf(value[this.valueKey]), 1);
      }
     this.selectionChange.emit(this.selectedOptions);
    }else{
      this.onChange(value[this.valueKey]);
      this.selectionChange.emit(value[this.valueKey]);
    }
  }

  remove(value: any) {
    this.selectedOptions.splice(this.selectedOptions.indexOf(value), 1);
  }

  setSelectedValue(value: any) {
    if (!value) { return; };

    const selected: any = this.allOptions.find((option) => `${option[this.valueKey]}` === `${value}`);
    this.control.setValue(selected);
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
