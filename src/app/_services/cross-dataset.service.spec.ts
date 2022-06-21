import { TestBed } from '@angular/core/testing';

import { CrossDatasetService } from './cross-dataset.service';

describe('CrossDatasetService', () => {
  let service: CrossDatasetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrossDatasetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
