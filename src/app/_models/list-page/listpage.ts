import { PageInfo } from '@models/teams';

export interface ListFilters {
    textInput: string;
    status: Array<object>;
    superior: Array<object>;
    planner: Array<object>;
    modified_from_date: string;
    modified_to_date: string;
    creation_from_date: string;
    creation_to_date: string;
    record: string;
}

export interface ListFunctionFilters {
    dataType: string;
    fieldName: string;
    fieldid: string;
    fieldtype: string;
    picklist: string;
    criteriaDisplay: string;
    isCheckList: boolean;
    referenceField: boolean;
    descField: string;
    refField: string;
    searchengine: string;
    isProductHierarchy: boolean;
    alternateNumField: boolean;
}

export interface ListPageRow {
    MaterialID: string;
    Description: string;
    MaterialType: string;
    Modifiedby: string;
    Modifiedon: string;
    Status: string;
    Tags: Array<object>;
}

export interface ListDynamicPageRow {
    dataType: string;
    fieldName: string;
    colWidth: number;
    enableEditing: boolean;
    filterCritera: string;
    fieldText: string;
    pickList: number;
    textAlign: string;
    ischeckList: string;
    descField: string;
    criteriaDisplay: string;
}

export interface FilterListRequest {
    fieldId: string,
    objectId: string,
    plantCode: string,
    clientId: number,
    language: string,
    fetchCount: number,
    searchTerm: string,
    fetchSize: number
}

export interface TableColumndata {
    colWidth: number,
    criteriaDisplay: string,
    dataType: string,
    descField: string,
    disabled: boolean,
    enableEditing: boolean,
    fieldName: string,
    fieldText: string,
    filterCritera: string,
    ischeckList: string,
    pickList: string,
    textAlign: string,
    visible: boolean
}

export interface TableColumndatastatic {
    colWidth: number,
    criteriaDisplay: string,
    dataType: string,
    descField: string,
    disabled: boolean,
    enableEditing: boolean,
    fieldName: string,
    fieldText: string,
    filterCritera: string,
    ischeckList: string,
    pickList: string,
    textAlign: string,
    visible: boolean
}

export interface FilterListdata {
    CODE: string;
    TEXT: string;
    checked: boolean;
    fieldid: string;
}

export interface Pagination {
    length: number,
    per_page: number,
    page_number: number
}

export class Status {
    display: string;
    value: string;
    selected: boolean;
}

export class Superior {
    display: string;
    value: string;
    selected: boolean;
}

export class Planner {
    display: string;
    value: string;
    selected: boolean;
}

export class ListPageViewDetails {
    viewId: string;
    viewName: string;
    moduleId: string;
    isDefault = false;
    isSystemView = false;
    fieldsReqList: ListPageViewFldMap[] = [];
}

export class ListPageViewFldMap {
    sno: number;
    fieldId: string;
    fieldOrder: string;
    width = '100';
    isEditable: boolean;
    sortDirection = 'ASCENDING';
}

export enum ColumnSortDirection {
    asc = 'ASCENDING',
    desc = 'DESCENDING'
}

export class ColumnSortDetails {
    id: string;
    direction: ColumnSortDirection;
}

export class FilterCriteria {
    endValue: string;
    esFieldPath: string;
    fieldId: string;
    type: string;
    operator: string;
    startValue: string;
    unit: string;
    values: string[];
    fieldType: string;
    isUpdated?: boolean;
}

export class ListPageFilters {
    filterId: string;
    filterOrder: number;
    description: string;
    isDefault: boolean;
    moduleId: string;
    filterCriteria: FilterCriteria[] = [];
    vid?: string;
}

export class ViewsPage {
    systemViews: ViewsPageItem[] = [];
    userViews: ViewsPageItem[] = [];
}

export class ViewsPageItem {
    viewId: string;
    viewName: string;
    default: boolean;
}

