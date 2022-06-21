import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ObjectType } from '@models/core/coreModel';
import { licensingInformation, Userdetails } from '@models/userdetails';
import { ImportSidesheetComponent, PackageType } from '@modules/connekthub';
import { UploadDatasetComponent } from '@modules/schema/_components/upload-dataset/upload-dataset.component';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { CoreService } from '@services/core/core.service';
import { GlobaldialogService } from '@services/globaldialog.service';
import { UserService } from '@services/user/userservice.service';
import { TransientService } from 'mdo-ui-library';
import { IntrojsService } from '@services/introjs/introjs.service';
import { UserProfileService } from '@services/user/user-profile.service';
import { catchError, distinctUntilChanged, take } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { UserLicenseDialogComponent } from '../user-license-dialog/user-license-dialog.component';

export const USER_PREF_MENU = [
  {
    tile: 'exploreCKH',
    isVisible: true
  },
  {
    tile: 'editProfileH',
    isVisible: true
  },
  {
    tile: 'inviteUserH',
    isVisible: true
  }
]

@Component({
  selector: 'pros-welcome-v2',
  templateUrl: './welcome-v2.component.html',
  styleUrls: ['./welcome-v2.component.scss']
})
export class WelcomeV2Component implements OnInit {
  modules = [];
  userDetail: Userdetails = new Userdetails();
  menuItems = USER_PREF_MENU;
  constructor(
    private router: Router,
    private coreService: CoreService,
    public matDialog: MatDialog,
    @Inject(LOCALE_ID) public locale: string,
    private sharedService: SharedServiceService,
    private globalDialogService: GlobaldialogService,
    private transientService: TransientService,
    private introjsService: IntrojsService,
    private userService: UserService,
    private profileService: UserProfileService
  ) {

    // Todo: temp code to be removed once API endpoint is available
    const getUserPreferences = JSON.parse(localStorage.getItem('userMenuPreferences') || null);
    if (!getUserPreferences) {
      localStorage.setItem(
        'userMenuPreferences',
        JSON.stringify(USER_PREF_MENU)
      );
    } else {
      this.menuItems = getUserPreferences;
    }
  }

  get isGetStartedMessageVisible(): any {
    const activeMenuItem = this.menuItems.filter((item) => item.isVisible);
    return !!activeMenuItem?.length
  }

  ngOnInit(): void {
    this.profileService.getUserPrivileges().pipe(take(1)).subscribe(resp => {
      if(resp && resp.acknowledge) {
        localStorage.setItem('PRIVILEGES', resp.response);
      }
    },  err => console.log(err));
    this.userService.getUserDetails().pipe(distinctUntilChanged()).subscribe(response => {
      if (response) {
        this.userDetail = response;
      }
    });
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    this.coreService.getAllObjectType(this.locale, 20, 0).subscribe(
      (modules: ObjectType[]) => {
        this.modules = modules;
      })

    this.getUserDetails();
  }

  getTransientMessage(tile: string) {
    switch (tile) {
      case 'bringOver':
        return 'You can edit your data in Settings\\data';
      case 'editProfileH':
        return 'You can edit your profile in Settings\\Profile';
      case 'inviteUserH':
        return 'You can invite people from Settings\\Team';
      case 'exploreCKH':
        return 'You can access ConnektHub using the plus button above';
    }
  }

  /**
   * returns true if any one of the menu items is visible
   * @returns boolean
   */
  showGetStartedBlock(): boolean {
    return this.menuItems.some((item) => item.isVisible);
  }

  redirectToSubPage(redirectTo, tile?: string) {
    if (!redirectTo) {
      // Close the particular tile here and save in user preferences
      this.menuItems = this.menuItems.map((item) => {
        if (item.tile === tile) {
          item.isVisible = false;
        }
        return item;
      });

      localStorage.setItem('userMenuPreferences', JSON.stringify(this.menuItems));
      this.transientService.open(this.getTransientMessage(tile));
      return;
    };

    switch (redirectTo) {
      case 'edit':
        this.router.navigate(['', { outlets: { sb: `sb/profile` }, }], {fragment: 'direct-to-profile'});
        break;
      case 'invite':
        this.router.navigate([{ outlets: { outer: `outer/teams/invite` } }], { queryParamsHandling: 'preserve' });
        break;
      case 'connectHub':
        this.importConnekthub();
        break;
      case 'bringOver':
        this.importConnekthub();
        break;
      case 'newDataset':
        const dialogRef = this.matDialog.open(UploadDatasetComponent, {
          height: '800px',
          width: '800px',
          data: { selecteddata: null },
          disableClose: true,
        });
        dialogRef.afterClosed().subscribe((result) => {
          this.sharedService.getSecondaryNavbarList();
        });
        break;
      case 'data':
        this.router.navigate(['/home/list/datatable', this.modules[0].moduleId]);
        break;
      case 'open':
        this.router.navigate(['home', 'schema', 'list', '_overview']);
        break;
    }
  }

