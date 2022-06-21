import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb';

@Component({
  selector: 'pros-xml',
  templateUrl: './xml.component.html',
  styleUrls: ['./xml.component.scss']
})
export class XmlComponent implements OnInit {

  breadcrumb: Breadcrumb = {
    heading: 'XML',
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
        link: '/admin/integration/custom',
        text: 'Customer'
      }
    ]
  };
  constructor() { }

  ngOnInit() {
  }

}
