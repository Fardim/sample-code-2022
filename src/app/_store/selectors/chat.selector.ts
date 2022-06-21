import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ChatModuleState } from '@store/models/chat.model';

export const CHAT_MODULE = 'chatModule';

const getChatModuleState = createFeatureSelector<ChatModuleState>(CHAT_MODULE);
const getChatFeatureState = createSelector(getChatModuleState, (state: ChatModuleState) => state.chat);

export const selectAllMessages = createSelector(getChatFeatureState, (state) => state.messages);
export const getMessagesLoadingState = createSelector(getChatFeatureState, (state) => state.loadingState);
export const getChannelId = createSelector(getChatFeatureState, (state) => state.channelId);
export const getPagination = createSelector(getChatFeatureState, (state) => {
    return {
        fetchCount: state.fetchCount,
        fetchSize: state.fetchSize,
    }
});
