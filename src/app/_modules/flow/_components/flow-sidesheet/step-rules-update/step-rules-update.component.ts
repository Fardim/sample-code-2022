import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BusinessRuleType, CoreSchemaBrInfo, RULE_TYPES } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { BusinessRules } from '@modules/admin/_components/module/schema/diw-create-businessrule/diw-create-businessrule.component';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { RuleService } from '@services/rule/rule.service';
import { TaskListService } from '@services/task-list.service';
import { TransientService } from 'mdo-ui-library';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, tap } from 'rxjs/operators';

@Component({
  selector: 'pros-step-rules-update',
  templateUrl: './step-rules-update.component.html',
  styleUrls: ['./step-rules-update.component.scss']
})
export class StepRulesUpdateComponent implements OnInit, OnDestroy {

  brData = [];
  stepId: any;
  flowId: any;
  allBrData = [];
  displayedColumns = [
    'brInfo', 'dataset', 'brType', 'brStatus'
  ]
  loading = false;
  referenceDatasetId: any = '';
  formsModel:any=[];
  outlet;
  stepData:any;
  /**
   * hold the business rule types
   */
  businessRuleTypes: BusinessRules[] = RULE_TYPES;
  search: FormControl = new FormControl('');

  /**
   * Susbcriptions ..
   */
  subscriptions: Subscription[] = [];

  /**
   * the flag which help to get the business rule for only that type
   */
  requestedForBrTye: BusinessRuleType[];

  // for page number
  fetchCount = 0;
  // for search string
  searchString = ''



  constructor(private activateRoute: ActivatedRoute,
    private router: Router,
    private ruleService: RuleService,
    private taskListService: TaskListService,
    private transientService: TransientService,
    private sharedServices: SharedServiceService) { }

  ngOnInit(): void {
    this.activateRoute.params.subscribe((params) => {
      this.stepId = params.stepId;
      this.flowId = params.id;
      this.outlet = params.outlet;
    });
    this.sharedServices.getFlowStepData().subscribe((stepData:any) => {
      this.stepData=stepData;
      console.log(stepData);
      if (stepData) {
        this.formsModel= stepData.forms;
        if (stepData.forms && stepData.forms.length > 0) {
          // currently saving rules for parentDatasetId
          this.referenceDatasetId = stepData.forms.find(x=>x.isPrimary).dataSetId;
        }
      }
    });
    this.subscriptions.push(this.search.valueChanges.pipe(debounceTime(200), distinctUntilChanged()).subscribe(searchString => {
      this.getAllBusinessRules(searchString);

    }));

    /**
     * Get the query params ....
     */
    this.activateRoute.queryParamMap.subscribe(p=>{
      this.requestedForBrTye = p.get('onlyForBrType') ? p.get('onlyForBrType').split(',') as any : null;
    });
    /**
     * Get the business rules ...
     */
    this.getAllBusinessRules();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => {
      s.unsubscribe();
    });
  }
  getAllBusinessRules(s?: string) {
    this.searchString = s ? s : '';
    if(this.requestedForBrTye) {
      this.ruleService.getBusinessRulesByTypes(this.requestedForBrTye || [] , [],'0','50',s || '').pipe(debounceTime(1000),tap(()=> this.loading = true), finalize(()=> this.loading = false)).subscribe(res=>{
        if (res) {
          this.setBRStatus(res);
        }
      });
    } else {
      this.ruleService.getAllBusinessRules(this.fetchCount, 20, this.searchString).pipe(debounceTime(1000),tap(()=> this.loading = true), finalize(()=> this.loading = false)).subscribe(res=>{
        if (res) {
          this.setBRStatus(res);
        }
      });
    }
  }
  setBRStatus(data:any){
    data.forEach(element => {
      const isExist = this.stepData?.rules?.filter(x=>Number(x.ruleId)===Number(element.brId));
      if(isExist && isExist.length>0){
        element.isAssigned=true;
      }else{
        element.isAssigned=false;
      }
    });
    this.allBrData = data;
    this.brData = data;
  }

  // on scoll call this function
  loadMore() {
    this.fetchCount++;
    this.ruleService.getAllBusinessRules(this.fetchCount, 20, this.searchString).pipe(tap(()=> this.loading = true), finalize(()=> this.loading = false)).subscribe(res=>{
      if (res) {
        res.forEach(element => {
          const isExist = this.stepData?.rules?.filter(x=>Number(x.ruleId)===Number(element.brId));
          if(isExist && isExist.length>0){
            element.isAssigned=true;
          }else{
            element.isAssigned=false;
          }
        });
        this.allBrData = [...this.allBrData, ...res];
        this.brData = [...this.brData, ...res]
      }
    });
  }

  close() {
    this.router.navigate([{ outlets: { [this.outlet]: null } }], {queryParamsHandling: 'preserve'});
  }
  /**
   * to convert rule type into rule description
   * @param ruleType ruleType of a business rule object
   */
  public getRuleDesc(ruleType: string) {
    return RULE_TYPES.find((rule) => rule.ruleType === ruleType)?.ruleDesc;
  }

  assignRule(element: any) {
    if(this.requestedForBrTye) {
      this.allBrData.forEach(e=> e.isAssigned = false);
      element.isAssigned = !element.isAssigned;
    } else {
      element.isAssigned = !element.isAssigned;
    }

  }

  getAssignedRules() {
    this.brData = this.allBrData.filter(x => x.isAssigned);
  }
  getUnAssignedRules() {
    this.brData = this.allBrData.filter(x => !x.isAssigned);
  }

  getRuleByRuleType(type: any) {
    if (type === 'All') {
      this.brData = this.allBrData;
    } else {
      this.brData = this.allBrData.filter(x => x.ruleDesc.toLowerCase() === type.ruleDesc.toLowerCase());
    }
  }
  saveRuleData() {
    if ((!this.referenceDatasetId || this.referenceDatasetId.length <= 0) && !this.requestedForBrTye) {
      this.transientService.open('Cannnot save rules without reference dataset', null, { duration: 2000, verticalPosition: 'bottom' });
      return;
    }
    const data = this.allBrData.filter(x => x.isAssigned);// assigned rules
    const dataArray = [];
    data.forEach(obj => {
      dataArray.push({
        ruleId: obj.brId,
        ruleType: obj.brType,
        executionType: '',
        dataSetId: obj.moduleId,
        brInfo: obj.brInfo,
      })
    })
    const request = dataArray;
    this.taskListService.saveUpdateRuleForm(this.flowId, this.stepId, this.formsModel, request).subscribe(res => {
      console.log(JSON.stringify(res));
      this.transientService.open(res?.message, null, { duration: 2000, verticalPosition: 'bottom' });
      this.sharedServices.updateStepsData(true);
      this.close();
    })
  }
}
