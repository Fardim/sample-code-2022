import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportRoutingModule } from './report-routing.module';
import { DashboardComponent } from './view/dashboard/dashboard.component';
import { SharedModule } from '../shared/shared.module';
import { ContainerComponent } from './edit/container/container.component';
import { WidgetstyleControlComponent } from './edit/container/widgetstyle-control/widgetstyle-control.component';
import { DashboardContainerComponent } from './view/dashboard-container/dashboard-container.component';
import { BarChartComponent } from './view/dashboard-container/bar-chart/bar-chart.component';
import { CountComponent } from './view/dashboard-container/count/count.component';
import { FilterComponent } from './view/dashboard-container/filter/filter.component';
import { ReportingListComponent } from './view/dashboard-container/reporting-list/reporting-list.component';
import { StackedbarChartComponent } from './view/dashboard-container/stackedbar-chart/stackedbar-chart.component';
import { TimeseriesWidgetComponent } from './view/dashboard-container/timeseries-widget/timeseries-widget.component';
import { DynamicWidgetComponent } from './edit/container/dynamic-widget/dynamic-widget.component';
import { ReportListComponent } from './report-list/report-list.component';
import { HtmlEditorComponent } from './view/dashboard-container/html-editor/html-editor.component';
import { ImageComponent } from './view/dashboard-container/image/image.component';
import { PieChartComponent } from './view/dashboard-container/pie-chart/pie-chart.component';
import { MetadatafieldControlComponent } from './edit/container/metadatafield-control/metadatafield-control.component';
import { ReportCollaboratorComponent } from './permissions/report-collaborator/report-collaborator.component';
import { CollaboratorComponent } from './permissions/collaborator/collaborator.component';
import { SummaryLayoutComponent } from './view/summary-layout/summary-layout.component';
import { SummaryTabsComponent } from './view/summary-layout/summary-tabs/summary-tabs.component';
import { WidgetColorPaletteComponent } from './edit/widget-color-palette/widget-color-palette.component';
import { ExportReportDatatableComponent } from './view/dashboard-container/reporting-list/export-report-datatable/export-report-datatable.component';
import { WorkflowfieldControlComponent } from './edit/container/workflowfield-control/workflowfield-control.component';
import { WorkflowDatasetComponent } from './edit/container/workflow-dataset/workflow-dataset.component';
import { ReportDatatableColumnSettingsComponent } from './view/dashboard-container/reporting-list/report-datatable-column-settings/report-datatable-column-settings.component';
import { HierarchyFilterComponent } from './view/dashboard-container/filter/hierarchy-filter/hierarchy-filter.component';
import { DuplicateReportComponent } from './view/duplicate-report/duplicate-report.component';
import { SendEmailComponent } from './view/email/send-email/send-email.component';
import { EmailTemplateComponent } from './view/email/email-template/email-template.component';
import { ImportLogComponent } from './import-log/import-log.component';
import { ConfigureFiltersComponent } from './view/dashboard-container/reporting-list/configure-filters/configure-filters.component'
import { FormSingleSelectComponent } from './view/dashboard-container/reporting-list/form-single-select/form-single-select.component';
import { FormMultiselectComponent } from './view/dashboard-container/reporting-list/form-multiselect/form-multiselect.component';
import { FormRadioButtonGroupComponent } from './view/dashboard-container/reporting-list/form-radio-button-group/form-radio-button-group.component';
import { FormRangeSliderComponent } from './view/dashboard-container/reporting-list/form-range-slider/form-range-slider.component';
import { FormCheckboxComponent } from './view/dashboard-container/reporting-list/form-checkbox/form-checkbox.component';
import { FormTextAreaComponent } from './view/dashboard-container/reporting-list/form-text-area/form-text-area.component';
import { TableViewComponent } from './view/dashboard-container/table-view/table-view.component';

import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(ChartDataLabels);
import { ExportComponent } from './view/export/export.component';
import { ImportComponent } from './view/import/import.component';
import { ConnekthubModule } from '@modules/connekthub/connekthub.module';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@NgModule({
  declarations: [
    DashboardComponent,
    ContainerComponent,
    WidgetstyleControlComponent,
    DashboardContainerComponent,
    BarChartComponent,
    CountComponent,
    FilterComponent,
    ReportingListComponent,
    StackedbarChartComponent,
    TimeseriesWidgetComponent,
    DynamicWidgetComponent,
    ReportListComponent,
    HtmlEditorComponent,
    ImageComponent,
    PieChartComponent,
    MetadatafieldControlComponent,
    ReportCollaboratorComponent,
    CollaboratorComponent,
    SummaryLayoutComponent,
    SummaryTabsComponent,
    WidgetColorPaletteComponent,
    ExportReportDatatableComponent,
    WorkflowfieldControlComponent,
    WorkflowDatasetComponent,
    ReportDatatableColumnSettingsComponent,
    HierarchyFilterComponent,
    DuplicateReportComponent,
    ImportLogComponent,
    ConfigureFiltersComponent,
    FormSingleSelectComponent,
    FormMultiselectComponent,
    FormRadioButtonGroupComponent,
    FormRangeSliderComponent,
    EmailTemplateComponent,
    ImportLogComponent,
    FormCheckboxComponent,
    SendEmailComponent,
    ExportComponent,
    ImportComponent,
    FormTextAreaComponent,
    TableViewComponent,
  ],
  imports: [
    CommonModule,
    ReportRoutingModule,
    SharedModule,
    ConnekthubModule
  ],
  exports: [
    SummaryLayoutComponent,
    SummaryTabsComponent,
    ExportReportDatatableComponent,
    ReportDatatableColumnSettingsComponent,
    DuplicateReportComponent,
    ConfigureFiltersComponent,
    EmailTemplateComponent,
    SendEmailComponent,
    ExportComponent,
    ImportComponent,
    WorkflowfieldControlComponent,
    WorkflowDatasetComponent,
    MetadatafieldControlComponent,
    TableViewComponent,
    ReportCollaboratorComponent,
    SummaryLayoutComponent,
    ReportDatatableColumnSettingsComponent,
    ExportReportDatatableComponent,
    SendEmailComponent,
    EmailTemplateComponent,
    ImportLogComponent,
    // ConfigureFiltersComponent
  ],
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} }
  ]
})
export class ReportModule { }
