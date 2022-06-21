import { Injectable } from '@angular/core';

export enum BadgeStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  PENDING = 'pending'
}

export interface BadgeData {
  icon: string,
  type: BadgeStatus,
  font: string
}

@Injectable({
  providedIn: 'root'
})
export class BadgeService {

  constructor() { }

  getBadgeByStatus(status: BadgeStatus): BadgeData {
    if(status === BadgeStatus.PENDING) {
      return {icon: 'clock', type: null, font: 'light' };
    }
    if(status === BadgeStatus.ERROR) {
      return {icon: 'exclamation-circle', type: status, font: 'solid' };
    }
    if(status === BadgeStatus.SUCCESS) {
      return {icon: 'check', type: status, font: null };
    }

    return {icon: null, type: status, font: null };
  }

}
