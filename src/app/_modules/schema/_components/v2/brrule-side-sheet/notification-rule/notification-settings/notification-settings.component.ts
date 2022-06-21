import { Component, forwardRef, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import FormField from '@models/form-field';
import { EmailTemplateReqParam, TemplateModelResponse } from '@models/notif/notif.model';
import { NotifService } from '@services/notif/notif.service';
import { of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { NotificationPriority, NotificationType } from '../notification-rule.modal';

@Component({
  selector: 'pros-notification-settings',
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => NotificationSettingsComponent)
    }
  ]
})
export class NotificationSettingsComponent extends FormField implements OnInit {

  notificationForm: FormGroup;

  moduleId = '';

  notificationType = NotificationType;
  notificationPriority = NotificationPriority;
  notificationSetting = {
    type: this.notificationType[0].value,
    priority: this.notificationPriority[0].value,
    workFlowTemplate: {}
  };

  workflowTemplateList = [];
  workflowTemplateListObs = of(this.workflowTemplateList);
  workflowTemplateCtrl = new FormControl('');

  constructor(
    private fb: FormBuilder,
    private notifService: NotifService
  ) {
    super();
  }

  ngOnInit(): void {
    this.workflowTemplateCtrl.valueChanges.subscribe((value) => {
      if (typeof value === 'string') {
        this.getWorkflowTemplates(value?.toLowerCase());
      }
    });

    this.createNotificationForm();
    // this.getWorkflowTemplates('');
  }

  createNotificationForm(notificationData?) {
    this.notificationForm = this.fb.group({
      notifyType: [notificationData?.notifyType ? notificationData?.notifyType : this.notificationType[0].value],
      priority: [notificationData?.priority ? notificationData?.priority : this.notificationPriority[0].value],
      templateId: ['']
    })

    this.notificationForm.valueChanges.subscribe(data => {
      this.onChange(data);
    })
  }

  displayTemplateDetail(templateDetail) {
    return templateDetail?.templateName || '';
  }

  getWorkflowTemplates(searchText) {
    const requestParam: EmailTemplateReqParam = {
      dataSet: null,
      modifiedDate: null,
      templateName: searchText ? searchText : null,
      templateType: 'WORKFLOW',
      modifiedUser: null,
      createdUser: null,
    }
    this.notifService.getTemplate(0,50,requestParam)
    .pipe(
      catchError((err) => {
        console.log(err);
        const emptyResponse = new TemplateModelResponse();
        return of(emptyResponse);
      })
    )
    .subscribe(
      (res: TemplateModelResponse) => {
        this.workflowTemplateList = res.templateModels;
        this.workflowTemplateListObs = of(res.templateModels);
      },
      (error) => {
        console.error(`Error : ${error.message}`);
      }
    );
  }

  selectedTemplate($event) {
    if ($event?.option?.value?.id) {
      this.notificationForm.get('templateId').setValue($event?.option?.value?.id);
    }
  }

  writeValue(formData): void {
    if (formData?.moduleId) {
      this.moduleId = formData.moduleId;
      this.getWorkflowTemplates('');
    }


    if (formData?.isUpdated) {
      this.notificationForm.get('notifyType').patchValue(formData?.notifyType || '');
      this.notificationForm.get('priority').patchValue(formData?.priority || '');
      if (formData?.templateId) {
        this.getSelectedTemplateInfo(formData?.templateId);
      }
    }
  }

  getSelectedTemplateInfo(templateId) {
    this.notifService.getTemplateById(templateId).pipe(
      catchError((err) => {
        console.log(err);
        return of({templateName: 'Untitled'});
      })
    ).subscribe(resp => {
      if (resp) {
        this.workflowTemplateCtrl.setValue(resp);
      }
    });
  }
}


