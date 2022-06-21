import { Component, OnInit, ViewChild, OnChanges, Inject, LOCALE_ID, OnDestroy, SimpleChanges, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { WidgetService } from 'src/app/_services/widgets/widget.service';
import { GenericWidgetComponent } from '../../generic-widget/generic-widget.component';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import {
  ReportingWidget,
  Criteria,
  LayoutConfigWorkflowModel,
  DisplayCriteria,
  ConditionOperator,
  WidgetType,
  BlockType,
  FormControlType,
} from '../../../_models/widget';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EndpointService } from '@services/endpoint.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedServiceService } from '@shared/_services/shared-service.service';
import { ReportService } from '@modules/report-v2/_service/report.service';
import { UserService } from '@services/user/userservice.service';
import { Userdetails } from '@models/userdetails';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import * as moment from 'moment';
import { DropDownValue } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { MetadataModel, MetadataModeleResponse } from '@models/schema/schemadetailstable';
import { switchMap } from 'rxjs/operators';
import { formatNumber } from '@angular/common';
import { isEqual, cloneDeep } from 'lodash';
import { CoreService } from '@services/core/core.service';
import { SummaryFormDetails } from '@modules/transaction/model/transaction';
import { ListService } from '@services/list/list.service';

@Component({
  selector: 'pros-reporting-list',
  templateUrl: './reporting-list.component.html',
  styleUrls: ['./reporting-list.component.scss'],
})
export class ReportingListComponent extends GenericWidgetComponent implements OnInit, OnChanges, OnDestroy {
  resultsLength: any;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  dataSource: MatTableDataSource<any> = [] as any;
  pageSize = 100;
  pageIndex = 0;
  sortingField = '';
  sortingDir = '';
  listData: any[] = new Array();

  pageSizeOption = [100, 200, 300, 400];

  wfvalFields = ['RCVD_ON', 'TASKID', 'STATUS', 'USR', 'STP', 'EXPD_ON', 'REJECT_COMMENTS', 'REQ_BY', 'USR_ROLE', 'CURRENTUSER', 'CURRENTROLE', 'SLA', 'TIME_TAKEN', 'ACTIONED_ON']

  /**
   * Columns that need to display
   */
  displayedColumnsId: string[] = ['action', 'objectNumber'];
  displayedColumnsFilterId: string[] = [];
  /**
   * Store fieldid & description as key | value
   */
  columnDescs: any = {} as any;

  activeSorts: any = null;

  plantCode: string;
  roleId: string;

  /**
   * to store data table column meta data
   * when to use.. we will use it when we will open column settings side-sheet to show pre selected fields..
   */
  tableColumnMetaData: ReportingWidget[];
  dropDownValues = {};
  filteredDropDownValues = {};
  selectedMultiSelectData = {};
  localFilterCriteria: Criteria[] = [];
  filteredList = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  reportingListWidget: BehaviorSubject<ReportingWidget[]> = new BehaviorSubject<ReportingWidget[]>(null);

  /**
   * hold info about layouts ...
   */
  layouts: LayoutConfigWorkflowModel[] = [];
  dateFormat: string;
  onlyDateFormat : string;

  /**
   * To hold subscriptions of component
   */
  subscription: Subscription[] = [];
  returndata: any;
  userDetails: Userdetails;
  reportingListFilterForm: FormGroup;
  /**
   * To hold meta details for all possible columns
   */
  allColumnMetaDataFields: MetadataModeleResponse;
  /**
   * to store the details of the dispalyed column id
   */
  displayedColumnDetails: any;

  /**
   * to hold that is filter criteria clicked  or not
   */
  @Input() hasFilterCriteria: boolean;
  @Input() moduleId: string;
  flowList: Observable<SummaryFormDetails> = of({forms:[]});

  flowSearchControl: FormControl = new FormControl('');
  constructor(
    public widgetService: WidgetService,
    @Inject(LOCALE_ID) public locale: string,
    public matDialog: MatDialog,
    private endpointService: EndpointService,
    private snackbar: MatSnackBar,
    private router: Router,
    private sharedService: SharedServiceService,
    private reportService: ReportService,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private schemaDetailsService: SchemaDetailsService,
    private coreService : CoreService,
    private listService: ListService,
    private activatedRouter:ActivatedRoute
  ) {
    super(matDialog);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes &&
      changes.filterCriteria &&
      !isEqual(changes.filterCriteria.currentValue, changes.filterCriteria.previousValue) &&
      !this.widgetInfo.isEnableGlobalFilter
    ) {
      if (changes.filterCriteria.currentValue.length) {
        this.hasFilterCriteria = false;
      } else {
        this.hasFilterCriteria = true;
      }
      this.isFetchingData = true;
      this.reportingListWidget.next(this.reportingListWidget.getValue());
    }

