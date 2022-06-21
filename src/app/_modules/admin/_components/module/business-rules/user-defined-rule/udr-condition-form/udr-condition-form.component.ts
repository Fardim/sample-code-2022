import { Component, OnInit, Input, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import { SchemaDetailsService } from 'src/app/_services/home/schema/schema-details.service';
import { MetadataModel } from 'src/app/_models/schema/schemadetailstable';
import { of, Observable } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { SchemaService } from 'src/app/_services/home/schema.service';
import { DropDownValue, UDRBlocksModel, ConditionalOperator } from '../../business-rules.modal';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BlockType } from '../udr-cdktree.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'pros-udr-condition-form',
  templateUrl: './udr-condition-form.component.html',
  styleUrls: ['./udr-condition-form.component.scss']
})
export class UdrConditionFormComponent implements OnInit, OnChanges {

  @Input()
  schemaId: string;

  @Input()
  moduleId: string;

  @Input()
  svdClicked: boolean;

  @Output()
  evtAfterSaved: EventEmitter<string[]> = new EventEmitter<string[]>();

  dropValues: DropDownValue[];
  dropValuesOb: Observable<DropDownValue[]> = of([]);

  // possible / implemented operators
  conditionalOperators: ConditionalOperator[] = this.possibleOperators;

  frmGroup: FormGroup;
  showRangeFld = false;
  constructor(
    private schemaDetailsService: SchemaDetailsService,
    public formBuilder: FormBuilder,
    private schemaService: SchemaService,
    public snackBar: MatSnackBar
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes.svdClicked && changes.svdClicked.previousValue !== changes.svdClicked.currentValue) {
      if(changes.svdClicked.currentValue !== undefined) {
        this.saveUpdateCondition();
      }
    }
  }

  ngOnInit(): void {

    // get all operator http call
    // this.getBrConditionalOperator();

    // form builder
    this.initFrmArray();

    // track change values
    // this.frmGroup.valueChanges.subscribe(val=>{
    //   console.log(val);
    // });

    // // filter operators
    // this.frmGroup.get('operator').valueChanges.subscribe(val=>{
    //   if(val) {
    //     this.conditionalOperatorsOb = of(this.conditionalOperators.filter(fill => fill.toLocaleLowerCase().indexOf(val.toLocaleLowerCase())!==-1));
    //   } else {
    //     this.conditionalOperatorsOb = of(this.conditionalOperators);
    //   }
    // });
  }

  /**
   * Init form array
   */
  initFrmArray() {
    this.frmGroup = this.formBuilder.group({
      frmArray: this.formBuilder.array([this.formBuilder.group({
        conditionDesc :['',Validators.required],
        fields:['',Validators.required],
        operator:['',Validators.required],
        conditionFieldValue:'',
        conditionFieldStartValue: '',
        conditionFieldEndValue: '',
        showRangeFld:false
  })])
  });
  }

  // getBrConditionalOperator() {
  //   this.schemaService.getBrConditionalOperator().subscribe(res=>{
  //     this.conditionalOperators = res;
  //   },error=>console.error(`Error: ${error}`));
  // }

  changeConditionalField(obj: MetadataModel, index: number) {
    if(obj && obj.picklist === '1') {
      this.getdropDownValues(obj.fieldId, '');
    }
    const frmArray = this.frmArray;
    const frmCtrl =  frmArray.at(index);
    const val =  frmCtrl.value;
    val.fields = obj;
    frmCtrl.setValue(val);
  }

    // filter dropdown values
  onKey(event: any) {
    const data = event? event.target.value: '';
    if(typeof data === 'string') {
      const filteredObjectTypes = this.dropValues.filter(module => (module.TEXT.toLowerCase().indexOf(data.toLowerCase())) === 0);
      this.dropValuesOb = of(filteredObjectTypes);
    } else {
      this.dropValuesOb = of(this.dropValues);
    }
  }

  getdropDownValues(fieldId: string, queryString: string) {
    this.schemaService.dropDownValues(fieldId, queryString).subscribe(res=>{
      this.dropValues = res;
      this.dropValuesOb = of(res);
    },error=>console.error(`Error: ${error}`))
  }

  dropValDisplayWith(obj: DropDownValue): string {
    return obj ? obj.TEXT : null;
  }

  /**
   * While selection object from object type this method will help us to get assigned schema(s)
   *  event
   */
  selectComparisonValue(event: MatAutocompleteSelectedEvent, index: number): void {
    const frmArray = this.frmArray;
    const frmCtrl =  frmArray.at(index);
    const val =  frmCtrl.value;
    const selData =  event.option? event.option.value : '';
    if(selData) {
      val.conditionFieldValue = selData;
    }
  }

  operatorSelectionChng(option: string, index: number) {
    const frmArray = this.frmArray;
    const frmCtrl =  frmArray.at(index);
    const val =  frmCtrl.value;
    val.operator = option;
    val.showRangeFld = option=== 'RANGE' ? true : false;
    frmCtrl.setValue(val);
    // frmCtrl.get('showRangeFld').setValue(option.option.value === 'RANGE' ? true : false);
  }

  /**
   * Add More condition
   */
  addCondition() {
    const frmArray = this.frmArray;
    frmArray.push(this.formBuilder.group({
      conditionDesc :['',Validators.required],
      fields:['',Validators.required],
      operator:['',Validators.required],
      conditionFieldValue:'',
      conditionFieldStartValue: '',
      conditionFieldEndValue: '',
      showRangeFld:false
    }));
  }

  /**
   * Remove condition block
   * @param index Removeable index number
   */
  remove(index: number) {
    const frmArray = this.frmArray;
    frmArray.removeAt(index);
  }

  /**
   * Return all possible operators
   */
  get possibleOperators(): ConditionalOperator[] {
    // get generic operators
    const genericOp: ConditionalOperator = new ConditionalOperator();
    genericOp.desc = 'Common Operator';
    genericOp.childs = [];
    genericOp.childs.push({ code: 'EQUAL' });
    genericOp.childs.push({ code: 'STARTS_WITH' });
    genericOp.childs.push({ code: 'ENDS_WITH' });
    genericOp.childs.push({ code: 'CONTAINS' });
    genericOp.childs.push({ code: 'EMPTY' });
    genericOp.childs.push({ code: 'NOT_EMPTY' });

    // for numeric number field
    const onlyNum:ConditionalOperator = new ConditionalOperator();
    onlyNum.desc = 'Numeric Operators';
    onlyNum.childs = [];
    onlyNum.childs.push({ code: 'RANGE' });
    onlyNum.childs.push({ code: 'LESS_THAN' });
    onlyNum.childs.push({ code: 'LESS_THAN_EQUAL' });
    onlyNum.childs.push({ code: 'GREATER_THAN' });
    onlyNum.childs.push({ code: 'GREATER_THAN_EQUAL' });

    // for special operators
    const specialOpe:ConditionalOperator = new ConditionalOperator();
    specialOpe.desc = 'Special Operators';
    specialOpe.childs = [];
    specialOpe.childs.push({ code: 'REGEX' });
    specialOpe.childs.push({ code: 'LOCATION' });
    return [genericOp,onlyNum,specialOpe];
  }



  saveUpdateCondition(id?: string) {
    const frmArray = this.frmArray;
    if(!frmArray.valid) {
      this.snackBar.open(`Please enter required field(s)`,'Close',{duration:5000});
      return false;
    }
    const arrayReq: UDRBlocksModel[] = [];

    for(let i=0; i<frmArray.length; i++) {
      const ctrl = frmArray.at(i);
      const request: UDRBlocksModel = new UDRBlocksModel();
      request.id = id ? id : String(Math.floor(Math.random() * 1000000000));
      request.conditionFieldId = ctrl.value.fields.fieldId ? ctrl.value.fields.fieldId : '';
      request.blockDesc = ctrl.value.conditionDesc;
      request.conditionFieldValue = typeof ctrl.value.conditionFieldValue === 'string' ? ctrl.value.conditionFieldValue : ctrl.value.conditionFieldValue.CODE;
      request.conditionOperator = ctrl.value.operator;
      request.blockType = BlockType.COND;
      request.conditionFieldStartValue = ctrl.value.conditionFieldStartValue;
      request.conditionFieldEndValue = ctrl.value.conditionFieldEndValue;
      request.objectType = this.moduleId;

      arrayReq.push(request);
    }

    // call service for save conditional blocks
    this.schemaService.saveUpdateUdrBlock(arrayReq).subscribe(response=>{
      if(response) {
        this.snackBar.open(`Successfully saved `,'Close',{duration:5000});
        this.frmGroup.reset();
        this.initFrmArray();
        this.evtAfterSaved.emit(response);
      }
    },error=>console.error(`Error : ${error}`));
  }

  /***
   * Get form array controles
   */
  get frmArray() {
    return this.frmGroup.get('frmArray') as FormArray;
  }

}
