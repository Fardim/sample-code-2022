import { finalize } from 'rxjs/operators';
import { CollectionViewer } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';
import { DataSource } from '@angular/cdk/table';
import { NotifService } from '@services/notif/notif.service';

export class PDFTemplateDataSource implements DataSource<any> {
  private formDataSubject = new BehaviorSubject<any[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  hasData = false;
  public hasDataSubject = new BehaviorSubject<boolean>(false);
  public totalData = new BehaviorSubject<any>(0);

  constructor(private notifService: NotifService) {
  }

  connect(collectionViewer?: CollectionViewer): Observable<any[]> {
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
  public getData(moduleId: string, payload: any, fetchcount: number = 0, fetchsize: number = 20) {
    this.loadingSubject.next(true);
    // this.transService.getAllNumberSettings(payload, moduleId, searchStr, fetchcount, fetchsize).pipe(finalize(() => this.loadingSubject.next(false))).subscribe((res: NumberSettingsListResponse) => {
    //   if (res && res.content.length) {
    //       this.hasDataSubject.next(true);
    //       this.formDataSubject.next(res.content);
    //   }
    //   this.totalData.next(res?.totalElements);
    // }, (error) => {
    //     console.error(`Error : ${error.message}`);
    // });
    this.hasDataSubject.next(false);
    this.formDataSubject.next([]);
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
