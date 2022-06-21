import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EndpointsListService {

  apiUrl = environment.apiurl + '/list';

  constructor() { }

  public getAllListPageViewsUrl(): string {
    return this.apiUrl + `/view/get-all-view`;
  }

  public getListPageViewDetailsUrl(viewId: string): string {
    return this.apiUrl + `/view/${viewId}`;
  }

  public upsertListPageViewUrl(): string {
    return this.apiUrl + '/view/save-update-view';
  }

  public deleteListPageViewUrl(viewId: string): string {
    return this.apiUrl + `/view/delete-view/${viewId}`;
  }

  public getTableDataUrl(): string {
    return this.apiUrl + `/search/all-data`;
  }

  public getDataCountUrl(): string {
    return this.apiUrl + `/search/data-count`;
  }

  public upsertListFiltersUrl(): string {
    return this.apiUrl + `/search/save-update-filter`;
  }

  public updateDefaultViewUrl(): string {
    return this.apiUrl + `/view/update-default-view`;
  }

  public getUserSearchHistoryUrl(): string {
    return this.apiUrl + `/search/get-search-history`;
  }

  public saveSearchHistoryUrl(): string {
    return this.apiUrl + `/search/save-search-history`;
  }

  public findDataByGlobalSearchUrl(): string {
    return this.apiUrl + `/search/global-search/data`;
  }

  public clearSearchHistoryUrl(): string {
    return this.apiUrl + `/search/delete-search-history`;
  }

  public deleteFilterUrl(): string {
    return this.apiUrl + `/search/delete-filter`;
  }

  public getSavedFiltersUrl(): string {
    return this.apiUrl + `/search/get-all-filters`;
  }

  public getAllListValues(): string {
    return this.apiUrl + `/listvalue/get-all-listvalue`;
  }

  public searchListValues(): string {
    return this.apiUrl + `/listvalue/search-listvalue`;
  }

  public deleteByListValueId(): string {
    return this.apiUrl + `/listvalue/delete-by-listvalue-id`;
  }

  public saveUpdateListValue(): string {
    return this.apiUrl + `/listvalue/save-update-listvalue`;
  }

  /**
   * URI for download excel add in ...
   * @returns will return the url for download excel
   */
  public exportExcelAddin(): string {
    return  `${this.apiUrl}/search/download-mass-template`;
  }
}
