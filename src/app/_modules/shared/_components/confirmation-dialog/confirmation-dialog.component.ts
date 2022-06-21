import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ConfirmationDialogReq {
  label: string;
  data?: any;
}

@Component({
  selector: 'pros-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogReq
  ) { }

  ngOnInit(): void {
    console.log(this.data);
  }

  close(isYesClicked: boolean) {
    this.dialogRef.close(isYesClicked ? 'yes' : 'no');
  }
}
