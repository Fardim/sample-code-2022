import { Component, Inject, LOCALE_ID, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleRequestDto } from '@models/teams';
import { NumberSettingSavePayload, NumberSettingsListPayload } from '@modules/transaction/model/transaction';
import { CoreCrudService } from '@services/core-crud/core-crud.service';
import { GlobaldialogService } from '@services/globaldialog.service';
import { UserProfileService } from '@services/user/user-profile.service';
import { TransientService } from 'mdo-ui-library';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NumbeSettingsDataSource } from './number-settings-datasource';

@Component({
  selector: 'pros-number-settings',
  templateUrl: './number-settings.component.html',
  styleUrls: ['./number-settings.component.scss']
})
export class NumberSettingsComponent implements OnInit, OnDestroy {
  formListHasData = false;
  searchFieldSub: Subject<string> = new Subject();

  // selected filters
  filterData = {
    searchStr: '',
    userModified: [],
    userCreated: []
  };

  // modified by filter
  filteredmodifybyUsers = [];
  searchModifyBySub: Subject<string> = new Subject();

  // created by filter
  filteredcreatedbyUsers = [];
  searchCreatedBySub: Subject<string> = new Subject();

  subscriptions = [];

  showSkeleton = false;
  moduleId: string;
  dataSource: NumbeSettingsDataSource = undefined;

  displayedColumns: string[] = ['action','description', 'dateModified', 'userModified'];
  staticColumns: string[] = ['select'];
  columns = formColumns;

  recordsPageIndex = 1;
  recordsPageSize = 10;
  totalCount = 0;

  constructor(
    private coreCrudService: CoreCrudService,
    public readonly route: ActivatedRoute,
    private router: Router,
    @Inject(LOCALE_ID) public locale: string,
    private globalDialogService: GlobaldialogService,
    private transientService: TransientService,
    private userService: UserProfileService
  ) {
    this.dataSource = new NumbeSettingsDataSource(coreCrudService);
  }

