import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Dataset, SchemaListReq } from '@models/schema/schema';
import { RULE_TYPES } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { BusinessRules } from '@modules/admin/_components/module/schema/diw-create-businessrule/diw-create-businessrule.component';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { TaskListService } from '@services/task-list.service';
import { BehaviorSubject, forkJoin, Observable, of, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'pros-flow-sidesheet',
  templateUrl: './flow-sidesheet.component.html',
  styleUrls: ['./flow-sidesheet.component.scss']
})
export class FlowSidesheetComponent implements OnInit, OnDestroy {
  stepsData = [];
  allStepsData = [];
  flowName: any = '';
  flowDetails: any = {};
  displayedColumns = ['header', 'cell'];
  outlet = 'outer';
  reqArr: Observable<any>[] = [];
  subscriptions: Subscription[] = [];
  appliedDatasetList: Dataset[] = [];
  appliedBrList: BusinessRules[] = [];
  searchBrs: FormControl = new FormControl('');
  filterableRulesOb: Observable<BusinessRules[]> = of(RULE_TYPES);
  businessRuleTypes: BusinessRules[] = RULE_TYPES;
  filterCriteria: BehaviorSubject<SchemaListReq> = new BehaviorSubject<SchemaListReq>({
    from: 0,
    size: 10,
    schemaCriteria: [],
    searchString: '',
    sort: {}
  });
  displayedFields = ['step_name', 'step_type', 'assign', 'forms', 'interfaces', 'business_rule', 'notification'];
  flowData: any = [];
  fetchStepSecnarioMapping: Subject<any> = new Subject();
  svg: SafeHtml;

