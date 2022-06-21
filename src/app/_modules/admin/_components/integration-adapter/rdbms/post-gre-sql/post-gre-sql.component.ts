import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb';

@Component({
  selector: 'pros-post-gre-sql',
  templateUrl: './post-gre-sql.component.html',
  styleUrls: ['./post-gre-sql.component.scss']
})
export class PostGreSQLComponent implements OnInit {

  breadcrumb: Breadcrumb = {
    heading: 'Post GreSQL',
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
