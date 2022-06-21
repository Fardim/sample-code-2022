import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from '@modules/chat/_components/chat.component';
import { PageNotFoundComponent } from '@modules/shared/_components/page-not-found/page-not-found.component';
import { DefaultValuesComponent } from './_components/default-values/default-values.component';
import { EmailTemplatePreviewComponent } from './_components/email-templates-setting/email-template-preview/email-template-preview.component';
import { EmailTemplatesSettingComponent } from './_components/email-templates-setting/email-templates-setting.component';
import { UpsertEmailTemplateComponent } from './_components/email-templates-setting/upsert-email-template/upsert-email-template.component';
import { ExtensionsComponent } from './_components/extensions/extensions.component';
import { NotificationConfigComponent } from './_components/notification-config/notification-config.component';
import { PasswordPolicyComponent } from './_components/password-policy/password-policy.component';
import { DigitalSignatureComponent } from './_components/profile/digital-signature/digital-signature.component';
import { ProfileComponent } from './_components/profile/profile.component';
import { AddSamlConfigurationComponent } from './_components/saml-configuration/add-saml-configuration/add-saml-configuration.component';
import { SAMLConfigurationComponent } from './_components/saml-configuration/saml-configuration.component';
import { SettingsComponent } from './_components/settings.component';
import { TagTabComponent } from './_components/tag-tab/tag-tab.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    children: [
      { path: '', redirectTo: 'profile' },
      { path: 'profile', component: ProfileComponent },
      { path: 'roles-permissions', loadChildren: () => import('./roles.module').then((m) => m.RoleModule) },
      { path: 'classifications', loadChildren: () => import('../classifications/classifications.module').then((m) => m.ClassificationsModule) },
      { path: 'connectivity', loadChildren: () => import('./connectivity.module').then((m) => m.ConnectivityModule) },
      { path: 'notif-config', component: NotificationConfigComponent },
      { path: 'default-values', component: DefaultValuesComponent },
      { path: 'extensions', component: ExtensionsComponent },
      { path: 'tags', component: TagTabComponent },
      { path: 'password-policy', component: PasswordPolicyComponent },
      { path: 'saml-configuration', component: SAMLConfigurationComponent },
      { path: 'email-templates', component: EmailTemplatesSettingComponent },
      // { path: 'new-templates', component: UpsertEmailTemplateComponent },
      // { path: 'edit-templates/:templateId', component: UpsertEmailTemplateComponent },
      { path: 'email-templates/:templateId', component: UpsertEmailTemplateComponent },
      { path: 'teams', loadChildren: () => import('./team.module').then((m) => m.TeamModule) },
      { path: 'organization', loadChildren: () => import('./organization.module').then((m) => m.OrganizationModule) },
      { path: '', redirectTo: 'profile' },
      { path: 'packages', loadChildren: () => import('./package.module').then((m) => m.PackageModule) },
      { path: 'data-model', loadChildren: () => import('./data-model.module').then((m) => m.DataModelModule) },
    ],
  },
  { path: 'saml-configuration-view/:viewId', component: AddSamlConfigurationComponent },
  { path: 'digital-signature', component: DigitalSignatureComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'digital-signature', component: DigitalSignatureComponent },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule { }
