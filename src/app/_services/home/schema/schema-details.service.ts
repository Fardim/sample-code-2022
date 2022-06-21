import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { RequestForSchemaDetailsWithBr, SchemaTableViewRequest, CategoryInfo, MetadataModeleResponse, SchemaBrInfo, SchemaCorrectionReq, SchemaExecutionLog, SchemaTableViewFldMap, ClassificationNounMod, SchemaMROCorrectionReq, SchemaTableAction, CrossMappingRule, UDRDropdownValue, ClassificationHeader, AttributeValue, ValidateCellRes, TargetSystemResponse, LookupTableMetadata } from 'src/app/_models/schema/schemadetailstable';
import { map } from 'rxjs/operators';
import { Any2tsService } from '../../any2ts.service';
import { PermissionOn, SchemaDashboardPermission } from '@models/collaborator';
import { EndpointsAnalyticsService } from '@services/_endpoints/endpoints-analytics.service';
import { EndpointsClassicService } from '@services/_endpoints/endpoints-classic.service';
import { StatisticsFilterParams } from '@modules/schema/_components/v2/statics/statics.component';
import { EndpointsRuleService } from '@services/_endpoints/endpoints-rule.service';
import { sortBy } from 'lodash';
import { CoreSchemaBrInfo } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { EndpointsProfileService } from '@services/_endpoints/endpoints-profile.service';

@Injectable({
  providedIn: 'root',
})
export class SchemaDetailsService {
  constructor(
    private http: HttpClient,
    public endpointService: EndpointsRuleService,
    public endpointClassic: EndpointsClassicService,
    private any2tsService: Any2tsService,
    private analyticsEndpointService: EndpointsAnalyticsService,
    private endpointProfile: EndpointsProfileService
  ) { }

  /**
   * Call http for table data response
   * @param request request for table data
   */
  public getSchemaTableData(request: RequestForSchemaDetailsWithBr): Observable<any> {
    return this.http.post<any>(this.endpointService.getSchemaTableDetailsUrl(), request);
  }

  /**
   * updateSchemaTableView
   */
  public updateSchemaTableView(schemaTableViewReq: SchemaTableViewRequest): Observable<any> {
    return this.http.post<any>(this.endpointService.getUpdateSchemaTableViewUrl(), schemaTableViewReq);
  }

  public getAllCategoryInfo(): Observable<CategoryInfo[]> {
    return this.http.get<any>(this.endpointService.getCategoryInfoUrl()).pipe(
      map((data) => {
        return this.any2tsService.any2CategoryInfo(data);
      })
    );
  }

  public getMetadataFields(objectId: string): Observable<MetadataModeleResponse> {
    return this.http.get<any>(this.endpointClassic.getMetadataFields(objectId)).pipe(
      map((res) => {
        return this.any2tsService.any2MetadataResponse(res);
      })
    );
  }

  public getDatasetFields(objectIds: string[], searchString: string = ''): Observable<any> {
    return this.http.post<any>(this.endpointClassic.getDatasetFields(searchString), objectIds);
  }

  public getTargetSystems(): Observable<TargetSystemResponse[]> {
    return this.http.get<any>(this.endpointClassic.getTargetSystems());
  }

  public getLookupTables(connId: number | string, searchString: string): Observable<string[]> {
    return this.http.get<any>(this.endpointClassic.getLookupTables(connId, searchString));
  }

  public getLookupTablesMetadata(connId: number | string, tableName: string): Observable<LookupTableMetadata[]> {
    return this.http.get<any>(this.endpointClassic.getLookupTableMetadata(connId, tableName));
  }

  public getWorkflowFields(ObjectType: string[]): Observable<any>{
    return this.http.post<any>(this.endpointClassic.getWorkFlowFieldsUrl(), ObjectType);
  }

  public getAllSelectedFields(schemaId: string, variantId: string): Observable<SchemaTableViewFldMap[]> {
    return this.http.get<SchemaTableViewFldMap[]>(this.endpointService.getAllSelectedFields(), { params: { schemaId, variantId } });
  }

