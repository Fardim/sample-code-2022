
import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, SimpleChanges, ChangeDetectorRef, OnChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Criteria, DisplayCriteria, DropDownValues, FieldInfo, OrderWith, WidgetType } from '@modules/report-v2/_models/widget';
import { ReportService } from '@modules/report-v2/_service/report.service';
import { WidgetService } from '@services/widgets/widget.service';
import * as moment from 'moment';
import { BehaviorSubject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { GenericWidgetComponent } from '@modules/report-v2/builder/generic-widget/generic-widget.component';

@Component({
  selector: 'pros-form-radio-button-group',
  templateUrl: './form-radio-button-group.component.html',
  styleUrls: ['./form-radio-button-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class FormRadioButtonGroupComponent extends GenericWidgetComponent implements OnInit, OnChanges {

  constructor(private reportService: ReportService, private widgetService: WidgetService, private changeDetectorRef: ChangeDetectorRef) {
    super();
  }
  searchAfter: any;
  isLoadMore: boolean;
  locale: string;

  /**
   * Define an indiviual form control
   */
  @Input() control: FormControl;

  /**
   * Getting placeholder from parent
   */
  @Input() placeholder: string;

  @Input() displayCriteria: string;

  @Input() isTableFilter: string;
  /**
   * To emit value change of input to parent
   */
  @Output() valueChange = new EventEmitter<object>();

  @Input() formFieldInfo: FieldInfo;

  @Input() value: any;

  optionList: any[] = [];

  subscription: Subscription[] = [];
  fltrCtrl: FormControl = new FormControl();

  appliedFltrCtrl: FormControl = new FormControl();

  isBtnClickedEvnt: BehaviorSubject<string> = new BehaviorSubject(null);

  previousSelectedValue: string;

  @Input() isFilterWidget = false;

  @Input() isEnableGlobalFilter: boolean;

  @Input() isFilterSiderSheet = false;

  values: DropDownValues[] = [];

  @Input() isMenuClosed: boolean;
  emitEvtFilterCriteria(event: any): void {
    throw new Error('Method not implemented.');
  }
  /**
   * ANGULAR HOOK
   *
   */
  ngOnInit(): void {
    if (!this.control) {
      this.control = new FormControl();
    }
    this.fltrCtrl.valueChanges.pipe(debounceTime(500)).subscribe(res => {
      this.getDropDownValue(res, '', true);
    })

    if (this.control.value) {
      this.appliedFltrCtrl.setValue(this.control.value.value);
      this.previousSelectedValue = this.control.value.value;
    }

    this.isBtnClickedEvnt.subscribe(res => {
      if (res) {
        this.appliedFltrCtrl.setValue(res);
      }
    })

    if (this.isFilterWidget) {
      this.isFetchingData = true;
      this.getDropDownValue('', '', true);
    } else {
      this.isFilterWidget = false;
    }

    if (this.isFilterWidget && this.value) {
      this.control.setValue(this.value.CODE);
    }
  }

  /**
   * ANGULAR HOOK
   * To detect the changes from parent and update value
   * @param  changes: object contains prev and current value
   */

  ngOnChanges(changes: SimpleChanges) {
    if (changes.formFieldInfo && changes.formFieldInfo.previousValue !== undefined && !isEqual(changes.formFieldInfo.previousValue, changes.formFieldInfo.currentValue)) {
      this.getDropDownValue('', '', true);
    }

    if (changes.control && changes.control.previousValue !== undefined && changes.control.previousValue.value !== changes.control.currentValue.value) {
      this.control.setValue(changes.controls.currentValue);
    }
    if (changes.value && changes.value.previousValue !== changes.value.currentValue && changes.value.previousValue !== undefined) {
      if (!this.isFilterWidget) {
        const selectedValue = this.optionList.find(item => item.value === this.control.value);
        if (selectedValue) {
          this.appliedFltrCtrl.setValue(selectedValue.key);
        } else {
          this.appliedFltrCtrl.reset();
        }
      }
      else {
        // const selectedValue = this.optionList.find(item => item.value === changes.value.currentValue?.CODE);
        if (changes.value.currentValue) {
          this.control.setValue(changes.value.currentValue.CODE);
        } else {
          this.control.reset();
        }
      }
    }

    if (changes && changes.widgetId && changes.widgetId.previousValue !== undefined && changes.widgetId.currentValue !== changes.widgetId.previousValue) {
      this.getDropDownValue('', '', true);
    }

    if (changes && changes.filterCriteria && changes.filterCriteria.previousValue !== undefined) {
      if (this.widgetInfo && !this.isEnableGlobalFilter) {
        this.filterCriteria = this.filterCriteria.filter(item => item.fieldId !== '__DIW_STATUS');
        this.isFetchingData = true;
        this.getDropDownValue('', '', true);
      }
    }

    if (changes && changes.isMenuClosed && changes.isMenuClosed.previousValue !== changes.isMenuClosed.currentValue && changes.isMenuClosed.previousValue !== undefined && !changes.isMenuClosed.currentValue) {
      this.control.setValue('');
    }
  }

  /**
   * should load the data when user scroll the filter value
   */
  onScroll() {
    if (this.isLoadMore) {
      const searchString = typeof (this.control.value) === 'string' ? this.control.value : '';
      this.getDropDownValue(searchString, this.searchAfter);
    }
  }


  getDropDownValue(searchText?: string, searchAfter?: string, reset?: boolean): string | boolean | void {
    if (this.isFilterWidget) {
      const criteria = this.removefilter(this.widgetInfo.field, this.filterCriteria);
      const widgetData = this.widgetService.getWidgetData(String(this.widgetInfo.widgetId), criteria, searchText, searchAfter).subscribe(returnData => {
        this.isFetchingData = false;
        this.formatData(returnData, reset, this.widgetInfo.field, this.widgetInfo.fieldCtrl.picklist)
      }, error => {
        this.isFetchingData = false;
        console.error(`Error : ${error}`);
      });
      this.subscription.push(widgetData);
    }
    else {
      const sub = this.reportService.getRadioButtonValues(this.formFieldInfo.widgetId, this.formFieldInfo.fields, searchText, this.formFieldInfo.fldMetaData.picklist, this.formFieldInfo.displayCriteria).subscribe(returnData => {
        this.formatData(returnData, reset, this.formFieldInfo.fields, this.formFieldInfo.fldMetaData.picklist)
        console.log(this.optionList);
      })
      this.subscription.push(sub);
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
    const updatedFilterCriteria = filterCriteria.filter(fill => (fill.fieldId === fieldId && fill.widgetType !== WidgetType.FILTER) || (fill.fieldId !== fieldId));
    return updatedFilterCriteria;
  }

  getFieldsMetadaDesc(buckets: any[], fieldId: string, reset: boolean, picklist: string) {
    const finalVal = {} as any;
    buckets.forEach(bucket => {
      const key = (bucket.key.FILTER !== null && bucket.key.FILTER !== undefined) ? bucket.key.FILTER : bucket.key;
      const hits = bucket['top_hits#items'] ? bucket['top_hits#items'].hits.hits[0] : null;
      const val = hits._source.hdvs ? (hits._source.hdvs[fieldId] ?
        (hits._source.hdvs[fieldId] ? hits._source.hdvs[fieldId].vc : null) : null) :
        (hits._source.staticFields && hits._source.staticFields[fieldId]) ?
          (hits._source.staticFields[fieldId] ? hits._source.staticFields[fieldId].vc : null) :
          ( hits._source[fieldId] ? hits._source[fieldId].vc : null);
      if (val) {
        const valArray = [];
        val.forEach(v => {
          if (v.t) {
            valArray.push(v.t);
          } else {
            valArray.push(v.c);
          }
        });
        const finalText = valArray.toString();
        if (finalText) {
          finalVal[key] = finalText
        } else {
          finalVal[key] = key;
        }
      } else {
        finalVal[key] = key;
      } if (picklist === '35') {
        finalVal[key] = this.getFields(fieldId, key);
      }
    });
    const formatedValue = [];
    Object.keys(finalVal).forEach((key: any) => {
      // if (this.widgetInfo.fieldCtrl.dataType === 'NUMC' || this.widgetInfo.fieldCtrl.dataType === 'DEC') {
      //   finalVal[key] = formatNumber(finalVal[key], 'en-US');
      // }
      const valOld = this.values.filter(fill => fill.CODE.toLowerCase() === key.toLowerCase());
      if (valOld.length > 0) {
        const index = formatedValue.findIndex(fill => finalVal[key] === fill.TEXT);
        if (index === -1) {
          valOld[0].TEXT = finalVal[key];
          valOld[0].FIELDNAME = fieldId;
          if (!valOld[0].CODE) {
            valOld[0].CODE = 'off';
          }
          formatedValue.push(valOld[0]);
        }
      }
    });
    this.values = [...formatedValue];

    this.setFilteredOptions(reset);
  }

  setFilteredOptions(reset) {
    /* Sort dropdown data bases on sorting criteria */
    const values = this.values.map(item => {
      return {
        value: item.CODE,
        key: this.displayCriteria && this.displayCriteria === 'CODE' ? item.CODE : (this.displayCriteria === 'CODE_TEXT' ? item.CODE + '-' + item.TEXT : item.TEXT)
      }
    });
    if (reset) {
      this.optionList = this.sortDropdownData(values);
    } else {
      let finalData = []
      const optionList = new Set(values.map(item => item.value));
      const filteredData = this.optionList.filter(item => !optionList.has(item.CODE))
      finalData = [...values, ...filteredData] as DropDownValues[]
      const sortedData = this.sortDropdownData(finalData);
      this.optionList = [...sortedData];
    }

    console.log('optionList===', this.optionList)
  }

  /* Sort dropdownn Data */
  sortDropdownData(values: any) {
    const sortBy = this.widgetInfo?.orderWith || 'desc';
    if (this.displayCriteria === DisplayCriteria.TEXT) {
      if (sortBy === OrderWith.DESC) {
        values?.sort((a, b) => { return b?.key.localeCompare(a?.key); });
      } else if (sortBy === OrderWith.ASC) {
        values?.sort((a, b) => { return a?.key.localeCompare(b?.key); });
      }
    } else if (this.displayCriteria === DisplayCriteria.CODE || this.displayCriteria === DisplayCriteria.CODE_TEXT) {
      if (sortBy === OrderWith.DESC) {
        values?.sort((a, b) => {
          if (isNaN(parseInt(a.value, 10))) {
            return b?.value?.localeCompare(a?.value);
          } else {
            return parseInt(b.value, 10) - parseInt(a?.value, 10);
          }
        });
      } else if (sortBy === OrderWith.ASC) {
        values?.sort((a, b) => {
          if (isNaN(parseInt(a.value, 10))) {
            return a?.value?.localeCompare(b?.value);
          } else {
            return parseInt(a.value, 10) - parseInt(b?.value, 10);
          }
        })
      }
    }
    return values;
  }

  // updateObjRefDescription(buckets: any[], fieldId: string, reset) {
  //   let locale = this.locale !== '' ? this.locale.split('-')[0] : 'EN';
  //   locale = locale.toUpperCase();
  //   const finalVal = {} as any;
  //   buckets.forEach(bucket => {
  //     const key = bucket.key.FILTER;
  //     const hits = bucket['top_hits#items'] ? bucket['top_hits#items'].hits.hits[0] : null;
  //     const val = hits._source.hdvs ? (hits._source.hdvs[fieldId] ?
  //       (hits._source.hdvs[fieldId] ? hits._source.hdvs[fieldId].vc : null) : null) :
  //       (hits._source.staticFields && hits._source.staticFields[fieldId]) ?
  //         (hits._source.staticFields[fieldId] ? hits._source.staticFields[fieldId].vc : null) : null;
  //     if (val) {
  //       const valArray = [];
  //       val.forEach(v => {
  //         if (v.t) {
  //           valArray.push(v.t);
  //         }
  //       });
  //       const finalText = valArray.toString();
  //       if (finalText) {
  //         finalVal[key] = finalText
  //       } else {
  //         finalVal[key] = key;
  //       }
  //     } else {
  //       finalVal[key] = key;
  //     }
  //   });

  //   Object.keys(finalVal).forEach(key => {
  //     if (this.widgetInfo.fieldCtrl.dataType === 'NUMC' || this.widgetInfo.fieldCtrl.dataType === 'DEC') {
  //       finalVal[key] = formatNumber(finalVal[key], 'en-US');
  //     }
  //     const valOld = this.values.filter(fill => fill.CODE === key);
  //     if (valOld.length > 0) {
  //       const index = this.values.indexOf(valOld[0]);
  //       valOld[0].TEXT = finalVal[key];
  //       valOld[0].FIELDNAME = fieldId;
  //       this.values[index] = valOld[0];
  //     }
  //   });

  //   this.setFilteredOptions(reset);
  // }

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
        if (codeValue === '1' || codeValue === 'y') {
          finalValue = 'Yes';
        }
        if (codeValue === '0' || codeValue === 'n') {
          finalValue = 'No';
        }
        break;

      default:
        if (codeValue.toLowerCase() === 'off' || codeValue.toLowerCase() === 'x' || codeValue.toLowerCase() === '') {
          finalValue = 'False'
        }
        if (codeValue.toLowerCase() === 'on') {
          finalValue = 'True'
        }
        break;
    }
    return finalValue;
  }

  applyFilter(event?) {
    if (this.isFilterSiderSheet) {
      this.control.setValue(event);
    }
    const selectedValue = this.optionList.find(item => item.value === this.control.value);
    const response = {
      formFieldId: this.formFieldInfo?.fields || '',
      value: { CODE: selectedValue.value, TEXT: selectedValue.key }
    }
    this.control.setValue(selectedValue.value);
    this.isBtnClickedEvnt.next(selectedValue.key);
    this.previousSelectedValue = selectedValue.key;
    this.valueChange.emit(response);
  }

  /**
   * return the formated data
   * @param returnData holds the array that we need to format
   * @param reset holds boolean value
   * @param fieldId holds the field id of fieldCtrl
   * @param picklist holds the picklist for field
   */
  formatData(returnData: any, reset: boolean, fieldId: string, picklist: string) {
    const res = Object.keys(returnData.aggregations);
    let buckets = returnData.aggregations[res[0]] ? returnData.aggregations[res[0]].buckets : [];
    if(!buckets || !buckets.length){
      buckets = returnData.aggregations[res[0]]['composite#bucket']? returnData.aggregations[res[0]]['composite#bucket'].buckets : [];
    }
    if (buckets && buckets.length === 10) {
      this.searchAfter = returnData.aggregations['composite#bucket'] ? returnData.aggregations['composite#bucket'].after_key.FILTER : returnData.aggregations['nested#nested_tags'] && returnData.aggregations['nested#nested_tags']['composite#bucket'] ? returnData.aggregations['nested#nested_tags']['composite#bucket'].after_key.FILTER : '' ;
      this.isLoadMore = true;
    } else {
      this.isLoadMore = false;
    }
    // if (this.filterWidget.getValue().metaData && (this.filterWidget.getValue().metaData.picklist === '1' || this.filterWidget.getValue().metaData.picklist === '30' || this.filterWidget.getValue().metaData.picklist === '37' || this.filterWidget.getValue().metaData.picklist === '4' || this.filterWidget.getValue().metaData.picklist === '38' || this.filterWidget.getValue().metaData.picklist === '35')) {
    const metadatas: DropDownValues[] = [];
    buckets.forEach(bucket => {
      const hits = bucket['top_hits#items'] ? bucket['top_hits#items'].hits.hits[0] : null;
      const val = hits._source.hdvs ? (hits._source.hdvs[fieldId] ?
        (hits._source.hdvs[fieldId] ? hits._source.hdvs[fieldId].vc : null) : null) :
        (hits._source.staticFields && hits._source.staticFields[fieldId]) ?
          (hits._source.staticFields[fieldId] ? hits._source.staticFields[fieldId].vc : null) :
          (hits._source[fieldId] ? hits._source[fieldId].vc : null);
      let code = (bucket.key.FILTER !== null && bucket.key.FILTER !== undefined) ? bucket.key.FILTER : bucket.key;
      if (val && val[0] && val[0].c) {
        code = val[0].c;
      }
      const text = (bucket.key.FILTER !== null && bucket.key.FILTER !== undefined) ? bucket.key.FILTER : bucket.key
      const metaData = { CODE: code, FIELDNAME: fieldId, TEXT: text, display: this.displayCriteria } as DropDownValues;
      metadatas.push(metaData);
    });
    this.values = metadatas;
    if (picklist === '4' || picklist === '35') {
      this.getFieldsMetadaDesc(buckets, fieldId, reset, picklist);
    }
  }

  /**
   * method called when we click on div of radio button
   */
  onFocus() {
    this.fltrCtrl.setValue('');
    this.getDropDownValue('', '', true);
  }
}
