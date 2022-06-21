import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb';

@Component({
  selector: 'pros-webservice',
  templateUrl: './webservice.component.html',
  styleUrls: ['./webservice.component.scss']
})
export class WebserviceComponent implements OnInit {

  breadcrumb: Breadcrumb = {
    heading: 'Webservice',
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
