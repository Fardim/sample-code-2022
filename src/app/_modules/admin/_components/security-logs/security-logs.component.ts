import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb';

@Component({
  selector: 'pros-security-logs',
  templateUrl: './security-logs.component.html',
  styleUrls: ['./security-logs.component.scss']
})
export class SecurityLogsComponent implements OnInit {

  breadcrumb: Breadcrumb = {
    heading: 'Security & Logs',
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
