import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { GlobaldialogService } from '@services/globaldialog.service';
import { TaskListService } from '@services/task-list.service';
import { TransientService } from 'mdo-ui-library';

@Component({
  selector: 'pros-step-interface-update',
  templateUrl: './step-interface-update.component.html',
  styleUrls: ['./step-interface-update.component.scss']
})
export class StepInterfaceUpdateComponent implements OnInit {
  dataModel: any = {};
  interfaceForm: FormGroup;
  submitted = false;
  constructor(
    private activateRoute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private sharedServices: SharedServiceService,
    public globalDialogService: GlobaldialogService,
    private taskListService: TaskListService,
    private transientService: TransientService
  ) {}

  ngOnInit(): void {
    this.activateRoute.params.subscribe((params) => {
      this.dataModel.stepId = params.stepId;
      this.dataModel.flowId = params.id;
      this.dataModel.outlet = params.outlet;
    });
    this.createInterfaceForm();
    this.sharedServices.getFlowStepData().subscribe((stepData: any) => {
      if (stepData) {
        this.dataModel.rulesModel = stepData.rules;
        this.dataModel.formModel = stepData.forms;
        this.dataModel.interfaceModel = stepData.interfaces || [];
        if (stepData?.interfaces?.length > 0) {
          this.patchInterfaceData();
        } else {
          this.addTargetSystem();
        }
      }
    });
  }

  patchInterfaceData() {
    this.dataModel.interfaceModel.forEach((element: any) => {
      const system = element.system || { connectionId: element?.systemId, connectionDescription: element?.systemDesc };
      const dataset = { moduleId: element?.dataSetId, moduleDesc: element?.dataSetDesc };
      const intf = element?.intf || { interfaceId: element?.scenarioId, name: element?.senarioDesc };
      const formControl = new FormControl(
        {
          system,
          dataset,
          interface: intf
        },
        [Validators.required]
      );
      this.interfaces.push(formControl);
    });
  }
  createInterfaceForm() {
    this.interfaceForm = this.fb.group({
      interfaces: this.fb.array([], [Validators.required])
    });
  }

  get interfaces() {
    return this.interfaceForm.controls.interfaces as FormArray;
  }

  addTargetSystem() {
    this.interfaces.push(this.newInterface());
  }

  newInterface() {
    return new FormControl({ system: '', dataset: '', interface: '' }, [Validators.required]);
  }

  setProcessvariableData(interfaceData: any) {
    interfaceData.forEach((element) => {
      const formControl = new FormControl(
        { system: element.system, dataset: element.dataset, interface: element.interface },
        [Validators.required]
      );
      this.interfaces.push(formControl);
    });
  }

  close() {
    this.router.navigate([{ outlets: { outer: null } }], { queryParamsHandling: 'preserve' });
  }
  saveInterfaces() {
    this.submitted = true;

    if (
      this.interfaces.value.some((v) => !v.system?.connectionId || !v.dataset?.moduleId || !v.interface?.interfaceId)
    ) {
      this.transientService.open('Please fix below error(s).', null, { duration: 2000, verticalPosition: 'top' });
      return;
    }

    const requestPayload = this.interfaces.value.map((obj) => {
      return {
        systemId: obj.system.connectionId,
        dataSetId: obj.dataset.moduleId,
        scenarioId: obj.interface.interfaceId
      };
    });
    this.taskListService
      .saveFlowStepSecnarioMapping(this.dataModel.flowId, this.dataModel.stepId, requestPayload)
      .subscribe(
        (res) => {
          this.sharedServices.updateStepsData(true);
          this.close();
        },
        (error) => {
          console.log('Error' + error);
        }
      );
  }

  removeRow(index) {
    this.globalDialogService.confirm({ label: 'Are you sure you want to delete this ?' }, (resp) => {
      if (resp && resp === 'yes') {
        this.interfaces.removeAt(index);
      }
    });
  }
}
