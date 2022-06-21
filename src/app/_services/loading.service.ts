import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private loadingEmitter: EventEmitter<boolean> = new EventEmitter(true);

  constructor() {
    this.isLoading().emit(false);
  }

  isLoading(): EventEmitter<boolean> {
    return this.loadingEmitter;
  }
}
