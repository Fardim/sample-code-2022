import { EndpointsProfileService } from '@services/_endpoints/endpoints-profile.service';
import { EndpointsAuthService } from '@services/_endpoints/endpoints-auth.service';
import { TeamActionResponse, TeamRoleResponse, UserListRequestDTO, TeamMemberResponse, RoleRequestDto } from './../../_models/teams';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { EndpointsTeamService } from './../_endpoints/endpoints-team.service';
import { TestBed, async } from '@angular/core/testing';

import { TeamService } from './team.service';

describe('TeamService', () => {
  let service: TeamService;
  let teamEndpointServiceSpy: jasmine.SpyObj<EndpointsTeamService>;
  let authEndpointServiceSpy: jasmine.SpyObj<EndpointsAuthService>;
  let profileEndpointServiceSpy: jasmine.SpyObj<EndpointsProfileService>;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    const teamEndpointSpy = jasmine.createSpyObj('EndpointsTeamService', [
      'getTeamMembers',
      'getTeamRoles',
      'inactivateMembersUrl',
      'deleteTeamMembersUrl',
      'activateMembersUrl',
      'revokeInvitationsUrl',
      'resendInvitationsUrl',
    ]);
    const authEndpointSpy = jasmine.createSpyObj('EndpointsAuthService', ['getTeamAllStatus']);
    const profileEndpointSpy = jasmine.createSpyObj('EndpointsProfileService', [
      'getTeamRoles',
      'validateUser',
      'getTeamMembers',
      'inviteTeamMembers',
      'changeUserStatus',
    ]);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TeamService,
        { provide: EndpointsTeamService, useValue: teamEndpointSpy },
        { provide: EndpointsAuthService, useValue: authEndpointSpy },
        { provide: EndpointsProfileService, useValue: profileEndpointSpy },
      ],
    });
    service = TestBed.inject(TeamService);
    teamEndpointServiceSpy = TestBed.inject(EndpointsTeamService) as jasmine.SpyObj<EndpointsTeamService>;
    authEndpointServiceSpy = TestBed.inject(EndpointsAuthService) as jasmine.SpyObj<EndpointsAuthService>;
    profileEndpointServiceSpy = TestBed.inject(EndpointsProfileService) as jasmine.SpyObj<EndpointsProfileService>;
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  
  it('getAllStatus()', async(() => {
    const url = `getTeamAllStatus`;
    // mock url
    authEndpointServiceSpy.getTeamAllStatus.and.returnValue(url);

    const response: string[] = ['ACTIVE', 'LOCKED', 'INACTIVE', 'INVITED', 'REVOKED', 'INVITE_EXPIRED'];

    // actual service call
    service.getAllStatus().subscribe((actualResponse) => {
      // expect(actualResponse).toEqual(response);
      expect(actualResponse.length).toBeGreaterThan(0);
    });

    const mockRequst = httpTestingController.expectOne(`${url}`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    httpTestingController.verify();
  }));

  

  
});
