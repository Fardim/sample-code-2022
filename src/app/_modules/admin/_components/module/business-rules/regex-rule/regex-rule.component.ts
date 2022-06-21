import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CoreSchemaBrInfo, BusinessRuleType } from '../business-rules.modal';
import { Metadata } from '@modules/report/edit/container/metadatafield-control/metadatafield-control.component';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { SchemaService } from '@services/home/schema.service';
import { MatSnackBar } from '@angular/material/snack-bar';
export interface Regex{
  FUNC_NAME: string;
  FUNC_TYPE: string;
  FUNC_CODE: string;
}
@Component({
  selector: 'pros-regex-rule',
  templateUrl: './regex-rule.component.html',
  styleUrls: ['./regex-rule.component.scss']
})
export class RegexRuleComponent implements OnInit, OnChanges {

  @Input()
  schemaId: string;

  @Input()
  moduleId: string;

  @Input()
  brId: string;

  @Input()
  brType: string;

  @Input()
  svdClicked: boolean;

  @Output()
  evtSaved: EventEmitter<CoreSchemaBrInfo> = new EventEmitter();

  selectedFldId: string[] = [];

  brInfo: CoreSchemaBrInfo = new CoreSchemaBrInfo();

  preDefinedRegex: Regex[] = [
    {FUNC_NAME : 'EMAIL', FUNC_TYPE : 'EMAIL', FUNC_CODE : '^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}'},
    {FUNC_NAME : 'PANCARD', FUNC_TYPE : 'PANCARD', FUNC_CODE : '^[A-Z]{5}[0-9]{4}[A-Z]{1}$'},
    {FUNC_NAME : 'PHONE NUMBER(IN)', FUNC_TYPE : 'PHONE_NUMBER_IN', FUNC_CODE : '^(\\+91[\\-\\s]?)?[0]?(91)?[7896]\\d{9}$'},
    {FUNC_NAME : 'PHONE NUMBER(AUS)', FUNC_TYPE : 'PHONE_NUMBER_AUS', FUNC_CODE : '^\\({0,1}((0|\\+61)(2|4|3|7|8)){0,1}\\){0,1}(\\ |-){0,1}[0-9]{2}(\\ |-){0,1}[0-9]{2}(\\ |-){0,1}[0-9]{1}(\\ |-){0,1}[0-9]{3}$'},
    {FUNC_NAME : 'PHONE NUMBER(US)', FUNC_TYPE : 'PHONE_NUMBER_US', FUNC_CODE : '^\\(?([0-9]{3})\\)?[-.\\s]?([0-9]{3})[-.\\s]?([0-9]{4})$'},
    {FUNC_NAME : 'AADHAAR NUMBER', FUNC_TYPE : 'AADHAAR_NUMBER', FUNC_CODE : '^\\d{4}\\s\\d{4}\\s\\d{4}$'},
    {FUNC_NAME : 'ABN', FUNC_TYPE : 'ABN_NUMBER', FUNC_CODE : '^\\d{2}\\s*\\d{3}\\s*\\d{3}\\s*\\d{3}'},
    {FUNC_NAME : 'SSN(US)', FUNC_TYPE : 'SSN_US', FUNC_CODE : '^(?!000|666)[0-8][0-9]{2}-(?!00)[0-9]{2}-(?!0000)[0-9]{4}$'},
    {FUNC_NAME : 'GSTIN', FUNC_TYPE : 'GSTIN', FUNC_CODE : '^[0-9]{2}\\s*[A-Z]{5}[0-9]{4}[A-Z]{1}\\s*[1-9A-Z]{1}Z[0-9A-Z]{1}$'},
    {FUNC_NAME : 'ECN', FUNC_TYPE : 'ECN', FUNC_CODE : '^CN[0-9]{9}'}
   ];
   preDefinedRegexObs: Observable<Regex[]> = of(this.preDefinedRegex);

  regexFrmGrp: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private schemaService: SchemaService,
    private matSnackBar: MatSnackBar
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    // after clicked saved should validate and save / update br
    if(changes && changes.svdClicked && changes.svdClicked.previousValue !== changes.svdClicked.currentValue) {
      if(changes.svdClicked.currentValue) {
        this.saveBrInfo();
      }
    }
  }

  ngOnInit(): void {
    this.regexFrmGrp = this.formBuilder.group({
      ruleDesc:['', Validators.required],
      standardFun:[''],
      queryScript:['']
    });

    // search pre defined
    this.regexFrmGrp.get('standardFun').valueChanges.subscribe(val=>{
      if(val && typeof val === 'string') {
        this.preDefinedRegexObs = of(this.preDefinedRegex.filter(fil=> fil.FUNC_NAME.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) !==-1));
      } else {
        this.preDefinedRegexObs = of(this.preDefinedRegex);
      }
    });

    // get rule details while perform delete
    if(this.brId) {
      this.schemaService.getBusinessRuleInfo(this.brId).subscribe(res=>{
        this.brInfo = res;
        if(res.fields) {
          this.selectedFldId = res.fields.split(',');
        }

        // set value to form controles
        this.regexFrmGrp.setValue({ruleDesc: res.brInfo, standardFun: this.getStandardFunObj(res.standardFunction), queryScript: res.regex});
      },error=>console.error(`Error : ${error}`));
    }
  }


  /**
   * Update selected fields
   * @param options selected options
   */
  selectedFields(options: Metadata[]) {
    this.selectedFldId = options.map(map=> map.fieldId);
  }

  /**
   * Should return regex decsription
   * @param regex selected regex
   */
  displayWithPreRegex(regex: Regex): string {
    return regex ? regex.FUNC_NAME : '';
  }

  /**
   * Get pre defined regex description
   * @param event selected regex type
   */
  selectRegex(event: MatAutocompleteSelectedEvent) {
    const option: Regex = event.option.value;
    if(option) {
      this.regexFrmGrp.get('queryScript').setValue(option.FUNC_CODE);
    }
  }

  /**
   * Save and update regex rule
   */
  saveBrInfo() {
    this.brInfo.brId = this.brId ? this.brId : null;
    this.brInfo.brType = this.brType ? this.brType : BusinessRuleType.BR_REGEX_RULE;
    this.brInfo.fields = this.selectedFldId ? this.selectedFldId.toString() : '';
    this.brInfo.brInfo = this.regexFrmGrp.get('ruleDesc').value ? this.regexFrmGrp.get('ruleDesc').value : '';
    this.brInfo.regex = this.regexFrmGrp.get('queryScript').value ? this.regexFrmGrp.get('queryScript').value : '';
    this.brInfo.standardFunction = this.regexFrmGrp.get('standardFun').value ? this.regexFrmGrp.get('standardFun').value.FUNC_TYPE : null;

    this.schemaService.createBusinessRule(this.brInfo).subscribe(res=>{
      this.brId = res.brIdStr;
      this.brInfo.brIdStr = res.brIdStr;
      this.brInfo.brId = res.brIdStr;
      this.discard(this.brInfo);
      this.matSnackBar.open(`Successfully saved`, 'Close', { duration: 5000 });
    },error=>{
      this.matSnackBar.open(`Something went wrong`, 'Close', { duration: 5000 });
    });

  }

  /**
   * Help to emit saved br
   * @param res after saved br should emit
   */
  discard(res: CoreSchemaBrInfo) {
    this.evtSaved.emit(res);
  }

  /**
   * Return regex object
   * @param objid standard fun selected type
   */
  getStandardFunObj(objid: string): Regex {
    return this.preDefinedRegex.filter(fil=> fil.FUNC_TYPE === objid)[0];
  }
}
