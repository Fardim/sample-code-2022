import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { CatalogCheckService } from '@services/home/schema/catalog-check.service';
import { GroupDetails, RequestForGroupList, SearchAfter, TableDataSource } from '@models/schema/duplicacy';
import { BehaviorSubject, Subscription } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { Userdetails } from '@models/userdetails';
import { UserService } from '@services/user/userservice.service';
import { FilterCriteria } from '@models/schema/schemadetailstable';


@Component({
  selector: 'pros-group-data-table',
  templateUrl: './group-data-table.component.html',
  styleUrls: ['./group-data-table.component.scss']
})
export class GroupDataTableComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {

  @Input()
  moduleId: string;

  @Input()
  schemaId: string;

  @Input()
  variantId: string;

  @Input()
  runId: string;

  @Input()
  activeTab: string;

  @Input()
  filterCriteria: BehaviorSubject<FilterCriteria[]>;

  @Output()
  groupChange: EventEmitter<any> = new EventEmitter();

  @ViewChild(MatSort) matSort: MatSort;

  sortOrder: any = {};


  dataSource = new TableDataSource<GroupDetails>();
  totalCount: number;
  startColumns = ['groupName'];
  displayedFields = new BehaviorSubject<string[]>(this.startColumns);
  fieldsMetadataList: any;

  BLANK_GROUP = {groupId: '', groupKey: ''} ;

  /**
   * Make table header row visiable
   */
  tableHeaderActBtn : string[] = [];

  selection = new SelectionModel<any>(true, []);

  lastScrollTop: number;

  activeGroupId: string;

  /**
   * hold scroll limit reached edge
   */
   scrollLimitReached = false;

   apiState = null;

  /**
   * data fetch page index
   */
  pageIndex = 0;
  searchAfter : SearchAfter  = new SearchAfter();
  userDetails: Userdetails = new Userdetails();
  subscriptions: Array<Subscription> = [];
  constructor(private catalogService: CatalogCheckService,
    private userService: UserService) { }

  ngOnChanges(changes: SimpleChanges): void {

    let refresh = false;
    if (changes && changes.schemaId && changes.schemaId.previousValue !== changes.schemaId.currentValue) {
      refresh = true;
    }

    /* if (changes && changes.variantId && changes.variantId.previousValue !== changes.variantId.currentValue) {
      refresh = true;
    } */

    if (changes && changes.activeTab && changes.activeTab.previousValue !== changes.activeTab.currentValue) {
      refresh = true;
    }

    if (refresh) {
      this.getDuplicacyGroupsList();
    }


  }

  ngOnInit(): void {

    /**
     * While row selection change then control the header actions..
     */
    this.selection.changed.subscribe(res=>{
      if(res.source.selected.length >0) {
        this.tableHeaderActBtn = ['common_actions_header'];
      } else {
        this.tableHeaderActBtn = [];
      }
    });

    this.subscriptions.push(
      this.catalogService.getRefreshGroupList().subscribe(() => {
        this.getDuplicacyGroupsList(false, true);
      })
    )
    this.userService.getUserDetails().subscribe(res => {
      this.userDetails = res;
    }, error => console.error(`Error : ${error.message}`));

    this.filterCriteria.subscribe(res => {
      if (res !== null) {
        this.getDuplicacyGroupsList();
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(x => x.unsubscribe());
  }

  ngAfterViewInit(){

    this.matSort?.sortChange.subscribe(s => {

      this.sortOrder = {};
      if (s.direction) {
        this.sortOrder[s.active] = s.direction;
      }

      this.getDuplicacyGroupsList();
    });

  }


  getDuplicacyGroupsList(isLoadingMore = false, skipSelectionChange = false){

    if (isLoadingMore) {
      if(this.searchAfter) {
        this.pageIndex++;
      } else {
        return;
      }
      this.apiState = 'inp';
    } else {
      this.pageIndex = 0;
      this.searchAfter = new SearchAfter();
    }

    const request = new RequestForGroupList();
    request.schemaId = this.schemaId;
    request.plantCode = '0';
    request.runId = this.runId || '';
    request.page = this.pageIndex;
    request.size = isLoadingMore ? 20 : 40;
    request.responseStatus = this.activeTab;
    request.searchAfter =this.searchAfter;
    request.filterCriteria = this.filterCriteria.getValue() || [];
    this.catalogService.getAllGroupIds(request)
      .subscribe(groups => {
        if (isLoadingMore) {
          this.dataSource.data = this.dataSource.data.concat(groups.groups);
          this.apiState = 'done';
        }
        else {
          this.dataSource.data = groups.groups;
          this.dataSource.totalCount = groups.groups.length;
          const firstRow = this.dataSource.data[0] ? this.dataSource.data[0] : this.BLANK_GROUP ;
          const selectedGroupExists = this.dataSource.data.find(row => row.groupId === this.activeGroupId);
          if(!skipSelectionChange || !selectedGroupExists) {
            this.rowGroupClicked(firstRow);
          }
        }
        this.searchAfter = groups.searchAfter;
        console.log('Duplicacy groups list ',groups.groups);
      }, error => {

        if (!isLoadingMore) {
        this.dataSource.data = [];
        this.dataSource.totalCount = 0;
        this.rowGroupClicked(this.BLANK_GROUP);
        } else {
          this.apiState = 'done';
        }
        console.error(`Error ${error.message}`);

      });
  }


  rowGroupClicked(row) {
    console.log('Group change event triggered', row);
    this.activeGroupId = row.groupId;
    this.groupChange.emit(row);

  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  onScroll(e){
    console.log('colled');
    const tableViewHeight = e.target.offsetHeight // viewport: ~500px
    const tableScrollHeight = e.target.scrollHeight // length of all table
    const scrollLocation = e.target.scrollTop; // how far user scrolled

    // If the user has scrolled within 200px of the bottom, add more data
    const buffer = 200;
    const limit = tableScrollHeight - tableViewHeight - buffer;
    if (scrollLocation > limit) {
      if (!this.scrollLimitReached) {
        console.log('Load more data here ...');
        this.scrollLimitReached = true;
        this.getDuplicacyGroupsList(true);
      }
    } else {
      this.scrollLimitReached = false;
    }
  }

}
