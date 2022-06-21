import { EmailTemplateReqParam, TemplateModel, TemplateTypeOptions, TemplateModelResponse } from '@models/notif/notif.model';
import { CollectionViewer } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { DataSource } from '@angular/cdk/table';
import { catchError, finalize } from 'rxjs/operators';
import { Inject, LOCALE_ID } from '@angular/core';
import { NotifService } from '@services/notif/notif.service';

export class EmailTemplateDataSource implements DataSource<TemplateModel> {
  private emailTemplateDataSubject = new BehaviorSubject<TemplateModel[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  private totalCountSubject = new BehaviorSubject<number>(0);
  totalCount$ = this.totalCountSubject.asObservable();
  private totalData = 0;
  templateTypeOptions = TemplateTypeOptions;

  constructor(private notifService: NotifService, @Inject(LOCALE_ID) public locale: string) {}

  connect(collectionViewer?: CollectionViewer): Observable<any[]> {
    return this.emailTemplateDataSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.emailTemplateDataSubject.complete();
    this.loadingSubject.complete();
  }

  public getData(offset: number, limit: number, reqParam?: EmailTemplateReqParam) {
    this.loadingSubject.next(true);
    this.notifService
      .getTemplate(offset, limit, reqParam)
      .pipe(
        catchError((err) => {
          console.log(err);
          const emptyResponse = new TemplateModelResponse();
          return of(emptyResponse);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe(
        (res: TemplateModelResponse) => {
          this.emailTemplateDataSubject.next(this.docsTransformation(res));
          this.totalCountSubject.next(res.totalCount);
        },
        (error) => {
          console.error(`Error : ${error.message}`);
        }
      );
  }

  docsTransformation(res: TemplateModelResponse): TemplateModel[] {
    if (res && res.templateModels && res.templateModels.length) {
      const models = res.templateModels.map((d) => {
        return {
          ...d,
          templateType: this.findTemplateTypeKey(d.templateType),
        };
      });
      return models || [];
    } else {
      return this.docValue();
    }
  }

  findTemplateTypeKey(templateType: string) {
    if (templateType) {
      const tempType = this.templateTypeOptions.find((d) => d.value === templateType);
      return tempType?.key;
    }
    return '';
  }
  /**
   * Return length of doc ..
   */
  docLength(): number {
    return this.emailTemplateDataSubject.getValue().length;
  }

  /**
   * Return all dcument that have on this subject
   */
  docValue() {
    return this.emailTemplateDataSubject.getValue();
  }

  /**
   * reset data source
   */
  reset() {
    this.emailTemplateDataSubject.next([]);
  }

  totalCount(): number {
    return this.totalData;
  }
}
