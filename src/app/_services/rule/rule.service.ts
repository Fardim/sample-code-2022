import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FieldMetaData, StructuresResponse } from '@models/dependencyRules';
import { BusinessRuleType, CoreSchemaBrInfo } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { GenerateDescriptionResponse } from '@modules/transaction/model/transaction';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ListValue, ListValueActionResponse, ListValueResponse, ListValueSaveModel } from './../../_models/list-page/listpage';
import { EndpointsRuleService } from './../_endpoints/endpoints-rule.service';
import { ClassificationDataReq } from '@models/description/description.model';
@Injectable({
  providedIn: 'root'
})
export class RuleService {

  dropvalSubject: BehaviorSubject<ListValueSaveModel> = new BehaviorSubject<ListValueSaveModel>(null);
  dropvalSubject$ = this.dropvalSubject.asObservable();

  alreadtUpdatedDropvalListSubject: BehaviorSubject<ListValueSaveModel[]> = new BehaviorSubject<ListValueSaveModel[]>([]);
  alreadtUpdatedDropvalListSubject$ = this.alreadtUpdatedDropvalListSubject.asObservable();


  constructor(private http: HttpClient, private endpointsRuleService: EndpointsRuleService) { }

  getDropvals(moduleId: string, fieldId: string, lang: string, dto: { searchString: string; parent: any,fetchCount?: number,fetchSize?: number }) {
    return this.http.post<ListValueResponse>(this.endpointsRuleService.getDropvalsUrl(moduleId, fieldId, lang), dto);
  }

  getDropDownDetailsByFieldId(moduleId: string, searchString: string, dto = []) {
    return this.http.post<any>(this.endpointsRuleService.getDropDownDetailsByFieldId(moduleId, searchString), dto);
  }

  saveDropvals(dropvals: Partial<ListValue>[], moduleId: string, fieldId: string, lang: string) {
    return this.http.post<ListValueActionResponse>(this.endpointsRuleService.getSaveDropvalsUrl(moduleId, fieldId, lang), dropvals);
  }
  deleteDropvals(moduleId: string, fieldId: string, textref: string, lang: string,payload) {
    const options = {
      headers: new HttpHeaders({
        'Content-Type':'application/json'
      }),
      body:payload
    }
    return this.http.delete<ListValueActionResponse>(`${this.endpointsRuleService.getDeleteDropvalsUrl()}?moduleId=${moduleId}&fieldId=${fieldId}&textref=${textref}&lang=${lang}`,options);
  }
  getTenentRoles(lang: string, dto: { searchString: string; parent: any }) {
    return this.http.post(this.endpointsRuleService.getTenentRolesUrl(lang), dto)
  }
  getAllStructures(lang: string, moduleId: string, fetchCount: number, fetchSize: number, searchTerm: string) {
    return this.http.get<StructuresResponse[]>(this.endpointsRuleService.getAllStructuresUrl(lang, moduleId, fetchCount, fetchSize, searchTerm))
  }
  getRuleDetails(groupId) {
    return this.http.get<any>(this.endpointsRuleService.getRuleDetailsUrl(groupId))
  }
  getStructureFields(lang: string, moduleId: string, fetchCount: number, fetchSize: number, structureId: number) {
    console.log(fetchCount, fetchSize);
    return this.http.get<FieldMetaData[]>(this.endpointsRuleService.getStructureFieldsUrl(lang, moduleId, fetchCount, fetchSize, structureId))
  }
  getModuleRules(moduleId: string, bodyObject) {
    return this.http.post<any>(this.endpointsRuleService.getModuleRulesUrl(moduleId), bodyObject);
  }
  saveModuleRules(moduleId: string, bodyObject) {
    return this.http.post<any>(this.endpointsRuleService.getSaveModuleRulesUrl(moduleId), bodyObject);
  }
  updateModuleRules(moduleId: string, groupId: string, bodyObject) {
    return this.http.post<any>(this.endpointsRuleService.getUpdateModuleRulesUrl(moduleId, groupId), bodyObject);
  }
  nextDropvalSubject(dropvals: ListValueSaveModel) {
    this.dropvalSubject.next(dropvals);
  }
  nextAlreadtUpdatedDropvalListSubject(dropvalList: ListValueSaveModel[]) {
    this.alreadtUpdatedDropvalListSubject.next(dropvalList);
  }
  updateRulesmetaData(body) {
    console.log(body)
    return this.http.put<any>(this.endpointsRuleService.getUpdateRuleMetaDataUrl(), body)
  }
  deleteGroup(groupId) {
    return this.http.delete<any>(this.endpointsRuleService.getDeleteGroupUrl(groupId), {})
  }
  getFieldDettails(moduleId, fieldId) {
    return this.http.get<any>(this.endpointsRuleService.getFieldDetailsUrl(moduleId, fieldId), {})
  }
  getDropdownOfPickList(moduleId, fieldId, lang, bodyarray) {
    return this.http.post<any>(this.endpointsRuleService.getDropdownofPickListUrl(moduleId, fieldId, lang), bodyarray)
  }
  saveGroupConditions(moduleId, groupId, lang, bodyarray: any[]) {
    return this.http.post<any>(this.endpointsRuleService.getgSaveConditionsUrl(moduleId, groupId, lang), bodyarray)
  }
  getGroupDetails(groupId) {
    return this.http.get<any>(this.endpointsRuleService.getRuleDetailsUrl(groupId));
  }
  getGroupConditions(groupId, lang, body) {
    return this.http.post<any>(this.endpointsRuleService.getGroupConditionsUrl(groupId, lang), body);
  }
  deleteGroupConditions(groupId, mappingId) {
    return this.http.delete<any>(this.endpointsRuleService.getDeleteGroupConditionsUrl(groupId, mappingId));
  }
  getGroupConditionByMappingId(groupId, mappingId, lang) {
    return this.http.get<any>(this.endpointsRuleService.getConditionByMappingIdUrl(groupId, mappingId, lang));
  }
  saveUpdateClassType<S, T>(classTypeData: S) {
    return this.http.post<T>(this.endpointsRuleService.saveUpdateClassType(), classTypeData);
  }
  saveCharacteristicsList<S, T>(characteristicsData, uuid: string) {
    return this.http.post<T>(this.endpointsRuleService.getSaveCharacteristicsListUrl(uuid), characteristicsData);
  }
  saveCharacteristics<S, T>(characteristics: S, uuid: string) {
    return this.http.post<T>(this.endpointsRuleService.getSaveCharacteristicsUrl(uuid), characteristics);
  }
  deleteCharacteristic(uuid: string) {
    return this.http.delete(this.endpointsRuleService.getDeleteCharacteristicUrl(uuid));
  }

