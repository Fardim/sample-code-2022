import { DatasetSourceComponent } from './_components/dataset/dataset/dataset-source/dataset-source.component';
import { ConnectorContainerDirective } from './_components/connector/directives/connector-container.directive';
import { DatasetConnectorModule } from './dataset-connector.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ListRoutingModule } from './list-routing.module';
import { ListComponent } from './_components/list.component';
import { TableViewSettingsComponent } from './_components/table-view-settings/table-view-settings.component';
import { SharedModule } from '@modules/shared/shared.module';
import { GlobalSearchComponent } from './_components/global-search/global-search.component';
import { FilterSaveModalComponent } from './_components/filter-save-modal/filter-save-modal.component';
import { FilterChipsComponent } from './_components/filter-chips/filter-chips.component';
import { RelationDataSearchComponent } from './_components/relation-data-search/relation-data-search.component';
import { DatasetComponent } from './_components/dataset/dataset/dataset.component';
import { ManuallyDatasetsComponent } from './_components/dataset/dataset/manually-datasets/manually-datasets.component';
import { VirtualDatasetsComponent } from './_components/dataset/dataset/virtual-datasets/virtual-datasets.component';
import { ListValueSidesheetComponent } from './_components/list-value-sidesheet/list-value-sidesheet.component';
import { DataReferencingComponent } from './_components/data-referencing/data-referencing.component';
import { ConnekthubModule } from '@modules/connekthub/connekthub.module';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ListDataTableModule } from './list-datatable.module';
import { DataFilteringComponent } from './_components/data-filtering/data-filtering.component';
import { SchemaModule } from '@modules/schema/schema.module';
import { ApplicableFieldSidesheetComponent } from './_components/applicable-field-sidesheet/applicable-field-sidesheet.component';
import { FieldControlComponent } from './_components/applicable-field-sidesheet/field-control/field-control.component';
import { TransactionGridModule } from '@modules/transaction/transaction-grid.module';

@NgModule({
  declarations: [
    ListComponent,
    TableViewSettingsComponent,
    GlobalSearchComponent,
    FilterSaveModalComponent,
    FilterChipsComponent,
    RelationDataSearchComponent,
    DatasetComponent,
    ManuallyDatasetsComponent,
    VirtualDatasetsComponent,
    ListValueSidesheetComponent,
    DataReferencingComponent,
    ManuallyDatasetsComponent,
    ConnectorContainerDirective,
    DatasetSourceComponent,
    DataFilteringComponent,
    ApplicableFieldSidesheetComponent,
    FieldControlComponent
  ],
  imports: [CommonModule, ListRoutingModule, SharedModule, DatasetConnectorModule, ConnekthubModule,ListDataTableModule, SchemaModule, TransactionGridModule],
  exports: [DatasetComponent],
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} }
  ]
})
export class ListModule { }
