import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({

  selector: 'pros-map-fields-side-sheet',

  templateUrl: './map-fields-side-sheet.component.html',

  styleUrls: ['./map-fields-side-sheet.component.scss']

})

export class MapFieldsSideSheetComponent implements OnInit {


  constructor(private router: Router) { }


  ngOnInit(): void {

  }

  close() {
    this.router.navigate([{ outlets: { sb: null } }]);
  }

  viewResults() {
    this.router.navigate([{ outlets: { sb:`sb/list/vd/join/properties/map/fields`,outer: `outer/list/vd/join/properties/map/fields/results` } }]);
  }
}