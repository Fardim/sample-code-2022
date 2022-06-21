import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatasetSelectorComponent } from './_components/dataset-selector/dataset-selector.component';
import { VirtualDatasetDetailsComponent } from './_components/virtual-dataset-details/virtual-dataset-details.component';
import { FilterSideSheetComponent } from './_components/filter-side-sheet/filter-side-sheet.component';
import { JoinPropertiesSideSheetComponent } from './_components/joining-properties-side-sheet/join-properties-side-sheet.component';
import { MapFieldsSideSheetComponent } from './_components/map-fields-side-sheet/map-fields-side-sheet.component';
import { CreateVirtualDatasetComponent } from './_components/dataset/dataset/create-virtual-dataset/create-virtual-dataset.component';
import { TableColumnsComponent } from './_components/table-columns/table-columns.component';
import { JoinStepComponent } from './_components/join-step/join-step.component';

import { VirtualDatasetEditComponent } from './_components/dataset/dataset/virtual-dataset-edit/virtual-dataset-edit.component';
import { CreateJoinComponent } from './_components/dataset/dataset/create-join/create-join.component';
const routes: Routes = [
  {
    path: 'table-filter/:brId',
    component: FilterSideSheetComponent
  },
  {
    path: 'join/properties',
    component: JoinPropertiesSideSheetComponent
  },
  {
    path: 'join/properties/map/fields',
    component: MapFieldsSideSheetComponent
  },
  {
    path: ':id/edit',
    component: CreateVirtualDatasetComponent,
  },
  {
    path: ':id',
    component: VirtualDatasetDetailsComponent,
  },
];

@NgModule({
  declarations: [
    DatasetSelectorComponent,
    VirtualDatasetDetailsComponent,
    CreateVirtualDatasetComponent,
    FilterSideSheetComponent,
    TableColumnsComponent,
    JoinStepComponent,
    VirtualDatasetEditComponent,
    CreateJoinComponent,
    JoinPropertiesSideSheetComponent,
    MapFieldsSideSheetComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
})
export class VirtualDatasetModule { }
