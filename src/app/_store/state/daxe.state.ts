import { reducer, DaxeState } from '../reducers/daxe.reducer';
import { ActionReducerMap } from '@ngrx/store';

export const DAXE_STATE_NAME = 'daxe';

export interface DaxeModuleState {
    daxe: DaxeState
}

export const daxeReducers: ActionReducerMap<DaxeModuleState> = {
    daxe: reducer,
};