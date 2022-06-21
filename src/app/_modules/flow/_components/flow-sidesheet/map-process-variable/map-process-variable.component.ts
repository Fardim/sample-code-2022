import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dataset } from '@models/schema/schema';
import { CoreSchemaBrInfo } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { Metadata } from '@modules/report/edit/container/metadatafield-control/metadatafield-control.component';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { FieldCtrl } from '@modules/transaction/model/transaction';
import { TaskListService } from '@services/task-list.service';
import { TransientService } from 'mdo-ui-library';
import { Observable, of, Subscription } from 'rxjs';
import { assignData } from '../process-variable/process-variable.component';

export class ProcessVariableModel {
  assignValues: any;
  fieldId: any;
  fieldValue: string;
  fldctrl: FieldCtrl;
  process: string;
  ruleDesc?: string;
  ruleId: any;
}

@Component({
  selector: 'pros-map-process-variable',
  templateUrl: './map-process-variable.component.html',
  styleUrls: ['./map-process-variable.component.scss']
})
export class MapProcessVariableComponent implements OnInit {
  processVariableForm: FormGroup;
  pVarData: any = [];

  outlet;
  /**
   * Dataset which will use for filter the list based on this ....
   */
  filterableDatasetOb: Observable<Dataset[]> = of([]);
  displayedColumns = [
    'header', 'assignValue', 'fieldValue', 'process'
  ]
  dataModel: any = {};

  subscriptions: Subscription[] = [];

  constructor(private activateRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private taskListService: TaskListService,
    private transientService: TransientService,
    private sharedServices: SharedServiceService
  ) { }

  get processVariables() {
    return this.processVariableForm.controls.processVariables as FormArray;
  }
  ngOnInit(): void {
    this.activateRoute.params.subscribe((params) => {
      this.dataModel =
      {
        stepId: params.stepId,
        flowId: params.id,
        outlet: params.outlet,
        datasetId: params.datasetId
      }
    });
    this.createProcessVariableForm();

    this.subscriptions.push(this.sharedServices.getFlowData().subscribe(flowObj => {
      if (flowObj) {
        Object.keys(flowObj?.processVariables).forEach(e=>{
          if(e !== 'isRejectable') {
            this.processVariables.push(this.newProcess({process: e} as ProcessVariableModel));
          }
        });
      }
    }));


    if (this.dataModel.datasetId && this.dataModel.datasetId > 0) {
      this.taskListService.getAllProvessVMappings(this.dataModel.flowId, this.dataModel.datasetId, 0, 20).subscribe(processData => {
        this.setProcessvariableData(processData);// pass process data later
      });
    }
  }
  createProcessVariableForm() {
    this.processVariableForm = this.fb.group({
      processVariables: this.fb.array([], [Validators.required])
    });
  }
  addProcessVariable() {
    this.processVariables.push(this.newProcess());
  }

  newProcess(p?: ProcessVariableModel) {
    return new FormGroup({
      process: new FormControl(p.process || ''),
      assignValues: new FormControl(p.assignValues || '', Validators.required),
      fieldId: new FormControl(p.fieldId || ''),
      fieldValue: new FormControl(p.fieldValue || ''),
      ruleId: new FormControl(p.ruleId || ''),
      fldctrl: new FormControl(''),
      ruleDesc: new FormControl('')
    });
  }
  setProcessvariableData(processData: ProcessVariableModel[]) {
    // transform data befor patch ...
    processData.forEach(p=>{
      p.fieldId = p.fldctrl || p.fieldId,
      p.assignValues = assignData.find(f=> f.c === p.assignValues) || null,
      p.fieldValue = p.fieldValue || '',
      p.process = p.process || '',
      p.ruleId = {brId: p.ruleId, brIdStr: p.ruleId , brInfo: p.ruleDesc} as CoreSchemaBrInfo;
    });

    // patch the value in that control
    this.processVariables.controls.forEach(f=>{
      const ppData = processData.find(pdf=> pdf.process === f?.value?.process);
      if(ppData) {
        f.patchValue(ppData);
      }
    });
    console.log(this.processVariables);
  }
  close() {
    this.router.navigate([{ outlets: { outer: null } }], { queryParamsHandling: 'preserve' });
  }
  saveProcessVariable() {
    const request = [];

    const controls = this.processVariableForm.controls.processVariables.value;
    controls.forEach(obj => {
      if(obj.assignValues.c) {
        const reqObj = {
          assignValues: obj.assignValues.c || '',
          fieldId: obj.fieldId.fieldId || '',
          fieldValue: obj.fieldValue || '',
          process: obj.process,
          ruleId: obj.ruleId.brIdStr || ''
        }
        request.push(reqObj);
      }
    })
    this.taskListService.saveProcessVMapping(this.dataModel.flowId, request).subscribe(res => {
      this.close();
      this.transientService.open(res?.message, null, { duration: 2000, verticalPosition: 'bottom' });

    })
  }
}
