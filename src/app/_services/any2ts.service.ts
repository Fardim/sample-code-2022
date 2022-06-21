import { Injectable } from '@angular/core';
import { PermissionOn, UserMdoModel } from '@models/collaborator';
import { CheckCodeModel, DropDownValue } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import * as moment from 'moment';
import {
  CategoriesList, GetAllSchemabymoduleidsRes, ObjectTypeResponse, SchemaGroupCountResponse, SchemaGroupDetailsResponse, SchemaGroupMapping, SchemaGroupResponse, SchemaGroupWithAssignSchemas, SchemaListOnLoadResponse, WorkflowPath, WorkflowResponse
} from '../_models/schema/schema';
import {
  CategoryChartData, CategoryChartDataSet, CategoryChartDataXY, CategoryInfo, DataTableHeaderResponse,
  DataTableHeaderValueLang, DataTableResponse, DataTableSourceResponse, Heirarchy, MetadataModel, MetadataModeleResponse, OverViewChartData, OverViewChartDataSet, OverViewChartDataXY, RequestForSchemaDetailsWithBr, ResponseFieldList, SchemaDataTableColumnInfoResponse, SchemaTableData
} from '../_models/schema/schemadetailstable';
import {
  BusinessRuleExecutionDetails, CategoriesResponse,
  DependencyResponse, SchemaBrInfoList, SchemaListDetails, SchemaListModuleList,
  SchemaModuleList, SchemaVariantResponse, VariantAssignedFieldDetails, VariantDetailsScheduleSchema, VariantFieldList, VariantListDetails
} from '../_models/schema/schemalist';
import { AssignedRoles, Userdetails } from '../_models/userdetails';
@Injectable({
  providedIn: 'root',
})
export class Any2tsService {
  constructor() { }

  public anyToSchemaListOnLoadResponse(data: any): SchemaListOnLoadResponse {
    const schema: SchemaListOnLoadResponse = new SchemaListOnLoadResponse();
    schema.connection = data.connection;
    schema.isDataInsight = data.isDataInsight;
    schema.moduleList = data.moduleList;
    schema.moduleOrdr = data.moduleOrdr;
    schema.plantCode = data.plantCode;
    schema.roleId = data.roleId;
    schema.userId = data.userId;
    return schema;
  }

  public any2CategoriesList(list) {
    const categories: CategoriesList[] = [];
    list.forEach((ls) => {
      const cts: CategoriesList = new CategoriesList();
      cts.categoryId = ls.categoryId;
      cts.categoryDesc = ls.categoryDesc;
      cts.plantCode = ls.plantCode;
      cts.businessRules = [];
      categories.push(cts);
    });
    return categories;
  }

  public any2SchemaGroupResponse(response: any): SchemaGroupResponse[] {
    const schemaGroups: SchemaGroupResponse[] = [];
    response.forEach((grp) => {
      const schemaGroupResponse: SchemaGroupResponse = new SchemaGroupResponse();
      schemaGroupResponse.groupId = grp.groupId;
      schemaGroupResponse.groupName = grp.groupDescription;
      schemaGroupResponse.isEnable = grp.isEnable ? grp.isEnable : false;
      schemaGroupResponse.objectIds = grp.objectId ? grp.objectId.split(',') : '';
      schemaGroupResponse.plantCode = grp.plantCode;
      schemaGroupResponse.updateDate = grp.updateDate;

      const schemaGroupCountResponse: SchemaGroupCountResponse = new SchemaGroupCountResponse();
      schemaGroupCountResponse.total = grp.total ? grp.total : 0;
      schemaGroupCountResponse.error = grp.error ? grp.error : 0;
      schemaGroupCountResponse.duplicate = grp.duplicate ? grp.duplicate : 0;
      schemaGroupCountResponse.success = grp.success ? grp.success : 0;
      schemaGroupCountResponse.skipped = grp.skipped ? grp.skipped : 0;
      schemaGroupCountResponse.outdated = grp.outdated ? grp.outdated : 0;
      schemaGroupCountResponse.correctionValue = grp.correctionValue ? grp.correctionValue : 0;
      schemaGroupCountResponse.successTrendValue = grp.successTrendValue ? grp.successTrendValue : 0;
      schemaGroupCountResponse.errorTrendValue = grp.errorTrendValue ? grp.errorTrendValue : 0;
      schemaGroupCountResponse.errorPercentage = grp.errorPercentage ? grp.errorPercentage : 0;
      schemaGroupCountResponse.successPercentage = grp.successPercentage ? grp.successPercentage : 0;
      schemaGroupCountResponse.exeStartDate = grp.exeStartDate ? grp.exeStartDate : '';
      schemaGroupCountResponse.exeEndDate = grp.exeEndDate ? grp.exeEndDate : '';
      schemaGroupResponse.runCount = schemaGroupCountResponse;
      schemaGroups.push(schemaGroupResponse);
    });
    return schemaGroups;
  }

  public any2VariantFieldList(response: any): VariantFieldList[] {
    const returnFldList: VariantFieldList[] = [];
    response.forEach((element) => {
      const variantFldLst: VariantFieldList = new VariantFieldList();
      variantFldLst.fieldId = element.fieldId;
      variantFldLst.dataType = element.dataType;
      variantFldLst.shortText = element.shortText;
      returnFldList.push(variantFldLst);
    });
    return returnFldList;
  }
  public any2SchemaVariantResponse(response: any): SchemaVariantResponse[] {
    const orderVariantList = response.orderVariantList;
    const schemaVariantRes: SchemaVariantResponse[] = [];
    orderVariantList.forEach((element) => {
      schemaVariantRes.push(this.convertSchemaVariantResponseToSchemaVRes(element, response));
    });
    return schemaVariantRes;
  }
  private convertSchemaVariantResponseToSchemaVRes(dataFor: string, response: any): SchemaVariantResponse {
    const schemaVariant: SchemaVariantResponse = new SchemaVariantResponse();
    response = response.variants;
    if (response !== undefined) {
      for (const key in response) {
        if (key.startsWith(dataFor)) {
          schemaVariant.name = response[dataFor];
          schemaVariant.error = response[dataFor + '_error'];
          schemaVariant.success = response[dataFor + '_sucs'];
          schemaVariant.total = response[dataFor + '_total'];
          schemaVariant.lastExecutionDate = response[dataFor + '_exec'];
          schemaVariant.schemaVariantId = dataFor;
          if (schemaVariant.total !== undefined && schemaVariant.total > 0) {
            schemaVariant.successPercentage = (schemaVariant.success * 100) / schemaVariant.total;
            schemaVariant.errorPercentage = (schemaVariant.error * 100) / schemaVariant.total;
          } else {
            schemaVariant.successPercentage = 0;
            schemaVariant.errorPercentage = 0;
          }
        }
      }
    }
    return schemaVariant;
  }

