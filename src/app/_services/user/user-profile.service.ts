import { InviteTeamMember, RoleRequestDto, TeamActionResponse, TeamMemberResponse, TeamRoleResponse, UserInfoListResponse, UserListRequestDTO } from '@models/teams';
import { TagsResponse, TagActionResponse, Tag, MergeTagDTO, UserImportLogsResponse, UserImportLogs } from '@models/userdetails';
import { RolePrivilegeDataRestriction, RolePrivilegeDataRestrictionFilters, RolePrivilegeDto, RolePrivilegeRespose } from '@models/role-privileges.model';
import { EndpointsProfileService } from './../_endpoints/endpoints-profile.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FilterCriteria } from '@models/list-page/listpage';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  rolePrivilegeDataRestriction: BehaviorSubject<RolePrivilegeDataRestriction> = new BehaviorSubject<RolePrivilegeDataRestriction>(null);
  rolePrivilegeDataRestriction$ = this.rolePrivilegeDataRestriction.asObservable();

  rolePrivilegeDataRestrictionFilters: BehaviorSubject<RolePrivilegeDataRestrictionFilters> = new BehaviorSubject<RolePrivilegeDataRestrictionFilters>(null);
  rolePrivilegeDataRestrictionFilters$ = this.rolePrivilegeDataRestrictionFilters.asObservable();
  constructor(private http: HttpClient, private profileEndpointService: EndpointsProfileService) {}

  public getAllTags(page: number, size: number) {
    return this.http.get<TagsResponse>(`${this.profileEndpointService.getAllTags()}?page=${page}&size=${size}`);
  }
  public searchTags(page: number, size: number, searchString: string) {
    return this.http.get<TagsResponse>(`${this.profileEndpointService.searchTags()}?page=${page}&size=${size}&searchString=${searchString}`);
  }
  public deleteByTagId(tagIds: string[]) {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: tagIds,
    };
    return this.http.delete<TagActionResponse>(this.profileEndpointService.deleteByTagId(), options);
  }
  public saveUpdateTag(tag: Tag) {
    return this.http.post<TagActionResponse>(this.profileEndpointService.saveUpdateTag(), tag);
  }
  public mergeTags(mergeTagDto: MergeTagDTO) {
    return this.http.post<TagActionResponse>(this.profileEndpointService.mergeTags(), mergeTagDto);
  }
  public getUserInfoList(dto: RoleRequestDto) {
    return this.http.post<UserInfoListResponse>(this.profileEndpointService.getUserInfoListUrl(), dto);
  }

  public getTeamMembers(userListRequestDTO: UserListRequestDTO): Observable<TeamMemberResponse> {
    return this.http.post<TeamMemberResponse>(`${this.profileEndpointService.getTeamMembers()}`, userListRequestDTO);
  }

  public getTeamRoles(requestDto: RoleRequestDto): Observable<TeamRoleResponse> {
    return this.http.post<TeamRoleResponse>(`${this.profileEndpointService.getTeamRoles()}`, requestDto);
  }


  public inviteTeamMembers(invitePayload: InviteTeamMember[], orgId: string, invitePartner = false) {
    return this.http.post<TeamActionResponse>(`${this.profileEndpointService.inviteTeamMembers()}`, invitePayload, { params: { orgId, invitePartner } });
  }

  public validateUser(): Observable<any> {
    return this.http.get<any>(this.profileEndpointService.validateUser());
  }

  public changeUserStatus(userId: string, updateType): Observable<any> {
    return this.http.get<any>(this.profileEndpointService.changeUserStatus(), {
      params: { userId, updateType },
    });
  }

  public deleteTeamMembers(emails: string[]) {
    return this.http.post<TeamActionResponse>(`${this.profileEndpointService.deleteTeamMembersUrl()}`, emails);
  }

  public revokeInvitations(tenantId: string,userId:string) {
    return this.http.get<TeamActionResponse>(`${this.profileEndpointService.revokeInvitationsUrl(tenantId,userId)}`);
  }

  public resendInvitations(email: string, orgId: any, roles: string[]) {
    let obj = {email,roles};
    return this.http.post<TeamActionResponse>(`${this.profileEndpointService.resendInvitationsUrl(orgId)}`, obj);
  }

  public activateMembers(emails: string[]) {
    return this.http.post<TeamActionResponse>(`${this.profileEndpointService.activateMembersUrl()}`, emails);
  }
  public updateStatusMembersUrl(emails: string[], updateAll: boolean, updateType: string, tenantId: string,) {
    return this.http.post<TeamActionResponse>(`${this.profileEndpointService.updateStatusMembersUrl(updateAll, updateType, tenantId)}`, emails);
  }

  public inactivateMembers(emails: string[]) {
    return this.http.post<TeamActionResponse>(`${this.profileEndpointService.inactivateMembersUrl()}`, emails);
  }

  public getSaveUpdateImportLogs(reqBody: any) {
    return this.http.post<any>(`${this.profileEndpointService.getSaveUpdateImportLogsUrl()}`, reqBody);
  }

  public saveUpdateImportLogs(payload: UserImportLogs) {
    return this.http.post<UserImportLogsResponse>(`${this.profileEndpointService.saveUpdateImportLogsUrl()}`, payload);
  }


  /**
   * Update the user last loged out time ...
   * @returns will return the Observable after http subscribe ...
   */
  public updateLastActiveDate(): Observable<any> {
    return this.http.post(this.profileEndpointService.updateLastActiveDate(),null);
  }

  public getAllPrivileges() {
    return this.http.get<RolePrivilegeRespose>(this.profileEndpointService.getAllPrivileges());
  }
  public saveUpdateRole(dto: RolePrivilegeDto) {
    return this.http.post<any>(this.profileEndpointService.saveUpdateRole(), dto);
  }
  getRoleDetails(id: string) {
    return this.http.get(this.profileEndpointService.getRoleDetails(id));
  }
  deleteRole(id: string) {
      return this.http.delete(this.profileEndpointService.deleteRole(id));
  }
  getUserPrivileges() {
    return this.http.get<any>(this.profileEndpointService.getUserPrivilege());
  }

  nextRolePrivilegeDataRestriction(data: RolePrivilegeDataRestriction) {
    this.rolePrivilegeDataRestriction.next(data);
  }
  nextRolePrivilegeDataRestrictionFilters(data: RolePrivilegeDataRestrictionFilters) {
    this.rolePrivilegeDataRestrictionFilters.next(data);
  }
}
