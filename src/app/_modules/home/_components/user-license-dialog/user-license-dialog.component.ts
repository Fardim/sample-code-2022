import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'pros-user-license-dialog',
  templateUrl: './user-license-dialog.component.html',
  styleUrls: ['./user-license-dialog.component.scss']
})
export class UserLicenseDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<UserLicenseDialogComponent>, @Inject(MAT_DIALOG_DATA) private data) { }

  ngOnInit(): void {
  }

  subscribe() {}
  close() {
    this.dialogRef.close();
  }
}
