import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EndpointsRuleService } from '@services/_endpoints/endpoints-rule.service';
import { DaxeInfo } from '@store/models/daxe.model';

import { DaxeService, DAXE_TEST_DATA } from './daxe.service';


describe('DaxeService', () => {
  let service: DaxeService;
  let endpointRuleServiceSpy: jasmine.SpyObj<EndpointsRuleService>;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    const endpointSpy = jasmine.createSpyObj('EndpointsRuleService', ['getDaxeRules', 'getDaxeInfo', 'saveDaxeRule']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: EndpointsRuleService,
          useValue: endpointSpy
        }
      ]
    });
    service = TestBed.inject(DaxeService);
    httpTestingController = TestBed.inject(HttpTestingController);
    endpointRuleServiceSpy = TestBed.inject(EndpointsRuleService) as jasmine.SpyObj<EndpointsRuleService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // it('getDaxeRules()', () => {
  //   const url = `Test URL`;
  //   // mock url
  //   endpointRuleServiceSpy.getDaxeRules.withArgs('1').and.returnValue(url);

  //   const response = DAXE_TEST_DATA;

  //   // actual service call
  //   service.getDaxeRules('1').subscribe((actualResponse) => {
  //     expect(actualResponse).toEqual(DAXE_TEST_DATA);
  //   });
  //   // mock http call
  //   const mockRequst = httpTestingController.expectOne(`${url}`);
  //   expect(mockRequst.request.method).toEqual('GET');
  //   mockRequst.flush(response);
  //   // verify http
  //   httpTestingController.verify();
  // });

  it('getDaxeInfo()', () => {
    const url = `Test URL`;
    // mock url
    endpointRuleServiceSpy.getDaxeInfo.withArgs('1').and.returnValue(url);

    const response = DAXE_TEST_DATA;

    // actual service call
    service.getDaxeInfo('1').subscribe((actualResponse) => {
      expect(actualResponse).toEqual(DAXE_TEST_DATA);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}`);
    expect(mockRequst.request.method).toEqual('GET');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  });

  it('saveDaxeRule()', () => {
    const url = `Test URL`;
    // mock url
    endpointRuleServiceSpy.saveDaxeRule.withArgs().and.returnValue(url);

    const response: DaxeInfo = {
      dataSetId: '1',
      daxeProgrmaDetail: undefined,
      daxeUuid: '',
      helpText: '',
      name: 'test',
      tenantid: '',
      userModified: ''
    };

    // actual service call
    service.saveDaxeRule(response).subscribe((actualResponse) => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}`);
    expect(mockRequst.request.method).toEqual('POST');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  });
});
