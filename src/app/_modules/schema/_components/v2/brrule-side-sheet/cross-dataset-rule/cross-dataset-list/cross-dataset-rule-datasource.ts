import { CollectionViewer } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CrossDatasetService } from '@services/cross-dataset.service';
import { catchError, finalize } from 'rxjs/operators';

export class CrossDatasetRuleDataSource implements DataSource<any> {
  private formDataSubject = new BehaviorSubject<any[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  public totalData = new BehaviorSubject<boolean>(false);
  public hasDataSubject = new BehaviorSubject<boolean>(false);
  hasData = false;

  constructor(private crossDatasetService: CrossDatasetService) {}

  /**
   * get table data
   * @param page pageNumber 0 based
   * @param size page size
   */
  public getData(moduleId, number, size, searchString?) {
    this.loadingSubject.next(true);
    const payload = {
      ruleSourceModule: moduleId,
      number,
      size,
      ...(searchString && {queryString: searchString})
    };
    this.crossDatasetService
      .getAllCrossDatasetRuleInfo(payload)
      .pipe(
        catchError((err) => {
          console.log(err);
          return of([]);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe(
        (res: any) => {
          if (!this.hasData) {
            this.hasData = res?.content?.length > 0;
            this.hasDataSubject.next(this.hasData);
          }

          this.totalData.next(res);
          this.formDataSubject.next(res?.content);
        },
        (error) => {
          console.error(`Error : ${error.message}`);
        }
      );
  }

  filterCrossDataValue(searchValue: string,moduleId, pageNumber = 0, pageSize = 10) {
    if (searchValue) {
      const crossDatasetRuleList = this.docValue();
      const filteredList = crossDatasetRuleList.filter(rule => rule.ruleName.includes(searchValue.toLowerCase()));
      this.formDataSubject.next(filteredList);
      this.totalData.next(filteredList.length !== 0);
    } else {
      this.getData(moduleId, pageNumber, pageSize);
    }
  }

  /**
   * Return length of doc ..
   */
  docLength(): number {
    return this.formDataSubject.getValue().length;
  }

  /**
   * Return all dcument that have on this subject
   */
  docValue() {
    return this.formDataSubject.getValue();
  }

  /**
   * reset data source
   */
  reset() {
    this.formDataSubject.next([]);
  }

  connect(collectionViewer: CollectionViewer): Observable<readonly any[]> {
    return this.formDataSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.formDataSubject.complete();
    this.loadingSubject.complete();
  }
}
