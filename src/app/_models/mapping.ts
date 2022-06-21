export interface MappedSource {
  fieldId: string;
  description: string;
  data?: any;
}

export interface MappingUpdatedPromiseResponse {
  isUpdated: boolean;
  updatedMdoMappings: MdoMappings[]
}
export interface MappedTarget {
  uuid: string;
  description: string;
  data?: any
  removeTranslationRule?: boolean
}
export interface Mapping {
  source: MappedSource;
  target: MappedTarget;
  line?: any;
}

export interface MappingRequestBody {
  wsdlDetails: WsdlDetails[];
  segmentMappings: SegmentMappings[];
  mappingList?: Mapping[];
}

export interface SaveMappingResponse {
  acknowledge: boolean;
  errorMsg: string;
  response: string;
}
export interface MappingData {
  acknowledge: boolean;
  errorMsg: string;
  response: {
    wsdlDetails: WsdlDetails[];
    segmentMappings: SegmentMappings[];
  };
}

export interface WsdlDetails {
  uuid: any;
  messageType: string;
  basicType: string;
  serviceClassName?: any;
  portMethodName?: any;
  serviceMethodName?: any;
  baseClassName?: any;
  portType: string;
  scenarioId?: any;
  endPoint: string;
  fileLocation?: any;
  isStubGenerated?: any;
  classPackageName?: any;
  isComplexChild?: any;
  complexTypeName?: any;
  nameSpacePrefix: string;
  nameSpaceValue: string;
  tenantId: string;
  inputType?: boolean;
}

export interface SegmentMappings {
  uuid?: any;
  messageType?: any;
  basicType?: any;
  segmentName: string;
  segmentParent?: any;
  mdoStructure?: any;
  hierarchylevel?: any;
  sequence?: any;
  field?: any;
  description?: any;
  objectType?: any;
  scenarioId?: any;
  segmentType?: any;
  nameSpaceprefix?: any;
  nameSpacevalue?: any;
  enableXsegment?: any;
  structureType?: any;
  tenantId: string;
  mdoMappings: MdoMappings[];
  segmentMappings?: SegmentMappings[];
  FIELDID?: string;
  orignalSegmentName?: any;
  orignalSegmentParent?: any;
  mainStructureId?: string;
}

export interface MdoMappings {
  description?: string;
  fieldId?: string;
  uuid?: any;
  serverId?: any;
  objectType?: any;
  messageType?: any;
  basicType?: any;
  direction?: any;
  labelCode?: any;
  mdoFieldId?: any;
  externalFieldId: string;
  segmentName: string;
  segmentParent?: any;
  sender?: any;
  receiver?: any;
  webservice?: any;
  clientId?: any;
  lang?: any;
  externalFieldLength: number;
  externalFieldDesc: string;
  scenarioId?: any;
  segmentHierarchy?: any;
  schemaDataType?: any;
  fieldOrder?: any;
  nameSpacePrefix?: any;
  nameSpaceValue?: any;
  tenantId: string;
  mdoFieldDesc?: any;
  additionalProperty?: any;
  translation?: any;
  FIELDID?: string;
  VALUE1?: string;
  VALUE2?: string;
  BLOCKTYPE?: string;
  CONDITIONOPERATOR?: string;
}

export interface MdoFieldMapping {
  description: string;
  usermodified: string;
  displayCriteria: string;
  fields: MdoField[];
  industry: string;
  isSingleRecord: boolean;
  moduledescription: string;
  systemType: string;
  owner: number;
  dataType: number;
  persistent: number;
  dataPrivacy: number;
  parentModuleIds: any[];
  type: string;
}

export interface MdoField {
  structureid: string;
  description: string;
  fieldlist: MdoFieldlistItem[];
}

export interface MdoFieldlistItem {
  fieldId: string;
  dataType: string;
  pickList: string;
  maxChar: number;
  isKeyField: boolean;
  isCriteriaField: boolean;
  isWorkFlow: boolean;
  isGridColumn: boolean;
  isDescription: boolean;
  textCase: string;
  attachmentSize: string;
  fileTypes: string;
  isFutureDate: boolean;
  isPastDate: boolean;
  outputLen: string;
  structureId: string;
  pickService: string;
  moduleId: number;
  parentField: string;
  isReference: boolean;
  isDefault: boolean;
  isHeirarchy: boolean;
  isWorkFlowCriteria: boolean;
  isNumSettingCriteria: boolean;
  isCheckList: boolean;
  isCompBased: boolean;
  dateModified: number;
  decimalValue: string;
  isTransient: boolean;
  isSearchEngine: boolean;
  isPermission: boolean;
  isDraft?: boolean;
  isPersisted?: boolean;
  isRejection: boolean;
  isRequest: boolean;
  childfields?: MdoFieldlistItem[];
  isSubGrid: boolean;
  isNoun: boolean;
  optionsLimit: string;
  description: string;
  helpText: string;
  longText: string;
  language: string;
  shortText?: any;
}

export interface MappingDatascope {
  conditions?: any[],
  dateCreated?: string;
  dateModified?: string;
  hierarchy?: string;
  recordNumbers?: string[],
  isSyncData?: boolean;
  isUpdateDataInSystem?: boolean;
}

export interface ConnectionDetails {
  connectionId: string;
  hostName: string;
  noOfInterface: 0;
  password: string;
  status: string;
  user: string;
  uuid?: string;
};

export interface MappingDataInfo {
  segmentMappings: SegmentMappings[];
  wsdlDetails: WsdlDetails[];
};

export interface MappingDatasetRequest {
  dataScope: MappingDatascope;
  connection: ConnectionDetails;
  mapping: MappingDataInfo;
  datasetName: string;
  tableName: string;
};

export interface ImportInterfaceDatascope extends MappingDatascope {
  syncData?: boolean;
  updateDataInSystem?: boolean;
}

export interface ImportInterfaceDetailsRequest {
  connection: ConnectionDetails;
  dataScope: ImportInterfaceDatascope;
}

export interface MessageTypes {
  messageTypesForRequest: string[];
  messageTypesForResponse: string[];
}
