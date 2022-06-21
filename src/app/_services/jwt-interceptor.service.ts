import { validationRegex } from './../_constants/globals';
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpHandler,
  HttpEvent,
  HttpRequest,
  HttpErrorResponse,
  HttpHeaders,
  HttpClient,
  HttpXsrfTokenExtractor,
  HttpResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap, finalize, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AccessDeniedDialogComponent } from '@modules/shared/_components/access-denied-dialog/access-denied-dialog.component';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { EndpointsAuthService } from './_endpoints/endpoints-auth.service';
import { environment } from 'src/environments/environment';
import { JWT_REFRESH_TOKEN, JWT_TOKEN } from '../_constants';

@Injectable({
  providedIn: 'root'
})
export class JwtInterceptorService implements HttpInterceptor {
  isRefreshingToken = false;
  tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  initialTotalRequests = 0;
  pendingRequestsCount = 0;

  ignoreToAppendInterceptor: string[] = ['auth/signin', 'auth/refresh', 'profile/verify', environment.ckhLibUrl];

  constructor(
    private router: Router,
    private http: HttpClient,
    private endpointService: EndpointsAuthService,
    private accessDeniedComponent: AccessDeniedDialogComponent,
    private sharedService: SharedServiceService
  ) {}

  /**
   * Add the authnetication token into the request header
   * If the request from mdo2 then exclude the jwt as a header use JSESSIONID for the same
   * @param req the httprequest ...
   * @param token the jwt token and refresh token
   * @returns return the http request ....
   */
  addToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
    if (req.url.includes('/MDOSF') && environment.production && this.router.url.indexOf('/nonav/report') === -1) {
      console.log(`JWT not required for this mode !!!`);
      return req;
    }
    return req.clone({ setHeaders: { Authorization: 'Bearer ' + token } });
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.isValidRequestForInterceptor(request.url)) {
      this.pendingRequestsCount++;
      this.initialTotalRequests++;
      const privileges = localStorage.getItem('PRIVILEGES') || '';
      request = request.clone({setHeaders: { privileges }});
      // add authorization header with jwt token if available
      if (request.headers.has('Skip401Interceptor')) {
        const headers = request.headers.delete('Skip401Interceptor');
        return next.handle(request.clone({ headers }));
      } else {
        const jwtToken = localStorage.getItem('JWT-TOKEN');
        if (request.url.indexOf('/notif/') !== -1) {
          const chatToken = localStorage.getItem('NOTIF-TOKEN');
          request = this.addToken(request, chatToken);
        } else if (jwtToken && !request.headers.has('Authorization')) {
          request = this.addToken(request, jwtToken);
        }
        return next.handle(request).pipe(
          finalize(() => {
            this.pendingRequestsCount--;
            if (this.pendingRequestsCount === 0) {
              // this.callAPI();
            }
          }),
          tap((event: HttpEvent<any>) => {
            if (event instanceof HttpResponse) {
              /**
               * Todo: use the below method to set the CSRF cookie when backend starts sending it
               * NOTE: This is not required if the cookie is being set automatically
               * this.cookieExtractor.setToken('YOUR_TOKEN_HERE');
               */
            }
          }),
          catchError((error: HttpErrorResponse) => {
            switch (error.status) {
              case 401:
                return this.handlerFor401(request, next);

              case 403:
                return this.handlerFor403(request, next);

              // case 503:
              // case 0:
              //   return this.handlerFor503(error);
            }
            // notify user here
            return throwError(error);
          })
        );
      }
    }
    return next.handle(request);
  }

  handlerFor401(req: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshingToken) {
      this.isRefreshingToken = true;

      // Reset here so that the following requests wait until the token
      // comes back from the refreshToken call.
      this.tokenSubject.next(null);
      const refreshToken = localStorage.getItem(JWT_REFRESH_TOKEN);
      const headers: HttpHeaders = new HttpHeaders({
        Skip401Interceptor: '',
        Authorization: `Bearer ${refreshToken}`
      });
      return this.http.post<any>(this.endpointService.jwtRefresh(), '', { observe: 'response', headers }).pipe(
        finalize(() => (this.isRefreshingToken = false)),
        switchMap((resp) => {
          const jwtToken = resp.body[JWT_TOKEN] ? resp.body[JWT_TOKEN] : '';
          const newRefreshToken = resp.body[JWT_REFRESH_TOKEN] ? resp.body[JWT_REFRESH_TOKEN] : '';
          if (jwtToken && newRefreshToken) {
            localStorage.setItem(JWT_TOKEN, jwtToken);
            localStorage.setItem(JWT_REFRESH_TOKEN, newRefreshToken);
            this.tokenSubject.next(jwtToken);
            return next.handle(this.addToken(req, jwtToken));
          }
          this.logout();
          return throwError(new Error('oops! no token'));
        }),
        catchError((error, ca) => {
          if (error && error.status === 401) {
            this.logout();
          }
          // this.logout();
          // this.matDialog.closeAll();
          return throwError(error);
        })
      );
    } else {
      return this.tokenSubject.pipe(
        filter((token) => token != null),
        take(1),
        switchMap((token) => {
          return next.handle(this.addToken(req, token));
        })
      );
    }
  }

  /**
   * While http throw 403 ,
   * Open access denied comman dialog
   * @param req http request url control
   * @param next handler for http request
   */
  handlerFor403(req: HttpRequest<any>, next: HttpHandler) {
    if (req) {
      this.accessDeniedComponent.open();
    }
    return throwError(new Error('oops! Access denied'));
  }

  handlerFor503(error: HttpErrorResponse) {
    if (error) {
      console.log(error);
      console.log(this.router.url);
      // navigate to that common error page ...
      // if(this.router.url && this.router.url.startsWith('/home/schema/schema-details')) {
      //   this.router.navigate([],{fragment:error?.error?.code});
      // }
      // else {
      //   this.router.navigate(['home','schema','error','state'],{queryParams:{e:`${error.status}`}});
      // }
    }
    return throwError(new Error(error?.error?.message || 'Something went wrong !!'));
  }

  logout() {
    try {
      localStorage.removeItem('JWT-TOKEN');
      localStorage.removeItem('JWT-REFRESH-TOKEN');
      localStorage.removeItem('LIB-JWT-TOKEN');
      localStorage.removeItem('LIB-JWT-REFRESH-TOKEN');
    } finally {
      if (environment.production) {
        window.open(`${environment.authUrl}/auth/login?redirecUrl=${this.router.url}`, '_self');
      } else {
        this.router.navigate(['auth', 'login'], { queryParams: { returnUrl: this.router.url } });
      }
    }
  }

  /**
   * when there are lot of request sequencially the this gets called
   * when all the callsare done and then after 1000 MS,
   * notification count gets updates
   */
  callAPI() {
    console.log(this.initialTotalRequests);
    if (this.initialTotalRequests > 0) {
      setTimeout(() => {
        console.warn('API Calls Completed, Updating notifications count');
        this.sharedService.getNotificationCount();
        this.initialTotalRequests = 0;
      }, 1000);
    }
  }

  isValidRequestForInterceptor(requestUrl: string): boolean {
    for (const address of this.ignoreToAppendInterceptor) {
      if (requestUrl.indexOf(address) !== -1) {
        return false;
      }
    }
    // const positionIndicator = 'fapi/';
    // const position = requestUrl.indexOf(positionIndicator);
    // if (position > 0) {
    //   const destination: string = requestUrl.substr(position + positionIndicator.length);
    //   for (const address of this.ignoreToAppendInterceptor) {
    //     if (new RegExp(address).test(destination)) {
    //       return false;
    //     }
    //   }
    // }
    return true;
  }
}
