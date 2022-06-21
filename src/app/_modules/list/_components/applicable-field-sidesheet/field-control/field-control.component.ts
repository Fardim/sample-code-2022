import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatSelectChange } from '@angular/material/select';
import { DATE_FILTERS_METADATA, FieldControlType, FilterFieldModel } from '@models/list-page/listpage';
import { FieldSelectOption } from '@modules/flow/_model/flow';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { SchemaService } from '@services/home/schema.service';
import { TransientService } from 'mdo-ui-library';
import { isEqual } from 'lodash';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'pros-field-control',
  templateUrl: './field-control.component.html',
  styleUrls: ['./field-control.component.scss']
})
export class FieldControlComponent implements OnChanges, OnInit, OnDestroy {
  control: FormControl = new FormControl('');
  @Input() fieldObj: FilterFieldModel;
  @Output() updateFilterObjValue: EventEmitter<FilterFieldModel> = new EventEmitter<FilterFieldModel>();
  FieldControlType = FieldControlType;
  rulelist = [
    { label: 'Is', value: 'EQUAL' },
    { label: 'Is not', value: 'NOT_EQUAL' },
  ];
  dropdownValues: FieldSelectOption[] = [];
  filteredDropdownValues: FieldSelectOption[] = [];
  DATE_FILTERS_METADATA = DATE_FILTERS_METADATA;
  dateFilterOptions: any[] = [];
  searchString: string;
  limit: number = 2;
  subscription: Subscription;
  fileUploadFormCtrl: FormControl = new FormControl();
  constructor(private schemaService: SchemaService, private sharedService: SharedServiceService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.fieldObj && !isEqual(changes.fieldObj.previousValue, changes.fieldObj.currentValue)) {
      this.fieldObj = changes.fieldObj.currentValue;
      this.fieldObj.restrictedVal = this.fieldObj.restrictedVal || [];

      if(this.getFieldControlType===FieldControlType.HTML) {
        this.control.patchValue(this.fieldObj.values[0]);
      }
    }
    if (this.getFieldControlType === FieldControlType.RADIO || this.getFieldControlType === FieldControlType.CHECKBOX ||this.getFieldControlType === FieldControlType.MULTI_SELECT) {
      this.getFilterFieldOptions();
    }
    if (this.getFieldControlType === FieldControlType.GRID) {
      this.fieldObj.fieldCtrl.permissions = {
        addRow: true,
        editRow: true,
        removeRow: true,
        removeMultipleRow: true,
        copyRow: true,
        export: true,
        import: true,
        sortOrder: "ASC"
      }
    }
  }

  ngOnInit() {
   this.subscription = this.sharedService.getTransactionGridFormValue().subscribe(data => {
      this.fieldObj = {
        ...this.fieldObj, fieldCtrl: {
          ...this.fieldObj.fieldCtrl,
          grid: this.fieldObj.fieldCtrl.grid.map(item => {
            if (item.picklist === '15') {
              item = {...item};
            } else if (data[item.fieldId]) {
              item.values = data[item.fieldId];
            }
            return item;
          })
        }
      }
    });
    if (this.getFieldControlType === FieldControlType.ATTACHMENT) {
      this.fileUploadFormCtrl.valueChanges.subscribe(data => {
        this.fieldObj.values = data;
      });
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Get filters: radio/checkbox fields options data
   */
  getFilterFieldOptions() {
    const { moduleId, fieldId } = this.fieldObj;
    this.schemaService.getFieldDropValues(moduleId, fieldId, '')
      .subscribe(
        (response) => {
          this.dropdownValues = response.map(obj => {
            return {
              key: obj.CODE,
              value: obj.TEXT
            }
          });
          this.filteredDropdownValues = this.dropdownValues;
          if (this.searchString)
            this.filterOptionSearch(this.searchString, 'key', false);
        },
        (error) => {
          console.error(`Error : ${error.message}`);
        }
      );
  }
  /**
   * get filter value based on field metadata
   * @returns any
   */
  get getFilterValue() {
    let retVal = '';

    if (this.getFieldControlType === FieldControlType.DATE) {
      if (this.fieldObj.values.length > 0)
        return moment(+this.fieldObj.values[0]).toDate();
    }else if(this.getFieldControlType===FieldControlType.HTML){
      return this.fieldObj.values[0];

    } else if (this.getFieldControlType === FieldControlType.SINGLE_SELECT) {
      const valObj = this.dropdownValues.find((option) => option.key === this.fieldObj.values.toString());
      if (valObj) {
        retVal = valObj.value;
      }
      return retVal;
    }  else if (this.getFieldControlType === FieldControlType.MULTI_SELECT) {
      const valObj = this.dropdownValues.find((option) => option.key === this.fieldObj.values.toString());
      if (valObj) {
        retVal = valObj.value;
      }
      return retVal;
    } else if (this.getFieldControlType === FieldControlType.TIME) {
      // const startHour = moment(+(this.fieldObj.startValue || 0)).hours();
      // const startMinutes = moment(+(this.fieldObj.startValue || 0)).minutes() || 0;
      // let endHour = moment(+(this.fieldObj.endValue || 1)).hours() || 0;
      // let endMinutes = moment(+(this.fieldObj.endValue || 0)).minutes() || 0;
      // if (startHour >= endHour) {
      //   endHour = startHour;
      //   endMinutes = endMinutes >= startMinutes ? endMinutes : startMinutes;
      // }
      // return { startHour, startMinutes, endHour, endMinutes };
      // this.selectedTimeRange = (() => {
      // const formatDate = (dt) => {
      //   const hm = dt ? dt.split(':') : [];
      //   return hm.length ? {
      //     hours: +hm[0],
      //     minutes: +hm[1],
      //   } : {
      //     hours: 0,
      //     minutes: 0
      //   };
      // }
      // return {
      //   start: formatDate(this.fieldObj?.startValue),
      //   end: formatDate(this.fieldObj?.endValue)
      // }
      // })();


      // const time = value.split(',');
      // if(time.length > 1) {

      // }
      // }
      if (this.fieldObj?.startValue && this.fieldObj?.endValue) {
        // const start = new Date(Number(this.fieldObj?.startValue));
        // const end = new Date(Number(this.fieldObj?.endValue));
        // return {
        //   start: {
        //     hours: start.getHours(),
        //     minutes: start.getMinutes()
        //   },
        //   end: {
        //     hours: end.getHours(),
        //     minutes: end.getMinutes()
        //   },
        // };

        return {
          start: this.fieldObj.startValue,
          end: this.fieldObj.endValue
        }
      } else {
        return {
          start: {
            hours: 0,
            minutes: 0
          },
          end: {
            hours: 0,
            minutes: 0
          },
        };
      }
    } else if (this.getFieldControlType === FieldControlType.DATE_TIME) {
      if (this.fieldObj.values.length > 0)
        return new Date(this.fieldObj.values[0]);

      return null;
    }

    return this.fieldObj.values ? this.fieldObj.values.toString() : '';
  }

  getValueByKey(keyName: string): string {
    return this.fieldObj[keyName];
  }

  get defaultFilteredDropdownValues() {
    return this.dropdownValues.filter(item => this.fieldObj.restrictedVal?.indexOf(item.key) === -1);
  }

  get restrictedFilteredDropdownValues() {
    return Array.isArray(this.fieldObj.restrictedVal) && this.fieldObj.restrictedVal.length > 0 ? this.dropdownValues.filter(item => this.fieldObj.restrictedVal.indexOf(item.key) >= 0) : this.dropdownValues;
  }
  /**
   * get field control type based on field metadata
   * @param fieldObj field object
   * @returns control type for filter value
   */
  get getFieldControlType(): FieldControlType {
    const field = this.fieldObj;
    if (field) {
      if (field.picklist === '0' && field.dataType === 'PASS') {
        return FieldControlType.PASSWORD;
      } else if (field.picklist === '0' && field.dataType === 'EMAIL') {
        return FieldControlType.EMAIL;
      } else if (field.picklist === '31' && field.dataType === 'CHAR') {
        return FieldControlType.HTML;
      } else if (field.picklist === '22' && field.dataType === 'CHAR') {
        return FieldControlType.TEXT_AREA;
      } else if (field.picklist === '0' && field.dataType === 'NUMC') {
        return FieldControlType.NUMBER;
      } else if (['4'].includes(field.picklist) && field.dataType === 'CHAR') {
        return FieldControlType.RADIO;
      } else if (['2'].includes(field.picklist) && field.dataType === 'CHAR') {
        return FieldControlType.CHECKBOX;
      } else if ((['1', '30', '37'].includes(field.picklist) && field.dataType === 'CHAR')) {
        return FieldControlType.MULTI_SELECT;
      } else if ((['38'].includes(field.picklist) && field.dataType === 'CHAR')) {
        return FieldControlType.ATTACHMENT;
      } else if ((field.picklist === '0' && field.dataType === 'DATS') || (['52', '53'].includes(field.picklist) && field.dataType === 'NUMC')) {
        return FieldControlType.DATE;
      } else if (['0', '54'].includes(field.picklist) && field.dataType === 'TIMS') {
        return FieldControlType.TIME;
      } else if (field.picklist === '53') {
        return FieldControlType.DATE_TIME;
      } else if (field.picklist === '15') {
        return FieldControlType.GRID;
      }
      return FieldControlType.TEXT;
    }
  }

  /**
   * update filter value
   * @param event new value
   * @returns void
   */
  updateValue(event, keyName?: string, isSelected?: boolean): void {
    const filtercontrolType = this.getFieldControlType;
    const emitObj = {
      fieldId: this.fieldObj.fieldId,
      filterType: this.fieldObj.filterType,
      values: [],
      startValue: '0',
      endValue: '0',
      operator: this.fieldObj.operator,
      restrictedVal: this.fieldObj.restrictedVal,
      // serchString: this.fieldObj.serchString,
      showSelected: false,
      selectAll: false,
      unit: this.fieldObj.unit
    }
    if (
      [FieldControlType.TEXT, FieldControlType.EMAIL, FieldControlType.PASSWORD, FieldControlType.TEXT_AREA].includes(filtercontrolType)
    ) {
      emitObj.values = [event];
    } else if (filtercontrolType === FieldControlType.NUMBER) {
      emitObj.startValue = event.min || '0';
      emitObj.endValue = event.max || '1';
      emitObj.values = [event];
    } else if (filtercontrolType === FieldControlType.SINGLE_SELECT) {
      emitObj.values = !keyName ? [(event as MatSelectChange).value] : this.fieldObj.values;
      if (keyName) { emitObj[keyName] = event; }
    } else if (filtercontrolType === FieldControlType.MULTI_SELECT) {
      emitObj.values = !keyName ? [(event as MatAutocompleteSelectedEvent).option.value] : this.fieldObj.values;
      if (keyName) { emitObj[keyName] = (event as MatAutocompleteSelectedEvent).option.value; }
    } else if (filtercontrolType === FieldControlType.DATE && event !== "") {
      emitObj.values = [moment(event).startOf('day').toDate().getTime().toString()];
    } else if (filtercontrolType === FieldControlType.TIME) {
      emitObj.startValue = event.start;
      emitObj.endValue = event.end;
    } else if (filtercontrolType === FieldControlType.DATE_TIME && event) {
      emitObj.values = [moment(event).valueOf()];
    } else if(filtercontrolType === FieldControlType.HTML){
      emitObj.values = event;
    }
    this.updateFilterObjValue.emit(emitObj);
  }

  getSelectedValueLabel(value: string, optionsList: any[]): string {
    return optionsList.find((option) => option?.value === value)?.key || '';
  }

  updateRestrictedValue(e: MatAutocompleteSelectedEvent) {
    this.fieldObj.restrictedVal = e.option.value ? [...this.fieldObj.restrictedVal, e.option.value] : [...this.fieldObj.restrictedVal];
    if(this.fieldObj.restrictedVal.length === 0)
      this.fieldObj.restrictedVal =[]
    const emitObj = {
      fieldId: this.fieldObj?.fieldId,
      filterType: this.fieldObj?.filterType,
      values: this.fieldObj?.values || [],
      startValue: '0',
      endValue: '0',
      operator: this.fieldObj?.operator,
      restrictedVal: this.fieldObj?.restrictedVal,
      showSelected: false,
      selectAll: false,
      unit: this.fieldObj?.unit
    }
  }

  /**
   * Search single/mutli select option
   * @param searchString filter search string
   * @param objectKey object key
   * @param keyEvent key event
   */
  filterOptionSearch(searchString: string, objectKey: string, keyEvent: boolean, selectAll?: boolean): void {
    let dropValues = this.dropdownValues.filter(dropValObj => this.fieldObj.values.includes(dropValObj.key));
    this.filteredDropdownValues = dropValues.filter(valObj => valObj[objectKey].toLowerCase().includes(searchString.toLowerCase()));

    if (selectAll && !keyEvent) {
      const values = this.filteredDropdownValues.map(dropObj => dropObj.key);
      this.updateValue(values, '', true);
    }

    if(!searchString)
    this.updateValue({option:{value:''}},'',true);
    // this.fieldObj.selectAll = this.isAllSelected;
  }

  onSelectDeselect(checkedVal: boolean) {
    // this.fieldObj.selectAll = checkedVal;
    if (checkedVal) {
      this.filterOptionSearch(this.searchString, 'key', false, true);
    } else {
      this.updateValue([], '', true);
    }
  }

  onToggleChange(toggleVal: boolean): void {
    this.fieldObj.showSelected = toggleVal;
    this.filterOptionSearch(this.searchString, 'key', false);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  get isAllSelected(): boolean {
    const numSelected = this.fieldObj.values.length;
    const numRows = this.dropdownValues.length;
    return numSelected === numRows;
  }

  hasLimit(): boolean {
    return this.fieldObj.restrictedVal.length > this.limit
  }

  removeValue(value: string, defaultinput: HTMLInputElement) {
    const index = this.fieldObj.restrictedVal.findIndex((v) => v === value);
    if (index !== -1) {
      this.fieldObj.restrictedVal.splice(index, 1);
      this.updateRestrictedValue({option:{value:''}} as MatAutocompleteSelectedEvent);
    }
  }

  displayWithFn(value: any) {
    return value?.key  || value?.value;
  }

  get existedValues() {
    if (this.fieldObj.restrictedVal?.length && this.dropdownValues?.length) {
      return this.dropdownValues.filter(item => this.fieldObj.restrictedVal.indexOf(item.key) >= 0);
    } else {
      return [];
    }
  }
}
