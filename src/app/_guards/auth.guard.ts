import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { MsteamsConfigService } from '@modules/msteams/_service/msteams-config.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  jwtHelper = new JwtHelperService();

  /**
   * Uri which need to skip in prod mode
   */
  skipUri  = ['/auth/invite'];

  constructor(
    private router: Router,
    private msteamServices: MsteamsConfigService
  ) { }

  /**
   * Check whether .. has authorized user
   * If it has then .. return current url
   * Otherwise
   *
   * @param next next activated router params ..
   * @param state state of urls..
   */
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      const jwtToken = localStorage.getItem('JWT-TOKEN');
      const refreshToken = localStorage.getItem('JWT-REFRESH-TOKEN');
      const decodedJWTToken = this.jwtHelper.decodeToken(jwtToken);
      const decodedRefreshToken = this.jwtHelper.decodeToken(refreshToken);
      if (decodedJWTToken && decodedRefreshToken) {
        return true;
      }

      // not logged in so redirect to login page with the return url
      if(environment.production && !this.needToSkipUri(state.url)) {
        window.open(`${environment.authUrl}/auth/login?redirecUrl=${this.router.url}`, '_self');
      } else if(!environment.production){
        this.router.navigate(['auth', 'login'], { queryParams: { returnUrl: this.router.url } });
      } else{
        return true;
      }
      // if(environment.production && (this.router.url.indexOf('/nonav/report') !==-1 )) {
      //   this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url }});
      // } else if(environment.production) {
      //   this.router.navigate(['auth','session','expired']);
      // } else {
      //   this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url }});
      // }
      return false;
  }

  /**
   * Check the skip uri
   * @param url the url which need to skip ...
   * @returns true if match the url
   */
  needToSkipUri(url: string) {
    return this.skipUri.indexOf(url) !==-1 ? true : false;
  }
}
