import { Component, EventEmitter, Inject, Input, LOCALE_ID, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FieldMetaData } from '@models/core/coreModel';
import { DropdownOption, FieldControlType, FilterCriteria } from '@models/list-page/listpage';
import { CoreService } from '@services/core/core.service';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import * as moment from 'moment';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';

@Component({
  selector: 'pros-inline-table-column-filter',
  templateUrl: './inline-table-column-filter.component.html',
  styleUrls: ['./inline-table-column-filter.component.scss']
})
export class InlineTableColumnFilterComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  fieldId: string;

  @Input()
  controlType: FieldControlType;

  @Input()
  appliedFilters: FilterCriteria[];

  @Output()
  applyFilter: EventEmitter<FilterCriteria> = new EventEmitter();

  @Output()
  resetFilter: EventEmitter<string> = new EventEmitter();

  fieldMetaData: FieldMetaData = new FieldMetaData();

  filterCriteria: FilterCriteria = new FilterCriteria();

  FieldControlType = FieldControlType;

  subscriptions: Subscription[] = [];

  filterChangeSub = new Subject<FilterCriteria>();

  dropdownOptions: DropdownOption[] = [];
  filteredOptions : BehaviorSubject<any> = new BehaviorSubject(this.dropdownOptions);

  dropSearchSub = new Subject<string>();

  searchText = '';

  dropOptionsPageIndex = 0;

  constructor(private coreService: CoreService,
    @Inject(LOCALE_ID) public locale: string) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes.fieldId && changes.fieldId.currentValue !== changes.fieldId.previousValue) {
      this.getFldMetadata(changes.fieldId.currentValue);
    }
    if(changes && changes.appliedFilters && changes.appliedFilters.currentValue) {
      const fc = this.appliedFilters.find(f => f.fieldId === this.fieldId);
      if(fc) {
        this.filterCriteria = JSON.parse(JSON.stringify(fc));
        this.filterCriteria.isUpdated = false;
      } else {
        this.filterCriteria = new FilterCriteria();
        this.filterCriteria = {...this.filterCriteria, fieldId: this.fieldId, type:'INLINE', values:[], isUpdated: false};
      }
    }
  }

  ngOnInit(): void {

    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';

    this.filterChangeSub.pipe(
      debounceTime(1000)
    ).subscribe(fc => {
      this.applyFilter.emit(fc);
    });

  }

  /**
   * Get fld metada based
   */
   getFldMetadata(fieldId: string) {
    if (!fieldId) {
      return;
    }
    const sub = this.coreService.getMetadataByFields('',0,'',20).subscribe(response => {
      if(response && response.length) {
        this.fieldMetaData = response[0];
        if([FieldControlType.SINGLE_SELECT, FieldControlType.MULTI_SELECT].includes(this.controlType)) {
          this.dropSearchSub.pipe(
            startWith(''),
            debounceTime(1000),
            distinctUntilChanged()
          ).subscribe(search => {
            this.searchText = search || '';
            this.getDropdownOptions();
          });
        }
      }
    }, error => {
      console.error(`Error : ${error.message}`);
    });
    this.subscriptions.push(sub);
  }

  /**
   * get field control type based on field metadata
   * @param fieldId field id
   * @returns control type for filter value
   */
   get fieldControlType() {
     if(this.controlType) {
       return this.controlType;
     }
    if (this.fieldMetaData) {

      if (this.fieldMetaData.picklist === '0' && this.fieldMetaData.dataType === 'CHAR') {
        return FieldControlType.TEXT;
      }

      if (this.fieldMetaData.picklist === '0' && this.fieldMetaData.dataType === 'PASS') {
        return FieldControlType.PASSWORD;
      }

      if (this.fieldMetaData.picklist === '0' && this.fieldMetaData.dataType === 'EMAIL') {
        return FieldControlType.EMAIL;
      }

      if (this.fieldMetaData.picklist === '22' && this.fieldMetaData.dataType === 'CHAR') {
        return FieldControlType.TEXT_AREA;
      }

      if (this.fieldMetaData.picklist === '0' && this.fieldMetaData.dataType === 'NUMC') {
        return FieldControlType.NUMBER;
      }

      if(['1', '30', '37'].includes(this.fieldMetaData.picklist)) {
        return this.fieldMetaData.isMultiselect === 'true' ? FieldControlType.MULTI_SELECT : FieldControlType.SINGLE_SELECT;
      }

      if(this.fieldMetaData.picklist === '0' && this.fieldMetaData.dataType === 'DATS') {
        return FieldControlType.DATE;
      }

      if(this.fieldMetaData.picklist === '0' && this.fieldMetaData.dataType === 'DTMS') {
        return FieldControlType.DATE;
      }

      if(this.fieldMetaData.picklist === '0' && this.fieldMetaData.dataType === 'TIMS') {
        return FieldControlType.TIME;
      }

    }

    return FieldControlType.TEXT;
  }

  get filterValue() {

    if (this.fieldControlType === FieldControlType.DATE) {
      const start = this.filterCriteria.startValue ? moment(+this.filterCriteria.startValue) : moment();
      const end = this.filterCriteria.endValue ? moment(+this.filterCriteria.endValue) : moment();
      return {start, end};
    }

    if (this.fieldControlType === FieldControlType.DATE_TIME) {
      const start = this.filterCriteria.startValue ? moment(+this.filterCriteria.startValue) : new Date();
      const end = this.filterCriteria.endValue ? moment(+this.filterCriteria.endValue) : new Date();
      return {start, end};
    }

    if(this.fieldControlType === FieldControlType.TIME) {
      const hours = this.filterCriteria.startValue ? moment(+this.filterCriteria.startValue).hours() : 0;
      const minutes = this.filterCriteria.startValue ? moment(+this.filterCriteria.startValue).minutes() : 0;
      return {hours, minutes};
    }

    if(this.fieldControlType === FieldControlType.SINGLE_SELECT) {
      return  this.filterCriteria.values || [];
    }

    if(this.fieldControlType === FieldControlType.MULTI_SELECT) {
      return  this.filterCriteria.values || [];
    }

    return this.filterCriteria.values ? this.filterCriteria.values.toString() : '';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

 updateFilterValue(event) {
  if(!event) {
    return;
  }

   if ([FieldControlType.TEXT, FieldControlType.EMAIL, FieldControlType.PASSWORD, FieldControlType.TEXT_AREA].includes(this.fieldControlType)) {
      this.filterCriteria.values = [event.target.value];
   } else if (this.fieldControlType === FieldControlType.NUMBER) {
     this.filterCriteria.startValue = event.min || 0;
     this.filterCriteria.endValue = event.max || 1;
   }  else if (this.fieldControlType === FieldControlType.DATE) {
      this.filterCriteria.startValue = moment(event.start).startOf('day').toDate().getTime().toString();
      this.filterCriteria.endValue = moment(event.end).endOf('day').toDate().getTime().toString();
    } else if (this.fieldControlType === FieldControlType.DATE_TIME) {
      this.filterCriteria.startValue = moment(event.start).toDate().getTime().toString();
      this.filterCriteria.endValue = moment(event.end).toDate().getTime().toString();
    } else if (this.fieldControlType === FieldControlType.TIME) {
      this.filterCriteria.startValue = moment().set({hours:event.hours, minutes: event.minutes}).toDate().getTime().toString();
      this.filterCriteria.endValue = this.filterCriteria.startValue;
  }
  this.filterChangeSub.next(this.filterCriteria);
 }


 removeDropOption(event) {
   const index = this.filterCriteria.values.findIndex(v => v === event);
   if(index !== -1) {
    this.filterCriteria.values.splice(index, 1);
   }
   this.filterChangeSub.next(this.filterCriteria);
 }

 selectDropOption(event) {
  const index = this.filterCriteria.values.findIndex(v => v === event);
  if(index === -1) {
   this.controlType === FieldControlType.SINGLE_SELECT ? this.filterCriteria.values = [event]: this.filterCriteria.values.push(event);
  }
  this.filterChangeSub.next(this.filterCriteria);
}

 getDropdownOptions(loadMore?) {
  if(loadMore) {
    this.dropOptionsPageIndex++;
  } else {
    this.dropOptionsPageIndex = 1;
  }

  const request = {searchString: this.searchText, parent: {}};

  const sub = this.coreService.getDropdownOptions(request, this.dropOptionsPageIndex, this.fieldId, this.locale.toUpperCase())
    .subscribe(options => {
      if (options && options.length) {
        if (loadMore) {
          this.dropdownOptions = this.dropdownOptions.concat(options);
        } else {
          this.dropdownOptions = options;
        }
      } else if (loadMore) {
        this.dropOptionsPageIndex--;
      }
    }, error => {
      console.error(`Error:: ${error.message}`);
    });
    this.subscriptions.push(sub);
}


}
