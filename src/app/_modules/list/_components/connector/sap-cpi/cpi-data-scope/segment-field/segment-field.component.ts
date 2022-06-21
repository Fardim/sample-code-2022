import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MdoMappings } from '@models/mapping';

@Component({
  selector: 'pros-segment-field',
  templateUrl: './segment-field.component.html',
  styleUrls: ['./segment-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegmentFieldComponent implements OnInit, OnChanges {
  @Input() searchTerm: string;
  @Input() targetField: MdoMappings;

  /**
   * Whether fields in this section can be removed
   */
  @Input() removable: boolean;

  @Output() removed: EventEmitter<MdoMappings> = new EventEmitter();
  constructor() {}

  ngOnInit(): void {}

  removeField() {
    this.removed.emit(this.targetField);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.searchTerm?.currentValue) {
      this.searchTerm = changes.searchTerm.currentValue;
    }
    if(changes.targetField?.currentValue) {
      this.targetField = changes.targetField.currentValue;
    }
  }
}
