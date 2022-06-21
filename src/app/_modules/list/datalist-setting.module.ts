import { SharedModule } from './../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataListObjectSettingComponent } from './_components/data-list-object-setting/data-list-object-setting.component';
import { NumberSettingsComponent } from './_components/number-settings/number-settings.component';
import { NumberSettingsFormComponent } from './_components/number-settings-form/number-settings-form.component';
import { FieldValuesBlockComponent } from './_components/number-settings-form/field-values-block/field-values-block.component';

const routes: Routes = [
  {
    path: ':moduleId',
    component: DataListObjectSettingComponent,
    children: [
      { path: 'forms', loadChildren: () => import('./dataset-forms.module').then((m) => m.DatasetFormsModule) },
      { path: 'business-rule', loadChildren: () => import('./dataset-business.module').then((m) => m.DatasetBusinessModule) },
      { path: 'pdf-template-builder/:moduleId', loadChildren: () => import('./dataset-pdf-template-builder.module').then((m) => m.DatasetPdfTemplateBuilderModule) },
      { path: 'number-settings/:moduleId', component: NumberSettingsComponent }
    ],
  },
];

@NgModule({
  declarations: [DataListObjectSettingComponent, NumberSettingsComponent, NumberSettingsFormComponent, FieldValuesBlockComponent],
  imports: [CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ]
})
export class DatalistSettingModule { }
