import { KEYS } from '../../../../_constants/download-template-data';
import { WidgetService } from '@services/widgets/widget.service';
import { Component, Inject, Input, LOCALE_ID, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { RuleService } from '@services/rule/rule.service';
import { ClassType, CPIConnection, Language } from '@modules/classifications/_models/classifications';
import { ValidationError } from '@models/schema/schema';
import { Router } from '@angular/router';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { takeWhile } from 'rxjs/operators';
import { TransientService } from 'mdo-ui-library';
import { CoreService } from '@services/core/core.service';
import { Observable, of } from 'rxjs';
import { ConnectionService } from '@services/connection/connection.service';
import { SapwsService } from '@services/sapws/sapws.service';
import { ClassificationLayoutService } from '@modules/classifications/_services/classification-layout.service';
import { UserService } from '@services/user/userservice.service';

@Component({
  selector: 'pros-class-type-detail',
  templateUrl: './class-type-detail.component.html',
  styleUrls: ['./class-type-detail.component.scss']
})
export class ClassTypeDetailComponent implements OnInit, OnChanges, OnDestroy {
  @Input() classTypeId: string;

  _locale: string
  showSkeleton = true;
  classType: ClassType;
  subscriptionEnabled = true;
  relatedDatasets = [];
  cpiConnection: CPIConnection;

  submitError: ValidationError = {
    status: false,
    message: ''
  };
  bannerMessage: string;
  isSyncSuccessful = {
    msg: '',
    msgType: ''
  };
  filteredLangList: Observable<string[]>;

  constructor(
    private ruleService: RuleService,
    private sharedService: SharedServiceService,
    private coreService: CoreService,
    private router: Router,
    private transientService: TransientService,
    @Inject(LOCALE_ID) private locale: string,
    private connectionService: ConnectionService,
    public widgetService: WidgetService,
    public sapwsService: SapwsService,
    private classificationLayoutService:ClassificationLayoutService,
    private userService: UserService

  ) {
    this._locale = this.locale.split('-')[0] || 'en';
  }

  ngOnInit(){
    this.sharedService.ofType<ClassType>('CLASS_TYPE/UPDATED').pipe(takeWhile(() => this.subscriptionEnabled))
      .subscribe((data) => {
        console.log('CLASS_TYPE/UPDATED', data);
        this.getClassTypeDetails(this.classTypeId);
      });

    this.sharedService.ofType<ClassType>('CLASS/CREATED').pipe(takeWhile(() => this.subscriptionEnabled))
      .subscribe((data) => {
        console.log('CLASS/CREATED', data);
        this.getClassTypeDetails(this.classTypeId);
      });

    this.sharedService.ofType<ClassType>('ALL_CLASSES/DELETED').pipe(takeWhile(() => this.subscriptionEnabled))
      .subscribe((data) => {
        console.log('ALL_CLASSES/DELETED', data);
        this.getClassTypeDetails(this.classTypeId);
      });
      //this.classificationLayoutService.skeletonLoader.next(this.showSkeleton);
    this.getLanguagesList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes &&  changes.classTypeId?.currentValue && changes.classTypeId.previousValue !== changes.classTypeId.currentValue) {
      this.getClassTypeDetails(this.classTypeId);
    }
  }

  /**
   * Fetch class type detials
   * @param classTypeID class type ID
   */
  getClassTypeDetails(classTypeID: string) {
    this.showSkeleton = true;
    this.cpiConnection = null;

    this.ruleService.getClassTypeDetails(classTypeID).pipe(takeWhile(() => this.subscriptionEnabled)).subscribe((res: any) => {
      this.classType = res;
      this.showSkeleton = false;
      this.classificationLayoutService.skeletonLoader.next(this.showSkeleton);
      this.submitError.status = false;
      const moduleIds = res?.relatedDatasets?.filter(x => x);
      this.relatedDatasets = [];

      if (this.classType?.system) {
        this.loadCPIConnection();
      }

      if (moduleIds?.length) {
        this.getAllModules(moduleIds).subscribe((data) => {
          this.relatedDatasets = data;
        });
      }
    }, (error) => {
      this.showSkeleton = false;
      this.classificationLayoutService.skeletonLoader.next(this.showSkeleton);
      this.submitError.status = true;
      // if (error.error && error.error.acknowledge === false) {
      //   this.submitError.message = error.error.errorMsg || 'Something went wrong';
      // } else {
      //   this.submitError.message = error?.message || 'Something went wrong';
      // }
    });
  }

  getAllModules(moduleIds: string[]): Observable<any[]> {
    return new Observable(observer => {
      this.coreService.searchAllObjectType({ lang: this._locale, fetchsize: 50, fetchcount: 0, description: '' }, moduleIds).pipe(takeWhile(() => this.subscriptionEnabled))
        .subscribe((data) => observer.next(data), (err) => observer.error(err), () => observer.complete());
    });
  }

  loadCPIConnection() {
    this.connectionService.getConnectionDetails(this.classType?.system).pipe(takeWhile(() => this.subscriptionEnabled)).subscribe((data) => {
      this.cpiConnection = data?.response as any;
    });
  }

  openScheduleSyncDialog() {
    const moduleId = this.classType?.relatedDatasets[0];
    this.router.navigate(['', {
      outlets: {
        sb: `sb/settings/classifications`,
        outer: `outer/classifications/class-type/${moduleId}/${this.classTypeId}/outer/schedule-sync`,
      }
    }],
      {
        queryParamsHandling: 'merge',
      }
    );
  }

  openDialog(type=null){
    this.router.navigate([{
      outlets: {
        sb: `sb/settings/classifications`,
        outer: `outer/classifications/class-types/${this.classTypeId}${type === 'DEPENDENCY' ? '/dependencies' : ''}`
      },
    }]);
  }

  openTranslateDialog(type=null){
    this.router.navigate([{
      outlets: {
        sb: `sb/settings/classifications`,
        outer: `outer/classifications/class-types/translate`
      },
    }]);
  }

  ngOnDestroy(): void {
    this.subscriptionEnabled = false;
  }

  deleteDialog(actionFor: string): void {
    const dialogMsg = 'The action can not be undone. Please select `Confirm` to delete.';

    this.transientService.confirm({
      data: { dialogTitle: 'Confirmation', label: dialogMsg },
      disableClose: true,
      autoFocus: false,
      width: '600px',
      panelClass: 'create-master-panel',
      // backdropClass: 'cdk-overlay-transparent-backdrop',
    },
      (response) => {
        if (response === 'yes') {
          this.confirmHandler(actionFor);
        }
      });
  }

  confirmHandler(actionFor: string) {
    switch (actionFor) {
      case 'classtype':
        this.deleteClassType(false);
        break;
      case 'classes':
        this.deleteAllClasses(false);
        break;
    }
  }

  deleteClassType(impact: boolean) {
    this.ruleService.deleteClasstype(this.classTypeId, impact).subscribe((res: any) => {
      if (!impact) {
        if (res.impact.indexOf('[]') > -1) {
          this.deleteClassType(true)
        } else {
          this.alertDialog('classtype', res.impact);
        }
      } else {
        if (res.success) {
          this.transientService.open((res.message || 'Class type and related classes with their assigned characteristics are deleted successfully.'), null, { duration: 2000, verticalPosition: 'bottom' });
          this.sharedService.publish({ type: 'CLASSTYPE/DELETED', payload: {} });
        } else {
          this.bannerMessage = res.message || 'Something went wrong!';
        }
      }
    }, err => {
      this.bannerMessage = err.error?.errorMsg || 'Something went wrong!';
    });
  }

  deleteAllClasses(impact: boolean) {
    this.ruleService.getDeleteAllClassesByClassType(this.classTypeId, impact).subscribe((res: any) => {
      if (!impact) {
        if (res.impact.indexOf('[]') > -1) {
          this.deleteAllClasses(true)
        } else {
          this.alertDialog('classes', res.impact);
        }
      } else {
        if (res.success) {
          this.transientService.open((res.message || `All classes for Class type "${ this.classType?.className }" with their assigned characteristics are deleted successfully.`), null, { duration: 2000, verticalPosition: 'bottom' });
          this.sharedService.publish({ type: 'ALL_CLASSES/DELETED', payload: {} });
        } else {
          this.bannerMessage = res.message || 'Something went wrong!';
        }
      }
    }, error => {
      this.bannerMessage = error.message || 'Something went wrong!';
    });
  }

  async alertDialog(actionFor: string, datasets) {
    const dialogMsg = await this.getDialogMsg(actionFor, datasets);
    this.transientService.alert({
      data: { dialogTitle: 'Alert', label: dialogMsg },
      disableClose: true,
      autoFocus: false,
      width: '600px',
      panelClass: 'create-master-panel',
      backdropClass: 'cdk-overlay-transparent-backdrop',
    }, (response) => { });
  }

  async getDialogMsg(actionFor: string, datasets: number[]): Promise<string> {
    let dialogMsg;
    const className = this.classType.className;

    const datasetNames = await this.getAllModules(datasets.map((module) => `${module}`.replace('[', '').replace(']', ''))).toPromise().catch(() => []);

    const datasetStr = datasetNames.map((dataset) => dataset?.moduleDesc).join('\n');

    switch (actionFor) {
      case 'classtype':
        dialogMsg = `One or more records for below datasets are referencing the Classes associated with Class type "${className}".\n [${datasetStr}] \n Action cannot be completed.`
        break;
      case 'classes':
        dialogMsg = `All the classes maintained for the Class type "${className}" will get deleted. One or more records for below datasets are referencing the Classes associated with Class type "${className}". \n ${datasetStr} \n The action can not be done. Please select â€˜Deleteâ€™ to confirm.`;
        break;
    }
    return dialogMsg
  }

  uploadCSV() {
    if (document.getElementById('uploadFileCtrl')) {
      document.getElementById('uploadFileCtrl').click();
    }
    return true;
  }

  fileChange(evt: Event) {
    const validResponse = this.checkForValidFile(evt);
    if (validResponse.file) {
      const classTypeId = this.classTypeId;
      const classType = this.classType.classType;
      this.ruleService.uploadCSV(classTypeId,classType,validResponse.file).subscribe((res)=>{
        this.isSyncSuccessful.msgType='success';
        this.isSyncSuccessful.msg="Your file is getting ready to be downloaded.";
      })
    } else {
      this.isSyncSuccessful.msgType='error';
      this.isSyncSuccessful.msg="File upload process failed.Please check log for details!";
    }
  }

  checkForValidFile(evt: Event) {
    const res = {
      errMsg: '',
      file: null
    };
    if (evt !== undefined) {
      const target: DataTransfer = (evt.target) as unknown as DataTransfer;
      if (target.files.length !== 1) {
        res.errMsg = 'Cannot use multiple files';
      }
      // check file type
      let fileName = '';
      try {
        fileName = target.files[0].name;
      } catch (ex) {
        console.error(ex)
      }
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
        // check size of file
        const size = target.files[0].size;

        const sizeKb = Math.round((size / 1024));
        if (sizeKb > (10 * 1024)) {
          res.errMsg = `File size too large , upload less then 10 MB`;
        }
        res.file = target.files[0];
      } else {
        res.errMsg = `Unsupported file format, allowed file formats are .xlsx, .xls and .csv`;
      }
    }
    return res;
  }

  downloadCSV(){
    const excelData = [];
    const obj = {};
    KEYS.forEach(element => {
      obj[element] = '';
    });
    excelData.push(obj);
    this.widgetService.downloadCSV('Data', excelData);
  }

  getLanguagesList() {
    this.userService.getAllLanguagesList().subscribe(
      (data) => {
        if (data) {
          console.log("langss")
          console.log(data);
          this.filteredLangList = of(data);
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  downloadTaxonomy(lang: string){
    this.ruleService.downloadTaxonomy(this.classTypeId,this.classType.className, lang).subscribe((res)=>{
      this.isSyncSuccessful.msgType = 'success';
      this.isSyncSuccessful.msg = "Your file is getting ready to be downloaded.";
    })
  }

  closeDownlodDialog(){

  }

  onSync(){
    const payload = {
      classType:this.classType.classType,
      classTypeId : this.classTypeId,
      connectionId:this.classType.system
    }
    this.sapwsService.createClassificationJob(payload).subscribe((res)=>{
      this.isSyncSuccessful.msgType='success';
      this.isSyncSuccessful.msg="Data syncing is in progress.Please check after some time!";
    },
    (error)=>{
      this.isSyncSuccessful.msgType='error';
      this.isSyncSuccessful.msg="Data syncing could not be complete.Please try again!";
    });
  }

  /**
   * Function to open notification tray
   */
  openSystemTray(type: string) {
    this.router.navigate([{ outlets: { sb: ['sb', 'system-tray', type] } }], {
      queryParamsHandling: 'preserve'
    });
  }
}