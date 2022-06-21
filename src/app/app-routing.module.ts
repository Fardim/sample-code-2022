import { RoleUsersComponent } from './_modules/settings/_components/roles-permissions/role-users/role-users.component';
import { ListValueSidesheetComponent } from './_modules/list/_components/list-value-sidesheet/list-value-sidesheet.component';
import { TeamInviteComponent } from './_modules/settings/_components/team/team-invite/team-invite.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './_modules/shared/_components/page-not-found/page-not-found.component';
import { NewBusinessRulesComponent } from '@modules/schema/_components/new-business-rules/new-business-rules.component';
import { SystemTrayComponent } from '@modules/home/_components/system-tray/system-tray.component';
import { AuthGuard } from './_guards/auth.guard';
import { UserProfileComponent } from '@modules/settings/_components/team/user-profile/user-profile.component';
import { EditConnectionComponent } from './_modules/settings/_components/connectivity/views/edit-connection/edit-connection.component';
import { EditInterfaceComponent } from '@modules/settings/_components/connectivity/views/edit-interface/edit-interface.component';
import { PreviewMappingComponent } from '@modules/settings/_components/connectivity/views/preview-mapping/preview-mapping.component';
import { AddDaxeComponent } from '@modules/settings/_components/connectivity/views/add-daxe/add-daxe.component';
import { SyncFreqComponent } from '@modules/settings/_components/connectivity/views/sync-freq/sync-freq.component';
import { PayloadTestComponent } from '@modules/settings/_components/connectivity/views/payload-test/payload-test.component';
import { NewInterfaceComponent } from '@modules/settings/_components/connectivity/views/new-interface/new-interface.component';
import { ExportInterfaceComponent } from '@modules/settings/_components/connectivity/views/export-interface/export-interface.component';

import { NewRoleComponent } from '@modules/settings/_components/roles-permissions/new-role/new-role.component';
import { EditRoleComponent } from '@modules/settings/_components/roles-permissions/edit-role/edit-role.component';
import { ConnectToSalesforceComponent } from './_modules/list/_components/connector/connect-to-salesforce/connect-to-salesforce.component';
import { ClassTypeMutationSideSheetComponent } from '@modules/classifications/_components/class-type-mutation-side-sheet/class-type-mutation-side-sheet.component';
import { NumberSettingsFormComponent } from './_modules/list/_components/number-settings-form/number-settings-form.component';
import { CharacteristicsMutationSideSheetComponent } from '@modules/classifications/_components/class-characteristics/characteristics-mutation-side-sheet/characteristics-mutation-side-sheet.component';
import { CharacteristicsMutationNewLanguageComponent } from './_modules/classifications/_components/class-characteristics/characteristics-mutation-side-sheet/characteristics-mutation/characteristics-mutation-new-language/characteristics-mutation-new-language.component';
import { ClassLanguageSideSheetComponent } from '@modules/classifications/_components/class-language-side-sheet/class-language-side-sheet.component';
// import { TransactionMaterialDescriptionAddComponent } from '@modules/transaction/elements/transaction-material-description-add/transaction-material-description-add.component';
import { ClassMutationSideSheetComponent } from '@modules/classifications/_components/class-mutation-side-sheet/class-mutation-side-sheet.component';
import { ImportSidesheetComponent } from '@modules/connekthub';
import { TransactionGenerateDescriptionAddComponent } from '@modules/transaction/elements/transaction-generate-description-add/transaction-generate-description-add.component';
import { CharacteristicEditComponentComponent } from '@modules/classifications/_components/characteristic-edit-component/characteristic-edit-component.component';
import { MapClassSideSheetComponent } from '@modules/classifications/_components/map-class-side-sheet/map-class-side-sheet.component';
import { CharacteristicLanguagesComponent } from '@modules/classifications/_components/class-characteristics/characteristics-mutation-side-sheet/characteristics-mutation/characteristic-languages/characteristic-languages.component';
import { DimensionsUomSideSheetComponent } from '@modules/classifications/_components/dimensions-uom-side-sheet/dimensions-uom-side-sheet.component';
import { ScheduleComponent } from '@modules/shared/_components/schedule/schedule.component';
import { DatascopeSidesheetComponent } from '@modules/schema/_components/datascope-sidesheet/datascope-sidesheet.component';
import { CharacteristicsDetailSideSheetComponent } from '@modules/classifications/_components/characteristics-detail-side-sheet/characteristics-detail-side-sheet.component';
import { ClassTypeTranslateSideSheetComponent } from '@modules/classifications/_components/class-type-translate-side-sheet/class-type-translate-side-sheet.component';
import { DatasetRecordMappingComponent } from '@modules/settings/_components/team/dataset-record-mapping/dataset-record-mapping.component';
import { PackageComponent } from '@modules/settings/_components/package/package/package.component';
import { TenantComponent } from '@modules/settings/_components/organization/tenant-list/tenant/tenant.component';
import { EmailTemplatePreviewComponent } from '@modules/settings/_components/email-templates-setting/email-template-preview/email-template-preview.component';
import { CreatedPackageComponent } from '@modules/settings/_components/package/created-package/created-package.component';
import { DataModelComponent } from '@modules/settings/_components/data-model/data-model/data-model.component';
import { CharacteristicsReorderComponent } from '@modules/classifications/_components/characteristics-reorder/characteristics-reorder.component';
import { CharacteristicsExpansionViewDialogComponent } from '@modules/classifications/_components/class-characteristics/characteristics-expansion-view-dialog/characteristics-expansion-view-dialog.component';
import { DataModelConditionComponent } from '@modules/settings/_components/data-model/data-model-condition/data-model-condition.component';
import { DataRestrictionComponent } from '@modules/settings/_components/roles-permissions/data-restriction/data-restriction.component';
import { UpsertPdfTemplateComponent } from '@modules/list/_components/pdf-template-builder/upsert-pdf-template/upsert-pdf-template.component';
import { ListFilterComponent } from '@modules/list/_components/list-filter/list-filter.component';
import { ProfileComponent } from '@modules/settings/_components/profile/profile.component';
import { ConnekthubPackageComponent } from '@modules/settings/_components/package/connekthub-packages/connekthub-packages.component';


