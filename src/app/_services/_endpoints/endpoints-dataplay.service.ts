import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EndpointsDataplayService {

  apiUrl = environment.ckhLibUrl;
  classicUrl = environment.apiurl;

  constructor() { }

  /**
   * URI for get all available nouns ..from local library
   */
  public getAvailableNounsUri(): string {
    return `${this.apiUrl}/mro/noun`;
  }

  /**
   * URI for get all available modifiers  ..from local library
   */
  public getAvailableModifierUri(): string {
    return `${this.apiUrl}/mro/modifier`;
  }

  /**
   * URI for get all available attributes  ..from local library
   */
   public getAvailableAttributeUri(): string {
    return `${this.apiUrl}/mro/attribute`;
  }

  /**
   * URI for get classification mapping fields  ..from local library
   */
  public getClassificationMappingUrl(): string {
    return `${this.classicUrl}/rule/schema/get-classification-mapping-data`;
  }

  /**
   * URI for get classification mapping fields  ..from local library
   */
   public getConnekthubLogin(): string {
    return `${this.apiUrl}/login`;
  }

  /**
   * URI for get array of Connekthub Packages
   */
  public getPackages(): string {
    return `${this.apiUrl}/packages/mdo`;
  }

  /**
   * URI for get a Connekthub Package
   */
  public getPackage(id: string): string {
    return `${this.apiUrl}/packages/mdo/${id}`;
  }

  /**
   * URI for get a Connekthub Package
   */
  public createPackage(): string {
    return `${this.apiUrl}/packages/mdo/upload`;
  }

  /**
   * URI for get a Connekthub Package
   */
  public updatePackage(id: string): string {
    return `${this.apiUrl}/packages/mdo/upload/${id}`;
  }

  /**
   * URI for get a Connekthub Package
   */
  public withdraw(id: string): string {
    return `${this.apiUrl}/packages/mdo/withdraw/${id}`;
  }

  /**
   * URL for Connekthub Refresh
   */
  public jwtRefresh(): string {
    return this.apiUrl + '/reissue';
  }
}
