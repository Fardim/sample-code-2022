import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DependencyRuleService {
  loadingSubject = new BehaviorSubject<boolean>(false);
  private data = {
    soruceSelectedOptions:[],
     targetSelectedOptions:[],
     Conditions:[]
  };
  Conditions:[]
 // private _selectedItems: any[] = [];
 // private _selectedItemsSource = new BehaviorSubject<any[]>(this._selectedItems);
 // selectedItems$ = this._selectedItemsSource.asObservable();
  setOption(sourceSelected) {
     this.data.soruceSelectedOptions = sourceSelected;
    // this.data.targetSelectedOptions = targetSelected;
   }
   setCondtions(){
     this.data.Conditions.length=0;
     this.loadingSubject.next(true);
   }
   setConditionsEmpty(){
     this.data.Conditions.length=0;
   }
   getLoadingSubject(){
     return this.loadingSubject;
   }
   getConditions(){
     return this.data.Conditions;
   }
   getOption() {
     return this.data;
   }
}
