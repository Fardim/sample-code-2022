import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb';

@Component({
  selector: 'pros-custom',
  templateUrl: './custom.component.html',
  styleUrls: ['./custom.component.scss']
})
export class CustomComponent implements OnInit {

  breadcrumb: Breadcrumb = {
    heading: 'Custom',
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
