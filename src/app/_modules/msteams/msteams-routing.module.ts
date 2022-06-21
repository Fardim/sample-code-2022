import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from '../shared/_components/page-not-found/page-not-found.component';
import { MsteamConfigurationComponent } from './msteam-configuration/msteam-configuration.component';
import { MsteamAuthConfigurationComponent } from './msteam-auth-configuration/msteam-auth-configuration.component';
import { MsteamReportConfigurationComponent } from './msteam-report-configuration/msteam-report-configuration.component';

const routes: Routes = [
  {path :'', redirectTo:'configure', pathMatch: 'full'},
  { path: 'configure', component: MsteamConfigurationComponent },
  {path: 'auth', component: MsteamAuthConfigurationComponent},
  {path: 'report', component: MsteamReportConfigurationComponent},
  // anything not mapped should go to page not found component
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MSTeamsRoutingModule { }
