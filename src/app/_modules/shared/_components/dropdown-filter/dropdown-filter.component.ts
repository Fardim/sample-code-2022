import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { of, Subject } from 'rxjs';
import { debounceTime, map, startWith, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'pros-dropdown-filter',
  templateUrl: './dropdown-filter.component.html',
  styleUrls: ['./dropdown-filter.component.scss'],
})
export class DropdownFilterComponent implements OnInit, OnChanges, OnDestroy {
  @Input() label: string;
  @Input() placeholder: string = '';
  @Input() fontSet: string = 'mdo-icons-light';
  @Input() hint: string;

  @Input() options: any[] = [];
  @Input() labelKey: string = 'name';
  @Input() valueKey: string = 'value';
  @Input() selectedOptionsList: any[] = [];
  @Output() selectionChange: EventEmitter<any[]> = new EventEmitter();
  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();

  selected: string = '';
  filteredOptionsList = of([]);
  menuOpenedState: boolean;
  optionsControl: FormControl = new FormControl();
  constructor() {}

  ngOnInit(): void {
    this.initializeFilter();
  }

  initializeFilter() {
    this.filteredOptionsList = this.optionsControl.valueChanges.pipe(
      takeUntil(this.unsubscribeAll$),
      debounceTime(400),
      startWith(''),
      map((value: string) => this._filter(value))
    );
  }

  _filter(name: string): any[] {
    name = name?.toLowerCase() || '';
    if (!name) {
      return this.options;
    } else {
      return this.options.filter((option) => {
        const searchText = typeof name === 'string' ? name.toLowerCase() : name;
        const value = option[this.labelKey].toLowerCase();
        return value.includes(searchText);
      });
    }
  }

  emitSelectedOptions() {
    this.selectionChange.emit(this.selectedOptionsList);
  }

  get selectedLabel() {
    if (!this.selectedOptionsList?.length) {
      return '';
    }
    return this.selectedOptionsList?.length === 1
      ? this.getLabel(this.selectedOptionsList[0])
      : `${this.getLabel(this.selectedOptionsList[0])} + ${this.selectedOptionsList.length - 1}`;
  }

  getLabel(value: any) {
    value = value?.toLowerCase() || '';
    return this.options.find((opt) => opt[this.valueKey]?.toLowerCase() === value)?.[this.labelKey];
  }

  selectOption(event: boolean, option: any) {
    if (event) {
      this.selectedOptionsList.push(option[this.valueKey]);
    } else {
      this.selectedOptionsList.splice(this.selectedOptionsList.indexOf(option[this.valueKey]), 1);
    }

    this.selectedOptionsList = this.options.filter((opt) => opt[this.valueKey] === option[this.valueKey]);
  }

  get suffixIcon(): string {
    return !!this.menuOpenedState ? 'chevron-up' : 'chevron-down';
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.labelKey = changes.labelKey?.currentValue || 'name';
    this.valueKey = changes.valueKey?.currentValue || 'value';
    this.selectedOptionsList = changes.selectedOptionsList?.currentValue || [];
    if (changes.options?.currentValue && changes.options?.currentValue.length) {
      this.options = changes.options?.currentValue;
      this.initializeFilter();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
  }
}
