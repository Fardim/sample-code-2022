import { Component, OnInit, Input } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb';

@Component({
  selector: 'pros-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {

  @Input()
  crumbs: Breadcrumb;

  constructor() { }

  ngOnInit() { }

  /**
   * Go to mdo home page ..
   */
  homeRoutingUrl() {
    const url = document.getElementsByTagName('base')[0].href.substring(0, document.getElementsByTagName('base')[0].href.indexOf('MDOSF'));
    window.open(url+'MDOSF/loginPostProcessor', '_self');
  }

}
