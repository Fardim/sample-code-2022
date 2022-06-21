import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SegmentMappings, MdoMappings } from '@models/mapping';

export interface SegmentFieldSelection {
  segment: SegmentMappings;
  targetField: MdoMappings;
}

@Component({
  selector: 'pros-segment-data',
  templateUrl: './segment-data.component.html',
  styleUrls: ['./segment-data.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SegmentDataComponent implements OnInit, OnChanges {

  /**
   * Received SegmentMappings from the parent component
   */
  @Input() segment: SegmentMappings;

  /**
   * Received instance of form control from the parent component
   */
  @Input() control: FormControl;

  /**
   * Whether fields in this section can be removed
   */
  @Input() removable: boolean;

  /**
   * To emit the output back to parent when a field is selected
   */
  @Output() fieldSelected: EventEmitter<Partial<MdoMappings>> = new EventEmitter();

  /**
   * To emit the output back to parent when a field is removed
   */
  @Output() fieldRemoved: EventEmitter<MdoMappings> = new EventEmitter();
  constructor() { }

  ngOnInit(): void {
  }

  /**
   * Emits the field selected by the nested child segment
   * parent to the parent component
   * @param segmentFieldSelection Pass the MdoMappings object
   */
  emitSelectedField(segmentFieldSelection: MdoMappings) {
    this.fieldSelected.emit(segmentFieldSelection);
  }

  /**
   * Selects the target field and emits
   * @param targetField pass the field to be selected
   */
  selectCurrentField(targetField: Partial<MdoMappings>) {
    this.fieldSelected.emit(targetField);
  }

  /**
   * Selects the target field and emits
   * @param targetField pass the field to be selected
   */
   removeCurrentField(targetField: MdoMappings) {
    this.fieldRemoved.emit(targetField);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.segment?.currentValue) {
      this.segment = changes.segment.currentValue;
    }
    if(changes.control?.currentValue) {
      this.control = changes.control.currentValue;
    }
    if(changes.removable?.currentValue) {
      this.removable = changes.removable.currentValue;
    }
  }
}
