import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ConditionOperator, Criteria, DisplayCriteria, OutputFormat, FormControlType, BlockType, Widget, WidgetType } from '../../../../_models/widget';
import { UserService } from '../../../../../../_services/user/userservice.service';
import * as moment from 'moment';
import { Observable, of, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { WidgetService } from '@services/widgets/widget.service';
import { TransientService } from 'mdo-ui-library';
import { ReportService } from '../../../../_service/report.service';
import { MetadataModel } from '@models/schema/schemadetailstable';
import { Metadata } from '@modules/report/edit/container/metadatafield-control/metadatafield-control.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'pros-filters-sidesheet',
  templateUrl: './filters-sidesheet.component.html',
  styleUrls: ['./filters-sidesheet.component.scss']
})

export class FiltersSidesheetComponent implements OnInit, OnDestroy {
  filterCriteria: any[] = [];
  columnDescs: any = {} as any;
  dropDownDataList: any = {};
  filterApplied: any = {};
  selectedFieldMetaData: Widget;
  filteredCriteriaList: Criteria[] = [];
  private subscription: Subscription[] = [];
  filtersForm: FormGroup;


  searchFormControl: FormControl;

  /**
   * store the date format of the user
   */
  dateFormat: string = null;
  searchDataSource: any;

  /**
   * store data of selected widget
   */
  selectedWidget: any;

  /**
   * output format option list
   */
  outputFormatList = [{ label: OutputFormat.CODE, value: DisplayCriteria.CODE }, { label: OutputFormat.TEXT, value: DisplayCriteria.TEXT }, { label: OutputFormat.CODE_TEXT, value: DisplayCriteria.CODE_TEXT }];

  /**
   * store the rule list
   */
  rulesList = [{ label: 'Is', value: ConditionOperator.EQUAL }, { label: 'Is Not', value: ConditionOperator.NOT_EQUAL }];

  /**
   * store the formated widget list
   */
  finalFormatedWidgetList = [];

  finalFormatedWidgetListObs: Observable<any[]> = of([]);

  filteredWidgetList: Widget[];
  hierarchyFilterApplied : any = {};

  /**
   * system fields metadata
   */
  systemFields: Metadata[] = [
    {
      fieldId: 'STATUS',
      fieldDescri: 'Status',
      childs: [],
      isGroup: false
    },
    {
      fieldId: 'USERMODIFIED',
      fieldDescri: 'User Modified',
      childs: [],
      isGroup: false,
      fldCtrl: {
        picklist: '1',
        dataType: 'AJAX',
        fieldId: 'USERMODIFIED',
      } as MetadataModel
    }, {
      fieldId: 'DATEMODIFIED',
      fieldDescri: 'Update Date',
      childs: [],
      isGroup: false,
      fldCtrl: {
        picklist: '0',
        dataType: 'DTMS',
        fieldId: 'DATEMODIFIED',
      } as MetadataModel
    }, {
      fieldId: 'DATECREATED',
      fieldDescri: 'Creation Date',
      childs: [],
      isGroup: false,
      fldCtrl: {
        picklist: '0',
        dataType: 'DTMS',
        fieldId: 'DATECREATED',
      } as MetadataModel
    }
  ];



  constructor(
    private router: Router,
    private reportService: ReportService,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private widgetService: WidgetService,
    private toasterService: TransientService,
    private datePipe: DatePipe
  ) {
  }

  /**
   * angular hooks
   */
  ngOnInit(): void {
    this.searchFormControl = new FormControl();
    this.initializeForm();
    this.getUserDetails();
    this.getColumnNames();
    this.searchFormControl.valueChanges.pipe(debounceTime(500)).subscribe(res => {
      this.searchHeader(res);
    })
  }

  /**
   * method call to initialize form
   */
  initializeForm() {
    this.filtersForm = this.formBuilder.group({});
  }

  /**
   * method call when click on cancel button
   */
  close() {
    this.widgetService.isSideSheetClose.next(this.filteredCriteriaList);
    this.router.navigate([{ outlets: { sb: null } }]);
  }

