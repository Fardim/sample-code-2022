import { Block } from 'mdo-ui-library';

export enum EditorModes {
  EDIT = 'edit',
  REPLY = 'reply',
  ATTACHMENT = 'attachment',
  NORMAL = 'normal',
}

export interface MessagePayload {
  channelId: string;
  fromUserId: string;
  msg: any;
  id?: string;
  replyFor?: string;
  deleted?: boolean;
  edited?: boolean;
}

export enum MessageSentEvent {
  EDIT_SENT = 'editSent',
  REPLY_SENT = 'replySent',
  DELETE_SENT = 'deleteSent',
  ATTACHMENT_SENT = 'attachmentSent',
}

export interface EditorOutput {
  payload: Partial<MessagePayload>;
  tenantId: string | number;
}

export interface MessagePagination {
  fetchCount: number; // Page index
  fetchSize: number; // number of records per page
}
export interface AllMessagesRequest extends MessagePagination {
  channelId: string;
  searchAfter?: any[];
}

export interface ChannelIdrequest {
  pageId: string;
  moduleId: string;
  recordId: string;
  crId: string;
  schemaId: string;
  massId: string;
  customProp1?: string;
  customProp2?: string;
  customProp3?: string;
  customProp4?: string;
  customProp5?: string;
  customProp6?: string;
  customProp7?: string;
  customProp8?: string;
  customProp9?: string;
  customProp10?: string;
  channelId?: string;
}

export interface FileAttachment {
  block: Block;
  status: '' | 'uploading' | 'uploaded' | 'error';
  uploadProgress?: number;
}

export class MessageDetails {
  text: string;
  messageType?: string;
  attachments?: FileAttachment[];
  quotedMessage?: MessageDetails;
  id: string;
  senderName: string;
  senderImage: string;
  date: string | number | any;
  time?: string;
  attachmentType: string;
  attachmentText: string;
  isUnread: boolean = true;
  fromUserId: string;
  deleted: boolean = false;
  edited: boolean = false;
  replyFor: string;
  replyForMsg: any;
  fromUserInfo: any;
  senderMessageId: string;
  userId: string;
  channelId: string;
  rawMsg: string;
  toUserId: string;
  toUserInfo: any;
  sortValues: any;
  public: boolean = false;
}

export interface RawMessageObject {
  id: string;
  senderMessageId: string;
  replyFor: string;
  replyForMsg: string;
  deleted: boolean;
  edited: boolean;
  userId: string;
  channelId: string;
  date: string;
  rawMsg: string;
  msg: any;
  fromUserId: string;
  fromUserInfo: any;
  toUserId: string;
  toUserInfo: any;
  sortValues: string;
  public: boolean;
  attachmentType?: string;
  attachmentText?: string;
  senderImage?: string;
  senderName?: string;
}

export interface DateWiseMessageList {
  date: string;
  messageDetails: MessageDetails[];
}

export interface DeleteMessageRequest {
  id: string;
  channelId: string;
  fromUserId: string;
  msg: any;
}

export const FILE_NAME_SEPARATOR = '____';

export const mockMessageList = [
  {
    id: '3531dae1-1911-4665-b958-f020808f1eb0',
    senderMessageId: null,
    replyFor: null,
    replyForMsg: null,
    deleted: false,
    edited: false,
    userId: 'cm.public',
    channelId: 'e6e3d836-00b1-489e-a642-0395377ce276',
    date: '2022-03-04T11:11:33.839+00:00',
    rawMsg: null,
    msg: {
      type: 'rich_text',
      elements: [
        {
          type: 'text',
          elements: [
            {
              type: 'text',
              elements: null,
              raw: null,
              text: '1\n',
              style: null,
              userId: null,
              url: null,
              name: null,
              listIndent: 0,
            },
          ],
          raw: null,
          text: null,
          style: null,
          userId: null,
          url: null,
          name: null,
          listIndent: 0,
        },
      ],
      raw: null,
      text: null,
      style: null,
      userId: null,
      url: null,
      name: null,
      listIndent: 0,
    },
    fromUserId: 'luv200@gmail.com',
    fromUserInfo: null,
    toUserId: null,
    toUserInfo: null,
    sortValues: null,
    public: true,
  },
];
