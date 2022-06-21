import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Any2tsService } from '../any2ts.service';
import {
  GetAllSchemabymoduleidsReq,
  ObjectTypeResponse,
  GetAllSchemabymoduleidsRes,
  WorkflowResponse,
  WorkflowPath,
  ExcelValues,
  DataSource,
  SchemaVariantReq,
  CheckDataResponse,
  SchemaTableViewDto,
  SchemaListReq,
  SchemaTabHistory,
  SchemaFileUploadRes,
} from 'src/app/_models/schema/schema';
import {
  DropDownValue,
  UDRBlocksModel,
  UdrModel,
  CoreSchemaBrInfo,
  Category,
  DuplicateRuleModel,
  TransformationMappingResponse,
  ApiRulesInfo,
  CheckCodeModel,
  TargetSystemModel,
} from 'src/app/_modules/admin/_components/module/business-rules/business-rules.modal';
import { SchemaStaticThresholdRes, SchemaListModuleList, SchemaListDetails, CoreSchemaBrMap, ModuleInfo } from '@models/schema/schemalist';
import { SchemaScheduler } from '@models/schema/schemaScheduler';
import { EndpointsRuleService } from '../_endpoints/endpoints-rule.service';
import { SchemaExecutionNodeType, SchemaExecutionProgressResponse, SchemaExecutionTree } from '@models/schema/schema-execution';
import { EndpointsClassicService } from '@services/_endpoints/endpoints-classic.service';
import { GlobalCounts } from '@models/schema/schemadetailstable';
import { DiwListDataSourceResponse } from '@modules/schema/_components_v2/diw-home/diw-list/diw-list.component';
import { EndpointsCoreService } from '@services/_endpoints/endpoints-core.service';

@Injectable({
  providedIn: 'root',
})
export class SchemaService {
  private excelValues: BehaviorSubject<ExcelValues> = new BehaviorSubject(null);
  private staticFieldValues: BehaviorSubject<string[]> = new BehaviorSubject(null);
  private availableWeightage: BehaviorSubject<number> = new BehaviorSubject(null);

  public activeTabDetails: BehaviorSubject<any> = new BehaviorSubject(null);
  public refreshSchemaList: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public drChildReponse = new Subject<any>();
  public drChildRequest;
  isConditionSheetClose: Subject<boolean> = new Subject();
  conditionSideSheetData: BehaviorSubject<any[]> = new BehaviorSubject([]);
  currentDescFieldValues: BehaviorSubject<any[]> = new BehaviorSubject([]);

  constructor(
    private http: HttpClient,
    private endpointService: EndpointsRuleService,
    private endpointClassic: EndpointsClassicService,
    private any2tsService: Any2tsService,
    private endpointCore: EndpointsCoreService
  ) {}

  /**
   * Setter for available weightage value
   */
  public set currentweightage(value: number) {
    this.availableWeightage.next(value);
  }

  /**
   * get the current vaailable weightage
   */
  public get currentweightageValue() {
    return this.availableWeightage.getValue();
  }

  public getActiveTabDetails() {
    return this.activeTabDetails.asObservable();
  }

  public setActiveTabDetails(val) {
    this.activeTabDetails.next(val);
  }

  public setRefreshSchemaList(val) {
    this.refreshSchemaList.next(val);
  }

  public getRefeshSchemaList() {
    return this.refreshSchemaList.asObservable();
  }

  /**
   * get column data using the selected column id
   * @param selectedElement Element that's selected currently
   */
  public generateColumnByFieldId(fieldId: string) {
    const excelData: ExcelValues = this.getExcelValues();
    if (fieldId && excelData) {
      const column = excelData.headerData.find((header) => header.mdoFldId === fieldId);
      const index = column.columnIndex;
      const columnData: string[] = [];
      excelData.uploadedData.map((row: any[], i) => {
        const columnValue = row[index];
        if (columnValue && i > 0) {
          columnData.push(columnValue);
        }
      });

      this.setStaticFieldValues(Array.from(new Set(columnData)));
    }
  }

