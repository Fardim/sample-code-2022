import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ImportReport, ReportCategory } from '@modules/report/_models/widget';
import { WidgetService } from '@services/widgets/widget.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'pros-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss'],
})
export class ImportComponent implements OnInit {
  readonly ReportCategory = ReportCategory;

  uploadLoader = false;
  importData: ImportReport;
  isDuplicate: boolean;
  successful: boolean;
  displayedColumns: string[] = ['description', 'importedAt'];
  displayedColumnsEror: string[] = ['message', 'category'];
  dataSource: any[];
  isMissingModule: boolean;
  seletedFile: File;
  errorMsg: string;
  warningMessage: string;

  constructor(
    private widgetService: WidgetService,
    private matDialog: MatDialog,
    public dialogRef: MatDialogRef<ImportComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    if (data?.file) {
      this.seletedFile = data.file;
      this.uploadLoader = true;
      this.importReport();
    }
  }

  ngOnInit(): void {}

  /**
   * Close dialog
   */
  close() {
    this.dialogRef.close();
  }

  /**
   * When selecting a file
   */
  fileChange(fileList: FileList) {
    const file = fileList.item(0);
    const fileName = file?.name.toLocaleLowerCase();
    if (!file) {
      this.errorMsg = 'Unable to complete upload: (Select a file)';
    } else if (!fileName.endsWith('.mdopage')) {
      this.errorMsg = 'Unable to complete upload: (Incorrect file type)';
    } else {
      this.errorMsg = null;
      this.seletedFile = file;
      this.uploadLoader = true;
      this.dataSource = [
        {
          description: this.seletedFile.name,
          importedAt: new Date(),
        },
      ];
      this.dialogRef.disableClose = true;
    }
  }

  /**
   * Upload file
   */
  importReport() {
    this.widgetService.importReport(this.seletedFile, '', false, false, '', '', false).subscribe(
      (res) => {
        this.importData = res;

        if (!this.importData?.alreadyExits && this.importData?.acknowledge) {
          this.isMissingModule = true;
        }
      },
      (error) => {
        this.importData = error.error;
        if (!this.importData?.alreadyExits && !this.importData?.acknowledge) {
          this.isMissingModule = true;
        }

        const reportCategories = Object.values(ReportCategory);
        if (this.importData?.logs) {
          if (this.importData.logs?.some((s) => s.category === ReportCategory.DUPLICATE_REPORT)) {
            this.isDuplicate = true;
            this.warningMessage = `An existing report shares the name ${this.seletedFile.name} . Duplicate or Replace`;
          } else if (this.importData.logs?.some((s) => reportCategories.includes(s.category))) {
            this.isMissingModule = true;
          }
        } else {
          this.errorMsg = 'Error while importing file  (network error)';
        }
      }
    );
  }

  /**
   * On Back button click
   */
  back() {
      this.deleteLogs();
  }

  deleteLogs() {
    this.widgetService.deleteLogs(this.importData.reportId).subscribe((res) => {
      this.clearImportDetails();
    });
  }

  clearImportDetails() {
    this.importData = undefined;
    this.dataSource = undefined;
    this.uploadLoader = false;
    this.successful = false;
    this.isDuplicate = false;
    this.isMissingModule = false;
    this.errorMsg = '';
    this.dialogRef.disableClose = false;
  }

  /**
   * Add report
   */
  addReport(replaceOld: boolean = false, keepCopy: boolean = false) {
    this.widgetService.importReport(this.seletedFile,  '', replaceOld, keepCopy, this.importData?.reportId, this.importData?.reportId, true).subscribe(
      (res) => {
        // Commenting the confirmation popup code as scheduler is not part of current sprint Refresh 3.1
        // this.dialogRef.addPanelClass('display-dialog');
        // const dialogRef = this.matDialog.open(ConfirmationDialogComponent, {
        //   width: '600px',
        //   disableClose:true,
        //   data:   {
        //     dialogTitle:'Confirmation',
        //     label : 'Existing schedule will not be duplicated. Schedule will need to be reconfigued. '
        //   }
        // });

        // dialogRef.afterClosed().subscribe(result => {
        //   if(result  === 'yes'){
        //     this.close();
        //   } else {
        //     this.dialogRef.removePanelClass('display-dialog');
        //   }
        // });

        this.dialogRef.close({ data: res });
      },
      (err: HttpErrorResponse) => {
        this.errorMsg = err?.error?.errorMsg ?? 'Error while importing file  (network error)';
      }
    );
  }
}
