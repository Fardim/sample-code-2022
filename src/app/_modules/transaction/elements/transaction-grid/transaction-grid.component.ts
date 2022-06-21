import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, ElementRef, Inject, Injector, Input, LOCALE_ID, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { CoreService } from '@services/core/core.service';
import { TransactionGridDataSource } from './transaction-grid-data-source';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, skipWhile, takeUntil } from 'rxjs/operators';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { Router } from '@angular/router';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import { Utilities } from '@models/schema/utilities';
import { TransactionControlComponent } from '../transaction-control/transaction-control.component';
import { GridResponse, Process } from '@modules/transaction/model/transaction';
import * as XLSX from 'xlsx';
import { ValidationError } from '@models/schema/schema';
import { DataControlService } from '@modules/transaction/_service/data-control.service';
import * as moment from 'moment';
import { PermissionsList, SchemaTableData } from '@models/schema/schemadetailstable';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'pros-transaction-grid',
  templateUrl: './transaction-grid.component.html',
  styleUrls: ['./transaction-grid.component.scss']
})
export class TransactionGridComponent extends TransactionControlComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {

  @Input()
  isSubGrid = false;

  @Input()
  parentRowId: string = null;

  @Input() flowId: string;
  @Input() stepId: string;

  masterRecord: any = {};

  fieldDetails: Array<GridResponse>;

  pageSize = 5;
  pageIndex = 1;
  subgridPageIndex = 1;
  searchTerm = '';

  @Input() subGridSearchTerm = '';
  totalCount = 0;

  staticColumns: string[] = ['_select', '_settings'];

  displayedColumns: BehaviorSubject<string[]> = new BehaviorSubject(this.staticColumns);
  childFields: ({fieldId: string, fieldDescri: string} | any)[] = [];
  subGridFields: {fieldId: string, fieldCtrl: Object, fieldDescri: string, permission?: Object}[] | Array<any> = [];
  activeSubGridTabIndex: number;

  selection = new SelectionModel<any>(true, []);
  activeRowId: string;

  dataSource: TransactionGridDataSource;

  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();
  /**
   * File attach input type ...
   */
  @ViewChild('file_attach') fileAttach: ElementRef<HTMLInputElement>;
  /**
   * Hold upload error message and status
   */
   uploadError: ValidationError = {
    status: false,
    message: ''
  };

  setActiveSubGridData: any = {};
  gridPermission = {
    permission: {},
    permissionList: []
  }
  subGridPermission = {
    permission: {},
    childPermissions: []
  }
  permissionsList = PermissionsList;

  @Input() expansionview = false;

  @Input() isExpansionViewOpen = false;

  rowData: any = {};

  searchSub = new Subject<{searchText: string, isSubgrid: boolean}>();

  currentSortValue: {active: string, direction: string};

  // clear search bar value on tab change
  searchControl: FormControl = new FormControl('');

  constructor(private coreService: CoreService,
    private router: Router,
    private sharedService: SharedServiceService,
    private coreCrudService:TransactionService,
    private utilityService: Utilities,
    public transService: TransactionService,
    public dataControlService: DataControlService,
    @Inject(LOCALE_ID) public locale: string) {
      super(transService, dataControlService);
     }

  ngOnChanges(changes: SimpleChanges): void {
    let changed = false;
    if(changes && changes.moduleId && changes.moduleId.currentValue !== changes.moduleId.previousValue) {
      changed = true;
    }
    if(changes && changes.fieldObj && changes.fieldObj.currentValue !== changes.fieldObj.previousValue) {
      changed = true;
    }
    if(changes && changes.isSubGrid && changes.isSubGrid.currentValue !== changes.isSubGrid.previousValue) {
      changed = true;
    }
    if(changed) {
      this.getFieldDetails();
      this.dataSource = new TransactionGridDataSource(this.moduleId, this.fieldObj.fieldId, this.isSubGrid, this.coreCrudService, this.utilityService, this.router, this.dataControlService);
      this.dataSource.getData(this.pageIndex, this.pageSize, this.searchTerm);
    }
    if(!changed && changes && changes.parentRowId && changes.parentRowId.currentValue !== changes.parentRowId.previousValue) {
      this.dataSource = new TransactionGridDataSource(this.moduleId, this.fieldObj.fieldId, this.isSubGrid, this.coreCrudService, this.utilityService, this.router, this.dataControlService);
      this.parentRowId = changes.parentRowId.currentValue;
      this.dataSource.getData(this.pageIndex, this.pageSize, this.subGridSearchTerm, this.parentRowId);
    }
    if(changes?.subGridSearchTerm) {
      this.subgridPageIndex = 1;
      this.dataSource = new TransactionGridDataSource(this.moduleId, this.fieldObj.fieldId, this.isSubGrid, this.coreCrudService, this.utilityService, this.router, this.dataControlService);
      this.subGridSearchTerm = changes.subGridSearchTerm.currentValue;
      this.dataSource.getData(this.subgridPageIndex, this.pageSize, this.subGridSearchTerm, this.parentRowId);
    }
  }

