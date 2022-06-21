import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SchemaService } from '@services/home/schema.service';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'pros-field-values-block',
  templateUrl: './field-values-block.component.html',
  styleUrls: ['./field-values-block.component.scss']
})
export class FieldValuesBlockComponent implements OnInit, OnDestroy {

  @Input() selectedFields = [];
  @Output() delete: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() fieldValuesGrp: FormGroup;
  @Input() moduleId;
  @Input() submitted;

  filteredOptions: Observable<any> = of([]);
  Selected1 = '';
  Selected2 = '';
  Selected3 = '';

  field1Values = [];
  field2Values = [];
  field3Values = [];
  filteredField1Values = of([]);
  filteredField2Values = of([]);
  filteredField3Values = of([]);
  @Input() set dropValuesField1(list) {
    this.field1Values = list;
    this.filteredField1Values =  of(list);
  };
  @Input() set dropValuesField2(list) {
    this.field2Values = list;
    this.filteredField2Values =  of(list);
  };
  @Input() set dropValuesField3(list) {
    this.field3Values = list;
    this.filteredField3Values =  of(list);
  };

  subscriptions = [];

  constructor(private schemaService: SchemaService) { }

  ngOnInit(): void {
    this.subscriptions.push(this.fieldValuesGrp.get('field1Val').valueChanges.pipe(distinctUntilChanged(), debounceTime(300)).subscribe((searchStr => {
      if (!searchStr) {
        this.filteredField1Values = of(this.field1Values);
      } else {
        this.searchList(1, searchStr);
      }
    })));

    this.subscriptions.push(this.fieldValuesGrp.get('field2Val').valueChanges.pipe(distinctUntilChanged(), debounceTime(300)).subscribe((searchStr => {
      if (!searchStr) {
        this.filteredField2Values = of(this.field2Values);
      } else {
        this.searchList(2, searchStr);
      }
    })));

    this.subscriptions.push(this.fieldValuesGrp.get('field3Val').valueChanges.pipe(distinctUntilChanged(), debounceTime(300)).subscribe((searchStr => {
      if (!searchStr) {
        this.filteredField3Values = of(this.field3Values);
      } else {
        this.searchList(3, searchStr);
      }
    })));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  searchList(fldNo: number, searchStr: string) {
    this.subscriptions.push(this.schemaService.getFieldDropValues(this.moduleId, this.selectedFields[fldNo]?.fieldId, searchStr, 0, 50).subscribe((res) => {
      const values = res || [];
      this[`filteredField${fldNo}Values`] = of(values);
    }));
  }

  selectSingle(ev, type) {
    if (type === 'f1') {
      this.Selected1 = ev.text;
    } else if (type === 'f2') {
      this.Selected2 = ev.text;
    } else {
      this.Selected3 = ev.text;
    }
  }

  displayFn(value) {
    return value ? value.text : '';
  }

  deleteBlock() {
    this.delete.emit(true);
  }

  isFieldValid(controlName: string): boolean {
    return this.fieldValuesGrp.get(controlName).valid;
  }

}
