import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DmsService } from '@services/dms/dms.service';

@Component({
  selector: 'pros-file-item',
  templateUrl: './file-item.component.html',
  styleUrls: ['./file-item.component.scss']
})
export class FileItemComponent implements OnInit, OnChanges {

  @Input() name: string = '';
  @Input() serial: string;
  @Input() downloadable: boolean;
  @Input() removable: boolean;
  @Input() showProgressBar: boolean;
  @Input() hasError: boolean;
  @Input() progressMode: 'indeterminate' | 'determinate' = 'indeterminate';
  @Input() progressValue = 0;


  @Output() removed: EventEmitter<any> = new EventEmitter(null);

  constructor(private dmsService: DmsService) { }

  ngOnInit(): void {
  }

  downloadAttachment(sno: string, fileName: string) {
    if(!sno) {
      return;
    }
    this.dmsService.downloadFile(sno).subscribe(resp => {
      if(resp) {
        const file = new window.Blob([resp], {type: 'application/octet-stream'});
        const downloadAncher = document.createElement('a');
        downloadAncher.style.display = 'none';
        const fileURL = URL.createObjectURL(file);
        downloadAncher.href = fileURL;
        downloadAncher.download = fileName;
        downloadAncher.click();
      }
    },
    error => {
      console.error(`Something went wrong, try later !`);
    });
  }


  /**
   * get file icon based on file name
   * @param attachmentName attached file name added
   */
   getAttachmentIcon(attachmentName: string): string {
    let attachmentIcon = '';
    const path = './assets/images/ext/';
    const attachmentExt = attachmentName.split('.')[1];
    switch (attachmentExt) {
      case 'docx':
      case 'doc': {
        attachmentIcon = `${path}doc.svg`;
        break;
      }
      case 'jpg':
      case 'png':
      case 'jpeg': {
        attachmentIcon = `${path}img.svg`;
        break;
      }
      case 'pdf': {
        attachmentIcon = `${path}pdf.svg`;
        break;
      }
      case 'ppt': {
        attachmentIcon = `${path}ppt.svg`;
        break;
      }
      case 'txt': {
        attachmentIcon = `${path}txt.svg`;
        break;
      }
      case 'xls': {
        attachmentIcon = `${path}xls.svg`;
        break;
      }
      case 'xlsx': {
        attachmentIcon = `${path}xls.svg`;
        break;
      }
      case 'zip': {
        attachmentIcon = `${path}zip.svg`;
        break;
      }
      default: {
        attachmentIcon = `${path}none.svg`;
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
    if(attachmentName.length < 25) {
      return attachmentName;
    }

    const name = attachmentName.split('.');
    if(name.length > 1) {
      return name[0].substr(0, 25 - name[1].length ).toString() + '...' + name[1];
    }
    return name[0].substr(0, 25);
  }

  remove() {
    this.removed.emit();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.name && changes.name.currentValue) {
      this.name = changes.name.currentValue;
    }
    if(changes.serial && changes.serial.currentValue) {
      this.serial = changes.serial.currentValue;
    }
  }
}
