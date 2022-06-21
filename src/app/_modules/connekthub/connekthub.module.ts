import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportSidesheetComponent } from './_components/import-sidesheet/import-sidesheet.component';
import { ConnekthubLoginComponent } from './_components/connekthub-login/connekthub-login.component';
import { ConnekthubPackagesComponent } from './_components/connekthub-packages/connekthub-packages.component';
import { PublishToConnekthubComponent } from './_components/publish-to-connekthub/publish-to-connekthub.component';
import { SharedModule } from '@modules/shared/shared.module';
import { ConnekthubService } from './_services/connekthub.service';
import { CancelPublishComponent } from './_components/cancel-publish/cancel-publish.component';
import { ImportValidateComponent } from './_components/import-validate/import-validate.component';
import { SchemaImportComponent } from './_components/schema-import/schema-import.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@NgModule({
  declarations: [
    ImportSidesheetComponent,
    ConnekthubLoginComponent,
    ConnekthubPackagesComponent,
    PublishToConnekthubComponent,
    CancelPublishComponent,
    ImportValidateComponent,
    SchemaImportComponent
  ],
  exports: [
    ImportSidesheetComponent,
    ConnekthubLoginComponent,
    ConnekthubPackagesComponent,
    PublishToConnekthubComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  providers: [
    ConnekthubService,
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} }
  ]
})
export class ConnekthubModule { }
