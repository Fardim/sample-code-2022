import { Component, OnInit } from '@angular/core';

export interface PeriodicElement {
  field_id: string;
  field_description: string;
  default_value: string;
  condition: string;
}


const ELEMENT_DATA: PeriodicElement[] = [
  {field_id: 'ACCNT_ASGN',field_description: 'Account assignment group', default_value: '', condition:'' },
  {field_id: 'ACCNT_GRP', field_description: 'Account group' , default_value: '', condition: '' },
  {field_id: 'ACCNT_GRP', field_description: 'Cash management group' , default_value:'', condition: '' },
];


@Component({
  selector: 'pros-default-values',
  templateUrl: './default-values.component.html',
  styleUrls: ['./default-values.component.scss']
})

export class DefaultValuesComponent implements OnInit {
  constructor() { }

  displayedColumns: string[] = ['field_id', 'field_description' , 'default_value' , 'condition' , 'star' ];
  dataSource = ELEMENT_DATA;
  ngOnInit(): void {
  }
}