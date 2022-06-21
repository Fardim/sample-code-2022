import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ClassType } from '@modules/classifications/_models/classifications';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { RuleService } from '@services/rule/rule.service';
import { Subject } from 'rxjs';
import { debounceTime, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'pros-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent implements OnInit, OnDestroy {

  options = [
    { label: 'New class type', value: 'NEW_CLASS_TYPE' },
    { label: 'New class', value: 'NEW_CLASS' }
  ];

  data = [];
  subscriptionEnabled = true;
  searchSub = new Subject<string>();
  searchString = '';
  page = 1;
  reload = false;
  @ViewChild(CdkVirtualScrollViewport) virtualScroll: CdkVirtualScrollViewport;

  constructor(
    private router: Router,
    private sharedService: SharedServiceService,
    private ruleService: RuleService
  ) { }

  ngOnDestroy(): void {
    this.subscriptionEnabled = false;
  }

  ngOnInit(): void {
    this.loadData(false);

    this.sharedService.ofType<ClassType>('CLASS_TYPE/CREATED').pipe(takeWhile(() => this.subscriptionEnabled))
      .subscribe((data) => {
        this.filterData();
      });

    this.sharedService.ofType<ClassType>('CLASS_TYPE/UPDATED').pipe(takeWhile(() => this.subscriptionEnabled))
      .subscribe((data) => {
        this.filterData();
      });

    this.sharedService.ofType<ClassType>('ALL_CLASSES/DELETED').pipe(takeWhile(() => this.subscriptionEnabled))
      .subscribe((data) => {
        this.filterData();
      });

    this.searchSub.pipe(debounceTime(700), takeWhile(() => this.subscriptionEnabled)).subscribe((searchText) => {
      this.searchString = searchText;
      this.filterData();
    });
  }

  filterData() {
    this.reload = true;
    this.data = [];
    this.page = 1;
    this.loadData(true);
    this.reload= false;
  }

  openDialog(value, classType) {
    if (value === 'NEW_CLASS_TYPE') {
      this.router.navigate(['', {
        outlets: {
          sb: `sb/settings/classifications`,
          outer: `outer/classifications/class-types/new`
        },
      }]);
    }
    else if (value === 'NEW_CLASS') {
      this.router.navigate([{
        outlets: {
          sb: `sb/settings/classifications`,
          outer: `outer/classifications/classes/new`
        }
      }], { state: { classType }});
    }
  }

  redirectToMapDimension(){
    this.router.navigate([{
      outlets: {
        sb: `sb/settings/classifications`,
        outer: `outer/classifications/dimensions`
      }
    }]);
  }

  loadData(reload: boolean) {
    this.reload = reload;
    this.ruleService.getAllClassTypes(this.page, 50, this.searchString, []).pipe(takeWhile(() => this.subscriptionEnabled)).subscribe((data) => {
      if (data?.response?.length > 0) {
        data.response.filter((item: ClassType) => !item.enableSync).forEach((item: ClassType) => this.data.push(item));
      }
    })
  }

  onScroll(event) {
    if (event && !this.reload) {
      const viewPortHeight = event.target.offsetHeight; // height of the complete viewport
      const scrollFromTop = event.target.scrollTop;     // height till user has scrolled
      const sideSheetHeight = event.target.scrollHeight; // complete scrollable height of the side sheet document

      const limit = sideSheetHeight - scrollFromTop;
      if (limit === viewPortHeight) {
        this.page++;
        this.loadData(false);
      }
    }
  }


}
