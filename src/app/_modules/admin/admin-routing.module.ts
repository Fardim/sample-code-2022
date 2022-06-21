import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from '../shared/_components/page-not-found/page-not-found.component';
import { AdminHomeComponent } from 'src/app/_modules/admin/_components/admin-home/admin-home.component';
import { UserManagementComponent } from 'src/app/_modules/admin/_components/user-mgmt-home/user-management.component';
import { ModuleComponent } from 'src/app/_modules/admin/_components/module/module.component';
import { BusinessRulesComponent } from 'src/app/_modules/admin/_components/module/business-rules/business-rules.component';
import { WorkflowComponent } from 'src/app/_modules/admin/_components/module/workflow/workflow.component';
import { ChangeRequestComponent } from 'src/app/_modules/admin/_components/module/change-request/change-request.component';
import { FieldsComponent } from 'src/app/_modules/admin/_components/module/fields/fields.component';
import { GridFieldsComponent } from 'src/app/_modules/admin/_components/module/grid-fields/grid-fields.component';
import { ListPageComponent } from 'src/app/_modules/admin/_components/module/list-page/list-page.component';
import { DropdownComponent } from 'src/app/_modules/admin/_components/module/dropdown/dropdown.component';
import { SecurityComponent } from 'src/app/_modules/admin/_components/module/security/security.component';
import { CustomEventsComponent } from 'src/app/_modules/admin/_components/module/custom-events/custom-events.component';
import { NounsCharacteristicsComponent } from 'src/app/_modules/admin/_components/module/nouns-characteristics/nouns-characteristics.component';
import { SecurityLogsComponent } from 'src/app/_modules/admin/_components/security-logs/security-logs.component';
import { EmailNotifComponent } from 'src/app/_modules/admin/_components/email-notif/email-notif.component';
import { IntegrationAdapterComponent } from 'src/app/_modules/admin/_components/integration-adapter/integration-adapter.component';
import { SapComponent } from 'src/app/_modules/admin/_components/integration-adapter/sap/sap.component';
import { IdocsComponent } from 'src/app/_modules/admin/_components/integration-adapter/sap/idocs/idocs.component';
import { RfcComponent } from 'src/app/_modules/admin/_components/integration-adapter/sap/rfc/rfc.component';
import { OdataComponent } from 'src/app/_modules/admin/_components/integration-adapter/sap/odata/odata.component';
import { SalesforceComponent } from 'src/app/_modules/admin/_components/integration-adapter/salesforce/salesforce.component';
import { SoapComponent } from 'src/app/_modules/admin/_components/integration-adapter/salesforce/soap/soap.component';
import { RestComponent } from 'src/app/_modules/admin/_components/integration-adapter/salesforce/rest/rest.component';
import { RdbmsComponent } from 'src/app/_modules/admin/_components/integration-adapter/rdbms/rdbms.component';
import { IBMDB2Component } from 'src/app/_modules/admin/_components/integration-adapter/rdbms/ibmdb2/ibmdb2.component';
import { MysqlComponent } from 'src/app/_modules/admin/_components/integration-adapter/rdbms/mysql/mysql.component';
import { MsSqlComponent } from 'src/app/_modules/admin/_components/integration-adapter/rdbms/ms-sql/ms-sql.component';
import { PostGreSQLComponent } from 'src/app/_modules/admin/_components/integration-adapter/rdbms/post-gre-sql/post-gre-sql.component';
import { WebserviceComponent } from 'src/app/_modules/admin/_components/integration-adapter/webservice/webservice.component';
import { CxmlComponent } from 'src/app/_modules/admin/_components/integration-adapter/webservice/cxml/cxml.component';
import { WsSoapComponent } from 'src/app/_modules/admin/_components/integration-adapter/webservice/ws-soap/ws-soap.component';
import { WsRestComponent } from 'src/app/_modules/admin/_components/integration-adapter/webservice/ws-rest/ws-rest.component';
import { CustomComponent } from 'src/app/_modules/admin/_components/integration-adapter/custom/custom.component';
import { XmlComponent } from 'src/app/_modules/admin/_components/integration-adapter/custom/xml/xml.component';
import { CsvComponent } from 'src/app/_modules/admin/_components/integration-adapter/custom/csv/csv.component';
import { ApiComponent } from 'src/app/_modules/admin/_components/integration-adapter/custom/api/api.component';
import { AdvancedSettingsComponent } from 'src/app/_modules/admin/_components/advanced-settings/advanced-settings.component';
import { IntMappingComponent } from 'src/app/_modules/admin/_components/int-mapping/int-mapping.component';
import { InterfacesComponent } from 'src/app/_modules/admin/_components/interfaces/interfaces.component';
import { AdminLayoutComponent } from 'src/app/_modules/admin/_components/admin-layout/admin-layout.component';
import { BpmnBuilderComponent } from './_components/module/workflow/bpmn-builder/bpmn-builder.component';

