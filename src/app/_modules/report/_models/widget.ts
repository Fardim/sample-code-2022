import { MetadataModel } from 'src/app/_models/schema/schemadetailstable';
import * as moment from 'moment';

export class Widget {
  x: number;
  y: number;
  height: number;
  width: number;
  widgetId: string;
  widgetType: WidgetType;
  widgetTitle: string;
  field: string;
  aggregrationOp: string;
  filterType: string;
  isMultiSelect: boolean;
  orderWith: OrderWith;
  groupById: string;
  widgetTableFields: WidgetTableModel[];
  htmlText: string;
  imagesno: string;
  imageName: string;
  imageUrl: string;
  objectType: string;

  chartProperties: ChartProperties;
  defaultFilters: Criteria[];

  fieldCtrl?: MetadataModel;
  groupByIdCtrl?: MetadataModel;
  dateFilterCtrl?: DateFilterCtrl;
  isWorkflowdataSet: boolean;
  workflowPath: string[];
  distictWith: string;
  isCustomdataSet: boolean;
  pageDefaultSize: number;
  isFieldDistinct: boolean;
  displayCriteria: DisplayCriteria;
  isEnableGlobalFilter: boolean;
  applyDistinct: boolean;
  rangeBucketLimit: number;
  rangeBucketSize: number;
  rangeDateFormatInterval: SeriesWith;
  rangeCalculationFld: MetadataModel;
  isEnableRange: boolean;
  isStepwiseSLA: boolean;
  workflowPathSteps: string[];
  measureFld: string;
  datasetType? : string;
}

export interface DateFilterCtrl {
  dateSelectedFor: DateSelectionType;
  startDate?: string;
  endDate?: string;
}

export enum DateSelectionType {
  TODAY = 'TODAY',
  DAY_7 = 'DAY_7',
  DAY_10 = 'DAY_10',
  DAY_20 = 'DAY_20',
  DAY_30 = 'DAY_30',
  CUSTOM = 'CUSTOM',
}

export enum WidgetType {
  FILTER = 'FILTER',
  BAR_CHART = 'BAR_CHART',
  PIE_CHART = 'PIE_CHART',
  STACKED_BAR_CHART = 'STACKED_BAR_CHART',
  COUNT = 'COUNT',
  TABLE_LIST = 'TABLE_LIST',
  IMAGE = 'IMAGE',
  HTML = 'HTML',
  TIMESERIES = 'TIMESERIES',
}

export interface WidgetMapInfo {
  sno: number;
  reportId: number;
  widgetId: number;
  positionX: number;
  positionY: number;
  height: number;
  width: number;
  widgetType: string;
}

