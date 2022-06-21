import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb';

@Component({
  selector: 'pros-mysql',
  templateUrl: './mysql.component.html',
  styleUrls: ['./mysql.component.scss']
})
export class MysqlComponent implements OnInit {

  breadcrumb: Breadcrumb = {
    heading: 'MySQL',
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
