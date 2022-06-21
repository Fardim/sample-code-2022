import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb';

@Component({
  selector: 'pros-change-request',
  templateUrl: './change-request.component.html',
  styleUrls: ['./change-request.component.scss']
})
export class ChangeRequestComponent implements OnInit {

  breadcrumb: Breadcrumb = {
    heading: 'Change Request',
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
