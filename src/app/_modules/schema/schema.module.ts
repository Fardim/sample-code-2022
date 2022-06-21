import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { SchemaRoutingModule } from './schema-routing.module';
import { NotificationRuleModule } from './notification-rule.module';
import { SchemaTileComponent } from 'src/app/_modules/schema/_components/schema-tile/schema-tile.component';
import { SchemaDatatableComponent } from './_components/schema-details/schema-datatable/schema-datatable.component';
import { SchemaCollaboratorsComponent } from 'src/app/_modules/schema/_components/schema-collaborators/schema-collaborators.component';
import { SchemaExecutionComponent } from './_components/schema-execution/schema-execution.component';
import { SchemaExecutionDialogComponent } from './_components/schema-execution/schema-execution-dialog/schema-execution-dialog.component';
import { SchemaExecutionLogsComponent } from './_components/schema-execution-logs/schema-execution-logs.component';
import { UploadDataComponent } from './_components/upload-data-sidesheet/upload-data.component';
import { MapMdoFieldComponent } from './_components/upload-data-sidesheet/map-mdo-field/map-mdo-field.component';
import { AccessDeniedDialogComponent } from '@modules/shared/_components/access-denied-dialog/access-denied-dialog.component';
import { CollaboratorComponent } from './_components/collaborator/collaborator.component';
import { UploadDatasetComponent } from './_components/upload-dataset/upload-dataset.component';
import { SchemaDetailsComponent } from './_components/v2/schema-details/schema-details.component';
import { NewBusinessRulesComponent } from './_components/new-business-rules/new-business-rules.component';
import { NewSchemaCollaboratorsComponent } from './_components/new-schema-collaborators/new-schema-collaborators.component';
import { SaveVariantDialogComponent } from './_components/v2/save-variant-dialog/save-variant-dialog.component';
import { BrruleSideSheetComponent } from './_components/v2/brrule-side-sheet/brrule-side-sheet.component';
import { SchemaInfoComponent } from './_components/v2/schema-info/schema-info.component';
import { CreateSchemaComponent } from './_components/v2/create-schema/create-schema.component';
import { SubscriberSideSheetComponent } from './_components/v2/subscriber-side-sheet/subscriber-side-sheet.component';
import { BusinessrulelibraryDialogComponent } from './_components/businessrulelibrary-dialog/businessrulelibrary-dialog.component';
import { DatascopeSidesheetComponent } from './_components/datascope-sidesheet/datascope-sidesheet.component';
import { SchemaSummarySidesheetComponent } from './_components/schema-summary-sidesheet/schema-summary-sidesheet.component';
import { RunningProgressComponent } from './_components/running-progress/running-progress.component';
import { LibraryMappingSidesheetComponent } from './_components/v2/library-mapping-sidesheet/library-mapping-sidesheet.component';
import { ExclusionsSidesheetComponent } from './_components/v2/brrule-side-sheet/duplicate-rule-config/exclusions-sidesheet/exclusions-sidesheet.component';
import { SetupDuplicateRuleComponent } from './_components/v2/brrule-side-sheet/duplicate-rule-config/setup-duplicate-rule/setup-duplicate-rule.component';
import { ClassificationBuilderComponent } from './_components/v2/classification/classification-builder/classification-builder.component';
import { DetailBuilderComponent } from './_components/v2/_builder/detail-builder/detail-builder.component';
import { PotextViewComponent } from './_components/v2/potext/potext-view/potext-view.component';
import { SchemaListsComponent } from './_components/v2/schema-lists/schema-lists.component';
import { BusinessrulelibrarySidesheetComponent } from './_components/businessrulelibrary-sidesheet/businessrulelibrary-sidesheet.component';
import { GroupDataTableComponent } from './_components/v2/duplicacy/group-data-table/group-data-table.component';
import { DuplicacyComponent } from './_components/v2/duplicacy/duplicacy.component';
import { StaticsComponent } from './_components/v2/statics/statics.component';
import { ExecutionResultComponent } from './_components/v2/statics/execution-result/execution-result.component';
import { NounComponent } from './_components/v2/library-mapping-sidesheet/noun/noun.component';
import { ModifierComponent } from './_components/v2/library-mapping-sidesheet/modifier/modifier.component';
import { AttributeComponent } from './_components/v2/library-mapping-sidesheet/attribute/attribute.component';
import { AttributeDefaultValueComponent } from './_components/v2/library-mapping-sidesheet/attribute-default-value/attribute-default-value.component';
import { NounModifierAutocompleteComponent } from './_components/v2/library-mapping-sidesheet/noun-modifier-autocomplete/noun-modifier-autocomplete.component';
import { ExecutionTrendSidesheetComponent } from './_components/v2/statistics/execution-trend-sidesheet/execution-trend-sidesheet.component';
import { SchemaProgressComponent } from './_components/schema-progress/schema-progress.component';
import { DownloadExecutionDataComponent } from './_components/v2/download-execution-data/download-execution-data.component';
import { GlobalCountComponent } from './_components/v2/_builder/global-count/global-count.component';
import { DatascopeListSidesheetComponent } from './_components/datascope-list-sidesheet/datascope-list-sidesheet.component';
import { SkeletonLoaderComponent } from './_components/v2/skeleton-loader/skeleton-loader.component';
import { SetupWebServiceCallComponent } from './_components/v2/brrule-side-sheet/web-service-call-config/setup-web-service-call.component';
import { LookupDatasetRuleComponent } from './_components/v2/brrule-side-sheet/lookup-dataset-rule/lookup-dataset-rule.component';
import { SchemaViewComponent } from './_components/v2/_builder/schema-view/schema-view.component';
import { DiwHomeComponent } from './_components_v2/diw-home/diw-home.component';
import { CheckDataBtnComponent } from './_components_v2/check-data-btn/check-data-btn.component';
import { DiwViewTabsComponent } from './_components_v2/diw-view-tabs/diw-view-tabs.component';
import { DiwListComponent } from './_components_v2/diw-home/diw-list/diw-list.component';
import { ConditionSidesheetComponent } from './_components/v2/brrule-side-sheet/condition-sidesheet/condition-sidesheet.component'
import { CollaborationComponent } from './_components/v2/collaboration/collaboration.component';
import { ChatModule } from '@modules/chat/chat.module';
import { PercentageBarComponent } from './_components/v2/statics/percentage-bar/percentage-bar.component';
import { DaxeModule } from '@modules/daxe/daxe.module';
import { AutoExtensionRuleComponent } from './_components/v2/brrule-side-sheet/auto-extension-rule/auto-extension-rule.component';
import { AutoExtensionNewConditionComponent } from './_components/v2/brrule-side-sheet/auto-extension-rule/auto-extension-new-condition/auto-extension-new-condition.component';
import { HierarchyFieldListComponent } from './_components/v2/brrule-side-sheet/auto-extension-rule/hierarchy-field-list/hierarchy-field-list.component';
import { CrossDatasetRuleComponent } from './_components/v2/brrule-side-sheet/cross-dataset-rule/cross-dataset-rule.component';
import { CrossDatasetRuleInputComponent } from './_components/v2/brrule-side-sheet/cross-dataset-rule/cross-dataset-rule-input/cross-dataset-rule-input.component';
import { CrossDatasetListComponent } from './_components/v2/brrule-side-sheet/cross-dataset-rule/cross-dataset-list/cross-dataset-list.component';
import { CommonMappingModule } from '@modules/mapping/_common/common-mapping.module';