  public setStaticFieldValues(values: string[]) {
    this.staticFieldValues.next(values);
  }

  public getStaticFieldValues(fieldId: string): string[] {
    if (fieldId && fieldId.trim()) {
      this.generateColumnByFieldId(fieldId);
    }
    return this.staticFieldValues.getValue();
  }

  public setExcelValues(values: ExcelValues) {
    this.excelValues.next(values);
  }

  public getExcelValues(): ExcelValues {
    return this.excelValues.getValue();
  }

  public getDRChildResponse(request) {
    this.drChildRequest = request;
    return this.drChildReponse.asObservable();
  }

  public getAllSchemabymoduleids(getAllSchemabymoduleidsReq: GetAllSchemabymoduleidsReq): Observable<GetAllSchemabymoduleidsRes[]> {
    return this.http.post<any>(this.endpointService.getAllSchemabymoduleids(), getAllSchemabymoduleidsReq).pipe(
      map((data) => {
        return this.any2tsService.any2GetAllSchemabymoduleidsResponse(data);
      })
    );
  }

  public getAllObjectType(): Observable<ObjectTypeResponse[]> {
    return this.http.get<any>(this.endpointClassic.getAllObjecttypeUrl()).pipe(
      map((data) => {
        return this.any2tsService.any2ObjectType(data);
      })
    );
  }

  public scheduleSchemaCount(schemaId: string): Observable<number> {
    return this.http.get<any>(this.endpointClassic.scheduleSchemaCount(schemaId));
  }

