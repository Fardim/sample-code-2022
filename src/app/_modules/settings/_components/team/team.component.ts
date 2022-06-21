import { GlobaldialogService } from '@services/globaldialog.service';
import { TeamService } from '@services/user/team.service';
import { MultiSortDirective } from '../../../shared/_pros-multi-sort/multi-sort.directive';
import { TransientService } from 'mdo-ui-library';
import { PageEvent } from '@angular/material/paginator';
import { takeUntil, debounceTime, distinctUntilChanged, take, flatMap, switchMap } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { TeamsDataSource } from './team-data-source';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { forkJoin, Subject, Subscription } from 'rxjs';
import { Userdetails, UserPersonalDetails } from '@models/userdetails';
import { UserService } from '@services/user/userservice.service';
import { TeamMember, Role, UserListRequestDTO, RoleRequestDto } from '@models/teams';
import { MatTable } from '@angular/material/table';
import { UserProfileService } from '@services/user/user-profile.service';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';

@Component({
  selector: 'pros-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss'],
})
export class TeamComponent implements OnInit, AfterViewInit, OnDestroy {
  /**
   * Add a reference to MatTable
   */
  @ViewChild('table') table: MatTable<any>;

  /**
   * table column fieldId and display label list
   */
  fields = teamMemberTableFields;

  teamMem
  /**
   * columns to be displayed in the table
   */
  displayedColumns: string[] = [];
  staticColumns: string[] = ['select', 'userName', 'assign', 'datasetRecord'];
  columns = teamMemberTableFields;
  /**
   * material table datasource
   */
  dataSource: TeamsDataSource = undefined;
  /**
   * selected rows from the table
   */
  selection = new SelectionModel<TeamMember>(true, []);
  /**
   * table pagesize
   */
  recordsPageSize = 50;
  /**
   * table initail pageindex
   */
  recordsPageIndex = 1;
  /**
   * role infinite scroll page size
   */
  rolePageSize = 10;
  /**
   * role page index of infinite scroll
   */
  rolePageIndex = 1;
  /**
   * role search text
   */
  roleSearchString = '';
  /**
   * to check if a current get call is running on the table
   */
  roleInfinteScrollLoading = false;
  /**
   * Hold total records count
   */
  totalCount = 0;

  /**
   * selected row in the table
   */
  selectedRecordsList = [];
  /**
   * selected row data
   */
  selectedPages = [];
  /**
   * initial sort direction ascending
   */
  sortDirection = 'asc';
  /**
   * initial sort by id
   */
  sortBy = 'id';
  /**
   * show skeleton on initial load
   */
  showSkeleton = true;

  showTableSkeleton = true;
  /**
   * to check if a current get call is running on the table
   */
  infinteScrollLoading = false;
  /**
   * to check if the server still has more data. once the server returns [], it will be false
   */
  hasMoreData = true;
  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();
  /**
   * table data search by string
   */
  searchFieldSub: Subject<string> = new Subject();

  /**
   * Role filter search by string
   */
  searchRoleSub: Subject<string> = new Subject();

  /**
   * Checkbox options list;
   */
  CheckboxOptions = [
    {
      label: 'Select this page',
      value: 'select_this_page',
    },
    {
      label: 'Select all page',
      value: 'select_all_page',
    },
    {
      label: 'Select none',
      value: 'select_none',
    },
  ];
  /**
   * Status filter search by string
   */
  searchStatusSub: Subject<string> = new Subject();
  /**
   * all the roles of the team
   */
  allRoles: Role[] = [];
  /**
   * when filters are applied by role
   */
  filteredRoles: Role[] = [];
  /**
   * Selected role for data filter
   */
  selectedRoles: string[] = [];
  /**
   * to show the selected roles description in the lib-chip
   */
  selectedRolesDescription: string[] = [];
  /**
   * status level of the team members
   */
  allStatus: string[] = [];
  /**
   * when filters are applied by status
   */
  filteredStatus: string[] = [];
  /**
   * Selected status for filter
   */
  selectedStatus: string[] = [];
  /**
   * when filters are applied by status
   */
  statusFilter: string[] = [];

  labelSearchFieldSub: Subject<string> = new Subject();

  /**
   * Current user details will be fetched from API
   */
  userDetails: Userdetails = new Userdetails();
  currentUserPersonalDetails: UserPersonalDetails;
  subscription: Subscription = new Subscription();

