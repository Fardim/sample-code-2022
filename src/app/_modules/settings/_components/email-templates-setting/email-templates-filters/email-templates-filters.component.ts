import { take, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { UserProfileService } from '@services/user/user-profile.service';
import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { EmailTemplateReqParam, TemplateTypeOptions } from '@models/notif/notif.model';
import { RoleRequestDto, UserInfo } from '@models/teams';
import { Subject } from 'rxjs';

@Component({
  selector: 'pros-email-templates-filters',
  templateUrl: './email-templates-filters.component.html',
  styleUrls: ['./email-templates-filters.component.scss'],
})
export class EmailTemplatesFiltersComponent implements OnInit {
  @Input() reqParam: EmailTemplateReqParam = {
    dataSet: null,
    modifiedDate: null,
    templateName: null,
    templateType: null,
    modifiedUser: null,
    createdUser: null,
  };
  @Output() emitReqParam = new EventEmitter();

  filterableDatasetOb: Array<object> = [
    { key: 'key', value: 'value' },
    { key: 'key', value: 'value' },
    { key: 'key', value: '1' },
  ];

  templateTypeOptions = TemplateTypeOptions;
  selectedTemplateTypes: { key: string; value: string }[] = [];
  serachUserCtrl: FormControl = new FormControl(null);

  userPageNumber = 0;
  userPageSize = 10;
  userSearch = '';
  userList: UserInfo[] = [];
  selectedModifiedUsers: string[] = [];
  selectedCreateUsers: string[] = [];
  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();
  /**
   * table data search by string
   */
  searchFieldSub: Subject<string> = new Subject();
  searchString = '';

  constructor(private userProfileService: UserProfileService) {}

  ngOnInit(): void {
    this.getUserList();
    this.serachUserCtrl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.unsubscribeAll$))
      .subscribe((searchString) => {
        this.userSearch = searchString.toLowerCase();
        this.userPageNumber = 0;
        this.getUserList();
      });
    this.searchFieldSub.pipe(debounceTime(1000), distinctUntilChanged(), takeUntil(this.unsubscribeAll$)).subscribe((searchString) => {
      this.searchString = searchString || '';
      this.afterStatusAndRoleMenuClosed();
      // this.dataSource.reset();
      // this.recordsPageIndex = 1;
      // this.tags = [];
      // this.getTableData();
    });
  }

  apply(params: string) {}

  setSelectedTemplateType(item: { key: string; value: string }) {
    if (item) {
      const index = this.selectedTemplateTypes.findIndex((d) => d.value === item.value);
      if (index >= 0) {
        this.selectedTemplateTypes.splice(index, 1);
      } else {
        this.selectedTemplateTypes.push(item);
      }
    } else {
      this.selectedTemplateTypes = [];
    }
  }
  setSelectedModifiedUser(userName: string) {
    if (userName) {
      const index = this.selectedModifiedUsers.findIndex((d) => d === userName);
      if (index >= 0) {
        this.selectedModifiedUsers.splice(index, 1);
      } else {
        this.selectedModifiedUsers.push(userName);
      }
    } else {
      this.selectedModifiedUsers = [];
    }
  }
  setSelectedCreatedUser(userName: string) {
    if (userName) {
      const index = this.selectedCreateUsers.findIndex((d) => d === userName);
      if (index >= 0) {
        this.selectedCreateUsers.splice(index, 1);
      } else {
        this.selectedCreateUsers.push(userName);
      }
    } else {
      this.selectedCreateUsers = [];
    }
  }
  isTemplateTypeChecked(item: { key: string; value: string }) {
    return this.selectedTemplateTypes.findIndex((d) => d.value === item.value) >= 0;
  }
  afterStatusAndRoleMenuClosed() {
    this.reqParam.modifiedUser = this.selectedModifiedUsers.length > 0 ? this.selectedModifiedUsers.join(',') : null;
    this.reqParam.createdUser = this.selectedCreateUsers.length > 0 ? this.selectedCreateUsers.join(',') : null;
    this.reqParam.templateType = this.selectedTemplateTypes.length > 0 ? this.selectedTemplateTypes.map((d) => d.value).join(',') : null;
    this.reqParam.templateName = this.searchString ? this.searchString : null;
    this.emitReqParam.emit(this.reqParam);
  }
  getUserList() {
    const requestDto: RoleRequestDto = {
      pageInfo: {
        pageNumer: this.userPageNumber,
        pageSize: this.userPageSize,
      },
      searchString: this.userSearch,
    };
    this.userProfileService
      .getUserInfoList(requestDto)
      .pipe(take(1))
      .subscribe(
        (resp) => {
          if (resp.acknowledge) {
            this.userList = resp.listPage.content;
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  get selectedTemplateTypeText() {
    return this.selectedTemplateTypes.map((d) => d.key).join(',');
  }
}
