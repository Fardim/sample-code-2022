import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb';
import { SchemaListDetails } from 'src/app/_models/schema/schemalist';
import { SchemalistService } from 'src/app/_services/home/schema/schemalist.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SchemaExecutionService } from 'src/app/_services/home/schema/schema-execution.service';
import { SchemaExecutionRequest } from 'src/app/_models/schema/schema-execution';
import { MatDialog } from '@angular/material/dialog';
import { SchemaExecutionDialogComponent } from './schema-execution-dialog/schema-execution-dialog.component';

@Component({
  selector: 'pros-schema-execution',
  templateUrl: './schema-execution.component.html',
  styleUrls: ['./schema-execution.component.scss']
})

export class SchemaExecutionComponent implements OnInit {

  breadcrumb: Breadcrumb = {
    heading: 'Execute schema',
    links: [
      {
        link: '/home/schema/',
        text: 'Schema group(s)'
      }
    ]
  };
  selectedRunType = 'all';
  schemaId: string;
  schemaDetail: SchemaListDetails;
  constructor(
    private schemaListService: SchemalistService,
    private activatedRouter: ActivatedRoute,
    private schemaExecutionService: SchemaExecutionService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.schemaDetail = new SchemaListDetails();
   }

  ngOnInit() {
    this.activatedRouter.params.subscribe(param => {
      this.schemaId = param.schemaId;
      this.getSchemaDetail(this.schemaId);
});
  }

  public getSchemaDetail(schemaId: string) {
    this.schemaListService.getSchemaDetailsBySchemaId(schemaId).subscribe(data => {
      this.schemaDetail = data;
    }, error => {
      console.error('Error while fetching schema details');
    });
  }

  public scheduleSchema() {
    const schemaExecutionReq: SchemaExecutionRequest = new SchemaExecutionRequest();
    schemaExecutionReq.schemaId =  this.schemaId;
    schemaExecutionReq.variantId = '0'; // 0 for run all
    const isRunWithCheckedData = false;
    this.schemaExecutionService.scheduleSChema(schemaExecutionReq, isRunWithCheckedData).subscribe(data => {
      this.router.navigate(['/home/schema']);
    }, error => {
      console.error('Error while schedule schema');
    });
}
  openDialog() {
    const dialogRef = this.dialog.open(SchemaExecutionDialogComponent, {
      height: '400px',
      width: '550px',
      autoFocus: false,
      data: {schemaId: this.schemaId}
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}
