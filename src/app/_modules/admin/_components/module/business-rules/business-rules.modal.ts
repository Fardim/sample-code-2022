import { ModuleInfo } from '@models/schema/schemalist';
import { MetadataModel, CategoryInfo, TransformationInfo } from 'src/app/_models/schema/schemadetailstable';
import { BlockType } from './user-defined-rule/udr-cdktree.service';


export enum TransformationRuleType {
    CONSTANT = 'CONSTANT',
    LOOKUP = 'LOOKUP',
    EMPTY = 'EMPTY_SPACE',
    ZERO = 'ZERO',
    REGEX = 'REGEX',
    DATE = 'DATE'
}

export interface TransformationModel {
    brId: string;
    sourceFld: string;
    targetFld: string;
    excludeScript?: string;
    includeScript?: string;
    lookUptable?: string;
    transformationRuleType: TransformationRuleType.LOOKUP | TransformationRuleType.REGEX;
    lookUpObjectType?: string;
    udrBlockModel: UDRBlocksModel;
}
export class CoreSchemaBrInfo {
    tempId?: string;
    sno: number;
    brId: string;
    brType: string;
    refId: number;
    fields: string;
    fieldCtrl?: any;
    regex: string;
    order: number;
    message: string;
    script: string;
    brInfo: string;
    brExpose: number;
    status: string;
    categoryId: string;
    standardFunction: string;
    brWeightage: string;
    totalWeightage: number;
    transformation: number;
    tableName: string;
    qryScript: string;
    dependantStatus: string;
    plantCode: string;
    percentage: number;
    schemaId?: string;
    brIdStr: string;
    categoryInfo?: CategoryInfo;
    udrDto?: UdrModel;
    udrData?: ConditionBlocks;
    duplicacyField? = [];
    duplicacyMaster? = [];
    masterRules?: Array<DuplicateMasterRule> = [];
    transFormationSchema?: TransformationModel[];
    transInfo?: TransformationInfo;
    isCopied?: boolean;
    isEdited?: boolean;
    moduleId?: string;
    copiedFrom?: string;
    apiKey: string;
    dep_rules?: CoreSchemaBrInfo[];
    depandantStatus?: null;
    isTransformationApplied?: boolean;
    dontMapped?: boolean;
    transformationMappingDTO?: TransformationRuleMapped[];
    source_field?: string;
    target_field?: string;
    accuracyScore?: number;
    apiSno?: string;
    isConfigured?: boolean;
    checkCodeDesc?: string;
    desc?: string;
    lookupRuleMetadata?: LookupRuleMetadata;
    descriptionRule?: DescriptionRule;
    scope?: ConditionBlocks[];
    errWarLevels?: ErrorWarnLevel[];
    autoExeInfo?: any;
    brDescription?: string;
    notifInfo?: any
}
export class crossDataRuleInfo {
    acknowledge: boolean;
    errorMsg: any;
    message: any
    response: crossDataRuleValue;
}
export class crossDataRuleValue {
    ruleInterfaceId: string;
    ruleLinkField: string;
    ruleName: string;
    ruleSourceModule: string;
    ruleTargetModule: string;
    ruleTrigger: string;
    ruleUsage: string;
    segmentMappings: any;
    uuid: string;
    wsdlDetails: any;
}
export class LookupRuleMetadata {
    lookupDataset?: string;
    lookupType?: string;
    targetSystem?: string;
    lookupTable?: string;
    checkCodes?: string[];
    checkCodeDesc?: string;
    sno?: number | string;
    lookupStr?: number | string;
}

export class DuplicateMasterRule {
    sno: string;
    brOrder: number;
    brStatus: boolean;
    isTieBreaker: boolean;
    coreSchemBrInfo: CoreSchemaBrInfo;
}
export class CheckCodeModel {
    code: string;
    shortDesc: string;
    additionalInfo: string;
}

export class TargetSystemModel {
    connid: string | number;
    name: string;
}

