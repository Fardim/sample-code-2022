import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ConnekthubService } from '@modules/connekthub/_services/connekthub.service';
import { ImportComponent } from '@modules/report/view/import/import.component';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { SchemaImportService } from '@services/home/schema/schema-import.service';
import { SapwsService } from '@services/sapws/sapws.service';
import { UserProfileService } from '@services/user/user-profile.service';
import { TransientService } from 'mdo-ui-library';
import { forkJoin, throwError } from 'rxjs';
import { catchError, finalize, take } from 'rxjs/operators';
import { Package, PackageOptions, PackageType } from '../../_models/connekthub';
import { ImportValidateComponent } from '../import-validate/import-validate.component';

@Component({
  selector: 'pros-import-sidesheet',
  templateUrl: './import-sidesheet.component.html',
  styleUrls: ['./import-sidesheet.component.scss'],
})
export class ImportSidesheetComponent implements OnInit, OnDestroy {
  readonly PackageType = PackageType;

  importType: PackageType;
  packages: Package[] = [];
  loginForm = false;
  loading = true;
  /** Option id that will be pass in from parent component */
  id: string;

  allUserImportLogs: any[] = [];

  constructor(
    private activatedRouter: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private connekthubService: ConnekthubService,
    private sharedService: SharedServiceService,
    private transService: TransientService,
    private sapwsService: SapwsService,
    private schemaImportService: SchemaImportService,
    private userProfileService: UserProfileService,
    private dialogRef:MatDialogRef<ImportSidesheetComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any
  ) {
    this.activatedRouter.queryParams.subscribe((queryParams: any) => {
      this.importType = queryParams?.importType || dialogData?.importType || null;
      this.id = queryParams?.id || null;
      this.getPackagesAndUserImportLogs();
    })
  }

  /**
   * ANGULAR HOOK
   */
  ngOnInit(): void {
  }

  getPackagesAndUserImportLogs() {
    forkJoin([
      this.connekthubService.getPackages(this.importType),
      this.userProfileService.getSaveUpdateImportLogs({
        pageSize: 100,
        pageNumer: 0
      })
    ]).pipe(take(1), finalize(() => this.loading = false), this.catchError()).subscribe((resp) => {
      this.packages = resp[0] as any[];
      if(resp[1] && resp[1].content && Array.isArray(resp[1].content))
        this.allUserImportLogs = resp[1].content;
      if(Array.isArray(this.packages)) {
        this.packages = this.packages.map((item) => {
          const importLog = this.allUserImportLogs.find((log) => log.packageId === item.packageId);
          if(!importLog) {
            return {
              ...item,
              availableOption: PackageOptions.GET,
              importLog: null,
            }
          }else {
            return {
              ...item,
              availableOption: Number(importLog.versionId) !== Number(item.version) ? PackageOptions.UPDATE : PackageOptions.INSTALLED,
              importLog
           }
          }
        });
      }
    });
  }

  catchError() {
    return catchError(err => {
      this.loading = false;
      if (err?.status === 401) {
        this.loginForm = true;
      }
      return throwError(err);
    })
  }

  /**
   * Function to close connektHub sidesheet on click
   */
  close() {
    if(this.dialogRef && Object.keys(this.dialogRef)?.length) {
      this.dialogRef?.close();
    }
    let urlTree = this.router.parseUrl(this.router.url);

    // Deleting the query params specific to this sidesheet after it is closed
    delete urlTree?.queryParams?.importType;
    delete urlTree?.queryParams?.id;
    delete urlTree?.root?.children.outer;
    this.router.navigateByUrl(urlTree);
  }

  /**
   * ANGULAR HOOK
   * To destroy all the subscriptions
   */
  ngOnDestroy(): void { }

  getPackage(record: Package) {
    this.connekthubService.getPackageFile(record.id).subscribe(res => {
     const moduleId= (JSON.parse(res)).content.moduleId;
      this.importPackage(this.blobToFile(res, record.name),moduleId, record);
    }, err=>{
      this.transService.open('Something went wrong ', 'close',{duration:3000});
    });
  }

  blobToFile(response: string, name: string){
    const binaryData = [];
    binaryData.push(response);
    if(this.importType === PackageType.DASHBOARD) {
      return new File([new Blob(binaryData, {type: '.mdopage'})], name +'.mdopage')
    } else if(this.importType === PackageType.DATASET) {
      return new File([new Blob(binaryData, {type: '.mdoDataset'})], name +'.mdoDataset')
    } else if (this.importType === PackageType.SCHEMA) {
      return new File([new Blob(binaryData, {type: '.mdoSchemas'})], name +'.mdoSchemas')
    } else {
      return new File([new Blob(binaryData, {type: '.json'})], name +'.json')
    }
  }

  importPackage(file: File,moduleId:any, record: Package) {
    switch (this.importType) {
      case PackageType.DASHBOARD:
        this.close();
        const dialogRef = this.dialog.open(ImportComponent, {
          data: {
            file
          },
          width: '600px',
          minHeight: '250px',
          disableClose: false,
        });

        // Reload once import is successfull
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.sharedService.setReportListData(true);
          }
        });
        break;
      case PackageType.SCHEMA:
        this.schemaImportService.parseSchemaFile(file);
        break;
      case PackageType.SAP_TRANSPORTS:
        this.sapwsService.importInterfaceCKH(file, this.id).subscribe(res => {
          this.close();
        });
        break;

      case PackageType.DATASET:
        this.close();
        const dialogRef1 = this.dialog.open(ImportValidateComponent, {
          data: { file, importType: this.importType, moduleId, record },
          width: '600px',
          minHeight: '250px',
          disableClose: false,
        });
        // Reload once import is successfull
        dialogRef1.afterClosed().subscribe(result => {
          console.log(`After message done !! ${result}`);
        });
        break;

      default:
        break;
    }
  }

  /**
   * Close the dialog
   */
  _closeTheDialog() {
    // this.dialogRef.close({});
  }


}
