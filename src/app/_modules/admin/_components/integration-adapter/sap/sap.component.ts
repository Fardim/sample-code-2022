import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb';

@Component({
  selector: 'pros-sap',
  templateUrl: './sap.component.html',
  styleUrls: ['./sap.component.scss']
})
export class SapComponent implements OnInit {

  breadcrumb: Breadcrumb = {
    heading: 'SAP',
    links: [
      {
        link: '/admin/default',
        text: 'Platform Settings'
      },
      {
        link: '/admin/integration',
        text: 'Integration Adapter and Queues'
      }
    ]
  };
  constructor() { }

  ngOnInit() {
  }

}
