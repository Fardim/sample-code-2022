import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { EndpointSamlConfigurationService } from '../_endpoints/endpoint-saml-configuration.service';
import xml2js from 'xml2js';
@Injectable({
  providedIn: 'root'
})
export class SamlConfigurationService {

  updateConfiguration: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  updateConfiguration$ = this.updateConfiguration.asObservable();

  constructor(private http: HttpClient,private endpointSamlConfig: EndpointSamlConfigurationService) { }

  public getSamlConfigurationList(fetchCount,fetchSize,searchString,orgId) {
    return this.http.get<any[]>(`${this.endpointSamlConfig.getSamlConfigurationList(fetchCount,fetchSize,searchString,orgId)}`);
  }

  public saveUpdateSAMLConfiguration(payload): Observable<any> {
    return this.http.post<any>(`${this.endpointSamlConfig.saveUpdateSAMLUrl()}`, payload);
  }

  public getSAMLConfigurationData(orgId, tenantId) {
    return this.http.get<any[]>(`${this.endpointSamlConfig.getSAMLConfigurationData(orgId, tenantId)}`);
  }

  public uploadIDPFiles(file: File,orgId = '1234'): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.endpointSamlConfig.uploadIDPFiles(orgId)}`, formData);
  }

  public deleteConfiguration(orgId, tenantID): Observable<any> {
    return this.http.delete<any>(this.endpointSamlConfig.deleteConfiguration(orgId, tenantID));
  }

  nextupdateConfiguration(data) {
    this.updateConfiguration.next(data);
  }

  /**
   * Read IDP url .. and return idpEntityId
   * @param url or xml from where need to extract the IDP url for getting idpEntityId...
   */
  validateUrl(url: string): boolean {
    const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    if(url && pattern.test(url)) {
      return true;
    } else if(url) {
      return false;
    } else {
      throw new Error(`Url is not found or invalid URL`);
    }
  }

  /**
   * Parse the data into XML ..
   * @param data which you want to parse...
   * @returns will return the XML
   */
  parseXML(data) {
    return new Promise((resolve) => {
      const parser = new xml2js.Parser({
        trim: true,
        explicitArray: true,
      });
      parser.parseString(data,(err, result) => {
        resolve(result);
      });
    });
  }
}
