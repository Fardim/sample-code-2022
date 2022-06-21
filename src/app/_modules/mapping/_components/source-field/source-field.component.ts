import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'pros-source-field',
  templateUrl: './source-field.component.html',
  styleUrls: ['./source-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SourceFieldComponent implements OnInit, OnChanges {

  @Input() id: string;
  @Input() hasMapping: boolean;
  @Input() selected: boolean;
  @Input() name: string;
  @Input() searchTerm: string;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.hasMapping && changes.hasMapping.currentValue !== undefined) {
      this.hasMapping = changes.hasMapping.currentValue;
    }
    if(changes.selected && changes.selected.currentValue !== undefined) {
      this.selected = changes.selected.currentValue;
    }
    if(changes.searchTerm && changes.searchTerm.currentValue) {
      this.searchTerm = changes.searchTerm.currentValue;
    }
  }
}
