import { CoreService } from '@services/core/core.service';
import { AfterViewChecked, AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenavContent } from '@angular/material/sidenav';
import { NavigationEnd, Router } from '@angular/router';
import { Userdetails } from '@models/userdetails';
import { UploadDatasetComponent } from '@modules/schema/_components/upload-dataset/upload-dataset.component';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { HomeService } from '@services/home/home.service';
import { UserService } from '@services/user/userservice.service';
import { Observable, Subscription, of, Subject } from 'rxjs';
import { LoadingService } from '@services/loading.service';
import { CreateUpdateSchema } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { SchemaService } from '@services/home/schema.service';
import { getIsSecondaryNavbarOpen } from '@store/selectors/home.selector';
import { toggleSecondarySidebar } from '@store/actions/home.actions';
import { select, Store } from '@ngrx/store';
import { take } from 'rxjs/internal/operators/take';
import { environment } from 'src/environments/environment';
import { ImportSidesheetComponent, PackageType } from '@modules/connekthub';
import { distinctUntilChanged, catchError, finalize, debounceTime } from 'rxjs/operators';
import { GlobaldialogService } from '@services/globaldialog.service';
import { ReportService } from '@modules/report-v2/_service/report.service';
import { DatasetComponent } from '@modules/list/_components/dataset/dataset/dataset.component';
import { UserProfileService } from '@services/user/user-profile.service';
import { Dataset } from '@models/schema/schema';
import { DatasetForm } from '@models/list-page/listpage';

@Component({
  selector: 'pros-primary-navigation',
  templateUrl: './primary-navigation.component.html',
  styleUrls: ['./primary-navigation.component.scss']
})
export class PrimaryNavigationComponent implements OnInit, AfterViewInit, OnDestroy, AfterViewChecked {
  /**
   * To apply the CSS class on selection of primary navigation
   */
  isNavSelected = '';

  udSub: Subscription = new Subscription();
  userDetails: Userdetails = new Userdetails();

  /**
   * flag to check if secondary sidebar is opened
   */
  secondarySideBarOpened$: Observable<boolean>;

  /**
   * sidebar content viewchild
   */
  @ViewChild('secondaryContent') secondaryContent: MatSidenavContent;

  /**
   * grabber content viewchild
   */
  @ViewChild('grabberElement') grabberElement: ElementRef<HTMLElement>;

  /**
   * flag to enable/disable resizable
   */
  grab = false;

  /**
   * cursor when enable/disable resizable
   */
  grabCursor = 'default';

  /**
   * To store count of notifications
   */
  notificationsCount = 0;
  previousSideNavigationWidth: number;

  moduleList: Dataset[] = [];
  moduleFetchSize = 10;
  moduleFetchCount = 0;
  moduleSearch = '';
  moduleLoading = false;
  searchModuleSub: Subject<string> = new Subject();

  formList: DatasetForm[] = [];
  formFetchSize = 10;
  formFetchCount = 0;
  formSearch = '';
  formLoading = false;
  currentModuleId = '';
  searchFormSub: Subject<string> = new Subject();

  constructor(
    private userService: UserService,
    public matDialog: MatDialog,
    private sharedService: SharedServiceService,
    private router: Router,
    public homeService: HomeService,
    private loadingService: LoadingService,
    private schemaService: SchemaService,
    private store: Store,
    private globalDialogService: GlobaldialogService,
    private reportService: ReportService,
    private renderer: Renderer2,
    private profileService: UserProfileService,
    private coreService: CoreService
  ) {}

