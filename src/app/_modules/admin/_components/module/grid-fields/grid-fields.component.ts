import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb';

@Component({
  selector: 'pros-grid-fields',
  templateUrl: './grid-fields.component.html',
  styleUrls: ['./grid-fields.component.scss']
})
export class GridFieldsComponent implements OnInit {

  breadcrumb: Breadcrumb = {
    heading: 'Grid Fields',
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
