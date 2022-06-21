import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb';

@Component({
  selector: 'pros-custom-events',
  templateUrl: './custom-events.component.html',
  styleUrls: ['./custom-events.component.scss']
})
export class CustomEventsComponent implements OnInit {

  breadcrumb: Breadcrumb = {
    heading: 'Custom Events',
    links: [
      {
        link: '/admin/default',
        text: 'Platform Settings'
      },
      {
        link: '/admin/modules',
        text: 'Modules'
      }
    ]
  };
  constructor() { }

  ngOnInit() {
  }

}
