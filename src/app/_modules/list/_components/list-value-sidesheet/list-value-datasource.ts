import { CollectionViewer } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';
import { DataSource } from '@angular/cdk/table';
import { CoreService } from '@services/core/core.service';
import { take } from 'rxjs/operators';
import { ListValueResponse } from '@models/list-page/listpage';
import { Inject, LOCALE_ID } from '@angular/core';
import { RuleService } from '@services/rule/rule.service';

export class ListValueDataSource implements DataSource<any> {
  private formDataSubject = new BehaviorSubject<any[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  public totalData = new BehaviorSubject<boolean>(false);
  hasData = false;
  public hasDataSubject = new BehaviorSubject<boolean>(false);


  listData = [];

  constructor(private coreService: CoreService,@Inject(LOCALE_ID) public locale: string,private ruleService: RuleService) {}

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
  public getData(
    fieldId,
    moduleId,
    fieldsSearchString
  ) {
    this.loadingSubject.next(true);
      this.getListValues(moduleId, fieldId, fieldsSearchString);
  }

  data(res) {
    // res = this.listData;
    this.loadingSubject.next(false);
    if (!this.hasData) {
      this.hasData = res?.length > 0;
      this.hasDataSubject.next(this.hasData);
    }

    this.totalData.next(res);
    const nextDatalist = this.docsTransformation(res);
    this.formDataSubject.next(nextDatalist);
  }

  docsTransformation(res) {
    if (res) {
      return [...res];
    } else {
      return this.docValue();
    }
  }

  addNewListValue(newValue) {
    this.listData.push(newValue);
    this.data(this.listData);
  }

  cloneElement(element,i) {
    this.listData.splice(i + 1, 0, element);
    this.data(this.listData);
  }

  deleteElement(listValue) {
    if (listValue.textRef) {
      const index = this.listData.findIndex((d) => d.textRef === listValue.textRef);
      this.listData.splice(index, 1);
    } else {
      const index = this.listData.findIndex((d) => d.code === listValue.code);
      this.listData.splice(index, 1);
    }
    this.data(this.listData);
  }

  getListValues(moduleId, fieldId, fieldsSearchString) {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    const dto: {searchString: string; parent: any} = {
      searchString: fieldsSearchString,
      parent: {}
    };
    let subscription: Observable<ListValueResponse>;
    subscription = this.ruleService.getDropvals(moduleId, fieldId, this.locale, dto).pipe(take(1));
    subscription.subscribe((resp: ListValueResponse) => {
      if (resp.content.length > 0) {
        if (resp.content) {
        const editedResp = resp.content.map(data => {
            return {
              ...data,
              language: this.locale,
              syncEnable: true,
              addNewValue: false
            }
          })
          this.listData = editedResp;
          this.data(editedResp);
        }
      }
    },error => {
      this.data([])
    });
  }

  isArray(col) {
    return !!Array.isArray(col);
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
