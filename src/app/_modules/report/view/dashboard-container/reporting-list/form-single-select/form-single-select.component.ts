import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DropDownValues } from '@modules/report/_models/widget';
import { ReportService } from '@modules/report/_service/report.service';
import { Subscription } from 'rxjs';
import { debounceTime, startWith } from 'rxjs/operators';

@Component({
  selector: 'pros-form-single-select',
  templateUrl: './form-single-select.component.html',
  styleUrls: ['./form-single-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class FormSingleSelectComponent implements OnInit, OnChanges {

  constructor(private reportService: ReportService) { }


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
   * To emit value change of input to parent
   */
  @Output() valueChange = new EventEmitter<object>();

  @Input() formFieldId: string;

  @Input() displayCriteria: string;

  @Input() isTableFilter : string;

  optionList: DropDownValues[];

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
      if (typeof (res) === 'string') {
        this.getDropDownValue(res);
      }
    });
  }


  /**
   * ANGULAR HOOK
   * To detect the changes from parent and update value
   * @param  changes: object contains prev and current value
   */

  ngOnChanges(changes: SimpleChanges) {
    if (changes.value && changes.value.previousValue !== undefined && (changes.value.previousValue !== changes.value.currentValue)) {
      const value = this.optionList.find(el => el.CODE === changes.value.currentValue)
      if (value) {
        this.control.patchValue(value);
      }
    }
    if (changes.displayCriteria && changes.displayCriteria.previousValue !== undefined && changes.displayCriteria.previousValue !== changes.displayCriteria.currentValue) {
      this.displayCriteria = changes.displayCriteria.currentValue;
    }

    if (changes.formFieldId && changes.formFieldId.currentValue && changes.formFieldId.previousValue !== changes.formFieldId.currentValue) {
      this.formFieldId = changes.formFieldId.currentValue;
      this.getDropDownValue();
    }
  }

  getDropDownValue(searchText?): string | boolean | void {
    console.log('get drop down value');
    if(!this.formFieldId){
      return;
    }
    const sub = this.reportService.getDropDownValues(this.formFieldId, searchText).subscribe(res => {
      this.optionList = res;
    })
    this.subscription.push(sub);
  }

  selectSingleDropDownValue() {
    const response = {
      formFieldId: this.formFieldId,
      value: this.control.value
    }
    this.valueChange.emit(response);
  }


  getDisplayText(option) {
    if (option) {
      if (this.displayCriteria === 'CODE_TEXT') {
        return option.CODE + '-' + option.TEXT;
      } else if (this.displayCriteria === 'CODE') {
        return option.CODE;
      } else {
        return option.TEXT;
      }
    } else {
      return '';
    }
  }
}
