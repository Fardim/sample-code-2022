import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AllDatasetDetailsResponse, ChildDatasetsWithCount, DefaultValuesRequest, FieldMetaData, FieldsListByPickListPayload, FieldsListByPickListResponse, ObjectType, SaveModuleSuccess, VirtualDatasetResultData } from '@models/core/coreModel';
import { ModuleDetailsResponse } from '@models/core/module-details.response.model';
import { CreateFieldDto, DropdownOption, DropdownOptionsRequest, ReferenceDatasetPost } from '@models/list-page/listpage';
import { Dataset } from '@models/schema/schema';
import { Structure } from '@modules/list/_components/field/hierarchy-service/hierarchy.service';
import { FieldResponse, TabResponse } from '@modules/transaction/model/transaction';
import { Any2tsService } from '@services/any2ts.service';
import { EndpointsCoreService } from '@services/_endpoints/endpoints-core.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  BulkDeleteResponse,
  DatasetForm,
  DatasetFormCreateDto,
  DatasetFormCreateResponse,

  DatasetFormRequestDto, DraftFieldResponse, EditDataSetInfo, FieldActionResponse,
  Fieldlist,
  FieldlistContainer, FormTab, ListFieldIdResponse, TabFieldsResponse, UnassignedFieldsResponse, VirtualDataset
} from './../../_models/list-page/listpage';

@Injectable({
  providedIn: 'root',
})
export class CoreService {
  updateFieldPropertySubject: BehaviorSubject<Partial<FieldlistContainer>> = new BehaviorSubject<Partial<FieldlistContainer>>(null);
  updateFieldPropertySubject$ = this.updateFieldPropertySubject.asObservable();

  updateFieldFormValidationStatusSubject: BehaviorSubject<{ fieldId: string; isValid: boolean }> = new BehaviorSubject<{
    fieldId: string;
    isValid: boolean;
  }>(null);
  updateFieldFormValidationStatusSubject$ = this.updateFieldFormValidationStatusSubject.asObservable();
  updateChildFieldFormValidationStatusSubject: BehaviorSubject<{ fieldId: string; isValid: boolean }> = new BehaviorSubject<{
    fieldId: string;
    isValid: boolean;
  }>(null);
  updateChildFieldFormValidationStatusSubject$ = this.updateChildFieldFormValidationStatusSubject.asObservable();

  currentModuleIdSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  currentModuleIdSubject$ = this.currentModuleIdSubject.asObservable();

  updateDatasetFormSubject: BehaviorSubject<{ formId: string; form: DatasetFormCreateDto; isValid: boolean }> = new BehaviorSubject<{
    formId: string;
    form: DatasetFormCreateDto;
    isValid: boolean
  }>(null);
  updateDatasetFormSubject$ = this.updateDatasetFormSubject.asObservable();

  updateDatasetInfoSubject: BehaviorSubject<Partial<EditDataSetInfo>> = new BehaviorSubject<Partial<EditDataSetInfo>>(null);
  updateDatasetInfoSubject$ = this.updateDatasetInfoSubject.asObservable();

  closeDrawerSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  closeDrawerSubject$ = this.closeDrawerSubject.asObservable();

  updateDatasetFormCountSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  updateDatasetFormCountSubject$ = this.updateDatasetFormCountSubject.asObservable();

  updateDatasetRuleCountSubject: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  updateDatasetRuleCountSubject$ = this.updateDatasetRuleCountSubject.asObservable();

  updateBrRuleListSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  updateBrRuleListSubject$ = this.updateBrRuleListSubject.asObservable();

  updateDatasetView: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  updateDatasetView$ = this.updateDatasetView.asObservable();

  updateFormGridPermissions: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  updateFormGridPermissions$ = this.updateFormGridPermissions.asObservable();

  constructor(
      private http: HttpClient,
      private endpointsService: EndpointsCoreService,
      private any2tsService: Any2tsService,
    ) { }

