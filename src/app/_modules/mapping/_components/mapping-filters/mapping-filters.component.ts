import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'pros-mapping-filters',
  templateUrl: './mapping-filters.component.html',
  styleUrls: ['./mapping-filters.component.scss']
})
export class MappingFiltersComponent implements OnInit {

  filterOptions = [
    {
      label: 'All fields',
      value: 'all'
    },
    {
      label: 'Mapped fields',
      value: 'mapped'
    },
    {
      label: 'Unmapped fields',
      value: 'unmapped'
    },
    {
      label: 'Transformed fields',
      value: 'transformed'
    },
  ];

  @Input()
  selectedOption = 'all';

  @Output()
  filterChange: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }

  selectOption(option: string) {
    this.selectedOption = option;
    this.filterChange.emit(option);
  }
}
