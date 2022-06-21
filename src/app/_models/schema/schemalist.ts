import { UDRBlocksModel, DropDownValue } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { FilterCriteria } from './schemadetailstable';

export class SchemaList {
    details: SchemaListModule[];
}
export class SchemaListModule {
    module: SchemaDetails;
}
export class SchemaDetails {
    schemaId: string;
    title: string;
    totalValue: string;
    thisWeekProgress: string;
    enableProgressBar: boolean;
    successValue: number;
    errorValue: number;
    details: Details;
    variants: Variants;
}
export interface Details {
    structure: string;
    owner: [];
    date: string;
}
export interface Variants {
    total_variants: number;
}
export interface FilterFieldModel {
    fieldId: string;
    fieldDesc: string;
    picklist: string;
    dataType: string;
}
export class SchemaModuleList {
    moduleId: string;
    moduleDescription: string;
}
export class SchemaListModuleList {
    moduleId: string;
    moduleDesc: string;
    schemaLists: SchemaListDetails[];
}

export class ModuleInfo {
    moduleId: string;
    moduleDesc: string;
    tenantId?: string;
    datasetCount?: number;
}
export class SchemaListDetails {
    schemaId: string;
    schemaDescription: string;
    errorCount: number;
    successCount: number;
    totalCount: number;
    skippedValue: number;
    correctionValue: number;
    duplicateValue: number;
    totalUniqueValue: number;
    successUniqueValue: number;
    errorUniqueValue: number;
    skippedUniqueValue: number;
    successTrendValue: string;
    errorTrendValue: string;
    createdBy: string;
    errorPercentage: number;
    successPercentage: number;
    variantCount: number;
    executionStartTime: number;
    executionEndTime: number;
    variantId: string;
    runId: string;
    brInformation: BusinessRuleExecutionDetails[];
    moduleId: string;
    moduleDescription: string;
    isInRunning: boolean;
    schemaThreshold: string;
    collaboratorModels: SchemaDashboardPermission;
    totalValue: number;
    errorValue: number;
    successValue: number;
    variants: SchemaVariantsModel[];
    schemaCategory: string;
    description?: string;
}

export class SchemaRunningDetails {
    createdBy: string;
    dateModified: number;
    moduleDesc: string;
    moduleId: string;
    running: boolean;
    schemaDescription: string;
    schemaId: string;
    viewed: boolean;
    variants: SchemaVariantsModel[];
}

