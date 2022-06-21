import { Component, OnInit, OnChanges, OnDestroy, Input, LOCALE_ID, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { WidgetService } from 'src/app/_services/widgets/widget.service';
import { GenericWidgetComponent } from '../../generic-widget/generic-widget.component';
import { FilterWidget, DropDownValues, Criteria, BlockType, ConditionOperator, WidgetHeader, FilterResponse, DateFilterQuickSelect, DateBulder, DateSelectionType, WidgetType, DisplayCriteria, OrderWith } from '../../../_models/widget';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatSliderChange } from '@angular/material/slider';
import { UDRBlocksModel } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { debounceTime } from 'rxjs/operators';
import { TransientService } from 'mdo-ui-library';
import { formatNumber } from '@angular/common';
import { Userdetails } from '@models/userdetails';
import { UserService } from '@services/user/userservice.service';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';

@Component({
  selector: 'pros-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
})
export class FilterComponent extends GenericWidgetComponent implements OnInit, OnChanges, OnDestroy {

  displayCriteriaOptions = [
    {
      key: 'Text',
      value: DisplayCriteria.TEXT
    },
    {
      key: 'Code',
      value: DisplayCriteria.CODE
    },
    {
      key: 'Code and Text',
      value: DisplayCriteria.CODE_TEXT
    }
  ];
  displayCriteriaOption: DisplayCriteria = this.displayCriteriaOptions[0].value;
  values: DropDownValues[] = [];
  filterWidget: BehaviorSubject<FilterWidget> = new BehaviorSubject<FilterWidget>(null);
  filteredOptionsSubject: BehaviorSubject<DropDownValues[]> = new BehaviorSubject([]);
  public get filteredOptions(): Observable<DropDownValues[]> {
    return this.filteredOptionsSubject.asObservable();
  }
  filterFormControl = new FormControl();
  widgetHeader: WidgetHeader = new WidgetHeader();
  selectedDropVals: DropDownValues[] = [];
  enableClearIcon = false;
  startDate: string;
  endDate: string;
  startDateCtrl: FormControl = new FormControl();
  endDateCtrl: FormControl = new FormControl();
  numericValCtrl: FormControl = new FormControl();
  filterResponse: FilterResponse;
  sliderval: FormControl = new FormControl();
  filteredArray = 0;

  /**
   * store last value in the bucket array
   */
  searchAfter: string;

  /**
   * load more value in the filter
   */
  isLoadMore = false;

  /**
   * store search string value
   */
  searchString: string;

  /**
   * When reset filter from main container value should be true
   */
  @Input()
  hasFilterCriteria: boolean;
  @Input()
  isClearButtonClicked: boolean;

  /**
   * Date filter quick selection..
   */
  dateFilterQuickSelect: DateFilterQuickSelect[] = [
    {
      code: 'TODAY',
      isSelected: false,
      text: 'Today'
    }, {
      code: 'DAY_7',
      isSelected: false,
      text: '7 Days'
    }, {
      code: 'DAY_10',
      isSelected: false,
      text: '10 Days'
    }, {
      code: 'DAY_20',
      isSelected: false,
      text: '20 Days'
    }, {
      code: 'DAY_30',
      isSelected: false,
      text: ' 30 Days'
    }
  ];

  /** To check clear filter clicked or not */
  isClearFilter = false;

  subscriptions: Subscription[] = [];
  returnData: any;
  userDetails: Userdetails;
  /**
   * Constructor of Class
   */
  constructor(
    private widgetService: WidgetService,
    private toasterService: TransientService,
    private userService: UserService,
    @Inject(LOCALE_ID) public locale: string,
    private sharedService: SharedServiceService
  ) {
    super();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
    this.filteredOptionsSubject.complete();
    this.filteredOptionsSubject.unsubscribe();
  }

  /**
   * Automatic angular trigger when the filterCriteria changed by dashboard container
   *
   */
  ngOnChanges(changes: import('@angular/core').SimpleChanges): void {
    if (changes && changes.hasFilterCriteria && changes.hasFilterCriteria.currentValue !== changes.hasFilterCriteria.previousValue && changes.hasFilterCriteria.currentValue) {
      this.clearFilterCriteria(false);
      this.filterFormControl.setValue('');
    }

    if (changes && changes.filterCriteria && changes.filterCriteria.previousValue !== undefined) {
      if (this.filterWidget && this.filterWidget.value && !this.widgetHeader.isEnableGlobalFilter) {
        this.loadAlldropData(this.filterWidget.value.fieldId, this.filterCriteria, '', undefined, true);
      }

      // if (changes.filter)
    }
  }

