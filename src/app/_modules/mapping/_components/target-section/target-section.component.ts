import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Mapping, MdoMappings, SegmentMappings } from '@models/mapping';
import MappingUtility from '@modules/mapping/_common/utility-methods';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'pros-target-section',
  templateUrl: './target-section.component.html',
  styleUrls: ['./target-section.component.scss']
})
export class TargetSectionComponent extends MappingUtility implements OnInit, OnChanges {
  @Input() control: FormControl;
  @Input() item: SegmentMappings;
  @Input() menuToggle: boolean;
  @Input() currentMapping: Mapping;

  @Output() targetSelected: EventEmitter<any> = new EventEmitter(null);
  @Output() mouseOnTarget: EventEmitter<any> = new EventEmitter(null);

  filteredFields: Observable<MdoMappings[]>;
  showTranslationRuleSection = false;

  constructor(private sharedService: SharedServiceService, private activatedRoute: ActivatedRoute, private router: Router) {
    super();
  }

  ngOnInit(): void {
    if(this.item?.segmentMappings?.length) {
      this.initializeSearchControl();
    }

    this.activatedRoute.params.subscribe((params) => {
      this.showTranslationRuleSection = (params?.hasTranslationRuleSection === 'true' || this.router.url.includes('business-rule'));
    });
  }

  /**
   * Initialize the search filter controls
   */
   initializeSearchControl() {
    this.filteredFields = this.control.valueChanges.pipe(
      startWith(''),
      map((value) => this.filter(value, this.item?.mdoMappings))
    );
  }

  /**
   * search filter method to filter results based on search term
   * @param searchTerm search text
   * @param filterFrom array of items to filter from
   * @returns FieldCategory[]
   */
   filter(searchTerm: string, filterFrom: MdoMappings[]): MdoMappings[] {
    if(!searchTerm) { return  filterFrom; }
    const filterValue = searchTerm?.toLowerCase();

    return filterFrom.filter(
      (option) => {
        if(!filterValue) { return option; }
        if(option.mdoFieldDesc.toLowerCase().includes(filterValue)) {
          return option;
        }
      }
    );
  }

  /**
   * Selects the source field
   * If a mapping exists, show the mapping relation
   * If mapping doesnt exist, create a mapping by clicking on the target field
   * @param field pass the field Object
   */
   selectTargetField(field: MdoMappings) {
    this.targetSelected.emit(field);
  }

  /**
   * emit the event on target field selection for
   * interface mapping of translation rule
   * @param targetField pass the selected target Field object
   */
  targetFieldClicked(targetField: MdoMappings) {
    if (this.showTranslationRuleSection) {
      this.currentMapping.target.data = targetField
      this.sharedService.setTargetFieldSelected({ type: 'fieldSelected', fieldDetails: targetField });
    }
  }

  emitMouseEvent(value: boolean) {
    this.mouseOnTarget.emit(value);
  }

  /**
   * Checks is the source is selected
   * @param uuid pass the field id
   * @returns boolean
   */
   isSelected(uuid: string): boolean {
    return this.currentMapping?.target?.uuid === uuid || this.currentMapping?.target?.data?.uuid === uuid;
  }

  trackTargetItem(index: number, item: MdoMappings) {
    return item.uuid;
  }

  shouldShowSection(segment: SegmentMappings): boolean {
    if(!this.control?.value) { return true; }

    return this.hasMatchingTargetSegmentOrField(this.control.value, [segment]);
  }

  /**
   * Checks if the target field or it's segment is matching the search term
   * @param targetField Pass the target field
   * @returns boolean
   */
  isFieldOrHeaderMatching(targetField: MdoMappings): boolean {
    if(!this.control?.value) { return true; }

    return this.isFieldMatching(this.control.value, targetField)
    || targetField.segmentName.toLowerCase().includes(this.control.value.toLowerCase());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.control && changes.control.currentValue) {
      this.initializeSearchControl();
    }
    if(changes.currentMapping && changes.currentMapping.currentValue) {
      this.currentMapping = changes.currentMapping.currentValue;
    }
  }
}
