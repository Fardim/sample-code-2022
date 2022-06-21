import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { VirtualDataset } from '@models/list-page/listpage';
import { VirtualDatasetDetails } from '@models/list-page/virtual-dataset/virtual-dataset';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { VirtualDatasetService } from '@services/list/virtual-dataset/virtual-dataset.service';
import { TransientService } from 'mdo-ui-library';
import { Subscription } from 'rxjs';

@Component({
  selector: 'pros-virtual-dataset-details',
  templateUrl: './virtual-dataset-details.component.html',
  styleUrls: ['./virtual-dataset-details.component.scss']
})
export class VirtualDatasetDetailsComponent implements OnInit, OnDestroy {
  vdId: string;
  virtualDatasetDetails: VirtualDatasetDetails;
  virtualDataList: VirtualDataset[] = [];
  subscriptions: Subscription[] = [];
  get hasGroupDetails() { return this.virtualDatasetDetails?.groupDetails?.length > 0 }

  constructor(
    private activatedRouter: ActivatedRoute,
    private router: Router,
    private virtualDatasetService: VirtualDatasetService,
    private transientService: TransientService,
    private sharedService: SharedServiceService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.activatedRouter.params.subscribe(params => {
      this.vdId = params?.id ?? '';
      if (this.vdId) {
        this.getVirtualDatasetDetailsByVdId(this.vdId);
      }
    });
  }

  /**
   * Get Virtual Dataset Details
   * Based on virtualDatasetId
   */
  getVirtualDatasetDetailsByVdId(vdId: string) {
    const subscriberData = this.virtualDatasetService.getVirtualDatasetDetailsByVdId(vdId)
      .subscribe(
        (response: any) => {
          this.virtualDatasetDetails = response?.data;
        }, error => {
          console.error('Went wrong while fetching virtual dataset details by schema id');
        }
      );
    this.subscriptions.push(subscriberData);
  }

  editDataset(vdId) {
    if (vdId)
      this.router.navigate([`/home/list/vd/${vdId}/edit`]);
  }

  /**
   * Delete Virtual Dataset
   * Based on virtualDatasetId
   */
  deleteVirtualDataset(vd: VirtualDatasetDetails) {
    this.transientService.confirm({
      data: { dialogTitle: 'Alert', label: `Are you sure you want to permanently delete ${vd?.vdName}?` },
      disableClose: true,
      autoFocus: false,
      width: '55%',
      panelClass: 'create-master-panel',
    }, (response) => {
      if (response && response === 'yes') {
        const subscriberData = this.virtualDatasetService.deleteVirtualDataset(vd.vdId).subscribe((res) => {
          this.snackBar.open('Successfully deleted', 'Close', { duration: 4000 });
          this.sharedService.setVirtualDatasetListData(true);
        },
          (error) => {
            this.snackBar.open('Something went wrong', 'Close', { duration: 4000 });
          }
        );
        this.subscriptions.push(subscriberData);
      }
    });
  }

  /**
   * ANGULAR HOOK
   * To destroy all the subscriptions
   */
  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    })
  }
}