const routes: Routes = [
  { path: '', redirectTo: '/home/dash/welcome', pathMatch: 'full' },
  { path: 'auth', loadChildren: () => import('./_modules/auth/auth.module').then((m) => m.AuthModule) },
  { path: 'admin', loadChildren: () => import('./_modules/admin/admin.module').then((m) => m.AdminModule), canActivate: [AuthGuard] },
  { path: 'home', loadChildren: () => import('./_modules/home/home.module').then((m) => m.HomeModule), canActivate: [AuthGuard] },
  { path: 'nonav', loadChildren: () => import('./_modules/nonav/nonav.module').then((m) => m.NonavModule), canActivate: [AuthGuard] },
  { path: 'sb/schema', loadChildren: () => import('./_modules/schema/schema.module').then((m) => m.SchemaModule), outlet: 'sb' },
  { path: 'sb/flow', loadChildren: () => import('./_modules/flow/flow.module').then((m) => m.FlowModule), outlet: 'sb' },
  { path: 'outer/flow', loadChildren: () => import('./_modules/flow/flow.module').then((m) => m.FlowModule), outlet: 'outer' },
  { path: 'sb3/flow', loadChildren: () => import('./_modules/flow/flow.module').then((m) => m.FlowModule), outlet: 'sb3' },
  { path: 'outer/schema', loadChildren: () => import('./_modules/schema/schema.module').then((m) => m.SchemaModule), outlet: 'outer' },
  { path: 'sb3/schema', loadChildren: () => import('./_modules/schema/schema.module').then((m) => m.SchemaModule), outlet: 'sb3' },
  { path: 'sb/list', loadChildren: () => import('./_modules/list/list.module').then((m) => m.ListModule), outlet: 'sb' },
  { path: 'outer/list', loadChildren: () => import('./_modules/list/list.module').then((m) => m.ListModule), outlet: 'outer' },
  { path: 'sb/number-settings-form/:moduleId/:id', component: NumberSettingsFormComponent, outlet: 'sb' },
  { path: 'outer/number-settings-form/:moduleId/:id', component: NumberSettingsFormComponent, outlet: 'outer' },
  { path: 'sb3/list', loadChildren: () => import('./_modules/list/list.module').then((m) => m.ListModule), outlet: 'sb3' },
  { path: 'sb/settings', loadChildren: () => import('./_modules/settings/settings.module').then((m) => m.SettingsModule), outlet: 'sb' },
  { path: 'sb/profile', component: ProfileComponent, outlet: 'sb' },
  { path: 'sb/conneckthubPackage', component: ConnekthubPackageComponent, outlet: 'sb' },
  {
    path: 'outer/settings',
    loadChildren: () => import('./_modules/settings/settings.module').then((m) => m.SettingsModule),
    outlet: 'outer',
  },
  { path: 'sb/connectHub',component:ImportSidesheetComponent,outlet:'sb'},
  { path: 'outer/connectHub',component:ImportSidesheetComponent,outlet:'outer'},
  { path: 'outer/classifications/dropdown-values/:dependentfieldType/:fieldId', component: ListValueSidesheetComponent, outlet: 'outer' },
  { path: 'sb3/classifications/dropdown-values/:dependentfieldType/:fieldId', component: ListValueSidesheetComponent, outlet: 'sb3' },
  { path: 'outer/classifications/class-types/new', component: ClassTypeMutationSideSheetComponent, outlet: 'outer' },
  { path: 'outer/classifications/class-types/translate', component: ClassTypeTranslateSideSheetComponent, outlet: 'outer' },
  { path: 'outer/classifications/class-types/:classTypeId', component: ClassTypeMutationSideSheetComponent, outlet: 'outer' },
  { path: 'outer/classifications/classes/new', component: ClassMutationSideSheetComponent, outlet: 'outer' },
  { path: 'outer/classifications/dimensions', component: DimensionsUomSideSheetComponent, outlet: 'outer' },
  { path: 'outer/classifications/classes/:classId/mapping', component: MapClassSideSheetComponent, outlet: 'outer' },
  { path: 'outer/characteristics/:id/:action', component: CharacteristicEditComponentComponent, outlet: 'outer' },
  { path: 'outer/classifications/classes/:uid/languages', component: ClassLanguageSideSheetComponent, outlet: 'outer' },
  { path: 'outer/classifications/classes/:classId', component: ClassMutationSideSheetComponent, outlet: 'outer' },
  { path: 'outer/classifications/class-type/:moduleId/:classTypeId/outer/schedule-sync', component: ScheduleComponent, outlet: 'outer' },
  { path: ':outlet/classifications/characteristics-details/:classId/:datasetId/:title/:showActions', component: CharacteristicsDetailSideSheetComponent, outlet: 'outer' },

  { path: 'outer/connectivity/edit-interface', component: EditInterfaceComponent, outlet: 'outer' },
  { path: 'outer/connectivity/edit-interface/:interfaceId/:mode', component: EditInterfaceComponent, outlet: 'outer' },
  { path: 'outer/connectivity/preview-mapping', component: PreviewMappingComponent, outlet: 'outer' },
  { path: 'outer/connectivity/edit-connection/:connectionId', component: EditConnectionComponent, outlet: 'outer' },
  { path: 'outer/connectivity/new-interface/:connectionId', component: NewInterfaceComponent, outlet: 'outer' },
  { path: 'outer/connectivity/publish-interface/:connectionId', component: ExportInterfaceComponent, outlet: 'outer' },
  { path: 'outer/connectivity/export-interface/:connectionId', component: ExportInterfaceComponent, outlet: 'outer' },
  { path: 'outer/connectivity/connekthub-import/:connectionId', component: ImportSidesheetComponent, outlet: 'outer' },
  { path: 'outer/connectivity/data-scope/:moduleId/:schemaId/:variantId/:outlet', component: DatascopeSidesheetComponent, outlet: 'outer' },
  { path: 'outer/connectivity/add-daxe', component: AddDaxeComponent, outlet: 'outer' },
  { path: 'outer/connectivity/sync-freq/:connectionId', component: SyncFreqComponent, outlet: 'outer' },
  { path: 'outer/connectivity/payload-test/:moduleId/:scenarioId', component: PayloadTestComponent, outlet: 'outer' },

  { path: 'outer/classifications/characteristics/new', component: CharacteristicsMutationSideSheetComponent, outlet: 'outer' },
  { path: 'outer/classifications/characteristics/new/language/new', component: CharacteristicsMutationNewLanguageComponent, outlet: 'outer' },{ path: 'outer/classifications',loadChildren: () => import('./_modules/classifications/classifications.module').then((m) => m.ClassificationsModule), outlet: 'outer' },
  { path: 'outer/classifications/characteristics/languages', component: CharacteristicLanguagesComponent, outlet: 'outer' },
  { path: 'sb3/classifications', loadChildren: () => import('./_modules/classifications/classifications.module').then((m) => m.ClassificationsModule), outlet: 'sb3'},

  { path: 'outer/roles-permissions/new-role', component: NewRoleComponent, outlet: 'outer' },
  { path: 'outer/roles-permissions/edit-role/:roleId', component: EditRoleComponent, outlet: 'outer' },
  { path: 'outer/roles-permissions/:roleId/users', component: RoleUsersComponent, outlet: 'outer' },
  { path: 'sb3/roles-permissions/:roleId/data-restriction/:privilegeId', component: DataRestrictionComponent, outlet: 'sb3' },
  { path: 'sb3/roles-permissions/:roleId/data-restriction/:privilegeId/filter-settings/:moduleId', component: ListFilterComponent, outlet: 'sb3' },

  { path: 'outer/teams/invite', component: TeamInviteComponent, outlet: 'outer' },
  { path: 'outer/teams/user-profile/:username', component: UserProfileComponent, outlet: 'outer' },
  { path: 'outer/teams/dataset-record-mapping', component:DatasetRecordMappingComponent , outlet: 'outer' },
  { path: 'msteams', loadChildren: () => import('./_modules/msteams/msteams.module').then((m) => m.MSTeamsModule) },
  { path: 'sb/report', loadChildren: () => import('./_modules/report/report.module').then((m) => m.ReportModule), outlet: 'sb' },
  { path: 'sb3/group-conditions', loadChildren: () => import('./_modules/list/group-conditions.module').then((m) => m.GroupConditionsModule), outlet: 'sb3' },
  { path: 'outer/dependency-rule/:moduleId', loadChildren: () => import('./_modules/list/list-dependency-rule.module').then((m) => m.ListDependencyRuleModule), outlet: 'outer' },
  { path: 'sb3/dependency-rule/:moduleId', loadChildren: () => import('./_modules/list/list-dependency-rule.module').then((m) => m.ListDependencyRuleModule), outlet: 'sb3' },
  { path: 'lib', loadChildren: () => import('./_modules/lib/lib.module').then((m) => m.LibModule) },
  { path: 'outer/add-business-rules', component: NewBusinessRulesComponent, outlet: 'outer' },
  { path: 'sb/add-business-rules', component: NewBusinessRulesComponent, outlet: 'sb' },
  { path: 'sb/system-tray/:type', component: SystemTrayComponent, outlet: 'sb' },
  { path: 'sb/mapping', loadChildren: () => import('./_modules/mapping/mapping.module').then((m) => m.MappingModule), outlet: 'sb' },
  { path: 'outer/mapping', loadChildren: () => import('./_modules/mapping/mapping.module').then((m) => m.MappingModule), outlet: 'outer' },
  { path: 'sb/task', loadChildren: () => import('./_modules/taskinbox/taskinbox.module').then((m) => m.TaskinboxModule), outlet: 'sb' },
  { path: 'outer/report', loadChildren: () => import('./_modules/report/report.module').then((m) => m.ReportModule), outlet: 'outer' },
  { path: 'sb/report-v2', loadChildren: () => import('./_modules/report-v2/report-v2.module').then((m) => m.ReportModuleV2), outlet: 'sb' },
  { path: 'outer/cr/merge-conflict', loadChildren: () => import('./_modules/merge-conflict/merge-conflict.module').then(m => m.MergeConflictModule), outlet: 'outer' },
  { path: 'transaction', loadChildren: () => import('./_modules/transaction/transaction.module').then(m => m.TransactionModule), canActivate: [AuthGuard] },
  { path: 'sb/transaction', loadChildren: () => import('./_modules/transaction/transaction.module').then(m => m.TransactionModule), canActivate: [AuthGuard], outlet: 'sb' },
  { path: 'outer/transaction', loadChildren: () => import('./_modules/transaction/transaction.module').then(m => m.TransactionModule), canActivate: [AuthGuard], outlet: 'outer' },
  { path: 'sb3/transaction', loadChildren: () => import('./_modules/transaction/transaction.module').then(m => m.TransactionModule), canActivate: [AuthGuard], outlet: 'sb3' },
  { path: 'outer/add-material-description/:moduleId/:fieldId', component: TransactionGenerateDescriptionAddComponent, outlet: 'outer' },
  { path: 'connectToSalesforce', component: ConnectToSalesforceComponent},
  { path: 'sb/logs', loadChildren: () => import('./_modules/logs/logs.module').then(m => m.LogsModule), canActivate: [AuthGuard], outlet: 'sb'},
  { path: 'sb3/logs', loadChildren: () => import('./_modules/logs/logs.module').then((m) => m.LogsModule), outlet: 'sb3' },
  { path: 'outer/packages/created-package', component: CreatedPackageComponent, outlet: 'outer' },
  { path: 'outer/packages/new-package', component: PackageComponent, outlet: 'outer' },
  { path: 'outer/data-model/new-data-model', component: DataModelComponent , outlet: 'outer'},
  { path: 'sb3/data-model/data-model-condtion', component: DataModelConditionComponent ,  outlet: 'sb3' },
  { path: 'outer/tenant/new-tenant', component: TenantComponent, outlet: 'outer' },
  { path: 'outer/characteristices/reorder', component: CharacteristicsReorderComponent, outlet: 'outer' },
  { path: 'sb3/classifications/characteristics/ExpansionView', component: CharacteristicsExpansionViewDialogComponent ,  outlet: 'sb3' },
  { path: 'outer/email-templates/:templateId/preview', component: EmailTemplatePreviewComponent, outlet: 'outer' },
  { path: 'outer/:moduleId/pdf-templates/:pdfId', component: UpsertPdfTemplateComponent, outlet: 'outer' },
  { path: 'sb/ceatedPackage', component: CreatedPackageComponent, outlet: 'sb' },
  { path: 'outer/connekthubPackage', component: ConnekthubPackageComponent, outlet: 'outer'},
  // anything not mapped should go to page not found component
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
