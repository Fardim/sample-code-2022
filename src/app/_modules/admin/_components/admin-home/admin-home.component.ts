import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb';

@Component({
  selector: 'pros-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss']
})
export class AdminHomeComponent implements OnInit {

  breadcrumb: Breadcrumb = {
    heading: 'Platform Settings',
    links: []
  };

  constructor() { }

  ngOnInit() {
  }

}
