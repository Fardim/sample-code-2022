import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConflictDetailsComponent } from './_components/conflict-details/conflict-details.component';
import { MergeConflictRoutingModule } from './merge-conflict-routing-module';
import { SharedModule } from '@modules/shared/shared.module';
import { GridConflictDetailsComponent } from './_components/grid-conflict-details/grid-conflict-details.component';
import { GridColumnsResolveComponent } from './_components/grid-columns-resolve/grid-columns-resolve.component';
import { CrRecordsListComponent } from './_components/cr-records-list/cr-records-list.component';



@NgModule({
  declarations: [ConflictDetailsComponent, GridConflictDetailsComponent, GridColumnsResolveComponent, CrRecordsListComponent],
  imports: [
    CommonModule,
    SharedModule,
    MergeConflictRoutingModule
  ]
})
export class MergeConflictModule { }
