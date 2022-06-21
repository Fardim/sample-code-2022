import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MSTeamsRoutingModule } from './msteams-routing.module';
import { SharedModule } from '../shared/shared.module';
import { MsteamConfigurationComponent } from './msteam-configuration/msteam-configuration.component';
import { MsteamAuthConfigurationComponent } from './msteam-auth-configuration/msteam-auth-configuration.component';
import { MsteamReportConfigurationComponent } from './msteam-report-configuration/msteam-report-configuration.component';

@NgModule({
  declarations: [
    MsteamConfigurationComponent,
    MsteamAuthConfigurationComponent,
    MsteamReportConfigurationComponent
  ],
  imports: [
    CommonModule,
    MSTeamsRoutingModule,
    SharedModule
  ]
})
export class MSTeamsModule { }
