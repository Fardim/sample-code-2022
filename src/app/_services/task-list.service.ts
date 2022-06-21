import { TaskListDataResponse } from './../_models/task-list/tasklistData';
import { InboxNodesCount } from '@models/list-page/listpage';
import { EndpointsProcessService } from './_endpoints/endpoints-process.service';

import { Injectable } from '@angular/core';
import { TaskListRequest } from '@models/task-list/filter';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TaskListSummaryRequestParams, CommonGridRequestObject } from '@models/task-list/taskListDetails';
import { TaskListViewObject } from '@models/task-list/columnSetting';
import { EndpointsClassicService } from './_endpoints/endpoints-classic.service';
import { ControlData, FlowFormDetails, FlowStepSecnarioMapping } from '@modules/transaction/model/transaction';
import { catchError, map } from 'rxjs/operators';
import { ProcessVariableModel } from '@modules/flow/_components/flow-sidesheet/map-process-variable/map-process-variable.component';

@Injectable({
  providedIn: 'root'
})
export class TaskListService {
  savedSearches = [
    { searchName: 'Search 1', id: 'ss-1' },
    { searchName: 'Search 2', id: 'ss-2' },
    { searchName: 'Search 3', id: 'ss-3' },
    { searchName: 'Search 4', id: 'ss-4' }
  ];
  referenceDatasetResponse;

  /**
   * Constructor of @class TaskListService
   */
  constructor(
    public endpointService: EndpointsClassicService,
    public endpointsProcessService: EndpointsProcessService,
    private http: HttpClient
  ) {}

  /**
   * Function to get Task list from Service
   * @param filters the filter object to send to sever
   * @param pagination the pagination object to send to server
   */
  getTasks(filters: TaskListRequest) {
    return this.http.post(this.endpointService.getTasksUrl(), filters);
  }

  /**
   * Function to get dynamic filters
   */
  getDynamicFilters(userDetails) {
    const requestData = {
      plantCode: userDetails.plantCode,
      userName: userDetails.userName,
      roleId: userDetails.currentRoleId,
      locale: 'en',
      clientId: '738'
    };
    return this.http.post(this.endpointService.getFiltersUrl(), requestData);
  }

  /**
   * Function to get saves searches
   */
  getSavedSearches() {
    return of(this.savedSearches);
  }

  /**
   * Task list count
   */
  getTaskListCount(filters: TaskListRequest) {
    return this.http.post(this.endpointService.getTaskListCountURL(), filters);
  }

  /*
   * This is used to get the task list
   * @param userName The current logged in username
   */
  getTasklListViews(userName: string) {
    return this.http.get(this.endpointService.getTaskListViewsUrl(userName));
  }

  /**
   * This is delete to get the task list view
   * @param userName The current logged in username
   */
  deleteTaskListItem(viewId: string) {
    return this.http.delete(this.endpointService.getDeleteTaskListViewUrl(viewId), {});
  }

  /**
   * This is used to save the task list view
   * @param userName The current logged in username
   */
  saveTaskListView(taskListViewObject: TaskListViewObject) {
    return this.http.post(this.endpointService.getSaveTaskListURL(), taskListViewObject);
  }

  /**
   * This is used to update the task list view
   * @param userName The current logged in username
   */
  updateTaskListView(taskListViewObject: TaskListViewObject) {
    return this.http.post(this.endpointService.getSaveTaskListURL(), taskListViewObject);
  }

  /**
   * This is function to get audit logs(history for task summary page)
   * @param objectNumber object number of selected task
   * @param taskId task id of selected task
   */
  getAuditLogs(objectNumber: string, taskId: string, language: string) {
    return this.http.post(this.endpointService.getAuditTrailLogsURL(), { objectNumber, taskId, language });
  }

  getGridMetaData(gridRequestParams: CommonGridRequestObject) {
    return this.http.get(this.endpointService.getGridMetaDataURL(gridRequestParams));
  }

  getGridData(gridRequestParams: CommonGridRequestObject) {
    return this.http.get(this.endpointService.getGridDataUrl(gridRequestParams));
  }

  getMetadataByWfid(wfid: string) {
    return this.http.get(this.endpointService.getMetadataByWfid(wfid));
  }

