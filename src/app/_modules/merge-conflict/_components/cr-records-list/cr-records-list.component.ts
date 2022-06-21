import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { ConflictedRecord } from '@models/merge-conflict/mergeConflictModel';
import { MergeConflictService } from '@services/merge-conflict/merge-conflict.service';
import { TransientService } from 'mdo-ui-library';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'pros-cr-records-list',
  templateUrl: './cr-records-list.component.html',
  styleUrls: ['./cr-records-list.component.scss']
})
export class CrRecordsListComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  massId: string;

  @Input()
  parentCrId: string;

  @Output()
  selectedRecord: EventEmitter<string> = new EventEmitter();

  recordsList: ConflictedRecord[];

  activeRecord: string;
  subscriptions: Subscription[] = [];
  searchSub: Subject<string> = new Subject();
  searchString = '';
  pageSize = 20;
  pageNo = 0;
  isPageReload = false;


  constructor(private conflictService: MergeConflictService,
      private transientService: TransientService) { }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.massId && changes.massId.currentValue !== changes.massId.previousValue) {
      this.isPageReload = true;
      this.massId = changes.massId.currentValue;
        this.getRecordsList();
    }
  }

  ngOnInit() {
    this.searchSub.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(searchString => {
      this.searchString = searchString;
        this.getRecordsList();
    });
  }

  getRecordsList(loadMore?) {
    if(loadMore) {
      this.pageNo++;
    } else {
      this.pageNo = 0;
    }
    const sub = this.conflictService.getConflictedRecordsList(this.massId, this.parentCrId || '', this.pageNo, this.pageSize, this.searchString)
      .subscribe(resp => {
        if(resp && resp.length) {
          if(loadMore) {
            this.recordsList = this.recordsList.concat(resp);
          } else {
            this.recordsList = resp;
            if(this.isPageReload) {
              const firstCr = this.recordsList[0].crId;
              this.selectionChange(firstCr);
            }
          }
        } else if(loadMore) {
          this.pageNo--;
        } else if(this.searchString) {
          this.transientService.open('No conflicting records found for the specified search criteria', null, { duration: 2000, verticalPosition: 'bottom' });
          this.recordsList = resp || [];
        } else {
          this.transientService.open('No conflicts found for the change request', null, { duration: 2000, verticalPosition: 'bottom' });
        }
        this.isPageReload = false;
      }, error => {
        console.error(`Error:: ${error.message}`);
      });
    this.subscriptions.push(sub);
  }


  selectionChange(crId: string) {
    if(this.activeRecord !== crId) {
      this.activeRecord = crId;
      this.selectedRecord.emit(crId);
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}

/* const dummyData = [
  {
    crId: 'CR_908955489209874264',
    rec_num: 'HERS001978',
    count: 5
  },
  {
    crId: 'CR_450431555540746465',
    rec_num: 'HERS001979',
    count: 3,
    childs: [
      {
        crId: 'CR_450431555540746466',
        rec_num: 'HERS001980',
        count: 10
      }
    ]
  }
] */
