import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ClassType } from '@modules/classifications/_models/classifications';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'pros-class-mutation-side-sheet',
  templateUrl: './class-mutation-side-sheet.component.html',
  styleUrls: ['./class-mutation-side-sheet.component.scss']
})
export class ClassMutationSideSheetComponent implements OnInit {
  classType: ClassType;
  classId: string;
  parent:string;

  constructor(
    private location: Location,
    private activatedRoute:ActivatedRoute
    ) { }

  ngOnInit(): void {
    const { classType } = window.history.state;
    this.classType = classType;
    this.activatedRoute.params.subscribe(params => {
      this.classId = params.classId ?? '';
    });
    this.activatedRoute.queryParams.subscribe(queryParams => {
      this.parent = queryParams.parent ?? '';
    });
  }

  close() {
    this.location.back()
  }
}
