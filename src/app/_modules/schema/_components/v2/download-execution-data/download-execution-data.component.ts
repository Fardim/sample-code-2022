import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorStateRes } from '@models/schema/schema';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { SchemaService } from '@services/home/schema.service';
import { TransientService } from 'mdo-ui-library';
import { Subscription } from 'rxjs';

@Component({
  selector: 'pros-download-execution-data',
  templateUrl: './download-execution-data.component.html',
  styleUrls: ['./download-execution-data.component.scss']
})
export class DownloadExecutionDataComponent implements OnInit {

  selectedNodes: string[] = [];

  subscribers: Subscription[] = [];

  /**
   * Hold the whole error information ...
   */
  errorStateRes: ErrorStateRes;

  constructor(private schemaService: SchemaService,
    private sharedService: SharedServiceService,
    private transientService: TransientService,
    private dialogRef: MatDialogRef<DownloadExecutionDataComponent>,
    @Inject(MAT_DIALOG_DATA) public data) { }

  ngOnInit(): void {
  }


  /**
   * Close dialog after saved or click close
   */
  close(response?) {
    this.dialogRef.close(response);
  }

  /**
   * Method for download execution data
   */
  downloadExecutionDetails() {
    const sub = this.schemaService.downloadExecutionDetailsByNodes(this.data.schemaId, this.data.requestStatus, this.selectedNodes, this.data.variantId).subscribe(
      resp => {
        this.transientService.open('Download successfully started', null, {
          duration: 1000
        });
        this.sharedService.getNotificationCount();
        this.close();
      },
      err => {
        this.errorStateRes = err?.error;
        console.error(`Error:: ${err.message}`);
      });
    this.subscribers.push(sub);
  }

  nodeSelectionChanged(nodeId) {
    const index = this.selectedNodes.findIndex(Id => Id === nodeId)
    if (index === -1) {
      this.selectedNodes.push(nodeId);
    } else {
      this.selectedNodes.splice(index, 1);
    }
  }

}
