import { Component, OnInit, OnChanges, SimpleChanges, Input, EventEmitter, Output } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SchemaService } from '@services/home/schema.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { ConditionalOperator } from '../../business-rules.modal';

@Component({
  selector: 'pros-udr-condition-operators',
  templateUrl: './udr-condition-operators.component.html',
  styleUrls: ['./udr-condition-operators.component.scss']
})
export class UdrConditionOperatorsComponent implements OnInit, OnChanges {

  @Input()
  conditionalOperators: ConditionalOperator[];

  @Output()
  afterSelect: EventEmitter<string> = new EventEmitter();

  @Input()
  selecetedOperator: string;

  conditionalOperatorsOb: Observable<ConditionalOperator[]> = of([]);

  operator: FormControl = new FormControl('');

  constructor(
    private schemaService: SchemaService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes.conditionalOperators && changes.conditionalOperators.previousValue !== changes.conditionalOperators.currentValue) {
      this.conditionalOperatorsOb = of(changes.conditionalOperators.currentValue);
    }
  }

  ngOnInit(): void {
    this.operator.valueChanges.subscribe(res=>{
      if(res && typeof res === 'string' && res.trim() !== '') {
        const groups = Array.from(this.conditionalOperators);
        const matchedData: ConditionalOperator[] = [];
        groups.forEach(grp=>{
          const changeAble = {childs:grp.childs,desc: grp.desc} as ConditionalOperator;
          const chld: { code: string; value?: string}[] = [];
          changeAble.childs.forEach(child=>{
            const value = child.value ? child.value : child.code;
            if(value.toLocaleLowerCase().indexOf(res.toLocaleLowerCase()) !==-1) {
              chld.push(child);
            }
          });
          if(chld.length) {
            changeAble.childs = chld;
            matchedData.push(changeAble);
          }
        });
        this.conditionalOperatorsOb = of(matchedData);
      } else {
        this.conditionalOperatorsOb = of(this.conditionalOperators);
      }
    });

      // set preselected autocomplete
      if(this.selecetedOperator){
        this.conditionalOperators.forEach(oper=>{
          const match = oper.childs.filter(fill => fill.code === this.selecetedOperator);
          if(match.length > 0) {
            this.afterSelect.emit(match[0].code);
            this.operator.setValue(match[0].value ? match[0].value : match[0].code);
          }
        })
      }
  }


  /**
   *
   * @param option when option change then should emit value
   */
  operatorSelectionChng(option: MatAutocompleteSelectedEvent) {
    if(option && option.option.value) {
      this.afterSelect.emit(option.option.value.code);
      this.operator.setValue(option.option.value.value ? option.option.value.value : option.option.value.code)
    }
  }

}
