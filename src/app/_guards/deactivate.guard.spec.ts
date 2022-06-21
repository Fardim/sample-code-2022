import { inject, TestBed } from '@angular/core/testing';
import { CanDeactivateGuard } from './deactivate.guard';

describe('DeactivateGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CanDeactivateGuard]
    });
  });

  it('should be created', inject([CanDeactivateGuard], (grd: CanDeactivateGuard) => {
    expect(grd).toBeTruthy();
  }));
});
