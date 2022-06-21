import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AutoExtensionService {
  private dataSourceSubject = new BehaviorSubject<any[]>([]);
  public dataRefresh = new BehaviorSubject<boolean>(false);
  public dataRefresh$ = this.dataRefresh.asObservable();
  public totalCount = 0;

  structureFieldSelected: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  structureFieldSelected$ = this.structureFieldSelected.asObservable();

  conditionList = [];

  constructor() {}

  getData() {
    return this.dataSourceSubject.getValue();
  }

  addRow($event) {
    this.conditionList.push($event);
    this.setValue();
  }

  updateRow(index, conditionValue){
    this.conditionList[index] = conditionValue;
    this.setValue();
  }

  cloneConditionValues(condition, index) {
    this.conditionList.splice(index + 1, 0, condition);
    this.setValue();
  }

  getEditConditionValue(index) {
    return this.conditionList[index];
  }

  setConditionListValue(conditions) {
    this.conditionList = [...conditions];
    this.setValue();
  }

  setValue(conditionList?) {
    this.dataSourceSubject.next(this.conditionList);
    this.dataRefresh.next(true);
  }

  nextSelectedStructureField(data) {
    this.structureFieldSelected.next(data);
    this.dataRefresh.next(true);
  }

  disconnectCondtions() {
    this.conditionList = [];
    this.dataSourceSubject.next(this.conditionList);
  }
}