  saveUpdateClass<S, T>(classData: S) {
    return this.http.post<T>(`${this.endpointsRuleService.saveUpdateClass()}`, classData);
  }

  getClassTypeDetails<S, T>(classTypeID: string) {
    return this.http.get<T>(this.endpointsRuleService.getClassTypeDetails(classTypeID));
  }

  getAllClassTypes(page: number, pageSize: number, searchString: string, datasets: string[]) {
    return this.http.post<any>(this.endpointsRuleService.getAllClassTypesUrl(page, pageSize, searchString), datasets);
  }

  getClassDetails<S, T>(classId: string) {
    return this.http.get<T>(this.endpointsRuleService.getClassDetails(classId));
  }

  getColloquialNames(classId) {
    return this.http.get<any>(this.endpointsRuleService.getColloquialNamesUrl(classId));
  }

  getAllBusinessRules(fetchCount, fetchSize, searchString) {
    return this.http.get<any>(this.endpointsRuleService.getAllBusinessRulesUrls(fetchCount,fetchSize, searchString));
  }

  /**
   * Reimplementation of {@link getAllBusinessRules()} with response typings {@link RuleMetaData}
   */
  getAllBusinessRulesMetadata() {
    return this.http.get<CoreSchemaBrInfo[]>(this.endpointsRuleService.getAllBusinessRulesUrl());
  }

  getBrListDaxeUdr(brType: any, fetchCount: any, fetchSize: any, moduleId: any,searchString): Observable<CoreSchemaBrInfo[]> {
    if(!brType) {
      console.info(`Hitting api without business rule id...`);
    }
    if(!moduleId) {
      throw new Error(`Dataset id can't be null or empty`);
    }
    return this.http.get<CoreSchemaBrInfo[]>(this.endpointsRuleService.getBrListDaxeUdrUrl(brType, fetchCount, fetchSize, moduleId, searchString));
  }

  validateRule(moduleId: string, schemaId: string = '', validationRequestDTO: any) {
    return this.http.post<any>(this.endpointsRuleService.validateRecord(), validationRequestDTO, { params: { moduleId, schemaId } });
  }
  getClassMapping<S, T>(classId: string) {
    return this.http.get<T>(this.endpointsRuleService.getClassMapping(classId));
  }
  getAllClasses(page, searchString, size) {
    return this.http.get<any>(this.endpointsRuleService.getAllClassesUrl(page, searchString, size));
  }
  getCharacteristicsList<R>(uuid: string, page: number, size: number = 20, searchString: string = '', tanentId: string = '0', type: string = '', dimension: string = '') {
    return this.http.get<R>(this.endpointsRuleService.getCharacteristicsListUrl(uuid, page, searchString, size, tanentId, type, dimension));
  }

  getClassInfo(uuid: string) {
    return this.http.get<any>(this.endpointsRuleService.getClassInfo(uuid));
  }

  deleteClasstype(classtypeId, flag) {
    return this.http.delete<any>(this.endpointsRuleService.getDeleteClasstypeUrl(classtypeId, flag));
  }

  getDeleteAllClassesByClassType(uuid, flag) {
    return this.http.delete<any>(this.endpointsRuleService.getDeleteAllClassesByClassTypeUrl(uuid, flag));
  }

