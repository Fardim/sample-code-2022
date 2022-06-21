import { DatasetConnectorModule } from './dataset-connector.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ListRoutingModule } from './list-routing.module';
import { ListDatatableComponent } from './_components/list-datatable/list-datatable.component';
import { SharedModule } from '../shared/shared.module';
import { ConnekthubModule } from '../connekthub/connekthub.module';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LoadDatatableComponent } from './_components/load-datatable/load-datatable.component';

@NgModule({
  declarations: [
    ListDatatableComponent,
    LoadDatatableComponent
  ],
  imports: [CommonModule, ListRoutingModule, SharedModule, DatasetConnectorModule, ConnekthubModule],
  exports: [ListDatatableComponent],
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} }
  ]
})
export class ListDataTableModule { }
