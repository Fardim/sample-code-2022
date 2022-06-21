import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb';

@Component({
  selector: 'pros-ibmdb2',
  templateUrl: './ibmdb2.component.html',
  styleUrls: ['./ibmdb2.component.scss']
})
export class IBMDB2Component implements OnInit {

  breadcrumb: Breadcrumb = {
    heading: 'IBMDB2',
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
        link: '/admin/integration/rdbms',
        text: 'RDBMS'
      }
    ]
  };
  constructor() { }

  ngOnInit() {
  }

}