export enum FieldControlType {
    TEXT = 'text',
    TEXT_AREA = 'text-area',
    EMAIL = 'email',
    PASSWORD = 'password',
    NUMBER = 'number',
    SINGLE_SELECT = 'single-select',
    MULTI_SELECT = 'multi-select',
    DATE = 'date',
    DATE_TIME = 'date-time',
    TIME = 'time',
    STATUS = 'status',
    DECIMAL = 'decimal',
    RADIO = 'radio',
    CHECKBOX = 'checkbox',
    HTML = 'html',
    USERSELECTION = 'user-selection',
    ATTACHMENT = 'attachment',
    GEOLOCATION = 'geolocation',
    DIGITALSIGNATURE = 'digital-signature',
    LIST = 'list',
    ALTN = 'alternate-number',
    ISCN = 'integration-scenario',
    REQ = 'request-type',
    URL = 'url',
    GRID='grid',
    ACTIVATE_DEACTIVATE='activate-deactivate',
    DATASET_REFERENCE= 'dataset-reference'
}

export class InboxNodesCount {
  hasNewFeeds: boolean;
  id: string;
  label: string;
  new_feed_cnt: number;
  rec_cnt: number;
  childs?: InboxNodesCount[];
}

export const editorConfig = {
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike', { list: 'ordered' }, { list: 'bullet' }, { color: [] }, { background: [] }], // toggle buttons
    ],
  },
  placeholder: 'information for field on mouse hover of input',
  theme: 'snow', // or 'bubble'
};

export const DATE_FILTERS_METADATA = [
    {label: 'Day', category: 'dynamic_range', options: [
        {value:'Today', startUnit:'day', startAmount:0, endUnit:'day', endAmount:0},
        {value:'Yesterday', startUnit:'day', startAmount:1, endUnit:'day', endAmount:1},
        {value:'Last 2 days', startUnit:'day', startAmount:1, endUnit:'day', endAmount:0},
        {value:'Last 3 days', startUnit:'day', startAmount:2, endUnit:'day', endAmount:0},
        {value:'Last 4 days', startUnit:'day', startAmount:3, endUnit:'day', endAmount:0},
        {value:'Last 5 days', startUnit:'day', startAmount:4, endUnit:'day', endAmount:0},
        {value:'Last 6 days', startUnit:'day', startAmount:5, endUnit:'day', endAmount:0}
    ]},
    {label: 'Week', category:'dynamic_range', options: [
        {value:'This week', startUnit:'week', startAmount:0, endUnit:'week', endAmount:0},
        {value:'Last week', startUnit:'day', startAmount:6, endUnit:'day', endAmount:0},
        {value:'Last 2 weeks', startUnit:'day', startAmount:13, endUnit:'day', endAmount:0},
        {value:'Last 3 weeks', startUnit:'day', startAmount:20, endUnit:'day', endAmount:0}
    ]},
    {label: 'Month', category:'dynamic_range', options: [
        {value:'This month', startUnit:'month', startAmount:0, endUnit:'month', endAmount:0},
        {value:'Last month', startUnit:'day', startAmount:30, endUnit:'day', endAmount:0},
        {value:'Last 2 months', startUnit:'day', startAmount:60, endUnit:'day', endAmount:0}
    ]},
    {label: 'Quarter', category:'dynamic_range', options: [
        {value:'This quarter', startUnit:'quarter', startAmount:0, endUnit:'quarter', endAmount:0},
        {value:'Last quarter', startUnit:'day', startAmount:90, endUnit:'day', endAmount:0},
        {value:'Last 2 quarters', startUnit:'day', startAmount:180, endUnit:'day', endAmount:0}
    ]},
    {label: 'Year', category:'dynamic_range', options: [
        {value:'This year', startUnit:'year', startAmount:0, endUnit:'year', endAmount:0},
        {value:'Last year', startUnit:'day', startAmount:365, endUnit:'day', endAmount:0},
        {value:'Last 2 years', startUnit:'day', startAmount:730, endUnit:'day', endAmount:0}
    ]},
    {label: 'Specific date', category:'static_date', options: []},
    {label: 'Date range', category:'static_range', options: []}
  ];


