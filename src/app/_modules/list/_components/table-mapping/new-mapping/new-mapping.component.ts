import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MdoMappings } from '@models/mapping';
import { Observable } from 'rxjs';
import { debounceTime, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'pros-new-mapping',
  templateUrl: './new-mapping.component.html',
  styleUrls: ['./new-mapping.component.scss'],
})
export class NewMappingComponent implements OnInit, OnChanges {
  /**
   * Source and target search controls
   */
  sourceControl: FormControl = new FormControl('');
  targetControl: FormControl = new FormControl('');

  @Input() mappingLoader = false;

  /**
   * To keep the original data in onse place
   */
  optionList = [];

  /**
   * Filter controls for the source and target fields
   */
  filteredSourceFields: Observable<MdoMappings[]>;
  filteredTargetFields: Observable<MdoMappings[]>;

  /**
   * Input data for mdo mappings list from the parent component
   */
  @Input()
  mdoMappings: MdoMappings[] = [];

  /**
   * Selected Table Name
   */
  @Input()
  tableName: string;

  /**
   * place to hold all the mapping modifications
   */
  selectedMappings: MdoMappings[] = [];

  /**
   * Output the resultant mapping list with updated data
   */
  @Output() mappingUpdated: EventEmitter<MdoMappings[]> = new EventEmitter<MdoMappings[]>(null);

  constructor() {}

  ngOnInit(): void {
    if (this.mdoMappings?.length > 0) {
      this.optionList = this.mdoMappings;
      this.initializeSourceSearchControl(this.optionList);
      this.initializeTargetSearchControl(this.optionList);
      this.selectAllFields(this.optionList);
    }
  }

  selectAllFields(optionList: MdoMappings[]) {
    if(optionList?.length) {
      optionList.forEach((data) => {
        this.selectedMappings.push({...data});
        this.populateMdoMappingFields({...data});
      });

      this.mappingChange();
    }
  }

  /**
   * Select or unselect the mapping field
   * @param data pass the mapping to be added to selection
   * @param isChecked whether selected or unselected
   */
  selectSource(data: MdoMappings, isChecked: boolean) {
    if (isChecked) {
      if (!this.selectedMappings?.length) {
        this.selectedMappings.push({...data});
        this.populateMdoMappingFields({...data});
      } else {
        this.selectedMappings?.forEach((mappingData: MdoMappings) => {
          if (mappingData.externalFieldId !== data.externalFieldId) {
            this.selectedMappings.push({...data});
            this.populateMdoMappingFields({...data});
          }
        });
      }
    } else {
      this.selectedMappings = this.selectedMappings.filter((item: MdoMappings) => item.externalFieldId !== data.externalFieldId);
    }

    this.mappingChange();
  }

  /**
   * populate the mdoFieldId and mdoFieldDescription with the data recieved
   * @param mapping mapping data to be updated in mdo field
   */
  populateMdoMappingFields(mapping: MdoMappings) {
    this.selectedMappings.forEach((item: MdoMappings) => {
      if(mapping.externalFieldId === item.externalFieldId) {
        item.mdoFieldDesc = mapping.externalFieldDesc;
        item.mdoFieldId = mapping.externalFieldId;
      }
    });
  }

  isSelected(externalFieldId: string): boolean {
    return !!this.selectedMappings.find((item: MdoMappings) => item.externalFieldId === externalFieldId);
  }

  /**
   * Initialize the search filter controls
   */
  initializeSourceSearchControl(dataList: MdoMappings[]) {
    this.filteredSourceFields = this.sourceControl.valueChanges.pipe(
      debounceTime(400),
      startWith(''),
      map((value) => this.filter(value, dataList))
    );
  }

  /**
   * Initialize the search filter controls
   */
  initializeTargetSearchControl(dataList: MdoMappings[]) {
    this.filteredTargetFields = this.targetControl.valueChanges.pipe(
      debounceTime(400),
      startWith(''),
      map((value) => this.filter(value, dataList))
    );
  }

  filter(searchTerm: string, optionList: any[]): any[] {
    if(!searchTerm) { return optionList; }
    const filterValue = searchTerm.toLowerCase();
    return optionList.filter((val) => (val.externalFieldDesc ? val.externalFieldDesc?.toLowerCase().indexOf(filterValue) > -1 : false));
  }

  trackByFn(index: number, item: MdoMappings) {
    return item.externalFieldId;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.mdoMappings && changes.mdoMappings.currentValue) {
      this.optionList = changes.mdoMappings.currentValue;
      this.initializeSourceSearchControl(this.optionList);
      this.initializeTargetSearchControl(this.optionList);
      this.selectAllFields(this.optionList);
    }
    if (changes.mappingLoader && changes.mappingLoader.currentValue !== undefined) {
      this.mappingLoader = changes.mappingLoader.currentValue;
    }
  }

  /**
   * update new dataset
   */
   updateMapping(updatedDescription: string, option: MdoMappings) {
    const indexToUpdate = this.selectedMappings.findIndex((item: MdoMappings) => item.externalFieldId === option.externalFieldId);

    if(indexToUpdate > -1) {
      this.selectedMappings[indexToUpdate].mdoFieldDesc = updatedDescription;
      this.mappingChange();
    }
  }

  mappingChange() {
    const updatedMapping = this.optionList.map((item: MdoMappings) => {
      const modifiedMapping = this.selectedMappings.find((mapping: MdoMappings) => mapping.externalFieldId === item.externalFieldId);
      if(modifiedMapping) {
        return {...modifiedMapping};
      } else {
        return {...item};
      }
    });

    this.mappingUpdated.emit(updatedMapping);
  }
}