  constructor(
    private router: Router,
    private taskListService: TaskListService,
    private sharedServices: SharedServiceService,
    private sanitizer: DomSanitizer
  ) {}
  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => {
      s.unsubscribe();
    });
  }
  ngOnInit(): void {
    this.subscriptions.push(
      this.sharedServices.getFlowData().subscribe((flowObj) => {
        if (flowObj) {
          this.flowDetails = flowObj;
          this.setFlowDetails(flowObj);
          this.setStepsData(flowObj);
          this.getDiagram();
        }
      })
    );
    this.subscriptions.push(
      this.sharedServices.getUpdatedStepsData().subscribe((obj) => {
        if (obj) {
          console.log(JSON.stringify(this.flowDetails));
          this.setStepsData(this.flowDetails);
        }
      })
    );

    this.subscriptions.push(
      this.searchBrs.valueChanges.pipe(debounceTime(200), distinctUntilChanged()).subscribe((searchString) => {
        if (!searchString) this.stepsData = [...this.allStepsData];
        else
          this.stepsData = [...this.allStepsData].filter(
            (x) => x.name.toLowerCase().indexOf(searchString.toLowerCase()) > -1
          );
      })
    );

    this.fetchStepSecnarioMapping.subscribe((steps) => this.setInterfacesData(steps));
  }

  setFlowDetails(obj: any) {
    Object.keys(obj).forEach((e) => {
      if (e === 'name') {
        this.flowData.push({
          header: 'Flow Name',
          cell: obj[e]
        });
      }
    });
    this.flowData.push({
      header: 'Reference Dataset',
      cell: this.taskListService.referenceDatasetResponse
    });
  }

  setStepsData(flowObj: any) {
    if (flowObj.nodes) {
      const nodes = flowObj.nodes.filter((x) => x.type === 'HumanTaskNode' || x.type === 'WorkItemNode');
      this.setFormRuleData(nodes);
    }
  }
  /**
   * Function to close summary sidesheet on click
   */
  close() {
    this.router.navigate([{ outlets: { sb: null } }]);
  }

  /**
   * Get the filtered applied description dynamic ...
   */
  get brRuleFilterDesc() {
    return this.appliedBrList.length > 0
      ? this.appliedBrList.length === 1
        ? this.appliedBrList[0].ruleDesc
        : this.appliedBrList.length
      : 'All';
  }

  /**
   * Check whether current business rule applied or not
   * @param ckbox the current business rule ...
   * @returns will return true if exits otherwise return false
   */
  isBrAppliedChecked(ckbox: BusinessRules): boolean {
    return this.appliedBrList.some((s) => s.ruleType === ckbox.ruleType);
  }

  editStepForms(stepId: any) {
    const stepDataArr = JSON.parse(JSON.stringify(this.stepsData));
    const stepData = stepDataArr.find((step) => step.uniqueId === stepId);
    if (stepData?.forms?.findIndex((form) => form.isPrimary) < 0) {
      const findParent = stepDataArr.find((step) => step.forms.find((form) => form.isPrimary));
      if (findParent) {
        const parent = findParent.forms.find((obj) => obj.isPrimary);
        stepData.forms.push(parent);
      }
    }
    if (stepData) {
      this.sharedServices.setFlowStepData(stepData);
    }
    this.router.navigate([
      '',
      {
        outlets: {
          sb: `sb/flow/sidesheet/${this.flowDetails.id}`,
          outer: `outer/flow/form/${this.flowDetails.id}/${stepId}/${this.outlet}`
        }
      }
    ]);

    // this.router.navigate([{ outlets: { sb: `sb/flow/form/${this.flowDetails.id}/${stepId}` } }], { queryParamsHandling: 'preserve' })
  }

  /**
   * Edit the setp rules or assign new rules
   * @param stepId the step ehere need to add the business rule ...
   * @param nType the type of node which is used for diff for the rule type .
   */
  editStepRules(stepId: any, nType: string) {
    const onlyForBrType = nType === 'WorkItemNode' ? ['AUTO_EXTENSION_RULE', 'BR_CROSS_DATASET_RULE'] : [];
    const stepData = this.stepsData.filter((x) => x.uniqueId === stepId);
    if (stepData && stepData.length > 0) {
      this.sharedServices.setFlowStepData(stepData[0]);
    } else {
      this.sharedServices.setFlowStepData({});
    }
    this.router.navigate(
      [
        '',
        {
          outlets: {
            sb: `sb/flow/sidesheet/${this.flowDetails.id}`,
            outer: `outer/flow/rules/${this.flowDetails.id}/${stepId}/${this.outlet}`
          }
        }
      ],
      { queryParams: { onlyForBrType: onlyForBrType.toString() } }
    );
  }

  editStepInterfaces(stepId: any) {
    const stepData = this.stepsData.filter((x) => x.uniqueId === stepId);
    if (stepData && stepData.length > 0) {
      this.sharedServices.setFlowStepData(stepData[0]);
    } else {
      this.sharedServices.setFlowStepData({});
    }
    this.router.navigate([
      '',
      {
        outlets: {
          sb: `sb/flow/sidesheet/${this.flowDetails.id}`,
          outer: `outer/flow/interface/${this.flowDetails.id}/${stepId}/${this.outlet}`
        }
      }
    ]);
  }

  editStepNotification(stepId: any) {
    const stepData = this.stepsData.filter((x) => x.uniqueId === stepId);
    if (stepData && stepData.length > 0) {
      this.sharedServices.setFlowStepData(stepData[0]);
    } else {
      this.sharedServices.setFlowStepData({});
    }
    this.router.navigate([
      '',
      {
        outlets: {
          sb: `sb/flow/sidesheet/${this.flowDetails.id}`,
          outer: `outer/flow/notification/${this.flowDetails.id}/${stepId}/${this.outlet}`
        }
      }
    ]);
  }

  editStepPartner(stepId: any) {
    this.router.navigate([
      '',
      {
        outlets: {
          sb: `sb/flow/sidesheet/${this.flowDetails.id}`,
          outer: `outer/flow/partnerUpdate/${this.flowDetails.id}/${stepId}/${this.outlet}`
        }
      }
    ]);
  }
  mapProcessVariable() {
    const parentDataset = this.getParentDataset();
    this.router.navigate([
      '',
      {
        outlets: {
          sb: `sb/flow/sidesheet/${this.flowDetails.id}`,
          outer: `outer/flow/mapvariable/${this.flowDetails.id}/${parentDataset}/${this.outlet}`
        }
      }
    ]);
  }

  maintainProcess() {
    const parentDataset = this.getParentDataset();
    this.router.navigate([
      '',
      {
        outlets: {
          sb: `sb/flow/sidesheet/${this.flowDetails.id}}`,
          outer: `outer/flow/maintainprocess/${this.flowDetails.id}/${parentDataset}/${this.outlet}`
        }
      }
    ]);
  }

  getParentDataset() {
    const step = this.stepsData?.find((obj) => obj.forms?.find((form) => form.isPrimary));
    if (step) {
      const form = step.forms.find((obj) => obj.isPrimary);
      if (form) return form.dataSetId;
    }
    return '';
  }

  getRuleForm(step: any) {
    return new Observable((observer) => {
      this.taskListService.getRuleFormBySchemaId(step.uniqueId, this.flowDetails?.id).subscribe(
        (response: any) => {
          observer.next({
            name: step.name,
            type: step.type,
            id: step.uniqueId,
            forms: response.formModel,
            rules: response.rulesModel,
            interfaces: response.interfaceModel ? response.interfaceModel : []
          });
          observer.complete();
        },
        (err) => {
          observer.next({
            name: step.name,
            type: step.type,
            id: step.uniqueId,
            forms: [],
            rules: [],
            interfaces: []
          });
          observer.complete();
        }
      );
    });
  }
  setFormRuleData(steps: any) {
    this.taskListService.getRuleFormBySchemaIdV2(this.flowDetails?.id).subscribe(
      (res) => {
        steps = steps.map((item: any) => {
          const formRuleData = res[item.uniqueId] || {};
          return {
            ...item,
            forms: formRuleData.formModel,
            rules: formRuleData.rulesModel,
            interfaces: formRuleData.interfaceMapping
          };
        });
        this.stepsData = steps;
      },
      (error) => {
        console.log('Error' + error);
      }
    );
  }
  getTitle(data: any) {
    return RULE_TYPES.find((rule) => rule.ruleType === data.ruleType).ruleDesc;
  }

  setInterfacesData(steps: any) {
    const request = [];
    steps
      ?.filter((x) => x.type === 'WorkItemNode')
      .forEach((step) => {
        request.push(
          this.taskListService.getFlowStepSecnarioMapping(this.flowDetails?.id, step.uniqueId).pipe(
            map((v) => {
              return { [step.uniqueId]: v };
            })
          )
        );
      });
    forkJoin(request).subscribe(
      (res) => {
        this.stepsData.forEach((step) => {
          const value = res.find((mapping) => mapping.hasOwnProperty(step.id));
          step.interfaces = value ? value[step.id] || [] : [];
        });
      },
      (error) => {
        console.log('Error' + error);
      }
    );
  }

  deleteInterface(element, data) {
    debugger;
    const requestPayload: any = [];
    for (const intf of element.interfaces) {
      if (intf.uuid !== data.uuid) {
        requestPayload.push({
          systemId: intf.systemId,
          dataSetId: intf.dataSetId,
          scenarioId: intf.scenarioId
        });
      }
    }

    this.taskListService.saveFlowStepSecnarioMapping(data.flowId, data.stepId, requestPayload).subscribe(
      (res) => {
        this.sharedServices.updateStepsData(true);
      },
      (error) => {
        console.log('Error' + error);
      }
    );
  }

  deleteRuleForm(element, data, deleteForm: boolean) {
    if (deleteForm) {
      element.forms = element.forms.filter((x) => x.formId !== data.formId);
    } else {
      element.rules = element.rules.filter((x) => x.ruleId !== data.ruleId);
    }
    this.taskListService.saveUpdateRuleForm(data.flowId, data.stepId, element.forms, element.rules).subscribe(
      (res) => {
        this.setStepsData(this.flowDetails);
      },
      (error) => {
        console.error(`Error:: ${error.message}`);
      }
    );
  }

  getDiagram() {
    this.taskListService.getProcessDiagram(this.flowDetails.containerId, this.flowDetails.id).subscribe((svg) => {
      this.svg = this.sanitizer.bypassSecurityTrustHtml(svg);
    });
  }
}
