import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EndpointsCoreService {
  apiurl = environment.apiurl + '/core';
  mdoIntegrationUrl = environment.apiurl + '/intg';

  constructor() { }

  getFlowRefFieldsUrl(isWorkflow: boolean, fetchCount, fetchSize, searchTerm) {
    return this.apiurl + `/module/fields/get-flow-Ref-fields/en?isWorkflow=${isWorkflow}&fetchCount=${fetchCount}&fetchSize=${fetchSize}&searchTerm=${searchTerm}`;
  }

  getAllObjectTypeUrl() {
    return this.apiurl + `/module/get-all-modules`;
  }

  getSearchedModules(lang, searchQuery) {
    return this.apiurl + `/module/${lang}/get-modules?description=${searchQuery}`;
  }

  searchAllObjectTypeUrl(fetchcount, fetchsize, language, description) {
    return this.apiurl + `/module/get-all-modules/v2?fetchCount=${fetchcount}&fetchSize=${fetchsize}&language=${language}&description=${description}`;
  }

  public getAllFieldsForViewUrl(moduleId): string {
    return this.apiurl + `/metadata/list-view-all-fields/${moduleId}`;
  }

  getObjectTypeDetailsUrl(moduleId, lang) {
    return this.apiurl + `/module/get-module-desc/${moduleId}/${lang}`;
  }

  getEditObjectTypeDetails(moduleId) {
    return this.apiurl + `/module/${moduleId}/getDetails`;
  }

  getMetadataByFieldsUrl(moduleId, lang): string {
    return this.apiurl + `/metadata/fields/getSearchEngineFields/${moduleId}/${lang}`;
  }

  saveModule(): string {
    return this.apiurl + `/module/save`;
  }

  getDatasetDetails(selectedDatasetId): string {
    return this.apiurl + `/module/get-dataset-details/${selectedDatasetId}`;
  }

  getDropdownOptionsUrl(pageIndex, fieldId, lang): string {
    return environment.apiurl + `/rule/dropval/list/${pageIndex}/${fieldId}/${lang}`;
  }

  public getMetadataFieldsByFields(moduleId: string): string {
    return environment.apiurl + `/core/metadata/${moduleId}/fields/get-fields-by-fields`;
  }
  getCreateFieldUrl(moduleId: string): string {
    return this.apiurl + `/metadata/fields/${moduleId}/createField`;
  }

  getUpdateFieldUrl(moduleId: string, fieldId: string): string {
    return this.apiurl + `/metadata/${moduleId}/update/${fieldId}`;
  }

  getFieldDetailsWithFieldIdUrl(moduleId: string): string {
    return this.apiurl + `/metadata/fields/${moduleId}/getFieldDetails`;
  }

  getSearchEngineFieldsUrl(moduleId: string, language: string): string {
    return this.apiurl + `/metadata/fields/getSearchEngineFields/${moduleId}/${language}`;
  }

  getRemoveFieldListUrl(moduleId: string, fieldId: string): string {
    return this.apiurl + `/metadata/${moduleId}/remove/${fieldId}`;
  }

  getListFieldIdByStructureUrl(moduleId: string, language: string): string {
    return this.apiurl + `/module/fields/${moduleId}/${language}/listFieldIdByStructure`;
  }

  getListParentFieldsUrl(moduleId: string): string {
    return this.apiurl + `/module/fields/${moduleId}/listParentFields`;
  }

  putDraftFieldUrl(moduleId: string): string {
    return this.apiurl + `/metadata/fields/${moduleId}/draftField`;
  }
  getDraftFieldUrl(moduleId: string): string {
    return this.apiurl + `/metadata/fields/${moduleId}/getDraftField`;
  }
  bulkDeleteDraftUrl(moduleId: string) {
    return this.apiurl + `/metadata/${moduleId}/draftField/bulk/delete`;
  }

  getDatasetFormListUrl(moduleId: string) {
    return this.apiurl + `/layout/${moduleId}/list`;
  }
  createDatasetFormUrl(moduleId: string) {
    return this.apiurl + `/layout/${moduleId}/create`;
  }
  getFormsCountUrl(moduleId: string) {
    return this.apiurl + `/layout/${moduleId}/count`;
  }
  getDatasetFormDetailUrl(moduleId: string) {
    return this.apiurl + `/layout/${moduleId}/get-layout`;
  }
  updateDatasetFormUrl(moduleId: string, formId: string) {
    return this.apiurl + `/layout/${moduleId}/${formId}/update`;
  }
  searchTabFieldsUrl(moduleId: string, layoutId: string, lang: string) {
    return this.apiurl + `/tab/fields/${moduleId}/search-by-description/${lang}/${layoutId}`;
  }
  searchUnassignedTabFieldsUrl(moduleId: string, layoutId: string, lang: string) {
    return this.apiurl + `/tab/${moduleId}/fields/search-unassigned-fields/${lang}/${layoutId}`;
  }

  getDatasetFormTabsUrl(layoutId: string, lang: string, fetchCount: number, fetchSize: number) {
    return this.apiurl + `/tab/${layoutId}/get-layout-tab-list/${lang}?fetchCount=${fetchCount}&fetchSize=${fetchSize}&searchTerm`;
  }
  getDatasetFormTabBytCodeUrl(layoutId: string) {
    return this.apiurl + `/tab/${layoutId}/get-layout-tab`;
  }
  getAllStructures(moduleId: string, language: string, fetchCount: number, fetchSize: number, searchTerm: string) {
    return (
      this.apiurl +
      `/module/${moduleId}/get-all-structures/${language}?fetchCount=${fetchCount}&fetchSize=${fetchSize}&searchTerm=${searchTerm}`
    );
  }
  saveUpdateStructure() {
    return this.apiurl + `/module/saveAndUpdateStructure`;
  }
  deleteStructure(moduleId: string, structureId: number) {
    return this.apiurl + `/module/${moduleId}/delete-structure/${structureId}`;
  }
  updateDatasetInfoUrl(moduleId: string) {
    // return this.apiurl + `/module/${moduleId}/update/description`;
    return this.apiurl + `/module/update/${moduleId}`
  }

  saveDatasetFormTabsDetailsUrl(moduleId: string, layoutId: string, language = 'en') {
    return this.apiurl + `/layout/${moduleId}/save-layout-details/${layoutId}/${language}`;
  }

  getDatasetFormTabsDetailsUrl(moduleId: string, layoutId: string, language = 'en') {
    return this.apiurl + `/layout/layoutdetails/${moduleId}/${layoutId}/${language}`;
  }

  getExistingMappingsUrl(scenarioId: string | number, fetchCount: number, fetchSize: number, searchTerm: string | number): string {
    return this.mdoIntegrationUrl + `/get-mappings?scenarioId=${scenarioId}&fetchCount=${fetchCount}&fetchSize=${fetchSize}&searchTerm=${searchTerm}`;
  }

  getExternalMappingsUrl(scenarioId: string | number): string {
    return this.mdoIntegrationUrl + `/get-external-mappings/${scenarioId}`;
  }

  saveOrUpdateMappingUrl(scenarioId: string | number): string {
    return this.mdoIntegrationUrl + `/save-update-mappings?scenarioId=${scenarioId}`;
  }

  getMdoMappingUrl(language: string, moduleId: string | number, fetchCount: number, fetchSize: number, searchTerm: string | number): string {
    return this.apiurl + `/module/${moduleId}/fields/get-structure-fields/${language}?fetchCount=${fetchCount}&fetchSize=${fetchSize}&searchTerm=${searchTerm}`;
  }

  /**
   * Get dataset url
   * @returns will return the final url for get all the datasets ...
   */
  public getAllObjectTypeV2Url() {
    return this.apiurl + `/module/get-all-modules/v2`;
  }
  getDatasetBusinessRuleListUrl(): string {
    return environment.apiurl + `/rule/schema/metadata/rule-search-list`;
  }

  getMetadataFieldsByModuleIdUrl(searchTerm = '', language = 'en', fetchCount = 0, fetchSize = 0) {
    return (
      this.apiurl + `/module/fields/get-fields/${language}/v2?fetchCount=${fetchCount}&fetchSize=${fetchSize}&searchTerm=${searchTerm}`
    );
  }

  getMetadataFieldsByModuleIdUrls(searchTerm = '', formId, language = 'en', fetchCount = 0, fetchSize = 0) {
    return (
      this.apiurl + `/module/fields/get-fields/${language}/v2?fetchCount=${fetchCount}&fetchSize=${fetchSize}&searchTerm=${searchTerm}&isForForm=${true}&formId=${formId}`
    );
  }

  getMetadataFieldsDataUrl(moduleId: number, formId: string): string {
    return `${this.apiurl}/layout/get-Dataset-Mapping/${formId}/${moduleId}`;
  }

  exportDataset(moduleId, language): string {
    return this.apiurl + `/module/export/${moduleId}/${language}`;
  }

  createNewDatasetMappingUrl() {
    return this.mdoIntegrationUrl + `/create-new-dataset-mapping`;
  }

  searchFieldsMetadataUrl(): string {
    return this.apiurl + `/metadata/list-view-fields`;
  }


  getVirtualDatasetDetailsByVdIdUrl(vdId: string) {
    return this.apiurl + `/virtualdataset/get-dataset?vdId=${vdId}`;
  }


  getDeleteVirtualDatasetUrl(vdId: string) {
    return this.apiurl + `/virtualdataset/delete-dataset?vdId=${vdId}`;
  }

  saveVirtualDataSet(): string {
    let tenantId = '0';
    try {
      tenantId = JSON.parse(JSON.parse(atob(localStorage.getItem('JWT-TOKEN').split('.')[1])).sub).tenantCode;
    } catch (e) {

    }
    return this.apiurl + `/virtualdataset/create-dataset?tenantId=${tenantId}`;
  }

  saveUpdateVirtualDataSet(): string {
    return this.apiurl + `/virtualdataset/save-update`;
  }

  getVirtualDataList(): string {
    return this.apiurl + `/virtualdataset/get-dataset-list`;
  }


  getTabFieldsUrl(moduleId: string, tabId: string, fetchCount: number, fetchSize: number, locale: string, flowId: string, userStepId: string) {
    return this.apiurl + `/tab/fields/${moduleId}/get-tab-fields/${tabId}?fetchCount=${fetchCount}&fetchSize=${fetchSize}&language=${locale}&flowId=${flowId}&userStepId=${userStepId}`;
  }

  createOrUpdateCpiConnectionUrl(): string {
    return `${this.mdoIntegrationUrl}/create-update-cpi-connection`;
  }

  /**
   * Get the import valid
   * @returns will return the endpoint for the import dataset ....
   */
  importValidateUrl(): string {
    return `${this.apiurl}/module/import/valid`;
  }

  /**
   * Help for import module ...
   * @returns will return the uri for import ... dataset
   */
  importModuleUri(): string {
    return `${this.apiurl}/module/import`;
  }

  /**
   * Get the endpoint for the save-update package ...
   * @param moduleId the dataset id ....
   * @param packageId the package id which need to update
   * @returns will return the endpoint for same ...
   */
  updatePackageIdUrl(moduleId: string, packageId: string) {
    return `${this.apiurl}/module/${moduleId}/save-package-id/${packageId}`;
  }

  updateSchemaPackageIdUrl(moduleId: string, packageId: string) {
    return `${this.apiurl}/module/${moduleId}/save-package-id/${packageId}`;
  }

  getFieldsListByPickListUrl(moduleId: string, lang: string, fetchCnt, fetchSize): string {
    return `${this.apiurl}/module/fields/${moduleId}/${lang}/listByPicklist?fetchcount=${fetchCnt}&fetchsize=${fetchSize}`;
  }

  getAllPVMappingsUrl(flowId: number) {
    // Process-variable
    return this.apiurl + `/process/steps/getAll-PV-Mapping/${flowId}`;
  }
  getAllCPMappingsUrl(flowId: any, fetchCount: any, fetchSize: any) {
    const urlParams = `fetchCount=${fetchCount}&fetchSize=${fetchSize}`;
    return this.apiurl + `/process/steps/getAll-CP-Mapping/${flowId}?${urlParams}`;
  }
  deleteCPMappingUrl(flowId: string) {
    return this.apiurl + `process/steps/delete-CPMapping/${flowId}`;
  }
  saveDataSetMappingUrl(flowId: number) {
    return `${this.apiurl}/process/steps/save-Dataset-Mapping/${flowId}`;
  }
  savePVMappingUrl(flowId: number) {
    return `${this.apiurl}/process/steps/save-ProcessVariable-Mapping/${flowId}`;
  }

  getAllLayoutDetailsUrl(fetchCount: any, fetchSize: any, language: any, searchString: any) {
    if (searchString && searchString.length > 0) {
      return this.apiurl + `/layout/get-all-layouts-details?fetchCount=${fetchCount}&fetchSize=${fetchSize}&lang=${language}&searchString=${searchString}`;
    } else {
      return this.apiurl + `/layout/get-all-layouts-details?fetchCount=${fetchCount}&fetchSize=${fetchSize}&lang=${language}`;
    }
  }
  getLayoutListUrl(moduleId: any, fetchCount: any, fetchSize: any, dateModified: any, dateCreated: any, searchTerm: any, ifforflow: boolean) {
    return this.apiurl + `/layout/${moduleId}/list?fetchCount=${fetchCount}&fetchSize=${fetchSize}&dateModified=${dateModified}&dateCreated=${dateCreated}&searchTerm=${searchTerm}&ifforflow=${ifforflow}`;
  }
  getKeyFieldsByStructureIdUrl(moduleId, structureId, fetchCount: any, fetchSize: any, searchTerm: any) {
    return this.apiurl + `/metadata/${moduleId}/get-key-fields/${structureId}?fetchCount=${fetchCount}&fetchSize=${fetchSize}&searchTerm=${searchTerm}`;
  }

  deleteLayoutUrl() {
    return this.apiurl + `/layout/delete`;
  }
  deleteModuleById(moduleId: number | string) {
    return this.apiurl + `/module/delete?moduleId=${moduleId}`
  }
  getReferenceField(moduleId: string, fieldId: string) {
    return this.apiurl + `/module/${moduleId}/get-dataset-reference/${fieldId}`;
  }

  saveReferenceField(moduleId: string) {
    return this.apiurl + `/module/${moduleId}/save-update-dataset-reference`;
  }

  tableDescFields(language, moduleId) {
    return (
      this.apiurl + `/module/fields/${moduleId}/${language}/listByPicklist`
    );
  }

  getGridColumns(language, moduleId) {
    return (
      this.apiurl + `/metadata/${moduleId}/get-grid-columns/${language}`
    );
  }

  getRelatedDatasetsUrl() {
    return `${this.apiurl}/module/child-details`
  }

  /**
   * Dulicate the form ...
   * @param datasetId the current module id
   * @returns will return the url for same
   */
  duplicateFormUrl(datasetId: string): string {
    return `${this.apiurl}/layout/${datasetId}/duplicate-layout`;
  }

  /**
   * @returns will return the url for the get-all-dataset-details API
   */
  getAllDatasetDetailsUrl(layoutId: string, fetchCount: number, fetchSize: number, lang: string): string {
    return `${this.apiurl}/module/get-all-dataset-details?lang=${lang}&layoutId=${layoutId}&fetchCount=${fetchCount}&fetchSize=${fetchSize}`;
  }

  getAllNumberSettingsFields(moduleId, lang) {
    return `${this.apiurl}/metadata/find-all-number-setting-fields/${moduleId}?lang=${lang}`;
  }

  getFieldDataUrl(datasetId: string, referenceDataSetId: string, recordId: string, lang: string) {
    return `${this.apiurl}/metadata/fields/${datasetId}/getFieldData?referenceDataSetId=${referenceDataSetId}&documentId=${recordId}&lang=${lang}`;
  }

  getsaveDefaultValuesUrl() {
    return `${this.apiurl}/layout/save-default-values`;
  }

  getSavedDataModelList(lang: string, datasetId:string, searchString: string) {
    return `${this.apiurl}/dataModel/get-core-header-list?lang=${lang}&searchString=${searchString}&${datasetId}`;
  }

  getAllPackages(pageNo, pageSize, searchString) {
    return `${this.apiurl}/package/get-all-packages?pageNo=${pageNo}&pageSize=${pageSize}&searchString=${searchString}`
  }

  getAllDataSets() {
    return `${this.apiurl}/module/get-all-modules?fetchcount=0&fetchsize=0&language=en`;
  }

  getAllRoles() {
    return `${environment?.apiurl}/profile/roles-list`;
  }

  getAllFlows() {
    return `${environment?.apiurl}/process/getProcessDefinitions`;
  }

  getAllForm() {
    return `${this.apiurl}/layout/get-all-forms?pageNo=0&pageSize=0`
  }

  savePackage() {
    return `${this?.apiurl}/package/createorupdate-package`;
  }

  getPackage(id, lang) {
    return `${this?.apiurl}/package/get-package?packageId=${id}&lang=${lang}`;
  }

  exportPackage(id) {
    return `${this?.apiurl}/package/export-package?packageId=${id}&lang=en`
  }

  getAllConnekthubPackage(searchString: string) {
    return `${this.apiurl}/get-all-connekthub-packages?type=SOLUTION_STANDARD&search=${searchString}`
  }

  importPackage(id) {
    return `${this.apiurl}/import-package/${id}`
  }
  getWorkFlowFieldsUrl(searchTerm = '', language = 'en') {
    return (
      this.apiurl + `/module/fields/get-wffields/${language}?searchTerm=${searchTerm}`
    );
  }

}
