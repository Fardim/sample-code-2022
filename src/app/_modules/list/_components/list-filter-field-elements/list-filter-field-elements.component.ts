import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldMetaData } from '@models/core/coreModel';
import { DATE_FILTERS_METADATA, FieldControlType, FilterCriteria, ListPageFilters } from '@models/list-page/listpage';
import { SchemaService } from '@services/home/schema.service';
import { isEqual } from 'lodash';
import * as moment from 'moment';
import { ENTER } from '@angular/cdk/keycodes';
import { SelectionModel } from '@angular/cdk/collections';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'pros-list-filter-field-elements',
  templateUrl: './list-filter-field-elements.component.html',
  styleUrls: ['./list-filter-field-elements.component.scss'],
})
export class ListFilterFieldElementsComponent implements OnInit, OnChanges {
  @Input() moduleId;

  FieldControlType = FieldControlType;

  control = new FormControl();


  /**
   * fields metatdata
   */
  @Input() moduleFieldsMetatdata: FieldMetaData[] = [];

  @Input() filterFieldsMetadata: FieldMetaData[] = [];

  @Input() filterList: ListPageFilters = new ListPageFilters();

  @Input() selectedCurrentFilter: FilterCriteria;

  currentFilter;

  rulelist = [
    { label: 'Is', value: 'EQUAL' },
    { label: 'Is not', value: 'NOT_EQUAL' },
  ];

  filteredDropdownValues: any[] = [];

  dropdownOptionList: any[] = [];

  DATE_FILTERS_METADATA = DATE_FILTERS_METADATA;

  dateFilterOptions: any[] = [];

  @Output() valueChanged = new EventEmitter();

  @Input() showRuleToggled = false;

  selectedInputValues = [];

  searchTearm = '';

  selection = new SelectionModel<any>(true, []);

  isSelectedEnable = false;

  /**
   * holds control for multiple choice filter search
   */
  dropdownSearchCtrl: FormControl = new FormControl('');

  /**
   * holds date range value
   */
  dateRangeValue: { start: Date; end: Date } = { start: null, end: null };
  dateValue: Date;

  dateFilterData = {
    dateRange: { start: null, end: null },
    dateValue: { start: null },
  };

  dateFilterUpdated = false;

  selectedList: string = 'day';

  constructor(private schemaService: SchemaService) {}

  ngOnInit(): void {
    this.currentFilter = { ...this.selectedCurrentFilter };
    if (this.currentFilter.fieldType === 'date') {
      this.dateFilterUpdated = true;
    }
    this.upsertFilter(this.currentFilter.fieldId);
    this.checkDropdownSearchChanges();
  }

