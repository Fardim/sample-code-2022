import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { LogsDatasourceService } from './logs-datasource.service';

describe('LogsDatasourceService', () => {
  let service: LogsDatasourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DatePipe]
    });
    service = TestBed.inject(LogsDatasourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
