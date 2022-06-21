import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { IntMappingComponent } from 'src/app/_modules/admin/_components/int-mapping/int-mapping.component';
import { AdminLayoutComponent } from 'src/app/_modules/admin/_components/admin-layout/admin-layout.component';
import { AdminHomeComponent } from 'src/app/_modules/admin/_components/admin-home/admin-home.component';
import { AdminTileComponent } from 'src/app/_modules/admin/_components/admin-tile/admin-tile.component';
import { IntegrationAdapterComponent } from 'src/app/_modules/admin/_components/integration-adapter/integration-adapter.component';
import { InterfacesComponent } from 'src/app/_modules/admin/_components/interfaces/interfaces.component';
import { IdocsComponent } from 'src/app/_modules/admin/_components/integration-adapter/sap/idocs/idocs.component';
import { SapComponent } from 'src/app/_modules/admin/_components/integration-adapter/sap/sap.component';
import { RfcComponent } from 'src/app/_modules/admin/_components/integration-adapter/sap/rfc/rfc.component';
import { OdataComponent } from 'src/app/_modules/admin/_components/integration-adapter/sap/odata/odata.component';
import { SoapComponent } from 'src/app/_modules/admin/_components/integration-adapter/salesforce/soap/soap.component';
import { RestComponent } from 'src/app/_modules/admin/_components/integration-adapter/salesforce/rest/rest.component';
import { SalesforceComponent } from 'src/app/_modules/admin/_components/integration-adapter/salesforce/salesforce.component';
import { RdbmsComponent } from 'src/app/_modules/admin/_components/integration-adapter/rdbms/rdbms.component';
import { IBMDB2Component } from 'src/app/_modules/admin/_components/integration-adapter/rdbms/ibmdb2/ibmdb2.component';
import { MysqlComponent } from 'src/app/_modules/admin/_components/integration-adapter/rdbms/mysql/mysql.component';
import { MsSqlComponent } from 'src/app/_modules/admin/_components/integration-adapter/rdbms/ms-sql/ms-sql.component';
import { PostGreSQLComponent } from 'src/app/_modules/admin/_components/integration-adapter/rdbms/post-gre-sql/post-gre-sql.component';
import { XmlComponent } from 'src/app/_modules/admin/_components/integration-adapter/custom/xml/xml.component';
import { CsvComponent } from 'src/app/_modules/admin/_components/integration-adapter/custom/csv/csv.component';
import { ApiComponent } from 'src/app/_modules/admin/_components/integration-adapter/custom/api/api.component';
import { CustomComponent } from 'src/app/_modules/admin/_components/integration-adapter/custom/custom.component';
import { WebserviceComponent } from 'src/app/_modules/admin/_components/integration-adapter/webservice/webservice.component';
import { CxmlComponent } from 'src/app/_modules/admin/_components/integration-adapter/webservice/cxml/cxml.component';
import { WsRestComponent } from 'src/app/_modules/admin/_components/integration-adapter/webservice/ws-rest/ws-rest.component';
import { WsSoapComponent } from 'src/app/_modules/admin/_components/integration-adapter/webservice/ws-soap/ws-soap.component';
import { UserManagementComponent } from 'src/app/_modules/admin/_components/user-mgmt-home/user-management.component';
import { SecurityLogsComponent } from 'src/app/_modules/admin/_components/security-logs/security-logs.component';
import { ModuleComponent } from 'src/app/_modules/admin/_components/module/module.component';
import { EmailNotifComponent } from 'src/app/_modules/admin/_components/email-notif/email-notif.component';
import { AdvancedSettingsComponent } from 'src/app/_modules/admin/_components/advanced-settings/advanced-settings.component';
import { WorkflowComponent } from 'src/app/_modules/admin/_components/module/workflow/workflow.component';
import { ChangeRequestComponent } from 'src/app/_modules/admin/_components/module/change-request/change-request.component';
import { FieldsComponent } from 'src/app/_modules/admin/_components/module/fields/fields.component';
import { GridFieldsComponent } from 'src/app/_modules/admin/_components/module/grid-fields/grid-fields.component';
import { ListPageComponent } from 'src/app/_modules/admin/_components/module/list-page/list-page.component';
import { DropdownComponent } from 'src/app/_modules/admin/_components/module/dropdown/dropdown.component';
import { SecurityComponent } from 'src/app/_modules/admin/_components/module/security/security.component';
import { CustomEventsComponent } from 'src/app/_modules/admin/_components/module/custom-events/custom-events.component';
import { BusinessRulesComponent } from 'src/app/_modules/admin/_components/module/business-rules/business-rules.component';
import { NounsCharacteristicsComponent } from 'src/app/_modules/admin/_components/module/nouns-characteristics/nouns-characteristics.component';
import { AddbusinessruleComponent } from './_components/module/business-rules/addbusinessrule/addbusinessrule.component';
import { CreateSchemaComponent } from './_components/module/schema/create-schema/create-schema.component';
import { MissingruleComponent } from './_components/module/business-rules/missingrule/missingrule.component';
import { UserDefinedRuleComponent } from './_components/module/business-rules/user-defined-rule/user-defined-rule.component';
import { UdrConditionFormComponent } from './_components/module/business-rules/user-defined-rule/udr-condition-form/udr-condition-form.component';
import { UdrConditionControlComponent } from './_components/module/business-rules/user-defined-rule/udr-condition-control/udr-condition-control.component';
import { RegexRuleComponent } from './_components/module/business-rules/regex-rule/regex-rule.component';
import { BackgroundStepPropertiesComponent } from './_components/module/workflow/bpmn-builder/properties-panel/background-step-properties/background-step-properties.component';
import { EmailEscalationPropertiesComponent } from './_components/module/workflow/bpmn-builder/properties-panel/email-escalation-properties/email-escalation-properties.component';
import { ConnectionConditionModalComponent } from './_components/module/workflow/bpmn-builder/connection-condition-modal/connection-condition-modal.component';
import { DeterminationStepPropertiesComponent } from './_components/module/workflow/bpmn-builder/properties-panel/determination-step-properties/determination-step-properties.component';
import { ConnectionPropertiesComponent } from './_components/module/workflow/bpmn-builder/properties-panel/connection-properties/connection-properties.component';
import { ActivityStepPropertiesComponent } from './_components/module/workflow/bpmn-builder/properties-panel/activity-step-properties/activity-step-properties.component';
import { DecisionsModalComponent } from './_components/module/workflow/bpmn-builder/decisions-modal/decisions-modal.component';
import { PropertiesPanelComponent } from './_components/module/workflow/bpmn-builder/properties-panel/properties-panel.component';
import { BpmnBuilderComponent } from './_components/module/workflow/bpmn-builder/bpmn-builder.component';
import { DiwCreateBusinessruleComponent } from './_components/module/schema/diw-create-businessrule/diw-create-businessrule.component';
import { DiwCreateSchemaComponent } from './_components/module/schema/diw-create-schema/diw-create-schema.component';
import { ConfirmModalComponent } from './_components/module/workflow/bpmn-builder/confirm-modal/confirm-modal.component';