export const ATTACHMENT_FILE_TYPES = [
  {key: '.DOC', value: 'doc'},
  {key: '.DOCX', value: 'docx'},
  {key: '.DOCM', value: 'docm'},
  {key: '.XLS', value: 'xls'},
  {key: '.XLSX', value: 'xlsx'},
  {key: '.XLSM', value: 'xlsm'},
  {key: '.LOG', value: 'log'},
  {key: '.MSG', value: 'msg'},
  {key: '.ODT', value: 'odt'},
  {key: '.PAGES', value: 'pages'},
  {key: '.RTF', value: 'rtf'},
  {key: '.TEX', value: 'tex'},
  {key: '.TXT', value: 'txt'},
  {key: '.WPD', value: 'wpd'},
  {key: '.WPS', value: 'wps'},
  {key: '.CSV', value: 'csv'},
  {key: '.DAT', value: 'dat'},
  {key: '.GED', value: 'ged'},
  {key: '.KEY', value: 'key'},
  {key: '.KEYCHAIN', value: 'keychain'},
  {key: '.PPS', value: 'pps'},
  {key: '.PPT', value: 'ppt'},
  {key: '.PPTX', value: 'pptx'},
  {key: '.SDF', value: 'sdf'},
  {key: '.TAR', value: 'tar'},
  {key: '.TAX2014', value: 'tax2014'},
  {key: '.TAX2015', value: 'tax2015'},
  {key: 'VCF.', value: 'vcf'},
  {key: '.XML', value: 'xml'},
  {key: '.AIF', value: 'aif'},
  {key: '.IFF', value: 'iff'},
  {key: '.M3U', value: 'm3u'},
  {key: '.M4A', value: 'm4a'},
  {key: '.MID', value: 'mid'},
  {key: '.MP3', value: 'mp3'},
  {key: '.MPA', value: 'mpa'},
  {key: '.WAV', value: 'wav'},
  {key: '.WMA', value: 'wma'},
  {key: '.3DM', value: '3dm'},
  {key: '.3DS', value: '3ds'},
  {key: '.MAX', value: 'max'},
  {key: '.OBJ', value: 'obj'},
  {key: '.BMP', value: 'bmp'},
  {key: '.DDS', value: 'dds'},
  {key: '.GIF', value: 'gif'},
  {key: '.JPG', value: 'jpg'},
  {key: '.JPEG', value: 'jpeg'},
  {key: '.PNG', value: 'png'},
  {key: '.PSD', value: 'psd'},
  {key: '.PSPIMAGE', value: 'pspimage'},
  {key: '.TGA', value: 'tga'},
  {key: '.THM', value: 'thm'},
  {key: '.TIF', value: 'tif'},
  {key: '.TIFF', value: 'tiff'},
  {key: '.YUV', value: 'yuv'},
  {key: '.PDF', value: 'pdf'},
  {key: '.HTM', value: 'htm'},
  {key: '.HTML', value: 'html'},
  {key: '.7Z', value: '7z'},
  {key: '.CBR', value: 'cbr'},
  {key: '.DEB', value: 'deb'},
  {key: '.GZ', value: 'gz'},
  {key: '.PKG', value: 'pkg'},
  {key: '.RAR', value: 'rar'},
  {key: '.RPM', value: 'rpm'},
  {key: '.SITX', value: 'sitx'},
  {key: '.TAR.GZ', value: 'tar.gz'},
  {key: '.ZIP', value: 'zip'},
  {key: '.ZIPX', value: 'zipx'},
  {key: '.AVI', value: 'avi'},
  {key: '.MOV', value: 'mov'},
  {key: '.QT', value: 'qt'},
  {key: '.DWG', value: 'dwg'},
  {key: '.AVCHD', value: 'avchd'},
  {key: '.MPG', value: 'mpg'},
  {key: '.MP4', value: 'mp4'},
  {key: '.WMV', value: 'wmv'},
  {key: '.MKV', value: 'mkv'},
  {key: '.MIDI', value: 'modi'},
  {key: '.FLV', value: 'flv'},
]
export class ListSearchEntry {
    createdDate: string;
    id: string;
    objectId: string;
    plantCode: string
    searchString: string;
    userId: string;
}

export class DropdownOption {
    code: string;
    text: string;
    textRef: number;
}

export class DropdownOptionsRequest {
    searchString: string;
    parent: any;
}

