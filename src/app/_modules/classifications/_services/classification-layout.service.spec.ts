import { TestBed } from '@angular/core/testing';

import { ClassificationLayoutService } from './classification-layout.service';

describe('ClassificationLayoutService', () => {
  let service: ClassificationLayoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassificationLayoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
