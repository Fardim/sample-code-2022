import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpEvent, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoadingService } from './loading.service';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';

const WHITELIST = [
  'schema/schema-list-module',
  'analytics/report/list',
  'analytics/report/v2/save-update'
];

@Injectable({
  providedIn: 'root'
})
export class LoadingInterceptorService implements HttpInterceptor {

  private requests: HttpRequest<any>[] = [];
  private loaderTimer = null;
  whiteList = WHITELIST;

  constructor(
    private loadingService: LoadingService,
    private sharedService: SharedServiceService
  ) { }

  removeRequest(req: HttpRequest<any>) {
    const i = this.requests.indexOf(req);
    if (i >= 0) {
        this.requests.splice(i, 1);
    }
    // show loader based on the request
    (this.requests.length > 0)? this.sharedService.showLoader() : this.sharedService.hideLoader()
    this.loadingService.isLoading().emit(this.requests.length > 0);
    if(this.loaderTimer) {
      clearTimeout(this.loaderTimer);
      this.loaderTimer = null;
    }
  }

  get isLoading() {
    return !!this.requests.length;
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if(this.isWhitelisted(req)) {
      if(!this.loaderTimer && !this.isLoading) {
        this.loaderTimer = setTimeout(() => {
            this.sharedService.showLoader();
          }, 500);
      }

      this.requests.push(req);
      this.loadingService.isLoading().emit(true);
     };

    return new Observable(observer => {
        const subscription = next.handle(req)
            .subscribe(
                event => {
                    if (event instanceof HttpResponse) {
                        this.removeRequest(req);
                        observer.next(event);
                    }
                },
                err => {
                    this.removeRequest(req);
                    observer.error(err);
                },
                () => {
                    this.removeRequest(req);
                    observer.complete();
                });
        // remove request from queue when cancelled
        return () => {
            this.removeRequest(req);
            subscription.unsubscribe();
        };
    });
  }

  isWhitelisted(req: HttpRequest<any>): boolean {
    return this.whiteList.some((route) => req.url.includes(route))
  }

}
