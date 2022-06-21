import { Component, EventEmitter, Input, Output } from '@angular/core';
import { VirtualDatasetDetails } from '@models/list-page/virtual-dataset/virtual-dataset';

@Component({
  selector: 'pros-virtual-dataset-edit',
  templateUrl: './virtual-dataset-edit.component.html',
  styleUrls: ['./virtual-dataset-edit.component.scss']
})
export class VirtualDatasetEditComponent {
  @Input() virtualDatasetDetails: VirtualDatasetDetails;
  @Output() dmlTypeSelectionChange: EventEmitter<string> = new EventEmitter();
  dmlTypes: string[] = ['Join', 'Transformation']

  constructor() { }

  seriesMenuClick(dmlType: string) {
    this.dmlTypeSelectionChange.emit(dmlType);
  }

}
