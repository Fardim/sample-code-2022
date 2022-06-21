import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'pros-filter-save-modal',
  templateUrl: './filter-save-modal.component.html',
  styleUrls: ['./filter-save-modal.component.scss']
})
export class FilterSaveModalComponent implements OnInit {

  nameControl = new FormControl('', Validators.required);
  submitted = false;

  constructor(
    public dialogRef: MatDialogRef<FilterSaveModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    if(this.data && this.data.filterName) {
      this.nameControl.setValue(this.data.filterName);
    }
  }

  close(isSaveClicked: boolean) {
    this.submitted = true;
    if(isSaveClicked && !this.nameControl.valid) {
      return;
    }
    this.dialogRef.close(isSaveClicked ? this.nameControl.value : '');
  }

}
