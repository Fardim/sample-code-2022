import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EndpointsAuthService {
  constructor() { }

  apiUrl = environment.authUrl + '/auth';

  /**
   * Get uri for validate refresh jwt
   */
  public validateRefreshjwttokenUrl(): string {
    return `${this.apiUrl}/validate-refresh-token`;
  }

  public getOrgInfoByOrgId(orgID: string): string {
    return `${this.apiUrl}/get-org-info-by-orgId?orgId=${orgID}`;
  }

  public saveOrgDetails(): string {
    return `${this.apiUrl}/save-org-details`;
  }

  public updateOrgDetails(): string {
    return `${this.apiUrl}/update-org-details`;
  }

  public signIn(): string {
    return `${this.apiUrl}/signin`;
  }

  public getUserDetailsUrl(userName: string): string {
    return `${this.apiUrl}/user/detail/${userName}`;
  }

  public jwtRefresh(): string {
    return this.apiUrl + '/refresh';
  }

  public updatePassword(): string {
    return `${this.apiUrl}/user/update-password`;
  }

  public policyAdd(): string {
    return `${this.apiUrl}/password/policyAdd`;
  }

  public getPasswordPolicy(): string {
    return `${this.apiUrl}/password/getPasswordPolicy`;
  }

  public inviteUserUpdatePassword(): string {
    return `${this.apiUrl}/save-user-info`;
  }

  public getTeamAllStatus(): string {
    return `${this.apiUrl}/status-list`;
  }

  /**
   * Returns `[[API-DOMAIN]]/profile/get-user-count-for-roles` endpoint
   */
  public getUserCountForRoles(): string {
    return `${this.apiUrl}/get-user-count-for-roles`;
  }

  public inviteSaveUser(): string {
    return `${this.apiUrl}/user/invite`
  }

  public saveUserRoles(): string {
    return `${this.apiUrl}/save-User-Roles`;
  }

  /**
   * Get the url for update the user status in auth MS
   */
  public updateStatus(): string {
    return `${this.apiUrl}/update-User-Status`;
  }

  public getLocations(): string {
    return `${this.apiUrl}/admin/app/region/list`;
  }

  public saveTenant(): string {
    return `${this.apiUrl}/tenant/saveTenant`
  }

  public getTenantList(orgId): string {
    return `${this.apiUrl}/tenant/getTenantsByOrgId/${orgId}`
  }

  public getLicenseValidateInfo(orgId) {
    return `${this.apiUrl}/licence-validate?orgId=${orgId}`;
  }

  public getLicenseInfo(orgId) {
    return `${this.apiUrl}/licence-info?orgId=${orgId}`;
  }
}
