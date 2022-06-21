import { Component, OnInit, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Location } from '@angular/common';

/**
 * This is global componenet , while http throw 403 | then this popup should call
 */
@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'pros-access-denied-dialog',
  templateUrl: './access-denied-dialog.component.html',
  styleUrls: ['./access-denied-dialog.component.scss']
})
export class AccessDeniedDialogComponent implements OnInit {

  /**
   * Hold dialog refrence
   */

  constructor(
    public dialog: MatDialog,
    public location: Location,
    public dialogRef: MatDialogRef<AccessDeniedDialogComponent>
  ) { }

  ngOnInit(): void {
  }

  /**
   * use for open access dined dialog
   * Ater close go back to previous location
   */
  open() {
    this.dialogRef = this.dialog.open(AccessDeniedDialogComponent, {
      width: '350px'
      // disableClose: true
    });

    if(this.dialogRef) {
      this.dialogRef.afterClosed().subscribe(result => {
        // after close go back to previous routed url
        // this.location.back();
      });
    }
  }

  close() {
    if(this.dialogRef) {
      this.dialogRef.close();
    }
  }

}