  /**
   * method to get the column names
   */
  getColumnNames() {
    this.filterCriteria = this.widgetService.getFilterCriteria;
    this.filteredWidgetList = this.widgetService.getFilterWidgetList;
    const keys = ['widgetId', 'displayCriteria', 'selectedValues', 'name', 'conditionOperator', 'fieldId', 'selectedDateType'];
    this.finalFormatedWidgetList = [];
    if (this.filterCriteria.length) {
      this.filteredCriteriaList = this.filterCriteria;
      const filteredCriteriaList = this.filteredCriteriaList.filter(item => item.widgetType === WidgetType.FILTER);
      filteredCriteriaList.forEach((item: Criteria) => {
        const widgetData = this.filteredWidgetList.find(widget => widget.field === item.fieldId);
        let selectedValue = [];
        let selectedDateType;
        const widgetDataType = this.getWidgetDataType(widgetData.widgetId.toString());
        if (item.conditionOperator === ConditionOperator.EQUAL) {
          if (widgetDataType === FormControlType.RADIO || widgetDataType === FormControlType.DROP_DOWN || widgetDataType === FormControlType.MULTI_SELECT) {
            selectedValue = [{ CODE: item.conditionFieldValue, TEXT: item.conditionFieldValueText }]
          } else if (widgetDataType === FormControlType.HIERARCHY) {
            const parentBool = item.parent ? item.parent : 'false';
            const parentChild = item.child ? item.child : null;
            selectedValue = [{ CODE: item.conditionFieldValue, TEXT: item.conditionFieldValueText, child: parentChild, parent: parentBool }]
          }
          else {
            selectedValue = [item.conditionFieldValue];
          }
        } else {
          // const widgetMetaData = filterWidgetMetaData.find(item => item.widgetId === +widgetData.widgetId);
          if (widgetDataType === FormControlType.TIME) {
            const startValue = { hours: new Date(Number(item.conditionFieldStartValue)).getHours(), minutes: new Date(Number(item.conditionFieldStartValue)).getMinutes() };
            const endValue = { hours: new Date(Number(item.conditionFieldEndValue)).getHours(), minutes: new Date(Number(item.conditionFieldEndValue)).getMinutes() };
            selectedValue = [{ start: startValue, end: endValue }]
          } else if (widgetDataType === FormControlType.NUMBER) {
            selectedValue = [{ start: item.conditionFieldStartValue || 0, end: item.conditionFieldEndValue }]
          } else {
            selectedDateType = item.conditionFieldValueText;
            selectedValue = [{ start: item.conditionFieldStartValue, end: item.conditionFieldEndValue }]
          }
        }
        const index = this.finalFormatedWidgetList.findIndex(widget => widget.widgetId === widgetData.widgetId);
        if (index > -1) {
          if(selectedValue[0].parent === 'true'){
            if(!this.hierarchyFilterApplied[widgetData.widgetId]){
              this.hierarchyFilterApplied[widgetData.widgetId] = [];
            }
            this.hierarchyFilterApplied[widgetData.widgetId].push(selectedValue[0]);
          }
          this.finalFormatedWidgetList[index][keys[2]].push(...selectedValue);
        } else {
          const data = {};
          data[keys[0]] = widgetData.widgetId;
          // const widgetHeaderDetail = this.getWidgetHeaderDetail(widgetData.widgetId);
          data[keys[1]] = widgetData?.widgetAdditionalProperties?.displayCriteria ? widgetData?.widgetAdditionalProperties.displayCriteria : DisplayCriteria.TEXT;
          data[keys[3]] = widgetData.widgetTitle;
          data[keys[4]] = ConditionOperator.EQUAL;
          data[keys[2]] = [...selectedValue];
          data[keys[5]] = widgetData.field;
          data[keys[6]] = selectedDateType;
          if(selectedValue[0].parent === 'true'){
            if(!this.hierarchyFilterApplied[widgetData.widgetId]){
              this.hierarchyFilterApplied[widgetData.widgetId] = [];
            }
            this.hierarchyFilterApplied[widgetData.widgetId].push(selectedValue[0]);
          }
          this.finalFormatedWidgetList.push({ ...data })
        }
      })
    }
    // else {
    if (this.finalFormatedWidgetList.length < this.filteredWidgetList.length) {
      const notAvailableFilterWidgetList = this.filteredWidgetList.filter(item => this.finalFormatedWidgetList.findIndex(widget => widget.widgetId === item.widgetId) === -1)
      notAvailableFilterWidgetList.forEach(item => {
        const data = {};
        data[keys[0]] = item.widgetId;
        const widgetData = this.widgetService.getFilterWidgetList.find(widget => widget.widgetId === item.widgetId);
        data[keys[1]] = widgetData?.widgetAdditionalProperties?.displayCriteria || DisplayCriteria.TEXT;
        data[keys[3]] = widgetData.widgetTitle;
        if (this.checkIsRangeField(item.widgetId)) {
          data[keys[4]] = ConditionOperator.RANGE;
        } else {
          data[keys[4]] = ConditionOperator.EQUAL;
        }
        data[keys[5]] = widgetData.field;
        this.finalFormatedWidgetList.push({ ...data })
      })
    }
    if (this.finalFormatedWidgetList && this.finalFormatedWidgetList.length) {
      this.selectedWidget = this.finalFormatedWidgetList[0];
    }

    this.finalFormatedWidgetListObs = of(this.finalFormatedWidgetList);
  }


