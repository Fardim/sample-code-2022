import { DropDownValue, UDRBlocksModel } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { DisplayCriteria } from '@modules/report/_models/widget';
import { AddFilterOutput } from './schema';

export interface Schemadetailstable {
  matMenu: Array<string>;
  columnInfo: SchemaDetailTableHeader[];
  displayedColumns: string[];
  dataSource: SchemaDataSource[];
  columnName: any;
}

export interface SchemaDetailTableHeader {
  columnId: string;
  columnName: string;
  columnDescription: string;
}

export interface SchemaDataSource {
  materialNumber: string;
  plant: string;
  mrp_type: string;
  mrp_controller: string;
  reorder_point: string;
  max_stock_level: string;
  safety_time: string;
}
export class SendReqForSchemaDataTableColumnInfo {
  objectId: string;
  schemaId: string;
  oldScrollId: string;
  brIds: string;
  sortFields: string;
  filterFields: string;
  srchRanQry: string;
  isDataInsight: boolean;
  isJQGrid: boolean;
  selectedStatus: string;
}
export class SchemaDataTableColumnInfoResponse {
  categoryType: string;
  categoryDataScs: any;
  categoryData: any;
  fieldOrder: string[];
  fieldList: ResponseFieldList[];
}
export class ResponseFieldList {
  name: string;
  width: number;
  index: string;
  label: string;
  hidden: boolean;
  picklist: number;
  dataType: string;
  editable: boolean;
}
export class SchemaTableData {
  fieldId: string;
  fieldData: string;
  fieldCode?: string;
  oldData: string;
  isInError: boolean;
  isCorrected: boolean;
  errorMsg: string;
  fieldDesc: string;
  isReviewed: boolean;
  delFlag?: boolean;
  masterRecord?: string;
  masterByUser?: string;
  ignoreGrp?: boolean;
  isEdited?: boolean;
}
export class SendDataForSchemaTableShowMore {
  constructor(public scrollId: string, public userId: string) { }
}
export class SchemaDownloadErrorRequest {
  userId: string;
  moduleId: string;
  schemaId: string;
  queryMap: string;
  statusType: string;
  runId: string;
}
export class SchemaDataTableResponse {
  data: SchemaTableData[];
}

export class RequestForSchemaDetailsWithBr {
  schemaId: string;
  runId: string;
  brId: string;
  plantCode: string;
  variantId: string;
  requestStatus: string;
  executionStartDate: string;
  selectedFields: string[];
  fetchSize: number;
  fetchCount: number;
  gridId: string[];
  hierarchy: string[];
  schemaThreshold: number;
  afterKey: any;
  filterCriterias: FilterCriteria[];
  sort: {};
  isLoadMore: boolean;
  nodeId?: string;
  nodeType?: string;
  ruleSelected?: string[];
}

export class FilterCriteria {
  fieldId: string;
  values: string[];
  type: string;
  filterCtrl?: AddFilterOutput;
  fldCtrl?: MetadataModel;
  selectedValues?: DropDownValue[];
  textValues?: string[];
  startValue?: string;
  endValue?: string;
  operator?: string;
  dateCriteria?: DateCriteria;
  esFieldPath?: string;
}

export enum DateCriteria {
  yesterday,
  Last_2_Day,
  Last_3_Day,
  Last_4_Day,
  Last_5_Day,
  Last_6_Day,
  Last_Week,
  Last_2_Week,
  Last_3_Week,
  Last_4_Week,
  Last_5_Week,
  Last_6_Week,
  Last_Month,
  Last_2_Month,
  Last_3_Month,
  Last_4_Month,
  Last_5_Month,
  Last_6_Month,
  Last_Year,
  Last_2_Year,
  Last_3_Year,
  Last_4_Year,
  Last_5_Year,
  Last_6_Year,
  This_Quarter,
  Last_Quarter,
  Last_2_Quarter,
  date_range,
  specific_date
}

export class DataTableSourceResponse {
  data: any[];
}
export class DataTableResponse {
  id: string;
  hdvs: DataTableHeaderResponse[];
  gvs: DataTableHeaderResponse[][];
  hyvs: DataTableHeaderResponse[][];
  stat: string[];
  _score: string;
}
export class DataTableHeaderResponse {
  fId: string;
  ls: string;
  vc: DataTableHeaderValueLang;
}
export class DataTableHeaderLabelLang {
  lang: string;
  label: string;
}
export class DataTableHeaderValueLang {
  c: string;
  t: string;
}

