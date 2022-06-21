import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MdoMappings, SegmentMappings } from '@models/mapping';
import MappingUtility from '@modules/mapping/_common/utility-methods';
import { Observable, of } from 'rxjs';
import { debounceTime, map, startWith } from 'rxjs/operators';
import { merge } from 'lodash';

@Component({
  selector: 'pros-cpi-data-scope',
  templateUrl: './cpi-data-scope.component.html',
  styleUrls: ['./cpi-data-scope.component.scss']
})
export class CpiDataScopeComponent extends MappingUtility implements OnInit {
  /**
   * Search control for segment
   */
  segmentFilterControl: FormControl = new FormControl('');

  /**
   * Observable to hold the filtered segment and fields
   */
  filteredSegmentMappings: Observable<SegmentMappings[]>;

  /**
   * Observable to hold the filtered selected segment and fields
   */
  filteredSelectedSegmentMappings: Observable<SegmentMappings[]>;

  /**
   * received segment mappings data from parent
   */
  @Input() segmentMappings: SegmentMappings[] = [];

  /**
   * received segment mappings data from parent
   */
  @Input() selectedSegmentMappings: SegmentMappings[] = [];

  /**
   * Hold the selected field
   */
  selection = [];

   selectedFilter = {
    BLOCKTYPE: 'AND',
    CONDITIONOPERATOR: 'EQ',
    FIELDID: '',
    VALUE1: '',
    VALUE2: '',
    externalFieldId: '',
    mdoFieldId: '',
    segmentName: ''
  } as Partial<MdoMappings>;

  constructor(
    private dialogRef: MatDialogRef<Component>,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) {
      super();
    }

  ngOnInit(): void {
    if(this.data?.segmentMappings?.length) {
      this.segmentMappings = this.data.segmentMappings;
      if(this.segmentMappings?.length) {
        this.initializeFilter();
      }

      if(this.data?.conditions.length) {
        this.selectedSegmentMappings = this.data.conditions;
        this.filteredSelectedSegmentMappings = of(this.selectedSegmentMappings);
      }
    }
  }

  /**
   * Initialize filter for Selected Segment list
   * @param segmentMappings Pass the list of segments
   */
  initializeSelectedSegmentFilter() {
    this.filteredSelectedSegmentMappings = this.segmentFilterControl.valueChanges.pipe(
      debounceTime(400),
      startWith(''),
      map((searchTerm: string) => this.filterTarget(searchTerm, merge([], [...this.selectedSegmentMappings])))
    );
  }

  /**
   * Initialize filter for Segment list
   * @param segmentMappings Pass the list of segments
   */
  initializeFilter() {
    this.filteredSegmentMappings = this.segmentFilterControl.valueChanges.pipe(
      debounceTime(400),
      startWith(''),
      map((searchTerm: string) => this.filterTarget(searchTerm, merge([], [...this.segmentMappings])))
    );
  }

  addedSelectFields(selection: Partial<MdoMappings>) {
    this.selectedFilter = selection;
  }

  /**
   * Manage selected segments after a field is selected
   * @param selection Pass the selected field as an array and it's Parent segment
   */
  selectFields(selection: Partial<MdoMappings>) {
    this.selectedFilter = selection;

    const segmentName: string = selection.segmentName;

    if(this.selection.indexOf(selection.externalFieldId) === -1) {
      this.selection.push(selection);
    }

    if(!!segmentName) {
      let selectedSegmentOrigin = merge({}, {...this.segmentMappings.find(segment => segment.segmentName === segmentName)});
      selectedSegmentOrigin = this.removeUnselectedFields(this.selection, selectedSegmentOrigin);

      if(this.selectedSegmentMappings?.length) {
        const index = this.selectedSegmentMappings.findIndex(mapping => mapping.segmentName === segmentName);
        if(index > -1) {
          this.selectedSegmentMappings[index] = {...selectedSegmentOrigin};
        } else {
          this.selectedSegmentMappings.push({...selectedSegmentOrigin});
        }
      } else {
        this.selectedSegmentMappings.push({...selectedSegmentOrigin});
      }

      this.filteredSelectedSegmentMappings = of(this.selectedSegmentMappings);
    }
  }

  updateFilterValue($event) {
    const index = this.selection.findIndex(mapping => mapping.FIELDID === this.selectedFilter.FIELDID);
    if(index > -1) {
      this.selection[index] = {...this.selectedFilter};
    }

    const mappingIndex = this.selectedSegmentMappings.findIndex(mapping => mapping.FIELDID === this.selectedFilter.FIELDID);
    if(mappingIndex > -1) {
      this.selectedSegmentMappings[mappingIndex] = {...this.selectedFilter as SegmentMappings};
      this.filteredSelectedSegmentMappings = of(this.selectedSegmentMappings);
    }
  }

