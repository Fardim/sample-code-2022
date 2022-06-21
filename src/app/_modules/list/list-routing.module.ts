import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PublishToConnekthubComponent } from '@modules/connekthub';
import { PageNotFoundComponent } from '@modules/shared/_components/page-not-found/page-not-found.component';
import { ScheduleComponent } from '@modules/shared/_components/schedule/schedule.component';
import { DataReferencingComponent } from './_components/data-referencing/data-referencing.component';
import { DisplayCriteriaComponent } from './_components/dataset-form/display-criteria/display-criteria.component';
import { ListDatatableComponent } from './_components/list-datatable/list-datatable.component';
import { ListFilterComponent } from './_components/list-filter/list-filter.component';
import { ListValueSidesheetComponent } from './_components/list-value-sidesheet/list-value-sidesheet.component';
import { TableViewSettingsComponent } from './_components/table-view-settings/table-view-settings.component';
import { LoadDatatableComponent } from './_components/load-datatable/load-datatable.component';
import { DataFilteringComponent } from './_components/data-filtering/data-filtering.component';
import { ApplicableFieldSidesheetComponent } from './_components/applicable-field-sidesheet/applicable-field-sidesheet.component';
import { EditDatasetFormComponent } from './_components/dataset-form/edit-dataset-form/edit-dataset-form.component';
const routes: Routes = [
  { path: '', component: LoadDatatableComponent },
  { path: 'datatable/:moduleId', component: ListDatatableComponent },
  { path: 'vd', loadChildren: () => import('./virtual-dataset.module').then((m) => m.VirtualDatasetModule) },
  { path: 'table-view-settings/:moduleId/:viewId', component: TableViewSettingsComponent },
  { path: 'dataset-settings', loadChildren: () => import('./datalist-setting.module').then((m) => m.DatalistSettingModule) },
  { path: 'edit-dataset', loadChildren: () => import('./datalist-setting.module').then((m) => m.DatalistSettingModule) },
  { path: 'filter-settings/:moduleId', component: ListFilterComponent },
  { path: 'fields', loadChildren: () => import('./fields.module').then((m) => m.FieldsModule) },
  { path: 'dropdown-values/:dependentfieldType/:moduleId/:fieldId', component: ListValueSidesheetComponent },
  { path: 'data-referencing/:moduleId/:fieldId', component: DataReferencingComponent },
  { path: 'data-filtering/:moduleId/:fieldId', component: DataFilteringComponent },
  { path: 'publish-dataset', component: PublishToConnekthubComponent },
  { path: 'display-criteria/:moduleId/:udrId', component: DisplayCriteriaComponent },
  { path: 'outer/schedule-sync', component: ScheduleComponent },
  { path: 'applicable-sidesheet/:moduleId/:formId', component: ApplicableFieldSidesheetComponent },
  { path: 'edit-dataset-form/:moduleId/:formId', component: EditDatasetFormComponent },
  { path: '**', component: PageNotFoundComponent }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ListRoutingModule { }
