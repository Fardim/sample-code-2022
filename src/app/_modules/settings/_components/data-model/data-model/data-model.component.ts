import { Component, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'pros-data-model',
  templateUrl: './data-model.component.html',
  styleUrls: ['./data-model.component.scss']
})
export class DataModelComponent implements OnInit {

  isPropertiesShow: any = false;

  constructor() { }

  ngOnInit(): void {
  }

  showProperties(event: Event) {
    this.isPropertiesShow = event;
  }

}
