import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from '../shared/_components/page-not-found/page-not-found.component';
import { ConflictDetailsComponent } from './_components/conflict-details/conflict-details.component';
import { GridColumnsResolveComponent } from './_components/grid-columns-resolve/grid-columns-resolve.component';

const routes: Routes = [
  { path: ':crId', component: ConflictDetailsComponent },
  { path: '_all/:massId', component: ConflictDetailsComponent },
  { path: 'grid/column-resolve', component: GridColumnsResolveComponent },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MergeConflictRoutingModule { }