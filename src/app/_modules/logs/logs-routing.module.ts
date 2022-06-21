import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from '@modules/shared/_components/page-not-found/page-not-found.component';
import { AuditComponent } from './_components/audit/audit.component';
import { InstanceDiagramComponent } from './_components/audit/instance-diagram/instance-diagram.component';
import { ViewChangesComponent } from './_components/view-changes/view-changes.component';

const routes: Routes = [
  { path: 'audit-log', component: AuditComponent },
  { path: 'process-instance-diagram/:containerId/:processId', component: InstanceDiagramComponent },
  { path: 'view-changes', component: ViewChangesComponent },
  // anything not mapped should go to page not found component
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LogsRoutingModule { }
