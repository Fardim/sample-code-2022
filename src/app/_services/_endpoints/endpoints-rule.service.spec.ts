import { TestBed, async } from '@angular/core/testing';

import { EndpointsRuleService } from './endpoints-rule.service';

describe('EndpointsRuleService', () => {
  let service: EndpointsRuleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EndpointsRuleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getSchemaListByGroupIdUrl(), getSchemaListByGroupIdUrl', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getSchemaListByGroupIdUrl()).toContain('/schema/metadata/schema-list');
  }));

  it('downloadExecutionDetailsUrl(),should download execution details', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.downloadExecutionDetailsUrl('5678987', 'success')).toContain('schema/download/5678987/success');
  }));

  it('getScheduleSchemaUrl(),should schedule schema details', async(() => {
    const serObj = new EndpointsRuleService();
    const isRunWithCheckedData = true;
    expect(serObj.getScheduleSchemaUrl(isRunWithCheckedData)).toContain('schema/schedule-schema');
  }));

  it('getAllSchemabymoduleids(),should return module details', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getAllSchemabymoduleids()).toContain('schema/metadata/get-all-schemabymoduleids');
  }));

  it('getSchemaDetailsBySchemaIdUrl(),should return all schema detials by schemaId', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getSchemaDetailsBySchemaIdUrl('355555320681 ')).toContain('schema/metadata/schema-details/355555320681');
  }));

  it('getSchemaTableDetailsUrl(),should return table details', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getSchemaTableDetailsUrl()).toContain('schema/schema-details');
  }));

  it('getUpdateSchemaTableViewUrl(),should return count of schema table view', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getUpdateSchemaTableViewUrl()).toContain('schema/metadata/update-schema-table-view');
  }));

  it('getCategoryInfoUrl(),should return category info', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getCategoryInfoUrl()).toContain('schema/metadata/category-list');
  }));

  it('getAllUnselectedFields(), should return the unselected url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getAllSelectedFields()).toContain('/schema/metadata/get-selected-fields-view');
  }));

  it('getSchemaVariantsUrl(),should return schema variant details', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getSchemaVariantsUrl('7564564')).toContain('schema/variants/7564564');
  }));

  it('getSchemaBrInfoList(), should return the schema br information list url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getSchemaBrInfoList('28364872686186')).toContain('schema/metadata/schema-br-infolist/28364872686186');
  }));

  it('doCorrectionUrl(), should return the schema do correction url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.doCorrectionUrl('28364872686186')).toContain('schema/actions/do-correction/28364872686186');
  }));

  it('getCorrectedRecords(),should return corrected records', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getCorrectedRecords('7564564')).toContain('schema/get-corrected-records/7564564');
  }));

  it('getLastBrErrorRecords(),should return error records', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getLastBrErrorRecords('7564564')).toContain('schema/get-mdoerror-records/7564564');
  }));

  it('getSchemaExecutionLogUrl(), should return the schema execution logs  url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getSchemaExecutionLogUrl('28364872686186')).toContain('schema/get-execution-logs/28364872686186');
  }));

  it('approveCorrectedRecords(), should return all approved correct records', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.approveCorrectedRecords('28364872686186')).toContain('schema/actions/approve-corrected-records/28364872686186');
  }));

  it('uploadFileDataUrl(), should return the upload file data   url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.uploadFileDataUrl()).toContain('schema/upload-file');
  }));

  it('uploadDataUrl(), should return the upload  data   url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.uploadDataUrl('1005', '1234')).toContain('schema/upload-data/1005/1234');
  }));

  it('getBusinessRulesInfoByModuleIdUrl(), should return the br info by moduleId', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getBusinessRulesInfoByModuleIdUrl()).toContain('schema/metadata/get-business-rules');
  }));

  it('getBusinessRulesInfoBySchemaIdUrl(), should return the br info by schemaId', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getBusinessRulesInfoBySchemaIdUrl('1234')).toContain('schema/metadata/get-business-rules/1234');
  }));

  it('getCategoriesInfo(), should return the category list', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getCategoriesInfo()).toContain('schema/metadata/category-list');
  }));

  it('getFillDataInfo(),should return fill data info', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getFillDataInfo('7564564')).toContain('schema/metadata-fileds/7564564');
  }));

  it('createBr(),should create business rule', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.createBr()).toContain('schema/metadata/create-update-br');
  }));

  it('createSchema(),should create schema', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.createSchema()).toContain('schema/metadata/create-update-schema');
  }));

  it('deleteBr(),should delete businessrule', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.deleteBr(75687687)).toContain('schema/metadata/delete-business-rule/' + 75687687);
  }));

  it('returnCollaboratorsPermisisonUrl(), should return the collaborator permission', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.returnCollaboratorsPermisisonUrl('6543789')).toContain('/admin/permission/collaborators/permission/6543789');
  }));

  it('saveUpdateReportCollaborator(),should save or update report collaborator details', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.saveUpdateReportCollaborator()).toContain('admin/permission/collaborators/permission/save-update');
  }));

  it('deleteCollaboratorUrl(), should return the delete url', async(() => {
    const serObj = new EndpointsRuleService();
    const permisionId = '243787235';
    expect(serObj.deleteCollaboratorUrl(permisionId)).toContain(
      `admin/permission/collaborator/delete/${permisionId}`,
      `admin/permission/collaborator/delete/${permisionId}  sould be return!`
    );
  }));

  it('getBrConditionalOperatorUrl(),should return condition operator details', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getBrConditionalOperatorUrl()).toContain('schema/metadata/br/condition-operator');
  }));

  it('dropDownValuesUrl(),should return dropdown value for fieldId', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.dropDownValuesUrl('NDC_TYPE')).toContain('schema/drop-values/NDC_TYPE');
  }));

  it('dropDownValuesV2Url(),should return dropdown value for fieldId', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.dropDownValuesV2Url('NDC_TYPE')).toContain('schema/drop-values/V2/NDC_TYPE');
  }));

  it('saveUpdateUdrBlockUrl(),should save or update udr details', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.saveUpdateUdrBlockUrl()).toContain('admin/schema/metadata/br/udr');
  }));

  it('conditionListsUrl(),should return condition list', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.conditionListsUrl('355555320681')).toContain('schema/metadata/br/udr/condition-list/355555320681');
  }));

  it('saveUpdateUDRUrl(), should saveudr rule', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.saveUpdateUDRUrl()).toContain('schema/metadata/udr/save-update');
  }));

  it('getBusinessRuleInfoUrl(),should return all business rule details', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getBusinessRuleInfoUrlV2('355555320681')).toContain('schema/metadata/get-business-rule-info/V2/355555320681');
  }));

  it('getUdrBusinessRuleInfoUrl(),should return udr details', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getUdrBusinessRuleInfoUrl('355555320681')).toContain('schema/metadata/br/udr/355555320681');
  }));

  it('deleteConditionBlock(), should return the delete condition  url', async(() => {
    const serObj = new EndpointsRuleService();
    const blockId = '243787235';
    expect(serObj.deleteConditionBlock(blockId)).toContain(`schema/metadata/br/udr/delete-conditionblock/${blockId}`);
  }));

  it('getSchemaThresholdStatics(),should return schema thresholdstatics value', async(() => {
    const serObj = new EndpointsRuleService();
    const schemaId = '867576576';
    expect(serObj.getSchemaThresholdStatics(schemaId)).toContain(`schema/statics/${schemaId}`);

    const variantId = '0';
    expect(serObj.getSchemaThresholdStatics(schemaId, variantId)).toContain(`schema/statics/${schemaId}/${variantId}`);
  }));

  it('getSchemaThresholdStaticsV2(),should return schema thresholdstatics value', async(() => {
    const serObj = new EndpointsRuleService();
    const schemaId = '867576576';
    expect(serObj.getSchemaThresholdStaticsV2(schemaId)).toContain(`schema/statics/${schemaId}`);

    const variantId = '0';
    expect(serObj.getSchemaThresholdStaticsV2(schemaId, variantId)).toContain(`schema/statics/${schemaId}/${variantId}`);
  }));

  it('uploadCorrectionDataUrl(),should upload correction data', async(() => {
    const serObj = new EndpointsRuleService();
    const objectType = 'Material';
    const schemaId = '7674654';
    const runId = '87676556';
    const plantCode = '0';
    const fileSno = '7765';
    expect(serObj.uploadCorrectionDataUrl(objectType, schemaId, runId, plantCode, fileSno)).toContain(
      `es/uploadCorrection/${objectType}/${schemaId}/${runId}/${plantCode}/${fileSno}`
    );
  }));

  it('getCollaboratorDetailsUrl(), should return the person details  url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getCollaboratorDetailsUrl('28364872686186')).toContain(
      'schema/metadata/get-all-schemacollaborator-details/28364872686186'
    );
  }));

  it('createUpdatePersonDetailsUrl(), should  create and update person details url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.createUpdateUserDetailsUrl()).toContain('schema/metadata/create-update-schemacollaborator');
  }));

  it('getAllUserDetailsUrl(), should return the all person details url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getAllUserDetailsUrl()).toContain('admin/permission/collaborators');
  }));

  it('deleteSchemaCollaboratorDetailsUrl(),should delte the exexting collaborator derail', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.deleteSchemaCollaboratorDetailsUrl()).toContain('schema/metadata/collaborator-records/delete');
  }));

  it('deleteSchema(),should delte the schema', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.deleteSchema('355535857155320681 ')).toContain('schema/metadata/delete/355535857155320681');
  }));

  it('saveUpdateVariantUrl(), hould  create and update Variant details url', () => {
    const serviceobj = new EndpointsRuleService();
    expect(serviceobj.saveUpdateVariantUrl()).toContain(`schema/metadata/data-variants`);
  });

  it('getVariantdetailsByvariantIdUrl(),should return all variant detials by variantId', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getVariantdetailsByvariantIdUrl('355555320681 ')).toContain('schema/metadata/variant/355555320681');
  }));

  it('deleteVariantUrl(),should delete variant details', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.deleteVariantUrl('35555320681 ')).toContain('schema/metadata/variant/delete/35555320681');
  }));

  it('saveNewSchemaUrl(), save new schema details', async(() => {
    const serObj = new EndpointsRuleService();
    const objectId = '1005';
    const runNow = true;
    const variantId = '0';
    const fileSno = '7635237862234';
    expect(serObj.saveNewSchemaUrl(objectId, runNow, variantId, fileSno)).toContain(
      `rule/schema/actions/create-schema-onego?objectId=${objectId}&runNow=${runNow}&variantId=${variantId}&fileSno=${fileSno}`
    );
  }));

  it('getSchemaInfoByModuleIdUrl(),should return getSchemaInfoByModuleIdUrl url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getSchemaInfoByModuleIdUrl('1005')).toContain('schema/metadata/schema-info/1005');
  }));

  it('getModuleInfoByModuleIdUrl(),should return getModuleInfoByModuleId url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getModuleInfoByModuleIdUrl()).toContain('schema/getModuleInfo');
  }));

  it('getSchemaWithVariantsUrl(),should return getSchemaWithVariantsUrl url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getSchemaWithVariantsUrl()).toContain('/schema/metadata/list-variants');
  }));

  it('updateBrMap(),should return updateBrMap url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.updateBrMap()).toContain(`schema/metadata/br/update-br-map`);
  }));

  it('getCategoriesUrl(),should return getCategoriesUrl url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getCategoriesUrl()).toContain(`/getCategories`);
  }));

  it('getDependencyUrl(),should return getDependencyUrl url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getDependencyUrl()).toContain(`/getDependency`);
  }));

  it('addCustomCategoryUrl(),should return addCustomCategoryUrl url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.addCustomCategoryUrl()).toContain(`/addCategory`);
  }));

  it('saveBusinessRuleUrl(),should return saveBusinessRuleUrl url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.saveBusinessRuleUrl()).toContain(`/saveBusinessRule`);
  }));

  it('getBusinessRuleApiListUrl(),should return getBusinessRuleApiListUrl url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getBusinessRuleApiListUrl()).toContain(`/getAPIList`);
  }));

  it('getDuplicacySettingListUrl(),should return getDuplicacySettingListUrl url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getDuplicacySettingListUrl()).toContain(`/getDuplicacySettingList`);
  }));

  it('getMetadataFieldsUrl(),should return getMetadataFieldsUrl url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getMetadataFieldsUrl()).toContain(`/getMetadataFields`);
  }));

  it('getVariantDetailsForScheduleSchemaUrl(),should return getVariantDetailsForScheduleSchemaUrl url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getVariantDetailsForScheduleSchemaUrl('1005')).toContain(`/get-variants-list/1005`);
  }));

  it('getVariantControlByVariantIdUrl(),should return getVariantControlByVariantIdUrl url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getVariantControlByVariantIdUrl('765434678764')).toContain(`/get-variant-control/765434678764`);
  }));

  it('getBusinessRulesBySchemaId(),should return getBusinessRulesBySchemaId url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getBusinessRulesBySchemaId('765434678764', '1005')).toContain(`/getBrDetailsBySchemaId/765434678764/1005`);
  }));

  it('getAssignBrToSchemaUrl(),should return getAssignBrToSchemaUrl url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getAssignBrToSchemaUrl()).toContain(`/assignBrToSchema`);
  }));

  it('getWorkflowDataURL(),should return getWorkflowDataURL url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getWorkflowDataURL()).toContain(`/schema/get-wf-module-data`);
  }));

  it('getWorkFlowFieldsUrl(),should return getWorkFlowFieldsUrl url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getWorkFlowFieldsUrl()).toContain('schema/get-wffields');
  }));

  it('getWorkFlowPathUrl(),should return getWorkFlowPathUrl url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getWorkFlowPathUrl()).toContain('schema/get-wfpath');
  }));

  it('getNotificationsUrl(),should return getNotificationsUrl url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getNotificationsUrl('uid', 'from', 'to')).toContain('/notification/getNotification?senderUid=uid&from=from&to=to');
  }));

  it('getUpdateNotificationUrl(),should return getUpdateNotificationUrl url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getUpdateNotificationUrl()).toContain('notification/saveNotification');
  }));

  it('getDeleteNotificationUrl(), Endpoint to delete notification', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getDeleteNotificationUrl()).toContain(`notification/deleteNotification`);
  }));

  it('getJobQueueUrl(), return count of notification', async(() => {
    const serObj = new EndpointsRuleService();
    const userName = 'harshit';
    const plantCode = '0';
    expect(serObj.getJobQueueUrl(userName, plantCode)).toContain(`schema/jobs/get-all-jobs?userId=${userName}&plantCode=${plantCode}`);
  }));

  it('getNotificationsCount(), return count of notification', async(() => {
    const serObj = new EndpointsRuleService();
    const senderUid = '654567879';
    expect(serObj.getNotificationsCount(senderUid)).toContain(`notification/getNotificationCount?senderUid=${senderUid}`);
  }));

  it('createUpdateScheduleUrl(), endpoint for create/update schedule of schema', async(() => {
    const serObj = new EndpointsRuleService();
    const schemaId = '654567879';
    expect(serObj.createUpdateScheduleUrl(schemaId)).toContain(`schema/createupdate-schema-scheduler?schemaId=${schemaId}`);
  }));

  it('getScheduleUrl(), getScheduleUrl', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getScheduleUrl('6433365')).toContain('/schema/get-schema-scheduler/6433365');
  }));

  it('saveUpdateDuplicateRule(),should return saveUpdateDuplicateRule url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.saveUpdateDuplicateRule()).toContain('schema/metadata/saveDuppsett');
  }));

  it('copyDuplicate(),should return co[y duplicate url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.copyDuplicate()).toContain('/schema/actions/copyDuplicate');
  }));

  it('saveUpdateDataScopeUrl(),should return saveUpdateDataScopeUrl url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.saveUpdateDataScopeUrl()).toContain('schema/metadata/variant/create-update-single');
  }));

  it('getAllDataScopeUrl(),should return getAllDataScopeUrl url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getAllDataScopeUrl('schema1', 'type1')).toContain('schema/variants/schema1/type1');
  }));

  it('getClassificationNounMod(), Get all noun and modifiers uri', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getClassificationNounMod('576544667', '645425', '975453564')).toContain('/schema/getnounsAndModfiers/576544667/645425');
  }));

  it('getClassificationDataTableUrl(), getClassificationDataTableUrl', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getClassificationDataTableUrl('576544667', '645425', '975453564')).toContain(
      'schema/getClassificationListData/576544667/645425'
    );
  }));

  it('getAllDataScopesUri(), getAllDataScopesUri', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getAllDataScopesUri('schemaId', 'type')).toContain('/schema/variants/schemaId/type');
  }));

  it('generateCrossEntryUri(),should return generateCrossEntryUri url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.generateCrossEntryUri('schemaId', 'objectType', 'objectNumber')).toContain(
      'schema/generateCrossmodule/schemaId/objectType/objectNumber'
    );
  }));

  it('createUpdateCheckDataUrl(), endpoint for create/update check data for schema', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.createUpdateCheckDataUrl()).toContain('/schema/checkdata/save-update');
  }));

  it('duplicacyGroupsListUrl(), duplicacyGroupsListUrl', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.duplicacyGroupsListUrl()).toContain('/schema/actions/getgroupId');
  }));

  it('catalogCheckRecordsUrl(), catalogCheckRecordsUrl', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.catalogCheckRecordsUrl()).toContain('/schema/actions/getContent');
  }));

  it('getCheckDataUrl(), should return endpoint for getting check data for schema', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getCheckDataUrl('8765434678')).toContain('schema/checkdata/get-all-br-collaborator-details/8765434678');
  }));

  it('getAllBusinessRulesUrl(), should return all business rule exist for the particular plantcode', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getAllBusinessRulesUrl()).toContain('schema/metadata/get-all-business-rules');
  }));

  it('createCheckDataBusinessRuleUrl(), creating business rules at the time of check data..', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.createCheckDataBusinessRuleUrl()).toContain('schema/metadata/create-br');
  }));

  it('getAvailableNounsUri(),should return getAvailableNounsUri url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getAvailableNounsUri()).toContain('schema/noun');
  }));

  it('getAvailableModifierUri(),should return getAvailableModifierUri url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getAvailableModifierUri()).toContain('schema/modifier');
  }));

  it('getAvailableAttributeUri(),should return getAvailableAttributeUri url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getAvailableAttributeUri()).toContain('schema/attribute');
  }));

  it('getSuggestedNounUri(),should return suggested noun ..', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getSuggestedNounUri('654578876', '45363')).toContain('schema/noun/654578876/45363');
  }));

  it('getSuggestedModifierUri(),should return suggested modifier ..', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getSuggestedModifierUri('654578876', '45363')).toContain('schema/modifier/654578876/45363');
  }));

  it('getSuggestedAttributeUri(),should return suggested attribute ..', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getSuggestedAttributeUri('654578876', '45363')).toContain('schema/attribute/654578876/45363');
  }));

  it('doClassificationCorrectionUri(),should return doClassificationCorrectionUri url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.doClassificationCorrectionUri()).toContain('schema/actions/do-mro-correction');
  }));

  it('getCreateNounModUrl(),should return create noun url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getCreateNounModUrl()).toContain('create-noun');
  }));

  it('getCreateAttributeUrl(), should return create-attribute url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getCreateAttributeUrl()).toContain('add-attributes');
  }));

  it('getSaveAttributesMappingUrl(),should return save-mappings url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getSaveAttributesMappingUrl()).toContain('save-mappings');
  }));

  it('getFetchAttributesMappingUrl(),should return getFetchAttributesMapping url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getFetchAttributesMappingUrl()).toContain('get-mappings');
  }));

  it('approveClassificationUri(),should return approveClassification url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.approveClassificationUri()).toContain('mro/approve');
  }));

  it('rejectClassificationUri(),should return rejectClassification url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.rejectClassificationUri()).toContain('mro/reset');
  }));

  it('masterRecordChangeUrl(),should return masterRecordChangeUrl url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.masterRecordChangeUrl()).toContain('schema/actions/updatemasterRecord');
  }));

  it('markForDeletionUrl(),should return markForDeletionUrl url', async(() => {
    const serObj = new EndpointsRuleService();

    expect(serObj.markForDeletionUrl('diw_15', 'mod1', 'schema', 'run')).toContain('/schema/actions/update-delFlag/diw_15/mod1/schema/run');
  }));

  it('doDuplicacyCorrectionUrl(),should return doDuplicacyCorrectionUrl url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.doDuplicacyCorrectionUrl('schema1', 'run1')).toContain('schema/actions/do-correction/schema1/run1');
  }));

  it('approveDuplicacyCorrectionUrl(),should return approveDuplicacyCorrectionUrl url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.approveDuplicacyCorrectionUrl('schema', 'run', 'user')).toContain(
      '/schema/actions/approveDuplicateRecords/schema/run?userName=user'
    );
  }));

  it('rejectDuplicacyCorrectionUrl(),should return rejectDuplicacyCorrectionUrl url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.rejectDuplicacyCorrectionUrl('schema', 'run', 'user')).toContain(
      'schema/actions/rejectDuplicateRecords/schema/run?userName=user'
    );
  }));

  it('resetCorrectionRecords(), return Uri for reset schema execution correction data ', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.resetCorrectionRecords('654567879')).toContain('schema/actions/reset-corrected-records/654567879');
  }));

  it('downloadMroExceutionUri(),should return downloadMroExceutionUri url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.downloadMroExceutionUri('schema')).toContain('schema/actions/download/mro');
  }));

  it('generateMroClassificationDescriptionUri(),should return generateMroClassificationDescriptionUri url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.generateMroClassificationDescriptionUri()).toContain('schema/actions/mro/generate-description');
  }));

  it('getSchemaExecutedStatsTrendUri(),should return getExecutionOverviewChartDataUrl url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getSchemaExecutedStatsTrendUri('schema1', '0')).toContain('schema/execution/trends/schema1/0');
  }));

  it('generateCrossEntryUri(),should return generateCrossEntryUri url', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.generateCrossEntryUri('schemaId', 'objectType', 'objectNumber')).toContain(
      'schema/generateCrossmodule/schemaId/objectType/objectNumber'
    );
  }));

  it('resetCorrectionRecords(), return Uri for reset schema execution correction data ', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.resetCorrectionRecords('654567879')).toContain('schema/actions/reset-corrected-records/654567879');
  }));

  it('getNotificationsCount(), return count of notification', async(() => {
    const serObj = new EndpointsRuleService();
    const senderUid = '654567879';
    expect(serObj.getNotificationsCount(senderUid)).toContain(`notification/getNotificationCount?senderUid=${senderUid}`);
  }));

  it('saveUpdateUDRUrl(), should saveudr rule', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.saveUpdateUDRUrl()).toContain('schema/metadata/udr/save-update');
  }));

  it('getCreateUpdateSchemaActionUrl(), getCreateUpdateSchemaActionUrl', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getCreateUpdateSchemaActionUrl()).toContain('/schema/actions/create-update');
  }));

  it('getCreateUpdateSchemaActionsListUrl(), getCreateUpdateSchemaActionsListUrl', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getCreateUpdateSchemaActionsListUrl()).toContain('/schema/metadata/actions/bulkcreate-update');
  }));

  it('getFindActionsBySchemaUrl(), getFindActionsBySchemaUrl', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getFindActionsBySchemaUrl('schema1')).toContain('/schema/actions/schema1');
  }));

  it('getFindActionsBySchemaAndRoleUrl(), getFindActionsBySchemaAndRoleUrl', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getFindActionsBySchemaAndRoleUrl('schema1', 'admin')).toContain('/schema/actions/schema1/admin');
  }));

  it('getDeleteSchemaActionUrl(), getDeleteSchemaActionUrl', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getDeleteSchemaActionUrl('schema1', '1701')).toContain('schema/actions/deleteCustomAction/schema1/1701');
  }));

  it('getCrossMappingUrl(), getCrossMappingUrl', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getCrossMappingUrl('0')).toContain('/schema/actions/getCrossMapping?plantCode=0');
  }));

  it('getSchemaExecutionProgressDetailUrl(), should return URL for getting execution progress', async () => {
    const serviceObj = new EndpointsRuleService();
    const schemaId = '25634';
    const URL = serviceObj.schemaExecutionProgressDetailUrl(schemaId);
    expect(URL).toContain(`schema/getSchemaProgeress/${schemaId}`);
  });

  it('downloadDuplicateExecutionDetailsUrl(), should downloadDuplicateExecutionDetailsUrl', async () => {
    const serviceObj = new EndpointsRuleService();
    const URL = serviceObj.downloadDuplicateExecutionDetailsUrl();
    expect(URL).toContain(`/schema/actions/duplicate-download`);
  });

  it('getSchemaExecutionTree(), should getSchemaExecutionTree', async () => {
    const serviceObj = new EndpointsRuleService();
    const URL = serviceObj.getSchemaExecutionTree('module1', 'schema1', 'varaint1', 'plantCode', 'userId', 'error');
    expect(URL).toContain(`schema/execution-tree/module1/schema1`);
  });

  it('getSchemaExecutionTreeV2(), should getSchemaExecutionTreeV2', async () => {
    const serviceObj = new EndpointsRuleService();
    const URL = serviceObj.getSchemaExecutionTreeV2('module1', 'schema1', 'varaint1', 'plantCode', 'userId', 'error');
    expect(URL).toContain(`schema/execution-tree/module1/schema1`);
  });

  it('getSelectedFieldsByNodeIds()', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getSelectedFieldsByNodeIds()).toContain('/schema/metadata/get-selected-fields-views-by-nodeIds');
  }));

  it('uploadCsvFileDataUrl()', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.uploadCsvFileDataUrl('', '', '', '', '')).toContain('/schema/uploadData?schemaId');
  }));

  it('getUploadProgressUrl()', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getUploadProgressUrl('', '')).toContain('/schema/uploadStatus?schemaId');
  }));

  it('getBuisnessRulesBasedOnRunUrl()', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getBuisnessRulesBasedOnRunUrl()).toContain('/schema/metadata/get-running-brs');
  }));

  it('cancleSchemaUri()', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.cancleSchemaUri()).toContain('/schema/cancel-schema');
  }));

  it('transformationRules() should return the tarnsformation rule lib. ', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.transformationRules()).toContain('/schema/metadata/transformationRuleLibrary');
  }));

  it('getMappedTransformationRulesUrl() get the mapped transformation rules ... ', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getMappedTransformationRulesUrl()).toContain('/schema/metadata/getTransformationmapping');
  }));

  it('getSchemaGlobalCounts() get schema related global counts', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getSchemaGlobalCounts()).toContain('/schema/get-global-count');
  }));

  it('getClassificationDatatableHeader() get classification header ', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getClassificationDatatableHeader()).toContain('/schema/get-nounheader-info');
  }));

  it('getClassificationAttributeValueUrl() get attribute value url  ', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getClassificationAttributeValueUrl()).toContain('/schema/getAttributeValues');
  }));

  it('getBusinessRulesForDIWDataset() get business rules for DIW dataset ', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.getBusinessRulesForDIWDataset()).toContain('/schema/active-brs');
  }));

  it('checkPermissionForSchemaDetails() check permission if user is allowed to view schema details page', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.checkPermissionForSchemaDetails()).toContain('/schema/metadata/access');
  }));

  it('should getDropvalsUrl', () => {
    expect(service.getDropvalsUrl('1005', '1', 'en')).toContain('/dropval/list/1005/1/en');
  });

  it('should getSaveDropvalsUrl', () => {
    expect(service.getSaveDropvalsUrl('1005', '1', 'en')).toContain('/dropval/save/1005/1/en');
  });
  it('should getDeleteDropvalsUrl', () => {
    expect(service.getDeleteDropvalsUrl()).toContain('/rule/dropval/delete-drop-values');
  });
  it('createUpdateBr(), should saveudr rule', async(() => {
    const serObj = new EndpointsRuleService();
    expect(serObj.createUpdateBr()).toContain('schema/metadata/create-update-br');
  }));
  it('should getBusinessRulesCountUrl', () => {
    expect(service.getBusinessRulesCountUrl('1005')).toContain('/schema/metadata/get-countofBrs/1005');
  });
});