export class BusinessRuleExecutionDetails {
    brId: string;
    error: number;
    success: number;
    skipped: number;
    outdated: number;
    duplicate: number;
}
export class SendDataForSchemaVariantFields {
    schemaId: string;
    fetchCount: number;
    fetchSize: number;
    query: string;
    queryString: string;
    frmWhr: string;
}
export class ResponseDataForSchemaVariantFields {
    dataType: string;
    fieldId: string;
    shortText: string;
}
export class VariantFieldList {
    fieldId: string;
    shortText: string;
    dataType: string;
}
export class SendSchemavariantRequest {
    schemaId: string;
    objectId: string;
    platCode: string;
}
export class SchemaVariantResponse {
    name: string;
    total: number;
    error: number;
    success: number;
    schemaVariantId: string;
    successPercentage: number;
    errorPercentage: number;
    lastExecutionDate: string;
}
export class CurrentSchemaDetails {
    schemaId: string;
    schemaDesc: string;
    totalRecord: number;
    errorRecord: number;
    successRecord: number;
    moduleId: string;
}
export class SchemaBrInfoList {
    schemaId: string;
    brType: string;
    dynamicMessage: string;
    brId: string;
    refId: string;
    fields: string;
    schemaOrder: number;
    brDescription: string;
    isAssigned: boolean;
}
export class AssignBrToSchemaRequest {
    schemaId: string;
    objectId: string;
    selectedRules: string;
    schemaDesc: string;
}
export class ScheduleSchemaRequest {
    objectId: string;
    schemaId: string;
    fieldMapping: string;
}
export class CategoriesResponse {
    categoryId: string;
    categoryDesc: string;
    plantCode: string;
}
export class DependencyRequest {
    object: string;
    queryString: string;
    fetchCount: number;
}
export class DependencyResponse {
    id: string;
    value: string;
}
export class SaveBusinessRule {
    ruleType: string;
    objectId: string;
    reference: string;
    fields: string;
    ownertype: string;
    owners: string;
    message: string;
    regexScript: string;
    schemaId: string;
    customScript: string;
    brDesc: string;
    brId: string;
    brExpose: number;
    percentage: number;
    standardFunc: string;
    categoryId: string;
    transformation: number;
    tableName: string;
    qryScript: string;
    constructor() {
        this.brDesc = '';
        this.brExpose = 0;
        this.brId = '';
        this.categoryId = '';
        this.customScript = '';
        this.fields = '';
        this.message = '';
        this.objectId = '';
        this.owners = '';
        this.ownertype = '';
        this.percentage = 0;
        this.qryScript = '';
        this.reference = '';
        this.regexScript = '';
        this.ruleType = '';
        this.schemaId = '';
        this.standardFunc = '';
        this.tableName = '';
        this.transformation = 0;
    }
}
export class SchemaGetApiRequest {
    objectId: string;
    fetchCount: number;
    queryString: string;
}
export class VariantDetailsScheduleSchema {
    variantId: string;
    variantDesc: string;
}
export class VariantAssignedFieldDetails {
    fieldId: string;
    fieldDesc: string;
    value: string;
}
export class VariantListDetails {
    title: string;
    variantId: string;
    totalValue: number;
    errorValue: number;
    successValue: number;
    skippedValue: number;
    correctionValue: number;
    duplicateValue: number;
    successTrendValue: number;
    errorTrendValue: number;
    totalUniqueValue: number;
    successUniqueValue: number;
    errorUniqueValue: number;
    skippedUniqueValue: number;
    timestamp: number;
    isVariant: boolean;
    isInRunning: boolean;
}

export class SchemaStaticThresholdRes {
    schemaId: string;
    threshold: any;
    thresHoldStatus: string;
    successCnt: number;
    errorCnt: number;
    totalCnt: number;
    correctedCnt: number;
    exeStrtDate: string;
    exeEndDate: string;
    isInRunning: boolean;
    schemaDescription: string;
    outdatedCnt: number;
    skippedCnt: number;

}

export class SchemaDashboardPermission {
    sno: number;
    schemaId: string;
    userid: string;
    roleId: string;
    groupid: string;
    isAdmin: boolean;
    isViewer: boolean;
    isEditer: boolean;
    isReviewer: boolean;
    isApprover: boolean;
    permissionType: PermissionType;
    createdAt: number;
    updatedAt: number;
    createdBy: string;
}

export enum PermissionType {
    USER = 'USER',
    ROLE = 'ROLE',
    GROUP = 'GROUP'
}

export class VariantDetails {
    schemaId: string;
    variantName: string;
    variantId: string;
    dataScopeCount?: number;
    udrBlocksModel: UDRBlocksModel[]
}


export interface SchemaVariantsModel {
    variantId: string;
    schemaId: string;
    variantName: string;
    createdAt: number;
    updatedAt: number;
    createdBy: string;
    filterCriteria: FilterCriteria[];
    isDefault: boolean;
    variantType: VarinatType;
    dataScopeCount?: number;
}

export enum VarinatType {
    RUNFOR = 'RUNFOR',
    DATA_FILTER = 'DATA_FILTER'
}

export interface LoadDropValueReq {
    fieldId: string;
    checkedValue: DropDownValue[];
}

export class CoreSchemaBrMap {
    schemaId: string;
    brId: string;
    order: number;
    status: string;
    brWeightage: number;
    dependantStatus:string;
}

export const enum SchemaNavGrab {
    OFF = 0,
    RESIZE = 1,
    }