import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'pros-class-type-translate-side-sheet',
  templateUrl: './class-type-translate-side-sheet.component.html',
  styleUrls: ['./class-type-translate-side-sheet.component.scss']
})
export class ClassTypeTranslateSideSheetComponent implements OnInit {
  classTypeId = '';

  constructor(private location: Location, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.classTypeId = params.classTypeId && params.classTypeId !== 'new' ? params.classTypeId : '';
    })
  }

  close() {
    this.location.back()
  }
}
