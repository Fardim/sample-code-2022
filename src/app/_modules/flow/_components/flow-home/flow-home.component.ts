import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FlowListComponent } from './flow-list/flow-list.component';

@Component({
  selector: 'pros-flow-home',
  templateUrl: './flow-home.component.html',
  styleUrls: ['./flow-home.component.scss']
})
export class FlowHomeComponent implements AfterViewInit {
  @ViewChild(FlowListComponent) flowListComponent: FlowListComponent;
  dataLoaders: any;
  constructor(private cdRef: ChangeDetectorRef) { }

  ngAfterViewInit(): void {
    this.flowListComponent?.dataLoaderSubject.subscribe(data => {
      this.dataLoaders = data;
      this.cdRef.detectChanges();
    });
  }
}
