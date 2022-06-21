import { ConnectorService } from '@modules/list/_components/connector/services/connector.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'pros-cpi-checklist',
  templateUrl: './cpi-checklist.component.html',
  styleUrls: ['./cpi-checklist.component.scss']
})
export class CpiChecklistComponent implements OnInit {

  constructor(private connectorService: ConnectorService) { }

  ngOnInit(): void {
  }

  next() {
    this.connectorService.getNextComponent('sap cpi login retry');
  }

  back() {
    this.connectorService.backClicked.next(true);
  }

  onCancelClick() {
    this.connectorService.onCancelClick({ toRefreshApis: false, moduleId: null })
  }
}
