import { SelectionModel } from '@angular/cdk/collections';
import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterBusinessList } from '@models/list-page/listpage';
import { RoleRequestDto, UserInfo } from '@models/teams';
import { businessRulesColumns, BusinessRuleType, RULE_TYPES } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { BusinessRules } from '@modules/admin/_components/module/schema/diw-create-businessrule/diw-create-businessrule.component';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { CoreService } from '@services/core/core.service';
import { SchemaService } from '@services/home/schema.service';
import { RuleService } from '@services/rule/rule.service';
import { UserProfileService } from '@services/user/user-profile.service';
import { TransientService } from 'mdo-ui-library';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, take, takeUntil } from 'rxjs/operators';
import { BusinessRuleDataSource } from './business-rule-datasource';

@Component({
  selector: 'pros-business-rule-list',
  templateUrl: './business-rule-list.component.html',
  styleUrls: ['./business-rule-list.component.scss'],
})
export class BusinessRuleListComponent implements OnInit {
  formListHasData = false;
  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();

  /**
   * moduleId from param
   */
  moduleId = '';

  /**
   * show skeleton on initial load
   */
  showSkeleton = false;

  /**
   * fieldList pagination for scroll down
   */
  recordsPageIndex = 1;
  /**
   * fieldList pagination size
   */
  recordsPageSize = 10;
  totalCount = 0;
  /**
   * modifyby search string
   */
  modifybySearchString = '';
  /**
   * modifyby filter pageindex
   */
  modifybyPageIndex = 1;
  modifybyPageSize = 10;
  modifybyUsers: UserInfo[] = [];
  filteredmodifybyUsers: UserInfo[] = [];
  /**
   * modifyby search by string
   */
  searchModifyBySub: Subject<string> = new Subject();
  /**
   * if on scroll down modifyby users, then there should be another api call to get modifyby users. Used this flag to identify if a fetch is going on right now
   */
  modifybyInfinteScrollLoading = false;

  /**
   * hold the business rule types
   */
  businessRuleTypes: BusinessRules[] = RULE_TYPES;
  displayedColumns: string[] = [
    '_select',
    'action',
    'brName',
    'ruleType',
    'assignedSchemas',
    'assignedForms',
    'assignedFlows',
    'modifiedDate',
    'modifiedBy',
    'status',
  ];
  columns = businessRulesColumns;
  /**
   * material table datasource
   */
  dataSource: BusinessRuleDataSource = undefined;
  selection = new SelectionModel<any>(true, []);
  totalData = {};
  userList = [];
  filterData: FilterBusinessList = new FilterBusinessList();

  /**
   * Add a reference to MatTable
   */
     @ViewChild('table') table: MatTable<any>;

  /**
   * forms search by string
   */
  searchFieldSub: Subject<string> = new Subject();

  constructor(
    public readonly route: ActivatedRoute,
    private ngZone: NgZone,
    private router: Router,
    private matSnackBar: MatSnackBar,
    private coreService: CoreService,
    public dialog: MatDialog,
    private transientService: TransientService,
    private userProfileService: UserProfileService,
    private sharedService: SharedServiceService,
    private schemaService: SchemaService,
    private ruleService: RuleService
  ) {
    this.dataSource = new BusinessRuleDataSource(this.coreService);
  }

