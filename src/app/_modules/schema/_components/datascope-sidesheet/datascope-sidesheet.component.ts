import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AddFilterOutput, ConnectivityDataScopeConditions, DataScopeSidesheet, SchemaVariantReq } from '@models/schema/schema';
import { FilterCriteria, MetadataModeleResponse } from '@models/schema/schemadetailstable';
import { LoadDropValueReq } from '@models/schema/schemalist';
import { DropDownValue } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { SchemaService } from '@services/home/schema.service';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { SchemaVariantService } from '@services/home/schema/schema-variant.service';
import { UserService } from '@services/user/userservice.service';
import { TransientService } from 'mdo-ui-library';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import * as moment from 'moment';
import { debounce } from 'lodash';
import { CoreService } from '@services/core/core.service';
import { ConnectionService } from '@services/connection/connection.service';
import { MatDialog } from '@angular/material/dialog';
import { ConnectivityDialogComponent } from '@modules/settings/_components/connectivity/connectivity-dialog/connectivity-dialog.component';

@Component({
  selector: 'pros-datascope-sidesheet',
  templateUrl: './datascope-sidesheet.component.html',
  styleUrls: ['./datascope-sidesheet.component.scss']
})
export class DatascopeSidesheetComponent implements OnInit, OnDestroy {
  /**
   * holds date picker options list
   */
  get datePickerOptionsList() {
    const list = [];

    if (this.currentPickerType === 'Quarter') {
      list.push(
        {
          value: 'This_Quarter',
          key: 'This quarter'
        }
      );
    }

    if (this.currentPickerType === 'Day') {
      list.push(
        {
          value: 'yesterday',
          key: 'Yesterday'
        }
      );
    } else {
      list.push(
        {
          value: `Last_${this.currentPickerType}`,
          key: `Last ${this.currentPickerType.toLowerCase()}`
        }
      );
    }

    for (let i=2; i<=6; i++) {
      if (this.currentPickerType !== 'Quarter' || i < 3) {
        list.push(
          {
            value: `Last_${i}_${this.currentPickerType}`,
            key: `Last ${i} ${this.currentPickerType.toLowerCase()}s`
          }
        );
      }
    }

    return list;
  }

