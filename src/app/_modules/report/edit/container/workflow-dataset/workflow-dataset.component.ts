import { Component, OnInit, Input, OnDestroy, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import { WorkflowResponse } from '@models/schema/schema';
import { SchemaService } from '@services/home/schema.service';
import { ProcessService } from '@services/process/process.service';
import { Observable, of, Subscription } from 'rxjs';

@Component({
  selector: 'pros-workflow-dataset',
  templateUrl: './workflow-dataset.component.html',
  styleUrls: ['./workflow-dataset.component.scss']
})
export class WorkflowDatasetComponent implements OnInit, OnDestroy, OnChanges {


  /**
   * prop for selected work flow modules ..
   */
  @Input()
  selected: WorkflowResponse[] = [];

  @Input()
  preSelectedObj = '';

  @Input()
  searchText = '';

  @Input()
  isWorkFlow = false;

  @Output()
  selectedWfs: EventEmitter<WorkflowResponse[]> = new EventEmitter<WorkflowResponse[]>();

  dataSetsWorkFlow: WorkflowResponse[] = [];
  dataSetWorkflow: Observable<WorkflowResponse[]> = of([]);

  /**
   * hold all subscriptions ...
   */
  subscriptions: Subscription[] = [];

  allChecked = false;
  allIndeterminate = false;

  constructor(
    private processService: ProcessService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.isWorkFlow) {
      if(changes && changes.preSelectedObj && changes.preSelectedObj.previousValue !== changes.preSelectedObj.currentValue) {
        this.preSelectedObj = changes.preSelectedObj.currentValue;
        const preSelVal = this.preSelectedObj.split(',');
        this.dataSetsWorkFlow.forEach(r=>{
           if(preSelVal.indexOf(r.objectid) !==-1) {
             r.isSelected = true;
           }
        });
        this.dataSetWorkflow = of(this.dataSetsWorkFlow);
        this.manageStateOfCheckBox();
      }
    }

    if(changes && changes.searchText && changes.searchText.previousValue !== changes.searchText.currentValue) {
      if(typeof  changes.searchText.currentValue === 'string') {
        this.searchText = changes.searchText.currentValue;
        if(this.searchText) {
          this.dataSetWorkflow = of(this.dataSetsWorkFlow.filter(fil=> fil.objectdesc.toLocaleLowerCase().indexOf(this.searchText.toLocaleLowerCase()) !==-1));
        } else {
          this.dataSetWorkflow = of(this.dataSetsWorkFlow);
        }
      }
    }

    if(changes && changes.isWorkFlow && changes.isWorkFlow.previousValue !== changes.isWorkFlow.currentValue) {
      if(!changes.isWorkFlow.currentValue) {
        this.dataSetsWorkFlow.forEach(r=>{
          r.isSelected = false;
        });
        this.dataSetWorkflow = of(this.dataSetsWorkFlow);
        this.manageStateOfCheckBox();
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub=>{
       sub.unsubscribe();
    });
  }

  ngOnInit(): void {
    const workflowSub = this.processService.getworkflowData().subscribe(res => {
      if(this.isWorkFlow) {
        const preSelVal = this.preSelectedObj.split(',');
        res.forEach(r=>{
          if(preSelVal.indexOf(r.objectid) !==-1) {
            r.isSelected = true;
          }
       });
      }
      this.dataSetsWorkFlow = res;
      this.dataSetWorkflow = of(res);
      this.manageStateOfCheckBox();
    }, error => console.error(`Error: ${error}`));
    this.subscriptions.push(workflowSub);
  }



  /**
   * Log while selection change ..
   * @param item chnageable selection data ...
   */
  selectionChange(fld: WorkflowResponse) {
    const fldData = this.dataSetsWorkFlow.filter(fil => fil.objectid === fld.objectid)[0];
    fldData.isSelected = fld.isSelected ? false : true;
    this.dataSetWorkflow = of(this.dataSetsWorkFlow);
    this.manageStateOfCheckBox(true);
  }

  /**
   * Manage select all checkbox state
   */
  manageStateOfCheckBox(isEmit?: boolean) {
    const selectedCnt = this.dataSetsWorkFlow.filter(fil => fil.isSelected === true);
    if(selectedCnt.length === this.dataSetsWorkFlow.length) {
      this.allChecked = true;
      this.allIndeterminate = false;
    } else if(selectedCnt.length > 0){
      this.allIndeterminate = true;
      this.allChecked = false;
    } else {
      this.allIndeterminate = false;
      this.allChecked = false;
    }
    if(isEmit) {
      this.emitValue();
    }
  }

  isSelected(item: WorkflowResponse): boolean {
    return item.isSelected ? item.isSelected : false;
  }


  /**
   * State of select all checkbox ..
   */
  selectAll() {
    // this.data.selectedFields = [];
    if(!this.allChecked) {
      this.allChecked  = true;
      this.allIndeterminate = false;
      // this.data.selectedFields = this.headerArray;
    } else {
      this.allChecked = false;
      this.allIndeterminate = false;
    }
    if(this.allChecked) {
      this.dataSetsWorkFlow.forEach(each=>{
        each.isSelected = true;
      });
    } else {
      this.dataSetsWorkFlow.forEach(each=>{
        each.isSelected = false;
      });
    }
    this.dataSetWorkflow = of(this.dataSetsWorkFlow);
    this.emitValue();
  }

  isChecked(module: WorkflowResponse): boolean {
    return module ? module.isSelected : false;
  }

  /**
   * Emit all selected values ...
   */
  emitValue() {
    const selectedval = this.dataSetsWorkFlow.filter(fil => fil.isSelected === true);
    this.selectedWfs.emit(selectedval);
  }

  /**
   * Get tooltip
   * @param data get current module
   */
  getTooltip(data): string {
    const toolData = data ? data.objectdesc : '';
      return toolData;
  }
}
