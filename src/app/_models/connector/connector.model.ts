export class SapRequestDTO {
  pageNo: number;
  pageSize: number;
  password: string;
  tableName: string;
  url: string;
  username: string;
}

export class ConnectionDTO {
  password: string;
  systemURL: string;
  userName: string;
}

export class SAPResponseEntity<T> {
  acknowledge: boolean
  errorMsg: any
  response: T
}
export class NewDatasetMappingsResponse {
  acknowledge: boolean
  errorMsg: any
  response: SegmentMappingResponse
}

export class MDOMappingsResponse {
  acknowledge: boolean
  errorMsg: any
  response: FieldMappingsResponse
}

export class FieldMappingsResponse {
  tenantId: string
  id: any
  name: string
  fieldDefinitions: FieldDefinition[]
  usermodified: string
  displayCriteria: string
  structureId: any
  industry: string
  isSinglerecord: any
  type: string
  systemtype: any
  owner: number
  persistent: number
  dataType: number
  dataprivacy: any
  information: any
  description: any
  fields: any
}

export class FieldDefinition {
  fieldId: string
  shortText: any
  helpText: any
  longtexts: any
  dataType: string
  pickList: string
  maxChar: number
  isKeyField: any
  isCriteriaField: any
  isWorkFlow: any
  isGridColumn?: boolean
  isDescription: any
  textCase: string
  attachmentSize: any
  fileTypes: string
  isFutureDate: any
  isPastDate: any
  outputLen: any
  structureId: string
  pickService: any
  moduleId: number
  parentField?: string
  isReference: any
  isDefault: any
  isHierarchy: any
  isWorkFlowCriteria: any
  isNumSettingCriteria: any
  isCheckList: any
  isCompBased: any
  dateModified: number
  decimalValue: any
  childfields: any
  isSearchEngine: boolean
  description: string
}

export class SegmentMappingResponse {
  wsdlDetails: WsdlDetail
  segmentMappings: SegmentMapping[]
}

export class WsdlDetail {
  uuid: any;
  messageType: string;
  basicType: string;
  serviceClassName: any;
  portMethodName: any;
  serviceMethodName: any;
  baseClassName: any;
  portType: string;
  scenarioId: any;
  endPoint: string;
  fileLocation: any;
  isStubGenerated: any;
  classPackageName: any;
  isComplexChild: any;
  complexTypeName: any;
  nameSpacePrefix: string;
  nameSpaceValue: string;
  tenantId: string;
}

export class SegmentMapping {
  uuid: string;
  messageType: string;
  basicType: string;
  segmentName: string;
  segmentParent: string;
  mdoStructure: any;
  hierarchylevel: number;
  sequence: number;
  field: any;
  description: any;
  objectType: any;
  scenarioId: any;
  segmentType: string;
  nameSpaceprefix: string;
  nameSpacevalue: string;
  enableXsegment: any;
  structureType: any;
  tenantId: string;
  mdoMappings: any[];
  segmentMapping?: SegmentMapping;
}

export class MdoMapping {
  uuid: any;
  serverId: string;
  objectType: any;
  messageType: string;
  basicType: string;
  direction: any;
  labelCode: any;
  fieldName?: any;
  sapfield?: string;
  mdoFieldId?: any;
  externalFieldId?: string;
  mdoFieldDesc: any;
  segmentName: string;
  segmentParent: string;
  sender: any;
  receiver: any;
  webservice: any;
  clientId: any;
  lang: any;
  externalFieldLength?: number;
  externalFieldDesc?: string;
  sapFieldLength?: number
  sapFieldDesc?: string
  scenarioId: any;
  segmentHierarchy: string;
  schemaDataType: string;
  fieldOrder: number;
  nameSpacePrefix: string;
  nameSpaceValue: string;
  tenantId: string;
  additionalProperty: any;
  translation: any;
}

export class CpiConnection {
  connectionName: string;
  connectionDescription: string;
  sapConnection: {
    hostName: string;
    password: string;
    user: string;
  }
}

export class GetConnectionAPI {
  acknowledge: boolean;
  errorMsg: string;
  message: string;
  response: {
    connectionId: string;
    fromOnBoarding: boolean;
    hostName: string;
    noOfInterface: number;
    password: string;
    status: string;
    user: string;
  }
}

export class ImportRequestDTO {
  dateCreated: string
  dateModified: string
  hierarchy: string
  recordNumber: string
  syncData: boolean
  updateDataInSystem: boolean
}

export interface CreateConnectionData {
  systemName: string;
  systemDesc: string;
  systemUrl: string;
  username: string;
  userPassword: string;
}

export interface RequestDTO {
  connection: {
    connectionId: string,
    hostName: string;
    noOfInterface: number;
    password: string;
    status: string;
    user: string;
  },
  dataScope?: {
    dateCreated: string,
    dateModified: string,
    hierarchy: string,
    recordNumbers: string[],
    syncData: true,
    updateDataInSystem: true
  }
}

export class ConnectionMDOModel {
  connectionDescription: string;
  connectionId: string;
  connectionName: string;
  systemType: string;
  tenantId: string;
}