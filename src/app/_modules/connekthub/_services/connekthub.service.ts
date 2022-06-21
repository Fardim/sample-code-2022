import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EndpointsDataplayService } from '@services/_endpoints/endpoints-dataplay.service';
import { Observable } from 'rxjs';
import { Package, PackageType } from '../_models/connekthub';

@Injectable({
  providedIn: 'root'
})
export class ConnekthubService {

  constructor(
    private endpointDataplay: EndpointsDataplayService,
    private http: HttpClient
  ) { }

  login(userName: string, password: string): Observable<any> {
    const authorizationData = 'Basic ' + btoa(`${userName}:${password}`);
    const httpOptions = {
      headers: new HttpHeaders().set('Authorization', authorizationData),
      observe: 'response' as 'body'
    };
    return this.http.post(this.endpointDataplay.getConnekthubLogin(), {}, httpOptions)
  }

  /**
   * check if token for connekthub exists in storage
   * @returns boolean
   */
  public connektHubTokenExists(): boolean {
    return !!localStorage.getItem('LIB-JWT-TOKEN') && !!localStorage.getItem('LIB-JWT-REFRESH-TOKEN');
  }

  /**
   * Get the packages ...
   * @param packageType the type of the package ...
   * @param s the search string ...
   * @returns will return the list of packages ..
   */
  getPackages(packageType: PackageType, s?: string): Observable<Package[]> {
    s = s || '';
    return this.http.get<Package[]>(this.endpointDataplay.getPackages() + `?type=${packageType}&search=${s}`);
  }

  getPackage(id: string): Observable<Package> {
    return this.http.get<Package>(this.endpointDataplay.getPackage(id));
  }

  getPackageFile(id: string): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this.http.get(this.endpointDataplay.getPackage(id) + '/file', { headers, responseType: 'text' });
  }

  createPackage(body: Package, file: File): Observable<string> {
    const formData = new FormData();
    for (const key in body) {
      if (body[key]) {
        formData.append(key, body[key]);
      }
    }
    formData.append('file', file);
    return this.http.post<string>(this.endpointDataplay.createPackage(), formData);
    // const url = `?type=${body.type}&tags=${body.tags}&name=${body.name}&brief=${body.brief}&whatsNew=${body.whatsNew}&imgs=${body.imgs}&vdos=${body.vdos}&docs=${body.docs}&origin=${body.origin}`;
    // return this.http.post<string>(this.endpointDataplay.createPackage()+`${url}`, formData);
  }

  updatePackage(id: string, body: Package, file: File): Observable<string> {
    const formData = new FormData();
    for (const key in body) {
      if (body[key]) {
        formData.append(key, body[key]);
      }
    }
    formData.append('file', file);
    return this.http.post<string>(this.endpointDataplay.updatePackage(id), formData);
  }

  withdraw(id: string): Observable<Package> {
    return this.http.post<Package>(this.endpointDataplay.withdraw(id), {});
  }
}
