import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { FieldInputType } from '@models/schema/schemadetailstable';
import { DropDownValue } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { SchemaService } from '@services/home/schema.service';
import * as moment from 'moment';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'pros-table-cell-input',
  templateUrl: './table-cell-input.component.html',
  styleUrls: ['./table-cell-input.component.scss']
})
export class TableCellInputComponent implements OnInit, AfterViewInit {

  @Input()
  fieldId: string;
  @Input()
  fieldHeight = 34;

  @Input()
  inputType: FieldInputType;

  @Input()
  value: any;

  @Input()
  parentFldValues: any = [];

  @Output()
  inputBlur = new EventEmitter<any>();

  @ViewChild('input') input: ElementRef;
  @ViewChild('trigger') inputAutoCompleteEl: MatAutocompleteTrigger;

  FIELD_TYPE = FieldInputType;

  selectFieldOptions: DropDownValue[] = [];
  filterdOptionsObs: Observable<DropDownValue[]>;

  searchControl = new FormControl();
  dateControl = new FormControl();

  get textAreaFieldHeight() {
    return {
      height: `${this.fieldHeight}px`
    }
  }

  constructor(private schemaService: SchemaService) { }

  ngOnInit(): void {

    if ((this.inputType === this.FIELD_TYPE.SINGLE_SELECT) || (this.inputType === this.FIELD_TYPE.MULTI_SELECT)) {
      this.prepareDropdownOptions();
      this.searchControl.valueChanges.pipe(distinctUntilChanged(), debounceTime(400)).subscribe(v=>{
        this.prepareDropdownOptions(v);
      });
    } else if (this.inputType === this.FIELD_TYPE.DATE){
      this.dateControl.setValue(this.prepareDateFormat());
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.input.nativeElement.focus();
    }, 10)

  }

  prepareDateFormat() {
    if (this.value) {
      return new Date(moment(this.value, 'DD/MM/YYYY').format('MM/DD/YYYY'));
    }
    return '';
  }

  formatDate(date) {
    return moment(date.toString()).format('DD/MM/YYYY');
  }

  emitChngSelectValue(event) {

    if (event.relatedTarget && event.relatedTarget.id.indexOf('mat-option') > -1) {
      event.preventDefault();
      console.log('selection blur')
      return;
    }

    setTimeout(() => {
      this.submitSingleSelectValue(event);
    }, 500)
  }

  submitSingleSelectValue(event) {
    const selectedOption = this.selectFieldOptions.find(option => option.TEXT.toLocaleLowerCase() === event.target.value.toLowerCase());
    this.emitInputBlur(selectedOption || this.value);
  }

  formatMultiSelectValue(value) {
    this.emitInputBlur(value)
  }

  filterSelectFieldOptions(searchText) {
    return this.selectFieldOptions.filter(option => option.TEXT.toLowerCase().includes(searchText.toLowerCase()));
  }

  prepareDropdownOptions(searchString?: string) {
    if (this.parentFldValues && this.parentFldValues.length) {
      this.schemaService.dropDownValuesV2(this.fieldId, this.parentFldValues, searchString ? searchString : '').subscribe((data) => {
        this.selectFieldOptions = data;
        this.filterdOptionsObs = of(data);
      });
    } else {
      this.schemaService.dropDownValues(this.fieldId, searchString ? searchString : '').subscribe((data) => {
        this.selectFieldOptions = data;
        this.filterdOptionsObs = of(data);
      });
    }
  }

  emitInputBlur(value) {
    this.inputBlur.emit(value);
  }

  datePanelClosed(){
    this.emitInputBlur(this.formatDate(this.dateControl.value));
  }

  singleSelectDisplayFn(value: DropDownValue) {
    return value?.TEXT || '';
  }
}
