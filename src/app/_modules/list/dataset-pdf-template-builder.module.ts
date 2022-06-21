import { SharedModule } from '@modules/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfTemplateListComponent } from './_components/pdf-template-builder/pdf-template-list/pdf-template-list.component';
import { PdfTemplateListFiltersComponent } from './_components/pdf-template-builder/pdf-template-list-filters/pdf-template-list-filters.component';
import { SettingsSharedModule } from '@modules/settings/settings-shared.module';
import { UpsertPdfTemplateComponent } from './_components/pdf-template-builder/upsert-pdf-template/upsert-pdf-template.component';

const routes: Routes = [
  {
    path: '',
    component: PdfTemplateListComponent,
  },
  {
    path: ':pdfId',
    component: UpsertPdfTemplateComponent,
  },
];

@NgModule({
  declarations: [
    PdfTemplateListComponent,
    PdfTemplateListFiltersComponent,
    UpsertPdfTemplateComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    SettingsSharedModule
  ]
})
export class DatasetPdfTemplateBuilderModule { }
