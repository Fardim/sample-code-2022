import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { ClassificationHeader } from '@models/schema/schemadetailstable';
import { DropDownValue } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { SchemaService } from '@services/home/schema.service';
import { NounModifierService } from '@services/home/schema/noun-modifier.service';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { UserService } from '@services/user/userservice.service';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

export enum CellDataFor {
  LOCAL_NOUN = 'LOCAL_NOUN',
  LOCAL_MODIFIER = 'LOCAL_MODIFIER',
  LOCAL_ATTRIBUTE = 'LOCAL_ATTRIBUTE',
  GSN_NOUN = 'GSN_NOUN',
  GSN_MODIFIER = 'GSN_MODIFIER',
  GSN_ATTRIBUTE = 'GSN_ATTRIBUTE',

}

@Component({
  selector: 'pros-classification-datatable-cell-editable',
  templateUrl: './classification-datatable-cell-editable.component.html',
  styleUrls: ['./classification-datatable-cell-editable.component.scss']
})
export class ClassificationDatatableCellEditableComponent implements OnInit, AfterViewInit, OnChanges {

  @Input()
  fieldId: string;


  @Input()
  cellDataFor: CellDataFor;

  @Input()
  preSuggestedValues: DropDownValue[] = [];

  @Input()
  objectNumber: string;

  @Input()
  nounCode: string;

  @Input()
  modCode: string;

  @Input()
  schemaId: string;

  @Input()
  rundId: string;

  @Input()
  brType: string;

  @Input()
  controlType: string;

  /**
   * Hold current value while editing ...
   */
  @Input()
  value: string;
  /**
   * Properties for the editable atribute
   */
  @Input()
  attrControl: ClassificationHeader;

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

