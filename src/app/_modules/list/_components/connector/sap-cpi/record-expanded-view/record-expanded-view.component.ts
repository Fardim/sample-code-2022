import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'pros-record-expanded-view',
  templateUrl: './record-expanded-view.component.html',
  styleUrls: ['./record-expanded-view.component.scss']
})
export class RecordExpandedViewComponent implements OnInit {
  parentData: any;
  recordNumberCtrl = new FormControl('', [ Validators.required ]);
  constructor(private dialogRef: MatDialogRef<RecordExpandedViewComponent>, @Inject(MAT_DIALOG_DATA) private dialogData: any) {
    this.parentData = dialogData?.data || null;
    this.recordNumberCtrl.setValue(this.parentData?.recordNumbers || '');
  }

  ngOnInit(): void {
  }

  close() {
    this.dialogRef.close(this.recordNumberCtrl.value);
  }
}
