import { SelectSalesforceDataComponent } from './_components/connector/select-salesforce-data/select-salesforce-data.component';
import { SapOdataLoginComponent } from './_components/connector/sap-odata-login/sap-odata-login.component';
import { SalesforceConnectionComponent } from './_components/connector/salesforce-connection/salesforce-connection.component';
import { ConnectToDatasetComponent } from './_components/connector/connect-to-dataset/connect-to-dataset.component';
import { SharedModule } from '@modules/shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConnectorsComponent } from './_components/connector/connectors/connectors.component';
import { SapConnectorStepOneComponent } from './_components/connector/sap-connector-step-one/sap-connector-step-one.component';
import { SapConnectorStepTwoComponent } from './_components/connector/sap-connector-step-two/sap-connector-step-two.component';
import { SapMappingFieldsComponent } from './_components/connector/sap-mapping-fields/sap-mapping-fields.component';
import { StructureLevelConfigComponent } from './_components/connector/structure-level-config/structure-level-config.component';
import { StoreSalesforceDatasetComponent } from './_components/connector/store-salesforce-dataset/store-salesforce-dataset.component';
import { CpiLoginComponent } from './_components/connector/sap-cpi/cpi-login/cpi-login.component';
import { CpiInterimActivitiesComponent } from './_components/connector/sap-cpi/cpi-interim-activities/cpi-interim-activities.component';
import { CpiChecklistComponent } from './_components/connector/sap-cpi/cpi-checklist/cpi-checklist.component';
import { CpiLoginRetryComponent } from './_components/connector/sap-cpi/cpi-login-retry/cpi-login-retry.component';
import { CpiPackageSelectionComponent } from './_components/connector/sap-cpi/cpi-package-selection/cpi-package-selection.component';
import { CpiStandardPackageComponent } from './_components/connector/sap-cpi/cpi-standard-package/cpi-standard-package.component';
import { CpiScopeSidesheetComponent } from './_components/connector/sap-cpi/cpi-scope-sidesheet/cpi-scope-sidesheet.component';
import { CpiDataScopeComponent } from './_components/connector/sap-cpi/cpi-data-scope/cpi-data-scope.component';
import { CommonMappingModule } from '@modules/mapping/_common/common-mapping.module';
import { TableMappingComponent } from './_components/table-mapping/table-mapping.component';
import { NewMappingComponent } from './_components/table-mapping/new-mapping/new-mapping.component';
import { SegmentFieldComponent } from './_components/connector/sap-cpi/cpi-data-scope/segment-field/segment-field.component';
import { SegmentDataComponent } from './_components/connector/sap-cpi/cpi-data-scope/segment-data/segment-data.component';
import { ConnekthubModule } from '@modules/connekthub/connekthub.module';
import { CpiHierarchyComponent } from '@modules/list/_components/connector/sap-cpi/cpi-hierarchy/cpi-hierarchy.component';
import { RecordExpandedViewComponent } from '@modules/list/_components/connector/sap-cpi/record-expanded-view/record-expanded-view.component';

@NgModule({
  declarations: [
    ConnectorsComponent,
    SapConnectorStepOneComponent,
    SapConnectorStepTwoComponent,
    SapMappingFieldsComponent,
    StructureLevelConfigComponent,
    StoreSalesforceDatasetComponent,
    ConnectToDatasetComponent,
    SalesforceConnectionComponent,
    SapOdataLoginComponent,
    SelectSalesforceDataComponent,
    CpiLoginComponent,
    CpiInterimActivitiesComponent,
    CpiChecklistComponent,
    CpiLoginRetryComponent,
    CpiPackageSelectionComponent,
    CpiStandardPackageComponent,
    CpiScopeSidesheetComponent,
    CpiDataScopeComponent,
    TableMappingComponent,
    NewMappingComponent,
    SegmentFieldComponent,
    SegmentDataComponent,
    CpiHierarchyComponent,
    RecordExpandedViewComponent
    // ConnectorContainerDirective,
  ],
  imports: [CommonModule, SharedModule, CommonMappingModule, ConnekthubModule],
  exports: [
    ConnectorsComponent,
    SapConnectorStepOneComponent,
    SapConnectorStepTwoComponent,
    SapMappingFieldsComponent,
    StructureLevelConfigComponent,
    StoreSalesforceDatasetComponent,
    ConnectToDatasetComponent,
    SalesforceConnectionComponent,
    SapOdataLoginComponent,
    SelectSalesforceDataComponent,
    CpiLoginComponent,
    CpiInterimActivitiesComponent,
    CpiChecklistComponent,
    CpiLoginRetryComponent,
    CpiPackageSelectionComponent,
    CpiStandardPackageComponent,
    CpiScopeSidesheetComponent,
    CpiDataScopeComponent,
    TableMappingComponent,
    NewMappingComponent,
    SegmentFieldComponent,
    SegmentDataComponent,
    CpiHierarchyComponent
  ],
  entryComponents: [
    ConnectorsComponent,
    SapConnectorStepOneComponent,
    SapConnectorStepTwoComponent,
    SapMappingFieldsComponent,
    StructureLevelConfigComponent,
    StoreSalesforceDatasetComponent,
    ConnectToDatasetComponent,
    SalesforceConnectionComponent,
    SapOdataLoginComponent,
    SelectSalesforceDataComponent,
    CpiLoginComponent,
    CpiInterimActivitiesComponent,
    CpiChecklistComponent,
    CpiLoginRetryComponent,
    CpiPackageSelectionComponent,
    CpiStandardPackageComponent,
    CpiScopeSidesheetComponent,
    CpiDataScopeComponent,
    TableMappingComponent,
    RecordExpandedViewComponent
  ],
})
export class DatasetConnectorModule {}