  constructor(
    private schemaService: SchemaService,
    private nounModifierService: NounModifierService,
    private userService: UserService,
    private schemaDetailsService: SchemaDetailsService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes.controlType && changes.controlType.previousValue !== changes.controlType.currentValue) {
      this.controlType = changes.controlType.currentValue;
    }
  }

  ngOnInit(): void {

    console.log(this.controlType);
    if(this.brType && (this.brType === 'unmatched' || this.brType === 'MRO_CLS_MASTER_CHECK')) {
      if(this.fieldId === 'NOUN_CODE') {
        this.getLocalNouns();
      } else if(this.fieldId === 'MODE_CODE') {
        this.getLocalModifiers();
      } else {
        this.getAttributeValues();
      }
    } else {
      if(this.fieldId === 'NOUN_CODE') {
        this.getSuggestedNouns();
      } else if(this.fieldId === 'MODE_CODE') {
        this.getSuggestedModifiers();
      }
    }

    // apply validators ...
    const validatorsArrays = [];
    if(this.attrControl?.mandatory) {
      validatorsArrays.push(Validators.required);
    }
    if(this.attrControl?.length) {
      validatorsArrays.push(Validators.max(this.attrControl.length))
    }
    if(this.attrControl?.fieldType === 'NUMERIC') {
      validatorsArrays.push(Validators.pattern('^[0-9]*$'))
    }
    if(validatorsArrays.length >0) {
      this.searchControl.setValidators(validatorsArrays);
      this.searchControl.updateValueAndValidity({emitEvent:true,onlySelf:true});
    }

    this.searchControl.setValue(this.value ? this.value : '');

  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.input.nativeElement.focus();
    }, 10)

  }

  emitChngSelectValue(event: any) {
    if (event.relatedTarget && event.relatedTarget.id.indexOf('mat-option') > -1) {
      event.preventDefault();
      console.log('selection blur')
      return;
    }
    const selVal = event.option ? event.option.value : event.target.value ;
    const value = this.selectFieldOptions.find(x => x.CODE === selVal) || selVal;
    this.emitInputBlur(value);
  }

  emitInputBlur(value) {
    console.log(this.searchControl);
    // let err_msg = '';
    // if(this.searchControl.errors) {
    //   if(Object.keys(this.searchControl.errors)[0] === 'max') {
    //     err_msg = `Please enter less then ${this.attrControl.length} char's.`;
    //   } else if(Object.keys(this.searchControl.errors)[0] === 'pattern') {
    //     err_msg = `Invalid type , Only numeric allowed`;
    //   }
    // }
    this.inputBlur.emit(value);
  }



  getSuggestedNouns(searchString?: string) {
    this.nounModifierService.getSuggestedNouns(this.schemaId,this.rundId,this.objectNumber,this.brType,this.matlgrp, searchString) .subscribe(res=>{
      if(searchString) {
        this.selectFieldOptions = this.preSuggestedValues.filter(fil=> (fil.CODE.indexOf(searchString) !==-1 || fil.TEXT.indexOf(searchString) !==-1));
      } else {
        this.selectFieldOptions = this.preSuggestedValues;
      }

      res.forEach(r=>{
        const drop: DropDownValue = {CODE: r.NOUN_CODE,FIELDNAME:this.fieldId,TEXT:r.NOUN_LONG ? r.NOUN_LONG : r.NOUN_CODE} as DropDownValue;
        this.selectFieldOptions.push(drop);
      });
      this.filterdOptionsObs = of(this.selectFieldOptions);

      if(!searchString) {
        this.searchControl.valueChanges.subscribe(val=>{
          this.getSuggestedNouns(val.trim());
        });
      }

    }, err => console.error(`Exception ${err.message}`));
  }


  getSuggestedModifiers(searchString?: string) {
    this.nounModifierService.getSuggestedModifiers(this.schemaId,this.rundId,this.objectNumber,this.brType,this.nounCode,searchString) .subscribe(res=>{
      if(searchString) {
        this.selectFieldOptions = this.preSuggestedValues.filter(fil=> (fil.CODE.indexOf(searchString) !==-1 || fil.TEXT.indexOf(searchString) !==-1));
      } else {
        this.selectFieldOptions = this.preSuggestedValues;
      }

      res.forEach(r=>{
        const drop: DropDownValue = {CODE: r.MODE_CODE,FIELDNAME:this.fieldId,TEXT:r.MOD_LONG ? r.MOD_LONG : r.MOD_LONG} as DropDownValue;
        this.selectFieldOptions.push(drop);
      });
      this.filterdOptionsObs = of(this.selectFieldOptions);

      if(!searchString) {
        this.searchControl.valueChanges.subscribe(val=>{
          this.getSuggestedModifiers(val.trim());
        });
      }

    }, err => console.error(`Exception ${err.message}`));
  }

  getLocalNouns(serachString?: string){
    this.userService.getUserDetails().pipe(
      distinctUntilChanged(),
      switchMap(user => this.nounModifierService.getLocalNouns(user.plantCode,this.matlgrp, '','',serachString))).subscribe(res=>{
        this.selectFieldOptions = [];
        res.forEach(r=>{
          const drop: DropDownValue = {CODE: r.NOUN_CODE,FIELDNAME:this.fieldId,TEXT:r.NOUN_CODE ? r.NOUN_CODE : r.NOUN_CODE} as DropDownValue;
          this.selectFieldOptions.push(drop);
        });
        this.filterdOptionsObs = of(this.selectFieldOptions);
        if(!serachString) {
          this.searchControl.valueChanges.pipe(debounceTime(1000)).subscribe(val=>{
            this.getLocalNouns(val.trim());
          });
        }
      });
  }

  getLocalModifiers(serachString?: string){
    this.userService.getUserDetails().pipe(
      distinctUntilChanged(),
      switchMap(user => this.nounModifierService.getLocalModifier(user.plantCode, this.nounCode, this.matlgrp, serachString))).subscribe(res=>{
        this.selectFieldOptions = [];
        res.forEach(r=>{
          const drop: DropDownValue = {CODE: r.MODE_CODE,FIELDNAME:this.fieldId,TEXT:r.MOD_LONG ? r.MOD_LONG : r.MODE_CODE} as DropDownValue;
          this.selectFieldOptions.push(drop);
        });
        this.filterdOptionsObs = of(this.selectFieldOptions);
        if(!serachString) {
          this.searchControl.valueChanges.pipe(debounceTime(1000)).subscribe(val=>{
            this.getLocalModifiers(val.trim());
          });
        }
      });
  }

  /**
   * Get the attribute value and serach it ...
   * @param searchString search the attribute based on this string ...
   */
  getAttributeValues(searchString?: string) {
    this.schemaDetailsService.getClassificationAttributeValue(this.attrControl.colSno,searchString).subscribe(res=>{
      res = res && Array.isArray(res) ? res : [];
      this.selectFieldOptions = [];
      res.forEach(r=>{
        const drop: DropDownValue = {CODE: r.shortValue,FIELDNAME:this.attrControl.colSno,TEXT:r.longValue || r.attributeValuesPk?.code || r.shortValue || ''} as DropDownValue;
        this.selectFieldOptions.push(drop);
      });
      this.filterdOptionsObs = of(this.selectFieldOptions);
      if(!searchString) {
        this.searchControl.valueChanges.pipe(distinctUntilChanged(), debounceTime(1000)).subscribe(val=>{
          this.getAttributeValues(val.trim());
        });
      }
    });
  }

  displayFn(code: string) {
    return this.selectFieldOptions.find(drop => drop.CODE === code)?.TEXT || code;
  }

}
