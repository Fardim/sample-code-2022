import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ObjectType } from '@models/core/coreModel';
import { DatasetForm, DatasetFormRequestDto, FormTypes } from '@models/list-page/listpage';
import { CoreService } from '@services/core/core.service';
import { TransientService } from 'mdo-ui-library';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, take, takeUntil } from 'rxjs/operators';
import { RoleRequestDto, UserInfo, UserType } from './../../../../../_models/teams';
import { UserProfileService } from './../../../../../_services/user/user-profile.service';
import { MultiSortDirective } from './../../../../shared/_pros-multi-sort/multi-sort.directive';
import { FormsDataSource } from './forms-datasource';

@Component({
  selector: 'pros-form-list',
  templateUrl: './form-list.component.html',
  styleUrls: ['./form-list.component.scss'],
})
export class FormListComponent implements OnInit {
  formListHasData = false;
  formTypes = FormTypes;
  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();
  /**
   * Hold current module details
   */
  objectType: ObjectType = { objectdesc: '', objectInfo: '', objectid: 0 };
  /**
   * moduleId from param
   */
  moduleId = '';
  /**
   * forms search by string
   */
  searchFieldSub: Subject<string> = new Subject();
  /**
   * modifyby search by string
   */
  searchModifyBySub: Subject<string> = new Subject();
  /**
   * createdby search by string
   */
  searchCreatedBySub: Subject<string> = new Subject();
  /**
   * if on scroll down fetching fieldIds, then there should be another api call to get fieldIds. Used this flag to identify if a fetch is going on right now
   */
  infinteScrollLoading = false;
  /**
   * if on scroll down modifyby users, then there should be another api call to get modifyby users. Used this flag to identify if a fetch is going on right now
   */
  modifybyInfinteScrollLoading = false;
  /**
   * if on scroll down fetching createdby users, then there should be another api call to get createdby users. Used this flag to identify if a fetch is going on right now
   */
  createdbyInfinteScrollLoading = false;
  /**
   * if getListFieldIdByStructure returns no fieldid then there is no more fieldIds. So, hasMoreData = false
   */
  hasMoreData = true;
  /**
   * fieldList pagination for scroll down
   */
  recordsPageIndex = 1;
  /**
   * fieldList pagination size
   */
  recordsPageSize = 50;
  totalCount = 0;

  displayedColumns: string[] = ['action','description', 'type', 'labels', 'dateModified', 'userModified'];
  staticColumns: string[] = ['select'];
  columns = formColumns;
  /**
   * material table datasource
   */
  dataSource: FormsDataSource = undefined;
  /**
   * selected rows from the table
   */
  selection = new SelectionModel<DatasetForm>(true, []);
  /**
   * show skeleton on initial load
   */
  showSkeleton = true;
  /**
   * modifyby search string
   */
  modifybySearchString = '';
  /**
   * modifyby filter pageindex
   */
  modifybyPageIndex = 1;
  /**
   * createdby search string
   */
  createdbySearchString = '';
  /**
   * createdby filter pageindex
   */
  createdbyPageIndex = 1;
  pageSize = 10;

  modifybyUsers: UserInfo[] = [];
  filteredmodifybyUsers: UserInfo[] = [];

  createdbyUsers: UserInfo[] = [];
  filteredcreatedbyUsers: UserInfo[] = [];

  /**
   * filter models
   */
  searchString = '';
  dateCreated = 0;
  dateModified = 0;
  selectedTypes: string[] = [];
  selectedModifyby: string[] = [];
  selectedCreatedby: string[] = [];

  /**
   * Keep all the loading states in one place
   */
  dataLoaders = {
    loadTable: false,
    hasFilteredData: false
  }

  /**
   * It is necessary for multi-sort table
   * https://www.npmjs.com/package/ngx-mat-multi-sort
   */
  // table: TableData<TeamMember>;
  @ViewChild(MultiSortDirective, { static: false }) multiSort: MultiSortDirective;

  constructor(
    public readonly route: ActivatedRoute,
    private router: Router,
    private coreService: CoreService,
    private transientService: TransientService,
    private userProfileService: UserProfileService,
    @Inject(LOCALE_ID) public locale: string,
    private transService: TransientService
  ) {
    this.dataSource = new FormsDataSource(coreService);
  }

