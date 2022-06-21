import { TestBed } from '@angular/core/testing';

import { EndpointsCoreService } from './endpoints-core.service';

describe('EndpointsCoreService', () => {
  let service: EndpointsCoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EndpointsCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should getAllObjectTypeUrl', () => {
    expect(service.getAllObjectTypeUrl()).toContain(`/module/get-all-modules`);
  });

  it('should searchAllObjectTypeUrl', () => {
    // fetchcount, fetchsize, language, description
    expect(service.searchAllObjectTypeUrl(0, 20, 'en', 'test')).toContain(`/module/get-all-modules/v2?fetchCount=0&fetchSize=20&language=en&description=test`);
  });

  it('should getAllFieldsForViewUrl', () => {
    expect(service.getAllFieldsForViewUrl('1005')).toContain('/metadata/list-view-all-fields/1005');
  });

  it('should getObjectTypeDetailsUrl', () => {
    expect(service.getObjectTypeDetailsUrl('1005', 'en')).toContain('/module/get-module-desc/1005/en');
  });

  it('should searchFieldsMetadataUrl', () => {
    expect(service.getMetadataByFieldsUrl('1005', 'en')).toContain('/metadata/fields/getSearchEngineFields/1005/en');
  });

  it('should getMetadataByFieldsUrl', () => {
    expect(service.getMetadataByFieldsUrl('1005', 'en')).toContain('/metadata/fields/getSearchEngineFields/1005/en');
  });

  it('should saveModule', () => {
    expect(service.saveModule()).toContain('/module/save');
  });

  it('should getMetadataFieldsByFields', () => {
    expect(service.getMetadataFieldsByFields('1')).toContain('/metadata/fields/get-fields-by-fields');
  });

  it('should getCreateFieldUrl', () => {
    expect(service.getCreateFieldUrl('1005')).toContain('/metadata/fields/1005/createField');
  });

  it('should getUpdateFieldUrl', () => {
    expect(service.getUpdateFieldUrl('1005', '1')).toContain('/metadata/1005/update/1');
  });

  it('should getFieldDetailsWithFieldIdUrl', () => {
    expect(service.getFieldDetailsWithFieldIdUrl('1005')).toContain('/metadata/fields/1005/getFieldDetails');
  });

  it('should getSearchEngineFieldsUrl', () => {
    expect(service.getSearchEngineFieldsUrl('1005', 'en')).toContain('/metadata/fields/getSearchEngineFields/1005/en');
  });

  it('should getRemoveFieldListUrl', () => {
    expect(service.getRemoveFieldListUrl('1005', '1')).toContain('/metadata/1005/remove/1');
  });

  it('should getListFieldIdByStructureUrl', () => {
    expect(service.getListFieldIdByStructureUrl('1005', 'en')).toContain('/module/fields/1005/en/listFieldIdByStructure');
  });

  it('should getListParentFieldsUrl', () => {
    expect(service.getListParentFieldsUrl('1005')).toContain('/module/fields/1005/listParentFields');
  });

  it('should getListFieldIdByStructureUrl', () => {
    expect(service.putDraftFieldUrl('1005')).toContain('/metadata/fields/1005/draftField');
  });

  it('should getDraftFieldUrl', () => {
    expect(service.getDraftFieldUrl('1005')).toContain('/metadata/fields/1005/getDraftField');
  });

  it('should bulkDeleteDraftUrl', () => {
    expect(service.bulkDeleteDraftUrl('1005')).toContain('/metadata/1005/draftField/bulk/delete');
  });

  it('should getDatasetFormListUrl', () => {
    expect(service.getDatasetFormListUrl('1005')).toContain('/layout/1005/list');
  });

  it('should createDatasetFormUrl', () => {
    expect(service.createDatasetFormUrl('1005')).toContain('/layout/1005/create');
  });

  it('should getFormsCountUrl', () => {
    expect(service.getFormsCountUrl('1005')).toContain('/layout/1005/count');
  });

  it('should getDatasetFormDetailUrl', () => {
    expect(service.getDatasetFormDetailUrl('1005')).toContain('/layout/1005/get-layout');
  });

  it('should updateDatasetFormUrl', () => {
    expect(service.updateDatasetFormUrl('1005', '1')).toContain('/layout/1005/1/update');
  });

  it('should searchTabFieldsUrl', () => {
    expect(service.searchTabFieldsUrl('1005', '1', 'en')).toContain('/tab/fields/1005/search-by-description/en/1');
  });

  it('should searchUnassignedTabFieldsUrl', () => {
    expect(service.searchUnassignedTabFieldsUrl('1005', '1', 'en')).toContain('/tab/1005/fields/search-unassigned-fields/en/1');
  });

  it('should getAllStructures url', () => {
    expect(service.getAllStructures('1005', 'en', 0, 10, '')).toContain('/module/1005/get-all-structures/en?fetchCount=0&fetchSize=10&searchTerm=');
  });

  it('should saveUpdateStructure url', () => {
    expect(service.saveUpdateStructure()).toContain('/module/saveAndUpdateStructure');
  });

  it('should deleteStructure', () => {
    expect(service.deleteStructure('1005', 1)).toContain('/module/1005/delete-structure/1');
  });

  it('should saveDatasetFormTabsDetailsUrl', () => {
    expect(service.saveDatasetFormTabsDetailsUrl('187','71f5dc6a-c800-4382-b1ed-6bde44d74b3f')).toContain('/layout/187/save-layout-details/71f5dc6a-c800-4382-b1ed-6bde44d74b3f/en');
  });

  it('should getDatasetFormTabsDetailsUrl', () => {
    expect(service.getDatasetFormTabsDetailsUrl('1005', '71f5dc6a-c800-4382-b1ed-6bde44d74b3f'))
      .toContain('/layout/layoutdetails/1005/71f5dc6a-c800-4382-b1ed-6bde44d74b3f/en');
  });

  it('should get mapping URL', () => {
    expect(service.getExistingMappingsUrl('id', 0, 20, '')).toContain('intg/get-mappings?scenarioId=id&fetchCount=0&fetchSize=20&searchTerm=');
  });

  it('should get save or update mapping URL', () => {
    expect(service.saveOrUpdateMappingUrl('1')).toContain('intg/save-update-mappings?scenarioId=1');
  });

  it('should get mdo mapping URL', () => {
    expect(service.getMdoMappingUrl('en', 199, 0, 20, '')).toContain('/module/199/fields/get-structure-fields/en?fetchCount=0&fetchSize=20&searchTerm=');
  });

  it('should getRelatedDatasetsUrl()', () => {
    expect(service.getRelatedDatasetsUrl()).toContain('/module/child-details');
  });
});
