import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VirtualDatasetDetails, VirtualDatasetDetailsResponse } from '@models/list-page/virtual-dataset/virtual-dataset';
import { VirtualDatasetService } from '@services/list/virtual-dataset/virtual-dataset.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'pros-create-virtual-dataset',
  templateUrl: './create-virtual-dataset.component.html',
  styleUrls: ['./create-virtual-dataset.component.scss']
})
export class CreateVirtualDatasetComponent implements OnInit {

  vdId: string;
  virtualDatasetDetails: VirtualDatasetDetails;
  subscriptions: Subscription[] = [];
  selectedDmlType: string;

  constructor(
    private activatedRouter: ActivatedRoute,
    private virtualDatasetService: VirtualDatasetService,
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
        (response: VirtualDatasetDetailsResponse) => {
          this.virtualDatasetDetails = response?.data;
        }, error => {
          console.error('Went wrong while fetching virtual dataset details by schema id');
        }
      );
    this.subscriptions.push(subscriberData);
  }

}
