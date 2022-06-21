import { BlockElementTypes } from 'mdo-ui-library';
import { FileAttachment, FILE_NAME_SEPARATOR } from './chat';

export const getMentionCharIndex = (text: string, mentionDenotationChars: any) => {
  return mentionDenotationChars.reduce(
    (prev: any, mentionChar: any) => {
      const mentionCharIndex = text.lastIndexOf(mentionChar);

      if (mentionCharIndex > prev.mentionCharIndex) {
        return {
          mentionChar,
          mentionCharIndex,
        };
      }
      return {
        mentionChar: prev.mentionChar,
        mentionCharIndex: prev.mentionCharIndex,
      };
    },
    { mentionChar: null, mentionCharIndex: -1 }
  );
};

export const hasValidMentionCharIndex = (mentionCharIndex: number, text: string, isolateChar: any) => {
  if (mentionCharIndex > -1) {
    if (isolateChar && !(mentionCharIndex === 0 || !!text[mentionCharIndex - 1].match(/\s/g))) {
      return false;
    }
    return true;
  }
  return false;
};

/**
 * get attachment from message
 * @param msg incoming message as quill delta
 * @returns list of attachments
 */
export const getMessageAttachments = (msg: any) => {
  const attachments: FileAttachment[] = [];

  if (msg?.elements) {
    const files = msg.elements.filter((el) => el.type === BlockElementTypes.IMAGE);
    files.forEach((file) => {

      console.log('file', file);
      const fileNameArr = file.url.split(FILE_NAME_SEPARATOR);
      attachments.push({
        block: {
          type: BlockElementTypes.IMAGE,
          sno: fileNameArr[0],
          fileName: fileNameArr[1],
          url: fileNameArr[0],
        },
        status: 'uploaded',
        uploadProgress: 0,
      });
    });
  }

  return attachments;
};
