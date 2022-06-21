import { Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';
import { isEqual } from 'lodash';

@Component({
  selector: 'pros-form-input-autoselect',
  templateUrl: './form-input-autoselect.component.html',
  styleUrls: ['./form-input-autoselect.component.scss']
})
export class FormInputAutoselectComponent implements OnInit, OnChanges {

  /**
   * array of options to show in the dropdown
   */
  @Input()
  updatedOptionsList: any[] = [];

  /**
   * local variable for holding the filtered options
   */
  optionList: any[] = [];

  /**
   * this key is used to get the value from the selected item
   * if the item is an object
   */
  @Input()
  valueKey: string;

  /**
   * this key is used to get the tooltip from the selected item
   * if the item is an object
   */
  @Input()
  tooltipKey: string;

  /**
   * this key is used to get the label from the selected item
   * if the item is an object
   */
  @Input()
  labelKey: string;

  /**
   * hold or pass the preselected values
   */
  @Input()
  preSelectedValue: any;

  /**
   * Define the action that will happen when
   * selecting the extra option in the list
   */
  @Input()
  viewMoreAction: string;

  /**
   * Define the action that will happen when
   * the extra button at the end of the input
   * gets clicked
   */
  @Input()
  extraOption: string;

  /**
   * Define the label show for the extra option at
   * the end of the list
   */
  @Input()
  extraOptionLabel: string;

  /**
   * whether values are loading
   */
  @Input()
  loader = false;

  /**
   * Preferred deounce value for getting the searchTerm
   */
  @Input()
  debounceValue = 400;

  /**
   * Define the field label
   */
  @Input()
  fieldLabel: string;

  /**
   * To show/hide extra action level at bottom
   */
  @Input()
  isExtraLabel = true;

  /**
   * To show/hide Suffix button at the right side of input
   */
  @Input()
  isSuffixButton = true;

  /**
   * Disable internal filter
   */
  @Input()
  disableInternalFilter = false;

  /**
   * highlight error
   */
  @Input()
  hasError = false;

  /**
   * Event emitter for the selected option
   */
  @Output()
  optionSelectedEmit: EventEmitter<any> = new EventEmitter(null);

  /**
   * Event emitter for extra button at the end of the input
   */
  @Output()
  openCustomDialog: EventEmitter<any> = new EventEmitter(null);

  /**
   * Event emitter to emit event while searching..
   */
  @Output()
  emitSearchValue: EventEmitter<any> = new EventEmitter(null);

  /**
   * Event emitter to emit event on click extra label
   */
  @Output()
  emitExtraLabelClick: EventEmitter<any> = new EventEmitter(null);

  /**
   * reference to the input
   */
  @ViewChild('textInput') textInput: ElementRef;

  /**
   * Observable for filtered option
   * used to filter results as a search term is typed
   */
  filteredOptions: Observable<any[]>;

  /**
   * Form control for the input field
   */
  selectedMdoFldCtrl: FormControl;

  /**
   * option that holds a value to identify if the results array is empty
   */
  hasResult: boolean;

  /**
   * emit options container scroll end
   */
  @Output()
  emitScrollEnd: EventEmitter<boolean> = new EventEmitter();


  /**
   * Constructor of class
   */
  constructor() {
    this.selectedMdoFldCtrl = new FormControl();
   }

  /**
   * get the value using the key passed as an input to this component
   * @param option pass dropdown options object
   */
  getValue(option){
    if(this.valueKey && option[this.valueKey]) {
      return option[this.valueKey];
    } else {
      return option;
    }
  }

  /**
   * get the label using the key passed as an input to this component
   * @param option pass dropdown options object
   */
  getLabel(option) {
    if(option[this.labelKey]) {
      return option[this.labelKey];
    }
  }

  /**
   * get the tooltip using the key passed as an input to this component
   * @param option pass dropdown options object
   */
  getTooltipText(option) {
    if(option[this.tooltipKey]) {
      return option[this.tooltipKey];
    }
  }


  /**
   * ANGULAR HOOK
   */
  ngOnInit(): void {
    this.selectedMdoFldCtrl.valueChanges
    .pipe(debounceTime(this.debounceValue))
    .subscribe((value) => {
      this.emitSearchValue.emit(value);
    });

    this.optionList = this.updatedOptionsList;
    if(!this.disableInternalFilter) {
      this.initFilter();
    } else {
      this.filteredOptions = of(this.optionList);
      this.hasResult = !!this.optionList.length;
    }
  }

  initFilter() {
    this.filteredOptions = this.selectedMdoFldCtrl.valueChanges.pipe(
      debounceTime(400),
      startWith(''),
      map(value => this._filter(value))
    );
  }

  /**
   * method to filter dropdown values based on the typed string
   * @param value pass the value to be looked up in the list of values
   */
  _filter(value: any): any[] {
    let availableOptions = this.optionList;
    if(value){
      const filterValue = (isNaN(value) && typeof value === 'string')? value.toLowerCase(): value;

      availableOptions = this.optionList.filter(option => this.getLowerCaseLabel(option[this.labelKey]).indexOf(filterValue) === 0);
    }
    this.hasResult = availableOptions.length>0;
    return availableOptions;
  }

  /**
   * convert string to lowercase
   * @param value pass the string to be converted to lowercase
   */
  getLowerCaseLabel(value) {
    return value? value.toLowerCase(): '';
  }

  /**
   * method to prevent re rendering in a list
   * @param fld track by for performance improvement
   */
  suggestedMdoFldTrkBy(fld): string {
    if (fld) {
      return fld[this.valueKey];
    }
    return null;
  }

  /**
   * method to show consistent selected values
   * @param object pass object from which the value should be displayed
   */
  mdoFieldDisplayWith(object): string {
    return object ? object[this.labelKey] : '';
  }

  /**
   * emit the selected values
   * @param sel selected option or action
   */
  emitOptionSelected(event: any) {
    let action: string;
    this.initFilter();
    this.textInput.nativeElement.blur();
    if(event && event.option){
      action = event.option.value
    } else {
      action = event;
    }

    if(action === this.viewMoreAction || action === this.extraOption){
      this.openCustomDialog.emit(action);
    } else {
      this.optionSelectedEmit.emit(action);
    }
  }

  /**
   * Function to emit event on click extra label
   */
  emitClickEvent() {
    this.emitExtraLabelClick.emit();
  }


  /**
   * ANGULAR HOOK
   * It will be called when value of @Input changes from parent component.
   * @param changes: Object of type SimpleChanges
   */
  ngOnChanges(changes: SimpleChanges) {
    const preVal = 'previousValue';

    if(changes.updatedOptionsList) {
      if(changes.updatedOptionsList[preVal] && !isEqual(changes.updatedOptionsList[preVal], changes.updatedOptionsList.currentValue)){
        if(changes.updatedOptionsList.currentValue) {
          this.optionList = changes.updatedOptionsList.currentValue;
          if(!this.disableInternalFilter) {
            this.initFilter();
          } else {
            this.filteredOptions = of(this.optionList);
            this.hasResult = !!this.optionList.length;
          }
        }
      }
    }

    if (changes?.preSelectedValue) {
      this.preSelectedValue = changes?.preSelectedValue?.currentValue;
      this.selectedMdoFldCtrl.setValue(this.preSelectedValue);
    }

    if(changes.loader && changes.loader[preVal] !== changes.loader.currentValue) {
      this.loader = changes.loader.currentValue;
    }
  }

  /**
   * on options container scroll end
   */
   onScrollEnd(event) {
    console.log(event);
    this.emitScrollEnd.emit(true);
  }
}
