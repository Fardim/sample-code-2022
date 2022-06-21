import { createReducer, on } from '@ngrx/store';
import { ChannelIdrequest, MessagePagination, RawMessageObject } from '../../_modules/chat/_common/chat';
import { addMessage, loadMessagesChannelId, loadMessagesPagination, loadMessagesSuccess, removeMessage, requestChannelId, updateConnectionStatus, updateMessage } from '../actions/chat.action';

export interface ChatState extends ChannelIdrequest, MessagePagination {
    messages: RawMessageObject[];
    connected: boolean;
    loadingState: 'loading' | 'loaded' | 'error' | '';
    errorText: string;
    channelId: string;
}

export const initialChatState: ChatState = {
    messages: [],
    connected: false,
    loadingState: '',
    errorText: null,
    pageId: 'na',
    moduleId: 'na',
    recordId: 'na',
    crId: 'na',
    schemaId: 'na',
    massId: 'na',
    customProp1: 'na',
    customProp2: 'na',
    customProp3: 'na',
    customProp4: 'na',
    customProp5: 'na',
    customProp6: 'na',
    customProp7: 'na',
    customProp8: 'na',
    customProp9: 'na',
    customProp10: 'na',
    channelId: null,
    fetchCount: 0,
    fetchSize: 50,
};

export const reducer = createReducer (
    // Provide the initial state
    initialChatState,

    // Initialize and update socket connection status
    on(updateConnectionStatus, (State, { connected, channelId, errorText }) => ({
        ...State,
        connected,
        errorText,
        channelId,
    })),

    // Load previous messages for a channel
    on(loadMessagesSuccess, (State, { messages }) => ({
        ...State,
        messages,
        loadingState: 'loaded',
    })),

    // Add current message to list
    on(addMessage, (State, { messageToAdd }) => ({
        ...State,
        messages: [...State.messages, messageToAdd],
    })),

    // Update current message in list
    on(updateMessage, (State, { message, id }) => ({
        ...State,
        messages: State.messages.map((messageFromStore) => {
            if (messageFromStore.id === id) {
                messageFromStore.msg = message;
            }

            return messageFromStore;
        }),
    })),

    // Remove current message from list
    on(removeMessage, (State, { messageIdToRemove }) => ({
        ...State,
        messages: State.messages.filter(message => message.id !== messageIdToRemove),
    })),

    // Load previous messages for a channel
    on(loadMessagesChannelId, (State, { channelId }) => ({
        ...State,
        channelId,
    })),

    // Load previous messages for a channel
    on(loadMessagesPagination, (State, { pagination }) => ({
        ...State,
        fetchCount: pagination.fetchCount,
        fetchSize: pagination.fetchSize,
    })),

    // Request channel id
    on(requestChannelId, (State, {
        pageId,
        moduleId,
        recordId,
        crId,
        schemaId,
        massId,
        customProp1,
        customProp2,
        customProp3,
        customProp4,
        customProp5,
        customProp6,
        customProp7,
        customProp8,
        customProp9,
        customProp10,
     }) => ({
        ...State,
        pageId,
        moduleId,
        recordId,
        crId,
        schemaId,
        massId,
        customProp1,
        customProp2,
        customProp3,
        customProp4,
        customProp5,
        customProp6,
        customProp7,
        customProp8,
        customProp9,
        customProp10,
    }))
)