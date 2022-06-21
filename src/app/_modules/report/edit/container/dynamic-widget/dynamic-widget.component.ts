import { Component, OnInit, OnChanges } from '@angular/core';
import { WidgetComponent } from '../widget/widget.component';

@Component({
  selector: 'pros-dynamic-widget',
  templateUrl: './dynamic-widget.component.html',
  styleUrls: ['./dynamic-widget.component.scss']
})
export class DynamicWidgetComponent extends WidgetComponent implements OnInit, OnChanges {

  showDelete = true;
  constructor() {
    super();
  }

  ngOnChanges(changes: import('@angular/core').SimpleChanges): void {

  }

  ngOnInit(): void {
  }

  emitDeleteEvent(): void {
   this.evtDelete.emit(this.widget);
  }
  emitStyleEvent(): void {
    this.evtStyle.emit(this.widget);
  }

}
