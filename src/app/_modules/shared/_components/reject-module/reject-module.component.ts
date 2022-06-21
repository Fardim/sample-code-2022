import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TaskListService } from '@services/task-list.service';

@Component({
  selector: 'pros-reject-module',
  templateUrl: './reject-module.component.html',
  styleUrls: ['./reject-module.component.scss'],
})
export class RejectModuleComponent implements OnInit {
  /**
   * The control for comment ...
   */
  comment: FormControl = new FormControl('', [Validators.required]);


  errorMsg = '';

  constructor(public dialogRef: MatDialogRef<RejectModuleComponent>, @Inject(MAT_DIALOG_DATA) private data,
    private taskListService: TaskListService) {}

  ngOnInit(): void {}

  close(status: boolean) {
    this.dialogRef.close({
      status: status ? 'saved' : ''
    });
  }

  rejectTask() {
    console.log(this.data);
    if(this.data) {
      this.data.controlData.taskComment = this.comment.value;
      this.taskListService.rejectRecord(this.data).subscribe(res=>{
        this.close(true);
      }, err=>{
        console.log(`Error while rejecting doc `);
        this.errorMsg = err?.error?.message || 'Something went wrong';
      });
    }
  }
}
