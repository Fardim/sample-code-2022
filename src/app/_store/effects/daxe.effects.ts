import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { mergeMap, catchError, tap, map, withLatestFrom, filter, concatMap } from 'rxjs/operators';
import {
  DaxeActionTypes,
  DaxeLoadInfoSuccess,
  DaxeLoading,
  DaxeLoadSuccess,
  LoadDaxeRuleInfo,
  LoadDaxeRules,
  SaveDaxe,
  SaveDaxeSuccess
} from '../actions/daxe.action';
import { of } from 'rxjs';
import { DaxeInfo, DaxeRuleResponse, DaxeStatus, DaxeUsage } from '@store/models/daxe.model';
import { DaxeService } from '@modules/daxe/_services/daxe.service';
import { UserService } from '@services/user/userservice.service';
import { Store } from '@ngrx/store';
import { getDaxeList } from '@store/selectors/daxe.selector';

@Injectable()
export class DaxeEffects {
  constructor(
    private actions$: Actions,
    private store: Store,
    private daxeService: DaxeService,
    private userService: UserService
  ) {}
  @Effect()
  getAllDaxeRules$ = this.actions$.pipe(
    ofType(DaxeActionTypes.LoadDaxeRules),
    tap(() => of(new DaxeLoading(true))),
    concatMap((action: LoadDaxeRules) => of(action).pipe(withLatestFrom(this.store.select(getDaxeList)))),
    mergeMap(([action, daxeList]) => {
      if (daxeList.length > 0 && daxeList[0].dataSetId == action.moduleId) {
        return of([new DaxeLoadSuccess(daxeList), new DaxeLoading(false)]);
      } else {
        return this.daxeService.getDaxeRules(action.moduleId).pipe(
          mergeMap((response: DaxeRuleResponse) => [
            new DaxeLoadSuccess(
              response.content.map((daxe) => {
                return {
                  name: daxe.name || '',
                  settings: '',
                  createdOn: daxe.dateCreated,
                  createdBy: daxe.userCreated,
                  modifiedOn: daxe.dateModified,
                  modifiedBy: daxe.userCreated,
                  status: daxe.status,
                  assignedState: daxe.status === DaxeStatus.ACTIVE ? true : false,
                  id: daxe.daxeUuid,
                  version: daxe.version || '1.0',
                  usage: DaxeUsage.TRANSFORMING,
                  daxeCode: daxe.daxeCode,
                  brief: daxe.helpText,
                  tenantId: daxe.tenantId
                };
              })
            ),
            new DaxeLoading(false)
          ]),
          catchError((err) => of(new DaxeLoading(false)))
        );
      }
    })
  );

  @Effect()
  getDaxeRuleInfo$ = this.actions$.pipe(
    ofType(DaxeActionTypes.LoadDaxeRuleInfo),
    mergeMap((data: LoadDaxeRuleInfo) =>
      this.daxeService.getDaxeInfo(data.id).pipe(mergeMap((response: DaxeInfo) => [new DaxeLoadInfoSuccess(response)]))
    )
  );

  @Effect()
  saveDaxeRule$ = this.actions$.pipe(
    ofType(DaxeActionTypes.SaveDaxe),
    mergeMap((body: SaveDaxe) =>
      this.userService.getUserDetails().pipe(
        map((user) => {
          const daxe: DaxeInfo = { ...body.daxe };
          daxe.daxeProgrmaDetail = { ...body.daxe.daxeProgrmaDetail };
          // daxe.tenantid = user.orgId;
          // daxe.daxeProgrmaDetail.tenantId = user.orgId;
          daxe.userModified = user.orgId;
          if (!daxe.daxeProgrmaDetail.userCreated) {
            daxe.daxeProgrmaDetail.userCreated = user.orgId;
          }
          return daxe;
        }),
        mergeMap((daxe) =>
          this.daxeService.saveDaxeRule(daxe).pipe(mergeMap((response: DaxeInfo) => [new SaveDaxeSuccess(response)]))
        )
      )
    )
  );
}
