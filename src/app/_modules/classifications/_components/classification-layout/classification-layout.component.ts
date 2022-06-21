import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ClassificationLayoutService } from '@modules/classifications/_services/classification-layout.service';
import { CoreService } from '@services/core/core.service';
import { Subject, throwError } from 'rxjs';
import { catchError, debounceTime, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'pros-classification-layout',
  templateUrl: './classification-layout.component.html',
  styleUrls: ['./classification-layout.component.scss']
})
export class ClassificationLayoutComponent implements OnInit, OnDestroy {
  classId = '';
  classTypeId = '';
  searchString = '';
  showSkeleton = true;
  page = 0;
  subscriptionEnabled = true;
  moduleList = [];
  searchSub = new Subject<string>();
  selectedDataSet = { moduleId: '', moduleDesc: 'All' };

  @ViewChild(CdkVirtualScrollViewport) virtualScroll: CdkVirtualScrollViewport;

  onScroll(event) {
    if (event) {
      const viewPortHeight = event.target.offsetHeight; // height of the complete viewport
      const scrollFromTop = event.target.scrollTop;     // height till user has scrolled
      const sideSheetHeight = event.target.scrollHeight; // complete scrollable height of the side sheet document

      const limit = sideSheetHeight - scrollFromTop;
      if (limit === viewPortHeight) {
        this.page++;
        this.getRelatedDatasets('');
      }
    }
  }

  constructor(
    private coreService: CoreService,
    private cdr: ChangeDetectorRef,
    private classificationLayoutService:ClassificationLayoutService,
  ) { }

  ngOnInit(): void {
    this.classificationLayoutService.skeletonLoader.next(true);
    this.searchSub.pipe(debounceTime(1000)).subscribe((searchText) => {
      this.searchString = searchText;
      this.moduleList = [];
      this.getRelatedDatasets(searchText);
    });
    this.getRelatedDatasets(this.searchString);
    this.classificationLayoutService.skeletonLoader$.subscribe((loading)=>{
      this.showSkeleton = loading;
    })
  }

  getRelatedDatasets(filterString) {
    this.coreService.getDataSets(filterString, this.page, 10).pipe(takeWhile(() => this.subscriptionEnabled),
      catchError((error: HttpErrorResponse) => {
        this.classificationLayoutService.skeletonLoader.next(false);
        return throwError(error);
      }))
      .subscribe(res => {
        this.classificationLayoutService.skeletonLoader.next(false);
        this.moduleList.push(...res);
      });
  }

  onDatasetSelect(module){
    this.selectedDataSet = module;
    this.cdr.detectChanges();
  }

  selectedNode(node) {
    if (node) {
      if (node.level) {
        this.classId = node?.uuid;
        this.classTypeId = '';
      }
      else {
        this.classTypeId = node?.uuid;
        this.classId = '';
      }
    } else {
      this.classId = ''
      this.classTypeId = '';
    }
  }

  ngOnDestroy(): void {
    this.subscriptionEnabled = false;
  }
}
