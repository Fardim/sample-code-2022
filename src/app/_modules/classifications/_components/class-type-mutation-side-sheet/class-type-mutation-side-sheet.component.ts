import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'pros-class-type-mutation-side-sheet',
  templateUrl: './class-type-mutation-side-sheet.component.html',
  styleUrls: ['./class-type-mutation-side-sheet.component.scss']
})
export class ClassTypeMutationSideSheetComponent implements OnInit {
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
