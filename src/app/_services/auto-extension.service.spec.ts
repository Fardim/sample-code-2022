import { TestBed } from '@angular/core/testing';

import { AutoExtensionService } from './auto-extension.service';

describe('AutoExtensionService', () => {
  let service: AutoExtensionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutoExtensionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
