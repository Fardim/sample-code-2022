import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb';

@Component({
  selector: 'pros-email-notif',
  templateUrl: './email-notif.component.html',
  styleUrls: ['./email-notif.component.scss']
})
export class EmailNotifComponent implements OnInit {

  breadcrumb: Breadcrumb = {
    heading: 'Email & Notifications',
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
