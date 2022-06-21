import { FilterCriteria } from './schemadetailstable';

export class GroupDetails {
  groupId?: string;
  groupType: string;
  order: number;
  userCreated?: string;
  dateCreated?: number;
  userModified?: string;
  dateModified?: number;
  tenantId?: number;
  groupName: string;
  groupDescription: string;
  // joinColumns: JoinColumn[] = [];
  groupJoinDetail: GroupJoinDetail[] = [];
  tempId?: string;
  error?: string;
}

export class JoinColumn {
  joinColumnId?: string;
  sourceFieldId?: string
  sourceField?: string;
  targetFieldId?: string
  targetField?: string;
  condition?: string;
}

export class GroupJoinDetail {
  groupJoinId?: string;
  sourceOneTempId?: string;
  sourceOne?: string;
  sourceOneType?: 'MODULE' | 'GROUP';
  sourceOneModule?: string;
  sourceTwoTempId?: string;
  sourceTwo?: string;
  sourceTwoType?: 'MODULE' | 'GROUP';
  sourceTwoModule?: string;
  sourceOneScopeUdr? = '';
  sourceTwoScopeUdr? = '';
  resultScopeUdr? = '';
  joinType?: string;
  joinOperator?: string;
  joinMapping: JoinMapping[] = [];
}

export class JoinMapping {
  joinMappingId?: string;
  sourceOneField?: string;
  sourceTwoField?: string;
  orderBy?: string;
  operator?: string;
}

export class RequestForGroupList {
  schemaId: string;
  variantId: string;
  plantCode: string;
  runId: string;
  page: number;
  size: number;
  responseStatus: string;
  searchAfter: SearchAfter;
  filterCriteria: FilterCriteria[];
}

export class SearchAfter {
  exact: string;
  group: string;
  fuzzy: string;
}

export class RequestForCatalogCheckData {
  schemaId: string;
  runId: string;
  groupId: string;
  ignore: boolean;
  key: string;
  page: number;
  size: number;
  plantCode: string;
  /* variantId: string;
  requestStatus: string;
  executionStartDate: string;
  pageSize: number;
  pageIndex: number; */
  filterCriterias: FilterCriteria[];
  sort: {};
  requestStatus: string;
}

export class TableDataSource<T> {
  isLoading: boolean;
  totalCount: number;
  data: T[] = [];
}

export enum RECORD_STATUS {
  MASTER = 'Master record',
  DELETABLE = 'Marked for deletion',
  NOT_DELETABLE = 'Can be deleted',
  NOT_DUPLICATE = `Not a duplicate`
}

export const RECORD_STATUS_KEY = 'record_status';
export const MASTER_RULE_STATUS_KEY = 'masterRule';

export class MasterRuleStatus {
  ruleId: string;
  ruleDesc: string;
  status: boolean;
}
export class MasterRecordChangeRequest {
  schemaId: string;
  runId: string;
  id: string;
  oldId: string;
}

export class DoCorrectionRequest {
  id: string;
  fldId: string;
  vc: string;
  oc: string;
  isReviewed: string;
  groupIdold: string;
  groupIdnew: string;
  groupField: string;
  groupDesc: number;
}

export interface JoinSaveModel {
  data: {
    vdId: string;
    vdName: string;
  };
  message: string;
}
