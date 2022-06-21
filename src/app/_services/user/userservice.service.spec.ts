import { TestBed, async } from '@angular/core/testing';

import { UserService } from './userservice.service';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { Any2tsService } from '../any2ts.service';
import { Userdetails, UserPasswordDetails, UserPersonalDetails, UserPreferenceDetails } from 'src/app/_models/userdetails';
import { EndpointsAuthService } from '@services/_endpoints/endpoints-auth.service';
import { EndpointsProfileService } from '@services/_endpoints/endpoints-profile.service';

describe('UserService', () => {
  let userService: UserService;
  let any2tsServiceSpy: jasmine.SpyObj<Any2tsService>;
  let endpointServiceSpy: jasmine.SpyObj<EndpointsAuthService>;
  let profileEndpointServiceSpy: jasmine.SpyObj<EndpointsProfileService>;
  let httpTestingController: HttpTestingController;
  beforeEach(async(() => {
    const any2tsSpy = jasmine.createSpyObj('Any2tsService', ['any2UserDetails']);
    const endpointSpy = jasmine.createSpyObj('EndpointsAuthService ', ['getUserDetailsUrl', 'updatePassword']);
    const profileEndpointSpy = jasmine.createSpyObj('EndpointsProfileService', [
      'getPersonalDetails',
      'updatePersonalDetails',
      'getUserPreferenceDetails',
      'updateUserPreferenceDetails',
      'getAllLanguagesList',
      'getDateFormatList',
      'getNumberFormatList',
    ]);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UserService,
        { provide: EndpointsAuthService, useValue: endpointSpy },
        { provide: EndpointsProfileService, useValue: profileEndpointSpy },
        { provide: Any2tsService, useValue: any2tsSpy },
      ],
    }).compileComponents();
    userService = TestBed.inject(UserService);
    any2tsServiceSpy = TestBed.inject(Any2tsService) as jasmine.SpyObj<Any2tsService>;
    endpointServiceSpy = TestBed.inject(EndpointsAuthService) as jasmine.SpyObj<EndpointsAuthService>;
    profileEndpointServiceSpy = TestBed.inject(EndpointsProfileService) as jasmine.SpyObj<EndpointsProfileService>;
    httpTestingController = TestBed.inject(HttpTestingController);
  }));

  it('should be created', () => {
    const service: UserService = TestBed.inject(UserService);
    expect(service).toBeTruthy();
  });

  it('getUserDetails(): get user details ', async(() => {
    const apiUrl = 'test user details url';
    const userId = 'mdo_refresh';
    // mock url
    endpointServiceSpy.getUserDetailsUrl.withArgs(userId).and.returnValue(apiUrl);
    const mockData = {} as any;
    const expectedData: Userdetails = new Userdetails();
    // mock any2Ts
    any2tsServiceSpy.any2UserDetails.withArgs(mockData).and.returnValue(expectedData);
    // actual call
    userService.getUserDetails().subscribe((actualData) => {
      expect(actualData).toEqual(expectedData);
    });

    // user details through api call
    spyOn(localStorage, 'getItem').and.returnValue(
      'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ7XCJ1c2VybmFtZVwiOlwibWRvX3JlZnJlc2hcIn0iLCJhdWQiOlsibGlicmFyeSIsIk1STyIsImFuYWx5dGljcyIsImNvcmUiLCJzeW5jIl0sImlzcyI6ImF1dGgiLCJleHAiOjE2MTMwNjYzNDksImlhdCI6MTYxMzA2NTQ0OX0.gxc2oYp8NnSCpUQSsW1uu39_BzYEdktPW24ucE8AU6k'
    );

    userService.getUserDetails().subscribe((actualData) => {
      expect(actualData).toEqual(expectedData);
    });

    // mock http
    const mockRequest = httpTestingController.expectOne(apiUrl);
    mockRequest.flush(mockData);

    // verify http
    httpTestingController.verify();
  }));

  it('getUserPersonalDetails()', async(() => {
    const url = `getPersonalDetails`;
    // mock url
    profileEndpointServiceSpy.getPersonalDetails.and.returnValue(url);

    const response: UserPersonalDetails = new UserPersonalDetails();

    // actual service call
    userService.getUserPersonalDetails().subscribe((actualResponse) => {
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

  it('updateUserPersonalDetails()', async(() => {
    const url = `updatePersonalDetails`;
    // mock url
    profileEndpointServiceSpy.updatePersonalDetails.and.returnValue(url);

    const personalDetails: UserPersonalDetails = new UserPersonalDetails();

    const response = {
      acknowledge: true,
      errorMsg: null,
      userName: '',
    };

    // actual service call
    userService.updateUserPersonalDetails(personalDetails).subscribe((actualResponse) => {
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

  it('getUserPreferenceDetails()', async(() => {
    const url = `getUserPreferenceDetails`;
    // mock url
    profileEndpointServiceSpy.getUserPreferenceDetails.and.returnValue(url);

    const response: UserPreferenceDetails = new UserPreferenceDetails();

    // actual service call
    userService.getUserPreferenceDetails().subscribe((actualResponse) => {
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

  it('updateUserPreferenceDetails()', async(() => {
    const url = `updateUserPreferenceDetails`;
    // mock url
    profileEndpointServiceSpy.updateUserPreferenceDetails.and.returnValue(url);

    const userPref: UserPreferenceDetails = new UserPreferenceDetails();

    const response = {
      acknowledge: true,
      errorMsg: null,
      userName: '',
    };

    // actual service call
    userService.updateUserPreferenceDetails(userPref).subscribe((actualResponse) => {
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

  it('getAllLanguagesList()', async(() => {
    const url = `getAllLanguagesList`;
    // mock url
    profileEndpointServiceSpy.getAllLanguagesList.and.returnValue(url);

    const response: string[] = [];

    // actual service call
    userService.getAllLanguagesList().subscribe((actualResponse) => {
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

  it('getDateFormatList()', async(() => {
    const url = `getDateFormatList`;
    // mock url
    profileEndpointServiceSpy.getDateFormatList.and.returnValue(url);

    const response: string[] = [];

    // actual service call
    userService.getDateFormatList().subscribe((actualResponse) => {
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

  it('getNumberFormatList()', async(() => {
    const url = `getNumberFormatList`;
    // mock url
    profileEndpointServiceSpy.getNumberFormatList.and.returnValue(url);

    const response: string[] = [];

    // actual service call
    userService.getNumberFormatList().subscribe((actualResponse) => {
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

  it('updatePassword()', async(() => {
    const url = `updatePassword`;
    // mock url
    endpointServiceSpy.updatePassword.and.returnValue(url);

    const passwordDetails: UserPasswordDetails = new UserPasswordDetails();

    const response = {
      acknowledge: true,
      errorMsg: null,
      userName: '',
    };

    // actual service call
    userService.updatePassword(passwordDetails,'').subscribe((actualResponse) => {
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

  it('getUserDetailById()', async(() => {
    const url = `getUserPersonalDetailsById`;
    // mock url
    profileEndpointServiceSpy.getPersonalDetails.and.returnValue(url);

    const response: UserPersonalDetails = new UserPersonalDetails();

    // actual service call
    userService.getSelectedUserDetails('admin').subscribe((actualResponse) => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?userName=${'admin'}`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('updateSelectedUserDetails()', async(() => {
    const url = `updateSelectedUserDetails`;
    // mock url
    profileEndpointServiceSpy.updatePersonalDetails.and.returnValue(url);

    const response = {
      acknowledge: true,
      errorMsg: 'Error',
      userName: 'Test Name',
    };

    const userDetails: UserPersonalDetails = {
      profileKey: { userName: 'admin', tenantId: '0' },
      digitalSignature: '',
      avtarURL:
        'https://is5-ssl.mzstatic.com/image/thumb/Purple113/v4/a5/cc/0e/a5cc0e65-2097-ddd3-5927-b215a5bdd16f/pr_source.png/750x750bb.jpeg',
      publicName: 'darshan Tra12',
      fb: 'string',
      linkedin: 'string',
      twitter: '',
      pemail: 'darshan5@test.com',
      semail: 'darshan@gmail.com',
      fname: 'Darshan full name12',
      mname: 'Darshan m4 name',
      lname: 'Darshan l4 name',
      name: 'Darshan',
      phone: 9876543456,
    };

    // actual service call
    userService.updateSelectedUserDetails(userDetails, 'darshan4 trambadiya').subscribe((actualResponse: any) => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?userName=${'darshan4%20trambadiya'}`);
    expect(mockRequst.request.method).toEqual('POST');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('updateSelectedUserDetails()', async(() => {
    const url = `getUserPreferenceDetails`;
    // mock url
    profileEndpointServiceSpy.getUserPreferenceDetails.and.returnValue(url);

    const response: UserPreferenceDetails = new UserPreferenceDetails();

    // actual service call
    userService.getSelectedUserPreferenceUserDetails('darshan4 trambadiya').subscribe((actualResponse) => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?userName=${'darshan4%20trambadiya'}`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));
});