  public getSelectedFieldsByNodeIds(schemaId: string, variantId: string, nodeIds: string[]): Observable<any> {
    return this.http.post<any>(this.endpointService.getSelectedFieldsByNodeIds(), nodeIds, { params: { schemaId, variantId } });
  }

  public getSchemaBrInfoList(schemaId: string): Observable<SchemaBrInfo[]> {
    return this.http.get<SchemaBrInfo[]>(this.endpointService.getSchemaBrInfoList(schemaId));
  }

  public doCorrection(schemaId: string, request: SchemaCorrectionReq): Observable<any> {
    return this.http.post<any>(this.endpointService.doCorrectionUrl(schemaId), request);
  }

  public getCorrectedRecords(schemaId: string, fetchSize: any, fetchCount: any): Observable<any> {
    return this.http.get<any>(this.endpointService.getCorrectedRecords(schemaId), { params: { fetchSize, fetchCount } });
  }

  public getLastBrErrorRecords(schemaId: string, objnrs: string[]): Observable<any> {
    return this.http.post<any>(this.endpointService.getLastBrErrorRecords(schemaId), objnrs);
  }

  public getSchemaExecutionLogs(schemaId: string): Observable<SchemaExecutionLog[]> {
    return this.http.get<SchemaExecutionLog[]>(this.endpointService.getSchemaExecutionLogUrl(schemaId));
  }

  /**
   * Approve corrected records ..
   * @param schemaId append as request path
   * @param objNrs send as request body
   * @param roleId append as request params
   */
  public approveCorrectedRecords(schemaId: string, objNrs: string[], roleId?: string): Observable<any> {
    return this.http.post(this.endpointService.approveCorrectedRecords(schemaId), objNrs, { params: { roleId } });
  }

  /**
   * Reset scheama corrected records ..
   * @param schemaId append as request path ..
   * @param runId append as request query ..
   * @param objNrs append as request body
   */
  public resetCorrectionRecords(schemaId: string, runId: string, objNrs: string[]): Observable<any> {
    return this.http.put<any>(this.endpointService.resetCorrectionRecords(schemaId), objNrs, { params: { runId } });
  }

  public getAllUserDetailsV2(queryString: string, fetchCount: any): Observable<PermissionOn> {
    return this.http.get<PermissionOn>(this.endpointService.getAllUserDetailsUrl(), { params: { queryString, fetchCount } });
  }

  public getAllUserDetails(queryString: string, fetchCount: any, status?: any): Observable<PermissionOn> {
    const req = {
      pageInfo: {
        pageNumer: fetchCount,
        pageSize: 20,
      },
      searchString: queryString,
      roles: [],
      sortingInfo: [],
      status: status || [],
      isPartner: false
    };

    return this.http.post<any>(this.endpointProfile.getTeamMembers(), req).pipe(
      map((data) => {
        return this.any2tsService.any2UserDetailsV2(data);
      })
    );
  }

  public getCollaboratorDetails(schemaId: string): Observable<SchemaDashboardPermission[]> {
    return this.http.get<SchemaDashboardPermission[]>(this.endpointService.getCollaboratorDetailsUrl(schemaId));
  }

  public getCollaboratorDetailsV2(schemaId: string): Observable<SchemaDashboardPermission[]> {
    return this.http.get<SchemaDashboardPermission[]>(this.endpointService.getCollaboratorDetailsV2Url(schemaId));
  }

  public createUpdateUserDetails(request: SchemaDashboardPermission[]): Observable<number[]> {
    return this.http.post<number[]>(this.endpointService.createUpdateUserDetailsUrl(), request);
  }

  public deleteCollaborator(sNoList: string[]): Observable<boolean> {
    return this.http.request<boolean>('delete', this.endpointService.deleteSchemaCollaboratorDetailsUrl(), { body: sNoList });
  }

  public saveNewSchemaDetails(objectId: string, runNow: boolean, variantId: string, fileSno: string, requestObject: {}) {
    return this.http.post(this.endpointService.saveNewSchemaUrl(objectId, runNow, variantId, fileSno), requestObject);
  }

