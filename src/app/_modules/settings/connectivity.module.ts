import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './../shared/shared.module';
/* import { ConnectionDetailsComponent } from './_components/connectivity/views/connection-details/connection-details.component'; */
import { RouterModule, Routes } from '@angular/router';
import { ConnectivityComponent } from './_components/connectivity/connectivity.component';
import { EditConnectionComponent } from './_components/connectivity/views/edit-connection/edit-connection.component';
import { PageNotFoundComponent } from '@modules/shared/_components/page-not-found/page-not-found.component';
import { PreviewMappingComponent } from './_components/connectivity/views/preview-mapping/preview-mapping.component';
import { EditInterfaceComponent } from './_components/connectivity/views/edit-interface/edit-interface.component';
import { AddDaxeComponent } from './_components/connectivity/views/add-daxe/add-daxe.component';
import { SyncFreqComponent } from './_components/connectivity/views/sync-freq/sync-freq.component';
import { PayloadTestComponent } from './_components/connectivity/views/payload-test/payload-test.component';
import { NewInterfaceComponent } from './_components/connectivity/views/new-interface/new-interface.component';
import { NewConnectionComponent } from './_components/connectivity/new-connection-flow/new-connection/new-connection.component';
import { ConnectionDescriptionComponent } from './_components/connectivity/new-connection-flow/connection-description/connection-description.component';
import { NewConnectionFlowComponent } from './_components/connectivity/new-connection-flow/new-connection-flow.component';
import { ConnectivityDialogComponent } from "./_components/connectivity/connectivity-dialog/connectivity-dialog.component";
import { ExportInterfaceComponent } from './_components/connectivity/views/export-interface/export-interface.component';
import { ConnekthubModule } from '@modules/connekthub/connekthub.module';

const routes: Routes = [
  { path: '', component: ConnectivityComponent },
  /* { path: 'connection-details', component: ConnectionDetailsComponent }, */
  { path: 'edit-connection', component: EditConnectionComponent },
  { path: 'preview-mapping', component: PreviewMappingComponent },
  { path: 'edit-interface', component: EditInterfaceComponent },
  { path: 'add-daxe', component: AddDaxeComponent},
  { path: 'sync-freq', component: SyncFreqComponent},
  { path: 'payload-test', component: PayloadTestComponent },
  { path: '**', component: PageNotFoundComponent }
]
@NgModule({
  declarations: [
    EditConnectionComponent,
    PreviewMappingComponent,
    NewConnectionComponent,
    EditInterfaceComponent,
    AddDaxeComponent,
    SyncFreqComponent,
    PayloadTestComponent,
    NewInterfaceComponent,
    NewConnectionFlowComponent,
    ConnectionDescriptionComponent,
    ExportInterfaceComponent,
    ConnectivityDialogComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    ConnekthubModule
  ]
})
export class ConnectivityModule { }
