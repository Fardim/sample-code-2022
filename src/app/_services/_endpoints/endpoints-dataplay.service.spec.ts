import { inject, TestBed } from '@angular/core/testing';

import { EndpointsDataplayService } from './endpoints-dataplay.service';

describe('EndpointsDataplayService', () => {

  beforeEach(() => {
    const endPointProvider = jasmine.createSpyObj('EndpointsDataplayService', ['getAvailableNounsUri']);

    TestBed.configureTestingModule({
      providers: [
        { provide: EndpointsDataplayService, useValue: endPointProvider }
      ]
    });
  });

  it('should be created', inject([EndpointsDataplayService], (service: EndpointsDataplayService) => {
    expect(service).toBeTruthy();
  }));

  it('getAvailableNounsUri(), all available nouns ..from local library', () => {
    const serviceobj = new EndpointsDataplayService();
    expect(serviceobj.getAvailableNounsUri()).toContain(`mro/noun`);
  });

  it('getAvailableModifierUri(), all available modifiers ..from local library', () => {
    const serviceobj = new EndpointsDataplayService();
    expect(serviceobj.getAvailableModifierUri()).toContain(`mro/modifier`);
  });

  it('getAvailableAttributeUri(), all available attributes ..from local library', () => {
    const serviceobj = new EndpointsDataplayService();
    expect(serviceobj.getAvailableAttributeUri()).toContain(`mro/attribute`);
  });
});
