import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportService } from '../../_service/report.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { GlobaldialogService } from '@services/globaldialog.service';
import { Subscription } from 'rxjs';
import { UserService } from '@services/user/userservice.service';
import { distinctUntilChanged } from 'rxjs/operators';
import { DuplicateReportComponent } from '../duplicate-report/duplicate-report.component';
import { MatDialog } from '@angular/material/dialog';
import { ExportComponent } from '../export/export.component';
@Component({
  selector: 'pros-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  reportId: number;
  emitClearBtnEvent: boolean;
  showClearFilterBtn = false;
  reportName: string;
  collaboratorEditPermission: false ;
  collaboratorDeletePermission: false ;
  collaboratorAdminPermission: false ;
  reportExist = true;
  isClearBtnClicked = false;
  isClearButtonClicked: boolean;

  /**
   * Hold the error status code ...
   */
  errStatusCode: number;

  /**
   * If is from msteam then don't need edit and delete ..
   */
  isFromMsteam = false;

  subscriptions: Subscription[] = [];

  private readonly dialofConfig = {
    disableClose: true,
    width: '600px',
    minHeight: '250px'
  };

  constructor(
    private activatedRouter: ActivatedRoute,
    public reportService: ReportService,
    private snackbar: MatSnackBar,
    private sharedService: SharedServiceService,
    private router: Router,
    private globalDialogService: GlobaldialogService,
    private userService: UserService,
    private matDialog: MatDialog
  ) { }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub=>{
      sub.unsubscribe();
    });
  }

  ngOnInit(): void {
    this.activatedRouter.params.subscribe(params=>{
      this.reportId = params.id;
      if(params.id === 'new') {
        this.reportExist = false;
      } else if(this.reportId) {
        this.emitClearBtnEvent = false ;
        this.showClearFilterBtn = false ;
        this.reportExist = true;
        this.getReportInfo(this.reportId);
      }
    });

    this.activatedRouter.queryParams.subscribe(p=>{
      this.errStatusCode = p.e ? p.e : '';
    });

    const isFrmMsteam = this.sharedService.getIsFromMsTeamLogedIn().subscribe(res=>{
      this.isFromMsteam = res;
    });
    this.subscriptions.push(isFrmMsteam);
  }

  getReportInfo(reportId: number) {
    const usub = this.userService.getUserDetails().pipe(distinctUntilChanged()).subscribe(user=>{
      const repInfo = this.reportService.getReportInfo(reportId, user.plantCode).subscribe(res=>{
        this.reportName = res.reportName;
        this.collaboratorEditPermission = res.permissons ? res.permissons.isEditable : false;
        this.collaboratorDeletePermission = res.permissons ? res.permissons.isDeleteable : false;
        this.collaboratorAdminPermission = res.permissons ? res.permissons.isAdmin : false;

      },error=>{
        console.log(`Error ${error}`);
      });
      this.subscriptions.push(repInfo);
    });
    this.subscriptions.push(usub);
  }

  clearFilters() {
    this.isClearButtonClicked = true;
    this.emitClearBtnEvent = true;
    this.isClearBtnClicked = true;
    this.isClearButtonClicked = true;
  }

  showClearBtnEmit(isTrue: boolean) {
    this.isClearButtonClicked = isTrue ? false : true;
    this.showClearFilterBtn = isTrue;
    this.emitClearBtnEvent = isTrue ? false : true;
  }

  delete() {
    this.globalDialogService.confirm({label:'Are you sure you want to delete this ?'}, (response) =>{
      if(response && response === 'yes') {
        this.reportService.deleteReport((this.reportId.toString())).subscribe(res=>{
          if(res) {
            this.sharedService.setReportListData();
            this.snackbar.open(`Successfully Deleted`, 'Close',{duration:3000});
          }
        },err=>console.error(`Error: ${err}`))
      }
    });
  }

  editReport() {
    this.sharedService.setTogglePrimaryEmit();
    this.router.navigate(['/home', 'report', 'dashboard-builder', this.reportId.toString()]);
  }

  duplicateReport() {
    this.matDialog.open(DuplicateReportComponent, {
      data: {
        reportName: this.reportName,
        reportId: this.reportId
      },
      ...this.dialofConfig
    });
  }

  exportReport() {
    this.matDialog.open(ExportComponent, {
      data: {
        reportName: this.reportName,
        reportId: this.reportId
      },
      ...this.dialofConfig,
      minHeight: '150px'
    });
  }

  /*
    Open Sidesheet for Send email
  */
  openSendEmailSideSheet(){
     this.router.navigate(['',{ outlets: { sb: `sb/report/send-email/`+ this.reportId }}]);
  }

  /**
   * method to navigate on import log page
   */
  importLog() {
    this.router.navigate([{ outlets: { sb: 'sb/report/import-log/' + this.reportId } }])
  }

}