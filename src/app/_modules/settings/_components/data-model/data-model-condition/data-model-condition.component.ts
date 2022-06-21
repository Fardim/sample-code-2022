import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'pros-data-model-condition',
  templateUrl: './data-model-condition.component.html',
  styleUrls: ['./data-model-condition.component.scss']
})
export class DataModelConditionComponent implements OnInit {

  constructor(private location: Location) { }

  ngOnInit(): void {
  }

  close() {
    this.location.back();

  }
}
