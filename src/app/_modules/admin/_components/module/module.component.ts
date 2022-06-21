import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'pros-module',
  templateUrl: './module.component.html',
  styleUrls: ['./module.component.scss']
})
export class ModuleComponent implements OnInit {

  breadcrumb: Breadcrumb = {
    heading: 'Modules',
    links: [
      {
        link: '/admin/default',
        text: 'Platform Settings'
      }
    ]
  };
  constructor(
    private httpClient: HttpClient
  ) { }

  ngOnInit() {
    // console.log('called');
    // this.httpClient.get('http://localhost:8080/MDOSF/admin_user_save.servlet' +
    // '?userId=testUserNG&fname=first&lname=last&pwd=password&cpwd=password&mailId=aa@ab.com&userDfltRole=AD' +
    // '&roleID=AD&endDate=12/12/19&startDate=1/1/19&timeZone=-1200 GMT').subscribe();
  }

}
