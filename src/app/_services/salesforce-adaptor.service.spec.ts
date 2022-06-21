import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AppMaterialModuleForSpec } from '../app-material-for-spec.module';

import { SalesforceAdaptorService } from './salesforce-adaptor.service';

describe('SalesforceAdaptorService', () => {
  let service: SalesforceAdaptorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppMaterialModuleForSpec, HttpClientTestingModule, HttpClientModule],
    });
    service = TestBed.inject(SalesforceAdaptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