  showErrorBanner = false;
  showErrorBannerMsg: string = '';
  searchString = '';

  /**
   * It is necessary for multi-sort table
   * https://www.npmjs.com/package/ngx-mat-multi-sort
   */
  // table: TableData<TeamMember>;
  @ViewChild(MultiSortDirective, { static: false }) multiSort: MultiSortDirective;
  /**
   * multi-sort array of sortby and sortdir
   */
  sortFields: { sortBy: string; sortDirection: string }[] = [];

  inviteUserRoleChanges = [];

  selectedTabIndex;

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private teamService: TeamService,
    private profileService: UserProfileService,
    private userService: UserService,
    private globalDialogService: GlobaldialogService,
    private transientService: TransientService,
    private ref: ChangeDetectorRef,
    private sharedService: SharedServiceService,
    private activatedRoute: ActivatedRoute
  ) {
    this.dataSource = new TeamsDataSource(this.profileService);
  }

  /**
   * call table data, call all the roles of the team, check is firsttime data load is done for the skeleton, subscribe to searchFieldSub for any search
   */
  ngOnInit(): void {
    this.getTableData();
    this.getRoles();
    this.getAllStatus();
    this.dataSource.loading$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp) => {
      if (!resp) {
        this.showSkeleton = false;
        this.showTableSkeleton = false;
      }
    });
    this.showSkeleton = true;
    this.searchFieldSub.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString) => {
      this.searchString = searchString || '';
      this.dataSource.reset();
      this.recordsPageIndex = 1;
      // this.tags = [];
      this.getTableData();
    });
    this.subscription.add(
      this.userService.getUserDetails().subscribe((response: Userdetails) => {
        this.userDetails = response;
      })
    );
    this.subscription.add(
      this.userService.getUserPersonalDetails().subscribe((res: UserPersonalDetails) => {
        this.currentUserPersonalDetails = res;
      })
    );

    this.searchRoleSub.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString) => {
      this.roleSearchString = searchString || '';
      this.rolePageIndex = 1;
      this.allRoles = [];
      this.filteredRoles = [];
      this.getRoles();
    });

    this.searchStatusSub.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString) => {
      this.filteredStatus = searchString
        ? this.allStatus.filter((num) => num.toLowerCase().indexOf(searchString.toLowerCase()) === 0)
        : this.allStatus.slice();
    });

    this.dataSource.totalCount$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((total) => {
      this.totalCount = total;
    });

    const userSub = this.sharedService.isUserDetailsUpdated.subscribe((res) => {
      if (res) {
        this.getTableData();
      }
    });
    this.subscription.add(userSub);

    this.labelSearchFieldSub.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((res)=>{
      this.roleSearchString = res || '';
      this.allRoles = [];
      this.rolePageIndex = 1;
      this.filteredRoles = [];
      this.getRoles();
    });

    this.subscription.add(
      this.activatedRoute.fragment.subscribe(tabIndex => {
        this.selectedTabIndex = +tabIndex;
        this.displayedColumns = +tabIndex === 0 ? TeamMembersColumns : PartnersColumns;
        this.dataSource.reset();
        this.recordsPageIndex = 1;
        this.getTableData();
      })
    )
  }

  initData() {
    this.dataSource.setMultiSort(this.multiSort);
  }

  getInitials(element) {
    const fName = element.fname ? element.fname : '';
    const lName = element.lname ? element.lname : '';
    const userName = element.userName ? element.userName : '';
    const email = element.email ? element.email : '';
    if (fName.length >= 1 || lName.length >= 1) {
      return (fName[0] ? fName[0] : '') + (lName[0] ? lName[0] : '');
    } else {
      return userName[0] ? userName[0] : (email[0] || '?');
    }
  }

  sortingFields(event: { sortBy: string; sortDirection: string }[]) {
    console.table(event);
    this.sortFields = event || [];
    this.getTableData();
  }

  /**
   * subscribe to sortChange and call the table again
   */
  ngAfterViewInit(): void {
    this.initData();
    this.ref.detectChanges();
  }

  /**
   * call through datasource to get the teammembers by pagination, sort, search, role or stats filter
   */
  getTableData() {
    const userListRequestDTO: UserListRequestDTO = {
      pageInfo: {
        pageNumer: this.recordsPageIndex - 1,
        pageSize: this.recordsPageSize,
      },
      roles: this.selectedRoles || [],
      searchString: this.searchString,
      sortingInfo:
        this.sortFields.map((f) => {
          return {
            direction: f.sortDirection.toUpperCase(),
            fieldId: f.sortBy,
          };
        }) || [],
      status: this.selectedStatus || [],
      isPartner: this.selectedTabIndex === 1
    };
    this.showTableSkeleton = true;
    this.dataSource.getData(userListRequestDTO);
    this.dataSource.connect().subscribe((response) => {
      if (response && response.length) {
        this.updateTableColumnSize();
        this.selection.clear();
        if (this.selectedPages.includes('all')) {
          this.selection.clear();
          this.dataSource.docValue().forEach((row) => this.selection.select(row));
        } else if (this.selectedPages.includes(this.recordsPageIndex)) {
          this.dataSource.docValue().forEach((row) => this.selection.select(row));
        }
      }
    });
  }
  /**
   * use this method to update the UI after dynamic columns are displayed
   */
  updateTableColumnSize() {
    this.ngZone.onMicrotaskEmpty.pipe(take(3)).subscribe(() => this.table.updateStickyColumnStyles());
  }

  isChecked(row: any): boolean {
    const found = this.selection.selected.find((e) => e.email === row.email && e.userName === row.userName);
    if (found) return true;
    return false;
  }

  /**
   * api call to get all the roles of the team members.
   */
  getRoles() {
    const requestDto: RoleRequestDto = {
      pageInfo: {
        pageNumer: this.rolePageIndex - 1,
        pageSize: this.rolePageSize,
      },
      searchString: this.roleSearchString,
    };
    this.profileService
      .getTeamRoles(requestDto)
      .pipe(take(1))
      .subscribe((resp) => {
        this.roleInfinteScrollLoading = false;
        this.allRoles.push(...resp.listPage.content);
        this.filteredRoles.push(...resp.listPage.content.slice());
      });
  }
  roleScrollEnd() {
    if (!this.roleInfinteScrollLoading) {
      this.rolePageIndex++;
      this.roleInfinteScrollLoading = true;
      this.getRoles();
    } else {
      return null;
    }
  }

  /**
   * Api call to get the status list of the team active,inactive,pendinginvitation  etc
   */
  getAllStatus() {
    this.teamService
      .getAllStatus()
      .pipe(take(1))
      .subscribe((resp) => {
        this.allStatus = resp;
        this.filteredStatus = resp.slice();
      });
  }

  /**
   * Activate
   * @param element A row of the table
   */

  /**
   * confirm the popup to set active or inactive status
   */
  setStatus(status: string): void {
    const label = status === 'Active' ? $localize`:@@activate_message:Are you sure to activate the member?`
    : $localize`:@@deactivate_message:Are you sure to deactivate the member?`;
    this.transientService.confirm(
      {
      data: { dialogTitle: 'Confirmation', label},
      disableClose: true,
      autoFocus: false,
      width: '600px',
      },
      (response) => {
        if (response === 'yes') {
          // this.activate(element ? [element.email] : this.selection.selected.map((d) => d.email));
          this.setActiveInactiveStatus(status);
        } else {
          return null;
        }
      }
    );
  }

  /**
   * set status to active or inactive (API)
   */
  setActiveInactiveStatus(status?: string): void {
    const isAllRecordSelected = this.selectedPages.includes('all');
    const emails = [];
    if (!isAllRecordSelected) {
      this.selectedRecordsList?.forEach((e) => {
        emails.push(e.userName);
      });
    }
    forkJoin([this.profileService.updateStatusMembersUrl(emails, isAllRecordSelected, status, ''), this.userService.updateStatus(emails, this.userDetails.orgId, status, isAllRecordSelected)]).subscribe(resp=>{
        if (resp[0]?.acknowledge) {
          this.getTableData();
        } else {
          this.transientService.open(resp[0]?.errorMsg, 'ok', {
            duration: 2000,
          });
        }
    },(err) => {
      this.transientService.open(err?.errorMsg, 'ok', {
        duration: 2000,
      });
    });
  }

  /**
   * resend invitation on action
   * @param element A row of the table
   */
  resendInvitation(element?: TeamMember) {
    this.transientService.confirm({
      data: { dialogTitle: 'Confirmation', label: $localize`:@@resend_invitation_message:Are you sure to resend invitation?` },
      disableClose: true,
      autoFocus: false,
      width: '600px',
    }, (response) => {
      if (response === 'yes') {
        this.userService.getUserDetails().pipe(distinctUntilChanged()).subscribe(user => {
          const email = element ? element.email ? element.email : element.userName : '';
          const roles = element.roles !== null ? element.roles.map((x) => x.roleId) : [];
          this.invite(email, user.orgId, roles);
        });
      } else {
        return null;
      }
    });
  }

  invite(email: string, orgId: any, roles: string[]) {
    this.profileService
      .resendInvitations(email, orgId, roles)
      .pipe(take(1))
      .subscribe(
        (resp) => {
          if (resp.acknowledge) {
            this.transientService.open('Invitation re-send.', 'ok', {
              duration: 2000,
            });
            this.getTableData();
          } else {
            this.transientService.open('Re-send invitation failed.', 'ok', {
              duration: 2000,
            });
          }
        },
        (err) => {
          this.transientService.open('Re-send invitation failed.', 'ok', {
            duration: 2000,
          });
        }
      );
  }
  /**
   * revoke invitation on action
   * @param element A row of the table
   */
  revokeInvitation(userId: string) {
    const tenantId = this.currentUserPersonalDetails.profileKey ? this.currentUserPersonalDetails.profileKey.tenantId : '0';
    this.profileService
      .revokeInvitations(tenantId, userId)
      .pipe(take(1))
      .subscribe(
        (resp) => {
          if (resp.acknowledge) {
            this.transientService.open('Invitation revoked.', 'ok', {
              duration: 2000,
            });
            this.getTableData();
          } else {
            this.transientService.open('Invitation revoked failed.', 'ok', {
              duration: 2000,
            });
          }
        },
        (err) => {
          this.transientService.open('Revoked invitation failed.', 'ok', {
            duration: 2000,
          });
        }
      );
  }
  /**
   * revoke bulk on multiple selection
   * @param element A row of the table
   */
  revokeSelectedMembers(element?: TeamMember) {
    this.transientService.confirm({
      data: { dialogTitle: 'Confirmation', label: $localize`:@@revoke_message:Are you sure to revoke?` },
      disableClose: true,
      autoFocus: false,
      width: '600px',
    },
       (response) => {
      if (response === 'yes') {
        this.revokeInvitation(element.userName);
      } else {
        return null;
      }
    });
  }

  /* Activate or deactivate on action
   * @param element A row of the table
   */
  changeUserStatus(element: TeamMember, userStatus) {
    let label = 'Are you sure you want to activate?';
    if (element.status === 'ACTIVE') {
      label = 'Are you sure you want to deactivate?';
    }
    this.transientService.confirm({
      data: {
        dialogTitle: 'Confirmation',
        label
      },
      disableClose: true,
      autoFocus: false,
      width: '600px',
    }, (resp) => {
      if (resp && resp === 'yes') {
        forkJoin([this.profileService.updateStatusMembersUrl([element.userName], false, userStatus, ''),this.userService.updateStatus([element.userName], this.userDetails.orgId, userStatus, false)])
          .subscribe(result => {
            this.getTableData();
          }, err=>{
            this.transientService.open(err?.errorMsg, 'ok', {
              duration: 2000,
            });
          });
      }
    });
  }

  /**
   * delete member on action
   * @param element A row of the table
   */
  deleteMember(emails: string[]) {
    this.profileService
      .deleteTeamMembers(emails)
      .pipe(take(1))
      .subscribe(
        (resp) => {
          if (resp.acknowledge) {
            this.getTableData();
          } else {
            this.transientService.open('Delete Failed.', 'ok', {
              duration: 2000,
            });
          }
        },
        (err) => {
          this.transientService.open('Delete Failed.', 'ok', {
            duration: 2000,
          });
        }
      );
  }

  resetPassword(element) { }

  /**
   * delete bulk on multiple selection
   * @param element A row of the table
   */
  deleteSelectedMembers(element?: TeamMember) {
    this.globalDialogService.confirm({ label: $localize`:@@delete_message:Are you sure to delete?` }, (response) => {
      if (response === 'yes') {
        this.deleteMember(element ? [element.email] : this.selection.selected.map((d) => d.email));
      } else {
        return null;
      }
    });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    return this.selectedPages.includes('all');
    // return false;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle(event?) {
    switch (event?.value) {
      case 'select_this_page': {
        if (!this.selectedPages.includes(this.recordsPageIndex)) {
          this.selectedPages.push(this.recordsPageIndex);
        }
        if (this.selectedPages.includes('all')) {
          this.selectedPages.splice(this.selectedPages.indexOf('all'), 1);
        }
        if (this.selectedPages.includes(this.recordsPageIndex)) {
          this.dataSource.docValue().forEach((row) => {
            this.selection.select(row);
            if (this.selectedRecordsList.indexOf(row) === -1) {
              this.selectedRecordsList.push(row);
            }
          });
        }
        break;
      }
      case 'select_all_page': {
        this.selection.clear();
        this.selectedPages = ['all'];
        this.dataSource.docValue().forEach((row) => this.selection.select(row));
        break;
      }
      case 'select_none': {
        this.selection.clear();
        this.selectedPages = [];
        this.selectedRecordsList = [];
        break;
      }
      default:
        break;
    }
  }

  /**
   * select/deselect the table row
   */
  toggle(element): void {
    this.selection.toggle(element);
    if (this.selectedRecordsList.indexOf(element) === -1) {
      this.selectedRecordsList.push(element);
    } else {
      this.selectedRecordsList.splice(this.selectedRecordsList.indexOf(element), 1);
    }
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
  }

  /**
   * on scroll down increment the recordsPageIndex and call the datasource for next page data
   * @param loadMore boolean to identify to load more or not
   */
  scroll(loadMore: boolean) {
    if (!this.infinteScrollLoading && this.hasMoreData) {
      if (loadMore) {
        this.recordsPageIndex++;
      } else {
        this.recordsPageIndex = 1;
      }
      this.infinteScrollLoading = true;
      this.selection.clear();
      this.getTableData();
    } else {
      return null;
    }
  }
  /**
   * check is the column static or not
   * @param dynCol table column
   * @returns boolean
   */
  isStaticCol(dynCol) {
    return this.staticColumns.includes(dynCol);
  }
  /**
   * find the label of the field of the table column
   * @param dynCol table column
   * @returns string
   */
  getLabel(dynCol) {
    return this.fields.find((d) => d.id === dynCol).name;
  }

  removeLabel(element: TeamMember, label) {
    // element.labels = element.labels.filter((d) => d !== label);
  }

  /**
   * get page records
   */
  onPageChange(event: PageEvent) {
    if (event.pageIndex > event.length) {
      event.pageIndex = event.length;
    } else if (event.pageIndex < 0) {
      event.pageIndex = 1;
    }
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

  setSelectedRole(item: Role) {
    if (item) {
      const index = this.selectedRoles.findIndex((d) => d === item.roleId.toString());
      if (index >= 0) {
        this.selectedRoles.splice(index, 1);
        this.selectedRolesDescription.splice(index, 1);
      } else {
        this.selectedRoles.push(item.roleId.toString());
        this.selectedRolesDescription.push(item.description);
      }
    } else {
      this.selectedRoles = [];
      this.selectedRolesDescription = [];
    }
  }

  setRoleValues(rolesList: Role[]) {
    this.inviteUserRoleChanges = [];
    if (rolesList) {
      this.inviteUserRoleChanges = [...rolesList];
    }
  }

  updateInvitedUserRole(item: Role) {
    const index = this.inviteUserRoleChanges.findIndex(role => role.roleId === item.roleId);
    if (index === -1) {
      this.inviteUserRoleChanges.push({
        roleDesc: item.description,
        roleId: item.roleId
      })
    } else {
      this.inviteUserRoleChanges.splice(index, 1);
    }
  }

  setUserRole(item: Role) {
    return this.inviteUserRoleChanges.some(role => role.roleId === item.roleId);
  }

  invitedUserRoleChanged(userInfo: TeamMember) {
    const payload = {
      isDefault: true,
      roleId: this.inviteUserRoleChanges.map(role => role.roleId),
      userId: userInfo.userName,
      isPartner: this.selectedTabIndex === 1,
      datasetId: userInfo.datasetId || null,
      recordNumber: userInfo.recordNumber || null
    }

    const assignUserPayload = {
      roleIds: this.inviteUserRoleChanges.map(role => role.roleId),
      userName: userInfo.userName,
      isPartner: this.selectedTabIndex === 1,
      datasetId: userInfo.datasetId || null,
      recordNumber: userInfo.recordNumber || null
    }
    if(payload.roleId.length>0){
      forkJoin([this.teamService.saveUserRoles(payload),this.teamService.assignUserRoles(assignUserPayload)]).subscribe((response)=>{
        if(response[0]) {
          userInfo.roles = [...this.inviteUserRoleChanges]
        }
      })
    } else {
      this.showErrorBannerMsg = 'Please select at least one role for the user';
        setTimeout(() => {
          this.showErrorBannerMsg = '';
        }, 5000);
    }
  }

  setSelectedStatus(item) {
    if (item) {
      const index = this.selectedStatus.findIndex((d) => d === item);
      if (index >= 0) {
        this.selectedStatus.splice(index, 1);
      } else {
        this.selectedStatus.push(item);
      }
    } else {
      this.selectedStatus = [];
    }
  }

  afterStatusAndRoleMenuClosed() {
    this.dataSource.reset();
    this.recordsPageIndex = 1;
    this.getTableData();
  }

  /**
   * open side sheet to invite new team members
   */
  OpenInviteSidesheet() {
    this.router.navigate([{ outlets: { sb: `sb/settings/teams`, outer: `outer/teams/invite` } }],
      { queryParamsHandling: 'preserve', preserveFragment: true });
  }

  /**
   * opens profile section side sheet
   */
  openProfileSectionSidesheet(element: TeamMember) {
    this.subscription.add(
      this.profileService.validateUser().subscribe(
        (res) => {
          if (res) {
            this.showErrorBanner = false;
            this.router.navigate([{ outlets: { sb: `sb/settings/teams`, outer: `outer/teams/user-profile/${element.userName}` } }], {
              queryParamsHandling: 'preserve', preserveFragment: true
            });
          } else {
            this.showErrorBanner = true;
          }
        },
        (err) => {
          console.log(err);
        }
      )
    );
  }

  selectedTabChange(tabIndex) {
    this.router.navigate([{ outlets: { sb: [...(this.router as any).currentUrlTree.root.children.sb.segments.map(m=> m.path)]}}],
      { queryParamsHandling: 'preserve', fragment: `${tabIndex}` });
  }

  openDatasetRecordMapping(userInfo: TeamMember) {
    this.sharedService.setPartnerDetails(userInfo);
    this.router.navigate([{ outlets: { sb: [...(this.router as any).currentUrlTree.root.children.sb.segments.map(m=> m.path)],
      outer: `outer/teams/dataset-record-mapping` } }],
      { queryParamsHandling: 'preserve', preserveFragment: true });
  }

  ngOnDestroy() {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
    this.subscription.unsubscribe();
  }
}