export enum BusinessRuleType {
    BR_SAP_CHECK_CODE_RULE = 'BR_SAP_CHECK_CODE_RULE',
    BR_MANDATORY_FIELDS = 'BR_MANDATORY_FIELDS',
    BR_METADATA_RULE = 'BR_METADATA_RULE',
    BR_CUSTOM_SCRIPT = 'BR_CUSTOM_SCRIPT',
    BR_API_RULE = 'BR_API_RULE',
    BR_DEPENDANCY_RULE = 'BR_DEPENDANCY_RULE',
    BR_DUPLICATE_RULE = 'BR_DUPLICATE_CHECK',
    BR_EXTERNALVALIDATION_RULE = 'BR_EXTERNALVALIDATION_RULE',
    BR_REGEX_RULE = 'BR_REGEX_RULE',
    BR_TRANSFORMATION = 'BR_TRANSFORMATION',
    MRO_CLS_MASTER_CHECK = 'MRO_CLS_MASTER_CHECK',
    MRO_MANU_PRT_NUM_LOOKUP = 'MRO_MANU_PRT_NUM_LOOKUP',
    MRO_MANU_PRT_NUM_IDENTI = 'MRO_MANU_PRT_NUM_IDENTI',
    MRO_GSN_DESC_MATCH = 'MRO_GSN_DESC_MATCH',
    BR_LOOKUP_RULE = 'BR_LOOKUP_RULE',
    BR_CLASSIFICATION_RULE = 'BR_CLASSIFICATION',
    DAXE = 'DAXE',
    AUTO_EXTENSION_RULE = 'AUTO_EXTENSION_RULE',
    BR_CROSS_DATASET_RULE = 'BR_CROSS_DATASET_RULE',
    NOTIFICATION_RULE = 'BR_NOTIFICATION_RULE',
    BR_DEPENDENCY = 'BR_DEPENDENCY',
}

export const RULE_TYPES = [
    { ruleDesc: 'Missing Rule', ruleId: '', ruleType: BusinessRuleType.BR_MANDATORY_FIELDS, isImplemented: true },
    { ruleDesc: 'Metadata Rule', ruleId: '', ruleType: BusinessRuleType.BR_METADATA_RULE, isImplemented: true },
    { ruleDesc: 'Web Service Call', ruleId: '', ruleType: BusinessRuleType.BR_SAP_CHECK_CODE_RULE, isImplemented: true, dontMapped: true},
    { ruleDesc: 'Regex Rule', ruleId: '', ruleType: BusinessRuleType.BR_REGEX_RULE, isImplemented: false },
    { ruleDesc: 'User Defined Rule', ruleId: '', ruleType: BusinessRuleType.BR_CUSTOM_SCRIPT, isImplemented: true },
    { ruleDesc: 'Custom validation', ruleId: '', ruleType: BusinessRuleType.BR_API_RULE, isImplemented: true },
    { ruleDesc: 'Basic', ruleId: '', ruleType: null, isImplemented: false },
    { ruleDesc: 'Dependency Rule', ruleId: '', ruleType: BusinessRuleType.BR_DEPENDANCY_RULE, isImplemented: false },
    { ruleDesc: 'Duplicate Rule', ruleId: '', ruleType: BusinessRuleType.BR_DUPLICATE_RULE, isImplemented: true },
    { ruleDesc: 'External Validation Rule', ruleId: '', ruleType: BusinessRuleType.BR_EXTERNALVALIDATION_RULE, isImplemented: false },
    { ruleDesc: 'Transformation Rule', ruleId: '', ruleType: BusinessRuleType.BR_TRANSFORMATION, isImplemented: true },
    { ruleDesc: 'MDO Classification Master Check', ruleId: '', ruleType: BusinessRuleType.MRO_CLS_MASTER_CHECK, isImplemented: true },
    { ruleDesc: 'Manufacturer Part Number Lookup', ruleId: '', ruleType: BusinessRuleType.MRO_MANU_PRT_NUM_LOOKUP, isImplemented: true },
    { ruleDesc: 'Manufacturer Part Number Identification', ruleId: '', ruleType: BusinessRuleType.MRO_MANU_PRT_NUM_IDENTI, isImplemented: true },
    { ruleDesc: 'Material Description Match', ruleId: '', ruleType: BusinessRuleType.MRO_GSN_DESC_MATCH, isImplemented: false },
    { ruleDesc: 'Classification Rule', ruleId: '', ruleType: BusinessRuleType.BR_CLASSIFICATION_RULE, isImplemented: true },
    { ruleDesc: 'Lookup Rule', ruleId: '', ruleType: BusinessRuleType.BR_LOOKUP_RULE, isImplemented: true },
    { ruleDesc: 'DAXE', ruleId: '', ruleType: BusinessRuleType.DAXE, isImplemented: true },
    { ruleDesc: 'Auto-Extension', ruleId: '', ruleType: BusinessRuleType.AUTO_EXTENSION_RULE, isImplemented: true },
    { ruleDesc: 'Cross dataset', ruleId: '', ruleType: BusinessRuleType.BR_CROSS_DATASET_RULE, isImplemented: true },
    { ruleDesc: 'Notification rule', ruleId: '', ruleType: BusinessRuleType.NOTIFICATION_RULE, isImplemented: true },
];

