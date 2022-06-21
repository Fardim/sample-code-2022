import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from '../shared/_components/page-not-found/page-not-found.component';
import { DescriptionDatatableComponent } from '../shared/_components/description-datatable/description-datatable.component';

const routes: Routes = [
  { path: ':moduleId', component: DescriptionDatatableComponent },
  { path: ':moduleId/:schemaId', component: DescriptionDatatableComponent },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GenerateDescriptionRoutingModule { }