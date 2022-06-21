import { Component, OnInit, OnChanges, SimpleChanges, OnDestroy, Output, EventEmitter } from '@angular/core';
import { GenericWidgetComponent } from '../../generic-widget/generic-widget.component';
import { WidgetService } from 'src/app/_services/widgets/widget.service';
import { Count, Criteria, WidgetType } from '../../../_models/widget';
import { Subscription } from 'rxjs';
import { UserService } from '@services/user/userservice.service';
import { Userdetails } from '@models/userdetails';
import { isEqual } from 'lodash'
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { environment } from 'src/environments/environment';
import { SchemaService } from '@services/home/schema.service';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';

@Component({
  selector: 'pros-count',
  templateUrl: './count.component.html',
  styleUrls: ['./count.component.scss'],
})
export class CountComponent extends GenericWidgetComponent implements OnInit, OnChanges, OnDestroy {
  countWidget: Count;
  constructor(
    private widgetService: WidgetService,
    private userService: UserService,
    private schemaDetailsService: SchemaDetailsService,
    private schemaService: SchemaService,
    private sharedService: SharedServiceService
  ) {
    super();
  }

  count = 0;
  arrayBuckets: any[];
  userDetails: Userdetails;

  /**
   * All the http or normal subscription will store in this array
   */
  subscriptions: Subscription[] = [];