  ngOnInit(): void {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    this.route.params.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp) => {
      this.showSkeleton = true;
      this.moduleId = resp.moduleId;
      this.getObjectTypeDetails();
      this.dataSource.reset();
      this.getTotalFormsCount();
      this.getTableData();
      this.getUsers(UserType.All);
    });

    this.route.queryParams.pipe(takeUntil(this.unsubscribeAll$)).subscribe((params) => {
      if(params?.reloadFormList) {
        this.dataSource.reset();
        this.getTableData();
      }
    })

    this.dataSource.loading$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp) => {
      this.dataLoaders.loadTable = resp;
      if (!resp) {
        this.infinteScrollLoading = false;
        this.showSkeleton = false;
      }
    });

    this.searchFieldSub.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString) => {
      this.searchString = searchString;
      this.dataSource.reset();
      this.recordsPageIndex = 1;
      this.getTableData();
    });

    this.searchModifyBySub.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString) => {
      this.modifybySearchString = searchString;
      this.modifybyPageIndex = 1;
      this.modifybyUsers = [];
      this.filteredmodifybyUsers = [];
      this.getUsers(UserType.Modify);
    });

    this.searchCreatedBySub.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString) => {
      this.createdbySearchString = searchString;
      this.createdbyPageIndex = 1;
      this.createdbyUsers = [];
      this.filteredcreatedbyUsers = [];
      this.getUsers(UserType.Created);
    });

    this.dataSource.hasDataSubject.pipe(takeUntil(this.unsubscribeAll$)).subscribe(resp => {
      if (resp) {
        this.formListHasData = true;
      }
    });

    this.dataSource.connect().subscribe((resp) => {
      this.dataLoaders.hasFilteredData = !!resp?.length;
    });
  }

  /**
   * Whether the table should be visible
   */
  public get showTableView(): boolean {
    return this.dataLoaders.loadTable ||
      (!this.dataLoaders.hasFilteredData && !this.dataLoaders.loadTable) ||
      this.showSkeleton;
  }

  /**
   * call through datasource to get the teammembers by pagination, sort, search, role or stats filter
   */
  getTableData() {
    const dto: DatasetFormRequestDto = {
      type: this.formTypes.filter((d) => this.selectedTypes.indexOf(d.name) >= 0).map((d) => +d.id),
      userCreated: this.selectedCreatedby,
      userModified: this.selectedModifyby,
    };
    this.dataSource.getData(
      this.moduleId,
      this.recordsPageIndex - 1,
      this.recordsPageSize,
      this.searchString,
      this.dateCreated,
      this.dateModified,
      dto
    );
  }

  getTotalFormsCount() {
    this.coreService.getFormsCount(this.moduleId).pipe(take(1)).subscribe(resp => {
      this.totalCount = resp.count;
    });
  }
  /**
   * get current module details
   */
  getObjectTypeDetails() {
    this.coreService
      .getObjectTypeDetails(this.moduleId, this.locale)
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          this.objectType.objectid = response.moduleid;
          this.objectType.objectdesc = response.description;
          this.objectType.objectInfo = response?.information[this.locale]
        },
        (error) => {
          console.error(`Error : ${error.message}`);
        }
      );
  }
  setLoading(element: string, state: boolean) {
    if (element === UserType.Modify || element === UserType.All) {
      this.modifybyInfinteScrollLoading = state;
    }
    if (element !== UserType.Modify) {
      this.createdbyInfinteScrollLoading = state;
    }
  }
  getUsers(element: any) {
    const requestDto: RoleRequestDto = {
      pageInfo: {
        pageNumer: element === UserType.Modify ? this.modifybyPageIndex - 1 : element === UserType.Created ? this.createdbyPageIndex - 1 : 0,
        pageSize: this.pageSize,
      },
      searchString: element === UserType.Modify ? this.modifybySearchString : element === UserType.Created ? this.createdbySearchString : '',
    };
    this.setLoading(element, true);
    this.userProfileService.getUserInfoList(requestDto).pipe(take(1)).subscribe(resp => {
      this.setLoading(element, false);
      this.setUserData(element, resp);

    }, err => {
      console.log(err);
      this.setLoading(element, false);
    });
  }

  setUserData(element: any, data: any) {
    if (element === UserType.Modify || element === UserType.All) {
      this.modifybyUsers.push(...data.listPage.content);
      this.filteredmodifybyUsers.push(...data.listPage.content.slice());
    }
    if (element !== UserType.Modify) {
      this.createdbyUsers.push(...data.listPage.content);
      this.filteredcreatedbyUsers.push(...data.listPage.content.slice());
    }
  }

  /**
   * choose a form to edit and open the editing form in a sidesheet
   * @param type form type object
   */
  formTypeSelected(type: { id: string; name: string }) {
    const navigationExtras: NavigationExtras = {
      queryParams: { t: type.id },
      fragment: 'property-panel',
      queryParamsHandling: 'merge',
    };

    this.router.navigate([
      '',
      {
        outlets: {
          sb: `sb/list/dataset-settings/${this.moduleId}/forms/${this.moduleId}`,
          outer: `outer/list/edit-dataset-form/${this.moduleId}/new`,
        },
      },
    ], navigationExtras);
  }

  /**
   * find the label of the field of the table column
   * @param dynCol table column
   * @returns string
   */
  getLabel(dynCol) {
    return this.columns.find((d) => d.id === dynCol).name;
  }

  getTypeName(type: string) {
    return this.formTypes.find(d => d.id === type) ? this.formTypes.find(d => d.id === type).name : '';
  }

  modifydateChanged(event) {
    this.dateModified = +new Date(event);
    this.dataSource.reset();
    this.recordsPageIndex = 1;
    this.getTableData();
  }
  createdateChanged(event) {
    this.dateCreated = +new Date(event);
    this.dataSource.reset();
    this.recordsPageIndex = 1;
    this.getTableData();
  }

  modifybyScrollEnd() {
    if (!this.modifybyInfinteScrollLoading) {
      this.modifybyPageIndex++;
      this.getUsers(UserType.Modify);
    } else {
      return null;
    }
  }

  createdbyScrollEnd() {
    if (!this.createdbyInfinteScrollLoading) {
      this.createdbyPageIndex++;
      this.getUsers(UserType.Created);
    } else {
      return null;
    }
  }

  setSelectedFormType(type: { id: string; name: string }) {
    if (type) {
      const index = this.selectedTypes.findIndex((d) => d === type.name);
      if (index >= 0) {
        this.selectedTypes.splice(index, 1);
      } else {
        this.selectedTypes.push(type.name);
      }
    } else {
      this.selectedTypes = [];
    }
  }
  setSelectedModifyby(user: any) {
    if (user) {
      const index = this.selectedModifyby.findIndex((d) => d === user.userName);
      if (index >= 0) {
        this.selectedModifyby.splice(index, 1);
      } else {
        this.selectedModifyby.push(user.userName);
      }
    } else {
      this.selectedModifyby = [];
    }
  }
  setSelectedCreatedby(user: any) {
    if (user) {
      const index = this.selectedCreatedby.findIndex((d) => d === user.userName);
      if (index >= 0) {
        this.selectedCreatedby.splice(index, 1);
      } else {
        this.selectedCreatedby.push(user.userName);
      }
    } else {
      this.selectedCreatedby = [];
    }
  }

  afterFilterMenuClosed() {
    this.dataSource.reset();
    this.recordsPageIndex = 1;
    this.getTableData();
  }

  /**
   * get page records
   */
  onPageChange(event: PageEvent) {
    if (this.recordsPageIndex !== event.pageIndex) {
      this.recordsPageIndex = event.pageIndex;
      this.getTableData();
    }
  }

  duplicate(element: DatasetForm) {
    this.coreService.duplicateForm(this.moduleId, element.layoutId).pipe(take(1)).subscribe(resp => {
      this.transService.open('Duplicated successfully', null, { duration: 3000 });
      this.coreService.nextUpdateFormCount(true);
      this.getTotalFormsCount();
      this.getTableData();
    }, err=>{
      console.log(`Something went wrong!!`);
      this.transService.open(`${err?.error?.message || 'Something went wrong'}`, null, { duration: 3000 });
    });
  }
  deleteLayout(layoutId: string) {
    this.coreService.deleteLayout(layoutId).pipe(take(1)).subscribe(resp => {
      if (resp && resp.acknowledge) {
        this.transService.open('Deleted successfully', null, { duration: 3000 });
        this.coreService.nextUpdateFormCount(true);
        this.getTotalFormsCount();
        this.getTableData();
      }
    });
  }

  delete(layoutId: string) {
    this.transientService.confirm(
      {
        data: { dialogTitle: 'Confirmation', label: 'Selected form will be deleted. Do you want to continue?' },
        disableClose: true,
        autoFocus: false,
        width: '600px',
        panelClass: 'create-master-panel',
      },
      (response) => {
        if (response && response === 'yes') {
          this.deleteLayout(layoutId);
        } else {
          // do not delete form
        }
      }
    );
  }

  /**
   * Go to the edit page to modify Form Properties and its sections
   * @param element pass the selected element to edit
   */
  gotoEditPage(element) {
    const navigationExtras: NavigationExtras = {
      queryParams: { t: element.type },
      fragment: 'property-panel',
      queryParamsHandling: 'preserve',
    };
    this.router.navigate([
      '',
      {
        outlets: {
          sb: `sb/list/dataset-settings/${this.moduleId}/forms/${this.moduleId}`,
          outer: `outer/list/edit-dataset-form/${this.moduleId}/${element.layoutId}`,
        },
      },
    ], navigationExtras);
  }

  openSideSheet(element) {
    if (this.moduleId) {
      this.router.navigate([
        '',
        {
          outlets: {
            sb: `sb/list/dataset-settings/${this.moduleId}/forms/${this.moduleId}`,
            outer: `outer/list/applicable-sidesheet/${this.moduleId}/${element.layoutId}`,
          },
        },
      ]);
    } else {
      console.error('Invalid Module ID');
    }
  }

  // display page records range
  get displayedRecordsRange(): string {
    const endRecord =
      this.recordsPageIndex * this.recordsPageSize < this.totalCount ? this.recordsPageIndex * this.recordsPageSize : this.totalCount;
    return this.totalCount ? `${(this.recordsPageIndex - 1) * this.recordsPageSize + 1} to ${endRecord} of ${this.totalCount}` : '';
  }
}

export const formColumns = [
  {
    id: 'description',
    name: $localize`:@@form:Form`,
  },
  {
    id: 'type',
    name: $localize`:@@type:Type`,
  },
  {
    id: 'labels',
    name: $localize`:@@labels:Labels`,
  },
  {
    id: 'dateModified',
    name: $localize`:@@last_modified:Last Modified`,
  },
  {
    id: 'userModified',
    name: $localize`:@@last_modified_by:Last Modified by`,
  },
  {
    id: 'action',
    name: $localize`:@@action:Action`,
  },
];