  ngAfterViewInit(): void {
    // hooks for the file change trace
    this.fileAttach?.nativeElement.addEventListener('change', (ele)=>{
      this.fileChange(ele);
    });
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    this.sharedService.getAfterGridFormRowSave().pipe(takeUntil(this.unsubscribeAll$))
      .subscribe(gridId => this.buildGridFieldGvs(this.fieldObj, gridId));

    this.transService.updateTableValidators.pipe(takeUntil(this.unsubscribeAll$)).subscribe((item: any) => {
      if(item.parentFieldId === this.fieldObj.fieldId) {
        this.updateTableRuleValidations(item);
      }
    })

    this.sharedService.getAfterExpansionViewClose().pipe(
      skipWhile(resp => !resp || !resp[this.fieldObj.fieldId]),
      takeUntil(this.unsubscribeAll$)
    ).subscribe(response => {
      this.dataSource.getData(this.pageIndex, this.pageSize, this.searchTerm, this.parentRowId);
    });

    this.searchSub.pipe(debounceTime(1000)).subscribe((event: any) => {
      this.pageIndex = 1;
      if (!event?.isSubgrid) {
        this.searchTerm = event.searchText;
        if (this.currentSortValue && this.currentSortValue.direction) {
          this.sortChange(this.currentSortValue, true);
        } else {
          this.dataSource.getData(this.pageIndex, this.pageSize, this.searchTerm);
        }
        return;
      }
      this.subgridPageIndex = 1;
      if (this.currentSortValue && this.currentSortValue.direction) {
        this.sortChange(this.currentSortValue, true, event.searchText);
        return;
      }
      this.subGridSearchTerm = event.searchText;
    });
  }

  sortChange($event, isPageChanged?, searchTerm?) {
    this.currentSortValue = $event;
    if (!$event?.direction) {
      if(this.isSubGrid) {
        this.dataSource.getData(isPageChanged ? this.subgridPageIndex : this.pageIndex, this.pageSize, this.subGridSearchTerm, this.parentRowId);
      } else {
        this.dataSource.getData(this.pageIndex, this.pageSize, this.searchTerm, this.parentRowId);
      }
    } else {
      const gridSearchTerm = searchTerm ? searchTerm : (this.isSubGrid ? this.subGridSearchTerm : this.searchTerm);
      this.dataSource.sortRows($event, this.pageIndex, this.pageSize, gridSearchTerm, this.parentRowId);
    }
  }

  buildGridFieldGvs(fieldObj, gridId: string) {
    if (gridId === fieldObj?.fieldId) {
      this.dataSource = new TransactionGridDataSource(this.moduleId, this.fieldObj.fieldId, this.isSubGrid, this.coreCrudService, this.utilityService, this.router, this.dataControlService);
      this.dataSource.getData(this.pageIndex, this.pageSize, this.searchTerm, this.parentRowId);
      const gridData = this.coreCrudService.getMasterData(this.activeForm.isPrimary, this.moduleId);
      fieldObj['gvs'] = gridData.mdoRecordES?.gvs[gridId];
    } else if (fieldObj.fieldCtrl?.grid?.length > 0) {
      fieldObj.fieldCtrl.grid.forEach(childField => {
        if (childField.pickList === '15') {
          this.buildGridFieldGvs(childField, gridId);
        }
      });
    }
  }

  formattedCellClick(rowIndex: number, element: SchemaTableData) {
    element.isEdited = !element.isEdited;
    const masterRec = this.coreCrudService.getMasterData(this.activeForm?.isPrimary, this.moduleId);
    this.rowData[rowIndex] = JSON.parse(JSON.stringify(masterRec.mdoRecordES?.gvs[this.fieldObj?.fieldId]?.rows[rowIndex]));
  }

  updateTableRuleValidations(ruleObj: any) {

    this.childFields.map((item: any) => {
      if(item.fieldId === ruleObj.fieldId) {
        switch(ruleObj.propertyKey) {
          case 'MANDATORY':
            item.isRuleMandatory = ruleObj.isRuleSatisfy;
            break;
          case 'READ_ONLY':
            item.isRuleReadOnly = ruleObj.isRuleSatisfy;
            break;
          case 'HIDDEN':
            item.isRuleHidden = ruleObj.isRuleSatisfy;
            this.updateTableColumns();
            break;
        }
      }
      return item;
    });

  }


