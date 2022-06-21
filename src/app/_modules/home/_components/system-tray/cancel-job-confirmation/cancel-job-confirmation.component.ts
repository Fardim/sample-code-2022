import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'pros-cancel-job-confirmation',
  templateUrl: './cancel-job-confirmation.component.html',
  styleUrls: ['./cancel-job-confirmation.component.scss']
})
export class CancelJobConfirmationComponent implements OnInit {
  reason: string;
  constructor(private dialgRef: MatDialogRef<CancelJobConfirmationComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
  }

  close(data: any = null) {
    this.dialgRef.close({confirmation: data, reason: this.reason});
  }
}
