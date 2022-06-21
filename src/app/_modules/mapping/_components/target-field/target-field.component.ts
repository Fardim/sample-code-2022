import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MdoMappings } from '@models/mapping';

@Component({
  selector: 'pros-target-field',
  templateUrl: './target-field.component.html',
  styleUrls: ['./target-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TargetFieldComponent implements OnInit, OnChanges {

  @Input() selected: boolean;
  @Input() searchTerm: string;
  @Input() targetField: MdoMappings;
  @Input() hasTransformation: boolean;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.selected && changes.selected.currentValue) {
      this.selected = changes.selected.currentValue;
    }
    if(changes.searchTerm && changes.searchTerm.currentValue) {
      this.searchTerm = changes.searchTerm.currentValue;
    }
    if(changes.targetField && changes.targetField.currentValue) {
      this.targetField = changes.targetField.currentValue;
    }
    if(changes.hasTransformation && changes.hasTransformation.currentValue) {
      this.hasTransformation = changes.hasTransformation.currentValue;
    }
  }
}
