import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Utilities } from '@models/schema/utilities';
import { UserPersonalDetails } from '@models/userdetails';
import { FileAttachment, FILE_NAME_SEPARATOR } from '@modules/chat/_common/chat';
import { DmsService } from '@services/dms/dms.service';
import { merge, pick } from 'lodash';
import { Block, BlockElementTypes } from 'mdo-ui-library';

@Component({
  selector: 'pros-attachment-dialog',
  templateUrl: './attachment-dialog.component.html',
  styleUrls: ['./attachment-dialog.component.scss'],
})
export class AttachmentDialogComponent implements OnInit {
  viewInitialized = false;
  attachments: FileAttachment[] = [];
  textPayload: any = null;
  currentChannelId: string;
  public currentUser: UserPersonalDetails | null;
  constructor(
    private dialogRef: MatDialogRef<AttachmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private dmsService: DmsService,
    private utilityService: Utilities
  ) {
    this.currentUser = data?.currentUser || null;
    this.currentChannelId = data?.currentChannelId || '';
  }

  ngOnInit(): void {}

  /**
   * getting on text chnage event form the attachement editor section
   * @param attachmentMessage attachement message as object
   */
  attchmentMessageEmitter(attachmentMessage: any) {
    this.textPayload = attachmentMessage;
  }

  close() {
    this.textPayload = null;
    this.attachments = [];
    this.dialogRef.close();
  }

  /**
   * Add file to a message and update the message block
   */
  addFileToMessage(textPayload: any, attachements: FileAttachment[] = []) {
    let dataToEmit = null;
    return new Promise((resolve, reject) => {
      let fileBlock = null;
      if (attachements?.length) {
        const arr = attachements.map((file) => merge({}, pick(file, ['block', 'status'])));
        fileBlock = {
          type: BlockElementTypes.RICH_TEXT,
          elements: arr.map((file) => {
            return {
              type: BlockElementTypes.IMAGE,
              url: file?.block?.url,
              sno: '',
              fileName: file?.block?.fileName,
            }
          }),
        }
      }
      if (textPayload) {
        if(textPayload?.payload?.msg?.elements?.length) {
          textPayload.payload.msg.elements = [...textPayload.payload.msg.elements, ...fileBlock.elements];
          dataToEmit = textPayload;
        }
      } else {
        const block = new Block();
        block.type = BlockElementTypes.RICH_TEXT;
        block.elements = [...fileBlock.elements];
        dataToEmit = {
          payload: {
            channelId: this.currentChannelId,
            fromUserId: this.currentUser?.profileKey?.userName,
            msg: block,
          },
        };
      }

      resolve(dataToEmit);
    });
  }

  add() {
    this.addFileToMessage(this.textPayload, this.attachments).then((payload) => {
      this.dialogRef.close(payload);
    });
  }

  updateAttachments(attachments: FileAttachment[]) {
    this.attachments = attachments;
  }

  public uploadAttachements(attachments: File[]) {
    if (!attachments) {
      return;
    }
    for (const attachment of attachments) {
      const sno = this.utilityService.generate_UUID();
      this.attachments.push({
        block: {
          type: BlockElementTypes.IMAGE,
          url: `${FILE_NAME_SEPARATOR}${attachment.name}`,
          fileName: attachment.name,
          sno,
        },
        status: 'uploading',
        uploadProgress: 0,
      });

      this.dmsService.uploadFile(attachment).subscribe(
        (resp) => {
          this.updateUploadStatus(sno, 'uploaded', resp);
        },
        (error) => {
          console.error(`Error:: ${error.message}`);
          this.updateUploadStatus(sno, 'error');
        }
      );
    }
  }

  get attachmentsHasError(): boolean {
    return !!this.attachments?.some((attachment) => attachment.status === 'error');
  }

  get attachmentIsUploading(): boolean {
    return !!this.attachments?.some((attachment) => attachment.status === 'uploading');
  }

  /**
   * update each file's upload status
   * @param sno passed sno to be updated
   * @param status status to be updated
   */
  updateUploadStatus(sno: string, status: 'uploaded' | 'uploading' | 'error', updatedSnos: string = '') {
    this.attachments = this.attachments.map((attachment) => {
      if(attachment.block.sno === sno) {
        attachment.status = status;
        attachment.block.sno = updatedSnos;
        attachment.block.url = `${updatedSnos}${attachment.block.url}`;
      }

      return attachment;
    });
  }
}
