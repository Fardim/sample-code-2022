import { ChatState } from './../reducers/chat.reducer';
import { AppState } from './../state/app.state';
import { reducer } from './../reducers/chat.reducer';

export interface ChatModuleState {
    chat: ChatState
}

export interface State extends AppState {
    chatModule: ChatModuleState;
}

export const chatReducers = {
    chat: reducer,
};