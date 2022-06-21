import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CharacteristicsDetailComponent } from '../characteristics-detail/characteristics-detail.component';

@Component({
  selector: 'pros-characteristics-detail-dialog',
  templateUrl: './characteristics-detail-dialog.component.html',
  styleUrls: ['./characteristics-detail-dialog.component.scss']
})
export class CharacteristicsDetailDialogComponent implements OnInit {
  title: string;
  classId: string;
  relatedDatasetId: string;
  showActions: boolean;

  constructor(
    public dialogRef: MatDialogRef<CharacteristicsDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    ) {}

  ngOnInit(): void {
    this.title = this.dialogData.title;
    this.classId = this.dialogData.classId;
    this.relatedDatasetId = this.dialogData.relatedDatasetId;
    this.showActions = this.dialogData.showActions;
  }

  onCancelClick() {
    this.dialogRef.close();
  }
}
