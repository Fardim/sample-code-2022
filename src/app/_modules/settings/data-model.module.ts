import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from '../shared/_components/page-not-found/page-not-found.component';
import { DataModelListComponent } from '../settings/_components/data-model/data-model-list/data-model-list.component';
import { DataModelComponent } from '../settings/_components/data-model/data-model/data-model.component';
import { DataModelHierarchicalComponent } from '../settings/_components/data-model/data-model/data-model-hierarchical/data-model-hierarchical.component';
import { DataModelPropertiesComponent } from '../settings/_components/data-model/data-model/data-model-properties/data-model-properties.component';
import { DataModelConditionComponent } from '../settings/_components/data-model/data-model-condition/data-model-condition.component';
import { DataModelHierarchyLevelComponent } from '../settings/_components/data-model/data-model/data-model-hierarchy-level/data-model-hierarchy-level.component';
const routes: Routes = [
    { path: '' , component: DataModelListComponent},
    { path : '**' , component: PageNotFoundComponent}
];

@NgModule({
  declarations: [
    DataModelListComponent,
    DataModelComponent,
    DataModelHierarchicalComponent,
    DataModelPropertiesComponent,
    DataModelConditionComponent,
    DataModelHierarchyLevelComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
  ]
})

export class DataModelModule { }
