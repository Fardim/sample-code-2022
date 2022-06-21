import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb';

@Component({
  selector: 'pros-odata',
  templateUrl: './odata.component.html',
  styleUrls: ['./odata.component.scss']
})
export class OdataComponent implements OnInit {

  breadcrumb: Breadcrumb = {
    heading: 'ODATA',
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
