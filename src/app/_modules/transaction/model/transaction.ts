import { ReferenceDataset } from '@models/list-page/listpage';

export class Transaction {
}

export enum ObjectStatus {
    APP = 'APP',
    COMPLETED = 'COMPLETED',
    DRF = 'DRF',
    ERR = 'ERR',
    FAILED = 'FAILED',
    FERR = 'FERR',
    INP = 'INP',
    INT = 'INT',
    PENDING = 'PENDING',
    SENT = 'SENT',
    SYS = 'SYS '
}
export class MDORecord {
    childRecord: any[];
    controlData: ControlData;
    // mdoCRRecordES: MDOCRRecordES;
    mdoRecordES: MDORecordES;
}

export class ControlData {
    crId: string;
    draft: boolean;
    eventId: number;
    layoutId: string;
    massId: string;
    moduleId: string;
    parentCrId: string;
    processId: string;
    processFlowId: string;
    recordNumber: string;
    referenceId: string;
    roleId: string;
    taskId: string;
    tenantId: string;
    userId: string;
    strId?: string;
    processFlowContainerId?: string;
}

export class MDOCRRecordES {
    crId: string;
    wfvs: any;
}

export class MDORecordES {
    gvs: any;
    hdvs: any;
    hyvs: any;
    id: string;
    stat: ObjectStatus;
    strId: string;
    descriptions: DescriptionDetail[];
}

export class DescriptionDetail {
    classCode: string;
    classMode: string;
    isDesc: boolean;
    attributes: {
        [locale: string]: {
            shortDesc: string;
            longDesc: string;
            attrs: {
                [uuid: string]: {
                    fId: string;
                    vc: AttributeValue[],
                    oc: [],
                    bc: [],
                    uom: {
                        oc: [],
                        vc: AttributeValue[]
                    }
                }
            }
        }
    }
}
export class AttributeValue {
    c: string;
    t: string;
}
export class TabResponse {
    description: string;
    isTabHidden: boolean;
    isTabReadOnly: boolean;
    tabOrder: number;
    tabid: string;
    udrId: string | null;
}

export class GridResponse {
    dataType: string;
    dateModified: number;
    description: string;
    fieldId: string;
    isCheckList: boolean;
    isCompBased: boolean;
    isCriteriaField: boolean;
    isDefault: boolean;
    isDescription: boolean;
    isFutureDate: boolean;
    isGridColumn: true
    isHeirarchy: boolean;
    isMandatory: boolean;
    isNumSettingCriteria: boolean;
    isPastDate: boolean;
    isPermission: boolean;
    isReference: boolean;
    isSearchEngine: boolean;
    isTransient: boolean;
    isWorkFlow: boolean;
    isWorkFlowCriteria: boolean;
    maxChar: number;
    moduleId: number;
    parentField: string;
    pickList: string;
    structDesc: string;
    structureId: number;
    textCase: string;
    isSubGrid?: boolean;
    grid: any;
    fileTypes?: string;
    permissions?: any;
}

export class FieldCtrl {
    description: string;
    dataType: string;
    pickList: string;
    maxChar: number;
    structureId: number;
    fieldId: string;
    isCriteriaField: boolean;
    isWorkFlow: boolean;
    isGridColumn: boolean;
    isDescription: boolean;
    textCase: string;
    isFutureDate: boolean;
    isPastDate: boolean;
    moduleId: number;
    isReference: boolean;
    isDefault: boolean;
    isHeirarchy: boolean;
    isWorkFlowCriteria: boolean;
    isNumSettingCriteria: boolean;
    isCheckList: boolean;
    isCompBased: boolean;
    dateModified: number;
    isTransient: boolean;
    isSearchEngine: boolean;
    isPermission: boolean;
    isMandatory: boolean;
    structDesc: string;
    grid?: Array<GridResponse>;
    isReadOnly: boolean;
    numberOnly?: boolean;
    isKeyField?: boolean;
    refDataset?: ReferenceDataset; // hold ref dataset info...
    refDatasetField?: any;
    refDatasetStatus?: any[];
    fileTypes?: string;
    ruleIds?: number[];
    permissions?: any;
    lookupRuleId?: number;
    url?: string;
    decimalValue?: number;
}

export class FieldResponse {
    fieldId: string;
    fieldType: string;
    isMandatory: boolean;
    isReadOnly: boolean;
    moduleId: number;
    order: number;
    structureId: number;
    fieldCtrl: FieldCtrl;
    description: string;
    isRuleHidden?: boolean;
    parentField?: string;
    numberOnly?: boolean;
    url?: string;
    tabDetails: TabResponse;
}

export enum Process {
    create = 'create',
    change = 'change',
    view = 'view',
    approve = 'approve',
    copy = 'copy'
}

export enum ProcessValue {
    CREATE = '1',
    CHANGE = '2',
    SUMMARY = '3',
    APPROVE = '4'
}

export class AttributeDetail {
    short: string;
    long: string;
    numeric: string;
    lang: string;
}

export class DeleteRecordsPayload {
    moduleId: string;
    recordNumbers: Array<string>;
    tenantId: string;
    crudDeletionLogsModel: {
        systemInfo: string,
        deletionReason:string
    }
}

