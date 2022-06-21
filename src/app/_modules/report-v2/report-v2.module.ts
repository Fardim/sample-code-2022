import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(ChartDataLabels);

import { ReportRoutingModuleV2 } from './report-v2-routing.module';
import { SharedModule } from '../shared/shared.module';
import { BuilderContainerComponent } from './builder/builder-container/builder-container.component';
import { BarChartComponent } from './builder/builder-container/bar-chart/bar-chart.component';
import { CountComponent } from './builder/builder-container/count/count.component';
import { ReportingListComponent } from './builder/builder-container/reporting-list/reporting-list.component';
import { StackedbarChartComponent } from './builder/builder-container/stackedbar-chart/stackedbar-chart.component';
import { TimeseriesWidgetComponent } from './builder/builder-container/timeseries-widget/timeseries-widget.component';
import { HtmlEditorComponent } from './builder/builder-container/html-editor/html-editor.component';
import { ImageComponent } from './builder/builder-container/image/image.component';
import { PieChartComponent } from './builder/builder-container/pie-chart/pie-chart.component';
import { GridsterModule } from 'angular-gridster2';
import { BuilderComponent } from './builder/builder.component';
import { PropertyPanelComponent } from './builder/property-panel/property-panel.component';
import { ReportModule } from '@modules/report/report.module';
import { FilterFacetComponent } from './builder/builder-container/filter-facet/filter-facet.component';
import { HierarchyFilter2Component } from './builder/builder-container/filter-facet/hierarchy-filter/hierarchy-filter.component';
import { FormDateComponent } from './builder/builder-container/filter-facet/form-date/form-date.component';
import { FormDateTimeComponent } from './builder/builder-container/filter-facet/form-date-time/form-date-time.component';
import { FiltersSidesheetComponent } from './builder/builder-container/filter-facet/filters-sidesheet/filters-sidesheet.component';
import { FormSingleSelectComponent } from './builder/builder-container/reporting-list/form-single-select/form-single-select.component';
import { FormRangeSliderComponent } from './builder/builder-container/reporting-list/form-range-slider/form-range-slider.component';
import { FormCheckboxComponent } from './builder/builder-container/reporting-list/form-checkbox/form-checkbox.component';
import { FormRadioButtonGroupComponent } from './builder/builder-container/reporting-list/form-radio-button-group/form-radio-button-group.component';
import { FormMultiselectComponent } from './builder/builder-container/reporting-list/form-multiselect/form-multiselect.component';
import { FormTextAreaComponent } from './builder/builder-container/reporting-list/form-text-area/form-text-area.component';
import { DatePipe } from '@angular/common';
import { ConfigureFiltersComponent } from './builder/builder-container/reporting-list/configure-filters/configure-filters.component';
import { TimseriesWidgetV2Component } from './builder/builder-container/timseries-widget-v2/timseries-widget-v2.component';
import { MenuItemComponent } from './builder/builder-container/filter-facet/hierarchy-filter/menu-item/menu-item.component';
import { ConnekthubModule } from '@modules/connekthub/connekthub.module';
import { ListDataTableModule } from '@modules/list/list-datatable.module'
import { CanDeactivateGuard } from 'src/app/_guards/deactivate.guard';
import { DataSetListComponent } from './builder/builder-container/dataset-list/dataset-list.component';
import { LoadReportComponent } from './builder/load-report/load-report.component'

@NgModule({
  declarations: [
    BuilderComponent,
    BuilderContainerComponent,
    BarChartComponent,
    CountComponent,
    ReportingListComponent,
    StackedbarChartComponent,
    TimeseriesWidgetComponent,
    TimseriesWidgetV2Component,
    HtmlEditorComponent,
    ImageComponent,
    PieChartComponent,
    PropertyPanelComponent,
    FilterFacetComponent,
    FormRangeSliderComponent,
    HierarchyFilter2Component,
    FormDateComponent,
    FormSingleSelectComponent,
    FormDateTimeComponent,
    FormCheckboxComponent,
    FormSingleSelectComponent,
    FormMultiselectComponent,
    FormRadioButtonGroupComponent,
    FiltersSidesheetComponent,
    FormTextAreaComponent,
    ConfigureFiltersComponent,
    TimseriesWidgetV2Component,
    MenuItemComponent,
    DataSetListComponent,
    LoadReportComponent
  ],
  imports: [
    CommonModule,
    ReportRoutingModuleV2,
    SharedModule,
    GridsterModule,
    ReportModule,
    ConnekthubModule,
    ListDataTableModule
  ],
  providers: [
    DatePipe,
    CanDeactivateGuard
  ]
})
export class ReportModuleV2 { }
