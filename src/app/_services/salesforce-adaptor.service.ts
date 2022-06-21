import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EndpointSalesforceAdaptorService } from './_endpoints/endpoint-salesforce-adaptor.service';

@Injectable({
  providedIn: 'root',
})
export class SalesforceAdaptorService {
  constructor(public endpointService: EndpointSalesforceAdaptorService, public http: HttpClient, public cookieService: CookieService) {}

  getNativeWindow() {
    return window;
  }

  getExistingConnectors() {
    return this.endpointService.getAllExistingConnectors();
  }

  getSFObjectList() {
    return this.endpointService.getObjectList();
  }

  getCurrentConnectionName() {
    // This returns the SF connection name currently set by the auth service.  Should only be used if you are
    return this.cookieService.get('sfConnectionName');
  }

  consumeAuthCode(code: string): Promise<string> {
    return new Promise<string>((res, rej) => {
      // Make request to endpoint to consume code.
      // res("SUCCESS");
      rej('UNAUTHORISED');
    });
  }

  getPendingConnections(refToken: string) : Observable<any> {
    const requestUri = this.endpointService.getPendingConnections();
    const authorizationData = 'Bearer ' + refToken;
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: authorizationData,
      }),
      observe: 'response' as const,
    };
    return this.http.get<any>(requestUri, httpOptions).pipe(map(res => res.body));
  }
}
