import { TestBed } from '@angular/core/testing';

import { DependencyRuleService } from './dependency-rule.service';

describe('DependencyRuleService', () => {
  let service: DependencyRuleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DependencyRuleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
