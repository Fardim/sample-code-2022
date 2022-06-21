import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'pros-delete-reason-dialog',
  templateUrl: './delete-reason-dialog.component.html',
  styleUrls: ['./delete-reason-dialog.component.scss']
})
export class DeleteReasonDialogComponent implements OnInit {
  reason: string;

  constructor(public dialogRef: MatDialogRef<DeleteReasonDialogComponent>) {}

  ngOnInit(): void {}

  close(isYesClicked: boolean) {
    this.dialogRef.close(isYesClicked ? { value: 'yes', reason: this.reason } : { value: 'no', reason: this.reason });
  }
}
