import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb';

@Component({
  selector: 'pros-ws-soap',
  templateUrl: './ws-soap.component.html',
  styleUrls: ['./ws-soap.component.scss']
})
export class WsSoapComponent implements OnInit {

  breadcrumb: Breadcrumb = {
    heading: 'SOAP',
    links: [
      {
        link: '/admin/default',
        text: 'Platform Settings'
      },
      {
        link: '/admin/integration',
        text: 'Integration Adapter and Queues'
      },
      {
        link: '/admin/integration/webservice',
        text: 'Webservice'
      }
    ]
  };
  constructor() { }

  ngOnInit() {
  }

}
