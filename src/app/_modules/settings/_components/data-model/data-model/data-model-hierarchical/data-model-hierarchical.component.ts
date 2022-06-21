import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'pros-data-model-hierarchical',
  templateUrl: './data-model-hierarchical.component.html',
  styleUrls: ['./data-model-hierarchical.component.scss']
})
export class DataModelHierarchicalComponent implements OnInit {

  @Output() showProperties = new EventEmitter();

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  setProperties() {
    this.showProperties.emit(true);
  }

  close() {
    this.router.navigate([{ outlets: { outer: null } }], { queryParamsHandling: 'preserve' });
  }
}
