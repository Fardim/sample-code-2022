import { UserProfileService } from '@services/user/user-profile.service';
import { DateTimeHelperService } from '@services/date-time-helper.service';
import { Component, ElementRef, Inject, LOCALE_ID, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ActivatedRoute, Router } from '@angular/router';
import { FieldMetaData } from '@models/core/coreModel';
import { DATE_FILTERS_METADATA, FieldControlType, FilterCriteria, ListPageFilters } from '@models/list-page/listpage';
import { CoreService } from '@services/core/core.service';
import { GlobaldialogService } from '@services/globaldialog.service';
import { Observable, Subject, Subscription, of, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, take, takeUntil, catchError } from 'rxjs/operators';
import * as moment from 'moment';
import { size } from 'lodash';
import { SchemaService } from 'src/app/_services/home/schema.service';
import { TransientService } from 'mdo-ui-library';

@Component({
  selector: 'pros-list-filter',
  templateUrl: './list-filter.component.html',
  styleUrls: ['./list-filter.component.scss'],
})
export class ListFilterComponent implements OnInit, OnDestroy {
  /**
   * Form control for the input
   */
  optionCtrl2 = new FormControl();

  /**
   * hold the list of filtered options
   */
  filteredOptions: Observable<string[]>;

  /**
   * Available options list
   */
  allOptions: string[] = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

  /**
   * Reference to the input
   */
  @ViewChild('optionInput2') optionInput2: ElementRef<HTMLInputElement>;

  /**
   * reference to auto-complete
   */
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  selectedValue: any;

  selected: any;

  periods = [
    { value: 'Daily', key: 1 },
    { value: 'Weekly', key: 2 },
    { value: 'Monthly', key: 3 },
    { value: 'Quarterly', key: 4 },
    { value: 'Yearly', key: 5 },
  ];

  rulelist = [
    { label: 'Is', value: 'EQUAL' },
    { label: 'Is not', value: 'NOT_EQUAL' },
  ];

  /**
   * hold current  id
   */
  moduleId: string;

  /**
   * fields metatdata
   */
  moduleFieldsMetatdata: FieldMetaData[] = [];

  filterFieldsMetadata: FieldMetaData[] = [];

  /**
   * filtered fields list
   */
  suggestedFilters: FilterCriteria[] = [];

  subscriptionsList: Subscription[] = [];

  filtersList: ListPageFilters = new ListPageFilters();

  activeFilter: FilterCriteria;

  optionsList = [
    { label: 'Filters', value: 'filters' },
    { label: 'Classifications', value: 'value2' },
  ];

  fldMatadataPageIndex = 0;

  FieldControlType = FieldControlType;

  fieldsPageIndex = 0;

  fieldsSearchString = '';

  searchFieldSub: Subject<string> = new Subject();

  dateFilterOptions: any[] = [];

  DATE_FILTERS_METADATA = DATE_FILTERS_METADATA;

  dropdownValues: any[] = [
    // { key: 'Tunisia', value: 'Tunisia' },
    // { key: 'India', value: 'India' },
  ];
  filteredDropdownValues: any[] = [];

  /**
   * holds control for multiple choice filter search
   */
  dropdownSearchCtrl: FormControl = new FormControl('');

  /**
   * holds chips for single select dropdown
   */
  dropdownSelectedChips = [];

  // store selected mat list item for show active
  selectedListItem: any;

  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();

  /**
   * when this page is opened from role-privilege data restrictions - these fields are needed
   */
  fiterRolePrivilegeDataRestriction = false;
  privilegeId = '';
  roleId = '';

  constructor(
    private activatedRouter: ActivatedRoute,
    private router: Router,
    private coreService: CoreService,
    private glocalDialogService: GlobaldialogService,
    private schemaService: SchemaService,
    private transient: TransientService,
    private dateTimeHelper: DateTimeHelperService,
    private profileService: UserProfileService,
    @Inject(LOCALE_ID) public locale: string
  ) {
    this.filteredOptions = this.optionCtrl2.valueChanges.pipe(
      startWith(''),
      map((num: string | null) => (num ? this._filter(num) : this.allOptions.slice()))
    );
  }

