import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Component, OnInit, LOCALE_ID, Inject } from '@angular/core';

@Component({
  selector: 'pros-structure-level-config',
  templateUrl: './structure-level-config.component.html',
  styleUrls: ['./structure-level-config.component.scss'],
})
export class StructureLevelConfigComponent implements OnInit {
  structureLevelConfigformGroup: FormGroup;

  /**
   * Structure type list
   */
  structureTypeList = [
    { label: 'Grid', value: structureTypeEnum.Grid },
    { label: 'Hierarchy', value: structureTypeEnum.Hierarchy },
  ];

  // to add values in array of multiselect
  selectedJoiningKeys: string[] = [];

  joiningKeyOptionCtrl = new FormControl();
  joiningKeyOptions: string[] = [
    'Multi-select option 1',
    'Multi-select option 2',
    'Multi-select option 3',
    'Multi-select option 4',
    'Multi-select option 5',
  ];

  superiorStructureOptions = [
    'Superior Sturcture 1',
    'Superior Sturcture 2',
    'Superior Sturcture 3',
    'Superior Sturcture 4',
    'Superior Sturcture 5',
  ];

  superiorGridOptions = [
    'Superior Grid 1',
    'Superior Grid 2',
    'Superior Grid 3',
    'Superior Grid 4',
    'Superior Grid 5',
  ];

  /*** number of chips to show as selected*/
  limit = 5;

  constructor(private fb: FormBuilder, @Inject(LOCALE_ID) public locale: string) {}

  ngOnInit(): void {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    this.createFormGroup(null);
  }

  createFormGroup(data?: any) {
    this.structureLevelConfigformGroup = this.fb.group({
      headerStructure: [data && data.headerStructure ? data.headerStructure : false, []],
      structureType: [data && data.structureType ? data.structureType : structureTypeEnum.Grid, []], // GRID, HIERARCHY
      superiorStructure: [data && data.superiorStructure ? data.superiorStructure : null, []],
      superiorGrid: [data && data.superiorGrid ? data.superiorGrid : null, []],
      joiningKey: [data && data.joiningKey ? data.joiningKey : [], []],
    });
  }

  /**
   * to check if limit is extended
   * @returns boolean
   */
  hasLimit(): boolean {
    return this.selectedJoiningKeys.length > this.limit;
  }

  remove(opt: string) {}

  checkedItem(opt: string) {
    const index = this.selectedJoiningKeys.findIndex(d => d === opt);
    if(index<0) {
      this.selectedJoiningKeys.push(opt);
    } else {
      this.selectedJoiningKeys.splice(index, 1);
    }

    // @ts-ignore
    document.getElementById('optionInput').value = '';
    this.joiningKeyOptionCtrl.setValue(null);
  }
}

export enum structureTypeEnum {
  Grid = 'GRID',
  Hierarchy = 'HIERARCHY',
}
