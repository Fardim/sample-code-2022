


import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmailTemplateReqParam, TemplateModel } from '@models/notif/notif.model';
import { Dataset } from '@models/schema/schema';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { CoreService } from '@services/core/core.service';
import { GlobaldialogService } from '@services/globaldialog.service';
import { NotifService } from '@services/notif/notif.service';
import { RuleService } from '@services/rule/rule.service';
import { TaskListService } from '@services/task-list.service';
import { TransientService } from 'mdo-ui-library';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { debounce } from 'lodash';

export class NotificationModel {
  dataset: string;
  event: string;
  template: string;
}

@Component({
  selector: 'pros-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit {

  /**
   * Hold the step information..
   */
  dataModel: any = {};

  /**
   * frm grp for to hold all the element ...
   */
  notificationForm: FormGroup;

  submitted = false;

  /**
   * Obserable for datasets ...
   */
  dataset$: Observable<Dataset[]> = of([]);

  /**
   * Obserable for the events ...
   */
  events$: Observable<any[]> = of([{
    c: 'REJ',
    t: 'Reject'
  }, {
    c: 'APP',
    t: 'Approve'
  }, {
    c: 'DEL',
    t: 'Delegated'
  }]);

  /**
   * Hold the active element type ...
   */
  activeElementType: string;

  /**
   * Obserable for  templates..
   */
  templates$: Observable<TemplateModel[]> = of([]);

  /**
   * Search the templates ...
   */
  delayedCallForApis = debounce((searchText: string = '', datasetId: string) => {
    this.templates$ = this.notifService.getTemplate(0, 50, { dataSet: datasetId, templateName: searchText } as EmailTemplateReqParam).pipe(map(m => {
      return m.templateModels || []
    }));
  }, 400);

  constructor(
    private activateRoute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private sharedServices: SharedServiceService,
    public globalDialogService: GlobaldialogService,
    private taskListService: TaskListService,
    private transientService: TransientService,
    private coreService: CoreService,
    private notifService: NotifService
  ) { }

  ngOnInit(): void {
    this.createnotificationForm();

    this.activateRoute.params.subscribe((params) => {
      this.dataModel.stepId = params.stepId;
      this.dataModel.flowId = params.id;
      this.dataModel.outlet = params.outlet;
    });

    this.sharedServices.getFlowStepData().subscribe((stepData: any) => {
      if (stepData) {
        this.dataModel.rulesModel = stepData.rules;
        this.dataModel.formModel = stepData.forms;
        this.dataModel.interfaceModel = stepData.interfaceModel || [];
        this.dataModel.notifications = stepData.notifications || [];
        if (stepData?.notifications?.length > 0) {
          this.patchNotification();
        } else {
          this.addTargetSystem();
        }
      }
    });
    this.dataset$ = this.coreService.getDataSets('', 0, 50);
    this.delayedCallForApisFun("", "");
    /*  this.templates$ = this.notifService.getTemplate(0,50,{dataSet:'',templateName:''} as EmailTemplateReqParam).pipe(map(m=>{
       return m.templateModels || []
     })); */
  }

  /**
   * get the template after module selection ...
   * @param idx the index of that row ...
   * @param event value of that input
   */
  getTemplate(idx: number, event) {
    const value = event?.taget?.value || '';
    const dataSet = this.notifications.at(idx)?.get('dataset')?.value?.moduleId || '';
    if (!dataSet) {
      throw new Error(`Dataset id can't be nulll or empty`);
    }
    this.delayedCallForApisFun(value, dataSet);
  }
  delayedCallForApisFun(searchText: string = '', datasetId: string) {
    this.templates$ = this.notifService.getTemplate(0, 50, { dataSet: datasetId, templateName: searchText } as EmailTemplateReqParam).pipe(
      debounceTime(100),
      map(m => {
        return m.templateModels || []
      }));
  }


  patchNotification() {
    this.dataModel.notificationModel.forEach((element: any) => {
      this.notifications.push(this.addNotification(element));
    });
  }

  createnotificationForm() {
    this.notificationForm = this.fb.group({
      notifications: this.fb.array([], [Validators.required]),
    });
  }

  get notifications() {
    return this.notificationForm.controls.notifications as FormArray;
  }


  addTargetSystem() {
    this.notifications.push(this.addNotification());
  }

  addNotification(n?: NotificationModel) {
    return new FormGroup({
      dataset: new FormControl(n?.dataset || '', Validators.required),
      event: new FormControl(n?.event || '', Validators.required),
      template: new FormControl(n?.template || '', Validators.required)
    });
  }


  close() {
    this.router.navigate([{ outlets: { outer: null } }], { queryParamsHandling: 'preserve' });
  }
  save() {
    this.submitted = true;
    const checkValExists = this.notifications.value.some((v) => {
      if (v.system) {
        return !v.system?.connectionId;
      } else if (v.dataset) {
        return !v.dataset?.moduleId;
      } else {
        return !v.interface?.interfaceId
      }
    })
    if (checkValExists) {
      this.transientService.open('Please fix below error(s).', null, { duration: 2000, verticalPosition: 'top' });
      return;
    }

    const requests: Observable<any>[] = [];
    this.notifications.value.forEach((obj) => {
      const reqObj = {
        systemId: obj.system?.connectionId,
        dataSetId: obj.dataset?.moduleId,
        scenarioId: obj.interface?.interfaceId,
      };
      requests.push(
        this.taskListService.saveFlowStepSecnarioMapping(this.dataModel.flowId, this.dataModel.stepId, reqObj)
      );
    });

    forkJoin(requests).subscribe(
      (res) => {
        console.log(res);
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
        this.notifications.removeAt(index);
      }
    });
  }

  displayFn(obj): string {
    return (obj.moduleDesc || obj.t || obj.templateName) || (obj.moduleId || obj.c || obj.id);
  }

}