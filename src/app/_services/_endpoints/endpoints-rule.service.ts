import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EndpointsRuleService {

  constructor() { }
  apiUrl = environment.apiurl + '/rule';
  readonly origin = `${environment.apiurl}/rule`;
  readonly classicOrigin = `${environment.apiurl}/MDOSF/fapi`;
  crossDatasetRuleAPIUrl = environment.apiurl + '/crossdataset';

  public getAllStructuresUrl(lang: string, moduleId: string, fetchCount: number, fetchSize: number, searchTerm: string): string {
    return environment.apiurl + `/core/module/${moduleId}/get-all-structures/${lang}?fetchSize=${fetchSize}&fetchCount=${fetchCount}&searchTerm=${searchTerm}`;
  }
  public getRuleDetailsUrl(groupId: string): string {
    return environment.apiurl + `/rule/dropval/dependency-info/${groupId}`;
  }
  public getStructureFieldsUrl(lang: string, moduleId: string, fetchCount: number, fetchSize: number, structureId: number): string {
    return environment.apiurl + `/core/module/fields/${moduleId}/${lang}/listFieldIdyStructure/${structureId}?fetchcount=${fetchCount}&fetchsize=${fetchSize}`;
  }
  public getUpdateRuleMetaDataUrl(): string {
    return environment.apiurl + `/rule/dropval/update-rule-dependency-metadata`;
  }
  public getModuleRulesUrl(moduleId: string): string {
    return environment.apiurl + `/rule/dropval/dependency-list/${moduleId}`;
  }
  public getSaveModuleRulesUrl(moduleId: string): string {
    return environment.apiurl + `/rule/dropval/group/save/${moduleId}?groupId`;
  }
  public getUpdateModuleRulesUrl(moduleId: string, groupId: string): string {
    return environment.apiurl + `/rule/dropval/group/save/${moduleId}?groupId=${groupId}`;
  }
  public getDeleteGroupUrl(groupId: string): string {
    return environment.apiurl + `/rule/dropval/dependency-condition/delete/${groupId}`;
  }
  public getFieldDetailsUrl(moduleId: string, fieldId: string): string {
    return environment.apiurl + `/core/metadata/fields/${moduleId}/getFieldDetails?fieldid=${fieldId}`;
  }
  public getDropdownofPickListUrl(moduleId: string, fieldId: string, lang: string): string {
    return environment.apiurl + `/rule/dropval/list/${moduleId}/${fieldId}/${lang}`;
  }
  public getgSaveConditionsUrl(moduleId: string, groupId: string, lang: string): string {
    return environment.apiurl + `/rule/dropval/save/mapping/${moduleId}/${groupId}/${lang}`;
  }
  public getRulesDetails(groupId: string): string {
    return environment.apiurl + `/rule/dropval/dependency-info/${groupId}`;
  }
  public getGroupConditionsUrl(groupId: string, lang: string) {
    return environment.apiurl + `/rule/dropval/dependency-condition-list/${groupId}?lang=${lang}`;
  }
  public getDeleteGroupConditionsUrl(groupId: string, mappingId: string) {
    return environment.apiurl + `/rule/dropval/dependency-condition/delete/${groupId}/${mappingId}`;
  }
  public getConditionByMappingIdUrl(groupId: string, mappingId: string, lang: string) {
    return environment.apiurl + `/rule/dropval/dependency-condition/${groupId}/${mappingId}?lang=${lang}`;
  }
  public getSchemaListByGroupIdUrl() {
    return this.origin + '/schema/metadata/schema-list';
  }

  public downloadExecutionDetailsUrl(schemaId: string, status: string): string {
    return `${this.origin}/schema/download/${schemaId}/${status.toLocaleLowerCase()}`;
  }

  public getScheduleSchemaUrl(isRunWithCheckedData: boolean): string {
    return this.origin + `/schema/schedule-schema?isRunWithCheckedData=${isRunWithCheckedData}`;
  }

  public getAllSchemabymoduleids(): string {
    return this.origin + '/schema/metadata/get-all-schemabymoduleids';
  }

  public getAllRunningSchemaList(offset: number, size: number, searchStr: string): string {
    return this.classicOrigin + `/schema/getAllRunningSchemaList?from=${offset}&size=${size}&searchString=${searchStr}`;
  }
  public updateSchemaBadgeInfo(schemaId: string): string {
    return this.classicOrigin + `/schema/updateSchemaBadgeInfo?schemaId=${schemaId}`;
  }

  public getSchemaDetailsBySchemaIdUrl(schemaId: string): string {
    return this.origin + '/schema/metadata/schema-details/' + schemaId;
  }

  public getSchemaTableDetailsUrl(): string {
    return this.origin + '/schema/schema-details';
  }

  public getUpdateSchemaTableViewUrl(): string {
    return this.origin + '/schema/metadata/update-schema-table-view';
  }

  public getCategoryInfoUrl(): string {
    return this.origin + '/schema/metadata/category-list';
  }

  public getAllSelectedFields(): string {
    return this.origin + `/schema/metadata/get-selected-fields-view`;
  }

  public getSelectedFieldsByNodeIds(): string {
    return this.origin + `/schema/metadata/get-selected-fields-views-by-nodeIds`;
  }

  public getSchemaVariantsUrl(schemaId: string): string {
    return this.classicOrigin + '/schema/variants/' + schemaId;
  }

  public getUDRDropdownValues(fieldId: string, searchStr: string): string {
    return this.classicOrigin + `/schema/drop-values/${fieldId}?queryString=${searchStr}`;
  }

  public getSchemaBrInfoList(schemaId: string): string {
    return `${this.origin}/schema/metadata/schema-br-infolist/${schemaId}`;
  }

  public doCorrectionUrl(schemaId: string): string {
    return `${this.origin}/schema/actions/do-correction/${schemaId}`;
  }

  public getCorrectedRecords(schemaId: string): string {
    return `${this.origin}/schema/get-corrected-records/${schemaId}`;
  }

  public getLastBrErrorRecords(schemaId: string): string {
    return `${this.origin}/schema/get-mdoerror-records/${schemaId}`;
  }

  public getSchemaExecutionLogUrl(schemaId: string): string {
    return `${this.origin}/schema/get-execution-logs/${schemaId}`;
  }

  public approveCorrectedRecords(schemaId: string): string {
    return `${this.origin}/schema/actions/approve-corrected-records/${schemaId}`;
  }

  public uploadFileDataUrl(): string {
    return `${this.classicOrigin}/schema/upload-file`;
  }

  public uploadDataUrl(objectType: string, fileSno: string): string {
    return `${this.classicOrigin}/schema/upload-data/${objectType}/${fileSno}`;
  }

  public getBusinessRulesInfoByModuleIdUrl() {
    return this.origin + `/schema/metadata/get-business-rules/`;
  }

  public getBusinessRulesInfoBySchemaIdUrl(schemaId: string) {
    return this.origin + `/schema/metadata/get-business-rules/${schemaId}`;
  }

  public getCategoriesInfo() {
    return this.origin + '/schema/metadata/category-list';
  }

  public getFillDataInfo(id) {
    return this.origin + '/schema/metadata-fileds/' + id;
  }

  public createBr() {
    return this.origin + '/schema/metadata/create-update-br';
  }

  public createBrV2() {
    return this.origin + '/schema/metadata/udr/save-update/V2';
  }

  public createSchema() {
    return this.origin + '/schema/metadata/create-update-schema';
  }

  public deleteBr(id): string {
    return this.origin + '/schema/metadata/delete-business-rule/' + id;
  }

  public returnCollaboratorsPermisisonUrl(reportId: string): string {
    return `${this.origin}/admin/permission/collaborators/permission/${reportId}`;
  }

  public saveUpdateReportCollaborator(): string {
    return `${this.origin}/admin/permission/collaborators/permission/save-update`;
  }

  public deleteCollaboratorUrl(permissionId: string): string {
    return `${this.origin}/admin/permission/collaborator/delete/${permissionId}`;
  }

  public getBrConditionalOperatorUrl(): string {
    return `${this.origin}/schema/metadata/br/condition-operator`;
  }

  public dropDownValuesUrl(fieldId: string): string {
    return `${this.classicOrigin}/schema/drop-values/${fieldId}`;
  }

  public dropDownValuesV2Url(fieldId: string): string {
    return `${this.classicOrigin}/schema/drop-values/V2/${fieldId}`;
  }

  public saveUpdateUdrBlockUrl(): string {
    return `${this.origin}/admin/schema/metadata/br/udr`;
  }

  public conditionListsUrl(objectType: string): string {
    return `${this.origin}/schema/metadata/br/udr/condition-list/${objectType}`;
  }

  public saveUpdateUDRUrl(): string {
    return `${this.origin}/schema/metadata/udr/save-update/V2`;
  }

  public getBusinessRuleInfoUrl(brId: string): string {
    return `${this.origin}/schema/metadata/get-business-rule-info/${brId}`;
  }

  public getDuplicateBusinessRuleUrl(brId: string): string {
    return `${this.origin}/schema/metadata/set-duplicate-business-rule/${brId}`;
  }

  public getBusinessRuleInfoUrlV2(brId: string): string {
    return `${this.origin}/schema/metadata/get-business-rule-info/V2/${brId}`;
  }

  public getUdrBusinessRuleInfoUrl(ruleId: string): string {
    return `${this.origin}/schema/metadata/br/udr/${ruleId}`;
  }

  public deleteConditionBlock(blockId: string): string {
    return `${this.origin}/schema/metadata/br/udr/delete-conditionblock/${blockId}`;
  }

  public getSchemaThresholdStatics(schemaId: string, variantId?: string): string {
    if (variantId === undefined || variantId === null || variantId === 'null') {
      return `${this.origin}/schema/statics/${schemaId}`;
    } else {
      return `${this.origin}/schema/statics/${schemaId}/${variantId}`;
    }
  }

  public getSchemaThresholdStaticsV2(schemaId: string, variantId?: string): string {
    if (variantId === undefined || variantId === null || variantId === 'null') {
      return `${this.origin}/schema/statics/${schemaId}`;
    } else {
      return `${this.origin}/schema/statics/${schemaId}/${variantId}`;
    }
  }

  public uploadCorrectionDataUrl(objectType: string, schemaId: string, runId: string, plantCode: string, fileSno: string): string {
    return `${this.origin}/es/uploadCorrection/${objectType}/${schemaId}/${runId}/${plantCode}/${fileSno}`;
  }

  public getCollaboratorDetailsUrl(schemaId: string): string {
    return `${this.origin}/schema/metadata/get-all-schemacollaborator-details/${schemaId}`;
  }

  public getCollaboratorDetailsV2Url(schemaId: string): string {
    return `${this.origin}/schema/metadata/get-all-schemacollaborator-details/${schemaId}`;
  }

  public createUpdateUserDetailsUrl(): string {
    return `${this.origin}/schema/metadata/create-update-schemacollaborator`;
  }

  public getAllUserDetailsUrl(): string {
    return `${this.classicOrigin}/admin/permission/collaborators`;
  }

  public deleteSchemaCollaboratorDetailsUrl(): string {
    return `${this.origin}/schema/metadata/collaborator-records/delete`;
  }

  public deleteSchema(schemaId: string): string {
    return `${this.origin}/schema/metadata/delete/${schemaId}`;
  }

  public saveUpdateVariantUrl(): string {
    return `${this.origin}/schema/metadata/data-variants`;
  }

  public getVariantdetailsByvariantIdUrl(variantId: string): string {
    return `${this.origin}/schema/metadata/variant/${variantId}`;
  }

  public deleteVariantUrl(variantId: string): string {
    return `${this.origin}/schema/metadata/variant/delete/${variantId}`;
  }

  public saveNewSchemaUrl(objectId: string, runNow: boolean, variantId: string, fileSno: string): string {
    return `${this.origin}/schema/actions/create-schema-onego?objectId=${objectId}&runNow=${runNow}&variantId=${variantId}&fileSno=${fileSno}`;
  }

  /**
   * Get url for schema info
   * @param moduleId module id/objectId
   */
  public getSchemaInfoByModuleIdUrl(moduleId: string): string {
    return `${this.origin}/schema/metadata/schema-info/${moduleId}`;
  }

  /**
   * Get url for module info
   * @param moduleId module id/objectId
   */
  public getModuleInfoByModuleIdUrl(): string {
    return `${this.classicOrigin}/schema/getModuleInfo`;
  }

  /**
   * Get schema with variants .. use for data intilligence ...
   *
   */
  public getSchemaWithVariantsUrl(): string {
    return `${this.origin}/schema/metadata/list-variants`;
  }

  public updateBrMap(): string {
    return `${this.origin}/schema/metadata/br/update-br-map`;
  }

  public getCategoriesUrl(): string {
    return this.origin + '/getCategories';
  }

  public getDependencyUrl(): string {
    return this.origin + '/getDependency';
  }

  public addCustomCategoryUrl(): string {
    return this.origin + '/addCategory';
  }

  public saveBusinessRuleUrl(): string {
    return this.origin + '/saveBusinessRule';
  }

  public getBusinessRuleApiListUrl(): string {
    return this.origin + '/getAPIList';
  }

  public getDuplicacySettingListUrl(): string {
    return this.origin + '/getDuplicacySettingList';
  }

  public getMetadataFieldsUrl(): string {
    return this.origin + '/getMetadataFields';
  }

  public getVariantDetailsForScheduleSchemaUrl(objectId: string): string {
    return this.origin + '/get-variants-list/' + objectId;
  }

  public getVariantControlByVariantIdUrl(variantId: string): string {
    return this.origin + '/get-variant-control/' + variantId;
  }

  public getBusinessRulesBySchemaId(schemaId: string, objectId: string): string {
    return this.origin + '/getBrDetailsBySchemaId/' + schemaId + '/' + objectId;
  }

  public getAssignBrToSchemaUrl(): string {
    return this.origin + '/assignBrToSchema';
  }

  public getWorkflowDataURL(): string {
    return this.origin + '/schema/get-wf-module-data';
  }

  /**
   * function to return API URL to get workflow fields.
   * if isWorkFlowDataSet is true then it will be in use..
   */
  public getWorkFlowFieldsUrl(): string {
    return this.origin + `/schema/get-wffields`;
  }

  public getWorkFlowPathUrl(): string {
    return this.origin + `/schema/get-wfpath`;
  }

  /**
   * Endpoint url to get notifications
   * @param senderUid username of logged in user
   */
  public getNotificationsUrl(senderUid, from: string, to: string): string {
    return `${this.origin}/notification/getNotification?senderUid=${senderUid}&from=${from}&to=${to}`;
  }

  /**
   * Endpoint to update/save notification
   */
  public getUpdateNotificationUrl(): string {
    return `${this.origin}/notification/saveNotification`;
  }

  /**
   * Endpoint to update/save notification
   */
  public getDeleteNotificationUrl(): string {
    return `${this.origin}/notification/deleteNotification`;
  }

  /**
   * Endpoint to get job queue url
   * @param userName username of logged in user
   * @param plantCode plantcode of logged in user
   */
  public getJobQueueUrl(userName: string, plantCode: string): string {
    return `${this.origin}/schema/jobs/get-all-jobs?userId=${userName}&plantCode=${plantCode}`;
  }

  public getNotificationsCount(senderUid): string {
    return `${this.origin}/notification/getNotificationCount?senderUid=${senderUid}`;
  }

  /**
   * endpoint for create/update schedule of schema
   * @param schemaId Id of schema
   */
  public createUpdateScheduleUrl(schemaId: string) {
    return `${this.classicOrigin}/schema/createupdate-schema-scheduler?schemaId=${schemaId}`;
  }

  /**
   * endpoint for getting schedule information of a schema
   * @param schemaId Id of schema
   */
  public getScheduleUrl(schemaId: string) {
    return `${this.classicOrigin}/schema/get-schema-scheduler/${schemaId}`;
  }

  /**
   * endpoint for saving and updating duplicate rule
   */
  public saveUpdateDuplicateRule(): string {
    return `${this.origin}/schema/actions/saveDuppsett`;
  }

  /**
   * endpoint for copy duplicate rule
   */
  public copyDuplicate(): string {
    return `${this.origin}/schema/actions/copyDuplicate`;
  }

  /**
   * endpoint for save/update schema data scope
   */
  public saveUpdateDataScopeUrl(): string {
    return `${this.origin}/schema/metadata/variant/create-update-single`;
  }

  public getDataScopeCount(moduleId: string): string {
    return `${this.origin}/schema/datascope-count?moduleId=${moduleId}`;
  }

  /**
   * endpoint for get schema data scope
   * @param schemaId: ID of schema
   * @param type: type of variants
   */
  public getAllDataScopeUrl(schemaId: string, type: string): string {
    return `${this.origin}/schema/variants/${schemaId}/${type}`;
  }
  /**
   * Get all noun and modifiers uri ..
   * @param schemaId append on request ..
   * @param runId append on request
   * @param variantId optional param if not there use 0 as Entire dataset ..
   */
  public getClassificationNounMod(schemaId: string, runId: string, variantId?: string) {
    return `${this.origin}/schema/getnounsAndModfiers/${schemaId}/${runId}`;
  }

  public getClassificationDataTableUrl(schemaId: string, runId: string, variantId?: string) {
    return `${this.origin}/schema/getClassificationListData/${schemaId}/${runId}`;
  }

  public getAllDataScopesUri(schemaId: string, type: string) {
    return `${this.classicOrigin}/schema/variants/${schemaId}/${type}`;
  }

  public generateCrossEntryUri(schemaId: string, objectType: string, objectNumber: string): string {
    return `${this.origin}/schema/generateCrossmodule/${schemaId}/${objectType}/${objectNumber}`;
  }

  /**
   * endpoint for create/update check data for schema
   */
  public createUpdateCheckDataUrl() {
    return `${this.origin}/schema/checkdata/save-update`;
  }
  public duplicacyGroupsListUrl(): string {
    return `${this.origin}/schema/actions/getgroupId`;
  }

  public catalogCheckRecordsUrl(): string {
    return `${this.origin}/schema/actions/getContent`;
  }

  /**
   * endpoint for getting check data for schema
   * @param schemaId: schema ID
   */
  public getCheckDataUrl(schemaId: string) {
    return `${this.origin}/schema/checkdata/get-all-br-collaborator-details/${schemaId}`;
  }

  public getAllBusinessRulesUrl() {
    return this.origin + `/schema/metadata/get-all-business-rules/`;
  }

  public getAllBusinessRulesUrls(fetchCount, fetchSize, searchString) {
    return this.origin + `/schema/metadata/get-all-business-rules?fetchCount=${fetchCount}&fetchSize=${fetchSize}&searchString=${searchString}`;
  }

  public getAllClassTypesUrl(page: number, pageSize: number, searchString: string) {
    return this.origin + `/class/get-classtype-list?page=${page}&size=${pageSize}&&searchString=${searchString}`;
  }

  public getColloquialNamesUrl(classId) {
    return this.origin + `/colloquialNames/get-colloquialNames/${classId}`;
  }

  /**
   * endpoint for creating business rules at the time of check data..
   */
  public createCheckDataBusinessRuleUrl(): string {
    return `${this.origin}/schema/metadata/create-br`;
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
    return `${this.origin}/schema/noun/${schemaId}/${runid}`;
  }

  /**
   * Get uri for suggested modifier ..
   * @param schemaId executed schema
   * @param runid get it from this runid
   */
  public getSuggestedModifierUri(schemaId: string, runid: string): string {
    return `${this.origin}/schema/modifier/${schemaId}/${runid}`;
  }

  /**
   * Get uri for suggested attribute ..
   *
   * @param schemaId executed schema
   * @param runid executed on this run
   */
  public getSuggestedAttributeUri(schemaId: string, runid: string): string {
    return `${this.origin}/schema/attribute/${schemaId}/${runid}`;
  }

  /**
   * Get doing correction uri ..
   */
  public doClassificationCorrectionUri(): string {
    return `${this.origin}/schema/actions/do-mro-correction`;
  }
  public getCreateNounModUrl(): string {
    return this.origin + '/schema/metadata/create-noun';
  }

  public getCreateAttributeUrl(): string {
    return this.origin + `/schema/metadata/add-attributes`;
  }

  public getSaveAttributesMappingUrl(): string {
    return this.origin + `/schema/metadata/save-mappings`;
  }

  public getFetchAttributesMappingUrl(): string {
    return this.origin + `/schema/metadata/get-mappings`;
  }

  /**
   * Get approve classification records uri ..
   */
  public approveClassificationUri(): string {
    return `${this.origin}/schema/actions/mro/approve`;
  }

  /**
   * Use this uri for reject or reset mro classification records ..
   */
  public rejectClassificationUri(): string {
    return `${this.origin}/schema/actions/mro/reset`;
  }

  /**
   * mark duplicacy record as master record
   */
  public masterRecordChangeUrl(): string {
    return `${this.origin}/schema/actions/updatemasterRecord`;
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
   * mark duplicacy record for exclusion
   * @param schemaId unique schema id
   * @param groupId group id
   */
  public markForExclusionUrl(schemaId, groupId): string {
    return `${this.origin}/schema/actions/add-to-exclusion-list?schemaId=${schemaId}&groupId=${groupId}`;
  }

  /**
   * do duplicacy result field correction
   * @param schemaId  schema id
   * @param runId run id
   */
  public doDuplicacyCorrectionUrl(schemaId, runId): string {
    return `${this.origin}/schema/actions/do-correction/${schemaId}/${runId}`;
  }

  /**
   * approve corrected duplicacy records uri
   * @param schemaId schema id
   * @param runId run id
   * @param userName username
   */
  public approveDuplicacyCorrectionUrl(schemaId, runId, userName): string {
    return `${this.origin}/schema/actions/approveDuplicateRecords/${schemaId}/${runId}?userName=${userName}`;
  }

  /**
   * approve corrected duplicacy records uri
   * @param schemaId schema id
   * @param runId run id
   * @param userName user name
   */
  public rejectDuplicacyCorrectionUrl(schemaId, runId, userName): string {
    return `${this.origin}/schema/actions/rejectDuplicateRecords/${schemaId}/${runId}?userName=${userName}`;
  }

  /**
   * Uri for reset schema execution correction data ..
   * @param schemaId append as request path
   */
  public resetCorrectionRecords(schemaId: string): string {
    return `${this.origin}/schema/actions/reset-corrected-records/${schemaId}`;
  }

  public getSchemaExecutedStatsTrendUri(schemaId: string, variantId: string): string {
    return this.origin + `/schema/execution/trends/${schemaId}/${variantId}`;
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
    return this.origin + `/schema/actions/create-update`;
  }

  public getCreateUpdateSchemaActionsListUrl(): string {
    return this.origin + `/schema/metadata/actions/bulkcreate-update`;
  }

  public getFindActionsBySchemaUrl(schemaId: string): string {
    return this.origin + `/schema/actions/${schemaId}`;
  }

  public getFindActionsBySchemaAndRoleUrl(schemaId: string, role: string): string {
    return this.origin + `/schema/actions/${schemaId}/${role}`;
  }

  public getDeleteSchemaActionUrl(schemaId: string, actionCode: string): string {
    return this.origin + `/schema/actions/deleteCustomAction/${schemaId}/${actionCode}`;
  }

  public getCrossMappingUrl(plantCode: string): string {
    return this.classicOrigin + `/schema/actions/getCrossMapping?plantCode=${plantCode}`;
  }

  /**
   * URL for schema execution progress details
   * @param schemaId: schema id for which execution details needed.
   */
  public schemaExecutionProgressDetailUrl(schemaId: string) {
    return `${this.origin}/schema/getSchemaProgeress/${schemaId}`;
  }

  public downloadDuplicateExecutionDetailsUrl(): string {
    return `${this.origin}/schema/actions/duplicate-download`;
  }

  public getSchemaExecutionTree(
    moduleId: string,
    schemaId: string,
    variantId: string,
    plantCode: string,
    userId: string,
    requestStatus: string
  ) {
    return `${this.origin}/schema/execution-tree/${moduleId}/${schemaId}?plantCode=${plantCode}&userId=${userId}&variantId=${variantId}&requestStatus=${requestStatus}`;
  }

  public getSchemaExecutionTreeV2(
    moduleId: string,
    schemaId: string,
    variantId: string,
    plantCode: string,
    userId: string,
    requestStatus: string
  ) {
    return `${this.origin}/schema/execution-tree/${moduleId}/${schemaId}?plantCode=${plantCode}&userId=${userId}&variantId=${variantId}&requestStatus=${requestStatus}`;
  }

  public uploadCsvFileDataUrl(schemaId: string, nodeId: string, nodeType: string, runId: string, objNDesc: string): string {
    return `${this.origin}/schema/uploadData?schemaId=${schemaId}&nodeId=${nodeId}&nodeType=${nodeType}&runId=${runId}&objNDesc=${objNDesc}`;
  }

  public getUploadProgressUrl(schemaId: string, runId: string): string {
    return `${this.origin}/schema/uploadStatus?schemaId=${schemaId}&runId=${runId}`;
  }

  /**
   * Get the all available datasets by plantcode ...
   * @returns the endpoint uri
   */
  public getAllDataSets(): string {
    return `${this.classicOrigin}/schema/getAllModuleInfo`;
  }

  /**
   * URI defined for get all fields based on nodeid
   * @returns will return the url for get all fields based on nodeid
   */
  public getallFieldsbynodeId(): string {
    return `${this.origin}/schema/metadata/getallFieldsbynodeId`;
  }

  /**
   * Get the uri for return all business rules in schema based on last run
   * @returns will return the url
   */
  public getBuisnessRulesBasedOnRunUrl(): string {
    return `${this.origin}/schema/metadata/get-running-brs`;
  }

  /**
   * Cancle schema uri
   * @returns will return the url
   */
  public cancleSchemaUri(): string {
    return `${this.origin}/schema/cancel-schema`;
  }

  /**
   * get all the transformation rules url
   * @returns will return the trans uri
   */
  public transformationRules(): string {
    return `${this.origin}/schema/metadata/transformationRuleLibrary`;
  }

  /**
   * Get the url for all transformatiom inside rule
   * @returns will return the mapped transformation rule inside the rule
   */
  public getMappedTransformationRulesUrl(): string {
    return `${this.origin}/schema/metadata/getTransformationmapping`;
  }

  /**
   * Get schema related global counts
   * @param schemaId selected schemaId
   * @returns will return schema global counts such as success,skipped and error
   */
  public getSchemaGlobalCounts(): string {
    return `${this.origin}/schema/get-global-count`;
  }

  /**
   * Get the table header metadata ...
   * @returns will return the url for get table header metadata ...
   */
  public getClassificationDatatableHeader(): string {
    return `${this.origin}/schema/get-nounheader-info`;
  }

  /**
   * Url for get the master lib. attribute value ...
   * @returns will return get attribute value url
   */
  public getClassificationAttributeValueUrl(): string {
    return `${this.classicOrigin}/schema/getAttributeValues`;
  }

  /**
   * Url for get the connekthub lib attributes ..
   * @returns will return the connethub lib attributes ..
   */
  public getConnecthukLibAttroibuteLib(): string {
    return `${this.origin}/schema/connekthub-attribute`;
  }

  /**
   * Url for validate cell with actual data
   * @returns will return the validate cell endpoint....
   */
  public validateCell(): string {
    return `${this.origin}/validate`;
  }
  public validateRecord(): string {
    return `${this.origin}/validate/v2`;
  }
  public getBusinessRulesForDIWDataset(): string {
    return `${this.classicOrigin}/schema/active-brs`;
  }

  public checkPermissionForSchemaDetails(): string {
    return `${this.origin}/schema/metadata/access`;
  }

  public getSaveCheckCodeURL(): string {
    return `${this.origin}/schema/metadata/save-check-code`;
  }
  public getCheckCodeListURL(): string {
    return `${this.origin}/schema/metadata/get-all-check-code`;
  }
  public getTargetSystems(): string {
    return `${this.origin}/schema/metadata/target-system/sap`;
  }

  public getDropvalsUrl(moduleId: string, fieldId: string, lang: string): string {
    return this.origin + `/dropval/list/${moduleId}/${fieldId}/${lang}`;
  }

  public getDropDownDetailsByFieldId(moduleId: string, searchString = ''): string {
    return this.origin + `/dropval/fields/getDropDownDetailsByFieldId?moduleId=${moduleId}&searchString=${searchString}`;
  }

  public getSaveDropvalsUrl(moduleId: string, fieldId: string, lang: string): string {
    return this.origin + `/dropval/save/${moduleId}/${fieldId}/${lang}`;
  }
  public getDeleteDropvalsUrl(): string {
    return this.origin + `/dropval/delete-drop-values`;
  }

  public getTenentRolesUrl(lang: string): string {
    return environment.apiurl + `/profile/roles-list`;
  }

  public diwListUrl(): string {
    return `${this.origin}/schema/metadata/schema-list-module`;
  }

  public getSchemaTabHistoryUrl() {
    return `${this.origin}/schema/metadata/getTabHistory`;
  }

  public saveSchemaTabHistoryUrl() {
    return `${this.origin}/schema/metadata/saveTabHistory`;
  }

  public getDropValuesUrl(moduleId: string, fieldId: string, lang = 'en', from = 0, size = 20): string {
    return this.origin + `/dropval/list/${moduleId}/${fieldId}/${lang}?pageNumber=${from}&pageSize=${size}`;
  }

  /**
   * Get the URL for check the global error state check ...
   * @returns url for same
   */
  public getErrorStatusCheckUrl() {
    return `${this.origin}/schema/health/status-check`;
  }

  /**
   * Create the queue , if not exits ...
   * @returns url for the same
   */
  public createQueueAndRunSchema() {
    return `${this.origin}/schema/health/create-update/queues`;
  }

  public exportSchema(schemaId: string): string {
    return `${this.origin}/schema/metadata/schema/export?schemaId=${schemaId}`;
  }
  public saveUpdateClassType() {
    return `${this.origin}/class/save-update-classtype`;
  }
  public getSaveCharacteristicsUrl(uuid: string): string {
    return `${this.origin}/characterstics/save-update-characterstics/${uuid}`;
  }
  public getSaveCharacteristicsListUrl(uuid: string): string {
    return `${this.origin}/characterstics/save-update-list-characterstics?uuid=${uuid}`;
  }
  public getDeleteCharacteristicUrl(uuid: string): string {
    return `${this.origin}/characterstics/delete-characteristics/${uuid}`;
  }

  public saveUpdateClassMapping() {
    return `${this.origin}/class/save-update-classMapping`;
  }

  public getClassMapping(classId) {
    return environment.apiurl + `/rule/class/get-classMapping/${classId}`;
  }

  public saveUpdateClass() {
    return `${this.origin}/class/save-update-class`;
  }

  public getModuleClass(moduleId: string, searchString: string): string {
    return `${this.origin}/class/get-all-class?moduleId=${moduleId}&seachString=${searchString}`;
  }

  public getBrListDaxeUdrUrl(brType: any, fetchCount: any, fetchSize: any, moduleId: any,searchString?): string {
    return `${this.origin}/schema/metadata/get-business-rules?brType=${brType}&fetchCount=${fetchCount}&fetchSize=${fetchSize}&moduleId=${moduleId}&searchString=${searchString}`;
  }

  public getDescriptionUrl(): string {
    return this.origin + `/descriptionGenerate/generate-description`;
  }
  public getClassInfo(uuid: string): any {
    return `${this.origin}/class/get-class/${uuid}`;
  }
  public getClassTypeDetails(classTypeID: string) {
    return `${this.origin}/class/get-classtype/${classTypeID}`;
  }

  public getAllClassesUrl(page, searchString, size) {
    return `${this.origin}/class/get-all-class?page=${page}&seachString=${searchString}&size=${size}`;
  }

  public getCharacteristicsListUrl(uuid: string, page: number, searchString: string, size: number, tanentId: string, type: string, dimension: string): string {
    return `${this.origin}/characterstics/get-characteristics-list/${uuid}?page=${page}&searchString=${searchString}&size=${size}&tanentId=${tanentId}&type=${type}&dimension=${dimension}`;
  }

  public getDeleteClasstypeUrl(classtypeId: string, flag: boolean): string {
    return `${this.origin}/class/delete-classtype?classType=${classtypeId}&flag=${flag}`;
  }
  public getDeleteAllClassesByClassTypeUrl(uuid: string, flag: boolean): string {
    return `${this.origin}/class/delete-by-classType?classType=${uuid}?flag=${flag}`;
  }

  public getDeleteClassUrl(uuid: string): string {
    return `${this.origin}/class/delete-class/${uuid}`;
  }

  public createUpdateBr(): string {
    return `${this.origin}/schema/metadata/create-update-br`;
  }

  public createUpdateCrossDatasetRule(senarioId) {
    return `${this.crossDatasetRuleAPIUrl}/save-update-cross-dataset-rule?scenarioId=${senarioId}`;
  }

  public getDropdownInfo(moduleId: number,fieldId: number, lang: string ): string {
    return `${this.origin}/rule/dropval/list/{moduleId}/{fieldId}/{lang}`;
  }
  public getClassDetails(classId: string) {
    return `${this.origin}/class/get-class/${classId}`;
  }

  public uploadSchemaFile() {
    return `${this.origin}/schema/metadata/upload?isAllowModifiedFile=false`;
  }

  public importSchemaUrl(fileSno: string, schemaId: string, keepCopy: boolean, replaceOld: boolean): string {
    return `${this.origin}/schema/metadata/import?fileSno=${fileSno}&schemaId=${schemaId}&keepCopy=${keepCopy}&replaceOld=${replaceOld}`;
  }

  public saveUpdateColloquialList(uuid: string) {
    return `${this.origin}/colloquialNames/save-update-colloquialNames/${uuid}`;
  }

  public saveDimensions(): string {
    return `${this.origin}/dimensions/save-update-dimensions`;
  }

  public getDimensionsUrl(): string {
    return `${this.origin}/dimensions/get-dimensions`;
  }

  public getDimensionsByIdUrl(uuid: string): string {
    return `${this.origin}/dimensions/get-dimensionsByUuid/${uuid}`;
  }

  public saveUpdateCharacteristicOrderList(){
    return `${this.origin}/characterstics/save-update-list-characterstics`;
  }

  public getReorderCharacteristicListUrl(){
    return `${this.origin}/characterstics/updateCharactersticsList`;
  }
  public getBusinessRulesCountUrl(moduleId: string) {
    return this.origin + `/schema/metadata/get-countofBrs/${moduleId}`;
  }

  public getDaxeRules(moduleId: string): string {
    return `${this.origin}/get-all-daxe-rules/${moduleId}`;
  }

  public getDaxeInfo(uuid: string): string {
    return `${this.origin}/get-daxe-info/${uuid}`;
  }

  public saveDaxeRule(): string {
    return `${this.origin}/save-update-daxe-rule`;
  }

  public uploadCSVUrl(classTypeId: string,classType: string): string {
    return `${this.apiUrl}/class/create-job-to-upload-class-taxonomy?classTypeId=${classTypeId}&classType=${classType}`
  }

  public downloadTaxonomy(classTypeId: string,classType: string, language: string): string {
    return `${this.apiUrl}/class/create-job-to-download-class-taxonomy?classTypeId=${classTypeId}&classType=${classType}&language=${language}`
  }

  /**
   * Get the business rule based on type ...
   * @returns will return the endoint for the same ..
   */
  public getBusinessRulesBasedOnType() : string {
    return `${this.origin}/schema/metadata/rules/search`;
  }

  public translateClassTypes() : string {
    return `${this.origin}/mass/translate-class-types`;
  }

  dropDownBulkUpload() {
    return environment.apiurl + `/rule/dropval/dropDownBulkUpload`;
  }
  dropDownDownload(moduleId: string, fieldId: string) {
    return environment.apiurl + `/rule/dropval/dropDownDownload/${moduleId}/${fieldId}`;
  }
  public getCharacteristicsUrl(uuid: string): string {
    return `${this.origin}/characterstics/get-characteristics/${uuid}`;
  }

  getClassificationHierarchyTreeUrl() {
    return `${this.origin}/classification/get-hierarchy-tree`
  }

  getClassificationDataUrl() {
    return `${this.origin}/classification/get-classification-data`
  }

  generateDescriptionUrl(moduleId, channelId, userId) {
    return `${this.origin}/descriptionGenerate/mass-generate-description?moduleId=${moduleId}&channelId=${channelId}&userId=${userId}`
  }

  getClassificationCorrDataUrl() {
    return `${this.origin}/classification/get-corr-classification-data`
  }
}