  public any2SchemaDataTableResponse(response: any): SchemaDataTableColumnInfoResponse {
    const resData: SchemaDataTableColumnInfoResponse = new SchemaDataTableColumnInfoResponse();
    if (response !== undefined) {
      resData.categoryData = response.categoryData;
      resData.categoryDataScs = response.categoryDataScs;
      resData.categoryType = response.categoryType;
      resData.fieldOrder = response.fieldOrder;
      const fldArrayList: ResponseFieldList[] = [];
      response.fieldList.forEach((element) => {
        fldArrayList.push(this.getResponseFieldList(element));
      });
      resData.fieldList = fldArrayList;
    }
    return resData;
  }
  private getResponseFieldList(data): ResponseFieldList {
    const resFldList: ResponseFieldList = new ResponseFieldList();
    resFldList.dataType = data.dataType ? data.dataType : '';
    resFldList.editable = data.editable ? data.editable : false;
    resFldList.hidden = data.hidden ? data.hidden : false;
    resFldList.index = data.index;
    resFldList.label = data.label;
    resFldList.name = data.name;
    resFldList.picklist = data.picklist ? data.picklist : '';
    resFldList.width = data.width;
    return resFldList;
  }
  public any2SchemaBrInfoList(response): SchemaBrInfoList[] {
    const schemaBrInfoLst: SchemaBrInfoList[] = [];
    const selectedBrData: any = response.selectedBrData;
    const unselectedBrData: any = response.unselectedBrData;
    if (selectedBrData) {
      selectedBrData.forEach((serverData) => {
        const schmBrLst: SchemaBrInfoList = new SchemaBrInfoList();
        schmBrLst.brDescription = serverData.brDescription;
        schmBrLst.brId = serverData.brId;
        schmBrLst.brType = serverData.brType;
        schmBrLst.dynamicMessage = serverData.dynamicMessage;
        schmBrLst.fields = serverData.fields;
        schmBrLst.refId = serverData.refId;
        schmBrLst.schemaId = serverData.schemaId;
        schmBrLst.schemaOrder = serverData.schemaOrder;
        schmBrLst.isAssigned = true;
        schemaBrInfoLst.push(schmBrLst);
      });
    }
    if (unselectedBrData) {
      unselectedBrData.forEach((serverData) => {
        const schmBrLst: SchemaBrInfoList = new SchemaBrInfoList();
        schmBrLst.brDescription = serverData.brDescription;
        schmBrLst.brId = serverData.brId;
        schmBrLst.brType = serverData.brType;
        schmBrLst.dynamicMessage = serverData.dynamicMessage;
        schmBrLst.fields = serverData.fields;
        schmBrLst.refId = serverData.refId;
        schmBrLst.schemaId = serverData.schemaId;
        schmBrLst.schemaOrder = serverData.schemaOrder;
        // schmBrLst.isAssigned = false;
        schemaBrInfoLst.push(schmBrLst);
      });
    }
    return schemaBrInfoLst;
  }
  public any2CategoriesResponse(response): CategoriesResponse[] {
    const returnData: CategoriesResponse[] = [];
    if (response && response.hasOwnProperty('CATEGORIES')) {
      const data = response.CATEGORIES;
      data.forEach((resData) => {
        const catData: CategoriesResponse = new CategoriesResponse();
        catData.categoryDesc = resData.categoryDesc;
        catData.categoryId = resData.categoryId;
        catData.plantCode = resData.plantCode;
        returnData.push(catData);
      });
    }
    return returnData;
  }
  public any2DependencyResponse(response: any): DependencyResponse[] {
    const returnData: DependencyResponse[] = [];
    if (response && response.hasOwnProperty('referenceDrop')) {
      const data: any = response.referenceDrop;
      data.forEach((resData) => {
        const depData: DependencyResponse = new DependencyResponse();
        depData.id = resData.id;
        depData.value = resData.value;
        returnData.push(depData);
      });
    }
    return returnData;
  }
  public any2VariantDetailsScheduleSchema(response: any): VariantDetailsScheduleSchema[] {
    const returnData: VariantDetailsScheduleSchema[] = [];
    if (response && response.hasOwnProperty('data')) {
      const vData: any = response.data;
      vData.forEach((data) => {
        const reData: VariantDetailsScheduleSchema = new VariantDetailsScheduleSchema();
        reData.variantId = data.variantId;
        reData.variantDesc = data.variantName;
        returnData.push(reData);
      });
    }
    return returnData;
  }

  public any2VariantAssignedFieldDetails(response: any): VariantAssignedFieldDetails[] {
    const returnData: VariantAssignedFieldDetails[] = [];
    if (response && response.hasOwnProperty('data')) {
      const fldData: any = response.data;
      fldData.forEach((fData) => {
        const reData: VariantAssignedFieldDetails = new VariantAssignedFieldDetails();
        reData.fieldId = fData.fieldId;
        reData.fieldDesc = fData.fieldDesc;
        reData.value = fData.value;
        returnData.push(reData);
      });
    }
    return returnData;
  }
  public any2SchemaDetails(response: any): SchemaGroupDetailsResponse {
    const schemaDetsails: SchemaGroupDetailsResponse = new SchemaGroupDetailsResponse();
    if (response) {
      schemaDetsails.createdDate = response.updatedDate;
      schemaDetsails.groupId = response.groupId;
      schemaDetsails.groupName = response.groupName;
      schemaDetsails.isEnable = response.isEnable;
      schemaDetsails.objectIds = response.objectId ? response.objectId.split(',') : [];
    }
    return schemaDetsails;
  }

  public any2UserDetails(response: Array<any>): Userdetails {
    const userDetails: Userdetails = new Userdetails();
    const userDetailsResponse = response[0] || {};
    const personalDetailsResponse = response[1] || {};
    const combinedResponse = {...userDetailsResponse, ...personalDetailsResponse};
    if (combinedResponse) {
      userDetails.userName = combinedResponse.userName || combinedResponse.userId;
      userDetails.firstName = combinedResponse.fname;
      userDetails.lastName = combinedResponse.lname;
      userDetails.email = combinedResponse.email;
      userDetails.plantCode = combinedResponse.tenantId || '0';
      userDetails.currentRoleId = combinedResponse && combinedResponse.roles && combinedResponse.roles.length>0?combinedResponse.roles[0]:null;
      userDetails.dateformat = combinedResponse.dateFormat ? combinedResponse.dateFormat : null;
      userDetails.fullName = combinedResponse.fullName ? combinedResponse.fullName : null;
      userDetails.orgId = combinedResponse.orgIdStr || '0';
      userDetails.hasAdminAccess = combinedResponse.hasAdminAccess || false;
      // eslint-disable-next-line @typescript-eslint/dot-notation
      userDetails['userId'] = combinedResponse.userId;
      const assignedRoles: AssignedRoles[] = [];
      if (combinedResponse.userMultiRoleModels) {
        combinedResponse.userMultiRoleModels.forEach((role) => {
          const assignedRole: AssignedRoles = new AssignedRoles();
          assignedRole.defaultRole = role.defaultRole;
          assignedRole.roleDesc = role.roleDesc;
          assignedRole.roleId = role.roleId;
          assignedRole.sno = role.sno;
          assignedRole.userId = role.userId;
          assignedRoles.push(assignedRole);
        });
      }
      userDetails.assignedRoles = assignedRoles;
      userDetails.selfServiceUserModel = combinedResponse.selfServiceUserModel;
      userDetails.defLocs = combinedResponse.defLocs ? combinedResponse.defLocs : [];
    }
    return userDetails;
  }

