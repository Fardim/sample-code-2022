import { TestBed } from '@angular/core/testing';

import { SamlConfigurationService } from './saml-configuration.service';

describe('SamlConfigurationService', () => {
  let service: SamlConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SamlConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
