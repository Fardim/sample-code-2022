import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/_guards/auth.guard';
import { PageNotFoundComponent } from '../shared/_components/page-not-found/page-not-found.component';
import { NonavLayoutComponent } from './_layouts/nonav-layout/nonav-layout.component';

const routes: Routes = [{
  path: '', component: NonavLayoutComponent,
  children: [
    { path: 'report', loadChildren: () => import('../report-v2/report-v2.module').then(m => m.ReportModuleV2), canActivate: [AuthGuard] },
    { path: 'cr/merge-conflict', loadChildren: () => import('../merge-conflict/merge-conflict.module').then(m => m.MergeConflictModule) },
    { path: 'generate-description', loadChildren: () => import('../generate-description/generate-description.module').then(m => m.GenerateDescriptionModule) }
  ]
},
// anything not mapped should go to page not found component
{ path: '**', component: PageNotFoundComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NonavRoutingModule { }
