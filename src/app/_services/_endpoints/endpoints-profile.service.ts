import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EndpointsProfileService {
  /**
   * Base Endoint [[API-DOMAIN]]/profile
   */
  private apiUrl = environment.apiurl + '/profile';

  constructor() { }

  /**
   * Returns `[[API-DOMAIN]]/profile/get-personal-details` endpoint
   */
  public getPersonalDetails(): string {
    return `${this.apiUrl}/get-personal-details`;
  }
  /**
   * Returns `[[API-DOMAIN]]/profile/save-personal-details` endpoint
   */
  public updatePersonalDetails(): string {
    return `${this.apiUrl}/save-personal-details`;
  }
  /**
   * Returns `[[API-DOMAIN]]/profile/get-user-pref` endpoint
   */
  public getUserPreferenceDetails(): string {
    return `${this.apiUrl}/get-user-pref`;
  }

  /**
   * Returns `[[API-DOMAIN]]/profile/save-user-pref` endpoint
   */
  public updateUserPreferenceDetails(): string {
    return `${this.apiUrl}/save-user-pref`;
  }
  /**
   * Returns `[[API-DOMAIN]]/profile/get-all-languages` endpoint
   */
  public getAllLanguagesList(): string {
    return `${this.apiUrl}/get-all-languages`;
  }
  /**
   * Returns `[[API-DOMAIN]]/profile/get-date-format` endpoint
   */
  public getDateFormatList(): string {
    return `${this.apiUrl}/get-date-format`;
  }
  /**
   * Returns `[[API-DOMAIN]]/profile/get-number-format` endpoint
   */
  public getNumberFormatList(): string {
    return `${this.apiUrl}/get-number-format`;
  }
  /**
   * Returns `[[API-DOMAIN]]/profile/save-all-tags` endpoint
   */
  public getAllTags(): string {
    return `${this.apiUrl}/get-all-tags`;
  }
  /**
   * Returns `[[API-DOMAIN]]/profile/search-tags` endpoint
   */
  public searchTags() {
    return `${this.apiUrl}/search-tags`;
  }
  /**
   * Returns `[[API-DOMAIN]]/profile/delete-by-tag-id` endpoint
   */
  public deleteByTagId(): string {
    return `${this.apiUrl}/delete-by-tag-id`;
  }
  /**
   * Returns `[[API-DOMAIN]]/profile/save-update-tag` endpoint
   */
  public saveUpdateTag(): string {
    return `${this.apiUrl}/save-update-tag`;
  }
  /**
   * Returns `[[API-DOMAIN]]/profile/merge-tags` endpoint
   */
  public mergeTags(): string {
    return `${this.apiUrl}/merge-tags`;
  }
  /**
   * Returns `[[API-DOMAIN]]/profile/validate-edit-permission` endpoint
   */
  public validateUser(): string {
    return `${this.apiUrl}/validate-edit-permission`;
  }
  /**
   * Returns `[[API-DOMAIN]]/profile/roles-list` endpoint
   */
  public getTeamRoles(): string {
    return `${this.apiUrl}/roles-list`;
  }
  /**
   * Returns `[[API-DOMAIN]]/profile/users-list` endpoint
   */
  public getTeamMembers(): string {
    return `${this.apiUrl}/users-list`;
  }
  /**
   * Returns `[[API-DOMAIN]]/profile/invite` endpoint
   */
  public inviteMembers(): string {
    return `${this.apiUrl}/invite`;
  }
  /**
   * Returns `[[API-DOMAIN]]/profile/updateStatus` endpoint
   */
  public changeUserStatus(): string {
    return `${this.apiUrl}/updateStatus`;
  }
  /**
   * Returns `[[API-DOMAIN]]/profile/verify` endpoint
   */
  public validateURL(): string {
    return `${this.apiUrl}/verify`;
  }
  /**
   * Returns `[[API-DOMAIN]]/profile/user-info-list` endpoint
   */
  public getUserInfoListUrl(): string {
    return `${this.apiUrl}/user-info-list`;
  }
  /**
   * Returns `[[API-DOMAIN]]/profile/get-user-count-by-role` endpoint
   */
  public getRoles(): string {
    return `${this.apiUrl}/get-user-count-by-role`;
  }

  public inviteTeamMembers(): string {
    return `${this.apiUrl}/invite`;
  }

  public deleteTeamMembersUrl(): string {
    return `${this.apiUrl}/delete-team-members`;
  }

  public revokeInvitationsUrl(tenantId: string,userId:string): string {
    return `${this.apiUrl}/revoke?tenantId=${tenantId}&userId=${userId}`;
  }

  public resendInvitationsUrl(orgId: any): string {
    return `${this.apiUrl}/resend-invitations?orgId=${orgId}`;
  }

  public activateMembersUrl(): string {
    return `${this.apiUrl}/activate-members`;
  }

  public updateStatusMembersUrl(updateAll: boolean,updateType: string, tenantId: string): string {
    return `${environment.apiurl}/profile/updateStatus?updateAll=${updateAll}&updateType=${updateType}&tenantId=${tenantId}`;
  }

  public inactivateMembersUrl(): string {
    return `${this.apiUrl}/inactivate-members`;
  }

  public getSaveUpdateImportLogsUrl(): string {
    return `${this.apiUrl}/user-import-logs/find-all`;
  }

  public saveUpdateImportLogsUrl(): string {
    return `${this.apiUrl}/user-import-logs/save-update`;
  }

  public assignUserRolesUrl(){
    return `${this.apiUrl}/assign-user-roles`;
  }

  /**
   * URI to udate last user active date
   * @returns will return the uri for udate last active date
   */
  public updateLastActiveDate(): string {
    return `${this.apiUrl}/update-activeDate`;
  }

  public continueRegistrationAPI(apiUrl, roleId): string {
    return `${apiUrl}/profile/continue-registration/V2?roleId=${roleId}`
  }

  public getAllPrivileges() {
    return `${this.apiUrl}/get-all-privileges`;
  }

  public saveUpdateRole() {
    return `${this.apiUrl}/save-update-role`;
  }

  public getRoleDetails(id: string) {
    return this.apiUrl + `/get-role-info?roleId=${id}`;
  }

  public deleteRole(id: string) {
    return this.apiUrl + `/delete-role/${id}`;
  }

  public getUserPrivilege() {
    return this.apiUrl + `/get-priviliges`;
  }
}
