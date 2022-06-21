import { Injectable } from '@angular/core';
import * as introJs from 'intro.js/intro.js';

@Injectable({
  providedIn: 'root',
})
export class IntrojsService {
  introJS = null;

  constructor() {
    this.introJS = introJs();
  }
  public start(options) {
    this.introJS.setOptions(options).start();
  }
}
