import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogsRoutingModule } from './logs-routing.module';
import { AuditComponent } from './_components/audit/audit.component';
import { ViewChangesComponent } from './_components/view-changes/view-changes.component';
import { SharedModule } from '@modules/shared/shared.module';
import { ViewChangesDetailComponent } from './_components/view-changes-detail/view-changes-detail.component';
import { InstanceDiagramComponent } from './_components/audit/instance-diagram/instance-diagram.component';

@NgModule({
  declarations: [AuditComponent, ViewChangesComponent, ViewChangesDetailComponent, InstanceDiagramComponent],
  imports: [
    CommonModule,
    LogsRoutingModule,
    SharedModule,
    LogsRoutingModule
  ]
})
export class LogsModule { }
