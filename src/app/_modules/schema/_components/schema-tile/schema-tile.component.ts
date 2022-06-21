import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { SchemaService } from '@services/home/schema.service';
import { SchemaStaticThresholdRes } from '@models/schema/schemalist';
import { Subscription } from 'rxjs';
import { SchemaExecutionRequest } from '@models/schema/schema-execution';
import { SchemaExecutionService } from '@services/home/schema/schema-execution.service';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'pros-schema-tile',
  templateUrl: './schema-tile.component.html',
  styleUrls: ['./schema-tile.component.scss']
})


export class SchemaTileComponent implements OnInit, OnDestroy {

  @Input()
  title: string;
  @Input()
  bottomLeftLabel: string;
  @Input()
  bottomRightLabel: string;

  @Input()
  info: boolean;
  @Input()
  edit: boolean;
  @Input()
  delete: boolean;
  @Input()
  isVariant : boolean;

  @Input()
  state: string;

  @Output()
  evtEdit = new EventEmitter();
  @Output()
  evtDelete = new EventEmitter();
  @Output()
  evtBottomLeft = new EventEmitter();
  @Output()
  evtBottomRight = new EventEmitter();
  @Output()
  evtInfo = new EventEmitter();

  @Input()
  totalValue: number;
  @Input()
  successValue: number;
  @Input()
  errorValue: number;
  @Input()
  skippedValue: number;
  @Input()
  correctionValue: number;
  @Input()
  duplicateValue: number;

  @Input()
  totalUniqueValue: number;
  @Input()
  successUniqueValue: number;
  @Input()
  errorUniqueValue: number;
  @Input()
  skippedUniqueValue: number;

  @Input()
  successTrendValue: number;
  @Input()
  errorTrendValue: number;

  @Input()
  schemaId: string;

  @Input()
  variantId: string;

  @Input()
  timestamp: string; // this should be date

  showingErrors = true;
  showUnique = false;

  totalCount = 0;
  runAllLebal = 'Run all';

  /**
   * Hold all info related to schema threshold statics
   */
  thresholdRes: SchemaStaticThresholdRes = new SchemaStaticThresholdRes();

  /**
   * All subsriptions are here
   */
  subscriptions: Subscription[] = [];

  constructor(
    private schemaService: SchemaService,
    private matSnackBar: MatSnackBar,
    private schemaExecutionService: SchemaExecutionService
  ) { }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  ngOnInit() {
    if (this.schemaId) {
      this.getSchemaThresholdStatics();
    }
  }

  public percentageErrorStr(): number {
    const num = this.showUnique ? (this.totalUniqueValue > 0 ? this.errorUniqueValue / this.totalUniqueValue : 0) : (this.totalValue > 0 ? this.errorValue / this.totalValue : 0);
    return Math.round((num + Number.EPSILON) * 100 * 100) / 100;
  }

  public percentageSuccessStr(): number {
    const num = this.showUnique ? (this.totalUniqueValue > 0 ? this.successUniqueValue / this.totalUniqueValue : 0) : (this.totalValue > 0 ? this.successValue / this.totalValue : 0);
    return Math.round((num + Number.EPSILON) * 100 * 100) / 100;
  }

  public toggle() {
    this.showingErrors = !this.showingErrors;
  }

  public toggleUnique(evt: MatSlideToggleChange) {
    this.showUnique = evt.checked;
  }

  public onEdit() {
    return this.evtEdit.emit();
  }

  public onDelete() {
    return this.evtDelete.emit();
  }

  public onBottomLeft() {
    return this.evtBottomLeft.emit();
  }

  public onBottomRight() {
    return this.evtBottomRight.emit();
  }

  public onInfo() {
    return this.evtInfo.emit();
  }

  /**
   * Get schema threshold statics
   * Based on schemaId & variantId
   */
  getSchemaThresholdStatics() {
    const staticSub = this.schemaService.getSchemaThresholdStatics(this.schemaId, this.variantId).subscribe(res => {
      this.thresholdRes = res;
      this.thresholdRes.threshold = Math.round((res.threshold + Number.EPSILON) * 100) / 100;
      this.totalCount = res.totalCnt;
      this.errorValue = res.errorCnt;
      this.successValue = res.successCnt;
    }, error => {
      this.thresholdRes.threshold = 0;
      console.error(`Execption : ${error.message}`);
    });
    this.subscriptions.push(staticSub);
  }

  /**
   * Before run get all records count
   */
  scheduleSchemaGetCnt() {
    this.runAllLebal = 'Loading..';
    this.schemaService.scheduleSchemaCount(this.schemaId).subscribe(data => {
      this.totalCount = data;
      this.state = 'readyForRun';
      this.runAllLebal = 'Run all';
    }, error => {
      console.error(`Execption : ${error.message}`);
      this.matSnackBar.open(`Index not found, please sync data.`, 'Close', { duration: 5000 });
      this.runAllLebal = 'Run all';
    });
  }

  /**
   * Schedule / Run Schema for all records
   */
  scheduleSchema() {
    const schemaExecutionReq: SchemaExecutionRequest = new SchemaExecutionRequest();
    schemaExecutionReq.schemaId = this.schemaId;
    schemaExecutionReq.variantId = '0'; // 0 for run all
    const isRunWithCheckedData = false;
    this.schemaExecutionService.scheduleSChema(schemaExecutionReq, isRunWithCheckedData).subscribe(data => {
      this.state = 'inRunning';
    }, error => {
      this.matSnackBar.open(`Something went wrong `, 'Close', { duration: 5000 });
    });
  }

}
