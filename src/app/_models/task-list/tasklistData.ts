export interface TaskListDataResponse {
  total: number;
  _doc: TaskListData[];
  req_at: number;
  to: number;
  res_at: number;
}

export interface TaskListData {
  Records: string;
  setting: number;
  description: string;
  labels: string[];
  sent: string;
  dueby: string;
  requestby: string;
  sentby: string;
  isImp?: boolean;
  isRead?: boolean;
  isBmk?: boolean;
  moduleId: string;
}

export interface ResponseBody {
  acknowledge: boolean;
  errorMsg: string
}

export interface FilterDataObject {
  taskFilterId: string;
  taskFilterName: string;
  taskFilterCategory: string
}

export interface FilterCriteriaData extends FilterDataObject {
  taskFilterCriteria: {
    dateCriteria: string;
    dateRange: string;
    stVal: string;
    etVal: string;
    moduleId: string;
    fieldId: string;
    esFieldPath: string;
    operator: string;
    filterType: string;
    values: string[];
  }[]
}

export interface RequestByList {
  name: string;
}