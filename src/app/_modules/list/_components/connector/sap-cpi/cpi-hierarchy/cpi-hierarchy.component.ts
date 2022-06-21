import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'pros-cpi-hierarchy',
  templateUrl: './cpi-hierarchy.component.html',
  styleUrls: ['./cpi-hierarchy.component.scss'],
})
export class CpiHierarchyComponent implements OnInit {
  limit = 5;
  selectedOptions = [];
  availableOptions = [ 'Option 1', 'Option 2', 'Option 3' ];
  filteredOptions = of([]);
  optionCtrl: FormControl = new FormControl();
  constructor() {}

  ngOnInit(): void { this.initializeFilter(); }

  /**
   * method to check whether the limit has
   * reached for the selected chips
   * @returns boolean
   */
  hasLimit(): boolean {
    return this.selectedOptions.length > this.limit;
  }

  initializeFilter() {
    this.filteredOptions = this.optionCtrl.valueChanges.pipe(
      startWith(''),
      map((hierarchyName: string | null) => hierarchyName ? this._filter(hierarchyName) : this.availableOptions));
  }

  _filter(name: string) {
    return this.availableOptions.filter(option => option.toLowerCase().includes(name.toLowerCase()));
  }

  selected(option: any) {
    this.selectedOptions.push(option);
    this.optionCtrl.setValue(null);
  }
}
