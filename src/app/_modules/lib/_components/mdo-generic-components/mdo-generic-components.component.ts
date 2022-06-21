import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'
import { DropDownValue } from '@modules/admin/_components/module/business-rules/business-rules.modal';

@Component({
  selector: 'pros-mdo-generic-components',
  templateUrl: './mdo-generic-components.component.html',
  styleUrls: ['./mdo-generic-components.component.scss']
})
export class MdoGenericComponentsComponent implements OnInit {
  displayedColumns: string[] = ['actions', 'position', 'name', 'weight', 'symbol', 'errorcell', 'warningcell', 'successcell', 'reviewcell'];
  dataSource = ELEMENT_DATA;


  componentName: string;

  // Form-input properties
  label = 'username';
  type = 'text';
  placeholder = 'Enter username here..';
  value= '';
  hint= 'This is hint to show user..';
  isHelpIcon = true;


  // Search bar properties
  searchPlaceholder = 'Search something here..';
  searchFieldValue = '';

  // filter component
  show = true;


  constructor(private activatedRoute: ActivatedRoute) {
  }

  /**
   * ANGULAR HOOK
   * Set componentName to Active route params Id for loading reqouired ng-template
   */
  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.componentName = params.id;
    })
  }

  // To get the emitted value of form-input component
  getValue(data: string): void{
    this.value = data;
  }

  // To get the emitted value of search-input component
  getSearchValue(data: string): void{
    this.searchFieldValue = data;
  }

  // To show or hide (add-filter or filter-value) component conditionally
  showHide(event: boolean){
    this.show = !this.show;
  }

  // To get the emitted value array of filter component
  output(event: DropDownValue[]){
    console.log(event);
  }
}

export interface PeriodicElement {
  name: string;
  position: string;
  weight: string;
  symbol: string;
  errorcell: string;
  warningcell: string;
  successcell: string;
  reviewcell: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: '', name: '', weight: '', symbol: '', reviewcell: '', errorcell: '', successcell: '', warningcell: '' },
  {position: '', name: '', weight: '', symbol: '', reviewcell: '', errorcell: '', successcell: '', warningcell: '' },
  {position: '', name: '', weight: '', symbol: '', reviewcell: '', errorcell: '', successcell: '', warningcell: '' },
  {position: '', name: '', weight: '', symbol: '', reviewcell: '', errorcell: '', successcell: '', warningcell: '' },
  {position: '', name: '', weight: '', symbol: '', reviewcell: '', errorcell: '', successcell: '', warningcell: '' },
  {position: '', name: '', weight: '', symbol: '', reviewcell: '', errorcell: '', successcell: '', warningcell: '' },
  {position: '', name: '', weight: '', symbol: '', reviewcell: '', errorcell: '', successcell: '', warningcell: '' },
  {position: '', name: '', weight: '', symbol: '', reviewcell: '', errorcell: '', successcell: '', warningcell: '' },
  {position: '', name: '', weight: '', symbol: '', reviewcell: '', errorcell: '', successcell: '', warningcell: '' },
  {position: '', name: '', weight: '', symbol: '', reviewcell: '', errorcell: '', successcell: '', warningcell: '' },
  {position: '', name: '', weight: '', symbol: '', reviewcell: '', errorcell: '', successcell: '', warningcell: '' }
];
