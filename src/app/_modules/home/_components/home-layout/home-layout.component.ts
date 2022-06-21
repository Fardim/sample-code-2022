import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { UserService } from 'src/app/_services/user/userservice.service';
import { Userdetails } from 'src/app/_models/userdetails';
import { LoadingService } from 'src/app/_services/loading.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
@Component({
  selector: 'pros-home-layout',
  templateUrl: './home-layout.component.html',
  styleUrls: ['./home-layout.component.scss'],
})
export class HomeLayoutComponent implements OnInit, AfterViewInit, OnDestroy {
  udSub: Subscription = new Subscription();
  userDetails: Userdetails = new Userdetails();

  activatedPrimaryNav = 'welcome';

  /**
   * flag to check if primary sidebar is opened
   */
  primarySideBarOpened = true;

  /**
   * flag to check if secondary sidebar is opened
   */
  secondarySideBarOpened = true;

  /**
   * child element of primary sidebar
   */
  @ViewChild('primarySidenav') primarySidenav: MatSidenav;

  /**
   * sidebar content viewchild
   */
  @ViewChild('secondaryContent') secondaryContent: MatSidenavContent;

  /**
   * flag to enable/disable resizeable
   */
  grab = false;

  /**
   * Subject for notify localstorage for mdo nav state  state ..
   */
  private appStateSubject: BehaviorSubject<boolean> = new BehaviorSubject(null);

  /**
   * constructor of class
   * @param userService User service object
   * @param loadingService Loading service object
   */
  constructor(private userService: UserService, private loadingService: LoadingService) {}

  ngOnInit() {
    this.udSub = this.userService.getUserDetails().subscribe((response: Userdetails) => {
      this.userDetails = response;
    });

    window.onbeforeunload = () => this.ngOnDestroy();
  }

  ngAfterViewInit() {
    this.enableResizeable();

    /**
     * get app state from .. localstorage and set on primary / secondary nav
     */
    try {
      const appState = localStorage.getItem('mdo-state');
      if (appState) {
        const json = JSON.parse(atob(appState));
        const primaryNav = json.isPrimaryOpen ? json.isPrimaryOpen : false;
        const secondaryNav = json.isSecondaryOpen ? json.isSecondaryOpen : false;
        this.primarySideBarOpened = primaryNav;
        this.secondaryContent = secondaryNav;
        if (primaryNav) {
          document.getElementById('primarySidenav').style.width = '200px';
          document.getElementById('primaryContent').style.marginLeft = '200px';
        } else {
          document.getElementById('primarySidenav').style.width = '60px';
          document.getElementById('primaryContent').style.marginLeft = '60px';
        }

        if (secondaryNav) {
          document.getElementById('secondarySidenav').style.width = '260px';
          document.getElementById('secondaryContent').style.marginLeft = '200px';
        } else {
          document.getElementById('secondarySidenav').style.width = '16px';
          document.getElementById('secondaryContent').style.marginLeft = '16px';
        }
      }
    } catch (ex) {
      console.error(`Error while getting state from localstorage .. ${ex}`);
    }
  }

  isLoading() {
    return this.loadingService.isLoading();
  }

  ngOnDestroy() {
    if (this.udSub) {
      this.udSub.unsubscribe();
    }
    this.appStateSubject.complete();
    this.appStateSubject.unsubscribe();
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
   * function to modify the width of primary sidebar
   */
  togglePrimarySideBar() {
    if (this.primarySideBarOpened) {
      document.getElementById('primarySidenav').style.width = '60px';
      document.getElementById('primaryContent').style.marginLeft = '60px';
      this.primarySideBarOpened = false;
    } else {
      document.getElementById('primarySidenav').style.width = '200px';
      document.getElementById('primaryContent').style.marginLeft = '200px';
      this.primarySideBarOpened = true;
    }
    this.appStateSubject.next(true);
  }

  /**
   * function to modify the width of secondary sidebar
   */
  toggleSecondarySideBar(hidePrimary: boolean) {
    if (this.secondarySideBarOpened) {
      document.getElementById('secondarySidenav').style.width = '16px';
      document.getElementById('secondaryContent').style.marginLeft = '16px';
      this.secondarySideBarOpened = false;
    } else {
      document.getElementById('secondarySidenav').style.width = '260px';
      document.getElementById('secondaryContent').style.marginLeft = '200px';
      this.secondarySideBarOpened = true;
    }
    if (hidePrimary) {
      if (this.primarySideBarOpened) {
        this.togglePrimarySideBar();
      }
    }
    this.appStateSubject.next(true);
  }

  /**
   * function to enable resizeable
   */
  enableResizeable() {
    const sidebar = document.getElementById('secondarySidenav');
    const content = this.secondaryContent.getElementRef().nativeElement;

    const grabberElement = document.createElement('div');
    grabberElement.style.height = '100%';
    grabberElement.style.width = '5px';
    grabberElement.style.backgroundColor = '#ffffff';
    grabberElement.style.position = 'absolute';
    grabberElement.style.cursor = 'col-resize';
    grabberElement.style.resize = 'horizontal';
    grabberElement.style.overflow = 'auto';

    grabberElement.addEventListener('mousedown', () => {
      this.grab = true;
      sidebar.style.cursor = 'col-resize';
    });

    grabberElement.addEventListener('mouseup', () => {
      this.grab = false;
      sidebar.style.cursor = 'default';
    });

    sidebar.addEventListener('mouseup', () => {
      this.grab = false;
      sidebar.style.cursor = 'default';
      grabberElement.style.backgroundColor = '#fff';
    });

    document.addEventListener('mouseup', () => {
      if (this.grab) {
        this.grab = false;
        sidebar.style.cursor = 'default';
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (this.grab) {
        const newWidth = e.clientX - 75 - grabberElement.offsetWidth / 2;
        const widthPercent = ((window.innerWidth - newWidth) / window.innerWidth) * 100;
        if (widthPercent > 70 && widthPercent < 94) {
          sidebar.style.width = newWidth + 'px';
        }
      }
    });
    content.prepend(grabberElement);
  }
}
