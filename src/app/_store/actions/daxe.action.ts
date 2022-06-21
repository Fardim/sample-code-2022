import { Action } from '@ngrx/store';
import { Daxe, DaxeInfo } from '@store/models/daxe.model';

export enum DaxeActionTypes {
  LoadDaxeRules = '[DAXE] Load Daxe Rules',
  LoadDaxeRuleInfo = '[DAXE] Load Info',
  DaxeLoadSuccess = '[DAXE] Load Success',
  DaxeLoadInfoSuccess = '[DAXE] Load Info Success',
  DaxeLoading = '[DAXE] Loading',
  AddDaxe = '[DAXE] Add',
  UpdateDaxe = '[DAXE] Update',
  DaxeGetLocal = '[DAXE] Get Unsave Data',
  SaveDaxe = '[DAXE] Save Daxe Rule',
  SaveDaxeSuccess = '[DAXE] Save Daxe Rule Success',
  SaveLocalDaxeRule = '[DAXE] Save Local Daxe Rule',
}

export class LoadDaxeRules implements Action {
  readonly type = DaxeActionTypes.LoadDaxeRules;
  constructor(public moduleId: string) { }
}

export class DaxeLoadSuccess implements Action {
  readonly type = DaxeActionTypes.DaxeLoadSuccess;
  constructor(public payload: Daxe[]) { }
}

export class LoadDaxeRuleInfo implements Action {
  readonly type = DaxeActionTypes.LoadDaxeRuleInfo;
  constructor(public id: string) { }
}

export class DaxeLoadInfoSuccess implements Action {
  readonly type = DaxeActionTypes.DaxeLoadInfoSuccess;
  constructor(public payload: DaxeInfo) { }
}

export class SaveDaxe implements Action {
  readonly type = DaxeActionTypes.SaveDaxe;
  public daxe: DaxeInfo;
  constructor(private body: Daxe) {
    this.daxe = {
      dataSetId: this.body.dataSetId,
      daxeProgrmaDetail: {
        dateCreated: this.body.createdOn,
        dateModified: new Date().getTime(),
        daxeCode: this.body.daxeCode,
        status: this.body.status,
        tenantId: this.body.tenantId,
        userCreated: this.body.createdBy,
        uuid: this.body.id
      },
      daxeUuid: this.body.id,
      helpText: this.body.brief,
      name: this.body.name,
      tenantid: this.body.tenantId,
      userModified: this.body.modifiedBy
    }
  }
}

export class SaveDaxeSuccess implements Action {
  readonly type = DaxeActionTypes.SaveDaxeSuccess;
  constructor(public payload: DaxeInfo) { }
}

export class DaxeLoading implements Action {
  readonly type = DaxeActionTypes.DaxeLoading;
  constructor(public payload: boolean) { }
}

export class AddDaxe implements Action {
  readonly type = DaxeActionTypes.AddDaxe;
  constructor(public daxe: Daxe) { }
}
export class UpdateDaxe implements Action {
  readonly type = DaxeActionTypes.UpdateDaxe;
  constructor(public daxe: Daxe) { }
}

export class DaxeGetLocal implements Action {
  readonly type = DaxeActionTypes.DaxeGetLocal;
  constructor() { }
}

export class SaveLocalDaxeRule implements Action {
  readonly type = DaxeActionTypes.SaveLocalDaxeRule;
  datasetId: string
  constructor(datasetId: string) {
    this.datasetId = datasetId;
  }
}


export type DaxeActions =
  | LoadDaxeRules
  | DaxeLoadSuccess
  | LoadDaxeRuleInfo
  | DaxeLoadInfoSuccess
  | SaveDaxe
  | SaveDaxeSuccess
  | SaveLocalDaxeRule
  | DaxeLoading
  | AddDaxe
  | UpdateDaxe
  | DaxeGetLocal;
