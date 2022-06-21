import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from '../shared/_components/page-not-found/page-not-found.component';
import { RolesPermissionsComponent } from '../settings/_components/roles-permissions/roles-permissions.component';
import { NewRoleComponent } from '../settings/_components/roles-permissions/new-role/new-role.component';
import { EditRoleComponent } from '../settings/_components/roles-permissions/edit-role/edit-role.component';
import { RolePrivilegeComponent } from './_components/roles-permissions/role-privilege/role-privilege.component';
import { DataRestrictionComponent } from './_components/roles-permissions/data-restriction/data-restriction.component';
import { ListFilterComponent } from '@modules/list/_components/list-filter/list-filter.component';
import { RoleUsersComponent } from './_components/roles-permissions/role-users/role-users.component';

const routes: Routes = [
  { path: '', component: RolesPermissionsComponent },
  { path: 'new-role', component: NewRoleComponent },
  { path: 'edit-role', component: EditRoleComponent },
  { path: ':roleId/users', component: RoleUsersComponent },
  { path: ':roleId/data-restriction/:privilegeId', component: DataRestrictionComponent },
  { path: ':roleId/data-restriction/:privilegeId/filter-settings/:moduleId', component: ListFilterComponent },
  { path: '**', component: PageNotFoundComponent }
]
@NgModule({
  declarations: [NewRoleComponent, EditRoleComponent, RolePrivilegeComponent, DataRestrictionComponent, RoleUsersComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule
  ]
})
export class RoleModule { }