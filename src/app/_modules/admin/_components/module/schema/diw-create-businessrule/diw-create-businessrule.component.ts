import { Component, OnInit, ViewChild, Inject, AfterViewInit, AfterContentChecked, NgZone } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { BusinessRuleType, CoreSchemaBrInfo } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { CreateSchemaComponent } from '../create-schema/create-schema.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export class BusinessRules {
  ruleDesc: string;
  ruleId: string;
  ruleType: BusinessRuleType;
  isImplemented?: boolean;
  dontMapped?: boolean;
  parent?: Array<string>; // rules having value "ROOT" will be displayed as normal business rules
}
@Component({
  selector: 'pros-diw-create-businessrule',
  templateUrl: './diw-create-businessrule.component.html',
  styleUrls: ['./diw-create-businessrule.component.scss']
})
export class DiwCreateBusinessruleComponent implements OnInit, AfterViewInit, AfterContentChecked {


  moduleId: string;

  schemaId: string;

  brId: string;

  possibleBrs: BusinessRules[];

  selectedBrType: BusinessRuleType;

  @ViewChild('stepper') stepper: MatStepper;

  isLinear = false;
  stepOneCtrl: FormGroup;
  stepTwoCtrl: FormGroup;
  stepThreeCtrl: FormGroup;

  /**
   * When click on save business rule then send value change to rules components
   */
  svdClicked;

  /**
   * After condition saved need to reload condition list
   */
  needCondRef;


  /**
   * After click user defined rule finish button ..
   */
  finishUdrCreProcess;

  constructor(
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CreateSchemaComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private zone: NgZone
    ){}

  ngAfterContentChecked(): void {

  }


  ngAfterViewInit(): void {
    setTimeout(()=>{
      if(this.brId) {
        this.stepper.steps.first.completed = true;
        this.stepper.steps.first.editable = false;
        this.stepper.selectedIndex = 1;
        this.stepOneCtrl.setValue({brType:this.selectedBrType});
      }
    },1000);
  }


  ngOnInit(): void {
    if(this.dialogData) {
      this.moduleId = this.dialogData.moduleId;
      this.schemaId = this.dialogData.schemaId;
      this.brId = this.dialogData.brId;
      this.selectedBrType = this.dialogData.brType ? this.dialogData.brType : undefined;
    }
    this.stepOneCtrl = this._formBuilder.group({
      brType: ['', Validators.required]
    });

    this.stepTwoCtrl = this._formBuilder.group({
      brDetails: ['',   this.selectedBrType !== 'BR_CUSTOM_SCRIPT' ? Validators.required: false]
    });

    this.stepThreeCtrl = this._formBuilder.group({
      step3Info: ['', Validators.required]
    });

    this.possibleBrs = this.allBusinessRules;
  }


  get allBusinessRules() : BusinessRules[] {
    return [
      {ruleDesc: 'API Rule',ruleId:'',ruleType:BusinessRuleType.BR_API_RULE},
      {ruleDesc: 'Basic',ruleId:'',ruleType:null, isImplemented: false},
      {ruleDesc: 'Dependency Rule',ruleId:'',ruleType:BusinessRuleType.BR_DEPENDANCY_RULE},
      {ruleDesc: 'Duplicate Rule',ruleId:'',ruleType:BusinessRuleType.BR_DUPLICATE_RULE},
      {ruleDesc: 'External Validation Rule',ruleId:'',ruleType:BusinessRuleType.BR_EXTERNALVALIDATION_RULE},
      {ruleDesc: 'Metadata Rule',ruleId:'',ruleType:BusinessRuleType.BR_METADATA_RULE, isImplemented: true},
      {ruleDesc: 'Missing Rule',ruleId:'',ruleType:BusinessRuleType.BR_MANDATORY_FIELDS,isImplemented: true},
      {ruleDesc: 'Regex Rule',ruleId:'',ruleType:BusinessRuleType.BR_REGEX_RULE, isImplemented: true},
      {ruleDesc: 'User Defined Rule',ruleId:'',ruleType:BusinessRuleType.BR_CUSTOM_SCRIPT,isImplemented: true},
    ];
  }

  /**
   * Set br type and control creation steps.
   * @param brType clicked business rule type
   */
  selBrType(brType: BusinessRules) {
    if(brType && brType.ruleType) {
      this.stepOneCtrl.setValue({brType:brType.ruleType});
      this.selectedBrType = brType.ruleType;
      this.stepper.next();
    }
  }

  /**
   * use for get business rule type defination
   */
  get businessRuleTypeDef(): string {
    const val = this.stepOneCtrl.get('brType').value;
    let def = '';
    switch (val) {
      case BusinessRuleType.BR_MANDATORY_FIELDS:
        def= 'Missing Rule';
        break;

      case BusinessRuleType.BR_METADATA_RULE:
        def = 'Metadata Rule';
        break;

      case BusinessRuleType.BR_CUSTOM_SCRIPT:
        def = 'User Defined Rule';
        break;

      case BusinessRuleType.BR_DEPENDANCY_RULE:
        def = 'Dependency Rule';
        break;

      case BusinessRuleType.BR_DUPLICATE_RULE:
        def = 'Duplicate Rule';
        break;

      case BusinessRuleType.BR_API_RULE:
        def = 'API Rule';
        break;

      case BusinessRuleType.BR_EXTERNALVALIDATION_RULE:
        def = 'External Validation Rule';
        break;

      case BusinessRuleType.BR_REGEX_RULE:
        def = 'Regex Rule';
        break;
      default:
        break;
    }
    return def;
  }

  /**
   * After saved business rule should called this method
   * @param brInfo after saved br info
   */
  afterSaved(brInfo: CoreSchemaBrInfo) {
    if(brInfo) {
      this.dialogRef.close(brInfo);
    }
  }

  /**
   * After click saved rule
   */
  clickSaved() {
    this.svdClicked = this.svdClicked ? false : true;
  }

  /**
   * After condition block add
   */
  fetchConditionList(sno: string[]) {
    this.stepper.next();
    console.log(sno);
  }

  /**
   * After step change manage required steps
   * @param evt after step change
   */
  controlStepChange(evt: any) {
    switch (evt.selectedIndex) {
      case 2:
        this.needCondRef = this.svdClicked ? false : true;
        break;
      default:
        break;
    }
  }

  /**
   * Call while clicked use defined rule finish process
   */
  udrClickSaved() {
    this.finishUdrCreProcess =  this.finishUdrCreProcess ? false : true;
  }

  /**
   * Close dialog after saved or click close
   */
  closeDialog() {
    this.dialogRef.close();
  }
}
