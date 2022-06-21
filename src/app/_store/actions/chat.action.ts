
import { createAction, props } from '@ngrx/store';
import {
    MessagePagination,
    RawMessageObject
} from '../../_modules/chat/_common/chat';

export enum ChatActions {
    UPDATE_CONNECTION_STATUS    = '[Chat] Update connection Status',
    LOAD_ALL_MESSAGES           = '[CHAT] Load all messages',
    REQUEST_CHANNEL_ID          = '[CHAT] Request channel id',
    LOADING_MESSAGES            = '[CHAT] Loading messages...',
    LOAD_MESSAGES_SUCCESS       = '[CHAT] Load messages success / Update chat messages',
    LOAD_MESSAGES_PAGINATION    = '[CHAT] Update chat pagination',
    LOAD_MESSAGES_CHANNEL_ID    = '[CHAT] Update chat channel id',
    ADD_MESSAGE                 = '[CHAT] Add message to list',
    UPDATE_MESSAGE              = '[CHAT] Update message to list',
    REMOVE_MESSAGE              = '[CHAT] Remove message from list',
};

/**
 * Action to maintain socket connection status
 * @params channelId: string
 * @params connected: boolean
 */
export const updateConnectionStatus = createAction(
    ChatActions.UPDATE_CONNECTION_STATUS, props<{
        connected: boolean,
        channelId: string,
        errorText: string
    }>()
);

/**
 * Action to load all chat messages for a channel
 * @params pagination: MessagePagination
 */
export const loadMessages = createAction(
    ChatActions.LOAD_ALL_MESSAGES, props<{
        fetchCount: number;
        fetchSize: number;
        channelId: string,
    }>()
);

/**
 * Action to update the state on load messages success
 */
export const loadMessagesSuccess = createAction(
    ChatActions.LOAD_MESSAGES_SUCCESS, props<{
        messages: RawMessageObject[],
    }>()
);

/**
 * Action to add message to list
 */
export const addMessage = createAction(
    ChatActions.ADD_MESSAGE, props<{
        messageToAdd: RawMessageObject,
    }>()
);

/**
 * Action to add message to list
 */
export const updateMessage = createAction(
    ChatActions.UPDATE_MESSAGE, props<{
        message: any,
        id: string,
    }>()
);

/**
 * Action to add message to list
 */
export const removeMessage = createAction(
    ChatActions.REMOVE_MESSAGE, props<{
        messageIdToRemove: string,
    }>()
);

/**
 * Action to update the loading state
 */
export const loadingState = createAction(
    ChatActions.LOADING_MESSAGES, props<{
        loadingState: string,
    }>()
);

/**
 * Action to update the state on load messages pagination
 */
export const loadMessagesPagination = createAction(
    ChatActions.LOAD_MESSAGES_PAGINATION, props<{
        pagination: MessagePagination,
    }>()
);

/**
 * Action to update the state on load messages ChannelId
 */
export const loadMessagesChannelId = createAction(
    ChatActions.LOAD_MESSAGES_CHANNEL_ID, props<{
        channelId: string,
    }>()
);

/**
 * Action to request channel id
 * Maintaining the request data in the store
 */
export const requestChannelId = createAction(
    ChatActions.REQUEST_CHANNEL_ID, props<{
        pageId: 'na';
        moduleId: 'na';
        recordId: 'na';
        crId: 'na';
        schemaId: 'na';
        massId: 'na';
        customProp1: 'na';
        customProp2: 'na';
        customProp3: 'na';
        customProp4: 'na';
        customProp5: 'na';
        customProp6: 'na';
        customProp7: 'na';
        customProp8: 'na';
        customProp9: 'na';
        customProp10: 'na';
     }>()
);
