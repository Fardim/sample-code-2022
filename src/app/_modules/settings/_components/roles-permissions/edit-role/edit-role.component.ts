import { UserProfileService } from '@services/user/user-profile.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from '@services/role/role.service';
import { RolesDetail, RolesResponse } from '@models/roles';
import { Subject } from 'rxjs';
import { RolePrivilegeDto, PrivilegeList } from '@models/role-privileges.model';

@Component({
  selector: 'pros-edit-role',
  templateUrl: './edit-role.component.html',
  styleUrls: ['./edit-role.component.scss']
})
export class EditRoleComponent implements OnInit, OnDestroy {

  roleForm: FormGroup;
  roleId: string;
  roleData: RolePrivilegeDto = null;
  roleDetailsFetching;
  roleUpdating;
  updatedPrivilegeList: PrivilegeList[] = [];
  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();

  constructor(private router: Router, private roleService: RoleService, private route: ActivatedRoute, private profileService: UserProfileService)
  {
    this.roleForm = new FormGroup(
      {roleName: new FormControl('', [Validators.required, Validators.maxLength(40)]),
    details: new FormControl('')});

    this.route.params.subscribe((params) => {
      if (params?.roleId) {
        this.roleId = params.roleId;
      }
    });
  }

  ngOnInit(): void {
    this.getRoleDetails();
  }

  /**
   *  Check Form for errors
   */
  submitForm() {
    if (this.roleForm.invalid) {
      Object.values(this.roleForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsTouched();
        }
      });
      return false;
    }
    else {
      this.roleData.roleDescription[0].description = this.roleForm.controls.roleName.value;
      this.roleData.roleDescription[0].details = this.roleForm.controls.details.value;
      this.roleData.privilegeList = this.updatedPrivilegeList;
      this.roleUpdating = true;
      this.profileService.saveUpdateRole(this.roleData).subscribe((response: RolesResponse) => {
        this.roleUpdating = false;
        this.roleService.nextUpdateRoleList(response);
        this.close();
      });
    }
  }

  getRoleDetails() {
    this.roleDetailsFetching = true;
    this.roleService.getRoleDetails(this.roleId).subscribe((response: RolePrivilegeDto) => {
      console.log(response);
      this.roleDetailsFetching = false;
      this.roleData = response;
      this.updatedPrivilegeList = response.privilegeList;
      this.roleForm.patchValue({roleName: response.roleDescription[0].description, details: response.roleDescription[0].details});
    }, err => {
      console.error(err);
      this.roleDetailsFetching = false;
    });
  }

  updatedPrivilege(event: PrivilegeList[]) {
    this.updatedPrivilegeList = event;
    console.log('updatedPrivilegeList', this.updatedPrivilegeList);
  }

  /**
   * clear the behaviour subjects of role privileges and go to landing page
   */
  close() {
    this.profileService.nextRolePrivilegeDataRestriction(null);
    this.profileService.nextRolePrivilegeDataRestrictionFilters(null);
    this.router.navigate([{ outlets: { outer: null } }], { queryParamsHandling: 'preserve' });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
  }
}
