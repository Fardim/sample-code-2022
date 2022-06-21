import { TestBed } from '@angular/core/testing';

import { EndpointSamlConfigurationService } from './endpoint-saml-configuration.service';

describe('EndpointSamlConfigurationService', () => {
  let service: EndpointSamlConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EndpointSamlConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