export class Criteria {
  fieldId: string;
  conditionFieldId: string;
  conditionFieldValue: string;
  blockType: BlockType;
  conditionOperator: ConditionOperator;
  conditionFieldStartValue: string;
  conditionFieldEndValue: string;
  udrid: string;
  widgetType?: WidgetType;
  conditionFieldValueText?: string;
  widgetId?: number;
  fieldCtrl? : any;
}
export enum BlockType {
  AND = 'AND',
  OR = 'OR',
  COND = 'COND',
}
export enum ConditionOperator {
  AGG_GROUP_BY = 'AGG_GROUP_BY',
  EQUAL = 'EQUAL',
  MULTI_SELECT = 'MULTI_SELECT',
  FIELD2FIELD = 'FIELD2FIELD',
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',
  CONTAINS = 'CONTAINS',
  REGEX = 'REGEX',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
  LESS_THAN = 'LESS_THAN',
  LESS_THAN_EQUAL = 'LESS_THAN_EQUAL',
  GREATER_THAN = 'GREATER_THAN',
  GREATER_THAN_EQUAL = 'GREATER_THAN_EQUAL',
  RANGE = 'RANGE',
  COUNT_IN = 'COUNT_IN',
  COUNT_LESS_THAN = 'COUNT_LESS_THAN',
  COUNT_LESS_THAN_EQUAL = 'COUNT_LESS_THAN_EQUAL',
  COUNT_GREATER_THAN = 'COUNT_GREATER_THAN',
  COUNT_GREATER_THAN_EQUAL = 'COUNT_GREATER_THAN_EQUAL',
  COUNT_RANGE = 'COUNT_RANGE',
  EMPTY = 'EMPTY',
  NOT_EMPTY = 'NOT_EMPTY',
  AVG_IN = 'AVG_IN',
  AVG_LESS_THAN = 'AVG_LESS_THAN',
  AVG_LESS_THAN_EQUAL = 'AVG_LESS_THAN_EQUAL',
  AVG_GREATER_THAN = 'AVG_GREATER_THAN',
  AVG_GREATER_THAN_EQUAL = 'AVG_GREATER_THAN_EQUAL',
  AVG_RANGE = 'AVG_RANGE',
  MAX_IN = 'MAX_IN',
  MAX_LESS_THAN = 'MAX_LESS_THAN',
  MAX_LESS_THAN_EQUAL = 'MAX_LESS_THAN_EQUAL',
  MAX_GREATER_THAN = 'MAX_GREATER_THAN',
  MAX_GREATER_THAN_EQUAL = 'MAX_GREATER_THAN_EQUAL',
  MAX_RANGE = 'MAX_RANGE',
  MIN_IN = 'MIN_IN',
  MIN_LESS_THAN = 'MIN_LESS_THAN',
  MIN_LESS_THAN_EQUAL = 'MIN_LESS_THAN_EQUAL',
  MIN_GREATER_THAN = 'MIN_GREATER_THAN',
  MIN_GREATER_THAN_EQUAL = 'MIN_GREATER_THAN_EQUAL',
  MIN_RANGE = 'MIN_RANGE',
  LOCATION = 'LOCATION',
  NOT_EQUAL = 'NOT_EQUAL',
}
export class FilterWidget {
  widgetId: number;
  type: string;
  fieldId: string;
  isMultiSelect: boolean;
  metaData: MetadataModel;
  orderWith: string;
}

export interface DropDownValues {
  sno: number;
  FIELDNAME: string;
  TEXT: string;
  langu: string;
  CODE: string;
  display: string;
}

export enum AggregationOperator {
  GROUPBY = 'GROUPBY',
  COUNT = 'COUNT',
  MIN = 'MIN',
  MAX = 'MAX',
  SUM = 'SUM',
  MEDIAN = 'MEDIAN',
  AVG = 'AVERAGE/MEAN',
  MODE = 'MODE',
}

export enum PositionType {
  LEFT = 'left',
  RIGHT = 'right',
  TOP = 'top',
  BOTTOM = 'bottom',
}

export enum AlignPosition {
  CENTER = 'center',
  END = 'end',
  START = 'start',
}

export enum AnchorAlignPosition {
  CENTER = 'center',
  END = 'end',
  START = 'start',
}

export class BarChartWidget {
  widgetId: number;
  fieldId: string;
  aggregationOperator: AggregationOperator;
  isEnableDatalabels: boolean;
  isEnableLegend: boolean;
  orientation: Orientation;
  legendPosition: PositionType;
  datalabelsPosition: AlignPosition;
  anchorPosition: AnchorAlignPosition;
  displayAxisLabel: boolean;
  xAxisLabel: string;
  yAxisLabel: string;
  bgColor: string;
  borderColor: string;
  chartType: ChartType;
  metaData: MetadataModel;
  orderWith: OrderWith;
  scaleFrom: number;
  scaleTo: number;
  stepSize: number;
  dataSetSize: number;
  blankValueAlias: string;
  widgetColorPalette: WidgetColorPalette;
  isEnabledBarPerc: boolean;
  showTotal: boolean;
}