  getFieldDetails() {
    if (this.fieldObj?.fieldCtrl?.grid?.length) {
      this.fieldDetails = this.fieldObj?.fieldCtrl?.grid;
      this.buildTableColumns();
      this.gridPermission.permission = {...this.fieldObj?.fieldCtrl?.permissions};
      this.getPermission(this.fieldObj?.fieldCtrl?.permissions,this.isSubGrid ? 'subGrid' : 'grid');
    }
  }

  getPermission(permission,type) {
    if (permission) {
      Object.keys(permission).forEach(key => {
        if (permission[key] && typeof permission[key] === 'boolean' && key !== 'defaultRowCnt') {
          if (type === 'subGrid' && this.parentRowId) {
            const index = this.subGridPermission.childPermissions.findIndex(permission => permission === key);
            if (index === -1) this.subGridPermission.childPermissions.push(key);
          } else {
            const index = this.gridPermission.permissionList.findIndex(permission => permission === key);
            if (index === -1) this.gridPermission.permissionList.push(key);
          }
        }
        if (key === 'defaultRowCnt' && permission['defaultRowCnt'] && typeof permission['defaultRowCnt'] !== 'boolean') {
          // this.addRowBasedOnDefaultRowCount(type,permission);
        }
      })
    }
  }

  addRowBasedOnDefaultRowCount(type,permission) {
    const defaultCount = permission['defaultRowCnt'];
    if (type !== 'subGrid') {
      this.addDefaultRows(defaultCount,{
        ...this.getGridMetadata(-1),
        masterRecord: this.coreCrudService.getMasterData(this.activeForm.isPrimary, this.moduleId)
      });
    } else if (type === 'subGrid' && this.parentRowId) {
      this.addDefaultRows(defaultCount,{
        ...this.getSubGridMetadata(this.setActiveSubGridData),
        masterRecord: this.coreCrudService.getMasterData(this.activeForm.isPrimary, this.moduleId)
      },'subgrid');
    }
  }

  addDefaultRows(defaultCount,metadata,type?) {
    let i = 1;
    while (i <= defaultCount) {
      let newRowData = (type === 'subgrid') ? this.coreCrudService.createNewRow(true, this.parentRowId,metadata?.childMetadata) : this.coreCrudService.createNewRow(this.isSubGrid, this.parentRowId,metadata?.childMetadata);
      const childMetadata = [...newRowData.childMetadata];
      const rowdata = {...newRowData.row};
      this.masterRecord = this.coreCrudService.getMasterData(this.activeForm.isPrimary, this.moduleId);
      this.masterRecord.mdoRecordES.gvs[metadata.gridId].rows.splice(0, 0, rowdata);
      this.sharedService.setAfterGridFormRowSave(metadata.gridId);
      i++;
    }
  }

  get showRowMenu() {
    return ['editRow', 'copyRow', 'removeRow'];
  }

  checkForVisibility(permissionType, gridType?) {
    if (permissionType === 'removeMultipleRow') {
      return this.gridPermission.permission[permissionType] && this.selection.hasValue();
    }

    // if (permissionType === 'defaultRowCnt') {
    //   return this.gridPermission?.permission['defaultRowCnt'] && typeof this.gridPermission.permission['defaultRowCnt'] !== 'boolean';
    // }

    if (gridType === 'subGrid' || this.isSubGrid) {
      return this.process !== 'view' && this.process !== 'copy' && this.subGridPermission.childPermissions.includes(permissionType) && !this.subGridPermission.childPermissions.includes('nonEditable');
    }
    return this.process !== 'view' && this.process !== 'copy' && this.gridPermission.permissionList.includes(permissionType);
  }

  openPermissionMenu(index, permission, rowData?) {
    switch(permission) {
      case 'editRow': {
        this.openFormViewSC(index)
        break;
      }
      case 'copyRow': {
        this.duplicateRow(index, rowData);
        break;
      }
      case 'removeRow': {
        this.deleteRow(index, rowData);
        break;
      }
      case 'import': {
        this.uploadAFile();
        break;
      }
      case 'export': {
        this.exportData();
        break;
      }
      default: {
        break;
      }
    }
  }

  openSubGridPermissionMenu(permission) {
    switch(permission) {
      case 'export': {
        this.exportSubGridData();
        break;
      }
      case 'import': {
        this.uploadAFile();
        break;
      }
      default: {
        break;
      }
    }
  }

