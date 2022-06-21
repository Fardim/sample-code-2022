import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { PermissionOn, WidgetDownloadBody ,WidgetDownloadUser } from '@models/collaborator';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { PermissionGroup } from '@modules/report/permissions/report-collaborator/report-collaborator.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportService } from '@modules/report/_service/report.service';
import { UserService } from '@services/user/userservice.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GlobaldialogService } from '@services/globaldialog.service';
import { debounceTime } from 'rxjs/operators';
import { Userdetails } from '@models/userdetails';

@Component({
  selector: 'pros-export-report-datatable',
  templateUrl: './export-report-datatable.component.html',
  styleUrls: ['./export-report-datatable.component.scss']
})
export class ExportReportDatatableComponent implements OnInit {
  /**
   * to store widgetId from url
   */
  widgetId: string;
  /**
   * Selected users before saved
   */
  selectedUsers: WidgetDownloadUser[] = [];

  /**
   * To lose focus from input after selecting an option from MatAutocomplete
   */
  @ViewChild('loosefoucs') loosefocus: ElementRef;
  /**
   * Hold all collaborators with groups
   */
  collaborators: PermissionGroup[];
  pages: string[] = [];
  addwidgetSubsFrmGrp: FormGroup;
  selectedEmail = '';
  pageCtrl: FormControl = new FormControl('');
  userInfo: WidgetDownloadUser;
  userDetails: Userdetails;
  filterCriterias: string;

  constructor(private activatedRoute: ActivatedRoute,
    private reportServie: ReportService,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private snackbar: MatSnackBar,
    private globalDialogService: GlobaldialogService
  ) { }

  ngOnInit(): void {

    this.getUserDetails();

    this.activatedRoute.queryParams.subscribe((params) => {
      this.filterCriterias = params.conditionList;
      console.log(this.filterCriterias);
    })

    this.activatedRoute.params.subscribe(params => {
      this.widgetId = params.widgetId;
    });

    this.addwidgetSubsFrmGrp = this.formBuilder.group({
      addUsersFilter: [''],
    })

    this.userService.getUserDetails().subscribe(
      (response: Userdetails) => {
        this.userDetails = response;
      }
    );
    /**
     * After value change should call http for load more collaborators
     */
    this.addwidgetSubsFrmGrp.get('addUsersFilter').valueChanges.pipe(debounceTime(1000)).subscribe(val => {
      if (val && typeof val === 'string') {
        this.getCollaboratorPermission(val, 0);
      } else if (typeof val === 'string' && val.trim() === '') {
        this.getCollaboratorPermission('', 0);
      }
    })
  }


  getUserDetails() {
    this.userService.getUserDetails().subscribe(response => {
      this.userInfo = response;
    }, (error)=> {
      console.error('Something went wrong while getting user info', error.message);
    });

  }


  /**
   * Get all collaborators permission
   * @param queryString search able string
   */
  getCollaboratorPermission(queryString: string, fetchCount: number) {
    this.addwidgetSubsFrmGrp.get('addUsersFilter').setValidators(null);
    this.addwidgetSubsFrmGrp.updateValueAndValidity();
    this.reportServie.getCollaboratorPermission(queryString, fetchCount).subscribe(response => {
      this.collaborators = this.transformResponse(response);
    }, error => console.error(`Error: ${error}`));
  }



  /**
   * Help to tarnsfor response into groups
   * @param response from server for (all collaborators)
   */
  transformResponse(response: PermissionOn): PermissionGroup[] {
    // for user
    const users = []
    if (response && response.users) {

      response.users.forEach(user => {
        const permission = new WidgetDownloadUser();
        permission.userName = user.userName;
        permission.description = user.fullName ? user.fullName : user.email;
        permission.email = user.email;
        users.push(permission);
      });
    }
    return users;
  }

  addMyselfInSelectedList() {
    this.userService.getUserDetails().subscribe(response => {
      const userdetail = new WidgetDownloadUser();
      userdetail.userName = response.userName;
      const isemailVaild = this.testEmailValidity(response.email);
      if (!isemailVaild) {
        this.changeAddUserControlValidity(response.email);
        return;
      }
      userdetail.description = response.fullName ? response.fullName : `${response.firstName} ${response.lastName} `;
      userdetail.email = response.email;
      if (!this.selectedUsers.filter(fil => fil.userName === userdetail.userName).length ? true : false)
        this.selectedUsers.push(userdetail);
    })
  }

  testEmailValidity(email: string) {
    const emailRegEx = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return emailRegEx.test(email)
  }

  /**
   * Displaywith help to display selection with option description
   * @param option from mat-autocomplete
   */
  displayWith(option: WidgetDownloadUser): string {
    return option ? option.description : null;
  }

  /**
   * Use for set selected item
   * @param event after selection change on user list
   */
  onSelectUser(event: MatAutocompleteSelectedEvent) {
    if (event && event.option) {
      const selVal = event.option.value;
      const isemailVaild = this.testEmailValidity(selVal.email);
      if (!isemailVaild) {
        this.changeAddUserControlValidity(selVal.email);
        return;
      }
      const isAlreadyExits: boolean = this.selectedUsers.filter(fil => fil.userName === selVal.userName).length ? true : false;
      if (selVal && !isAlreadyExits) {
        this.selectedUsers.push(selVal);
      }
      this.addwidgetSubsFrmGrp.controls.addUsersFilter.reset();
      this.loosefocus.nativeElement.blur();
    }
  }

  changeAddUserControlValidity(email: string) {
    setTimeout(() => {
    this.selectedEmail = '';
    }, 4000);
    this.selectedEmail = email
    this.addwidgetSubsFrmGrp.controls.addUsersFilter.reset();
    this.loosefocus.nativeElement.blur();
  }

  /**
   * Should remove selected user / group / role from list
   * @param removeAble Remove able selected user / group / role
   */
  remove(removeAble: WidgetDownloadUser) {
    this.globalDialogService.confirm({ label: 'Are you sure you want to delete this ?' }, (response) => {
      if (response && response === 'yes') {
        const selData = this.selectedUsers.findIndex(fil => fil.userName === removeAble.userName);
        this.selectedUsers.splice(selData, 1);
      }
    });
  }

  /**
   * function to close side sheet
   */
  close() {
    this.router.navigate([{ outlets: { sb: null } }], {queryParamsHandling: 'preserve'});
  }

  /**
   * Save download subscribers list
   */
  saveReportDownloadUserList() {
    const userList: WidgetDownloadUser[] = this.selectedUsers.map(element => ({ userName: element.userName, email: element.email }));


    const request: WidgetDownloadBody = new WidgetDownloadBody();

    request.userList = userList;

    request.filterCriteria = this.filterCriterias;


    this.reportServie.saveUpdateportDownload(request, this.widgetId, this.userInfo.userName, this.userDetails.defLocs.toString()).subscribe(res => {
      this.close();
      this.snackbar.open(`Downloading Started`, 'Close', { duration: 3000 });
    }, errro => {
      this.close();
      this.snackbar.open(`Something went wrong`, 'Close', { duration: 5000 });
    });
  }
}