  public any2SchemaGroupCountResposne(response: any): SchemaGroupCountResponse {
    const schemaGroupCountResponse: SchemaGroupCountResponse = new SchemaGroupCountResponse();
    schemaGroupCountResponse.total = response.total ? response.total : 0;
    schemaGroupCountResponse.error = response.error ? response.error : 0;
    schemaGroupCountResponse.duplicate = response.duplicate ? response.duplicate : 0;
    schemaGroupCountResponse.success = response.success ? response.success : 0;
    schemaGroupCountResponse.skipped = response.skipped ? response.skipped : 0;
    schemaGroupCountResponse.outdated = response.outdated ? response.outdated : 0;
    return schemaGroupCountResponse;
  }

  public any2ObjectType(response: any): ObjectTypeResponse[] {
    const objectTypeList: ObjectTypeResponse[] = [];
    response.forEach((objType) => {
      const objecttype: ObjectTypeResponse = new ObjectTypeResponse();
      objecttype.objectdesc = objType.objectDecsription;
      objecttype.objectid = objType.objectId;
      objectTypeList.push(objecttype);
    });
    return objectTypeList;
  }

  public any2GetAllSchemabymoduleidsResponse(resposne: any): GetAllSchemabymoduleidsRes[] {
    const getAllSchemaList: GetAllSchemabymoduleidsRes[] = [];
    resposne.forEach((schema) => {
      const schemaRes: GetAllSchemabymoduleidsRes = new GetAllSchemabymoduleidsRes();
      schemaRes.discription = schema.discription;
      schemaRes.moduleId = schema.moduleId;
      schemaRes.schemaId = schema.schemaId;
      getAllSchemaList.push(schemaRes);
    });
    return getAllSchemaList;
  }

  public any2DropValues(response: any, fieldId: string): DropDownValue[] {
    let res: DropDownValue[] = [];
    if (response && response.content) {
      res = response.content;
      res.map((val) => {
        val.CODE = val.CODE || val.code;
        val.code = val.CODE || val.code;
        val.TEXT = val.TEXT || val.text;
        val.text = val.TEXT || val.text;
        val.FIELDNAME = fieldId;
      });
    }

    return res;
  }

  public any2SchemaGroupWithAssignSchemasResponse(response: any): SchemaGroupWithAssignSchemas {
    const schemaGrpRes: SchemaGroupWithAssignSchemas = new SchemaGroupWithAssignSchemas();
    schemaGrpRes.groupId = response.groupId;
    schemaGrpRes.groupName = response.groupName;
    schemaGrpRes.objectId = response.objectIds ? response.objectIds : [];
    schemaGrpRes.schemaGroupMappings = [];
    response.schemaGroupMappings.forEach((grpMapping) => {
      const schemaGrpMapping: SchemaGroupMapping = new SchemaGroupMapping();
      schemaGrpMapping.schemaGroupId = grpMapping.schemaGroupId;
      schemaGrpMapping.schemaId = grpMapping.schemaId;
      schemaGrpMapping.updatedDate = grpMapping.updateDate;
      schemaGrpRes.schemaGroupMappings.push(schemaGrpMapping);
    });
    return schemaGrpRes;
  }

  public any2SchemaListView(response: any): SchemaListModuleList[] {
    const schemaListView: SchemaListModuleList[] = [];
    const moduleData: SchemaModuleList[] = [];
    response.forEach((schemas) => {
      if (moduleData.filter((module) => module.moduleId === schemas.moduleId).length <= 0) {
        const schemaModuleList: SchemaModuleList = new SchemaModuleList();
        schemaModuleList.moduleId = schemas.moduleId;
        schemaModuleList.moduleDescription = schemas.moduleDescription;
        moduleData.push(schemaModuleList);
      }
    });
    moduleData.forEach((module) => {
      const schemaLstView: SchemaListModuleList = new SchemaListModuleList();
      schemaLstView.moduleId = module.moduleId;
      schemaLstView.moduleDesc = module.moduleDescription;
      const schamaListDetails: SchemaListDetails[] = [];
      const schemaData = response.filter((res) => res.moduleId === module.moduleId);
      schemaData.forEach((schema) => {
        const schemaDetail: SchemaListDetails = new SchemaListDetails();
        schemaDetail.createdBy = schema.createdBy;
        schemaDetail.errorCount = schema.errorValue ? schema.errorValue : 0;
        schemaDetail.errorPercentage = schema.errorPercentage ? schema.errorPercentage : 0;
        schemaDetail.schemaDescription = schema.schemaDescription;
        schemaDetail.schemaId = schema.schemaId;
        schemaDetail.successCount = schema.successValue ? schema.successValue : 0;
        schemaDetail.successPercentage = schema.successPercentage ? schema.successPercentage : 0;
        schemaDetail.totalCount = schema.totalValue ? schema.totalValue : 0;
        schemaDetail.skippedValue = schema.skippedValue ? schema.skippedValue : 0;
        schemaDetail.correctionValue = schema.correctionValue ? schema.correctionValue : 0;
        schemaDetail.duplicateValue = schema.duplicateValue ? schema.duplicateValue : 0;
        schemaDetail.totalUniqueValue = schema.totalUniqueValue ? schema.totalUniqueValue : 0;
        schemaDetail.successUniqueValue = schema.successUniqueValue ? schema.successUniqueValue : 0;
        schemaDetail.errorUniqueValue = schema.errorUniqueValue ? schema.errorUniqueValue : 0;
        schemaDetail.skippedUniqueValue = schema.skippedUniqueValue ? schema.skippedUniqueValue : 0;
        schemaDetail.successTrendValue = schema.successTrendValue ? schema.successTrendValue : 'N/A';
        schemaDetail.errorTrendValue = schema.errorTrendValue ? schema.errorTrendValue : 'N/A';
        schemaDetail.variantCount = schema.variantCount ? schema.variantCount : 0;
        schemaDetail.variantId = schema.variantId ? schema.variantId : null;
        schemaDetail.executionStartTime = schema.executionStartTime ? schema.executionStartTime : '';
        schemaDetail.executionEndTime = schema.executionEndTime ? schema.executionEndTime : '';
        schemaDetail.isInRunning = schema.isInRunning ? schema.isInRunning : false;
        schamaListDetails.push(schemaDetail);
      });
      schemaLstView.schemaLists = schamaListDetails;
      schemaListView.push(schemaLstView);
    });
    return schemaListView;
  }

