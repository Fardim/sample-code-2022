import { Daxe, DaxeInfo } from '@store/models/daxe.model';
import { unionBy } from 'lodash';
import { DaxeActions, DaxeActionTypes } from '../actions/daxe.action';

export interface DaxeState {
  loading: boolean;
  daxeList: Daxe[];
  newDaxeList: Daxe[];
  daxeRuleInfo?: DaxeInfo;
}

const initialState: DaxeState = {
  loading: false,
  daxeList: [],
  newDaxeList: [],
};

export function reducer(state = initialState, action: DaxeActions): DaxeState {
  switch (action.type) {
    case DaxeActionTypes.DaxeLoadSuccess:
      const payload = unionBy(state.daxeList ? state.daxeList : [], action.payload, 'id');
      return {
        ...state,
        daxeList: payload
      };
    case DaxeActionTypes.AddDaxe:
      let newDaxeList = [...state.newDaxeList, action.daxe];
      return {
        ...state,
        newDaxeList
      };
    case DaxeActionTypes.UpdateDaxe:
      newDaxeList = [...state.daxeList];
      let index;
      newDaxeList.forEach((item, i) => {
        if (item.id === action.daxe.id) {
          index = i;
          return;
        }
      });
      newDaxeList[index] = action.daxe;
      return {
        ...state,
        newDaxeList
      };
    case DaxeActionTypes.DaxeGetLocal:
      const unsaveDaxe = state.daxeList.filter(d => d.id === 'new')
      return {
        ...state,
        daxeList: unsaveDaxe
      };
    case DaxeActionTypes.DaxeLoadInfoSuccess:
      return {
        ...state,
        daxeRuleInfo: action.payload
      };
    case DaxeActionTypes.SaveLocalDaxeRule:
      if (state.newDaxeList.length > 0) {
        state.newDaxeList.forEach(daxe => {
          daxe.dataSetId = action.datasetId;
          // new SaveDaxe(daxe);
        });
      }
      return {
        ...state,
        newDaxeList: []
      };
    default:
      return state;
  }
}
