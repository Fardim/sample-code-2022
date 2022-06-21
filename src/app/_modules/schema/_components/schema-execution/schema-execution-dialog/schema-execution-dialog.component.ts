import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SchemaService } from 'src/app/_services/home/schema.service';
import { SchemaExecutionRequest } from 'src/app/_models/schema/schema-execution';
import { SchemaExecutionService } from 'src/app/_services/home/schema/schema-execution.service';
import { Router } from '@angular/router';
import { SchemaExecutionComponent } from '../schema-execution.component';

@Component({
  selector: 'pros-schema-execution-dialog',
  templateUrl: './schema-execution-dialog.component.html',
  styleUrls: ['./schema-execution-dialog.component.scss']
})
export class SchemaExecutionDialogComponent implements OnInit {

  totalCount = 0;
  schemaId: string;
  showRunning = true;
  constructor(
    public dialogRef: MatDialogRef<SchemaExecutionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private schemaService: SchemaService,
    private schemaExecutionService: SchemaExecutionService,
    private router: Router
) {}
  ngOnInit() {
    this.getCount();
}

  private getCount() {
    this.schemaService.scheduleSchemaCount(this.data.schemaId).subscribe(data => {
    this. totalCount = data;
    this.showRunning = false;
}, error => {
  console.error('Error while fetch schema count details!');
});
}
  closeDialog(): void {
    this.dialogRef.close();
  }
  public scheduleSchema() {
    this.showRunning = false;
    const schemaExecutionReq: SchemaExecutionRequest = new SchemaExecutionRequest();
    schemaExecutionReq.schemaId =  this.data.schemaId;
    schemaExecutionReq.variantId = '0'; // 0 for run all
    const isRunWithCheckedData = false;
    this.schemaExecutionService.scheduleSChema(schemaExecutionReq, isRunWithCheckedData).subscribe(data => {
      console.log('Successfully scheduled');
      this.router.navigate(['/home/schema']);
      this.dialogRef.close();
    }, error => {
      console.log('Error while schedule schema');
    });
}
}