  public createUpdateReportDataTable(widgetId: string, request: object[]): Observable<boolean> {
    return this.http.post<boolean>(this.analyticsEndpointService.createUpdateReportDataTable(widgetId), request);
  }

  public getClassificationNounMod(
    schemaId: string,
    runId: string,
    requestStatus: string,
    variantId?: string,
    searchString?: string,
    scrollId?: string
  ): Observable<ClassificationNounMod> {
    searchString = searchString ? searchString : '';
    requestStatus = requestStatus ? requestStatus : '';
    return this.http
      .get<any>(this.endpointService.getClassificationNounMod(schemaId, runId, variantId), { params: { searchString, requestStatus } })
      .pipe(
        map((res) => {
          const finalRes = {} as ClassificationNounMod;
          const mro = res.filter((fil) => fil.ruleType === 'MRO_CLS_MASTER_CHECK');
          finalRes.MRO_CLS_MASTER_CHECK = { doc_cnt: mro[0] ? mro[0].doc_count : 0, info: mro[0] ? mro[0].info : [] };

          const gsn = res.filter((fil) => fil.ruleType === 'MRO_MANU_PRT_NUM_LOOKUP');
          finalRes.MRO_MANU_PRT_NUM_LOOKUP = { doc_cnt: gsn[0] ? gsn[0].doc_count : 0, info: gsn[0] ? gsn[0].info : [] };

          const unmatched = res.filter((fil) => fil.ruleType === 'unmatched');
          finalRes.unmatched = { doc_count: unmatched[0].doc_count ? unmatched[0].doc_count : 0 };

          return finalRes;
        })
      );
  }

  /**
   * Get classification data based on nounCode and modCode ..
   *
   * @param schemaId append on request
   * @param runid appned on request path
   * @param nounCode append on requet params
   * @param modifierCode append on requet params
   * @param ruleType append on requet params
   * @param objectNumberAfter append on requet params
   */
  public getClassificationData(
    schemaId: string,
    runid: string,
    nounCode: string,
    modifierCode: string,
    ruleType: string,
    requestStatus: string,
    searchString,
    objectNumberAfter?: string
  ): Observable<any> {
    return this.http.get<any>(this.endpointService.getClassificationDataTableUrl(schemaId, runid), {
      params: { nounCode, modifierCode, ruleType, requestStatus, searchString, objectNumberAfter },
    });
  }

  /**
   * Generate / create  cross module objectnumbet ..
   * @param schemaId append in parameter
   * @param objectType append in parameter
   * @param objectNumber append in parameter
   * @param crossbrId crossbrId
   */
  public generateCrossEntry(schemaId: string, objectType: string, objectNumber: string, crossbrId: string) {
    return this.http.get<string>(this.endpointService.generateCrossEntryUri(schemaId, objectType, objectNumber), { params: { crossbrId } });
  }

  /**
   * Do correction in schema classification output ..
   * @param schemaId append in request parametere ..
   * @param request append in request body ..
   */
  public doCorrectionForClassification(schemaId: string, fieldId: string, request: SchemaMROCorrectionReq): Observable<any> {
    fieldId = fieldId ? fieldId : '';
    const fromUnmatch: any = request.fromUnmatch ? request.fromUnmatch : false;
    delete request.fromUnmatch;
    return this.http.post<any>(this.endpointService.doClassificationCorrectionUri(), request, {
      params: { schemaId, fieldId, fromUnmatch },
    });
  }

  /**
   * Approve mro classification .. records ..
   *
   * @param schemaId append as required parameter ..
   * @param runId append as optional param..
   * @param objNr required parameter ..
   */
  public approveClassification(schemaId: string, runId: string, objNr: string[]): Observable<boolean> {
    return this.http.put<boolean>(this.endpointService.approveClassificationUri(), objNr, { params: { schemaId, runId } });
  }

  /**
   * Reject mro classification data ..
   *
   * @param schemaId as request
   * @param runId as optional request
   * @param objNr as required parameter ..
   */
  public rejectClassification(schemaId: string, runId: string, objNr: string[]): Observable<any> {
    return this.http.put<any>(this.endpointService.rejectClassificationUri(), objNr, { params: { schemaId, runId } });
  }

