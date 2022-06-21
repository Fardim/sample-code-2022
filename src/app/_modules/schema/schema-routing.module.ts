import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from '../shared/_components/page-not-found/page-not-found.component';
import { SchemaExecutionComponent } from './_components/schema-execution/schema-execution.component';
import { SchemaCollaboratorsComponent } from 'src/app/_modules/schema/_components/schema-collaborators/schema-collaborators.component';
import { SchemaExecutionLogsComponent } from './_components/schema-execution-logs/schema-execution-logs.component';
import { AddbusinessruleComponent } from '../admin/_components/module/business-rules/addbusinessrule/addbusinessrule.component';
import { TableColumnSettingsComponent } from '../shared/_components/table-column-settings/table-column-settings.component';
import { UploadDataComponent } from './_components/upload-data-sidesheet/upload-data.component';
import { DiwCreateSchemaComponent } from '../admin/_components/module/schema/diw-create-schema/diw-create-schema.component';
import { DiwCreateBusinessruleComponent } from '../admin/_components/module/schema/diw-create-businessrule/diw-create-businessrule.component';
import { UploadDatasetComponent } from './_components/upload-dataset/upload-dataset.component';
import { SecondaryNavbarComponent } from '../home/_components/secondary-navbar/secondary-navbar.component';
import { MdoGenericComponentsComponent } from '@modules/lib/_components/mdo-generic-components/mdo-generic-components.component';
import { CreateSchemaComponent } from './_components/v2/create-schema/create-schema.component';
import { SchemaInfoComponent } from './_components/v2/schema-info/schema-info.component';
import { BrruleSideSheetComponent } from './_components/v2/brrule-side-sheet/brrule-side-sheet.component';
import { SubscriberSideSheetComponent } from './_components/v2/subscriber-side-sheet/subscriber-side-sheet.component';
import { DatascopeSidesheetComponent } from './_components/datascope-sidesheet/datascope-sidesheet.component';
import { SchemaSummarySidesheetComponent } from './_components/schema-summary-sidesheet/schema-summary-sidesheet.component';
import { RunningProgressComponent } from './_components/running-progress/running-progress.component';
import { ScheduleComponent } from '@modules/shared/_components/schedule/schedule.component';
import { LibraryMappingSidesheetComponent } from './_components/v2/library-mapping-sidesheet/library-mapping-sidesheet.component';
import { ExclusionsSidesheetComponent } from './_components/v2/brrule-side-sheet/duplicate-rule-config/exclusions-sidesheet/exclusions-sidesheet.component';
import { DetailBuilderComponent } from './_components/v2/_builder/detail-builder/detail-builder.component';
import { BusinessrulelibrarySidesheetComponent } from './_components/businessrulelibrary-sidesheet/businessrulelibrary-sidesheet.component';
import { StaticsComponent } from './_components/v2/statics/statics.component';
import { SubscriberInviteSidesheetComponent } from '@modules/shared/_components/subscriber-invite-sidesheet/subscriber-invite-sidesheet.component';
import { AttributeComponent } from './_components/v2/library-mapping-sidesheet/attribute/attribute.component';
import { AttributeDefaultValueComponent } from './_components/v2/library-mapping-sidesheet/attribute-default-value/attribute-default-value.component';
import { NounComponent } from './_components/v2/library-mapping-sidesheet/noun/noun.component';
import { ModifierComponent } from './_components/v2/library-mapping-sidesheet/modifier/modifier.component';
import { ExecutionTrendSidesheetComponent } from './_components/v2/statistics/execution-trend-sidesheet/execution-trend-sidesheet.component';
import { SchemaProgressComponent } from './_components/schema-progress/schema-progress.component';
import { DatascopeListSidesheetComponent } from './_components/datascope-list-sidesheet/datascope-list-sidesheet.component';
import { ErrorStateComponent } from '@modules/shared/_components/error-state/error-state.component';
import { DiwHomeComponent } from './_components_v2/diw-home/diw-home.component';
import { ConditionSidesheetComponent } from './_components/v2/brrule-side-sheet/condition-sidesheet/condition-sidesheet.component';
import { CollaborationComponent } from './_components/v2/collaboration/collaboration.component';
import { AutoExtensionNewConditionComponent } from './_components/v2/brrule-side-sheet/auto-extension-rule/auto-extension-new-condition/auto-extension-new-condition.component';


