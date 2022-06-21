import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { GetRolesPost, RolesDescription, RolesResponse, RoleUsersCount } from '@models/roles';
import { TransientService } from 'mdo-ui-library';
import { RoleService } from '../../../../_services/role/role.service';

@Component({
  selector: 'pros-roles-permissions',
  templateUrl: './roles-permissions.component.html',
  styleUrls: ['./roles-permissions.component.scss']
})
export class RolesPermissionsComponent implements OnInit {

  pageNumber = 0;
  pageSize = 10;
  roleIds: string[] = [];
  tenantId = 0;
  selectedRole;
  selectedRoleData;
  totalCount;
  recordsPageIndex = 1;
  currentPageIndex = 1;
  rolesDataFetching;
  sort: MatSort;
  pageInfo;

  displayedColumns: string[] = ['star', 'roleName', 'dateCreated' , 'dateModified', 'totalUsers'];

  dataSource: any;
  rolesData: any[] = [
    /* {roleName: 'UOM Validation', dateCreated: '30.12.2021', dateModified: '23.10.2020', totalUsers: 0},
    {roleName: 'Material type check', dateCreated: '30.12.2021', dateModified: '23.10.2020', totalUsers: 0},
    {roleName: 'Interface 109', dateCreated: '30.12.2021', dateModified: '23.10.2020', totalUsers: 0},
    {roleName: 'Role missing', dateCreated: '30.12.2021', dateModified: '23.10.2020', totalUsers: 0},
    {roleName: 'Metadata role', dateCreated: '30.12.2021', dateModified: '23.10.2020', totalUsers: 0},
    {roleName: 'Type check', dateCreated: '30.12.2021', dateModified: '23.10.2020', totalUsers: 0}, */
  ];

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }

  constructor(
    private router: Router,
    private roleService: RoleService,
    private transientService: TransientService) { }

  ngOnInit(): void {
    this.checkRolesListValueChanges();
    // this.getRoles();
  }

  getAllRoles() {
    this.rolesDataFetching = true;
    this.roleService.getUserCountByRoles({}).subscribe((data: RolesDescription) => {
      if(data?.roleDescription?.length) {
        this.totalCount = data.roleDescription.length;
        this.getRoles();
      } else {
        this.rolesDataFetching = false;
      }
    },(error: HttpErrorResponse) => {
      this.rolesDataFetching = false;
      console.error(error);
    })
  }

  getRoles() {
    this.roleIds = [];
    this.rolesData = [];

    const postData: GetRolesPost = {
      pageNumer: this.recordsPageIndex - 1,
      pageSize: this.pageSize
    }

    this.rolesDataFetching = true;
    this.roleService.getUserCountByRoles(postData).subscribe((data: RolesDescription) => {
      if(data && data.roleDescription) {
        data.roleDescription.forEach(role => {
          const roleData = {
            roleId: role.roleId,
            roleName: role.roleName,
            dateCreated: role.dateCreated,
            dateModified: role.dateModified,
            totalUsers: 0
          }
          this.roleIds.push(role.roleId);
          this.rolesData.push(roleData);
        });
        this.getUserCountPerRole();
      } else {
        this.rolesDataFetching = false;
      }
    }, (error: HttpErrorResponse) => {
      this.rolesDataFetching = false;
      console.error(error);
    })
  }

  getUserCountPerRole()
  {
    this.roleService.getUserCountPerRole(this.roleIds, this.tenantId).subscribe((roleData: RoleUsersCount[]) => {
      this.rolesDataFetching = false;

      if(roleData) {
        roleData.forEach(role => {
          this.rolesData.forEach(id => {
            const indx = this.getRoleDataIndex(role.roleId);
            if(indx !== -1) {
              this.rolesData[indx].totalUsers = role.countOfUsers;
            }
          })
        });

        this.dataSource = new MatTableDataSource<any>(this.rolesData);
      }
    }, (err: HttpErrorResponse) => {
      console.error(err);
      this.rolesDataFetching = false;
    })
  }

  /**
   * Check for value changes
   */
  checkRolesListValueChanges() {
    this.roleService.rolesList$.subscribe(() => {
      this.getAllRoles();
    })
  }

  /**
   * Find index for mapping total users count for each role
   */
  getRoleDataIndex(id: string): number {
    let index = -1;
    this.rolesData.find((role, i) => {
      if(role.roleId === id){
        index = i;
        return i;
      }
    });
    return index;
  }

  setSelectedRole(i: number) {
    this.selectedRole = this.roleIds[i];
    this.selectedRoleData = this.rolesData[i];
  }

  /**
   * Get records page wise
   */
  onPageChange(event: PageEvent) {
    if (event.pageIndex > event.length) {
      event.pageIndex = event.length;
    }
    else if (event.pageIndex < 0) {
      event.pageIndex = 1;
    }
    if (this.recordsPageIndex !== event.pageIndex) {
      this.recordsPageIndex = event.pageIndex;
      this.pageNumber = event.previousPageIndex;
      this.currentPageIndex = (this.pageNumber * 10) + 1;
      this.getRoles();
    }
  }

  openTableViewSettings(route: string) {

    if(route === 'new-role') {
      this.router.navigate([{ outlets: { sb: `sb/settings/roles-permissions`, outer: `outer/roles-permissions/new-role` } }], { queryParamsHandling: 'preserve' });
    }
    else if(route === 'edit-role') {
      this.router.navigate([{ outlets: { sb: `sb/settings/roles-permissions`, outer: `outer/roles-permissions/edit-role/${this.selectedRole}` } }], { queryParamsHandling: 'preserve' });
    }
  }

  gotoEditPage(element) {
    this.router.navigate([{ outlets: { sb: `sb/settings/roles-permissions`, outer: `outer/roles-permissions/edit-role/${element.roleId}` } }], { queryParamsHandling: 'preserve' });
  }

  gotoUsers(element) {
    this.router.navigate([{ outlets: { sb: `sb/settings/roles-permissions`, outer: `outer/roles-permissions/${element.roleId}/users` } }], { queryParamsHandling: 'preserve' });
  }

  deleteRole() {
    const msg = `Deleting this role will permanently delete all its users. Please confirm if you want to delete ${this.selectedRoleData.roleName}`;

    this.transientService.confirm({
      data: { dialogTitle: 'Alert', label: msg },
      disableClose: true,
      autoFocus: false,
      width: '600px',
      panelClass: 'create-master-panel',
    },
    (response) => {
      if (response === 'yes') {
          this.roleService.deleteRole(this.selectedRole).subscribe((data: RolesResponse) => {
            this.roleService.nextUpdateRoleList(data);
            console.log(data);
          })
      }
    });
  }

  setDataSourceAttributes() {
    if(this.dataSource) {
      this.dataSource.sort = this.sort;
    }
  }

  get displayedRecordsRange(): string {
    const endRecord =
      this.recordsPageIndex * this.pageSize < this.totalCount ? this.recordsPageIndex * this.pageSize : this.totalCount;
    return this.totalCount ? `${(this.recordsPageIndex - 1) * this.pageSize + 1} to ${endRecord} of ${this.totalCount}` : '';
  }

}