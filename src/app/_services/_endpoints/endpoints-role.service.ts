import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EndpointsRoleService {
    apiurl = environment.apiurl + '/profile';
    auth = environment.authUrl + '/auth';

  constructor() {}

  public getUserCountByRolesUrl() {
    return this.apiurl + '/get-user-count-by-role';
  }

  public getTenentRolesUrl(lang: string): string {
    return environment.apiurl + `/profile/roles-list?lang=${lang}`;
  }

  public getUserCountPerRole(id: number) {
    return this.auth + `/get-user-count-for-roles?tenantId=${id}`;
  }

  public getRoleDetails(id: string) {
    return this.apiurl + `/get-role-info?roleId=${id}`;
  }

  public saveRole() {
    return this.apiurl + `/save-update-role`;
  }

  public deleteRole(id: string) {
    return this.apiurl + `/delete-role/${id}`
  }
}