  @Output()
  evtFilterCriteria: EventEmitter<Criteria[]> = new EventEmitter<Criteria[]>();
  showClearButton: boolean;

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.filterCriteria && changes.filterCriteria.previousValue !== undefined && !this.widgetInfo.isEnableGlobalFilter) {
      this.isFetchingData = true;
      this.sharedService.setFilterCriteriaData(this.filterCriteria);
      this.getCountData(this.widgetId, this.filterCriteria);
    }
    if (Array.isArray(changes?.filterCriteria?.currentValue)) {
      if (changes?.filterCriteria?.currentValue?.length === 0) {
        this.showClearButton = false;
      }
    }
    if (changes && changes.widgetInfo && changes.widgetInfo.previousValue !== undefined && !isEqual(changes.widgetInfo.currentValue, changes.widgetInfo.previousValue)) {
      this.getCountMetadata();
      this.getCountData(this.widgetId, this.filterCriteria);
    }
  }

  ngOnInit(): void {
    this.getCountMetadata();
    this.userService.getUserDetails().subscribe((response: Userdetails) => {
      this.userDetails = response;
    });
    this.isFetchingData = true;
    this.getCountData(this.widgetId, this.filterCriteria);
  }

  public getCountMetadata(): void {
    this.countWidget = {} as Count;
    const CountMetadataSub = this.widgetService.getCountMetadata(this.widgetId).subscribe(
      (returndata) => {
        this.countWidget = returndata;
      },
      (error) => {
        console.error(`Error : ${error}`);
      }
    );
    this.subscriptions.push(CountMetadataSub);
  }

  public getCountData(widgetid: number, creiteria: Criteria[]): void {

    if (this.widgetInfo.datasetType === 'diw_dataset') {
      let filterData = [];
      let diwFilter;
      let filterValue;
      let schemaId: string = null;
      const ruleSelected = this.widgetInfo.brs.split(',');
      if (this.filterCriteria.length) {
        diwFilter = this.filterCriteria.find(item => item.fieldId === '__DIW_STATUS');
        this.filterCriteria = this.filterCriteria.filter(item => item.fieldId !== '__DIW_STATUS');
        filterData = this.transformFilterData();
      }
      if (this.widgetInfo.objectType && this.widgetInfo.objectType.includes('/')) {
        schemaId = this.widgetInfo.objectType.split('/')[1];
      }
      this.schemaService.getSchemaThresholdStaticsV2(schemaId, null, ruleSelected, filterData).subscribe(res => {
        this.isFetchingData = false;
        if (this.widgetInfo.defaultFilters) {
          filterValue = this.widgetInfo.defaultFilters.find(item => item.conditionFieldId === '__DIW_STATUS');
        }
        if (diwFilter) {
          filterValue = diwFilter;
        }
        switch (filterValue?.conditionFieldValue) {
          case 'ERROR': this.count = res.errorCnt;
            break;
          case 'SUCCESS': this.count = res.successCnt;
            break;
          case 'CORR': this.count = res.correctedCnt;
            break;
          case 'OUTDATED': this.count = res.outdatedCnt;
            break;
          case 'SKIPPED': this.count = res.skippedCnt;
            break;
          default: this.count = res.totalCnt;
        }
      },err => {
        this.isFetchingData = false;
      });
    }
    else {
      const widgetDataSub = this.widgetService
        .getWidgetData(String(widgetid), creiteria, '', '', '', this.userDetails?.defLocs?.toString())
        .subscribe(
          (returndata) => {
            this.isFetchingData = false;
            this.count = 0;
            const res = Object.keys(returndata.aggregations);
            if (res[0] === 'value_count#COUNT' || res[0] === 'scripted_metric#COUNT') {
              this.count = returndata.aggregations[res[0]] ? returndata.aggregations[res[0]].value : 0;
            } else if (res[0] === 'sum#COUNT' || res[0] === 'max#COUNT' || res[0] === 'avg#COUNT' || res[0] === 'min#COUNT') {
              const sumCnt = returndata.aggregations[res[0]] ? returndata.aggregations[res[0]].value : 0;
              this.count = Math.round((sumCnt + Number.EPSILON) * 100) / 100;
            } else if (res[0] === 'nested#nested_tags') {
              const nestedAggOp = returndata.aggregations[res[0]];
              if(nestedAggOp['value_count#COUNT']){
                this.count = nestedAggOp['value_count#COUNT'].value;
              } else if(nestedAggOp['sum#COUNT']){
                this.count = nestedAggOp['sum#COUNT'].value;
              } else if(nestedAggOp['max#COUNT']){
                this.count = nestedAggOp['max#COUNT'].value;
              } else if(nestedAggOp['avg#COUNT']){
                this.count = nestedAggOp['avg#COUNT'].value;
              } else if(nestedAggOp['min#COUNT']){
                this.count = nestedAggOp['min#COUNT'].value;
              } else if(nestedAggOp['tdigest_percentiles#COUNT']){
                this.count = nestedAggOp['tdigest_percentiles#COUNT'].values ? nestedAggOp['tdigest_percentiles#COUNT'].values[0].value : 0;
              } else if(nestedAggOp['sterms#COUNT']){
                this.count = nestedAggOp['sterms#COUNT'].buckets ? nestedAggOp['sterms#COUNT'].buckets[0].doc_count : 0;
              }
            } else if (res[0] === 'tdigest_percentiles#COUNT') {
              this.count = returndata.aggregations[res[0]] ? (returndata.aggregations[res[0]].values ? (returndata.aggregations[res[0]].values[0]
                                                           ? (returndata.aggregations[res[0]].values[0].value ? returndata.aggregations[res[0]].values[0].value : 0)
                                                           : 0) : 0) : 0;
            } else if (res[0] === 'sterms#COUNT') {
              this.count = returndata.aggregations[res[0]] ? (returndata.aggregations[res[0]].buckets ? (returndata.aggregations[res[0]].buckets[0]
                                                           ? (returndata.aggregations[res[0]].buckets[0].doc_count ? (returndata.aggregations[res[0]].buckets[0].doc_count) : 0)
                                                           : 0) : 0) : 0;
            }
            else {
              console.log('Something missing on count widget !!.');
            }
            this.widgetService.updateCount(this.count);
          },
          (error) => {
            this.isFetchingData = false;
            console.error(`Error : ${error}`);
          }
        );
      this.subscriptions.push(widgetDataSub);
    }
  }

  emitEvtClick(): void {
    throw new Error('Method not implemented.');
  }

  emitEvtFilterCriteria(event: MouseEvent): void {
    // merge array only if object does not exists in the values array
    const filterCriteria = [...this.filterCriteria];
    if (this.countWidget.filterCriteria?.length) {
      this.countWidget.filterCriteria.forEach((el) => {
        const index = this.filterCriteria.findIndex(
          (filter) =>
            filter.fieldId === el.conditionFieldId &&
            filter.conditionFieldValue === el.conditionFieldValue &&
            filter.widgetType === WidgetType.COUNT
        );
        if (index === -1) {
          const filter = {
            fieldId: el.conditionFieldId,
            widgetType: el.widgetType ? el.widgetType : WidgetType.COUNT,
            conditionFieldValueText: el.conditionFieldValueText ? el.conditionFieldValueText : ''
          }
          filterCriteria.push({...el,...filter});
        }
      });
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
    appliedFiltered.forEach((fill) => {
      this.filterCriteria.splice(this.filterCriteria.indexOf(fill), 1);
    });
    this.evtFilterCriteria.emit(this.filterCriteria);
  }

  /**
   * On click of 'Fix now' button
   */
  openSchemaDetailsTab() {
    let schemaId = null;
    if (this.widgetInfo.objectType && this.widgetInfo.objectType.includes('/')) {
      schemaId = this.widgetInfo.objectType.split('/')[1];
    }
    this.schemaDetailsService.checkPermissionForSchemaDetails(schemaId).subscribe((res) => {
      if (res) {
        const filterData = this.transformFilterData();
        const filterString = JSON.stringify(filterData);
        const filterEscape = escape(filterString);
        const ruleSelected = escape(JSON.stringify(this.widgetInfo.brs.split(',')));
        const fixNowLink = document.createElement('a');
        fixNowLink.href = `${environment.apiurl}/ui/en/index.html#/home/schema/list/${this.widgetInfo.objectType}?view=details`
        fixNowLink.setAttribute('target', '_blank');
        document.body.appendChild(fixNowLink);
        fixNowLink.click();
        fixNowLink.remove();
        // window.open(`${environment.apiurl}/MDOSF/fuze/ngx-mdo/en/index.html#/home/schema/schema-details/${this.widgetInfo.objectType}?f=${filterEscape}&rule=${ruleSelected}`);
      }
    }, err => { });
  }

  /**
   * return the modified filtered value format to send it on schema page
   * @returns transformed filter value to send on schema page
   */
  transformFilterData() {
    const filterData = [];
    this.filterCriteria.forEach(filter => {
      const index = filterData.findIndex(item => item.fieldId === filter.fieldId);
      if (index > -1) {
        filterData[index].values.push(filter.conditionFieldValue);
        const selectedValues = filterData[index].filterCtrl.selectedValues;
        selectedValues.push({ CODE: filter.conditionFieldValue, TEXT: filter.conditionFieldValueText });
        filterData[index].values.selectedValues = [...selectedValues];
      }
      else {
        const filterObj = {};
        const keys = ['fieldId', 'values', 'type', 'filterCtrl'];
        filterObj[keys[0]] = filter.fieldId;
        filterObj[keys[1]] = [filter.conditionFieldValue];
        filterObj[keys[2]] = 'DROPDOWN';
        filterObj[keys[3]] = {
          selectedValues: [{ CODE: filter.conditionFieldValue, TEXT: filter.conditionFieldValueText, FIELDNAME: filter.fieldId }],
          fldCtrl: { ...filter.fieldCtrl }
        }
        filterData.push(filterObj);
      }
    });
    return filterData
  }
}