  /**
   * mehtod to filter items based on the searchterm
   * @param value searchTerm
   * @returns string[]
   */
  _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allOptions.filter((num) => num.toLowerCase().indexOf(filterValue) === 0);
  }

  /**
   * method to add item to selected items
   * for single sleect
   * @param event item
   */
  selectSingle(event: MatAutocompleteSelectedEvent): void {
    this.selectedValue = event.option.value;
  }

  ngOnInit(): void {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    let sub = this.activatedRouter.params.subscribe((params) => {
      this.moduleId = params.moduleId;
      // when this page is opened from role-privilege data restrictions - these params will be there
      this.privilegeId = params.privilegeId ? params.privilegeId : '';
      this.roleId = params.roleId ? params.roleId : '';

      this.getModuleFldMetadata();
    });
    this.activatedRouter.fragment.pipe(takeUntil(this.unsubscribeAll$)).subscribe(resp => {
      if(resp === 'role-privilege-data-restriction') {
        this.fiterRolePrivilegeDataRestriction = true;
      }
    });
    this.subscriptionsList.push(sub);

    sub = this.activatedRouter.queryParams
      .pipe(
        map((params) => {
          if (params.f) {
            try {
              const filters = JSON.parse(atob(params.f));
              return filters;
            } catch (err) {
              console.error(err);
              return new ListPageFilters();
            }
          } else {
            return new ListPageFilters();
          }
        })
      )
      .subscribe((filters) => {
        this.filtersList = filters;
        this.suggestedFilters = JSON.parse(JSON.stringify(this.filtersList.filterCriteria));
        const fieldsList = this.filtersList.filterCriteria.map((fc) => fc.fieldId);
        this.getfilterFieldsMetadata(fieldsList);
      });
    this.subscriptionsList.push(sub);

    sub = this.searchFieldSub.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString) => {
      this.fieldsSearchString = searchString || '';
      this.activeFilter = null;
      this.suggestedFilters = this.filtersList.filterCriteria.filter((field) =>
        this.getFieldDescription(field.fieldId).toLowerCase().includes(this.fieldsSearchString.toLowerCase())
      );
      this.getModuleFldMetadata();
    });
    this.subscriptionsList.push(sub);
  }

  /**
   * Get module fields metadata
   */
  getModuleFldMetadata(loadMore?: boolean) {
    if (this.moduleId === undefined || this.moduleId.trim() === '') {
      throw new Error('Module id cant be null or empty');
    }

    if (loadMore) {
      this.fieldsPageIndex++;
    } else {
      this.fieldsPageIndex = 0;
    }
    const sub = this.coreService
      .getMetadataByFields(this.moduleId, this.fieldsPageIndex, this.fieldsSearchString, 20, this.locale)
      .subscribe(
        (response) => {
          if (size(response)) {
            loadMore ? (this.moduleFieldsMetatdata = this.moduleFieldsMetatdata.concat(response)) : (this.moduleFieldsMetatdata = response);
          } else if (loadMore) {
            this.fieldsPageIndex--;
          }
          this.upsertFilter(this.moduleFieldsMetatdata[0]?.fieldId);
        },
        (error) => {
          console.error(`Error : ${error.message}`);
        }
      );
    this.subscriptionsList.push(sub);
  }

  /**
   * Get filters fields metadata
   */
  getfilterFieldsMetadata(fieldsList: string[]) {
    if (!fieldsList || !fieldsList.length) {
      return;
    }
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    const sub = this.coreService
      .getMetadataByFields(this.moduleId, this.fieldsPageIndex, this.fieldsSearchString, 20, this.locale)
      .subscribe(
        (response) => {
          this.filterFieldsMetadata = response;
        },
        (error) => {
          console.error(`Error : ${error.message}`);
        }
      );
    this.subscriptionsList.push(sub);
  }

  /**
   * Get filters: radio/checkbox fields options data
   */
  getFilterFieldOptions(fieldId: string) {
    this.schemaService.getFieldDropValues(this.moduleId, fieldId, '').subscribe(
      (response) => {
        this.dropdownValues = response.map((obj) => {
          return {
            key: obj.CODE,
            value: obj.TEXT ?? obj.CODE,
          };
        });
        this.filteredDropdownValues = this.dropdownValues;
      },
      (error) => {
        console.error(`Error : ${error.message}`);
      }
    );
  }

  setDropdownSelectedChips(fieldId) {
    const filter = this.filtersList.filterCriteria.find((f) => f.fieldId === fieldId);
    if (filter && this.getFieldControlType(fieldId) === FieldControlType.SINGLE_SELECT) {
      const filterValuesList = filter.values.length > 1 ? filter.values : filter.values[0].split(',');
      this.dropdownSelectedChips = this.filteredDropdownValues.filter((d) => d.value && filterValuesList.indexOf(d.value) >= 0);
    }
  }

  /**
   * apply filter changes
   */
  applyFilter() {
    const filter = JSON.parse(JSON.stringify(this.activeFilter));
    const allFiltersIndex = this.filtersList.filterCriteria.findIndex((fc) => fc.fieldId === this.activeFilter.fieldId);
    if (allFiltersIndex !== -1) {
      this.filtersList.filterCriteria[allFiltersIndex] = filter;
      const suggFiltersIndex = this.filtersList.filterCriteria.findIndex((fc) => fc.fieldId === this.activeFilter.fieldId);
      this.suggestedFilters[suggFiltersIndex] = filter;
    } else {
      this.filtersList.filterCriteria.push(filter);
      this.suggestedFilters.push(filter);
      const fldMetadata = this.moduleFieldsMetatdata.find((f) => f.fieldId === filter.fieldId);
      this.filterFieldsMetadata.push(fldMetadata);
    }
    this.close();
  }

  /**
   * edit filter details on field click
   * @param fieldId clicked field id
   */
  upsertFilter(fieldId) {
    this.selectedListItem = fieldId;
    this.dropdownSelectedChips = [];
    const filter = this.filtersList.filterCriteria.find((f) => f.fieldId === fieldId);
    if (filter) {
      this.activeFilter = JSON.parse(JSON.stringify(filter));
    } else {
      this.activeFilter = new FilterCriteria();
      this.activeFilter.fieldId = fieldId;
      this.activeFilter.fieldType = this.getFieldControlType(fieldId);
      this.activeFilter.operator = this.activeFilter.fieldType === 'date'? 'RANGE' : 'EQUAL';
      this.activeFilter.values = [];
      this.activeFilter.esFieldPath = `hdvs.${fieldId}`;

      if (this.getFieldControlType(fieldId) === FieldControlType.DATE) {
        this.dateFilterOptions = this.DATE_FILTERS_METADATA[0].options.map((option) => {
          return { key: option.value, value: option.value };
        });
        this.activeFilter.unit = this.dateFilterOptions[0].value;
      }
    }
  }

  /**
   * get field desc based on field id
   * @returns field description
   */
  getFieldDescription(fieldId) {
    const field =
      this.moduleFieldsMetatdata.find((f) => f.fieldId === fieldId) || this.filterFieldsMetadata.find((f) => f.fieldId === fieldId);
    return field ? field.fieldDescri || 'Unknown' : 'Unknown';
  }

  /**
   * Format filter value based on field metadata
   * @param fieldId field id
   * @returns string
   */
  FormatFilterValue(filterCriteria: FilterCriteria) {
    const filtercontrolType = this.getFieldControlType(filterCriteria.fieldId);
    if (
      [
        FieldControlType.NUMBER,
        FieldControlType.TEXT,
        FieldControlType.EMAIL,
        FieldControlType.PASSWORD,
        FieldControlType.TEXT_AREA,
      ].includes(filtercontrolType)
    ) {
      return filterCriteria.values ? filterCriteria.values.toString() : '';
    } else if ([FieldControlType.SINGLE_SELECT, FieldControlType.MULTI_SELECT].includes(filtercontrolType)) {
      const finalFilterArray =  filterCriteria.values;
      let filterValueString1 = '';
      if (finalFilterArray.length) {
        filterValueString1 += finalFilterArray[0];
        if (finalFilterArray.length > 1) {
          filterValueString1 +=
            ',' +
            finalFilterArray[1].slice(0, finalFilterArray[1].length > 2 ? finalFilterArray[1].length - 3 : 0) +
            '...' +
            (finalFilterArray.length - 2 > 0 ? '+' + (finalFilterArray.length - 2) : '');
        }
      }
      return `${filterCriteria.operator === 'EQUAL' ? 'Is' : 'Is not'} ${filterValueString1}`;
    } else if (filtercontrolType === FieldControlType.DATE) {
      if (filterCriteria.unit === 'static_date') {
        return moment(+filterCriteria.startValue).format('MM/DD/YYYY');
      } else if (filterCriteria.unit === 'static_range') {
        return `${moment(+filterCriteria.startValue).format('MM/DD/YYYY')} to ${moment(+filterCriteria.endValue).format('MM/DD/YYYY')}`;
      }
      return filterCriteria.unit;
    } else if (filtercontrolType === FieldControlType.TIME) {
      const start = moment(+filterCriteria.startValue).format('HH:mm');
      const end = moment(+filterCriteria.endValue).format('HH:mm');
      return `from ${start} to ${end}`;
    }
    else if (filterCriteria.type === 'INLINE') {
      const finalFilterArray =  filterCriteria.values;
      let filterValueString1 = '';
      if (finalFilterArray.length) {
        filterValueString1 += finalFilterArray[0];
        if (finalFilterArray.length > 1) {
          filterValueString1 +=
            ',' +
            finalFilterArray[1].slice(0, finalFilterArray[1].length > 2 ? finalFilterArray[1].length - 3 : 0) +
            '...' +
            (finalFilterArray.length - 2 > 0 ? '+' + (finalFilterArray.length - 2) : '');
        }
      }
      return filterValueString1;
    }

    return filterCriteria.values ? filterCriteria.values.toString() : '';
  }

  /**
   * get filter value based on field metadata
   * @param fieldId field id
   * @returns any
   */
  getFilterValue(filterCriteria: FilterCriteria) {
    const filtercontrolType = this.getFieldControlType(filterCriteria.fieldId);
    let retVal = '';

    if (filtercontrolType === FieldControlType.DATE) {
      if (filterCriteria.unit === 'static_date') {
        return moment(+filterCriteria.startValue).toDate();
      } else if (filterCriteria.unit === 'static_range') {
        return { start: moment(+filterCriteria.startValue).toDate(), end: moment(+filterCriteria.endValue).toDate() };
      } else {
        const valObj = this.dateFilterOptions.find((op) => op.key === filterCriteria.unit);
        if (valObj) {
          retVal = valObj.key;
        }
        return retVal;
      }
    }

    if (filtercontrolType === FieldControlType.SINGLE_SELECT) {
      const valObj = this.dropdownValues.find((option) => option.value === this.activeFilter.values.toString());
      if (valObj) {
        retVal = valObj.value;
      }
      return retVal;
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

  emitFilterValueChange(event) {
    if (event) {
      if (event?.ruleChange && (event?.fieldId === this.activeFilter.fieldId)) {
        this.activeFilter.operator = event.ruleChange;
      }
      if ((event?.filterType === 'date' || event?.filterType === 'time') && event?.currentFilter) {
        this.activeFilter = { ...event.currentFilter };
      } else if (event?.currentFilterValues) {
        this.activeFilter.values = [...event.currentFilterValues];
      }
      if (event?.type === 'inline-updated') {
        this.activeFilter.values = [...event.currentFilterValues];
        this.filtersList.filterCriteria.forEach((data) => {
          if (data.fieldId === event.fieldId) {
            data.values = [...event.currentFilterValues];
          }
        });
      }
    }
  }

  /**
   * update filter value
   * @param event new value
   * @returns void
   */
  updateFilterValue(event) {
    const filtercontrolType = this.getFieldControlType(this.activeFilter.fieldId);

    if ([FieldControlType.EMAIL, FieldControlType.PASSWORD, FieldControlType.TEXT_AREA].includes(filtercontrolType)) {
      this.activeFilter.values = [event];
      return;
    } else if (filtercontrolType === FieldControlType.TEXT) {
      this.activeFilter.values = [event];
      return;
    } else if (filtercontrolType === FieldControlType.NUMBER) {
      this.activeFilter.startValue = event.min || 0;
      this.activeFilter.endValue = event.max || 1;
      return;
    } else if (filtercontrolType === FieldControlType.SINGLE_SELECT) {
      // this.activeFilter.values = [event.key];
      this.activeFilter.values = [event];
      return;
    } else if (filtercontrolType === FieldControlType.MULTI_SELECT) {
      const index = this.activeFilter.values.findIndex((v) => v === event);
      if (index !== -1) {
        this.activeFilter.values.splice(index, 1);
      } else {
        this.activeFilter.values.push(event);
      }
      return;
    } else if (filtercontrolType === FieldControlType.DATE) {
      if (this.activeFilter.unit === 'static_date') {
        this.activeFilter.startValue = moment(event).startOf('day').toDate().getTime().toString();
        this.activeFilter.endValue = moment(event).endOf('day').toDate().getTime().toString();
      } else if (this.activeFilter.unit === 'static_range') {
        this.activeFilter.startValue = moment(event.start).startOf('day').toDate().getTime().toString();
        this.activeFilter.endValue = moment(event.end).endOf('day').toDate().getTime().toString();
      } else {
        this.activeFilter.unit = event;
      }
      return;
    } else if (filtercontrolType === FieldControlType.TIME) {
      console.log(event);
    }

    this.activeFilter.values = [event];
  }

  timefilterChange(value, from) {
    switch (from) {
      case 'startHour':
        this.activeFilter.startValue = moment(+(this.activeFilter.startValue || 0))
          .set('hour', value)
          .toDate()
          .getTime()
          .toString(); //
        break;
      case 'startMinutes':
        this.activeFilter.startValue = moment(+(this.activeFilter.startValue || 0))
          .set('minute', value)
          .toDate()
          .getTime()
          .toString();
        break;
      case 'endHour':
        this.activeFilter.endValue = moment(+(this.activeFilter.endValue || 0))
          .set('hour', value)
          .toDate()
          .getTime()
          .toString();
        break;
      case 'endMinutes':
        this.activeFilter.endValue = moment(+(this.activeFilter.endValue || 0))
          .set('minute', value)
          .toDate()
          .getTime()
          .toString();
        break;
    }
  }

  /**
   * Reset all filters
   */
  clearAllFilters() {
    this.transient.confirm({
      data: {label: 'Are you sure to reset all filters ?', dialogTitle: 'Confirmation'
    },
    disableClose: true,
    autoFocus: false,
    width: '600px',
     }, (resp) => {
      if (resp && resp === 'yes') {
        this.filtersList.filterCriteria = [];
        this.suggestedFilters = [];
        this.activeFilter = null;
      }
    });
  }

  /**
   * Remove an applied filter
   * @param index filter index
   */
  removeFilter(index, fieldId) {
    this.glocalDialogService.confirm({ label: 'Are you sure to remove this filter ?' }, (resp) => {
      if (resp && resp === 'yes') {
        if (this.activeFilter && this.activeFilter.fieldId === fieldId) {
          this.activeFilter = null;
        }
        this.filtersList.filterCriteria.splice(index, 1);
        this.filterFieldsMetadata = this.filterFieldsMetadata.filter((f) => f.fieldId !== fieldId);
        this.suggestedFilters = this.suggestedFilters.filter((f) => f.fieldId !== fieldId);
      }
    });
  }

  /**
   * get field control type based on field metadata
   * @param fieldId field id
   * @returns control type for filter value
   */
  getFieldControlType(fieldId) {
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

      if (['30'].includes(field.picklist) && field.dataType === 'CHAR') {
        return field.isMultiselect === 'true' ? FieldControlType.MULTI_SELECT : FieldControlType.SINGLE_SELECT;
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

  dateFilterSelected(filterMetadata) {
    this.dateFilterOptions = filterMetadata.options.map((op) => {
      return { key: op.value, value: op.value };
    });
    if (['static_date', 'static_range'].includes(filterMetadata.category)) {
      this.activeFilter.unit = filterMetadata.category;
    } else {
      this.activeFilter.unit = this.dateFilterOptions[0].value;
    }
  }

  filterOptionSerarch(searchString) {
    this.filteredDropdownValues = this.dropdownValues.filter((valObj) => valObj.key.toLowerCase().includes(searchString.toLowerCase()));
  }

  /**
   * close sidesheet
   */
  close() {
    if(this.fiterRolePrivilegeDataRestriction) {
      this.mapFilterValues();
    } else {
      if (this.filtersList.filterCriteria && this.filtersList.filterCriteria.length) {
        const filters = btoa(JSON.stringify(this.filtersList));
        this.router.navigate([{ outlets: { sb: null } }], { queryParams: { f: filters, filterSideSheetClosed: true } });
      } else {
        this.router.navigate([{ outlets: { sb: null } }], { queryParams: { filterSideSheetClosed: true } });
      }
    }
  }

  mapFilterValues() {
    const simpleField = this.filtersList.filterCriteria?.filter((data) => data.fieldType !== 'multi-select');
    const multiSelect = this.filtersList.filterCriteria?.filter((data) => data.fieldType === 'multi-select');

    const simpleFieldObservables$: Observable<any>[] = [];
    simpleField.forEach((fc) => {
      fc.isUpdated = false;
      if (fc.type !== 'INLINE' && fc.values.length && fc.values.length === 1) {
        fc.values = fc.values[0].split(',');
      }
      if (fc.unit && !['static_date', 'static_range'].includes(fc.unit)) {
        const dateRange = this.dateTimeHelper.dateUnitToDateRange(fc.unit);
        fc.startValue = dateRange.startDate.toString();
        fc.endValue = dateRange.endDate.toString();
      }
      simpleFieldObservables$.push(of(fc));
    });

    const multiSelectFieldObservable$: Observable<any>[] = [];
    multiSelect.forEach((fc) => {
      fc.isUpdated = false;
      if (fc.fieldType === 'multi-select' && fc.values.length !== 0) {
        const filterControlValue = fc.values;
        const fValuesArr = filterControlValue[0].split(',');
        multiSelectFieldObservable$.push(
          this.schemaService.getFieldDropValues(this.moduleId, fc.fieldId, '').pipe(
            take(1),
            map((response) => {
              const options = response
                .filter((o1) =>
                  fValuesArr.some(
                    (o2) => o1.CODE.toLowerCase() === o2.toLowerCase() || o1.TEXT.toLowerCase() === o2.toLowerCase()
                  )
                )
                .map((data) => data.CODE);
              let multiSelectObj = {};
              if (options.length > 0) {
                multiSelectObj = Object.assign({}, fc, {
                  values: options
                });
                return multiSelectObj;
              } else {
                return fc;
              }
            }),
            catchError((err) => of(null))
          )
        );
      }
    });

    if (simpleFieldObservables$.length > 0 || multiSelectFieldObservable$.length > 0) {
      forkJoin([...simpleFieldObservables$, ...multiSelectFieldObservable$])
        .pipe(take(1))
        .subscribe(
          (resp) => {
            console.log('rep', resp);
            this.profileService.nextRolePrivilegeDataRestrictionFilters({roleId: this.roleId, privilegeId: this.privilegeId, moduleId: this.moduleId, filters: resp});
            this.goBacktoDataRestriction();
          },
          (err) => {
            console.log('Error:', err);
          }
        );
    } else {
      this.goBacktoDataRestriction()
    }
  }
  goBacktoDataRestriction() {
    if (this.roleId === '0') {
      this.router.navigate(
        [
          {
            outlets: {
              sb: `sb/settings/roles-permissions`,
              outer: `outer/roles-permissions/new-role`,
              sb3: `sb3/roles-permissions/${this.roleId}/data-restriction/${this.privilegeId}`
            }
          }
        ]
      );
    } else {
      this.router.navigate(
        [
          {
            outlets: {
              sb: `sb/settings/roles-permissions`,
              outer: `outer/roles-permissions/edit-role/${this.roleId}`,
              sb3: `sb3/roles-permissions/${this.roleId}/data-restriction/${this.privilegeId}`
            }
          }
        ]
      );
    }
  }
  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.complete();
  }
}