  public any2SchemaDetailsWithCount(response: any): SchemaListDetails {
    const schemaDetail: SchemaListDetails = new SchemaListDetails();
    schemaDetail.createdBy = response.createdBy;
    schemaDetail.errorCount = response.errorValue ? response.errorValue : 0;
    schemaDetail.errorPercentage = response.errorPercentage ? response.errorPercentage : 0;
    schemaDetail.schemaDescription = response.schemaDescription;
    schemaDetail.schemaId = response.schemaId;
    schemaDetail.successCount = response.successValue ? response.successValue : 0;
    schemaDetail.successPercentage = response.successPercentage ? response.successPercentage : 0;
    schemaDetail.totalCount = response.totalValue ? response.totalValue : 0;
    schemaDetail.skippedValue = response.skippedValue ? response.skippedValue : 0;
    schemaDetail.correctionValue = response.correctionValue ? response.correctionValue : 0;
    schemaDetail.duplicateValue = response.duplicateValue ? response.duplicateValue : 0;
    schemaDetail.variantCount = response.variantCount ? response.variantCount : 0;
    schemaDetail.executionStartTime = response.executionStartTime ? response.executionStartTime : 0;
    schemaDetail.executionEndTime = response.executionEndTime ? response.executionEndTime : 0;
    schemaDetail.variantId = response.variantId ? response.variantId : '';
    schemaDetail.runId = response.runId ? response.runId : '';
    schemaDetail.brInformation = [];
    schemaDetail.isInRunning = response.isInRunning ? response.isInRunning : false;
    schemaDetail.moduleId = response.moduleId ? response.moduleId : false;
    schemaDetail.schemaThreshold = response.schemaThreshold && response.schemaThreshold !== 'null' ? response.schemaThreshold : 0;
    schemaDetail.collaboratorModels = response.collaboratorModels;
    schemaDetail.moduleDescription = response.moduleDescription;
    schemaDetail.schemaCategory = response.schemaCategory ? response.schemaCategory : 'DATAQUALITY_VIEW';

    if (response.brInformation) {
      response.brInformation.forEach((br) => {
        const brInfo: BusinessRuleExecutionDetails = new BusinessRuleExecutionDetails();
        brInfo.brId = br.brId ? br.brId : '';
        brInfo.duplicate = br.duplicate ? br.duplicate : 0;
        brInfo.error = br.error ? br.error : 0;
        brInfo.outdated = br.outdated ? br.outdated : 0;
        brInfo.skipped = br.skipped ? br.skipped : 0;
        brInfo.success = br.success ? br.success : 0;
        schemaDetail.brInformation.push(brInfo);
      });
    }
    return schemaDetail;
  }

  /**
   * Help this method for convert any to schema datatable response
   */
  public any2DataTable(response: any, request: RequestForSchemaDetailsWithBr): DataTableResponse[] {
    const dataTableReponse: DataTableResponse[] = [];
    if (response) {
      response.forEach((data) => {
        // get  objectNumber , headers , grids and hierary
        const objNum = data.id;
        const gvs = data.gvs;
        const hdvs = data.hdvs;
        const hyvs = data.hyvs;
        const _score = data._score ? data._score : data._score;
        const isOutdated = data._outdated && data._outdated === 'true' ? true : false;

        // get hits
        // let status = new Set<string>();
        // Object.keys(data.hits).forEach(index => {
        //   if(request.requestStatus && request.requestStatus.toLocaleLowerCase() === 'success') {
        //     status.add('Success');
        //   } else if (request.requestStatus && request.requestStatus.toLocaleLowerCase() === 'error') {
        //     status.add('Error');
        //   } else {
        //     // if (index.indexOf('_do_br_err_') >= 0) {
        //     //   _score += data.hits[index]._score;
        //     // } else if (index.indexOf('_do_br_scs_') >= 0) {
        //     //   _score += data.hits[index]._score;
        //     // } else if (index.indexOf('_do_br_skp_') >= 0) {
        //     //   _score += data.hits[index]._score;
        //     // } else if (index.indexOf('_do_br_cor_') >= 0) {
        //     //   _score += data.hits[index]._score;
        //     // }
        //   }
        //   if(_score<1.0) {
        //     _score += data.hits[index]._score;
        //   }

        // });

        const hit: DataTableResponse = new DataTableResponse();
        hit.hdvs = this.convertAny2DataTableHeaderResponse(hdvs);
        if (request.gridId) {
          hit.gvs = this.convertAny2DataTableGridResponse(gvs, request.gridId);
        }
        if (request.hierarchy) {
          hit.hyvs = this.convertAny2DataTableHeirerchyResponse(hyvs, request.hierarchy);
        }

        // check error index is exits then hit from error index
        // const errorIndexLen = Object.keys(data.hits).filter(index => index.indexOf('_do_br_err_') !== -1);
        // if (errorIndexLen.length > 0) {
        //   const index = errorIndexLen[0];
        //   hit.hdvs = this.convertAny2DataTableHeaderResponse(data.hits[index].hdvs);
        //   if (request.gridId) {
        //     hit.gvs = this.convertAny2DataTableGridResponse(data.hits[index].gvs, request.gridId);
        //   }
        //   if (request.hierarchy) {
        //     hit.hyvs = this.convertAny2DataTableHeirerchyResponse(data.hits[index].hyvs, request.hierarchy);
        //   }
        //   isOutdated =  data.hits[index]._outdated;
        // } else {
        //   const index = Object.keys(data.hits)[0];
        //   hit.hdvs = this.convertAny2DataTableHeaderResponse(data.hits[index].hdvs);
        //   if (request.gridId) {
        //     hit.gvs = this.convertAny2DataTableGridResponse(data.hits[index].gvs, request.gridId);
        //   }
        //   if (request.hierarchy) {
        //     hit.hyvs = this.convertAny2DataTableHeirerchyResponse(data.hits[index].hyvs, request.hierarchy);
        //   }
        //   isOutdated =  data.hits[index]._outdated;
        // }

        hit.id = objNum;
        // while click on all tab
        const status = new Set<string>();
        if (request.requestStatus && request.requestStatus.toLocaleLowerCase() === 'all') {
          if (_score >= request.schemaThreshold / 100) {
            status.add('Success');
          } else {
            status.add('Error');
          }
        } else if (request.requestStatus && request.requestStatus.toLocaleLowerCase() === 'success') {
          status.add('Success');
        } else if (request.requestStatus && request.requestStatus.toLocaleLowerCase() === 'error') {
          status.add('Error');
        }
        if (isOutdated) {
          status.add('Outdated');
        }
        hit.stat = Array.from(status);
        hit._score = String(_score * 100);
        dataTableReponse.push(hit);
      });
    }
    return dataTableReponse;
  }

  private convertAny2DataTableHeaderResponse(response: any): DataTableHeaderResponse[] {
    const dataTableHeaderResponse: DataTableHeaderResponse[] = [];
    if (response) {
      Object.keys(response).forEach((key) => {
        const dataTableHeader: DataTableHeaderResponse = new DataTableHeaderResponse();
        dataTableHeader.fId = response[key].fId;
        dataTableHeader.ls = response[key].ls;
        const vc: DataTableHeaderValueLang = new DataTableHeaderValueLang();
        if (response[key].vc) {
          vc.c = response[key].vc.map((map) => map.c).toString();
          vc.t = response[key].vc.map((map) => map.t).toString();
        }
        dataTableHeader.vc = vc;
        dataTableHeaderResponse.push(dataTableHeader);
      });
    }

    return dataTableHeaderResponse;
  }
  private convertAny2DataTableGridResponse(response: any, gridId: string[]): DataTableHeaderResponse[][] {
    const gridResponse: DataTableHeaderResponse[][] = [];
    if (response) {
      gridId.forEach((grid) => {
        if (response.hasOwnProperty(grid)) {
          const rows = response[grid].rows;
          rows.forEach((row) => {
            const griddataRow: DataTableHeaderResponse[] = [];
            Object.keys(row).forEach((key) => {
              const dataTableHeader: DataTableHeaderResponse = new DataTableHeaderResponse();
              dataTableHeader.fId = row[key].fId;
              dataTableHeader.ls = row[key].ls;
              const vc: DataTableHeaderValueLang = new DataTableHeaderValueLang();
              if (row[key].vc) {
                vc.c = row[key].vc.map((map) => map.c).toString();
                vc.t = row[key].vc.map((map) => map.t).toString();
              }
              dataTableHeader.vc = vc;
              griddataRow.push(dataTableHeader);
            });
            gridResponse.push(griddataRow);
          });
        }
      });
    }
    return gridResponse;
  }

