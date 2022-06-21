import { MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { take, map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { of } from 'rxjs';
import { GlobaldialogService } from '@services/globaldialog.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { SearchComponent, TransientService } from 'mdo-ui-library';
import { CoreService } from '@services/core/core.service';
import { DATE_FILTERS_METADATA, FieldControlType, FilterFieldModel } from '@models/list-page/listpage';
import { SchemaService } from '@services/home/schema.service';
import * as moment from 'moment';
import { TaskListService } from '@services/task-list.service';
@Component({
  selector: 'pros-task-list-filter',
  templateUrl: './task-list-filter.component.html',
  styleUrls: ['./task-list-filter.component.scss'],
})
export class TaskListFilterComponent implements OnInit {
  @ViewChild('searchInput', { static: true }) searchInput: SearchComponent;
  node: string = null;
  activeFilter: FilterFieldModel;
  listPageStaticFilters: Array<FilterFieldModel> = [];
  searchKey = '';
  optionsList = [
    { label: 'Filters', value: 'filters' },
    { label: 'Classifications', value: 'value2' },
  ];
  rulelist = [
    { label: 'Is', value: 'EQUAL' },
    { label: 'Is not', value: 'NOT_EQUAL' },
  ];
  pageEvent = {
    pageIndex: 0,
    pageSize: 20,
    totalCount: 0,
  };
  infinteScrollLoading = false;
  treeFlattener;
  treeControl;
  dataSource;
  moduleData;
  suggestedModuleFields: Array<FilterFieldModel> = [];
  openTreeModuleId = [];
  FieldControlType = FieldControlType;
  /**
   * filtered fields list
   */
  suggestedFilters: FilterFieldModel[] = [];
  dropdownValues: FieldSelectOption[] = [];
  filteredDropdownValues: FieldSelectOption[] = [];
  treeControlSuggFilter;
  suggestedFiltersDataSource;
  dateFilterOptions: any[] = [];
  DATE_FILTERS_METADATA = DATE_FILTERS_METADATA;

  // set true when data is loading state
  isShowSkeleton: boolean = false;

  // for selected List item
  selectedList: string = 'day';

  activeNode: string;

  // for store date range value when user apply filter
  dateRangeValue: { start: Date; end: Date } = { start: null, end: null };


  constructor(private transient: TransientService, private router: Router, private route: ActivatedRoute, private glocalDialogService: GlobaldialogService, private coreService: CoreService, private schemaService: SchemaService,
    private taskListService: TaskListService,
    @Inject(LOCALE_ID) public locale: string) {
    this.treeFlattener = new MatTreeFlattener(
      this._transformer,
      (node) => node.level,
      (node) => node.expandable,
      (node) => node.fields
    );
    this.treeControl = new FlatTreeControl<TreeFlatNode>(
      (node) => node.level,
      (node) => node.expandable
    );
    const treeFlattenerSuggFilter = new MatTreeFlattener(
      this._transformer,
      (node) => node.level,
      (node) => node.expandable,
      (node) => node.fields
    );
    this.treeControl = new FlatTreeControl<TreeFlatNode>(
      (node) => node.level,
      (node) => node.expandable
    );
    this.treeControlSuggFilter = new FlatTreeControl<TreeFlatNode>(
      (node) => node.level,
      (node) => node.expandable
    );
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.suggestedFiltersDataSource = new MatTreeFlatDataSource(this.treeControlSuggFilter, treeFlattenerSuggFilter);
  }
  private _transformer = (node: TreeFlatNode, level: number) => {
    return {
      expandable: !!node.fields && node.fields.length > 0,
      name: node.name,
      level,
      moduleId: node.moduleId,
      fieldId: node.fieldId,
      isEmpty: node.isEmpty,
      picklist: node.picklist,
      dataType: node.dataType,
      moduleName: node.moduleName
    };
  };
  hasChild = (_: number, node: TreeFlatNode) => node.expandable;

  ngOnInit(): void {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    this.route.params.subscribe((param) => {
      this.node = param.node || null;
      // this.loadData([]);
      this.getDataSets();
    });

    this.route.queryParams.pipe(take(1)).subscribe((queryParam) => {
      this.suggestedFilters = [];
      this.listPageStaticFilters = [];
      if (queryParam.f) {
        const decoded = atob(queryParam.f);
        if (decoded) {
          // this.currentFilterSettings = JSON.parse(decoded) || [];
          const decodeArr = JSON.parse(decoded);
          if (decodeArr && decodeArr.length > 0) {
            const filterArr = [...decodeArr.filter(obj => obj.moduleId)];
            if (filterArr && filterArr.length > 0) {
              this.suggestedFilters = filterArr;
              this.formatFilterSuggestData();
            }
            const staticFilterArr = [...decodeArr.filter(obj => !obj.moduleId)];
            if (staticFilterArr && staticFilterArr.length > 0) {
              this.listPageStaticFilters = staticFilterArr;
            }
          }
        }
      }
    });

    this.searchInput?.valueChange
      .pipe(
        map((event: any) => {
          return event;
        }),
        debounceTime(1000),
        distinctUntilChanged()
      )
      .subscribe((text: string) => {
        if (text && text.length > 2) {
          this.resetPageEvent();
          const { pageIndex, pageSize, totalCount } = this.pageEvent;
          if (pageIndex * pageSize > totalCount) {
            this.infinteScrollLoading = false;
            return;
          }
          this.searchKey = text.toLowerCase();
          this.dataSource.data = [];
          // this.loadData([]);
          this.getDataSets();
        } else if (!text) {
          this.resetPageEvent();
          const { pageIndex, pageSize, totalCount } = this.pageEvent;
          if (pageIndex * pageSize > totalCount) {
            this.infinteScrollLoading = false;
            return;
          }
          this.searchKey = text.toLowerCase();
          this.dataSource.data = [];
          this.getDataSets();
          // this.loadData([]);
        }
      });
    // this.scroll = this.scroll.bind(this);
    // document.getElementById('mat-tree').addEventListener('scroll', this.scroll);
    // this.getDataSets();
  }

  getDataSets() {
    if (this.node) {
      this.isShowSkeleton = true;
      this.taskListService.getAllModules(this.locale, this.node.toUpperCase()).subscribe((res) => {
        this.isShowSkeleton = false;
        this.moduleData = res;
        this.loadData([]);
      }, err => console.error(err));
    }
    // this.coreService.getDataSets(this.searchKey)
    //   .subscribe(res => {
    //     this.moduleData = res;
    //     this.loadData([]);
    //   },
    //     (err) => {
    //       console.log(err);
    //     })

  }

  resetPageEvent() {
    this.pageEvent.pageIndex = 0;
    this.pageEvent.pageSize = 20;
    this.pageEvent.totalCount = 0;
  }
  scroll(loadMore: boolean) {
    if (!this.infinteScrollLoading) {
      if (loadMore) {
        this.pageEvent.pageIndex++;
      } else {
        this.pageEvent.pageIndex = 0;
      }
      const { pageIndex, pageSize, totalCount } = this.pageEvent;
      if (pageIndex * pageSize > totalCount) {
        this.infinteScrollLoading = false;
        return;
      }
      this.infinteScrollLoading = true;
      this.loadData(this.dataSource.data);
    }
  }
  loadData(existingData: TreeFlatNode[]) {
    const { pageIndex, pageSize } = this.pageEvent;
    // if (pageIndex * pageSize > totalCount) {
    //   this.infinteScrollLoading = false;
    //   return;
    // }
    this.getLazyData(pageIndex, pageSize).subscribe((resp: any) => {
      this.infinteScrollLoading = false;
      this.pageEvent.totalCount = resp.totalCount;
      existingData.push(...resp.data);
      this.dataSource.data = this.updateModuleFields(existingData);

      this.expandModuleTreeNode();
    });
  }
  getLazyData(pageIndex, pageSize) {
    const moduleData = this.moduleData;
    // beacause over flow last index
    // const data = moduleData.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
    const data = moduleData;
    const formattedDat = this.formatForTreeData(data || []);
    return of({ data: formattedDat, totalCount: moduleData.length });
  }

  /**
   * get filter details on module click
   * @param nodeObj clicked module details
   */
  loadModuleFields(nodeObj: TreeFlatNode) {
    const isNodeExpanded = this.treeControl.isExpanded(nodeObj)
    if (isNodeExpanded) {
      this.openTreeModuleId.splice(this.openTreeModuleId.indexOf(nodeObj.moduleId), 1);
    } else {
      this.openTreeModuleId.push(nodeObj.moduleId);
    }

    if (this.suggestedModuleFields[nodeObj.moduleId]) {
      this.loadData([]);
    } else {
      this.getModuleFields(nodeObj.moduleId, nodeObj.name);
    }
  }

  getModuleFields(moduleId: string, moduleName: string) {
    this.coreService.getMetadataFieldsByModuleId([moduleId], '')
      .subscribe(response => {
        if (response && response.headers) {
          const conHeader: TreeFlatNode[] = [];
          if (response.hasOwnProperty('headers')) {
            Object.keys(response.headers).forEach(key => {
              conHeader.push({
                expandable: false,
                level: 2,
                isEmpty: false,
                fieldId: response.headers[key].fieldId,
                name: response.headers[key].description,
                moduleId: response.headers[key].moduleId,
                moduleName,
                picklist: response.headers[key].pickList,
                dataType: response.headers[key].dataType,
              });
            });
          }
          if (conHeader.length > 0) {
            this.suggestedModuleFields[moduleId] = conHeader;
            this.loadData([]);
          } else {
            this.suggestedModuleFields[moduleId] = [{
              expandable: false,
              level: 2,
              isEmpty: true,
              name: ''
            }];
            this.expandModuleTreeNode()
          }
        }
      })
  }

  updateModuleFields(dataArr: TreeFlatNode[]) {
    dataArr.map(det => det.fields = this.suggestedModuleFields[det.moduleId] || [{
      expandable: false,
      level: 2,
      isEmpty: true,
      name: ''
    }]);
    return dataArr;
  }

  expandModuleTreeNode() {
    this.openTreeModuleId.forEach(moduelID => {
      const moduleIndex = this.treeControl.dataNodes.findIndex(dataEl => dataEl.moduleId === moduelID);
      if (this.treeControl.dataNodes[moduleIndex])
        this.treeControl.expand(this.treeControl.dataNodes[moduleIndex]);
    });
  }

  close() {
    // this.router.navigate([{ outlets: { sb: null } }], { queryParamsHandling: 'preserve' });
    const filters = [];
    if (this.suggestedFilters && this.suggestedFilters.length) {
      filters.push(...this.suggestedFilters);
    }
    if (this.listPageStaticFilters && this.listPageStaticFilters.length) {
      filters.push(...this.listPageStaticFilters);
    }

    if (filters && filters.length) {
      const filterStr = btoa(JSON.stringify(filters));
      this.router.navigate([{ outlets: { sb: null } }], { queryParams: { f: filterStr } });
    } else {
      this.router.navigate([{ outlets: { sb: null } }], { queryParams: {} });
    }
  }
  clearAllFilters() {
    this.transient.confirm({
      data: {label: 'Are you sure to reset all filters?', dialogTitle: 'Confirmation'
    },
    disableClose: true,
      autoFocus: false,
      width: '600px',
     }, (resp) => {
      if (resp && resp === 'yes') {
        // this.currentFilterSettings = [];
        this.activeFilter = null;
        this.suggestedFilters = [];
        this.formatFilterSuggestData();
      }
    });
  }

  /**
   * get field control type based on field metadata
   * @param activeFilterObj field object
   * @returns control type for filter value
   */
  getFieldControlType(activeFilterObj: FilterFieldModel) {
    const field = activeFilterObj;
    if (field) {
      if (field.picklist === '0' && field.dataType === 'CHAR') {
        return FieldControlType.TEXT;
      } else if (field.picklist === '0' && field.dataType === 'PASS') {
        return FieldControlType.PASSWORD;
      } else if (field.picklist === '0' && field.dataType === 'EMAIL') {
        return FieldControlType.EMAIL;
      } else if (field.picklist === '22' && field.dataType === 'CHAR') {
        return FieldControlType.TEXT_AREA;
      } else if (field.picklist === '0' && field.dataType === 'NUMC') {
        return FieldControlType.NUMBER;
      } else if (['4'].includes(field.picklist) && field.dataType === 'CHAR') {
        return FieldControlType.SINGLE_SELECT;
      } else if ((['1', '2', '30', '37'].includes(field.picklist) && field.dataType === 'CHAR')) {
        return FieldControlType.MULTI_SELECT;
      } else if ((field.picklist === '0' && field.dataType === 'DATS') || (['52', '53'].includes(field.picklist) && field.dataType === 'NUMC')) {
        return FieldControlType.DATE;
      } else if (['0', '54'].includes(field.picklist) && field.dataType === 'TIMS') {
        return FieldControlType.TIME;
      }
    }

    return FieldControlType.TEXT;
  }

  /**
   * edit filter details on field click
   * @param fieldObj clicked field object details
   */
  upsertFilter(fieldObj: FilterFieldModel) {
    this.selectedList = 'day';
    const filter = this.suggestedFilters.find((fc) => fc?.moduleId === fieldObj?.moduleId && fc?.fieldId === fieldObj?.fieldId);

    if (filter) {
      this.activeFilter = JSON.parse(JSON.stringify(filter));
      if (this.getFieldControlType(fieldObj) === FieldControlType.DATE) {
        if (!['static_date', 'static_range'].includes(this.activeFilter.unit)) {
          this.dateFilterOptions = this.DATE_FILTERS_METADATA.find((metadata) =>
            metadata.options.some((op) => op.value === this.activeFilter.unit)
          ).options.map((option) => {
            return { key: option.value, value: option.value };
          });
        }
      }
    } else {
      this.activeFilter = new FilterFieldModel();
      this.activeFilter.fieldId = fieldObj.fieldId;
      this.activeFilter.operator = 'EQUAL';
      this.activeFilter.values = [];
      this.activeFilter.esFieldPath = `hdvs.${fieldObj.fieldId}`;
      this.activeFilter.moduleName = fieldObj.moduleName;
      this.activeFilter.moduleId = fieldObj.moduleId;
      this.activeFilter.name = fieldObj.name;
      this.activeFilter.dataType = fieldObj.dataType;
      this.activeFilter.picklist = fieldObj.picklist;
      this.activeFilter.filterType = 'DYNAMIC';
      this.activeFilter.selectAll = false;
      this.activeFilter.showSelected = false;
      this.activeFilter.serchString = '';
      if (this.getFieldControlType(fieldObj) === FieldControlType.DATE) {
        this.dateFilterOptions = this.DATE_FILTERS_METADATA[0].options.map((option) => {
          return { key: option.value, value: option.value };
        });
        this.activeFilter.unit = this.dateFilterOptions[0].value;
      }
    }

    if (this.getFieldControlType(fieldObj) === FieldControlType.SINGLE_SELECT || this.getFieldControlType(fieldObj) === FieldControlType.MULTI_SELECT) {
      this.getFilterFieldOptions(fieldObj.moduleId, fieldObj.fieldId);
    }
  }

  /**
   * update filter value
   * @param event new value
   * @returns void
   */
  updateFilterValue(event) {
    const filtercontrolType = this.getFieldControlType(this.activeFilter);

    if (
      [FieldControlType.TEXT, FieldControlType.EMAIL, FieldControlType.PASSWORD, FieldControlType.TEXT_AREA].includes(filtercontrolType)
    ) {
      this.activeFilter.values = [event];
      return;
    } else if (filtercontrolType === FieldControlType.NUMBER) {
      this.activeFilter.startValue = event.min || 0;
      this.activeFilter.endValue = event.max || 1;
      return;
    } else if (filtercontrolType === FieldControlType.SINGLE_SELECT) {
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
        this.activeFilter.startValue = moment(event?.start).startOf('day').toDate().getTime().toString();
        this.activeFilter.endValue = moment(event?.end).endOf('day').toDate().getTime().toString();
        this.getFilterValue(this.activeFilter);
      } else {
        this.activeFilter.unit = event;
      }
      return;
    }

    this.activeFilter.values = [event];
  }

  /**
   * get filter value based on field metadata
   * @param fieldId field id
   * @returns any
   */
  getFilterValue(filterObj: FilterFieldModel) {
    const filtercontrolType = this.getFieldControlType(filterObj);
    let retVal = '';

    if (filtercontrolType === FieldControlType.DATE) {
      if (filterObj.unit === 'static_date') {
        return filterObj?.startValue ?  new Date(+filterObj?.startValue) : null;
      } else if (filterObj.unit === 'static_range') {
          this.dateRangeValue.start = new Date(+filterObj?.startValue)
          this.dateRangeValue.end =  new Date(+filterObj?.endValue)
      } else {
        const valObj = this.dateFilterOptions.find((op) => op.key === filterObj.unit);
        if (valObj) {
          retVal = valObj.key
        }
        return retVal;
      }
    } else if (filtercontrolType === FieldControlType.SINGLE_SELECT) {
      const valObj = this.dropdownValues.find((option) => option.value === this.activeFilter.values.toString());
      if (valObj) {
        retVal = valObj.value;
      }
      return retVal;
    } else if (filtercontrolType === FieldControlType.TIME) {
      const startHour = moment(+(filterObj.startValue || 0)).hours();
      const startMinutes = moment(+(filterObj.startValue || 0)).minutes() || 0;
      let endHour = moment(+(filterObj.endValue || 1)).hours() || 0;
      let endMinutes = moment(+(filterObj.endValue || 0)).minutes() || 0;
      if (startHour >= endHour) {
        endHour = startHour;
        endMinutes = endMinutes >= startMinutes ? endMinutes : startMinutes;
      }
      return { startHour, startMinutes, endHour, endMinutes };
    }

    return filterObj.values ? filterObj.values.toString() : '';
  }

  /**
   * apply filter changes
   */
  applyFilter() {
    const filter = JSON.parse(JSON.stringify(this.activeFilter));
    const allFiltersIndex = this.suggestedFilters.findIndex((fc) => fc.moduleId === this.activeFilter.moduleId && fc.fieldId === this.activeFilter.fieldId);

    if (allFiltersIndex === -1) {
      this.suggestedFilters.push(filter);
    } else {
      this.suggestedFilters[allFiltersIndex] = filter;
    }
    this.formatFilterSuggestData();
  }

  /**
   * Format filter value based on field metadata
   * @param fieldId field id
   * @returns string
   */
  FormatFilterValue(filterObj: FilterFieldModel) {
    const filtercontrolType = this.getFieldControlType(filterObj);

    if (
      [FieldControlType.TEXT, FieldControlType.EMAIL, FieldControlType.PASSWORD, FieldControlType.TEXT_AREA].includes(filtercontrolType)
    ) {
      return filterObj.values ? filterObj.values.toString() : '';
    } else if (filtercontrolType === FieldControlType.NUMBER) {
      return `From ${filterObj.startValue || '0'} to ${filterObj.endValue || '0'}`;
    } else if ([FieldControlType.SINGLE_SELECT, FieldControlType.MULTI_SELECT].includes(filtercontrolType)) {
      return `${filterObj.operator === 'EQUAL' ? 'Is' : 'Is not'} ${filterObj.values.toString()}`;
    } else if (filtercontrolType === FieldControlType.DATE) {
      if (filterObj.unit === 'static_date') {
        return moment(+filterObj.startValue).format('MM/DD/YYYY');
      } else if (filterObj.unit === 'static_range') {
        return `${moment(+filterObj.startValue).format('MM/DD/YYYY')} to ${moment(+filterObj.endValue).format('MM/DD/YYYY')}`;
      }
      return filterObj.unit;
    } else if (filtercontrolType === FieldControlType.TIME) {
      const start = moment(+filterObj.startValue).format('HH:mm');
      const end = moment(+filterObj.endValue).format('HH:mm');
      return `from ${start} to ${end}`;
    }

    return filterObj.values ? filterObj.values.toString() : '';
  }

  /**
   * Remove an applied filter
   * @param fieldObj filter field details
   * @param removeType module/field remove type
   */
  removeFilter(fieldObj: FilterFieldModel, removeType: string) {
    this.transient.confirm({
      data: {label: 'Are you sure to remove this filter?', dialogTitle: 'Confirmation'
    },
    disableClose: true,
      autoFocus: false,
      width: '600px',
     }, (resp) => {
      if (resp && resp === 'yes') {
        // if (this.activeFilter && this.activeFilter.fieldId === fieldObj.fieldId) {
        //   this.activeFilter = null;
        // }
        if (removeType === 'field') {
          const fieldIndex = this.suggestedFilters.findIndex((fc) => fc.moduleId === fieldObj.moduleId && fc.fieldId === fieldObj.fieldId);
          if (fieldIndex !== -1) {
            this.suggestedFilters.splice(fieldIndex, 1);
          }
        } else {
          this.suggestedFilters = [...this.suggestedFilters.filter(obj => obj.moduleId !== fieldObj.moduleId)];
        }
        this.formatFilterSuggestData();
      }
    });
  }

  /**
   * Get filters: radio/checkbox fields options data
   */
  getFilterFieldOptions(moduleId: string, fieldId: string) {
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
        },
        (error) => {
          console.error(`Error : ${error.message}`);
        }
      );
  }

  /**
   * Search single/mutli select option
   * @param searchString filter search string
   * @param key value
   */
  filterOptionSearch(searchString: string, objectKey: string, keyEvent: boolean) {
    this.activeFilter.serchString = searchString;
    let dropValues = this.dropdownValues;
    if (this.activeFilter.showSelected) {
      dropValues = this.dropdownValues.filter(dropValObj => this.activeFilter.values.includes(dropValObj.key));
    }
    this.filteredDropdownValues = dropValues.filter(valObj => valObj[objectKey].toLowerCase().includes(searchString.toLowerCase()));

    if (this.activeFilter.selectAll && !keyEvent)
      this.activeFilter.values = this.filteredDropdownValues.map(dropObj => dropObj.key);
  }

  private formatForTreeData(treeDatas: any[]) {
    const data = treeDatas.slice().map((d) => {
      const parentNode = {
        moduleId: d.moduleId,
        name: d.moduleDesc,
        fields: []
      };
      return parentNode;
    });
    return data;
  }

  /**
   * Format Suggestion filter data based on view
   */
  formatFilterSuggestData() {
    const suggestDataSource = [];
    this.suggestedFilters.forEach(data => {
      const moduleIndex = suggestDataSource.findIndex((fc) => fc.moduleId === data.moduleId);
      if (moduleIndex === -1) {
        suggestDataSource.push({
          name: data.moduleName,
          moduleId: data.moduleId,
          fields: [data]
        });
      } else {
        const moduleDataArr = suggestDataSource[moduleIndex];
        const moduleFieldIndex = moduleDataArr.fields.findIndex((fc) => fc.fieldId === data.fieldId);
        if (moduleFieldIndex === -1) {
          suggestDataSource[moduleIndex].fields.push(data);
        }
      }
    });
    this.suggestedFiltersDataSource.data = [...suggestDataSource];
  }

  dateFilterSelected(filterMetadata) {
    this.selectedList = filterMetadata?.label
    this.dateFilterOptions = filterMetadata.options.map((op) => {
      return { key: op.value, value: op.value };
    });
    if (['static_date', 'static_range'].includes(filterMetadata.category)) {
      this.activeFilter.unit = filterMetadata.category;
    } else {
      this.activeFilter.unit = this.dateFilterOptions[0].value;
    }
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

  onSelectDeselect(checkedVal: boolean) {
    this.activeFilter.selectAll = checkedVal;
    if (checkedVal) {
      this.filterOptionSearch(this.activeFilter.serchString, 'value', false);
    } else {
      this.activeFilter.values = [];
    }
  }

  onToggleChange(toggleVal: boolean) {
    this.activeFilter.showSelected = toggleVal;
    this.filterOptionSearch(this.activeFilter.serchString, 'value', false);
  }
}

export interface TreeNode {
  fieldId: string;
  fieldDesc: string;
  picklist: string;
  dataType: string;
  isEmpty?: boolean;
}
interface TreeFlatNode {
  expandable: boolean;
  name: string;
  level: number;
  moduleId?: string;
  fields?: any[];
  isEmpty: boolean;
  fieldId?: string;
  picklist: string;
  dataType: string;
  moduleName?: string;
}

interface FieldSelectOption {
  key: string;
  value: string;
}

