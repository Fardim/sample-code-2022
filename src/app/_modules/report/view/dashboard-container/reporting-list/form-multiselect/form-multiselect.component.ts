import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ChangeDetectionStrategy, OnChanges, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DisplayCriteria, DropDownValues } from '@modules/report/_models/widget';
import { ReportService } from '@modules/report/_service/report.service';
import { Subscription } from 'rxjs';
import { debounceTime, startWith } from 'rxjs/operators';

@Component({
  selector: 'pros-form-multiselect',
  templateUrl: './form-multiselect.component.html',
  styleUrls: ['./form-multiselect.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class FormMultiselectComponent implements OnInit, OnChanges, OnDestroy {

  constructor(private reportService: ReportService) { }


  /**
   * Define an indiviual form control
   */
  @Input() control: FormControl;

  /**
   * Getting placeholder from parent
   */
  @Input() placeholder: string;

  @Input() displayCriteria: string;

  @Input() isTableFilter = 'false';

  /**
   * To emit value change of input to parent
   */
  @Output() valueChange = new EventEmitter<object>();

  @Input() value: [] = [];

  @Input() formFieldId: string;

  selectedMultiSelectData = [];

  optionList: DropDownValues[] = [];

  subscription: Subscription[] = [];
  /**
   * ANGULAR HOOK
   *
   */
  ngOnInit(): void {
    if (!this.control) {
      this.control = new FormControl();
    }
    this.control.valueChanges.pipe(startWith(''), debounceTime(500)).subscribe(res => {
      if (typeof (res) === 'string' || res === null) {
        this.getDropDownValue(res);
      }
    })
  }

  /**
   * ANGULAR HOOK
   * To detect the changes from parent and update value
   * @param  changes: object contains prev and current value
   */

  ngOnChanges(changes: SimpleChanges) {
    if (changes.value && changes.value.previousValue !== changes.value.currentValue) {
      this.selectedMultiSelectData = [];
      if (changes.value.currentValue && changes.value.currentValue.length) {
        changes.value.currentValue.forEach(item => {
          if (typeof (item) === 'string') {
            this.selectedMultiSelectData.push({ [item]: null });
          } else {
            this.selectedMultiSelectData.push({ [item.CODE]: item.TEXT })
          }
        })
      } else {
        if (this.isTableFilter === 'true')
          this.displayMultiselectedText();
      }
    }

  }

  /**
   *
   * @param searchText string to search
   */
  getDropDownValue(searchText?) {
    if (!this.formFieldId) {
      return;
    }
    const sub = this.reportService.getDropDownValues(this.formFieldId, searchText).subscribe(res => {
      this.optionList = res;
      if (this.isTableFilter === 'true' && this.selectedMultiSelectData.length) {
        this.selectedMultiSelectData.forEach(item => {
          const value = Object.values(item)[0];
          if (value === null) {
            const key = Object.keys(item)[0];
            const selectedValue = this.optionList.find(el => el.CODE === key);
            item[key] = selectedValue.TEXT;
          }
        })
        this.displayMultiselectedText();
      }
    })
    this.subscription.push(sub)
  }

  /**
   * apply filter and emit the output event
   */
  applyFilter() {
    if (this.isTableFilter === 'true') {
      this.displayMultiselectedText();
    }
    const selectedDataList = this.getSelectedData();
    const response = {
      formFieldId: this.formFieldId,
      value: selectedDataList
    }
    this.valueChange.emit(response);
  }

  /**
   * Method to handle when values are selected from multi select drop down
   * @param fieldId field id of the column
   * @param key key of the selected option
   * @param value value of the selected option
   */
  selectionChangeHandler(key: string, value: string) {
    if (this.selectedMultiSelectData) {
      const index = this.selectedMultiSelectData.findIndex(item => {
        const selectedKey = Object.keys(item)[0];
        return selectedKey === key;
      });
      if (index > -1) {
        this.selectedMultiSelectData.splice(index, 1);
      }
      else {
        this.selectedMultiSelectData.push({ [key]: value });
      }
    } else {
      this.selectedMultiSelectData = [{ [key]: value }];
    }

  }

  /**
   * check that whether checkbox is checked or not
   * @param code value of the checkbox
   * @returns return checked property of option
   */
  isChecked(code: string): boolean {
    if (Object.keys(this.selectedMultiSelectData).length === 0) {
      return false;
    }
    if (this.selectedMultiSelectData && this.selectedMultiSelectData) {
      const index = this.selectedMultiSelectData.findIndex(item => {
        return Object.keys(item)[0] === code;
      });
      if (index > -1) {
        return true;
      }
    }
  }

  /**
   *
   * @param option value of dropDown option
   * @returns returns the string to display on check box label
   */
  getLabel(option) {
    if (this.displayCriteria === 'CODE_TEXT') {
      return option.CODE + '-' + option.TEXT
    } else if (this.displayCriteria === 'CODE') {
      return option.CODE;
    } else {
      return option.TEXT;
    }
  }

  /**
   * display the selected text
   */
  displayMultiselectedText() {
    const inputWrapper = document.getElementById(this.formFieldId);
    const textWrapper = document.getElementById('input-' + this.formFieldId);
    textWrapper.innerHTML = '';
    const selectedValues = [];
    let additionalLength = 0;
    this.selectedMultiSelectData.forEach(item => {
      const value = Object.values(item)[0];
      const code = Object.keys(item)[0];
      const previousText = textWrapper.innerHTML;
      if (inputWrapper.offsetWidth - textWrapper.offsetWidth > 50) {
        if (this.displayCriteria === DisplayCriteria.CODE) {
          textWrapper.innerHTML = textWrapper.innerHTML + code + ';';
        } else if (this.displayCriteria === DisplayCriteria.CODE_TEXT) {
          textWrapper.innerHTML = textWrapper.innerHTML + code + '-' + value + ';'
        } else {
          textWrapper.innerHTML = textWrapper.innerHTML + value + ';';
        }
        selectedValues.push(value);
      }
      if (inputWrapper.offsetWidth - textWrapper.offsetWidth < 0) {
        textWrapper.innerHTML = previousText;
        selectedValues.pop();
      }
    })
    additionalLength = this.selectedMultiSelectData.length - selectedValues.length;
    const additionalCount = document.getElementById('additional-' + this.formFieldId);
    if (additionalCount) {
      additionalCount.innerHTML = '';
    }
    if (additionalLength) {
      additionalCount.innerHTML = ' +' + additionalLength;
    }
  }

  /**
   * Angular Hook
   */
  ngOnDestroy() {
    this.subscription.forEach(sub => {
      sub.unsubscribe();
    })
  }

  getSelectedData(): DropDownValues[] {
    const selectedDataList = []
    this.selectedMultiSelectData.forEach(el => {
      const code = Object.keys(el)[0]
      const selectedData = this.optionList.find(item => item.CODE === code);
      const data = { CODE: selectedData.CODE, TEXT: selectedData.TEXT };
      selectedDataList.push(data);
    })
    return selectedDataList;
  }
}
