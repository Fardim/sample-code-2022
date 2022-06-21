import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClassificationLayoutService {

  skeletonLoader: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  skeletonLoader$ = this.skeletonLoader.asObservable();

  constructor() { }
}