export const teamMemberTableFields = [
  {
    id: 'userName',
    name: $localize`:@@username:Username`,
  },
  {
    id: 'fname',
    name: $localize`:@@first_name:First Name`,
  },
  {
    id: 'lname',
    name: $localize`:@@last_name:Last Name`,
  },
  {
    id: 'roles',
    name: $localize`:@@role:Role`,
  },
  {
    id: 'status',
    name: $localize`:@@status:Status`,
  },
  {
    id: 'email',
    name: $localize`:@@email:Email`,
  },
  {
    id: 'joinedDate',
    name: $localize`:@@joined:Joined`,
  },
  {
    id: 'lastActiveDate',
    name: $localize`:@@last_active:Last Active`,
  },
  {
    id: 'action',
    name: $localize`:@@action:Action`,
  },
  {
    id: 'assign',
    name: $localize`:@@action:Assign`,
  },
  {
    id: 'datasetRecord',
    name: $localize`:@@action:Dataset Record`,
  },
];

const TeamMembersColumns = [
  'select',
  'action',
  'userName',
  'fname',
  'lname',
  'roles',
  'status',
  'email',
  'joinedDate',
  'lastActiveDate',
]

const PartnersColumns = [
  'select',
  'action',
  'userName',
  'assign',
  'roles',
  'datasetRecord',
  'status',
]
