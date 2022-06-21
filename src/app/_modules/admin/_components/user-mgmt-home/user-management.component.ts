import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb';

@Component({
  selector: 'pros-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

  breadcrumb: Breadcrumb = {
    heading: 'User Management',
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