  /**
   * method called when click on list items
   * @param filter filtered values for selected filters
   * @param ind index of selected value
   */
  onClickOnListItem(widget: Widget) {
    this.selectedWidget = widget;
  }

  /**
   * method called when value selected of option for single select, multi select
   * @param value value for selected options
   */
  onChange(value) {
    this.hierarchyFilterApplied[this.selectedWidget.widgetId] = [];
    const widgetType = this.getWidgetDataType(this.selectedWidget.widgetId);
    const filterWidgetIndex = this.finalFormatedWidgetList.findIndex(item => item.widgetId === this.selectedWidget.widgetId);
    if (widgetType === FormControlType.MULTI_SELECT) {
      this.finalFormatedWidgetList[filterWidgetIndex].selectedValues = Array.isArray(value) ? [...value] : [value]
    } else if (widgetType === FormControlType.HIERARCHY) {
      this.finalFormatedWidgetList[filterWidgetIndex].selectedValues = Array.isArray(value) ? [...value] : [value]
      this.hierarchyFilterApplied[this.selectedWidget.widgetId] = this.finalFormatedWidgetList[filterWidgetIndex].selectedValues.filter(item => item.parent === 'true');
    } else {
      this.finalFormatedWidgetList[filterWidgetIndex].selectedValues = Array.isArray(value) ? [...value] : [value]
    }
  }

  /**
   * method called when input value change
   * @param value value of input text
   */
  onInputValueChange(value: string) {
    if (value) {
      const selectedFilteredIndex = this.finalFormatedWidgetList.findIndex(item => item.widgetId === this.selectedWidget.widgetId);
      this.finalFormatedWidgetList[selectedFilteredIndex].selectedValues = [value];
    }
  }

