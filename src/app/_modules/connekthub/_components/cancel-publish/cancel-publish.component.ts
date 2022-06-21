import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConnekthubService } from '@modules/connekthub/_services/connekthub.service';

@Component({
  selector: 'pros-cancel-publish',
  templateUrl: './cancel-publish.component.html',
  styleUrls: ['./cancel-publish.component.scss']
})
export class CancelPublishComponent implements OnInit {
  chkPackageId: string;
  loginForm = false;

  constructor(
    public dialogRef: MatDialogRef<CancelPublishComponent>,
    @Inject(MAT_DIALOG_DATA) private data,
    private connekthubService: ConnekthubService
  ) { }

  ngOnInit(): void {
    this.chkPackageId = this.data.chkPackageId;
  }

  close(successfully = false) {
    this.dialogRef.close({
      successfully
    });
  }

  cancel() {
    this.connekthubService.withdraw(this.chkPackageId).subscribe(res => {
      this.close(true);
    }, error => {
      if (error.status === 401) {
        this.loginForm = true;
      }
    });
  }
}
