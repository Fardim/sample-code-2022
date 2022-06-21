import { FieldlistContainer } from '@models/list-page/listpage';
import { FieldService, FieldPaginationDto } from './../../_modules/list/_components/field/field-service/field.service';
import { CoreService } from '@services/core/core.service';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { mergeMap, map, catchError, take, tap } from 'rxjs/operators';
import * as fromFieldActions from './../actions/field.action';
import { of } from 'rxjs';

@Injectable()
export class FieldEffect {
  constructor(private actions$: Actions, private coreService: CoreService, private fieldService: FieldService) {}
  @Effect()
  loadFilteredDailyProjects$ = this.actions$.pipe(
    ofType(fromFieldActions.FieldActionTypes.DatasetFieldLoad),
    map((action: fromFieldActions.DatasetFieldLoad) => {
        return action.payload;
    }),
    tap(() => of(new fromFieldActions.DatasetFieldLoading(false))),
    mergeMap((pagination: FieldPaginationDto) =>
      this.fieldService.getFieldList(pagination).pipe(
        take(1),
        mergeMap((response: FieldlistContainer[]) => [
          new fromFieldActions.DatasetFieldLoadSuccess(response),
          new fromFieldActions.DatasetFieldPagination(pagination),
          new fromFieldActions.DatasetFieldLoading(false),
        ]),
        catchError((err) => of(new fromFieldActions.DatasetFieldLoading(false), new fromFieldActions.SetFieldListLoadingState(null)))
      )
    )
  )
}
