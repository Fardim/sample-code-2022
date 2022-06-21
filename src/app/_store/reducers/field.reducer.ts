import { FieldLoadingState } from './../../_modules/list/_components/field/field.component';
import { FieldPaginationDto } from './../../_modules/list/_components/field/field-service/field.service';
import { FieldlistContainer } from '@models/list-page/listpage';

import { unionBy, union } from 'lodash';

import { FieldActions, FieldActionTypes } from './../actions/field.action';

export interface FieldState {
  datasetFieldList: FieldlistContainer[];
  deletedDatasetFieldList: FieldlistContainer[]; // it may contain Table fields which is not deleted but its child field is deleted
  deletedFieldIds: string[]; // it contains specific fieldIds (root, child, subchild) which are deleted
  loading: boolean;
  datasetPagination: {
      [key: string]: FieldPaginationDto
  };
  fieldsUpdated: {fieldId: string; isValid: boolean, structureId: string}[]; // it only contains root level fields
  childfieldsUpdated: {fieldId: string; isValid: boolean, structureId: string}[]; // it contains root, child, subchild of table fields
  structureId: string;
  fieldListLoadingState: FieldLoadingState;
}

const initialState: FieldState = {
  datasetFieldList: null,
  deletedDatasetFieldList: null,
  deletedFieldIds: null,
  loading: false,
  datasetPagination: {},
  fieldsUpdated: null,
  childfieldsUpdated: null,
  structureId: null,
  fieldListLoadingState: null,
};

export function reducer(state = initialState, action: FieldActions): FieldState {
  const updatedFields: {fieldId: string; isValid: boolean, structureId: string}[] = unionBy(state.fieldsUpdated ? state.fieldsUpdated : [], [], 'fieldId');
  const updatedChildFields: {fieldId: string; isValid: boolean, structureId: string}[] = unionBy(state.childfieldsUpdated ? state.childfieldsUpdated : [], [], 'fieldId');
  let fieldList: FieldlistContainer[] = unionBy(state.datasetFieldList ? state.datasetFieldList : [], [], 'fieldId');
  switch (action.type) {
    case FieldActionTypes.DatasetFieldLoadSuccess:
      const payload = unionBy(state.datasetFieldList ? state.datasetFieldList : [], action.payload, 'fieldId');
      return {
        ...state,
        datasetFieldList: payload,
      };
    case FieldActionTypes.DatasetFieldAdd:
      const index = fieldList.findIndex(d=> d.fieldId === action.payload.fieldId);
      index>-1? fieldList[index] = action.payload: fieldList.push(action.payload);
      return {
        ...state,
        datasetFieldList: fieldList,
      };
    case FieldActionTypes.RemoveDatasetFieldDeleted:
      fieldList = fieldList.filter((d) => d.fieldlist.deleted !== true);
      return {
        ...state,
        datasetFieldList: fieldList,
      };
    case FieldActionTypes.RemoveADatasetField:
      const delIndex = fieldList.findIndex(d=> d.fieldId === action.payload);
      fieldList.splice(delIndex, 1);
      return {
        ...state,
        datasetFieldList: fieldList,
      };
    case FieldActionTypes.SetUpdatedFields:
      const idx = updatedFields.findIndex(d=> d.fieldId === action.payload.fieldId);
      idx>-1? updatedFields[idx] = action.payload: updatedFields.push(action.payload);
      return {
        ...state,
        fieldsUpdated: updatedFields,
      };
    case FieldActionTypes.SetUpdatedChildFields:
      const fidx = updatedChildFields.findIndex(d=> d.fieldId === action.payload.fieldId);
      fidx>-1? updatedChildFields[fidx] = action.payload: updatedChildFields.push(action.payload);
      return {
        ...state,
        childfieldsUpdated: updatedChildFields,
      };
    case FieldActionTypes.RemoveFromUpdatedFields:
      const fieldIdx = updatedFields.findIndex(d=> d.fieldId === action.payload);
      if(fieldIdx>-1) {
        updatedFields.splice(fieldIdx, 1);
      }
      const childfieldIdx = updatedChildFields.findIndex(d=> d.fieldId === action.payload);
      if(childfieldIdx>-1) {
        updatedChildFields.splice(childfieldIdx, 1);
      }
      return {
        ...state,
        fieldsUpdated: updatedFields,
        childfieldsUpdated: updatedChildFields,
      };
    case FieldActionTypes.ResetUpdatedFields:
      return {
        ...state,
        fieldsUpdated: [],
        childfieldsUpdated: [],
        deletedDatasetFieldList: [],
        deletedFieldIds: []
      };
    case FieldActionTypes.SetDeletedDatasetFieldList:
      const deletedFieldList = unionBy(state.deletedDatasetFieldList ? state.deletedDatasetFieldList : [], [], 'fieldId');
      const delFieldIdx = deletedFieldList.findIndex(d=> d.fieldId === action.payload.fieldId);
      delFieldIdx>-1? deletedFieldList[delFieldIdx] = action.payload: deletedFieldList.push(action.payload);
      return {
        ...state,
        deletedDatasetFieldList: deletedFieldList,
      };
    case FieldActionTypes.SetDeletedFieldIds:
      const delFieldIds = union(state.deletedFieldIds ? state.deletedFieldIds : [], []);
      const delIdx = delFieldIds.findIndex(d=> d === action.payload);
      delIdx>-1? delFieldIds[delIdx] = action.payload: delFieldIds.push(action.payload);
      return {
        ...state,
        deletedFieldIds: delFieldIds,
      };
    case FieldActionTypes.DatasetFieldPagination:
      const pagination = {
        ...state.datasetPagination,
        [action.payload.requestDTO.structureId]: action.payload
      };
      return {
        ...state,
        datasetPagination: pagination,
      };
    case FieldActionTypes.DatasetFieldLoading:
      return {
        ...state,
        loading: action.payload,
      };
    case FieldActionTypes.SetFieldListLoadingState:
      return {
        ...state,
        fieldListLoadingState: action.payload,
      };
    case FieldActionTypes.SetStructureId:
      return {
        ...state,
        structureId: action.payload,
      };
    case FieldActionTypes.ResetAll:
      return {
        ...state,
        datasetFieldList: [],
        deletedDatasetFieldList: null,
        deletedFieldIds: null,
        loading: null,
        datasetPagination: {},
        fieldsUpdated: null,
        childfieldsUpdated: null,
		    structureId: null,
        fieldListLoadingState: null,
      };
    default:
      return state;
  }
}