  private convertAny2DataTableHeirerchyResponse(response: any, heirarchyId: string[]): DataTableHeaderResponse[][] {
    const gridResponse: DataTableHeaderResponse[][] = [];
    if (response) {
      heirarchyId.forEach((heiID) => {
        if (response.hasOwnProperty(heirarchyId)) {
          const rows = response[heiID].rows;
          rows.forEach((row) => {
            const griddataRow: DataTableHeaderResponse[] = [];
            Object.keys(row).forEach((key) => {
              const dataTableHeader: DataTableHeaderResponse = new DataTableHeaderResponse();
              dataTableHeader.fId = row[key].fId;
              dataTableHeader.ls = row[key].ls;
              const vc: DataTableHeaderValueLang = new DataTableHeaderValueLang();
              if (row[key].vc) {
                vc.c = row[key].vc.map((map) => map.c).toString();
                vc.t = row[key].vc.map((map) => map.t).toString();
              }
              dataTableHeader.vc = vc;
              griddataRow.push(dataTableHeader);
            });
            gridResponse.push(griddataRow);
          });
        }
      });
    }
    return gridResponse;
  }

  public any2SchemaTableData(response: DataTableResponse[], request: RequestForSchemaDetailsWithBr): DataTableSourceResponse {
    const finalResposne: DataTableSourceResponse = new DataTableSourceResponse();

    if (request.gridId.length > 0) {
      finalResposne.data = this.any2GridResponseData(response);
    }
    if (request.hierarchy.length > 0) {
      finalResposne.data = this.any2HeirerchyResponseData(response);
    }
    if (request.gridId.length <= 0 && request.hierarchy.length <= 0) {
      finalResposne.data = this.any2HeaderResponseData(response);
    }

    return finalResposne;
  }
  private any2HeaderResponseData(response: DataTableResponse[]): any[] {
    const anyArray: any[] = [];
    response.forEach((data) => {
      // for object number column
      const returnData: any = {} as any;
      const objNumberColumn: SchemaTableData = new SchemaTableData();
      objNumberColumn.fieldId = 'OBJECTNUMBER';
      objNumberColumn.fieldData = data.id;
      objNumberColumn.fieldDesc = 'Object Number';
      returnData[objNumberColumn.fieldId] = objNumberColumn;
      // anyArray.push(objNumberColumn);

      data.hdvs.forEach((hdvs) => {
        const schemaTableData: SchemaTableData = new SchemaTableData();
        schemaTableData.fieldId = hdvs.fId;
        schemaTableData.fieldDesc = hdvs.ls;
        schemaTableData.fieldData = hdvs.vc.t ? hdvs.vc.t : hdvs.vc.c;
        returnData[schemaTableData.fieldId] = schemaTableData;
        // anyArray.push(objNumberColumn);
      });

      // for status column
      const statusColumn: SchemaTableData = new SchemaTableData();
      statusColumn.fieldId = 'row_status';
      statusColumn.fieldData = data.stat ? data.stat.toString() : '';
      statusColumn.fieldDesc = 'Status';
      returnData[statusColumn.fieldId] = statusColumn;
      // anyArray.push(statusColumn);

      // for _score  column
      const _score: SchemaTableData = new SchemaTableData();
      _score.fieldId = '_score_weightage';
      _score.fieldData = data._score;
      _score.fieldDesc = 'Score';
      returnData[_score.fieldId] = _score;

      anyArray.push(returnData);
    });
    return anyArray;
  }

  private any2GridResponseData(response: DataTableResponse[]): any[] {
    const anyArray: any[] = [];
    response.forEach((data) => {
      if (data.gvs.length > 0) {
        data.gvs.forEach((gvs) => {
          // for object number column
          const returnData: any = {} as any;
          const objNumberColumn: SchemaTableData = new SchemaTableData();
          objNumberColumn.fieldId = 'OBJECTNUMBER';
          objNumberColumn.fieldData = data.id;
          objNumberColumn.fieldDesc = 'Object Number';
          returnData[objNumberColumn.fieldId] = objNumberColumn;
          // anyArray.push(objNumberColumn);

          data.hdvs.forEach((hdvs) => {
            const schemaTableData: SchemaTableData = new SchemaTableData();
            schemaTableData.fieldId = hdvs.fId;
            schemaTableData.fieldDesc = hdvs.ls;
            schemaTableData.fieldData = hdvs.vc.t ? hdvs.vc.t : hdvs.vc.c;
            returnData[schemaTableData.fieldId] = schemaTableData;
            // anyArray.push(objNumberColumn);
          });

          gvs.forEach((gv) => {
            const schemaTableData: SchemaTableData = new SchemaTableData();
            schemaTableData.fieldId = gv.fId;
            schemaTableData.fieldDesc = gv.ls;
            schemaTableData.fieldData = gv.vc.t ? gv.vc.t : gv.vc.c;
            returnData[schemaTableData.fieldId] = schemaTableData;
            // anyArray.push(objNumberColumn);
          });

          // for status column
          const statusColumn: SchemaTableData = new SchemaTableData();
          statusColumn.fieldId = 'row_status';
          statusColumn.fieldData = data.stat ? data.stat.toString() : '';
          statusColumn.fieldDesc = 'Status';
          returnData[statusColumn.fieldId] = statusColumn;
          // anyArray.push(statusColumn);

          // for _score  column
          const _score: SchemaTableData = new SchemaTableData();
          _score.fieldId = '_score_weightage';
          _score.fieldData = data._score;
          _score.fieldDesc = 'Score';
          returnData[_score.fieldId] = _score;

          anyArray.push(returnData);
        });
      } else {
        const returnData: any = {} as any;
        const objNumberColumn: SchemaTableData = new SchemaTableData();
        objNumberColumn.fieldId = 'OBJECTNUMBER';
        objNumberColumn.fieldData = data.id;
        objNumberColumn.fieldDesc = 'Object Number';
        returnData[objNumberColumn.fieldId] = objNumberColumn;
        // anyArray.push(objNumberColumn);

        data.hdvs.forEach((hdvs) => {
          const schemaTableData: SchemaTableData = new SchemaTableData();
          schemaTableData.fieldId = hdvs.fId;
          schemaTableData.fieldDesc = hdvs.ls;
          schemaTableData.fieldData = hdvs.vc.t ? hdvs.vc.t : hdvs.vc.c;
          returnData[schemaTableData.fieldId] = schemaTableData;
          // anyArray.push(objNumberColumn);
        });
        // for status column
        const statusColumn: SchemaTableData = new SchemaTableData();
        statusColumn.fieldId = 'row_status';
        statusColumn.fieldData = data.stat ? data.stat.toString() : '';
        statusColumn.fieldDesc = 'Status';
        returnData[statusColumn.fieldId] = statusColumn;
        // anyArray.push(statusColumn);

        // for _score  column
        const _score: SchemaTableData = new SchemaTableData();
        _score.fieldId = '_score_weightage';
        _score.fieldData = data._score;
        _score.fieldDesc = 'Score';
        returnData[_score.fieldId] = _score;

        anyArray.push(returnData);
      }
    });
    return anyArray;
  }

