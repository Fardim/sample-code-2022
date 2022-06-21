import { TaskListService } from './../../../../_services/task-list.service';
import { CollectionViewer } from '@angular/cdk/collections';

import { BehaviorSubject, Observable } from 'rxjs';
import { TaskListData, TaskListDataResponse } from './../../../../_models/task-list/tasklistData';
import { DataSource } from '@angular/cdk/table';
import { finalize } from 'rxjs/operators';

export class TaskListDataSource implements DataSource<TaskListData> {
  private tasklistDataSubject = new BehaviorSubject<TaskListData[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public $loading = this.loadingSubject.asObservable();
  private totalData = 0;

  constructor(private taskListService: TaskListService) {}

  connect(collectionViewer: CollectionViewer): Observable<TaskListData[]> {
    return this.tasklistDataSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.tasklistDataSubject.complete();
    this.loadingSubject.complete();
  }

  /**
   * get table data
   * @param nodeId inbox, draft, rejected etc
   * @param lang en, de, es, fr etc
   * @param size page size
   * @param searchAfter doc id -- not clear yet
   * @param bodyRequest filter details
   */
  public getData(nodeId, lang, size, searchAfter, bodyRequest, fromCnt = 0) {
    this.loadingSubject.next(true);
    this.taskListService.getTaskListData(nodeId, lang, size, searchAfter, bodyRequest, fromCnt)
    .pipe(finalize(() => this.loadingSubject.next(false))).subscribe((res) => {
      this.tasklistDataSubject.next(this.docsTransformation(res));
    }, (error) => {
      this.loadingSubject.next(false);
      console.error(`Error : ${error.message}`);
    });
  }

  docsTransformation(res: TaskListDataResponse): TaskListData[] {
    if (res && res._doc) {
      this.totalData = res.total;
      const finalResonse = []
      res._doc.forEach(doc => {
        const rowData: any = {};

        Object.keys(doc).forEach(col => {
            const cell = doc[col];
            if (col === 'wfvs') {
              const wfvl = doc[col][0].wfvl ? doc[col][0].wfvl : {};
              for(const hdfld in wfvl ) {
                if(wfvl.hasOwnProperty(hdfld)) {
                  rowData[hdfld] = wfvl[hdfld].vc[0].c;
                }
              }
            } else if (col === 'staticFields') {
              for(const val in cell ) {
                if(cell.hasOwnProperty(val)) {
                  if(!rowData.staticFieldsVal) {
                    rowData.staticFieldsVal = {};
                  }
                  if(val === 'USERCREATED') rowData[val] = cell[val].vc[0].c;
                  rowData.staticFieldsVal[val] = cell[val].vc[0].c;
                }
              }
            }
            rowData[col] = cell;
        });
        finalResonse.push(rowData);

    });
      // const existing = this.docValue();
      // existing.push(...finalResonse);
      return finalResonse;
    } else {
      return this.docValue();
    }
  }

  /**
   * Return length of doc ..
   */
  docLength(): number {
    return this.tasklistDataSubject.getValue().length;
  }

  /**
   * Return all dcument that have on this subject
   */
  docValue() {
    return this.tasklistDataSubject.getValue();
  }

  /**
   * reset data source
   */
  reset() {
    this.tasklistDataSubject.next([]);
  }

  totalCount(): number {
    return this.totalData;
  }
}
