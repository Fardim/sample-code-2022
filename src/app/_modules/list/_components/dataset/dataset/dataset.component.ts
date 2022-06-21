import { takeUntil } from 'rxjs/operators';
import { FlowStep } from './../../connector/models/step.model';
import { ConnectorContainerDirective } from './../../connector/directives/connector-container.directive';
import { ConnectorService } from './../../connector/services/connector.service';
import { Component, Inject, OnInit, ViewChild, ComponentFactoryResolver, AfterViewInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { SapwsService, TableMappingData } from '@services/sapws/sapws.service';
@Component({
  selector: 'pros-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.scss'],
})
export class DatasetComponent implements OnInit, AfterViewInit, OnDestroy {
  showManualDatabaseForm = false;
  showConnectDatasetTab = false;
  selectedDatasetId = 0;
  datasetTypes: { key: string; value: string }[] = [
    {
      key: 'Standard',
      value: 'STD',
    },
    {
      key: 'Virtual',
      value: 'VT',
    },
  ];
  selectedDatasetType = null;

  currentStep = 0;

  steps: FlowStep[] = [];

  @ViewChild(ConnectorContainerDirective, {static: true}) container: ConnectorContainerDirective;

  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();

  constructor(
    public dialogRef: MatDialogRef<DatasetComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private connectorService: ConnectorService,
    private cfResolver: ComponentFactoryResolver,
    private sapSw: SapwsService
  ) {}

  ngAfterViewInit(): void {
    this.loadSteps();
    this.findStep('dataset sources');
    // this.findStep('sap cpi data scope');

  }

  ngOnInit(): void {
    // set dataset id selected from menu list
    this.selectedDatasetId = this.data ? this.data.selectedDatasetId : 0;
    this.connectorService.nextStep$.subscribe(resp => {
      if(resp === 1) {
        this.goToNext();
      } else if(resp === -1) {
        this.goToPrev();
      }
    });
    this.connectorService.nextFlowStep$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp: FlowStep) => {
      if(resp) {
        this.connectorService.nextFlowStep.next(null);
        this.steps.push(resp);
        this.loadComponent();
      }
    });
    this.connectorService.backClicked$.pipe(takeUntil(this.unsubscribeAll$)).subscribe(resp => {
      if(resp) {
        this.connectorService.backClicked.next(false);
        this.steps.pop();
        this.loadComponent();
      }
    });
    this.connectorService.cancelClick$.pipe(takeUntil(this.unsubscribeAll$)).subscribe(resp => {
      if(resp) {
        this.connectorService.onCancelClick(null);
        this.onCancelClick(resp);
      }
    });
    this.sapSw.tableMappingSubscription.pipe(takeUntil(this.unsubscribeAll$)).subscribe((response: TableMappingData) => {

    });
  }

  findStep(step: string) {
    this.connectorService.getNextComponent(step);
  }
  loadSteps() {
    // this.steps = this.connectorService.getProcessSteps();
    // this.currentStep = 0;
    // this.loadComponent();
    // console.log('steps', this.steps);
  }

  loadComponent() {
    const step: FlowStep = this.steps[this.steps.length - 1];
    console.log('type', typeof(step.component));
    if(step && step.component) {
      const factory = this.cfResolver.resolveComponentFactory(step.component);
      const viewContainerRef = this.container.viewContainerRef;
      viewContainerRef.clear();
      const comp =  viewContainerRef.createComponent(factory);
      comp.changeDetectorRef.detectChanges();
    }
  }

  goToNext() {
    this.currentStep++;
    this.loadComponent();
  }

  goToPrev() {
    this.currentStep--;
    this.loadComponent();
  }
  /**
   * Close dialog ref
   * @param toRefreshApis to get apis once modal is closed
   */
  onCancelClick(event: { toRefreshApis: boolean; moduleId?: number }): void {
    this.dialogRef.close(event);
    this.selectedDatasetId = 0;
  }

  // show wizard on back click
  back() {
    this.showManualDatabaseForm = false;
    this.showConnectDatasetTab = false;
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
  }
}
