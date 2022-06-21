import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SchemaFileUploadRes } from '@models/schema/schema';
import { SchemaImportComponent } from '@modules/connekthub/_components/schema-import/schema-import.component';
import { TransientService } from 'mdo-ui-library';
import { SchemaService } from '../schema.service';

@Injectable({
  providedIn: 'root'
})
export class SchemaImportService {

  constructor(
    private toastService: TransientService,
    private schemaService: SchemaService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  valdateFileUpload(evt: Event) {
    if (evt !== undefined) {
      const target: DataTransfer = (evt.target) as unknown as DataTransfer;
      if (target.files.length !== 1) throw new Error('Cannot use multiple files');

      // check file type
      let type = '';
      try {
        type = `${target.files[0].name}`.split('.')[1];
      } catch (ex) {
        console.error(ex);
      }
      if (type === 'mdoSchemas') {
        this.parseSchemaFile(target.files[0]);
      } else {
        (evt.target as any).value = '';
        this.toastService.open('Unsupported file format, allowed file format is .mdoSchemas', '', { duration: 5000 });
      }
    }
  }

  parseSchemaFile(file: File) {
    let moduleId = '';
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const str: any = reader.result;
      const json = JSON.parse(str);
      moduleId = json?.content?.schema?.moduleId || '';
      this.uploadSchemaFile(file, moduleId);
    };
    reader.readAsBinaryString(file);
  }

  uploadSchemaFile(file, moduleId) {
    this.schemaService.uploadSchemaFile(file).subscribe((res: SchemaFileUploadRes) => {
      if (!res?.alreadyExits && !res?.log?.length) {
        this.importSchema(res, moduleId);
      } else {
        this.openImportModal(res, moduleId);
      }
    }, (err) => {
      this.toastService.open((err?.error?.errorMsg || 'Unable to upload schema file'), '', {duration: 3000});
    });
  }

  importSchema(res, moduleId) {
    this.schemaService.importSchema(res?.fileSno, res?.schemaId, false, false).subscribe((resp: SchemaFileUploadRes) => {
      if (resp && resp?.schemaId) {
        this.toastService.open('The schema has been successfully imported!', '', {duration: 2000});
        this.router.navigate([{ outlets: { sb: `sb/schema/check-data/${moduleId}/${resp.schemaId}` } }]);
      }
    }, (err) => {
      this.toastService.open((err?.error?.errorMsg || 'Failed to import schema'), '', {duration: 2000});
    });
  }

  openImportModal(response: SchemaFileUploadRes, moduleId) {
    let minHeight = 210;
    if (response?.log?.length) {
      minHeight = 250;
    }
    const dialogRef = this.dialog.open(SchemaImportComponent, {
      data: {
        response
      },
      width: '750px',
      minHeight: `${minHeight}px`,
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result?.schemaId) {
        this.toastService.open('The schema has been successfully imported!', '', {duration: 2000});
        this.router.navigate([{ outlets: { sb: `sb/schema/check-data/${moduleId}/${result.schemaId}` } }]);
      }
    });
  }
}
