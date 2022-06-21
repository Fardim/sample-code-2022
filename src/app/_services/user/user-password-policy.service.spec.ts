import { UserPasswordPolicy, UserPasswordPolicyDto, UserPasswordPolicyActionResponse } from './../../_models/userdetails';
import { EndpointsAuthService } from '@services/_endpoints/endpoints-auth.service';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, async } from '@angular/core/testing';
import { UserPasswordPolicyService } from './user-password-policy.service';

describe('UserPasswordPolicyService', () => {
  let service: UserPasswordPolicyService;
  let endpointServiceSpy: jasmine.SpyObj<EndpointsAuthService>;
  let httpTestingController: HttpTestingController;

  beforeEach(async() => {
    const endpointSpy = jasmine.createSpyObj('EndpointsAuthService', ['getUserDetailsUrl', 'updatePassword', 'getPasswordPolicy', 'policyAdd']);
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        { provide: EndpointsAuthService, useValue: endpointSpy }
      ]
    }).compileComponents();
    service = TestBed.inject(UserPasswordPolicyService);
    endpointServiceSpy = TestBed.inject(EndpointsAuthService) as jasmine.SpyObj<EndpointsAuthService>;
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getPasswordPolicy()', async(() => {

    const url = `getPasswordPolicy`;
    // mock url
    endpointServiceSpy.getPasswordPolicy.and.returnValue(url);

    const response = new UserPasswordPolicy();

    // actual service call
    service.getPasswordPolicy()
      .subscribe(actualResponse => {
          expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('policyAdd()', async(() => {

    const url = `policyAdd`;
    // mock url
    endpointServiceSpy.policyAdd.and.returnValue(url);

    const passwordDetails: UserPasswordPolicyDto = new UserPasswordPolicyDto();

    const response = new UserPasswordPolicyActionResponse();

    // actual service call
    service.policyAdd(passwordDetails)
      .subscribe(actualResponse => {
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

});