  private any2HeirerchyResponseData(response: DataTableResponse[]): any[] {
    const anyArray: any[] = [];
    response.forEach((data) => {
      if (data.hyvs.length > 0) {
        data.hyvs.forEach((hyv) => {
          // for object number column
          const returnData: any = {} as any;
          const objNumberColumn: SchemaTableData = new SchemaTableData();
          objNumberColumn.fieldId = 'OBJECTNUMBER';
          objNumberColumn.fieldData = data.id;
          objNumberColumn.fieldDesc = 'Object Number';
          returnData[objNumberColumn.fieldId] = objNumberColumn;
          // anyArray.push(objNumberColumn);

          data.hdvs.forEach((hdvs) => {
            const schemaTableData: SchemaTableData = new SchemaTableData();
            schemaTableData.fieldId = hdvs.fId;
            schemaTableData.fieldDesc = hdvs.ls;
            schemaTableData.fieldData = hdvs.vc.t ? hdvs.vc.t : hdvs.vc.c;
            returnData[schemaTableData.fieldId] = schemaTableData;
            // anyArray.push(objNumberColumn);
          });

          hyv.forEach((gv) => {
            const schemaTableData: SchemaTableData = new SchemaTableData();
            schemaTableData.fieldId = gv.fId;
            schemaTableData.fieldDesc = gv.ls;
            schemaTableData.fieldData = gv.vc.t ? gv.vc.t : gv.vc.c;
            returnData[schemaTableData.fieldId] = schemaTableData;
            // anyArray.push(objNumberColumn);
          });

          // for status column
          const statusColumn: SchemaTableData = new SchemaTableData();
          statusColumn.fieldId = 'row_status';
          statusColumn.fieldData = data.stat ? data.stat.toString() : '';
          statusColumn.fieldDesc = 'Status';
          returnData[statusColumn.fieldId] = statusColumn;
          // anyArray.push(statusColumn);

          // for _score  column
          const _score: SchemaTableData = new SchemaTableData();
          _score.fieldId = '_score_weightage';
          _score.fieldData = data._score;
          _score.fieldDesc = 'Score';
          returnData[_score.fieldId] = _score;

          anyArray.push(returnData);
        });
      } else {
        const returnData: any = {} as any;
        const objNumberColumn: SchemaTableData = new SchemaTableData();
        objNumberColumn.fieldId = 'OBJECTNUMBER';
        objNumberColumn.fieldData = data.id;
        objNumberColumn.fieldDesc = 'Object Number';
        returnData[objNumberColumn.fieldId] = objNumberColumn;
        // anyArray.push(objNumberColumn);

        data.hdvs.forEach((hdvs) => {
          const schemaTableData: SchemaTableData = new SchemaTableData();
          schemaTableData.fieldId = hdvs.fId;
          schemaTableData.fieldDesc = hdvs.ls;
          schemaTableData.fieldData = hdvs.vc.t ? hdvs.vc.t : hdvs.vc.c;
          returnData[schemaTableData.fieldId] = schemaTableData;
          // anyArray.push(objNumberColumn);
        });
        // for status column
        const statusColumn: SchemaTableData = new SchemaTableData();
        statusColumn.fieldId = 'row_status';
        statusColumn.fieldData = data.stat ? data.stat.toString() : '';
        statusColumn.fieldDesc = 'Status';
        returnData[statusColumn.fieldId] = statusColumn;
        // anyArray.push(statusColumn);

        // for _score  column
        const _score: SchemaTableData = new SchemaTableData();
        _score.fieldId = '_score_weightage';
        _score.fieldData = data._score;
        _score.fieldDesc = 'Score';
        returnData[_score.fieldId] = _score;

        anyArray.push(returnData);
      }
    });
    return anyArray;
  }

  public any2OverviewChartData(response): OverViewChartDataSet {
    const overViewChartDataSet: OverViewChartDataSet = new OverViewChartDataSet();
    const overViewChartData: OverViewChartData[] = [];
    if (response) {
      // for status success
      const successOverView: OverViewChartData = new OverViewChartData();
      successOverView.id = 'ERROR_OVERVIEW_ID';
      successOverView.type = 'line';
      successOverView.label = 'Error';
      successOverView.backgroundColor = 'rgba(249, 229, 229, 1)';
      successOverView.borderColor = 'rgba(195, 0, 0, 1)';
      successOverView.fill = false;
      successOverView.pointRadius = 5;
      successOverView.pointBackgroundColor = 'rgba(195, 0, 0, 1)';
      successOverView.data = this.getOverViewDataForXYAxis(response, 'ERROR');

      // for status error
      const errorOverview: OverViewChartData = new OverViewChartData();
      errorOverview.id = 'SUCCESS_OVERVIEW_ID';
      errorOverview.type = 'line';
      errorOverview.label = 'Success';
      errorOverview.backgroundColor = 'rgba(231, 246, 237, 1)';
      errorOverview.borderColor = 'rgba(18, 164, 74, 1)';
      errorOverview.fill = false;
      errorOverview.pointRadius = 5;
      errorOverview.pointBackgroundColor = 'rgba(18, 164, 74, 1)';
      errorOverview.data = this.getOverViewDataForXYAxis(response, 'SUCCESS');

      // for status skipped
      const skippedOverview: OverViewChartData = new OverViewChartData();
      skippedOverview.id = 'SKIPPED_OVERVIEW_ID';
      skippedOverview.type = 'line';
      skippedOverview.label = 'Skipped';
      skippedOverview.backgroundColor = 'rgba(246, 244, 249, 1)';
      skippedOverview.borderColor = 'rgba(163, 145, 197, 1)';
      skippedOverview.fill = false;
      skippedOverview.pointRadius = 5;
      skippedOverview.pointBackgroundColor = 'rgba(163, 145, 197, 1)';
      skippedOverview.data = this.getOverViewDataForXYAxis(response, 'SKIPPED');

      overViewChartData.push(successOverView);
      overViewChartData.push(errorOverview);
      overViewChartData.push(skippedOverview);
    }
    overViewChartDataSet.dataSet = overViewChartData;
    return overViewChartDataSet;
  }

  private getOverViewDataForXYAxis(response, type): OverViewChartDataXY[] {
    const xyAxis: OverViewChartDataXY[] = [];
    response.forEach((data) => {
      const xyData: OverViewChartDataXY = new OverViewChartDataXY();
      if (type === 'SUCCESS') {
        xyData.y = data.totalSuccess ? data.totalSuccess : 0;
      } else if (type === 'ERROR') {
        xyData.y = data.totalError ? data.totalError : 0;
      } else if (type === 'SKIPPED') {
        xyData.y = data.skipped ? data.skipped : 0;
      }
      if (data.exeEndDate) {
        xyData.x = moment(data.exeStrtDate).format('MM/DD/YYYY HH:mm');
        xyAxis.push(xyData);
      }
    });
    return xyAxis;
  }

  public any2CategoryInfo(response: any): CategoryInfo[] {
    const categoryInfoLst: CategoryInfo[] = [];
    response.forEach((data) => {
      const catData: CategoryInfo = new CategoryInfo();
      catData.categoryDesc = data.categoryDesc;
      catData.categoryId = data.categoryId;
      categoryInfoLst.push(catData);
    });
    return categoryInfoLst;
  }

