import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConditionOperator, Criteria, DisplayCriteria, ReportingWidget, OutputFormat, FormControlType, BlockType } from '@modules/report/_models/widget';
import { ReportService } from '@modules/report/_service/report.service';
import { UserService } from '@services/user/userservice.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';


@Component({
  selector: 'pros-configure-filters',
  templateUrl: './configure-filters.component.html',
  styleUrls: ['./configure-filters.component.scss']
})
export class ConfigureFiltersComponent implements OnInit, OnDestroy {
  filterCriteria: any[] = [];
  columnDescs: any = {} as any;
  tableColumnMetaData: ReportingWidget[];
  selectedFilter: Criteria;
  dropDownDataList: any = {};
  filterApplied: any = {};
  selectedFieldMetaData: ReportingWidget;
  filteredCriteriaList: Criteria[] = [];
  private subscription: Subscription[] = [];
  configurationFilterForm: FormGroup;
  outputFormatList = [{ label: OutputFormat.CODE, value: DisplayCriteria.CODE }, { label: OutputFormat.TEXT, value: DisplayCriteria.TEXT }, { label: OutputFormat.CODE_TEXT, value: DisplayCriteria.CODE_TEXT }];
  rulesList = [{ label: 'Is', value: ConditionOperator.EQUAL }, { label: 'Is Not', value: ConditionOperator.NOT_EQUAL }];
  dateFormat: string = null;
  widgetId : number;

  constructor(
    private router: Router,
    private reportService: ReportService,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private activatedRoute:ActivatedRoute
  ) {
  }

