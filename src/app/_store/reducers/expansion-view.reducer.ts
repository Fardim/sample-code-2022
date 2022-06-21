import { SchemaTableData } from '@models/schema/schemadetailstable';
import { MDORecord } from '@modules/transaction/model/transaction';

import { unionBy, union } from 'lodash';

import { ExpansionViewActions, ExpansionViewActionTypes } from './../actions/expansion-view.actions';

export interface ExpansionViewState {
  masterData: MDORecord;
  tableData: {
    [gridId: string]: SchemaTableData[];
  };
  tableDataPagination: {
    [gridId: string]: { pageIndex: number; pageSize: number; searchTerm: string; parentRowId: string };
  };
  tableDataLoading: boolean;
}

const initialState: ExpansionViewState = {
  masterData: null,
  tableData: {},
  tableDataPagination: {},
  tableDataLoading: false,
};

export function reducer(state = initialState, action: ExpansionViewActions): ExpansionViewState {
  switch (action.type) {
    case ExpansionViewActionTypes.SetMasterData: {
      return {
        ...state,
        masterData: action.payload,
      };
    }
    case ExpansionViewActionTypes.SetGridTableData: {
      const data = {
        ...state.tableData,
        [action.payload.gridId]: action.payload.data,
      };
      return {
        ...state,
        tableData: data,
      };
    }
    case ExpansionViewActionTypes.GridTableLoading:
      return {
        ...state,
        tableDataLoading: action.payload,
      };
    case ExpansionViewActionTypes.SetGridTableDataPagination:
      const pagination = {
        ...state.tableDataPagination,
        [action.payload.gridId]: action.payload.pagination
      }
      return {
        ...state,
        tableDataPagination: pagination,
      };
    case ExpansionViewActionTypes.ResetAll: {
      return {
        ...state,
        masterData: null,
        tableData: {},
        tableDataPagination: {},
        tableDataLoading: false,
      };
    }

    default:
      return state;
  }
}
