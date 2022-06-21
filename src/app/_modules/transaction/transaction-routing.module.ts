import { GenerateDescriptionExpansionViewComponent } from './_components/generate-description-expansion-view/generate-description-expansion-view.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from '@modules/shared/_components/page-not-found/page-not-found.component';
import { ExpansionViewComponent } from './_components/expansion-view/expansion-view.component';
import { DuplicateDatatableColumnsSettingComponent } from './_components/duplicate-datatable-columns-setting/duplicate-datatable-columns-setting.component';
import { DuplicateRecordsDatatableComponent } from './_components/duplicate-records-datatable/duplicate-records-datatable.component';
import { TransactionBuilderComponent } from './_components/transaction-builder/transaction-builder.component';
import { TransactionGridFormViewComponent } from './_components/transaction-grid-form-view/transaction-grid-form-view.component';

const routes: Routes = [

  { path: ':moduleId', redirectTo: ':moduleId/create/:flowId/:layoutId/new', pathMatch: 'full' },
  { path: ':moduleId/copy/:flowId/:layoutId/:activeTabId/:id/:activeTabId/:firstLevelHierarchy/:secondLevelHierarchy/:recordType', component: TransactionBuilderComponent},
  { path: ':moduleId/create/:flowId/:layoutId/:activeTabId/new/:recordType/:stepId', component: TransactionBuilderComponent },
  { path: ':moduleId/change/:flowId/:layoutId/:activeTabId/:id/:recordType/:stepId', component: TransactionBuilderComponent },
  { path: ':moduleId/view/:flowId/:layoutId/:activeTabId/:id/:recordType/:stepId', component: TransactionBuilderComponent },
  { path: ':moduleId/copy/:flowId/:layoutId/:activeTabId/:id/:recordType/:stepId', component: TransactionBuilderComponent },
  { path: ':moduleId/approve/:flowId/:processFlowContainerId/:processId/:taskId/:layoutId/:activeTabId/:id/:recordType/:crId/:dataEventId', component: TransactionBuilderComponent },
  { path: 'grid/form-view', component: TransactionGridFormViewComponent },
  { path: ':moduleId/expansion-view/:flowId/:layoutId/:recordId/:tabId/:fieldId/:stepId', component: ExpansionViewComponent },
  { path: ':moduleId/generate-descriptioin-expansion-view/:flowId/:layoutId/:recordId/:tabId/:fieldId/:process/:stepId', component: GenerateDescriptionExpansionViewComponent },
  { path: ':moduleId/duplicate-datatable/:brId', component: DuplicateRecordsDatatableComponent },
  { path: ':moduleId/columns-setting', component: DuplicateDatatableColumnsSettingComponent },
  // anything not mapped should go to page not found component
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransactionRoutingModule { }
