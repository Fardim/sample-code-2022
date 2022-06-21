import { RolePrivilegeDto } from '@models/role-privileges.model';
import { PrivilegeList } from './../../../../../_models/role-privileges.model';
import { take } from 'rxjs/operators';
import { Component, Inject, LOCALE_ID, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RolesDetail, RolesResponse } from '@models/roles';
import { RoleService } from '@services/role/role.service';
import { UserProfileService } from '@services/user/user-profile.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'pros-new-role',
  templateUrl: './new-role.component.html',
  styleUrls: ['./new-role.component.scss']
})
export class NewRoleComponent implements OnInit, OnDestroy {

  roleForm: FormGroup;
  roleSaving;
  roleId = '0';
  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();
  updatedPrivilegeList: PrivilegeList[] = [];

  constructor(private router: Router, private route: ActivatedRoute, private roleService: RoleService, private profileService: UserProfileService, @Inject(LOCALE_ID) public locale: string) {
    this.roleForm = new FormGroup(
      {roleName: new FormControl('', [Validators.required, Validators.maxLength(40)]),
    details: new FormControl('')});
  }

  ngOnInit(): void {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
  }

  // Check Form for errors
  checkForm() {
    if (this.roleForm.invalid) {
      Object.values(this.roleForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsTouched();
        }
      });
      return false;
    }
    else {
      this.submitNewRole();
    }
  }

  submitNewRole()
  {
    const roleData: RolePrivilegeDto = {
      roleDescription: [{
        description: this.roleForm.controls.roleName.value,
        lang: this.locale,
        details: this.roleForm.controls.details.value
      }],
      privilegeList: this.updatedPrivilegeList
    };

    this.roleSaving = true;
    this.profileService.saveUpdateRole(roleData).subscribe((response: RolesResponse) => {
      this.roleSaving = false;
      console.log(response);
      this.roleService.nextUpdateRoleList(response);
      this.close();
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
    this.unsubscribeAll$.complete();
  }
}
