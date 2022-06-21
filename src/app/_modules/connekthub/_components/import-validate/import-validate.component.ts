
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserImportLogs } from '@models/userdetails';
import { Package, PackageType } from '@modules/connekthub';
import { ConnectorService } from '@modules/list/_components/connector/services/connector.service';
import { CoreService } from '@services/core/core.service';
import { UserProfileService } from '@services/user/user-profile.service';
import { TransientService } from 'mdo-ui-library';
import { take } from 'rxjs/operators';
import { ImportSidesheetComponent } from '../import-sidesheet/import-sidesheet.component';

@Component({
  selector: 'pros-import-validate',
  templateUrl: './import-validate.component.html',
  styleUrls: ['./import-validate.component.scss']
})
export class ImportValidateComponent implements OnInit {

  uploadLoader = false;
  isDuplicate: boolean;
  successful: boolean;
  dataSource: any[];
  importData: any[] = [];
  errorMsg: string;
  warningMessage: string;
  record: Package;

  seletedFile: File;
  moduleId:any;
  importType: PackageType = PackageType.DATASET;

  displayedColumnsEror: string[] = ['message', 'category'];
  @Output()
  cancelClick: EventEmitter<{toRefreshApis: boolean, moduleId?: number}> = new EventEmitter<{toRefreshApis: boolean, moduleId?: number}>();

  showSkeleton = false;

  constructor(
    private matDialog: MatDialog,
    public dialogRef: MatDialogRef<ImportSidesheetComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private coreService: CoreService,
    private trasientSer: TransientService,
    private connectorService: ConnectorService,
    private userProfileService: UserProfileService,
  ) {
    if (data.file) {
      this.seletedFile = data.file;
      this.importReport();
      this.importType = data.importType || PackageType.DATASET;
      this.moduleId= data.moduleId;
      this.record = data.record;
    }
    this.errorMsg = null;
    this.uploadLoader = data.fromLocal;
    this.dataSource = [{
      description: this.seletedFile.name,
      importedAt: new Date()
    }];
    this.dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    switch (this.importType) {
      case PackageType.DATASET:
        this._validateDatasetPackage();
        break;

      default:
        break;
    }
  }

  /**
   * Close dialog
   */
  close() {
    this.dialogRef.close();
  }

  /**
   * Upload file
   */
  importReport() {

    switch (this.importType) {
      case PackageType.DATASET:

        break;

      default:
        console.log(`${this.importType} not implimented yet !!!`);
        break;
    }
  }

  _validateDatasetPackage() {
    this.showSkeleton = true;
    this.coreService.importDatasetValid(this.seletedFile).pipe(take(1)).subscribe(res=>{
      this.moduleId=res.moduleId;
      console.log(`Resposne : ${res}`);
      this.handleError(res, false);
      this.showSkeleton = false;
    }, err=> {
      console.log(`Error : ${err.message}`);
      this.showSkeleton = false;
    })
  }

  /**
   * Import the dataset / Package to system ...
   * @param replaceExt true if the user want's to replace the exiting ...
   * @param duplicate true if the user want's to create duplicate ...
   */
  import(replaceExt: boolean, duplicate: boolean) {
    this.coreService.importModule(this.seletedFile, duplicate, replaceExt).subscribe(res => {
      console.log(res);
      const hasError = res?.msgList?.find(f => f.responseStatus === 'ERROR');
      if (hasError) {
        // this.errorMsg = hasError.errorMessage || 'Something went wrong !';
        this.handleError(res, true);
      } else {
        this.close();
        this.saveUpdateImportLogs('SUCCESS');
        this.trasientSer.alert({
          data: {
            dialogTitle: 'Import successfully ',
            label: 'Display data import was successful'
          },
          disableClose: true,
          autoFocus: false,
          width: '400px',
          panelClass: 'create-master-panel'
          // backdropClass: 'no-backdrop',
        }, (response) => {
          this.cancelClick.emit({toRefreshApis: true, moduleId: +this.moduleId});
          this.connectorService.onCancelClick({toRefreshApis: true, moduleId: +this.moduleId});
        });
      }
    }, err => {
      console.log(`Error : ${err}`)
      this.errorMsg = err?.error?.message || 'Something went wrong !';
    });
  }

  getLogPayload(status) {
    const payload: UserImportLogs = {
      packageId: this.record ? this.record.packageId : null,
      versionId: this.record ? Number(this.record.version) : null,
      importedBy: '',
      importedAt: Number(new Date()),
      packageType: this.importType,
      status,
      uuid: (this.record && this.record.importLog) ? this.record.importLog.uuid : '',
    };
    return payload;
  }

  saveUpdateImportLogs(status: string) {
    this.userProfileService.saveUpdateImportLogs(this.getLogPayload(status)).subscribe((res) => {
      this.trasientSer.open('Log Saved!!', null, { duration: 2000, verticalPosition: 'bottom' });
    },
    (err) => {
      this.trasientSer.open('Some error ocuccred in saving log!!', null, { duration: 2000, verticalPosition: 'bottom' });
      }
    )
  }


  handleError(res: any, avoidImport?: boolean) {
    // logic
    const isModuleAlreadyExits = res?.msgList?.find(f => f.errorCode === 'MODULE_EXIST');
    if (isModuleAlreadyExits) {
      this.isDuplicate = isModuleAlreadyExits ? true : false;
      this.warningMessage = `An existing dataset shares the name ${this.seletedFile.name} . Duplicate or Replace`;
    }
    // prepare the logs
    this.importData = [];
    res?.msgList?.forEach(f => {
      if (f.responseStatus !== 'SUCCESS') {
        this.importData.push({ message: f.errorMessage, category: f.errorCode, responseStatus: f.responseStatus });
      }
    });

    // if having parsing error
    const hasParsingError = this.importData.find(f => f.category === 'PARSING_ERROR');
    if (hasParsingError) {
      this.errorMsg = hasParsingError.message || 'File parsing error';
      return;
    }


    // check if there are no error then import the file ..
    if (!avoidImport && this.importData.filter(f => f.responseStatus === 'SUCCESS').length === this.importData.length) {
      this.import(false, false);
    }

  }
}
