import { TestBed } from '@angular/core/testing';

import { EndpointsProfileService } from './endpoints-profile.service';

describe('EndpointsProfileService', () => {
  let service: EndpointsProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EndpointsProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should getPersonalDetails', () => {
    expect(service.getPersonalDetails()).toContain('/get-personal-details');
  });

  it('should updatePersonalDetails', () => {
    expect(service.updatePersonalDetails()).toContain('/save-personal-details');
  });

  it('should getUserPreferenceDetails', () => {
    expect(service.getUserPreferenceDetails()).toContain('/get-user-pref');
  });

  it('should updateUserPreferenceDetails', () => {
    expect(service.updateUserPreferenceDetails()).toContain('/save-user-pref');
  });

  it('should getAllLanguagesList', () => {
    expect(service.getAllLanguagesList()).toContain('/get-all-languages');
  });

  it('should getDateFormatList', () => {
    expect(service.getDateFormatList()).toContain('/get-date-format');
  });

  it('should getNumberFormatList', () => {
    expect(service.getNumberFormatList()).toContain('/get-number-format');
  });
  it('should getAllTags', () => {
    expect(service.getAllTags()).toContain('/get-all-tags');
  });
  it('should searchTags', () => {
    expect(service.searchTags()).toContain('/search-tags');
  });
  it('should deleteByTagId', () => {
    expect(service.deleteByTagId()).toContain('/delete-by-tag-id');
  });
  it('should saveUpdateTag', () => {
    expect(service.saveUpdateTag()).toContain('/save-update-tag');
  });
  it('should mergeTags', () => {
    expect(service.mergeTags()).toContain('/merge-tags');
  });
  it('should validateUser', () => {
    expect(service.validateUser()).toContain('/validate-edit-permission');
  });
  it('should getTeamRoles', () => {
    expect(service.getTeamRoles()).toContain('/roles-list');
  });
  it('should getTeamMembers', () => {
    expect(service.getTeamMembers()).toContain('/users-list');
  });
  it('should inviteMembers', () => {
    expect(service.inviteMembers()).toContain('/invite');
  });

  it('should changeUserStatus', () => {
    expect(service.changeUserStatus()).toContain('/updateStatus');
  });

  it('should validateURL', () => {
    expect(service.validateURL()).toContain('/verify');
  });

  it('should getUserInfoListUrl', () => {
    expect(service.getUserInfoListUrl()).toContain('/user-info-list');
  });

  it('should inviteTeamMembers', () => {
    expect(service.inviteTeamMembers()).toContain('/invite-team-members');
  });

  it('should deleteTeamMembersUrl', () => {
    expect(service.deleteTeamMembersUrl()).toContain('/delete-team-members');
  });

  it('should revokeInvitationsUrl', () => {
    expect(service.revokeInvitationsUrl('1','abc@gmail.com')).toContain('/revoke-invitations');
  });

  it('should resendInvitationsUrl', () => {
    expect(service.resendInvitationsUrl('')).toContain('/resend-invitations');
  });

  it('should activateMembersUrl', () => {
    expect(service.activateMembersUrl()).toContain('/activate-members');
  });

  it('should inactivateMembersUrl', () => {
    expect(service.inactivateMembersUrl()).toContain('/inactivate-members');
  });
});
