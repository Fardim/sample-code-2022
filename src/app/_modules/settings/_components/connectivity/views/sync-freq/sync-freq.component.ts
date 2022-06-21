import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConnectionService } from '@services/connection/connection.service';
import { TransientService } from 'mdo-ui-library';
import * as moment from 'moment';

@Component({
  selector: 'pros-sync-freq',
  templateUrl: './sync-freq.component.html',
  styleUrls: ['./sync-freq.component.scss']
})
export class SyncFreqComponent implements OnInit {

  repeatSegmentList = [
    { label: 'None', value: 'none' },
    { label: 'Hourly', value: 'hourly' },
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
  ];

  isSyncFrequencyFormValid = false;

  showErrorBanner = false;

  currentConnectionId = '';

  syncFrequencyData = {
    customDate: '',
    ends: '',
    every: '',
    repeat: '',
    repeatLabel: '',
    repeatMonthDay: '',
    repeatOnWeek: '',
    starts: ''
  };

  errorMessage = '';

  constructor(private router: Router, private connectionService: ConnectionService, private activeRoute: ActivatedRoute,private transientService: TransientService) { }

  ngOnInit(): void {
    this.activeRoute.params.subscribe(data => {
      if (data?.connectionId) {
        this.currentConnectionId = data.connectionId;
      }
    })
  }

  scheduleSync(event) {
    this.isSyncFrequencyFormValid = event.isFormValid;
    this.syncFrequencyData = event.formValue;
  }

  save() {
    if (!this.isSyncFrequencyFormValid) {
      this.showErrorBanner = true;
      this.errorMessage = 'Please fill the required fields.';
    } else {
      const payload = {
        scenarioId: '',
        startOn: (this.syncFrequencyData?.customDate) ? moment(this.syncFrequencyData.customDate).format('YYYY-MM-DD') : '',
        end: this.syncFrequencyData.ends,
        repeat: this.syncFrequencyData.repeat,
        every: undefined,
        repeatOn: undefined,
        restMethod: 'POST',
        restEndpoint: `/save-data-pull-data/${this.currentConnectionId}`,
        restParam: null
      }

      if (this.currentConnectionId) {
        payload.scenarioId = this.currentConnectionId;
      }

      if(this.syncFrequencyData.ends) {
        payload.every = {
          [this.syncFrequencyData.repeatLabel]: this.syncFrequencyData.every
        }
      }

      if(this.syncFrequencyData.repeatOnWeek && this.syncFrequencyData.repeatLabel === 'weeks') {
        payload.repeatOn = this.syncFrequencyData.repeatOnWeek
      }

      if (this.syncFrequencyData.repeatMonthDay && this.syncFrequencyData.repeatLabel === 'months') {
        payload.repeatOn = this.syncFrequencyData.repeatMonthDay
      }

      this.connectionService.saveSyncFrequency(payload).subscribe(res => {
        this.close();
        this.transientService.open('Successfully saved !', null, { duration: 1000, verticalPosition: 'bottom' });
        this.showErrorBanner = false;
      },error => {
        this.showErrorBanner = true;
        this.errorMessage = 'Something went wrong';
      });
    }
  }

  close() {
    this.router.navigate([{ outlets: { outer: null } }], { queryParamsHandling: 'preserve' });
  }

}
