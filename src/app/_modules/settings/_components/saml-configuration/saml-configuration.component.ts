import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SamlConfigurationService } from '@services/user/saml-configuration.service';
import { MatTableDataSource } from '@angular/material/table';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { GenerateUrlComponent } from './generate-url/generate-url.component';
import { TransientService } from 'mdo-ui-library';
import { UserService } from '@services/user/userservice.service';

@Component({
  selector: 'pros-saml-configuration',
  templateUrl: './saml-configuration.component.html',
  styleUrls: ['./saml-configuration.component.scss'],
})
export class SAMLConfigurationComponent implements OnInit {

  configurationTableDetails = {
    showSkeleton: false,
    recordsPageIndex: 1,
    recordsPageSize: 20,
    totalCount: 0,
    searchString: '',
    defaultTableDataLength: false,
    formListHasData: false
  }

  userIds = {
    tenantId: '',
    orgId: '',
  };

  searchFieldSub: Subject<string> = new Subject();
  subscription: Subscription = new Subscription();
  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();

  dataSource = new MatTableDataSource();

  displayedColumns: string[] = ['action', 'spEntityId','idpEntityId', 'idpXmlUrl'];
  columns = configurationColumns;


  constructor(
    private router: Router,
    private samlService: SamlConfigurationService,
    private transientService: TransientService,
    private dialog: MatDialog,
    public userService: UserService
  ) {}

  ngOnInit(): void {
    this.configurationTableDetails.showSkeleton = true;
    this.getUserDetails();
    this.checkSearchConfiguration();
    this.samlUpdateCheck();
  }

  getUserDetails() {
    this.userService
      .getUserDetails()
      .pipe(distinctUntilChanged())
      .subscribe((user) => {
        this.userIds = {
          orgId: user.orgId,
          tenantId: user.plantCode,
        };
        if (user.orgId || user.plantCode) {
          this.getConfigurationDate();
        }
      });
  }

  samlUpdateCheck() {
    this.samlService.updateConfiguration$.subscribe((response) => {
      if (response) {
        this.getConfigurationDate();
      }
    });
  }

  checkSearchConfiguration() {
    this.searchFieldSub.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString) => {
      this.configurationTableDetails.searchString = searchString || '';
      this.configurationTableDetails.recordsPageIndex = 1;
      this.getConfigurationDate();
    });
  }

  getConfigurationDate() {
    const fetchcount = this.configurationTableDetails.recordsPageIndex - 1;
    const fetchsize = this.configurationTableDetails.recordsPageSize;
    this.subscription.add(
      this.samlService.getSamlConfigurationList(fetchcount, fetchsize, this.configurationTableDetails.searchString, this.userIds.orgId).subscribe((listData) => {
        this.configurationTableDetails.showSkeleton = false;
        this.configurationTableDetails.formListHasData = true;
        this.dataSource.data = listData;
        this.configurationTableDetails.totalCount = listData.length;
        if (listData.length !== 0 && !this.configurationTableDetails.defaultTableDataLength) {
          this.configurationTableDetails.defaultTableDataLength = true;
        }
      })
    );
  }

  showConfiguration(type, details?) {
    let idQueryParams = null;
    if (details) {
      const ids = {
        orgId: details.orgId,
        tenantId: details.tenantId,
      };
      const params = btoa(JSON.stringify(ids));
      idQueryParams = params;
      this.router.navigate(
        [{ outlets: { sb: `sb/settings/saml-configuration`, outer: `outer/settings/saml-configuration-view/${type}` } }],
        { queryParams: { t: idQueryParams } }
      );
      return;
    }
    this.router.navigate([{ outlets: { sb: `sb/settings/saml-configuration`, outer: `outer/settings/saml-configuration-view/${type}` } }]);
  }

  generateURL(element) {
    const dialogRef = this.dialog.open(GenerateUrlComponent, {
      width: '600px',
      data: element,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((msg) => {});
  }

  openConfirmation(configuration) {
    const dialogMsg = 'Are you sure you wish to delete this Configuration';
    this.transientService.confirm(
      {
        data: { dialogTitle: 'Alert', label: dialogMsg },
        disableClose: true,
        autoFocus: false,
        width: '600px',
        panelClass: 'create-master-panel',
      },
      (response) => {
        if (response === 'yes') {
          this.deleteConfiguration(configuration);
        }
      }
    );
  }

  deleteConfiguration(configuration) {
    this.samlService.deleteConfiguration(configuration.orgId, configuration.tenantId).subscribe((response: any) => {
      this.configurationTableDetails.recordsPageIndex = 1;
      this.configurationTableDetails.defaultTableDataLength = false;
      this.getConfigurationDate();
    });
  }

  onPageChange(event: PageEvent) {
    if (this.configurationTableDetails.recordsPageIndex !== event.pageIndex) {
      this.configurationTableDetails.recordsPageIndex = event.pageIndex;
      this.getConfigurationDate();
    }
  }

  getLabel(dynCol) {
    return this.columns.find((d) => d.id === dynCol)?.name;
  }

  checkLabel(dynCol, element) {
    return this.columns.find((d) => d.id === dynCol)?.id;
  }

  // display page records range
  get displayedRecordsRange(): string {
    const endRecord =
      this.configurationTableDetails.recordsPageIndex * this.configurationTableDetails.recordsPageSize < this.configurationTableDetails.totalCount ? this.configurationTableDetails.recordsPageIndex * this.configurationTableDetails.recordsPageSize : this.configurationTableDetails.totalCount;
    return this.configurationTableDetails.totalCount ? `${(this.configurationTableDetails.recordsPageIndex - 1) * this.configurationTableDetails.recordsPageSize + 1} to ${endRecord} of ${this.configurationTableDetails.totalCount}` : '';
  }
}

export const configurationColumns = [
  {
    id: 'action',
    name: $localize`:@@action:Action`,
  },
  {
    id: 'idpEntityId',
    name: $localize`:@@idpEntityId:Entity ID`,
  },
  {
    id: 'idpaliasName',
    name: $localize`:@@idpaliasName:IDP Alias`,
  },
  {
    id: 'idpXmlUrl',
    name: $localize`:@@idpXmlUrl:IDP URL`,
  },
  {
    id: 'companyId',
    name: $localize`:@@companyId:Company ID`,
  },
];
