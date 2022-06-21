import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'pros-characteristics-detail-side-sheet',
  templateUrl: './characteristics-detail-side-sheet.component.html',
  styleUrls: ['./characteristics-detail-side-sheet.component.scss']
})
export class CharacteristicsDetailSideSheetComponent implements OnInit {
  classId: string;
  relatedDatasetId: string;
  title: string;
  showActions: boolean;

  constructor(private location: Location, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.classId = params.classId;
      this.relatedDatasetId = params.datasetId;
      this.title = params.title;
      this.showActions = params.showActions === 'true';
    })
  }

  close() {
    this.location.back()
  }
}
