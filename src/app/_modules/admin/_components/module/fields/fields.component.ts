import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb';

@Component({
  selector: 'pros-fields',
  templateUrl: './fields.component.html',
  styleUrls: ['./fields.component.scss']
})
export class FieldsComponent implements OnInit {

  breadcrumb: Breadcrumb = {
    heading: 'Fields',
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
