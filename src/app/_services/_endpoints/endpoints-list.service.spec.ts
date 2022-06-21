import { TestBed } from '@angular/core/testing';

import { EndpointsListService } from './endpoints-list.service';

describe('EndpointsListService', () => {
  let service: EndpointsListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EndpointsListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should getAllListPageViewsUrl', () => {
    expect(service.getAllListPageViewsUrl()).toContain('/view/get-all-view');
  });

  it('should getListPageViewDetailsUrl', () => {
    expect(service.getListPageViewDetailsUrl('1701')).toContain('/view/1701');
  });

  it('should upsertListPageViewUrl', () => {
    expect(service.upsertListPageViewUrl()).toContain('/view/save-update-view');
  });

  it('should deleteListPageViewUrl', () => {
    expect(service.deleteListPageViewUrl('1701')).toContain('/view/delete-view/1701');
  });

  it('should getTableDataUrl', () => {
    expect(service.getTableDataUrl()).toContain('/search/all-data');
  });

  it('should getDataCountUrl', () => {
    expect(service.getDataCountUrl()).toContain('/search/data-count');
  });

  it('should upsertListFiltersUrl', () => {
    expect(service.upsertListFiltersUrl()).toContain('/search/save-update-filter');
  });

  it('should updateDefaultViewUrl', () => {
    expect(service.updateDefaultViewUrl()).toContain('/view/update-default-view');
  });

  it('should getUserSearchHistoryUrl', () => {
    expect(service.getUserSearchHistoryUrl()).toContain('/search/get-search-history');
  });

  it('should saveSearchHistoryUrl', () => {
    expect(service.saveSearchHistoryUrl()).toContain('/search/save-search-history');
  });

  it('should clearSearchHistoryUrl', () => {
    expect(service.clearSearchHistoryUrl()).toContain('/search/delete-search-history');
  });

  it('should deleteFilterUrl', () => {
    expect(service.deleteFilterUrl()).toContain('/search/delete-filter');
  });

  it('should getSavedFiltersUrl', () => {
    expect(service.getSavedFiltersUrl()).toContain('/search/get-all-filters');
  });

});
