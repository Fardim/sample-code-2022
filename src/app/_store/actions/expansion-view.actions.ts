import { MDORecord } from '@modules/transaction/model/transaction';
import { SchemaTableData } from '@models/schema/schemadetailstable';
import { Action } from '@ngrx/store';

export enum ExpansionViewActionTypes {
  SetMasterData = '[Expansion View] Set Master Data of ModuleId',
  SetGridTableData = '[Expansion View] Set Grid Table Data',
  SetGridTableDataPagination = '[Expansion View] Set Grid Table Data Pagination',
  GridTableLoading = '[Expansion View] Grid Table Loading',
  DeleteGridTableRow = '[Expansion View] Delete Grid Table Row',
  DuplicateGridTableRow = '[Expansion View] Duplicate Grid Table Row',
  CreateGridTableRow = '[Expansion View] Create Grid Table Row',
  UpdateGridTableRow = '[Expansion View] Update Grid Table Row',
  ResetAll = '[Expansion View] Reset All',
}

export class SetMasterData implements Action {
  readonly type = ExpansionViewActionTypes.SetMasterData;
  constructor(public payload: MDORecord) {}
}

export class SetGridTableData implements Action {
  readonly type = ExpansionViewActionTypes.SetGridTableData;
  constructor(public payload: {gridId: string; data: SchemaTableData[]}) {}
}
export class SetGridTableDataPagination implements Action {
  readonly type = ExpansionViewActionTypes.SetGridTableDataPagination;
  constructor(public payload: {gridId: string; pagination: { pageIndex: number; pageSize: number; searchTerm: string; parentRowId: string}}) {}
}
export class GridTableLoading implements Action {
  readonly type = ExpansionViewActionTypes.GridTableLoading;
  constructor(public payload: boolean) {}
}
export class DeleteGridTableRow implements Action {
  readonly type = ExpansionViewActionTypes.DeleteGridTableRow;
  constructor(public payload: {pageIndex: number; pageSize: number; rowIndex: number}) {}
}
export class DuplicateGridTableRow implements Action {
  readonly type = ExpansionViewActionTypes.DuplicateGridTableRow;
  constructor(public payload: {pageIndex: number; pageSize: number; rowIndex: number}) {}
}
export class CreateGridTableRow implements Action {
  readonly type = ExpansionViewActionTypes.CreateGridTableRow;
  constructor(public payload: {newData: any; pageSize: number}) {}
}
export class UpdateGridTableRow implements Action {
  readonly type = ExpansionViewActionTypes.UpdateGridTableRow;
  constructor(public payload: {rowDetail: any; index: number}) {}
}
export class ResetAll implements Action {
  readonly type = ExpansionViewActionTypes.ResetAll;
  constructor() {}
}

export type ExpansionViewActions =
  | SetMasterData
  | SetGridTableData
  | SetGridTableDataPagination
  | GridTableLoading
  | DeleteGridTableRow
  | DuplicateGridTableRow
  | CreateGridTableRow
  | UpdateGridTableRow
  | ResetAll;