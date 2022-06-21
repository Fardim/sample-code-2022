import { async, inject, TestBed } from '@angular/core/testing';
import { CommonGridRequestObject, TaskListSummaryRequestParams } from '@models/task-list/taskListDetails';

import { EndpointsClassicService } from './endpoints-classic.service';

describe('EndpointsClassicService', () => {

  beforeEach(() => {
    const endPointProvider = jasmine.createSpyObj('EndpointsClassicService', ['onLoadSchema']);
    TestBed.configureTestingModule({
      providers: [
        { provide: EndpointsClassicService, useValue: endPointProvider }
      ]
    });
  });

  it('should be created', inject([EndpointsClassicService], (service: EndpointsClassicService) => {
    expect(service).toBeTruthy();
  }));

  it('onLoadSchema(),should load schema', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.onLoadSchema()).toContain('restSchemaLogs');
  }));

  it('getCreateSchemaGroupUrl(), getCreateSchemaGroupUrl', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getCreateSchemaGroupUrl()).toContain('/schema/create-schemagroup');
  }));

  it('getSchemaGroupsUrl(), getSchemaGroupsUrl', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getSchemaGroupsUrl()).toContain('/schema/get-all-groups');
  }));

  it('getSchemaListByGroupIdUrl(), getSchemaListByGroupIdUrl', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getSchemaListByGroupIdUrl()).toContain('/schema/schema-list');
  }));

  it('schemaVarinatDetails(), schemaVarinatDetails', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.schemaVarinatDetails()).toContain('/schema/schemaVariantList');
  }));

  it('deleteSchemaGroupUrl(), schemaVarinatDetails', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.deleteSchemaGroupUrl('5443564')).toContain('/schema/delete-schema-group/5443564');
  }));

  it('getSchemaDataTableColumnInfoUrl(), getSchemaDataTableColumnInfoUrl', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getSchemaDataTableColumnInfoUrl()).toContain('/getListPageLayout');
  }));

  it('getSchemaDetailsBySchemaId(), getSchemaDetailsBySchemaId', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getSchemaDetailsBySchemaId('7656776')).toContain('/schema/schemaCount/7656776');
  }));

  it('getShowMoreSchemaTableDataUrl(), getShowMoreSchemaTableDataUrl', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getShowMoreSchemaTableDataUrl()).toContain('/showMoreSchemaTableData');
  }));

  it('downloadExecutionDetailsUrl(),should download execution details', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.downloadExecutionDetailsUrl('5678987', 'success')).toContain('schema/actions/download/data-quality/5678987/success');
  }));

  it('getScheduleSchemaUrl(),should schedule schema details', async(() => {
    const serObj = new EndpointsClassicService();
    const isRunWithCheckedData = true;
    expect(serObj.getScheduleSchemaUrl(isRunWithCheckedData)).toContain('schema/schedule-schema');
  }));

  it('getSchemaGroupDetailsByGrpIdUrl(),should return schema group details by schema groupid', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.getSchemaGroupDetailsByGrpIdUrl('10097')).toContain('schema/get-group-details/10097');
  }));

  it('getSchemaGroupCountUrl(),should return schema group count', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.getSchemaGroupCountUrl(7501564)).toContain('schema/get-schema-group-count/7501564');
  }));

  it('getAllSchemabymoduleids(),should return module details', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.getAllSchemabymoduleids()).toContain('schema/get-all-schemabymoduleids');
  }));

  it('getAllObjecttypeUrl(),should return all object details', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.getAllObjecttypeUrl()).toContain('/schema/get-all-objecttype');
  }));

  it('groupDetailswithAssignedschemaUrl(),should return assigned schema of that particular schema group', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.groupDetailswithAssignedschemaUrl('86576534')).toContain('schema/group-detailswith-assignedschema/86576534');
  }));

  it('getSchemaDetailsBySchemaIdUrl(),should return all schema detials by schemaId', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.getSchemaDetailsBySchemaIdUrl('355555320681 ')).toContain('schema/schema-details/355555320681');
  }));

  it('getSchemaTableDetailsUrl(),should return table details', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.getSchemaTableDetailsUrl()).toContain('schema/schema-details');
  }));

  it('getUpdateSchemaTableViewUrl(),should return count of schema table view', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.getUpdateSchemaTableViewUrl()).toContain('schema/update-schema-table-view');
  }));

  it('getOverviewChartDataUrl(),should return category chart data details', async(() => {
    const serObj = new EndpointsClassicService();
    const schemaId = '7674654';
    const variantId = '87676556';
    const runId = '0';
    expect(serObj.getOverviewChartDataUrl(schemaId, variantId, runId)).toContain(`/schema/overview-chart-data/${schemaId}/${variantId}/${runId}`);
  }));

  it('getCategoryInfoUrl(),should return category info', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.getCategoryInfoUrl()).toContain('schema/category-list');
  }));

  it('getSchemaStatusUrl(), should return the schema status url', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.getSchemaStatusUrl()).toContain('schema/schema-status');
  }));

  it('categoryChartData(),should return category chart data', async(() => {
    const serObj = new EndpointsClassicService();
    const status = 'success';
    const schemaId = '7674654';
    const variantId = '87676556';
    const categoryId = '0';
    expect(serObj.categoryChartData(schemaId, variantId, categoryId, status)).toContain(`schema/category-chart-data/${schemaId}/${variantId}/${categoryId}/${status}`);
  }));

  it('scheduleSchemaCount(),should return schema count', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.scheduleSchemaCount('7564564')).toContain('schema/record-count/7564564');
  }));

  it('getMetadataFields(),should return metadeta fields of that objectId', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.getMetadataFields('1005')).toContain('/schema/metadata-fileds/1005');
  }));

  it('getAllUnselectedFields(), should return the unselected url', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.getAllSelectedFields()).toContain('/schema/get-selected-fields-view');
  }));

  it('getSchemaVariantsUrl(),should return schema variant details', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.getSchemaVariantsUrl('7564564')).toContain('schema/variants/7564564');
  }));

  it('getSchemaBrInfoList(), should return the schema br information list url', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.getSchemaBrInfoList('28364872686186')).toContain('schema/schema-br-infolist/28364872686186');
  }));

  it('doCorrectionUrl(), should return the schema do correction url', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.doCorrectionUrl('28364872686186')).toContain('schema/do-correction/28364872686186');
  }));

  it('getCorrectedRecords(),should return corrected records', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.getCorrectedRecords('7564564')).toContain('schema/get-corrected-records/7564564');
  }));

  it('getLastBrErrorRecords(),should return error records', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.getLastBrErrorRecords('7564564')).toContain('schema/get-mdoerror-records/7564564');
  }));

  it('getSchemaExecutionLogUrl(), should return the schema execution logs  url', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.getSchemaExecutionLogUrl('28364872686186')).toContain('schema/get-execution-logs/28364872686186');
  }));

  it('approveCorrectedRecords(), should return all approved correct records', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.approveCorrectedRecords('28364872686186')).toContain('schema/approve-corrected-records/28364872686186');
  }));

  it('uploadFileDataUrl(), should return the upload file data   url', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.uploadFileDataUrl()).toContain('schema/upload-file');
  }));

  it('uploadDataUrl(), should return the upload  data   url', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.uploadDataUrl('1005', '1234')).toContain('schema/upload-data/1005/1234');
  }));

  it('getBusinessRulesInfoByModuleIdUrl(), should return the br info by moduleId', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.getBusinessRulesInfoByModuleIdUrl()).toContain('schema/get-business-rules');
  }));

  it('getBusinessRulesInfoBySchemaIdUrl(), should return the br info by schemaId', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.getBusinessRulesInfoBySchemaIdUrl('1234')).toContain('schema/get-business-rules/1234');
  }));

  it('getCategoriesInfo(), should return the category list', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.getCategoriesInfo()).toContain('schema/category-list');
  }));

  it('getFillDataInfo(),should return fill data info', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.getFillDataInfo('7564564')).toContain('schema/metadata-fileds/7564564');
  }));

  it('createBr(),should create business rule', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.createBr()).toContain('schema/create-update-br');
  }));

  it('createSchema(),should create schema', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.createSchema()).toContain('schema/create-update-schema');
  }));

  it('deleteBr(),should delete businessrule', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.deleteBr(75687687)).toContain('schema/delete-business-rule/' + 75687687);
  }));

  it('it should call getFiltersUrl() and return formatted URL', () => {
    const serviceobj = new EndpointsClassicService();
    expect(serviceobj.getFiltersUrl()).toContain(`tasklist/filter`);
  });

  it('it should call getFilterDynamicListsUrl() and return formatted URL', () => {
    const serviceobj = new EndpointsClassicService();
    expect(serviceobj.getFilterDynamicListsUrl()).toContain(`tasklist/filterList`);
  });

  it('getDynamicColumnListsUrl(), should return the listmetadata url', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.getDynamicColumnListsUrl()).toContain('/listPage/listmetadata');
  }));

  it('getDynamicFiltermetaListsUrl(), should return the FilterMeta field url', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.getDynamicFiltermetaListsUrl()).toContain('/listPage/getFilterMetaField');
  }));

  it('getTasksUrl(), should return the task list data', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.getTasksUrl()).toContain('/tasklist/taskListData');
  }));

  it('returnCollaboratorsPermisisonUrl(), should return the collaborator permission', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.returnCollaboratorsPermisisonUrl('6543789')).toContain('/admin/permission/collaborators/permission/6543789');
  }));

  it('saveUpdateReportCollaborator(),should save or update report collaborator details', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.saveUpdateReportCollaborator()).toContain('admin/permission/collaborators/permission/save-update');
  }));

  it('deleteCollaboratorUrl(), should return the delete url', async(() => {
    const serObj = new EndpointsClassicService();
    const permisionId = '243787235';
    expect(serObj.deleteCollaboratorUrl(permisionId)).toContain(`admin/permission/collaborator/delete/${permisionId}`, `admin/permission/collaborator/delete/${permisionId}  sould be return!`);
  }));

  it('getBrConditionalOperatorUrl(),should return condition operator details', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.getBrConditionalOperatorUrl()).toContain('schema/br/condition-operator');
  }));

  it('dropDownValuesUrl(),should return dropdown value for fieldId', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.dropDownValuesUrl('NDC_TYPE')).toContain('schema/drop-values/NDC_TYPE');
  }));

  it('saveUpdateUdrBlockUrl(),should save or update udr details', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.saveUpdateUdrBlockUrl()).toContain('admin/schema/br/udr');
  }));

  it('conditionListsUrl(),should return condition list', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.conditionListsUrl('355555320681')).toContain('schema/br/udr/condition-list/355555320681');
  }));

  it('saveUpdateUDRUrl(), should saveudr rule', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.saveUpdateUDRUrl()).toContain('admin/schema/udr/save-update');
  }));

  it('getBusinessRuleInfoUrl(),should return all business rule details', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.getBusinessRuleInfoUrl('355555320681')).toContain('schema/get-business-rule-info/355555320681');
  }));

  it('getUdrBusinessRuleInfoUrl(),should return udr details', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.getUdrBusinessRuleInfoUrl('355555320681')).toContain('schema/br/udr/355555320681');
  }));

  it('it should call getTaskListViewsUrl() and return formatted URL', () => {
    const serviceobj = new EndpointsClassicService();
    const userName = 'DemoApp';
    expect(serviceobj.getTaskListViewsUrl(userName)).toContain(`tasklist/getTaskListViews?userCreated=${userName}`)
  });

  it('it should call getDeleteTaskListViewUrl() and return formatted URL', () => {
    const serviceobj = new EndpointsClassicService();
    const viewId = '1234';
    expect(serviceobj.getDeleteTaskListViewUrl(viewId)).toContain(`tasklist/deleteTaskListView?viewId=${viewId}`)
  });

  it('getSaveTaskListViewUrl(), should save task list view', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getSaveTaskListViewUrl()).toContain('tasklist/taskListUserView');
  }));

  it('it should call getSaveTaskListURL() and return formatted URL', () => {
    const serviceobj = new EndpointsClassicService();
    expect(serviceobj.getSaveTaskListURL()).toContain(`tasklist/taskListUserView`);
  });

  it('deleteConditionBlock(), should return the delete condition  url', async(() => {
    const serObj = new EndpointsClassicService();
    const blockId = '243787235';
    expect(serObj.deleteConditionBlock(blockId)).toContain(`schema/br/udr/delete-conditionblock/${blockId}`);
  }));

  it('getSchemaThresholdStatics(),should return schema thresholdstatics value', async(() => {
    const serObj = new EndpointsClassicService();
    const schemaId = '867576576';
    expect(serObj.getSchemaThresholdStatics(schemaId)).toContain(`schema/statics/${schemaId}`);

    const variantId = '0';
    expect(serObj.getSchemaThresholdStatics(schemaId, variantId)).toContain(`schema/statics/${schemaId}/${variantId}`);
  }));

  it('uploadCorrectionDataUrl(),should upload correction data', async(() => {
    const serObj = new EndpointsClassicService();
    const objectType = 'Material';
    const schemaId = '7674654';
    const runId = '87676556';
    const plantCode = '0';
    const fileSno = '7765';
    expect(serObj.uploadCorrectionDataUrl(objectType, schemaId, runId, plantCode, fileSno)).toContain(`es/uploadCorrection/${objectType}/${schemaId}/${runId}/${plantCode}/${fileSno}`);
  }));

  it('getCollaboratorDetailsUrl(), should return the person details  url', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.getCollaboratorDetailsUrl('28364872686186')).toContain('schema/get-all-schemacollaborator-details/28364872686186');
  }));

  it('createUpdatePersonDetailsUrl(), should  create and update person details url', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.createUpdateUserDetailsUrl()).toContain('schema/create-update-schemacollaborator');
  }));

  it('getAllUserDetailsUrl(), should return the all person details url', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.getAllUserDetailsUrl()).toContain('admin/permission/collaborators');
  }));

  it('deleteSchemaCollaboratorDetailsUrl(),should delte the exexting collaborator derail', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.deleteSchemaCollaboratorDetailsUrl()).toContain('admin/users/collaborator-records/delete');
  }));

  it('deleteSchema(),should delte the schema', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.deleteSchema('355535857155320681 ')).toContain('schema/delete/355535857155320681');
  }));

  it('should call getTaskListCountURL(), should return task list count URL', () => {
    const serObj = new EndpointsClassicService();
    expect(serObj.getTaskListCountURL()).toContain('tasklist/getTaskListCount');
  });

  it('should call getTaskSummaryMetaDataURL()', () => {
    const serviceobj = new EndpointsClassicService();
    const requestObject: TaskListSummaryRequestParams = {
      plantCode: '123',
      userRole: '12456890',
      userId: 'DemoApp',
      lang: 'en',
      taskId: '1234567890',
      wfId: '0987654321',
      objectnumber: '0101010101',
      objecttype: '0101010101',
      eventCode: '0101010101',
    }
    expect(serviceobj.getTaskSummaryMetaDataURL(requestObject)).toContain(`/layout/getLayoutMetaData/${requestObject.objectnumber}/${requestObject.objecttype}/${5}?plantCode=${requestObject.plantCode}&userRole=${requestObject.userRole}&taskId=${requestObject.taskId}&userId=${requestObject.userId}&wfId=${requestObject.taskId}&lang=${requestObject.lang}`);
  })

  it('should call getTaskSummaryLayoutDataURL()', () => {
    const serviceobj = new EndpointsClassicService();
    const wfid = 'ERSA2528';
    const eventCode = '1005'
    const lang = 'en'

    expect(serviceobj.getTaskSummaryLayoutDataURL(wfid, eventCode, lang)).toContain(`layoutData/getLayoutData/${wfid}/${eventCode}?lang=${lang}`);
  });

  it('should call getAuditTrailLogsURL()', () => {
    const serviceobj = new EndpointsClassicService();
    expect(serviceobj.getAuditTrailLogsURL()).toContain(`changeAuditLog/getChangeAuditLog`)
  });

  it('should call getGridMetaDataURL()', () => {
    const serviceobj = new EndpointsClassicService();
    const gridRequestParams: CommonGridRequestObject = {
      objecttype: '123abcd',
      tabCode: '123',
      eventCode: '123',
      plantCode: 'MDO1003',
      lang: 'en',
      taskId: '000101001010100101',
      wfId: '221322101146259092',
      userId: 'DemoApp',
      userRole: '663065348460318692',
      tabId: '840574035205469800',
      fetchSize: 10,
      fetchCount: 0,
      gridId: ''
    }
    const urlParams = `plantCode=${gridRequestParams.plantCode}&lang=${gridRequestParams.lang}&taskId=${gridRequestParams.taskId}&wfId=${gridRequestParams.wfId}&userId=${gridRequestParams.userId}&userRole=${gridRequestParams.userRole}&tabId=${gridRequestParams.tabId}`
    expect(serviceobj.getGridMetaDataURL(gridRequestParams)).toContain(`grid/getGridMetadata/${gridRequestParams.objecttype}/${gridRequestParams.tabCode}/${gridRequestParams.eventCode}?${urlParams}`)
  });

  it('should call getGridDataUrl()', () => {
    const serviceobj = new EndpointsClassicService();
    const gridRequestParams: CommonGridRequestObject = {
      objecttype: '123abcd',
      tabCode: '123',
      eventCode: '123',
      plantCode: 'MDO1003',
      lang: 'en',
      taskId: '000101001010100101',
      wfId: '221322101146259092',
      userId: 'DemoApp',
      userRole: '663065348460318692',
      tabId: '840574035205469800',
      fetchSize: 10,
      fetchCount: 0,
      gridId: ''
    }
    const urlParams = `plantCode=${gridRequestParams.plantCode}&lang=${gridRequestParams.lang}&taskId=${gridRequestParams.taskId}&wfId=${gridRequestParams.wfId}&userRole=${gridRequestParams.userRole}&userId=${gridRequestParams.userId}&fetchCount=${gridRequestParams.fetchCount}&fetchSize=${gridRequestParams.fetchSize}`
    expect(serviceobj.getGridDataUrl(gridRequestParams)).toContain(`gridData/getGridData/${gridRequestParams.objecttype}/${gridRequestParams.objectNumber}/${gridRequestParams.gridId}/${gridRequestParams.eventCode}?${urlParams}`)
  });

  it('should call getChangeLogDetails()', () => {
    const serviceobj = new EndpointsClassicService();
    expect(serviceobj.getChangeLogDetails()).toContain(`changeAuditLog/getChangeLogDetails`);
  });

  it('should call getCommonLayoutDataUrl()', () => {
    const serviceobj = new EndpointsClassicService();
    const taskListSummaryRequestParams: TaskListSummaryRequestParams = {
      plantCode: 'MDO1003',
      userRole: '663065348460318692',
      taskId: '000101001010100101',
      userId: 'DemoApp',
      wfId: '221322101146259092',
      lang: 'en',
      objectnumber: '1005',
      objecttype: '123abcd',
      eventCode: '123',
    }
    const urlParams = `plantCode=${taskListSummaryRequestParams.plantCode}&lang=${taskListSummaryRequestParams.lang}&taskId=${taskListSummaryRequestParams.taskId}&wfId=${taskListSummaryRequestParams.wfId}&userRole=${taskListSummaryRequestParams.userRole}&userId=${taskListSummaryRequestParams.userId}`
    expect(serviceobj.getCommonLayoutDataUrl(taskListSummaryRequestParams)).toContain(`/layout/getLayoutdata/${taskListSummaryRequestParams.objectnumber}/${taskListSummaryRequestParams.objecttype}/5?${urlParams}`)
  });

  it('should call getMetadataByWfid()', () => {
    const serviceobj = new EndpointsClassicService();
    const wfid = '221322101146259092';
    expect(serviceobj.getMetadataByWfid(wfid)).toContain(`layout/getMetadataByWfid/${wfid}`);
  });

  it('it should call getLoadRecipientsListUrl() and return formatted URL', () => {
    const serviceobj = new EndpointsClassicService();
    expect(serviceobj.getLoadRecipientsListUrl()).toContain(`restWorkflow/loadRecipient`);
  });

  it('it should call getWfFieldsListUrl() and return formatted URL', () => {
    const serviceobj = new EndpointsClassicService();
    expect(serviceobj.getWfFieldsListUrl()).toContain(`restWorkflow/loadWorkfLowField`);
  });

  it('it should call getLoadApisUrl() and return formatted URL', () => {
    const serviceobj = new EndpointsClassicService();
    expect(serviceobj.getLoadApisUrl()).toContain(`restWorkflow/loadAPI`);
  });

  it('it should call getSaveWfDefinitionUrl() and return formatted URL', () => {
    const serviceobj = new EndpointsClassicService();
    expect(serviceobj.getSaveWfDefinitionUrl()).toContain(`restWorkflow/saveWorkFlowStepViaXml`);
  });

  it('it should call getFieldOptionsUrl() and return formatted URL', () => {
    const serviceobj = new EndpointsClassicService();
    expect(serviceobj.getFieldOptionsUrl()).toContain(`restWorkflow/admin_dropdown_list_dropdown_data`);
  });

  it('it should call getloadWfDefinitionUrl() and return formatted URL', () => {
    const serviceobj = new EndpointsClassicService();
    expect(serviceobj.getloadWfDefinitionUrl()).toContain(`restWorkflow/loadWorkFlowPathStep`);
  });

  it('saveUpdateVariantUrl(), hould  create and update Variant details url', () => {
    const serviceobj = new EndpointsClassicService();
    expect(serviceobj.saveUpdateVariantUrl()).toContain(`schema/data-variants`);
  });

  it('getVariantdetailsByvariantIdUrl(),should return all variant detials by variantId', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.getVariantdetailsByvariantIdUrl('355555320681 ')).toContain('schema/variant/355555320681');
  }));

  it('deleteVariantUrl(),should delete variant details', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.deleteVariantUrl('35555320681 ')).toContain('schema/variant/delete/35555320681');
  }));

  it('saveNewSchemaUrl(), save new schema details', async(() => {
    const serObj =new EndpointsClassicService();
    const objectId = '1005';
    const runNow = true;
    const variantId = '0';
    const fileSno = '7635237862234';
    expect(serObj.saveNewSchemaUrl(objectId, runNow, variantId, fileSno)).toContain(`schemamodule/create-schema?objectId=${objectId}&runNow=${runNow}&variantId=${variantId}&fileSno=${fileSno}`);
  }));

  it('getSchemaInfoByModuleIdUrl(),should return getSchemaInfoByModuleIdUrl url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getSchemaInfoByModuleIdUrl('1005')).toContain('schema/schema-info/1005');
  }));

  it('getSchemaWithVariantsUrl(),should return getSchemaWithVariantsUrl url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getSchemaWithVariantsUrl()).toContain('/schema/list-variants');
  }));

  it('downloadAttachment(),should return downloadAttachment url', async(() => {
    const serObj =new EndpointsClassicService();
    const sno = '7635237862234';
    expect(serObj.downloadAttachment(sno)).toContain(`/attachment/downloadAttachments?sno=${sno}`);
  }));

  it('updateBrMap(),should return updateBrMap url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.updateBrMap()).toContain(`schema/br/update-br-map`);
  }));

  it('getCategoriesUrl(),should return getCategoriesUrl url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getCategoriesUrl()).toContain(`/getCategories`);
  }));

  it('getDependencyUrl(),should return getDependencyUrl url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getDependencyUrl()).toContain(`/getDependency`);
  }));

  it('addCustomCategoryUrl(),should return addCustomCategoryUrl url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.addCustomCategoryUrl()).toContain(`/addCategory`);
  }));

  it('saveBusinessRuleUrl(),should return saveBusinessRuleUrl url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.saveBusinessRuleUrl()).toContain(`/saveBusinessRule`);
  }));

  it('getBusinessRuleApiListUrl(),should return getBusinessRuleApiListUrl url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getBusinessRuleApiListUrl()).toContain(`/getAPIList`);
  }));

  it('getDuplicacySettingListUrl(),should return getDuplicacySettingListUrl url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getDuplicacySettingListUrl()).toContain(`/getDuplicacySettingList`);
  }));

  it('getMetadataFieldsUrl(),should return getMetadataFieldsUrl url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getMetadataFieldsUrl()).toContain(`/getMetadataFields`);
  }));

  it('getVariantDetailsForScheduleSchemaUrl(),should return getVariantDetailsForScheduleSchemaUrl url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getVariantDetailsForScheduleSchemaUrl('1005')).toContain(`/get-variants-list/1005`);
  }));

  it('getVariantControlByVariantIdUrl(),should return getVariantControlByVariantIdUrl url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getVariantControlByVariantIdUrl('765434678764')).toContain(`/get-variant-control/765434678764`);
  }));

  it('getBusinessRulesBySchemaId(),should return getBusinessRulesBySchemaId url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getBusinessRulesBySchemaId('765434678764', '1005')).toContain(`/getBrDetailsBySchemaId/765434678764/1005`);
  }));

  it('getAssignBrToSchemaUrl(),should return getAssignBrToSchemaUrl url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getAssignBrToSchemaUrl()).toContain(`/assignBrToSchema`);
  }));

  it('getWorkflowDataURL(),should return getWorkflowDataURL url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getWorkflowDataURL()).toContain(`/schema/get-wf-module-data`);
  }));

  it('getWorkFlowFieldsUrl(),should return getWorkFlowFieldsUrl url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getWorkFlowFieldsUrl()).toContain('schema/get-wffields');
  }));

  it('getWorkFlowPathUrl(),should return getWorkFlowPathUrl url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getWorkFlowPathUrl()).toContain('schema/get-wfpath');
  }));

  it('getNotificationsUrl(),should return getNotificationsUrl url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getNotificationsUrl('uid','from','to')).toContain('/notification/getNotification?senderUid=uid&from=from&to=to');
  }));

  it('getUpdateNotificationUrl(),should return getUpdateNotificationUrl url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getUpdateNotificationUrl()).toContain('notification/saveNotification');
  }));

  it('getDeleteNotificationUrl(), Endpoint to delete notification',async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getDeleteNotificationUrl()).toContain(`notification/deleteNotification`);
  }));

  it('getJobQueueUrl(), return count of notification',async(() => {
    const serObj =new EndpointsClassicService();
    const userName = 'harshit';
    const plantCode = '0'
    expect(serObj.getJobQueueUrl(userName, plantCode, null)).toContain(`schema/jobs/get-all-jobs?userId=${userName}&plantCode=${plantCode}`);
  }));

  it('getNotificationsCount(), return count of notification',async(() => {
    const serObj =new EndpointsClassicService();
    const senderUid = '654567879';
    expect(serObj.getNotificationsCount(senderUid)).toContain(`notification/getNotificationCount?senderUid=${senderUid}`);
  }));

  it('createUpdateScheduleUrl(), endpoint for create/update schedule of schema',async(() => {
    const serObj =new EndpointsClassicService();
    const schemaId = '654567879';
    expect(serObj.createUpdateScheduleUrl(schemaId)).toContain(`schema/createupdate-schema-scheduler?schemaId=${schemaId}`);
  }));

  it('getScheduleUrl(), getScheduleUrl', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getScheduleUrl('6433365')).toContain('/schema/get-schema-scheduler/6433365');
  }));

  it('saveUpdateDuplicateRule(),should return saveUpdateDuplicateRule url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.saveUpdateDuplicateRule()).toContain('duplicate/saveDuppsett');
  }));

  it('copyDuplicate(),should return co[y duplicate url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.copyDuplicate()).toContain('duplicate/copyDuplicate');
  }));


  it('saveUpdateDataScopeUrl(),should return saveUpdateDataScopeUrl url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.saveUpdateDataScopeUrl()).toContain('schema/variant/create-update-single');
  }));

  it('getAllDataScopeUrl(),should return getAllDataScopeUrl url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getAllDataScopeUrl('schema1','type1')).toContain('schema/variants/schema1/type1');
  }));

  it('getClassificationNounMod(), Get all noun and modifiers uri', async(() => {​​​​​​​​​​​​​​​​
    const serObj = new EndpointsClassicService();
    expect(serObj.getClassificationNounMod('576544667', '645425', '975453564')).toContain('/schema/getnounsAndModfiers/576544667/645425');
  }​​​​​​​​​​​​​​​​));

  it('getClassificationDataTableUrl(), getClassificationDataTableUrl', async(() => {​​​​​​​​​​​​​​​​
    const serObj = new EndpointsClassicService();
    expect(serObj.getClassificationDataTableUrl('576544667', '645425', '975453564')).toContain('schema/getClassificationListData/576544667/645425');
  }​​​​​​​​​​​​​​​​));

  it('getAllDataScopesUri(), getAllDataScopesUri', async(() => {​​​​​​​​​​​​​​​​
    const serObj = new EndpointsClassicService();
    expect(serObj.getAllDataScopesUri('schemaId', 'type' )).toContain('/schema/variants/schemaId/type');
  }​​​​​​​​​​​​​​​​));

  it('generateCrossEntryUri(),should return generateCrossEntryUri url', async(() => {​​​​​​​​​​​​​​​​
    const serObj = new EndpointsClassicService();
    expect(serObj.generateCrossEntryUri('schemaId', 'objectType', 'objectNumber' )).toContain('schema/generateCrossmodule/schemaId/objectType/objectNumber');
  }​​​​​​​​​​​​​​​​));

  it('createUpdateCheckDataUrl(), endpoint for create/update check data for schema', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.createUpdateCheckDataUrl()).toContain('/schema/checkdata/save-update');
  }));

  it('duplicacyGroupsListUrl(), duplicacyGroupsListUrl', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.duplicacyGroupsListUrl()).toContain('/duplicate/getgroupId');
  }));

  it('catalogCheckRecordsUrl(), catalogCheckRecordsUrl', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.catalogCheckRecordsUrl()).toContain('/duplicate/getContent');
  }));

  it('getCheckDataUrl(), should return endpoint for getting check data for schema', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getCheckDataUrl('8765434678')).toContain('schema/checkdata/get-all-br-collaborator-details/8765434678');
  }));

  it('getAllBusinessRulesUrl(), should return all business rule exist for the particular plantcode', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getAllBusinessRulesUrl()).toContain('schema/get-all-business-rules/');
  }));

  it('createCheckDataBusinessRuleUrl(), creating business rules at the time of check data..', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.createCheckDataBusinessRuleUrl()).toContain('schema/create-br');
  }));

  it('getAvailableNounsUri(),should return getAvailableNounsUri url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getAvailableNounsUri()).toContain('schema/noun');
  }));

  it('getAvailableModifierUri(),should return getAvailableModifierUri url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getAvailableModifierUri()).toContain('schema/modifier');
  }));

  it('getAvailableAttributeUri(),should return getAvailableAttributeUri url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getAvailableAttributeUri()).toContain('schema/attribute');
  }));

  it('getSuggestedNounUri(),should return suggested noun ..', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getSuggestedNounUri('654578876','45363')).toContain('schema/noun/654578876/45363');
  }));

  it('getSuggestedModifierUri(),should return suggested modifier ..', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getSuggestedModifierUri('654578876','45363')).toContain('schema/modifier/654578876/45363');
  }));

  it('getSuggestedAttributeUri(),should return suggested attribute ..', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getSuggestedAttributeUri('654578876','45363')).toContain('schema/attribute/654578876/45363');
  }));

  it('doClassificationCorrectionUri(),should return doClassificationCorrectionUri url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.doClassificationCorrectionUri()).toContain('schema/do-mro-correction');
  }));

  it('getCreateNounModUrl(),should return create noun url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getCreateNounModUrl()).toContain('create-noun');
  }));

  it('getCreateAttributeUrl(), should return create-attribute url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getCreateAttributeUrl('17021')).toContain('add-attributes/17021');
  }));

  it('getSaveAttributesMappingUrl(),should return save-mappings url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getSaveAttributesMappingUrl()).toContain('save-mappings');
  }));

  it('getFetchAttributesMappingUrl(),should return getFetchAttributesMapping url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getFetchAttributesMappingUrl()).toContain('get-mappings');
  }));

  it('approveClassificationUri(),should return approveClassification url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.approveClassificationUri()).toContain('mro/approve');
  }));

  it('rejectClassificationUri(),should return rejectClassification url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.rejectClassificationUri()).toContain('mro/reset');
  }));

  it('masterRecordChangeUrl(),should return masterRecordChangeUrl url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.masterRecordChangeUrl()).toContain('duplicate/updatemasterRecord');
  }));

  it('markForDeletionUrl(),should return markForDeletionUrl url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.markForDeletionUrl('diw_15','mod1','schema','run')).toContain('/schema/actions/update-delFlag/diw_15/mod1/schema/run');
  }));

  it('doDuplicacyCorrectionUrl(),should return doDuplicacyCorrectionUrl url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.doDuplicacyCorrectionUrl('schema1','run1')).toContain('duplicate/do-correction/schema1/run1');
  }));

  it('approveDuplicacyCorrectionUrl(),should return approveDuplicacyCorrectionUrl url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.approveDuplicacyCorrectionUrl('schema','run','user')).toContain('approveDuplicateRecords/schema/run?userName=user');
  }));

  it('rejectDuplicacyCorrectionUrl(),should return rejectDuplicacyCorrectionUrl url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.rejectDuplicacyCorrectionUrl('schema','run','user')).toContain('rejectDuplicateRecords/schema/run?userName=user');
  }));

  it('getlayoutsUrl(),should return getlayoutsUrl url', async(() => {​​​​​​​​​​​​​​​​
    const serObj = new EndpointsClassicService();
    expect(serObj.getlayoutsUrl()).toContain('/report/layouts');
  }​​​​​​​​​​​​​​​​));

  it('resetCorrectionRecords(), return Uri for reset schema execution correction data ',async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.resetCorrectionRecords('654567879')).toContain('schema/reset-corrected-records/654567879');
  }));

  it('downloadMroExceutionUri(),should return downloadMroExceutionUri url', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.downloadMroExceutionUri('schema')).toContain('schema/actions/download/mro');
  }));

  it('generateMroClassificationDescriptionUri(),should return generateMroClassificationDescriptionUri url', async(() => {
    const serObj = new EndpointsClassicService();
    expect(serObj.generateMroClassificationDescriptionUri()).toContain('schema/actions/mro/generate-description');
  }));

  it('getSchemaExecutedStatsTrendUri(),should return getExecutionOverviewChartDataUrl url', async(() => {​​​​​​​​​
    const serObj = new EndpointsClassicService();
    expect(serObj.getSchemaExecutedStatsTrendUri('schema1', '0')).toContain('schema/execution/trends/schema1/0');
  }​​​​​​​​​​​​​​​​));

  it('getlayoutsUrl(),should return getlayoutsUrl url', async(() => {​​​​​​​​​​​​​​​​
    const serObj = new EndpointsClassicService();
    expect(serObj.getlayoutsUrl()).toContain('/report/layouts');
  }​​​​​​​​​​​​​​​​));

   it('generateCrossEntryUri(),should return generateCrossEntryUri url', async(() => {​​​​​​​​​​​​​​​​
    const serObj = new EndpointsClassicService();
    expect(serObj.generateCrossEntryUri('schemaId', 'objectType', 'objectNumber' )).toContain('schema/generateCrossmodule/schemaId/objectType/objectNumber');
  }​​​​​​​​​​​​​​​​));

  it('resetCorrectionRecords(), return Uri for reset schema execution correction data ',async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.resetCorrectionRecords('654567879')).toContain('schema/reset-corrected-records/654567879');
  }));

  it('getNotificationsCount(), return count of notification',async(() => {
    const serObj =new EndpointsClassicService();
    const senderUid = '654567879';
    expect(serObj.getNotificationsCount(senderUid)).toContain(`notification/getNotificationCount?senderUid=${senderUid}`);
  }));

  it('getSaveTaskListViewUrl(), should save task list view', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getSaveTaskListViewUrl()).toContain('tasklist/taskListUserView');
  }));

  it('saveUpdateUDRUrl(), should saveudr rule', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.saveUpdateUDRUrl()).toContain('admin/schema/udr/save-update');
  }));

  it('getCreateUpdateSchemaActionUrl(), getCreateUpdateSchemaActionUrl', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getCreateUpdateSchemaActionUrl()).toContain('/schema/actions/create-update');
  }));

  it('getCreateUpdateSchemaActionsListUrl(), getCreateUpdateSchemaActionsListUrl', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getCreateUpdateSchemaActionsListUrl()).toContain('/schema/actions/bulkcreate-update');
  }));

  it('getFindActionsBySchemaUrl(), getFindActionsBySchemaUrl', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getFindActionsBySchemaUrl('schema1')).toContain('/schema/actions/schema1');
  }));

  it('getFindActionsBySchemaAndRoleUrl(), getFindActionsBySchemaAndRoleUrl', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getFindActionsBySchemaAndRoleUrl('schema1', 'admin')).toContain('/schema/actions/schema1/admin');
  }));

  it('getDeleteSchemaActionUrl(), getDeleteSchemaActionUrl', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getDeleteSchemaActionUrl('schema1', '1701')).toContain('schema/actions/deleteCustomAction/schema1/1701');
  }));

  it('getCrossMappingUrl(), getCrossMappingUrl', async(() => {
    const serObj =new EndpointsClassicService();
    expect(serObj.getCrossMappingUrl('0')).toContain('/schema/actions/getCrossMapping?plantCode=0');
  }));

  it('getSchemaExecutionProgressDetailUrl(), should return URL for getting execution progress', async() => {
    const serviceObj = new EndpointsClassicService();
    const schemaId = '25634';
    const URL = serviceObj.schemaExecutionProgressDetailUrl(schemaId);
    expect(URL).toContain(`schema/getSchemaProgeress/${schemaId}`);
  })

  it('downloadDuplicateExecutionDetailsUrl(), should downloadDuplicateExecutionDetailsUrl', async() => {
    const serviceObj = new EndpointsClassicService();
    const URL = serviceObj.downloadDuplicateExecutionDetailsUrl('schema1', 'error');
    expect(URL).toContain(`duplicate/download/schema1/error`);
  });

  it('getAllTemplates(), should contain getAllTemplatesUrl', async() => {
    const serviceObj = new EndpointsClassicService();
    const URL = serviceObj.getAllTemplates();
    expect(URL).toContain(`report/share/email/template`);
  });

  it('getTemplateById(), should get Template By id', async() => {
    const serviceObj = new EndpointsClassicService();
    const url = serviceObj.getTemplateById('12345');
    expect(url).toContain(`report/share/email/12345/template`);
  });

  it('getApisRulesUrl(), should get the url for api rules ', async() => {
    const serviceObj = new EndpointsClassicService();
    const url = serviceObj.getApisRulesUrl();
    expect(url).toContain(`schema/get-custom-apis`);
  });

  it('getConflictedRecordDetailsUrl()', async() => {
    const serviceObj = new EndpointsClassicService();
    const url = serviceObj.getConflictedRecordDetailsUrl();
    expect(url).toContain(`/conflict/renderConflictRecJsonUI`);
  });

  it('getConflictedRecordsListUrl()', async() => {
    const serviceObj = new EndpointsClassicService();
    const url = serviceObj.getConflictedRecordsListUrl();
    expect(url).toContain(`/conflict/renderConflictRecUI`);
  });

  it('saveConflicResolveUrl()', async() => {
    const serviceObj = new EndpointsClassicService();
    const url = serviceObj.saveConflicResolveUrl();
    expect(url).toContain(`/conflict/saveConflictsAPI`);
  });

  it('resetConflictCrUrl()', async() => {
    const serviceObj = new EndpointsClassicService();
    const url = serviceObj.resetConflictCrUrl();
    expect(url).toContain(`/conflict/resetConflictCR`);
  });
});