  getSearchedParentModules(lang, searchQuery): Observable<any> {
    return this.http.get<ObjectType[]>(this.endpointsService.getSearchedModules(lang, searchQuery))
  }

  /**
   * has same functionality as getSearchedParentmodules() but implemented separately because cannot update latter due to dependancy issues with components relying on it.
   */
  getAllModulesByLanguageAndDescription(params: { lang?: string, description?: string } = { lang: 'en', description: '' }): Observable<ModuleDetailsResponse[]> {
    return this.http.get<ModuleDetailsResponse[]>(this.endpointsService.getSearchedModules(params.lang, params.description));
  }

  getAllObjectType(lang, fetchsize, fetchcount): Observable<ObjectType[]> {
    return this.http.get<ObjectType[]>(this.endpointsService.getAllObjectTypeUrl(), {
      params: { fetchcount, fetchsize, language: this.getLang(lang) },
    });
  }

  searchAllObjectType({ lang, fetchsize, fetchcount, description = '' }, body = []): Observable<any[]> {
    return this.http.post<any[]>(this.endpointsService.searchAllObjectTypeUrl(fetchcount, fetchsize, this.getLang(lang), description), body, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    });
  }

  public getAllFieldsForView(moduleId: string): Observable<FieldMetaData[]> {
    return this.http.get<FieldMetaData[]>(this.endpointsService.getAllFieldsForViewUrl(moduleId));
  }

  getObjectTypeDetails(moduleId, lang): Observable<ObjectType> {
    return this.http.get<ObjectType>(this.endpointsService.getObjectTypeDetailsUrl(moduleId, lang));
  }

  getEditObjectTypeDetails(moduleId): Observable<any> {
    return this.http.get<ObjectType>(this.endpointsService.getEditObjectTypeDetails(moduleId));
  }

  getMetadataByFields(moduleId, offset, searchString = '', size, lang?): Observable<any> {
    if (moduleId !== '' && lang) {
      return this.http
        .get<FieldMetaData[]>(this.endpointsService.getMetadataByFieldsUrl(moduleId, lang), {
          params: { fetchcount: offset, searchterm: searchString, fetchsize: size },
        })
        .pipe(
          map((data) => {
            const metadataFields: FieldMetaData[] = [];
            for (const key of Object.keys(data)) {
              if (typeof data[key][Object.keys(data[key])[0]] !== 'object') {
                const metadata: FieldMetaData = new FieldMetaData();
                metadata.fieldDescri = data[key].description;
                metadata.dataType = data[key].dataType;
                metadata.picklist = data[key].pickList;
                metadata.maxChar = data[key].maxChar;
                metadata.strucId = data[key].structureId;
                metadata.fieldId = key;
                metadataFields.push(metadata);
              }
            }
            return metadataFields;
          })
        );
    } else {
      return of([]);
    }
  }

  getFlowRefFields(body: string[], fetchCount=0, fetchSize=0, searchString = ''): Observable<any> {
    return this.http.post<any>(this.endpointsService.getFlowRefFieldsUrl(true, fetchCount, fetchSize, searchString), body)
      .pipe(map((res) => this.any2tsService.setMetadataDescription(res)));
  }

  saveModule(payload): Observable<SaveModuleSuccess> {
    return this.http.post<any>(this.endpointsService.saveModule(), payload);
  }

  getMetadataFieldsByModuleId(objectId: string[], searchString: string = '') {
    return this.http.post<any>(this.endpointsService.getMetadataFieldsByModuleIdUrl(searchString), objectId).pipe(map((res) => {
      return this.any2tsService.setMetadataDescription(res);
    }));
    // return of({ headers: [{ fieldId: 'MATL', fieldDescri: 'material location' }] });
  }

  getMetadataFieldsByModuleIds(objectId: string[], searchString: string = '', formId: any) {
    return this.http.post<any>(this.endpointsService.getMetadataFieldsByModuleIdUrls(searchString, formId), objectId).pipe(map((res) => {
      return this.any2tsService.setMetadataDescription(res);
    }));
    // return of({ headers: [{ fieldId: 'MATL', fieldDescri: 'material location' }] });

  }

  getMetadataFieldsData(formId: string,moduleId: number,): Observable<DefaultValuesRequest> {
    return this.http.get<DefaultValuesRequest>(this.endpointsService.getMetadataFieldsDataUrl(moduleId, formId));
  }

  getDatasetDetails(selectedDatasetId): Observable<any> {
    return this.http.get<any>(this.endpointsService.getDatasetDetails(selectedDatasetId));
  }

  getDropdownOptions(request: DropdownOptionsRequest, pageIndex, fieldId, lang): Observable<DropdownOption[]> {
    return this.http.post<any>(this.endpointsService.getDropdownOptionsUrl(pageIndex, fieldId, lang), request).pipe(
      map((res) => {
        if (res && res.content) {
          return res.content;
        } else {
          return [];
        }
      })
    );
  }

  getMetadatFieldsByFields(request, moduleId, lang): Observable<any> {
    return this.http.post<any[]>(this.endpointsService.getMetadataFieldsByFields(moduleId), request, { params: { LANGUAGE: lang } });
  }
  createField(moduleId: string, dto: Partial<CreateFieldDto>) {
    return this.http.post<FieldActionResponse>(this.endpointsService.getCreateFieldUrl(moduleId), dto);
  }
  updateField(moduleId: string, fieldId: string, dto: Partial<CreateFieldDto>) {
    return this.http.put<FieldActionResponse>(this.endpointsService.getUpdateFieldUrl(moduleId, fieldId), dto);
  }
  getFieldDetails(moduleId: string, fieldId: string) {
    return this.http.get<Fieldlist>(`${this.endpointsService.getFieldDetailsWithFieldIdUrl(moduleId)}?fieldid=${fieldId}`);
  }
  getSearchEngineFields(moduleId: string, language: string, fetchcount: number = 0, fetchsize: number = 20, searchterm: string = '') {
    return this.http.get<any>(
      `${this.endpointsService.getSearchEngineFieldsUrl(
        moduleId,
        language
      )}?fetchcount=${fetchcount}&fetchsize=${fetchsize}&searchterm=${searchterm}`
    );
  }
  removeFieldList(moduleId: string, fieldId: string) {
    return this.http.delete<any>(`${this.endpointsService.getRemoveFieldListUrl(moduleId, fieldId)}`);
  }

  getListFieldIdByStructure(
    moduleId: string,
    language: string,
    fetchcount: number = 0,
    fetchsize: number = 20,
    searchterm: string = '',
    requestDTO: { structureId: string }
  ) {
    return this.http.post<ListFieldIdResponse>(
      `${this.endpointsService.getListFieldIdByStructureUrl(moduleId, language)}?fetchcount=${fetchcount}&fetchsize=${fetchsize}`,
      requestDTO
    );
  }

  getListParentFields(
    moduleId: string,
    language: string,
    fetchcount: number = 0,
    fetchsize: number = 20,
    searchterm: string = '',
    requestDTO: { structureId: string }
  ) {
    return this.http.post<ListFieldIdResponse>(
      `${this.endpointsService.getListParentFieldsUrl(moduleId)}?fetchcount=${fetchcount}&fetchsize=${fetchsize}`,
      requestDTO
    );
  }

  getDraftField(moduleId: string, fieldId: string) {
    return this.http.get<Fieldlist>(`${this.endpointsService.getDraftFieldUrl(moduleId)}?fieldId=${fieldId}`);
  }

  putDraftField(moduleId: string, fieldData: Partial<CreateFieldDto>) {
    return this.http.put<DraftFieldResponse>(`${this.endpointsService.putDraftFieldUrl(moduleId)}`, fieldData);
  }

  bulkDeleteDraft(moduleId: string, bulkDeleteDto: { fieldIds: string[] }) {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: bulkDeleteDto,
    };
    return this.http.delete<BulkDeleteResponse>(`${this.endpointsService.bulkDeleteDraftUrl(moduleId)}`, options);
  }

  getDatasetFormList(
    moduleId: string,
    fetchcount: number = 0,
    fetchsize: number = 50,
    searchterm: string = '',
    dateCreated: number,
    dateModified: number,
    dto: DatasetFormRequestDto
  ) {
    return this.http.post<DatasetForm[]>(
      `${this.endpointsService.getDatasetFormListUrl(
        moduleId
      )}?fetchCount=${fetchcount}&fetchSize=${fetchsize}&searchTerm=${searchterm}&dateCreated=${dateCreated ? dateCreated : ''
      }&dateModified=${dateModified ? dateModified : ''}`,
      dto
    );
  }

  getNumberSettings(moduleId: string): any {
    const res = [
      { ruleName: 'Rule 1', dateModified: 1640245268709, userModified: 'User 1' },
      { ruleName: 'Rule 2', dateModified: 1640245268709, userModified: 'User Name One' }
    ];
    return of(res);
  }

  createDatasetForm(moduleId: string, dto: DatasetFormCreateDto) {
    return this.http.post<DatasetFormCreateResponse>(`${this.endpointsService.createDatasetFormUrl(moduleId)}`, dto);
  }

  updateDatasetForm(moduleId: string, formId: string, dto: DatasetFormCreateDto) {
    return this.http.put<DatasetFormCreateResponse>(`${this.endpointsService.updateDatasetFormUrl(moduleId, formId)}`, dto);
  }

  getFormsCount(moduleId: string) {
    return this.http.get<{ count: number }>(`${this.endpointsService.getFormsCountUrl(moduleId)}`);
  }

  getDatasetFormDetail(moduleId: string, layoutId: string) {
    return this.http.get<DatasetForm>(`${this.endpointsService.getDatasetFormDetailUrl(moduleId)}?layoutId=${layoutId}`);
  }

  getAllStructures(moduleId: string, language: string, fetchCount: number = 0, fetchSize: number = 10, searchTerm: string = '') {
    return this.http.get<Structure[]>(`${this.endpointsService.getAllStructures(moduleId, language, fetchCount, fetchSize, searchTerm)}`);
  }

  createRootStructure(moduleId: string, language: string) {
    const structure = new Structure();
    structure.isHeader = true;
    structure.strucDesc = 'Header Data';
    structure.language = language;
    structure.moduleId = moduleId;
    structure.parentStrucId = 0;
    structure.structureId = 1;
    return this.saveUpdateStructure(structure);
  }

  saveUpdateStructure(structure: Structure) {
    return this.http.post<any>(`${this.endpointsService.saveUpdateStructure()}`, structure);
  }

  deleteStructure(moduleId: string, structureId: number) {
    return this.http.delete<any>(`${this.endpointsService.deleteStructure(moduleId, structureId)}`);
  }

  updateDatasetInfo(moduleId: string, requestDto) {
    return this.http.put<any>(`${this.endpointsService.updateDatasetInfoUrl(moduleId)}`, requestDto);
  }

  searchTabFields(
    moduleId: string,
    layoutId: string,
    lang: string,
    fetchCount: number = 0,
    fetchSize: number = 20,
    searchTerm: string = ''
  ) {
    // return of(dummyTabFields)
    return this.http.get<TabFieldsResponse[]>(
      `${this.endpointsService.searchTabFieldsUrl(
        moduleId,
        layoutId,
        lang
      )}?fetchCount=${fetchCount}&fetchSize=${fetchSize}&searchTerm=${searchTerm}`
    );
  }

  searchUnassignedTabFields(
    moduleId: string,
    layoutId: string,
    lang: string,
    fetchCount: number = 0,
    fetchSize: number = 20,
    searchTerm: string = ''
  ) {
    return this.http
      .get<any>(
        `${this.endpointsService.searchUnassignedTabFieldsUrl(
          moduleId,
          layoutId,
          lang
        )}?fetchCount=${fetchCount}&fetchSize=${fetchSize}&searchTerm=${searchTerm}`
      )
      .pipe(
        map((resp) => {
          const headerFields: UnassignedFieldsResponse[] = [];
          const hierarchyFields: UnassignedFieldsResponse[] = [];
          Object.keys(resp).forEach((key) => {
            if (resp[key].hasOwnProperty('structureId')) {
              const tabField = { ...resp[key], fieldId: key, fieldType: 'FIELD' };
              headerFields.push({ fields: [tabField], headerStructure: 'headerData' } as UnassignedFieldsResponse);
            } else {
              const hierarchy = { hierarchyId: key, hierarchyDesc: `Hierarchy_${key}`, fields: [] };
              Object.keys(resp[key]).forEach((subKey, index) => {
                if (index === 0) {
                  const strucDesc = resp[key][subKey]?.strucDesc;
                  hierarchy.hierarchyDesc = strucDesc ? strucDesc : `Hierarchy_${key}`;
                }
                hierarchy.fields.push({ ...resp[key][subKey], fieldId: subKey, fieldType: 'FIELD' });
              });
              hierarchyFields.push(hierarchy);
            }
          });
          return headerFields.concat(hierarchyFields);
        })
      );
  }

  getDatasetFormTabs(layoutId: string, lang: string, fetchCount: number, fetchSize: number, structureId: number[]): Observable<TabResponse[]> {
    return this.http.post<TabResponse[]>(this.endpointsService.getDatasetFormTabsUrl(layoutId, lang, fetchCount, fetchSize), { structureIds: structureId });
  }

  getDatasetFormTabBytCode(layoutId: string, tCode: string): Observable<TabResponse> {
    return this.http.get<TabResponse>(`${this.endpointsService.getDatasetFormTabBytCodeUrl(layoutId)}?tCode=${tCode}`);
  }

  saveDatasetFormTabsDetails(formDetails: FormTab[], moduleId: string, layoutId: string, language = 'en') {
    return this.http.post<any>(this.endpointsService.saveDatasetFormTabsDetailsUrl(moduleId, layoutId, language), formDetails);
  }

  getDatasetFormTabsDetails(moduleId: string, layoutId: string, language = 'en') {
    return this.http.get<FormTab[]>(this.endpointsService.getDatasetFormTabsDetailsUrl(moduleId, layoutId, language));
  }

  nextUpdateDatasetView(data) {
    this.updateDatasetView.next(data);
  }

  nextUpdateFormGridPermissions(data) {
    this.updateFormGridPermissions.next(data);
  }

  nextUpdateCurrentModuleId(moduleId: number) {
    this.currentModuleIdSubject.next(moduleId);
  }

  nextUpdateFieldPropertySubject(fieldlistContainer: Partial<FieldlistContainer>) {
    this.updateFieldPropertySubject.next(fieldlistContainer);
  }

  nextUpdateDataSetInfoSubject(datasetInfo: Partial<EditDataSetInfo>) {
    this.updateDatasetInfoSubject.next(datasetInfo);
  }

  nextUpdateFieldFormValidationStatusSubject(data: { fieldId: string; isValid: boolean }) {
    this.updateFieldFormValidationStatusSubject.next(data);
  }

  nextUpdateChildFieldFormValidationStatusSubject(data: { fieldId: string; isValid: boolean }) {
    this.updateChildFieldFormValidationStatusSubject.next(data);
  }

  nextUpdateDatasetFormSubject(data: { formId: string; form: DatasetFormCreateDto; isValid: boolean }) {
    this.updateDatasetFormSubject.next(data);
  }

  nextUpdateFormCount(data: boolean) {
    this.updateDatasetFormCountSubject.next(data);
  }

  nextUpdateRuleCount(data: number) {
    this.updateDatasetRuleCountSubject.next(data);
  }

  updateBrRuleList(data: boolean) {
    this.updateBrRuleListSubject.next(data);
  }

  closeEditDatasetFormDrawe(data) {
    this.closeDrawerSubject.next(data);
  }

  getDatasetBusinessRuleList(fetchcount: number = 0, fetchsize: number = 50, dto) {
    const obj = {
      pageInfo: {
        pageSize: fetchsize,
        pageNumer: fetchcount,
      },
      ...dto,
    };

    return this.http.post<any[]>(`${this.endpointsService.getDatasetBusinessRuleListUrl()}`, obj);
  }

  /**
   * Get the dataset with search and scroll
   * @param s searchString for desc ...
   * @param _page fetchCount
   * @param _size fetchSize
   * @param language the login language
   * @param moduleIds the datasets ids
   * @returns will return the Observable fo Dataset[]
   */
  public getDataSets(s?: string, _page?: any, _size?: any, language?: string, moduleIds?: number[]): Observable<Dataset[]> {
    const body = moduleIds ? moduleIds : [];
    const params = { description: s ? s : '', page: _page, fetchCount: _page ? _page : '0', fetchSize: '20', language: language ? language : 'en' };
    return this.http.post<Dataset[]>(this.endpointsService.getAllObjectTypeV2Url(), body, { params });
  }

  exportSchema(moduleId, language): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this.http.get(this.endpointsService.exportDataset(moduleId, language), { headers, responseType: 'text' });
  }

  saveVirtualDataSet(payload): Observable<VirtualDatasetResultData> {
    return this.http.post<any>(this.endpointsService.saveVirtualDataSet(), payload);
  }
  getVirtualDataList(tenantId: string, page, size, searchstring: string = ''): Observable<VirtualDataset[]> {
    return this.http.get<VirtualDataset[]>(this.endpointsService.getVirtualDataList(), {
      params: {
        tenantId,
        page,
        size,
        searchstring
      }
    });
  }

  getTabFields(moduleId: string, tabId: string, fetchCount: number, fetchSize: number, structureId: number[], locale: string, flowId: string, userStepId: string): Observable<FieldResponse[]> {
    return this.http.post<FieldResponse[]>(this.endpointsService.getTabFieldsUrl(moduleId, tabId, fetchCount, fetchSize, locale, flowId, userStepId), { structureIds: structureId });
  }

  getLang(lang: string) {
    if (lang) {
      const res = lang.split('-');
      return res[0];
    } else {
      return 'en';
    }
  }


  /**
   * Import the file and validate the request ...
   * @param file the file which is going to create module / dataset
   */
  importDatasetValid(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(this.endpointsService.importValidateUrl(), formData);
  }


  /**
   * Import the the file into the tenant id ....
   * @param file the file which is going to create module / dataset
   */
  importModule(file: File, keepCopy: any, replaceOld: any): Observable<any> {
    console.log(file);
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(this.endpointsService.importModuleUri(), formData, { params: { keepCopy, replaceOld } });
  }

  /**
   * Update the package id for the dataset ...
   * @param datasetId the module id ..
   * @param packageId the package id which is published ...
   * @returns will return the obserable
   */
  updatePackageId(datasetId: string, packageId: string): Observable<any> {
    return this.http.put(this.endpointsService.updatePackageIdUrl(datasetId, packageId), null);
  }

  updateSchemaPackageId(schemaId: string, packageId: string): Observable<any> {
    return this.http.put(this.endpointsService.updateSchemaPackageIdUrl(schemaId, packageId), null);
  }


  getFieldsListByPickList(payload: FieldsListByPickListPayload, moduleId: string, lang = 'en', fetchCnt = 0, fetchSize = 20): Observable<FieldsListByPickListResponse> {
    return this.http.post<FieldsListByPickListResponse>(this.endpointsService.getFieldsListByPickListUrl(moduleId, lang, fetchCnt, fetchSize), payload);
  }

  getAllPVMappings(flowId: number) {
    return this.http.get(this.endpointsService.getAllPVMappingsUrl(flowId));
  }
  getAllCPMappings(flowId: any, fetchCount: any, fetchSize: any) {
    return this.http.get(this.endpointsService.getAllCPMappingsUrl(flowId, fetchCount, fetchSize));
  }
  deleteCPMapping(flowId: string) {
    return this.http.delete(this.endpointsService.deleteCPMappingUrl(flowId));
  }
  saveDataSetMapping(flowId: number, mappingData: any) {
    return this.http.post(this.endpointsService.saveDataSetMappingUrl(flowId), mappingData);
  }
  savePVMapping(flowId: number, mappingData: any) {
    return this.http.post(this.endpointsService.savePVMappingUrl(flowId), mappingData);
  }
  getAllLayoutDetails(language: string, fetchCount: number, fetchSize: number, searchTerm: string) {
    return this.http.get<any>(`${this.endpointsService.getAllLayoutDetailsUrl(fetchCount, fetchSize, language, searchTerm)}`);
  }
  getLayoutList(moduleId: any, fetchCount: any, fetchSize: any, dateModified: any, dateCreated: any, listFilter: any, searchTerm: any, ifforflow?: boolean) {
    const data = {
      listFilters: {
      }
    }
    return this.http.post<any>(`${this.endpointsService.getLayoutListUrl(moduleId, fetchCount, fetchSize, dateModified, dateCreated, searchTerm, ifforflow ? ifforflow : false)}`, data);
  }
  getKeyFieldsByStructureId(moduleId, structureId, fetchCount, fetchSize, searchTerm) {
    return this.http.get<any>(this.endpointsService.getKeyFieldsByStructureIdUrl(moduleId, structureId, fetchCount, fetchSize, searchTerm));
  }

  deleteLayout(layoutId: string) {
    return this.http.delete<any>(`${this.endpointsService.deleteLayoutUrl()}?layoutId=${layoutId}`);
  }
  deleteModuleById(moduleId: number | string) {
    return this.http.delete<any>(this.endpointsService.deleteModuleById(moduleId));
  }
  getReferenceField(moduleId: string, fieldId: string) {
    return this.http.get(`${this.endpointsService.getReferenceField(moduleId, fieldId)}`);
  }

  saveReferenceFields(moduleId: string, postData: ReferenceDatasetPost) {
    return this.http.post(`${this.endpointsService.saveReferenceField(moduleId)}`, postData);
  }

  tableDescFields(fetchcount: number = 0, fetchsize: number = 50, requestDTO, moduleId: any, lang = 'en') {
    return this.http.post<any[]>(`${this.endpointsService.tableDescFields(lang, moduleId)}?fetchcount=${fetchcount}&fetchsize=${fetchsize}`, requestDTO);
  }

  getGridColumns(fetchCount: number = 0, fetchSize: number = 50, gridField = '', moduleId: any, lang = 'en', searchTerm = '') {
    return this.http.get<any[]>(`${this.endpointsService.getGridColumns(lang, moduleId)}?fetchCount=${fetchCount}&fetchSize=${fetchSize}&gridField=${gridField}&searchTerm=${searchTerm}`);
  }

  getRelatedDatasets(parentModuleId: string, fetchCount, fetchSize, searchString, lang) {
    return this.http.get<ChildDatasetsWithCount[]>(this.endpointsService.getRelatedDatasetsUrl(), { params: { parentModuleId, fetchCount, fetchSize, searchString, lang } });
  }

  // to delete the key property from nested json
  removeKeyFromObject(obj, key) {
    for (const i in obj) {
      if (!obj.hasOwnProperty(i)) continue;
      if (typeof obj[i] === 'object') {
        this.removeKeyFromObject(obj[i], key);
      } else if (i === key) {
        delete obj[key];
      }
    }
    return obj;
  }

  /**
   * Duplicate the exiting form ...
   * @param datasetId the module id
   * @param layoutId the form id
   * @returns true if sucess otherwise error
   */
  duplicateForm(datasetId: string, layoutId: string): Observable<boolean> {
    return this.http.get<boolean>(this.endpointsService.duplicateFormUrl(datasetId), { params: { layoutId } });
  }

  mapFldMetadata(metadata: any[]) {
    const fieldsMetadata = [];
    metadata.forEach(field => {
      const metadata: FieldMetaData = new FieldMetaData();
      metadata.fieldDescri = field.description;
      metadata.dataType = field.dataType;
      metadata.picklist = field.pickList;
      metadata.maxChar = field.maxChar;
      metadata.strucId = field.structureId;
      metadata.fieldId = field.fieldId;
      fieldsMetadata.push(metadata);
    });
    return fieldsMetadata;
  }

  /**
   * Get All Dataset Details
   */
  getAllDatasetDetails(layoutId: string, lang: string, fetchSize: number, fetchCount: number) {
    return this.http.get<AllDatasetDetailsResponse[]>(this.endpointsService.getAllDatasetDetailsUrl(layoutId, fetchCount, fetchSize, lang));
  }

  getAllNumberSettingsFields(moduleId, lang) {
    return this.http.get<any>(this.endpointsService.getAllNumberSettingsFields(moduleId, lang));
  }

  getAlternateNumberField() {
    return of([
      {
        fieldId: "FLD_28784345",
        fieldDescri: 'Alternate number field 1'
      },
      {
        fieldId: "FLD_287834567",
        fieldDescri: 'Alternate number field 2'
      }
    ])
  }

  getFieldData(currenttDatasetId: string, referenceDataSetId: string, recordId: string, reqPayload: any, lang: string) {
    reqPayload = null; // setting up as a null for now ...
    return this.http.post(this.endpointsService.getFieldDataUrl(currenttDatasetId, referenceDataSetId, recordId, lang), reqPayload);
  }

  public saveDefaultValues(request: DefaultValuesRequest) {
    return this.http.post<any>(this.endpointsService.getsaveDefaultValuesUrl(), request);
  }

  getAllDataModelList(lang: string, datasetId: string, searchString: string) {
    return this.http.get<any>(this.endpointsService?.getSavedDataModelList(lang, datasetId, searchString));
  }

  getAllPackages(pageNo, pageSize, searchString) {
    return this.http.get<any>(this.endpointsService?.getAllPackages(pageNo, pageSize, searchString));
  }

  getAllDataSets(){
    return this.http.get<any>(this.endpointsService?.getAllDataSets());
  }

  getAllRoles() {
    return this.http.post<any>(this.endpointsService?.getAllRoles(),
    {
      pageInfo: {pageNumer: 0, pageSize: 20},
      searchString: ""
    });
  }

  getAllFlows() {
    return this.http.post<any>(this.endpointsService?.getAllFlows(), {});
  }

  getAllForms() {
    return this.http.get<any>(this.endpointsService?.getAllForm());
  }

  savePackage(payload) {
    return this.http.post<any>(this.endpointsService?.savePackage(), payload);
  }

  getPackageDetail(id, lang) {
    return this.http.get<any>(this.endpointsService.getPackage(id, lang));
  }

  exportPackage(packageId) {
    return this.http.get<any>(this.endpointsService?.exportPackage(packageId));
  }

  getAllConnekthubPackage(searchString: string) {
    return this.http.get<any>(this.endpointsService?.getAllConnekthubPackage(searchString));
  }

  importPackage(id) {
    return this.http.get<any>(this.endpointsService?.importPackage(id));
  }
  getWorkFlowFields(objectId: string[], searchString: string = ''): Observable<any> {
    return this.http.post<any>(this.endpointsService.getWorkFlowFieldsUrl(searchString), objectId).pipe(map((res) => {
      return this.any2tsService.setWfMetadataDescription(res);
    }));
  }

}