  getPermissionLabel(permissionType) {
    return this.permissionsList.find(permission => permission.type === permissionType).label;
  }

  updateTableColumns() {
    const dynamicColumns = [];
    this.childFields.forEach((child: any) => {
      if(!child.isRuleHidden) {
        dynamicColumns.push(child.fieldId);
      }
    });
    if(this.expansionview) {
      dynamicColumns.push('action');
    }
    this.displayedColumns.next(this.staticColumns.concat(dynamicColumns));
  }

  buildTableColumns() {
    const dynamicColumns = [];
    const ruleValidations = {
      isRuleHidden: false,
      isRuleMandatory: false,
      isRuleReadOnly: false,
    }
    this.childFields = [];
    this.subGridFields = [];
    this.setActiveSubGridData = {};
    this.fieldDetails.forEach(child => {
      if(child.pickList !== '15') {
        dynamicColumns.push(child.fieldId);
      }
      this.childFields.push({
        ...child,
        ...ruleValidations,
        fieldDescri: child.description ? child.description : 'Unknown'
      });
      if (child.pickList === '15') {
        if (!child?.permissions?.invisible) {
          const subgridData = {
            fieldId: child.fieldId,
            fieldCtrl: {
              grid: child.grid,
              permissions: child.permissions ? child.permissions : {}
            },
            ...ruleValidations,
            fieldDescri: child.description ? child.description : 'Unknown'
          };

          this.subGridFields.push(subgridData);
          this.setActiveSubGridData = this.subGridFields[0] ? this.subGridFields[0] : {};
        }
      }
    });
    if(this.expansionview) {
      dynamicColumns.push('action');
    }
    this.displayedColumns.next(this.staticColumns.concat(dynamicColumns));
  }

  deleteRow(index, rowData) {
    let rowIndex = (this.currentSortValue.direction && this.getRowIndex(rowData)) ? this.getRowIndex(rowData) : index;
    this.dataSource?.deleteRow(this.pageIndex, this.pageSize, +rowIndex);
    this.dataSource.getData(this.pageIndex, this.pageSize, this.searchTerm, this.parentRowId);
    if (this.dataSource.totalCount === 0) {
      this.activeRowId = '';
    }
  }

  getRowIndex(rowData) {
    let index = '';
    const masterRec = this.coreCrudService.getMasterData(this.activeForm.isPrimary, this.moduleId);
    if (Object.keys(masterRec?.mdoRecordES?.gvs).length && masterRec?.mdoRecordES?.gvs[this.fieldObj?.fieldId]?.rows) {
      index = masterRec?.mdoRecordES?.gvs[this.fieldObj?.fieldId]?.rows.findIndex(row => row?.UUID?.vc[0]?.c === rowData.UUID.fieldData[0].c);
    }
    return index;
  }

  deleteMultipleRows() {
    this.selection.selected.forEach(row => {
      this.dataSource?.deleteRow(this.pageIndex, this.pageSize, row.i);
    })
    this.dataSource.getData(this.pageIndex, this.pageSize, this.searchTerm, this.parentRowId);
    this.selection = new SelectionModel<Element>(true, []);
  }

  duplicateRow(index, rowData) {
    let rowIndex = index;
    if (this.currentSortValue.direction && this.getRowIndex(rowData)) {
      rowIndex = this.getRowIndex(rowData);
    }
    this.dataSource?.duplicateRow(this.pageIndex, this.pageSize, rowIndex);
    if (this.currentSortValue.direction && this.getRowIndex(rowData)) {
      this.sortChange(this.currentSortValue, true, this.isSubGrid ? this.subGridSearchTerm : this.searchTerm);
    } else {
      this.dataSource?.getData(this.pageIndex, this.pageSize, this.searchTerm, this.parentRowId);
    }
  }

  getColumnDesc(fieldId: string) {
    const field = this.childFields.find(f => f.fieldId === fieldId);
    return field ? field.fieldDescri || 'Unknown' : 'Unknown';
  }

  getFieldDesc() {
    if(this.fieldObj && this.fieldObj.fieldCtrl) {
      return this.fieldObj.fieldCtrl.description ? this.fieldObj.fieldCtrl.description : 'Unknown';
    }
    return 'Unknown';
  }

  openMultiFieldFormView(subGrid) {
    const metaData = this.getSubGridMetadata(subGrid);
    this.openGridViewSideSheet(metaData);
  }

