import { Component, forwardRef, Inject, Input, LOCALE_ID, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import FormField from '@models/form-field';
import { FieldConfiguration } from '@models/schema/schemadetailstable';
import { ConditionBlocks } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { EmailRecipientsTypes, eventList, NotificationTrigger, NotificationTriggerType, RepeatSegmentList } from './notification-rule.modal';

@Component({
  selector: 'pros-notification-rule',
  templateUrl: './notification-rule.component.html',
  styleUrls: ['./notification-rule.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => NotificationRuleComponent)
    }]
})
export class NotificationRuleComponent extends FormField implements OnInit, OnChanges {

  notificationRuleFormGroup: FormGroup;
  notificationTrigger = NotificationTrigger;

  @Input() moduleId = '';

  /**
   * source field array from a module
   */
   @Input()
   sourceFieldsObject: FieldConfiguration = {
     valueKey: '',
     labelKey: '',
     list: []
   };

  constructor(
    @Inject(LOCALE_ID) public locale: string,
    private fb: FormBuilder
  ) {
    super();
   }

  ngOnInit(): void {
    this.createNotificationFormGroup();
  }

  createNotificationFormGroup() {
    this.notificationRuleFormGroup = this.fb.group({
      uuid: [''],
      trigger: [this.notificationTrigger[0].value],
      dateRuleSetting: [{}],
      eventRuleSetting: [{}],
      fieldValueRuleSetting: [{}],
      emailRuleSetting: [{}],
      customRuleSetting: [{}],
      notificationSetting: [{}],
      Recipients: [{}],
      isFormValid: [false],
      isFormSaved: [false]
    })

    this.checkForNotificationRuleForm();


    this.notificationRuleFormGroup.get('notificationSetting').patchValue({
      moduleId: this.moduleId
    })
  }

  checkForNotificationRuleForm() {
    this.notificationRuleFormGroup.valueChanges.subscribe(data => {
      this.onChange(data);
    })
  }

  writeValue(data): void {
    if (data?.businessRuleInfo?.notifInfo?.uuid) {
      const notifInfo = data.businessRuleInfo.notifInfo;
      this.notificationRuleFormGroup.get('trigger').patchValue(notifInfo?.ruleType);
      this.patchDefaultElementEvent(notifInfo,data.editValue);
      this.patchNotificationFormValue(notifInfo,data.editValue,data?.businessRuleInfo?.udrData);

    }

      this.notificationRuleFormGroup.get('isFormSaved').setValue(data?.notificationInfo?.isNotificationFormSaved ? data?.notificationInfo?.isNotificationFormSaved : false);
      if (data?.hasOwnProperty('isNotificationFormSaved')) {
        this.isNotificationSaveFormValue(data);
      }
  }

  patchNotificationFormValue(notifInfo?,editValue?, udrnotifInfo?: ConditionBlocks) {
    if (editValue) {
      switch (this.notificationRuleFormGroup.get('trigger').value) {
        case NotificationTriggerType.DATE:
          this.notificationRuleFormGroup.get('dateRuleSetting').patchValue({
            date: notifInfo?.fieldArr?.length ? notifInfo?.fieldArr[0].fieldId : '',
            dateRepeat: {
              starts: notifInfo.startTime || '',
              ends: notifInfo.endTime || '',
              every: notifInfo.intervalData || '',
              occurrence: notifInfo.repeatCount || '',
              repeat: RepeatSegmentList.find(repeat => repeat.value === notifInfo?.reminder) || RepeatSegmentList[0]
            },
            isUpdated: editValue || false
          })
          break;
        case NotificationTriggerType.EMAIL:
          this.notificationRuleFormGroup.get('emailRuleSetting').patchValue({
            emailFieldIds: notifInfo?.fieldArr?.length ? notifInfo?.fieldArr : [],
            isUpdated: editValue || false
          })
          break;
        case NotificationTriggerType.FIELD:
          this.notificationRuleFormGroup.get('fieldValueRuleSetting').patchValue({
            fieldValues: notifInfo?.fieldArr?.length ? notifInfo?.fieldArr : '',
            isUpdated: editValue || false
          })
          break;
        case NotificationTriggerType.UDR:
          this.notificationRuleFormGroup.get('customRuleSetting').patchValue({
            udrId: notifInfo?.urdId ? notifInfo?.urdId : '',
            blockedList: udrnotifInfo?.when || [],
            isUpdated: editValue || false
          })
          break;
        default:
          break;
      }
    }
  }

  patchDefaultElementEvent(notifInfo,isUpdateValue) {
    if (isUpdateValue) {
      this.notificationRuleFormGroup.get('uuid').patchValue(notifInfo?.uuid);
    }
    this.notificationRuleFormGroup.get('eventRuleSetting').patchValue({
      ...this.notificationRuleFormGroup.get('eventRuleSetting').value,
      event: eventList.find(event => event.value === notifInfo?.eventName) || null,
      isUpdated: isUpdateValue || false
    })

    this.notificationRuleFormGroup.get('notificationSetting').patchValue({
      ...this.notificationRuleFormGroup.get('notificationSetting').value,
      notifyType: notifInfo?.notifyType || '',
      priority: notifInfo?.priority || '',
      templateId: notifInfo?.templateId || '',
      isUpdated: isUpdateValue || false
    })

    this.notificationRuleFormGroup.get('Recipients').patchValue({
      ...this.notificationRuleFormGroup.get('Recipients').value,
      emailRecipients: notifInfo?.reciptients.map((recipient) => {
        return {
          recipType: recipient?.recipType,
          recipValue: recipient?.recipValue
        };
      }),
      cc: notifInfo?.cc || [],
      isUpdated: isUpdateValue || false
    });
  }

  isNotificationSaveFormValue(data) {
    const isFormSaved = { isFormSaved: data?.isNotificationFormSaved ? data?.isNotificationFormSaved : false}
    this.patchFormValue('notificationSetting',isFormSaved);
    this.patchFormValue('Recipients',isFormSaved);
    this.patchFormValue('eventRuleSetting',isFormSaved);

    switch (this.notificationRuleFormGroup.get('trigger').value) {
      case NotificationTriggerType.DATE:
        this.patchFormValue('dateRuleSetting',isFormSaved);
        break;
      case NotificationTriggerType.EMAIL:
        this.patchFormValue('emailRuleSetting',isFormSaved);
        break;
      case NotificationTriggerType.FIELD:
        this.patchFormValue('fieldValueRuleSetting',isFormSaved);
        break;
      case NotificationTriggerType.UDR:
        this.patchFormValue('customRuleSetting',isFormSaved);
        break;
      default:
        break;
    }
  }

  patchFormValue(formType,isFormSaved) {
    this.notificationRuleFormGroup.get(formType).patchValue({
      ...this.notificationRuleFormGroup.get(formType).value,
      isFormSaved
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.sourceFieldsObject.currentValue) {
      this.sourceFieldsObject = {...changes.sourceFieldsObject.currentValue};
    }
  }

}
