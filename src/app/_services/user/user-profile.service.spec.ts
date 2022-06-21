import { TagsResponse, TagActionResponse } from './../../_models/userdetails';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { EndpointsProfileService } from './../_endpoints/endpoints-profile.service';
import { TestBed, async } from '@angular/core/testing';

import { UserProfileService } from './user-profile.service';
import { InviteTeamMember, RoleRequestDto, TeamActionResponse, TeamMemberResponse, TeamRoleResponse, UserListRequestDTO } from '@models/teams';

describe('UserProfileService', () => {
  let userProfileService: UserProfileService;
  let profileEndpointServiceSpy: jasmine.SpyObj<EndpointsProfileService>;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    const profileEndpointSpy = jasmine.createSpyObj('EndpointsProfileService', ['getAllTags', 'searchTags', 'deleteByTagId', 'saveUpdateTag', 'mergeTags', 'getTeamRoles',
    'validateUser',
    'getTeamMembers',
    'inviteTeamMembers',
    'changeUserStatus'])
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        UserProfileService,
        { provide: EndpointsProfileService, useValue: profileEndpointSpy }
      ]
    });
    userProfileService = TestBed.inject(UserProfileService);
    profileEndpointServiceSpy = TestBed.inject(EndpointsProfileService) as jasmine.SpyObj<EndpointsProfileService>;
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(userProfileService).toBeTruthy();
  });


  it('getAllTags()', async(() => {

    const url = `getAllTags`;
    // mock url
    profileEndpointServiceSpy.getAllTags.and.returnValue(url);

    const response: TagsResponse = new TagsResponse();

    // actual service call
    userProfileService.getAllTags(0, 4)
      .subscribe(actualResponse => {
          expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?page=0&size=4`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('searchTags()', async(() => {

    const url = `searchTags`;
    // mock url
    profileEndpointServiceSpy.searchTags.and.returnValue(url);

    const response: TagsResponse = new TagsResponse();

    // actual service call
    userProfileService.searchTags(0, 4, 'Material')
      .subscribe(actualResponse => {
          expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?page=0&size=4&searchString=Material`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('deleteByTagId()', async(() => {

    const url = `deleteByTagId`;
    // mock url
    profileEndpointServiceSpy.deleteByTagId.and.returnValue(url);

    const response: TagActionResponse = new TagActionResponse();

    // actual service call
    userProfileService.deleteByTagId(['673083920600261367'])
      .subscribe(actualResponse => {
          expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}`);
    expect(mockRequst.request.method).toEqual('DELETE');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('saveUpdateTag()', async(() => {

    const url = `saveUpdateTag`;
    // mock url
    profileEndpointServiceSpy.saveUpdateTag.and.returnValue(url);

    const response: TagActionResponse = new TagActionResponse();

    // actual service call
    userProfileService.saveUpdateTag({id: '673083920600261367', description: 'Material'})
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

  it('mergeTags()', async(() => {

    const url = `mergeTags`;
    // mock url
    profileEndpointServiceSpy.mergeTags.and.returnValue(url);

    const response: TagActionResponse = new TagActionResponse();

    // actual service call
    userProfileService.mergeTags({tagIds: ['673083920600261367'], tagDescription: 'Material'})
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

  it('getTeamMembers()', async(() => {

    const url = `getTeamMembers`;

    // mock url

    profileEndpointServiceSpy.getTeamMembers.and.returnValue(url);


    const payload: UserListRequestDTO = {

      pageInfo: {

        pageNumer: 0,

        pageSize: 0,

      },

      roles: ['string'],

      searchString: 'string',

      sortingInfo: [

        {

          direction: 'ASC',

          fieldId: 'string',

        },

      ],

      status: ['ACTIVE'],

    };

    const response: TeamMemberResponse = new TeamMemberResponse();


    // actual service call

    userProfileService.getTeamMembers(payload).subscribe((actualResponse) => {

      // expect(actualResponse).toEqual(response);

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


  it('getTeamRoles()', async(() => {

    const url = `getTeamRoles`;

    // mock url

    profileEndpointServiceSpy.getTeamRoles.and.returnValue(url);


    const response: TeamRoleResponse = new TeamRoleResponse();

    const payload: RoleRequestDto = new RoleRequestDto();


    // actual service call

    userProfileService.getTeamRoles(payload).subscribe((actualResponse) => {

      // expect(actualResponse).toEqual(response);

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

  it('inactivateMembers()', async(() => {
    const url = `inactivateMembersUrl`;
    // mock url
    profileEndpointServiceSpy.inactivateMembersUrl.and.returnValue(url);

    const response: TeamActionResponse = new TeamActionResponse();

    // actual service call
    userProfileService.inactivateMembers(['a@gmail.com', 'b@gmail.com']).subscribe((actualResponse) => {
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

  it('activateMembers()', async(() => {

    const url = `activateMembersUrl`;

    // mock url

    profileEndpointServiceSpy.activateMembersUrl.and.returnValue(url);


    const response: TeamActionResponse = new TeamActionResponse();


    // actual service call

    userProfileService.activateMembers(['a@gmail.com', 'b@gmail.com']).subscribe((actualResponse) => {

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

  it('resendInvitations()', async(() => {

    const url = `resendInvitationsUrl`;

    // mock url

    profileEndpointServiceSpy.resendInvitationsUrl.and.returnValue(url);


    const response: TeamActionResponse = new TeamActionResponse();


    // actual service call

    userProfileService.resendInvitations('a@gmail.com', '',[]).subscribe((actualResponse) => {

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
  it('revokeInvitations()', async(() => {

    const url = `revokeInvitationsUrl`;

    // mock url

    profileEndpointServiceSpy.revokeInvitationsUrl.and.returnValue(url);


    const response: TeamActionResponse = new TeamActionResponse();


    // actual service call

    userProfileService.revokeInvitations('', 'b@gmail.com').subscribe((actualResponse) => {

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
  it('inviteTeamMembers()', async(() => {

    const url = `inviteTeamMembers`;

    // mock url

    profileEndpointServiceSpy.inviteTeamMembers.and.returnValue(url);


    const response: TeamActionResponse = new TeamActionResponse();


    // actual service call
    const teamMember = new InviteTeamMember();
    userProfileService.inviteTeamMembers([teamMember],'').subscribe((actualResponse) => {

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


  it('validateUser()', async(() => {

    const url = `validate-edit-permission`;

    const response = { isUserValid: true };

    // mock url

    profileEndpointServiceSpy.validateUser.and.returnValue(url);


    // actual service call

    userProfileService.validateUser().subscribe((actualResponse) => {

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


  it('deleteTeamMembers()', async(() => {

    const url = `deleteTeamMembersUrl`;

    // mock url

    profileEndpointServiceSpy.deleteTeamMembersUrl.and.returnValue(url);

  


    const response: TeamActionResponse = new TeamActionResponse();


    // actual service call

    userProfileService.deleteTeamMembers(['a@gmail.com', 'b@gmail.com']).subscribe((actualResponse) => {

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


  it('changeUserStatus()', async(() => {

    const url = `updateStatus`;

    const userId = 'testadmin';

    const updateType = 'ACTIVE';

    const response = { isUserValid: true };

    // mock url

    profileEndpointServiceSpy.changeUserStatus.and.returnValue(url);


    // actual service call

    userProfileService.changeUserStatus(userId, updateType).subscribe((actualResponse) => {

      expect(actualResponse).toEqual(response);

    });

    // mock http call

    const mockRequst = httpTestingController.expectOne(`${url}?userId=${userId}&updateType=${updateType}`);

    expect(mockRequst.request.method).toEqual('GET');

  }));


});
