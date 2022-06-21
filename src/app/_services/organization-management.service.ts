import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OrganizationDetailsDTO } from '@models/organization-details.model';
import { UserCountByRoleID } from '@models/role-count-by-id.model';
import { RoleDescriptionDTO } from '@models/role-description.model';
import { Index, IndexNamesResponse } from '@models/schema-spaces.model';
import { LocationListResponse } from '@models/userdetails';
import { BehaviorSubject, Observable, zip } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Any2tsService } from './any2ts.service';
import { UserService } from './user/userservice.service';
import { EndpointsAuthService } from './_endpoints/endpoints-auth.service';
import { EndpointsCoreCrudService } from './_endpoints/endpoints-core-crud.service';
import { EndpointsProfileService } from './_endpoints/endpoints-profile.service';

@Injectable({ providedIn: 'root' })
export class OrganizationManagementService {
  constructor(
    private http: HttpClient,
    private profileEndpoints: EndpointsProfileService,
    private authEndpoints: EndpointsAuthService,
    private coreCrudEndpoints: EndpointsCoreCrudService,
    private userService: UserService,
    private any2ts: Any2tsService,
  ) { }

  refreshTenantListSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  refreshTenantListSubject$ = this.refreshTenantListSubject.asObservable();

  /**
   * Makes get call for organization details for current user OrganizationDetailsDTO model
   */
  getOrganizationDetails(): Observable<OrganizationDetailsDTO> {
    // Make http call to get organization attached to tenant
    return this.userService.getUserDetails().pipe(
      switchMap(userDetails => this.http.get<OrganizationDetailsDTO>(this.authEndpoints.getOrgInfoByOrgId(userDetails.orgId)))
    )
  }

  /**
   * Makes post call to update the organization details for the current user with debounce to prevent any rapid attempts of call
   */
  updateOrganizationDetails<R>(newDetails: OrganizationDetailsDTO): Observable<R | any> {
    return this.http.post<R | any>(this.authEndpoints.updateOrgDetails(), newDetails);
  }

  /**
   * Returns list of all roles for the tenant
   */
  getRoles(): Observable<RoleDescriptionDTO[]> {
    return (
      this.http
        .post<{ roleDescription: RoleDescriptionDTO[] }>(this.profileEndpoints.getRoles(), {})
        .pipe(map((response) => response.roleDescription))
    );
  }
  /**
   * Returns list of counts for role ids, optionally automatically calls getRoles() if no arguments are provided
   */
  getUserCountForRoles(roles?: number[]): Observable<UserCountByRoleID[]> {
    if (roles) return this.http.post<UserCountByRoleID[]>(this.authEndpoints.getUserCountForRoles(), roles);
    else
      return this.getRoles().pipe(
        map((roleDescription) => roleDescription.map((role) => role.roleId)),
        tap(console.log),
        // switch observable stream to POST request from mapped response to get count and return it as observable
        switchMap((roleIds) => this.http.post<UserCountByRoleID[]>(this.authEndpoints.getUserCountForRoles(), roleIds)),
        tap(console.log)
      );
  }
  /**
   * Automatically calls getUserCountForRoles() and return mapped observbale of count
   */
  getTotalUserCount(): Observable<number> {
    return this.getUserCountForRoles().pipe(
      map((roleCounts) => roleCounts.map((roleCount) => roleCount.countOfUsers).reduce((prev = 0, next) => prev + next))
    );
  }

  /**
   * Return list of roles with name and their respective count
   */
  getRoleNamesWithCount(): Observable<{ roleName: string; countOfUsers: number }[]> {
    return zip(this.getRoles(), this.getUserCountForRoles()).pipe(
      map(([rolesResponse, countResponse]) =>
        rolesResponse.map((role) => {
          return { roleName: role.roleName, countOfUsers: countResponse.find((count) => count.roleId === role.roleId)?.countOfUsers ?? 0 };
        })
      )
    );
  }

  /**
   * Gets a list of index
   * @param prefixToRemove(default:"es-") Selects what what prefix to remove
   */
  getSchemaSpaces(prefixToRemove: string = 'es-'): Observable<{ postgres: string; indices: Index[] }> {
    return this.http.get<IndexNamesResponse>(this.coreCrudEndpoints.getSchemaSpaces()).pipe(
      map((response: IndexNamesResponse): { postgres: string; indices: Index[] } => {
        return {
          postgres: response.postgres,
          indices: Object.keys(response)
            .filter((key) => key !== 'postgres')
            .map((indexName) => {
              const extractedData = indexName.replace(RegExp(`^${prefixToRemove}`), '').split('_');
              return {
                dbName: extractedData[0],
                moduleId: extractedData[1],
                tenantId: extractedData[3],
                lang: extractedData[4],
                size: response[indexName]
              }
            }),
        };
      })
    );
  }
  getTableCounts() {
    return this.http.get<number>(this.coreCrudEndpoints.getTableCounts());
  }
  getTableSpaces() {
    return this.http.get<number>(this.coreCrudEndpoints.getTableSpaces());
  }

  refreshTenantList(data: boolean) {
    this.refreshTenantListSubject.next(data);
  }

  getTenantList(orgId) {
    return this.http.get<any>(this.authEndpoints.getTenantList(orgId));
  }

  saveNewTenant(payload) {
    return this.http.post<LocationListResponse>(this.authEndpoints.saveTenant(), payload);
  }

  getLocationList() {
    return this.http.get<any>(this.authEndpoints.getLocations());
  }

  continueRegistrationAPI(apiUrl, payload,roleId) {
    return this.http.post<any>(this.profileEndpoints.continueRegistrationAPI(apiUrl, roleId),payload);
  }
}
