import { Component, forwardRef, Inject, Input, LOCALE_ID, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import FormField from '@models/form-field';
import { CoreSchemaBrInfo } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { FieldCtrl } from '@modules/transaction/model/transaction';
import { CoreService } from '@services/core/core.service';
import { RuleService } from '@services/rule/rule.service';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';

export const  assignData = [{
  c:'FIELD',
  t:'Assign field'
},{
  c:'DAXE',
  t:'Assign DAXE'
},{
  c:'UDR',
  t:'Assign UDR rule'
}];

@Component({
  selector: 'pros-process-variable',
  templateUrl: './process-variable.component.html',
  styleUrls: ['./process-variable.component.scss']
})
export class ProcessVariableComponent implements OnInit {

  @Input()
  frmGrp: FormGroup;

  fields$: Observable<any> = of({headers:{}, hierarchy:[], hierarchyFields:{}});

  brs$: Observable<CoreSchemaBrInfo[]> = of([]);

  assign_field = 'FIELD';
  assignDataObj = assignData;

  processData = ['Field Value', 'Sum', 'Average', 'Median'];

  /**
   * The locale code for logged in user ..
   */
  _locale: string = '';

  @Input() datasetId:any;
  constructor(private fb: FormBuilder,
    private ruleService: RuleService,
    private coreService: CoreService,
    @Inject(LOCALE_ID) public locale: string,) {
      this._locale = this.locale?.split('-')?.[0] || 'en';
  }

  ngOnInit(): void {
    this.fields$ = this.coreService.getFlowRefFields([this.datasetId]);

    this.frmGrp.get('assignValues').valueChanges.pipe(distinctUntilChanged()).subscribe(o=>{
      if(o.c !== 'FIELD') {
        this.brs$ = this.ruleService.getBrListDaxeUdr(o?.c, 0, 20, this.datasetId,'');
      }
    });
  }

  assignValuesDisplayW(evt): string {
    return evt?.t || evt?.c;
  }

  getFieldName(obj: any) {
    return (obj?.shortText && obj?.shortText[this._locale]?.description) || obj?.description || obj.fieldId;;
  }

  brRuleDisplayW(evt): string {
    return evt?.brInfo || evt?.brIdStr;
  }

  getFieldDescription(headerfld): string {
    headerfld = headerfld?.value || null;
    return (headerfld?.shortText && headerfld?.shortText[this._locale]?.description) || headerfld?.description || headerfld.fieldId;
  }

}
