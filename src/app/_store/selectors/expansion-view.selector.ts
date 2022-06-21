import { ExpansionViewModuleState } from './../models/expansion-view.model';
import { createFeatureSelector, createSelector } from '@ngrx/store';


export const EXPANSION_VIEW_MODULE_STATE_NAME = 'expansionviewModule';
const getExpansionViewModuleState = createFeatureSelector<ExpansionViewModuleState>(EXPANSION_VIEW_MODULE_STATE_NAME);

const getExpansionViewFeatureState = createSelector(getExpansionViewModuleState, (state: ExpansionViewModuleState) => state.expansionview);

export const getMasterData = createSelector(getExpansionViewFeatureState, (state) => state.masterData);
export const getTableData = createSelector(getExpansionViewFeatureState, (state) => state.tableData);
export const getTableDataLoading = createSelector(getExpansionViewFeatureState, (state) => state.tableDataLoading);
export const getTableDataPagination = createSelector(getExpansionViewFeatureState, (state) => state.tableDataPagination);