  getCommonLayoutData(taskListSummaryRequestParams: TaskListSummaryRequestParams) {
    return this.http.get(this.endpointService.getCommonLayoutDataUrl(taskListSummaryRequestParams));
  }

  getChangeAuditLogDetails(taskId: string, userId: string, language: string) {
    return this.http.post(this.endpointService.getChangeLogDetails(), { taskId, userId, language });
  }

  saveTasklistVisitByUser(nodeId: string) {
    return this.http.post(this.endpointsProcessService.saveTasklistVisitByUserUrl(nodeId), {});
  }

  public getInboxNodesCount() {
    return this.http.get<InboxNodesCount[]>(this.endpointsProcessService.getInboxNodesCountUrl());
  }

  public saveOrUpdateTasklistHeaders(nodeId: string, payload: { fldId: string; order: number }[]) {
    return this.http.post(this.endpointsProcessService.saveOrUpdateTasklistHeadersUrl(nodeId), payload);
  }

  public getHeadersForNode(nodeId: string) {
    return this.http.get<any[]>(this.endpointsProcessService.getHeadersForNodeUrl(nodeId));
  }

  public getTaskListData(nodeId: string, lang: string, size: number, searchAfter: any, bodyRequest, fromCnt: number) {
    return this.http.post<TaskListDataResponse>(
      this.endpointsProcessService.getTaskListDataUrl(nodeId.toUpperCase(), lang),
      { from: fromCnt, size, request: bodyRequest }
    );
  }
  public getFlowListData(tenantId: any) {
    const reportData = {
      tenantId
    };
    return this.http.post<any>(this.endpointsProcessService.getFlowListDataUrl(), reportData);
  }
  public saveUpdateRuleForm(flowId: any, stepId: any, form: any, rules: any) {
    const data = {
      executionType: '',
      forms: form ? form : [],
      ruleId: '',
      ruleType: '',
      rules
    };
    return this.http.post<any>(`${this.endpointsProcessService.saveUpdateRuleFormUrl(flowId, stepId)}`, data);
  }

  public getRuleFormBySchemaId(userStepId: string = '', flowId: string = '') {
    return this.http.get<any[]>(this.endpointsProcessService.getRuleFormBySchemaIdUrl(), {
      params: { flowId, userStepId }
    });
  }

  public getRuleFormBySchemaIdV2(flowId: string = '') {
    return this.http.get<any[]>(this.endpointsProcessService.getRuleFormBySchemaIdUrlV2(), { params: { flowId } });
  }

  public saveDatasetMapping(flowId: any, request: any) {
    return this.http.post<any>(`${this.endpointsProcessService.saveDatasetMappingUrl(flowId)}`, request);
  }

  public saveProcessVMapping(flowId: any, request: any) {
    return this.http.post<any>(`${this.endpointsProcessService.saveProcessVariableMappingUrl(flowId)}`, request);
  }

  getAllParentChildMappings(flowId: any, fetchCount: any, fetchSize: any) {
    return this.http.get(this.endpointsProcessService.getAllParentChildMappingUrl(flowId, fetchCount, fetchSize));
  }

  getAllProvessVMappings(
    flowId: any,
    datasetId: any,
    fetchCount: any,
    fetchSize: any
  ): Observable<ProcessVariableModel[]> {
    return this.http.get<ProcessVariableModel[]>(
      this.endpointsProcessService.getAllProcessVMappingsUrl(flowId, datasetId, fetchCount, fetchSize)
    );
  }

  deleteFormRule(userStepId: string) {
    return this.http.delete(this.endpointsProcessService.deleteFormRuleUrl(userStepId));
  }

  deleteParentChildMapping(flowId: string) {
    return this.http.delete(this.endpointsProcessService.deleteParentChildMappingUrl(flowId));
  }

  getAllEventsMapping(flowId: any, datasetId: any, fetchCount: any, fetchSize: any) {
    return this.http.get(this.endpointsProcessService.getAllEventsUrl(flowId, datasetId, fetchCount, fetchSize));
  }

  saveEventMapping(datasetId: any, request: any) {
    return this.http.post<any>(`${this.endpointsProcessService.saveAllEventsMappingUrl(datasetId)}`, request);
  }

