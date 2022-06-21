import { Component, OnInit } from '@angular/core';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { Utilities } from '@models/schema/utilities';
import { LocationContent, LocationListResponse, saveTenantResponse, tenantDetails, Userdetails } from '@models/userdetails';
import { OrganizationManagementService } from '@services/organization-management.service';
import { UserService } from '@services/user/userservice.service';
import { TransientService } from 'mdo-ui-library';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'pros-tenant',
  templateUrl: './tenant.component.html',
  styleUrls: ['./tenant.component.scss']
})
export class TenantComponent implements OnInit {

  filteredTypeList = [
    {label: 'Dev', value: 'DEV'},
    {label: 'QA', value: 'QA'},
    {label: 'Production', value: 'PROD'}
  ]
  filteredLocationList: LocationContent[] = [];
  tenantInfo = new tenantDetails();
  submitted = false;
  bannerErrorMsg = '';

  constructor(
    private router: Router,
    private organizationManagementService: OrganizationManagementService,
    private userService: UserService,
    private transientService: TransientService,
    private utilities: Utilities
  ) { }

  ngOnInit(): void {
    this.getLocationList();
    this.getUserDetails();
  }

  getUserDetails() {
    this.userService.getUserDetails().subscribe((response: Userdetails) => {
      if (response) {
        this.tenantInfo.orgId = response.orgId;
        this.tenantInfo.roleId = response.currentRoleId;
      }
    },error => {
      this.transientService.open('Something went wrong!', null, { duration: 1000, verticalPosition: 'bottom' });
    });
  }

  getLocationList() {
    this.organizationManagementService.getLocationList().subscribe((res: LocationListResponse) => {
      if (res?.content?.length) {
        this.filteredLocationList = res.content;
      }
    },error => {
      this.transientService.open('Something went wrong!', null, { duration: 1000, verticalPosition: 'bottom' });
    })
  }

    /**
   * sets dropdown current state
   * @param el mat auto complete element
   * @returns icon name
   */
     getDropdownPos(el: MatAutocomplete) {
      let pos = 'chevron-down';
      try {
        if (el && el.isOpen) {
          pos = 'chevron-up';
        }
      } catch (e) {
        console.log(e);
      }

      return pos;
    }

  displayWith(option: LocationContent) {
    return option?.regionDesc || ''
  }

  displayWithLocation(option) {
    return option?.label || ''
  }

  locationValueSelected($event) {
    this.tenantInfo.location = $event?.option?.value || '';
  }

  TypeValueSelected($event) {
    this.tenantInfo.type = $event?.option?.value || '';
  }

  saveNewTenant() {
    this.submitted = true;
    if (!this.tenantInfo?.tenantName || !this.tenantInfo?.location?.regionId) {
      this.bannerErrorMsg = 'Please fill required Fields';
    } else {
      const payload = {
        tenantName: this.tenantInfo.tenantName,
        orgId: this.tenantInfo.orgId,
        roleId: this.utilities.generateFieldId(15),
        type: 'DEV',
        tenantRegionId: this.tenantInfo.location.regionId
      }
      this.organizationManagementService.saveNewTenant(payload)
      .pipe(
        finalize(() => {
          this.submitted = false;
          this.organizationManagementService.refreshTenantList(true);
        }),
      )
      .subscribe((res: saveTenantResponse | any) => {
        if (res?.id) {
          this.bannerErrorMsg = '';
          const registrationPayload = {
            forNewTenant: true,
            newTenantId: res?.id
          }
          this.organizationManagementService.continueRegistrationAPI(res.redirectURI,registrationPayload, payload.roleId).subscribe(res => {
            this.transientService.open('Successfully saved!', null, { duration: 2000, verticalPosition: 'bottom' });
            this.close();
          }, error => {
            console.log('Error:',error);
            this.bannerErrorMsg = 'Something went wrong!';
          })
        }
      }, error => {
        console.log('Error:',error);
        this.bannerErrorMsg = 'Something went wrong!';
      })
    }
  }

  close() {
    this.router.navigate([{ outlets: { outer: null } }], { queryParamsHandling: 'preserve' });
  }
}
