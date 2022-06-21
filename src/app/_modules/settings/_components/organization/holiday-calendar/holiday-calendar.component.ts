import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'pros-holiday-calendar',
  templateUrl: './holiday-calendar.component.html',
  styleUrls: ['./holiday-calendar.component.scss']
})
export class HolidayCalendarComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    console.log('Holiday calendar init');
  }

}
