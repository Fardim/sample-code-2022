import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { LocationContent, LocationListResponse, tenantList, Userdetails } from '@models/userdetails';
import { OrganizationManagementService } from '@services/organization-management.service';
import { UserService } from '@services/user/userservice.service';
import { TransientService } from 'mdo-ui-library';
import { finalize, take } from 'rxjs/operators';

/**
 * Define an interface for the dataSource element
 */
 export interface TableElement {
  action: string;
  name: string;
  location: any;
  type: string;
  status: string;
  tenant_state: string;
  master_tenant: boolean;
}

/**
 * Prepare a dataSource for the table
 */
let ELEMENT_DATA: TableElement[] = [];


@Component({
  selector: 'pros-tenant-list',
  templateUrl: './tenant-list.component.html',
  styleUrls: ['./tenant-list.component.scss']
})
export class TenantListComponent implements OnInit {

   /**
   * Define columns to be displayed in the table
   */
    displayedColumns: string[] = ['action', 'name', 'location', 'type', 'status', 'tenant_state', 'master_tenant'];

    /**
     * Hold the data to be shown in the table
     */
    dataSource = new MatTableDataSource<TableElement>(ELEMENT_DATA);

    orgId: string;

    filteredLocationList: LocationContent[] = [];

    filteredTypeList = [
      {label: 'Dev', value: 'DEV'},
      {label: 'QA', value: 'QA'},
      {label: 'Production', value: 'PROD'}
    ]

    showSkeleton = false;

    @Output() openNewTenantForm: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor(
      private organizationManagementService: OrganizationManagementService,
      private userService: UserService,
      private transientService: TransientService
    ) { }

    /**
     * Angular hook
     */
    ngOnInit(): void {
      this.getUserDetails();
      this.organizationManagementService.refreshTenantList(true);
      this.refreshTenantList();
    }

    refreshTenantList() {
      this.organizationManagementService.refreshTenantListSubject$.subscribe(res => {
        if (res) {
          ELEMENT_DATA = [];
          this.dataSource = new MatTableDataSource<any>([]);
          this.getTenantList();
          this.organizationManagementService.refreshTenantList(false);
        }
      })
    }

    getUserDetails() {
      this.showSkeleton = true;
      this.userService.getUserDetails()
      .pipe(
        take(1),
        finalize(() => this.getLocationList())
      )
      .subscribe((response: Userdetails) => {
        if (response) {
          this.showSkeleton = false;
          this.orgId = response.orgId;
        }
      },error => {
        this.transientService.open('Something went wrong!', null, { duration: 1000, verticalPosition: 'bottom' });
      });
    }

    getLocationList() {
      this.organizationManagementService.getLocationList()
      .pipe(
        finalize(() => this.getTenantList())
      ).subscribe((res: LocationListResponse) => {
        if (res?.content?.length) {
          this.filteredLocationList = res.content;
        }
      },error => {
        this.transientService.open('Something went wrong!', null, { duration: 1000, verticalPosition: 'bottom' });
      })
    }

    getTenantList() {
      this.organizationManagementService.getTenantList(this.orgId)
      .pipe(
        finalize(() => this.showSkeleton = false)
      )
      .subscribe((tenantList: tenantList[]) => {
        if (tenantList.length) {
          tenantList.forEach(tenant => {
            const tenantInfo = {
              action: '',
              name: tenant.tenantName || '',
              location: this.filteredLocationList.find(location => location?.regionId === tenant?.tenantRegionId),
              type: this.filteredTypeList.find(type => type.value === tenant.type)?.label || '',
              status: 'active',
              tenant_state: 'active',
              master_tenant: tenant.master
            }

            ELEMENT_DATA.push(tenantInfo);
          });
          this.dataSource = new MatTableDataSource<any>(ELEMENT_DATA);
        }
      }, error => {
        this.transientService.open('Something went wrong!', null, { duration: 1000, verticalPosition: 'bottom' });
      })
    }

    createNewTenant() {
      this.openNewTenantForm.emit(true);
    }
}