  /**
   * method called when value change for selected events
   * @param event event for selected value
   */
  rangeTypeValueChange(event) {
    const formFieldType = this.getWidgetDataType(this.selectedWidget.widgetId);
    const selectedFilteredIndex = this.finalFormatedWidgetList.findIndex(item => item.widgetId === this.selectedWidget.widgetId);
    let selectedValues = [];
    if (formFieldType === FormControlType.DATE) {
      const conditionFieldStartValue = moment(event.value.start).startOf('day').valueOf().toString();
      const conditionFieldEndValue = moment(event.value.end).endOf('day').valueOf().toString();
      selectedValues = [{ start: conditionFieldStartValue, end: conditionFieldEndValue }]
    } else if (formFieldType === FormControlType.DATE_TIME) {
      const conditionFieldStartValue = moment(event.value.start).valueOf().toString();
      const conditionFieldEndValue = moment(event.value.end).valueOf().toString();
      selectedValues = [{ start: conditionFieldStartValue, end: conditionFieldEndValue }]
    } else if (formFieldType === FormControlType.TIME) {
      const conditionFieldStartValue = event.start;
      const conditionFieldEndValue = event.end;
      selectedValues = [{ start: conditionFieldStartValue, end: conditionFieldEndValue }]
    } else {
      const conditionFieldStartValue = event.value.min ? event.value.min : 0;
      const conditionFieldEndValue = event.value.max;
      selectedValues = [{ start: conditionFieldStartValue, end: conditionFieldEndValue }]
    }
    this.finalFormatedWidgetList[selectedFilteredIndex].selectedValues = [...selectedValues];
    if (Object.keys(event).indexOf('type') > -1) {
      this.finalFormatedWidgetList[selectedFilteredIndex].selectedDateType = event.type;
    }

  }


  /**
   * change the display criteria for filter widget
   * @param type updated displaycriteria
   */
  changeDisplayCriteria(type: DisplayCriteria) {
    const saveDisplayCriteria = this.widgetService.saveDisplayCriteria(this.selectedWidget.widgetId, WidgetType.FILTER, type).subscribe(res => {
      this.selectedWidget.displayCriteria = type;
      const index = this.finalFormatedWidgetList.findIndex(item => item.widgetId === this.selectedWidget.widgetId);
      if (index > -1) {
        this.finalFormatedWidgetList[index].displayCriteria = type;
        const widgetList = this.widgetService.getFilterWidgetList;
        const widgetIndex = widgetList.findIndex(item => item.widgetId === this.selectedWidget.widgetId);
        this.filteredWidgetList[widgetIndex].widgetAdditionalProperties.displayCriteria = type;
      }
    }, error => {
      console.error(`Error : ${error}`);
      this.toasterService.open(`Something went wrong`, 'Close', { duration: 3000 });
    });
    this.subscription.push(saveDisplayCriteria);

  }

  ngOnDestroy() {
    this.subscription.forEach((sub) => {
      sub.unsubscribe();
    })
  }

  /**
   * apply filter when click on apply button
   */
  applyFilter() {
    const filteredCriteriaList = [];
    this.finalFormatedWidgetList.forEach(item => {
      if (item.selectedValues && item.selectedValues.length) {
        const widgetType = this.getWidgetDataType(item.widgetId);
        if (widgetType !== FormControlType.MULTI_SELECT && widgetType !== FormControlType.HIERARCHY) {
          const filteredCriteria = new Criteria();
          filteredCriteria.fieldId = item.fieldId;
          filteredCriteria.conditionFieldId = item.fieldId;
          filteredCriteria.blockType = BlockType.COND;
          filteredCriteria.conditionOperator = ConditionOperator.EQUAL;
          filteredCriteria.widgetType = WidgetType.FILTER;
          if (widgetType === FormControlType.TEXT || widgetType === FormControlType.TEXTAREA || widgetType === FormControlType.CHECKBOX || widgetType === false) {
            filteredCriteria.conditionFieldValue = item.selectedValues[0];
          } else if (widgetType === FormControlType.DROP_DOWN || widgetType === FormControlType.RADIO) {
            filteredCriteria.conditionFieldValue = item.selectedValues[0].CODE;
            filteredCriteria.conditionFieldValueText = item.selectedValues[0].TEXT;
            if(item.datasetType === 'diw_dataset') {
              filteredCriteria.fieldId = '__DIW_STATUS';
              filteredCriteria.conditionFieldId = '__DIW_STATUS';
            }
          } else if (widgetType === FormControlType.DATE || widgetType === FormControlType.DATE_TIME || widgetType === FormControlType.NUMBER) {
            filteredCriteria.conditionOperator = ConditionOperator.RANGE;
            filteredCriteria.conditionFieldStartValue = item.selectedValues[0].start ? item.selectedValues[0].start : 0;
            filteredCriteria.conditionFieldEndValue = item.selectedValues[0].end;
            const selectedFilteredIndex = this.finalFormatedWidgetList.findIndex(el => el.fieldId === item.fieldId);
            filteredCriteria.conditionFieldValueText = this.finalFormatedWidgetList[selectedFilteredIndex].selectedDateType;
          } else if (widgetType === FormControlType.TIME) {
            filteredCriteria.conditionOperator = ConditionOperator.RANGE;
            filteredCriteria.conditionFieldStartValue = new Date().setHours(item.selectedValues[0].start?.hours, item.selectedValues[0].start?.minutes).toString();
            filteredCriteria.conditionFieldEndValue = new Date().setHours(item.selectedValues[0].start?.hours, item.selectedValues[0].end?.minutes).toString();
          }
          filteredCriteriaList.push(filteredCriteria);
        }
        else {
          item.selectedValues.forEach((el, index) => {
            const filteredCriteria = new Criteria();
            filteredCriteria.fieldId = item.fieldId;
            filteredCriteria.conditionFieldId = item.fieldId;
            filteredCriteria.blockType = BlockType.COND;
            filteredCriteria.conditionOperator = item.conditionOperator;
            filteredCriteria.widgetType = WidgetType.FILTER;
            filteredCriteria.conditionFieldValue = el.CODE;
            filteredCriteria.conditionFieldValueText = el.TEXT;
            if (widgetType === FormControlType.HIERARCHY){
              filteredCriteria.parent = el.parent;
              filteredCriteria.child = el.child;
            }
            filteredCriteriaList.push(filteredCriteria);
          })
        }
      }
    })
    this.widgetService.setFilterWidgetList(this.filteredWidgetList);
    this.widgetService.isSideSheetClose.next(filteredCriteriaList);
    this.router.navigate([{ outlets: { sb: null } }]);
  }

