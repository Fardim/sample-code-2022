import { TestBed } from '@angular/core/testing';

import { BadgeService, BadgeStatus } from './badge.service';

describe('BadgeService', () => {
  let service: BadgeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BadgeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getBadgeByStatus(), should return the respective badge data', () => {
    expect(service.getBadgeByStatus(BadgeStatus.PENDING)).toEqual({icon: 'clock', type: null, font: 'light' });
    expect(service.getBadgeByStatus(BadgeStatus.SUCCESS)).toEqual({icon: 'check', type: BadgeStatus.SUCCESS, font: null });
    expect(service.getBadgeByStatus(BadgeStatus.ERROR)).toEqual({icon: 'exclamation-circle', type: BadgeStatus.ERROR, font: 'solid' });
    expect(service.getBadgeByStatus(null)).toEqual({icon: null, type: null, font: null });
  });
});
