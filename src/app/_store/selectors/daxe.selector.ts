import { createSelector, createFeatureSelector } from '@ngrx/store';
import { DaxeModuleState, DAXE_STATE_NAME } from '../state/daxe.state';

const getDaxeState = createFeatureSelector<DaxeModuleState>(DAXE_STATE_NAME);

const getDaxeFeatureState = createSelector(getDaxeState, (state: DaxeModuleState) => state.daxe);
export const getDaxeList = createSelector(getDaxeFeatureState, (state) => state.daxeList);
export const getNewDaxeList = createSelector(getDaxeFeatureState, (state) => state.newDaxeList);
export const getDaxeInfo = createSelector(getDaxeFeatureState, (state) => state.daxeRuleInfo || null);
export const getDaxeUnsave = createSelector(getDaxeFeatureState, (state) => state.daxeList.find(d => d.id.includes('new')));