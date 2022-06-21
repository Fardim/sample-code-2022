import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'pros-connectivity-dialog',
  templateUrl: './connectivity-dialog.component.html',
  styleUrls: ['./connectivity-dialog.component.scss'],
})
export class ConnectivityDialogComponent implements OnInit {
  pageDetails = {
    headerLine: '',
    contentList: '',
    confirmationLine: '',
    confirmButtonLabel: 'confirm'
  }

  constructor(public dialogRef: MatDialogRef<ConnectivityDialogComponent>, @Inject(MAT_DIALOG_DATA) private data) {}

  ngOnInit(): void {
    this.pageDetails.headerLine = this.data?.headerLine ? this.data.headerLine : '';
    this.pageDetails.contentList = this.data?.contentList ? this.data.contentList : '';
    this.pageDetails.confirmationLine = this.data?.confirmationLine ? this.data.confirmationLine : '';
    this.pageDetails.confirmButtonLabel = this.data?.confirmButtonLabel ? this.data.confirmButtonLabel : '';
  }

  close(response: boolean) {
    this.dialogRef.close(response);
  }
}
