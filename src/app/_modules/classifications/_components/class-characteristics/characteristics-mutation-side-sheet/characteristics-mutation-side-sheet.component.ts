import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'pros-characteristics-mutation-side-sheet',
  templateUrl: './characteristics-mutation-side-sheet.component.html',
  styleUrls: ['./characteristics-mutation-side-sheet.component.scss']
})
export class CharacteristicsMutationSideSheetComponent implements OnInit {


  isCharacteristicsValid = false;
  characteristics: [];
  constructor(private location: Location) { }

  ngOnInit(): void {
  }

  closeComponent() {
    this.location.back()
  }
}
