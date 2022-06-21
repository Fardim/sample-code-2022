import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WidgetService } from '@services/widgets/widget.service';

@Component({
  selector: 'pros-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent implements OnInit {
  errorMsg: string;
  /** Maximum length of report name */
  maxReportNameLength = 100;
  reportNameCtrl: FormControl = new FormControl('',
    Validators.compose([
      Validators.required,
      Validators.maxLength(this.maxReportNameLength)
    ])
  );
  constructor(
    private widgetService: WidgetService,
    public dialogRef: MatDialogRef<ExportComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    this.reportNameCtrl.setValue(data.reportName);
  }

  ngOnInit(): void {
  }

  onConfirm() {
    const fileName = encodeURIComponent(this.reportNameCtrl.value);

    this.widgetService.exportReport(this.data.reportId, fileName).subscribe(res => {
      if (res?.errorMsg) {
        this.errorMsg = `Unable to complete export: (${res.errorMsg})`;
      } else {
        if(res){
          this.downloadMDOReport(res,this.reportNameCtrl.value);
        }
        this.dialogRef.close();
      }
    }, error => {
      if (error.error && error.error.errorMsg) {
        this.errorMsg = `Unable to complete export: (${error.error.errorMsg})`;
      } else if (error.error && error.error.error) {
        this.errorMsg = `Unable to complete export: (${error.error.error})`;
      } else {
        this.errorMsg = `Unable to complete export: (network error)`;
      }
    });
  }

  /**
   * Close dialog
   */
   close() {
    this.dialogRef.close();
  }

  private downloadMDOReport(response: any, reportName:string){
    const binaryData = [];
    binaryData.push(response);
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, {type: '.mdopage'}));
    downloadLink.setAttribute('download', reportName +'.mdopage');
    document.body.appendChild(downloadLink);
    downloadLink.click();
  }
}
