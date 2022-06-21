import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'pros-business-hours',
  templateUrl: './business-hours.component.html',
  styleUrls: ['./business-hours.component.scss']
})
export class BusinessHoursComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    console.log('Businees hours init');
  }

}
