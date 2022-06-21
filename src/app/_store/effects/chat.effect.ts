import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, take, tap } from 'rxjs/operators';
import { RawMessageObject } from '../../_modules/chat/_common/chat';
import { ChatService } from '../../_services/chat/chat.service';
import {
  loadingState,
  loadMessages,
  loadMessagesChannelId, loadMessagesPagination,
  loadMessagesSuccess
} from './../actions/chat.action';

@Injectable()
export class ChatEffect {
  constructor(private actions$: Actions, private chatService: ChatService) {}
  @Effect()
  loadMessages$ = this.actions$.pipe(
    ofType(loadMessages),
    map((action) => {
      return {
        channelId: action.channelId,
        fetchSize: action.fetchSize,
        fetchCount: action.fetchCount,
      };
    }),
    tap(() => {
      loadingState({ loadingState: 'loading' });
    }),
    mergeMap((payload) =>
      this.chatService.getAllMessages(payload).pipe(
        take(1),
        mergeMap((response: RawMessageObject[]) => [
          loadMessagesSuccess({ messages: response?.length ? response : [] }),
          loadMessagesPagination({
            pagination: {
              fetchCount: payload.fetchCount,
              fetchSize: payload.fetchSize,
            },
          }),
          loadMessagesChannelId({ channelId: payload.channelId }),
        ]),
        catchError((err) => {
          loadMessagesSuccess({ messages: [] });
          return [];
        })
      )
    )
  );
}