  public getSchemaExecutedStatsTrend(
    schemaId: string,
    variantId: string,
    plantCode?: string,
    filter?: StatisticsFilterParams
  ): Observable<SchemaExecutionLog[]> {
    return this.http.get<any>(this.endpointService.getSchemaExecutedStatsTrendUri(schemaId, variantId), {
      params: {
        exeStart: filter && filter.exe_start_date ? filter.exe_start_date : null,
        exeEnd: filter && filter.exe_end_date ? filter.exe_end_date : null,
        plantCode: plantCode ? plantCode : '0',
      },
    });
  }
  /**
   * Get downloadable data for mro execution ..
   * @param schemaId append on path request ..
   * @param runid append on request
   * @param nounCode append on request
   * @param modifierCode append on request params ..
   * @param ruleType append on request params ..
   * @param requestStatus append on request ..
   * @param searchString append on request ..
   */
  public getDownloadAbledataforMroExecution(
    schemaId: string,
    runid: string,
    nounCode: string,
    modifierCode: string,
    ruleType: string,
    requestStatus: string,
    searchString
  ): Observable<any> {
    if (nounCode === undefined) {
      throw new Error(`Nouncode must be required !`);
    }

    if (modifierCode === undefined) {
      throw new Error(`Modifiercode must be required !`);
    }

    searchString = searchString ? searchString : '';
    return this.http.get<any>(this.endpointService.downloadMroExceutionUri(schemaId), {
      params: { runId: runid, dataFor: requestStatus, ruleType, nounCode, modifierCode, searchString },
    });
  }

  /**
   * Put request for mro generate description ..
   * @param schemaId append on request .. mand.. params
   * @param runId append on request runid
   * @param objNrs send as request body ..
   * @param isFromMasterLib use to make identify the request from ..
   */
  public generateMroClassificationDescription(schemaId: string, runId: string, objNrs: string[], isFromMasterLib?: any): Observable<any> {
    return this.http.post<any>(this.endpointService.generateMroClassificationDescriptionUri(), objNrs, {
      params: { schemaId, runId, isFromMasterLib },
    });
  }

  public createUpdateSchemaAction(action: SchemaTableAction): Observable<any> {
    return this.http.post<any>(this.endpointService.getCreateUpdateSchemaActionUrl(), action);
  }

  public getTableActionsBySchemaId(schemaId: string): Observable<SchemaTableAction[]> {
    return this.http.get<SchemaTableAction[]>(this.endpointService.getFindActionsBySchemaUrl(schemaId));
  }

  public getTableActionsBySchemaAndRole(schemaId: string, role: string): Observable<SchemaTableAction[]> {
    return this.http.get<SchemaTableAction[]>(this.endpointService.getFindActionsBySchemaAndRoleUrl(schemaId, role));
  }

  public deleteSchemaTableAction(schemaId: string, actionCode: string): Observable<any> {
    return this.http.delete<any>(this.endpointService.getDeleteSchemaActionUrl(schemaId, actionCode));
  }

  public getCrossMappingRules(plantCode): Observable<CrossMappingRule[]> {
    // return this.http.get<CrossMappingRule[]>(this.endpointService.getCrossMappingUrl(plantCode));
    return of([]);
  }

  public createUpdateSchemaActionsList(actions: SchemaTableAction[]): Observable<any> {
    return this.http.post<any>(this.endpointService.getCreateUpdateSchemaActionsListUrl(), actions);
  }

  public uploadCsvFileData(
    fileData: File,
    schemaId: string,
    nodeId: string,
    nodeType: string,
    runId: string,
    objNDesc: string
  ): Observable<any[]> {
    const formData = new FormData();
    formData.append('file', fileData);
    return this.http.post<any>(`${this.endpointService.uploadCsvFileDataUrl(schemaId, nodeId, nodeType, runId, objNDesc)}`, formData);
  }

  public getUploadProgressPercent(schemaId: string, runId: string): Observable<CrossMappingRule[]> {
    return this.http.get<any>(this.endpointService.getUploadProgressUrl(schemaId, runId));
  }