  /**
   * angular hooks
   */
  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params=>{
      this.widgetId = params.widgetId;
    })
    this.initializeForm();
    this.getUserDetails();
    this.getColumnNames();
  }

  /**
   * method call to initialize form
   */
  initializeForm() {
    this.configurationFilterForm = this.formBuilder.group({});
  }

  /**
   * method call when click on cancel button
   */
  close() {
    this.router.navigate([{ outlets: { sb: null } }]);
  }

  /**
   * method to get the column names
   */
  getColumnNames() {
    const fieldsArray = [];
    this.tableColumnMetaData = this.reportService.getColumnMetaData(this.widgetId);
    this.tableColumnMetaData.forEach(singlerow => {
      const obj = { fields: singlerow.fields, fieldOrder: singlerow.fieldOrder }
      fieldsArray.push(obj);
      this.columnDescs[singlerow.fields] = singlerow.fieldDesc ? singlerow.fieldDesc : singlerow.fldMetaData.fieldDescri;
    });
    const filteredCriteriaList = this.reportService.getFilterCriteria(this.widgetId);
    if (filteredCriteriaList && filteredCriteriaList.length) {
      filteredCriteriaList.forEach(item => {
        const type = this.getFormFieldType(item.fieldId);
        if (type === FormControlType.MULTI_SELECT) {
          const filteredIndex = this.filterCriteria.findIndex(filterData => item.fieldId === filterData.fieldId);
          if (filteredIndex > -1) {
            this.filterCriteria[filteredIndex].conditionFieldValue.push(item.conditionFieldValue);
            this.filterCriteria[filteredIndex].conditionFieldValueText.push(item.conditionFieldValueText)
          } else {
            this.filterCriteria.push({ ...item, conditionFieldValue: [item.conditionFieldValue], conditionFieldValueText: [item.conditionFieldValueText] })
          }
        } else if (type === FormControlType.TIME) {
          const startValue = { hours: new Date(Number(item.conditionFieldStartValue)).getHours(), minutes: new Date(Number(item.conditionFieldStartValue)).getMinutes() };
          const endValue = { hours: new Date(Number(item.conditionFieldEndValue)).getHours(), minutes: new Date(Number(item.conditionFieldEndValue)).getMinutes() };
          this.filterCriteria.push({ ...item, conditionFieldStartValue: startValue, conditionFieldEndValue: endValue });
        }
        else {
          this.filterCriteria.push({ ...item });
        }
      })
    }
    this.tableColumnMetaData.forEach(item => {
      const filteredIndex = this.filterCriteria.findIndex(el => el.fieldId === item.fields);
      if (filteredIndex === -1) {
        this.filterCriteria.push({ fieldId: item.fields })
      }
    })
    this.filterCriteria.forEach((item) => {
      if (item.conditionFieldValue) {
        const type = this.getFormFieldType(item.fieldId)
        if (type === FormControlType.MULTI_SELECT || type === FormControlType.RADIO || type === FormControlType.CHECKBOX || type === FormControlType.DROP_DOWN) {
          this.getDropDownValue(item);
        }
      }
    })

    if (this.filterCriteria && this.filterCriteria.length) {
      this.selectedFilter = this.filterCriteria[0];
      this.configurationFilterForm.addControl(this.selectedFilter.fieldId, new FormControl());
      const type = this.getFormFieldType(this.selectedFilter.fieldId);
      if (type === FormControlType.TEXT || type === FormControlType.TEXTAREA || type === FormControlType.CHECKBOX || type === FormControlType.RADIO || type === false) {
        this.configurationFilterForm.controls[this.selectedFilter.fieldId].setValue(this.selectedFilter.conditionFieldValue);
      } else if (type === FormControlType.NUMBER) {
        this.configurationFilterForm.controls[this.selectedFilter.fieldId].setValue({ min: this.selectedFilter.conditionFieldStartValue, max: this.selectedFilter.conditionFieldEndValue })
      } else if ((type === FormControlType.DATE || type === FormControlType.DATE_TIME) && this.selectedFilter.conditionFieldStartValue && this.selectedFilter.conditionFieldEndValue) {
        this.configurationFilterForm.controls[this.selectedFilter.fieldId].setValue({ end: new Date(Number(this.selectedFilter.conditionFieldEndValue)), start: new Date(Number(this.selectedFilter.conditionFieldStartValue)) });
      } else if (type === FormControlType.TIME && this.selectedFilter.conditionFieldStartValue && this.selectedFilter.conditionFieldEndValue) {
        const startTime = new Date(this.selectedFilter.conditionFieldStartValue);
        const endTime = new Date(this.selectedFilter.conditionFieldEndValue);
        this.configurationFilterForm.controls[this.selectedFilter.fieldId].setValue({ start: { hours: startTime.getHours(), minutes: startTime.getMinutes() }, end: { hours: endTime.getHours(), minutes: endTime.getMinutes() } })
      }
    }
    const index = this.tableColumnMetaData.findIndex(item => item.fields === this.selectedFilter.fieldId);
    this.selectedFieldMetaData = this.tableColumnMetaData[index];
    if (this.selectedFieldMetaData && !this.selectedFieldMetaData.displayCriteria) {
      this.selectedFieldMetaData.displayCriteria = DisplayCriteria.TEXT;
    }
  }


  /**
   * method called when click on list items
   * @param filter filtered values for selected filters
   * @param ind index of selected value
   */
  onClickOnListItem(filter: Criteria, ind: number) {
    this.selectedFilter = filter;
    const index = this.tableColumnMetaData.findIndex(item => item.fields === this.selectedFilter.fieldId);
    this.selectedFieldMetaData = this.tableColumnMetaData[index];
    if (!this.selectedFieldMetaData.displayCriteria) {
      this.selectedFieldMetaData.displayCriteria = DisplayCriteria.TEXT;
    }
    if (!this.configurationFilterForm.controls[filter.fieldId]) {
      this.configurationFilterForm.addControl(filter.fieldId, new FormControl());
    }
    const formFieldType = this.getFormFieldType(filter.fieldId);
    if ((formFieldType === FormControlType.TEXT || formFieldType === FormControlType.TEXTAREA || formFieldType === FormControlType.CHECKBOX || formFieldType === false) && filter.conditionFieldValue) {
      this.configurationFilterForm.controls[filter.fieldId].setValue(filter.conditionFieldValue);
    } else if ((formFieldType === FormControlType.DATE || formFieldType === FormControlType.DATE_TIME) && filter.conditionFieldStartValue && filter.conditionFieldEndValue) {
      this.configurationFilterForm.controls[filter.fieldId].setValue({ start: new Date(Number(filter.conditionFieldStartValue)), end: new Date(Number(filter.conditionFieldEndValue)) });
    } else if (formFieldType === FormControlType.TIME && filter.conditionFieldStartValue && filter.conditionFieldEndValue) {
      const startValue = new Date(Number(filter.conditionFieldStartValue));
      const endValue = new Date(Number(filter.conditionFieldEndValue));
      this.configurationFilterForm.controls[filter.fieldId].setValue({ start: { hours: startValue.getHours(), minutes: startValue.getMinutes() }, end: { hours: endValue.getHours(), minutes: endValue.getMinutes() } });
    } else if (formFieldType === FormControlType.NUMBER && Number(filter.conditionFieldStartValue) >=0 && Number(filter.conditionFieldEndValue)>=0) {
      this.configurationFilterForm.controls[filter.fieldId].setValue({ min: filter.conditionFieldStartValue, max: filter.conditionFieldEndValue });
    }
  }

  /**
   * method called when value selected of option for single select, multi select
   * @param value value for selected options
   */
  onChange(value) {
    const formFieldType = this.getFormFieldType(this.selectedFilter.fieldId);
    if (this.filterApplied && this.filterApplied[this.selectedFilter.fieldId] && this.filterApplied[this.selectedFilter.fieldId].length) {
      if (formFieldType === FormControlType.MULTI_SELECT) {
        value.forEach(item => {
          const ind = this.filterApplied[this.selectedFilter.fieldId].findIndex(el => el.CODE === item.CODE);
          if (ind === -1) {
            this.filterApplied[this.selectedFilter.fieldId].push(item);
          }
        })
      } else {
        const selectedChk = this.filterApplied[this.selectedFilter.fieldId].find(fil => fil.CODE === value.CODE);
        if (!selectedChk) {
          this.filterApplied[this.selectedFilter.fieldId] = [{ ...value }];
        }
      }
    }
    else {
      if (formFieldType === FormControlType.MULTI_SELECT) {
        this.filterApplied[this.selectedFilter.fieldId] = value;
      } else {
        this.filterApplied[this.selectedFilter.fieldId] = [{ ...value }];
      }
    }
    const index = this.filterCriteria.findIndex(el => el.fieldId === this.selectedFilter.fieldId);
    this.filterCriteria[index].conditionFieldId = this.selectedFilter.fieldId;
    this.filterCriteria[index].fieldId = this.selectedFilter.fieldId;
    this.filterCriteria[index].conditionOperator = this.selectedFilter.conditionOperator ? this.selectedFilter.conditionOperator : ConditionOperator.EQUAL;
    this.filterCriteria[index].blockType = BlockType.COND;
    if (formFieldType === FormControlType.MULTI_SELECT) {
      this.filterCriteria[index].conditionFieldValue = [];
      this.filterCriteria[index].conditionFieldValueText = [];
      this.filterApplied[this.selectedFilter.fieldId].forEach(item => {
        this.filterCriteria[index].conditionFieldValue.push(item.CODE);
        this.filterCriteria[index].conditionFieldValueText.push(item.TEXT);
      })
    }
    else if (formFieldType === FormControlType.DROP_DOWN || formFieldType === FormControlType.RADIO) {
      this.filterCriteria[index].conditionFieldValue = this.filterApplied[this.selectedFilter.fieldId][0].CODE;
      this.filterCriteria[index].conditionFieldValueText = this.filterApplied[this.selectedFilter.fieldId][0].TEXT;
    }
  }

  /**
   * method called when input value change
   * @param value value of input text
   */
  onInputValueChange(value: string) {
    const filterCriteriaIndex = this.filterCriteria.findIndex(item => item.fieldId === this.selectedFilter.fieldId);
    if (this.filterCriteria[filterCriteriaIndex].conditionFieldValue) {
      this.filterCriteria[filterCriteriaIndex].conditionFieldValue = value;
    }
    else {
      const filteredCriteria = new Criteria();
      filteredCriteria.fieldId = this.selectedFilter.fieldId;
      filteredCriteria.conditionFieldId = this.selectedFilter.fieldId;
      filteredCriteria.conditionFieldValue = value;
      filteredCriteria.blockType = BlockType.COND;
      filteredCriteria.conditionOperator = this.selectedFilter.conditionOperator ? this.selectedFilter.conditionOperator : ConditionOperator.EQUAL;
      this.filterCriteria[filterCriteriaIndex] = { ...filteredCriteria };
    }
  }

  /**
   * method called when value change for selected events
   * @param event event for selected value
   */
  rangeTypeValueChange(event) {
    const formFieldType = this.getFormFieldType(this.selectedFilter.fieldId);
    const filterCriteriaIndex = this.filterCriteria.findIndex(item => item.fieldId === this.selectedFilter.fieldId);
    if (!this.filterCriteria[filterCriteriaIndex].conditionFieldStartValue) {
      const filteredCriteria = new Criteria();
      filteredCriteria.fieldId = this.selectedFilter.fieldId;
      filteredCriteria.conditionFieldId = this.selectedFilter.fieldId;
      filteredCriteria.blockType = BlockType.COND;
      filteredCriteria.conditionOperator = ConditionOperator.RANGE;
      this.filterCriteria[filterCriteriaIndex] = { ...filteredCriteria };
    }
    if (formFieldType === FormControlType.DATE) {
      if (event.start && event.end) {
        this.filterCriteria[filterCriteriaIndex].conditionFieldStartValue = moment(event.start).valueOf().toString();
        this.filterCriteria[filterCriteriaIndex].conditionFieldEndValue = moment(event.end).endOf('day').valueOf().toString();
      } else if (event.start && !event.end) {
        this.filterCriteria[filterCriteriaIndex].conditionFieldStartValue = moment(event.start).valueOf().toString();
        this.filterCriteria[filterCriteriaIndex].conditionFieldEndValue = moment(event.start).endOf('day').valueOf().toString();
      } else if (!event.start && event.end) {
        this.filterCriteria[filterCriteriaIndex].conditionFieldStartValue = moment(event.end).valueOf().toString();
        this.filterCriteria[filterCriteriaIndex].conditionFieldEndValue = moment(event.end).endOf('day').valueOf().toString();
      }
    } else if (formFieldType === FormControlType.DATE_TIME) {
      if (event.start && event.end) {
        this.filterCriteria[filterCriteriaIndex].conditionFieldStartValue = moment(event.start).valueOf().toString();
        this.filterCriteria[filterCriteriaIndex].conditionFieldEndValue = moment(event.end).valueOf().toString();
      } else if (event.start && !event.end) {
        this.filterCriteria[filterCriteriaIndex].conditionFieldStartValue = moment(event.start).valueOf().toString();
        this.filterCriteria[filterCriteriaIndex].conditionFieldEndValue = moment(event.start).valueOf().toString();
      } else if (!event.start && event.end) {
        this.filterCriteria[filterCriteriaIndex].conditionFieldStartValue = moment(event.end).valueOf().toString();
        this.filterCriteria[filterCriteriaIndex].conditionFieldEndValue = moment(event.end).valueOf().toString();
      }
    } else if (formFieldType === FormControlType.TIME) {
      this.filterCriteria[filterCriteriaIndex].conditionFieldStartValue = event.start;
      this.filterCriteria[filterCriteriaIndex].conditionFieldEndValue = event.end;
    } else {
      this.filterCriteria[filterCriteriaIndex].conditionFieldStartValue = event.value.min;
      this.filterCriteria[filterCriteriaIndex].conditionFieldEndValue = event.value.max;
    }
  }

  /**
   * get the drop down list for selected items
   * @param selectedItem field Id of selected item
   */
  getDropDownValue(selectedItem: any) {
    const formFieldType = this.getFormFieldType(selectedItem.fieldId);
    this.filterApplied[selectedItem.fieldId] = [];

    if (formFieldType === FormControlType.MULTI_SELECT) {
      selectedItem.conditionFieldValue.forEach((el, index) => {
        const data = { CODE: el, TEXT: selectedItem.conditionFieldValueText[index] };
        this.filterApplied[selectedItem.fieldId] ? this.filterApplied[selectedItem.fieldId].push({ ...data }) : this.filterApplied[selectedItem.fieldId] = [{ ...data }];
      })
    } else {
      const data = { CODE: selectedItem.conditionFieldValue, TEXT: selectedItem.conditionFieldValueText };
      this.filterApplied[selectedItem.fieldId] = [{ ...data }];
    }
  }

  changeOutputFormat(type: DisplayCriteria) {
    const index = this.tableColumnMetaData.findIndex(item => item.fields === this.selectedFilter.fieldId);
    this.tableColumnMetaData[index].displayCriteria = type;
    this.selectedFieldMetaData.displayCriteria = type;
  }

  ngOnDestroy() {
    this.subscription.forEach((sub) => {
      sub.unsubscribe();
    })
  }

  /**
   *
   * @param fieldId id of field that
   * @param value selected values for the filter
   * @returns text for the selected value
   */
  getSelectedValue(fieldId: string, value: string): string {
    if (this.dropDownDataList && this.dropDownDataList[fieldId]) {
      const selectedVal = this.dropDownDataList[fieldId].find(item => item.CODE === value);
      return selectedVal ? selectedVal.TEXT : '';
    } else {
      return null;
    }
  }


  /**
   * Remove the selected filter from the lib chip
   * @param code code of the selected value
   * @param index index of lib chip
   */
  removedSelectedFilter(code: string, index: number) {
    this.filterApplied[this.selectedFilter.fieldId] = this.filterApplied[this.selectedFilter.fieldId].filter(el => el.CODE !== code);
    const ind = this.filteredCriteriaList.findIndex(item => this.selectedFilter.fieldId === item.fieldId && item.conditionFieldValue === code);
    this.filteredCriteriaList.splice(ind, 1);
    const type = this.getFormFieldType(this.selectedFilter.fieldId)
    if (type === FormControlType.MULTI_SELECT) {
      const i = this.filterCriteria.findIndex(item => item.fieldId === this.selectedFilter.fieldId && item.conditionFieldValue.indexOf(code) > -1)
      if (i > -1) {
        const conditionFieldIndex = this.filterCriteria[i].conditionFieldValue.indexOf(code);
        this.filterCriteria[i].conditionFieldValue.splice(conditionFieldIndex, 1);
        this.filterCriteria[i].conditionFieldValueText.splice(conditionFieldIndex,1);
      }
    } else {
      const filteredIndex = this.filterCriteria.findIndex(item => item.fieldId === this.selectedFilter.fieldId && item.conditionFieldValue === code);
      this.filterCriteria[filteredIndex].conditionFieldValue = null
    }
  }

  /**
   * apply filter when click on apply button
   */
  applyFilter() {
    const filteredCriteriaList = [];
    this.filterCriteria.forEach(item => {
      const formFieldType = this.getFormFieldType(item.fieldId);
      if (item.conditionOperator) {
        if (formFieldType !== FormControlType.MULTI_SELECT) {
          const filteredCriteria = new Criteria();
          filteredCriteria.fieldId = item.fieldId;
          filteredCriteria.conditionFieldId = item.fieldId;
          filteredCriteria.blockType = BlockType.COND;
          filteredCriteria.conditionOperator = item.conditionOperator;
          if (formFieldType === FormControlType.TEXT || formFieldType === FormControlType.TEXTAREA || formFieldType === FormControlType.CHECKBOX || formFieldType === false) {
            filteredCriteria.conditionFieldValue = item.conditionFieldValue;
          } else if (formFieldType === FormControlType.DROP_DOWN || formFieldType === FormControlType.RADIO) {
            filteredCriteria.conditionFieldValue = item.conditionFieldValue;
            filteredCriteria.conditionFieldValueText = item.conditionFieldValueText;
          } else if (formFieldType === FormControlType.DATE || formFieldType === FormControlType.DATE_TIME || formFieldType === FormControlType.NUMBER) {
            filteredCriteria.conditionFieldStartValue = item.conditionFieldStartValue;
            filteredCriteria.conditionFieldEndValue = item.conditionFieldEndValue;
          } else if (formFieldType === FormControlType.TIME) {
            filteredCriteria.conditionFieldStartValue = new Date().setHours(item.conditionFieldStartValue?.hours, item.conditionFieldStartValue?.minutes).toString();
            filteredCriteria.conditionFieldEndValue = new Date().setHours(item.conditionFieldEndValue?.hours, item.conditionFieldEndValue?.minutes).toString();
          }
          filteredCriteriaList.push(filteredCriteria);
        }
        else {
          item.conditionFieldValue.forEach((el, index) => {
            const filteredCriteria = new Criteria();
            filteredCriteria.fieldId = item.fieldId;
            filteredCriteria.conditionFieldId = item.fieldId;
            filteredCriteria.blockType = BlockType.COND;
            filteredCriteria.conditionOperator = item.conditionOperator;
            filteredCriteria.conditionFieldValue = el;
            filteredCriteria.conditionFieldValueText = item.conditionFieldValueText[index];
            filteredCriteriaList.push(filteredCriteria);
          })
        }
      }
    })
    this.reportService.setFilterCriteria(filteredCriteriaList,this.widgetId);
    this.reportService.setColumnMetaData(this.tableColumnMetaData,this.widgetId);
    this.reportService.isSideSheetClose.next(true);
    this.router.navigate([{ outlets: { sb: null } }]);
  }

  /**
   * set the condition operator for the selected filter
   * @param condition condition for the selected filter
   */
  changeCondition(condition: ConditionOperator) {
    const index = this.filterCriteria.findIndex(item => item.fieldId === this.selectedFilter.fieldId);
    this.filterCriteria[index].conditionOperator = condition;
    this.selectedFilter.conditionOperator = condition;
  }

  /**
   * Return the column type for the respective column
   * @param fieldId column id
   * @returns form control type
   */
  getFormFieldType(fieldId: string): FormControlType | boolean {
    const hasFld = this.tableColumnMetaData.find(item => item.fields === fieldId);
    if (hasFld?.fldMetaData?.picklist || hasFld?.fldMetaData?.dataType) {
      if (hasFld.fldMetaData.dataType === 'DATS') {
        return FormControlType.DATE;
      } else if (hasFld.fldMetaData.dataType === 'DTMS') {
        return FormControlType.DATE_TIME;
      } else if (hasFld.fldMetaData.dataType === 'TIMS') {
        return FormControlType.TIME;
      }
      else if (hasFld.fldMetaData.picklist === '1' || hasFld.fldMetaData.picklist === '30' || hasFld.fldMetaData.picklist === '37') {
        if (hasFld.fldMetaData.isCheckList === 'true') {
          return FormControlType.MULTI_SELECT;
        }
        else
          return FormControlType.DROP_DOWN;
      } else if (hasFld.fldMetaData.picklist === '0') {
        if (hasFld.fldMetaData.dataType === 'CHAR' || hasFld.fldMetaData.dataType === 'ALTN' || hasFld.fldMetaData.dataType === 'ICSN' || hasFld.fldMetaData.dataType === 'REQ' || hasFld.fldMetaData.dataType === 'TEXT') {
          return FormControlType.TEXT;
        } else if (hasFld.fldMetaData.dataType === 'NUMC' || hasFld.fldMetaData.dataType === 'DEC') {
          return FormControlType.NUMBER
        } else {
          return false;
        }
      } else if (hasFld.fldMetaData.picklist === '2') {
        return FormControlType.CHECKBOX;
      } else if (hasFld.fldMetaData.picklist === '4' || hasFld.fldMetaData.picklist === '35') {
        return FormControlType.RADIO;
      } else if (hasFld.fldMetaData.picklist === '22' && hasFld.fldMetaData.dataType === 'CHAR') {
        return FormControlType.TEXTAREA;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /**
   * returns the min or max value for range sliders
   * @param fieldId field id for the column
   * @param limitType min or max value
   * @returns minimum or max value for range slider
   */
  getRangeLimit(fieldId: string, limitType: string): number {
    const fieldData = this.tableColumnMetaData.find(item => item.fields === fieldId)
    if (limitType === 'max')
      return +fieldData.fldMetaData.maxChar;
  }

  /**
   * return the selected date value
   * @returns return the selected date value
   */
  getSelectedDateValue() {
    if (this.configurationFilterForm.controls[this.selectedFilter.fieldId].value)
    if (!this.configurationFilterForm.controls[this.selectedFilter.fieldId].value.start && this.configurationFilterForm.controls[this.selectedFilter.fieldId].value.end) {
      return { start: this.configurationFilterForm.controls[this.selectedFilter.fieldId].value.end, end: this.configurationFilterForm.controls[this.selectedFilter.fieldId].value.end }
    } else if (this.configurationFilterForm.controls[this.selectedFilter.fieldId].value.start && !this.configurationFilterForm.controls[this.selectedFilter.fieldId].value.end) {
      return { start: this.configurationFilterForm.controls[this.selectedFilter.fieldId].value.start, end: this.configurationFilterForm.controls[this.selectedFilter.fieldId].value.start }
    }
      return this.configurationFilterForm.controls[this.selectedFilter.fieldId].value
  }

  /**
   * return the selected time value for selected component
   * @returns selected time value
   */
  getSelectedTimeValue() {
    return { start: this.selectedFilter.conditionFieldStartValue, end: this.selectedFilter.conditionFieldEndValue }
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

  getPreSelectedRangeValue(fieldId) {
    const data = this.filterCriteria.find(item => item.conditionFieldId === fieldId);
    if (data) {
      return { min: data.conditionFieldStartValue, max: data.conditionFieldEndValue }
    }
  }
}