export class NumberSettingSavePayload {
    uuid?: string;
    description: string;
    details: string;
    moduleId: string;
    nextNumber?: string;
    rangeStart?: number;
    rangeEnd?: number;
    length: number;
    prefix: string;
    suffix: string;
    regexPattern?: string;
    isUserInput?: boolean;
    isDefault: boolean;
    criteriaDetails?: Array<any>;
    dateModified?: number;
    userModified?: string;
    fieldCtrl?: any;
    prefixType?: string;
    suffixType?: string;
    altnField?: string;
    prefixField?: string;
    suffixField?: string;
}

export class NumberSettingSaveResponse {
    acknowledge: boolean;
    uuid: string;
}

export class NumberSettingsListResponse {
    content: NumberSettingSavePayload[];
    pageable: {
        sort: SortObject,
        pageNumber: number;
        pageSize: number;
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    totalPages: number;
    last: boolean;
    totalElements: number;
    first: boolean;
    sort: SortObject;
    size: number;
    number: number;
    numberOfElements: number;
    empty: boolean;
}

export class SortObject {
    unsorted: boolean;
    sorted: boolean;
    empty: boolean;
}

export class NumberSettingsListPayload {
    fields?: string[];
    userCreated?: string[];
    userModified?: string[];
}

export class NumberSettingCount {
    count: number;
}

export class FieldMapping {
    [fieldId: string]: FieldResponse
}

export class ModuleClassResponse {
    description: string;
    uuid: string;
    code: string;
    codeLong: string;
    mod: string;
    modLong: string;
    referenceType: string;
    parentUuid: string;
    isNoun: boolean;
    isModPartOfDesc: boolean;
    isCodePartOfDesc: boolean;
    imageUrl: string;
    inheritAttributes: boolean;
    sapClass: string;
    tenantId: string;
    validFrom: string;
}

export class LabelsDetail {
    label: string;
    language: string;
}
export class ClassAttributeDetail {
    dataType: string;
    labels: Array<LabelsDetail>;
    label: string;
    uuid: string;
    isChecklist: boolean;
    isMandatory: boolean;
    charCode: string;
    charDesc: string;
    numCode: string;
    defaultUoM: Array<string>;
    fieldType: string;
}
export class GenerateDescriptionResponse {
    response: {
        allLangDesc: Array<{
            lang: string;
            longDesc: string;
            shortDesc: string;
        }>
    }
    errorMsg: string;
    acknowledged: boolean;
}

export const TransactionDropdownAddNewValue = 'plus-add-new';
export const TransactionMaterialDescName = 'materialDescription';

export interface FlowFormDetails {
    flowId : string;
    flowDesc: string;
    forms: FlowForms[];
    relatedDatasetsForms?: FlowForms[];
    isNoFlows?: boolean;
    stepId?: string;
}

export interface FlowForms {
    dataSetId: string;
    datasetDesc : string;
    formId: string;
    formDesc: string;
    isNoFlows?: boolean;
    referenceDatasets?: any[],
}
export interface ActiveForm {
    isPrimary: boolean,
    moduleId: string,
    objnr: string | null,
    isNew?: boolean,
    isReferenceForm?: boolean,
    referenceRecordDetails?: CurrentReferenceFormDetails
}

export interface CurrentReferenceFormDetails {
  parentModuleId: string,
  parentRecordNumber: string,
  isParentModulePrimary: boolean,
  fieldId: string;
  path: 'hdvs' | 'gvs' | 'hyvs';
  relatedDatasetObjnr?: string,
  hyvsStructureId?: number;
  gvsRowNumber?: number;
  moduleId: number;
  formId: string;
}

export enum MSGFN {
    create = '009',
    change = '004',
    delete = '003'
}
export interface FlowStepSecnarioMapping {
    dataSetId: string,
    scenarioId: string,
    systemId: string
}

export class FlowAndFormDetails {
    forms: FlowForms[];
    flows: FlowFormDetails[];
}

export class SummaryFormDetails {
    forms: FlowForms[]
}

export interface FieldErrorLog {
    errMsg: string,
    fieldId: string,
    parentSegment: string,
    path: string,
    rowSno: string,
    child?: ChildDatasetFieldErrorLog,
}

export interface ChildDatasetFieldErrorLog {
    id: string,
    moduleId: string,
    status: string,
    allFieldsLogs: Array<FieldErrorLog>
}

export interface FormStructure {
    [tabId: string]: {
        name: string,
        [fieldId: string]: string,
    }
}

export const CheckboxOptionsMapping: {checked: any[], unchecked: any[]} = {
    checked: ['true', true, 'on'],
    unchecked: [false, 'false', 'off', null, undefined, ''],
}

export interface TransactionTabsDetails {
  childDatasetId: string,
  childDescription:string,
  layoutId: string,
  count: number,
  isDataRef: boolean,
  dataReferenceDetails?: DataReferenceTabDetails,
  tabType: 'CHILD' | 'DATA-REF',
  tabId: string,
}

export interface DataReferenceTabDetails {
  parentModuleId: string,
  parentRecordNumber: string,
  isParentModulePrimary: boolean,
  fieldId: string;
  path: 'hdvs' | 'gvs' | 'hyvs';
  relatedDatasetObjnr: string,
  hyvsStructureId?: number;
  gvsRowNumber?: number;
  moduleId: number;
  formId: string;
}