export class StackBarChartWidget {
  widgetId: number;
  groupById: string;
  fieldId: string;
  aggregationOperator: AggregationOperator;
  isEnableDatalabels: boolean;
  isEnableLegend: boolean;
  legendPosition: PositionType;
  datalabelsPosition: AlignPosition;
  anchorPosition: AnchorAlignPosition;
  displayAxisLabel: boolean;
  xAxisLabel: string;
  yAxisLabel: string;
  orientation: Orientation;
  fieldIdMetaData: MetadataModel;
  groupByIdMetaData: MetadataModel;
  orderWith: OrderWith;
  scaleFrom: number;
  scaleTo: number;
  stepSize: number;
  dataSetSize: number;
  blankValueAlias: string;
  widgetColorPalette: WidgetColorPalette;
  showTotal: boolean;
}

export class PieChartWidget {
  widgetId: number;
  fieldId: string;
  aggregationOperator: AggregationOperator;
  isEnableDatalabels: boolean;
  isEnableLegend: boolean;
  orientation: string;
  legendPosition: PositionType;
  datalabelsPosition: AlignPosition;
  anchorPosition: AnchorAlignPosition;
  metaData: MetadataModel;
  blankValueAlias: string;
  isEnabledBarPerc: boolean;
}

export class Count {
  widgetId: number;
  fieldId: string;
  aggregationOperator: AggregationOperator;
  isFieldDistinct: boolean;
  filterCriteria: Criteria[];
}

export class ReportingWidget {
  widgetId: number;
  fields: string;
  fieldOrder: string;
  fieldDesc: string;
  sno: number;
  fldMetaData: MetadataModel;
  displayCriteria: DisplayCriteria;
}

export class WidgetHeader {
  widgetId: number;
  widgetName: string;
  widgetType: WidgetType;
  objectType: string;
  plantCode: string;
  indexName: string;
  desc: string;
  isWorkflowdataSet: boolean;
  pageDefaultSize: number;
  isCustomdataSet: boolean;
  displayCriteria: DisplayCriteria;
  isEnableGlobalFilter: boolean;
}

export interface ChartLegend {
  legendIndex: number;
  code: string;
  text: string;
}

export class FilterResponse {
  min: number;
  max: number;
  fieldId: string;
}

export interface TimeSeriesWidget {
  widgetId: number;
  widgetName: string;
  widgetType: WidgetType;
  objectType: string;
  plantCode: string;
  indexName: string;
  desc: string;
  timeSeries: WidgetTimeseries;
  isEnableGlobalFilter: boolean;
}
export interface WidgetTimeseries {
  widgetId: number;
  fieldId: string;
  seriesWith: SeriesWith;
  seriesFormat: string;
  aggregationOperator: AggregationOperator;
  chartType: ChartType;
  isEnableDatalabels: boolean;
  isEnableLegend: boolean;
  legendPosition: PositionType;
  datalabelsPosition: AlignPosition;
  xAxisLabel: string;
  yAxisLabel: string;
  scaleFrom: number;
  scaleTo: number;
  stepSize: number;
  dataSetSize: number;
  groupWith: string;
  widgetColorPalette: WidgetColorPalette;
  distictWith: string;
  showInPercentage: boolean;
  bucketFilter: string;
  startDate: string;
  metaData: MetadataModel;
  showTotal: boolean;
}
export enum SeriesWith {
  millisecond = 'millisecond',
  second = 'second',
  minute = 'minute',
  hour = 'hour',
  day = 'day',
  week = 'week',
  month = 'month',
  quarter = 'quarter',
  year = 'year',
}

export class ReportDashboardReq {
  reportId: string;
  reportName: string;
  widgetReqList: Widget[];
}

export interface WidgetTableModel {
  widgetId: string;
  fields: string;
  fieldOrder: number;
  fieldDesc: string;
}

export class WidgetHtmlEditor {
  widgetId: number;
  htmlText: string;
}

export class WidgetImageModel {
  widgetId: number;
  imagesno: string;
  imageUrl: string;
  imageName: string;
}

export enum ChartType {
  BAR = 'BAR',
  PIE = 'PIE',
  LINE = 'LINE',
}