  getSubGridMetadata(subGrid) {
    const filteredGrid = subGrid?.fieldCtrl?.grid?.filter((data) => data.pickList !== '15');
    return {
      childMetadata: filteredGrid,
      gridId: subGrid?.fieldId,
      rowIndex: -1,
      isSubGrid: true,
      parentRowId: this.parentRowId,
      moduleId: this.moduleId,
      process: this.process,
    }
  }

  openFormViewSC(index = -1, row?: any) {
    let rowIndex = index;
    if (index !== -1 && this.currentSortValue.direction && this.getRowIndex(row)) {
      rowIndex = +this.getRowIndex(row)
    }
    const metadata = this.getGridMetadata(rowIndex);
    // this.openGridViewSideSheet(metadata);
    if(rowIndex === -1 || !this.expansionview) {
      this.openGridViewSideSheet(metadata);
    }
    if(this.expansionview && row) {
      row.inlineEdit = true;
      const masterRec = this.coreCrudService.getMasterData(this.activeForm.isPrimary, this.moduleId);
      this.rowData[rowIndex] = JSON.parse(JSON.stringify(masterRec.mdoRecordES.gvs[this.fieldObj?.fieldId]?.rows[rowIndex]));
    }
    this.sortChange(this.currentSortValue, true, this.isSubGrid ? this.subGridSearchTerm : this.searchTerm);
  }

  getGridMetadata(rowIndex) {
    return {
      childMetadata: this.getNonHiddenFields(),
      gridId: this.fieldObj?.fieldId,
      rowIndex,
      isSubGrid: this.isSubGrid,
      parentRowId: this.parentRowId,
      moduleId: this.moduleId,
      process: this.process
    };
  }

  subGridTabChange(event) {
    this.setActiveSubGridData = this.subGridFields[event] ? this.subGridFields[event] : [];
    this.subGridPermission.permission = {...this.setActiveSubGridData?.fieldCtrl?.permissions || {}};
    this.getPermission(this.setActiveSubGridData?.fieldCtrl?.permissions,'subGrid');
  }

  gridTabViewChange(event, isExpansionView) {
    this.searchControl.setValue('');
    this.pageIndex = 1;
    this.subgridPageIndex = 1;
    // event 0 index denotes parent grid, we need only child grid here on expansion view sidesheet
    const tabIndex = isExpansionView ? event - 1 : event;
    if (event > 0 || !isExpansionView) {
      this.subGridTabChange(tabIndex);

      /**
       * restore grid data to existed value
       */
      this.dataSource = new TransactionGridDataSource(this.moduleId, this.fieldObj.fieldId, this.isSubGrid, this.coreCrudService, this.utilityService, this.router, this.dataControlService);
      this.subGridSearchTerm = '';
      this.dataSource.getData(this.pageIndex, this.pageSize, this.subGridSearchTerm, this.parentRowId);
    } else if (isExpansionView){
      this.dataSource = new TransactionGridDataSource(this.moduleId, this.fieldObj.fieldId, this.isSubGrid, this.coreCrudService, this.utilityService, this.router, this.dataControlService);
      this.searchTerm = '';
      this.dataSource.getData(this.pageIndex, this.pageSize, this.searchTerm);
    }
  }

  openGridViewSideSheet(metaData) {
    metaData.permissions = this.fieldObj.fieldCtrl.permissions;
    this.sharedService.setGridFormViewDetails(metaData);
    this.router.navigate([{ outlets: {sb: this.getSbOutletLink(), sb3: 'sb3/transaction/grid/form-view'}}], {queryParamsHandling: 'preserve', preserveFragment: true});
    // this.router.navigate([{ outlets: {...this.getOutlets()}}], {queryParamsHandling: 'preserve', preserveFragment: true});
  }

  openExpansionView() {
    this.router.navigate([{ outlets: {sb: this.getSbOutletLink(), outer: `outer/transaction/${this.moduleId}/expansion-view/${this.flowId}/${this.layoutId}/${this.recordId ? this.recordId : 'new'}/${this.tabDetails.tabid}/${this.fieldObj.fieldId}/${this.stepId}`}}], {queryParamsHandling: 'preserve', preserveFragment: true});
  }