  ngOnInit(): void {
    this.getMdoState();

    this.udSub = this.userService.getUserDetails().subscribe(
      (response: Userdetails) => {
        console.log('userDetails', this.userDetails);
        this.userDetails = response;
        console.log(this.userDetails);
        this.getNotificationsCount(this.userDetails.userName);
      },
      (error) => console.error(`Error : ${error.message}`)
    );

    this.secondarySideBarOpened$ = this.store.pipe(select(getIsSecondaryNavbarOpen));

    const currentUrl = this.router.url;
    this.checkNavOnReload(currentUrl);
    this.router.events.subscribe((res: any) => {
      const value = res instanceof NavigationEnd;
      if (value) {
        this.checkNavOnReload(res.url);
      }
    });

    this.getModules();

    this.searchModuleSub.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString) => {
      this.moduleSearch = searchString || '';
      this.moduleList = [];
      this.moduleFetchCount = 0;
      this.getModules(this.moduleSearch);
    });
    this.searchFormSub.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString) => {
      this.formSearch = searchString || '';
      this.formList = [];
      this.formFetchCount = 0;
      this.fetchForms(this.currentModuleId, true, this.formSearch);
    });
  }

  /**
   * Open dataset dialog
   */
  openDatasetDialog() {
    const dialogRef = this.matDialog.open(DatasetComponent, {
      height: '600px',
      width: '1100px',
      disableClose: true,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe((result: { toRefreshApis: boolean; moduleId?: number }) => {
      if (result.toRefreshApis) {
        this.sharedService.reloadDatasetModulesTrigger = true;
      }
    });
  }

  /**
   * open the side sheet for the import from CKH ...
   */
  openConnektHubSidesheet() {
    this.router.navigate([{ outlets: { sb: `sb/conneckthubPackage` }}], {
      queryParams: {openLoc: 'home'}
    });
  }

  ngAfterViewInit() {
    this.previousSideNavigationWidth = this.secondaryContent.getElementRef().nativeElement.clientWidth;
  }

  /**
   * angular hooks
   */
  ngAfterViewChecked() {
    const currentWidth = this.secondaryContent.getElementRef().nativeElement.clientWidth;
    if (currentWidth !== this.previousSideNavigationWidth) {
      this.previousSideNavigationWidth = currentWidth;
    }
  }
  ngOnDestroy() {
    if (this.udSub) {
      this.udSub.unsubscribe();
    }
  }

  /**
   * Get state from local storage
   */
  getMdoState() {
    try {
      const appState = localStorage.getItem('mdo-state');
      if (appState) {
        const json = JSON.parse(atob(appState));
        const secondaryNav: boolean = json.isSecondaryOpen ? json.isSecondaryOpen : false;
        this.store.dispatch(toggleSecondarySidebar({ isOpen: secondaryNav }));
      }
    } catch (ex) {
      // console.error(`Error while getting state from localstorage .. ${ex}`)
    }
  }

  isLoading() {
    return this.loadingService.isLoading();
  }

  /**
   * Get selected role description
   */
  get selectedRoleDesc(): string {
    if (this.userDetails.currentRoleId) {
      const selRole = this.userDetails.assignedRoles.filter((fil) => fil.roleId === this.userDetails.currentRoleId)[0];
      return selRole ? selRole.roleDesc : this.userDetails.currentRoleId;
    }
    return '';
  }

  /**
   * function to enable resizable
   */
  resizableMousedown(evt: MouseEvent) {
    this.grab = true;
    this.grabCursor = 'col-resize';
    document.body.style.cursor = this.grabCursor;
    if ((document as any).selection) {
      (document as any).selection.empty();
    } else {
      window.getSelection().removeAllRanges();
    }
  }

  /**
   * function to resize on resizable
   */
  resizableMousemove(evt: MouseEvent) {
    if (this.grab) {
      // const newWidth = evt.clientX - 75 - this.grabberElement.nativeElement.offsetWidth / 2;
      const newWidth = evt.clientX;
      // const widthPercent = ((window.innerWidth - newWidth) / window.innerWidth) * 100;
      const widthPercent = window.innerWidth / 3;
      if (newWidth > 220 && newWidth < widthPercent) {
        this.renderer.setStyle(document.getElementById('secondarySidenav'), 'width', newWidth + 'px');
        this.renderer.setStyle(document.getElementById('secondaryContent'), 'marginLeft', newWidth + 10 + 'px');
        this.secondarySideBarOpened$.pipe(take(1)).subscribe((isOpen) => {
          this.store.dispatch(toggleSecondarySidebar({ isOpen }));
        });
      }
    }
  }

  /**
   * function to disable resizable
   */
  resizableMouseup(evt: MouseEvent) {
    this.grab = false;
    this.grabCursor = 'default';
    document.body.style.cursor = this.grabCursor;
  }

  /**
   * function to modify the width of secondary sidebar
   */
  toggleSecondarySideBar() {
    this.secondarySideBarOpened$.pipe(take(1)).subscribe((isOpen) => {
      this.store.dispatch(toggleSecondarySidebar({ isOpen: !isOpen }));
    });
  }

  /**
   * function to send navigation value to parent..
   * @param val navigation value..
   */
  async sendToParent(val: string) {
    // check for new report creation and show popup
    // only run when url contain /edit/:id/new
    if (this.router.url.includes(`/edit/${this.router.url.split('/')[4]}/new`)) {
      const res = await this.canDeactivate();
      if (res) {
        this.isNavSelected = val;
        if (val === 'welcome') {
          this.router.navigate(['/home/dash/welcome']);
        }
      }
    } else {
      this.isNavSelected = val;
      if (val === 'welcome') {
        this.router.navigate(['/home/dash/welcome']);
      } else if (val === 'schema') {
        this.router.navigate(['home', 'schema', 'list', '_overview']);
      } else if (val === 'flows') {
        this.router.navigate(['home', 'flows', '_all']);
      } else if (val === 'report') {
        this.router.navigate(['home', 'report']);
      } else if (val === 'list') {
        this.router.navigate(['home', 'list']);
      }
    }
  }

  async canDeactivate(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.globalDialogService.confirm(
        {
          label: 'Are you sure do not want to save the dashboard?\nAction cannot be undone. Click Yes to proceed.'
        },
        (response) => {
          if (response && response === 'yes') {
            this.reportService.deleteFromNavbar.next(true);
            resolve(true);
          } else {
            resolve(false);
          }
        }
      );
    });
  }

  /**
   * function to check for navigation selection on reloading page
   * @param url current url
   */
  checkNavOnReload(url: string) {
    if (
      url.includes('/home/dash/welcome') ||
      url.includes('/home/schema/schema-details') ||
      url.includes('/home/task/')
    ) {
      this.isNavSelected = 'welcome';
    } else if (url.includes('/home/report')) {
      this.isNavSelected = 'report';
    } else if (url.includes('/home/schema')) {
      this.isNavSelected = 'schema';
    } else if (url.includes('/home/flows')) {
      this.isNavSelected = 'flows';
    } else {
      this.isNavSelected = 'list';
    }
  }

  /**
   * Function to listen for the changes and
   * update the count
   */
  getNotificationsCount(userName: string) {
    this.sharedService.updateNotifications.subscribe(() => {
      this.homeService.getNotificationCount(userName).subscribe((nCount) => {
        this.notificationsCount = nCount.Count;
      });
    });
  }

  /**
   * Function to show dialog
   */
  selectedModule(event) {
    if (!event) {
      const dialogRef = this.matDialog.open(UploadDatasetComponent, {
        height: '800px',
        width: '800px',
        data: { selecteddata: event },
        disableClose: true
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.sharedService.getSecondaryNavbarList();
      });
    } else {
      const param: any = {
        moduleId: event.objectid,
        schemaId: event.schemaId ? event.schemaId : null,
        moduleDesc: event.objectdesc
      };
      this.createSchema(param);
    }
  }

  /**
   * Function to show import dialog
   */
  importSchema({ type, moduleId }) {
    if (!type) {
      this.router.navigate([{ outlets: { sb: `sb/schema/check-data/${moduleId}/new` } }]);
    } else {
      this.importFrmCKH();
    }
  }

  importFrmCKH() {
    // open the side sheet for the import from CKH ...
    this.globalDialogService.openDialog(ImportSidesheetComponent, { importType: PackageType.DATASET });

    this.globalDialogService.dialogCloseEmitter.pipe(distinctUntilChanged()).subscribe((response) => {
      console.log(response);
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

  /**
   * Function to create new schema
   * @param moduleId: module Id
   */
  createSchema({ moduleId, schemaId, moduleDesc }) {
    if (moduleId && schemaId) {
      this.router.navigate([{ outlets: { sb: `sb/schema/check-data/${moduleId}/${schemaId}` } }], {
        queryParams: { name: moduleDesc }
      });
    }
    if (moduleId && !schemaId) {
      const schemaReq: CreateUpdateSchema = new CreateUpdateSchema();
      schemaReq.moduleId = moduleId;
      schemaReq.discription = 'New schema';
      this.schemaService.createUpdateSchema(schemaReq).subscribe(
        (response) => {
          const receivedSchemaId = response;
          this.sharedService.setAfterBrSave(null);
          this.router.navigate([{ outlets: { sb: `sb/schema/check-data/${moduleId}/${receivedSchemaId}` } }], {
            queryParams: { name: moduleDesc, updateschema: true }
          });
        },
        (error) => {
          console.log('Something went wrong while creating schema', error.message);
        }
      );
    }
  }

  getInitials() {
    const fName = this.userDetails.firstName;
    const lName = this.userDetails.lastName;
    const primaryEmail = this.userDetails.email;
    if ((fName && fName.length >= 1) || (lName && lName.length >= 1)) {
      return (fName[0] ? fName[0] : '') + (lName[0] ? lName[0] : '');
    } else {
      return primaryEmail && primaryEmail[0] ? primaryEmail[0] : '?';
    }
  }

  onScrollEndModule() {
    this.moduleFetchCount++;
    this.getModules(this.moduleSearch);
  }

  onScrollEndForm() {
    this.formFetchCount++;
    this.fetchForms(this.currentModuleId, false, this.formSearch);
  }

  getModules(description: string = '') {
    this.moduleLoading = true;
    this.coreService
      .searchAllObjectType({ lang: 'en', fetchsize: this.moduleFetchSize, fetchcount: this.moduleFetchCount, description })
      .pipe(take(1))
      .subscribe(
        (resp) => {
          this.moduleList.push(...resp);
          this.moduleLoading = false;
        },
        (err) => {
          console.log(err);
          this.moduleLoading = false;
        }
      );
  }

  fetchForms(moduleId: string, clearList: boolean = false, formSearch: string = '') {
    this.currentModuleId = moduleId;
    const dto = {type: [], userCreated: [], userModified: []};
    this.formLoading = true;
    if(clearList) {
      this.formList = [];
    }
    this.coreService
    .getDatasetFormList(moduleId, this.formFetchCount, this.formFetchSize, formSearch, 0, 0, dto)
    .pipe(
      take(1),
      catchError((err) => {
        console.log(err);
        return of([]);
      }),
      finalize(() => this.formLoading = false)
    )
    .subscribe(
      (res) => {
        this.formList.push(...res);
      },
      (error) => {
        console.error(`Error : ${error.message}`);
        this.formLoading = true;
      }
    );
  }

  /**
   * Signout ...
   */
  signOut() {
    try {
      this.profileService.updateLastActiveDate().subscribe(s=>console.log(`Successfully loged out !`), err=> console.error(`${err?.error?.message || 'Something went wrong !'}`));
      delete localStorage['JWT-TOKEN'];
      delete localStorage['JWT-REFRESH-TOKEN'];
      delete localStorage['PRIVILEGES'];
    } finally {
      if (environment.production) {
        window.open(`${environment.authUrl}/auth/login?redirecUrl=${this.router.url}`, '_self');
      } else {
        this.router.navigate(['auth', 'login']);
      }
    }
  }

  /**
   * Open settings sidesheet
   */
  openSettings() {
    this.router.navigate([{ outlets: { sb: `sb/settings` } }]);
  }

  get toShowSecondaryNavBar() {
    return this.isNavSelected === 'schema' || this.isNavSelected === 'flows' ? false : true;
  }
}