  ngOnInit(): void {
    this.getUsersList('both');
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    this.subscriptions.push(this.route.params.pipe().subscribe((resp) => {
      this.moduleId = resp.moduleId;
      this.dataSource.reset();
      this.getTableData();
    }));

    this.subscriptions.push(this.searchFieldSub.pipe(debounceTime(300), distinctUntilChanged()).subscribe((searchStr) => {
      this.filterData.searchStr = searchStr;
      this.recordsPageIndex = 1;
      this.dataSource.reset();
      this.getTableData();
    }));

    this.subscriptions.push(this.searchModifyBySub.pipe(debounceTime(300), distinctUntilChanged()).subscribe((searchStr) => {
      this.getUsersList('modifiedBy', searchStr);
    }));

    this.subscriptions.push(this.searchCreatedBySub.pipe(debounceTime(300), distinctUntilChanged()).subscribe((searchStr) => {
      this.getUsersList('createdBy', searchStr);
    }));

    this.subscriptions.push(this.dataSource.hasDataSubject.subscribe(resp => {
      if(resp) {
        this.formListHasData = true;
      }
    }));

    this.subscriptions.push(this.dataSource.totalData.subscribe((resp: any) => {
      if (resp) {
        this.totalCount = resp;
      }
    }));

    this.coreCrudService.getNumberSettingChange.subscribe((res) => {
      if (res && res.id) {
        this.dataSource.reset();
        this.getTableData();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  getUsersList(type, searchStr = '') {
    const payload = new RoleRequestDto();
    payload.pageInfo = {
      pageNumer: 0,
      pageSize: 50
    };
    payload.searchString = searchStr;
    this.subscriptions.push(this.userService.getUserInfoList(payload).subscribe((res) => {
      const users = res?.listPage?.content || [];
      users.map((user) => {
        user.fname = `${user.fname || ''}${(user.fname && user.lname) ? (' ' + user.lname) : ''}${!user.fname ? user.userName : ''}`;
      });

      if (type === 'modifiedBy') {
        this.filteredmodifybyUsers = users;
      } else if (type === 'createdBy') {
        this.filteredcreatedbyUsers = users;
      } else {
        this.filteredmodifybyUsers = users;
        this.filteredcreatedbyUsers = users;
      }
    }, (err) => {
      console.log(err);
    }));
  }

  getTableData() {
    const payload = new NumberSettingsListPayload();
    payload.fields = [];
    payload.userCreated = this.filterData.userCreated || [];
    payload.userModified = this.filterData.userModified || [];

    this.dataSource.getData(this.moduleId, payload, this.filterData.searchStr, this.recordsPageIndex - 1, this.recordsPageSize);
  }

  createNewNumberSetting() {
    this.router.navigate(['', { outlets: {sb: `sb/list/dataset-settings/${this.moduleId}/number-settings/${this.moduleId}`, outer: `outer/number-settings-form/${this.moduleId}/new` } }]);
  }

  gotoEditPage(el: NumberSettingSavePayload) {
    this.router.navigate(['', { outlets: {sb: `sb/list/dataset-settings/${this.moduleId}/number-settings/${this.moduleId}`, outer: `outer/number-settings-form/${this.moduleId}/${el.uuid || 'new'}` } }]);
  }

  delete(el: NumberSettingSavePayload) {
    this.globalDialogService.confirm({ label: 'Are you sure you want to delete this ?' }, (response) => {
      if (response && response === 'yes') {
        if (el.uuid) {
          this.deleteNumberSetting(el.uuid);
        }
      }
    });
  }

  deleteNumberSetting(id) {
    this.subscriptions.push(this.coreCrudService.deleteNumberSetting(this.moduleId, id).subscribe((res: any) => {
      this.showErrMsg('Deleted number setting successfully');
      this.coreCrudService.setNumberSettingChange('delete', id);
    }, (err) => {
      this.showErrMsg('Unable to delete number setting');
    }));
  }

  setSelectedModifyby(user, ev?) {
    if (user) {
      if (ev === true) {
        if (!this.filterData.userModified.find(x => x === user?.userName)) {
          this.filterData.userModified.push(user?.userName);
        }
      } else if (ev === false) {
        this.filterData.userModified = this.filterData.userModified.filter(x => x !== user?.userName);
      }
    } else {
      this.filterData.userModified = [];
    }
  }

  setSelectedCreatedby(user, ev?) {
    if (user) {
      if (ev === true) {
        if (!this.filterData.userCreated.find(x => x === user?.userName)) {
          this.filterData.userCreated.push(user?.userName);
        }
      } else if (ev === false) {
        this.filterData.userCreated = this.filterData.userCreated.filter(x => x !== user?.userName);
      }
    } else {
      this.filterData.userCreated = [];
    }
  }

  afterFilterMenuClosed(type) {
    this.recordsPageIndex = 1;
    this.dataSource.reset();
    this.getTableData();
  }

  modifybyScrollEnd() {
    //
  }

  createdbyScrollEnd() {
    //
  }

  getLabel(dynCol) {
    return this.columns.find((d) => d.id === dynCol).name;
  }

  onPageChange(event: PageEvent) {
    if (this.recordsPageIndex !== event.pageIndex) {
      this.recordsPageIndex = event.pageIndex;
      this.getTableData();
    }
  }

  get displayedRecordsRange(): string {
    const endRecord =
      this.recordsPageIndex * this.recordsPageSize < this.totalCount ? this.recordsPageIndex * this.recordsPageSize : this.totalCount;
    return this.totalCount ? `${(this.recordsPageIndex - 1) * this.recordsPageSize + 1} to ${endRecord} of ${this.totalCount}` : '';
  }

  shortName(userName: string, lName: string) {
    if (userName.length > 0) {
      const names = userName.split(' ');
      let res = names[0][0];
      if (names.length > 1) {
        res = res + names[1][0];
      }
      return res;
    } else {
      return '';
    }
  }

  showErrMsg(errMsg: string) {
    if (errMsg) {
      this.transientService.open(errMsg, null, { duration: 2000, verticalPosition: 'bottom'});
    }
  }
}

export const formColumns = [
  {
    id: 'description',
    name: $localize`:@@rule_name:Rule Name`,
  },
  {
    id: 'dateModified',
    name: $localize`:@@last_modified:Last Modified`,
  },
  {
    id: 'userModified',
    name: $localize`:@@last_modified_by:Last Modified By`,
  },
  {
    id: 'action',
    name: $localize`:@@action:Action`,
  },
];