  getNonHiddenFields() {
    return this.childFields.filter((item: any) => {
      return !item.isRuleHidden && item.pickList !== '15';
    })
  }
  getSbOutletLink() {
    return [...(this.router as any).currentUrlTree.root.children.sb.segments.map(m=> m.path)];
    // if(this.process === Process.create)
    //   return `sb/transaction/${this.moduleId}/create/${this.layoutId}/new`;
    // else if(this.process === Process.change)
    //   return `sb/transaction/${this.moduleId}/change/${this.layoutId}/${this.recordId}`;
    // else if(this.process === Process.view)
    //   return `sb/transaction/${this.moduleId}/view/${this.layoutId}/${this.recordId}`
  }
  getOutlets() {
    const outlets: any = {
      sb: [...(this.router as any).currentUrlTree.root.children.sb.segments.map(m=> m.path)]
    };
    const outerOutlet = (this.router as any).currentUrlTree.root.children.outer ? [...(this.router as any).currentUrlTree.root.children.outer.segments.map(m=> m.path)] : [];
    if (outerOutlet.length > 0 && outerOutlet.includes('applicable-sidesheet')) {
      outlets.outer = outerOutlet;
      outlets.sb3 = 'sb3/transaction/grid/form-view';
    } else {
      outlets.outer = 'outer/transaction/grid/form-view';
    }
    return outlets;
    // if(this.process === Process.create)
    //   return `sb/transaction/${this.moduleId}/create/${this.layoutId}/new`;
    // else if(this.process === Process.change)
    //   return `sb/transaction/${this.moduleId}/change/${this.layoutId}/${this.recordId}`;
    // else if(this.process === Process.view)
    //   return `sb/transaction/${this.moduleId}/view/${this.layoutId}/${this.recordId}`
  }

  rowClicked(row: any) {
    if (!this.isSubGrid) {
      const UUID = row?.UUID?.fieldData && row?.UUID?.fieldData[0]?.c ? row.UUID.fieldData[0].c.toString() : '';
      this.activeRowId = this.parentRowId = UUID || '';
      this.subGridPermission.permission = {...this.setActiveSubGridData?.fieldCtrl?.permissions || {}};
      this.getPermission(this.setActiveSubGridData?.fieldCtrl?.permissions,'subGrid');
    }
  }

  /**
   * check if a column is static
   * @param colId column id
   */
   isStaticCol(colId: string) {
    return this.staticColumns.includes(colId);
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.dataSource?.docValue().forEach((row,i) => this.selection.select(row,i));
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource?.docLength();
    return numSelected === numRows;
  }


  exportData() {
    const rows = this.dataSource.getAllData(this.parentRowId);
    const headers = this.getFileHeaders();
    const data = [];
    rows.forEach(row => {
      const line: any = {UUID: row.UUID?.fieldData};
      if(this.isSubGrid) {
        line.PARENT_UUID = row.PARENT_UUID?.fieldData;
      }
      this.childFields.forEach(field => {
        if(row.hasOwnProperty(field.fieldId)) {
          line[field.fieldId] = row[field.fieldId].fieldData;
        }
      });
      data.push(line);
    });
    const json = headers.concat(data);
    const buffer = this.buildFileData(json);
    this.exportAsFile(buffer, `${this.fieldObj?.fieldCtrl.description}_data.xlsx`);
  }

  exportSubGridData() {
    const rows = this.dataSource.getAllData(this.parentRowId,this.setActiveSubGridData?.fieldId);
    const headers = this.getFileSubHeaders();
    const data = [];

    rows.forEach(row => {
      const line: any = {UUID: row.UUID?.fieldData};
      line.PARENT_UUID = row.PARENT_UUID?.fieldData;
      this.subGridFields.forEach(gridFields => {
        gridFields.fieldCtrl.grid.forEach(element => {
          if(row.hasOwnProperty(element.fieldId)) {
            line[element.fieldId] = row[element.fieldId].fieldData;
          }
        });
      })

      data.push(line);
    });

    const json = headers.concat(data);
    const buffer = this.buildFileData(json);
    this.exportAsFile(buffer, `${this.setActiveSubGridData?.fieldDescri}_data.xlsx`);
  }

  /**
   * Download Excel template for data import
   */
  downloadTemplate() {
    const headers = this.getFileHeaders();
    const buffer = this.buildFileData(headers);
    this.exportAsFile(buffer, `${this.fieldObj?.fieldCtrl.description}_template.xlsx`);
  }

  downloadSubGridTemplate() {
    const headers = this.getFileSubHeaders();
    const buffer = this.buildFileData(headers);
    this.exportAsFile(buffer, `${this.setActiveSubGridData?.fieldDescri}_template.xlsx`);
  }

  buildFileData(json: any[]) {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return excelBuffer;
  }

  getFileHeaders() {
    const headers: any = { UUID: 'Row UUID' };
    if(this.isSubGrid) {
      headers.PARENT_UUID = 'Parent Row UUID';
    }
    this.childFields.forEach((r) => {
      headers[r.fieldId] = r.fieldDescri;
    });
    return [headers];
  }

