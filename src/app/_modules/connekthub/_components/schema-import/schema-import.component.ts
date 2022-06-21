import { SchemaMetadata } from '@angular/compiler';
import { Component, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SchemaFileUploadRes } from '@models/schema/schema';
import { SchemaListDetails } from '@models/schema/schemalist';
import { SchemaService } from '@services/home/schema.service';
import { SchemalistService } from '@services/home/schema/schemalist.service';

@Component({
  selector: 'pros-schema-import',
  templateUrl: './schema-import.component.html',
  styleUrls: ['./schema-import.component.scss']
})
export class SchemaImportComponent implements OnDestroy {

  schemaInfo: SchemaListDetails;
  subscriptions = [];
  schemaFileUploadRes: SchemaFileUploadRes;
  infoMsg = '';
  errMsg = '';
  apiFailureMsg = '';
  isDuplicate = false;
  displayedColumnsEror: string[] = ['message', 'category'];

  constructor(
    public dialogRef: MatDialogRef<SchemaMetadata>,
    @Inject(MAT_DIALOG_DATA) public data,
    private schemaListService: SchemalistService,
    private schemaService: SchemaService
  ) {
    this.schemaFileUploadRes = data?.response;

    if (this.schemaFileUploadRes.schemaId) {
      this.getSchemaInfo(this.schemaFileUploadRes?.schemaId);
    }
    this.checkData();
  }

  getSchemaInfo(schemaId) {
    if (schemaId) {
      const sub = this.schemaListService.getSchemaDetailsBySchemaId(schemaId).subscribe((res: SchemaListDetails) => {
        this.schemaInfo = res;
      }, (error) => console.error('Error : {}', error.message));

      this.subscriptions.push(sub);
    }
  }

  checkData() {
    if (this.schemaFileUploadRes?.log?.find((log) => log.category === 'ERROR')) {
      this.errMsg = `${this.schemaFileUploadRes?.schemaName || 'Schema'} cannot be imported because of the errors`;
    } else if (this.schemaFileUploadRes?.alreadyExits) {
      this.isDuplicate = true;
      this.infoMsg = `Schema ${this.schemaFileUploadRes?.schemaName || ''} already exists for ${this.schemaInfo?.moduleDescription || 'this'} dataset. Select from below options to proceed.`;
    }
  }

  importSchema(keepCopy = false, replaceOld = false) {
    this.apiFailureMsg = '';
    this.schemaService.importSchema(this.schemaFileUploadRes.fileSno, this.schemaFileUploadRes.schemaId, keepCopy, replaceOld).subscribe((res: SchemaFileUploadRes) => {
      if (res?.schemaId) {
        this.close({ schemaId: res.schemaId });
      }
    }, (err) => {
      this.apiFailureMsg = err?.error?.errorMsg || 'Failed to import schema';
    });
  }

  close(res = {}) {
    this.dialogRef.close({ data: res });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

}
