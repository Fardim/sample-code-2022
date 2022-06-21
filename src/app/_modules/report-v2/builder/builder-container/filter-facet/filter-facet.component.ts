import { Component, OnInit, OnChanges, OnDestroy, Input, LOCALE_ID, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { WidgetService } from 'src/app/_services/widgets/widget.service';
import { GenericWidgetComponent } from '../../generic-widget/generic-widget.component';
import * as moment from 'moment';
import { BlockType, Criteria, DisplayCriteria, WidgetType, ConditionOperator, FormControlType } from '@modules/report-v2/_models/widget';
import { UserService } from '@services/user/userservice.service';
import { isEqual } from 'lodash';
import { Metadata } from '@modules/report/edit/container/metadatafield-control/metadatafield-control.component';
import { MetadataModel } from '@models/schema/schemadetailstable';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'pros-filter-facet',
  templateUrl: './filter-facet.component.html',
  styleUrls: ['./filter-facet.component.scss'],
})
export class FilterFacetComponent extends GenericWidgetComponent implements OnInit, OnChanges, OnDestroy {

  /**
   * array to store display criteria for all filter widgets
   */
  displayCriteriaOption: DisplayCriteria;
  /**
   * store last value in the bucket array
   */
  searchAfter: string;
  /**
   * store search string value
   */
  searchString: string;

  /**
   * When reset filter from main container value should be true
   */
  @Input()
  hasFilterCriteria: boolean;

  /** To check clear filter clicked or not */
  isClearFilter = false;

  subscriptions: Subscription[] = [];

  /**
   * store details for selected widget values
   */
  widgetSelectedValue: any;

  /**
   * flag to enable clear icon on chips
   */
  enableClearIcon: boolean;

  dateFormat: string;

  @Input() editedMode: boolean;

  isMenuClosed: boolean;


