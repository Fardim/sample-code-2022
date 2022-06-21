import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb';

@Component({
  selector: 'pros-cxml',
  templateUrl: './cxml.component.html',
  styleUrls: ['./cxml.component.scss']
})
export class CxmlComponent implements OnInit {

  breadcrumb: Breadcrumb = {
    heading: 'CXML',
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
