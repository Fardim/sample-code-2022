import { Component, ElementRef, EventEmitter, Inject, Input, LOCALE_ID, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { DropDownValue } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';

@Component({
  selector: 'pros-description-datatable-cell-editable',
  templateUrl: './description-datatable-cell-editable.component.html',
  styleUrls: ['./description-datatable-cell-editable.component.scss']
})
export class DescriptionDatatableCellEditableComponent implements OnInit {


  @Input()
  fieldId: string;

  @Input()
  moduleId: string;

  @Input()
  objectNumber: string;

  @Input()
  schemaId: string;

  @Input()
  controlType: string;

  /**
   * Hold current value while editing ...
   */
  @Input()
  value: any;

  @Input()
  attributeUUID: string;

  /**
   * Hold material group here ...
   */
  matlgrp: string;

  @Output()
  inputBlur = new EventEmitter<any>();

  @ViewChild('input') input: ElementRef;
  @ViewChild('trigger') inputAutoCompleteEl: MatAutocompleteTrigger;


  selectFieldOptions: DropDownValue[] = [];
  filterdOptionsObs: Observable<DropDownValue[]>;

  searchControl = new FormControl();

  constructor(private schemaDetailsService: SchemaDetailsService,
    @Inject(LOCALE_ID) public locale: string) { }


  ngOnInit(): void {
    if(this.controlType === 'dropdown') {
      this.searchControl.valueChanges.pipe(
        distinctUntilChanged(),
        debounceTime(1000),
        startWith(''),
        ).subscribe(val=>{
          if(typeof val != 'object') {
            this.getDropdownOptions(val?.trim());
          }
      });
    }

    this.searchControl.setValue(this.value);
  }

  getDropdownOptions(searchString?: string) {
    const body = {
      parent: {
      },
      searchString
    };
    this.schemaDetailsService.getDropdownOfPickList(this.moduleId, this.fieldId, this.locale, body).subscribe((res: any) => {
      const options = [];
      res?.content?.forEach(option=>{
        const drop: DropDownValue = {CODE: option.code, TEXT: option.text} as DropDownValue;
        options.push(drop);
      });
      this.filterdOptionsObs = of(options);
    }, (error) => {
      console.error('Error while loading dropdown values', error);
    });
  }

  displayFn(value: any) {
    return value?.TEXT || value?.CODE || '';
  }

  emitChngSelectValue(event: any) {
    if (event.relatedTarget && event.relatedTarget.id.indexOf('mat-option') > -1) {
      event.preventDefault();
      return;
    }
    const selVal = event.option ? event.option.value : event.target.value ;
    const value = this.selectFieldOptions.find(x => x.CODE === selVal) || selVal;
    this.emitInputBlur(value);
  }

  emitInputBlur(value) {
    this.inputBlur.emit(value);
  }

}