  /**
   * system fields metadata
   */
  systemFields: Metadata[] = [
    {
      fieldId: 'STATUS',
      fieldDescri: 'Status',
      childs: [],
      isGroup: false,
      fldCtrl: {
        picklist: '1',
        fieldId: 'STATUS'
      } as MetadataModel
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


  /**
   * Constructor of Class
   */
  constructor(
    private widgetService: WidgetService,
    private userService: UserService,
    private datePipe: DatePipe,
    private dialog: MatDialog,
    @Inject(LOCALE_ID) public locale: string,
    private sharedService: SharedServiceService
  ) {
    super();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  /**
   * Automatic angular trigger when the filterCriteria changed by dashboard container
   *
   */
  ngOnChanges(changes: import('@angular/core').SimpleChanges): void {
    if (changes && changes.hasFilterCriteria && !isEqual(changes.hasFilterCriteria.currentValue, changes.hasFilterCriteria.previousValue) && changes.hasFilterCriteria.currentValue) {
      this.clearFilterCriteria();
    }

    if (changes && changes.widgetInfo && !isEqual(changes.widgetInfo.previousValue, changes.widgetInfo.currentValue)) {
        if (!this.widgetInfo.fieldCtrl) {
          const systemFields = this.systemFields.find(item => item.fieldId === this.widgetInfo.field);
          if (systemFields) {
            this.widgetInfo.fieldCtrl = systemFields.fldCtrl;
          }
        }
        this.checkForDefaultDateSelected();
      }
    // }

      if(changes && changes.reportId && changes.reportId.currentValue !== changes.reportId.previousValue) {
        this.widgetService.setFilterCriteria([]);
        this.widgetSelectedValue = null;
      }
    }

    ngOnInit(): void {
      this.getUserDetails();
      if (!this.widgetInfo.fieldCtrl) {
      const systemFields = this.systemFields.find(item => item.fieldId === this.widgetInfo.field);
      if (systemFields) {
        this.widgetInfo.fieldCtrl = systemFields.fldCtrl;
      }
    }
  // add condition to set default date ctrl value
    if(this.getWidgetType() === FormControlType.DATE_TIME || this.getWidgetType() === FormControlType.DATE) {
      this.checkForDefaultDateSelected();
    }
    if (this.widgetService.getFilterCriteria.length)
      this.checkForSelectedValue(this.widgetService.getFilterCriteria);
    this.displayCriteriaOption = this.widgetInfo?.widgetAdditionalProperties?.displayCriteria || DisplayCriteria.TEXT;
    this.widgetService.isSideSheetClose.subscribe((res: Criteria[]) => {
      this.widgetSelectedValue = null;
      this.checkForSelectedValue(res);
      const filteredWidgetData = this.widgetService.getFilterWidgetList.find(item => +item.widgetId === this.widgetId);
      this.displayCriteriaOption = filteredWidgetData?.widgetAdditionalProperties?.displayCriteria || DisplayCriteria.TEXT
      this.filterCriteria = res;
      this.widgetService.setFilterCriteria(this.filterCriteria);
      this.emitEvtFilterCriteria(this.filterCriteria);
    })
  }

  emitEvtFilterCriteria(criteria: Criteria[]): void {
    this.evtFilterCriteria.emit(criteria);
    this.sharedService.setFilterCriteriaData(criteria);
  }

  /**
   * Preapare data to show as a labal ..
   * @param ctrl get filter control and prepare data for view
   */
  get prepareTextToShow(): string {
    if (this.widgetSelectedValue) {
      const widgetType = this.getWidgetType();
      if (widgetType === FormControlType.MULTI_SELECT) {
        if (this.widgetSelectedValue.length > 1) {
          return String(this.widgetSelectedValue.length)
        } else {
          return this.widgetSelectedValue[0] && this.getLabel(this.widgetSelectedValue[0], this.displayCriteriaOption)
        }
      } else if(widgetType === FormControlType.HIERARCHY){
        const hieWidgetSelected = this.widgetSelectedValue && this.widgetSelectedValue.filter(hie => hie.parent === 'true');
        if(hieWidgetSelected.length > 1){
          return String(hieWidgetSelected.length);
        } else {
          return hieWidgetSelected[0] && this.getLabel(hieWidgetSelected[0], this.displayCriteriaOption)
        }
      } else if (widgetType === FormControlType.TEXT || widgetType === FormControlType.CHECKBOX || widgetType === FormControlType.TEXTAREA) {
        return this.widgetSelectedValue;
      }
      else if (widgetType === FormControlType.RADIO) {
        return (this.widgetSelectedValue && this.getLabel(this.widgetSelectedValue, this.displayCriteriaOption))
      } else if (widgetType === FormControlType.DROP_DOWN && this.widgetSelectedValue) {
        const selectedOption = { CODE: this.widgetSelectedValue.CODE, TEXT: this.widgetSelectedValue.TEXT };
        return this.getLabel(selectedOption, this.displayCriteriaOption);
      }
      else if (widgetType === FormControlType.NUMBER) {
        return (this.widgetSelectedValue && this.widgetSelectedValue.min ? this.widgetSelectedValue.min + ' - ' + this.widgetSelectedValue.max : '0 - ' + this.widgetSelectedValue.max)
      } else if (widgetType === FormControlType.DATE || widgetType === FormControlType.DATE_TIME) {
        if (this.widgetSelectedValue.type === 'sp_date') {
          return this.datePipe.transform(this.widgetSelectedValue.value.start, this.dateFormat);
        }
        else if (this.widgetSelectedValue.type === 'date_range') {
          return (this.widgetSelectedValue ? this.datePipe.transform(this.widgetSelectedValue.value.start, this.dateFormat) + '-' + this.datePipe.transform(this.widgetSelectedValue.value.end, this.dateFormat) : '')
        }
        else {
          return this.widgetSelectedValue.type && this.widgetSelectedValue.type.replaceAll('_', ' ');
        }
      } else if (widgetType === FormControlType.TIME) {
        return (this.widgetSelectedValue.start && this.widgetSelectedValue.start.hours ? this.widgetSelectedValue.start.hours + ' hr ' + this.widgetSelectedValue.start.minutes + ' min - ' + this.widgetSelectedValue.end.hours + ' hr ' + this.widgetSelectedValue.end.minutes + ' min' : '')
      }
    } else {
      return 'All'
    }
  }

  updateFilterCriteria(option: any) {
    let selectedFilterCriteria = [...this.filterCriteria];
    selectedFilterCriteria = this.removeOldFilterCriteria();
    const widgetType = this.getWidgetType();
    const criteria: Criteria = new Criteria();
    criteria.fieldId = this.widgetInfo.field;
    criteria.conditionFieldId = this.widgetInfo.field;
    criteria.blockType = BlockType.COND;
    criteria.widgetType = WidgetType.FILTER;
    criteria.fieldCtrl = this.widgetInfo.fieldCtrl;
    if(this.widgetInfo.datasetType === 'diw_dataset') {
      criteria.fieldId = '__DIW_STATUS';
      criteria.conditionFieldId = '__DIW_STATUS';
    }
    if (widgetType === FormControlType.DATE || widgetType === FormControlType.DATE_TIME) {
      criteria.conditionOperator = ConditionOperator.RANGE;
      criteria.conditionFieldValueText = option.type;
      if (widgetType === FormControlType.DATE) {
        criteria.conditionFieldStartValue = moment(option.value.start).startOf('day').valueOf().toString();
        criteria.conditionFieldEndValue = moment(option.value.end).endOf('day').valueOf().toString();
      } else {
        criteria.conditionFieldStartValue = moment(option.value.start).valueOf().toString();
        criteria.conditionFieldEndValue = moment(option.value.end).valueOf().toString();
      }
      selectedFilterCriteria.push({ ...criteria })
    }
    else if (widgetType === FormControlType.TIME) {
      criteria.conditionOperator = ConditionOperator.RANGE;
      criteria.conditionFieldStartValue = new Date().setHours(option.start.hours, option.start.minutes).toString();
      criteria.conditionFieldEndValue = new Date().setHours(option.end.hours, option.end.minutes).toString();
      selectedFilterCriteria.push({ ...criteria });
    }
    else if (widgetType === FormControlType.MULTI_SELECT || widgetType === FormControlType.DROP_DOWN || widgetType === FormControlType.RADIO) {
      if (this.widgetInfo?.fieldCtrl?.isCheckList === 'true' || widgetType === FormControlType.MULTI_SELECT) {
        option.forEach(item => {
          criteria.conditionFieldValue = item.CODE ? item.CODE : '';
          criteria.conditionOperator = ConditionOperator.EQUAL;
          criteria.conditionFieldValueText = item.TEXT
          selectedFilterCriteria.push({ ...criteria });
        })
      }
      else {
        criteria.conditionFieldValue = option.CODE
        if (option.FIELDNAME === 'TIME_TAKEN') {
          criteria.conditionOperator = ConditionOperator.LESS_THAN_EQUAL;
        } else {
          criteria.conditionOperator = ConditionOperator.EQUAL;
        }
        criteria.conditionFieldValueText = option.TEXT;
        selectedFilterCriteria.push(criteria);
      }
    }
    else if (widgetType === FormControlType.NUMBER) {
      criteria.conditionFieldStartValue = option.min ? option.min : 0;
      criteria.conditionFieldEndValue = option.max
      criteria.conditionOperator = ConditionOperator.RANGE;
      selectedFilterCriteria.push({ ...criteria });
    } else if (widgetType === FormControlType.TEXT || widgetType === FormControlType.TEXTAREA) {
      criteria.conditionOperator = ConditionOperator.EQUAL;
      criteria.conditionFieldValue = option;
      selectedFilterCriteria.push({ ...criteria });
    }
    else if (widgetType === FormControlType.HIERARCHY) {
      option.forEach(item => {
        criteria.conditionOperator = ConditionOperator.EQUAL;
        criteria.conditionFieldValue = item.CODE;
        criteria.conditionFieldValueText = item.TEXT;
        criteria.parent = item.parent ? item.parent : 'false';
        criteria.child = item.child ? item.child : null;
        selectedFilterCriteria.push({ ...criteria });
      })
    }
    else {
      criteria.conditionOperator = ConditionOperator.EQUAL;
      criteria.conditionFieldValue = option;
      selectedFilterCriteria.push({ ...criteria });
    }

    // date,date time and time is pending
    this.filterCriteria = [...selectedFilterCriteria];
    this.widgetSelectedValue = Array.isArray(option) ? option.length > 0 ? option : null : option;
    this.widgetService.setFilterCriteria(this.filterCriteria);
    this.emitEvtFilterCriteria(this.filterCriteria);
  }

  /**
   * Remove old filter criteria for field
   * selectedOptions as parameter
   */
  removeOldFilterCriteria() {
    const selectedFilterCriteria = [...this.filterCriteria]
    return selectedFilterCriteria.filter(filter => filter.conditionFieldId !== this.widgetInfo.field)
  }


  clearFilterCriteria() {
    this.filterCriteria = [];
    this.widgetSelectedValue = null;
    this.isClearFilter = !this.isClearFilter;
    this.widgetService.setFilterCriteria(this.filterCriteria);
  }

  removeAppliedFilter(fieldId) {
    this.filterCriteria = this.filterCriteria.filter(item => item.fieldId !== fieldId && item.widgetType === WidgetType.FILTER);
    this.widgetSelectedValue = null;
    this.emitEvtFilterCriteria(this.filterCriteria);
    this.widgetService.setFilterCriteria(this.filterCriteria);
  }

  getPreSelectedRangeValue() {
    return this.widgetSelectedValue;
  }

  get getWidgetName() {
    if (this.widgetInfo?.widgetTitle) {
      return this.widgetInfo.widgetTitle;
    } else {
      return 'Unknown'
    }
  }

  getChipClass() {
    if (this.getWidgetName.length > 30 && this.prepareTextToShow && this.prepareTextToShow.length < 10) {
      return 'filter-name-chip';
    }

    if (this.getWidgetName.length < 30 && this.prepareTextToShow && this.prepareTextToShow.length > 10) {
      return 'filter-value-chip';
    }

    if (this.getWidgetName.length > 30 && this.prepareTextToShow && this.prepareTextToShow.length > 10) {
      return 'long-chip';
    }
  }

  public getWidgetType() {
    const isMultiSelect = this.widgetInfo.isMultiSelect;
    if(this.widgetInfo.datasetType === 'diw_dataset') {
      return FormControlType.DROP_DOWN;
    }
    let hasFld = this.widgetInfo.fieldCtrl;
    if (!hasFld) {
      hasFld = this.systemFields.find(item => item.fieldId === this.widgetInfo.field)?.fldCtrl;
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
        if (hasFld.isCheckList === 'true' || (isMultiSelect && this.widgetInfo.widgetType === WidgetType.FILTER)) {
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
      }
      else {
        return false;
      }
    } else {
      return false;
    }
  }
  /**
   * Method call to get the date format
   */
  public getUserDetails() {
    const sub = this.userService.getUserDetails().pipe(distinctUntilChanged()).subscribe(user => {
      switch (user.dateformat?.toLowerCase()) {
        case 'mm.dd.yy':
          this.dateFormat = 'MM.dd.yyyy, HH:mm:ss';
          break;

        case 'dd.mm.yy':
          this.dateFormat = 'dd.MM.yyyy, HH:mm:ss';
          break;

        case 'dd m, yy':
          this.dateFormat = 'dd MMM, yyyy, HH:mm:ss';
          break;

        case 'mm d, yy':
          this.dateFormat = 'MMMM d, yyyy, HH:mm:ss';
          break;

        default:
          break;
      }
    }, (error) => {
      console.log('Something went wrong while getting user details.', error.message)
    });
    this.subscriptions.push(sub);
  }


  get getSelectedDateValue() {
    if (this.widgetSelectedValue) {
      return {
        value: this.widgetSelectedValue.value ? this.widgetSelectedValue.value : { start: '', end: '' },
        type: this.widgetSelectedValue.type ? this.widgetSelectedValue.type : ''
      }
    } else {
      return null;
    }
  }

  getLabel(option, displayCriteria) {
    if (displayCriteria === 'CODE_TEXT') {
      return option.CODE + '-' + option.TEXT
    } else if (displayCriteria === 'CODE') {
      return option.CODE;
    } else {
      return option.TEXT;
    }
  }

  menuClosed() {
    this.isMenuClosed = true;;
  }

  openMenu(event) {
    event.stopPropagation();
    this.isMenuClosed = false;
  }

  deleteFilter() {
    this.deleteWidget.emit()
  }

  checkForSelectedValue(filterCriteriaList) {
    const selectedFilters = filterCriteriaList.filter(widget => widget.fieldId === this.widgetInfo.field);
    const widgetType = this.getWidgetType();
    if (selectedFilters.length) {
      if (widgetType === FormControlType.MULTI_SELECT) {
        this.widgetSelectedValue = [];
        selectedFilters.forEach(item => {
          const selectedValue = { CODE: item.conditionFieldValue, TEXT: item.conditionFieldValueText }
          this.widgetSelectedValue.push({ ...selectedValue });
        })
      } else if (widgetType === FormControlType.DROP_DOWN || widgetType === FormControlType.RADIO) {
        this.widgetSelectedValue = { CODE: selectedFilters[0].conditionFieldValue, TEXT: selectedFilters[0].conditionFieldValueText }
      } else if (widgetType === FormControlType.TEXT || widgetType === FormControlType.TEXTAREA || widgetType === FormControlType.CHECKBOX) {
        this.widgetSelectedValue = selectedFilters[0].conditionFieldValue
      } else if (widgetType === FormControlType.NUMBER) {
        this.widgetSelectedValue = { min: selectedFilters[0].conditionFieldStartValue, max: selectedFilters[0].conditionFieldEndValue };
      } else if (widgetType === FormControlType.DATE || widgetType === FormControlType.DATE_TIME) {
        const selectedValue = {
          value: { start: new Date(Number(selectedFilters[0].conditionFieldStartValue)), end: new Date(Number(selectedFilters[0].conditionFieldEndValue)) },
          type: selectedFilters[0].conditionFieldValueText
        }
        this.widgetSelectedValue = { ...selectedValue };
      } else if (widgetType === FormControlType.TIME) {
        const startValue = { hours: new Date(Number(selectedFilters[0].conditionFieldStartValue)).getHours(), minutes: new Date(Number(selectedFilters[0].conditionFieldStartValue)).getMinutes() };
        const endValue = { hours: new Date(Number(selectedFilters[0].conditionFieldEndValue)).getHours(), minutes: new Date(Number(selectedFilters[0].conditionFieldEndValue)).getMinutes() };
        this.widgetSelectedValue = { start: startValue, end: endValue };
      } else if (widgetType === FormControlType.HIERARCHY) {
        this.widgetSelectedValue = [];
        selectedFilters.forEach(item => {
          const selectedValues = { CODE: item.conditionFieldValue, TEXT: item.conditionFieldValueText, parent: item.parent, child: item.child };
          this.widgetSelectedValue.push({ ...selectedValues })
        })
      }
    }
  }

  /**
   * method to set the widget selected value for date filter
   */
  checkForDefaultDateSelected() {
    if(this.widgetInfo.dateFilterCtrl?.dateSelectedFor) {
      let selectedValue;
      if(this.widgetInfo.dateFilterCtrl.dateSelectedFor === 'CUSTOM' && this.widgetInfo.dateFilterCtrl.startDate){
        selectedValue = {
          value: { start: new Date(this.widgetInfo.dateFilterCtrl.startDate), end: new Date(this.widgetInfo.dateFilterCtrl.endDate)},
          type: 'date_range'
        }
      } else if(this.widgetInfo.dateFilterCtrl.dateSelectedFor === 'TODAY') {
        selectedValue = {
          value: { start: new Date()},
          type: 'sp_date'
        }
      } else if (this.widgetInfo.dateFilterCtrl.dateSelectedFor === 'DAY_7' || this.widgetInfo.dateFilterCtrl.dateSelectedFor === 'DAY_10'
                 || this.widgetInfo.dateFilterCtrl.dateSelectedFor === 'DAY_20' || this.widgetInfo.dateFilterCtrl.dateSelectedFor === 'DAY_30'){
        const days = this.widgetInfo.dateFilterCtrl?.dateSelectedFor.split('_')[1]
        if(days) {
          selectedValue = {
            value: { start: new Date(moment().subtract(days,'day').valueOf()), end: new Date() },
            type: 'date_range'
          }
        }
      }
      this.widgetSelectedValue = {...selectedValue};
      this.updateFilterCriteria(this.widgetSelectedValue);
    }
  }
}