const routes: Routes = [
  {
    path: '', component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'default', pathMatch: 'full' },
      { path: 'default', component: AdminHomeComponent },
      { path: 'user-management', component: UserManagementComponent },

      { path: 'modules', component: ModuleComponent },
      { path: 'modules/:id/business-rules', component: BusinessRulesComponent },
      { path: 'modules/:id/workflow', component: WorkflowComponent },
      { path: 'modules/all/workflow-builder', component: BpmnBuilderComponent },
      { path: 'modules/:id/change-request', component: ChangeRequestComponent },
      { path: 'modules/:id/fields', component: FieldsComponent },
      { path: 'modules/:id/grid-fields', component: GridFieldsComponent },
      { path: 'modules/:id/list-page', component: ListPageComponent },
      { path: 'modules/:id/dropdown', component: DropdownComponent },
      { path: 'modules/:id/security', component: SecurityComponent },
      { path: 'modules/:id/custom-events', component: CustomEventsComponent },
      { path: 'modules/:id/nouns-characteristics', component: NounsCharacteristicsComponent },
      { path: 'securitylogs', component: SecurityLogsComponent },
      { path: 'email', component: EmailNotifComponent },
      { path: 'integration', component: IntegrationAdapterComponent },
      { path: 'integration/sap', component: SapComponent },
      { path: 'integration/sap/idocs', component: IdocsComponent },
      { path: 'integration/sap/rfc', component: RfcComponent },
      { path: 'integration/sap/odata', component: OdataComponent },
      { path: 'integration/salesforce', component: SalesforceComponent },
      { path: 'integration/salesforce/soap', component: SoapComponent },
      { path: 'integration/salesforce/rest', component: RestComponent },
      { path: 'integration/rdbms', component: RdbmsComponent },
      { path: 'integration/rdbms/ibmdb2', component: IBMDB2Component },
      { path: 'integration/rdbms/mysql', component: MysqlComponent },
      { path: 'integration/rdbms/mssql', component: MsSqlComponent },
      { path: 'integration/rdbms/postgresql', component: PostGreSQLComponent },
      { path: 'integration/webservice', component: WebserviceComponent },
      { path: 'integration/webservice/cxml', component: CxmlComponent },
      { path: 'integration/webservice/ws-soap', component: WsSoapComponent },
      { path: 'integration/webservice/ws-rest', component: WsRestComponent },
      { path: 'integration/custom', component: CustomComponent },
      { path: 'integration/custom/xml', component: XmlComponent },
      { path: 'integration/custom/csv', component: CsvComponent },
      { path: 'integration/custom/api', component: ApiComponent },
      { path: 'advanced', component: AdvancedSettingsComponent },
      { path: 'integration/:scid/mapping', component: IntMappingComponent },
      { path: 'interfaces', component: InterfacesComponent },
    ]
  },

  // anything not mapped should go to page not found component
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
