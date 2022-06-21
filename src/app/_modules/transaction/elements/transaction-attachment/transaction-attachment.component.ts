import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { DataControlService } from '@modules/transaction/_service/data-control.service';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import { DmsService } from '@services/dms/dms.service';
import { TransientService } from 'mdo-ui-library';
import { forkJoin, Observable, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { TransactionControlComponent } from '../transaction-control/transaction-control.component';

export class FileSource {
  name : string;
  extension: string;
  docid: string;
}

@Component({
  selector: 'pros-transaction-attachment',
  templateUrl: './transaction-attachment.component.html',
  styleUrls: ['./transaction-attachment.component.scss']
})
export class TransactionAttachmentComponent extends TransactionControlComponent implements OnInit, OnDestroy {

  /**
   * The type of control , can be single or multi
   */
  @Input() multiSelect = true

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

  isFileLoadingInProgress = false;

  filedIdToBlobMapping: {[fileId: string]: any} = {};

  constructor(
    public transService: TransactionService,
    private dmsServive: DmsService,
    private trasiantService: TransientService,
    public dataControlService: DataControlService,
  ) {
    super(transService, dataControlService);
  }


  ngOnInit(): void {
    super.ngOnInit();
    this.getFiles();
  }

  fileChange(fileList) {
    if (!fileList) {
      this.errorMsg = 'Unable to complete upload: (Select a file)';
    } else {
      this.errorMsg = null;
      const supportedFileTypes = this.fieldObj.fieldCtrl.fileTypes?.split(',') || [];
      for (const file of fileList) {
        if(!supportedFileTypes.some(type => file.name.endsWith(`.${type}`))) {
            this.errorMsg = 'File type is not supported';
        } else {
          this.dataSource.push({name: file.name, extension: file.name.split('.').pop(), docid: ''});
          this.attachments.push(file);
          this.saveDoc(file, this.dataSource.length-1);
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
    if(!this.isFieldReadOnly) {
      evt.preventDefault();
      evt.stopPropagation();
      this.fileChange(evt.dataTransfer.files);
    }
  }

  /**
   * Update the control ....
   */
  updateControl() {
    this.control.setValue(this.attachments);
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
        width: '600px',
        panelClass: 'create-master-panel',
      },
      (response) => {
        if('yes' === response) {
            this.dmsServive.deleteFile(docId).pipe(takeUntil(this.unsubscribeAll$)).subscribe(res=>{
              console.log(`File deleted  for doc id ${docId} : ${res}`)
              const idx = this.dataSource.findIndex(f=> f.docid === docId);
              this.dataSource.splice(idx,1)
              this.attachments.splice(idx,1)
              this.control.setValue(this.dataSource.map(m=> m.docid));
            }, err=> {
              console.error(`Error ${err.message}`);
            });
        }
      }
    );


  }

  getFiles() {
    if(this.control.value) {
      const reqObs: {[fileId: string]: Observable<any>} = this.getFilesObs();
      if(Object.keys(reqObs).length > 0) {
        this.isFileLoadingInProgress = true;
        forkJoin(reqObs).pipe(finalize(() => this.isFileLoadingInProgress = false))
        .subscribe((res: any) => {
          const fileList = Object.keys(res);
          if(fileList && fileList.length) {
            fileList.forEach((file, i) => {
              this.filedIdToBlobMapping[file] = res[file];
              this.dataSource.push({name: res[this.control.value[i].code][0].fileName || 'Unknown', extension: res[this.control.value[i].code][0] ? res[this.control.value[i].code][0].fileName.split('.').pop() : '', docid: this.control.value[i].code});
            });
          }
        });
      }
    }
  }

  getFilesObs(): {[fileId: string]: Observable<any>} {
    const reqObs: {[fileId: string]: Observable<any>} = {};
    this.control.value.forEach((res) => {
      if(res.code)
        reqObs[res.code] = this.dmsServive.downloadFiles([res.code]);
    });
    return reqObs;
  }

  /**
   * The file which is going to save ...
   * @param file the file which need to save ...
   */
  saveDoc(file: File, indx?: number) {
    console.log(file);
    this.dmsServive.uploadFile(file).pipe(takeUntil(this.unsubscribeAll$)).subscribe(res=>{
      console.log(res);
      this.dataSource[indx].docid = res;

      // update the form control
      this.control.setValue(this.dataSource.map(m=> m.docid));
    }, err=> console.log(`Error : ${err.message}`));
  }

  downloadFile(sno: string, fileName: string) {
    if(!sno) {
      return;
    }
    this.dmsServive.downloadFile(sno).subscribe(resp => {
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


  getAttachmentIcon(attachmentName) {
    let attachmentIcon = '';
    const splitted = attachmentName.split('.');
    const attachmentExt = splitted[splitted.length - 1];

    switch (attachmentExt) {
      case 'docx':
      case 'doc': {
        attachmentIcon = 'assets/images/ext/doc.svg';
        break;
      }
      case 'jpg':
      case 'png':
      case 'jpeg': {
        attachmentIcon = 'assets/images/ext/img.svg';
        break;
      }
      case 'pdf': {
        attachmentIcon = 'assets/images/ext/pdf.svg';
        break;
      }
      case 'pptx':
      case 'ppt': {
        attachmentIcon = 'assets/images/ext/ppt.svg';
        break;
      }
      case 'txt': {
        attachmentIcon = 'assets/images/ext/txt.svg';
        break;
      }
      case 'csv':
      case 'xlxs':
      case 'xls': {
        attachmentIcon = 'assets/images/ext/xls.svg';
        break;
      }
      case 'zip': {
        attachmentIcon = 'assets/images/ext/zip.svg';
        break;
      }
      default: {
        attachmentIcon = 'assets/images/ext/none.svg';
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