  ngOnInit(): void {
    this.getFilterMetadata();
    this.getHeaderMetaData();

    this.filterFormControl.valueChanges.pipe(debounceTime(1000)).subscribe(val => {
      if (typeof val === 'string') {
        this.searchString = val;
        this.loadAlldropData(this.filterWidget.value.fieldId, this.filterCriteria, val, undefined, true);
      } else {
        this.searchString = '';
        this.setFilteredOptions();
        if (typeof val === 'string' && val.trim() === '' && !this.filterWidget.getValue().isMultiSelect) {
          this.removeSingleSelectedVal(false);
        }
      }
    });
    const filterWid = this.filterWidget.subscribe(widget => {
      if (widget) {
        this.loadAlldropData(widget.fieldId, this.filterCriteria);
      }
    });
    this.userService.getUserDetails().subscribe(
      (response: Userdetails) => {
        this.userDetails = response;
      }
    );
    this.subscriptions.push(filterWid);

    const getDisplayCriteria = this.widgetService.getDisplayCriteria(this.widgetInfo.widgetId, this.widgetInfo.widgetType).subscribe(res => {
      this.displayCriteriaOption = res.displayCriteria;
    }, error => {
      console.error(`Error : ${error}`);
    });
    this.subscriptions.push(getDisplayCriteria);
  }

  getFieldsMetadaDesc(buckets: any[], fieldId: string, reset: boolean) {
    const finalVal = {} as any;
    buckets.forEach(bucket => {
      const key = bucket.key.FILTER;
      const hits = bucket['top_hits#items'] ? bucket['top_hits#items'].hits.hits[0] : null;
      const val = hits._source.hdvs?(hits._source.hdvs[fieldId] ?
                  ( hits._source.hdvs[fieldId] ? hits._source.hdvs[fieldId].vc : null) : null):
                  (hits._source.staticFields && hits._source.staticFields[fieldId]) ?
                  ( hits._source.staticFields[fieldId] ? hits._source.staticFields[fieldId].vc : null) :
                  ( hits._source[fieldId] ? hits._source[fieldId].vc : null);
      if(val) {
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
      } if (fieldId === 'OVERDUE' || fieldId === 'FORWARDENABLED' || fieldId === 'TIME_TAKEN' || this.filterWidget.getValue().metaData.picklist === '35') {
        finalVal[key] = this.getFields(fieldId, key);
      }
    });
    Object.keys(finalVal).forEach(key=>{
      if(this.filterWidget.getValue().metaData.dataType === 'NUMC' || this.filterWidget.getValue().metaData.dataType === 'DEC') {
        finalVal[key] = formatNumber(finalVal[key], 'en-US');
      }
        const valOld = this.values.filter(fill => fill.CODE === key);
        if(valOld.length >0) {
          const index = this.values.indexOf(valOld[0]);
          valOld[0].TEXT = finalVal[key];
          valOld[0].FIELDNAME = fieldId;
          valOld[0].display = this.setDisplayCriteria(key, finalVal[key]);
          this.values[index] = valOld[0];
        }
    });

    this.setFilteredOptions(reset);
  }

