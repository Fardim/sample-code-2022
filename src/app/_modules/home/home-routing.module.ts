import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from '../shared/_components/page-not-found/page-not-found.component';
import { PrimaryNavigationComponent } from './_components/primary-navigation/primary-navigation.component';
import { WelcomeV2Component } from './_components/welcome-v2/welcome-v2.component';

const routes: Routes = [
  {
    path: '',
    component: PrimaryNavigationComponent,
    children: [
      {
        path: '',
        redirectTo: 'dash/welcome',
        pathMatch: 'full',
      },
      {
        path: 'dash',
        children: [
          {
            path: 'welcome',
            component: WelcomeV2Component,
          },
        ],
      },
      // { path: '', redirectTo: 'schema', pathMatch: 'full' },
      {
        path: 'schema',
        loadChildren: () => import('../schema/schema.module').then((m) => m.SchemaModule),
      },
      {
        path: 'flows',
        loadChildren: () => import('../flow/flow.module').then((m) => m.FlowModule),
      },
      {
        path: 'report-v1',
        loadChildren: () => import('../report/report.module').then((m) => m.ReportModule),
      },
      {
        path: 'report',
        loadChildren: () => import('../report-v2/report-v2.module').then((m) => m.ReportModuleV2),
      },
      {
        path: 'list',
        loadChildren: () => import('../list/list.module').then((m) => m.ListModule),
      },
      {
        path: 'task/:node',
        loadChildren: () => import('../taskinbox/taskinbox.module').then((m) => m.TaskinboxModule),
      }
    ],
  },
  // anything not mapped should go to page not found component
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