  public getUDRDropdownValues(fieldId: string, searchStr: string): Observable<UDRDropdownValue[]> {
    return this.http.get<UDRDropdownValue[]>(this.endpointService.getUDRDropdownValues(fieldId, searchStr));
  }

  getDropdownOfPickList(moduleId: string, fieldId: string, lang: string, bodyarray) {
    return this.http.post<any>(this.endpointService.getDropdownofPickListUrl(moduleId, fieldId, lang), bodyarray)
  }

  /**
   * Get the classification datatable columns with metadata ....
   * @param schemaId current schema id ...
   * @param ruleType data based on this rule type ... either mro_master_lib or connekthub_lib
   * @param nounCode as the requestParams , which is the selected node nounCode
   * @param modeCode as the requestParams , which is the selected modifier nounCode
   * @returns will return the all possiable columns with metadata ...
   */
  public getClassificationDatatableColumns(
    schemaId: string,
    ruleType: string,
    nounCode: string,
    modeCode: string
  ): Observable<ClassificationHeader[]> {
    return this.http
      .get<ClassificationHeader[]>(this.endpointService.getClassificationDatatableHeader(), {
        params: { schemaId, ruleType, nounCode, modeCode },
      })
      .pipe(
        map((response) => {
          if (response && response.length) {
            return sortBy(response, 'order');
          }
          return response;
        })
      );
  }

  /**
   * Get the attribute values ...
   * @param attrCode selected attribute id
   * @param searchQuery serach string for attribite ...
   * @returns will return all the attribute values ...
   */
  public getClassificationAttributeValue(attrCode: string, searchQuery: string): Observable<AttributeValue[]> {
    searchQuery = searchQuery ? searchQuery : '';
    return this.http.get<AttributeValue[]>(this.endpointService.getClassificationAttributeValueUrl(), {
      params: { attrCode, searchQuery },
    });
  }

  getBusinessRulesList(selectedDataset, s, page, size: number, prefetch: string = ''): Observable<any> {
    const params: any = {
      schemaId : selectedDataset,
      s,
      _page: page,
      _size: size,
      _prefetch: prefetch
    }
    return this.http.get<CoreSchemaBrInfo[]>(this.endpointService.getBusinessRulesForDIWDataset(), { params });
  }

  /**
   * check permission for opening schema details
   * @param widgetId selected widget id
   * @returns is user allowed to open schema details page
   */
  checkPermissionForSchemaDetails(schemaId): Observable<any> {
    return this.http.get<any>(this.endpointService.checkPermissionForSchemaDetails(), { params: { schemaId } });
  }

  /**
   * Runtime validation for the cell value ....
   * @param moduleId dataset id
   * @param schemaId the current schema id
   * @param v3doc the v3 mdo dataset doc
   * @param fieldId the current field id
   * @param rowId the row sno for the corrected row
   * @returns will return the status along with messages
   */
  public validateCell(moduleId: string, schemaId: string, v3doc: any, fieldId: string, rowId?: string): Observable<ValidateCellRes> {
    const payload = { v3doc, fieldId, rules: [], dateFormat: '', rowId: rowId ? rowId : '' };
    return this.http.post<ValidateCellRes>(this.endpointService.validateCell(), payload, { params: { moduleId, schemaId } });
  }

  /**
   * Check the schema global error state ...
   * @returns will return the Observable
   */
  public schemaErrorStateCheck() {
    return this.http.get(this.endpointService.getErrorStatusCheckUrl());
  }

  /**
   * Create the queues and if execute true then schedule schema ..
   * @param queues the queues which need to be create ...
   * @param execute if true then will trigger schema internally ...
   * @returns true if all ok ..
   */
  public createQueueAndRunSchema(queues: string[] = [],schemaId: string, variantId: string, execute?: boolean): Observable<string> {
    return this.http.post<string>(this.endpointService.createQueueAndRunSchema(), queues, {params:{execute:`${execute ? execute : false}`, schemaId, variantId}});
  }

  public doClassificationCorrection(schemaId: string, request: any): Observable<any> {
    return this.http.post<any>(this.endpointService.doClassificationCorrectionUri(), request, {params: {schemaId}});
  }
}
