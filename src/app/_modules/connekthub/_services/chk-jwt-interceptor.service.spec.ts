import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EndpointsDataplayService } from '@services/_endpoints/endpoints-dataplay.service';

import { ChkJwtInterceptorService } from './chk-jwt-interceptor.service';

describe('ChkJwtInterceptorService', () => {
  let service: ChkJwtInterceptorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientModule],
      providers: [
        EndpointsDataplayService
      ]
    });
    service = TestBed.inject(ChkJwtInterceptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