export class SchemaTableViewRequest {
  userId: string;
  plantCode: string;
  schemaTableViewMapping: SchemaTableViewFldMap[];
  schemaId: string;
  isDefaultView: boolean;
  variantId: string;
}
export class SchemaTableViewFldMap {
  fieldId: string;
  order: number;
  editable: boolean;
  isEditable: boolean;
  nodeId?: string;
  nodeType?: string;
  metadataCreateModel?: MetadataModel;
  isSelected?: boolean;
  parentField?: any;
}
export class SchemaExecutionDetails {
  schemaId: string;
  variantId: string;
  runId: number;
  exeStrtDate: string;
  exeEndDate: string;
  userId: string;
  plantCode: string;
  total: number;
  totalSuccess: number;
  totalError: number;
  uniqueSuccess: number;
  uniqueError: number;
  uniqueSkipped: number;
  skipped: number;
  outdated: number;
  duplicate: number;
  isInRunning: boolean;
  isInterrupted: boolean;
  interruptedMessage: string;
  successPercentage: number;
  errorPercentage: number;
  brExecutionDetails: SchemaBrExecutionDetails[];
}
export class SchemaBrExecutionDetails {
  brId: string;
  outdated: number;
  success: number;
  duplicate: number;
  error: number;
  skipped: number;
  runId: number;
  isInterrupted: boolean;
  interruptedMessage: string;
  exeStrtDate: string;
  exeEndDate: string;
}
export class OverViewChartDataSet {
  dataSet: OverViewChartData[];
}
export class OverViewChartData {
  type: string;
  label: string;
  id: string;
  backgroundColor: string;
  borderColor: string;
  fill: boolean;
  pointRadius: number;
  pointBackgroundColor: string;
  data: OverViewChartDataXY[];
}
export class OverViewChartDataXY {
  x: string;
  y: number;
}
export class CategoryInfo {
  categoryId: string;
  categoryDesc: string;
}

export class CategoryChartDataSet {
  dataSet: OverViewChartData[];
  schemaId: string;
  runId: string;
  variantId: string;
  schemaStatus: string;
  categoryId: string;
  categoryDesc: string;
  total: number;
}
export class CategoryChartData {
  type: string;
  label: string;
  id: string;
  backgroundColor: string;
  borderColor: string;
  fill: boolean;
  pointRadius: number;
  pointBackgroundColor: string;
  data: CategoryChartDataXY[];
  total: number;
  brDesc: string;
}
export class CategoryChartDataXY {
  x: string;
  y: number;
}

export interface MetadataModel {
  fieldId: string;
  fieldDescri: string;
  dataType: string;
  maxChar: string;
  mandatory: string;
  backEnd: number;
  systemId: string;
  pickTable: string;
  picklist: string;
  pickService: string;
  dependency: string;
  validationService: string;
  defaultValue: string;
  eventService: string;
  outputLen: string;
  strucId: string;
  permission: string;
  intUse: string;
  intUseService: string;
  searchEngin: string;
  ajax: string;
  keys: string;
  flag: string;
  objecttype: string;
  parentField: string;
  reference: string;
  languageIndependent: string;
  gridDisplay: string;
  defaultDate: string;
  workFlowField: string;
  repField: string;
  locType: string;
  descField: string;
  refField: string;
  workflowCriteria: string;
  numberSettingCriteria: string;
  isCheckList: string;
  isCompBased: string;
  textAreaLength: string;
  textAreaWidth: string;
  plantCode: string;
  defaultDisplay: string;
  isCompleteness: string;
  criteriaDisplay: string;
  isShoppingCartRefField: boolean;
  displayCriteria?: DisplayCriteria;
  sno?: DisplayCriteria;
  nodeId?: string;
  nodeType?: string;
  fieldType?: string;
  pickList?: string;
}
export class Heirarchy {
  objnr: number;
  heirarchyId: string;
  heirarchyText: string;
  fieldId: string;
  structureId: string;
  tableName: string;
  objectType: string;
  child?: MetadataModel[];
  fieldDescri: string;
  strucDesc: string
}

export class MetadataModeleResponse {
  headers: any;
  grids: any;
  hierarchy: Heirarchy[];
  gridFields: any;
  hierarchyFields: any;
}

export class TargetSystemResponse {
  connid: string | number;
  name: string;
}

export class LookupTableMetadata {
  tabname?: string;
  fieldname: string;
  offset?: string;
  length?: string;
  type?: string;
  fieldtext: string;
}

