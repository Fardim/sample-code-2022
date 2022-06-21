import { FieldModuleState } from './../models/field.model';
import { createFeatureSelector, createSelector } from '@ngrx/store';


export const FIELD_MODULE_STATE_NAME = 'fieldModule';
const getFieldModuleState = createFeatureSelector<FieldModuleState>(FIELD_MODULE_STATE_NAME);

const getFieldFeatureState = createSelector(getFieldModuleState, (state: FieldModuleState) => state.field);
export const getStructureId = createSelector(getFieldFeatureState, (state) => state.structureId);
export const getDatasetFieldList = createSelector(getFieldFeatureState, (state) => state.datasetFieldList);
export const getDatasetFieldListLoading = createSelector(getFieldFeatureState, (state) => state.loading);
export const getFieldListLoadingState = createSelector(getFieldFeatureState, (state) => state.fieldListLoadingState);
export const getDatasetPagination = createSelector(getFieldFeatureState, (state) => state.datasetPagination);
export const getFieldsUpdated = createSelector(getFieldFeatureState, (state) => state.fieldsUpdated);
export const getChildFieldsUpdated = createSelector(getFieldFeatureState, (state) => state.childfieldsUpdated);
export const getDeletedDatasetFieldList = createSelector(getFieldFeatureState, (state) => state.deletedDatasetFieldList);
export const getDeletedFieldIds = createSelector(getFieldFeatureState, (state) => state.deletedFieldIds);
