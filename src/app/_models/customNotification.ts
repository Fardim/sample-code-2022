
export interface CustomNotification {
    id: string;
    senderUid: string;
    recieversUid: Array<string>;
    recieversMail: string;
    senderMail: string;
    sendTime: string,
    headerText: string;
    contentText: string;
    msgUnread: string;
    isShortenedText: string;
    objectId: string;
    objectType: string;
    acknowledgementRequired: string;
    acknowledmentStatus: string;
    downloadLink: string;
    showMore? : boolean;
}