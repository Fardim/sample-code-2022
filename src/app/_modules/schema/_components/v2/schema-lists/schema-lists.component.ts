import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SchemaListDetails, SchemaListModuleList } from '@models/schema/schemalist';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { SchemaService } from '@services/home/schema.service';
import { TransientService } from 'mdo-ui-library';
import { Subscription } from 'rxjs';
import { SecondaynavType } from '@models/menu-navigation';
import { GlobaldialogService } from '@services/globaldialog.service';
import { UploadDatasetComponent } from '../../upload-dataset/upload-dataset.component';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'pros-schema-lists',
  templateUrl: './schema-lists.component.html',
  styleUrls: ['./schema-lists.component.scss']
})
export class SchemaListsComponent implements OnInit, OnDestroy {

  /**
   * To have the module id of selected module
   */
  public moduleId: string;

  /**
   * To have the module data according to the selected module.
   */
  public moduleData: SchemaListModuleList;

  /**
   * All the http or normal subscription will store in this array
   */
  subscriptions: Subscription[] = [];

  /**
   * outlet name in which sheets to be opened
   */
  outlet = 'sb';

  /**
   * Loading flag
   */
  private initialSubscriptionList: Array<Subscription> = [];
  get loading() {
    return Boolean(this.initialSubscriptionList?.find(x => !x.closed));
  }

  datasetCountMsg = 'There are 0 records in this dataset';
  displayedColumns: string[] = ['schema', 'name', 'icon'];
  /**
   * constructor of class
   * @param activatedRoute Instance the ActivatedRoute class
   * @param schemaService Instance of schema service class
   */
  constructor(private activatedRoute: ActivatedRoute,
    private schemaService: SchemaService,
    private sharedService: SharedServiceService,
    private router: Router,
    private globalDialogService: GlobaldialogService,
    private toasterService: TransientService,
    public matDialog: MatDialog
  ) { }

  /**
   * Unsubscribe from Observables, services and DOM events
   */
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  /**
   * load pre loaded function
   */
  ngOnInit(): void {
    this.getRouteParams();
    this.subscriptions.push(this.sharedService.refresSchemaListTrigger.subscribe(res=>{
      if(res) {
        this.getModuleInfo();
      }
    }));
  }

  /**
   * get moduleId from the active router parameters
   */
  private getRouteParams() {
    const activatesub = this.activatedRoute.params.subscribe((params) => {
      this.moduleId = params.moduleId;
      if (this.moduleId) {
        this.moduleData = {
          moduleDesc: '',
          moduleId: '',
          schemaLists: []
        };
        this.getModuleInfo();
      }
    });
    this.subscriptions.push(activatesub);
  }

  /**
   * get schema list according to module ID
   */
  public getSchemaList() {
    const schmeaInfoByModuleId = this.schemaService.getSchemaInfoByModuleId(this.moduleId).subscribe((moduleData) => {
      this.moduleData.schemaLists = moduleData.schemaLists;
    }, error => {
      console.error('Error: {}', error.message);
    });

    this.subscriptions.push(schmeaInfoByModuleId);
    this.initialSubscriptionList.push(schmeaInfoByModuleId);
  }
  deleteSchema(schemaId: string) {
    this.globalDialogService.confirm({ label: 'Are you sure you want to delete this ?' }, (response) => {
      if (response === 'yes') {
        this.schemaService.deleteSChema(schemaId)
          .subscribe(resp => {
            this.router.navigate(['home', 'schema', this.moduleId]);
            this.sharedService.setRefreshSecondaryNav(SecondaynavType.schema, true, this.moduleId);
            this.getSchemaList();
            this.toasterService.open('Schema deleted successfully.', 'ok', { duration: 2000 });
          }, error => {
            this.toasterService.open('Something went wrong', 'ok', { duration: 2000 });
          });
      }
    });
  }

  public getModuleInfo() {
    const moduleInfoByModuleId = this.schemaService.getModuleInfoByModuleId(this.moduleId).subscribe((moduleData) => {
      const module = moduleData[0];
      if (module) {
        this.moduleData.moduleDesc = module.moduleDesc;
        this.moduleData.moduleId = module.moduleId;
        this.datasetCountMsg = `There are ${module.datasetCount || 0} records in this dataset`;
      }
      this.getSchemaList();
    }, error => {
      console.error('Error: {}', error.message);
    });
    this.subscriptions.push(moduleInfoByModuleId);
  }
  /**
   * Function to open sidesheet to Upload data
   */
  public openUploadSideSheet() {
    this.router.navigate([{ outlets: { sb: `sb/schema/upload-data/${this.moduleId}/${this.outlet}` } }]);
  }

  /**
   * open the schem-info of selected schema
   * @param schemaId selcted schemaId
   */
  public openSchemaInfo(schemaId: string) {
    this.router.navigate([`/home/schema/schema-info/${this.moduleId}/${schemaId}`]);
  }
  /**
   * Function to open schedule side-sheet
   * @param schemaId: schema Id
   */
  openScheduleSideSheet(schemaId?: string) {
    const scheduleSubscription = this.schemaService.getSchedule(schemaId).subscribe((scheduleInfo) => {
      if (scheduleInfo?.schedulerId) {
        this.router.navigate([{ outlets: { sb: `sb/schema/schedule/${schemaId}/${scheduleInfo.schedulerId}` } }])
      }
      else {
        this.router.navigate([{ outlets: { sb: `sb/schema/schedule/${schemaId}/new` } }])
      }
    }, (error) => {
      console.log('Something went wrong when getting schedule information.', error.message);
    })
    this.subscriptions.push(scheduleSubscription);
  }

  openExecutionTrendSidesheet(schema: SchemaListDetails) {
    this.router.navigate(['', { outlets: { sb: `sb/schema/execution-trend/${schema.moduleId}/${schema.schemaId}/${schema.variantId}` } }], {queryParamsHandling: 'preserve'});
  }
   /**
    * open Upload data dialog
    */
    openUploadScreen() {
      this.matDialog.open(UploadDatasetComponent, {
        height: '800px',
        width: '800px',
        data: { selecteddata: {} },
        disableClose: true,
      });
    }
}
