import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationRuleComponent } from './_components/v2/brrule-side-sheet/notification-rule/notification-rule.component';
import { RecipientsComponent } from './_components/v2/brrule-side-sheet/notification-rule/recipients/recipients.component';
import { NotificationSettingsComponent } from './_components/v2/brrule-side-sheet/notification-rule/notification-settings/notification-settings.component';
import { RuleSettingsComponent } from './_components/v2/brrule-side-sheet/notification-rule/rule-settings/rule-settings.component';
import { CustomTriggerComponent } from './_components/v2/brrule-side-sheet/notification-rule/custom-trigger/custom-trigger.component';
import { DateTriggerComponent } from './_components/v2/brrule-side-sheet/notification-rule/date-trigger/date-trigger.component';
import { EventTriggerComponent } from './_components/v2/brrule-side-sheet/notification-rule/event-trigger/event-trigger.component';
import { FieldValueTriggerComponent } from './_components/v2/brrule-side-sheet/notification-rule/field-value-trigger/field-value-trigger.component';
import { EmailTriggerComponent } from './_components/v2/brrule-side-sheet/notification-rule/email-trigger/email-trigger.component';
import { SharedModule } from '@modules/shared/shared.module';

@NgModule({
  declarations: [
    NotificationRuleComponent,
    RecipientsComponent,
    NotificationSettingsComponent,
    RuleSettingsComponent,
    CustomTriggerComponent,
    DateTriggerComponent,
    EventTriggerComponent,
    FieldValueTriggerComponent,
    EmailTriggerComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    NotificationRuleComponent
  ]
})
export class NotificationRuleModule { }