  importConnekthub() {
    // open the side sheet for the import from CKH ...
    this.router.navigate([{ outlets: { outer: `outer/connectHub` } }], {
      queryParams: { importType: PackageType.DATASET },
    })
  }

  startHelp() {
    this.introjsService.start({
      steps: [
        {
          title: 'Get started',
          element: document.querySelector(
            '#secondaryContent > pros-welcome-v2 > mat-card > div:nth-child(2) > lib-text-line > p'
          ),
          intro: 'Customize your profile, invite colleagues, or explore solutions on ConnektHub.'
        },
        {
          title: 'Quick links',
          element: document.querySelector(
            '#secondaryContent > pros-welcome-v2 > mat-card > div:nth-child(4) > lib-text-line > p'
          ),
          intro:
            'Quick access links will redirect you to the respective MDO pages so you can manage your datasets and analyse & validate the data using business rules.'
        },
        {
          title: 'Search',
          element: document.querySelector('#secondarySidenav > div > pros-secondary-navbar > div > mat-card > div:nth-child(4) > lib-search > div > input'),
          intro: 'Quick Search your content in the home page.'
        },
        {
          title: 'Dashboards',
          element: document.querySelector('#nav-tree > mat-accordion > lib-section:nth-child(1)'),
          intro: 'Access your dashboards using these quick links.'
        },
        {
          title: 'Tasks',
          element: document.querySelector('#nav-tree > mat-accordion > lib-section:nth-child(3)'),
          intro: 'Access the tasks assigned to you through Inbox, In workflow, Rejected or in Draft folders.'
        },
        {
          title: 'Inbox',
          element: document.querySelector('#mat-expansion-panel-header-0 > span > mat-panel-title > lib-text-line'),
          intro: 'New requests that need your action.'
        },
        {
          title: 'In Progress',
          element: document.querySelector('#cdk-drop-list-0>div:nth-child(2)'),
          intro: 'All the requests that are still in the workflow approval process.'
        },
        {
          title: 'Rejected',
          element: document.querySelector('#mat-expansion-panel-header-2 > span > mat-panel-title > lib-text-line'),
          intro: 'Requests that are rejected in the workflow process.'
        },
        {
          title: 'Completed',
          element: document.querySelector('#mat-expansion-panel-header-3 > span > mat-panel-title > lib-text-line'),
          intro: 'Requests that have successfully completed the workflow process.'
        },
        {
          title: 'Draft',
          element: document.querySelector('#mat-expansion-panel-header-4 > span > mat-panel-title > lib-text-line'),
          intro: 'Requests that were initiated but are not yet submitted.'
        },
        {
          title: 'Discussion',
          element: document.querySelector('#nav-tree > mat-accordion > lib-section:nth-child(5)'),
          intro: 'View your chat channels here.'
        }
      ]
    });
  }

  getUserDetails() {
    this.userService.getUserDetails().subscribe(
      (response: Userdetails) => {
        this.getLicenseValidateInfo(response.orgId);
      },
      (error) => console.error(`Error : ${error.message}`)
    );
   }

   getLicenseValidateInfo(orgId) {
    if (!orgId) {
      this.transientService.open('Something went wrong!', null, { duration: 2000, verticalPosition: 'bottom' });
      return;
    }
    this.userService.getLicenseValidateInfo(orgId)
    .pipe(
      catchError((err) => {
        console.log(err);
        return throwError(err);
      }),
    )
    .subscribe((response: licensingInformation) => {
      if (response && response?.status === 'EXPIRED') {
        const dialogRef = this.matDialog.open(UserLicenseDialogComponent, {
          data: '',
          width: '600px',
          disableClose: true,
          autoFocus: false
        });
      }
    }, error => {
      this.transientService.open('Something went wrong!', null, { duration: 2000, verticalPosition: 'bottom' });
    })
  }
}
