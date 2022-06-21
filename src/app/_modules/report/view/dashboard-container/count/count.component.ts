import { Component, OnInit, OnChanges, SimpleChanges, OnDestroy, Output, EventEmitter } from '@angular/core';
import { GenericWidgetComponent } from '../../generic-widget/generic-widget.component';
import { WidgetService } from 'src/app/_services/widgets/widget.service';
import { Count, Criteria, WidgetHeader, WidgetType } from '../../../_models/widget';
import { Subscription } from 'rxjs';
import { Userdetails } from '@models/userdetails';
import { UserService } from '@services/user/userservice.service';

@Component({
  selector: 'pros-count',
  templateUrl: './count.component.html',
  styleUrls: ['./count.component.scss']
})
export class CountComponent extends GenericWidgetComponent implements OnInit, OnChanges, OnDestroy {

  countWidget : any;
  constructor( private widgetService : WidgetService, private userService: UserService) {
    super();
  }

  widgetHeader: WidgetHeader = new WidgetHeader();
  count = 0;
  arrayBuckets :any[]
  userDetails: Userdetails;

  /**
   * All the http or normal subscription will store in this array
   */
  subscriptions: Subscription[] = [];

  @Output()
  evtFilterCriteria: EventEmitter<Criteria[]> = new EventEmitter<Criteria[]>();

  showClearButton: boolean;

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.filterCriteria && changes.filterCriteria.previousValue !== undefined && !this.widgetHeader.isEnableGlobalFilter) {
      this.getCountData(this.widgetId, this.filterCriteria);
    }

    if (Array.isArray(changes?.filterCriteria?.currentValue)) {
      if (changes?.filterCriteria?.currentValue?.length === 0) {
        this.showClearButton = false;
      }
    }
  }

  ngOnInit(): void {
    this.getCountMetadata();
    this.getHeaderMetaData();
    this.userService.getUserDetails().subscribe(
      (response: Userdetails) => {
        this.userDetails = response;
      }
    );
    this.getCountData(this.widgetId,this.filterCriteria);
  }

  public getHeaderMetaData(): void {
    const HeaderMetadataSub = this.widgetService.getHeaderMetaData(this.widgetId).subscribe(returnData => {
      this.widgetHeader = returnData;
    }, error => {
      console.error(`Error : ${error}`);
    });
    this.subscriptions.push(HeaderMetadataSub);
  }

  public getCountMetadata(): void {
    this.countWidget = {} as Count;
    const CountMetadataSub = this.widgetService.getCountMetadata(this.widgetId).subscribe(returndata => {
      this.countWidget = returndata;
    }, error => {
      console.error(`Error : ${error}`);
    });
    this.subscriptions.push(CountMetadataSub);
  }

  public getCountData(widgetid:number,creiteria:Criteria[]):void{
    const widgetDataSub = this.widgetService.getWidgetData(String(widgetid),creiteria,'','','',this.userDetails.defLocs.toString()).subscribe(returndata=>{
      this.count = 0;
      const res = Object.keys(returndata.aggregations);
      if(res[0] === 'nested#Nest_Count'){
        const res1 = returndata.aggregations[res[0]];
        const resValue = Object.keys(res1);
        const value = resValue.filter(data => {
          return data.includes('#COUNT');
        });
        if(value[0] === 'value_count#COUNT' || value[0] === 'scripted_metric#COUNT') {
          this.count  = res1[value[0]] ? res1[value[0]].value : 0;
        }
      }else if(res[0] === 'value_count#COUNT' || res[0] === 'scripted_metric#COUNT') {
        this.count  = returndata.aggregations[res[0]] ? returndata.aggregations[res[0]].value : 0;
      } else if(res[0] === 'sum#COUNT') {
        const sumCnt  = returndata.aggregations[res[0]] ? returndata.aggregations[res[0]].value : 0;
        this.count =  Math.round((sumCnt + Number.EPSILON)  * 100) / 100;
      } else {
        console.log('Something missing on count widget !!.');
      }
      this.widgetService.updateCount(this.count);
    }, error => {
      console.error(`Error : ${error}`);
    });
    this.subscriptions.push(widgetDataSub);
  }

  emitEvtClick(): void {
    throw new Error('Method not implemented.');
  }
  emitEvtFilterCriteria(event: MouseEvent): void {
    // merge array only if object does not exists in the values array
    const filterCriteria = [...this.filterCriteria];
    if (this.countWidget.filterCriteria.length) {
      this.countWidget.filterCriteria.forEach(el => {
        const index = this.filterCriteria.findIndex(filter => filter.fieldId === el.conditionFieldId && filter.conditionFieldValue === el.conditionFieldValue && filter.widgetType === WidgetType.COUNT);
        if(index === -1) {
          filterCriteria.push(el);
        }
      })
      this.showClearButton = true;
      this.filterCriteria = [...filterCriteria];
      this.evtFilterCriteria.emit(this.filterCriteria);
      event.stopPropagation();
    }
  }

  clearFilter(): void {
    this.showClearButton = false;
    const appliedFiltered = this.countWidget.filterCriteria.filter((el: Criteria) => {
      return this.filterCriteria.some((f: Criteria) => {
        return f.fieldId === el.fieldId && f.conditionFieldValue === el.conditionFieldValue;
      });
    });

    appliedFiltered.forEach(fill => {
      this.filterCriteria.splice(this.filterCriteria.indexOf(fill), 1);
    });

    this.evtFilterCriteria.emit(this.filterCriteria);
  }
}