const routes: Routes = [
  { path: 'error-h/state', component: ErrorStateComponent },
  { path: 'error/state', component: ErrorStateComponent },
  { path: 'schema-details/:moduleId/:schemaId', component: DetailBuilderComponent },
  { path: 'schema-execution/:schemaId', component: SchemaExecutionComponent },
  { path: 'collab/:schemaId', component: SchemaCollaboratorsComponent },
  { path: 'execution-logs/:schemaId', component: SchemaExecutionLogsComponent },
  { path: 'addbusinessrule', component: AddbusinessruleComponent },
  { path: 'table-column-settings', component: TableColumnSettingsComponent },
  { path: 'attribute-mapping/:moduleId/:schemaId/:nounCode/:modCode', component: LibraryMappingSidesheetComponent },
  { path: 'attribute/:nounSno/:modifierCode', component: AttributeComponent },
  { path: 'attribute-values', component: AttributeDefaultValueComponent },
  { path: 'noun/:moduleId/:matlGroup', component: NounComponent },
  { path: 'modifier/:moduleId/:matlGroup/:nounCode', component: ModifierComponent },
  { path: 'uploaddata', component: UploadDataComponent },
  { path: 'create-schema/:schemaId', component: CreateSchemaComponent },
  { path: 'create-schema/:moduleId/:schemaId', component: CreateSchemaComponent },
  { path: 'diw-create-schema', component: DiwCreateSchemaComponent },
  { path: 'diw-create-businessrule', component: DiwCreateBusinessruleComponent },
  { path: 'upload-dataset', component: UploadDatasetComponent },
  { path: 'upload-dataset', component: UploadDatasetComponent },
  { path: 'secondary-navbar', component: SecondaryNavbarComponent },
  { path: 'setup-br-exclusion', component: ExclusionsSidesheetComponent },
  { path: 'list/:id', component: DiwHomeComponent},
  { path: 'check-data-btn', component: StaticsComponent},
  { path: 'upload-data/:moduleId/:outlet', component: UploadDataComponent },
  { path: 'mdo-generic-components', component: MdoGenericComponentsComponent },
  { path: 'schema-info/:moduleId/:schemaId', component: SchemaInfoComponent },
  { path: 'business-rule/:moduleId/:schemaId/:brId', component: BrruleSideSheetComponent },
  { path: 'business-rule/:moduleId/:schemaId/:brId/:outlet',pathMatch:'full', component: BrruleSideSheetComponent },
  { path: 'subscriber/:moduleId/:schemaId/:subscriberId', component: SubscriberSideSheetComponent },
  { path: 'subscriber/:moduleId/:schemaId/:subscriberId/:outlet', component: SubscriberSideSheetComponent },
  { path: 'data-scope/list/:moduleId/:schemaId/:outlet', component: DatascopeListSidesheetComponent },
  { path: 'data-scope/:moduleId/:schemaId/:variantId/:outlet', component: DatascopeSidesheetComponent },
  { path: 'execution-trend/:moduleId/:schemaId/:variantId', component: ExecutionTrendSidesheetComponent },
  { path: 'comments/:moduleId/:schemaId/:variantId', component: CollaborationComponent },
  { path: 'check-data/:moduleId/:schemaId', component: SchemaSummarySidesheetComponent },
  { path: 'system/running-progress', component: RunningProgressComponent },
  { path: 'schedule/:schemaId/:scheduleId', component: ScheduleComponent},
  { path: 'system/exclusions-sidesheet', component: ExclusionsSidesheetComponent },
  { path: 'system/library-mapping-sidesheet', component: LibraryMappingSidesheetComponent },
  { path: 'businessrule-library/:moduleId/:schemaId/:outlet', component: BusinessrulelibrarySidesheetComponent},
  { path: ':moduleId/statics/:schemaId', component: StaticsComponent },
  { path: 'invite-subscriber/:moduleId/:schemaId/:outlet', component: SubscriberInviteSidesheetComponent},
  { path: 'system/schema-progress', component: SchemaProgressComponent },
  { path: 'business-rule/new-condition/:moduleId/:schemaId/:brId', component: ConditionSidesheetComponent },
  { path: 'business-rule/new-condition/:moduleId/:schemaId/:brId/:outlet',pathMatch:'full', component: ConditionSidesheetComponent },
  // anything not mapped should go to page not found component
  { path: 'new-condition/:moduleId/:structureId/:type', component: AutoExtensionNewConditionComponent},
  { path: '**', component: PageNotFoundComponent }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchemaRoutingModule { }
