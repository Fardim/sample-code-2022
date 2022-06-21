import { FieldState } from './../reducers/field.reducer';
import { AppState } from './../state/app.state';
import * as fromField from './../reducers/field.reducer';

export interface FieldModuleState {
    field: FieldState
}

export interface State extends AppState {
    fieldModule: FieldModuleState;
}

export const fieldReducers = {
    field: fromField.reducer,
};