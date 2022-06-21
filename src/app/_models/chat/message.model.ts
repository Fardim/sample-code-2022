export class Message {
  id: string;
  senderName: string;
  senderImage: string;
  msg: any;
  date: string;
  attachmentType: string;
  attachmentText: string;
  attachmentList: Attachment[];
  isUnread: boolean;
  fromUserId: string;
  deleted: boolean;
  edited: boolean;
  replyFor: string;
  replyForMsg: any;
  fromUserInfo: any;
}

export class Attachment {
  sno: string;
  attachmentName: string;
}

export class ChannelReq {
  fqdn: string;
  tenantId: string;
  pageId: string;
  moduleId: string;
  recordId: string;
  crId: string;
  schemaId: string;
  massId: string;
}