export class ListValueSaveModel {
  moduleId: string;
  fieldId: string;
  dropvals: ListValue[];
}
export class ListValue {
  id?: string;
  text: string; // only necessary
  code: string; // only necessary
  language?: string;
  textRef?: string;
  edittext?: boolean;
  editcode?: boolean;
  isDialogSelection?: boolean;
}
export class ListValuePageable {
  sort: ListValueSort;
  pageNumber: number;
  pageSize: number;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export class ListValueSort {
  sorted: boolean;
  unsorted: boolean;
  empty: boolean;
}
export class ListValueResponse {
  content: ListValue[];
  pageable: ListValuePageable;
  totalElements: number;
  last: boolean;
  totalPages: number;
  sort: ListValueSort;
  number: number;
  numberOfElements: number;
  first: boolean;
  size: number;
  empty: boolean;
}
export class ListValueActionResponse {
  acknowledge: boolean;
  listValueId?: any;
  errorMsg: string;
  acknowledged?: boolean;
}
export class DropDependActionResponse {
  acknowledge: boolean;
  groupId: any;
  errorMsg: string;
}
export class CreateFieldDto {
  fields: Field[];
}
export interface Field {
  fieldlist: Fieldlist[];
  structureid: string;
}

export class ListFieldIdResponse {
  acknowledge: true;
  errorMsg: string;
  fieldIds: string[];
}
export class DraftFieldResponse {
  acknowledge: boolean;
  draftIds?: string[];
  dynamicFieldIds?: string[];
  errorMsg?: string;
  successMessage?: string;
}
export class BulkDeleteResponse {
  deletedFields: string[];
  failedFields: string[];
}
export class FieldlistContainer {
  fieldId: string;
  isNew?: boolean;
  editvalue?: boolean;
  fieldlist: Fieldlist;
  childrenId?: string | null;
  parentSubGridId?: string | null;
}
export class Fieldlist {
  attachmentSize: string;
  childfields?: Fieldlist[];
  dataType: string;
  dateModified?: number;
  decimalValue?: string;
  fieldId: string;
  fileTypes: string;
  helptexts: Helptexts;
  isCheckList?: boolean;
  isCompBased?: boolean;
  isCriteriaField: boolean;
  isDefault?: boolean;
  isDescription: boolean;
  isFutureDate: boolean;
  isGridColumn: boolean;
  isHeirarchy: boolean;
  isKeyField?: boolean;
  isNumSettingCriteria?: boolean;
  isPastDate: boolean;
  isReference?: boolean;
  isRequest?: boolean;
  isRejection?: boolean;
  isSearchEngine: boolean;
  isTransient?: boolean;
  isWorkFlow: boolean;
  isWorkFlowCriteria?: boolean;
  longtexts: Helptexts;
  maxChar: number;
  moduleId: string;
  outputLen?: string;
  parentField: string;
  pickList: string;
  pickService?: string;
  shortText: ShortText;
  structureId: string;
  textCase: string;
  isPermission?: boolean;
  optionsLimit?: number;
  isNoun: boolean;
  displayCriteria: string;
  isSubGrid?: boolean;
  fieldType?: string; // fieldControlType Text, Dropdown, Grid, Date etc for only frontend. FieldsWidgetsComponent
  icon?: string; // icon of the frontend. only needed for frontend. FieldsWidgetsComponent
  iconType?: string; // icon type like Material or SVG. only needed for frontend.
  deleted?: boolean; // hold temporary delete status.
  isDraft?: boolean; // to track if the field is a draft field
  isPersisted?: boolean;
  isNew?: boolean; // only for frontend to identify the childfields are new
  refrules?: ReferenceRule[];
  refDataset?: ReferenceDataset;

  refDatasetField?: any;
  refDatasetStatus?: any[];