  getFileSubHeaders() {
    const headers: any = { UUID: 'Row UUID' };
    headers.PARENT_UUID = 'Parent Row UUID';
    this.subGridFields.forEach(field => {
      if (field.fieldId === this.setActiveSubGridData?.fieldId) {
        field.fieldCtrl.grid.forEach((r) => {
          headers[r.fieldId] = r.description;
        });
      }
    })
    return [headers];
  }

  exportAsFile(buffer: any, fileName) {
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(new Blob([buffer]));
    a.href = objectUrl;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
  }

  getPageIndex() {
    return this.isSubGrid ? this.subgridPageIndex : this.pageIndex;
  }

  /**
   * get page records
   */
  onPageChange(event: PageEvent) {
    if (event.pageIndex && this.pageIndex !== event.pageIndex) {
      this.pageIndex = event.pageIndex;
      if (this.currentSortValue && this.currentSortValue?.direction) {
        this.sortChange(this.currentSortValue, true);
        return;
      }
      this.dataSource?.getData(this.pageIndex, this.pageSize, this.searchTerm, this.parentRowId);
    }

    if (this.isSubGrid && event.pageIndex && (this.subgridPageIndex !== event.pageIndex)) {
      this.subgridPageIndex = event.pageIndex;
      if (this.currentSortValue && this.currentSortValue?.direction) {
        this.sortChange(this.currentSortValue);
        return;
      }
      this.dataSource?.getData(this.subgridPageIndex, this.pageSize, this.subGridSearchTerm , this.parentRowId);
    }
  }

  getOldValue(fieldEl) {
    return (fieldEl && fieldEl.oldData) || '';
  }
  /**
   * Open the file picker to upload a file ...
   */
   uploadAFile() {
    this.fileAttach.nativeElement.click();
  }

  /**
   * Function to get the excel file and get fields and data
   * @param evt file uploaded event
   */
   fileChange(evt: Event) {
    let errorText = '';
    if (evt !== undefined) {
      this.uploadError.status = false;
      this.uploadError.message = '';
      const target: DataTransfer = (evt.target) as unknown as DataTransfer;
      if (target.files.length !== 1) {
        errorText = 'Cannot use multiple files';
        this.uploadError = {
          status: true,
          message: errorText
        }
        return;
      }
      // check file type
      let type = '';
      try {
        type = target.files[0].name.split('.')[1];
      } catch (ex) {
        console.error(ex)
      }
      if (type === 'xlsx' || type === 'xls' || type === 'csv') {
        // check size of file
        const size = target.files[0].size;

        const sizeKb = Math.round((size / 1024));
        if (sizeKb > (10 * 1024)) {
          // this.uploadedFile = null;
          errorText = `File size too large , upload less then 10 MB`;
          this.uploadError = {
            status: true,
            message: errorText
          }
          return false;
        }
        const reader: FileReader = new FileReader();
        reader.onload = (e: any) => {
          /* read workbook */
          const bstr: string = e.target.result;
          const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
          /* grab first sheet */
          const wsname: string = wb.SheetNames[0];
          const ws: XLSX.WorkSheet = wb.Sheets[wsname];
          /* save data */
          const data: any = XLSX.utils.sheet_to_json(ws, { header: 1 });
          this.fileAttach.nativeElement.value = '';
          // compare header
          if(data[0] && data[1]) {
            const headerObj  = data[0].reduce((obj, key, index) => {
              obj[key] = data[1][index];
              return obj;
            }, {});

            // comparing both header
            if(JSON.stringify(headerObj) === JSON.stringify(this.getFileHeaders()[0])) {
              const finalData = [];
              const existGridAllData = this.dataSource.getAllData();
              let refresh = false;
              data.forEach((dataRow, index) => {
                if(index !== 0 && index !== 1) { // skip header rows
                  const dataObj = {};
                  data[0].forEach((header, headerInd) => {
                    dataObj[header] = {
                      vc: [{
                        c: dataRow[headerInd]
                      }],
                    }
                  });
                  // check and to update existing data from master object
                  if(dataRow[0]) {
                    const UUID = dataRow[0].toString();
                    const existRowIndex = existGridAllData.findIndex(o => o.UUID.fieldData === UUID);
                    if(existRowIndex !== -1) {
                      this.dataSource?.updateRow(dataObj, existRowIndex);
                      refresh = true;
                      return;
                    }
                  }
                  finalData.push(dataObj);
                }
              });
              if(finalData.length > 0) {
                finalData.forEach(data=>{
                  const uuidVc = data['UUID'].vc;
                  if( Array.isArray(uuidVc) && !uuidVc[0].c){
                    uuidVc[0].c = this.utilityService.generate_UUID();
                  }
                })
                this.dataSource?.createRows(finalData, this.pageSize);
              } else if (refresh) {
                this.dataSource.getData(1, this.pageSize, '', this.parentRowId);
              }
            } else {
              this.uploadError = {
                status: true,
                message: 'Mis-match in Header. Please check the Excel Header..'
              }
            }
          } else {
            this.uploadError = {
              status: true,
              message: 'Headers Not found. Please check the Excel Header..'
            }
          }

        };
        reader.readAsBinaryString(target.files[0]);
      } else {
        errorText = `Unsupported file format, allowed file formats are .xlsx, .xls and .csv`;
        this.uploadError = {
          status: true,
          message: errorText
        }
      }
    }
  }

