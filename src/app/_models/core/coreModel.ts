/* export class ObjectType {
  objectid: number;
  objectdesc: string;
  objectInfo?: string;
  submenus?: any[];
  type?: string;
} */

export class ObjectType {
  objectid: number;
  objectdesc: string;
  objectInfo?: string;
  submenus?: any[];
  type?: string;
  parentDatasets?: any[];
  displayCriteria?: number;
  systemType?: string;
  usermodified?: string;
  dataPrivacy?: number;
  dataType?: number;
  fields?: any[];
  industrty?: string;
  isSingleRecord?: boolean;
  owner?: number;
  persistent?: number;
  packageId?: string;
}

export class FieldMetaData {
  fieldId: string;
  fieldDescri: string;
  ajax: string;
  backEnd: number;
  criteriaDisplay: string;
  criteriaField: string;
  dataType: string;
  datemodified: number;
  defaultDate: string;
  defaultDisplay: boolean;
  defaultValue: string;
  dependency: string;
  descField: string;
  eventService: string;
  flag: string;
  gridDisplay: string;
  intUse: string;
  intUseService: string;
  isCheckList: string;
  isCompBased: string;
  isCompleteness: string;
  isShoppingCartRefField: boolean;
  keys: string;
  languageIndependent: string;
  locType: string;
  mandatory: string;
  maxChar: string;
  metaDataDependencies: FieldMetaDataDependency[];
  numberSettingCriteria: string;
  objecttype: string;
  outputLen: string;
  parentField: string;
  permission: string;
  pickService: string;
  pickTable: string;
  picklist: string;
  plantCode: string;
  refField: string;
  reference: string;
  repField: string;
  searchEngin: string;
  strucId: string;
  systemId: string;
  tableName: string;
  tableType: string;
  textAreaLength: string;
  textAreaWidth: string;
  userid: string;
  validationService: string;
  workFlowField: string;
  workflowCriteria: string;
  isMultiselect: string;
}

export class FieldMetaDataDependency {
  depField: string;
  depFieldManat: string;
  fieldId: string;
  metaDataCreateModel: any;
  metaDataDepValModels: any;
  objNr: number;
}

export class SaveModuleSuccess {
  acknowledge: boolean;
  errorMsg: string;
  fieldsErrors: any;
  moduleid: string;
}

export enum SystemType {
  SYSTEM_TYPE_1 = 'System Type1',
  SYSTEM_TYPE_2 = 'System Type2',
  SYSTEM_TYPE_3 = 'System Type3',
}

export enum Owner {
  PARTNER = 1,
  CUSTOMER = 2,
  MDO = 3,
}

export enum DataType {
  MASTER = 1,
  TRANSACTION = 2,
  REFERENCE = 3,
}

export enum Persistence {
  CONDITION_BASED = 1,
  TIME_BOUND = 2,
}

export enum DataPrivacy {
  RETENTION = 1,
}
export enum ParentDataset {
  PARENTDATASET1 = 1,
  PARENTDATASET2 = 2,
  PARENTDATASET3 = 3,
}

export enum DatasetType {
  STANDARD = 'STD',
  VIRTUAL = 'VT',
  SYSTEM = 'SYS'
}
export class VirtualDatasetModel {
  vdId: string;
  vdName: string;
}

export class VirtualDatasetResultData {
  data: VirtualDatasetModel;
  message: string;
  status: number;
  success: boolean;
}

export class FieldsListByPickListPayload {
  description: string;
  pickList: string;
}

export class PicklistFieldsMetadata {
  fieldId: string;
  description: string;
  maxChar: number;
}

export class FieldsListByPickListResponse {
  acknowledge: boolean;
  errorMsg: string;
  pickListField: PicklistFieldsMetadata[];
}

export class DatasetResponse {
  moduleId: number;
  tenantId: string;
  userModified: Date;
  dateModified: Date;
  dispCriteria: number;
  moduleDescriptionRequestDTO: DatasetModuleDTO;
  industry: string;
  isSingleRecord: boolean;
  systemType: string;
  owner: number;
  dataType: number;
  persistent: number;
  dataPrivacy: number;
  type: string
}

export class DatasetModuleDTO {
  description: string;
  information: string;
}

export class ChildDataset {
  childDatasetId: string;
  childDescription: string;
}

export class ChildDatasetsWithCount {
  childDatasetId: string;
  childDescription: string;
  count: { count: number, description: string };
}

export class AllDatasetDetailsResponse {
  moduleDesc: string;
  moduleId: string;
  tenantId: string;
}

export interface DefaultValuesRequest {
  dataSet: string;
  formId: string;
  appliedValue: AppliedValue[];
  gvs: any;
}

export interface AppliedValue {
  fieldId: string;
  fieldVal: string[];
  restrictedVal?: string[]
}

export interface GridDefaultValueRequest {
  fieldId: string;
  fieldVal: string[] | number[];
  parentUUID?: string[];
  uuid?: string;
}