import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { FormNullstateComponent } from './_components/dataset-form/form-nullstate/form-nullstate.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormListComponent } from './_components/dataset-form/form-list/form-list.component';
import { EditDatasetFormComponent } from './_components/dataset-form/edit-dataset-form/edit-dataset-form.component';
import { DatasetFormPropertiesComponent } from './_components/dataset-form/dataset-form-properties/dataset-form-properties.component';
import { DisplayCriteriaComponent } from './_components/dataset-form/display-criteria/display-criteria.component';
import { SectionPropertyComponent } from './_components/dataset-form/section-property/section-property.component';
import { FormTabWidgetComponent } from './_components/dataset-form/form-tab-widget/form-tab-widget.component';
import { FormTabComponent } from './_components/dataset-form/form-tab/form-tab.component';
import { FormGridFieldPropertyPanelComponent } from './_components/dataset-form/form-grid-field-property-panel/form-grid-field-property-panel.component';
const routes: Routes = [
  { path: 'display-criteria', component: DisplayCriteriaComponent },
  {
    path: ':moduleId/:formId',
    component: EditDatasetFormComponent,
  },
  {
    path: ':moduleId',
    component: FormListComponent,
  }
];

@NgModule({
  declarations: [FormNullstateComponent, FormListComponent, EditDatasetFormComponent, DatasetFormPropertiesComponent, DisplayCriteriaComponent, SectionPropertyComponent, FormTabComponent, FormTabWidgetComponent, FormGridFieldPropertyPanelComponent],
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule, FormsModule, ReactiveFormsModule],
})
export class DatasetFormsModule { }
