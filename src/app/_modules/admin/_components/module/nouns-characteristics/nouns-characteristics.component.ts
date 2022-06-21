import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb';

@Component({
  selector: 'pros-nouns-characteristics',
  templateUrl: './nouns-characteristics.component.html',
  styleUrls: ['./nouns-characteristics.component.scss']
})
export class NounsCharacteristicsComponent implements OnInit {

  breadcrumb: Breadcrumb = {
    heading: 'Nouns and Characteristics',
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
