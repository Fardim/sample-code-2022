import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'pros-package-view',
  templateUrl: './package-view.component.html',
  styleUrls: ['./package-view.component.scss'],
})
export class PackageViewComponent implements OnInit {
  // package icon
  @Input() packageIconName: string;
  // parent data set name
  @Input() datasetname: string;
  // child data set name
  @Input() childName: string;
  // node object
  @Input() data: any;

  @Output() deleteNode = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  // create a event when we press delete icon
  deletenode() {
    this.deleteNode.emit(this.data);
  }
}