  updateObjRefDescription(buckets: any[], fieldId: string, reset: boolean) {
    let locale = this.locale !== '' ? this.locale.split('-')[0] : 'EN';
    locale = locale.toUpperCase();
    const finalVal = {} as any;
    buckets.forEach(bucket => {
      const key = bucket.key.FILTER;
      const hits = bucket['top_hits#items'] ? bucket['top_hits#items'].hits.hits[0] : null;
      const val = hits._source.hdvs ? (hits._source.hdvs[fieldId] ?
        (hits._source.hdvs[fieldId] ? hits._source.hdvs[fieldId].vc : null) : null) :
        (hits._source.staticFields && hits._source.staticFields[fieldId]) ?
        ( hits._source.staticFields[fieldId] ? hits._source.staticFields[fieldId].vc : null) :
        ( hits._source[fieldId] ? hits._source[fieldId].vc : null);
      if(val) {
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

    Object.keys(finalVal).forEach(key=>{
      if(this.filterWidget.getValue().metaData.dataType === 'NUMC' || this.filterWidget.getValue().metaData.dataType === 'DEC') {
        finalVal[key] = formatNumber(finalVal[key], 'en-US');
      }
        const valOld = this.values.filter(fill => fill.CODE === key);
        if(valOld.length >0) {
          const index = this.values.indexOf(valOld[0]);
          valOld[0].TEXT = finalVal[key];
          valOld[0].FIELDNAME = fieldId;
          valOld[0].display = this.setDisplayCriteria(key, finalVal[key]);
          this.values[index] = valOld[0];
        }
    });

    this.setFilteredOptions(reset);
  }

  setFilteredOptions(reset?: boolean) {
    /* Sort dropdown data bases on sorting criteria */
    this.sortDropdownData(this.values);
    if (reset) {
      this.filteredOptionsSubject.next(this.values);
    } else {
      let values = this.filteredOptionsSubject.value;
      // merge array only if object does not exists in the values array
      const displayIds = new Set(values.map(d => d.display));
      values = [...values, ...this.values.filter(d => !displayIds.has(d.display))];
      this.sortDropdownData(values);
      this.filteredOptionsSubject.next(values);
    }
  }

  public getHeaderMetaData(): void {
    const headetData = this.widgetService.getHeaderMetaData(this.widgetId).subscribe(returnData => {
      this.widgetHeader = returnData;
    }, error => console.error(`Error : ${error}`));
    this.subscriptions.push(headetData);
  }

  public getFilterMetadata(): void {
    const filtereData = this.widgetService.getFilterMetadata(this.widgetId).subscribe(returndata => {
      if (returndata && returndata.fieldId !== (this.filterWidget.getValue() ? this.filterWidget.getValue().fieldId : null)) {
        this.filterWidget.next(returndata);
      }

      // check if date type field and has default filter then apply it
      if (returndata.isGlobal
        && ((returndata.fieldId === 'DATECREATED' || returndata.fieldId === 'DATEMODIFIED')
          || (returndata.metaData && returndata.metaData.picklist === '0'
            && (returndata.metaData.dataType === 'DATS' || returndata.metaData.dataType === 'DTMS')))) {

        const dateFilterBlock: UDRBlocksModel = returndata.udrBlocks ? returndata.udrBlocks[0] : null;
        if (dateFilterBlock && dateFilterBlock.blockDesc) {
          const strtEndDt = new DateBulder().build(dateFilterBlock.blockDesc as DateSelectionType);
          if (strtEndDt) {
            dateFilterBlock.conditionFieldStartValue = strtEndDt[0];
            dateFilterBlock.conditionFieldEndValue = strtEndDt[1];
          }
          const criteria: Criteria = new Criteria();
          criteria.fieldId = returndata.fieldId;
          criteria.blockType = dateFilterBlock.blockType;
          criteria.conditionFieldId = dateFilterBlock.conditionFieldId;
          criteria.conditionFieldStartValue = dateFilterBlock.conditionFieldStartValue;
          criteria.conditionFieldEndValue = dateFilterBlock.conditionFieldEndValue;
          criteria.conditionOperator = dateFilterBlock.conditionOperator as ConditionOperator;
          criteria.udrid = dateFilterBlock.udrid;

          // set selected value
          this.startDateCtrl = new FormControl(new Date(Number(dateFilterBlock.conditionFieldStartValue)));
          this.endDateCtrl = new FormControl(new Date(Number(dateFilterBlock.conditionFieldEndValue)));

          this.setSelectedQuickDateFilter(dateFilterBlock.blockDesc);
          this.enableClearIcon = true;
          const filterCriteria = [...this.filterCriteria];
          filterCriteria.push(criteria);

          // emit value for apply filter
          setTimeout(() => {
            this.emitEvtFilterCriteria(filterCriteria);
          }, 2000);
        }

      }

    }, error => {
      console.error(`Error : ${error}`);
    });
    this.subscriptions.push(filtereData);
  }

  setSelectedQuickDateFilter(code: string) {
    switch (code) {
      case 'TODAY':
        const todayFill = this.dateFilterQuickSelect.filter(f => f.code === 'TODAY')[0];
        todayFill.isSelected = true;
        break;

      case 'DAY_7':
        const day7Fill = this.dateFilterQuickSelect.filter(f => f.code === 'DAY_7')[0];
        day7Fill.isSelected = true;
        break;

      case 'DAY_10':
        const day10Fill = this.dateFilterQuickSelect.filter(f => f.code === 'DAY_10')[0];
        day10Fill.isSelected = true;
        break;

      case 'DAY_20':
        const day20Fill = this.dateFilterQuickSelect.filter(f => f.code === 'DAY_20')[0];
        day20Fill.isSelected = true;
        break;

      case 'DAY_30':
        const day30Fill = this.dateFilterQuickSelect.filter(f => f.code === 'DAY_30')[0];
        day30Fill.isSelected = true;
        break;
      default:
        break;
    }
  }

  selectQuickDate(code: string, isSelected: boolean) {

    // unselect all
    this.dateFilterQuickSelect.forEach(f => {
      f.isSelected = false;
    });
    if (!isSelected) {
      const strtEndDt = new DateBulder().build(code as DateSelectionType);
      if (strtEndDt) {
        // set selected value
        this.startDateCtrl = new FormControl(new Date(Number(strtEndDt[0])));
        this.endDateCtrl = new FormControl(new Date(Number(strtEndDt[1])));
        this.startDate = strtEndDt[0];
        this.endDate = strtEndDt[1];

        // codeTxt.isSelected = true;
        // this.dateFilterQuickSelect[idx] = codeTxt;
        this.setSelectedQuickDateFilter(code);
        this.emitDateChangeValues();
      }
    } else {
      this.clearSelectedPicker();
    }
  }

  public loadAlldropData(fieldId: string, criteria: Criteria[], searchString?: string, searchAfter?: string, reset?: boolean): void {
    criteria = this.removefilter(this.filterWidget.value.fieldId, criteria);
    const widgetData = this.widgetService.getWidgetData(String(this.widgetId), criteria, searchString, searchAfter, '', this.userDetails.defLocs.toString()).subscribe(returnData => {
      const res = Object.keys(returnData.aggregations);
      const buckets = returnData.aggregations[res[0]] ? returnData.aggregations[res[0]].buckets : [];
      if (buckets && buckets.length === 10) {
        this.searchAfter = returnData.aggregations[res[0]].after_key.FILTER ? returnData.aggregations[res[0]].after_key.FILTER : '';
        this.isLoadMore = true;
      } else {
        this.isLoadMore = false;
      }
      if (this.filterWidget.getValue().metaData && (this.filterWidget.getValue().metaData.picklist === '1' || this.filterWidget.getValue().metaData.picklist === '30' || this.filterWidget.getValue().metaData.picklist === '37' || this.filterWidget.getValue().metaData.picklist === '4' || this.filterWidget.getValue().metaData.picklist === '38' || this.filterWidget.getValue().metaData.picklist === '35')) {
        const metadatas: DropDownValues[] = [];
        buckets.forEach(bucket => {
          const hits = bucket['top_hits#items'] ? bucket['top_hits#items'].hits.hits[0] : null;
          const val = hits._source.hdvs ? (hits._source.hdvs[fieldId] ?
            (hits._source.hdvs[fieldId] ? hits._source.hdvs[fieldId].vc : null) : null) :
            (hits._source.staticFields && hits._source.staticFields[fieldId]) ?
              (hits._source.staticFields[fieldId] ? hits._source.staticFields[fieldId].vc : null) : null;
          let code = bucket.key.FILTER;
          if (val && val[0] && val[0].c) {
            code = val[0].c;
          }
          const metaData = { CODE: code, FIELDNAME: fieldId, TEXT: bucket.key.FILTER, display: this.setDisplayCriteria(code, bucket.key.FILTER) } as DropDownValues;
          metadatas.push(metaData);
        });
        this.values = metadatas;
        if (this.filterWidget.getValue().metaData.picklist === '1' || this.filterWidget.getValue().metaData.picklist === '37' || this.filterWidget.getValue().metaData.picklist === '4' || this.filterWidget.getValue().metaData.picklist === '38' || this.filterWidget.getValue().metaData.picklist === '35') {
          this.getFieldsMetadaDesc(buckets, fieldId, reset);
        } else if (this.filterWidget.getValue().metaData.picklist === '30') {
          this.updateObjRefDescription(buckets, fieldId, reset);
        } else {
          this.setFilteredOptions(reset);
        }
      } else if (this.filterWidget.getValue().metaData && (this.filterWidget.getValue().metaData.picklist === '0' && this.filterWidget.getValue().metaData.dataType === 'NUMC')) {
        // static data  TODO
        const filterResponse = new FilterResponse();
        filterResponse.min = 1;
        filterResponse.max = 2000;
        filterResponse.fieldId = this.filterWidget.getValue().fieldId;
        this.filterResponse = filterResponse;
      }
    }, error => {
      console.error(`Error : ${error}`);
    });
    this.subscriptions.push(widgetData);
  }

  fieldDisplayFn(data): string {
    return data ? data.TEXT : '';
  }

  emitEvtClick(): void {
    throw new Error('Method not implemented.');
  }
  emitEvtFilterCriteria(criteria: Criteria[]): void {
    this.evtFilterCriteria.emit(criteria);
    this.sharedService.setFilterCriteriaData(criteria);
  }

  optionClicked(event: MatAutocompleteSelectedEvent, option?: DropDownValues) {
    if (event.option) {
      this.toggleSelection(event.option.value);
    } else {
      this.toggleSelection(option);
    }
  }

  toggleSelection(option: DropDownValues) {
    let selectedFilterCriteria = [...this.filterCriteria];
    let selectedOptions = this.filterCriteria.filter(fill => fill.conditionFieldId === option.FIELDNAME && fill.widgetType === WidgetType.FILTER);
    const codeAvail = this.filterCriteria.filter(fill => (fill.conditionFieldId === option.FIELDNAME && fill.conditionFieldValue === option.CODE && fill.widgetType === WidgetType.FILTER && !this.filterWidget.getValue().isMultiSelect)).length > 0 ? true : false;

    // If the newly selection option is equal to previously selected filter option, then dont remove filter criteria
    if (!this.filterCriteria.some(x => x.conditionFieldValue === option.display && x.widgetType === WidgetType.COUNT) && this.filterWidget.getValue().isMultiSelect) {
      this.removeOldFilterCriteria(selectedOptions);
    } else {
      selectedFilterCriteria = this.filterCriteria.filter(x => !(x.conditionFieldId === option.FIELDNAME && x.widgetType === WidgetType.FILTER));
    }
    if (this.filterWidget.getValue() && this.filterWidget.getValue().isMultiSelect) {
      if (selectedOptions.length > 0) {
        const cri = selectedOptions.filter(fill => fill.conditionFieldValue === option.CODE && fill.widgetType === WidgetType.FILTER);
        if (cri.length > 0) {
          selectedOptions.splice(selectedOptions.indexOf(cri[0]), 1);
          if (!selectedOptions.length) {
            this.enableClearIcon = false;
          }
        } else {
          const critera1: Criteria = new Criteria();
          critera1.fieldId = this.filterWidget.getValue().fieldId;
          critera1.conditionFieldId = this.filterWidget.getValue().fieldId;
          critera1.conditionFieldValue = option.CODE ? option.CODE : '';
          critera1.blockType = BlockType.COND;
          critera1.widgetType = WidgetType.FILTER;
          critera1.conditionOperator = ConditionOperator.EQUAL;
          critera1.conditionFieldValueText = option ? option.TEXT ? option.TEXT : critera1.conditionFieldValue : '';
          selectedOptions.push(critera1);
          this.enableClearIcon = true;
        }
      } else {
        const critera1: Criteria = new Criteria();
        critera1.fieldId = this.filterWidget.getValue().fieldId;
        critera1.conditionFieldId = this.filterWidget.getValue().fieldId;
        critera1.conditionFieldValue = option ? option.CODE : '';
        critera1.blockType = BlockType.COND;
        critera1.widgetType = WidgetType.FILTER;
        critera1.conditionOperator = ConditionOperator.EQUAL;
        critera1.conditionFieldValueText = option ? option.TEXT ? option.TEXT : critera1.conditionFieldValue : '';
        selectedOptions.push(critera1);
        this.enableClearIcon = true;
      }
    } else {
      selectedOptions = []; // reset previous selection
      if (!codeAvail) {
        const critera1: Criteria = new Criteria();
        critera1.fieldId = this.filterWidget.getValue().fieldId;
        critera1.conditionFieldId = this.filterWidget.getValue().fieldId;
        critera1.conditionFieldValue = option ? option.CODE : '';
        critera1.blockType = BlockType.COND;
        critera1.widgetType = WidgetType.FILTER;
        critera1.conditionOperator = ConditionOperator.EQUAL;
        critera1.conditionFieldValueText = option ? option.TEXT ? option.TEXT : critera1.conditionFieldValue : '';
        selectedOptions.push(critera1);
        this.enableClearIcon = true;
      } else {
        this.enableClearIcon = false
      }
    }

    if (this.filterWidget.getValue().isMultiSelect) {
      if (selectedOptions.length < selectedFilterCriteria.length) {
        const selectedOption = selectedFilterCriteria.filter(fil => {
          if (fil.conditionFieldId === option.FIELDNAME && fil.widgetType === WidgetType.FILTER) {
            return selectedOptions.findIndex(item => item.conditionFieldValue === fil.conditionFieldValue) > -1;
          }
          else {
            return fil;
          }
        })
        selectedFilterCriteria = [...selectedOption];
      }
    }

    selectedOptions.forEach(op => {
      const index = selectedFilterCriteria.findIndex(fil => fil.fieldId === op.fieldId && fil.conditionFieldValue === op.conditionFieldValue && fil.widgetType === op.widgetType);
      if (index === -1) {
        selectedFilterCriteria.push(op);
      }
      else {
        if (!this.filterWidget.getValue().isMultiSelect) {
          selectedFilterCriteria[index].conditionFieldValue = op.conditionFieldValue;
        }
      }
    });

    this.filterCriteria = [...selectedFilterCriteria];
    this.selectedDropVals = this.returnSelectedDropValues(this.filterCriteria);
    this.emitEvtFilterCriteria(this.filterCriteria);
  }

  /**
   * Remove old filter criteria for field
   * selectedOptions as parameter
   */
  removeOldFilterCriteria(selectedOptions: Criteria[]) {
    selectedOptions.forEach(option => {
      this.filterCriteria.splice(this.filterCriteria.indexOf(option), 1);
    });
  }

  isSelected(option: DropDownValues): boolean {
    const isPreViusSelected = this.filterCriteria.filter(fill => (fill.conditionFieldId === this.filterWidget.getValue().fieldId && fill.conditionFieldValue === option.CODE && fill.widgetType === WidgetType.FILTER));
    if (isPreViusSelected.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  returnSelectedDropValues(selectedOptions: Criteria[]): DropDownValues[] {
    const returnValue: DropDownValues[] = [];
    selectedOptions.forEach(value => {
      if (value.fieldId === this.filterWidget.value.fieldId && value.widgetType === WidgetType.FILTER) {
        const existValue = this.selectedDropVals.filter(exist => exist.CODE === value.conditionFieldValue);
        const textVal = this.values.filter(val => val.CODE === value.conditionFieldValue);
        const text = textVal.length > 0 ? textVal[0].TEXT : existValue.length > 0 ? existValue[0].TEXT : value.conditionFieldValue;
        returnValue.push({ CODE: value.conditionFieldValue, FIELDNAME: value.fieldId, TEXT: text, langu: 'EN', sno: null, display: this.setDisplayCriteria(value.conditionFieldValue, text) });
      }

    });
    return returnValue;
  }

  remove(option: DropDownValues) {
    this.toggleSelection(option);
  }

  removeSingleSelectedVal(isClearCall: boolean) {
    const appliedFiltered = this.filterCriteria.filter(fill => fill.fieldId === this.filterWidget.getValue().fieldId);
    appliedFiltered.forEach(fill => {
      this.filterCriteria.splice(this.filterCriteria.indexOf(fill), 1);
    });
    this.enableClearIcon = false;
    if (isClearCall) {
      this.selectedDropVals = [];
    }
    this.emitEvtFilterCriteria(this.filterCriteria);
  }


  setPositionOfDatePicker() {
    setTimeout(() => {
      if (document.getElementsByClassName('cdk-overlay-pane mat-datepicker-popup')[0]) {
        let leftPos1 = (document.getElementsByClassName('cdk-overlay-pane mat-datepicker-popup')[0] as HTMLDivElement).style.left;
        leftPos1 = leftPos1.split('px')[0];

        let leftPos2 = (document.getElementsByClassName('cdk-overlay-pane mat-datepicker-popup')[1] as HTMLDivElement).style.left;
        leftPos2 = leftPos2.split('px')[0];

        if (Number(leftPos2) < 50) {
          (document.getElementsByClassName('cdk-overlay-pane mat-datepicker-popup')[0] as HTMLDivElement).style.left = (Number(leftPos1) + 200) + 'px';
        } else {
          (document.getElementsByClassName('cdk-overlay-pane mat-datepicker-popup')[1] as HTMLDivElement).style.left = (Number(leftPos1) - 300) + 'px';
        }
      }
    }, 100);
  }


  changeStartDate(event: MatDatepickerInputEvent<Date>) {
    if (event.value && event.value.getTime()) {
      this.startDate = String(event.value.getTime());
      this.emitDateChangeValues();
    }
    // unselect all
    this.dateFilterQuickSelect.forEach(f => {
      f.isSelected = false;
    });
  }

  changeEndtDate(event: MatDatepickerInputEvent<Date>) {
    if (event.value && event.value.getTime()) {
      this.endDate = String(event.value.getTime());
      this.emitDateChangeValues();
    }
    // unselect all
    this.dateFilterQuickSelect.forEach(f => {
      f.isSelected = false;
    });
  }
  emitDateChangeValues() {
    if (this.startDate && this.endDate) {
      if (this.startDate === this.endDate) {
        this.endDate = String(Number(this.startDate) + 24 * 60 * 60 * 1000);
      }
      this.enableClearIcon = true;
      let checkPreviousApplied = this.filterCriteria.filter(fill => fill.conditionFieldId === this.filterWidget.getValue().fieldId);
      this.removeOldFilterCriteria(checkPreviousApplied);
      if (checkPreviousApplied.length) {
        checkPreviousApplied[0].conditionFieldStartValue = this.startDate;
        checkPreviousApplied[0].conditionFieldEndValue = this.endDate;
      } else {
        checkPreviousApplied = [];
        const critera: Criteria = new Criteria();
        critera.fieldId = this.filterWidget.getValue().fieldId;
        critera.conditionFieldId = this.filterWidget.getValue().fieldId;
        critera.conditionFieldEndValue = this.endDate;
        critera.conditionFieldStartValue = this.startDate;
        critera.blockType = BlockType.COND;
        critera.conditionOperator = ConditionOperator.RANGE;
        checkPreviousApplied.push(critera);
      }
      checkPreviousApplied.forEach(op => this.filterCriteria.push(op));
      this.emitEvtFilterCriteria(this.filterCriteria);
    }
  }
  clearSelectedPicker() {
    this.startDate = null;
    this.endDate = null;
    this.startDateCtrl = new FormControl('');
    this.endDateCtrl = new FormControl('');
    this.enableClearIcon = false;
    const checkPreviousApplied = this.filterCriteria.filter(fill => fill.conditionFieldId === this.filterWidget.getValue().fieldId);
    this.removeOldFilterCriteria(checkPreviousApplied);

    this.dateFilterQuickSelect.forEach(f => {
      f.isSelected = false;
    });

    this.emitEvtFilterCriteria(this.filterCriteria);
  }
  formatMatSliderLabel(value: number) {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }
    return value;
  }

  sliderValueChange(event: MatSliderChange) {
    if (event && event.value) {
      this.sliderval.setValue(event.value);
      this.enableClearIcon = true;
      let checkPreviousApplied = this.filterCriteria.filter(fill => fill.conditionFieldId === this.filterWidget.getValue().fieldId);
      this.removeOldFilterCriteria(checkPreviousApplied);
      if (checkPreviousApplied.length) {
        checkPreviousApplied[0].conditionFieldStartValue = String(this.filterResponse.min);
        checkPreviousApplied[0].conditionFieldEndValue = String(event.value);
      } else {
        checkPreviousApplied = [];
        const critera: Criteria = new Criteria();
        critera.fieldId = this.filterWidget.getValue().fieldId;
        critera.conditionFieldId = this.filterWidget.getValue().fieldId;
        critera.conditionFieldEndValue = String(event.value);
        critera.conditionFieldStartValue = String(this.filterResponse.min);
        critera.blockType = BlockType.COND;
        critera.conditionOperator = ConditionOperator.RANGE;
        checkPreviousApplied.push(critera);
      }
      checkPreviousApplied.forEach(op => this.filterCriteria.push(op));
      this.emitEvtFilterCriteria(this.filterCriteria);
    }
  }

  clearFilterCriteria(isClearButtonClicked) {
    const picklist = this.filterWidget.getValue() ? (this.filterWidget.getValue().metaData ? this.filterWidget.getValue().metaData.picklist : '') : '';
    const dataType = this.filterWidget.getValue() ? (this.filterWidget.getValue().metaData ? this.filterWidget.getValue().metaData.dataType : '') : '';
    switch (picklist) {
      case '0':
        if (dataType === 'NUMC') {
          const checkPreviousApplied = this.filterCriteria.filter(fill => fill.conditionFieldId === this.filterWidget.getValue().fieldId);
          this.removeOldFilterCriteria(checkPreviousApplied);
          this.emitEvtFilterCriteria(this.filterCriteria);
          this.numericValCtrl.setValue(this.filterResponse.max);
          this.sliderval.setValue(this.filterResponse.max);
        } else if (dataType === 'DTMS' || dataType === 'DATS') {
          this.clearSelectedPicker();
        }
        break;
      case '1':
      case '30':
      case '37':
        this.removeSingleSelectedVal(true);
        break;
      case '29':
        this.isClearFilter = !this.isClearFilter;
        break;
      default:
        break;
    }
    this.enableClearIcon = false;
    if(isClearButtonClicked) {
      this.isClearButtonClicked = true;
    }
  }


  /**
   * function to get value of location selection
   * @param node selection change of location
   */
  getLocationSelection(node: string[]) {
    console.log(node);
    const filterCriteria = this.filterCriteria;
    const hasCondition = this.filterCriteria.filter(fil => fil.conditionFieldId === this.filterWidget.getValue().fieldId);
    if (node) {
      if (hasCondition) {
        hasCondition.forEach(has => {
          filterCriteria.splice(filterCriteria.indexOf(has), 1);
        });
      }
      node.forEach(n => {
        const criteria = new Criteria();
        criteria.conditionFieldValue = n;
        criteria.conditionOperator = ConditionOperator.LOCATION;
        criteria.blockType = BlockType.COND;
        criteria.conditionFieldId = this.filterWidget.getValue().fieldId;
        criteria.fieldId = this.filterWidget.getValue().fieldId;
        filterCriteria.push(criteria);
        this.enableClearIcon = true;
      });
    } else {
      if (hasCondition) {
        hasCondition.forEach(has => {
          filterCriteria.splice(filterCriteria.indexOf(has), 1);
        });
      }
    }
    this.filterCriteria = [...filterCriteria];
    this.emitEvtFilterCriteria([...filterCriteria]);
    console.log(node);
  }

  /**
   * function to control slider value entered by user..
   */
  slidervalue(event) {
    const value = event.value;
    if (this.filterResponse.min <= value && value <= this.filterResponse.max) {
      this.numericValCtrl.setValue(value);
    } else if (value > this.filterResponse.max) {
      this.numericValCtrl.setValue(this.filterResponse.max);
    } else if (value < this.filterResponse.min) {
      this.numericValCtrl.setValue(this.filterResponse.min);
    }
    this.sliderValueChange(event);
  }

  /**
   * should load the data when user scroll the filter value
   */
  onScroll() {
    if (this.isLoadMore) {
      this.loadAlldropData(this.filterWidget.value.fieldId, this.filterCriteria, this.searchString, this.searchAfter);
    }
  }

  /**
   * should remove the filter of that current fieldId which is on filter
   * @param fieldId selected fieldId
   */
  removefilter(fieldId: string, filterCriteria: Criteria[]): Criteria[] {
    if (!filterCriteria) {
      return [];
    }
    const dupFilterCiteria = [...filterCriteria];
    const removeValue = filterCriteria.filter(fill => fill.fieldId === fieldId && fill.widgetType === WidgetType.FILTER);
    removeValue.forEach(val => {
      dupFilterCiteria.splice(dupFilterCiteria.indexOf(val), 1);
    });
    return dupFilterCiteria;
  }

  onfocus() {
    this.filteredArray = this.filteredOptionsSubject.value.length;
      this.loadAlldropData(this.filterWidget.value.fieldId, this.filterCriteria, '', '');
  }

  /**
   * Return the value of DisplayCriteria
   */
  setDisplayCriteria(code: string, text: string): string {
    switch (this.displayCriteriaOption) {
      case DisplayCriteria.CODE:
        return code || '';
      case DisplayCriteria.TEXT:
        return text || '';
      case DisplayCriteria.CODE_TEXT:
        return `${code || ''} -- ${text || ''}`;
      default:
        break;
    }
    return text ? text : code;
  }

  /**
   * Save DisplayCriteria and update filter widget
   */
  saveDisplayCriteria() {
    const saveDisplayCriteria = this.widgetService.saveDisplayCriteria(this.widgetInfo.widgetId, this.widgetInfo.widgetType, this.displayCriteriaOption).subscribe(res => {
      this.filteredOptionsSubject.value.forEach(v => {
        v.display = this.setDisplayCriteria(v.CODE, v.TEXT);
      });
      // Update filterFormControl with updated values
      if (this.filterFormControl.value) {
        this.filteredOptionsSubject.value.forEach(v => {
          if (v.CODE === this.filterFormControl.value.CODE) {
            this.filterFormControl.setValue(v);
          }
        });
      }
      // Update selectedDropVals with updated values
      if (this.selectedDropVals && this.selectedDropVals.length > 0) {
        this.selectedDropVals.forEach(item => {
          this.filteredOptionsSubject.value.forEach(v => {
            if (v.CODE === item.CODE) {
              item.display = v.display;
            }
          });
        });
      }
      this.loadAlldropData(this.filterWidget.value.fieldId, this.filterCriteria, '', undefined, true);
    }, error => {
      console.error(`Error : ${error}`);
      this.toasterService.open(`Something went wrong`, 'Close', { duration: 3000 });
    });
    this.subscriptions.push(saveDisplayCriteria);
  }

  /* Sort dropdownn Data */
  sortDropdownData(values: DropDownValues[]) {
    const sortBy = this.filterWidget.getValue()?.orderWith;
    if (this.displayCriteriaOption === DisplayCriteria.TEXT) {
      if (sortBy === OrderWith.DESC) {
        values?.sort((a, b) => { return b?.TEXT.localeCompare(a?.TEXT); });
      } else if (sortBy === OrderWith.ASC) {
        values?.sort((a, b) => { return a?.TEXT.localeCompare(b?.TEXT); });
      }
    } else if (this.displayCriteriaOption === DisplayCriteria.CODE || this.displayCriteriaOption === DisplayCriteria.CODE_TEXT) {
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

  }
}
