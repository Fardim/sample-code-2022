import { ConnectorService } from './../services/connector.service';
import { BlockElementTypes } from 'mdo-ui-library';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'pros-sap-connector-step-one',
  templateUrl: './sap-connector-step-one.component.html',
  styleUrls: ['./sap-connector-step-one.component.scss'],
})
export class SapConnectorStepOneComponent implements OnInit {
  /*** number of chips to show as selected*/
  limit = 5;

  selectedColumns: string[] = [];

  serviceStructureOptions = [
    { label: 'Standard Package', value: 'STANDARD_PACKAGE' },
    { label: 'SAP Table', value: 'SAP_TABLE' },
    { label: 'Others', value: 'OTHERS' },
  ];

  generateStructureOptions = [
    { label: 'Service URL', value: 'SERVICE_URL' },
    { label: 'File Upload', value: 'FILE_UPLOAD' },
  ];

  standardPackageOptions = ['Material management', 'Functional location', 'Equipment management'];

  sapTableOptions = ['Table 1', 'Table 2', 'Table 3'];

  columnOptions = ['Col 1', 'Col 2', 'Col 3', 'Col 4', 'Col 5', 'Col 6', 'Col 7', 'Col 8'];
  urlOptions = ['https://www.google.com/', 'http://tv.ebox.live/', 'https://ionicacademy.com/', 'https://www.figma.com/'];

  hideUrlDropdown = false;

  attachments: any[] = [];

  constructor(public connectorService: ConnectorService) {}

  ngOnInit(): void {}

  /**
   * to check if limit is extended
   */
  hasLimit(isParentDataset): boolean {
    return this.selectedColumns.length > this.limit;
  }

  remove(opt: string) {}

  /**
   * get file icon based on file name
   * @param attachmentName attached file name added
   */
  getAttachmentIcon(attachmentName) {
    let attachmentIcon = '';
    const attachmentExt = attachmentName.split('.')[1];
    switch (attachmentExt) {
      case 'docx':
      case 'doc': {
        attachmentIcon = '/assets/images/ext/doc.svg';
        break;
      }
      case 'jpg':
      case 'png':
      case 'jpeg': {
        attachmentIcon = '/assets/images/ext/img.svg';
        break;
      }
      case 'pdf': {
        attachmentIcon = '/assets/images/ext/pdf.svg';
        break;
      }
      case 'ppt': {
        attachmentIcon = '/assets/images/ext/ppt.svg';
        break;
      }
      case 'txt': {
        attachmentIcon = '/assets/images/ext/txt.svg';
        break;
      }
      case 'xls': {
        attachmentIcon = '/assets/images/ext/xls.svg';
        break;
      }
      case 'zip': {
        attachmentIcon = '/assets/images/ext/zip.svg';
        break;
      }
      default: {
        attachmentIcon = '/assets/images/ext/none.svg';
        break;
      }
    }
    return attachmentIcon;
  }

  /**
   * truncate attachment name after 25 chars
   * @param attachmentName attachment name
   * @returns truncated name
   */
  truncateAttachmentName(attachmentName: string) {
    if (attachmentName.length < 25) {
      return attachmentName;
    }

    const name = attachmentName.split('.');
    if (name.length > 1) {
      return name[0].substr(0, 25 - name[1].length).toString() + '...' + name[1];
    }
    return name[0].substr(0, 25);
  }

  removeAttachment(index): void {
    this.attachments.splice(index, 1);
  }

  uploadAttachements(files: File[]): void {
    if (!files) {
      return;
    }
    for (const file of files) {
      console.log(file.name);
      const block = {
        type: BlockElementTypes.LINK,
        url: '',
        fileName: file.name,
      };
      const attachment = {
        file,
        block,
        uploadError: false,
        uploaded: false,
        uploadProgress: 0,
      };
      // this.dmsService.uploadFile(file).subscribe(resp => {
      //   if(resp) {
      //     attachment.block.url = resp + file.name;
      //     attachment.uploaded = true;
      //     attachment.uploadProgress = 100;
      //   }
      // }, error => {
      //   console.error(`Error:: ${error.message}`);
      //   attachment.uploadError = true;
      // })
      this.attachments.push(attachment);
    }
  }
}
