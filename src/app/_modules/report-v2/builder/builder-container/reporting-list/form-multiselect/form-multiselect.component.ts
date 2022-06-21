
import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ChangeDetectionStrategy, OnChanges, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Criteria, DisplayCriteria, DropDownValues, OrderWith, WidgetType } from '@modules/report/_models/widget';
import { ReportService } from '@modules/report-v2/_service/report.service';
import { WidgetService } from '@services/widgets/widget.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { isEqual } from 'lodash'
import { DiwStatus, FieldInfo } from '@modules/report-v2/_models/widget';
import { GenericWidgetComponent } from '@modules/report-v2/builder/generic-widget/generic-widget.component';

@Component({
  selector: 'pros-form-multiselect',
  templateUrl: './form-multiselect.component.html',
  styleUrls: ['./form-multiselect.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class FormMultiselectComponent extends GenericWidgetComponent implements OnInit, OnChanges, OnDestroy {
  searchAfter: any;
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

  @Input() displayCriteria: string = DisplayCriteria.TEXT;

  @Input() isTableFilter = 'false';

  /**
   * To emit value change of input to parent
   */
  @Output() valueChange = new EventEmitter<object>();

  @Input() value: DropDownValues[] = [];

  @Input() formFieldInfo: FieldInfo;

  selectedMultiSelectData = [];

  optionList: DropDownValues[] = [];

  values: DropDownValues[] = [];

  dropDownValues: DropDownValues[] = [];

  subscription: Subscription[] = [];

  @Input() isFilterWidget = false;

  /**
   * store the value of filter criteria
   */
  @Input() filterCriteria: Criteria[];

  /**
   * store is enable global filter criteria
   */
  @Input() isEnableGlobalFilter: boolean;

  /**
   * store is multiselect component called from filter sidesheet
   */
  @Input() isFilterSiderSheet: boolean;

  isLoadMore = false;

  @Input() isMenuClosed: boolean;
  /**
   * ANGULAR HOOK
   *
   */
  ngOnInit(): void {
    if (!this.control) {
      this.control = new FormControl();
    }
    this.control.valueChanges.pipe(debounceTime(500)).subscribe(res => {
      if (typeof (res) === 'string' || res === null) {
        this.getDropDownValue(res, '', true);
      }
    })
    if (this.isFilterWidget) {
      this.isFetchingData = true;
      this.getDropDownValue('', '', true);
    } else {
      this.isFilterWidget = false;
    }
  }

  emitEvtFilterCriteria(event: any): void {
    throw new Error('Method not implemented.');
  }

  /**
   * ANGULAR HOOK
   * To detect the changes from parent and update value
   * @param  changes: object contains prev and current value
   */

  ngOnChanges(changes: SimpleChanges) {
    if (changes.value && !isEqual(changes.value.previousValue, changes.value.currentValue)) {
      this.selectedMultiSelectData = [];
      if (changes.value.currentValue && changes.value.currentValue.length) {
        changes.value.currentValue.forEach(item => {
          if (typeof (item) === 'string') {
            this.selectedMultiSelectData.push({ [item]: null });
          } else {
            this.selectedMultiSelectData.push({ [item.CODE]: item.TEXT })
          }
        })
      } else {
        if (this.isTableFilter === 'true')
          this.displayMultiselectedText();
      }
    }
    if (changes.isFilterWidget && changes.isFilterWidget.previousValue !== changes.isFilterWidget.currentValue) {
      if (changes.isFilterWidget.currentValue) {
        this.getDropDownValue('', '', true);
      }
    }
    if (changes && changes.filterCriteria && changes.filterCriteria.previousValue !== undefined && !isEqual(changes.filterCriteria.previousValue, changes.filterCriteria.currentValue)) {
      if (this.widgetInfo && !this.isEnableGlobalFilter) {
        this.filterCriteria = this.filterCriteria.filter(item => item.fieldId !== '__DIW_STATUS');
        this.isFetchingData = true;
        this.getDropDownValue('', '', true);
      }
    }

    if (changes && changes.displayCriteria && changes.displayCriteria.currentValue === undefined && changes.displayCriteria.currentValue !== changes.displayCriteria.previousValue) {
      this.displayCriteria = DisplayCriteria.TEXT;
    }

    if (changes && changes.widgetId && changes.widgetId.previousValue !== changes.widgetId.currentValue) {
      this.getDropDownValue('', '', true)

    }

    if (changes && changes.isMenuClosed && changes.isMenuClosed.previousValue !== changes.isMenuClosed.currentValue && changes.isMenuClosed.previousValue !== undefined && !changes.isMenuClosed.currentValue) {
      this.control.setValue('');
    }

    if (changes && changes.formFieldInfo && changes.formFieldInfo.previousValue !== undefined && !isEqual(changes.formFieldInfo.currentValue, changes.formFieldInfo.previousValue)) {
      this.getDropDownValue('', '', true)
    }
  }

  /**
   *
   * @param searchText string to search
   */
  getDropDownValue(searchText?, searchAfter?, reset?) {
    if (this.isFilterWidget) {
      this.isFetchingData = false;
      const criteria = this.removefilter(this.widgetInfo.field, this.filterCriteria);
      const widgetData = this.widgetService.getWidgetData(String(this.widgetInfo.widgetId), criteria, searchText, searchAfter).subscribe(returnData => {
        this.formatData(returnData, reset, this.widgetInfo.field, this.widgetInfo.fieldCtrl.picklist);
      }, error => {
        this.isFetchingData = false;
        console.error(`Error : ${error}`);
      });
      this.subscription.push(widgetData);
    } else {
      if (!this.formFieldInfo?.fields) {
        return;
      }
      const sub = this.reportService.getDropDownValues(this.formFieldInfo?.widgetId, this.formFieldInfo?.fields, this.formFieldInfo?.fldMetaData?.picklist, this.formFieldInfo.displayCriteria, searchText).subscribe(returnData => {
        this.formatData(returnData, reset, this.formFieldInfo?.fields, this.formFieldInfo.fldMetaData.picklist)
        if (this.isTableFilter === 'true' && this.selectedMultiSelectData.length) {
          this.selectedMultiSelectData.forEach(item => {
            const value = Object.values(item)[0];
            if (value === null) {
              const key = Object.keys(item)[0];
              const selectedValue = this.optionList.find(el => el.CODE === key);
              item[key] = selectedValue?.TEXT;
            }
          })
          this.displayMultiselectedText();
        }
      })
      this.subscription.push(sub)
    }
  }

  /**
   * apply filter and emit the output event
   */
  applyFilter() {
    if (this.isTableFilter === 'true') {
      this.displayMultiselectedText();
    }
    const selectedDataList = this.getSelectedData();
    const response = {
      formFieldId: this.formFieldInfo?.fields || '',
      value: selectedDataList
    }
    this.valueChange.emit(response);
  }

  /**
   * Method to handle when values are selected from multi select drop down
   * @param fieldId field id of the column
   * @param key key of the selected option
   * @param value value of the selected option
   */
  selectionChangeHandler(key: string, value: string) {
    if (this.selectedMultiSelectData) {
      const index = this.selectedMultiSelectData.findIndex(item => {
        const selectedKey = Object.keys(item)[0];
        return selectedKey === key;
      });
      if (index > -1) {
        this.selectedMultiSelectData.splice(index, 1);
      }
      else {
        this.selectedMultiSelectData.push({ [key]: value });
      }
    } else {
      this.selectedMultiSelectData = [{ [key]: value }];
    }

  }

  /**
   * check that whether checkbox is checked or not
   * @param code value of the checkbox
   * @returns return checked property of option
   */
  isChecked(code: string): boolean {
    if (Object.keys(this.selectedMultiSelectData).length === 0) {
      return false;
    }
    if (this.selectedMultiSelectData && this.selectedMultiSelectData) {
      const index = this.selectedMultiSelectData.findIndex(item => {
        return Object.keys(item)[0] === code;
      });
      if (index > -1) {
        return true;
      }
    }
  }

  /**
   *
   * @param option value of dropDown option
   * @returns returns the string to display on check box label
   */
  getLabel(option) {
    if (this.displayCriteria === 'CODE_TEXT') {
      return option.CODE + '-' + option.TEXT
    } else if (this.displayCriteria === 'CODE') {
      return option.CODE;
    } else {
      return option.TEXT;
    }
  }

  /**
   * display the selected text
   */
  displayMultiselectedText() {
    const inputWrapper = document.getElementById(this.formFieldInfo?.fields);
    const textWrapper = document.getElementById('input-' + this.formFieldInfo?.fields);
    textWrapper.innerHTML = '';
    const selectedValues = [];
    let additionalLength = 0;
    this.selectedMultiSelectData.forEach(item => {
      const value = Object.values(item)[0];
      const code = Object.keys(item)[0];
      const previousText = textWrapper.innerHTML;
      if (inputWrapper.offsetWidth - textWrapper.offsetWidth > 50) {
        if (this.displayCriteria === DisplayCriteria.CODE) {
          textWrapper.innerHTML = textWrapper.innerHTML + code + ';';
        } else if (this.displayCriteria === DisplayCriteria.CODE_TEXT) {
          textWrapper.innerHTML = textWrapper.innerHTML + code + '-' + value + ';'
        } else {
          textWrapper.innerHTML = textWrapper.innerHTML + value + ';';
        }
        selectedValues.push(value);
      }
      if (inputWrapper.offsetWidth - textWrapper.offsetWidth < 0) {
        textWrapper.innerHTML = previousText;
        selectedValues.pop();
      }
    })
    additionalLength = this.selectedMultiSelectData.length - selectedValues.length;
    const additionalCount = document.getElementById('additional-' + this.formFieldInfo?.fields);
    if (additionalCount) {
      additionalCount.innerHTML = '';
    }
    if (additionalLength) {
      additionalCount.innerHTML = ' +' + additionalLength;
    }
  }

  /**
   * Angular Hook
   */
  ngOnDestroy() {
    this.subscription.forEach(sub => {
      sub.unsubscribe();
    })
  }

  getSelectedData(): DropDownValues[] {
    const selectedDataList = []
    this.selectedMultiSelectData.forEach(el => {
      const code = Object.keys(el)[0];
      const data = { CODE: code, TEXT: el[code] };
      selectedDataList.push(data);
    })
    return selectedDataList;
  }

  setFilteredOptions(reset) {
    if (reset) {
      this.optionList = this.sortDropdownData(this.values);
    } else {
      let finalData = []
      const optionList = new Set(this.values.map(item => item.CODE));
      const filteredData = this.optionList.filter(item => !optionList.has(item.CODE))
      finalData = [...this.values, ...filteredData] as DropDownValues[];
      const sortedData = this.sortDropdownData(finalData);
      this.optionList = [...sortedData];
    }
    /**
     * If diw dataset and widget is filter auto set values
     */
     if (this.isFilterWidget && this.widgetInfo.widgetType === 'FILTER' && this.widgetInfo.datasetType === 'diw_dataset'){
      this.setFilterDropdownValues();
    }
  }

  /**
   * Get enum of Diwstatus and auto fill options
   */
   setFilterDropdownValues(){
    Object.keys(DiwStatus).forEach((key , i) => {
      const statusOption : DropDownValues = {
        sno : i,
        FIELDNAME : '',
        TEXT : DiwStatus[key],
        CODE : key,
        display : '',
        langu : 'en'
      }
      this.optionList.push(statusOption);
    });
  }

  /* Sort dropdownn Data */
  sortDropdownData(values: DropDownValues[]): DropDownValues[] {
    const sortBy = this.widgetInfo ? this.widgetInfo.orderWith : 'desc';
    if (this.displayCriteria === DisplayCriteria.TEXT) {
      if (sortBy === OrderWith.DESC) {
        values?.sort((a, b) => { return b?.TEXT.localeCompare(a?.TEXT); });
      } else if (sortBy === OrderWith.ASC) {
        values?.sort((a, b) => { return a?.TEXT.localeCompare(b?.TEXT); });
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
        })
      }
    }
    return values;
  }
  getFieldsMetadaDesc(buckets: any[], fieldId: string, reset: boolean, picklist: string) {
    const finalVal = {} as any;
    buckets.forEach(bucket => {
      const key = bucket.key.FILTER;
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
      } if (fieldId === 'OVERDUE' || fieldId === 'FORWARDENABLED' || fieldId === 'TIME_TAKEN' || picklist === '35') {
        finalVal[key] = this.getFields(fieldId, key);
      }
    });
    Object.keys(finalVal).forEach(key => {
      // if (this.widgetInfo.fieldCtrl.dataType === 'NUMC' || this.widgetInfo.fieldCtrl.dataType === 'DEC') {
      //   finalVal[key] = formatNumber(finalVal[key], 'en-US');
      // }
      const valOld = this.values.filter(fill => fill.CODE === key);
      if (valOld.length > 0) {
        const index = this.values.indexOf(valOld[0]);
        valOld[0].TEXT = finalVal[key];
        valOld[0].CODE = key;
        this.values[index] = valOld[0];
      }
    });

    this.setFilteredOptions(reset);
  }

  updateObjRefDescription(buckets: any[], fieldId: string, reset) {
    let locale = this.locale !== '' ? this.locale.split('-')[0] : 'EN';
    locale = locale.toUpperCase();
    const finalVal = {} as any;
    buckets.forEach(bucket => {
      const key = bucket.key.FILTER;
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
      }
    });

    Object.keys(finalVal).forEach(key => {
      // if (this.widgetInfo.fieldCtrl.dataType === 'NUMC' || this.widgetInfo.fieldCtrl.dataType === 'DEC') {
      //   finalVal[key] = formatNumber(finalVal[key], 'en-US');
      // }
      const valOld = this.values.filter(fill => fill.CODE === key);
      if (valOld.length > 0) {
        const index = this.values.indexOf(valOld[0]);
        valOld[0].TEXT = finalVal[key];
        valOld[0].CODE = key;
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
        if (codeValue === '1' || codeValue === 'y') {
          finalValue = 'Yes';
        }
        if (codeValue === '0' || codeValue === 'n') {
          finalValue = 'No';
        }
        break;

      default:
        if (codeValue === 'off') {
          finalValue = 'False'
        }
        if (codeValue === 'on') {
          finalValue = 'True'
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
      const searchString = typeof (this.control.value) === 'string' ? this.control.value : '';
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
    const updatedFilterCriteria = filterCriteria.filter(fill => (fill.fieldId === fieldId && fill.widgetType !== WidgetType.FILTER) || (fill.fieldId !== fieldId));
    return updatedFilterCriteria;
  }

  /**
   * returns the formated data
   * @param returnData holds the data that we need to modify
   * @param reset holds the boolean value
   * @param fieldId holds the field Id
   * @param picklist holds the picklist for that field
   */
  formatData(returnData: any, reset: boolean, fieldId: string, picklist: string) {
    const res = Object.keys(returnData.aggregations);
    let buckets = returnData.aggregations[res[0]] ? returnData.aggregations[res[0]].buckets : [];
    if(!buckets || !buckets.length){
      buckets = returnData.aggregations[res[0]]['composite#bucket'] ? returnData.aggregations[res[0]]['composite#bucket'].buckets : [];
    }
    if (buckets && buckets.length === 10) {
      this.searchAfter = returnData.aggregations['composite#bucket'] ? returnData.aggregations['composite#bucket'].after_key.FILTER : returnData.aggregations['nested#nested_tags'] && returnData.aggregations['nested#nested_tags']['composite#bucket'] ? returnData.aggregations['nested#nested_tags']['composite#bucket'].after_key.FILTER : '';
      this.isLoadMore = true;
    } else {
      this.isLoadMore = false;
    }
    const metadatas: DropDownValues[] = [];
    buckets.forEach(bucket => {
      const hits = bucket['top_hits#items'] ? bucket['top_hits#items'].hits.hits[0] : null;
      const val = hits._source.hdvs ? (hits._source.hdvs[fieldId] ?
        (hits._source.hdvs[fieldId] ? hits._source.hdvs[fieldId].vc : null) : null) :
        (hits._source.staticFields && hits._source.staticFields[fieldId]) ?
          (hits._source.staticFields[fieldId] ? hits._source.staticFields[fieldId].vc : null) :
          ( hits._source[fieldId] ? hits._source[fieldId].vc : null);
      let code = bucket.key.FILTER;
      if (val && val[0] && val[0].c) {
        code = val[0].c;
      }
      const metaData = { CODE: code, FIELDNAME: fieldId, TEXT: bucket.key.FILTER, display: this.displayCriteria } as DropDownValues;
      metadatas.push(metaData);
    });
    // this.values = metadatas;
    this.values = this.filterMetadataByEmptyValues(metadatas, fieldId);

    if (picklist === '1' || picklist === '37' || picklist === '38') {
      this.getFieldsMetadaDesc(buckets, fieldId, reset, picklist);
    } else if (picklist === '30') {
      this.updateObjRefDescription(buckets, fieldId, reset);
    } else {
      this.setFilteredOptions(reset);
    }
  }

  onFocus() {
    this.control.setValue('');
    this.getDropDownValue('', '', true);
  }
}