  setFieldValue(fieldId, value, fieldType, rowIndex) {
    let formValue = [{c: value, t: null}];
    switch(fieldType) {
      case 'DATEPICKER':
        formValue[0].c = moment(value).utc().valueOf();
        break;
      case 'RADIO':
      case 'DROPDOWN':
        formValue = [];
        value.forEach(o => {
          formValue.push({c: o.code, t: o.text});
        });
        break;
      case 'ATTACHMENT':
        formValue = value;
        break;
      case 'HTML-EDITOR':
        formValue[0].c = value.newValue;
        break;
    }
    if(this.rowData[rowIndex]) {
      const fieldData = this.rowData[rowIndex][fieldId];
      if(this.process === Process.change || this.process === Process.approve) {
        fieldData.oc = fieldData?.vc?.some(option => option.c !== null) ? fieldData.vc : [{c: '', t: null}];
      }
      if (fieldData?.vc) {
        fieldData.vc = formValue;
      }
    }
  }

  getFieldType(fieldId) {
    const pickList = this.fieldObj?.fieldCtrl?.grid?.find(f => f.fieldId === fieldId)?.pickList;
    switch(pickList) {
      case '1':
      case '37':
        return 'DROPDOWN';
      case '38':
        return 'ATTACHMENT';
      case '15':
        return 'GRID';
      case '4':
        return 'RADIO';
      case '2':
        return 'CHECKBOX';
      case '55':
        return 'URL';
      case '54':
        return 'TIMEPICKER';
      case '52':
        return 'DATEPICKER';
      case '22':
        return 'TEXTAREA';
      case '36':
        return 'TOGGLE';
      case '30':
        return 'DATA-REF';
      case '31':
        return 'HTML-EDITOR'
      default :
        return 'TEXT'
    }
  }

  afterInputBlur(element: SchemaTableData,rowIndex: number, row: SchemaTableData[]) {
    element.isEdited = false;
    this.validateRowChanges(rowIndex, row);
  }

  validateRowChanges(rowIndex, row) {
    const masterRec = this.coreCrudService.getMasterData(this.activeForm.isPrimary, this.moduleId);
    console.log(masterRec.mdoRecordES.gvs[this.fieldObj.fieldId].rows[rowIndex]);
    masterRec.mdoRecordES.gvs[this.fieldObj.fieldId].rows[rowIndex] = JSON.parse(JSON.stringify(this.rowData[rowIndex]));
    this.dataSource.getData(this.pageIndex, this.pageSize, this.searchTerm, this.parentRowId);
    row.inlineEdit = false;
    delete this.rowData[rowIndex];
  }

  discardRowChanges(rowIndex, row) {
    row.inlineEdit = false;
    delete this.rowData[rowIndex];
  }

  getFieldValue(rowIndex, fieldId) {
    if(this.rowData && this.rowData[rowIndex] && this.rowData[rowIndex][fieldId]) {
      let value;
      const fieldType = this.getFieldType(this.getFieldDetailsById(fieldId)?.pickList);
      if(fieldType === 'DROPDOWN') {
        value = [];
        this.rowData[rowIndex][fieldId]?.vc?.forEach(o => {
          if(o.c) {
            value.push({code: o.c, text: o.t});
          }
        });
      } else if(fieldType === 'ATTACHMENT') {
        value = this.rowData[rowIndex][fieldId]?.vc || [];
      } else {
        value = this.rowData[rowIndex][fieldId]?.vc[0]?.c || '';
      }
      return value;
    }
    return null;
  }

  getFieldDetailsById(fieldId) {
    return this.childFields.find(f => f.fieldId === fieldId);
  }

  /**
   * ANGULAR LIFECYCLE HOOK
   * Called once, before the instance is destroyed.
   */
   ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
  }

}
