import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GenericWidgetComponent } from '@modules/report-v2/builder/generic-widget/generic-widget.component';
import { Criteria, DisplayCriteria, DropDownValues, OrderWith, WidgetType, DiwStatus } from '@modules/report-v2/_models/widget';
import { ReportService } from '@modules/report-v2/_service/report.service';
import { WidgetService } from '@services/widgets/widget.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { debounceTime, startWith } from 'rxjs/operators';
import { isEqual } from 'lodash';

@Component({
  selector: 'pros-form-single-select',
  templateUrl: './form-single-select.component.html',
  styleUrls: ['./form-single-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class FormSingleSelectComponent extends GenericWidgetComponent implements OnInit, OnChanges {
  searchAfter: any;
  isLoadMore: boolean;
  locale: string;

  constructor(private reportService: ReportService, private widgetService: WidgetService) {
    super();
  }

  /**
   * Define an indiviual form control
   */
  @Input() control: FormControl;

  /**
   * Getting placeholder from parent
   */
  @Input() placeholder: string;

  /**
   * Getting value from parent
   */
  @Input() value: string;

  /**
   * Getting label from parent
   */
  @Input() label: string;

  /**
   * To emit value change of input to parent
   */
  @Output() valueChange = new EventEmitter<object>();

  /**
   * holds the form field meta data info
   */
  @Input() formFieldInfo: any;

  @Input() displayCriteria: string;

  @Input() isTableFilter: string;

  optionList: DropDownValues[] = [];

  values: DropDownValues[] = [];

  subscription: Subscription[] = [];

  @Input() isFilterWidget = false;

  @Input() isEnableGlobalFilter: boolean;

  @Input() isFilterSiderSheet = false;

  @Input() isMenuClosed: boolean;
  /**
   * ANGULAR HOOK
   *
   */
  ngOnInit(): void {
    if (!this.control) {
      this.control = new FormControl();
      if (this.value) {
        this.control.setValue(this.value);
      }
    }
    // for searching
    this.control.valueChanges.pipe(debounceTime(500)).subscribe((res) => {
      if (typeof res === 'string' && (this.isTableFilter || this.isFilterWidget)) {
        if((this.widgetInfo && this.widgetInfo.field === 'TIME_TAKEN') || (this.formFieldInfo && this.formFieldInfo.fields === 'TIME_TAKEN')) {
          const totalMili = this.responseToMilisecond(res);
          this.getDropDownValue(totalMili, '', true);
        } else {
          this.getDropDownValue(res, '', true);
        }
      }
    });

    if (this.isFilterWidget) {
      this.isFetchingData = true;
      this.getDropDownValue('', '', true);
    } else {
      this.isFilterWidget = false;
    }
  }

  /**
   * Get enum of Diwstatus and auto fill options
   */
  setFilterDropdownValues(searchText) {
    Object.keys(DiwStatus).forEach((key, i) => {
      const statusOption: DropDownValues = {
        sno: i,
        FIELDNAME: '',
        TEXT: DiwStatus[key],
        CODE: key,
        display: '',
        langu: 'en',
      };
      this.optionList.push(statusOption);
    });

    /* Sort Dropdown Data */
    this.optionList = this.sortDropdownData(this.optionList);

    // if search string available filter
    if(searchText && searchText !== '') {
    this.optionList = this.optionList.filter((o) => {
        if (this.displayCriteria === DisplayCriteria.TEXT) {
          return o.TEXT.toLowerCase().indexOf(searchText.toLowerCase()) > -1
        } else {
          return o.CODE.toLowerCase().indexOf(searchText.toLowerCase()) > -1
        }
      })
    }
  }

  /**
   * ANGULAR HOOK
   * To detect the changes from parent and update value
   * @param  changes: object contains prev and current value
   */

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.widgetInfo.previousValue !== undefined && changes.widgetInfo.previousValue !== changes.widgetInfo.currentValue) {
      this.widgetInfo = changes.widgetInfo.currentValue;
      this.getDropDownValue('', '', true);
      const value = this.optionList.find((el) => el.CODE === changes.value.currentValue);
      if (value && !this.isFilterWidget) {
        this.control.patchValue(value);
      } else {
        this.control.setValue(this.value);
      }

      if (this.isFilterSiderSheet) {
        this.control.patchValue(changes.value.currentValue);
      }
    }
    if (
      changes.displayCriteria &&
      changes.displayCriteria.previousValue !== undefined &&
      changes.displayCriteria.previousValue !== changes.displayCriteria.currentValue
    ) {
      this.displayCriteria = changes.displayCriteria.currentValue;
      this.control.patchValue(this.control.value);
    }

    if (
      changes.formFieldInfo &&
      changes.formFieldInfo.previousValue !== undefined &&
      changes.formFieldInfo.currentValue &&
      !isEqual(changes.formFieldInfo.previousValue, changes.formFieldInfo.currentValue)
    ) {
      this.optionList = [];
      this.isFetchingData = true;
      // this.getDropDownValue('', '', true);
    }

    if (changes && changes.filterCriteria && changes.filterCriteria.previousValue !== undefined) {
      if (this.widgetInfo && !this.isEnableGlobalFilter) {
        this.filterCriteria = this.filterCriteria.filter((item) => item.fieldId !== '__DIW_STATUS');
        this.isFetchingData = true;
        // this.getDropDownValue('', '', true);
      }
    }
    if (
      changes &&
      changes.isMenuClosed &&
      changes.isMenuClosed.previousValue !== changes.isMenuClosed.currentValue &&
      changes.isMenuClosed.previousValue !== undefined &&
      !changes.isMenuClosed.currentValue
    ) {
      this.control.setValue('');
    }

    if (changes.widgetInfo && changes.widgetInfo.currentValue && changes.widgetInfo.previousValue !== changes.widgetInfo.currentValue) {
      this.optionList = [];
      this.isFetchingData = true;
      // this.getDropDownValue('', '', true);
    }
    if (changes?.control &&  changes.control.previousValue !== changes.control.currentValue && !this.isTableFilter) {
      this.control = changes?.control?.currentValue || new FormControl('');
      this.control.valueChanges.pipe(startWith(''),debounceTime(500)).subscribe((res) => {
        if (typeof res === 'string') {
          if(this.widgetInfo && this.widgetInfo.field === 'TIME_TAKEN') {
            const totalMili = this.responseToMilisecond(res);
            this.getDropDownValue(totalMili, '', true);
          } else {
            this.getDropDownValue(res, '', true);
          }
        }
      });
    }
  }

  emitEvtFilterCriteria(): void {
    throw new Error('Method not implemented.');
  }

  getDropDownValue(searchText?, searchAfter?, reset?): string | boolean | void {
    if (this.isFilterWidget) {
      const criteria = this.removefilter(this.widgetInfo.field, this.filterCriteria);
      /**
       * If diw dataset and widget is filter auto set values
       */
      if (this.widgetInfo.datasetType === 'diw_dataset') {
        this.optionList = [];
        this.setFilterDropdownValues(searchText);
        return;
      }
      const widgetData = this.widgetService.getWidgetData(String(this.widgetInfo.widgetId), criteria, searchText, searchAfter).subscribe(
        (returnData) => {
          this.isFetchingData = false;
          this.formatData(returnData, this.widgetInfo.field, this.widgetInfo.fieldCtrl.picklist, reset);
        },
        (error) => {
          this.isFetchingData = false;
          console.error(`Error : ${error}`);
        }
      );
      this.subscription.push(widgetData);
    } else {
      if (!this.formFieldInfo.fields) {
        return;
      }
      const sub = this.reportService
        .getDropDownValues(
          this.formFieldInfo.widgetId,
          this.formFieldInfo.fields,
          this.formFieldInfo.fldMetaData.picklist,
          this.formFieldInfo.displayCriteria,
          searchText
        )
        .subscribe((res) => {
          this.isFetchingData = false;
          this.formatData(res, this.formFieldInfo.fields, this.formFieldInfo.fldMetaData.picklist, reset);
        },
        (error) => {
          this.isFetchingData = false;
          console.error(`Error : ${error}`);
        });
      this.subscription.push(sub);
    }
  }

  selectSingleDropDownValue(value) {
    const response = {
      formFieldId: this.formFieldInfo?.fields || '',
      value: value ? value : this.control.value,
    };
    if (this.isFilterWidget && !this.isFilterSiderSheet) {
      this.control.reset();
    }
    this.valueChange.emit(response);
  }

  getDisplayText(option) {

    if (option) {
      if (this.displayCriteria === 'CODE_TEXT') {
        return option.CODE + '--' + option.TEXT;
      } else if (this.displayCriteria === 'CODE') {
        return option.CODE;
      } else {
        return option.TEXT;
      }
    } else {
      return '';
    }
  }

  setFilteredOptions(reset) {
    /* Sort dropdown data bases on sorting criteria */
    if (reset) {
      this.optionList = this.sortDropdownData(this.values);
    } else {
      let finalData = [];
      const optionList = new Set(this.values.map((item) => item.CODE));
      const filteredData = this.optionList.filter((item) => !optionList.has(item.CODE));
      finalData = [...this.values, ...filteredData] as DropDownValues[];
      const sortedData = this.sortDropdownData(finalData);
      this.optionList = [...sortedData];
    }
  }

  /* Sort dropdownn Data */
  sortDropdownData(values: DropDownValues[]) {
    const sortBy = this.widgetInfo ? this.widgetInfo.orderWith : 'desc';
    if (this.displayCriteria === DisplayCriteria.TEXT) {
      if (sortBy === OrderWith.DESC) {
        values?.sort((a, b) => {
          return b?.TEXT.localeCompare(a?.TEXT);
        });
      } else if (sortBy === OrderWith.ASC) {
        values?.sort((a, b) => {
          return a?.TEXT.localeCompare(b?.TEXT);
        });
      }
    } else if (this.displayCriteria === DisplayCriteria.CODE || this.displayCriteria === DisplayCriteria.CODE_TEXT) {
      if (sortBy === OrderWith.DESC) {
        values?.sort((a, b) => {
          if (isNaN(parseInt(a.CODE, 10))) {
            return b?.CODE?.localeCompare(a?.CODE);
          } else {
            return parseInt(b.CODE, 10) - parseInt(a?.CODE, 10);
          }
        });
      } else if (sortBy === OrderWith.ASC) {
        values?.sort((a, b) => {
          if (isNaN(parseInt(a.CODE, 10))) {
            return a?.CODE?.localeCompare(b?.CODE);
          } else {
            return parseInt(a.CODE, 10) - parseInt(b?.CODE, 10);
          }
        });
      }
    }
    return values;
  }
  getFieldsMetadaDesc(buckets: any[], fieldId: string, reset, picklist: string) {
    const finalVal = {} as any;
    buckets.forEach((bucket) => {
      const key = bucket.key.FILTER;
      const hits = bucket['top_hits#items'] ? bucket['top_hits#items'].hits.hits[0] : null;
      const val = hits._source.hdvs
        ? hits._source.hdvs[fieldId]
          ? hits._source.hdvs[fieldId]
            ? hits._source.hdvs[fieldId].vc
            : null
          : null
        : hits._source.staticFields && hits._source.staticFields[fieldId]
        ? hits._source.staticFields[fieldId]
          ? hits._source.staticFields[fieldId].vc
          : null
        : hits._source[fieldId]
        ? hits._source[fieldId].vc
        : null;
      if (val) {
        const valArray = [];
        val.forEach((v) => {
          if (v.t) {
            valArray.push(v.t);
          }
        });
        const finalText = valArray.toString();
        if (finalText) {
          finalVal[key] = finalText;
        } else {
          finalVal[key] = key;
        }
      } else {
        finalVal[key] = key;
      }
      if (fieldId === 'OVERDUE' || fieldId === 'FORWARDENABLED' || fieldId === 'TIME_TAKEN' || fieldId === 'CLAIMED' || picklist === '35') {
        finalVal[key] = this.getFields(fieldId, key);
      }
    });
    Object.keys(finalVal).forEach((key) => {
      // if (this.widgetInfo.fieldCtrl.dataType === 'NUMC' || this.widgetInfo.fieldCtrl.dataType === 'DEC') {
      //   finalVal[key] = formatNumber(finalVal[key], 'en-US');
      // }
      const valOld = this.values.filter((fill) => fill.CODE === key);
      if (valOld.length > 0) {
        const index = this.values.indexOf(valOld[0]);
        valOld[0].TEXT = finalVal[key];
        valOld[0].FIELDNAME = fieldId;
        this.values[index] = valOld[0];
      }
    });

    this.setFilteredOptions(reset);
  }

  updateObjRefDescription(buckets: any[], fieldId: string, reset) {
    let locale = this.locale !== '' ? this.locale.split('-')[0] : 'EN';
    locale = locale.toUpperCase();
    const finalVal = {} as any;
    buckets.forEach((bucket) => {
      const key = bucket.key.FILTER;
      const hits = bucket['top_hits#items'] ? bucket['top_hits#items'].hits.hits[0] : null;
      const val = hits._source.hdvs
        ? hits._source.hdvs[fieldId]
          ? hits._source.hdvs[fieldId]
            ? hits._source.hdvs[fieldId].vc
            : null
          : null
        : hits._source.staticFields && hits._source.staticFields[fieldId]
        ? hits._source.staticFields[fieldId]
          ? hits._source.staticFields[fieldId].vc
          : null
        : hits._source[fieldId]
        ? hits._source[fieldId].vc
        : null;
      if (val) {
        const valArray = [];
        val.forEach((v) => {
          if (v.t) {
            valArray.push(v.t);
          }
        });
        const finalText = valArray.toString();
        if (finalText) {
          finalVal[key] = finalText;
        } else {
          finalVal[key] = key;
        }
      } else {
        finalVal[key] = key;
      }
    });

    Object.keys(finalVal).forEach((key) => {
      // if (this.widgetInfo.fieldCtrl.dataType === 'NUMC' || this.widgetInfo.fieldCtrl.dataType === 'DEC') {
      //   finalVal[key] = formatNumber(finalVal[key], 'en-US');
      // }
      const valOld = this.values.filter((fill) => fill.CODE === key);
      if (valOld.length > 0) {
        const index = this.values.indexOf(valOld[0]);
        valOld[0].TEXT = finalVal[key];
        valOld[0].FIELDNAME = fieldId;
        this.values[index] = valOld[0];
      }
    });

    this.setFilteredOptions(reset);
  }


  getFields(fieldId, codeValue): string {
    let finalValue = '';
    switch (fieldId) {
      case 'TIME_TAKEN':
        const days = moment.duration(Number(codeValue), 'minutes').days();
        const hours = moment.duration(Number(codeValue), 'minutes').hours();
        const minutes = moment.duration(Number(codeValue), 'minutes').minutes();
        const timeString = `${days > 0 ? days + ' d ' : ''}${hours > 0 ? hours + ' h ' : ''}${minutes > 0 ? minutes + ' m ' : ''}`;
        finalValue = timeString ? timeString : '0 m';
        break;

      case 'FORWARDENABLED':
      case 'OVERDUE':
      case 'CLAIMED':
        if (codeValue === '1' || codeValue === 'y') {
          finalValue = 'Yes';
        }
        if (codeValue === '0' || codeValue === 'n') {
          finalValue = 'No';
        }
        break;

      default:
        if (codeValue === 'off') {
          finalValue = 'False';
        }
        if (codeValue === 'on') {
          finalValue = 'True';
        }
        break;
    }
    return finalValue;
  }


  /**
   * should load the data when user scroll the filter value
   */
  onScroll() {
    if (this.isLoadMore) {
      const searchString = typeof this.control.value === 'string' ? this.control.value : '';
      this.getDropDownValue(searchString, this.searchAfter);
    }
  }

  /**
   * Removed the existing filter criteria for filtered data
   * @param fieldId fieldId of the field
   * @param filterCriteria applied filter criteria
   * @returns filter criteria list excluding the existing filter criteria on that widget
   */
  removefilter(fieldId: string, filterCriteria: Criteria[]): Criteria[] {
    if (!filterCriteria) {
      return [];
    }
    const updatedFilterCriteria = filterCriteria.filter(
      (fill) => (fill.fieldId === fieldId && fill.widgetType !== WidgetType.FILTER) || fill.fieldId !== fieldId
    );
    return updatedFilterCriteria;
  }

  /**
   * return the formated data for drop down values
   * @param returnData holds the data for filter
   */
  formatData(returnData: any, fieldId: string, picklist: string, reset: boolean) {
    const res = Object.keys(returnData.aggregations);
    let buckets = returnData.aggregations[res[0]] ? returnData.aggregations[res[0]].buckets : [];
    if (!buckets || !buckets.length) {
      buckets = returnData.aggregations[res[0]]['composite#bucket'] ? returnData.aggregations[res[0]]['composite#bucket'].buckets : [];
    }
    if (buckets && buckets.length === 10) {
      this.searchAfter = returnData.aggregations['composite#bucket']
        ? returnData.aggregations['composite#bucket'].after_key.FILTER
        : returnData.aggregations['nested#nested_tags'] && returnData.aggregations['nested#nested_tags']['composite#bucket']
        ? returnData.aggregations['nested#nested_tags']['composite#bucket'].after_key.FILTER
        : '';
      this.isLoadMore = true;
    } else {
      this.isLoadMore = false;
    }
    // if (this.filterWidget.getValue().metaData && (this.filterWidget.getValue().metaData.picklist === '1' || this.filterWidget.getValue().metaData.picklist === '30' || this.filterWidget.getValue().metaData.picklist === '37' || this.filterWidget.getValue().metaData.picklist === '4' || this.filterWidget.getValue().metaData.picklist === '38' || this.filterWidget.getValue().metaData.picklist === '35')) {
    const metadatas: DropDownValues[] = [];
    buckets.forEach((bucket) => {
      const hits = bucket['top_hits#items'] ? bucket['top_hits#items'].hits.hits[0] : null;
      const val = hits._source.hdvs
        ? hits._source.hdvs[fieldId]
          ? hits._source.hdvs[fieldId]
            ? hits._source.hdvs[fieldId].vc
            : null
          : null
        : hits._source.staticFields && hits._source.staticFields[fieldId]
        ? hits._source.staticFields[fieldId]
          ? hits._source.staticFields[fieldId].vc
          : null
        : hits._source[fieldId]
        ? hits._source[fieldId].vc
        : null;
      let code = bucket.key.FILTER;
      if (val && val[0] && val[0].c) {
        code = val[0].c;
      }
      const metaData = { CODE: code, FIELDNAME: fieldId, TEXT: fieldId ==='TIME_TAKEN'? this.getFields('TIME_TAKEN', bucket.key.FILTER): bucket.key.FILTER, display: this.displayCriteria } as DropDownValues;
      metadatas.push(metaData);
    });
    this.values = this.filterMetadataByEmptyValues(metadatas, fieldId);
    if (picklist === '1' || picklist === '37') {
      this.getFieldsMetadaDesc(buckets, fieldId, reset, picklist);
    } else if (picklist === '30') {
      this.updateObjRefDescription(buckets, fieldId, reset);
    } else {
      this.setFilteredOptions(reset);
    }
  }

  onFocus() {
    if (!this.control.value && this.isTableFilter) {
      this.optionList = [];
      this.isFetchingData = true;
      this.getDropDownValue('', '', true)
    }
  }

  /**
   * method to convert searcstring to milisecond for 'TIME_TAKEN' field
   * @param res searchstring
   */
  responseToMilisecond(res) {
    let totalMili = 0;
    const value = res.split(' ');
    value.forEach((item,index) => {
      if(item === 'd') {
        totalMili += value[index-1] ? Number(value[index-1]) * (24*60*60*1000) : 0
      }
      if(item === 'h') {
        totalMili += value[index-1] ? Number(value[index-1]) * (60*60*1000) : 0
      }
      if(item === 'm') {
        totalMili += value[index-1] ? Number(value[index-1]) * (60*1000) : 0
      }
      if(item === 's') {
      totalMili += value[index-1] ? Number(value[index-1]) * (1000) : 0
      }
    })
    return totalMili;
  }
}
