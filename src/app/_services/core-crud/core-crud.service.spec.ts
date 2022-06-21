import { TestBed } from '@angular/core/testing';

import { CoreCrudService } from './core-crud.service';

describe('CordCrudService', () => {
  let service: CoreCrudService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoreCrudService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
