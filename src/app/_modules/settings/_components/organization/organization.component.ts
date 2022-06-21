import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'pros-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss'],
})
export class OrganizationComponent implements OnInit {
  selectedUserFromTeamsUsername = '';
  showSkeleton = false;
  formErrMsg = false;

  // for show new tenant button
  isShowNewTenantButton: boolean = false;

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {}

  /**
   * call when we change the tab
   */
  onTabChange($event): void {
    if($event === 3) {
      this.isShowNewTenantButton = true;
      return;
    }
    this.isShowNewTenantButton = false;
  }

  //for open new tenant side sheet
  newTenantButtonHandler() {
    this.router.navigate([{ outlets: { sb: `sb/settings/organization`, outer: `outer/tenant/new-tenant` } }], {
      queryParamsHandling: 'preserve',
    });
  }


}
