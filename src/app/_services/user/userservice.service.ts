import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EndpointsAuthService } from '@services/_endpoints/endpoints-auth.service';
import { EndpointsProfileService } from '@services/_endpoints/endpoints-profile.service';
import * as jwt_decode from 'jwt-decode';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  TokenPayLoadData,
  Userdetails,
  UserPasswordDetails,
  UserPersonalDetails,
  UserPreferenceDetails
} from 'src/app/_models/userdetails';
import { Any2tsService } from '../any2ts.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userDetailsBehaviorSubject = new BehaviorSubject<Userdetails>(new Userdetails());

  constructor(
    private endpointService: EndpointsAuthService,
    private http: HttpClient,
    private any2tsService: Any2tsService,
    private profileEndpointService: EndpointsProfileService
  ) { }

  public getUserIdFromToken(): string {
    const jwtToken = localStorage.getItem('JWT-TOKEN');
    const tokenPayLoadData: TokenPayLoadData = new TokenPayLoadData();
    if (jwtToken && jwtToken !== '') {
      const afterDecode: any = jwt_decode(jwtToken);
      if (afterDecode.hasOwnProperty('sub')) {
        const subData: any = JSON.parse(afterDecode.sub);
        tokenPayLoadData.userName = subData.username;
        tokenPayLoadData.fullName = subData.fullname;
      }
      tokenPayLoadData.iat = afterDecode.iat;
      tokenPayLoadData.exp = afterDecode.exp;
      tokenPayLoadData.iss = afterDecode.iss;
      return tokenPayLoadData.userName;
    }
    return;
  }

  public getUserDetails(): Observable<Userdetails> {
    // check subjectuserdetails userid !== jwt token userid, call service
    const currentUserId = this.getUserIdFromToken();
    if (this.userDetailsBehaviorSubject.getValue().userName !== currentUserId) {
      return forkJoin([this.http.get<Userdetails>(this.endpointService.getUserDetailsUrl(currentUserId)), this.getUserPersonalDetails()])
        .pipe(
          map((data) => this.any2tsService.any2UserDetails(data)),
          tap(userDetails => this.userDetailsBehaviorSubject.next(userDetails))
        )
    }
    return this.userDetailsBehaviorSubject.asObservable();
  }

  public getUserPersonalDetails(): Observable<UserPersonalDetails> {
    return this.http.get<UserPersonalDetails>(this.profileEndpointService.getPersonalDetails());
  }

  public updateUserPersonalDetails(personalDetails: UserPersonalDetails): Observable<any> {
    return this.http.post<any>(this.profileEndpointService.updatePersonalDetails(), personalDetails);
  }

  public getUserPreferenceDetails(): Observable<UserPreferenceDetails> {
    return this.http.get<UserPreferenceDetails>(this.profileEndpointService.getUserPreferenceDetails());
  }

  public updateUserPreferenceDetails(pref: UserPreferenceDetails): Observable<any> {
    const params: UserPreferenceDetails = JSON.parse(JSON.stringify(pref));
    delete params.timeZone;
    return this.http.post<any>(this.profileEndpointService.updateUserPreferenceDetails(), params);
  }

  public getAllLanguagesList(): Observable<any> {
    return this.http.get<any>(this.profileEndpointService.getAllLanguagesList());
  }

  public getDateFormatList(): Observable<any> {
    return this.http.get<any>(this.profileEndpointService.getDateFormatList());
  }

  public getNumberFormatList(): Observable<any> {
    return this.http.get<any>(this.profileEndpointService.getNumberFormatList());
  }

  public updatePassword(passwordDetails: UserPasswordDetails, orgId: string): Observable<any> {
    return this.http.post<any>(this.endpointService.updatePassword(), passwordDetails, { params: { orgId } });
  }

  public getSelectedUserDetails(userName: string): Observable<UserPersonalDetails> {
    return this.http.get<UserPersonalDetails>(this.profileEndpointService.getPersonalDetails(), {
      params: { userName },
    });
  }

  public updateSelectedUserDetails(personalDetails: UserPersonalDetails, userName: string): Observable<UserPersonalDetails> {
    return this.http.post<UserPersonalDetails>(this.profileEndpointService.updatePersonalDetails(), personalDetails, {
      params: { userName },
    });
  }

  public getSelectedUserPreferenceUserDetails(userName: string): Observable<UserPreferenceDetails> {
    return this.http.get<UserPreferenceDetails>(this.profileEndpointService.getUserPreferenceDetails(), {
      params: { userName },
    });
  }

  public updateSelectedUserPreferenceDetails(pref: UserPreferenceDetails, userName: string): Observable<any> {
    return this.http.post<any>(this.profileEndpointService.updateUserPreferenceDetails(), pref, {
      params: { userName },
    });
  }

  public getLicenseValidateInfo(orgId) {
    return this.http.get<any>(this.endpointService.getLicenseValidateInfo(orgId));
  }

  public getLicenseInfo(orgId) {
    return this.http.get<any>(this.endpointService.getLicenseInfo(orgId));
  }

  /**
   *
   * @param users the users where need to update the status
   * @param orgId the logged in user org id
   * @param status ACTIVE || LOCKED || INACTIVE || INVITED || REVOKED || INVITE_EXPIRED
   * @param updateAll flag to update all if need
   * @returns will return the Observable of boolean
   */
  public updateStatus(users:string[], orgId: string, status: string, updateAll: boolean = false): Observable<boolean> {
    const req = {
      userIds: users,
      orgId: orgId || '',
      status: status || '',
      updateAll
    }
    return this.http.post<boolean>(this.endpointService.updateStatus(), req);
  }
}