  /**
   * get flow list details
   * @param searchStr search string
   * @returns Flow list
   */
  public getFlowList(
    datasetId: string,
    flowId: string,
    stepId: string,
    fetchCount?: string,
    fetchSize?: string,
    lang?: string
  ): Observable<FlowFormDetails> {
    fetchCount = fetchCount || '0';
    fetchSize = fetchSize || '0';
    lang = lang || 'en';
    return this.http
      .get<any>(this.endpointsProcessService.getAllApprovalForms(flowId, datasetId, stepId), {
        params: { fetchCount, fetchSize, lang }
      })
      .pipe(
        map((res) => {
          const flowDetails: FlowFormDetails = {
            flowDesc: res.flowDesc || '',
            flowId: res.flowId || '',
            forms: [
              {
                dataSetId: datasetId,
                datasetDesc: res?.parentMapping[datasetId]?.datasetDesc || '',
                formDesc: res?.parentMapping[datasetId]?.formDesc || '',
                formId: res?.parentMapping[datasetId]?.formId || ''
              }
            ]
          };
          return flowDetails;
        }),
        catchError((err) => {
          console.log('---------- err :: ', err);
          return of({
            flowDesc: 'No Flow Found',
            flowId: '',
            forms: []
          });
        })
      );
  }

  /**
   * Reject the mdodoc ...
   * @param controlData control data for doc
   */
  rejectRecord(controlData: ControlData) {
    return this.http.post(this.endpointsProcessService.rejectRecord(), controlData);
  }

  getAllFilters(locale: string, filterCategory: string): Observable<any> {
    return this.http.get(this.endpointsProcessService.getAllFiltersUrl(), {
      params: {
        lang: locale,
        filterCategory
      }
    });
  }

  saveTaskListStatus(locale: string, request: any): Observable<any> {
    return this.http.post<any>(`${this.endpointsProcessService.saveTaskListStatusUrl(locale)}`, request);
  }

  saveTaskListFilter(locale: string, request: any): Observable<any> {
    return this.http.post<any>(`${this.endpointsProcessService.saveTaskListFilterUrl(locale)}`, request);
  }

  deleteTaskListFilter(locale: string, filterId: string): Observable<any> {
    return this.http.delete<any>(this.endpointsProcessService.deleteTaskListFilterUrl(filterId), {
      params: {
        lang: locale
      }
    });
  }

  getAllModules(locale: string, filterCategory: string): Observable<any> {
    return this.http.get<any>(this.endpointsProcessService.getTaskListAllModulesUrl(), {
      params: {
        lang: locale,
        filterCategory
      }
    });
  }

  getFilterDetail(filterId: string): Observable<any> {
    return this.http.get<any>(`${this.endpointsProcessService.getFilterDetailUrl(filterId)}`);
  }

  getRequestedByList(locale: string, filterCategory: string): Observable<any> {
    return this.http.get<any>(this.endpointsProcessService.getRequestedByUserListUrl(), {
      params: {
        lang: locale,
        filterCategory
      }
    });
  }

  saveFlowStepSecnarioMapping(flowId: string, stepId: string, request: FlowStepSecnarioMapping) {
    return this.http.post<any>(this.endpointsProcessService.getSaveFlowStepScenarioUrl(), request, {
      params: { flowId, stepId }
    });
  }

  getFlowStepSecnarioMapping(flowId: string, stepId: string, fetchCount = '0', fetchSize = '20') {
    return this.http.get<FlowStepSecnarioMapping[]>(
      this.endpointsProcessService.fetchFlowStepScenarioUrl(flowId, stepId),
      { params: { fetchCount, fetchSize } }
    );
  }

  getAnnotatedSVGImage(containerId: string, processInstanceId: string) {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this.http.get(this.endpointsProcessService.getAnnotatedSVGImage(containerId, processInstanceId), {
      headers,
      responseType: 'text'
    });
  }

  getProcessDiagram(containerId: string, processId: string) {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this.http.get(this.endpointsProcessService.getProcessDiagram(containerId, processId), {
      headers,
      responseType: 'text'
    });
  }

  getAllInstances(containerId: string) {
    return this.http.get<any[]>(this.endpointsProcessService.getAllInstances(containerId));
  }

  saveInviteUser(payload) {
    return this.http.post(this.endpointsProcessService.saveInviteUserUrl(), payload);
  }
}
