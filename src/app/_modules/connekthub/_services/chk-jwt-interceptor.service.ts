import { HttpClient, HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EndpointsDataplayService } from '@services/_endpoints/endpoints-dataplay.service';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, finalize, switchMap, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChkJwtInterceptorService implements HttpInterceptor {
  isRefreshingToken = false;
  tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  constructor(
    private router: Router,
    private http: HttpClient,
    private endpointDataplay: EndpointsDataplayService
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.url.includes(environment.ckhLibUrl)) {
      if (request.headers.has('Skip401Interceptor')) {
        const headers = request.headers.delete('Skip401Interceptor');
        return next.handle(request.clone({ headers }));
      } else {
        const jwtToken = localStorage.getItem('LIB-JWT-TOKEN');
        if (jwtToken && !request.headers.has('Authorization')) {
          request = this.addToken(request, jwtToken);
        }
        return next.handle(request).pipe(
          catchError((error: HttpErrorResponse) => {
            switch (error.status) {
              case 401:
                return this.handlerFor401(request, next);
              case 403:
                this.handlerFor403(request, next);
            }
            // notify user here
            return throwError(error);
          }));
      }
    } else {
      return next.handle(request);
    }
  }

  addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({ setHeaders: { Authorization: 'Bearer ' + token } });
  }

  handlerFor401(req: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshingToken) {
      this.isRefreshingToken = true;
      // Reset here so that the following requests wait until the token
      // comes back from the refreshToken call.
      this.tokenSubject.next(null);
      const headers: HttpHeaders = new HttpHeaders({
        Skip401Interceptor: '',
      });
      const refreshToken = localStorage.getItem('LIB-JWT-REFRESH-TOKEN');
      return this.http.post<any>(this.endpointDataplay.jwtRefresh(), refreshToken, { observe: 'response', headers })
        .pipe(
          finalize(() => this.isRefreshingToken = false),
          switchMap(
            resp => {
              const jwtToken = resp.headers.get('JWT-TOKEN');
              const newRefreshToken = resp.headers.get('JWT-REFRESH-TOKEN');
              if (jwtToken && newRefreshToken) {
                localStorage.setItem('LIB-JWT-TOKEN', jwtToken);
                localStorage.setItem('LIB-JWT-REFRESH-TOKEN', newRefreshToken);
                this.tokenSubject.next(jwtToken);
                return next.handle(this.addToken(req, jwtToken));
              }
              this.logout();
              return throwError(new Error('oops! no token'));
            }
          ),
          catchError(
            (error) => {
              this.logout();
              error.status = 401; // By pass any error from reissue until it's fix
              return throwError(error);
            }
          ));
    } else {
      return this.tokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          return next.handle(this.addToken(req, token));
        }));
    }
  }

  /**
   * While http throw 403,
   * Open access denied comman dialog
   * @param req http request url control
   * @param next handler for http request
   */
  handlerFor403(req: HttpRequest<any>, next: HttpHandler) {
    this.logout();
    throw new Error('403 not implemented');
  }

  logout() {
    localStorage.removeItem('LIB-JWT-TOKEN');
    localStorage.removeItem('LIB-JWT-REFRESH-TOKEN');
  }
}