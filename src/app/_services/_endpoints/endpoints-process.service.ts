import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EndpointsProcessService {
  apiUrl = environment.apiurl + '/process';

  constructor() { }

  public getInboxNodesCountUrl() {
    return `${this.apiUrl}/feed/count`;
  }

  public saveTasklistVisitByUserUrl(nodeId: string): string {
    return `${this.apiUrl}/feed/visit/${nodeId}`;
  }

  public saveOrUpdateTasklistHeadersUrl(nodeId: string): string {
    return `${this.apiUrl}/${nodeId}/field/save-update`;
  }

  public getHeadersForNodeUrl(nodeId: string): string {
    return `${this.apiUrl}/${nodeId}/field/list`;
  }

  public getTaskListDataUrl(nodeId: string, lang: string): string {
    return `${environment.apiurl}/process/tasklist/get-data/${lang}?searchAfter=&filterCategory=${nodeId}`;
  }

  public getFlowListDataUrl(): string {
    return `${this.apiUrl}/getProcessDefinitions`;
  }

  public saveUpdateRuleFormUrl(flowId: any, stepId: any) {
    return `${this.apiUrl}/steps/save-update-rule-form/${flowId}/${stepId}`;
  }

  public getRuleFormBySchemaIdUrl(): string {
    return `${environment.apiurl}/process/steps/rules-forms`;
  }

  public getRuleFormBySchemaIdUrlV2(): string {
    return `${environment.apiurl}/process/steps/rules-forms/V2`;
  }

  public getFlowListUrl(datasetId: string): string {
    return this.apiUrl + `/steps/getall-dataset-mapping-V2/${datasetId}`;
  }

  public saveDatasetMappingUrl(flowId: any) {
    return `${this.apiUrl}/steps/save-Dataset-Mapping/${flowId}`;
  }

  public saveProcessVariableMappingUrl(flowId: any) {
    return `${this.apiUrl}/steps/save-processVariable-Mapping/${flowId}`;
  }

  getAllParentChildMappingUrl(flowId: any, fetchCount: any, fetchSize: any) {
    const urlParams = `fetchCount=${fetchCount}&fetchSize=${fetchSize}`;
    return this.apiUrl + `/steps/getAll-processChild-Mapping/${flowId}?${urlParams}`;
  }

  getAllProcessVMappingsUrl(flowId: any, datasetId: any, fetchCount: any, fetchSize: any) {
    const urlParams = `fetchCount=${fetchCount}&fetchSize=${fetchSize}`;
    return this.apiUrl + `/steps/getAll-processvariable-Mapping/${flowId}/${datasetId}?${urlParams}`;
  }

  deleteFormRuleUrl(userStepId: string) {
    return this.apiUrl + `/steps/delete-form-rule/${userStepId}`;
  }
  deleteParentChildMappingUrl(flowId: string) {
    return this.apiUrl + `/steps/delete-parentChild-Mapping/${flowId}`;
  }

  deleteProcessVariableMappingUrl(flowId: string) {
    return this.apiUrl + `/steps/delete-processvariable-Mapping/${flowId}`;
  }

  getAllApprovalForms(flowId: string, dataSetId: string, stepId: string) {
    return this.apiUrl + `/steps/get-approval-forms/${flowId}/${dataSetId}/${stepId}`;
  }

  getStepsRulesUrl() {
    return this.apiUrl + `/steps/rules-forms`;
  }

  getAllEventsUrl(flowId: any, datasetId: any, fetchCount: any, fetchSize: any) {
    const urlParams = `fetchCount=${fetchCount}&fetchSize=${fetchSize}`;
    return this.apiUrl + `/steps/getAll-flow-event-mapping/${flowId}/${datasetId}?${urlParams}`;
  }

  saveAllEventsMappingUrl(datasetId: any) {
    return this.apiUrl + `/steps/save-update-flow-event/${datasetId}`;
  }

  getModuleAllLogs(moduleId: string, referenceNo: string, pageNo: number, pageSize: number, locale: string) {
    return this.apiUrl + `/tasklist/get-all-logs?moduleId=${moduleId}&objectNumber=${referenceNo}&lang=${locale}&pageNo=${pageNo}&pageSize=${pageSize}`;
  }

  rejectRecord() {
    return `${this.apiUrl}/reject`;
  }

  getAllFiltersUrl() {
    return this.apiUrl + `/tasklist/filter/findAll`;
  }

  saveTaskListStatusUrl(locale: string) {
    return this.apiUrl + `/tasklist/save-task-list-status?lang=${locale}`;
  }

  saveTaskListFilterUrl(locale: string) {
    return this.apiUrl + `/tasklist/filter/save?lang=${locale}`;
  }

  deleteTaskListFilterUrl(filterId: string) {
    return this.apiUrl + `/tasklist/filter/delete/${filterId}`;
  }

  getTaskListAllModulesUrl() {
    return this.apiUrl + `/tasklist/find-all-modules`;
  }

  getFilterDetailUrl(filterId: string) {
    return this.apiUrl + `/tasklist/filter/findById/${filterId}`;
  }

  getRequestedByUserListUrl() {
    return this.apiUrl + `/tasklist/find-all-request-by`;
  }

  getSaveFlowStepScenarioUrl() {
    return this.apiUrl + `/steps/save-flow-step-scenario`;
  }

  fetchFlowStepScenarioUrl(flowId, stepId) {
    return this.apiUrl + `/steps/get-flow-step-scenario-mapping/${flowId}/${stepId}`;
  }

  getAnnotatedSVGImage(containerId: string, processInstanceId: string) {
    return this.apiUrl + `/getAnnotatedSVGImage?containerId=${containerId}&processInstanceId=${processInstanceId}`;
  }

  getProcessDiagram(containerId: string, processId: string) {
    return this.apiUrl + `/getProcessDefinitionDiagram?containerId=${containerId}&processId=${processId}`;
  }

  getAllInstances(containerId: string) {
    return this.apiUrl + `/getAllInstances?containerId=${containerId}`;
  }

  saveInviteUserUrl(){
    return this.apiUrl + '/steps/save-invite-user';
  }

  public getWorkflowDataURL(): string {
    return this.apiUrl + '/steps/get-wf-module-data'
  }

  public getWorkFlowPathUrl(): string {
    return this.apiUrl + `/steps/get-wf-flow`;
  }

  public getSlaStepSizeUrl(flowId: string): string {
    return this.apiUrl + `/steps/get-wf-steps?flowId=${flowId}`;
  }

}
