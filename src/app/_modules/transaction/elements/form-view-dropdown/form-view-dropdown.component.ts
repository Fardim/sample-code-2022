import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { ListValue, ListValueResponse } from '@models/list-page/listpage';
import { TransactionDropdownAddNewValue, TransactionMaterialDescName } from '@modules/transaction/model/transaction';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import { RuleService } from '@services/rule/rule.service';
import { debounce } from 'lodash';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'pros-form-view-dropdown',
  templateUrl: './form-view-dropdown.component.html',
  styleUrls: ['./form-view-dropdown.component.scss']
})
export class FormViewDropdownComponent implements OnInit, OnChanges {

  @Input() moduleId: string;
  @Input() fieldCtrl;
  @Input() isFieldReadOnly = false;
  @Input() useFrom: string;
  @Input() availableOptions: Array<ListValue>;
  @Input() preselectedOptions: ListValue[] = [];
  @ViewChild('optionsInput') optionsInput: ElementRef<HTMLInputElement>;
  @ViewChild('autocompleteTrigger') matACTrigger: MatAutocompleteTrigger;
  transactionMaterialDescName = TransactionMaterialDescName;
  selectedOptions: ListValue[] = [];
  optionList: Observable<Array<ListValue>> = of([]);
  optionsLoadingRequired = true;
  /**
   * Trigger function to open side sheet
   */
  @Output()
  openSideSheet: EventEmitter<any> = new EventEmitter<any>();
  /**
   * Search the dropdown options..
   */

  @Output() valueChange: EventEmitter<ListValue[]> = new EventEmitter<any>();
  delayedCallWithTransLib = debounce((searchText: string) => {
    this.getOptions(searchText);
  }, 400);
  constructor(
    private ruleService: RuleService,
    public transService: TransactionService
  ) { }


  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes.preselectedOptions && changes.preselectedOptions.previousValue !== changes.preselectedOptions.currentValue) {
      this.selectedOptions = changes.preselectedOptions.currentValue || [];
      setTimeout(() => {
        if(this.fieldCtrl && !this.fieldCtrl.isCheckList && this.optionsInput) {
          if(changes.preselectedOptions.currentValue?.length) {
            this.optionsInput.nativeElement.value = changes.preselectedOptions.currentValue[0].text;
          }
        }
      }, 100);
    }
  }

  ngOnInit(): void { }

  /**
   * Search the transformation rule ...
   * @param searchStr search the rule based on this params
   */
  searchOption(searchStr: string) {
    this.delayedCallWithTransLib(searchStr);
  }
  /**
   * get options values for autocomplete
   * @param str pass the search string
   */
  getOptions(str: string, dependentParents = {}): void {
    if (this.availableOptions && this.availableOptions.length > 0) {
      this.optionList = of(this.availableOptions);
    } else {
      this.optionsLoadingRequired = false;
      const dto: { searchString: string; parent: any } = {
        searchString: str,
        parent: dependentParents
      };
      const locale = this.transService.getLocale();
      this.ruleService.getDropvals(this.moduleId, this.fieldCtrl.fieldId, locale, dto).subscribe((resp: ListValueResponse) => {
        if (resp && resp.content)
          this.optionList = of(resp.content);
        else
          this.optionList = of([]);
      }, (error) => console.error(`Error : ${error.message}`));
    }
  }

  inputFocus() {
    if (this.optionsLoadingRequired) {
      this.getOptions('',);
    }
    console.log('input focus');
  }

  /**
   * get display value for autocomplete
   * @param value pass the selected value Object
   * @returns the field label
   */
  formatValue(value: ListValue): string {
    if (value) {
      return value.text;
    }
  }

  selected(event: MatAutocompleteSelectedEvent, isSingleSelect: boolean): void {
    const selectedObj = event.option.value;
    // this.control.setValue(selectedObj);
    if (selectedObj !== TransactionDropdownAddNewValue) {
      if (isSingleSelect) {
        this.selectedOptions = [selectedObj];
        this.optionsInput.nativeElement.value = selectedObj.text;
      } else {
        if (selectedObj) {
          if (this.selectedOptions.find(obj => obj.code === selectedObj.code)) {
            this.selectedOptions = [...this.selectedOptions.filter(obj => obj.code !== selectedObj.code)];
          } else {
            this.selectedOptions.push(selectedObj);
          }

          this.clear(true);
        } else {
          // clear selection
          this.selectedOptions = [];
          requestAnimationFrame(() => {
            this.openAuto(this.matACTrigger);
          });
        }
      }

      // this.control.patchValue(this.selectedOptions);
      this.valueChange.emit(this.selectedOptions);

    } else if (selectedObj === TransactionDropdownAddNewValue && this.useFrom === TransactionMaterialDescName) {
      this.openSideSheet.emit({
        fieldId: this.fieldCtrl.fieldId
      });
    }

  }

  clear(openDropdown: boolean): void {
    this.optionsInput.nativeElement.value = '';
    // this.control.setValue('');
    if (openDropdown) {
      // keep the autocomplete opened after each item is picked.
      requestAnimationFrame(() => {
        this.openAuto(this.matACTrigger);
      });
    } else {
      this.selectedOptions = [];
      // this.control.patchValue([]);
      this.valueChange.emit([]);
    }
  }

  openAuto(trigger: MatAutocompleteTrigger): void {
    trigger.openPanel();
    this.optionsInput.nativeElement.focus();
  }

  isItemChecked(selObj: ListValue): boolean {
    const dataObj = this.selectedOptions.find(obj => obj.code === selObj.code);
    return dataObj ? true : false;
  }

  remove(index: number): void {
    if (index >= 0) {
      this.selectedOptions.splice(index, 1);
      // this.control.patchValue(this.selectedOptions);
      this.valueChange.emit(this.selectedOptions);
    }
  }

}