  deleteClass(uuid) {
    return this.http.delete<any>(this.endpointsRuleService.getDeleteClassUrl(uuid));
  }

  saveUpdateColloquialList<S, T>(colloquialList:S, uuid: string) {
    return this.http.post<T>(`${this.endpointsRuleService.saveUpdateColloquialList(uuid)}`, colloquialList);
  }

  saveUpdateClassMapping(payload) {
    return this.http.post<any>(`${this.endpointsRuleService.saveUpdateClassMapping()}`, payload);
  }

  public saveDimensions<P, R>(data: P) {
    return this.http.post<R>(this.endpointsRuleService.saveDimensions(), data);
  }

  public getDimensions<T>() {
    return this.http.get<T>(this.endpointsRuleService.getDimensionsUrl());
  }

  getDimensionsById<T>(uuid: string) {
    return this.http.get<T>(this.endpointsRuleService.getDimensionsByIdUrl(uuid));
  }
  saveUpdateCharacteristicsList<S,T>(CharacteristicList)
  {
    return this.http.post<T>(this.endpointsRuleService.saveUpdateCharacteristicOrderList(), CharacteristicList);
  }
  reorderCharacteristicList<S,T>(payload: S)
  {
    return this.http.post<T>(this.endpointsRuleService.getReorderCharacteristicListUrl(), payload);
  }
  getBusinessRulesCount(moduleId: string) {
    return this.http.get<number>(`${this.endpointsRuleService.getBusinessRulesCountUrl(moduleId)}`);
  }

  uploadCSV(classTypeId,classType,fileData){
    const payload = new FormData();
    payload.append('file', fileData);
    return this.http.post(this.endpointsRuleService.uploadCSVUrl(classTypeId,classType),payload);
  }

  downloadTaxonomy(classTypeId,classType, langague){
    const payload = {}
    return this.http.post(this.endpointsRuleService.downloadTaxonomy(classTypeId,classType, langague),payload);
  }

  /**
 * To get all class mapping
 * @param moduleId modules(dataset) uuid
 * @param seachString search letters
 * @returns will return the class array of object ...
 */
  public getAllClass(moduleId: string, seachString: string) {
    return this.http.get(this.endpointsRuleService.getModuleClass(moduleId, seachString));
  }

  public getGenDescription(payload): Observable<GenerateDescriptionResponse> {
    return this.http.post<GenerateDescriptionResponse>(this.endpointsRuleService.getDescriptionUrl(), payload);
  }

  /**
   * Get the buisness rule based on @param ruleType and
   * @param ruleType the business rules which used to get the things based on this ...
   * @param datasetId the module or datasets which helpfull to get the rule using this ...
   * @param fetchCount pagination start indx
   * @param fetchSize pagination end indx
   * @param searchStr the query string serach parameters
   * @returns will return the business rules ...
   */
  public getBusinessRulesByTypes(ruleType: BusinessRuleType[] , datasetId: string[], fetchCount: string , fetchSize: string, queryString?: string) : Observable<CoreSchemaBrInfo[]> {
    const request = {
      ruletype: ruleType || [],
      moduleid: datasetId || []
    }
    fetchCount = fetchCount || '0';
    fetchSize = fetchSize || '50';
    queryString = queryString || '';
    return this.http.post(this.endpointsRuleService.getBusinessRulesBasedOnType(),request,{params:{fetchCount, fetchSize, queryString}}).pipe(map(m=> {
      return m['ruleMetaData'];
    }));
  }

  public translateClassTypes(classes,sourceLang,targetLangs)
  {
    const payload = {
            classes,
            sourceLang,
            targetLangs
          }
    return this.http.post(this.endpointsRuleService.translateClassTypes(), payload);
  }

  public dropDownBulkUpload(formData: FormData) {
    return this.http.post(this.endpointsRuleService.dropDownBulkUpload(), formData);
  }
  public dropDownDownload(moduleId: string, fieldId: string) {
    return this.http.get(this.endpointsRuleService.dropDownDownload(moduleId, fieldId), {responseType: 'text'});
  }
  getCharacteristics<R>(uuid: string) {
    return this.http.get<R>(this.endpointsRuleService.getCharacteristicsUrl(uuid));
  }
  getClassificationHierarchyTree(schemaId: string, search = '', isCorrection = false) {
    return this.http.post(this.endpointsRuleService.getClassificationHierarchyTreeUrl(), {schemaId, search}, {params: {isCorrection}});
  }

  getClassificationData(request: ClassificationDataReq, isUnknown=false) {
    return this.http.post(this.endpointsRuleService.getClassificationDataUrl(), request, {params: {isUnknown}});
  }

  generateDescription(request: any, moduleId, channelId, userId) {
    return this.http.post(this.endpointsRuleService.generateDescriptionUrl(moduleId, channelId, userId), request);
  }

  getClassificationCorrData(request: ClassificationDataReq) {
    return this.http.post(this.endpointsRuleService.getClassificationCorrDataUrl(), request);
  }
}
