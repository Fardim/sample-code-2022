import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TableHeader } from '@modules/logs/_model/logs';
import { LogsDatasourceService } from '@modules/logs/_service/logs-datasource.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'pros-view-changes-detail',
  templateUrl: './view-changes-detail.component.html',
  styleUrls: ['./view-changes-detail.component.scss']
})
export class ViewChangesDetailComponent implements OnInit {
  tableDataSource;
  displayedColumns: BehaviorSubject<string[]> = new BehaviorSubject([]);
  displayedObjColumns: BehaviorSubject<TableHeader[]> = new BehaviorSubject([]);
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ViewChangesDetailComponent>,
    private logsDatasourceService: LogsDatasourceService) {
  }

  ngOnInit(): void {
    this.tableDataSource = this.logsDatasourceService.transformGvsRowWiseData(this.data.rowDetails);
    const tableHeaderConfig = this.logsDatasourceService.getViewChangesDetailsTableHeader(this.data.actionType);
    this.displayedColumns.next(tableHeaderConfig.stringColumns);
    this.displayedObjColumns.next(tableHeaderConfig.objectColumns);
  }

  get title(): string {
    if (this.data && this.data.actionType) {
      let status = 'changes';
      switch (this.data.actionType) {
        case 'deleted':
          status = 'deleted changes';
          break;
        case 'created':
          status = 'creation';
          break;
      }
      return status;
    } else {
      return '';
    }
  }

  /**
   * Close dialog after saved or click close
   */
  closeDialog() {
    this.dialogRef.close();
  }

}
