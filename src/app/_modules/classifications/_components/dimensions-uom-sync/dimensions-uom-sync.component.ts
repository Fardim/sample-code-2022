import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'pros-dimension-uom-sync',
  templateUrl: './dimensions-uom-sync.component.html',
  styleUrls: ['./dimensions-uom-sync.component.scss']
})
export class DimensionsUomSyncComponent implements OnInit {
  systemDimensionMap = ['value1','value2'];
  constructor(private dialogRef: MatDialogRef<DimensionsUomSyncComponent>) { }

  ngOnInit(): void {
  }

  close(){
    this.dialogRef.close();
  }

}
