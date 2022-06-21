import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb';

@Component({
  selector: 'pros-rfc',
  templateUrl: './rfc.component.html',
  styleUrls: ['./rfc.component.scss']
})
export class RfcComponent implements OnInit {

  breadcrumb: Breadcrumb = {
    heading: 'RFC',
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
        link: '/admin/integration/sap',
        text: 'SAP'
      }
    ]
  };
  constructor() { }

  ngOnInit() {
  }

}
