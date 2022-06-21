import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb';

@Component({
  selector: 'pros-rdbms',
  templateUrl: './rdbms.component.html',
  styleUrls: ['./rdbms.component.scss']
})
export class RdbmsComponent implements OnInit {

  breadcrumb: Breadcrumb = {
    heading: 'RDBMS',
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
