import { Injectable } from '@angular/core';
import { CommonGridRequestObject, TaskListSummaryRequestParams } from '@models/task-list/taskListDetails';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EndpointsClassicService {

  constructor() { }

  apiUrl = environment.apiurl + '/MDOSF/fapi';
  readonly origin = `${environment.apiurl}/rule`;

  public login(): string {
    throw new Error('Login not implemented');
  }

  public onLoadSchema(): string {
    return this.apiUrl + '/restSchemaLogs';
  }

  public getCreateSchemaGroupUrl(): string {
    return this.apiUrl + '/schema/create-schemagroup';
  }

  public getSchemaGroupsUrl() {
    return this.apiUrl + '/schema/get-all-groups';
  }
  public getSchemaListByGroupIdUrl() {
    return this.apiUrl + '/schema/schema-list';
  }
  public schemaVarinatDetails(): string {
    return this.apiUrl + '/schema/schemaVariantList';
  }
  public deleteSchemaGroupUrl(groupId: string): string {
    return this.apiUrl + '/schema/delete-schema-group/' + groupId;
  }
  public getSchemaDataTableColumnInfoUrl(): string {
    return this.apiUrl + '/getListPageLayout';
  }
  public getSchemaDetailsBySchemaId(schemaId: string): string {
    return this.apiUrl + '/schema/schemaCount/' + schemaId;
  }
  public getShowMoreSchemaTableDataUrl(): string {
    return this.apiUrl + '/showMoreSchemaTableData';
  }
  public downloadExecutionDetailsUrl(schemaId: string, status: string): string {
    return `${this.apiUrl}/schema/actions/download/data-quality/${schemaId}/${status.toLocaleLowerCase()}`;
  }
  public getScheduleSchemaUrl(isRunWithCheckedData: boolean): string {
    return this.apiUrl + `/schema/schedule-schema?isRunWithCheckedData=${isRunWithCheckedData}`;
  }
  public getSchemaGroupDetailsByGrpIdUrl(schemaGroupId: string): string {
    return this.apiUrl + '/schema/get-group-details/' + schemaGroupId;
  }

  public getSchemaGroupCountUrl(groupId: number): string {
    return this.apiUrl + '/schema/get-schema-group-count' + '/' + groupId;
  }

  public getAllSchemabymoduleids(): string {
    return this.apiUrl + '/schema/get-all-schemabymoduleids';
  }
  public getAllObjecttypeUrl(): string {
    return this.apiUrl + '/schema/get-all-objecttype';
  }
  public groupDetailswithAssignedschemaUrl(groupId: string): string {
    return this.apiUrl + '/schema/group-detailswith-assignedschema/' + groupId;
  }
  public getSchemaDetailsBySchemaIdUrl(schemaId: string): string {
    return this.apiUrl + '/schema/schema-details/' + schemaId;
  }

  public getSchemaTableDetailsUrl(): string {
    return this.apiUrl + '/schema/schema-details';
  }
  public getUpdateSchemaTableViewUrl(): string {
    return this.apiUrl + '/schema/update-schema-table-view';
  }

  public getOverviewChartDataUrl(schemaId: string, variantId: string, runid: string): string {
    return this.apiUrl + '/schema/overview-chart-data/' + schemaId + '/' + variantId + '/' + runid;
  }

  public getCategoryInfoUrl(): string {
    return this.apiUrl + '/schema/category-list';
  }

  public getSchemaStatusUrl(): string {
    return this.apiUrl + '/schema/schema-status';
  }

  public categoryChartData(schemaId: string, variantId: string, categoryId: string, status: string): string {
    return this.apiUrl + '/schema/category-chart-data/' + schemaId + '/' + variantId + '/' + categoryId + '/' + status;
  }
  public scheduleSchemaCount(schemaId: string): string {
    return this.apiUrl + '/schema/record-count/' + schemaId;
  }
  public getMetadataFields(objectId: string): string {
    return this.apiUrl + '/schema/metadata-fileds/' + objectId;
  }

  public getDatasetFields(searchString: string): string {
    return `${this.apiUrl}/schema/metadata-fields/V2?s=${encodeURIComponent(searchString)}&_page=0&_size=10`;
  }

  public getTargetSystems(): string {
    return `${this.origin}/schema/metadata/target-system/sap`;
  }

  public getLookupTables(connId: number | string, searchString: string): string {
    return `${this.origin}/schema/metadata/lookup-tables/sap/${connId}?fetchCount=10&searchString=${searchString}`;
  }

  public getLookupTableMetadata(connId: number | string, tableName: string): string {
    return `${this.origin}/schema/metadata/lookup-table-metadata/sap/${connId}?tableName=${tableName}`;
  }

  public getAllSelectedFields(): string {
    return this.apiUrl + `/schema/get-selected-fields-view`;
  }

  public getSchemaVariantsUrl(schemaId: string): string {
    return this.apiUrl + '/schema/variants/' + schemaId;
  }

  public getSchemaBrInfoList(schemaId: string): string {
    return `${this.apiUrl}/schema/schema-br-infolist/${schemaId}`;
  }

  public doCorrectionUrl(schemaId: string): string {
    return `${this.apiUrl}/schema/do-correction/${schemaId}`;
  }

  public getCorrectedRecords(schemaId: string): string {
    return `${this.apiUrl}/schema/get-corrected-records/${schemaId}`;
  }

  public getLastBrErrorRecords(schemaId: string): string {
    return `${this.apiUrl}/schema/get-mdoerror-records/${schemaId}`;
  }

  public getSchemaExecutionLogUrl(schemaId: string): string {
    return `${this.apiUrl}/schema/get-execution-logs/${schemaId}`;
  }

  public approveCorrectedRecords(schemaId: string): string {
    return `${this.apiUrl}/schema/approve-corrected-records/${schemaId}`;
  }

  public uploadFileDataUrl(): string {
    return `${this.apiUrl}/schema/upload-file`;
  }

  public uploadDataUrl(objectType: string, fileSno: string): string {
    return `${this.apiUrl}/schema/upload-data/${objectType}/${fileSno}`;
  }

  public getBusinessRulesInfoByModuleIdUrl() {
    return this.apiUrl + `/schema/get-business-rules/`
  }

  public getBusinessRulesInfoBySchemaIdUrl(schemaId: string) {
    return this.apiUrl + `/schema/get-business-rules/${schemaId}`;
  }

  public getCategoriesInfo() {
    return this.apiUrl + '/schema/category-list';
  }

  public getFillDataInfo(id) {
    return this.apiUrl + '/schema/metadata-fileds/' + id;
  }

  public createBr() {
    return this.apiUrl + '/schema/create-update-br'
  }

  public createSchema() {
    return this.apiUrl + '/schema/create-update-schema';
  }

  public deleteBr(id): string {
    return this.apiUrl + '/schema/delete-business-rule/' + id;
  }

  public getFiltersUrl() {
    return `${this.apiUrl}/tasklist/filter`;
  }
  public getFilterDynamicListsUrl() {
    return `${this.apiUrl}/tasklist/filterList`
  }

  public getDynamicColumnListsUrl() {
    return `${this.apiUrl}/listPage/listmetadata`
  }

  public getDynamicFiltermetaListsUrl() {
    return `${this.apiUrl}/listPage/getFilterMetaField`
  }

  public getTasksUrl(): string {
    return `${this.apiUrl}/tasklist/taskListData`;
  }

  public returnCollaboratorsPermisisonUrl(reportId: string): string {
    return `${this.apiUrl}/admin/permission/collaborators/permission/${reportId}`;
  }

  public saveUpdateReportCollaborator(): string {
    return `${this.apiUrl}/admin/permission/collaborators/permission/save-update`;
  }

  public deleteCollaboratorUrl(permissionId: string): string {
    return `${this.apiUrl}/admin/permission/collaborator/delete/${permissionId}`;
  }

  public getBrConditionalOperatorUrl(): string {
    return `${this.apiUrl}/schema/br/condition-operator`;
  }

  public dropDownValuesUrl(fieldId: string): string {
    return `${this.apiUrl}/schema/drop-values/${fieldId}`;
  }

  public saveUpdateUdrBlockUrl(): string {
    return `${this.apiUrl}/admin/schema/br/udr`;
  }

  public conditionListsUrl(objectType: string): string {
    return `${this.apiUrl}/schema/br/udr/condition-list/${objectType}`;
  }

  public saveUpdateUDRUrl(): string {
    return `${this.apiUrl}/admin/schema/udr/save-update`;
  }

  public getBusinessRuleInfoUrl(brId: string): string {
    return `${this.apiUrl}/schema/get-business-rule-info/${brId}`;
  }

  public getUdrBusinessRuleInfoUrl(ruleId: string): string {
    return `${this.apiUrl}/schema/br/udr/${ruleId}`;
  }

  public getTaskListViewsUrl(userName: string): string {
    return `${this.apiUrl}/tasklist/getTaskListViews?userCreated=${userName}`;
  }

  public getDeleteTaskListViewUrl(viewId: string): string {
    return `${this.apiUrl}/tasklist/deleteTaskListView?viewId=${viewId}`;
  }

  public getSaveTaskListViewUrl(): string {
    return `${this.apiUrl}/tasklist/taskListUserView`;
  }

  public getSaveTaskListURL(): string {
    return `${this.apiUrl}/tasklist/taskListUserView`;
  }
  public deleteConditionBlock(blockId: string): string {
    return `${this.apiUrl}/schema/br/udr/delete-conditionblock/${blockId}`;
  }

  public getSchemaThresholdStatics(schemaId: string, variantId?: string): string {
    if (variantId === undefined || variantId === null || variantId === 'null') {
      return `${this.apiUrl}/schema/statics/${schemaId}`;
    } else {
      return `${this.apiUrl}/schema/statics/${schemaId}/${variantId}`;
    }
  }

  public uploadCorrectionDataUrl(objectType: string, schemaId: string, runId: string, plantCode: string, fileSno: string): string {
    return `${this.apiUrl}/es/uploadCorrection/${objectType}/${schemaId}/${runId}/${plantCode}/${fileSno}`;
  }

  public getCollaboratorDetailsUrl(schemaId: string): string {
    return `${this.apiUrl}/schema/get-all-schemacollaborator-details/${schemaId}`;
  }

  public createUpdateUserDetailsUrl(): string {
    return `${this.apiUrl}/schema/create-update-schemacollaborator`;
  }

  public getAllUserDetailsUrl(): string {
    return `${this.apiUrl}/admin/permission/collaborators`;
  }

  public deleteSchemaCollaboratorDetailsUrl(): string {
    return `${this.apiUrl}/admin/users/collaborator-records/delete`;
  }

  public deleteSchema(schemaId: string): string {
    return `${this.apiUrl}/schema/delete/${schemaId}`;
  }
  public getTaskListCountURL(): string {
    return `${this.apiUrl}/tasklist/getTaskListCount`;
  }

  public getTaskSummaryMetaDataURL(taskListSummaryRequestParams: TaskListSummaryRequestParams): string {
    return `${this.apiUrl}/layout/getLayoutMetaData/${taskListSummaryRequestParams.objectnumber}/${taskListSummaryRequestParams.objecttype}/${5}?plantCode=${taskListSummaryRequestParams.plantCode}&userRole=${taskListSummaryRequestParams.userRole}&taskId=${taskListSummaryRequestParams.taskId}&userId=${taskListSummaryRequestParams.userId}&wfId=${taskListSummaryRequestParams.taskId}&lang=${taskListSummaryRequestParams.lang}`
  }

  public getTaskSummaryLayoutDataURL(wfid: string, eventCode: string, lang: string): string {
    return `${this.apiUrl}/layoutData/getLayoutData/${wfid}/${eventCode}?lang=${lang}`;
  }

  public getAuditTrailLogsURL(): string {
    return `${this.apiUrl}/changeAuditLog/getChangeAuditLog`;
  }

  public getGridMetaDataURL(gridRequestParams: CommonGridRequestObject): string {
    const urlParams = `plantCode=${gridRequestParams.plantCode}&lang=${gridRequestParams.lang}&taskId=${gridRequestParams.taskId}&wfId=${gridRequestParams.wfId}&userId=${gridRequestParams.userId}&userRole=${gridRequestParams.userRole}&tabId=${gridRequestParams.tabId}`
    return `${this.apiUrl}/grid/getGridMetadata/${gridRequestParams.objecttype}/${gridRequestParams.tabCode}/${gridRequestParams.eventCode}?${urlParams}`;
  }

  public getGridDataUrl(gridRequestParams: CommonGridRequestObject) {
    const urlParams = `plantCode=${gridRequestParams.plantCode}&lang=${gridRequestParams.lang}&taskId=${gridRequestParams.taskId}&wfId=${gridRequestParams.wfId}&userRole=${gridRequestParams.userRole}&userId=${gridRequestParams.userId}&fetchCount=${gridRequestParams.fetchCount}&fetchSize=${gridRequestParams.fetchSize}`;
    return `${this.apiUrl}/gridData/getGridData/${gridRequestParams.objecttype}/${gridRequestParams.objectNumber}/${gridRequestParams.gridId}/${gridRequestParams.eventCode}?${urlParams}`
  }

  public getMetadataByWfid(wfid: string): string {
    return `${this.apiUrl}/layout/getMetadataByWfid/${wfid}`
  }

  public getCommonLayoutDataUrl(taskListSummaryRequestParams: TaskListSummaryRequestParams) {
    const urlParams = `plantCode=${taskListSummaryRequestParams.plantCode}&lang=${taskListSummaryRequestParams.lang}&taskId=${taskListSummaryRequestParams.taskId}&wfId=${taskListSummaryRequestParams.wfId}&userRole=${taskListSummaryRequestParams.userRole}&userId=${taskListSummaryRequestParams.userId}`;
    return `${this.apiUrl}/layout/getLayoutdata/${taskListSummaryRequestParams.objectnumber}/${taskListSummaryRequestParams.objecttype}/5?${urlParams}`
  }

  public getChangeLogDetails(): string {
    return `${this.apiUrl}/changeAuditLog/getChangeLogDetails`
  }

  public getLoadRecipientsListUrl(): string {
    return `${this.apiUrl}/restWorkflow/loadRecipient`;
  }

  public getWfFieldsListUrl(): string {
    return `${this.apiUrl}/restWorkflow/loadWorkfLowField`;
  }

  public getLoadApisUrl(): string {
    return `${this.apiUrl}/restWorkflow/loadAPI`;
  }

  public getSaveWfDefinitionUrl(): string {
    return `${this.apiUrl}/restWorkflow/saveWorkFlowStepViaXml`;
  }

  public getFieldOptionsUrl(): string {
    return `${this.apiUrl}/restWorkflow/admin_dropdown_list_dropdown_data`;
  }

  public getloadWfDefinitionUrl(): string {
    return `${this.apiUrl}/restWorkflow/loadWorkFlowPathStep`;
  }

  public saveUpdateVariantUrl(): string {
    return `${this.apiUrl}/schema/data-variants`;
  }

  public getVariantdetailsByvariantIdUrl(variantId: string): string {
    return `${this.apiUrl}/schema/variant/${variantId}`;
  }

  public deleteVariantUrl(variantId: string): string {
    return `${this.apiUrl}/schema/variant/delete/${variantId}`;
  }

  public saveNewSchemaUrl(objectId: string, runNow: boolean, variantId: string, fileSno: string): string {
    return `${this.apiUrl}/schemamodule/create-schema?objectId=${objectId}&runNow=${runNow}&variantId=${variantId}&fileSno=${fileSno}`
  }

  /**
   * Get url for schema info
   * @param moduleId module id/objectId
   */
  public getSchemaInfoByModuleIdUrl(moduleId: string): string {
    return `${this.apiUrl}/schema/schema-info/${moduleId}`;
  }


  /**
   * Get schema with variants .. use for data intilligence ...
   *
   */
  public getSchemaWithVariantsUrl(): string {
    return `${this.apiUrl}/schema/list-variants`;
  }

  public downloadAttachment(sno): string {
    return `${this.apiUrl}/attachment/downloadAttachments?sno=${sno}`;
  }

  public updateBrMap(): string {
    return `${this.apiUrl}/schema/br/update-br-map`;
  }

  public getCategoriesUrl(): string {
    return this.apiUrl + '/getCategories';
  }

  public getDependencyUrl(): string {
    return this.apiUrl + '/getDependency';
  }

  public addCustomCategoryUrl(): string {
    return this.apiUrl + '/addCategory';
  }

  public saveBusinessRuleUrl(): string {
    return this.apiUrl + '/saveBusinessRule';
  }

  public getBusinessRuleApiListUrl(): string {
    return this.apiUrl + '/getAPIList';
  }

  public getDuplicacySettingListUrl(): string {
    return this.apiUrl + '/getDuplicacySettingList';
  }

  public getMetadataFieldsUrl(): string {
    return this.apiUrl + '/getMetadataFields';
  }

  public getVariantDetailsForScheduleSchemaUrl(objectId: string): string {
    return this.apiUrl + '/get-variants-list/' + objectId;
  }

  public getVariantControlByVariantIdUrl(variantId: string): string {
    return this.apiUrl + '/get-variant-control/' + variantId;
  }

  public getBusinessRulesBySchemaId(schemaId: string, objectId: string): string {
    return this.apiUrl + '/getBrDetailsBySchemaId/' + schemaId + '/' + objectId;
  }

  public getAssignBrToSchemaUrl(): string {
    return this.apiUrl + '/assignBrToSchema';
  }

  public getWorkflowDataURL(): string {
    return this.apiUrl + '/schema/get-wf-module-data'
  }

  /**
   * function to return API URL to get workflow fields.
   * if isWorkFlowDataSet is true then it will be in use..
   */
  public getWorkFlowFieldsUrl(): string {
    return this.apiUrl + `/schema/get-wffields`;
  }

  public getWorkFlowPathUrl(): string {
    return this.apiUrl + `/schema/get-wfpath`;
  }


  /**
   * Endpoint url to get notifications
   * @param senderUid username of logged in user
   */
  public getNotificationsUrl(senderUid, from: string, to: string): string {
    return `${this.apiUrl}/notification/getNotification?senderUid=${senderUid}&from=${from}&to=${to}`
  }

  /**
   * Endpoint to update/save notification
   */
  public getUpdateNotificationUrl(): string {
    return `${this.apiUrl}/notification/saveNotification`
  }

  /**
   * Endpoint to update/save notification
   */
  public getDeleteNotificationUrl(): string {
    return `${this.apiUrl}/notification/deleteNotification`
  }

  /**
   * Endpoint to get job queue url
   * @param userName username of logged in user
   * @param plantCode plantcode of logged in user
   */
  public getJobQueueUrl(userName: string, plantCode: string, fetchData: any = null): string {
    let baseUrl = `${this.apiUrl}/schema/jobs/get-all-jobs?userId=${userName}&plantCode=${plantCode}`;

    if (fetchData?.fetchCount > -1) { baseUrl += `&fetchCount=${fetchData.fetchCount}` };
    if (fetchData?.fetchSize > 0) { baseUrl += `&fetchSize=${fetchData.fetchSize}` };

    return baseUrl;
  }


  public getNotificationsCount(senderUid): string {
    return `${this.apiUrl}/notification/getNotificationCount?senderUid=${senderUid}`
  }

  /**
   * endpoint for create/update schedule of schema
   * @param schemaId Id of schema
   */
  public createUpdateScheduleUrl(schemaId: string) {
    return `${this.apiUrl}/schema/createupdate-schema-scheduler?schemaId=${schemaId}`;
  }

  /**
   * endpoint for getting schedule information of a schema
   * @param schemaId Id of schema
   */
  public getScheduleUrl(schemaId: string) {
    return `${this.apiUrl}/schema/get-schema-scheduler/${schemaId}`;
  }

  /**
   * endpoint for saving and updating duplicate rule
   */
  public saveUpdateDuplicateRule(): string {
    return `${this.apiUrl}/duplicate/saveDuppsett`;
  }

  /**
   * endpoint for copy duplicate rule
   */
  public copyDuplicate(): string {
    return `${this.apiUrl}/duplicate/copyDuplicate`;
  }

  /**
   * endpoint for save/update schema data scope
   */
  public saveUpdateDataScopeUrl(): string {
    return `${this.apiUrl}/schema/variant/create-update-single`;
  }

  /**
   * endpoint for get schema data scope
   * @param schemaId: ID of schema
   * @param type: type of variants
   */
  public getAllDataScopeUrl(schemaId: string, type: string): string {
    return `${this.apiUrl}/schema/variants/${schemaId}/${type}`;
  }
  /**
   * Get all noun and modifiers uri ..
   * @param schemaId append on request ..
   * @param runId append on request
   * @param variantId optional param if not there use 0 as Entire dataset ..
   */
  public getClassificationNounMod(schemaId: string, runId: string, variantId?: string) {
    return `${this.apiUrl}/schema/getnounsAndModfiers/${schemaId}/${runId}`;
  }

  public getClassificationDataTableUrl(schemaId: string, runId: string, variantId?: string) {
    return `${this.apiUrl}/schema/getClassificationListData/${schemaId}/${runId}`;
  }

  public getAllDataScopesUri(schemaId: string, type: string) {
    return `${this.apiUrl}/schema/variants/${schemaId}/${type}`;
  }

  public generateCrossEntryUri(schemaId: string, objectType: string, objectNumber: string): string {
    return `${this.apiUrl}/schema/generateCrossmodule/${schemaId}/${objectType}/${objectNumber}`;
  }

  /**
   * endpoint for create/update check data for schema
   */
  public createUpdateCheckDataUrl() {
    return `${this.apiUrl}/schema/checkdata/save-update`;
  }
  public duplicacyGroupsListUrl(): string {
    return `${this.apiUrl}/duplicate/getgroupId`;
  }

  public catalogCheckRecordsUrl(): string {
    return `${this.apiUrl}/duplicate/getContent`;
  }

  /**
   * endpoint for getting check data for schema
   * @param schemaId: schema ID
   */
  public getCheckDataUrl(schemaId: string) {
    return `${this.apiUrl}/schema/checkdata/get-all-br-collaborator-details/${schemaId}`;
  }

  public getAllBusinessRulesUrl() {
    return this.apiUrl + `/schema/get-all-business-rules/`
  }

  /**
   * endpoint for creating business rules at the time of check data..
   */
  public createCheckDataBusinessRuleUrl(): string {
    return `${this.apiUrl}/schema/create-br`;
  }

  /**
   * URI for get all available nouns ..from local library
   */
  public getAvailableNounsUri(): string {
    return `${this.origin}/schema/noun`;
  }

  /**
   * URI for get all available modifiers  ..from local library
   */
  public getAvailableModifierUri(): string {
    return `${this.origin}/schema/modifier`;
  }

  /**
   * URI for get all available attributes  ..from local library
   */
  public getAvailableAttributeUri(): string {
    return `${this.origin}/schema/attribute`;
  }


  /**
   * Get uri for suggested noun ..
   * @param schemaId executed schema
   * @param runid get it from this runid
   */
  public getSuggestedNounUri(schemaId: string, runid: string): string {
    return `${this.apiUrl}/schema/noun/${schemaId}/${runid}`;
  }

  /**
   * Get uri for suggested modifier ..
   * @param schemaId executed schema
   * @param runid get it from this runid
   */
  public getSuggestedModifierUri(schemaId: string, runid: string): string {
    return `${this.apiUrl}/schema/modifier/${schemaId}/${runid}`;
  }


  /**
   * Get uri for suggested attribute ..
   *
   * @param schemaId executed schema
   * @param runid executed on this run
   */
  public getSuggestedAttributeUri(schemaId: string, runid: string): string {
    return `${this.apiUrl}/schema/attribute/${schemaId}/${runid}`;
  }

  /**
   * Get doing correction uri ..
   */
  public doClassificationCorrectionUri(): string {
    return `${this.apiUrl}/schema/do-mro-correction`;
  }
  public getCreateNounModUrl(): string {
    return this.apiUrl + '/schema/create-noun';
  }

  public getCreateAttributeUrl(nounSno: string): string {
    return this.apiUrl + `/schema/add-attributes/${nounSno}`;
  }

  public getSaveAttributesMappingUrl(): string {
    return this.apiUrl + `/schema/save-mappings`;
  }

  public getFetchAttributesMappingUrl(): string {
    return this.apiUrl + `/schema/get-mappings`;
  }

  /**
   * Get approve classification records uri ..
   */
  public approveClassificationUri(): string {
    return `${this.apiUrl}/schema/mro/approve`;
  }

  /**
   * Use this uri for reject or reset mro classification records ..
   */
  public rejectClassificationUri(): string {
    return `${this.apiUrl}/schema/mro/reset`;
  }

  /**
   * mark duplicacy record as master record
   */
  public masterRecordChangeUrl(): string {
    return `${this.apiUrl}/duplicate/updatemasterRecord`;
  }

  /**
   * mark duplicacy record for deletion
   * @param objctNumber record object number
   * @param moduleId object type
   */
  public markForDeletionUrl(objctNumber, moduleId, schemaId, runId): string {
    return `${this.origin}/schema/actions/update-delFlag/${objctNumber}/${moduleId}/${schemaId}/${runId}`;
  }

  /**
   * do duplicacy result field correction
   * @param schemaId  schema id
   * @param runId run id
   */
  public doDuplicacyCorrectionUrl(schemaId, runId): string {
    return `${this.apiUrl}/duplicate/do-correction/${schemaId}/${runId}`;
  }

  /**
   * approve corrected duplicacy records uri
   * @param schemaId schema id
   * @param runId run id
   * @param userName username
   */
  public approveDuplicacyCorrectionUrl(schemaId, runId, userName): string {
    return `${this.apiUrl}/schema/approveDuplicateRecords/${schemaId}/${runId}?userName=${userName}`;
  }

  /**
   * approve corrected duplicacy records uri
   * @param schemaId schema id
   * @param runId run id
   * @param userName user name
   */
  public rejectDuplicacyCorrectionUrl(schemaId, runId, userName): string {
    return `${this.apiUrl}/schema/rejectDuplicateRecords/${schemaId}/${runId}?userName=${userName}`;
  }

  public getlayoutsUrl() {
    return `${this.apiUrl}/report/layouts`;
  }

  /**
   * Uri for reset schema execution correction data ..
   * @param schemaId append as request path
   */
  public resetCorrectionRecords(schemaId: string): string {
    return `${this.apiUrl}/schema/reset-corrected-records/${schemaId}`;
  }

  public getSchemaExecutedStatsTrendUri(schemaId: string, variantId: string): string {
    return this.apiUrl + `/schema/execution/trends/${schemaId}/${variantId}`;
  }

  /**
   * Uri for mro execution output download ..
   * @param schemaid append on request path ..
   */
  public downloadMroExceutionUri(schemaid: string): string {
    return `${this.origin}/schema/actions/download/mro/${schemaid}`;
  }

  /**
   * Uri for generate mro classification description ..
   */
  public generateMroClassificationDescriptionUri(): string {
    return `${this.origin}/schema/actions/mro/generate-description`;
  }
  public getCreateUpdateSchemaActionUrl(): string {
    return this.apiUrl + `/schema/actions/create-update`;
  }

  public getCreateUpdateSchemaActionsListUrl(): string {
    return this.apiUrl + `/schema/actions/bulkcreate-update`;
  }

  public getFindActionsBySchemaUrl(schemaId: string): string {
    return this.apiUrl + `/schema/actions/${schemaId}`;
  }

  public getFindActionsBySchemaAndRoleUrl(schemaId: string, role: string): string {
    return this.apiUrl + `/schema/actions/${schemaId}/${role}`;
  }

  public getDeleteSchemaActionUrl(schemaId: string, actionCode: string): string {
    return this.apiUrl + `/schema/actions/deleteCustomAction/${schemaId}/${actionCode}`;
  }

  public getCrossMappingUrl(plantCode: string): string {
    return this.apiUrl + `/schema/actions/getCrossMapping?plantCode=${plantCode}`;
  }


  /**
   * URL for schema execution progress details
   * @param schemaId: schema id for which execution details needed.
   */
  public schemaExecutionProgressDetailUrl(schemaId: string) {
    return `${this.apiUrl}/schema/getSchemaProgeress/${schemaId}`;
  }

  public downloadDuplicateExecutionDetailsUrl(schemaId: string, status: string): string {
    return `${this.apiUrl}/duplicate/download/${schemaId}/${status.toLocaleLowerCase()}`;
  }

  public downloadExecutionDetailsByNodesUrl(schemaId: string, status: string, nodes: string[], variantId: string): string {
    return `${this.origin}/schema/actions/download/data-quality/${schemaId}/${status.toLocaleLowerCase()}?variantId=${variantId}&nodes=${nodes.toString()}`;
  }

  public getAllTemplates(): string {
    return `${this.apiUrl}/report/share/email/template`;
  }

  public getTemplateById(_id: string): string {
    return `${this.apiUrl}/report/share/email/${_id}/template`;
  }

  /**
   * Get the APIs rule url
   * @returns Will return the url
   */
  public getApisRulesUrl(): string {
    return `${this.apiUrl}/schema/get-custom-apis`;
  }

  public getSlaStepSizeUrl(workflowid: string): string {
    return `${this.apiUrl}/report/get-wf-steps?workflowPaths=${workflowid}`;
  }
  public getTargetSystemUrl(): string {
    return `${this.apiUrl}/schema/metadata/target-system/sap`;
  }

  public getConflictedRecordsListUrl(): string {
    return `${this.apiUrl}/conflict/renderConflictRecUI`;
  }

  public getConflictedRecordDetailsUrl(): string {
    return `${this.apiUrl}/conflict/renderConflictRecJsonUI`;
  }

  public saveConflicResolveUrl(): string {
    return `${this.apiUrl}/conflict/saveConflictsAPI`;
  }

  public resetConflictCrUrl(): string {
    return `${this.apiUrl}/conflict/resetConflictCR`;
  }

  public getJobs(): string {
    return `${environment.apiurl}/sched/get-jobs`;
  }

  public getCancelJobUrl(jobId: string): string {
    return `${environment.apiurl}/sched/api/v1.0/cancel/${jobId}`;
  }
}