export class HeirarchyFields {
  fieldId: string;
  fieldDesc: string;
  fields: MetadataModel[];
}

export class GridFields {
  fieldId: string;
  fieldDesc: string;
  fields: MetadataModel[];
}

export class DataTableReqType {
  static error = 'error';
  static success = 'success';
  static all = 'all';
  static duplicate = 'duplicate';
  static outDated = 'outdated';
}

export class DataTableGroupBy {
  objectNumber: string;
  isGroup: boolean;
}

export class SchemaBrInfo {
  brType: string;
  dynamicMessage: string;
  brId: string;
  schemaId: string;
  refId: string;
  fields: string;
  schemaOrder: number;
  brDescription: string;
  udrblocks: UDRBlocksModel[];
  transformationModel: TransformationFormData[];
}

export class FieldExitsResponse {
  fieldId: string;
  gridId: string;
  gridObjNum: string;
  hierarchyId: string;
}

export interface SchemaCorrectionReq {
  id: string[];
  fldId: string;
  gridId: string;
  heirerchyId: string;
  vc: string;
  vt?: string;
  rowSno: string;
  isReviewed: boolean;
}

export interface SchemaExecutionLog {
  id: string;
  schemaId: string;
  variantId: string;
  runId: string;
  exeStrtDate: number;
  exeEndDate: number;
  userId: string;
  plantCode: string;
  total: number;
  totalSuccess: number;
  correctionValue: number;
  totalError: number;
  uniqueSuccess: number;
  uniqueError: number;
  uniqueSkipped: number;
  skipped: number;
  outdated: number;
  duplicate: number;
  isInRunning: boolean;
  isInterrupted: boolean;
  interruptedMessage: string;
  successPercentage: number;
  errorPercentage: number;
  reIndexTaskId: string;
}

export class SchemaExecutionSummary {
  totalErrorPer: number;
  uniqueErrorPer: number;
  totalSuccessPer: number;
  uniqueSuccessPer: number;
  total: number;
  runBy: string;
  startTime: number;
  isInRunning: boolean;
  exeEndDate: number;
  completeProgress: number;
}

export enum FieldInputType {
  NUMBER,
  TEXT,
  DATE,
  SINGLE_SELECT,
  MULTI_SELECT,
}

export interface FieldConfiguration {
  list: any[];
  labelKey: string;
  valueKey: string;
}

export interface UDRDropdownValue {
  CODE: string;
  PLANTCODE: string;
  SNO: string;
  FIELDNAME: string;
  TEXT: string;
  LANGU: string;
  CLIENTID: string;
  code?: string;
  text?: string;
  textRef?: string;
}

export interface TransformationFormData {
  sourceFld: string;
  targetFld: string;
  excludeScript: string;
  includeScript: string;
  selectedTargetFields?: any[];
  transformationRuleType?: string;
  parameter: UDRBlocksModel;
}

export interface TransformationInfo {
  type?: string;
  constant?: ConstantRule[];
  empty_space?: EmptySpaceRule;
  zero?: ZeroRule;
  lookup?: LookupRule;
  date?: DateRule;
}

export interface DateRule {
  type?: string;
  fldId?: string;
  fldCtrl?: any;
  fields?: ZeroRuleFields[]
}

export interface DateRule {
  type?: string;
  fldId?: string;
  fldCtrl?: any;
  fields?: ZeroRuleFields[]
}
export interface LookupData {
  objectdesc: string;
  objectid: string;
}

export interface LookupFormData {
  moduleId: string;
  lookupColumnResult: string;
  lookupColumn: string;
}

export interface LookupFields {
  fieldDescri: string;
  fieldId: string;
  fieldLookupConfig: LookupFormData;
  lookupTargetField: string;
  lookupTargetText: string;
  enableUserField: boolean;
}

export interface NewBrDialogResponse {
  formData: any;
  tempId: string;
  lookupData: LookupFields[];
  isDRChildRule?: boolean;
}
export interface ClassificationNounMod {
  MRO_MANU_PRT_NUM_LOOKUP: { doc_cnt: number; info: Noun[] };
  MRO_CLS_MASTER_CHECK: { doc_cnt: number; info: Noun[] };
  unmatched: { doc_count: number };
}

export interface Noun {
  doc_cnt?: number;
  nounCode: string;
  nounId: string;
  nounDesc?: string;
  nounSortDesc: string;
  modifier: Modifier[];
}
export interface Modifier {
  doc_cnt?: number;
  modCode: string;
  modText: string;
  modDesc?: string;
}

