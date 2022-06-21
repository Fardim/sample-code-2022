import { UserProfileService } from '@services/user/user-profile.service';
import { UserInfo, RoleRequestDto } from '@models/teams';
import { debounceTime, distinctUntilChanged, take, takeUntil } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { EmailTemplateReqParam } from '@models/notif/notif.model';
import { Subject } from 'rxjs';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'pros-pdf-template-list-filters',
  templateUrl: './pdf-template-list-filters.component.html',
  styleUrls: ['./pdf-template-list-filters.component.scss']
})
export class PdfTemplateListFiltersComponent implements OnInit {
  @Input() reqParam: EmailTemplateReqParam = {
    dataSet: null,
    modifiedDate: null,
    templateName: null,
    templateType: null,
    modifiedUser: null,
    createdUser: null,
  };
  @Output() emitReqParam = new EventEmitter();

  userPageNumber = 0;
  userPageSize = 10;
  userSearch = '';
  userList: UserInfo[] = [];
  selectedModifiedUsers: string[] = [];

  searchFieldSub: Subject<string> = new Subject();
  serachUserCtrl: FormControl = new FormControl(null);
  searchString = '';
    // modified by filter
    filteredmodifybyUsers = [];
    searchModifyBySub: Subject<string> = new Subject();

    unsubscribeAll$: Subject<boolean> = new Subject<boolean>();

  constructor(private userProfileService: UserProfileService) { }

  ngOnInit(): void {
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
    });
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
            // this.userList = resp.listPage.content;
            const users = resp?.listPage?.content || [];
            users.forEach((user) => {
              user.fname = `${user.fname || ''}${(user.fname && user.lname) ? (' ' + user.lname) : ''}${!user.fname ? user.userName : ''}`;
            });
            this.userList = users;
          }
        },
        (err) => {
          console.log(err);
        }
      );
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

  afterStatusAndRoleMenuClosed() {
    this.reqParam.modifiedUser = this.selectedModifiedUsers.length > 0 ? this.selectedModifiedUsers.join(',') : null;
    this.reqParam.templateName = this.searchString ? this.searchString : null;
    this.emitReqParam.emit(this.reqParam);
  }

}
