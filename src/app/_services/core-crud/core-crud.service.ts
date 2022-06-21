import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChildDatasetsWithCount } from '@models/core/coreModel';
import { DeleteRecordsPayload, GenerateDescriptionResponse, MDORecord, NumberSettingCount, NumberSettingSavePayload, NumberSettingSaveResponse, NumberSettingsListPayload, NumberSettingsListResponse } from '@modules/transaction/model/transaction';
import { EndpointsCoreCrudService } from '@services/_endpoints/endpoints-core-crud.service';
import { EndpointsProcessService } from '@services/_endpoints/endpoints-process.service';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CoreCrudService {

  numberSettingChange: Subject<any> = new Subject<any>();

  constructor(
    private http: HttpClient,
    private endpointsService: EndpointsCoreCrudService,
    private endpointsProcessService: EndpointsProcessService
  ) { }

  /**
   * Save the object ....
   * @param datasetId module if of that dataset ...
   * @param data will return the obserable after save
   */
   public saveObject(datasetId: string, data: MDORecord): Observable<MDORecord> {
    data = data ? data : new MDORecord();
    data.controlData.moduleId = datasetId;
    return this.http.post<MDORecord>(this.endpointsService.saveObjectUrl(), data);
  }

  /**
   * Get the blank object for save information ....
   * @param moduleId the dataset id
   * @param language locale of the requested env.
   * @param plantCode tenant code of that user
   * @returns will return the blank MdoRecObjv3 object ...
   */
  public getTransactionDetails(moduleId: string, language: string, plantCode: string, formId: string): Observable<any> {
    return this.http.get(this.endpointsService.getEmptyObject(moduleId, language, plantCode, formId))
  }

  /**
   * Get the blank object for save information ....
   * @param uuid modules(noun) uuid
   * @returns will return the blank MdoRecObjv3 object ...
   */
  public getAttributeList(uuid: string): Observable<any> {
    return this.http.get(this.endpointsService.getModuleAttributeList(uuid));
  }

  /**
   * Get save records details
   */
  public getMDOCrRecord(moduleId: string, recordNumber: string, language: string, structureId: string, tenantId: string, dto: any, crId: string, dataEventId: string): Observable<any> {
    return this.http.post(this.endpointsService.getMDOCrRecordUrl(moduleId, recordNumber, language, structureId, tenantId, crId, dataEventId), dto);
  }

  public saveUpdateNumberSetting(body: NumberSettingSavePayload): Observable<NumberSettingSaveResponse> {
    return this.http.put<NumberSettingSaveResponse>(this.endpointsService.saveUpdateNumberSettingUrl(), body);
  }

  public getNumberSettingDetails(moduleId: string, uuid: string, fetchCnt = 0, fetchSize = 20, searchString = ''): Observable<NumberSettingSavePayload> {
    return this.http.get<NumberSettingSavePayload>(this.endpointsService.getNumberSettingDetailsUrl(moduleId, uuid, fetchCnt, fetchSize, searchString));
  }

  public getAllNumberSettings(payload: NumberSettingsListPayload, moduleId: string, searchString = '', fetchCnt = 0, fetchSize = 20): Observable<NumberSettingsListResponse> {
    return this.http.post<NumberSettingsListResponse>(this.endpointsService.getAllNumberSettingsUrl(moduleId, searchString, fetchCnt, fetchSize), payload);
  }

  public getNumberSettingCount(moduleId: string): Observable<NumberSettingCount> {
    return this.http.get<NumberSettingCount>(this.endpointsService.getNumberSettingCountUrl(moduleId));
  }

  public deleteNumberSetting(moduleId: string, uuid: string) {
    return this.http.delete(this.endpointsService.deleteNumberSettingUrl(moduleId, uuid));
  }

  /**
   * To delete the saved records
   */
  public deleteMDOCrRecords(payload: DeleteRecordsPayload) {
    return this.http.post(this.endpointsService.deleteMDORecrodUrl(), payload);
  }

  getRelatedChildRecords(childModuleId: string, parentModuleId: string, parentRecordNumber, fetchCount, fetchSize, searchString, lang, parentCrNumber) {
    return this.http.post(this.endpointsService.getRelatedChildRecordsUrl(), null, {params: {childModuleId, parentModuleId, parentRecordNumber, fetchCount, fetchSize, searchString, lang, parentCrNumber}});
  }

  public getSavedkeyFieldsHierarchy(moduleId: string, crNumber, recordNumber, tenantId, lang, taskId=''): Observable<any> {
    return this.http.post<any>(this.endpointsService.getSavedkeyFieldsHierarchyUrl(moduleId, lang), null, {params: {recordNumber, tenantId, crNumber, taskId}});
  }

  public getSavedkeyFieldsHierarchyV2(moduleId: string, crNumber, recordNumber, tenantId, lang, taskId=''): Observable<any> {
    return this.http.post<any>(this.endpointsService.getSavedkeyFieldsHierarchyUrlV2(moduleId, lang), null, {params: {recordNumber, tenantId, crNumber, taskId}});
  }


  public get getNumberSettingChange() {
    return this.numberSettingChange.asObservable();
  }

  public setNumberSettingChange(action, id) {
    this.numberSettingChange.next({action, id});
  }

  getRelatedDatasetsWithCount(parentModuleId: string, recordNumber, fetchCount, fetchSize, searchString, lang) {
    return this.http.post<any[]>(this.endpointsService.getRelatedDatasetsWithCountUrl(), null, {params: {parentModuleId, recordNumber, fetchCount, fetchSize, searchString, lang}})
      .pipe(map(allCds => {
        const childs: ChildDatasetsWithCount[] = [];
        if(!allCds) return [];
        Object.keys(allCds).forEach(dsId => {
          childs.push({
            childDatasetId: dsId,
            childDescription: allCds[dsId]?.description,
            count: allCds[dsId]
          });
        });
        return childs;
      }));
  }
}
