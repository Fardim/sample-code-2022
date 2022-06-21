import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'pros-dimension-uom-side-sheet',
  templateUrl: './dimensions-uom-side-sheet.component.html',
  styleUrls: ['./dimensions-uom-side-sheet.component.scss']
})
export class DimensionsUomSideSheetComponent implements OnInit {

  constructor(private location: Location) { }

  ngOnInit(): void {
  }

  close(){
    this.location.back()
  }

}
