import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'pros-dimension-add',
  templateUrl: './dimension-add.component.html',
  styleUrls: ['./dimension-add.component.scss']
})
export class DimensionAddComponent implements OnInit {
  form: FormGroup;
  constructor(
    private dialogRef: MatDialogRef<DimensionAddComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      dimension: [this.dialogData.dimension, Validators.required],
    });
  }

  close(){
    this.dialogRef.close();
  }

  saveDim(){
    if (!this.form.valid) {
      Object.values(this.form.controls).forEach((control) => {
        control.markAsTouched();
     });
    } else {
      this.dialogRef.close(this.form.get('dimension').value.toUpperCase());
    }
  }
}
