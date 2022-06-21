import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb';

@Component({
  selector: 'pros-idocs',
  templateUrl: './idocs.component.html',
  styleUrls: ['./idocs.component.scss']
})
export class IdocsComponent implements OnInit {

  breadcrumb: Breadcrumb = {
    heading: 'Idocs',
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