export enum Orientation {
  VERTICAL = 'VERTICAL',
  HORIZONTAL = 'HORIZONTAL',
}

export enum DatalabelsPosition {
  center = 'center',
  start = 'start',
  end = 'end',
}

export enum LegendPosition {
  top = 'top',
  left = 'left',
  bottom = 'bottom',
  right = 'right',
}

export enum OrderWith {
  ASC = 'asc',
  DESC = 'desc',
  ROW_ASC = 'ROW_ASC',
  ROW_DESC = 'ROW_DESC',
  COL_ASC = 'COL_ASC',
  COL_DESC = 'COL_DESC',
}

export class ChartProperties {
  chartType: ChartType;
  orientation: Orientation;
  isEnableDatalabels: boolean;
  datalabelsPosition: DatalabelsPosition;
  isEnableLegend: boolean;
  legendPosition: LegendPosition;
  xAxisLabel: string;
  yAxisLabel: string;
  orderWith: OrderWith;
  scaleFrom: number;
  scaleTo: number;
  stepSize: number;
  dataSetSize: number;
  seriesWith: SeriesWith;
  seriesFormat: string;
  blankValueAlias: string;
  timeseriesStartDate: TimeseriesStartDate;
  isEnabledBarPerc: boolean;
  bucketFilter: string;
  hasCustomSLA: boolean;
  slaValue?: string;
  slaType?: object;
  showTotal: boolean;
}

export class ButtonArr {
  id: number;
  value: string;
  isActive: boolean;
}

export enum TimeseriesStartDate {
  D7 = '7',
  D10 = '10',
  D20 = '20',
  D30 = '30',
}

export class ReportDashboardPermission {
  permissionId: number;
  reportId: number;
  userId: string;
  roleId: string;
  groupId: string;
  isEditable: boolean;
  isViewable: boolean;
  isDeleteable: boolean;
  isAdmin: boolean;
  permissionType: PermissionType;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}
export enum PermissionType {
  USER = 'USER',
  ROLE = 'ROLE',
  GROUP = 'GROUP',
}

export class LayoutFieldsResponse {
  tcode: number;
  fieldId: string;
  fieldDescri: string;
  dataType: string;
  picklist: number;
  dispCriteria: number;
  strucId: string;
  mandatory: boolean;
  hidden: boolean;
  isCheckList: boolean;
  maxChar: number;
  dependency: string;
  parentField: string;
  locType: string;
  refField: string;
  textAreaLength: number;
  textAreaWidth: number;
  value: string;
  sno: string;
  showMore?: boolean;
}

export class LayoutTabResponse {
  tabCode: string;
  tabDesc: string;
  headerType: string;
  helpLink: string;
  refParentObjectId: string;
  fieldsList: LayoutFieldsResponse[];
}

export class MDORECORDESV3 {
  id: string;
  stat: string;
  hdvs: { string: FieldValueV2 };
}

export class FieldValueV2 {
  fId: string;
  vc: FieldCodeText[];
  oc: FieldCodeText[];
  ls: string;
}

export class FieldCodeText {
  c: string;
  t: string;
  p: string;
}
export interface AssginedColor {
  code: string;
  text: string;
  colorCode: string;
}

export class WidgetColorPalette {
  reportId: string;
  widgetId: string;
  widgetDesc: string;
  colorPalettes: AssginedColor[];
}

export class DateFilterQuickSelect {
  text: string;
  code: string;
  isSelected: boolean;
}

