import { SettingsSharedModule } from './settings-shared.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatModule } from '@modules/chat/chat.module';
import { SharedModule } from '@modules/shared/shared.module';
import { SettingsRoutingModule } from './settings-routing.module';
import { ConnectivityComponent } from './_components/connectivity/connectivity.component';
import { DefaultValuesComponent } from './_components/default-values/default-values.component';
import { EmailTemplatesFiltersComponent } from './_components/email-templates-setting/email-templates-filters/email-templates-filters.component';
import { EmailTemplatesSettingComponent } from './_components/email-templates-setting/email-templates-setting.component';
import { UpsertEmailTemplateComponent } from './_components/email-templates-setting/upsert-email-template/upsert-email-template.component';
import { ExtensionsComponent } from './_components/extensions/extensions.component';
import { IntergrationsComponent } from './_components/intergrations/intergrations.component';
import { NotificationConfigComponent } from './_components/notification-config/notification-config.component';
import { PasswordPolicyComponent } from './_components/password-policy/password-policy.component';
import { ChangePasswordDialogComponent } from './_components/profile/change-password-dialog/change-password-dialog.component';
import { DigitalSignatureComponent } from './_components/profile/digital-signature/digital-signature.component';
import { ProfileComponent } from './_components/profile/profile.component';
import { RolesPermissionsComponent } from './_components/roles-permissions/roles-permissions.component';
import { AddSamlConfigurationComponent } from './_components/saml-configuration/add-saml-configuration/add-saml-configuration.component';
import { GenerateUrlComponent } from './_components/saml-configuration/generate-url/generate-url.component';
import { SAMLConfigurationComponent } from './_components/saml-configuration/saml-configuration.component';
import { SettingsComponent } from './_components/settings.component';
import { MergeTagDialogComponent } from './_components/tag-tab/merge-tag-dialog/merge-tag-dialog.component';
import { TagTabComponent } from './_components/tag-tab/tag-tab.component';
import { UserProfileComponent } from './_components/team/user-profile/user-profile.component';
import { TeamsComponent } from './_components/teams/teams.component';
import { EmailTemplatePreviewComponent } from './_components/email-templates-setting/email-template-preview/email-template-preview.component';
import { DynamicAttachmentComponent } from './_components/email-templates-setting/dynamic-attachment/dynamic-attachment.component';
@NgModule({
  declarations: [
    SettingsComponent,
    ProfileComponent,
    ChangePasswordDialogComponent,
    DigitalSignatureComponent,
    TagTabComponent,
    RolesPermissionsComponent,
    TeamsComponent,
    PasswordPolicyComponent,
    MergeTagDialogComponent,
    NotificationConfigComponent,
    ConnectivityComponent,
    IntergrationsComponent,
    EmailTemplatesSettingComponent,
    DefaultValuesComponent,
    ExtensionsComponent,
    UserProfileComponent,
    EmailTemplatesFiltersComponent,
    UpsertEmailTemplateComponent,
    SAMLConfigurationComponent,
    AddSamlConfigurationComponent,
    GenerateUrlComponent,
    EmailTemplatePreviewComponent,
    DynamicAttachmentComponent
  ],
  imports: [
    CommonModule,
    SettingsSharedModule,
    SettingsRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    ChatModule,
  ],
  providers: [MergeTagDialogComponent]
})
export class SettingsModule { }
