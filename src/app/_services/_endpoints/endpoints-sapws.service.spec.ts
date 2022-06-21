import { TestBed } from '@angular/core/testing';

import { EndpointsSapwsService } from './endpoints-sapws.service';

describe('EndpointsSapwsService', () => {
  let service: EndpointsSapwsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EndpointsSapwsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should getNewDatasetMappingsUrl', () => {
    expect(service.getNewDatasetMappingsUrl()).toContain('/get-new-dataset-mappings');
  });

  it('should getSapServices', () => {
    expect(service.getSapServices('0')).toContain('/get-sap-services');
  });
  it('should saveOrUpdateConnection', () => {
    expect(service.saveOrUpdateConnection('0')).toContain('/save-update-connection');
  });
  it('should fetchSAPTablesUrl', () => {
    expect(service.fetchSAPTablesUrl()).toContain('/sap/tables');
  });

  it('should importInterfaceUrl', () => {
    expect(service.importInterfaceUrl('s')).toContain('/import-interface?connectionId=s');
  });
});