@NgModule({
  declarations: [
    SchemaTileComponent,
    SchemaDetailsComponent,
    SchemaDatatableComponent,
    SchemaExecutionComponent,
    SchemaCollaboratorsComponent,
    SchemaExecutionDialogComponent,
    SchemaExecutionLogsComponent,
    UploadDataComponent,
    MapMdoFieldComponent,
    AccessDeniedDialogComponent,
    CollaboratorComponent,
    UploadDatasetComponent,
    SchemaDetailsComponent,
    NewBusinessRulesComponent,
    NewSchemaCollaboratorsComponent,
    SaveVariantDialogComponent,
    BrruleSideSheetComponent,
    SchemaInfoComponent,
    CreateSchemaComponent,
    SubscriberSideSheetComponent,
    CreateSchemaComponent,
    BusinessrulelibraryDialogComponent,
    DatascopeSidesheetComponent,
    SchemaSummarySidesheetComponent,
    RunningProgressComponent,
    ExclusionsSidesheetComponent,
    LibraryMappingSidesheetComponent,
    ClassificationBuilderComponent,
    DetailBuilderComponent,
    PotextViewComponent,
    SchemaListsComponent,
    SetupDuplicateRuleComponent,
    BusinessrulelibrarySidesheetComponent,
    // PotextCatalogcheckComponent,
    GroupDataTableComponent,
    DuplicacyComponent,
    SetupWebServiceCallComponent,
    StaticsComponent,
    ExecutionResultComponent,
    PercentageBarComponent,
    NounComponent,
    ModifierComponent,
    AttributeComponent,
    AttributeDefaultValueComponent,
    NounModifierAutocompleteComponent,
    ExecutionTrendSidesheetComponent,
    SchemaProgressComponent,
    DownloadExecutionDataComponent,
    GlobalCountComponent,
    DatascopeListSidesheetComponent,
    SkeletonLoaderComponent,
    LookupDatasetRuleComponent,
    SchemaViewComponent,
    DiwHomeComponent,
    CheckDataBtnComponent,
    DiwViewTabsComponent,
    DiwListComponent,
    ConditionSidesheetComponent,
    CollaborationComponent,
    AutoExtensionRuleComponent,
    AutoExtensionNewConditionComponent,
    HierarchyFieldListComponent,
    CrossDatasetRuleComponent,
    CrossDatasetRuleInputComponent,
    CrossDatasetListComponent
  ],
  imports: [CommonModule, SchemaRoutingModule, SharedModule, ChatModule, DaxeModule, CommonMappingModule, NotificationRuleModule],
  exports: [LookupDatasetRuleComponent,CrossDatasetRuleComponent]
})
export class SchemaModule {}
