import { Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GridResponse } from '@modules/transaction/model/transaction';
import { DataControlService } from '@modules/transaction/_service/data-control.service';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import { DmsService } from '@services/dms/dms.service';
import { TransientService } from 'mdo-ui-library';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export class FileSource {
  name: string;
  extension: string;
  docid: string;
}

@Component({
  selector: 'pros-from-view-attachment',
  templateUrl: './from-view-attachment.component.html',
  styleUrls: ['./from-view-attachment.component.scss'],
})
export class FromViewAttachmentComponent implements OnChanges, OnDestroy {

  @Input()
  control: FormControl;

  /**
   * The type of control , can be single or multi
   */
  @Input() multiSelect = true;

  @Input() fieldObj: GridResponse;

  @Output()
  valueChange: EventEmitter<any[]> = new EventEmitter<any[]>();

  /**
   * The error messages
   */
  errorMsg: string;

  /**
   * Data source for the files...
   */
  dataSource: FileSource[] = [];

  /**
   * The attachment ...
   */
  attachments: any[] = [];

  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();

  constructor(
    public transService: TransactionService,
    private dmsServive: DmsService,
    private trasiantService: TransientService,
    public dataControlService: DataControlService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.control && changes.control.currentValue !== changes.control.previousValue) {
      if(this.control?.value?.length) {
        this.control.value.filter(f => f.t || f.c).forEach(v => {
          this.dataSource.push({ name: v.t || v.c, extension: v.t?.split('.').pop(), docid: v.c });
        });
      } else {
        this.dataSource = [];
      }
    }
  }

  fileChange(fileList) {
    if (!fileList) {
      this.errorMsg = 'Unable to complete upload: (Select a file)';
    } else {
      this.errorMsg = null;
      const supportedFileTypes = this.fieldObj.fileTypes?.split(',') || [];
      for (const file of fileList) {
        if (!supportedFileTypes.some(type => file.name.endsWith(`.${type}`))) {
          this.errorMsg = 'File type is not supported';
        } else {
          this.dataSource.push({ name: file.name, extension: file.name.split('.').pop(), docid: '' });
          this.attachments.push(file);
          this.saveDoc(file, this.dataSource.length - 1);
        }
      }
    }
    (document.getElementById('uploader') as HTMLInputElement).value = '';
  }

  removeSelectedFile(file: FileSource) {
    this.removeDoc(file.docid);
  }

  @HostListener('dragover', ['$event']) public onDragOver(evt) {
    evt.preventDefault();
    evt.stopPropagation();
  }

  @HostListener('drop', ['$event']) public ondrop(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.fileChange(evt.dataTransfer.files);
  }

  /**
   * Update the control ....
   */
  updateControl() {
    const value = [];
    this.dataSource.forEach(file => {
      value.push({
        t: file.name,
        c: file.docid
      })
    })
    this.valueChange.emit(value);
  }

  /**
   * The doc which need to remove it
   * @param docId the doc id which need to remove it
   */
  removeDoc(docId: string) {
    console.log(docId);
    this.trasiantService.confirm(
      {
        data: { dialogTitle: 'Confirmation', label: `Are you sure to delete this ?` },
        disableClose: true,
        autoFocus: false,
        width: '400px',
        panelClass: 'create-master-panel',
      },
      (response) => {
        if ('yes' === response) {
          this.dmsServive
            .deleteFile(docId)
            .pipe(takeUntil(this.unsubscribeAll$))
            .subscribe(
              (res) => {
                console.log(`File deleted  for doc id ${docId} : ${res}`);
                const idx = this.dataSource.findIndex((f) => f.docid === docId);
                this.dataSource.splice(idx, 1);
                this.attachments.splice(idx, 1);
                this.updateControl();
              },
              (err) => {
                console.error(`Error ${err.message}`);
              }
            );
        }
      }
    );
  }

  /**
   * The file which is going to save ...
   * @param file the file which need to save ...
   */
  saveDoc(file: File, indx?: number) {
    console.log(file);
    this.dmsServive
      .uploadFile(file)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe(
        (res) => {
          console.log(res);
          this.dataSource[indx].docid = res;

          // update the form control
          this.updateControl();
        },
        (err) => console.log(`Error : ${err.message}`));
  }

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
      case 'pptx':
      case 'ppt': {
        attachmentIcon = '/assets/images/ext/ppt.svg';
        break;
      }
      case 'txt': {
        attachmentIcon = '/assets/images/ext/txt.svg';
        break;
      }
      case 'csv':
      case 'xlxs':
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

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
  }
}