export class SchemaMROCorrectionReq {
  id: string;
  nounCodevc: string;
  nounCodeoc: string;
  modCodevc: string;
  modCodeoc: string;
  attributeCorReq: AttributeCoorectionReq[];
  isReviewed: boolean;
  reviewedBy: string;
  isSubmitted: string;
  masterLibrary: boolean;
  fromUnmatch?: boolean;
}

export interface AttributeCoorectionReq {
  attributeCodevc: string;
  attributeCodeoc: string;
  attributeValvc: string;
  attributeValoc: string;
}

export class SchemaTableAction {
  sno: string;
  schemaId: string;
  role: SchemaActionRole;
  actionCode: string;
  actionText: string;
  actionViewType: TableActionViewType;
  actionOrder: number;
  actionIconLigature: string;
  isPrimaryAction: boolean;
  isCustomAction: boolean;
  refBrId: string;
  createdBy: string;
}

export enum SchemaActionRole {
  EDITOR = 'EDITOR',
  REVEIWER = 'REVEIWER',
  APPROVER = 'APPROVER',
}

export enum TableActionViewType {
  TEXT = 'TEXT',
  ICON = 'ICON',
  ICON_TEXT = 'ICON_TEXT',
}

export enum STANDARD_TABLE_ACTIONS {
  APPROVE = 'Approve',
  REJECT = 'Reject',
  DELETE = 'Delete',
  GENERATE_DESC = 'GENERATE_DESCRIPTION',
}

export interface CrossMappingRule {
  sno: string;
  desc: string;
  parentModule: string;
  childModule: string;
  linkingField: string;
  type: number;
  plantCode: string;
  userid: string;
  datemodified: Date;
  crReq: string;
  validateReq: string;
  schemaId: string;
}

export enum DetailView {
  DATAQUALITY_VIEW = 'DATAQUALITY_VIEW',
  DUPLICACY_VIEW = 'DUPLICACY_VIEW',
  MRO_CLASSIFICATION_VIEW = 'MRO_CLASSIFICATION_VIEW',
  POTEXT_VIEW = 'POTEXT_VIEW',
}

export interface ParentField {
  fieldDescri: string;
  fieldId: string;
}

export interface GlobalCounts {
  successCount: number;
  errorCount: number;
  skippedCount: number;
}

export class ClassificationHeader {
  colId: string;
  desc: string;
  mandatory: boolean;
  dropdown: boolean;
  fieldType: 'NUMERIC' | 'ALPHA_NUMERIC' | 'TEXT';
  descActive: boolean;
  length: number;
  order: number;
  colSno: string;
}

export class AttributeValue {
  shortValue: string;
  numValue: string;
  longValue: string;
  refSno: string;
  price: string;
  imageSno: string;
  formulaeSno: string;
  attributeValuesPk?: {
    [index: string]: string;
  }
}

export class ValidateCellRes {
  status: 'ERROR' | 'SUCCESS';
  allFieldsLogs: AllFieldsLogs[];
}

class AllFieldsLogs {
  fieldId: string;
  errMsg: string;
}

export interface ConstantRule {
  fldId: string,
  fldCtrl?: {},
  order: number,
  value: string,
  valueCtrl?: {}
}


export interface ZeroRule {
  type: string;
  fields: ZeroRuleFields[]
}

export interface EmptySpaceRule {
  isRemoveLeadingSpace: boolean;
  isRemoveTraillingSpace: boolean;
  isRemoveAll: boolean;
  fields: ZeroRuleFields[]
}

export interface ZeroRuleFields {
  fldId: string;
  fldCtrl?: any;
  order: number;
}


export interface LookupRule {
  lookupRuleMetadata: LookupRuleMetadata,
  type: string,
  udrData: any
}

export interface LookupRuleMetadata {
  brId?: string
  checkCodeDesc?: string
  checkCodes?: Array<string>,
  lookupDataset?: string,
  lookupStr?: number | string,
  lookupTable?: string
  lookupType: string
  sno?: number | string
  targetSystem?: string,
}

export const PermissionsList = [
  {type: 'addRow', label: 'Add row'},
  {type: 'copyRow', label: 'Copy Row'},
  {type: 'editRow', label: 'Edit Row'},
  {type: 'export', label: 'Export Data'},
  {type: 'import', label: 'Import Data'},
  {type: 'removeRow', label: 'Delete Row'}
]