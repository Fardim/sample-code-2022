import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatEditorComponent } from './_components/chat-editor/chat-editor.component';
import { ScrollableMessagesContainerComponent } from './_components/scrollable-messages-container/scrollable-messages-container.component';
import { ChatComponent } from './_components/chat.component';
import { ChatMembersComponent } from './_components/chat-members/chat-members.component';
import { SharedModule } from '@modules/shared/shared.module';
import { AttachmentSectionComponent } from './_components/attachment-section/attachment-section.component';
import { FileItemComponent } from './_components/file-item/file-item.component';
import { MessageBlockComponent } from './_components/message-block/message-block.component';
import { MessageContentComponent } from './_components/message-block/message-content/message-content.component';
import { ExpandableTextBlockComponent } from './_components/message-block/message-content/expandable-text-block/expandable-text-block.component';
import { UsersListComponent } from './_components/users-list/users-list.component';
import { ManageChatCollaboratorsComponent } from './_components/manage-chat-collaborators/manage-chat-collaborators.component';
import { AttachmentDialogComponent } from './_components/attachment-dialog/attachment-dialog.component';
import { ObjectSelectorComponent } from './_components/object-selector/object-selector.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { chatReducers } from '@store/models/chat.model';
import { ChatEffect } from '@store/effects/chat.effect';
import { CHAT_MODULE } from '@store/selectors/chat.selector';

const EXPORTABLE_COMPONENTS = [
  ChatEditorComponent,
  ScrollableMessagesContainerComponent,
  ChatComponent,
  ChatMembersComponent,
  AttachmentSectionComponent,
  MessageBlockComponent,
  FileItemComponent,
  MessageContentComponent,
  ExpandableTextBlockComponent,
  UsersListComponent,
  ManageChatCollaboratorsComponent,
  AttachmentDialogComponent,
  ObjectSelectorComponent
];

@NgModule({
  declarations: [...EXPORTABLE_COMPONENTS],
  imports: [
    CommonModule,
    SharedModule,
    StoreModule.forFeature(CHAT_MODULE, chatReducers),
    EffectsModule.forFeature([ChatEffect]),
  ],
  exports: [...EXPORTABLE_COMPONENTS],
})
export class ChatModule { }