    if (
      changes &&
      changes.widgetInfo &&
      changes.widgetInfo.previousValue !== undefined &&
      !isEqual(changes.widgetInfo.currentValue, changes.widgetInfo.previousValue)
    ) {
      this.resultsLength = 0;
      this.configData();
      const sub1 = this.widgetService
        .getHeaderMetaData(this.widgetId)
        .pipe(switchMap((value) => this.coreService.getMetadataFieldsByModuleId([value.objectType])))
        .subscribe(
          (res) => {
            this.allColumnMetaDataFields = res;
            this.getListTableMetadata();
          },
          (error) => {
            this.isFetchingData = false;
            console.log('Something went wrong while getting header meta data', error.message);
          }
        );
      this.subscription.push(sub1);
    }
  }

  /**
   * ANGULAR HOOK..
   */
  ngOnInit(): void {
    this.resultsLength = 0;
    this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
    this.configData();
    this.initializeForm();
    this.getUserDetails();
    this.isFetchingData = true;
    const sub1 = this.widgetService
      .getHeaderMetaData(this.widgetId)
      .pipe(switchMap((value) => this.coreService.getMetadataFieldsByModuleId([value.objectType])))
      .subscribe(
        (res : any) => {
          this.allColumnMetaDataFields = res;
          this.getListTableMetadata();
        },
        (error) => {
          this.isFetchingData = false;
          console.log('Something went wrong while getting header meta data', error.message);
        }
      );
    this.subscription.push(sub1);
    const sub = this.sharedService.getReportDataTableSetting().subscribe((response) => {
      if (response?.isRefresh === true) {
        this.getListTableMetadata();
      }
    });
    this.subscription.push(sub);

    const subs = this.reportingListWidget.subscribe((res) => {
      if (res) {
        if (this.hasFilterCriteria) {
          this.clearFilter(false);
        }
        this.getListdata(this.pageSize, this.pageIndex, this.widgetId, this.filterCriteria, this.activeSorts);
      }
    });
    this.subscription.push(subs);
    const sideSheetSubs = this.reportService.sideSheetStatusChange().subscribe((res) => {
      if (res && Object.keys(this.reportingListFilterForm.controls).length) {
        this.reportingListFilterForm.reset();
        this.filterCriteria = this.filterCriteria.filter((item) => item.widgetId !== this.widgetId);
        this.filteredList = this.reportService.getFilterCriteria(this.widgetId) || [];
        const filteredResponse = this.filteredList.filter(
          (item) => item.conditionFieldValue || item.conditionFieldStartValue || item.conditionFieldEndValue
        );
        filteredResponse.forEach((item) => {
          const value = new Criteria();
          value.conditionFieldId = item.conditionFieldId;
          value.conditionOperator = item.conditionOperator;
          value.blockType = item.blockType;
          value.fieldId = item.fieldId;
          value.blockType = BlockType.COND;
          value.widgetType = WidgetType.TABLE_LIST;
          value.widgetId = this.widgetId;
          if (item.conditionFieldValue) {
            value.conditionFieldValue = item.conditionFieldValue;
            if(item.conditionFieldValueText){
              value.conditionFieldValueText = item.conditionFieldValueText;
            }
          } else if (item.conditionFieldStartValue || item.conditionFieldEndValue) {
            value.conditionFieldStartValue = item.conditionFieldStartValue;
            value.conditionFieldEndValue = item.conditionFieldEndValue;
          }
          value.parent = item.parent ? item.parent : 'false';
          value.child = item.child ? item.child : null;
          this.filterCriteria.push(value);
        });
        this.tableColumnMetaData = this.reportService.getColumnMetaData(this.widgetId);
        this.selectedMultiSelectData = {};
        this.filterCriteria.forEach((item) => {
          if (item.widgetId === this.widgetId) {
            const type = this.getFormFieldType(item.fieldId);
            if (type === FormControlType.TEXT || type === FormControlType.TEXTAREA || type === FormControlType.CHECKBOX || type === false) {
              this.reportingListFilterForm.controls[item.fieldId].setValue(item.conditionFieldValue, { emitEvent: false });
            } else if (type === FormControlType.DROP_DOWN) {
              this.reportingListFilterForm.controls[item.fieldId].setValue(item.conditionFieldValue, { emitEvent: false });
            // } else if (type === FormControlType.MULTI_SELECT) {
            //   if (!this.selectedMultiSelectData[item.fieldId]) {
            //     this.selectedMultiSelectData[item.fieldId] = [];
            //   }
            //   this.selectedMultiSelectData[item.fieldId].push(item.conditionFieldValue)
             } else if (type === FormControlType.MULTI_SELECT) {
              if (!this.selectedMultiSelectData[item.fieldId]) {
                this.selectedMultiSelectData[item.fieldId] = [];
              }
              const obj = {};
              const objKey = ['CODE','TEXT'];
              obj[objKey[0]] = item.conditionFieldValue;
              obj[objKey[1]] = item.conditionFieldValueText;
              this.selectedMultiSelectData[item.fieldId].push(obj)
            } else if(type === FormControlType.HIERARCHY){
              if (!this.selectedMultiSelectData[item.fieldId]) {
                this.selectedMultiSelectData[item.fieldId] = [];
              }
              const obj = {};
              const objKey = ['CODE','TEXT','parent','child'];
              obj[objKey[0]] = item.conditionFieldValue;
              obj[objKey[1]] = item.conditionFieldValueText;
              obj[objKey[2]] = item.parent ? item.parent : 'false';
              obj[objKey[3]] = item.child ? item.child : null;
              this.selectedMultiSelectData[item.fieldId].push(obj)
            } else if (type === FormControlType.DATE) {
              this.reportingListFilterForm.controls[item.fieldId].setValue({
                start: new Date(Number(item.conditionFieldStartValue)),
                end: new Date(Number(item.conditionFieldEndValue)),
              });
            } else if (type === FormControlType.DATE_TIME) {
              this.reportingListFilterForm.controls[item.fieldId].setValue({
                start: new Date(Number(item.conditionFieldStartValue)),
                end: new Date(Number(item.conditionFieldEndValue)),
              });
            } else if (type === FormControlType.TIME) {
              const startValue = new Date(Number(item.conditionFieldStartValue));
              const endValue = new Date(Number(item.conditionFieldEndValue));
              this.reportingListFilterForm.controls[item.fieldId].setValue({
                start: { hours: startValue.getHours(), minutes: startValue.getMinutes() },
                end: { hours: endValue.getHours(), minutes: endValue.getMinutes() },
              });
            } else if (type === FormControlType.RADIO) {
              this.reportingListFilterForm.controls[item.fieldId].setValue(item.conditionFieldValue);
            } else if (type === FormControlType.NUMBER) {
              this.reportingListFilterForm.controls[item.fieldId].setValue({
                min: item.conditionFieldStartValue,
                max: item.conditionFieldEndValue,
              });
            }
          }
        });
        this.subscription.push(sideSheetSubs);
        // if (this.filteredList.length)
          this.emitEvtFilterCriteria();
        if (Object.keys(this.reportingListFilterForm.controls).length)
          this.getListdata(this.pageSize, this.pageIndex * this.pageSize, this.widgetId, this.filterCriteria, this.activeSorts);
      }
    });
    this.flowSearchControl.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe(searchTxt => {
      this.getFlowListOptions('3',searchTxt);
    });
  }

  initializeForm() {
    this.reportingListFilterForm = this.formBuilder.group({});
  }

  /**
   * function to get logged in user details
   */
  public getUserDetails() {
    const sub = this.userService.getUserDetails().pipe(distinctUntilChanged()).subscribe(user => {
      this.userDetails = user;
      this.plantCode = user.plantCode;
      this.roleId = user.currentRoleId;
      switch (user.dateformat) {
        case 'mm.dd.yy':
          this.dateFormat = 'MM.dd.yyyy, h:mm:ss a';
          this.onlyDateFormat = 'MM.dd.yyyy';
          break;

        case 'dd.MM.yy':
          this.dateFormat = 'dd.MM.yyyy, h:mm:ss a';
          this.onlyDateFormat = 'dd.MM.yyyy';
          break;

        case 'dd M, yy':
          this.dateFormat = 'dd MMM, yyyy, h:mm:ss a';
          this.onlyDateFormat = 'dd MMM, yyyy';
          break;

        case 'MM d, yy':
          this.dateFormat = 'MMMM d, yyyy, h:mm:ss a';
          this.onlyDateFormat = 'MMMM d, yyyy';
          break;

        default:
          break;
      }
    }, (error) => {
      console.log('Something went wrong while getting user details.', error.message)
    });
    this.subscription.push(sub);
  }

  /**
   * function to get header meta data of widget
   */
  public configData(): void {
    this.widgetInfo.displayCriteria = this.widgetInfo.displayCriteria ? this.widgetInfo.displayCriteria : DisplayCriteria.CODE;
    this.pageSize = this.widgetInfo.pageDefaultSize || 100;
    if (this.widgetInfo.pageDefaultSize) {
      this.pageSizeOption = [this.widgetInfo.pageDefaultSize, 100, 200, 300, 400];
    } else {
      this.pageSizeOption = [100, 200, 300, 400];
    }
  }

  /**
   * function to get meta data of the columns for data table
   */
  public getListTableMetadata(): void {
    this.displayedColumnsId = ['action'];
    // this.columnDescs = {};
    const fieldsArray = [];
    const sub = this.widgetService.getListTableMetadata(this.widgetId, this.widgetInfo.objectType,this.widgetInfo).subscribe(
      (returnData: ReportingWidget[]) => {
        if (returnData !== undefined && Object.keys(returnData).length > 0) {
          returnData.forEach((singlerow) => {
            const obj = { fields: singlerow.fields, fieldOrder: singlerow.fieldOrder, ...this.getFieldType(singlerow.fldMetaData) };
            fieldsArray.push(obj);
            this.columnDescs[singlerow.fields] = singlerow.fieldDesc ? singlerow.fieldDesc : singlerow.fldMetaData.fieldDescri;
            singlerow.fieldDesc = singlerow.fieldDesc ? singlerow.fieldDesc : singlerow.fldMetaData.fieldDescri;
          });
          const sortedFields = this.sortDisplayedColumns(fieldsArray);
          this.displayedColumnDetails = [...sortedFields];
          this.displayedColumnsId = [...this.displayedColumnsId, ...sortedFields.map((elm) => elm.fields)];
          this.displayedColumnsFilterId = this.displayedColumnsId.map((item, index) => {
            this.reportingListFilterForm.addControl(item, new FormControl());
            return index.toString();
          });
          this.tableColumnMetaData = returnData;
          this.reportService.setColumnMetaData(this.tableColumnMetaData, this.widgetId);
          this.reportingListWidget.next(returnData);
          this.displayedColumnsId.forEach((fieldId) => {
            const type = this.getFormFieldType(fieldId);
            if (type === FormControlType.DROP_DOWN || type === FormControlType.TEXT || (fieldId !== 'action' && type === false)) {
              const subRes = this.reportingListFilterForm.controls[fieldId].valueChanges.pipe(debounceTime(1000)).subscribe((res) => {
                if (
                  res !== null &&
                  ((type === FormControlType.DROP_DOWN && res === '') ||
                    type === FormControlType.TEXT ||
                    (fieldId !== 'action' && type === false))
                ) {
                  this.onFilterApplied(fieldId, type);
                }
              });
              this.subscription.push(subRes);
            }
          });
        } else {
          this.isFetchingData = false;
        }
      },
      (error) => {
        this.isFetchingData = false;
        console.log('Something went wrong while getting table meta data', error.message);
      }
    );
    this.subscription.push(sub);
  }

  /**
   * function to get sorted meta data of the columns for data table
   */
  sortDisplayedColumns(array: any[]) {
    return array.sort((a, b) => a.fieldOrder - b.fieldOrder);
  }

  public getListdata(pageSize, pageIndex, widgetId: number, criteria: Criteria[], soringMap): void {
    if (this.widgetInfo.objectType && this.widgetInfo.widgetTableFields && this.widgetInfo.widgetTableFields.length > 0) {
      this.widgetService
        .getListdata(String(pageSize), String(pageIndex), String(widgetId), criteria, soringMap, this.userDetails?.defLocs?.toString())
        .subscribe((returndata) => {
          this.isFetchingData = false;
          this.returndata = returndata;
          this.updateTable(this.returndata);
        },err => {
          this.isFetchingData = false;
        });
    }
  }

  private updateTable(returndata) {
    this.listData = new Array();
    this.resultsLength = returndata.count;
    if (returndata.data) {
      returndata = returndata.data;
    }

    (Array.isArray(returndata) ? returndata : returndata.hits.hits).forEach((element) => {
      const source = element.sourceAsMap ? element.sourceAsMap : element;
      let objectNumber = source.id
        ? source.id
        : source.staticFields && source.staticFields.OBJECT_NUMBER && source.staticFields.OBJECT_NUMBER.vc
        ? source.staticFields.OBJECT_NUMBER.vc[0].c
        : element.id;

      if (
        source.staticFields &&
        source.staticFields.MASSPROCESSING_ID &&
        source.staticFields.MASSPROCESSING_ID.vc &&
        source.staticFields.MASSPROCESSING_ID.vc !== undefined
      ) {
        objectNumber =
          source.staticFields.OBJECTID && source.staticFields.OBJECTID.vc !== undefined
            ? source.staticFields.OBJECTID.vc[0].c
            : objectNumber;
      }
      const obj = { objectNumber };
      const status = source ? source.stat : '';
      if (status !== '' && status !== undefined && this.displayedColumnsId.indexOf('stat') > -1) {
        const colststus = 'stat';
        obj[colststus] = status;
      }
      const hdvs = source.hdvs !== undefined ? source.hdvs : source.staticFields !== undefined ? source.staticFields : source;
      const hyvs = source.hyvs !== undefined ? source.hyvs : null;
      const gvs = source.gvs !== undefined ? source.gvs : null;
      const wfvs = source.wfvs !== undefined ? source.wfvs : null;

      if (source.staticFields !== undefined) {
        Object.assign(hdvs, source.staticFields);
      }
      const gvsData = [];
      const hvysData = [];
      const wfvsData = [];
      this.displayedColumnsId.forEach((column) => {
        if (column === 'action' || column === 'objectNumber' || column === 'stat') {
          if (column === 'objectNumber') {
            obj[column] = objectNumber;
          }
        } else {
          if (hdvs[column]) {
            // check for dropdown , multiselect , userselection and objectRefrence
            const val = hdvs[column].vc ? hdvs[column].vc : null;
            if (val) {
              const valArray = [];
              val.forEach((v) => {
                if (v.t) {
                  valArray.push(v.t);
                }
              });
              let textvalue = valArray.toString();
              const reportingWidget = this.tableColumnMetaData ? this.tableColumnMetaData.find((t) => t.fields === column) : null;
              textvalue = textvalue === 'null' ? '' : textvalue;
              let codeValue = hdvs[column]
                ? hdvs[column].vc && hdvs[column].vc[0]
                  ? hdvs[column].vc.map((item) => item.c).toString()
                  : ''
                : '';
              codeValue = codeValue === 'null' ? '' : codeValue;
              if (
                (reportingWidget.fldMetaData.dataType === 'NUMC' || reportingWidget.fldMetaData.dataType === 'DEC') && reportingWidget.fldMetaData.picklist !== '53' && reportingWidget.fldMetaData.picklist !== '52' &&
                textvalue.length > 0
              ) {
                textvalue = formatNumber(Number(textvalue), 'en-US');
              }
              if (
                (reportingWidget.fldMetaData.dataType === 'NUMC' || reportingWidget.fldMetaData.dataType === 'DEC') && reportingWidget.fldMetaData.picklist !== '53' && reportingWidget.fldMetaData.picklist !== '52' &&
                codeValue.length > 0
              ) {
                codeValue = formatNumber(Number(codeValue), 'en-US');
              }
              if (
                column === 'OVERDUE' ||
                column === 'FORWARDENABLED' ||
                column === 'TIME_TAKEN' ||
                column === 'CLAIMED' ||
                reportingWidget.fldMetaData.picklist === '35'
              ) {
                textvalue = this.getFields(column, codeValue);
                codeValue = codeValue;
              }
              obj[column] = this.getObjectData(codeValue, textvalue, column);
            }
          } else {
            const selectedDetails = this.displayedColumnDetails.find((columnDetails) => columnDetails.fields === column);
            if (selectedDetails.isGrid && gvs && gvs[selectedDetails.parentFieldId]) {
              gvs[selectedDetails.parentFieldId].rows.forEach((row, index) => {
                const val = row[column] && row[column].vc ? row[column].vc : null;
                if (val) {
                  const valArray = [];
                  val.forEach((v) => {
                    if (v.t) {
                      valArray.push(v.t);
                    }
                  });

                  let textvalue = valArray.toString();
                  const reportingWidget = this.tableColumnMetaData ? this.tableColumnMetaData.find((t) => t.fields === column) : null;
                  textvalue = textvalue === 'null' ? '' : textvalue;
                  let codeValue = row[column]
                    ? row[column].vc && row[column].vc[0]
                      ? row[column].vc.map((map) => map.c).toString()
                      : ''
                    : '';
                  codeValue = codeValue === 'null' ? '' : codeValue;
                  if (
                    (reportingWidget.fldMetaData.dataType === 'NUMC' || reportingWidget.fldMetaData.dataType === 'DEC') && reportingWidget.fldMetaData.picklist !== '53' && reportingWidget.fldMetaData.picklist !== '52' &&
                    textvalue.length > 0
                  ) {
                    textvalue = formatNumber(Number(textvalue), 'en-US');
                  }
                  if (
                    (reportingWidget.fldMetaData.dataType === 'NUMC' || reportingWidget.fldMetaData.dataType === 'DEC') && reportingWidget.fldMetaData.picklist !== '53' && reportingWidget.fldMetaData.picklist !== '52' &&
                    codeValue.length > 0
                  ) {
                    codeValue = formatNumber(Number(codeValue), 'en-US');
                  }
                  obj[column] = this.getObjectData(codeValue, textvalue, column);
                  if (gvsData[index]) {
                    gvsData[index][column] = obj[column];
                  } else {
                    gvsData.push({ [column]: obj[column] });
                  }
                }
              });
            } else if (selectedDetails.isHierarchy && hyvs && hyvs[selectedDetails.hierarchyId]) {
              hyvs[selectedDetails.hierarchyId].rows.forEach((row, index) => {
                const val = row[column] && row[column].vc ? row[column].vc : null;
                if (val) {
                  const valArray = [];
                  val.forEach((v) => {
                    if (v.t) {
                      valArray.push(v.t);
                    }
                  });
                  let textvalue = valArray.toString();
                  const reportingWidget = this.tableColumnMetaData ? this.tableColumnMetaData.find((t) => t.fields === column) : null;
                  textvalue = textvalue === 'null' ? '' : textvalue;
                  let codeValue = row[column]
                    ? row[column].vc && row[column].vc[0]
                      ? row[column].vc.map((map) => map.c).toString()
                      : ''
                    : '';
                  codeValue = codeValue === 'null' ? '' : codeValue;
                  if (
                    (reportingWidget.fldMetaData.dataType === 'NUMC' || reportingWidget.fldMetaData.dataType === 'DEC') && reportingWidget.fldMetaData.picklist !== '53' && reportingWidget.fldMetaData.picklist !== '52' &&
                    textvalue.length > 0
                  ) {
                    textvalue = formatNumber(Number(textvalue), 'en-US');
                  }
                  if (
                    (reportingWidget.fldMetaData.dataType === 'NUMC' || reportingWidget.fldMetaData.dataType === 'DEC') && reportingWidget.fldMetaData.picklist !== '53' && reportingWidget.fldMetaData.picklist !== '52' &&
                    codeValue.length > 0
                  ) {
                    codeValue = formatNumber(Number(codeValue), 'en-US');
                  }
                  obj[column] = this.getObjectData(codeValue, textvalue, column);
                  if (hvysData[index]) {
                    hvysData[index][column] = obj[column];
                  } else {
                    hvysData.push({ [column]: obj[column] });
                  }
                }
              });
            } else {
            const selectedDetails = this.wfvalFields.find((columnDetails) => columnDetails === column);
            if (selectedDetails && wfvs) {
              wfvs.forEach((row, index) => {
                const val = row.wfvl[column] && row.wfvl[column].vc ? row.wfvl[column].vc : null;
                if (val) {
                  const valArray = [];
                  val.forEach((v) => {
                    if (v.t) {
                      valArray.push(v.t);
                    }
                  });
                  let textvalue = valArray.toString();
                  const reportingWidget = this.tableColumnMetaData ? this.tableColumnMetaData.find((t) => t.fields === column) : null;
                  textvalue = textvalue === 'null' ? '' : textvalue;
                  let codeValue = row.wfvl[column]
                    ? row.wfvl[column].vc && row.wfvl[column].vc[0]
                      ? row.wfvl[column].vc.map((item) => item.c).toString()
                      : ''
                    : '';
                  codeValue = codeValue === 'null' ? '' : codeValue;
                  if (
                    (reportingWidget.fldMetaData.dataType === 'NUMC' || reportingWidget.fldMetaData.dataType === 'DEC') &&
                    textvalue.length > 0
                  ) {
                    textvalue = formatNumber(Number(textvalue), 'en-US');
                  }
                  if (
                    (reportingWidget.fldMetaData.dataType === 'NUMC' || reportingWidget.fldMetaData.dataType === 'DEC') &&
                    codeValue.length > 0
                  ) {
                    codeValue = formatNumber(Number(codeValue), 'en-US');
                  }
                  if (
                    column === 'OVERDUE' ||
                    column === 'FORWARDENABLED' ||
                    column === 'TIME_TAKEN' ||
                    column === 'CLAIMED' ||
                    reportingWidget.fldMetaData.picklist === '35'
                  ) {
                    textvalue = this.getFields(column, codeValue);
                    codeValue = codeValue;
                  }
                  obj[column] = this.getObjectData(codeValue, textvalue, column);
                  if (wfvsData[index]) {
                    wfvsData[index][column] = obj[column];
                  } else {
                    wfvsData.push({ [column]: obj[column] });
                  }
                }
              })
            }
          }
        }
      }
      });
      const listData: any[] = [];
      if (gvsData.length) {
        gvsData.forEach((gvsdata) => {
          Object.keys(gvsdata).forEach((key) => {
            obj[key] = gvsdata[key];
          });
          listData.push({ ...obj });
        });
      }
      if (hvysData.length) {
        hvysData.forEach((hvys, index) => {
          Object.keys(hvys).forEach((key) => {
            if (listData[index]) listData[index][key] = hvys[key];
            else {
              obj[key] = hvys[key];
            }
          });

          if (!listData[index]) {
            listData.push({ ...obj });
          }
        });
      }
      if (wfvsData.length) {
        wfvsData.forEach((wfvsData) => {
          Object.keys(wfvsData).forEach((key) => {
            obj[key] = wfvsData[key];
          });
          listData.push({ ...obj });
        });
      }

      if (listData.length) {
        this.listData.push(...listData);
      }
      if (!gvsData.length && !hvysData.length && !wfvsData.length) {
        this.listData.push({ ...obj });
      }
    });
    this.dataSource = new MatTableDataSource<any>(this.listData);
    this.dataSource.sort = this.sort;
    const appliedFilter = this.filterCriteria.filter((item) => item.widgetId === this.widgetId);
    appliedFilter.forEach((filter) => {
      if (filter) {
        this.appliedSelectedFilter(filter);
      }
    });
    console.log(this.dataSource);
    console.log(this.listData);
  }

  getServerData(event): PageEvent {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.getListdata(this.pageSize, this.pageIndex * this.pageSize, this.widgetId, this.filterCriteria, this.activeSorts);
    return event;
  }

  details(data): void {
    const url = document.getElementsByTagName('base')[0].href.substring(0, document.getElementsByTagName('base')[0].href.indexOf('MDOSF'));
    window.open(
      url + 'MDOSF/loginPostProcessor?to=summary&objNum=' + data.objectNumber + '&objectType=' + this.widgetInfo.objectType,
      'MDO_TAB'
    );
  }

  /*
   * down report list data as CSV
   *If data less then 5000 then download instant
   *Otherwise open dialog and ask for page from number ..
   *
   */
  downloadCSV(): void {
    this.router.navigate(['', { outlets: { sb: `sb/report/download-widget/${this.widgetId}` } }], {
      queryParams: { conditionList: `${JSON.stringify(this.filterCriteria)}` },
      queryParamsHandling: 'merge',
    });
  }

  /**
   * Use to get sorted column and
   * call http with sorted columns
   * @param sort the event emitted by CDK table
   */
  sortTable(sort: Sort) {
    if (sort) {
      const fld = sort.active;
      const dir = sort.direction as string;
      this.activeSorts = {} as any;
      this.activeSorts[fld] = dir;
      if (dir === '') {
        this.activeSorts = null;
      }
      this.getListdata(this.pageSize, this.pageIndex * this.pageSize, this.widgetId, this.filterCriteria, this.activeSorts);
    }
  }

  /**
   * Download data , call service with filter criteria and page from ...
   */
  downloadData(frm: number) {
    frm = frm * 5000;
    const downloadLink = document.createElement('a');
    downloadLink.href = `${this.endpointService.downloadWidgetDataUrl(String(this.widgetId))}?from=${frm}&conditionList=${JSON.stringify(
      this.filterCriteria
    )}`;
    downloadLink.setAttribute('target', '_blank');
    document.body.appendChild(downloadLink);
    downloadLink.click();
  }

  emitEvtFilterCriteria(): void {
    this.evtFilterCriteria.emit(this.filterCriteria);
  }

  isDateType(column: string): boolean {
    const val = this.reportingListWidget.getValue() ? this.reportingListWidget.getValue() : [];
    const hasFld = val.filter((fil) => fil.fields === column)[0];
    return hasFld
      ? hasFld.fldMetaData
        ? hasFld.fldMetaData.dataType === 'DATS' || hasFld.fldMetaData.dataType === 'DTMS' || hasFld.fldMetaData.picklist === '53' || hasFld.fldMetaData.picklist === '52'
          ? true
          : false
        : false
      : false;
  }

  getDateTypeValue(val: string): string {
    return Number(val) ? val : '';
  }

  /**
   * Get date or time format for table listing
   * @param column selected column
   * @returns formatted date
   */
  getDateOrTimeFormat(column : string) {
    const val = this.reportingListWidget.getValue() ? this.reportingListWidget.getValue() : [];
    const hasFld = val.filter(fil => fil.fields === column)[0];
    return hasFld.fldMetaData.dataType === 'DATS' ? this.onlyDateFormat ? this.onlyDateFormat : 'dd.mm.yyyy' : this.dateFormat;
  }

  /**
   * function to open column setting side-sheet
   */
  openTableColumnSideSheet() {
    const sortedColumns: ReportingWidget[] = this.sortDisplayedColumns(this.tableColumnMetaData);
    const data = {
      objectType: this.widgetInfo.objectType,
      selectedColumns: sortedColumns.map((columnMetaData) => {
        (columnMetaData as any).fldMetaData.sno = columnMetaData.sno;
        if (columnMetaData.fldMetaData.picklist === '1' || columnMetaData.fldMetaData.picklist === '30' || columnMetaData.fldMetaData.picklist === '37' || columnMetaData.fldMetaData.picklist === '29') {
          columnMetaData.fldMetaData.displayCriteria = columnMetaData.displayCriteria ? columnMetaData.displayCriteria : this.widgetInfo.displayCriteria;
        }
        columnMetaData.fldMetaData.fieldDescri = columnMetaData.fieldDesc;
        return columnMetaData.fldMetaData;
      }),
      isWorkflowdataSet: this.widgetInfo.isWorkflowdataSet,
      isCustomdataSet: this.widgetInfo.isCustomdataSet,
      widgetId: this.widgetId,
      widgetType: this.widgetInfo.widgetType,
      displayCriteria: this.widgetInfo.displayCriteria,
      userDetails: this.userDetails,
      isRefresh: false,
    };
    this.sharedService.setReportDataTableSetting(data);
    this.router.navigate(['', { outlets: { sb: `sb/report/column-settings/${this.widgetId}` } }]);
  }


  ngOnDestroy() {
    this.reportingListWidget.complete();
    this.reportingListWidget.unsubscribe();

    this.subscription.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  isDropdownType(column: string): boolean {
    const val = this.reportingListWidget.getValue() ? this.reportingListWidget.getValue() : [];
    const hasFld = val.filter((fil) => fil.fields === column)[0];
    return hasFld
      ? hasFld.fldMetaData
        ? hasFld.fldMetaData.picklist === '1' || hasFld.fldMetaData.picklist === '30' || hasFld.fldMetaData.picklist === '37' || hasFld.fldMetaData.picklist === '29'
          ? true
          : false
        : false
      : false;
  }

  /**
   * Get the form field type according to meta data of the column
   * @param column name of the column
   * @returns type of form field
   */

  getFormFieldType(column: string) {
    const val = this.tableColumnMetaData.length ? this.tableColumnMetaData : [];
    const hasFld = val.find((fil) => fil.fields === column);
    if (hasFld?.fldMetaData?.picklist) {
      if (hasFld.fldMetaData.picklist === '52') {
        return FormControlType.DATE;
      } else if (hasFld.fldMetaData.picklist === '53') {
        return FormControlType.DATE_TIME;
      } else if (hasFld.fldMetaData.dataType === 'TIMS') {
        return FormControlType.TIME;
      } else if (hasFld.fldMetaData.picklist === '1' || hasFld.fldMetaData.picklist === '30' || hasFld.fldMetaData.picklist === '37') {
        if (hasFld.fldMetaData.isCheckList === 'true') {
          return FormControlType.MULTI_SELECT;
        } else return FormControlType.DROP_DOWN;
      } else if (hasFld.fldMetaData.picklist === '0') {
        if (
          hasFld.fldMetaData.dataType === 'CHAR' ||
          hasFld.fldMetaData.dataType === 'ALTN' ||
          hasFld.fldMetaData.dataType === 'ICSN' ||
          hasFld.fldMetaData.dataType === 'REQ' ||
          hasFld.fldMetaData.dataType === 'TEXT'
        ) {
          return FormControlType.TEXT;
        } else if (this.widgetInfo.fieldCtrl.picklist === '53' || this.widgetInfo.fieldCtrl.picklist === '52') {
          return FormControlType.NUMBER;
        } else {
          return false;
        }
      } else if (hasFld.fldMetaData.picklist === '2') {
        return FormControlType.CHECKBOX;
      } else if (hasFld.fldMetaData.picklist === '4' || hasFld.fldMetaData.picklist === '35') {
        return FormControlType.RADIO;
      } else if (hasFld.fldMetaData.picklist === '22' && hasFld.fldMetaData.dataType === 'CHAR') {
        return FormControlType.TEXTAREA;
      } else if (hasFld.fldMetaData.picklist === '29'){
        return FormControlType.HIERARCHY;
      }else {
        return false;
      }
    } else {
      return false;
    }
  }

  /**
   * Get the list of data for drop downs
   * @param column Name of the column
   * @returns list of the data need to shown in drop down
   */
  getValue(column: string): DropDownValue[] {
    return this.dropDownValues[column];
  }

  /**
   *
   * @param fieldId field id of the column
   * @param formControlType type of form control
   * @param value selected values
   */
  onFilterApplied(fieldId: string, formControlType, value?: any) {
    const filterCriteriaList = cloneDeep(this.filterCriteria);
    const ind = filterCriteriaList.findIndex(item => item.fieldId === fieldId && item.widgetId === this.widgetId)
    if (ind > -1 && formControlType !== FormControlType.MULTI_SELECT && formControlType !== FormControlType.HIERARCHY) {
      let selectedText = '';
      if (!this.reportingListFilterForm.controls[fieldId].value) {
        filterCriteriaList.splice(ind, 1);
        this.filteredList.splice(ind, 1);
      } else if (formControlType === FormControlType.NUMBER) {
        if (this.reportingListFilterForm.controls[fieldId].value) {
          filterCriteriaList[ind].conditionFieldEndValue = this.reportingListFilterForm.controls[fieldId].value.max;
          filterCriteriaList[ind].conditionFieldStartValue = this.reportingListFilterForm.controls[fieldId].value.min;
        }
      } else if (formControlType === FormControlType.DATE) {
        filterCriteriaList[ind].conditionFieldStartValue = moment(this.reportingListFilterForm.controls[fieldId].value.start)
          .valueOf()
          .toString();
        filterCriteriaList[ind].conditionFieldEndValue = moment(this.reportingListFilterForm.controls[fieldId].value.end)
          .endOf('day')
          .valueOf()
          .toString();
      } else if (formControlType === FormControlType.DATE_TIME) {
        filterCriteriaList[ind].conditionFieldStartValue = moment(this.reportingListFilterForm.controls[fieldId].value.start)
          .valueOf()
          .toString();
        filterCriteriaList[ind].conditionFieldEndValue = moment(this.reportingListFilterForm.controls[fieldId].value.end)
          .valueOf()
          .toString();
      } else if (formControlType === FormControlType.TIME) {
        const startValue = this.reportingListFilterForm.controls[fieldId].value.start;
        const endValue = this.reportingListFilterForm.controls[fieldId].value.end;
        filterCriteriaList[ind].conditionFieldStartValue = new Date().setHours(startValue.hours, startValue.minutes).toString();
        filterCriteriaList[ind].conditionFieldEndValue = new Date().setHours(endValue.hours, endValue.minutes).toString();
      } else if (
        formControlType === FormControlType.DROP_DOWN &&
        typeof this.reportingListFilterForm.controls[fieldId].value === 'object'
      ) {
        filterCriteriaList[ind].conditionFieldValue = this.reportingListFilterForm.controls[fieldId].value.CODE;
        selectedText = this.reportingListFilterForm.controls[fieldId].value.TEXT;
      } else if (formControlType === FormControlType.RADIO) {
        filterCriteriaList[ind].conditionFieldValue = value.CODE;
        selectedText = value.TEXT;
      } else {
        filterCriteriaList[ind].conditionFieldValue = this.reportingListFilterForm.controls[fieldId].value;
      }
      if (filterCriteriaList[ind]) {
        this.filteredList[ind] = JSON.parse(JSON.stringify(filterCriteriaList[ind]));
        this.filteredList[ind].conditionFieldValueText = selectedText;
      }
    } else if (ind === -1 && formControlType !== FormControlType.MULTI_SELECT && formControlType !== FormControlType.HIERARCHY  && this.reportingListFilterForm.controls[fieldId].value) {
      let selectedText;
      let conditionOperator;
      const selectedDataIndex = this.filteredList.findIndex((item) => item.fieldId === fieldId);
      if (selectedDataIndex > -1) {
        conditionOperator = this.filteredList[selectedDataIndex].conditionOperator;
      }
      const filterCriteria = new Criteria();
      filterCriteria.fieldId = fieldId;
      filterCriteria.conditionFieldId = fieldId;
      filterCriteria.blockType = BlockType.COND;
      filterCriteria.widgetType = WidgetType.TABLE_LIST;
      filterCriteria.widgetId = this.widgetId;
      filterCriteria.fieldCtrl = this.widgetInfo.fieldCtrl;
      if (formControlType === FormControlType.NUMBER) {
        filterCriteria.conditionOperator = ConditionOperator.RANGE;
        filterCriteria.conditionFieldEndValue = this.reportingListFilterForm.controls[fieldId].value.max;
        filterCriteria.conditionFieldStartValue = this.reportingListFilterForm.controls[fieldId].value.min;
      } else if (formControlType === FormControlType.DATE) {
        filterCriteria.conditionOperator = ConditionOperator.RANGE;
        filterCriteria.conditionFieldStartValue = moment(this.reportingListFilterForm.controls[fieldId].value.start).valueOf().toString();
        filterCriteria.conditionFieldEndValue = moment(this.reportingListFilterForm.controls[fieldId].value.end)
          .endOf('day')
          .valueOf()
          .toString();
      } else if (formControlType === FormControlType.DATE_TIME) {
        filterCriteria.conditionOperator = ConditionOperator.RANGE;
        if (this.reportingListFilterForm.controls[fieldId].value.start && this.reportingListFilterForm.controls[fieldId].value.end) {
          filterCriteria.conditionFieldStartValue = moment(this.reportingListFilterForm.controls[fieldId].value.start).valueOf().toString();
          filterCriteria.conditionFieldEndValue = moment(this.reportingListFilterForm.controls[fieldId].value.end).valueOf().toString();
        } else if (
          !this.reportingListFilterForm.controls[fieldId].value.start &&
          this.reportingListFilterForm.controls[fieldId].value.end
        ) {
          filterCriteria.conditionFieldStartValue = moment(this.reportingListFilterForm.controls[fieldId].value.end).valueOf().toString();
          filterCriteria.conditionFieldEndValue = moment(this.reportingListFilterForm.controls[fieldId].value.end).valueOf().toString();
        } else if (
          this.reportingListFilterForm.controls[fieldId].value.start &&
          !this.reportingListFilterForm.controls[fieldId].value.end
        ) {
          filterCriteria.conditionFieldStartValue = moment(this.reportingListFilterForm.controls[fieldId].value.start).valueOf().toString();
          filterCriteria.conditionFieldEndValue = moment(this.reportingListFilterForm.controls[fieldId].value.start).valueOf().toString();
        }
      } else if (formControlType === FormControlType.TIME) {
        filterCriteria.conditionOperator = ConditionOperator.RANGE;
        const startTime = this.reportingListFilterForm.controls[fieldId].value.start;
        const endTime = this.reportingListFilterForm.controls[fieldId].value.end;
        filterCriteria.conditionFieldStartValue = new Date().setHours(startTime.hours, startTime.minutes).toString();
        filterCriteria.conditionFieldEndValue = new Date().setHours(endTime.hours, endTime.minutes).toString();
      } else if (
        formControlType === FormControlType.DROP_DOWN &&
        typeof this.reportingListFilterForm.controls[fieldId].value === 'object'
      ) {
        if (fieldId === 'TIME_TAKEN') {
          filterCriteria.conditionOperator = ConditionOperator.LESS_THAN_EQUAL;
        } else {
          filterCriteria.conditionOperator = conditionOperator ? conditionOperator : ConditionOperator.EQUAL;
        }
        filterCriteria.conditionFieldValue = this.reportingListFilterForm.controls[fieldId].value.CODE;
        selectedText = this.reportingListFilterForm.controls[fieldId].value.TEXT;
      } else if (formControlType === FormControlType.RADIO) {
        filterCriteria.conditionOperator = conditionOperator ? conditionOperator : ConditionOperator.EQUAL;
        filterCriteria.conditionFieldValue = value.CODE;
        selectedText = value.TEXT;
      } else {
        filterCriteria.conditionOperator = conditionOperator ? conditionOperator : ConditionOperator.CONTAINS;
        filterCriteria.conditionFieldValue = this.reportingListFilterForm.controls[fieldId].value;
      }
      filterCriteriaList.push({ ...filterCriteria });
      filterCriteria.conditionFieldValueText = selectedText;
      if (selectedDataIndex > -1) this.filteredList[selectedDataIndex] = filterCriteria;
      else this.filteredList.push({ ...filterCriteria });
    } else {
      if (value) {
        const selectedData = this.filteredList.find(item => item.fieldId === fieldId);
        this.filteredList = this.filteredList.filter(item => item.fieldId !== fieldId);
        this.filterCriteria = this.filterCriteria.filter(item => (item.widgetId !== this.widgetId) || (item.widgetId === this.widgetId && item.fieldId !== fieldId))
        value.forEach(item => {
          const selectedValue = item.CODE;
          const filterCriteria = new Criteria();
          filterCriteria.fieldId = fieldId;
          filterCriteria.conditionFieldId = fieldId;
          filterCriteria.conditionFieldValue = selectedValue;
          filterCriteria.blockType = BlockType.COND;
          filterCriteria.widgetType = WidgetType.TABLE_LIST;
          filterCriteria.fieldCtrl = this.widgetInfo.fieldCtrl;
          filterCriteria.widgetId = this.widgetId;
          filterCriteria.conditionOperator = selectedData && selectedData.conditionOperator ? selectedData.conditionOperator : ConditionOperator.EQUAL;
          filterCriteria.parent = item.parent ? item.parent : 'false';
          filterCriteria.child = item.child ? item.child : null;
          filterCriteriaList.push({ ...filterCriteria });
          filterCriteria.conditionFieldValueText = item.TEXT;
          this.filteredList.push(filterCriteria);
        });
      }
    }
    this.reportService.setFilterCriteria(this.filteredList, this.widgetId);
    this.filterCriteria = cloneDeep(filterCriteriaList);
    this.emitEvtFilterCriteria();
  }

  /**
   * clear the local filters of the table
   * @param isLocalClear shows that is table filter clear
   */
  clearFilter(isLocalClear: boolean) {
    this.reportingListFilterForm.reset();
    Object.keys(this.selectedMultiSelectData).forEach((item) => {
      this.selectedMultiSelectData[item] = [];
    });
    this.filteredList = [];
    this.reportService.setFilterCriteria([], this.widgetId);
    if (isLocalClear) {
      this.filterCriteria = this.filterCriteria.filter((item) => item.widgetId !== this.widgetId);
      this.emitEvtFilterCriteria();
      this.getListdata(this.pageSize, this.pageIndex, this.widgetId, this.filterCriteria, this.activeSorts);
    }
  }
  /**
   *
   * @param codeValue code for particular column of table
   * @param textvalue text for particular column of table
   * @param column column name of table
   * @returns resultant value with the combination of code and text according to display criteria
   */
  getObjectData(codeValue, textvalue, column) {
    let value;
    const reportingWidget = this.tableColumnMetaData ? this.tableColumnMetaData.find((t) => t.fields === column) : null;
    const displayCriteria =
      reportingWidget && reportingWidget.displayCriteria ? reportingWidget.displayCriteria : this.widgetInfo.displayCriteria;
    switch (displayCriteria) {
      case DisplayCriteria.CODE:
        value = `${codeValue}`;
        break;
      case DisplayCriteria.TEXT:
        value = `${textvalue ? textvalue : codeValue}`;
        break;
      case DisplayCriteria.CODE_TEXT:
        if (this.isDropdownType(column)) {
          value = `${textvalue ? codeValue + ' -- ' + textvalue : codeValue ? codeValue + ' -- ' + codeValue : ''}`;
        } else {
          value = `${textvalue ? textvalue : codeValue}`;
        }
        break;

      default:
        break;
    }
    return value;
  }

  /**
   *
   * @param fldMetaData fieldMeta data for column
   * @returns object that c
   */
  getFieldType(fldMetaData: MetadataModel) {
    if (fldMetaData.parentField) {
      if (Object.keys(this.allColumnMetaDataFields.grids).indexOf(fldMetaData.parentField) > -1) {
        return { isGrid: true, parentFieldId: fldMetaData.parentField };
      } else {
        const selectedField = this.allColumnMetaDataFields.hierarchy.find((value) => value.fieldId === fldMetaData.fieldId);
        if (selectedField) {
          return { isHierarchy: true, hierarchyId: selectedField.heirarchyId };
        } else {
          return { isHierarchy: false, isGrid: false };
        }
      }
    } else {
      let returnData = {};
      Object.keys(this.allColumnMetaDataFields.grids).some((item) => {
        const index = Object.keys(this.allColumnMetaDataFields.gridFields[item]).indexOf(fldMetaData.fieldId);
        if (index > -1) {
          returnData = { isGrid: true, parentFieldId: item };
          return true;
        }
        return false;
      });
      if (Object.keys(returnData).length) {
        return returnData;
      } else {
        this.allColumnMetaDataFields.hierarchy.some((item) => {
          const hierarchyField = this.allColumnMetaDataFields.hierarchyFields[item.heirarchyId];
          if(!hierarchyField) {
            return false;
          }
          const index = Object.keys(hierarchyField).indexOf(fldMetaData.fieldId);
          if (index > -1) {
            returnData = { isHierarchy: true, hierarchyId: item.heirarchyId };
            return true;
          }
          return false;
        });

        if (Object.keys(returnData).length) {
          return returnData;
        } else {
          return { isHierarchy: false, isGrid: false };
        }
      }
    }
  }

  /**
   * returns the min or max value for range sliders
   * @param fieldId field id for the column
   * @param limitType min or max value
   * @returns minimum or max value for range slider
   */
  getRangeLimit(fieldId: string, limitType: string): number {
    const fieldData = this.tableColumnMetaData.find((item) => item.fields === fieldId);
    if (limitType === 'max') return +fieldData.fldMetaData.maxChar;
  }

  /**
   * navidate to configure filter page
   */
  configureFilters() {
    this.router.navigate([{ outlets: { sb: 'sb/report/configure-filters/' + this.widgetId } }]);
  }

  /**
   * Return display criteria for column
   * @param fieldId field id of the column
   * @returns return the display criteria
   */
  getColumnDisplayCriteria(fieldId) {
    const fldMetaData = this.tableColumnMetaData.find((item) => item.fields === fieldId);
    return fldMetaData.displayCriteria;
  }

  /**
   * apply filters on table
   * @param column column name
   */
  setFilter(event) {
    const column = event.formFieldId;
    const value = event.value;
    const type = this.getFormFieldType(column);
    if (type === FormControlType.RADIO) {
      this.reportingListFilterForm.controls[column].setValue(value.CODE);
    }
    else if (type !== FormControlType.MULTI_SELECT && type !== FormControlType.HIERARCHY) {
      this.reportingListFilterForm.controls[column].setValue(value);
    } else {
      this.selectedMultiSelectData[event.formFieldId] = [...value];
    }
    this.onFilterApplied(column, type, value);
  }

  /**
   *
   * @param fieldId column id
   * @returns get selected time value
   */
  getSelectedTimeValue(fieldId) {
    if (this.reportingListFilterForm.controls[fieldId].value) return this.reportingListFilterForm.controls[fieldId].value;
  }

  /**
   *
   * @param fieldId column id
   * @returns get selected date value
   */
  getSelectedDateValue(fieldId) {
    if (this.reportingListFilterForm.controls[fieldId].value)
      if (!this.reportingListFilterForm.controls[fieldId].value.start && this.reportingListFilterForm.controls[fieldId].value.end) {
        return {
          start: this.reportingListFilterForm.controls[fieldId].value.end,
          end: this.reportingListFilterForm.controls[fieldId].value.end,
        };
      } else if (this.reportingListFilterForm.controls[fieldId].value.start && !this.reportingListFilterForm.controls[fieldId].value.end) {
        return {
          start: this.reportingListFilterForm.controls[fieldId].value.start,
          end: this.reportingListFilterForm.controls[fieldId].value.start,
        };
      }
    return this.reportingListFilterForm.controls[fieldId].value;
  }

  /**
   *
   * @param objectNumber object number
   * @returns the observable that calls the api of meta deta fields
   */
  getMetaDataFields(objectNumber) {
    return this.coreService.getMetadataFieldsByModuleId([objectNumber]);
  }
  /**
   * @param fieldId column id
   * @returns the selected range slider value
   */
  getPreSelectedRangeValue(fieldId) {
    const data = this.filterCriteria.find((item) => item.conditionFieldId === fieldId && item.widgetId === this.widgetId);
    if (data) {
      return { min: data.conditionFieldStartValue, max: data.conditionFieldEndValue };
    }
  }

  getPreSelectedDropdownValue(fieldId) {
    const data = this.filterCriteria.find((item) => item.conditionFieldId === fieldId && item.widgetId === this.widgetId);
    if (data) {
      return data.conditionFieldValue;
    }
  }

  appliedSelectedFilter(item: Criteria) {
    const type = this.getFormFieldType(item.fieldId);
    if (type === FormControlType.TEXT || type === FormControlType.TEXTAREA || type === FormControlType.CHECKBOX || type === false) {
      this.reportingListFilterForm.controls[item.fieldId].setValue(item.conditionFieldValue, { emitEvent: false });
    } else if (type === FormControlType.DROP_DOWN) {
      this.reportingListFilterForm.controls[item.fieldId].setValue(item.conditionFieldValue, { emitEvent: false });
    } else if (type === FormControlType.MULTI_SELECT) {
      if (!this.selectedMultiSelectData[item.fieldId]) {
        this.selectedMultiSelectData[item.fieldId] = [];
      }
      this.selectedMultiSelectData[item.fieldId].push(item.conditionFieldValue);
    } else if (type === FormControlType.DATE) {
      this.reportingListFilterForm.controls[item.fieldId].setValue({
        start: new Date(Number(item.conditionFieldStartValue)),
        end: new Date(Number(item.conditionFieldEndValue)),
      });
    } else if (type === FormControlType.DATE_TIME) {
      this.reportingListFilterForm.controls[item.fieldId].setValue({
        start: new Date(Number(item.conditionFieldStartValue)),
        end: new Date(Number(item.conditionFieldEndValue)),
      });
    } else if (type === FormControlType.TIME) {
      const startValue = new Date(Number(item.conditionFieldStartValue));
      const endValue = new Date(Number(item.conditionFieldEndValue));
      this.reportingListFilterForm.controls[item.fieldId].setValue({
        start: { hours: startValue.getHours(), minutes: startValue.getMinutes() },
        end: { hours: endValue.getHours(), minutes: endValue.getMinutes() },
      });
    } else if (type === FormControlType.RADIO) {
      this.reportingListFilterForm.controls[item.fieldId].setValue(item.conditionFieldValue);
    } else if (type === FormControlType.NUMBER) {
      this.reportingListFilterForm.controls[item.fieldId].setValue({
        min: item.conditionFieldStartValue,
        max: item.conditionFieldEndValue,
      });
    }
  }

  /**
   *
   * @param column holds the fieldId
   * @returns the meta data for field
   */
  getSelectedFieldMetaData(column) {
    const val = this.tableColumnMetaData.length ? this.tableColumnMetaData : [];
    const hasFld = val.find((fil) => fil.fields === column);
    return hasFld;
  }

  getFlowListOptions(eventId: string, searchString?: string): void {
    if(this.widgetInfo.isCustomdataSet || this.widgetInfo.isWorkflowdataSet){
      const array: SummaryFormDetails = {forms: []};
      array.forms.push({
        isNoFlows: true,
        formDesc: 'No Form Found',
        formId: ''
      } as any)
      this.flowList = of(array);
      return;
    }
    this.flowList = this.listService.getFlowList(this.moduleId, eventId, searchString);
  }

  openTransaction(flowId: string, layoutId: string, openActionType: string, docId: string, isNoFlows: boolean) {
    if (!isNoFlows) {
      let docIdValue = 'new';
      if (openActionType === 'change' || openActionType === 'view') {
        docIdValue = docId;
        if (!docId || !docId.trim()) {
          throw new Error(`Object number can't be null or empty`);
        }
      }

      this.router.navigate([{ outlets: { sb: `sb/transaction/${this.moduleId}/${openActionType}/${flowId}/${layoutId}/${this.moduleId}/${docIdValue}/parent` } }], {
        queryParamsHandling: 'preserve',
      });
    }
  }
}