   /**
   * use this method to update the UI after dynamic columns are displayed
   */
    updateTableColumnSize() {
      this.ngZone.onMicrotaskEmpty.pipe(take(3)).subscribe(() => this.table.updateStickyColumnStyles());
     }
    ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp) => {
      this.moduleId = resp.moduleId;
      this.showSkeleton = true;
      this.dataSource.reset();
      this.getTableData();
      this.getModifybyUsers();
    });

    this.dataSource.loading$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp) => {
      if (!resp) {
        this.showSkeleton = false;
      }
    });

    this.dataSource.hasDataSubject.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp) => {
      if (resp) {
        this.formListHasData = resp;
      }
    });

    this.dataSource.totalData.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp: any) => {
      if (resp) {
        this.totalCount = resp?.totalElements;
        this.totalData = resp;
        this.coreService.nextUpdateRuleCount(this.totalCount);
      }
    });

    this.searchFieldSub.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString) => {
      this.filterData.ruleName = searchString;
      this.dataSource.reset();
      this.recordsPageIndex = 1;
      this.getTableData();
    });

    this.searchModifyBySub.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString) => {
      this.modifybySearchString = searchString;
      this.modifybyPageIndex = 1;
      this.modifybyUsers = [];
      this.filteredmodifybyUsers = [];
      this.getModifybyUsers();
    });

    this.sharedService.getAfterBrSave().subscribe((res) => {
      if (res) {
        this.dataSource.reset();
        this.recordsPageIndex = 1;
        this.getTableData();
      }
    });
    this.coreService.updateBrRuleListSubject$.subscribe(res => {
      if (res) {
        this.showSkeleton = true;
        this.dataSource.reset();
        this.getTableData();
        this.getModifybyUsers();
      }
    })
  }

  // call through getModifybyUsers to get the user list by search
  getModifybyUsers() {
    const requestDto: RoleRequestDto = {
      pageInfo: {
        pageNumer: this.modifybyPageIndex - 1,
        pageSize: this.modifybyPageSize,
      },
      searchString: this.modifybySearchString,
    };

    this.modifybyInfinteScrollLoading = true;
    this.userProfileService
      .getUserInfoList(requestDto)
      .pipe(take(1))
      .subscribe(
        (resp) => {
          this.modifybyInfinteScrollLoading = false;
          this.modifybyUsers.push(...resp.listPage.content);
          this.filteredmodifybyUsers.push(...resp.listPage.content.slice());
        },
        (err) => {
          this.modifybyInfinteScrollLoading = false;
        }
      );
  }

  modifybyScrollEnd() {
    if (!this.modifybyInfinteScrollLoading) {
      this.modifybyPageIndex++;
      this.modifybyInfinteScrollLoading = true;
      this.getModifybyUsers();
    } else {
      return null;
    }
  }

  setSelectedModifyby(user: any) {
    if (user) {
      if (!this.filterData.userModified) {
        this.filterData.userModified = [];
      }

      const index = this.filterData.userModified.findIndex((d) => d === user.userName);
      if (index >= 0) {
        this.filterData.userModified.splice(index, 1);
      } else {
        this.filterData.userModified.push(user.userName);
      }
    } else {
      this.filterData.userModified = [];
    }
  }

  // call through tableData to get the business rules by user modified
  afterFilterMenuClosed() {
    this.dataSource.reset();
    this.recordsPageIndex = 1;
    this.getTableData();
  }

  // FILTER DATA BASED ON RULE TYPE
  selectCurrentRuleType(ruleType: string) {
    if (ruleType !== this.filterData.ruleType) {
      this.filterData.ruleType = ruleType;
      this.dataSource.reset();
      this.recordsPageIndex = 1;
      this.getTableData();
    }
  }

  // FILTER DATA BASED ON STATUS
  selectCurrentStatusType(bool?) {
    if (bool !== this.filterData.status) {
      this.filterData.status = bool;
      this.dataSource.reset();
      this.recordsPageIndex = 1;
      this.getTableData();
    }
  }

  getLabel(dynCol) {
    return this.columns.find((d) => d.id === dynCol)?.name;
  }

  /**
   * call through datasource to get the teammembers by pagination, sort, search, role or stats filter
   */
  getTableData() {
    const dto: FilterBusinessList = {
      ...this.filterData,
    };
    dto.dataSetId = `${this.moduleId}` || '';
    const index = this.recordsPageIndex === 0? 0 : this.recordsPageIndex - 1;
    this.dataSource.getData(index, this.recordsPageSize, dto);
  }

  /**
   * to convert rule type into rule description
   * @param ruleType ruleType of a business rule object
   */
  public getRuleDesc(ruleType: string) {
    return RULE_TYPES.find((rule) => rule.ruleType === ruleType)?.ruleDesc;
  }

  /**
   * get page records
   */
  onPageChange(event: PageEvent) {
    if (this.recordsPageIndex !== event.pageIndex) {
      this.recordsPageIndex = event.pageIndex;
      this.getTableData();
    }
  }

  // display page records range
  get displayedRecordsRange(): string {
    const endRecord =
      this.recordsPageIndex * this.recordsPageSize < this.totalCount ? this.recordsPageIndex * this.recordsPageSize : this.totalCount;
    return this.totalCount ? `${(this.recordsPageIndex - 1) * this.recordsPageSize + 1} to ${endRecord} of ${this.totalCount}` : '';
  }

  isArray(col) {
    return !!Array.isArray(col);
  }

  /**
   * Open create business rule dialog
   */
  createBusinessRule(brId?: string, brType?: string) {
    if (this.moduleId) {
      this.router.navigate([
        '',
        {
          outlets: {
            sb: `sb/list/dataset-settings/${this.moduleId}/business-rule/${this.moduleId}`,
            outer: `outer/schema/business-rule/${this.moduleId}/new/new/outer`,
          },
        },
      ]);
    } else {
      this.matSnackBar.open(`Please select module`, 'Close', { duration: 5000 });
    }
  }

  updatePageIndexOnDelete(){
    if((this.totalCount-1) % this.recordsPageSize == 0){
      this.recordsPageIndex = (this.totalCount-1)/this.recordsPageSize;
      this.getTableData();
    } else{
      this.getTableData();
    }
  }

  deleteBusinessRule(data) {
    this.transientService.confirm(
      {
        data: { dialogTitle: 'Confirmation', label: 'Are you sure you want delete this business rule?' },
        disableClose: true,
        autoFocus: false,
        width: '600px',
        panelClass: 'create-master-panel',
      },
      (response) => {
        if (response === 'yes') {
          console.log(data);
          if(!data?.ruleType as any !== BusinessRuleType.BR_DEPENDENCY) {
            this.deleteBusinessRules(data?.brId);
          } else {
            this.deleteDependencyRule(data?.brId);
          }
        }
      }
    );
  }

  deleteDependencyRule(brId: string) {
    this.ruleService.deleteGroup(brId).subscribe(()=>{
        this.transientService.open('Deleted successfully','close', { duration: 3000 });
        this.updatePageIndexOnDelete();
    },(error)=>{
      this.transientService.open('Error while deleting rule', 'okay', {
        duration: 3000
      });
    })
  }

  deleteBusinessRules(brId: string) {
    this.schemaService.deleteBr(brId).subscribe(res => {
      if (res) {
        this.transientService.open('Deleted successfully','close', { duration: 3000 });
        this.updatePageIndexOnDelete();
      }
    }, err => console.error(`Error : ${err.message}`));
  }

  duplicateBusinessRule(element) {
    this.schemaService.duplicateBusinessRule(element.brId).pipe(take(1)).subscribe(resp => {
      this.transientService.open('Duplicated Successfully', 'close', { duration: 3000 });
      this.getTableData();
    }, err => console.error(`Error : ${err.message}`));
  }

  getRuleInfo(data) {
    if(data?.ruleType as any !== BusinessRuleType.BR_DEPENDENCY) {
      this.router.navigate([
        '',
        {
          outlets: {
            sb: `sb/list/dataset-settings/${this.moduleId}/business-rule/${this.moduleId}`,
            outer: `outer/schema/business-rule/${this.moduleId}/null/${data.brId}/outer`,
          },
        },
      ]);
    } else {
      this.router.navigate([
        '',
        {
          outlets: {
            sb: `sb/list/dataset-settings/${this.moduleId}/business-rule/${this.moduleId}`,
            outer: `outer/dependency-rule/${this.moduleId}/rule/${this.moduleId}/${data.brId}/${data?.brDesc}`,
          },
        },
      ]);
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.docLength();
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.dataSource.docValue().forEach((row) => this.selection.select(row));
  }
}
