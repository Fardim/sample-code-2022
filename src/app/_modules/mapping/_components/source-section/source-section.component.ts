import { Component, EventEmitter, Inject, Input, LOCALE_ID, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Mapping, MdoField, MdoFieldlistItem } from '@models/mapping';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'pros-source-section',
  templateUrl: './source-section.component.html',
  styleUrls: ['./source-section.component.scss']
})
export class SourceSectionComponent implements OnInit, OnChanges {
  @Input() control: FormControl;
  @Input() item: MdoField | MdoFieldlistItem | any;
  @Input() menuToggle: boolean;
  @Input() existingMapping: Mapping[] = [];
  @Input() currentMapping: Mapping;

  @Output() sourceSelected: EventEmitter<any> = new EventEmitter(null);
  @Output() showTargets: EventEmitter<string> = new EventEmitter(null);
  @Output() dragReleased: EventEmitter<string> = new EventEmitter(null);

  filteredFields: Observable<MdoFieldlistItem[]>;
  cursorState: string;
  constructor(
    @Inject(LOCALE_ID) public locale: string
  ) {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
  }

  ngOnInit(): void {
    if(this.item?.fieldlist?.length) {
      this.initializeSearchControl();
    }
  }

  /**
   * Initialize the search filter controls
   */
   initializeSearchControl() {
    this.filteredFields = this.control.valueChanges.pipe(
      startWith(''),
      map((value) => this.filter(value, this.item?.fieldlist || this.item?.childfields))
    );
  }

  /**
   * search filter method to filter results based on search term
   * @param searchTerm search text
   * @param filterFrom array of items to filter from
   * @returns MdoFieldlistItem[]
   */
   filter(searchTerm: string, filterFrom: MdoFieldlistItem[] | any): MdoFieldlistItem[] {
    if(!searchTerm) { return  filterFrom; }
    const filterValue = searchTerm.toLowerCase();

    return filterFrom.filter(
      (option) => {
        if(!filterValue) { return option; }
        if(option.description.toLowerCase().includes(filterValue)
        || option.childfields?.some((child) => (child.description || child?.shortText?.[this.locale]?.description)?.toLowerCase()?.includes(filterValue))) {
          return option;
        }
      }
    );
  }

  getSourceFieldDescription(field: MdoFieldlistItem) {
    return field?.description || field?.shortText?.[this.locale]?.description || 'Untitled';
  }

  /**
   * Check is a selected field has existing mapping
   * @param fieldId pass the field id
   * @returns boolean
   */
  fieldHasMapping(fieldId: string): boolean {
    if(!this.existingMapping?.length) { return false; };

    return this.existingMapping.some((savedMap) => savedMap.source.fieldId === fieldId);
  }

  get mapping() {
    return this.existingMapping;
  }

  /**
   * Selects the source field
   * If a mapping exists, show the mapping relation
   * If mapping doesnt exist, create a mapping by clicking on the target field
   * @param field pass the field Object
   */
  selectSourceField(field: MdoFieldlistItem) {
    this.sourceSelected.emit(field);
  }

  /**
   * Get the mapped field object
   * @param targetUuid pas sthe target field id
   * @returns MdoFieldlistItem | null
   */
   getMappedField(targetUuid: string) {
    const existingMapping = this.existingMapping;
    const mapped = existingMapping.find((mapping) => mapping.target.uuid === targetUuid);
    return mapped ? mapped.source : null;
  }

  /**
   * Checks is the source is selected
   * @param fieldId pass the field id
   * @returns boolean
   */
   isSelected(fieldId: string): boolean {
    return this.currentMapping?.source?.fieldId === fieldId;
  }

  showMappedTargets(fieldId: string) {
    this.showTargets.emit(fieldId);
  }

  showBadge(hasMapping: boolean, fieldId: string): boolean {
    return hasMapping? this.cursorState === fieldId : true;
  }

  trackSourceItem(index: number, item: MdoFieldlistItem) {
    return item.fieldId;
  }

  /**
   * Checks if the source field is matching the search term
   * @param sourceField Pass the source field
   * @returns boolean
   */
  isFieldOrHeaderMatching(sourceField: MdoField | MdoFieldlistItem): boolean {
    if(!this.control?.value) { return true; }

    return sourceField?.description?.toLowerCase().includes(this.control.value.toLowerCase());
  }

  dragReleasedEvent() {
    this.dragReleased.emit();
  }

  ngOnChanges(changes: SimpleChanges): void {
   if(changes.control && changes.control.currentValue) {
     this.initializeSearchControl();
    }
   if(changes.currentMapping && changes.currentMapping.currentValue) {
     this.currentMapping = changes.currentMapping.currentValue;
    }
   if(changes.existingMapping && changes.existingMapping.currentValue?.length) {
     this.existingMapping = changes.existingMapping.currentValue;
    }
  }
}
