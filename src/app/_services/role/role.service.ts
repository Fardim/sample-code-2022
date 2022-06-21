import { EndpointsRoleService } from './../_endpoints/endpoints-role.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GetRolesPost, RolesDetail, RolesResponse } from '@models/roles';

export interface RolesListrequest {
    pageInfo?: {
      pageNumer: number
      pageSize: number
    },
    searchString: string
  }
@Injectable({
  providedIn: 'root'
})
export class RoleService {
    rolesList: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    rolesList$ = this.rolesList.asObservable();

    constructor(private http: HttpClient, private endpointsRoleService: EndpointsRoleService) { }

    getUserCountByRoles(postData: GetRolesPost) {
        return this.http.post(this.endpointsRoleService.getUserCountByRolesUrl(), postData);
    }

    getTenentRoles(lang: string, dto: RolesListrequest) {
        return this.http.post(this.endpointsRoleService.getTenentRolesUrl(lang), dto)
    }

    getUserCountPerRole(roleIds: string[], tenantId: number){
        return this.http.post(this.endpointsRoleService.getUserCountPerRole(tenantId), roleIds);
    }

    getRoleDetails(id: string) {
        return this.http.get(this.endpointsRoleService.getRoleDetails(id));
    }

    saveRole(roleData: RolesDetail) {
        return this.http.post(this.endpointsRoleService.saveRole(), roleData);
    }

    deleteRole(id: string) {
        return this.http.delete(this.endpointsRoleService.deleteRole(id));
    }

    nextUpdateRoleList(roleData: RolesResponse) {
        this.rolesList.next(roleData);
    }
}