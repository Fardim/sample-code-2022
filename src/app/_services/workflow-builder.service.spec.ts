import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { WorkflowBuilderService } from './workflow-builder.service';

describe('WorkflowBuilderService', () => {
  let service: WorkflowBuilderService;
  let httpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(WorkflowBuilderService);
    httpTestingController = TestBed.inject(HttpTestingController);

  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getRecipientList', () => {
    service.getRecipientList({}).subscribe((response) => {
      expect(response).not.toBe(null)
    });
    const testurl = service.endpointService.getLoadRecipientsListUrl()
    const req = httpTestingController.expectOne(testurl);
    const mockhttpData = [];
    expect(req.request.method).toEqual('GET');
    req.flush(mockhttpData);
    httpTestingController.verify();
  });

  it('should call getWorkflowFields', () => {
    service.getWorkflowFields({}).subscribe((response) => {
      expect(response).not.toBe(null)
    });
    const testurl = service.endpointService.getWfFieldsListUrl()
    const req = httpTestingController.expectOne(testurl);
    const mockhttpData = [];
    expect(req.request.method).toEqual('GET');
    req.flush(mockhttpData);
    httpTestingController.verify();
  });

  it('should call getLoadApi', () => {
    service.getLoadApi({}).subscribe((response) => {
      expect(response).not.toBe(null)
    });
    const testurl = service.endpointService.getLoadApisUrl()
    const req = httpTestingController.expectOne(testurl);
    const mockhttpData = [];
    expect(req.request.method).toEqual('GET');
    req.flush(mockhttpData);
    httpTestingController.verify();
  });

  it('should call saveWfDefinition', () => {
    service.saveWfDefinition({}).subscribe((response) => {
      expect(response).not.toBe(null)
    });
    const testurl = service.endpointService.getSaveWfDefinitionUrl()
    const req = httpTestingController.expectOne(testurl);
    const mockhttpData = [];
    expect(req.request.method).toEqual('POST');
    req.flush(mockhttpData);
    httpTestingController.verify();
  })


  it('should call getFieldOptions', () => {
    service.getFieldOptions({}).subscribe((response) => {
      expect(response).not.toBe(null)
    });
    const testurl = service.endpointService.getFieldOptionsUrl()
    const req = httpTestingController.expectOne(testurl);
    const mockhttpData = [];
    expect(req.request.method).toEqual('GET');
    req.flush(mockhttpData);
    httpTestingController.verify();
  })

  it('should call getwfDefinition', () => {
    service.getwfDefinition({}).subscribe((response) => {
      expect(response).not.toBe(null)
    });
    const testurl = service.endpointService.getloadWfDefinitionUrl()
    const req = httpTestingController.expectOne(testurl);
    const mockhttpData = [];
    expect(req.request.method).toEqual('GET');
    req.flush(mockhttpData);
    httpTestingController.verify();
  })

});


