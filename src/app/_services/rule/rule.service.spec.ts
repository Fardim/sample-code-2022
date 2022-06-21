import { ListValue, ListValueResponse } from './../../_models/list-page/listpage';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { EndpointsRuleService } from './../_endpoints/endpoints-rule.service';
import { TestBed, async } from '@angular/core/testing';

import { RuleService } from './rule.service';

describe('RuleService', () => {
  let service: RuleService;
  let endpointServiceSpy: jasmine.SpyObj<EndpointsRuleService>;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    const endpointSpy = jasmine.createSpyObj('EndpointsRuleService', ['getDropvalsUrl', 'getSaveDropvalsUrl', 'getBusinessRulesCountUrl']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: EndpointsRuleService, useValue: endpointSpy }],
    });
    service = TestBed.inject(RuleService);
    httpTestingController = TestBed.inject(HttpTestingController);
    endpointServiceSpy = TestBed.inject(EndpointsRuleService) as jasmine.SpyObj<EndpointsRuleService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getDropvals()', async(() => {
    const url = `getDropvalsUrl`;
    // mock url
    endpointServiceSpy.getDropvalsUrl.and.returnValue(url);

    const response = new ListValueResponse();
    const moduleId = '1005';

    // actual service call
    service
      .getDropvals(moduleId, '1', 'en', {
        searchString: '',
        parent: {},
      })
      .subscribe((actualResponse) => {
        expect(actualResponse).toEqual(response);
      });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}`);
    expect(mockRequst.request.method).toEqual('POST');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('saveSearchHistory()', async(() => {
    const url = `getSaveDropvalsUrl`;
    // mock url
    endpointServiceSpy.getSaveDropvalsUrl.and.returnValue(url);

    const payload: ListValue[] = [
      {
        code: 'mg',
        text: 'Miligram',
      },
    ];

    const response = {
      acknowledge: true,
      errorMsg: '',
    };

    // actual service call
    service.saveDropvals(payload, '1', '1', 'en').subscribe((actualResponse) => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}`);
    expect(mockRequst.request.method).toEqual('POST');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));
  
  it('should getBusinessRulesCount', () => {
    const url = 'getBusinessRulesCountUrl';

    endpointServiceSpy.getBusinessRulesCountUrl.and.returnValue(url);

    const moduleId = '1005';
    const response: number = 1;

    service.getBusinessRulesCount(moduleId).subscribe((res) => {
      expect(res).toEqual(response);
    });

    const mockRequest = httpTestingController.expectOne(`${url}`);
    expect(mockRequest.request.method).toEqual('GET');
    mockRequest.flush(response);
    httpTestingController.verify();
  });
});
