import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb';

@Component({
  selector: 'pros-integration-adapter',
  templateUrl: './integration-adapter.component.html',
  styleUrls: ['./integration-adapter.component.scss']
})
export class IntegrationAdapterComponent implements OnInit {

  breadcrumb: Breadcrumb = {
    heading: 'Integration Adapter and Queues',
    links: [
      {
        link: '/admin/default',
        text: 'Platform Settings'
      }
    ]
  };

  constructor() { }

  ngOnInit() {
  }

}