export class WorkflowFieldRes {
  dynamic: MetadataModel[];
  static: MetadataModel[];
}
export class DateBulder {
  /**
   * Help to return range of date
   * string[0] start date
   * string[1] end date
   * @param dateSelectedFor param for take date selected type
   */
  public build(dateSelectedFor: DateSelectionType): string[] {
    let startDate = '';
    let endDate = '';
    switch (dateSelectedFor) {
      case DateSelectionType.TODAY:
        startDate = String(moment().startOf('day').toDate().getTime());
        endDate = String(moment().endOf('day').toDate().getTime());
        break;

      case DateSelectionType.DAY_7:
        startDate = String(moment().add(-7, 'days').startOf('day').toDate().getTime());
        endDate = String(moment().endOf('day').toDate().getTime());
        break;

      case DateSelectionType.DAY_10:
        startDate = String(moment().add(-10, 'days').startOf('day').toDate().getTime());
        endDate = String(moment().endOf('day').toDate().getTime());
        break;

      case DateSelectionType.DAY_20:
        startDate = String(moment().add(-20, 'days').startOf('day').toDate().getTime());
        endDate = String(moment().endOf('day').toDate().getTime());
        break;

      case DateSelectionType.DAY_30:
        startDate = String(moment().add(-30, 'days').startOf('day').toDate().getTime());
        endDate = String(moment().endOf('day').toDate().getTime());
        break;

      default:
        break;
    }
    if (startDate && endDate) {
      return [startDate, endDate];
    }
    return null;
  }
}

export class LayoutConfigWorkflowModel {
  sno: string;
  layoutId: string;
  workflowid: string;
  step: string;
  objectType: string;
  plantCode: string;
  initiatorLayout: string;
  layoutDesc: string;
}

export enum DisplayCriteria {
  CODE = 'CODE',
  TEXT = 'TEXT',
  CODE_TEXT = 'CODE_TEXT',
}

export interface DuplicateReport {
  acknowledged: boolean;
  errorMsg: string;
  reportId: string;
  reportName: string;
}

export enum OutputFormat {
  CODE = 'CODE',
  TEXT = 'TEXT',
  CODE_TEXT = 'CODE AND TEXT',
}

export enum FormControlType {
  MULTI_SELECT = 'multiselectDropdown',
  DROP_DOWN = 'dropdown',
  TEXT = 'text',
  NUMBER = 'number',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  TEXTAREA = 'textarea',
  DATE = 'date',
  DATE_TIME = 'dateTime',
  TIME = 'time',
}
export interface ImportReport {
  acknowledge: boolean;
  alreadyExits: boolean;
  reportId: string;
  reportName: string;
  importedBy: string;
  importedAt: number;
  updatedAt: number;
  fileSno: number;
  logs?: ImportReportLog[];
}

export interface ImportReportLog {
  messageId: number;
  reportId: number;
  category: ReportCategory;
  message: string;
  status: string;
  createdAt: number;
  updatedAt: number;
  updatedBy: string;
}

export interface WidgetViewDetails {
  acknowledge: boolean;
  payload: WidgetViewPayload;
}

export interface WidgetViewPayload {
  uuid: string;
  reportId: number;
  widgetId: number;
  view: string;
  userName: string;
  tenantCode: number;
  createdAt: number;
  updatedAt: number;
}

export interface WidgetViewRequestPayload {
  uuid: string;
  reportId: number;
  widgetId: number;
  view: string;
}

export enum WidgetView {
  TABLE_VIEW = 'TABLE',
  GRAPH_VIEW = 'GRAPH',
}

export enum ReportCategory {
  DUPLICATE_REPORT = 'DUPLICATE_REPORT',
  MISSING_MODULE = 'MISSING_MODULE',
  MISSING_FIELDS = 'MISSING_FIELDS',
  MISSING_WRKFLOW = 'MISSING_WORKFLOW',
}

export enum FilterWith {
  DROPDOWN_VALS = 'DROPDOWN_VALS',
  HORIZONTAL_VALS = 'HORIZONTAL_VALS',
  VERTICAL_VALS = 'VERTICAL_VALS',
}

export enum BucketFilter {
  WITHIN_1_DAY = 'within_1_day',
  MORE_THEN_1_DAY = 'more_then_1_day',
}

export interface Buckets {
  doc_count: string;
  key: string;
}

export interface SlaStepSize {
  stepId: string;
  desc: string;
}
