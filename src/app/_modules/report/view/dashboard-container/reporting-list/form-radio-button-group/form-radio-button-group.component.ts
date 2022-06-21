import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, SimpleChanges, ChangeDetectorRef, OnChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ReportService } from '@modules/report/_service/report.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { debounceTime, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'pros-form-radio-button-group',
  templateUrl: './form-radio-button-group.component.html',
  styleUrls: ['./form-radio-button-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class FormRadioButtonGroupComponent implements OnInit,OnChanges {

  constructor(private reportService: ReportService, private changeDetectorRef : ChangeDetectorRef) { }


  /**
   * Define an indiviual form control
   */
  @Input() control: FormControl;

  /**
   * Getting placeholder from parent
   */
  @Input() placeholder: string;

  @Input() displayCriteria: string;

  @Input() isTableFilter: string;
  /**
   * To emit value change of input to parent
   */
  @Output() valueChange = new EventEmitter<object>();

  @Input() formFieldId: string;

  @Input() value:string;

  optionList: any[] = [];

  subscription: Subscription[] = [];
  fltrCtrl: FormControl = new FormControl();

  appliedFltrCtrl: FormControl = new FormControl();

  isBtnClickedEvnt: BehaviorSubject<string> = new BehaviorSubject(null);

  previousSelectedValue : string;
  /**
   * ANGULAR HOOK
   *
   */
  ngOnInit(): void {
    if (!this.control) {
      this.control = new FormControl();
    }
    this.fltrCtrl.valueChanges.pipe(startWith(''), debounceTime(500)).subscribe(res => {
      this.getDropDownValue(res);
    })

    if (this.control.value) {
      this.appliedFltrCtrl.setValue(this.control.value.value);
      this.previousSelectedValue = this.control.value.value;
    }

    this.isBtnClickedEvnt.subscribe(res => {
      if (res) {
        this.appliedFltrCtrl.setValue(res);
      }
    })
  }

  /**
   * ANGULAR HOOK
   * To detect the changes from parent and update value
   * @param  changes: object contains prev and current value
   */

  ngOnChanges(changes: SimpleChanges) {
    if (changes.formFieldId && changes.formFieldId.previousValue !== undefined && changes.formFieldId.previousValue !== changes.formFieldId.currentValue) {
      this.formFieldId = changes.formFieldId.currentValue;
    }

    if (changes.control && changes.control.previousValue !== undefined  && changes.control.previousValue.value !== changes.control.currentValue.value) {
      this.control.setValue(changes.controls.currentValue);
    }
    if(changes.value && changes.value.previousValue !== changes.value.currentValue) {
      const selectedValue = this.optionList.find(item => item.value === this.control.value);
      if(selectedValue) {
        this.appliedFltrCtrl.setValue(selectedValue.key);
      } else {
        this.appliedFltrCtrl.reset();
      }
    }
  }

  getDropDownValue(searchText?): string | boolean | void {
    const sub = this.reportService.getDropDownValues(this.formFieldId, searchText).subscribe(res => {
      this.optionList = res.map(item => {
        return {
          value: item.CODE,
          key: this.displayCriteria && this.displayCriteria === 'CODE' ? item.CODE : (this.displayCriteria === 'CODE_TEXT' ? item.CODE + '-' + item.TEXT : item.TEXT)
        }
      });
      console.log(this.optionList);
    })
    this.subscription.push(sub);
  }

  applyFilter() {
    const selectedValue = this.optionList.find(item => item.value === this.control.value);
    const response = {
      formFieldId: this.formFieldId,
      value: { CODE: selectedValue.value, TEXT: selectedValue.key }
    }
    this.control.setValue(selectedValue.value);
    this.isBtnClickedEvnt.next(selectedValue.key);
    this.previousSelectedValue = selectedValue.key;
    this.valueChange.emit(response);
  }
}