  /**
   * Return the widget type
   * @param widgetId widget id
   * @returns widget type
   */
  getWidgetDataType(widgetId: string): FormControlType | boolean {
    const widgetData = this.getWidgetData(widgetId);
    let hasFld = widgetData?.fieldCtrl;
    if (!hasFld) {
      if (widgetData.datasetType === 'diw_dataset') {
        return FormControlType.DROP_DOWN;
      }
      hasFld = this.systemFields.find(field => field.fieldId === widgetData.field)?.fldCtrl;
    }
    if (hasFld?.picklist || hasFld?.dataType) {
      if (hasFld.picklist === '52') {
        return FormControlType.DATE;
      } else if (hasFld.picklist === '53') {
        return FormControlType.DATE_TIME;
      } else if (hasFld.dataType === 'TIMS') {
        return FormControlType.TIME;
      }
      else if (hasFld.picklist === '1' || hasFld.picklist === '30' || hasFld.picklist === '37') {
        if (hasFld.isCheckList === 'true') {
          return FormControlType.MULTI_SELECT;
        }
        else
          return FormControlType.DROP_DOWN;
      } else if (hasFld.picklist === '0') {
        if (hasFld.dataType === 'CHAR' || hasFld.dataType === 'ALTN' || hasFld.dataType === 'ICSN' || hasFld.dataType === 'REQ' || hasFld.dataType === 'TEXT') {
          return FormControlType.TEXT;
        } else if (hasFld.dataType === 'NUMC' || hasFld.dataType === 'DEC') {
          return FormControlType.NUMBER
        } else {
          return false;
        }
      } else if (hasFld.picklist === '2') {
        return FormControlType.CHECKBOX;
      } else if (hasFld.picklist === '4' || hasFld.picklist === '35') {
        return FormControlType.RADIO;
      } else if (hasFld.picklist === '22' && hasFld.dataType === 'CHAR') {
        return FormControlType.TEXTAREA;
      } else if (hasFld.picklist === '29') {
        return FormControlType.HIERARCHY
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /**
   * return the selected date value
   * @returns return the selected date value
   */
  public getSelectedDateValue(widget) {
    if (widget.selectedDateType !== 'sp_date' && widget.selectedDateType !== 'date_range') {
      return widget.selectedDateType.replaceAll('_', ' ');
    } else if (widget.selectedDateType === 'sp_date') {
      return this.datePipe.transform(widget.selectedValues[0].start, this.dateFormat);
    } else if (widget.selectedDateType === 'date_range') {
      return this.datePipe.transform(widget.selectedValues[0].start, this.dateFormat) + '-' + this.datePipe.transform(widget.selectedValues[0].end, this.dateFormat);
    } else return '';
  }


  /**
   * return the selected time value for selected component
   * @returns selected time value
   */
  getSelectedTimeValue() {
    return { ...this.selectedWidget.selectedValues[0] };
  }


  /**
   * Method call to get the date format
   */
  public getUserDetails() {
    const sub = this.userService.getUserDetails().subscribe(user => {
      switch (user.dateformat?.toLowerCase()) {
        case 'mm.dd.yy':
          this.dateFormat = 'MM.dd.yyyy, h:mm:ss a';
          break;

        case 'dd.mm.yy':
          this.dateFormat = 'dd.MM.yyyy, h:mm:ss a';
          break;

        case 'dd m, yy':
          this.dateFormat = 'dd MMM, yyyy, h:mm:ss a';
          break;

        case 'mm d, yy':
          this.dateFormat = 'MMMM d, yyyy, h:mm:ss a';
          break;

        default:
          break;
      }
    }, (error) => {
      console.log('Something went wrong while getting user details.', error.message)
    });
    this.subscription.push(sub);
  }

  getDateTypeValue(val: string): string {
    return Number(val) ? val : '';
  }

  /**
   *
   * @param widgetId widget id of the selected widget
   * @returns the selected range value
   */
  getPreSelectedRangeValue(widgetId) {
    const data = this.finalFormatedWidgetList.find(item => item.widgetId === widgetId);
    if (data && data.selectedValues?.length) {
      return { min: data.selectedValues[0].start, max: data.selectedValues[0].end }
    }
  }

  /**
   * function to search headers from search bar
   * @param value string to be searched
   */
  searchHeader(value: string) {
    if (value && value.trim() !== '') {
      const headers = this.finalFormatedWidgetList.filter(header => header.name && header.name.toLocaleLowerCase().includes(value.toLocaleLowerCase()));
      this.finalFormatedWidgetListObs = of(headers);
    } else {
      this.finalFormatedWidgetListObs = of(this.finalFormatedWidgetList)
    }
  }

  /**
   * check selected widget is of data/time/data_time/number
   * @param widgetId widget id of the selected field
   * @returns boolean value
   */
  public checkIsRangeField(widgetId) {
    const widgetDataType = this.getWidgetDataType(widgetId);
    if (widgetDataType === FormControlType.DATE || widgetDataType === FormControlType.DATE_TIME || widgetDataType === FormControlType.NUMBER || widgetDataType === FormControlType.TIME) {
      return true;
    } else {
      return false
    }
  }

  /**
   * return the selected value of the widget
   * @param widgetId widget id of the field
   * @returns selected value of the widget
   */

  public getSelectedValue(widgetId) {
    if (this.selectedWidget) {
      const index = this.finalFormatedWidgetList.findIndex(item => item.widgetId === this.selectedWidget.widgetId);
      const widgetType = this.getWidgetDataType(widgetId);
      if (widgetType === FormControlType.TEXTAREA || widgetType === FormControlType.CHECKBOX || widgetType === FormControlType.TEXT || widgetType === FormControlType.DROP_DOWN || widgetType === FormControlType.RADIO || widgetType === FormControlType.TIME) {
        return this.selectedWidget.selectedValues ? this.selectedWidget.selectedValues[0] : null
      }
      if (widgetType === FormControlType.MULTI_SELECT || widgetType === FormControlType.HIERARCHY) {
        return this.selectedWidget.selectedValues ? [...this.selectedWidget.selectedValues] : []
      }
      if (widgetType === FormControlType.DATE_TIME || widgetType === FormControlType.DATE) {
        return {
          value: this.selectedWidget.selectedValues ? this.selectedWidget.selectedValues[0] : null,
          type: this.finalFormatedWidgetList[index].selectedDateType ? this.finalFormatedWidgetList[index].selectedDateType : null
        }
      }


    }
  }

  /**
   * Remove the selected filter from the lib chip
   * @param code code of the selected value
   * @param index index of lib chip
   */
  removedSelectedFilter(code: string, index: number) {
    const ind = this.filteredCriteriaList.findIndex(item => this.selectedWidget.fieldId === item.fieldId && item.conditionFieldValue === code);
    this.filteredCriteriaList.splice(ind, 1);
    const type = this.getWidgetDataType(this.selectedWidget.widgetId)
    if (type === FormControlType.MULTI_SELECT) {
      const i = this.finalFormatedWidgetList.findIndex(item => item.fieldId === this.selectedWidget.fieldId && item.selectedValues.findIndex(value => value.CODE === code) > -1)
      if (i > -1) {
        const conditionFieldIndex = this.finalFormatedWidgetList[i].selectedValues.findIndex(item => item.CODE === code);
        this.finalFormatedWidgetList[i].selectedValues.splice(conditionFieldIndex, 1);
      }
    } else if(type === FormControlType.HIERARCHY){
      const i = this.finalFormatedWidgetList.findIndex(item => item.fieldId === this.selectedWidget.fieldId && item.selectedValues.findIndex(value => value.CODE === code) > -1)
      if (i > -1) {
        const conditionFieldIndex = this.finalFormatedWidgetList[i].selectedValues.findIndex(item => item.CODE === code);
        if(this.finalFormatedWidgetList[i].selectedValues[conditionFieldIndex].parent === 'true'){
          this.hierarchyFilterApplied[this.selectedWidget.widgetId] = this.hierarchyFilterApplied[this.selectedWidget.widgetId].filter(el => el.CODE !== code);
        }
        if (this.finalFormatedWidgetList[i].selectedValues[conditionFieldIndex].child && this.finalFormatedWidgetList[i].selectedValues[conditionFieldIndex].child.length){
          this.removeSelectedHierachyChild(this.finalFormatedWidgetList[i].selectedValues[conditionFieldIndex].child);
        }
        this.finalFormatedWidgetList[i].selectedValues.splice(conditionFieldIndex, 1);
      }
    } else {
      const filteredIndex = this.finalFormatedWidgetList.findIndex(item => item.fieldId === this.selectedWidget.fieldId && item.conditionFieldValue === code);
      this.finalFormatedWidgetList[filteredIndex].conditionFieldValue = null
    }
  }
  /**
   * Remove child nodes of removed selected filter
   * @param childData data to be removed
   */
  removeSelectedHierachyChild(childData){
    childData.forEach(itemChild => {
      const i = this.finalFormatedWidgetList.findIndex(item => item.fieldId === this.selectedWidget.fieldId && item.selectedValues.findIndex(value => value.CODE === itemChild.nodeId) > -1)
      if(i > -1) {
        const conditionFieldIndex = this.finalFormatedWidgetList[i].selectedValues.findIndex(item => item.CODE === itemChild.nodeId);
        this.finalFormatedWidgetList[i].selectedValues.splice(conditionFieldIndex, 1);
      }
      if(itemChild.child && itemChild.child.length){
        this.removeSelectedHierachyChild(itemChild.child);
      }
    });
  }

  getWidgetData(widgetId: string) {
    return this.widgetService.getFilterWidgetList.find(item => Number(item.widgetId) === Number(widgetId));
  }
  clearSelectedFilter(event) {
    const index = this.finalFormatedWidgetList.findIndex(item => item.widgetId === event.widgetId);
    if (index > -1) {
      this.finalFormatedWidgetList[index].selectedValues = null;
    }
    if(this.hierarchyFilterApplied[this.selectedWidget.widgetId]){
      this.hierarchyFilterApplied[this.selectedWidget.widgetId] = [];
    }
  }

}