  public any2UserDetailsV2(response: any): PermissionOn {
    const resp: PermissionOn = {
      groups: undefined,
      roles: undefined,
      users: []
    };

    const usersList = response?.userList?.content || [];
    if (usersList.length) {
      usersList.forEach((user) => {
        const userDetail: UserMdoModel = {
          userId: undefined,
          userName: user?.userName,
          fName: user?.fname || '',
          lName: user?.lname || '',
          fullName: '',
          email: user?.email
        };

        if (!userDetail.fName && !userDetail.lName) {
          userDetail.fName = userDetail.userName;
        }
        userDetail.fullName = userDetail.fName + (userDetail.lName ? ` ${userDetail.lName}` : '');

        resp.users.push(userDetail);
      });
    }

    return resp;
  }

  public any2SchemaStatus(response: any): string[] {
    const returnData: string[] = [];
    response.forEach((ele) => {
      returnData.push(ele);
    });
    return returnData;
  }

  public any2CategoryChartData(response: any): CategoryChartDataSet {
    const categoryChartDataSet: CategoryChartDataSet = new CategoryChartDataSet();
    if (response) {
      categoryChartDataSet.dataSet = this.categoryChartData(response.brExecutionDetails, response.schemaStatus);
      categoryChartDataSet.variantId = response.variantId;
      categoryChartDataSet.categoryDesc = response.categoryDesc;
      categoryChartDataSet.total = response.total ? response.total : 0;
    }
    return categoryChartDataSet;
  }

  private categoryChartData(response: any, status: string): CategoryChartData[] {
    const categoryChartDataLst: CategoryChartData[] = [];
    // find unique br ids
    const bridsArray = [];
    response.forEach((catData) => {
      const index = bridsArray.indexOf(catData.brId);
      if (index === -1) {
        bridsArray.push(catData.brId);
      }
    });
    bridsArray.forEach((br) => {
      const brData = response.filter((res) => res.brId === br);
      if (brData.length > 0) {
        const categoryChartData: CategoryChartData = new CategoryChartData();
        const brdesc = this.getBrDecs(br, brData);
        categoryChartData.id = status + '_' + br;
        categoryChartData.type = 'line';
        categoryChartData.label = brdesc;
        categoryChartData.backgroundColor = this.generateRandomRgba();
        categoryChartData.borderColor = this.generateRandomRgba();
        categoryChartData.fill = false;
        categoryChartData.pointRadius = 5;
        categoryChartData.pointBackgroundColor = this.generateRandomRgba();
        categoryChartData.data = this.getCategoryViewForXYAxis(brData, status);
        categoryChartData.total = this.getTotalForcategory(brData, status);
        categoryChartData.brDesc = brdesc;
        categoryChartDataLst.push(categoryChartData);
      }
    });
    return categoryChartDataLst;
  }
  private generateRandomRgba(): string {
    const o = Math.round;
    const r = Math.random;
    const s = 255;
    return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + r().toFixed(1) + ')';
  }

  private getBrDecs(brId: string, brList: any): string {
    return brList.filter((br) => br.brId === brId)[0].brDesc;
  }
  private getTotalForcategory(response, type): number {
    let total = 0;
    response.forEach((data) => {
      if (type === 'SUCCESS') {
        total += data.success ? data.success : 0;
      } else if (type === 'ERROR') {
        total += data.error ? data.error : 0;
      } else if (type === 'SKIPPED') {
        total += data.skipped ? data.skipped : 0;
      }
    });
    return total;
  }
  private getCategoryViewForXYAxis(response, type): CategoryChartDataXY[] {
    const xyAxis: CategoryChartDataXY[] = [];
    response.forEach((data) => {
      const xyData: CategoryChartDataXY = new CategoryChartDataXY();
      if (type === 'SUCCESS') {
        xyData.y = data.success ? data.success : 0;
      } else if (type === 'ERROR') {
        xyData.y = data.error ? data.error : 0;
      } else if (type === 'SKIPPED') {
        xyData.y = data.skipped ? data.skipped : 0;
      }
      if (data.executionEndTimestamp) {
        xyData.x = moment(data.executionStartTimestamp).format('MM/DD/YYYY HH:mm');
        xyAxis.push(xyData);
      }
    });
    return xyAxis;
  }

  public any2MetadataResponse(resposne: any): MetadataModeleResponse {
    const fldResposne: MetadataModeleResponse = { gridFields: null, headers: null, hierarchyFields: null, hierarchy: null, grids: null };
    if (resposne) {
      // header
      fldResposne.headers = resposne.headers as Map<string, MetadataModel>;
      fldResposne.grids = resposne.grids as Map<string, MetadataModel>;
      fldResposne.hierarchy = resposne.hierarchy as Heirarchy[];
      // fldResposne.gridFields = this.any2GridFields(resposne.gridFields);
      // fldResposne.hierarchyFields = this.any2HeirerchyFields(resposne.hierarchyFields);
      fldResposne.gridFields = resposne.gridFields as Map<string, Map<string, MetadataModel>>;
      fldResposne.hierarchyFields = resposne.hierarchyFields as Map<string, Map<string, MetadataModel>>;
    }
    return resposne;
  }

  public setMetadataDescription(response) {
    const finalRes = response;
    Object.keys(response).forEach((id) => {
      const finalResponse = response[id];
      const hierarchyList = [];
      // finalResponse.hierarchyDetails = finalResponse.hierarchy;
      // finalResponse.hierarchy = finalResponse.hierarchy[id] || [];

      if (finalResponse.headers && Object.keys(finalResponse.headers).length) {
        const keys = Object.keys(finalResponse.headers);
        keys.forEach((key) => {
          finalResponse.headers[key].fieldDescri = finalResponse.headers[key].fieldDescri || finalResponse.headers[key].description;
        });
      }

      if (finalResponse.grids && Object.keys(finalResponse.grids).length) {
        const keys = Object.keys(finalResponse.grids);
        keys.forEach((key) => {
          finalResponse.grids[key].fieldDescri = finalResponse.grids[key].fieldDescri || finalResponse.grids[key].description;
        });
      }

      if (finalResponse.hierarchy && Object.keys(finalResponse.hierarchy).length) {
        const keys = Object.keys(finalResponse.hierarchy);
        keys.forEach((key) => {
          finalResponse.hierarchy[key].fieldDescri = finalResponse.hierarchy[key].strucDesc || finalResponse.hierarchy[key].description;
          finalResponse.hierarchy[key].heirarchyText = finalResponse.hierarchy[key].strucDesc || finalResponse.hierarchy[key].description;
          finalResponse.hierarchy[key].heirarchyId = key;
          finalResponse.hierarchy[key].fieldId = key;
          hierarchyList.push(finalResponse.hierarchy[key]);
        });
      }

      finalResponse.hierarchy = hierarchyList;

      if (finalResponse.gridFields && Object.keys(finalResponse.gridFields).length) {
        const keys = Object.keys(finalResponse.gridFields);
        keys.forEach((key) => {
          const subKeys = Object.keys(finalResponse.gridFields[key]);
          subKeys.forEach((subKey) => {
            finalResponse.gridFields[key][subKey].fieldDescri = finalResponse.gridFields[key][subKey].fieldDescri || finalResponse.gridFields[key][subKey].description;
          });
        });
      }

      if (finalResponse.hierarchyFields && Object.keys(finalResponse.hierarchyFields).length) {
        const keys = Object.keys(finalResponse.hierarchyFields);
        keys.forEach((key) => {
          const subKeys = Object.keys(finalResponse.hierarchyFields[key]);
          subKeys.forEach((subKey) => {
            finalResponse.hierarchyFields[key][subKey].fieldDescri = finalResponse.hierarchyFields[key][subKey].fieldDescri || finalResponse.hierarchyFields[key][subKey].description;
          });
        });
      }

      finalRes[id] = finalResponse;
    });

    const reskeys = Object.keys(finalRes);
    if (reskeys.length === 1) {
      return finalRes[reskeys[0]];
    } else {
      return finalRes;
    }
  }

