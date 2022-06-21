import { Component, Input} from '@angular/core';
import { GenericWidgetComponent } from '@modules/report-v2/builder/generic-widget/generic-widget.component';

@Component({
  selector: 'pros-dataset-list',
  templateUrl: './dataset-list.component.html',
  styleUrls: ['./dataset-list.component.scss'],
})
export class DataSetListComponent extends GenericWidgetComponent {

    @Input() moduleId;
    @Input() isReport;

    constructor() {
        super();
    }

    emitEvtFilterCriteria(event: any): void {
        throw new Error('Method not implemented.');
    }
}
