import { FieldlistContainer } from '@models/list-page/listpage';
import { FieldPaginationDto } from '@modules/list/_components/field/field-service/field.service';
import { FieldLoadingState } from '@modules/list/_components/field/field.component';
import { Action } from '@ngrx/store';

export enum FieldActionTypes {
  DatasetFieldLoad = '[Dataset Field] Load',
  DatasetFieldLoadSuccess = '[Dataset Field] Load Success',
  DatasetFieldPagination = '[Dataset Field] Pagination',
  DatasetFieldLoading = '[Dataset Field] Loading',
  SetFieldListLoadingState = '[Dataset Field] FieldList Loading State',
  DatasetFieldAdd = '[Dataset Field] Add a Field',
  RemoveDatasetFieldDeleted = '[Dataset Field] Remove Dataset Fields Deleted',
  RemoveADatasetField = '[Dataset Field] Remove A Dataset Field',
  SetUpdatedFields = '[Dataset Field] Set Updated Fields', // it only contains root level fields
  SetUpdatedChildFields = '[Dataset Field] Set Updated Child Fields', // it contains root, child, subchild of table fields
  RemoveFromUpdatedFields = '[Dataset Field] Remove From Updated Fields',
  ResetUpdatedFields = '[Dataset Field] Reset Updated Fields',
  SetStructureId = '[Dataset Field] Set Structure Id',
  SetDeletedDatasetFieldList = '[Dataset Field] Set Deleted Dataset Field List', // it may contain Table fields which is not deleted but its child field is deleted
  SetDeletedFieldIds = '[Dataset Field] Set Deleted Field Ids', // it contains specific fieldIds (root, child, subchild) which are deleted
  ResetAll = '[Dataset Field] Reset All',
}

export class DatasetFieldLoad implements Action {
  readonly type = FieldActionTypes.DatasetFieldLoad;
  constructor(public payload: FieldPaginationDto) {}
}

export class DatasetFieldLoadSuccess implements Action {
  readonly type = FieldActionTypes.DatasetFieldLoadSuccess;
  constructor(public payload: FieldlistContainer[]) {}
}
export class SetDeletedDatasetFieldList implements Action {
  readonly type = FieldActionTypes.SetDeletedDatasetFieldList;
  constructor(public payload: FieldlistContainer) {}
}
export class SetDeletedFieldIds implements Action {
  readonly type = FieldActionTypes.SetDeletedFieldIds;
  constructor(public payload: string) {}
}

export class DatasetFieldPagination implements Action {
  readonly type = FieldActionTypes.DatasetFieldPagination;
  constructor(public payload: FieldPaginationDto) {}
}

export class SetFieldListLoadingState implements Action {
  readonly type = FieldActionTypes.SetFieldListLoadingState;
  constructor(public payload: FieldLoadingState) {}
}

export class DatasetFieldLoading implements Action {
  readonly type = FieldActionTypes.DatasetFieldLoading;
  constructor(public payload: boolean) {}
}

export class DatasetFieldAdd implements Action {
  readonly type = FieldActionTypes.DatasetFieldAdd;
  constructor(public payload: FieldlistContainer) {}
}

export class RemoveDatasetFieldDeleted implements Action {
  readonly type = FieldActionTypes.RemoveDatasetFieldDeleted;
  constructor() {}
}

export class RemoveADatasetField implements Action {
  readonly type = FieldActionTypes.RemoveADatasetField;
  constructor(public payload: string) {} // fieldId
}

export class SetUpdatedFields implements Action {
  readonly type = FieldActionTypes.SetUpdatedFields;
  constructor(public payload: {fieldId: string; isValid: boolean, structureId: string}) {}
}
export class SetUpdatedChildFields implements Action {
  readonly type = FieldActionTypes.SetUpdatedChildFields;
  constructor(public payload: {fieldId: string; isValid: boolean, structureId: string}) {}
}

export class RemoveFromUpdatedFields implements Action {
  readonly type = FieldActionTypes.RemoveFromUpdatedFields;
  constructor(public payload: string) {} // fieldId
}

export class ResetUpdatedFields implements Action {
  readonly type = FieldActionTypes.ResetUpdatedFields;
  constructor() {} // fieldId
}

export class SetStructureId implements Action {
  readonly type = FieldActionTypes.SetStructureId;
  constructor(public payload: string) {}
}

export class ResetAll implements Action {
  readonly type = FieldActionTypes.ResetAll;
  constructor() {}
}


export type FieldActions =
  | DatasetFieldLoad
  | DatasetFieldLoadSuccess
  | DatasetFieldPagination
  | DatasetFieldLoading
  | SetFieldListLoadingState
  | DatasetFieldAdd
  | RemoveDatasetFieldDeleted
  | RemoveADatasetField
  | SetUpdatedFields
  | SetUpdatedChildFields
  | RemoveFromUpdatedFields
  | ResetUpdatedFields
  | SetStructureId
  | SetDeletedDatasetFieldList
  | SetDeletedFieldIds
  | ResetAll;
