import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb';

@Component({
  selector: 'pros-advanced-settings',
  templateUrl: './advanced-settings.component.html',
  styleUrls: ['./advanced-settings.component.scss']
})
export class AdvancedSettingsComponent implements OnInit {

  breadcrumb: Breadcrumb = {
    heading: 'Advanced Settings',
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
