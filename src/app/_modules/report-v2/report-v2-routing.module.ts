import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FiltersSidesheetComponent } from './builder/builder-container/filter-facet/filters-sidesheet/filters-sidesheet.component';
import { PageNotFoundComponent } from '../shared/_components/page-not-found/page-not-found.component';
import { BuilderComponent } from './builder/builder.component';
import { ReportCollaboratorComponent } from '@modules/report/permissions/report-collaborator/report-collaborator.component';
import { SummaryLayoutComponent } from '@modules/report/view/summary-layout/summary-layout.component';
import { ReportDatatableColumnSettingsComponent } from '@modules/report/view/dashboard-container/reporting-list/report-datatable-column-settings/report-datatable-column-settings.component';
import { ExportReportDatatableComponent } from '@modules/report/view/dashboard-container/reporting-list/export-report-datatable/export-report-datatable.component';
import { SendEmailComponent } from '@modules/report/view/email/send-email/send-email.component';
import { EmailTemplateComponent } from '@modules/report/view/email/email-template/email-template.component';
import { ImportLogComponent } from '@modules/report/import-log/import-log.component';
import { ConfigureFiltersComponent } from './builder/builder-container/reporting-list/configure-filters/configure-filters.component';
import { ImportSidesheetComponent } from '@modules/connekthub/_components/import-sidesheet/import-sidesheet.component';
import { CanDeactivateGuard } from 'src/app/_guards/deactivate.guard';
import { LoadReportComponent } from './builder/load-report/load-report.component';

const routes: Routes = [
  { path: '', component: LoadReportComponent },
  { path: 'view/:id', component: BuilderComponent },
  { path: 'edit/:id', component: BuilderComponent },
  { path: 'edit/:id/new', component: BuilderComponent, canDeactivate: [CanDeactivateGuard] },
  { path: 'dashboard/:id', redirectTo: 'view/:id' },
  { path: 'dashboard-builder/:id', redirectTo: 'edit/:id' },
  { path: 'filters-list/:reportId', component: FiltersSidesheetComponent },
  { path: 'collaborators/:reportId', component: ReportCollaboratorComponent },
  { path: 'summary/:widgetId/:objectNumber/:layoutId', component: SummaryLayoutComponent },
  { path: 'column-settings/:widgetId', component: ReportDatatableColumnSettingsComponent },
  { path: 'download-widget/:widgetId', component: ExportReportDatatableComponent },
  { path: 'send-email/:reportId', component: SendEmailComponent },
  { path: 'email-template', component: EmailTemplateComponent },
  { path: 'import-log/:reportId', component: ImportLogComponent },
  { path: 'configure-filters/:widgetId', component: ConfigureFiltersComponent },
  { path: 'connekthub-import', component: ImportSidesheetComponent },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportRoutingModuleV2 {}
