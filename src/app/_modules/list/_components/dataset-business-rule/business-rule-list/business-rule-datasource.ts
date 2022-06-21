import { DatasetForm } from './../../../../../_models/list-page/listpage';
import { CollectionViewer } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { DataSource } from '@angular/cdk/table';
import { CoreService } from '@services/core/core.service';
import { catchError, finalize } from 'rxjs/operators';
export class BusinessRuleDataSource implements DataSource<DatasetForm> {
  private formDataSubject = new BehaviorSubject<DatasetForm[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  public totalData = new BehaviorSubject<boolean>(false);
  hasData = false;
  public hasDataSubject = new BehaviorSubject<boolean>(false);

  constructor(private coreService: CoreService) {}

  connect(collectionViewer?: CollectionViewer): Observable<DatasetForm[]> {
    return this.formDataSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.formDataSubject.complete();
    this.loadingSubject.complete();
  }

  /**
   * get table data
   * @param page pageNumber 0 based
   * @param size page size
   */
  public getData(
    fetchcount: number = 0,
    fetchsize: number = 50,
    dto = {}
  ) {
    this.loadingSubject.next(true);

    this.coreService
      .getDatasetBusinessRuleList(fetchcount, fetchsize, dto)
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
}
