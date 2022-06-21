import { CoreService } from '@services/core/core.service';
import { DatasetForm, DatasetFormRequestDto } from './../../../../../_models/list-page/listpage';
import { catchError, finalize } from 'rxjs/operators';
import { CollectionViewer } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { DataSource } from '@angular/cdk/table';

export class FormsDataSource implements DataSource<DatasetForm> {
  private formDataSubject = new BehaviorSubject<DatasetForm[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  private totalData = 0;
  hasData = false;
  public hasDataSubject = new BehaviorSubject<boolean>(false);

  constructor(private coreService: CoreService) {
  }

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
    moduleId: string,
    fetchcount: number = 0,
    fetchsize: number = 50,
    searchterm: string = '',
    dateCreated: number,
    dateModified: number,
    dto: DatasetFormRequestDto
  ) {
    this.loadingSubject.next(true);
    this.coreService
      .getDatasetFormList(moduleId, fetchcount, fetchsize, searchterm, dateCreated, dateModified, dto)
      .pipe(
        catchError((err) => {
          console.log(err);
          return of([]);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe(
        (res) => {
          if(!this.hasData) {
            this.hasData = res.length > 0;
            this.hasDataSubject.next(this.hasData);
          }
          this.formDataSubject.next(res);
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

  totalCount(): number {
    return this.totalData;
  }
}