@NgModule({
  declarations: [
    IntMappingComponent,
    AdminLayoutComponent,
    AdminHomeComponent,
    AdminTileComponent,
    IntegrationAdapterComponent,
    InterfacesComponent,
    IdocsComponent,
    SapComponent,
    RfcComponent,
    OdataComponent,
    SoapComponent,
    RestComponent,
    SalesforceComponent,
    RdbmsComponent,
    IBMDB2Component,
    MysqlComponent,
    MsSqlComponent,
    PostGreSQLComponent,
    XmlComponent,
    CsvComponent,
    ApiComponent,
    CustomComponent,
    WebserviceComponent,
    CxmlComponent,
    WsRestComponent,
    WsSoapComponent,
    UserManagementComponent,
    SecurityLogsComponent,
    ModuleComponent,
    EmailNotifComponent,
    AdvancedSettingsComponent,
    WorkflowComponent,
    ChangeRequestComponent,
    FieldsComponent,
    GridFieldsComponent,
    ListPageComponent,
    DropdownComponent,
    SecurityComponent,
    CustomEventsComponent,
    BusinessRulesComponent,
    NounsCharacteristicsComponent,
    AddbusinessruleComponent,
    CreateSchemaComponent,
    MissingruleComponent,
    UserDefinedRuleComponent,
    UdrConditionFormComponent,
    UdrConditionControlComponent,
    RegexRuleComponent,
    BpmnBuilderComponent,
    PropertiesPanelComponent,
    DecisionsModalComponent,
    ActivityStepPropertiesComponent,
    ConnectionPropertiesComponent,
    DeterminationStepPropertiesComponent,
    ConnectionConditionModalComponent,
    EmailEscalationPropertiesComponent,
    BackgroundStepPropertiesComponent,
    DiwCreateBusinessruleComponent,
    DiwCreateSchemaComponent,
    ConfirmModalComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule,
  ]
})
export class AdminModule { }
