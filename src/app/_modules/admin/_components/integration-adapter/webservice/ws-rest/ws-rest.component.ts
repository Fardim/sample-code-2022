import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb';

@Component({
  selector: 'pros-ws-rest',
  templateUrl: './ws-rest.component.html',
  styleUrls: ['./ws-rest.component.scss']
})
export class WsRestComponent implements OnInit {

  breadcrumb: Breadcrumb = {
    heading: 'REST',
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
