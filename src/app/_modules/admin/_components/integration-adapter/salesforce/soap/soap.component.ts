import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb';

@Component({
  selector: 'pros-soap',
  templateUrl: './soap.component.html',
  styleUrls: ['./soap.component.scss']
})
export class SoapComponent implements OnInit {

  breadcrumb: Breadcrumb = {
    heading: 'SOAP',
    links: [
      {
        link: '/admin/default',
        text: 'Platform Settings'
      },
      {
        link: '/admin/integration',
        text: 'Integration Adapter and Queues'
      },
      {
        link: '/admin/integration/salesforce',
        text: 'Salesforce'
      }
    ]
  };
  constructor() { }

  ngOnInit() {
  }

}
