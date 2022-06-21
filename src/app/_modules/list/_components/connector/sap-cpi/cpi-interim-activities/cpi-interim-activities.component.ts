import { ConnectorService } from '@modules/list/_components/connector/services/connector.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'pros-cpi-interim-activities',
  templateUrl: './cpi-interim-activities.component.html',
  styleUrls: ['./cpi-interim-activities.component.scss']
})
export class CpiInterimActivitiesComponent implements OnInit {

  constructor(private connectorService: ConnectorService) { }

  ngOnInit(): void {
  }

  next() {
    // this.connectorService.getNextComponent('sap cpi checklist');
    this.onCancelClick();
  }

  back() {
    this.connectorService.backClicked.next(true);
  }

  onCancelClick() {
    this.connectorService.onCancelClick({ toRefreshApis: false, moduleId: null })
  }
}