  public uploadUpdateFileData(file: File, fileSno: string): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<string>(`${this.endpointService.uploadFileDataUrl()}?fileSno=${fileSno}`, formData);
  }

  public uploadData(data: DataSource[], objectType: string, fileSno: string): Observable<string> {
    return this.http.post<any>(this.endpointService.uploadDataUrl(objectType, fileSno), data);
  }

  public uploadSchemaFile(file): Observable<SchemaFileUploadRes> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<SchemaFileUploadRes>(this.endpointService.uploadSchemaFile(), formData);
  }

  public importSchema(fileSno: string, schemaId: string, keepCopy: boolean, replaceOld: boolean): Observable<SchemaFileUploadRes> {
    return this.http.post<SchemaFileUploadRes>(this.endpointService.importSchemaUrl(fileSno, schemaId, keepCopy, replaceOld), []);
  }

  /**
   * API to get business rules for the schema
   * @param schemaId ID of the schema
   */
  public getBusinessRulesBySchemaId(schemaId = ''): Observable<CoreSchemaBrInfo[]> {
    return this.http.get<CoreSchemaBrInfo[]>(this.endpointService.getBusinessRulesInfoBySchemaIdUrl(schemaId));
  }

  /**
   * API to get all business rules according to module ID
   * @param moduleId ID of module
   * @param searchString value to be searched
   * @param brType type of business rule
   * @param fetchCount fetchCount..
   */
  public getBusinessRulesByModuleId(
    moduleId: string,
    searchString: string,
    brType: string,
    fetchCount: string,
    fetchSize = 50
  ): Observable<CoreSchemaBrInfo[]> {
    return this.http.get<CoreSchemaBrInfo[]>(this.endpointService.getBusinessRulesInfoByModuleIdUrl(), {
      params: { moduleId, searchString, brType, fetchCount, fetchSize },
    });
  }

  public getAllBusinessRules(s?: string): Observable<CoreSchemaBrInfo[]> {
    s = s ? s : '';
    return this.http.get<CoreSchemaBrInfo[]>(this.endpointService.getAllBusinessRulesUrl(), { params: { searchString: s } });
  }

  public getAllCategoriesList(): Observable<Category[]> {
    return this.http.get<Category[]>(this.endpointService.getCategoriesInfo());
  }

  public createUpdateSchema(params): Observable<string> {
    return this.http.post<string>(this.endpointService.createSchema(), params);
  }

  getFillDataDropdownData(id) {
    return this.http.get(this.endpointService.getFillDataInfo(id));
  }

  createBusinessRule(params): Observable<CoreSchemaBrInfo> {
    return this.http.post<CoreSchemaBrInfo>(this.endpointService.createBr(), params);
  }

  createBusinessRuleV2(params): Observable<CoreSchemaBrInfo> {
    return this.http.post<CoreSchemaBrInfo>(this.endpointService.createBrV2(), params);
  }

  public deleteBr(id: string): Observable<boolean> {
    return this.http.delete<boolean>(this.endpointService.deleteBr(id));
  }

  public getBrConditionalOperator(): Observable<string[]> {
    return this.http.get<string[]>(this.endpointService.getBrConditionalOperatorUrl());
  }

  public dropDownValues(fieldId: string, queryString: string, from = '0', size = '20'): Observable<DropDownValue[]> {
    return this.http.get<DropDownValue[]>(this.endpointService.dropDownValuesUrl(fieldId), { params: { queryString, from, size } });
  }

  public dropDownValuesV2(fieldId: string, body: any, queryString: string, from = '0', size = '20'): Observable<DropDownValue[]> {
    return this.http.post<DropDownValue[]>(this.endpointService.dropDownValuesV2Url(fieldId), body, {
      params: { queryString, from, size },
    });
  }

  public getFieldDropValues(moduleId, fieldId: string, searchString: string, from = 0, size = 20, lang = 'en'): Observable<DropDownValue[]> {
    return this.http.post<any>(this.endpointService.getDropValuesUrl(moduleId, fieldId, lang ,from, size), {searchString}).pipe(
      map((data) => {
        return this.any2tsService.any2DropValues(data, fieldId);
      })
    );
  }

  public saveUpdateUdrBlock(blocks: UDRBlocksModel[]): Observable<string[]> {
    return this.http.post<string[]>(this.endpointService.saveUpdateUdrBlockUrl(), blocks);
  }

  public getConditionList(objectType: string): Observable<UDRBlocksModel[]> {
    return this.http.get<UDRBlocksModel[]>(this.endpointService.conditionListsUrl(objectType));
  }

  public saveUpdateUDR(udrReq: CoreSchemaBrInfo): Observable<string> {
    return this.http.post<string>(this.endpointService.saveUpdateUDRUrl(), udrReq);
  }

  public getBusinessRuleInfo(brId: string): Observable<CoreSchemaBrInfo> {
    return this.http.get<CoreSchemaBrInfo>(this.endpointService.getBusinessRuleInfoUrl(brId));
  }

  public duplicateBusinessRule(brId: string) {
    return this.http.get(this.endpointService.getDuplicateBusinessRuleUrl(brId));
  }

  public getBusinessRuleInfoV2(brId: string): Observable<CoreSchemaBrInfo> {
    return this.http.get<CoreSchemaBrInfo>(this.endpointService.getBusinessRuleInfoUrlV2(brId));
  }

  /**
   * Http call and return UdrModel
   * getUdrBusinessRuleInfoUrl
   */
  public getUdrBusinessRuleInfo(ruleId: string): Observable<UdrModel> {
    return this.http.get<UdrModel>(this.endpointService.getUdrBusinessRuleInfoUrl(ruleId));
  }

  /**
   * Delete blocks and mapping to brs
   * @param blockId blockid that want to delete
   */
  public deleteConditionBlock(blockId: string): Observable<boolean> {
    return this.http.delete<boolean>(this.endpointService.deleteConditionBlock(blockId));
  }

  /**
   * Return Schema threshold based on config ..
   * Latest Run statics
   * @param schemaId schema id
   * @param variantId variant id is an option params ..
   */
  public getSchemaThresholdStatics(schemaId: string, variantId: string, selectedRules?: string[]): Observable<SchemaStaticThresholdRes> {
    selectedRules = selectedRules ? selectedRules : [];
    return this.http.post<SchemaStaticThresholdRes>(this.endpointService.getSchemaThresholdStatics(schemaId, variantId), selectedRules);
  }

  public getSchemaThresholdStaticsV2(
    schemaId: string,
    variantId: string,
    selectedRules: string[],
    filterCriteia: any
  ): Observable<SchemaStaticThresholdRes> {
    const body = {
      ruleSelected: selectedRules || [],
      filterCriteria: filterCriteia || [],
    };
    return this.http.post<SchemaStaticThresholdRes>(this.endpointService.getSchemaThresholdStaticsV2(schemaId, variantId), body);
  }

  public uploadCorrectionData(
    data: DataSource[],
    objectType: string,
    schemaId: string,
    runId: string,
    plantCode: string,
    fileSno: string
  ): Observable<string> {
    return this.http.post<any>(this.endpointService.uploadCorrectionDataUrl(objectType, schemaId, runId, plantCode, fileSno), data);
  }

  /**
   * Delete Schema by schemaid
   * @param schemaId deletable schemaid
   */
  public deleteSChema(schemaId: string): Observable<boolean> {
    return this.http.delete<boolean>(this.endpointService.deleteSchema(schemaId));
  }

  /**
   * Get schema list info by moduleId
   * @param moduleId get data based on this id
   */
  public getSchemaInfoByModuleId(moduleId: string): Observable<SchemaListModuleList> {
    return this.http.get<SchemaListModuleList>(this.endpointService.getSchemaInfoByModuleIdUrl(moduleId));
  }

  /**
   * Get module info by moduleId
   * @param moduleId get data based on this id
   */
  public getModuleInfoByModuleId(moduleId: string): Observable<Array<ModuleInfo>> {
    return this.http.post<any>(this.endpointService.getModuleInfoByModuleIdUrl(), [moduleId]);
  }

  /**
   * Get schema along with variants ...
   *
   * @param moduleId moduleid its optional parametere if want schema on that module then send it
   * other wise data comes based on plantcode
   */
  public getSchemaWithVariants(moduleId?: string): Observable<SchemaListDetails[]> {
    return this.http.get<SchemaListDetails[]>(
      moduleId ? `${this.endpointService.getSchemaWithVariantsUrl()}?moduleId=${moduleId}` : this.endpointService.getSchemaWithVariantsUrl()
    );
  }

  public updateBrMap(req: CoreSchemaBrMap): Observable<boolean> {
    return this.http.post<boolean>(this.endpointService.updateBrMap(), req);
  }

  public getWorkflowData(): Observable<WorkflowResponse[]> {
    return this.http.get<any>(this.endpointClassic.getWorkflowDataURL());
  }

  public getWorkFlowPath(ObjectType: string[]): Observable<WorkflowPath[]> {
    return this.http.post<WorkflowPath[]>(this.endpointClassic.getWorkFlowPathUrl(), ObjectType);
  }

  /**
   * function to POST Api call for create/update schedule
   * @param schemaId Id of schema
   * @param schedulerObject request payload contains scheduler information..
   */
  public createUpdateSchedule(schemaId: string, schedulerObject: SchemaScheduler): Observable<number> {
    return this.http.post<number>(this.endpointService.createUpdateScheduleUrl(schemaId), schedulerObject);
  }

  /**
   * function to GET Api call for schedule of a schema
   * @param schemaId: schema Id for which scheduler information will be fetched
   */
  public getSchedule(schemaId: string): Observable<SchemaScheduler> {
    return this.http.get<SchemaScheduler>(this.endpointService.getScheduleUrl(schemaId));
  }

  public saveUpdateDuplicateRule(duplicateReq: DuplicateRuleModel, params): Observable<any> {
    return this.http.post<any>(this.endpointService.saveUpdateDuplicateRule(), duplicateReq, { params });
  }

  /**
   * Function to POST Api call for copy duplicate rule data scope
   * @param params coreSchemaBrInfo req object
   */
  public copyDuplicateRule(params: CoreSchemaBrInfo): Observable<CoreSchemaBrInfo> {
    return this.http.post<CoreSchemaBrInfo>(this.endpointService.copyDuplicate(), params);
  }

  /**
   * Function to POST Api call for save/update schema data scope
   * @param dataScopeReq datascope details req object
   */
  public saveUpdateDataScope(dataScopeReq: SchemaVariantReq): Observable<any> {
    return this.http.post<any>(this.endpointService.saveUpdateDataScopeUrl(), dataScopeReq);
  }

  public getDataScopeCount(moduleId: string, filterCriteria): Observable<any> {
    return this.http.post<any>(this.endpointService.getDataScopeCount(moduleId), filterCriteria);
  }

  /**
   * function to POST Api call for create/update schema check-data
   * @param checkDataObject: Object having check data details
   */
  public createUpdateCheckData(checkDataObject): Observable<string> {
    return this.http.post<string>(this.endpointService.createUpdateCheckDataUrl(), checkDataObject);
  }

  /**
   * function to GET Api call to get schema check-data
   * @param schemaId: Id of schema
   */
  public getCheckData(schemaId: string): Observable<CheckDataResponse> {
    return this.http.get<CheckDataResponse>(this.endpointService.getCheckDataUrl(schemaId));
  }

  /**
   * function to POST Api call to create business rule for saving brs into check data.
   * @param brRequest: req object contains business rule info.
   */
  public createCheckDataBusinessRule(brRequest: CoreSchemaBrInfo): Observable<CoreSchemaBrInfo> {
    return this.http.post<CoreSchemaBrInfo>(this.endpointService.createCheckDataBusinessRuleUrl(), brRequest);
  }

  /**
   * function to GET Api call to get details for schema execution progress
   * @param schemaId: ID of schema for which details needed
   */
  public getSchemaExecutionProgressDetails(schemaId: string): Observable<SchemaExecutionProgressResponse> {
    return this.http.get<SchemaExecutionProgressResponse>(this.endpointService.schemaExecutionProgressDetailUrl(schemaId));
  }

  public getSchemaExecutionTree(
    moduleId: string,
    schemaId: string,
    variantId: string,
    plantCode: string,
    userId: string,
    requestStatus: string,
    selectedRules: string[]
  ) {
    return this.http.post<SchemaExecutionTree>(
      this.endpointService.getSchemaExecutionTree(moduleId, schemaId, variantId, plantCode, userId, requestStatus),
      selectedRules
    );
  }

  public getSchemaExecutionTreeV2(
    moduleId: string,
    schemaId: string,
    variantId: string,
    plantCode: string,
    userId: string,
    requestStatus: string,
    selectedRules: string[],
    filterCriteria: any
  ) {
    const body = {
      ruleSelected: selectedRules,
      filterCriteria,
    };

    return this.http.post<SchemaExecutionTree>(
      this.endpointService.getSchemaExecutionTreeV2(moduleId, schemaId, variantId, plantCode, userId, requestStatus),
      body
    );
  }

  public downloadExecutionDetailsByNodes(schemaId: string, status: string, nodes: string[], variantId: string): Observable<any> {
    return this.http.get<any>(this.endpointClassic.downloadExecutionDetailsByNodesUrl(schemaId, status, nodes, variantId));
  }

  /**
   * Call http to get the datasets list
   * @returns return the all available datasets list
   */
  public getAllDataSets(): Observable<ModuleInfo[]> {
    return this.http.get<ModuleInfo[]>(this.endpointService.getAllDataSets());
  }

  /**
   * Get all datasets and schemas ...
   * @returns the module along with schema [0] for module and [1] for schemas
   */
  public getDatasetsAlongWithSchemas(): Observable<any> {
    // const datasetsHttp = this.http.get<ModuleInfo[]>(this.endpointService.getAllDataSets());
    return this.http.get<SchemaListModuleList[]>(this.endpointService.getSchemaListByGroupIdUrl());
  }

  /**
   * call http and get all selected or unselected fields based on the parameters
   * @returns the Observable of SchemaTableViewDto
   */
  public getallFieldsbynodeId(
    nodeType: SchemaExecutionNodeType,
    nodeIds: string,
    schemaId: string,
    variantId: string,
    fetchCount: any,
    searchString: string,
    selected: any
  ): Observable<SchemaTableViewDto> {
    fetchCount = fetchCount ? fetchCount : 0;
    searchString = searchString ? searchString : '';
    selected = selected ? selected : false;
    return this.http.get<SchemaTableViewDto>(this.endpointService.getallFieldsbynodeId(), {
      params: { nodeType, nodeIds, schemaId, variantId, fetchCount, searchString, selected },
    }).pipe(map((data) => {
      return this.any2tsService.any2FieldsList(data);
    }));
  }

  /**
   * Get all the active business rule in schema based on last run
   * @param schemaId schema id for get the rules
   * @returns the list of CoreSchemaBrInfo
   */
  public getBuisnessRulesBasedOnRun(schemaId: string, searchString: string): Observable<CoreSchemaBrInfo[]> {
    return this.http.post<CoreSchemaBrInfo[]>(
      this.endpointService.getBuisnessRulesBasedOnRunUrl(),
      { searchString, from: 0, size: 10 },
      { params: { schemaId } }
    );
  }

  /**
   * Cancle the schema ....
   * @param schemaId canncle the schema based on this schema id
   * @returns the obserable as a response
   */
  public cancleSchema(schemaId: string): Observable<any> {
    return this.http.get(this.endpointService.cancleSchemaUri(), { params: { schemaId } });
  }

  /**
   * Get all the transformation rules ...
   * @param moduleId filter on based on module id
   * @param from help for scrolling
   * @param size how many rec at a time
   * @param searchString filter the rules based on this params
   * @returns the CoreSchemaBrInfo[] rules
   */
  public transformationRules(moduleId: string, from: any, size: any, searchString: string): Observable<CoreSchemaBrInfo[]> {
    searchString = searchString ? searchString : '';
    return this.http.post<CoreSchemaBrInfo[]>(
      this.endpointService.transformationRules(),
      { from, size, searchString },
      { params: { moduleId } }
    );
  }

  /**
   * Get all mapped transformation rule inside the mail rule
   * @param from use for pagination
   * @param size get the total rules
   * @param searchString search the rule based on this key
   * @returns all the transformation rule inside the main rule
   */
  public getMappedTransformationRules(
    ruleId: string,
    schemaId: string,
    from: any,
    size: any,
    searchString: string
  ): Observable<TransformationMappingResponse> {
    searchString = searchString ? searchString : '';
    return this.http.post<TransformationMappingResponse>(
      this.endpointService.getMappedTransformationRulesUrl(),
      { from, size, searchString },
      { params: { ruleId, schemaId } }
    );
  }

  /**
   * Get global counts such as success, error and skipped for schema
   * @param schemaId Selected schemaId
   * @returns global counts for particular schema
   */
  public getSchemaGlobalCounts(schemaId: string): Observable<GlobalCounts> {
    return this.http.get<GlobalCounts>(this.endpointService.getSchemaGlobalCounts(), { params: { schemaId: schemaId || '' } });
  }

  /**
   * Get the all apis rules based on moduleid and searchString ...
   * @param moduleId rules based on this moduleid
   * @param searchString filter based on this search string ...
   * @param from the page  from
   * @param size the page size
   * @returns will return the ApiRulesInfo[]
   */
  public getApisRule(moduleId: string, searchString: string, from: any, size: any, prefer: string): Observable<ApiRulesInfo[]> {
    searchString = searchString ? searchString : '';
    prefer = prefer ? prefer : '';
    return this.http.get<ApiRulesInfo[]>(this.endpointClassic.getApisRulesUrl(), {
      params: { moduleId, searchString, from, size, prefer },
    });
  }

  public getCheckCodeList(searchString?: string): Observable<Array<CheckCodeModel>> {
    return this.http
      .get<Array<any>>(this.endpointService.getCheckCodeListURL(), {
        params: {
          searchString,
        },
      })
      .pipe(
        map((data) => {
          return this.any2tsService.getCheckCodeList(data);
        })
      );
  }

  public getTargetSystemList(): Observable<Array<TargetSystemModel>> {
    return this.http.get<Array<TargetSystemModel>>(this.endpointService.getTargetSystems());
  }

  public saveCheckCode(checkCode: CheckCodeModel): Observable<any> {
    let tenantId = '0';
    try {
      tenantId = JSON.parse(JSON.parse(atob(localStorage.getItem('JWT-TOKEN').split('.')[1])).sub).tenantCode;
    } catch (e) {}
    return this.http.post<CheckCodeModel>(this.endpointService.getSaveCheckCodeURL(), {
      ...checkCode,
      checkCodeKey: {
        code: checkCode.code,
        tenantId,
      },
    });
  }

  /**
   * Export Schema by Schema ID
   * @param schemaId Schema ID
   */
  public exportSchema(schemaId: string): Observable<boolean> {
    return this.http.get<boolean>(this.endpointService.exportSchema(schemaId));
  }

  /**
   * Get the schema list based on filter criteria ...
   * @param filter criteria for get the schema / diw list
   * @returns will return Observable of DiwListDataSource[]
   */
  public diwList(filter: SchemaListReq): Observable<DiwListDataSourceResponse> {
    return this.http.post<DiwListDataSourceResponse>(this.endpointService.diwListUrl(), filter);
  }

  public getDiwDataset(filter: SchemaListReq): Observable<ObjectTypeResponse[]> {
    return this.http.post<DiwListDataSourceResponse>(this.endpointService.diwListUrl(), filter).pipe(map((data) =>{
      return this.any2tsService.any2ObjectTypeResponse(data);
    }));
  }

  /**
   * Get the schema tabs history based on user oppend
   * @returns will return the Observable of SchemaTabHistory
   */
  public getSchemaTabHistory(): Observable<SchemaTabHistory[]> {
    return this.http.get<SchemaTabHistory[]>(this.endpointService.getSchemaTabHistoryUrl());
  }

  public saveSchemaTabHistory(req: SchemaTabHistory[]): Observable<SchemaTabHistory[]> {
    return this.http.post<SchemaTabHistory[]>(this.endpointService.saveSchemaTabHistoryUrl(), req);
  }

  public conditionSheetStatusChange() {
    return this.isConditionSheetClose.asObservable();
  }

  public conditionSideSheetDataFunc() {
    return this.conditionSideSheetData.asObservable();
  }

  public descriptionSettingFields() {
    return this.currentDescFieldValues.asObservable();
  }

  public createUpdateBr(classicReq: CoreSchemaBrInfo): Observable<string> {
    return this.http.post<string>(this.endpointService.createUpdateBr(), classicReq);
  }

  public createUpdateCrossDatasetRule(payload, scenarioId) {
    return this.http.post<string>(this.endpointService.createUpdateCrossDatasetRule(scenarioId), payload);
  }

  getDropdownOfPickList(moduleId: string, fieldId: string, lang: string, bodyarray) {
    return this.http.post<any>(this.endpointService.getDropdownofPickListUrl(moduleId, fieldId, lang), bodyarray)
  }
}