export const DR_CHILD_RULES = [
    BusinessRuleType.BR_CUSTOM_SCRIPT,
    BusinessRuleType.BR_SAP_CHECK_CODE_RULE,
    BusinessRuleType.BR_API_RULE,
    BusinessRuleType.BR_LOOKUP_RULE
];
export const DR_CHILD_TIEBREAKER_RULES = [
    BusinessRuleType.BR_MANDATORY_FIELDS,
    BusinessRuleType.BR_REGEX_RULE,
    BusinessRuleType.BR_CUSTOM_SCRIPT,
    BusinessRuleType.BR_SAP_CHECK_CODE_RULE,
    BusinessRuleType.BR_API_RULE,
    BusinessRuleType.BR_LOOKUP_RULE
];

export const PRE_DEFINED_REGEX = [
    { FUNC_NAME: 'EMAIL', FUNC_TYPE: 'EMAIL', FUNC_CODE: '^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}' },
    { FUNC_NAME: 'PANCARD', FUNC_TYPE: 'PANCARD', FUNC_CODE: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$' },
    { FUNC_NAME: 'PHONE NUMBER(IN)', FUNC_TYPE: 'PHONE_NUMBER_IN', FUNC_CODE: '^(\\+91[\\-\\s]?)?[0]?(91)?[7896]\\d{9}$' },
    { FUNC_NAME: 'PHONE NUMBER(AUS)', FUNC_TYPE: 'PHONE_NUMBER_AUS', FUNC_CODE: '^\\({0,1}((0|\\+61)(2|4|3|7|8)){0,1}\\){0,1}(\\ |-){0,1}[0-9]{2}(\\ |-){0,1}[0-9]{2}(\\ |-){0,1}[0-9]{1}(\\ |-){0,1}[0-9]{3}$' },
    { FUNC_NAME: 'PHONE NUMBER(US)', FUNC_TYPE: 'PHONE_NUMBER_US', FUNC_CODE: '^\\(?([0-9]{3})\\)?[-.\\s]?([0-9]{3})[-.\\s]?([0-9]{4})$' },
    { FUNC_NAME: 'AADHAAR NUMBER', FUNC_TYPE: 'AADHAAR_NUMBER', FUNC_CODE: '^\\d{4}\\s\\d{4}\\s\\d{4}$' },
    { FUNC_NAME: 'ABN', FUNC_TYPE: 'ABN_NUMBER', FUNC_CODE: '^\\d{2}\\s*\\d{3}\\s*\\d{3}\\s*\\d{3}' },
    { FUNC_NAME: 'SSN(US)', FUNC_TYPE: 'SSN_US', FUNC_CODE: '^(?!000|666)[0-8][0-9]{2}-(?!00)[0-9]{2}-(?!0000)[0-9]{4}$' },
    { FUNC_NAME: 'GSTIN', FUNC_TYPE: 'GSTIN', FUNC_CODE: '^[0-9]{2}\\s*[A-Z]{5}[0-9]{4}[A-Z]{1}\\s*[1-9A-Z]{1}Z[0-9A-Z]{1}$' },
    { FUNC_NAME: 'ECN', FUNC_TYPE: 'ECN', FUNC_CODE: '^CN[0-9]{9}' }
];

export enum LookupTypes {
    WITHIN_DATASET = 'WITHIN_DATASET',
    SAP_TABLE_LOOKUP = 'SAP_TABLE_LOOKUP',
    SAP_CHECK_CODE = 'SAP_CHECK_CODE'
}

export const LOOKUP_TYPES = [
    { ruleDesc: 'Within Dataset', ruleType: LookupTypes.WITHIN_DATASET, tooltipDesc: 'Select this option if you wish to look up a dataset within MDO.' },
    { ruleDesc: 'SAP Table Lookup', ruleType: LookupTypes.SAP_TABLE_LOOKUP, tooltipDesc: 'Select this option if you wish to look up a 3rd party system.' },
    { ruleDesc: 'SAP Check Code', ruleType: LookupTypes.SAP_CHECK_CODE, tooltipDesc: 'Select this option if you wish to call a service to validate your data.' }
];

export const TRANSFORMATION_TYPES = [
  { key: TransformationRuleType.CONSTANT, value: 'Constant Value'},
  { key: TransformationRuleType.LOOKUP, value: 'Lookup Value'},
  { key: TransformationRuleType.EMPTY, value: 'Empty Space'},
  { key: TransformationRuleType.ZERO, value: 'Zero'},
//   { key: TransformationRuleType.REGEX, value: 'Regex'}
];

export enum ZeroRuleTypes {
  ADD_LEADING_ZERO = 'add_leading_zero',
  REMOVE_LEADING_ZERO = 'remove_leading_zero'
}

export enum EmptySpaceRuleTypes {
  REMOVE_LEADING_SPACES = 'isRemoveLeadingSpace',
  REMOVE_TRAILING_SPACES = 'isRemoveTraillingSpace',
  REMOVE_ALL_SPACES = 'isRemoveAll'
}

export const ZERO_RULE_TYPES = [
  { key: ZeroRuleTypes.ADD_LEADING_ZERO, value: 'Add Leading Zeroes'},
  { key: ZeroRuleTypes.REMOVE_LEADING_ZERO, value: 'Remove Leading Zeroes'}
];

export const EMPTY_SPACE_RULE_TYPES = [
  { key: EmptySpaceRuleTypes.REMOVE_LEADING_SPACES, value: 'Remove Leading Spaces'},
  { key: EmptySpaceRuleTypes.REMOVE_TRAILING_SPACES, value: 'Remove Trailing Spaces'},
  { key: EmptySpaceRuleTypes.REMOVE_ALL_SPACES, value: 'Remove All Spaces'},
];

export class CreateUpdateSchema {
    discription: string;
    moduleId: string;
    schemaId: string;
    schemaGroupId: string;
    schemaThreshold: string;
    schemaCategory: string;
    brs: CoreSchemaBrInfo[];
}

export class CreateCondtionParams {
    conditionName: string;
    fieldType: string;
    operatorType: string;
    comparisionType: string;
    comparisionValue: string;
}

export class ConditionalField {
    fieldId: string;
    fieldDescription: string;
    fields: MetadataModel[];
}

export interface DropDownValue {
    CODE?: string;
    code?: string;
    PLANTCODE: string;
    SNO: string;
    FIELDNAME: string;
    TEXT?: string;
    text?: string;
    LANGU: string;
    isSugested?: boolean;
    fieldId?: string;
    attributeValuesPk?: {
        [index: string]: string;
    }
}

export class UDRBlocksModel {
    id: string;
    udrid: string;
    conditionFieldId: string;
    conditionValueFieldId: string;
    conditionFieldValue: string;
    conditionFieldStartValue: string;
    conditionFieldEndValue: string;
    blockType: BlockType;
    conditionOperator: string;
    blockDesc: string;
    objectType: string;
    sourceObjectType?: string;
    targetObjectType?: string;
    targetInfo?: string;
    sRegex?: string;
    conditionalFieldValueCtrl?: MetadataModel;
    childs?: UDRBlocksModel[];
    plantCode?: any;
    conditionFieldIdCtrl?: MetadataModel;
    order?: number;
    conditionalOldValueCtrl?: MetadataModel;
    oldValueInfo?: string;
    oldFieldValue?: string;
    oldValueFieldId?: string;
}

export class UDRObject {
    id: string;
    blockTypeText: string;
    fieldId: string;
    sRegex: string;
    operator: string;
    comparisonValue: string;
    actionDisabled: boolean;
    rangeStartValue: string;
    rangeEndValue: string;
    children: UDRBlocksModel[]
}

export class UDRHierarchyModel {
    id: string;
    udrId: string;
    parentId: string;
    leftIndex: number;
    rightIndex: number;
    blockRefId: string;
    order?: number;
}

export class UdrModel {
    brInfo: CoreSchemaBrInfo;
    objectType: string;
    when: Array<UDRBlocksModel>;
}

export class ConditionBlocks {
    when: UDRBlocksModel[];
    then?: UDRBlocksModel[];
}

export class Category {
    categoryDesc: string;
    categoryId: string;
    plantCode: string;
}

export class ConditionalOperator {
    desc: string;
    childs: { code: string; value?: string }[];
}

export class DuplicateRuleModel {
    coreBrInfo: CoreSchemaBrInfo;
    // ruleName: string;
    addFields: any[];
    selCriteria: any[];
    mergeRules: any[];
    masterRules: any[];
    removeList: any[];
    scope: ConditionBlocks[];
    errWarLevels: ErrorWarnLevel[];
    // objectId: string;
}

export class TransformationMappingResponse {
    success: TransformationMappingTabResponse[];
    error: TransformationMappingTabResponse[];
}
export class TransformationMappingTabResponse {
    ruleInfo: CoreSchemaBrInfo;
    isEnabled: boolean;
    isConfigured: boolean;
}

export class TransformationRuleMapped {
    status: string;
    order: number;
    isEnabled: boolean;
    isConfigured: boolean;
    transformationRule: string;
}

export class ApiRulesInfo {
    sno: string;
    description: string;
}

export class BlocksList {
    blocksList: UDRBlocksModel[];
    datasetList: ModuleInfo[];
    blockType?: string;
}
export const businessRulesColumns = [
    {
      id: '_select',
      name: $localize`:@@_select:Select`,
    },
    {
      id: 'action',
      name: $localize`:@@action:Action`,
    },
    {
      id: 'brName',
      name: $localize`:@@name:Rule name`,
    },
    {
      id: 'ruleType',
      name: $localize`:@@type:Rule type`,
    },
    {
      id: 'assignedSchemas',
      name: $localize`:@@schema:Schema`,
    },
    {
      id: 'assignedForms',
      name: $localize`:@@form:Forms`,
    },
    {
      id: 'assignedFlows',
      name: $localize`:@@flows:Flows`,
    },
    {
      id: 'modifiedDate',
      name: $localize`:@@last_modified:Modified Date`,
    },
    {
      id: 'modifiedBy',
      name: $localize`:@@last_modified_by:Modified By`,
    },
    {
      id: 'status',
      name: $localize`:@@status:Status`,
    },
  ];
export class DescriptionRule {
    tableSetting: DescriptiveTable[];
    nounField: string;
    shortDescription?: string;
    longDescription?: string;
    descSetField: string[];
    conditionList: DescriptiveConditionList[]
}

export class DescriptiveTable {
    tableName: string;
    langField: string;
    descField: string;
    descType: string;
}

export class DescriptiveConditionList {
    fieldValue: any[];
    nounModSep: string;
    shortDescSep: string;
    longDescSep: string;
    longDescFormat: string;
    attSep: string;
    attrFormatLongDesc: string;
    shortDescActive: boolean;
    classificationActive: boolean;
    longDescActive: boolean;
    manuallyDesc: boolean;
}

export class ErrorWarnLevel {
    st: string;
    et: string;
    type: string;
    order: string;
    message: string;
}

export class currentConditionMapping {
    fieldId: string = '';
    fieldCtrl: Object = {};
    mappingType: string = '';
    value: string = '';
    ruleId: string = '';
    lookupRule?: any;
}

export enum FieldMappingRulesEnum {
    SOURCE_VALUE = 'SOURCE_VALUE',
    STATIC_VALUE = 'STATIC_VALUE',
    LOOKUP = 'LOOKUP'
}
export const FieldMappingRules: Array<{ruleLabel: string; ruleValue: string}> = [
    { ruleLabel: 'Source value', ruleValue: FieldMappingRulesEnum.SOURCE_VALUE },
    { ruleLabel: 'Static value', ruleValue: FieldMappingRulesEnum.STATIC_VALUE },
    { ruleLabel: 'Lookup rule', ruleValue: FieldMappingRulesEnum.LOOKUP },
]

export const crossDataSetRulesColumns = [
    {
      id: 'action',
      name: $localize`:@@action:Action`,
    },
    {
      id: 'ruleName',
      name: $localize`:@@name:Rule name`,
    }
];