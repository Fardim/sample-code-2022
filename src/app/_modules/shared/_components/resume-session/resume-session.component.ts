import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'pros-resume-session',
  templateUrl: './resume-session.component.html',
  styleUrls: ['./resume-session.component.scss']
})
export class ResumeSessionComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ResumeSessionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
  }

  close() {
    this.dialogRef.close();
  }

}
