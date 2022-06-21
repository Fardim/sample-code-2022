import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'pros-class-language-side-sheet',
  templateUrl: './class-language-side-sheet.component.html',
  styleUrls: ['./class-language-side-sheet.component.scss']
})
export class ClassLanguageSideSheetComponent implements OnInit {

  constructor(private location: Location) { }

  ngOnInit(): void {
  }

  close(){
    this.location.back()
  }

}
