import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'pros-search-filter',
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss']
})
export class SearchFilterComponent implements OnInit {

  optionsList = [
    { label: 'Filters', value: 'filters' },
    { label: 'Classifications', value: 'value2' }
  ]

  constructor() { }

  ngOnInit(): void {
  }

}