  /**
   * Constructor of the class
   */
  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private schemaService: SchemaService,
              private sharedService: SharedServiceService,
              private schemaVariantService: SchemaVariantService,
              private schemaDetailService: SchemaDetailsService,
              private toasterService: TransientService,
              private userService: UserService,
              private coreService: CoreService,
              private connectionService: ConnectionService,
              private matDialog: MatDialog) { }
  /**
   * To hold schema ID of variant
   */
  schemaId: string;

  /**
   * To hold module ID of variant
   */
  moduleId: string;

  /**
   * To hold variant ID
   */
  variantId: string;

  /**
   * To hold all the information about variant..
   */
  variantInfo: SchemaVariantReq = {} as SchemaVariantReq;
  reInilize = true;

  /**
   * To hold fieldId and selected values of filter
   */
  loadDropValuesFor: LoadDropValueReq;

  /**
   * To pass formControl to form-input Component
   */
  variantName= new FormControl('', Validators.required);

  outlet: string;

  /**
   * To hold all subscriptions
   */
  subscriptions: Subscription[] = [];

  scopeCnt = 0;
  entireDatasetCnt = 0;

  datascopeSheetState: DataScopeSidesheet;

  /**
   * holds list of all available filters
   */
  allFilters = [];
  /**
   * holds list of filters based on user search text
   */
  filtersDisplayList = [];
  /**
   * holds list of all available user selected filters
   */
  selectedFilters = [];
  /**
   * holds list of selected filters based on user search text
   */
  selectedFiltersDisplayList = [];
  /**
   * holds currently active filter data
   */
  currentFilter: any;
  /**
   * holds user search string for filter list
   */
  searchString = '';
  /**
   * holds filter list search subject that gets trigerred as user types search text
   */
  filterSearchSub: Subject<string> = new Subject();
  /**
   * holds filter criteria subjects that gets trigerred on any update to filter criteria
   */
  filterCriteriaSub: Subject<string> = new Subject();

  /**
   * holds data for obtaining filter datatype
   */
  dynmaicFilterSchema = {
    0: [
      { dataType: 'CHAR', type: 'input_text' },
      { dataType: 'NUMC', type: 'input_numeric' },
      { dataType: 'DEC', type: 'input_desc' },
      { dataType: 'ALTN', type: 'input_text' },
      { dataType: 'ISCN', type: 'input_text' },
      { dataType: 'REQ', type: 'input_text' },
      { dataType: 'DATS', type: 'picker_date' },
      { dataType: 'DTMS', type: 'picker_date' }
    ],
    1: [
      { dataType: 'AJAX', type: 'dropdown_single' },
      { dataType: 'AJAX', isCheckList: 'true', type: 'dropdown_multi' }
    ],
    30: [
      { dataType: 'AJAX', type: 'dropdown_single' },
      { dataType: 'AJAX', isCheckList: 'true', type: 'dropdown_multi' }
    ],
    37: [
      { dataType: 'AJAX', type: 'dropdown_single' },
      { dataType: 'AJAX', isCheckList: 'true', type: 'dropdown_multi' }
    ],
    2: [
      { dataType: 'CHAR', type: 'checkbox' }
    ],
    4: [
      { dataType: 'CHAR', type: 'radio' }
    ],
    22: [
      { dataType: 'CHAR', type: 'textarea' }
    ],
    TIMS: [
      { dataType: 'Char', type: 'picker_time' }
    ],
    35: [
      { dataType: null, type: 'radio' }
    ]
  };

  /**
   * holds filter data
   */
  filterData = {
    inputTextVal: undefined,
    inputNumericVal: undefined,
    textareaVal: undefined,
    selectedValue: undefined,
    dateCriteria: undefined
  };
  /**
   * hold dropdown values for mulitple choice filter types
   */
  dropdownValues = [];
  /**
   * holds control for multiple choice list search
   */
  dropdownSearchCtrl: FormControl = new FormControl('');
  /**
   * holds filtered dropdown values based on searched text for multiple choice filter types
   */
  dropdownFilteredValues = [];
  /**
   * holds chips for multi dropdown
   */
  dropdownSelectedChips = [];
  /**
   * holds type of active filter
   */
  filterControlType = '';
  /**
   * holds list of selected filter criteria
   */
  selectedFilterCriteria = [];
  /**
   * holds date range value
   */
  dateRangeValue: { start: Date; end: Date } = { start: null, end: null };
  dateValue: Date;
  /**
   * holds time range value
   */
  selectedTimeRange =  {
    start: {
      hours: 0,
      minutes: 0
    },
    end: {
      hours: 0,
      minutes: 0
    }
  };

  /**
   * holds available date picker list
   */
  datePickerList = ['Day', 'Week', 'Month', 'Quarter', 'Year'];
  /**
   * holds current date picker type
   */
  currentPickerType = 'Day';

  /**
   * filter load limit
   */
  filterCntLimit = 20;
  /**
   * holds unparsed data from metadata fields list api
   */
  rawFilterData: MetadataModeleResponse;

  @ViewChild('filterScrollEl') filterScrollEl: ElementRef<HTMLElement>;

  delayedCallForFilter = debounce((searchText: string) => {
    const limit = this.allFilters.length + this.filterCntLimit;
    const selectedFiltersIds = this.selectedFilters.map((x) => x.fieldId);
    this.parseHeaderFields(selectedFiltersIds, limit, searchText);
    this.parseGridFields(selectedFiltersIds, limit, searchText);
    this.parseHierarchyFields(selectedFiltersIds, limit, searchText);

    this.filtersDisplayList = this.allFilters;
  }, 500)

  submitted = false;
  errMsg = '';
  saveInProgress = false;

  connectivityDataScope = {
    currentComponent: '',
    currentConnectionId: ''
  }

  /**
   * ANGULAR HOOK
   * It will be called once when component will be loaded.
   */
  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.schemaId = params?.schemaId;
      this.moduleId = params?.moduleId;
      this.variantId = params?.variantId;
      this.outlet = params?.outlet;
      this.getModuleInfo();

      if (this.router.url.indexOf('/connectivity') !== -1) {
        this.connectivityDataScope.currentComponent = 'connectivity';
        this.getConnectivityDataScope();
      } else {
        if(this.variantId !== 'new') {
          this.getDataScopeDetails(this.variantId);
        } else {
          this.getAllFilters();
        }
      }
    });

    const connectionIdsub = this.activatedRoute.queryParams.subscribe(queryParam => {
      if (queryParam?.connId) {
        this.connectivityDataScope.currentConnectionId = queryParam.connId;
      }
    })
    this.subscriptions.push(connectionIdsub);

    const filterSearchSub = this.filterSearchSub.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchString) => {
      const schemaDetailsSub = this.coreService.getMetadataFieldsByModuleId([this.moduleId], searchString).subscribe(res => {
        this.rawFilterData = res;

        // filters filter list
        this.searchFilters('allList', searchString);
        // filters only selected fields
        this.searchFilters('selectedList', searchString);
      }, error => {
        console.error(`Error : ${error.message}`);
      });

      this.subscriptions.push(schemaDetailsSub);
    });
    this.subscriptions.push(filterSearchSub);

    const filterCriteriaUpdateSub = this.filterCriteriaSub.pipe(debounceTime(300)).subscribe((res) => {
      this.updateDataScopeCount();
    });
    this.subscriptions.push(filterCriteriaUpdateSub);


    const dropdownSearchCtrlSub = this.dropdownSearchCtrl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe((val) => {
      // if (this.dropdownValues.length) {
      //   this.dropdownFilteredValues = this.dropdownValues.filter((x) => x.value.toLowerCase().includes(val.trim().toLowerCase()));
      // }
      this.getFilterValues(this.currentFilter.fieldId, false, val);
    });
    this.subscriptions.push(dropdownSearchCtrlSub);

    this.sharedService.getdatascopeSheetState().subscribe((res) => {
      if (res) {
        this.datascopeSheetState = res;
      }
    });
  }

  getDatascopeCount() {
    const sub = this.schemaService.getDataScopeCount(this.moduleId, []).subscribe((res) => {
      this.entireDatasetCnt = res || 0;
      if (this.variantId === 'new') {
        this.scopeCnt = res || 0;
      }
    });
    this.subscriptions.push(sub);
  }

  getModuleInfo() {
    const moduleInfoByModuleId = this.coreService.searchAllObjectType({lang: 'en', fetchsize: 50, fetchcount: 0, description: ''}, [this.moduleId]).subscribe((moduleData) => {
      const module = moduleData[0];
      this.getDatascopeCount();
    }, error => {
      console.error('Error: {}', error.message);
    });
    this.subscriptions.push(moduleInfoByModuleId);
  }

  /**
   * Function to get variant details
   * @param variantId ID of variant for which details needed.
   */
  getDataScopeDetails(variantId: string) {
    const userSub = this.userService.getUserDetails().pipe(distinctUntilChanged()).subscribe(user => {
      if(user && user?.email) {
        const variantDetais = this.schemaVariantService.getVariantdetailsByvariantId(variantId, user.currentRoleId, user.plantCode, user.userName)
        .subscribe((res) => {
          if (res) {
            this.variantInfo.variantName = res.variantName || '';
            this.variantName.setValue(this.variantInfo.variantName);
            this.variantInfo.filterCriteria = res.filterCriteria || [];
            this.variantInfo.variantId = res.variantId || '';
            this.selectedFilterCriteria = res.filterCriteria;
            this.updateDataScopeCount();
            this.getAllFilters();
          }
        }, (error) => {
          console.log('Something went wrong while getting variant details.', error.message);
        })
        this.subscriptions.push(variantDetais);
      }
    });
    this.subscriptions.push(userSub);
  }

  getConnectivityDataScope() {
    this.connectionService.getDataScopeDetails(this.schemaId).subscribe((res:any) => {
      if (res?.acknowledge && res?.response?.jsonData) {
        this.variantId = 'edit';
        const datascopeJsonData = JSON.parse(res.response.jsonData);
        const dataScopeData = datascopeJsonData.conditions.map((element: ConnectivityDataScopeConditions) => {
          return {
            fieldId: element.FIELDID,
            fldCtrl: {
              fieldId: element.FIELDID
            },
            values: element.VALUE1.split(',')
          }
        });
        this.selectedFilterCriteria = [...dataScopeData];
        this.getAllFilters();
      } else {
        this.addNewDataScope();
      }
    },error => {
      // when there's no saved record of data scope
      if (error.error.errorMsg === 'Please provide valid scenarioId') {
        this.addNewDataScope();
      }
    })
  }

  addNewDataScope() {
    this.variantId = 'new';
    this.getAllFilters();
  }

  /**
   * function to close dataScope side sheet
   */
  close(isSave = false){
    if(this.datascopeSheetState) {
      this.datascopeSheetState.editSheet = false;
      this.datascopeSheetState.isSave = isSave;
      this.sharedService.setdatascopeSheetState(this.datascopeSheetState);
    }
    if (this.connectivityDataScope.currentComponent === 'connectivity') {
        this.router.navigate([{ outlets: { sb: `sb/settings/connectivity`, outer: null } }], {
          queryParams: { connId: this.connectivityDataScope.currentConnectionId },
          queryParamsHandling: 'preserve'
        });
        return;
    }
    this.router.navigate([{ outlets: { [`${this.outlet}`]: null } }], {queryParamsHandling: 'preserve'});
  }

  /**
   * Function to prepare data on filter selection
   * @param event: object emitted on filter selection.
   */
  makeFilterCtrl(event: AddFilterOutput) {
    const filterCtrl: FilterCriteria = new FilterCriteria();
    filterCtrl.fieldId = event.fldCtrl.fieldId;
    filterCtrl.fldCtrl = event.fldCtrl;
    filterCtrl.type = 'DROPDOWN';
    filterCtrl.values = [];
    filterCtrl.textValues = [];
    filterCtrl.selectedValues = [];

    event.selectedValues.forEach((value) => {
      if(value.fieldId === filterCtrl.fieldId) {
        filterCtrl.values.push(value.CODE);
        filterCtrl.textValues.push(value.TEXT);
        filterCtrl.selectedValues.push(value);
      }
    })
    // In case we are adding data-scope
    if(!this.variantInfo.filterCriteria){
      this.variantInfo.filterCriteria = [];
      this.variantInfo.filterCriteria.push(filterCtrl);
    }else{
      // this.variantInfo.filterCriteria.push(filterCtrl);
      let flag = false;
      this.variantInfo.filterCriteria.forEach((filCtrl) => {
        if(filCtrl.fieldId === event.fldCtrl.fieldId) {
          flag = true;
          filCtrl.values =  filterCtrl.values || [];

          filCtrl.selectedValues = filCtrl.selectedValues ? filCtrl.selectedValues.filter(sVal => filterCtrl.selectedValues.some(v => v.CODE === sVal.CODE)) : [];
          filterCtrl.selectedValues.forEach(v => {
            if(!filCtrl.selectedValues.some(value => value.CODE === v.CODE)) {
              filCtrl.selectedValues.push(v);
            }
          });

          filCtrl.textValues = [];
          filCtrl.selectedValues.forEach(v => {
              filCtrl.textValues.push(v.TEXT);
          });
        }
      })
      if(flag === false){
        this.variantInfo.filterCriteria.push(filterCtrl);
      }
    }

    this.updateDataScopeCount();
  }

  updateDataScopeCount() {
    if (this.connectivityDataScope.currentComponent !== 'connectivity') {
      if (this.selectedFilterCriteria.length) {
        const sub = this.schemaService.getDataScopeCount(this.moduleId, this.selectedFilterCriteria).subscribe((res) => {
          const count = (res && res > 0) ? res : 0;
          this.scopeCnt = count;
        });
        this.subscriptions.push(sub);
      } else {
        this.scopeCnt = this.entireDatasetCnt;
      }
    }
  }

  /**
   * Function to show text on chips
   * @param ctrl: object of filterCriteria array from variantInfo..
   */
  prepareTextToShow(ctrl: FilterCriteria) {
    if(ctrl.values.length > 1) {
      return ctrl.values.length;
    } else {
      if(ctrl.textValues && ctrl.textValues.length) {
        return ctrl.textValues[0] || ctrl.fieldId;
      } else {
        const selected = ctrl.selectedValues && ctrl.selectedValues.find(s => s.CODE === ctrl.values[0]);
        return selected ? selected.TEXT : ctrl.fieldId;
      }
    }
  }

  /**
   * Function to load dropdown values for already seleted filters
   */
  loadDropValues(fldC: FilterCriteria) {
    if (fldC && fldC.values) {
      const dropArray: DropDownValue[] = [];
      fldC.values.forEach(val => {
        const dropDetails = fldC.selectedValues && fldC.selectedValues.find(v => v.CODE === val);
        const drop: DropDownValue = dropDetails || { CODE: val, FIELDNAME: fldC.fieldId } as DropDownValue;
        dropArray.push(drop);
      });
      this.loadDropValuesFor = { fieldId: fldC.fieldId, checkedValue: dropArray };
    }
  }

  /**
   * Function to save varient
   */
  saveVarient() {
    this.errMsg = '';
    this.submitted = true;
    this.variantName.setValue(this.variantName.value.trim());
    if(!this.variantName.valid) {
      return;
    } else if (!this.selectedFilterCriteria || !this.selectedFilterCriteria.length) {
      this.errMsg = 'Please select atleast one filter';
      this.submitted = false;
      setTimeout(() => {
        if (!this.submitted) {
          this.errMsg = '';
        }
      }, 1000);
      return;
    }

    if (this.connectivityDataScope.currentComponent !== 'connectivity') {
      this.saveSchemaDataScope();
    } else if (this.connectivityDataScope.currentComponent === 'connectivity') {
      this.saveConnectivityDataScope();
    }
  }

  saveSchemaDataScope() {
    this.variantInfo.variantName = this.variantName.value;
    this.variantInfo.variantId = this.variantInfo.variantId === 'new' ? '' : this.variantId;
    this.variantInfo.schemaId = this.schemaId;
    this.variantInfo.variantType = 'RUNFOR';
    this.variantInfo.filterCriteria = this.selectedFilterCriteria;
    this.saveInProgress = true;
    const saveVariant = this.schemaService.saveUpdateDataScope(this.variantInfo).subscribe((res) => {
      this.saveInProgress = false;
      this.close(true);
      this.sharedService.setDataScope(res);
      this.toasterService.open('This action has been performed.', 'Okay', {
        duration: 2000
      });
    }, (error) => {
      this.saveInProgress = false;
      console.log('Something went wrong while saving data scope', error.message)
    })
    this.subscriptions.push(saveVariant);
  }

  saveConnectivityDataScope() {
    const filterData = this.selectedFilterCriteria.map(data => {
      return {
        FIELDID: data.fieldId,
        VALUE1: data.values.join(),
        VALUE2: '',
        BLOCKTYPE: 'AND',
        CONDITIONOPERATOR: 'EQ'
      }
    });

    const payload = {
      jsonData: JSON.stringify({
        conditions: filterData.length ? filterData : null
      }),
      scenarioId: this.schemaId,
      tenantId: ''
    };

    const content_list = [
      'Existing and related data will be deleted from the system.',
      'Data will be re-synced from the connected system as per the defined scope.',
      'Schema results for this dataset will be deleted.'
    ]

    this.matDialog.open(ConnectivityDialogComponent, {
      data: {
        headerLine: `Data scope modifications will have below consequences:`,
        contentList: content_list,
        confirmationLine: 'This action cannot be undone. Are you sure you want to continue?',
        confirmButtonLabel: 'Continue'
      },
      disableClose: true,
      width: '750px',
      minHeight: '250px',
      autoFocus: false,
      panelClass: 'create-master-panel'
    }).afterClosed().subscribe((dialogData: any) => {
      if (dialogData) {
        this.saveInProgress = true;
        const saveVariant = this.connectionService.postDataScopeDetails(payload)
        .pipe(
          finalize(() => {
            this.saveInProgress = false;
            setTimeout(() => {
              this.errMsg = '';
            }, 500);
          })
        )
        .subscribe(response => {
          this.close(true);
          this.toasterService.open('This action has been performed.', 'Okay', {
            duration: 2000
          });
        }, (error) => {
          this.errMsg = 'Something went wrong while saving data scope';
          console.log('Something went wrong while saving data scope', error.message)
        })
        this.subscriptions.push(saveVariant);
      }
    })
  }

  /**
   * Function to remove filter
   * @param ctrl: filterCriteria of variantInfo
   */
  removeFilter(ctrl: FilterCriteria) {
    const filterToBeRemoved = this.variantInfo.filterCriteria.filter((filterCtrl) => filterCtrl.fieldId === ctrl.fieldId)[0];
    const index = this.variantInfo.filterCriteria.indexOf(filterToBeRemoved);
    this.variantInfo.filterCriteria.splice(index, 1);

    this.updateDataScopeCount();
  }

  /**
   * Function to update chip filter dropdown values
   * @param selectedValues seleted value of chip filter
   * @param fieldId fieldID of filter.
   */
  updateChipFilter(selectedValues, fieldId) {
    this.variantInfo.filterCriteria.forEach((filterCtrl) => {
      if(filterCtrl.fieldId === fieldId) {
        filterCtrl.values.length = 0;
        filterCtrl.textValues = [];
        filterCtrl.selectedValues = selectedValues;
        selectedValues.forEach((value) => {
          filterCtrl.values.push(value.CODE);
          filterCtrl.textValues.push(value.TEXT ? value.TEXT : value.CODE);
        })
      }
    });

    this.updateDataScopeCount();
  }

  /**
   * ANGULAR HOOK
   * Call once after component lifecycle ends..
   */
  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    })
  }

  /**
   * fetches first few filters alomg with selected filters...
   */
  getAllFilters() {
    if (this.allFilters.length) {
      return;
    }
    let selectedFiltersList = [];
    const fieldIdsList = this.selectedFilterCriteria.length ? this.selectedFilterCriteria.map((x) => x.fieldId) : [];
    const schemaDetailsSub = this.coreService.getMetadataFieldsByModuleId([this.moduleId]).subscribe(res => {
      this.rawFilterData = res;

      const limit = this.filterCntLimit;
      const selectedHeaderFields = this.parseHeaderFields(fieldIdsList, limit);
      const selectedGridFields = this.parseGridFields(fieldIdsList, limit);
      const selectedHierarchyFields = this.parseHierarchyFields(fieldIdsList, limit);
      selectedFiltersList = [...selectedHeaderFields, ...selectedGridFields, ...selectedHierarchyFields];

      this.filtersDisplayList = this.allFilters;
      // setting existing values for pre selected filters
      selectedFiltersList.forEach((x) => {
        if (x.isChild) {
          this.selectFilter(x, true, false);
        } else {
          this.selectFilter(x, false, false);
        }
      });

      // opening first selected filter
      if (selectedFiltersList.length) {
        this.selectDynamicFilter(selectedFiltersList[0], true);
      }
    }, error => {
      console.error(`Error : ${error.message}`);
    });

    this.subscriptions.push(schemaDetailsSub);
  }

  /**
   * parses header filter  fields
   * @param selectedIds contains list of selected field Ids from api (used only on initial load)
   * @param limit count limit
   * @param searchStr search string to filter
   * @returns returns filter list for provided selected Ids on initial load
   */
  parseHeaderFields(selectedIds, limit, searchStr = '') {
    const selectedFiltersList = [];
    const headers = this.rawFilterData.headers;
    const headerKeys = Object.keys(headers);
    // used to avoid duplicate values in list
    const existingIds = this.allFilters.map((x) => x.fieldId);
    const searchString = searchStr.trim() || '';
    // used to separate selected fields from remaining fields
    const selectedFiltersIds = this.selectedFilters.map((x) => x.fieldId);

    headerKeys.forEach((headerField) => {
      headers[headerField].fieldDescri = headers[headerField].fieldDescri || headers[headerField].description;
      if (headers[headerField] && !selectedFiltersIds.includes(headers[headerField].fieldId) && ((selectedIds.includes(headers[headerField].fieldId)) || (!existingIds.includes(headers[headerField].fieldId) && (this.allFilters.length <= limit))) && (headers[headerField].fieldDescri.toLowerCase().includes(searchString.toLowerCase()))) {
        const field = {...headers[headerField]};
        field.type = 'header';
        field.show = true;
        this.allFilters.push(field);
        if (selectedIds.includes(field.fieldId)) {
          selectedFiltersList.push(field);
        }
      }
    });

    return selectedFiltersList;
  }

  /**
   * parses grid filter  fields
   * @param selectedIds contains list of selected field Ids from api (used only on initial load)
   * @param limit count limit
   * @param searchStr search string to filter
   * @returns returns filter list for provided selected Ids on initial load
   */
  parseGridFields(selectedIds, limit, searchStr = '') {
    const selectedFiltersList = [];
    const grids = this.rawFilterData.grids;
    const gridFields = this.rawFilterData.gridFields;
    // used to avoid duplicate values in list
    const existingIds = this.allFilters.map((x) => x.fieldId);
    const searchString = searchStr.trim() || '';
    // used to separate selected fields from remaining fields
    const selectedFiltersIds = this.selectedFilters.map((x) => x.fieldId);
    for (const grid in grids) {
      if (grids[grid]) {
        let childKeys = [];
        if (gridFields[grid]) {
          childKeys = Object.keys(gridFields[grid]);
        }
        let isSelectedChild = false;
        childKeys.forEach((x) => {
          const childKey = selectedIds.find((y) => y === x);
          if (childKey) {
            isSelectedChild = true;
          }
        });

        if (isSelectedChild || (!existingIds.includes(grids[grid].fieldId) && (this.allFilters.length <= limit))) {
          const isParentSelected = selectedFiltersIds.includes(grids[grid].fieldId);
          const parentField = {...grids[grid]};
          parentField.type = 'grid';
          parentField.child = [];
          parentField.show = true;
          const val = parentField;
          const gridChilds = gridFields[grid] || {};
          if (Object.keys(gridChilds).length) {
            for (const gridChild in gridChilds) {
              if (gridChilds[gridChild]) {
                // below logic used for checking if this child is selected or not
                let isChildSelected = false;
                if (isParentSelected) {
                  const selectedChildFilterIds = this.selectedFilters.find((x) => x.fieldId === grids[grid].fieldId).child.map((y) => y.fieldId) || [];
                  isChildSelected = selectedChildFilterIds.includes(gridChilds[gridChild].fieldId);
                }

                gridChilds[gridChild].fieldDescri = gridChilds[gridChild].fieldDescri || gridChilds[gridChild].description;
                if (gridChilds[gridChild].fieldDescri.toLowerCase().includes(searchString.toLowerCase())) {
                  const childField = {...gridChilds[gridChild]};
                  childField.type = 'grid';
                  childField.isChild = 1;
                  childField.parentFieldId = val.fieldId;
                  childField.show = isChildSelected ? false : true;
                  val.child.push(childField);
                  if (selectedIds.includes(childField.fieldId)) {
                    selectedFiltersList.push(childField);
                  }
                }
              }
            }
          }
          if (val.child.length) {
            this.allFilters.push(val);
          }
        }
      }
    }

    return selectedFiltersList;
  }

  /**
   * parses hierarchy filter  fields
   * @param selectedIds contains list of selected field Ids from api (used only on initial load)
   * @param limit count limit
   * @param searchStr search string to filter
   * @returns returns filter list for provided selected Ids on initial load
   */
  parseHierarchyFields(selectedIds, limit, searchStr = '') {
    const selectedFiltersList = [];
    const hierarchy = this.rawFilterData.hierarchy;
    const hierarchyFields = this.rawFilterData.hierarchyFields;
    // used to avoid duplicate values in list
    const existingIds = this.allFilters.map((x) => x.fieldId);
    const searchString = searchStr.trim() || '';
    // used to separate selected fields from remaining fields
    const selectedFiltersIds = this.selectedFilters.map((x) => x.fieldId);
    hierarchy.forEach((x: any) => {
      let childKeys = [];
      if (hierarchyFields[x.heirarchyId]) {
        childKeys = Object.keys(hierarchyFields[x.heirarchyId]);
      }
      let isSelectedChild = false;
      childKeys.forEach((key) => {
        const childKey = selectedIds.find((y) => y === key);
        if (childKey) {
          isSelectedChild = true;
        }
      });

      if (isSelectedChild || (!existingIds.includes(x.heirarchyId) && (this.allFilters.length <= limit))) {
        const isParentSelected = selectedFiltersIds.includes(x.heirarchyId);
        const parentField = {...x};
        parentField.type = 'hierarchy';
        parentField.child = [];
        parentField.show = true;
        parentField.fieldId = x.heirarchyId;
        parentField.fieldDescri = x.heirarchyText;
        const val = parentField;
        const childs = hierarchyFields[x.heirarchyId];
        if (Object.keys(childs).length) {
          for (const key in childs) {
            if (childs[key]) {
              // below logic used for checking if this child is selected or not
              let isChildSelected = false;
              if (isParentSelected) {
                const selectedChildFilterIds = this.selectedFilters.find((filter) => filter.fieldId === x.heirarchyId).child.map((y) => y.fieldId) || [];
                isChildSelected = selectedChildFilterIds.includes(childs[key].fieldId);
              }

              childs[key].fieldDescri = childs[key].fieldDescri || childs[key].description;
              if (childs[key].fieldDescri.toLowerCase().includes(searchString.toLowerCase())) {
                const childField = {...childs[key]};
                childField.type = 'hierarchy';
                childField.isChild = 1;
                childField.parentFieldId = val.fieldId;
                childField.show = isChildSelected ? false : true;
                val.child.push(childField);
                if (selectedIds.includes(childField.fieldId)) {
                  selectedFiltersList.push(childField);
                }
              }
            }
          }
        }
        if (val.child.length) {
          this.allFilters.push(val);
        }
      }
    });

    return selectedFiltersList;
  }

  /**
   * filters list based on search text
   * @param targetList target list to be updated
   * @param searchString search string
   */
  searchFilters(targetList, searchString) {
    if (targetList === 'selectedList') {
      if (this.selectedFilters.length) {
        const res = [];
        this.selectedFilters.forEach((field) => {
          if (field.type === 'header' && field.fieldDescri.toLowerCase().includes(searchString.toLowerCase())) {
            res.push(field);
          } else {
            if (field.child && field.child.length) {
              const childs = field.child.filter((x) => x.fieldDescri.toLowerCase().includes(searchString.toLowerCase()));
              if (childs.length) {
                const parent = field;
                parent.child = childs;
                res.push(parent);
              } else if (field.fieldDescri.toLowerCase().includes(searchString.toLowerCase())) {
                res.push(field);
              }
            } else if (field.fieldDescri.toLowerCase().includes(searchString.toLowerCase())) {
              res.push(field);
            }
          }
        });
        this.selectedFiltersDisplayList = res;
      }
    } else {
      this.allFilters = [];
      const limit = this.filterCntLimit;
      this.parseHeaderFields([], limit, searchString);
      this.parseGridFields([], limit, searchString);
      this.parseHierarchyFields([], limit, searchString);

      this.filtersDisplayList = this.allFilters;
    }
  }

  /**
   * triggers search for filter list
   * @param searchString search text
   */
  triggerFilterSearch(searchString: string) {
    this.searchString = searchString;
    this.filterSearchSub.next(searchString);
  }

  filterTrackBy(index: any, itemId: any) {
    return index;
  }

  /**
   * selects filter and appends to selected filters list
   * @param filter filter data
   * @param isChild will be true if child is selected
   * @param openDynamicFilter if true options for editing filter values will be displayed
   */
  selectFilter(filter, isChild = false, openDynamicFilter = true) {
    if (filter.type !== 'header' && !isChild) {
      return;
    }
    const currentField = this.filtersDisplayList.find((x) => x.fieldId === (isChild ? filter.parentFieldId : filter.fieldId));
    if (isChild) {
      const child = currentField.child.find((x) => x.fieldId === filter.fieldId);
      const selectedParent = this.selectedFilters.find((x) => x.fieldId === filter.parentFieldId);
      if (selectedParent) {
        selectedParent.child.push(child);
      } else {
        const parent = JSON.parse(JSON.stringify(currentField));
        parent.child = [child];
        this.selectedFilters.push(parent);
      }
      child.show = false;
      const enabledChildren = currentField.child.filter((x) => x.show === true);
      if (!enabledChildren.length) {
        currentField.show = false;
      }
    } else {
      this.selectedFilters.push(currentField);
      currentField.show = false;
    }
    this.selectedFiltersDisplayList = this.selectedFilters;
    if (this.searchString) {
      this.searchFilters('selectedList', this.searchString);
    }
    if (openDynamicFilter) {
      this.selectDynamicFilter(filter);
    }
    this.addFilterCriteria(filter);
  }

  /**
   * removes child from selected list
   * @param filter filter data
   * @param isChild will be true if child is removed
   */
  removeField(filter, isChild = false) {
    const currentField = this.filtersDisplayList.find((x) => x.fieldId === (isChild ? filter.parentFieldId : filter.fieldId));
    if (isChild) {
      const selectedParent = this.selectedFilters.find((x) => x.fieldId === filter.parentFieldId);
      if (currentField) {
        currentField.show = true;
        let child = currentField.child.find((x) => x.fieldId === filter.fieldId);
        if (child) {
          child.show = true;
        } else {
          child = selectedParent.child.find((x) => x.fieldId === filter.fieldId);
          child.show = true;
          currentField.child.push(child);
        }
      } else {
        selectedParent.child.find((x) => x.fieldId === filter.fieldId).show = true;
        this.filtersDisplayList.unshift(JSON.parse(JSON.stringify(selectedParent)));
      }

      selectedParent.child = selectedParent.child.filter((x) => x.fieldId !== filter.fieldId);
      if (!selectedParent.child.length) {
        this.selectedFilters = this.selectedFilters.filter((x) => x.fieldId !== filter.parentFieldId);
      }
    } else {
      this.selectedFilters = this.selectedFilters.filter((x) => x.fieldId !== filter.fieldId);

      if (currentField) {
        currentField.show = true;
      } else {
        filter.show = true;
        this.filtersDisplayList.unshift(filter);
      }
    }
    this.selectedFiltersDisplayList = this.selectedFilters;
    if (this.searchString) {
      this.searchFilters('selectedList', this.searchString);
    }

    this.selectedFilterCriteria = this.selectedFilterCriteria.filter((x) => x.fieldId !== filter.fieldId);
    this.filterCriteriaSub.next('true');

    if (this.currentFilter && this.currentFilter.fieldId === filter.fieldId) {
      this.clearValues();
    }
  }

  /**
   * opens editable section for selected filter for editing filter values...
   * @param filter filter data
   * @param isUpdate will be true if there are existing value that needs to be set
   */
  selectDynamicFilter(filter, isUpdate = false) {
    if (filter.type !== 'header' && !filter.isChild) {
      return;
    }
    this.clearValues();
    this.currentFilter = filter;
    const picklist = (this.currentFilter?.picklist || this.currentFilter?.pickList) || null;
    const dataType = this.currentFilter.dataType || null;

    if (picklist) {
      const dropdownPickLists = ['1', '30', '37'];
      if (dropdownPickLists.includes(picklist)) {
        this.filterControlType = 'dropdown_multi';
      } else if (this.dynmaicFilterSchema[picklist]) {
        const res = this.dynmaicFilterSchema[picklist].find((x) => x.dataType === dataType.toUpperCase());
        if (res) {
          this.filterControlType = res.type;
          if (this.filterControlType === 'input_text') {
            this.filterData.inputTextVal = [];
          }
        }
      }

      if (!this.filterControlType) {
        this.filterControlType = 'input_text';
        this.filterData.inputTextVal = [];
      }
      this.getFilterValues(filter.fieldId, isUpdate);
    }
  }

  /**
   * adds selected filter to filter criteria list
   * @param filter filter data
   */
  addFilterCriteria(filter) {
    const existingFilter = this.selectedFilterCriteria.filter((x) => x.fieldId === filter.fieldId);
    if (existingFilter.length) {
      return;
    }
    const CrntFilter = JSON.parse(JSON.stringify(filter));
    delete CrntFilter.show;
    if (CrntFilter.type === 'grid' || CrntFilter.type === 'hierarchy') {
      delete CrntFilter.child;
    }
    delete CrntFilter.type;
    if (CrntFilter.isChild) {
      delete CrntFilter.isChild;
      delete CrntFilter.parentFieldId;
    }

    const fieldType = (this.filterControlType === 'dropdown_single' || this.filterControlType === 'dropdown_multi') ? 'DROPDOWN' : 'INLINE';
    const fieldOperator = (this.filterControlType === 'picker_date' || this.filterControlType === 'picker_time') ? 'RANGE' : 'EQUAL';
    const filterCtrl = {
      fieldId: filter.fieldId,
      fldCtrl: CrntFilter,
      values: [],
      selectedValues: [],
      startValue: null,
      endValue: null,
      type: fieldType,
      operator: fieldOperator,
      dateCriteria: null
    };

    this.selectedFilterCriteria.push(filterCtrl);
    this.filterCriteriaSub.next('true');
  }

  /**
   * gets dropdown values for multi choice filter types
   * @param filterId holds filter id
   */
  getFilterValues(filterId, isUpdate, searchString?: string) {
    this.schemaService.getFieldDropValues(this.moduleId, filterId, (searchString || '')).subscribe((data) => {
      data = data ? data : [];
      searchString ? this.dropdownFilteredValues = [] : this.dropdownValues = [];
      const selectedCodes = this.dropdownSelectedChips.map(x => x.CODE) || [];
      data.forEach((x) => {
        const res: any = {...x};
        res.value = x.TEXT,
        res.key = x.CODE
        res.checked = false;

        if (!selectedCodes.includes(x.CODE)) {
          searchString ? this.dropdownFilteredValues.push(res) : this.dropdownValues.push(res);
        }
      });

      if (searchString) {
        this.dropdownValues = [...this.dropdownSelectedChips, ...this.dropdownFilteredValues];
      } else {
        this.dropdownValues = [...this.dropdownSelectedChips, ...this.dropdownValues];
        this.dropdownFilteredValues = this.dropdownValues;
      }

      if (isUpdate) {
        this.setFilterExistingValues();
      }
    });
  }

  /**
   * sets existing values to appropriate variables
   */
  setFilterExistingValues() {
    if (this.currentFilter) {
      const currentFilterCriteria = this.selectedFilterCriteria.find((x) => x.fieldId === this.currentFilter.fieldId);

      if (currentFilterCriteria && currentFilterCriteria?.values?.length) {
        if (this.filterControlType === 'input_text' || this.filterControlType === 'input_desc') {
          this.filterData.inputTextVal = currentFilterCriteria.values;
        } else if (this.filterControlType === 'input_numeric') {
          this.filterData.inputNumericVal = Number(currentFilterCriteria.values[0]);
        } else if (this.filterControlType === 'textarea') {
          this.filterData.textareaVal = currentFilterCriteria.values[0];
        } else if (this.filterControlType === 'radio') {
          this.filterData.selectedValue = currentFilterCriteria.values[0];
        } else if (this.filterControlType === 'checkbox') {
          this.dropdownValues.forEach((x, i) => {
            if (currentFilterCriteria.values.includes(x.CODE)) {
              this.dropdownValues[i].checked = true;
            }
          });
        } else if (this.filterControlType === 'dropdown_single') {
          const field = this.dropdownValues.find((x) => x.key === currentFilterCriteria.values[0]);
          this.dropdownSearchCtrl.setValue(field ? field.value : currentFilterCriteria.values[0]);
        } else if (this.filterControlType === 'dropdown_multi') {
          const dropdownCodes = this.dropdownValues.map(x => x.CODE);
          const list = currentFilterCriteria.selectedValues || [];
          list.forEach(y => {
            if (!dropdownCodes.includes(y.CODE)) {
              const newVal = {...y};
              newVal.value = y.TEXT,
              newVal.key = y.CODE
              newVal.checked = true;
              this.dropdownValues.push(newVal);
            }
          });
          this.dropdownValues.forEach((x, i) => {
            if (currentFilterCriteria.values.includes(x.CODE)) {
              this.dropdownValues[i].checked = true;
            }
          });
          this.dropdownSelectedChips = this.dropdownValues.filter((x) => x.checked === true);
        }
      } else {
        if (this.filterControlType === 'picker_date') {
          if (currentFilterCriteria.dateCriteria === 'date_range') {
            this.filterData.dateCriteria = 'date_range';
            this.currentPickerType = 'Date Range';
            this.dateRangeValue = {
              start: currentFilterCriteria.startValue ? new Date(Number(currentFilterCriteria.startValue)) : null,
              end: currentFilterCriteria.endValue ? new Date(Number(currentFilterCriteria.endValue)) : null
            }
          } else if (currentFilterCriteria.dateCriteria === 'specific_date') {
            this.filterData.dateCriteria = 'specific_date';
            this.currentPickerType = 'Specific Date';
            this.dateValue = currentFilterCriteria.startValue ? new Date(Number(currentFilterCriteria.startValue)) : null;
          } else if (currentFilterCriteria.dateCriteria) {
            const val = currentFilterCriteria.dateCriteria;
            this.datePickerList.forEach((x) => {
              if (val === 'yesterday') {
                this.currentPickerType = 'Day';
              } else if (val.toLowerCase().includes(x.toLowerCase())) {
                this.currentPickerType = x;
              }
            });
            const value = this.datePickerOptionsList.find(x => x.value === val);
            this.filterData.dateCriteria = value.value;
          }
        } else if (this.filterControlType === 'picker_time') {
          const startDate = currentFilterCriteria.startValue ? new Date(Number(currentFilterCriteria.startValue)) : null;
          const endDate = currentFilterCriteria.endValue ? new Date(Number(currentFilterCriteria.endValue)) : null;
          if (startDate) {
            this.selectedTimeRange.start = {
              hours: startDate.getHours(),
              minutes: startDate.getMinutes()
            };
          }
          if (endDate) {
            this.selectedTimeRange.end = {
              hours: endDate.getHours(),
              minutes: endDate.getMinutes()
            };
          }
        }
      }
    }
  }

  /**
   * updated filter values to filter criteria in appropriate format
   */
  updateFilterValue(ev) {
    if (this.currentFilter && (ev !== undefined || ev !== null)) {
      const currentFilterCriteria = this.selectedFilterCriteria.find((x) => x.fieldId === this.currentFilter.fieldId);
      if (this.filterControlType === 'input_text' || this.filterControlType === 'input_desc') {
        currentFilterCriteria.values = [...this.filterData.inputTextVal];
      } else if (this.filterControlType === 'input_numeric') {
        currentFilterCriteria.values = [`${this.filterData.inputNumericVal}`];
      } else if (this.filterControlType === 'textarea') {
        currentFilterCriteria.values = [`${this.filterData.textareaVal}`];
      } else if (this.filterControlType === 'radio') {
        this.filterData.selectedValue = ev;
        const value = this.dropdownValues.find((x) => x.value === ev);
        currentFilterCriteria.values = [`${value.key}`];
      } else if (this.filterControlType === 'picker_date') {
        const value = this.datePickerOptionsList.find(x => x.value === ev);
        this.filterData.dateCriteria = value.value;
        currentFilterCriteria.dateCriteria = value.value;
      }

      this.filterCriteriaSub.next('true');
    }
  }

  /**
   * updates check box value based on user click
   * @param code field code
   * @param ind index
   */
  checkboxChanged(ev, code, ind) {
    this.dropdownValues[ind].checked = (ev === true) ? true : false;
    if (this.currentFilter) {
      const currentFilterCriteria = this.selectedFilterCriteria.find((x) => x.fieldId === this.currentFilter.fieldId);
      if (ev === true && !currentFilterCriteria.values.includes(code)) {
        currentFilterCriteria.values.push(code);
      } else if (ev === false && currentFilterCriteria.values.includes(code)) {
        currentFilterCriteria.values = currentFilterCriteria.values.filter((x) => x !== code);
      }

      this.filterCriteriaSub.next('true');
    }
  }

  /**
   * updates time range
   */
  timeRangeChanged(ev) {
    if (this.currentFilter) {
      const currentFilterCriteria = this.selectedFilterCriteria.find((x) => x.fieldId === this.currentFilter.fieldId);
      const start = ev.start;
      const end = ev.end;

      if (start.hours === 0 && start.minutes === 0 && end.hours === 0 && end.minutes === 0) {
        return;
      } else {
        const startDate = new Date();
        startDate.setHours(start.hours);
        startDate.setMinutes(start.minutes);

        const endDate = new Date();
        endDate.setHours(end.hours);
        endDate.setMinutes(end.minutes);

        currentFilterCriteria.startValue = String(startDate.getTime());
        const endOfDay = moment().endOf('day').toDate().getTime();
        currentFilterCriteria.endValue = (end.hours === 0 && end.minutes === 0) ? String(endOfDay) : String(endDate.getTime());

        this.filterCriteriaSub.next('true');
      }
    }
  }

  dateChanged(ev) {
    if (this.currentFilter) {
      const currentFilterCriteria = this.selectedFilterCriteria.find((x) => x.fieldId === this.currentFilter.fieldId);
      if (ev) {
        const date = new Date(ev);
        const startOfDay = moment(date).startOf('day').toDate().getTime();
        currentFilterCriteria.startValue = (date.getHours() === 0) ? String(startOfDay) : String(date.getTime());
        const endOfDay = moment(date).endOf('day').toDate().getTime();
        currentFilterCriteria.endValue = (date.getHours() === 0) ? String(endOfDay) : String(date.getTime());
      }

      this.filterCriteriaSub.next('true');
    }
  }

  /**
   * updated date range
   */
  dateRangeChanged(ev) {
    if (this.currentFilter) {
      const currentFilterCriteria = this.selectedFilterCriteria.find((x) => x.fieldId === this.currentFilter.fieldId);
      if (ev && ev.start) {
        const date = new Date(ev.start);
        const startOfDay = moment(date).startOf('day').toDate().getTime();
        currentFilterCriteria.startValue = (date.getHours() === 0) ? String(startOfDay) : String(date.getTime());
      }
      if (ev && ev.end) {
        const date = new Date(ev.end);
        const endOfDay = moment(date).endOf('day').toDate().getTime();
        currentFilterCriteria.endValue = (date.getHours() === 0) ? String(endOfDay) : String(date.getTime());
      }

      this.filterCriteriaSub.next('true');
    }
  }

  /**
   * updates value in case of single select dropdown
   */
  selectSingle(ev) {
    const value = ev.option.value;
    const code = this.dropdownValues.find((x) => x.value === value)?.key || null;
    if (this.currentFilter && code) {
      const currentFilterCriteria = this.selectedFilterCriteria.find((x) => x.fieldId === this.currentFilter.fieldId);
      currentFilterCriteria.values = [`${code}`];

      this.filterCriteriaSub.next('true');
    }
  }

  /**
   * updates values in case of multi select dropdown
   * @param type specifies to add or remove
   */
  selectMulti(ev, type, inputEl) {
    if (inputEl) {
      inputEl.blur();
    }
    const value = (type === 'add') ?  ev.option.value : ev;
    const field = this.dropdownValues.find((x) => x.TEXT === value);
    const code = field.CODE || null;
    if (this.currentFilter && code) {
      const currentFilterCriteria = this.selectedFilterCriteria.find((x) => x.fieldId === this.currentFilter.fieldId);
      if (type === 'add') {
        field.checked = true;
        if (!currentFilterCriteria.values.includes(code)) {
          currentFilterCriteria.values.push(code);
          currentFilterCriteria.selectedValues.push(field);
        }
      } else if (type === 'remove') {
        field.checked = false;
        if (currentFilterCriteria.values.includes(code)) {
         currentFilterCriteria.values = currentFilterCriteria.values.filter((x) => x !== code);
         currentFilterCriteria.selectedValues = currentFilterCriteria.selectedValues.filter(x => x.CODE !== code);
        }
      }
    }

    this.dropdownSelectedChips = this.dropdownValues.filter((x) => x.checked === true);
    this.dropdownSearchCtrl.setValue('');
    this.filterCriteriaSub.next('true');
  }

  /**
   * clears all values for new filter to be selected...
   */
  clearValues() {
    this.filterControlType = '';
    this.filterData = {
      inputTextVal: undefined,
      inputNumericVal: undefined,
      textareaVal: undefined,
      selectedValue: undefined,
      dateCriteria: undefined
    };
    this.dropdownValues = [];
    this.dropdownFilteredValues = [];
    this.dropdownSearchCtrl.setValue('');
    this.dropdownSelectedChips = [];
    this.dateRangeValue = { start: null, end: null };
    this.dateValue = null;
    this.selectedTimeRange = {
      start: {
        hours: 0,
        minutes: 0
      },
      end: {
        hours: 0,
        minutes: 0
      }
    };
    this.currentPickerType = 'Day';
  }

  /**
   * updates date picker type
   * @param type datepicker type
   */
  updateDatePickerType(type) {
    this.currentPickerType = type;
    if (this.currentFilter) {
      const currentFilterCriteria = this.selectedFilterCriteria.find((x) => x.fieldId === this.currentFilter.fieldId);
      switch(type) {
        case 'Date Range':
          this.filterData.dateCriteria = 'date_range';
          currentFilterCriteria.dateCriteria = 'date_range';
          this.dateValue = null;
          break;
        case 'Specific Date':
          if (this.filterData.dateCriteria !== 'specific_date') {
            this.dateValue = new Date();
            this.dateChanged(this.dateValue);
          }
          this.filterData.dateCriteria = 'specific_date';
          currentFilterCriteria.dateCriteria = 'specific_date';
          this.dateRangeValue = { start: null, end: null };
          break;
        default:
          this.filterData.dateCriteria = undefined;
          currentFilterCriteria.dateCriteria = null;
          this.dateValue = null;
          this.dateRangeValue = this.dateRangeValue = { start: null, end: null };
      }
    }
  }

  /**
   * updates filter list on scroll...
   */
  updateFiltersList(ev) {
    if (ev && (ev.scrollTop >= ((ev.scrollHeight - ev.offsetHeight)) * 0.9)) {
      this.delayedCallForFilter(this.searchString);
    }
  }
}