  referenceSystem: string; // store the target system for dropdown sync
  referenceSystemFld: string; // store the target system table ...
  lookupRuleId?: string; // store the lookup rule for data reference field
  fieldDesc?: string;
}

export class ReferenceRule {
  datasetId: string;
  datasetDesc: string;
  fieldId: string;
  fldctrl: any;
}

export class ReferenceDataset {
  datasetId: string;
  datasetDesc: string;
}

export class Helptexts {
  [key: string]: string;
}

export interface ShortText {
  [key: string]: AdditionalProp;
}
export class AdditionalProp {
  description: string;
  information: string;
}

export class FieldActionResponse {
  acknowledge: boolean;
  errorMsg: string;
}

export class DatasetRefSaveResponse {
  acknowledge: boolean;
  successMsg: string;
}

export class FilterFieldModel {
  moduleId?: string;
  esFieldPath?: string;
  fieldId: string;
  type?: string;
  operator: string;
  name?: string;
  description?: string;
  unit?: string;
  values: string[];
  picklist?: string;
  dataType?: string;
  startValue?: string;
  endValue?: string;
  moduleName?: string;
  filterType: string;
  selectAll?: boolean;
  showSelected?: boolean;
  serchString?: string;
  restrictedVal?: string[] | any;
  fileTypes?: string;
  isMultiSelect?: boolean;
  attachmentSize?: string;
  grid?: FilterFieldModel[];
  fieldCtrl?: {
    grid?: FilterFieldModel[],
    description?: string,
    permissions?: any,
    fileTypes?: string,
    isMultiSelect?: boolean,
    attachmentSize?: string
  };
}

export enum FormTypesEnum {
  Flow = '2',
  HTML = '3',
  PDF = '4',
}
export const FormTypes = [
  { id: '2', name: 'Flow type' },
  { id: '3', name: 'HTML type' },
  { id: '4', name: 'PDF type' },
];
export const RuleSaveTypes = [
  { id: '2', name: 'Load Rules from file', click:'downloadTemplate()' },
  { id: '3', name: 'Save rules to file',   click:'downloadTemplate()' },
  { id: '4', name: 'Download Template',    click:'downloadTemplate()' },
];
export const RuleTypes = [
  { id: '2', name: 'New rule' },
  { id: '4', name: 'Use Existing' },
];
export const conditionIconMappings = [
  { FirstIcon: 'remove_red_eye', SecondIcon: 'visibility_off' },
  { FirstIcon: 'lock_open', SecondIcon: 'lock' },
  { FirstIcon: 'settings', SecondIcon: 'settings_applications' },
];
export const HiddenMapping = [
  { Icon: 'eye', Value: null, IconType: 'solid' },
  { Icon: 'lock', Value: 'READ_ONLY', IconType: 'light' },
  { Icon: 'star', Value: 'MANDATORY', IconType: 'light' },
];
export const ReadOnlyMapping = [
  { Icon: 'eye', Value: 'HIDDEN', IconType: 'light' },
  { Icon: 'lock', Value: null, IconType: 'solid' },
  { Icon: 'star', Value: 'MANDATORY', IconType: 'light' },
];
export const MANDATORYMapping = [
  { Icon: 'eye', Value: 'HIDDEN', IconType: 'light' },
  { Icon: 'lock', Value: 'READ_ONLY', IconType: 'light' },
  { Icon: 'star', Value: null, IconType: 'solid' },
];

export const DefaultMapping = [
  { Icon: 'eye', Value: 'HIDDEN', IconType: 'light' },
  { Icon: 'lock', Value: 'READ_ONLY', IconType: 'light' },
  { Icon: 'star', Value: 'MANDATORY', IconType: 'light' },
];
export const MappingObject = [
  { property: 'HIDDEN', Object: HiddenMapping },
  { property: 'READ_ONLY', Object: ReadOnlyMapping},
  { property: 'MANDATORY', Object: MANDATORYMapping},
  { property: null, Object: DefaultMapping},
];
export const AppliedMapping = [
  { Icon: 'visibility_off', key: 'HIDDEN' },
  { Icon: 'lock', key: 'READ_ONLY' },
  { Icon: 'settings_applications', key: 'MANDATORY' },
];
export class DatasetForm {
  layoutId: string
  description: string
  usage: string
  type: string
  labels: string
  helpText: string
  dateModified: number
  userModified: string
  userCreated: string
  dateCreated: number;
  descriptionGenerator: boolean;
  isForFlow?: boolean;
}

export class ConditionField {
  sourceField: string;
  sourceFieldValue: string;
  targetField: string;
  targetFieldValue: string;
  isDefault: string;
  status: string;
  isFirstRow:boolean;
  mappingId:string
}
export class ConditionsListRequestDTO {
  pageInfo: PageInfo
  'searchString': string
}
export class FormTab {
  tcode: string
  layoutId: string
  tabText: string
  description: string
  isTabHidden: boolean
  isTabReadOnly: boolean
  tabOrder: number
  tabid: string
  udrId: string
  fields?: TabField[]
}

export class DatasetFormCreateDto {
  description: string
  helpText: string
  labels: string
  type: string
  usage: string
}

export class DatasetFormCreateResponse {
  acknowledge: boolean;
  errorMsg: string;
  layoutId: string;
  successMsg: string;
}

export class DatasetFormRequestDto {
  type: number[];
  userCreated: string[];
  userModified: string[];
}

export class TabFieldsResponse {
  description: string
  fields: TabField[]
  tabUuid: string
}
export class TabField {
  description?: string
  fieldDescription: string
  fieldId: string
  type: string
  fieldType: string
  maxChar: number
  isAdd: boolean
  isDelete: boolean
  isHidden: boolean
  isMandatory: boolean
  isReadonly: boolean
  order: number
  dataType: string
  structureId: number
  pickList: string
  tabFieldUuid: string
  picklist?: string;
}

export class UnassignedFieldsResponse {
  hierarchyId?: string
  hierarchyDesc?: string
  fields?: TabField[]
  headerStructure?: string;
  headerFields?: UnassignedFieldsResponse[]
}

export enum IconType {
  MATERIAL = 'material',
  SVG = 'svg',
}

export class EditDataSetInfo {
  objectName?: string;
  objectdesc?: string;
  objectId: string;
  objectParentModuleIds: any
}

export class FilterBusinessList {
  status: boolean;
  ruleType: string;
  ruleName: string;
  userModified: string[];
  searchString: string;
  dataSetId?: string;
}

export interface VirtualDataset {
  vdId: string;
  vdName: string;
  tenantId: string;
}

export class ReferenceDatasetPost {
  fieldId?: string;
  lookUpId?: string;
  searchFields?: string;
  recordStatus?: string;
  referencedModuleId?: string;
  type?: string;
}

export class ReferenceDatasetResponse {
  fieldId: string;
  lookUpId: string;
  searchFields: string;
  recordStatus: string;
  referencedModuleId: number;
  type: string;
}

export const ListValueColumns = [
  {
    id: '_select',
    name: $localize`:@@_select:Select`,
  },
  {
    id: 'code',
    name: $localize`:@@code:Code`,
  },
  // {
  //   id: 'value',
  //   name: $localize`:@@value:Value`,
  // },
  {
    id: 'language',
    name: $localize`:@@language:Language`,
  },
  {
    id: 'text',
    name: $localize`:@@text:Text`,
  },
  {
    id: 'sync_enable',
    name: $localize`:@@sync_enable:Sync Enable`,
  },
  {
    id: 'copy',
    name: $localize`:@@copy:Copy`,
  },
  {
    id: 'delete',
    name: $localize`:@@delete:Delete`,
  }
];

export interface TaskListFilter {
  from: number;
  searchString: string;
  size: number;
  sort: {
    [key: string]: string;
  }
  taskFilterCriteria: TaskListFilterCriteria[]
}

export interface TaskListFilterCriteria {
  dateCriteria: string;
  dateRange: string;
  esFieldPath: string;
  etVal: string;
  fieldId: string;
  filterType: string;
  moduleId: string;
  operator: string;
  stVal: string;
  values: string[]
}

export interface widgetGridTabFields {
  childs: tabFieldChild[],
  dataType: string;
  description: string;
  fieldId: string;
  fieldType: string;
  icon: string;
  maxChar: number;
  permissions: any;
  pickList: string;
  strucDesc: string;
  structureId: number;
}

export interface tabFieldChild {
  childs: tabFieldChild[];
  dataType: string;
  description: string;
  fieldId: string;
  fieldType: string;
  icon: string;
  isHidden: boolean;
  isMandatory: boolean;
  isReadOnly: boolean;
  metaData: any;
  permissions: any;
  pickList: string;
}