  removeFields(selection: MdoMappings) {
    const segmentName: string = selection.segmentName;
    this.selection.splice(this.selection.indexOf(selection.FIELDID), 1);

    const mappingIndex = this.segmentMappings.findIndex(mapping => mapping.FIELDID === selection.FIELDID);
    if(mappingIndex > -1) {
      this.selectedFilter = {
        VALUE1: '',
        FIELDID: ''
      }
      this.segmentMappings[mappingIndex] = Object.assign({}, this.segmentMappings[mappingIndex], {
        VALUE1: ''
      });
      this.filteredSegmentMappings = of(this.segmentMappings);
    }

    if(!!segmentName) {
      let selectedSegmentOrigin = merge({}, {...this.segmentMappings.find(segment => segment.segmentName === segmentName)});
      selectedSegmentOrigin = this.removeFieldsAndSegment(this.selection, selectedSegmentOrigin);
      if(selectedSegmentOrigin === null) {
        this.selectedSegmentMappings = this.selectedSegmentMappings.filter(mapping => mapping.segmentName !== segmentName);
        this.filteredSelectedSegmentMappings = of(this.selectedSegmentMappings);
        return;
      }

      if(this.selectedSegmentMappings?.length) {
        const index = this.selectedSegmentMappings.findIndex(mapping => mapping.segmentName === segmentName);
        if(index > -1) {
          this.selectedSegmentMappings[index] = {...selectedSegmentOrigin};
        } else {
          this.selectedSegmentMappings.push({...selectedSegmentOrigin});
        }
      } else {
        this.selectedSegmentMappings.push({...selectedSegmentOrigin});
      }

      this.filteredSelectedSegmentMappings = of(this.selectedSegmentMappings);
    }
  }

  removeFieldsAndSegment(selectedIds: string[], selectedSegmentOrigin: SegmentMappings): SegmentMappings {
    let noMatchingFieldsUnderSegment = true;
    let noImmediateMcthingFields = false;
    if(selectedSegmentOrigin?.mdoMappings?.length) {
      selectedSegmentOrigin.mdoMappings = selectedSegmentOrigin.mdoMappings.filter(mdoMapping => {
        return selectedIds?.length? selectedIds.indexOf(mdoMapping.externalFieldId) > -1: false;
      });

      noImmediateMcthingFields = (selectedSegmentOrigin.mdoMappings?.length === 0);
    } else {
      noImmediateMcthingFields = true;
    }

    if(selectedSegmentOrigin?.segmentMappings?.length) {
      selectedSegmentOrigin.segmentMappings = selectedSegmentOrigin.segmentMappings.map((segmentMapping: SegmentMappings) => {
        if(segmentMapping?.mdoMappings?.length && segmentMapping.mdoMappings.some((mapping: MdoMappings) => selectedIds.indexOf(mapping.externalFieldId) > -1)) {
          noMatchingFieldsUnderSegment = false;
          return this.removeFieldsAndSegment(selectedIds, segmentMapping);
        } else {
          noMatchingFieldsUnderSegment = true;
        }

        return segmentMapping;
      });

      if(noMatchingFieldsUnderSegment) {
        selectedSegmentOrigin.segmentMappings = [];
      }
    }

    return noImmediateMcthingFields && noMatchingFieldsUnderSegment? null: selectedSegmentOrigin;
  }

  /**
   * Method to remove selected fields from the segment
   * @param selectedIds Pass the selected field as an array of ids
   * @param selectedSegmentOrigin Pass the selected segment
   * @returns SegmentMappings
   */
  removeUnselectedFields(selectedIds: string[], selectedSegmentOrigin: SegmentMappings): SegmentMappings {
    if(selectedSegmentOrigin?.mdoMappings?.length) {
      selectedSegmentOrigin.mdoMappings = selectedSegmentOrigin.mdoMappings.filter(mdoMapping => {
        return selectedIds?.length? selectedIds.indexOf(mdoMapping.externalFieldId) > -1: false;
      });
    }

    if(selectedSegmentOrigin?.segmentMappings?.length) {
      selectedSegmentOrigin.segmentMappings = selectedSegmentOrigin.segmentMappings.map((segmentMapping: SegmentMappings) => {
        if(segmentMapping?.mdoMappings?.length && segmentMapping.mdoMappings.some((mapping: MdoMappings) => selectedIds.indexOf(mapping.externalFieldId) > -1)) {
          return this.removeUnselectedFields(selectedIds, segmentMapping);
        }

        return segmentMapping;
      });
    }

    return selectedSegmentOrigin;
  }


  updateExistingMapping(mapping: SegmentMappings, externalFieldId: string) {
    if(mapping?.mdoMappings?.length) {
      mapping.mdoMappings = mapping.mdoMappings.filter(mdoMapping => {
        return mdoMapping.externalFieldId === externalFieldId;
      });
    }

    if(mapping?.segmentMappings?.length) {
      mapping.segmentMappings = mapping.segmentMappings.map(segmentMapping => {
        return this.updateExistingMapping(segmentMapping, externalFieldId);
      });
    }

    return mapping;
  }

  removeCurrentField(field: MdoMappings, parentNode: SegmentMappings) {
    console.log(this.segmentMappings);
    // const rootSegment = this.findRootSegmentByFieldId(field.externalFieldId, this.segmentMappings);
    // if(rootSegment.length) {
    //   const uuid = rootSegment[0].uuid;
    //   this.selectedSegmentMappings = this.selectedSegmentMappings.filter((segment) => segment.uuid !== uuid);
    //   console.log('selected mapping after remove', this.selectedSegmentMappings);

    //   this.filteredSelectedSegmentMappings = of(this.selectedSegmentMappings);
    // }
  }

  /**
   * Closes the dialog
   */
  close() {
    this.dialogRef.close();
  }

  removeLabel(label) {

  }

  save() {
    this.dialogRef.close(this.selection);
  }
}
