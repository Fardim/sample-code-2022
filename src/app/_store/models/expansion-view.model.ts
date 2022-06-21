import { AppState } from './../state/app.state';
import { ExpansionViewState } from './../reducers/expansion-view.reducer';
import * as fromExpansionView from './../reducers/expansion-view.reducer';
export interface ExpansionViewModuleState {
    expansionview: ExpansionViewState
}

export interface State extends AppState {
    expansionviewModule: ExpansionViewModuleState;
}

export const expansionviewReducer = {
    expansionview: fromExpansionView.reducer,
};