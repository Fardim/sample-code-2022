import { TestBed, inject, async } from '@angular/core/testing';

import { EndpointService } from './endpoint.service';
import { TaskListSummaryRequestParams, CommonGridRequestObject } from '@models/task-list/taskListDetails';

describe('EndpointService', () => {
  beforeEach(() => {
    const endPointProvider = jasmine.createSpyObj('EndpointService', ['getAllUnselectedFields']);
    TestBed.configureTestingModule({
      providers: [
        { provide: EndpointService, useValue: endPointProvider }
      ]
    });
  });

  it('should be created', inject([EndpointService], (service: EndpointService) => {
    expect(service).toBeTruthy();
  }));

  it('getAllUnselectedFields(), should return the unselected url', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getAllSelectedFields()).toContain('/schema/get-selected-fields-view');
  }));

  it('getSchemaBrInfoList(), should return the schema br information list url', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getSchemaBrInfoList('28364872686186')).toContain('schema/schema-br-infolist/28364872686186');
  }));

  it('doCorrectionUrl(), should return the schema do correction url', async(() => {
    const serObj = new EndpointService();
    expect(serObj.doCorrectionUrl('28364872686186')).toContain('schema/do-correction/28364872686186');
  }));

  it('getSchemaExecutionLogUrl(), should return the schema execution logs  url', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getSchemaExecutionLogUrl('28364872686186')).toContain('schema/get-execution-logs/28364872686186');
  }));

  it('uploadFileDataUrl(), should return the upload file data   url', async(() => {
    const serObj = new EndpointService();
    expect(serObj.uploadFileDataUrl()).toContain('schema/upload-file');
  }));

  it('uploadDataUrl(), should return the upload  data   url', async(() => {
    const serObj = new EndpointService();
    expect(serObj.uploadDataUrl('1005', '1234')).toContain('schema/upload-data/1005/1234');
  }));

  it('getSchemaStatusUrl(), should return the schema status url', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getSchemaStatusUrl()).toContain('schema/schema-status');
  }));

  it('getDynamicColumnListsUrl(), should return the listmetadata url', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getDynamicColumnListsUrl()).toContain('/listPage/listmetadata');
  }));

  it('getDynamicFiltermetaListsUrl(), should return the FilterMeta field url', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getDynamicFiltermetaListsUrl()).toContain('/listPage/getFilterMetaField');
  }));

  it('docCountUrl(), should return the get doc count url', async(() => {
    const serObj = new EndpointService();
    const objType = '1005';
    expect(serObj.docCountUrl(objType)).toContain(`report/record-count/${objType}`, `report/record-count/${objType}  sould be return!`);
  }));

  it('deleteCollaboratorUrl(), should return the delete url', async(() => {
    const serObj = new EndpointService();
    const permisionId = '243787235';
    expect(serObj.deleteCollaboratorUrl(permisionId)).toContain(`admin/permission/collaborator/delete/${permisionId}`, `admin/permission/collaborator/delete/${permisionId}  sould be return!`);
  }));

  it('deleteConditionBlock(), should return the delete condition  url', async(() => {
    const serObj = new EndpointService();
    const blockId = '243787235';
    expect(serObj.deleteConditionBlock(blockId)).toContain(`schema/br/udr/delete-conditionblock/${blockId}`);
  }));

  it('should call getTaskListCountURL(), should return task list count URL', () => {
    const serObj = new EndpointService();
    expect(serObj.getTaskListCountURL()).toContain('tasklist/getTaskListCount');
  })

  it('it should call getTaskListViewsUrl() and return formatted URL', () => {
    const serviceobj = new EndpointService();
    const userName = 'DemoApp';
    expect(serviceobj.getTaskListViewsUrl(userName)).toContain(`tasklist/getTaskListViews?userCreated=${userName}`)
  });

  it('it should call getDeleteTaskListViewUrl() and return formatted URL', () => {
    const serviceobj = new EndpointService();
    const viewId = '1234';
    expect(serviceobj.getDeleteTaskListViewUrl(viewId)).toContain(`tasklist/deleteTaskListView?viewId=${viewId}`)
  });

  it('it should call getSaveTaskListViewUrl() and return formatted URL', () => {
    const serviceobj = new EndpointService();
    expect(serviceobj.getSaveTaskListViewUrl()).toContain(`tasklist/taskListUserView`);
  });

  it('it should call getSaveTaskListURL() and return formatted URL', () => {
    const serviceobj = new EndpointService();
    expect(serviceobj.getSaveTaskListURL()).toContain(`tasklist/taskListUserView`);
  });

  it('should call getTaskSummaryMetaDataURL()', () => {
    const serviceobj = new EndpointService();
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
    const serviceobj = new EndpointService();
    const wfid = 'ERSA2528';
    const eventCode = '1005'
    const lang = 'en'

    expect(serviceobj.getTaskSummaryLayoutDataURL(wfid, eventCode, lang)).toContain(`layoutData/getLayoutData/${wfid}/${eventCode}?lang=${lang}`);
  });

  it('should call getAuditTrailLogsURL()', () => {
    const serviceobj = new EndpointService();
    expect(serviceobj.getAuditTrailLogsURL()).toContain(`changeAuditLog/getChangeAuditLog`)
  });

  it('should call getGridDataURL()', () => {
    const serviceobj = new EndpointService();
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

  it('should call getMetadataByWfid()', () => {
    const serviceobj = new EndpointService();
    const wfid = '221322101146259092'
    expect(serviceobj.getMetadataByWfid(wfid)).toContain(`layout/getMetadataByWfid/${wfid}`);
  })

  it('getCollaboratorDetailsUrl(), should return the person details  url', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getCollaboratorDetailsUrl('28364872686186')).toContain('schema/get-all-schemacollaborator-details/28364872686186');
  }));

  it('createUpdatePersonDetailsUrl(), should  create and update person details url', async(() => {
    const serObj = new EndpointService();
    expect(serObj.createUpdateUserDetailsUrl()).toContain('schema/create-update-schemacollaborator');
  }));

  it('getAllUserDetailsUrl(), should return the all person details url', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getAllUserDetailsUrl()).toContain('admin/permission/collaborators');
  }));

  it('deleteSchemaCollaboratorDetailsUrl(),should delte the exexting collaborator derail', async(() => {
    const serObj = new EndpointService();
    expect(serObj.deleteSchemaCollaboratorDetailsUrl()).toContain('admin/users/collaborator-records/delete');
  }));

  it('deleteSchema(),should delte the schema', async(() => {
    const serObj = new EndpointService();
    expect(serObj.deleteSchema('355535857155320681 ')).toContain('schema/delete/355535857155320681');
  }));

  it('it should call getLoadRecipientsListUrl() and return formatted URL', () => {
    const serviceobj = new EndpointService();
    expect(serviceobj.getLoadRecipientsListUrl()).toContain(`restWorkflow/loadRecipient`);
  });

  it('it should call getWfFieldsListUrl() and return formatted URL', () => {
    const serviceobj = new EndpointService();
    expect(serviceobj.getWfFieldsListUrl()).toContain(`restWorkflow/loadWorkfLowField`);
  });

  it('it should call getReportListUrl() and return formatted URL', () => {
    const serviceobj = new EndpointService();
    expect(serviceobj.getReportListUrl()).toContain(`report/list`);
  });

  it('it should call getFiltersUrl() and return formatted URL', () => {
    const serviceobj = new EndpointService();
    expect(serviceobj.getFiltersUrl()).toContain(`tasklist/filter`);
  });

  it('it should call getLoadApisUrl() and return formatted URL', () => {
    const serviceobj = new EndpointService();
    expect(serviceobj.getLoadApisUrl()).toContain(`restWorkflow/loadAPI`);
  });

  it('it should call getSaveWfDefinitionUrl() and return formatted URL', () => {
    const serviceobj = new EndpointService();
    expect(serviceobj.getSaveWfDefinitionUrl()).toContain(`restWorkflow/saveWorkFlowStepViaXml`);
  });

  it('saveUpdateVariantUrl(), hould  create and update Variant details url', () => {
    const serviceobj = new EndpointService();
    expect(serviceobj.saveUpdateVariantUrl()).toContain(`schema/data-variants`);
  });

  it('getVariantdetailsByvariantIdUrl(),should return all variant detials by variantId', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getVariantdetailsByvariantIdUrl('355555320681 ')).toContain('schema/variant/355555320681');
  }));

  it('deleteVariantUrl(),should delete variant details', async(() => {
    const serObj = new EndpointService();
    expect(serObj.deleteVariantUrl('35555320681 ')).toContain('schema/variant/delete/35555320681');
  }));

  it('getSchemaDetailsBySchemaIdUrl(),should return all schema detials by schemaId', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getSchemaDetailsBySchemaIdUrl('355555320681 ')).toContain('schema/schema-details/355555320681');
  }));

  it('uploadCorrectionDataUrl(),should upload correction data', async(() => {
    const serObj = new EndpointService();
    const objectType = 'Material';
    const schemaId = '7674654';
    const runId = '87676556';
    const plantCode = '0';
    const fileSno = '7765';
    expect(serObj.uploadCorrectionDataUrl(objectType, schemaId, runId, plantCode, fileSno)).toContain(`es/uploadCorrection/${objectType}/${schemaId}/${runId}/${plantCode}/${fileSno}`);
  }));

  it('getSchemaThresholdStatics(),should return schema thresholdstatics value', async(() => {
    const serObj = new EndpointService();
    const schemaId = '867576576';
    expect(serObj.getSchemaThresholdStatics(schemaId)).toContain(`schema/statics/${schemaId}`);
  }));

  it('getUdrBusinessRuleInfoUrl(),should return udr details', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getUdrBusinessRuleInfoUrl('355555320681')).toContain('schema/br/udr/355555320681');
  }));

  it('getBusinessRuleInfoUrl(),should return all business rule details', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getBusinessRuleInfoUrl('355555320681')).toContain('schema/get-business-rule-info/355555320681');
  }));

  it('saveUpdateUDRUrl(),should save or update udr details', async(() => {
    const serObj = new EndpointService();
    expect(serObj.saveUpdateUDRUrl()).toContain('admin/schema/udr/save-update');
  }));

  it('conditionListsUrl(),should return condition list', async(() => {
    const serObj = new EndpointService();
    expect(serObj.conditionListsUrl('355555320681')).toContain('schema/br/udr/condition-list/355555320681');
  }));

  it('saveUpdateUdrBlockUrl(),should save or update udr details', async(() => {
    const serObj = new EndpointService();
    expect(serObj.saveUpdateUdrBlockUrl()).toContain('admin/schema/br/udr');
  }));

  it('getBrConditionalOperatorUrl(),should return condition operator details', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getBrConditionalOperatorUrl()).toContain('schema/br/condition-operator');
  }));

  it('saveUpdateReportCollaborator(),should save or update report collaborator details', async(() => {
    const serObj = new EndpointService();
    expect(serObj.saveUpdateReportCollaborator()).toContain('admin/permission/collaborators/permission/save-update');
  }));

  it('deleteReport(),should delete report details', async(() => {
    const serObj = new EndpointService();
    expect(serObj.deleteReport('823927')).toContain('report/delete/823927');
  }));

  it('getReportConfigUrl(),should return report config', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getReportConfigUrl('823927')).toContain('report/823927');
  }));

  it('createUpdateReportUrl(),should create or update report details', async(() => {
    const serObj = new EndpointService();
    expect(serObj.createUpdateReportUrl()).toContain('report/create-update');
  }));

  it('getTimeseriesWidgetInfoUrl(),should return time series widget info', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getTimeseriesWidgetInfoUrl(75687687)).toContain('report/widget/timeseries/75687687');
  }));

  it('getListTableMetaData(),should return meta data table', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getListTableMetaData(75687687)).toContain('report/widget/report-list/metadata/75687687');
  }));

  it('reportDashboardUrl(),should return report dashboard details', async(() => {
    const serObj = new EndpointService();
    expect(serObj.reportDashboardUrl(75687687)).toContain('report/report-info/75687687');
  }));

  it('deleteBr(),should delete businessrule', async(() => {
    const serObj = new EndpointService();
    expect(serObj.deleteBr(75687687)).toContain('schema/delete-business-rule/' + 75687687);
  }));

  it('createSchema(),should create schema', async(() => {
    const serObj = new EndpointService();
    expect(serObj.createSchema()).toContain('schema/create-update-schema');
  }));

  it('createBr(),should create business rule', async(() => {
    const serObj = new EndpointService();
    expect(serObj.createBr()).toContain('schema/create-update-br');
  }));

  it('getFillDataInfo(),should return fill data info', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getFillDataInfo('7564564')).toContain('schema/metadata-fileds/7564564');
  }));

  it('submitReviewedRecordsUrl(),should save reviewed records', async(() => {
    const serObj = new EndpointService();
    expect(serObj.submitReviewedRecordsUrl('7564564')).toContain('schema/submit-reviewed-records/7564564');
  }));

  it('getLastBrErrorRecords(),should return error records', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getLastBrErrorRecords('7564564')).toContain('schema/get-mdoerror-records/7564564');
  }));

  it('getCorrectedRecords(),should return corrected records', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getCorrectedRecords('7564564')).toContain('schema/get-corrected-records/7564564');
  }));

  it('getSchemaVariantsUrl(),should return schema variant details', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getSchemaVariantsUrl('7564564')).toContain('schema/variants/7564564');
  }));

  it('scheduleSchemaCount(),should return schema count', async(() => {
    const serObj = new EndpointService();
    expect(serObj.scheduleSchemaCount('7564564')).toContain('schema/record-count/7564564');
  }));

  it('categoryChartData(),should return category chart data', async(() => {
    const serObj = new EndpointService();
    const status = 'success';
    const schemaId = '7674654';
    const variantId = '87676556';
    const categoryId = '0';
    expect(serObj.categoryChartData(schemaId, variantId, categoryId, status)).toContain(`schema/category-chart-data/${schemaId}/${variantId}/${categoryId}/${status}`);
  }));

  it('getCategoryInfoUrl(),should return category info', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getCategoryInfoUrl()).toContain('schema/category-list');
  }));

  it('getOverviewChartDataUrl(),should return category chart data details', async(() => {
    const serObj = new EndpointService();
    const schemaId = '7674654';
    const variantId = '87676556';
    const runId = '0';
    expect(serObj.getOverviewChartDataUrl(schemaId, variantId, runId)).toContain(`/schema/overview-chart-data/${schemaId}/${variantId}/${runId}`);
  }));

  it('getUpdateSchemaTableViewUrl(),should return count of schema table view', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getUpdateSchemaTableViewUrl()).toContain('schema/update-schema-table-view');
  }));

  it('getSchemaTableDetailsUrl(),should return table details', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getSchemaTableDetailsUrl()).toContain('schema/schema-details');
  }));

  it('groupDetailswithAssignedschemaUrl(),should return assigned schema of that particular schema group', async(() => {
    const serObj = new EndpointService();
    expect(serObj.groupDetailswithAssignedschemaUrl('86576534')).toContain('schema/group-detailswith-assignedschema/86576534');
  }));

  it('getAllSchemabymoduleids(),should return module details', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getAllSchemabymoduleids()).toContain('schema/get-all-schemabymoduleids');
  }));

  it('getSchemaGroupCountUrl(),should return schema group count', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getSchemaGroupCountUrl(7501564)).toContain('schema/get-schema-group-count/7501564');
  }));

  it('getUserDetailsUrl(),should return user detail', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getUserDetailsUrl('harshit')).toContain('schema/getUserDetails/harshit');
  }));

  it('getSchemaGroupDetailsByGrpIdUrl(),should return schema group details by schema groupid', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getSchemaGroupDetailsByGrpIdUrl('10097')).toContain('schema/get-group-details/10097');
  }));

  it('getScheduleSchemaUrl(),should schedule schema details', async(() => {
    const serObj = new EndpointService();
    const isRunWithCheckedData = true;
    expect(serObj.getScheduleSchemaUrl(isRunWithCheckedData)).toContain('schema/schedule-schema');
  }));

  it('downloadExecutionDetailsUrl(),should download execution details', async(() => {
    const serObj = new EndpointService();
    expect(serObj.downloadExecutionDetailsUrl('5678987', 'success')).toContain('schema/download/5678987/success');
  }));

  it('getShowMoreSchemaTableDataUrl(),should return schema table', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getShowMoreSchemaTableDataUrl()).toContain('showMoreSchemaTableData');
  }));

  it('getSchemaDetailsBySchemaId(),should return schema details by schemaId', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getSchemaDetailsBySchemaId('76567865')).toContain('schema/schemaCount/76567865');
  }));

  it('getSchemaDataTableColumnInfoUrl(),should return schema data table info', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getSchemaDataTableColumnInfoUrl()).toContain('getListPageLayout');
  }));

  it('deleteSchemaGroupUrl(), should delete schema group', async(() => {
    const serObj = new EndpointService();
    expect(serObj.deleteSchemaGroupUrl('65467801')).toContain('schema/delete-schema-group/65467801');
  }));

  it('schemaVarinatDetails(),should return schema vaiant details', async(() => {
    const serObj = new EndpointService();
    expect(serObj.schemaVarinatDetails()).toContain('schema/schemaVariantList');
  }));

  it('getSchemaListByGroupIdUrl(),should return schema list by groupId', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getSchemaListByGroupIdUrl()).toContain('schema/schema-list');
  }));

  it('getSchemaGroupsUrl(),should return schema group detials', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getSchemaGroupsUrl()).toContain('schema/get-all-groups');
  }));

  it('getCreateSchemaGroupUrl(),should create schema group', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getCreateSchemaGroupUrl()).toContain('schema/create-schemagroup');
  }));

  it('onLoadSchema(),should load schema', async(() => {
    const serObj = new EndpointService();
    expect(serObj.onLoadSchema()).toContain('restSchemaLogs');
  }));

  it('jwtRefresh(), should call jwtrefresh function', async(() => {
    const serObj = new EndpointService();
    expect(serObj.jwtRefresh()).toContain('jwt/refresh');
  }));

  it('duplicacyGroupsListUrl(), should call duplicacyGroupsListUrl function', async(() => {
    const serObj = new EndpointService();
    expect(serObj.duplicacyGroupsListUrl()).toContain('duplicate/getgroupId');
  }));

  it('saveUpdateDataScopeUrl(), should call saveUpdateDataScopeUrl function', async(() => {
    const serObj = new EndpointService();
    expect(serObj.saveUpdateDataScopeUrl()).toContain('schema/variant/create-update-single');
  }));

  it('getAllDataScopeUrl(), should call getAllDataScopeUrl function', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getAllDataScopeUrl('schema1', 'type1')).toContain('schema/variants/schema1/type1');
  }));

  it('getMetadataFields(), should return the corresponding endpoint', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getMetadataFields('123')).toContain('schema/metadata-fileds/123');
  }));

  it('getBusinessRulesInfoByModuleIdUrl(), should return the corresponding endpoint', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getBusinessRulesInfoByModuleIdUrl()).toContain('schema/get-business-rules');
  }));

  it('getAllBusinessRulesUrl(), should return the corresponding endpoint', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getAllBusinessRulesUrl()).toContain('schema/get-all-business-rules');
  }));

  it('getBusinessRulesInfoBySchemaIdUrl(), should return the corresponding endpoint', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getBusinessRulesInfoBySchemaIdUrl('321')).toContain('schema/get-business-rules/321');
  }));

  it('getCategoriesInfo(), should return the corresponding endpoint', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getCategoriesInfo()).toContain('schema/category-list');
  }));

  it('getFieldMetadatByFldUrl(), should return the corresponding endpoint', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getFieldMetadatByFldUrl('321')).toContain('report/fields-description/321');
  }));

  it('getFieldMetadatByFldUrl(), should return the corresponding endpoint', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getFieldMetadatByFldUrl('321')).toContain('report/fields-description/321');
  }));

  it('widgetDataUrl(), should return the corresponding endpoint', async(() => {
    const serObj = new EndpointService();
    expect(serObj.widgetDataUrl()).toContain('widgetData');
  }));

  it('getStackBarChartMetaData(), should return the corresponding endpoint', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getStackBarChartMetaData('widgetId')).toContain('report/widget/stack-barChart/metadata/widgetId');
  }));

  it('getFiltertMetaData(), should return the corresponding endpoint', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getFiltertMetaData('widgetId')).toContain('report/widget/filter/metadata/widgetId');
  }));

  it('getBarChartMetaData(), should return the corresponding endpoint', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getBarChartMetaData('widgetId')).toContain('report/widget/bar-chart/metadata/widgetId');
  }));

  it('getCountMetadata(), should return the corresponding endpoint', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getCountMetadata('widgetId')).toContain('report/widget/count/metadata/widgetId');
  }));

  it('getHeaderMetaData(), should return the corresponding endpoint', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getHeaderMetaData('widgetId')).toContain('report/widget/header/metadata/widgetId');
  }));

  it('getimageMetadata(), should return the corresponding endpoint', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getimageMetadata('widgetId')).toContain('report/widget/image/metadata/widgetId');
  }));

  it('getHTMLMetadata(), should return the corresponding endpoint', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getHTMLMetadata('widgetId')).toContain('report/widget/html-editor/metadata/widgetId');
  }));

  it('getFilterDynamicListsUrl(), should return the corresponding endpoint', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getFilterDynamicListsUrl()).toContain('tasklist/filterList');
  }));

  it('getTasksUrl(), should return the corresponding endpoint', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getTasksUrl()).toContain('tasklist/taskListData');
  }));

  it('getReportListUrlForMsTeams(), should return the corresponding endpoint', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getReportListUrlForMsTeams()).toContain('report');
  }));

  it('getPermissionUrl(), should return the corresponding endpoint', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getPermissionUrl()).toContain('admin/permission/collaborators');
  }));

  it('returnCollaboratorsPermisisonUrl(), should return the corresponding endpoint', async(() => {
    const serObj = new EndpointService();
    expect(serObj.returnCollaboratorsPermisisonUrl('reportId')).toContain('admin/permission/collaborators/permission/reportId');
  }));

  it('dropDownValuesUrl(), should return the corresponding endpoint', async(() => {
    const serObj = new EndpointService();
    expect(serObj.dropDownValuesUrl('fieldId')).toContain('schema/drop-values/fieldId');
  }));

  it('getChangeLogDetails(), should return the corresponding endpoint', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getChangeLogDetails()).toContain('changeAuditLog/getChangeLogDetails');
  }));

  it('getFieldOptionsUrl(), should return the corresponding endpoint', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getFieldOptionsUrl()).toContain('restWorkflow/admin_dropdown_list_dropdown_data');
  }));

  it('getloadWfDefinitionUrl(), should return the corresponding endpoint', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getloadWfDefinitionUrl()).toContain('restWorkflow/loadWorkFlowPathStep');
  }));

  it('getSchemaInfoByModuleIdUrl(), should return the corresponding endpoint', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getSchemaInfoByModuleIdUrl('moduleId')).toContain('schema/schema-info/moduleId');
  }));

  it('getSchemaWithVariantsUrl(), should return the corresponding endpoint', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getSchemaWithVariantsUrl()).toContain('schema/list-variants');
  }));

  it('getLayoutMetadata(), should return the corresponding endpoint', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getLayoutMetadata('widgetId', 'objectNumber', 'layoutId'))
    .toContain('report/layout-metadata/widgetId/objectNumber/layoutId');
  }));

  it('saveNewSchemaUrl(), should return the corresponding endpoint', async(() => {
    const serObj = new EndpointService();
    expect(serObj.saveNewSchemaUrl('objectId', false, 'variantId', 'fileSno'))
    .toContain('schemamodule/create-schema?objectId=objectId&runNow=false&variantId=variantId&fileSno=fileSno');
  }));

  it('getlayoutData(), should return the corresponding endpoint', async(() => {
    const serObj = new EndpointService();
    expect(serObj.getlayoutData('widgetId', 'objectNumber'))
    .toContain('report/layout-data/widgetId/objectNumber');
  }));



});