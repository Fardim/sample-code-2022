import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Criteria, DropDownValues, LayoutConfigWorkflowModel, ReportDashboardReq, ReportingWidget, SlaStepSize } from '../_models/widget';
import { ReportList } from '../report-list/report-list.component';
import { PermissionOn, ProfileRoleModel, ProfileUserModel, ReportDashboardPermission, WidgetDownloadBody } from '@models/collaborator';
import { EndpointsAnalyticsService } from 'src/app/_services/_endpoints/endpoints-analytics.service';
import { EndpointsClassicService } from '@services/_endpoints/endpoints-classic.service';
import { ObjectTypeResponse } from '@models/schema/schema';
import { BehaviorSubject } from 'rxjs';
import { EmailTemplateBody, EmailRequestBody, EmailResponseBody, EmailTemplate } from '../_models/email';
import { ImportLogs } from '../_models/import-log';
import { EndpointService } from '@services/endpoint.service';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  filterCriteria: any = {};
  tableColumnMetaData: any = {};
  isSideSheetClose: Subject<boolean> = new Subject();
  selectedTemplate: BehaviorSubject<EmailTemplateBody> = new BehaviorSubject(null);

  constructor(
    private http: HttpClient,
    private endpointService: EndpointsClassicService,
    private endpointServiceFuse: EndpointService,
    private endpointAnalyticService: EndpointsAnalyticsService
  ) {}

  public getReportInfo(reportId: number, plantCode: string): Observable<any> {
    return this.http.get<any>(this.endpointAnalyticService.reportDashboardUrl(reportId), { params: { plantCode } });
  }

  public getMetaDataFldByFldIds(fieldId: string, code: string[], plantCode: string): Observable<DropDownValues[]> {
    return this.http.post<DropDownValues[]>(this.endpointAnalyticService.getFieldMetadatByFldUrl(fieldId), code, { params: { plantCode } });
  }

  public createUpdateReport(request: ReportDashboardReq, plantCode: string): Observable<string> {
    return this.http.post<string>(this.endpointAnalyticService.createUpdateReportUrl(), request, { params: { plantCode } });
  }

  public reportList(plantCode: string, roleId: string, searchString: string, _page: any, _size: any): Observable<ReportList[]> {
    return this.http.get<ReportList[]>(this.endpointAnalyticService.getReportListUrl(), {
      params: { plantCode, roleId, searchString, _page, _size },
    });
  }

  public getReportConfi(reportId: string, roleId: string): Observable<ReportList> {
    return this.http.get<ReportList>(this.endpointAnalyticService.getReportConfigUrl(reportId), { params: { roleId } });
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
    return this.http.get<PermissionOn>(this.endpointServiceFuse.getAllUserDetailsUrl(), { params: { queryString, fetchCount } });
  }

  public getCollaboratorUsers(request: any): Observable<ProfileUserModel> {
    return this.http.post<ProfileUserModel>(this.endpointServiceFuse.getAllUserDetailsUrl(),  request);
  }

  public getCollaboratorRoles(request: any): Observable<ProfileRoleModel> {
    return this.http.post<ProfileRoleModel>(this.endpointServiceFuse.getAllRolesDetails(), request);
  }

  public getCollaboratorsPermisison(reportId: string): Observable<ReportDashboardPermission[]> {
    return this.http.get<ReportDashboardPermission[]>(this.endpointAnalyticService.returnCollaboratorsPermisisonUrl(reportId));
  }

  public saveUpdateReportCollaborator(request: ReportDashboardPermission[]): Observable<ReportDashboardPermission[]> {
    return this.http.post<ReportDashboardPermission[]>(this.endpointAnalyticService.saveUpdateReportCollaborator(), request);
  }

  public saveUpdateportDownload(
    request: WidgetDownloadBody,
    widgetId: string,
    userName: string,
    location?: string
  ): Observable<ReportDashboardPermission[]> {
    return this.http.post<ReportDashboardPermission[]>(
      this.endpointAnalyticService.saveReportDownload(widgetId, userName, location),
      request
    );
  }
  public deleteCollaborator(permissionId: string): Observable<boolean> {
    return this.http.delete<boolean>(this.endpointAnalyticService.deleteCollaboratorUrl(permissionId));
  }

  /**
   * Get all layouts ..
   * @param objectType objecttype for summary
   * @param wfId wfid for find layouts
   */
  public getAllLayoutsForSummary(
    objectType: string,
    wfId: string,
    roleId: string,
    plantCode: string
  ): Observable<LayoutConfigWorkflowModel[]> {
    objectType = objectType ? objectType : '';
    wfId = wfId ? wfId : '';
    return this.http.get<LayoutConfigWorkflowModel[]>(this.endpointService.getlayoutsUrl(), {
      params: { objectType, wfId, roleId, plantCode },
    });
  }

  public getCustomData(): Observable<ObjectTypeResponse[]> {
    return this.http.get<ObjectTypeResponse[]>(this.endpointAnalyticService.getCustomDataUrl());
  }

  public getCustomDatasetFields(objectId: string): Observable<any> {
    return this.http.get<any>(this.endpointAnalyticService.getCustomDatasetFieldsUrl(objectId));
  }

  public getDropDownValues(fieldId, searchText?): Observable<any> {
    if (searchText) return this.http.get<any>(this.endpointService.dropDownValuesUrl(fieldId), { params: { queryString: searchText } });
    else return this.http.get<any>(this.endpointService.dropDownValuesUrl(fieldId));
  }

  public setFilterCriteria(filterCriteria: Criteria[], widgetId: number) {
    if (filterCriteria.length) this.filterCriteria[widgetId] = filterCriteria;
    else if (this.filterCriteria[widgetId]) {
      delete this.filterCriteria[widgetId];
    }
  }

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

  public getSlaSteps(workflowId: string) {
    return this.http.get<SlaStepSize[]>(this.endpointService.getSlaStepSizeUrl(workflowId));
  }
}
