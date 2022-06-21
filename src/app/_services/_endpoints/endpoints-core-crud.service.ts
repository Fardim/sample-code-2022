import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EndpointsCoreCrudService {

  readonly apiUrl = environment.apiurl + '/core-crud';

  readonly apiUrlCore = environment.apiurl + '/core';

  constructor() { }

  /**
   * Get the endpoint for get empty object
   * @param moduleId the dataset id ...
   * @param language the locale code
   * @param plantCode tenant code for same
   * @returns will return the uri for same
   */
  getEmptyObject(moduleId: string, language: string, plantCode: string, formId: string) {
    return this.apiUrlCore + `/module/${moduleId}/template/${language}?tenantId=${plantCode}&formId=${formId}`
  }

  /**
   * Get the endpoint for save the object ..
   * @returns the url for same ...
   */
  saveObjectUrl() {
    return `${this.apiUrl}/save/records`;
  }

  /**
   * Get the endpoint for get empty object
   * @param uuid modules(noun) uuid
   * @returns will return the uri for same
   */
  getModuleAttributeList(uuid: string) {
    return environment.apiurl + `/rule/characterstics/get-characteristics-list/${uuid}`;
  }

  /**
   * Get the endpoint for getting the saved records..
   * @returns the url for same...
   */
  getMDOCrRecordUrl(moduleId: string, recordNumber: string, language: string, structureId: string, tenantId: string, crId: string, dataEventId: string) {
    if (crId && dataEventId === '2') {
      return this.apiUrl + `/get/${moduleId}/record/${language}?recordNumber=&structureId=${structureId}&crNumber=${crId}`;
    }
    return this.apiUrl + `/get/${moduleId}/record/${language}?recordNumber=${recordNumber}&structureId=${structureId}`;
  }

  /**
   * Get the endpoint for delete a record...
   * @returns the url for same...
   */
  deleteMDORecrodUrl() {
    return `${this.apiUrl}/delete/records`;
  }

  saveUpdateNumberSettingUrl(): string {
    return `${this.apiUrl}/nextnumber/save-update-setting`;
  }

  getNumberSettingDetailsUrl(moduleId: string, uuid: string, fetchCnt: number, fetchSize: number, searchString: string): string {
    return `${this.apiUrl}/nextnumber/get-number-setting?moduleId=${moduleId}&uuid=${uuid}&fetchCount=${fetchCnt}&fetchSize=${fetchSize}&searchString=${searchString}`;
  }

  getAllNumberSettingsUrl(moduleId: string, searchString: string, fetchCnt: number, fetchSize: number): string {
    return `${this.apiUrl}/nextnumber/get-all-number-setting/${moduleId}?searchString=${searchString}&fetchCount=${fetchCnt}&fetchSize=${fetchSize}`;
  }

  getNumberSettingCountUrl(moduleId: string): string {
    return `${this.apiUrl}/nextnumber/count-number-setting/${moduleId}`;
  }

  deleteNumberSettingUrl(moduleId: string, uuid: string): string {
    return `${this.apiUrl}/nextnumber/delete-number-setting/${moduleId}/${uuid}`;
  }

  getRelatedChildRecordsUrl() {
    return `${this.apiUrl}/getAllChildRecordDetail`;
  }

  getRelatedDatasetsWithCountUrl() {
    return `${this.apiUrl}/getAllChildRecordCountDetail`;
  }

  getSavedkeyFieldsHierarchyUrl(moduleId: string, lang: string) {
    return `${this.apiUrl}/get/${moduleId}/record/key/${lang}`;
  }

  getSavedkeyFieldsHierarchyUrlV2(moduleId: string, lang: string) {
    return `${this.apiUrl}/get/${moduleId}/record/key/V2/${lang}`;
  }

  /**
   * returns [[API_DOMAIN]]/core-crud/schema/spaces
   */
  public getSchemaSpaces(): string {
    return `${this.apiUrl}/schema/spaces`;
  }

  /**
   * returns [[API_DOMAIN]]/core-crud/table/counts
   */
  public getTableCounts(): string {
    return `${this.apiUrl}/table/counts`;
  }

  /**
   * returns [[API_DOMAIN]]/core-crud/table/spaces
   */
  public getTableSpaces(): string {
    return `${this.apiUrl}/table/spaces`;
  }
}
