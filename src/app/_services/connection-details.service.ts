import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConnectionDetailsService {

  connList: any = {}

  constructor() { }

  setConnDetails(details: any)
  {
    this.connList = details;
    this.connList.description = 'Lorem Porum........';
  }

  getConnDetails()
  {
    return this.connList;
  }
}
