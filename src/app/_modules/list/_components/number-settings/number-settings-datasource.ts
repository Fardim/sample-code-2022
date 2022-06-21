import { finalize } from 'rxjs/operators';
import { CollectionViewer } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';
import { DataSource } from '@angular/cdk/table';
import { NumberSettingSavePayload, NumberSettingsListPayload, NumberSettingsListResponse } from '@modules/transaction/model/transaction';
import { CoreCrudService } from '@services/core-crud/core-crud.service';

export class NumbeSettingsDataSource implements DataSource<NumberSettingSavePayload> {
  private formDataSubject = new BehaviorSubject<NumberSettingSavePayload[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  hasData = false;
  public hasDataSubject = new BehaviorSubject<boolean>(false);
  public totalData = new BehaviorSubject<any>(0);

  constructor(private coreCrudService: CoreCrudService) {
  }

  connect(collectionViewer?: CollectionViewer): Observable<NumberSettingSavePayload[]> {
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
  public getData(moduleId: string, payload: NumberSettingsListPayload, searchStr = '', fetchcount: number = 0, fetchsize: number = 20) {
    this.loadingSubject.next(true);
    this.coreCrudService.getAllNumberSettings(payload, moduleId, searchStr, fetchcount, fetchsize).pipe(finalize(() => this.loadingSubject.next(false))).subscribe((res: NumberSettingsListResponse) => {
      if (res && res.content.length) {
          this.hasDataSubject.next(true);
          this.formDataSubject.next(res.content);
      }
      this.totalData.next(res?.totalElements);
    }, (error) => {
        console.error(`Error : ${error.message}`);
    });
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