  checkDropdownSearchChanges() {
    this.dropdownSearchCtrl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe((val) => {
      if (val) {
        this.isSelectedEnable = false;
      }
      this.getFilterFieldOptions(this.currentFilter.fieldId, val, 'search');
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(!isEqual(changes.selectedCurrentFilter.currentValue,changes.selectedCurrentFilter.previousValue)){
      if (changes.selectedCurrentFilter && changes.selectedCurrentFilter.currentValue ) {
        this.selectedCurrentFilter = changes.selectedCurrentFilter.currentValue;
        this.currentFilter = { ...this.selectedCurrentFilter };
        this.dateFilterUpdated = (this.currentFilter.fieldType === 'date');
        this.selection.clear();
      }

      if (this.currentFilter.type === 'INLINE') {
        this.setFilterValues(this.currentFilter);
      }
      if (!this.dateFilterUpdated) {
        this.upsertFilter(this.currentFilter.fieldId);
      }
      if (changes.filterList && changes.filterList.currentValue) {
        this.filterList = changes.filterList.currentValue;
      }
    }
  }

  setFilterValues(selectedFilter: FilterCriteria) {
    if (this.moduleFieldsMetatdata.length) {
      this.moduleFieldsMetatdata.forEach(data => {
        if (data.fieldId === selectedFilter.fieldId) {
          selectedFilter.fieldType = this.getFieldControlType(selectedFilter.fieldId);
          selectedFilter.type = this.getFieldControlType(selectedFilter.fieldId);
          selectedFilter.esFieldPath = `hdvs.${selectedFilter.fieldId}`;
          selectedFilter.operator = 'EQUAL';
          const index = this.filterList.filterCriteria.findIndex((f) => f.fieldId === selectedFilter.fieldId);
          this.filterList.filterCriteria[index] = {...this.currentFilter};
        }
      })
    }
  }

  ruleChange() {
    this.emitValueChanges({ ruleChange: this.currentFilter.operator, fieldId: this.currentFilter.fieldId });
  }

  /**
   * edit filter details on field click
   * @param fieldId clicked field id
   */
  upsertFilter(fieldId) {
    const selectedFilter = this.filterList.filterCriteria.find((f) => f.fieldId === fieldId);
    if (selectedFilter && selectedFilter?.type !== 'INLINE') {
      const currentFilterType = this.getFieldControlType(fieldId);
      if (currentFilterType === FieldControlType.DATE) {
        if (!['static_date', 'static_range'].includes(this.currentFilter.unit)) {
          this.dateFilterOptions = this.DATE_FILTERS_METADATA.find((metadata) =>
            metadata.options.some((op) => op.value === this.currentFilter.unit)
          ).options.map((option) => {
            return { key: option.value, value: option.value };
          });
        }
        this.setDateFilterValue();
      } else if (currentFilterType === FieldControlType.TEXT && selectedFilter.values.length) {
        this.selectedInputValues = selectedFilter.values.length > 1 ? [...selectedFilter.values] : selectedFilter.values[0].split(',');
      }
    } else {
      if (this.getFieldControlType(fieldId) === FieldControlType.DATE) {
        this.dateFilterOptions = this.DATE_FILTERS_METADATA[0].options.map((option) => {
          return { key: option.value, value: option.value };
        });
        this.currentFilter.unit = this.dateFilterOptions[0].value;
      }
    }

    if (this.getFieldControlType(fieldId) === FieldControlType.MULTI_SELECT) {
      this.getFilterFieldOptions(fieldId,'','intial');
    }
    /*
    * for load default first filter
    */
    this.dateFilterSelected(DATE_FILTERS_METADATA[0]);
  }

  setDateFilterValue() {
    if (this.currentFilter.unit === 'static_date') {
      this.dateFilterData.dateValue = {
        start: this.currentFilter.startValue,
      };
      this.getFilterValue(this.currentFilter);
      return;
    } else if (this.currentFilter.unit === 'static_range') {
      this.dateFilterData.dateRange = {
        start: this.currentFilter.startValue,
        end: this.currentFilter.endValue,
      };
      this.getFilterValue(this.currentFilter);
      return;
    }
  }

  checkSelectedValue() {
    if (this.currentFilter.type === 'INLINE') {
      this.currentFilter.values = [this.selection.selected.toString()];
      this.emitValueChanges({ currentFilterValues: this.currentFilter.values, fieldId: this.currentFilter.fieldId, type: 'inline-updated' });
    } else {
      this.updateFilterValue();
    }
  }

  dateChanged(ev) {
    if (ev) {
      const date = new Date(ev);
      const startOfDay = moment(date).startOf('day').toDate().getTime();
      this.dateFilterData.dateValue.start = date.getHours() === 0 ? String(startOfDay) : String(date.getTime());
    }
    this.getFilterValue(this.currentFilter);
  }

  dateRangeChanged(ev) {
    if (ev && ev.start) {
      const date = new Date(ev.start);
      const startOfDay = moment(date).startOf('day').toDate().getTime();
      this.dateFilterData.dateRange.start = date.getHours() === 0 ? String(startOfDay) : String(date.getTime());
    }
    if (ev && ev.end) {
      const date = new Date(ev.end);
      const endOfDay = moment(date).endOf('day').toDate().getTime();
      this.dateFilterData.dateRange.end = date.getHours() === 0 ? String(endOfDay) : String(date.getTime());
    }
    this.getFilterValue(this.currentFilter);
  }

  /**
   * update filter value
   * @param event new value
   * @returns void
   */
  updateFilterValue(event?: any, isAllOptionSelected = false) {
    const filtercontrolType = this.getFieldControlType(this.currentFilter.fieldId);
    if (
      [FieldControlType.NUMBER, FieldControlType.EMAIL, FieldControlType.PASSWORD, FieldControlType.TEXT_AREA].includes(filtercontrolType)
    ) {
      this.currentFilter.values = [event];
      this.emitValueChanges({ currentFilterValues: this.currentFilter.values, fieldId: this.currentFilter.fieldId });
      return;
    } else if (filtercontrolType === FieldControlType.TEXT) {
      this.currentFilter.values = event;
      this.emitValueChanges({ currentFilterValues: this.currentFilter.values, fieldId: this.currentFilter.fieldId });
      return;
    } else if (filtercontrolType === FieldControlType.MULTI_SELECT) {
      const selectedValues = this.selection.selected.join(',');
      this.currentFilter.values = [selectedValues];
      this.emitValueChanges({ currentFilterValues: this.currentFilter.values, fieldId: this.currentFilter.fieldId });
      return;
    } else if (filtercontrolType === FieldControlType.DATE) {
      if (this.currentFilter.unit === 'static_date') {
        const date = new Date(event);
        const startOfDay = moment(date).startOf('day').toDate().getTime();
        this.currentFilter.startValue = date.getHours() === 0 ? String(startOfDay) : String(date.getTime());
      } else if (this.currentFilter.unit === 'static_range') {
        if (event && event.start) {
          const date = new Date(event.start);
          const startOfDay = moment(date).startOf('day').toDate().getTime();
          this.currentFilter.startValue = date.getHours() === 0 ? String(startOfDay) : String(date.getTime());
        }
        if (event && event.end) {
          const date = new Date(event.end);
          const endOfDay = moment(date).endOf('day').toDate().getTime();
          this.currentFilter.endValue = date.getHours() === 0 ? String(endOfDay) : String(date.getTime());
        }
      } else {
        this.currentFilter.unit = event;
      }
      this.emitValueChanges({ currentFilter: this.currentFilter, filterType: FieldControlType.DATE });
      return;
    }

    this.currentFilter.values = [event];
    this.emitValueChanges({ currentFilterValues: this.currentFilter.values, fieldId: this.currentFilter.fieldId });
  }

  emitValueChanges(emittedValue) {
    this.valueChanged.emit(emittedValue);
    this.valueChanged.emit(null);
  }

  timefilterChange(value, from) {
    switch (from) {
      case 'startHour':
        this.currentFilter.startValue = moment(+(this.currentFilter.startValue || 0))
          .set('hour', value)
          .toDate()
          .getTime()
          .toString(); //
        break;
      case 'startMinutes':
        this.currentFilter.startValue = moment(+(this.currentFilter.startValue || 0))
          .set('minute', value)
          .toDate()
          .getTime()
          .toString();
        break;
      case 'endHour':
        this.currentFilter.endValue = moment(+(this.currentFilter.endValue || 0))
          .set('hour', value)
          .toDate()
          .getTime()
          .toString();
        break;
      case 'endMinutes':
        this.currentFilter.endValue = moment(+(this.currentFilter.endValue || 0))
          .set('minute', value)
          .toDate()
          .getTime()
          .toString();
        break;
    }

    this.emitValueChanges({ currentFilter: this.currentFilter, filterType: FieldControlType.TIME });
  }

  /**
   * Get filters: radio/checkbox fields options data
   */
  getFilterFieldOptions(fieldId: string, value?: string, type = 'intial') {
    const searchString = value ? value : '';
    this.schemaService.getFieldDropValues(this.moduleId, fieldId, searchString).subscribe(
      (response) => {
        this.filteredDropdownValues = response.map((obj) => {
          return {
            key: obj.CODE,
            value: obj.TEXT ?? obj.CODE,
          };
        });
        this.dropdownOptionList = [...this.filteredDropdownValues];
        this.setMultiSelectedOptions(type);
      },
      (error) => {
        console.error(`Error : ${error.message}`);
      }
    );
  }


  removeStringValue(list, value) {
    const separator = ',';
    const values = list.split(separator);
    for(let i = 0 ; i < values.length ; i++) {
      if(values[i] === value) {
        values.splice(i, 1);
        return values.join(separator);
      }
    }
    return list;
  }

  setMultiSelectedOptions(type) {
    if (type === 'search') {
      const data = this.getDropdownSelectedList();
      this.selection.select(...data);
    } else {
      if (this.currentFilter.values.length > 0) {
        const currentFilterValues = this.currentFilter.values[0].split(',');
        const selectedListOption = this.filteredDropdownValues.filter((o1) => currentFilterValues.some((o2) => (o1.value.toLowerCase() === o2.toLowerCase() || o1.key.toLowerCase() === o2.toLowerCase()))).map(data => data.value);
        this.selection.select(...selectedListOption);

        if (this.currentFilter.type === 'INLINE') {
          if (this.selection.selected.length > 0) {
            this.currentFilter.values = this.selection.selected;
          }
          this.emitValueChanges({ currentFilterValues: this.currentFilter.values, fieldId: this.currentFilter.fieldId, type:'inline-updated' });
        }
      }
    }
  }

  onMultiSelectToggle(event) {
    this.isSelectedEnable = event;
    this.filteredDropdownValues = event ? this.getDropdownSelectedList() : this.dropdownOptionList.slice();
  }

  getDropdownSelectedList() {
    if (this.isSelectedEnable) {
      return this.filteredDropdownValues.filter((o1) => this.selection.selected.some((o2) => (o1.value.toLowerCase() === o2.toLowerCase() || o1.key.toLowerCase() === o2.toLowerCase())));
    } else {
      return this.dropdownOptionList.filter((o1) => this.selection.selected.some((o2) => (o1.value.toLowerCase() === o2.toLowerCase() || o1.key.toLowerCase() === o2.toLowerCase())));
    }
  }

  dateFilterSelected(filterMetadata) {
    /*
    * for add class for slected active list item
    */
    this.selectedList = filterMetadata?.label;

    this.dateFilterOptions = filterMetadata.options.map((op) => {
      return { key: op.value, value: op.value };
    });
    if (['static_date', 'static_range'].includes(filterMetadata.category)) {
      this.currentFilter.unit = filterMetadata.category;

      if (filterMetadata.category === 'static_date') {
        this.dateRangeValue = { start: null, end: null };
      } else if (filterMetadata.category === 'static_range') {
        this.dateValue = null;
      }
      this.getFilterValue(this.currentFilter);
    } else {
      this.currentFilter.unit = this.dateFilterOptions[0].value;
      this.dateValue = null;
      this.dateRangeValue = { start: null, end: null };
    }
    this.emitValueChanges({ currentFilter: this.currentFilter, filterType: FieldControlType.DATE });
  }

  /**
   * get filter value based on field metadata
   * @param fieldId field id
   * @returns any
   */
  getFilterValue(filterCriteria: FilterCriteria) {
    const filtercontrolType = this.getFieldControlType(filterCriteria.fieldId);
    let retVal = '';

    if (filtercontrolType === FieldControlType.TEXT) {
      return filterCriteria.values;
    }

    if (filtercontrolType === FieldControlType.DATE) {
      if (filterCriteria.unit === 'static_date') {
        this.dateValue = this.dateFilterData.dateValue.start ? new Date(Number(this.dateFilterData.dateValue.start)) : null;
      } else if (filterCriteria.unit === 'static_range') {
        if (this.dateFilterData.dateRange.start) {
          this.dateRangeValue.start = new Date(Number(this.dateFilterData.dateRange.start));
        }
        if (this.dateFilterData.dateRange.end) {
          this.dateRangeValue.end = new Date(Number(this.dateFilterData.dateRange.end));
        }
      } else {
        const valObj = this.dateFilterOptions.find((op) => op.key === filterCriteria.unit);
        if (valObj) {
          retVal = valObj.key;
        }
        return retVal;
      }
    }

    if (filtercontrolType === FieldControlType.TIME) {
      const startHour = moment(+(filterCriteria.startValue || 0)).hours();
      const startMinutes = moment(+(filterCriteria.startValue || 0)).minutes() || 0;
      let endHour = moment(+(filterCriteria.endValue || 1)).hours() || 0;
      let endMinutes = moment(+(filterCriteria.endValue || 0)).minutes() || 0;
      if (startHour >= endHour) {
        endHour = startHour;
        endMinutes = endMinutes >= startMinutes ? endMinutes : startMinutes;
      }
      return { startHour, startMinutes, endHour, endMinutes };
    }

    return filterCriteria.values ? filterCriteria.values.toString() : '';
  }

  getTimeFilterString() {
    const { startHour, startMinutes, endHour, endMinutes } = this.getFilterValue(this.currentFilter) as any;
    return `${startHour}:${startMinutes} - ${endHour}:${endMinutes}`;
  }

  afterKeyPress(event: any, inputEl, type?: string): void {
    this.searchTearm = inputEl.value;
    if (event.keyCode === ENTER && inputEl.value) {
      if (this.selectedInputValues.indexOf(inputEl.value) > -1) {
        if (type !== 'search') {
          inputEl.value = '';
          this.searchTearm = '';
        }
        return;
      }

      this.selectedInputValues.push(inputEl.value.trim());
      inputEl.value = '';
      this.searchTearm = '';
    }

    if (event.keyCode === 8 && this.selectedInputValues.length && !inputEl.value && type !== 'search') {
      const value = this.selectedInputValues[this.selectedInputValues.length - 1];
      inputEl.value = value;
      this.searchTearm = value;
      this.remove(this.selectedInputValues[this.selectedInputValues.length - 1]);
    }

    this.updateFilterValue(this.selectedInputValues);
  }

  remove(num: string): void {
    this.selectedInputValues.splice(this.selectedInputValues.indexOf(num), 1);
    this.updateFilterValue(this.selectedInputValues);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dropdownOptionList.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    const dropdownOptionNames = this.dropdownOptionList.map(option => option.value);
    this.isAllSelected() ? this.selection.clear() : dropdownOptionNames.forEach((row) => this.selection.select(row));
    this.updateFilterValue('', true);
  }

  /**
   * get field control type based on field metadata
   * @param fieldId field id
   * @returns control type for filter value
   */
  getFieldControlType(fieldId?) {
    const field =
      this.moduleFieldsMetatdata.find((f) => f.fieldId === fieldId) || this.filterFieldsMetadata.find((f) => f.fieldId === fieldId);
    if (field) {
      if (field.picklist === '0' && field.dataType === 'CHAR') {
        return FieldControlType.TEXT;
      }

      if (field.picklist === '0' && field.dataType === 'PASS') {
        return FieldControlType.PASSWORD;
      }

      if (field.picklist === '0' && field.dataType === 'EMAIL') {
        return FieldControlType.EMAIL;
      }

      if (field.picklist === '22' && field.dataType === 'CHAR') {
        return FieldControlType.TEXT_AREA;
      }

      if (field.picklist === '0' && field.dataType === 'NUMC') {
        return FieldControlType.NUMBER;
      }

      if (['2', '1', '30', '37', '4'].includes(field.picklist) && field.dataType === 'CHAR') {
        return FieldControlType.MULTI_SELECT;
      }

      if ((field.picklist === '0' && field.dataType === 'DATS') || (['52', '53'].includes(field.picklist) && field.dataType === 'NUMC')) {
        return FieldControlType.DATE;
      }

      if (['0', '54'].includes(field.picklist) && field.dataType === 'TIMS') {
        return FieldControlType.TIME;
      }
    }

    return FieldControlType.TEXT;
  }
}
