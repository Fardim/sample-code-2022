import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Criteria, DropDownValues, LayoutConfigWorkflowModel, ReportingWidget } from '../_models/widget';
import { PermissionOn, ReportDashboardPermission, WidgetDownloadUser } from '@models/collaborator';
import { EndpointsAnalyticsService } from 'src/app/_services/_endpoints/endpoints-analytics.service';
import { EndpointsClassicService } from '@services/_endpoints/endpoints-classic.service';
import { ObjectTypeResponse } from '@models/schema/schema';
import { BehaviorSubject } from 'rxjs';
import { EmailTemplateBody, EmailRequestBody, EmailResponseBody, EmailTemplate } from '../_models/email';
import { ImportLogs } from '../_models/import-log';
import { SlaStepSize } from '@modules/report/_models/widget';
import { ReportDashboardReq, Report } from '@modules/report-v2/_models/widget';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  filterCriteria: any = {};
  tableColumnMetaData: any = {};
  isSideSheetClose: Subject<boolean> = new Subject();
  selectedTemplate: BehaviorSubject<EmailTemplateBody> = new BehaviorSubject(null);
  deleteFromNavbar: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private http: HttpClient,
    private endpointService: EndpointsClassicService,
    private endpointAnalyticService: EndpointsAnalyticsService
  ) { }

  public getReportInfo(reportId: number, plantCode: string): Observable<any> {
    return this.http.get<any>(this.endpointAnalyticService.reportDashboardUrl(reportId), { params: { plantCode } });
  }

  public getMetaDataFldByFldIds(fieldId: string, code: string[], plantCode: string): Observable<DropDownValues[]> {
    return this.http.post<DropDownValues[]>(this.endpointAnalyticService.getFieldMetadatByFldUrl(fieldId), code, { params: { plantCode } });
  }

  public createUpdateReport(request: ReportDashboardReq, plantCode: string): Observable<string> {
    return this.http.post<string>(this.endpointAnalyticService.createUpdateReportUrl(), request, { params: { plantCode } });
  }

  public reportList(plantCode: string, roleId: string): Observable<Report[]> {
    return this.http.get<Report[]>(this.endpointAnalyticService.getReportListUrl(), { params: { plantCode, roleId } });
  }

  public getReportConfi(reportId: string, roleId: string): Observable<Report> {
    return this.http.get<Report>(this.endpointAnalyticService.getReportConfigUrl(reportId), { params: { roleId } });
  }

  public deleteReport(reportId: string): Observable<boolean> {
    return this.http.delete<boolean>(this.endpointAnalyticService.deleteReport(reportId));
  }

  public getDocCount(objectType: string, plantCode: string, isWorkflowDataset?: any, isCustomdataSet?: any): Observable<number> {
    if (isWorkflowDataset) {
      return this.http.get<number>(this.endpointAnalyticService.docCountUrl(objectType), { params: { plantCode, isWorkflowDataset } });
    } else if (isCustomdataSet) {
      return this.http.get<number>(this.endpointAnalyticService.docCountUrl(objectType), { params: { plantCode, isCustomdataSet } });
    } else {
      return this.http.get<number>(this.endpointAnalyticService.docCountUrl(objectType), { params: { plantCode } });
    }
  }

  public getCollaboratorPermission(queryString: string, fetchCount: any): Observable<PermissionOn> {
    return this.http.get<PermissionOn>(this.endpointService.getAllUserDetailsUrl(), { params: { queryString, fetchCount } });
  }

  public getCollaboratorsPermisison(reportId: string): Observable<ReportDashboardPermission[]> {
    return this.http.get<ReportDashboardPermission[]>(this.endpointService.returnCollaboratorsPermisisonUrl(reportId));
  }

  public saveUpdateReportCollaborator(request: ReportDashboardPermission[]): Observable<ReportDashboardPermission[]> {
    return this.http.post<ReportDashboardPermission[]>(this.endpointService.saveUpdateReportCollaborator(), request);
  }

  public saveUpdateportDownload(request: WidgetDownloadUser[], widgetId: string, userName: string, conditionList: any, location?: string): Observable<ReportDashboardPermission[]> {
    return this.http.post<ReportDashboardPermission[]>(this.endpointAnalyticService.saveReportDownload(widgetId, userName, location), request, { params: { conditionList } });
  }

  public deleteCollaborator(permissionId: string): Observable<boolean> {
    return this.http.delete<boolean>(this.endpointService.deleteCollaboratorUrl(permissionId));
  }

  /**
   * Get all layouts ..
   * @param objectType objecttype for summary
   * @param wfId wfid for find layouts
   */

  public getCustomData(): Observable<ObjectTypeResponse[]> {
    return this.http.get<ObjectTypeResponse[]>(this.endpointAnalyticService.getCustomDataUrl());
  }

  public getDIWDataset(searchString = '', page = 0, size = 0, prefatch = ''): Observable<ObjectTypeResponse[]> {
    const params: any = {
      s: searchString,
      _page: page,
      _size: size,
      _prefetch: prefatch
    }
    return this.http.get<ObjectTypeResponse[]>(this.endpointAnalyticService.getDIWDatasetUrl(), { params });
  }

  public getCustomDatasetFields(objectId: string): Observable<any> {
    return this.http.get<any>(this.endpointAnalyticService.getCustomDatasetFieldsUrl(objectId));
  }

  /**
   * call the api for drop down values in table filter
   * @param widgetId holds the id of widget
   * @param fieldId holds the fieldcontrol id
   * @param pickList holds the picklist of the field
   * @param displayCriteria holds the display criteria for the field
   * @param searchString holds the string the search
   * @returns observable
   */
  public getDropDownValues(widgetId, fieldId, pickList='', displayCriteria='', searchString=''): Observable<any> {
    const params: any = {
      fieldId,
      pickList,
      displayCriteria : displayCriteria ? displayCriteria : 'TEXT',
      searchString
    }
    return this.http.get<any>(this.endpointAnalyticService.dropDownValuesUrl(widgetId), { params });
  }

 /**
  * set the applied filters in variable
  * @param filterCriteria filter criteria applied on table
  * @param widgetId widget id
  */
  public setFilterCriteria(filterCriteria: Criteria[], widgetId: number) {
    if (filterCriteria.length)
      this.filterCriteria[widgetId] = filterCriteria;
    else if(this.filterCriteria[widgetId]){
      delete this.filterCriteria[widgetId]
    }
  }

  /**
   *
   * @param widgetId holds the widget id
   * @returns filter criteria value for specific widget id
   */
  public getFilterCriteria(widgetId: number): Criteria[] {
    return this.filterCriteria[widgetId];
  }

  public setColumnMetaData(metaData: ReportingWidget[], widgetId: number) {
    this.tableColumnMetaData[widgetId] = metaData;
  }

  public getColumnMetaData(widgetId: number): ReportingWidget[] {
    return this.tableColumnMetaData[widgetId];
  }

  public sideSheetStatusChange() {
    return this.isSideSheetClose.asObservable();
  }

  public deleteFromNavBar() {
    return this.deleteFromNavbar.asObservable();
  }

  public shareReport(request: EmailRequestBody, reportId: string): Observable<EmailResponseBody[]> {
    return this.http.put<EmailResponseBody[]>(this.endpointAnalyticService.shareReport(reportId), request);
  }

  public getAllTemplates(): Observable<EmailTemplate[]> {
    return this.http.get<EmailTemplate[]>(this.endpointService.getAllTemplates());
  }

  public getTemplateById(_id: string): Observable<EmailTemplateBody> {
    return this.http.get<EmailTemplateBody>(this.endpointService.getTemplateById(_id));
  }

  public getImportLogList(reportId: string, page: number, size: number): Observable<ImportLogs[]> {
    return this.http.get<ImportLogs[]>(this.endpointAnalyticService.getImportLog(reportId, page, size));
  }

  public updateImportLogStatus(messageId: string, status: string): Observable<ImportLogs> {
    return this.http.put<ImportLogs>(this.endpointAnalyticService.updateImportLog(messageId, status), {});
  }

  public discardDraftReport(reportId: number): Observable<any> {
    return this.http.delete<any>(this.endpointAnalyticService.discardDraftReport(reportId));
  }

  public saveDraft(reportId: number, request: ReportDashboardReq): Observable<Report> {
    return this.http.post<Report>(this.endpointAnalyticService.saveDraft(reportId), request);
  }

  public deleteWidget(reportId: number, widgetId: number): Observable<any> {
    return this.http.delete<any>(this.endpointAnalyticService.deleteWidget(reportId, widgetId));
  }

  public saveReport(reportId: number, request: ReportDashboardReq): Observable<Report> {
    return this.http.post<any>(this.endpointAnalyticService.saveReport(reportId), {});
  }

  public getReport(reportId: number, need_publish_one?: any): Observable<Report> {
    return this.http.get<Report>(this.endpointAnalyticService.getReport(reportId),{params:{need_publish_one}});
  }

  public getSlaSteps(workflowId: string) {
    return this.http.get<SlaStepSize[]>(this.endpointService.getSlaStepSizeUrl(workflowId));
  }

/**
 *
 * @param widgetId holds the widget id
 * @param fieldId field id of the column
 * @param searchString string to search
 * @param pickList picklist of field control
 * @param displayCriteria display criteria
 * @returns drop down values for radio button
 */
  public getRadioButtonValues(widgetId: number = null, fieldId: string = '', searchString: string = '', pickList: string = '', displayCriteria: string = ''): Observable<any> {
    const params = {
      fieldId,
      searchString,
      displayCriteria : displayCriteria ? displayCriteria : '',
    }
    return this.http.get<any>(this.endpointAnalyticService.radioButtonDropDownValuesUrl(widgetId, pickList), { params});
  }
}
