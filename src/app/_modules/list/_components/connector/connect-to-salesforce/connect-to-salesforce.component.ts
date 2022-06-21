import { AfterViewInit, Component, OnInit } from '@angular/core';
import { SalesforceAdaptorService } from '@services/salesforce-adaptor.service';

@Component({
  selector: 'pros-connect-to-salesforce',
  templateUrl: './connect-to-salesforce.component.html',
  styleUrls: ['./connect-to-salesforce.component.scss']
})
export class ConnectToSalesforceComponent implements OnInit, AfterViewInit {

  constructor(public sfAdapatorService: SalesforceAdaptorService,) { }
  ngOnInit(): void {
  }

  ngAfterViewInit() {
      const code = window?.location?.search?.split('=')[1];
      const url = window?.opener?.location?.href ? new URL(window?.opener?.location?.href) : null;
      const target = url?.protocol + '//' + url?.host;
      let message = {}

      this.sfAdapatorService.consumeAuthCode(code).then((res) => {
        message = { status: res, sfConnectionName: 'testConnectionName' }
        window?.opener?.postMessage(message, target);
      }).catch((err) => {
        message = { status: err, sfConnectionName: undefined }
        window.opener.postMessage(message, target);
      }).finally(() => window.close());
  }
}
