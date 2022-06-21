import { ConnectorService } from '@modules/list/_components/connector/services/connector.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'pros-cpi-scope-sidesheet',
  templateUrl: './cpi-scope-sidesheet.component.html',
  styleUrls: ['./cpi-scope-sidesheet.component.scss']
})
export class CpiScopeSidesheetComponent implements OnInit {

  constructor(private connectorService: ConnectorService) { }

  ngOnInit(): void {
  }

  next() {
    this.connectorService.getNextComponent('interim customer activities');
  }

  back() {
    this.connectorService.backClicked.next(true);
  }

  onCancelClick() {
    this.connectorService.onCancelClick({ toRefreshApis: false, moduleId: null })
  }
}
