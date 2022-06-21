import { Injectable } from '@angular/core';
import { DataControlService } from './data-control.service';
import { TransactionService } from './transaction.service';

let transactionServiceInstance: TransactionService;
let dataControlServiceInstance: DataControlService;

export const transactionServiceFactory = () => {
  return transactionServiceInstance;
}

export const dataControlServiceFactory = () => {
  return dataControlServiceInstance;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceInstanceSharingService {

 private _transactionServiceInstance: TransactionService | undefined;
 private _dataControlServiceInstance: DataControlService | undefined;

 get transactionServiceInstance() {
  return this._transactionServiceInstance;
 }

 get dataControlServiceInstance() {
   return this._dataControlServiceInstance;
 }

  constructor() { }

  setTransactionServiceInstance(serviceInstance: TransactionService) {
    transactionServiceInstance = serviceInstance;
    this._transactionServiceInstance = serviceInstance;
  }

  setDataControlServiceInstance(serviceInstance: DataControlService) {
    dataControlServiceInstance = serviceInstance;
    this._dataControlServiceInstance = serviceInstance;
  }

  resetServiceInstances() {
    this._transactionServiceInstance = undefined;
    this._dataControlServiceInstance = undefined;
    transactionServiceInstance = undefined;
    dataControlServiceInstance = undefined;
  }

}
