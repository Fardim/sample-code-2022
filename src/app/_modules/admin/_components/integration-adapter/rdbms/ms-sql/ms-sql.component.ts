import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb';

@Component({
  selector: 'pros-ms-sql',
  templateUrl: './ms-sql.component.html',
  styleUrls: ['./ms-sql.component.scss']
})
export class MsSqlComponent implements OnInit {

  breadcrumb: Breadcrumb = {
    heading: 'MsSQL',
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
