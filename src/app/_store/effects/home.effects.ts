import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { getHomeState } from '@store/selectors/home.selector';
import { of } from 'rxjs';
import { concatMap, tap, withLatestFrom } from 'rxjs/operators';
import { toggleSecondarySidebar } from '../actions/home.actions';
@Injectable()
export class HomeEffects {
  constructor(private actions$: Actions, private store: Store) {}
  // Pick up both toggle Primary/Secondary actions and trigger the same effect
  saveHomeStateToLocalStorage$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(toggleSecondarySidebar),
        // Get latest home state
        concatMap((action) => of(action).pipe(withLatestFrom(this.store.select(getHomeState)))),
        tap(([action, homeState]) => {
          if (homeState) {
            localStorage.setItem('mdo-home-state', btoa(JSON.stringify(homeState)));
          }
        })
      ),
    { dispatch: false }
  );
}