  public any2VaraintListView(data: any): VariantListDetails[] {
    const returnList: VariantListDetails[] = [];
    if (data) {
      data.forEach((resposne) => {
        const variantDetail: VariantListDetails = new VariantListDetails();
        variantDetail.title = resposne.title ? resposne.title : 'N/A';
        variantDetail.variantId = resposne.variantId;
        variantDetail.totalValue = resposne.totalValue ? resposne.totalValue : 0;
        variantDetail.errorValue = resposne.errorValue ? resposne.errorValue : 0;
        variantDetail.successValue = resposne.successValue ? resposne.successValue : 0;
        variantDetail.skippedValue = resposne.skippedValue ? resposne.skippedValue : 0;
        variantDetail.correctionValue = resposne.correctionValue ? resposne.correctionValue : 0;
        variantDetail.duplicateValue = resposne.duplicateValue ? resposne.duplicateValue : 0;
        variantDetail.successTrendValue = resposne.successValue ? resposne.successValue : 0;
        variantDetail.errorTrendValue = resposne.errorTrendValue ? resposne.errorTrendValue : 0;
        variantDetail.totalUniqueValue = resposne.totalUniqueValue ? resposne.totalUniqueValue : 0;
        variantDetail.successUniqueValue = resposne.successUniqueValue ? resposne.successUniqueValue : 0;
        variantDetail.errorUniqueValue = resposne.errorUniqueValue ? resposne.errorUniqueValue : 0;
        variantDetail.skippedUniqueValue = resposne.skippedUniqueValue ? resposne.skippedUniqueValue : 0;
        variantDetail.timestamp = resposne.timestamp ? resposne.timestamp : '';
        variantDetail.isVariant = resposne.isVariant;
        variantDetail.isInRunning = resposne.isInRunning;
        returnList.push(variantDetail);
      });
    }
    return returnList;
  }

  public any2LatestCorrectedData(record: any, fieldId: string, rowObjNum: string): string {
    if (record) {
      // check for header
      if (record.hdvs && record.hdvs.hasOwnProperty(fieldId)) {
        return record.hdvs[fieldId] ? record.hdvs[fieldId].vc : null;
      }

      // check on grid
      if (record.gvs) {
        Object.keys(record.gvs).forEach((grid) => {
          const rowObj = record.gvs[grid][rowObjNum];
          if (rowObj && rowObj.hasOwnProperty(fieldId)) {
            return rowObj[fieldId] ? rowObj[fieldId].vc : null;
          }
        });
      }

      // check on heirerchy
      if (record.hyvs) {
        Object.keys(record.hyvs).forEach((hei) => {
          const rowObj = record.hyvs[hei][rowObjNum];
          if (rowObj && rowObj.hasOwnProperty(fieldId)) {
            return rowObj[fieldId] ? rowObj[fieldId].vc : null;
          }
        });
      }
    }
    return null;
  }

  getCheckCodeList(data: Array<any>): Array<CheckCodeModel> {
    return data.map((row) => {
      return {
        code: row.checkCodeKey.code,
        shortDesc: row.shortDesc,
        additionalInfo: row.additionalInfo
      }
    });
  }

  public any2VariantDetails(response: any): any {
    if (response && response.length) {
      response.map((data) => data.variantId = data.uuid);
    }

    return response;
  }

  public any2FieldsList(response: any): any {
    if (response && response.selectedFields && response.selectedFields.length) {
      response.selectedFields.map((fld) => {
        if (fld.metadataCreateModel) {
          fld.metadataCreateModel.fieldDescri = fld.metadataCreateModel.fieldDescri || fld.metadataCreateModel.fieldDesc || '';
        }
      });
    }

    if (response && response.unselectedFields && response.unselectedFields.length) {
      response.unselectedFields.map((fld) => {
        fld.fieldDescri = fld.fieldDescri || fld.fieldDesc || '';
      });
    }

    return response;
  }

  public any2ObjectTypeResponse(response:any): any{
    let value = [];
    response.docs.forEach((item)=>{
      value.push({
        datasetId: item.moduleId,
        datasetDesc: item.moduleDesc,
        objectid: item.moduleId,
        objectdesc: item.moduleDesc,
        schemaId: item.schemaId,
        desc: item.schemaDescription
      })
    })
    return value;
  }

  public any2moduleidsResponse(resposne: any): WorkflowResponse[] {
    const getAllWorkflowdataset: WorkflowResponse[] = [];
    resposne.forEach((dataset) => {
      const Wfres: WorkflowResponse = new WorkflowResponse();
      Wfres.objectdesc = dataset.datasetDesc;
      Wfres.objectid = dataset.datasetId;
      getAllWorkflowdataset.push(Wfres);
    });
    return getAllWorkflowdataset;
  }

  public any2wfFlowResponse(resposne: any): WorkflowPath[] {
    const getAllWorkflowdataset: WorkflowPath[] = [];
    resposne.forEach((flow) => {
      const WfFlow: WorkflowPath = new WorkflowPath();
      WfFlow.pathname = flow.flowId;
      WfFlow.workflowdesc = flow.flowDesc;
      WfFlow.objectType = flow.datasetId;
      getAllWorkflowdataset.push(WfFlow);
    });
    return getAllWorkflowdataset;
  }


  setWfMetadataDescription(response) {
    if (Object.keys(response.headers).length) {
      const keys = Object.keys(response.headers);
      keys.forEach((key) => {
        response.headers[key].fieldDescri = response.headers[key].fieldDescri || response.headers[key].description;
      });
    }

    if (Object.keys(response.staticFields).length) {
      const keys = Object.keys(response.staticFields);
      keys.forEach((key) => {
        response.staticFields[key].fieldDescri = response.staticFields[key].fieldDescri || response.staticFields[key].description;
      });
    }

    if (Object.keys(response.hierarchy).length) {
      const keys = Object.keys(response.hierarchy);
      keys.forEach((key) => {
        response.hierarchy[key].fieldDescri = response.hierarchy[key].fieldDescri || response.hierarchy[key].description;
      });
    }

    if (Object.keys(response.workflowFields).length) {
      const keys = Object.keys(response.workflowFields);
      keys.forEach((key) => {
        response.workflowFields[key].fieldDescri = response.workflowFields[key].fieldDescri || response.workflowFields[key].description;
      });
    }

    const finalRes = response;
    return finalRes;
  }
}
