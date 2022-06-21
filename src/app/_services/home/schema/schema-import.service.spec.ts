import { TestBed } from '@angular/core/testing';

import { SchemaImportService } from './schema-import.service';

describe('SchemaImportService', () => {
  let service: SchemaImportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SchemaImportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
