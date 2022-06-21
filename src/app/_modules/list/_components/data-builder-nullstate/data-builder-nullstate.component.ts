import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'pros-data-builder-nullstate',
  templateUrl: './data-builder-nullstate.component.html',
  styleUrls: ['./data-builder-nullstate.component.scss']
})
export class DataBuilderNullstateComponent implements OnInit, OnChanges {

  @Output() addManually: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() readOnlyMode = false;
  secondaryText = '';

  constructor() { }

  ngOnInit(): void {
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.secondaryText = this.readOnlyMode ? `It's view only mode dataset can not be modified here`: `This section doesn’t have any fields. Would you like to add one?`;
  }

}
