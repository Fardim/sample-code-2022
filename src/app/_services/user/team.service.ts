import { EndpointsAuthService } from '@services/_endpoints/endpoints-auth.service';
import { Observable } from 'rxjs';
import {
  InviteTeamMember,
  TeamActionResponse,
  TeamRoleResponse,
  UserListRequestDTO,
  TeamMemberResponse,
  RoleRequestDto,
} from './../../_models/teams';
import { EndpointsTeamService } from './../_endpoints/endpoints-team.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EndpointsProfileService } from '@services/_endpoints/endpoints-profile.service';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  constructor(
    private http: HttpClient,
    private endpointsAuthService: EndpointsAuthService,
    private endpointsProfileService: EndpointsProfileService
  ) { }

  public getAllStatus(): Observable<string[]> {
    return this.http.get<string[]>(`${this.endpointsAuthService.getTeamAllStatus()}`);
  }



  public inviteSaveUser(payload) {
    return this.http.post<any>(`${this.endpointsAuthService.inviteSaveUser()}`, payload);
  }

  public saveUserRoles(payload) {
    return this.http.post<any>(`${this.endpointsAuthService.saveUserRoles()}`, payload);
  }

  public assignUserRoles(payload){
    return this.http.post<any>(`${this.endpointsProfileService.assignUserRolesUrl()}`,payload);
  }
}
