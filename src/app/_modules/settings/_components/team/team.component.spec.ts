import { UserService } from '@services/user/userservice.service';
import { Userdetails } from '@models/userdetails';
import { TeamActionResponse, TeamMember, TeamRoleResponse, TeamMemberResponse } from '@models/teams';
import { GlobaldialogService } from '@services/globaldialog.service';
import { MultiSortModule } from '../../../shared/_pros-multi-sort/multi-sort.module';
import { TransientService } from 'mdo-ui-library';
import { of, throwError } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { Router } from '@angular/router';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { TeamComponent } from './team.component';
import { TeamService } from '@services/user/team.service';
import { Sort } from '@angular/material/sort';
import { UserProfileService } from '@services/user/user-profile.service';

describe('TeamComponent', () => {
  let component: TeamComponent;
  let fixture: ComponentFixture<TeamComponent>;
  let router: Router;
  let teamService: TeamService;
  let globalDialogService: GlobaldialogService;
  let transientService: TransientService;
  let profileService: UserProfileService;
  let userService: UserService;

  const mockMember: TeamMember = {
    id: '60c3706cd27e1e16e7aaf9c1',
    email: 'Patrick@gmail.com',
    userName: 'Merrill Rice',
    fname: 'Patrick',
    lname: 'Tanner',
    roles: [
      {
        roleDesc: 'Admin',
        roleId: '600470494111405437',
      },
      {
        roleDesc: 'Manager',
        roleId: '600470494111405438',
      },
    ],
    status: 'Active',
    joinedDate: '2020-11-21T12:32:44',
    lastActiveDate: '2020-07-02T09:36:52',
  };

  const mockdata = [
    {
      email: 'darshannew@test.com',
      fname: 'Darshan Trambadiya 1',
      joinedDate: null,
      lastActiveDate: null,
      lname: 'Darshan l4 name',
      roles: null,
      status: 'ACTIVE',
      userName: 'admin',

    },
    {
      email: 'alex123@gmail.com',
      fname: 'alex',
      joinedDate: null,
      lastActiveDate: null,
      lname: 'fdf',
      roles: null,
      status: 'INACTIVE',
      userName: 'bhumirami133@gmail.com'
    }
  ];

  const userDetailsobject: Userdetails = {
    userName: 'DemoApp',
    firstName: 'Demo',
    lastName: 'Approver',
    email: 'prostenant@gmail.com',
    plantCode: 'MDO1003',
    currentRoleId: '663065348460318692',
    dateformat: 'dd.mm.yy',
    fullName: 'Demo Approver',
    assignedRoles: [
      {
        defaultRole: '1',
        roleDesc: 'DemoApprover',
        roleId: '663065348460318692',
        sno: '521017956918018560',
        userId: 'DemoApp'
      },
      {
        defaultRole: '0',
        roleDesc: 'DemoApprover2',
        roleId: '143739996174018010',
        sno: '867216031918019200',
        userId: 'DemoApp'
      }
    ],
    orgId: '1'
  } as Userdetails;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TeamComponent],
      imports: [AppMaterialModuleForSpec, RouterTestingModule, SharedModule, MultiSortModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
    teamService = fixture.debugElement.injector.get(TeamService);
    userService = fixture.debugElement.injector.get(UserService);
    profileService = fixture.debugElement.injector.get(UserProfileService);
    globalDialogService = fixture.debugElement.injector.get(GlobaldialogService);
    transientService = fixture.debugElement.injector.get(TransientService);
    router = TestBed.inject(Router);

    spyOn(profileService, 'getTeamRoles').and.returnValues(of(teamRoleResponse));
    spyOn(teamService, 'getAllStatus').and.returnValues(of(allStatus));
    component.currentUserPersonalDetails = {
      fname: 'test',
      lname: 'admin',
      pemail: 'test@admin.com',
      semail: 'tests@admin.com',
      phone: 9876567890,
      avtarURL: '',
      digitalSignature: '',
      fb: '',
      name: '',
      linkedin: '',
      mname: 'test',
      profileKey: {
        tenantId: '1',
        userName: 'admin',
      },
      publicName: '',
      twitter: '',
    };
  });

  it('should create', () => {
    spyOn(profileService, 'getTeamMembers').and.returnValues(of(teamMemberResponse));

    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should call getRoles()', async(() => {
    spyOn(profileService, 'getTeamMembers').and.returnValues(of(teamMemberResponse));
    fixture.detectChanges();
    // component.getRoles();

    expect(component.allRoles.length).toBeGreaterThan(0);
  }));

  it('should get table data', async(() => {
    spyOn(profileService, 'getTeamMembers').and.returnValues(of(teamMemberResponse), of(teamMemberResponse));

    fixture.detectChanges();
    component.getTableData();
    expect(profileService.getTeamMembers).toHaveBeenCalled();
    expect(component.dataSource.docLength()).toBeGreaterThan(0);
  }));

  it('masterToggle()', () => {
    spyOn(component.selection, 'clear');
    spyOn(component.selection, 'select');
    spyOn(profileService, 'getTeamMembers').and.returnValues(of(teamMemberResponse));
    component.masterToggle({value:'select_none'});
    expect(component.selection.clear).toHaveBeenCalled();

    component.getTableData();
    component.masterToggle({value:'select_this_page'});
    expect(component.selection.select).toHaveBeenCalled();
  });

  it('checkboxLabel()', () => {
    spyOn(profileService, 'getTeamMembers').and.returnValues(of(teamMemberResponse));

    component.getTableData();
    component.selectedPages = [];
    let label = component.checkboxLabel(null);
    expect(label).toEqual('deselect all');
    component.selectedPages = ['all'];
    component.masterToggle('select_all_page');
    label = component.checkboxLabel(null);
    expect(label).toEqual('select all');
  });

  it('ngOnDestroy()', () => {
    spyOn(component.unsubscribeAll$, 'unsubscribe');
    component.ngOnDestroy();
    expect(component.unsubscribeAll$.unsubscribe).toHaveBeenCalled();
  });

  it('OpenInviteSidesheet()', async(() => {
    spyOn(router, 'navigate');
    component.OpenInviteSidesheet();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/settings/teams`, outer: `outer/teams/invite` } }], {
      queryParamsHandling: 'preserve',
    });
  }));

  it('openProfileSectionSidesheet()', async(() => {
    component.userDetails.currentRoleId = '0';
    spyOn(router, 'navigate');

    spyOn(profileService, 'validateUser')
      .and.returnValues(of(true));

    component.openProfileSectionSidesheet(mockMember);

    expect(profileService.validateUser).toHaveBeenCalled();

    expect(router.navigate).toHaveBeenCalledWith(
      [{ outlets: { sb: `sb/settings/teams`, outer: `outer/teams/user-profile/${mockMember.userName}` } }],
      { queryParamsHandling: 'preserve' }
    );
  }));

  it('scroll(), should get tags on scroll down', async(() => {
    spyOn(profileService, 'getTeamMembers').and.returnValues(of(teamMemberResponse));

    spyOn(component, 'getTableData');
    component.ngOnInit();
    component.scroll(true);
    expect(component.recordsPageIndex).toEqual(2);
    expect(component.getTableData).toHaveBeenCalled();

    component.infinteScrollLoading = false;
    component.scroll(false);
    expect(component.recordsPageIndex).toEqual(1);

    const result = component.scroll(true);
    expect(result).toBeNull();
  }));

  it('should init component', fakeAsync(() => {
    spyOn(profileService, 'getTeamMembers').and.returnValues(of(teamMemberResponse));

    spyOn(component, 'getTableData');
    component.ngOnInit();

    component.searchFieldSub.next('material');
    tick(1000);
    expect(component.getTableData).toHaveBeenCalled();
  }));

  it('searchRoleSub emit', fakeAsync(() => {
    spyOn(profileService, 'getTeamMembers').and.returnValues(of(teamMemberResponse));
    spyOn(component, 'getRoles');

    component.ngOnInit();
    component.searchRoleSub.next('admin');
    tick(1000);
    expect(component.getRoles).toHaveBeenCalled();
  }));

  it('searchStatusSub emit', fakeAsync(() => {
    spyOn(profileService, 'getTeamMembers').and.returnValues(of(teamMemberResponse));

    component.ngOnInit();
    component.searchStatusSub.next('INVITED');
    tick(1000);
    expect(component.filteredStatus.length).toEqual(1);

    component.searchStatusSub.next('');
    tick(1000);
    expect(component.filteredStatus.length).toEqual(6);
  }));

  it('should show a sorted table', async(() => {
    spyOn(profileService, 'getTeamMembers').and.returnValues(of(teamMemberResponse));

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const event = { active: 'id', direction: 'asc' } as Sort;
      component.multiSort.sortChange.next(event);
      expect(component.sortDirection).toEqual('asc');
    });
  }));

  it('changeUserStatus(), confirmation dialog returns yes', fakeAsync(() => {
    spyOn(component, 'changeUserStatus');
    spyOn(globalDialogService, 'confirm').and.callFake(({}, cb) => {
      expect(typeof cb).toBe('function');
      cb('yes');
    });

    const result = component.changeUserStatus(mockMember, 'ACTIVE');
    expect(result).toBeFalsy();
  }));

  it('changeUserStatus(), confirmation dialog returns no', fakeAsync(() => {
    spyOn(component, 'changeUserStatus');
    spyOn(globalDialogService, 'confirm').and.callFake(({}, cb) => {
      expect(typeof cb).toBe('function');
      cb('no');
    });

    const result = component.changeUserStatus(mockMember, 'DEACTIVE');
    expect(result).toBeFalsy();
  }));

  it('deleteMember(), should delete member by Id', async(() => {
    spyOn(profileService, 'getTeamMembers').and.returnValues(of(teamMemberResponse));

    const successResponse: TeamActionResponse = {
      acknowledge: true,
      errorMsg: null,
    };
    const failResponse: TeamActionResponse = {
      acknowledge: false,
      errorMsg: null,
    };
    spyOn(profileService, 'deleteTeamMembers').and.returnValues(of(successResponse), of(failResponse), throwError({ message: 'api error' }));
    spyOn(component, 'getTableData');
    spyOn(transientService, 'open');

    component.ngOnInit();
    component.deleteMember([mockMember.email]);

    expect(profileService.deleteTeamMembers).toHaveBeenCalledWith([mockMember.email]);
    expect(component.getTableData).toHaveBeenCalled();

    component.deleteMember([mockMember.email]);
    expect(transientService.open).toHaveBeenCalled();

    component.deleteMember([mockMember.email]);
    expect(transientService.open).toHaveBeenCalled();
  }));
  it('deleteSelectedMembers(), confirmation dialog return yes', fakeAsync(() => {
    spyOn(profileService, 'getTeamMembers').and.returnValues(of(teamMemberResponse));

    spyOn(component, 'deleteMember');
    component.ngOnInit();
    spyOn(globalDialogService, 'confirm').and.callFake(({}, cb) => {
      expect(typeof cb).toBe('function');
      cb('yes');
    });
    component.selection.toggle(mockMember);
    component.deleteSelectedMembers();
    expect(component.deleteMember).toHaveBeenCalledWith([mockMember.email]);

    component.deleteSelectedMembers(mockMember);
    expect(component.deleteMember).toHaveBeenCalledWith([mockMember.email]);
  }));
  it('deleteSelectedMembers(), confirmation dialog return no', fakeAsync(() => {
    spyOn(profileService, 'getTeamMembers').and.returnValues(of(teamMemberResponse));

    spyOn(component, 'deleteMember');
    component.ngOnInit();
    spyOn(globalDialogService, 'confirm').and.callFake(({}, cb) => {
      expect(typeof cb).toBe('function');
      cb('no');
    });
    const result = component.deleteSelectedMembers(mockMember);
    expect(result).toBeFalsy();
  }));

  it('revokeInvitation(), should revoke invitation by Id', async(() => {
    spyOn(profileService, 'getTeamMembers').and.returnValues(of(teamMemberResponse));

    const successResponse: TeamActionResponse = {
      acknowledge: true,
      errorMsg: null,
    };
    const failResponse: TeamActionResponse = {
      acknowledge: false,
      errorMsg: null,
    };
    spyOn(profileService, 'revokeInvitations').and.returnValues(of(successResponse), of(failResponse), throwError({ message: 'api error' }));
    spyOn(component, 'getTableData');
    spyOn(transientService, 'open');

    component.ngOnInit();
    component.revokeInvitation('abc@gmail.com');

    expect(profileService.revokeInvitations).toHaveBeenCalledWith('1','abc@gmail.com');
    expect(component.getTableData).toHaveBeenCalled();

    component.revokeInvitation('abc@gmail.com');
    expect(transientService.open).toHaveBeenCalled();

    component.revokeInvitation('abc@gmail.com');
    expect(transientService.open).toHaveBeenCalled();
  }));
  it('revokeSelectedMembers(), confirmation dialog return yes', fakeAsync(() => {
    spyOn(profileService, 'getTeamMembers').and.returnValues(of(teamMemberResponse));

    spyOn(component, 'revokeInvitation');
    component.ngOnInit();
    spyOn(globalDialogService, 'confirm').and.callFake(({}, cb) => {
      expect(typeof cb).toBe('function');
      cb('yes');
    });
    component.selection.toggle(mockMember);
    component.revokeSelectedMembers(mockMember);
    expect(component.revokeInvitation).toHaveBeenCalledWith('Merrill Rice');
  }));
  it('revokeSelectedMembers(), confirmation dialog return no', fakeAsync(() => {
    spyOn(profileService, 'getTeamMembers').and.returnValues(of(teamMemberResponse));

    spyOn(component, 'revokeInvitation');
    component.ngOnInit();
    spyOn(globalDialogService, 'confirm').and.callFake(({}, cb) => {
      expect(typeof cb).toBe('function');
      cb('no');
    });
    const result = component.revokeSelectedMembers(mockMember);
    expect(result).toBeFalsy();
  }));

  it('invite(), should resend invitation by Id', async(() => {
    spyOn(profileService, 'getTeamMembers').and.returnValues(of(teamMemberResponse));

    const successResponse: TeamActionResponse = {
      acknowledge: true,
      errorMsg: null,
    };
    const failResponse: TeamActionResponse = {
      acknowledge: false,
      errorMsg: null,
    };
    spyOn(userService, 'getUserDetails').and.returnValues(of(userDetailsobject));
    spyOn(profileService, 'resendInvitations').and.returnValues(of(successResponse), of(failResponse), throwError({ message: 'api error' }));
    spyOn(component, 'getTableData');
    spyOn(transientService, 'open');

    component.ngOnInit();
    component.invite('abc@Gmail.com','1',['guest']);

    expect(profileService.resendInvitations).toHaveBeenCalledWith('abc@Gmail.com','1',['guest']);
    expect(component.getTableData).toHaveBeenCalled();

    component.invite('abc@Gmail.com','1',['guest']);
    expect(transientService.open).toHaveBeenCalled();

    component.invite('abc@Gmail.com','1',['guest']);
    expect(transientService.open).toHaveBeenCalled();
  }));
  // it('resendInvitation(), confirmation dialog return yes', fakeAsync(() => {
  //   const successResponse: TeamActionResponse = {
  //     acknowledge: true,
  //     errorMsg: null,
  //   };
  //   spyOn(profileService, 'getTeamMembers').and.returnValues(of(teamMemberResponse), of(teamMemberResponse));
  //   spyOn(profileService, 'resendInvitations').and.returnValues(of(successResponse));
  //   spyOn(userService, 'getUserDetails').and.returnValues(of(userDetailsobject));
    
  //   spyOn(component, 'invite');
  //   component.ngOnInit();
  //   spyOn(globalDialogService, 'confirm').and.callFake(({}, cb) => {
  //     expect(typeof cb).toBe('function');
  //     cb('yes');
  //   });
  //   component.selection.toggle(mockMember);
  //   component.resendInvitation();
  //   expect(component.invite).toHaveBeenCalledWith(mockMember.email,userDetailsobject.orgId, mockMember.roles.map(d=> d.roleId));
  // }));
  it('resendInvitation(), confirmation dialog return no', fakeAsync(() => {
    const successResponse: TeamActionResponse = {
      acknowledge: true,
      errorMsg: null,
    };
    spyOn(profileService, 'getTeamMembers').and.returnValues(of(teamMemberResponse));
    spyOn(profileService, 'resendInvitations').and.returnValues(of(successResponse));
    spyOn(userService, 'getUserDetails').and.returnValues(of(userDetailsobject));

    spyOn(component, 'invite');
    component.ngOnInit();
    spyOn(globalDialogService, 'confirm').and.callFake(({}, cb) => {
      expect(typeof cb).toBe('function');
      cb('no');
    });
    const result = component.resendInvitation(mockMember);
    expect(result).toBeFalsy();
  }));

  it('setActiveInactiveStatus(), should activate member', async(() => {
    spyOn(profileService, 'getTeamMembers').and.returnValues(of(teamMemberResponse));

    const successResponse: TeamActionResponse = {
      acknowledge: true,
      errorMsg: null,
    };
    const failResponse: TeamActionResponse = {
      acknowledge: false,
      errorMsg: null,
    };
    spyOn(profileService, 'activateMembers').and.returnValues(of(successResponse), of(failResponse), throwError({ message: 'api error' }));
    spyOn(component, 'getTableData');


    component.ngOnInit();
    profileService.activateMembers([mockMember.email]);
    expect(profileService.activateMembers).toHaveBeenCalledWith([mockMember.email]);
    expect(component.getTableData).toHaveBeenCalled();
  }));

  it('setStatus(), confirmation dialog return yes for single user (ACTIVE)',
    fakeAsync(() => {
    spyOn(profileService, 'getTeamMembers').and.returnValues(of(teamMemberResponse));

    spyOn(component, 'setActiveInactiveStatus');
    component.ngOnInit();
    spyOn(globalDialogService, 'confirm').and.callFake(({}, cb) => {
      expect(typeof cb).toBe('function');
      cb('yes');
    });

    component.selectedRecordsList = [mockdata[0]];
    component.setActiveInactiveStatus('ACTIVE');
    expect(component.setActiveInactiveStatus).toHaveBeenCalledWith('ACTIVE');
  }));

  it('setStatus(), confirmation dialog return yes for single user (INACTIVE)',
    fakeAsync(() => {
    spyOn(profileService, 'getTeamMembers').and.returnValues(of(teamMemberResponse));

    spyOn(component, 'setActiveInactiveStatus');
    component.ngOnInit();
    spyOn(globalDialogService, 'confirm').and.callFake(({}, cb) => {
      expect(typeof cb).toBe('function');
      cb('yes');
    });

    component.selectedRecordsList = [mockdata[0]];
    component.setActiveInactiveStatus('INACTIVE');
    expect(component.setActiveInactiveStatus).toHaveBeenCalledWith('INACTIVE');
  }))

  it('setStatus(), confirmation dialog return yes for multiple user',
    fakeAsync(() => {
      spyOn(profileService, 'getTeamMembers').and.returnValues(of(teamMemberResponse));
      spyOn(component, 'setActiveInactiveStatus');
      component.ngOnInit();
      spyOn(globalDialogService, 'confirm').and.callFake(({ }, cb) => {
        expect(typeof cb).toBe('function');
        cb('yes');
      });

      component.selectedRecordsList = mockdata;
      component.setActiveInactiveStatus('ACTIVE');
      expect(component.setActiveInactiveStatus).toHaveBeenCalledWith('ACTIVE');
  }));

  it('setStatus(), confirmation dialog return yes for multiple user (INACTIVE)',
    fakeAsync(() => {
      spyOn(profileService, 'getTeamMembers').and.returnValues(of(teamMemberResponse));

      spyOn(component, 'setActiveInactiveStatus');
      component.ngOnInit();
      spyOn(globalDialogService, 'confirm').and.callFake(({ }, cb) => {
        expect(typeof cb).toBe('function');
        cb('yes');
      });

      component.selectedRecordsList = mockdata;
      component.setActiveInactiveStatus('INACTIVE');
      expect(component.setActiveInactiveStatus).toHaveBeenCalledWith('INACTIVE');
  }));

  it('setStatus(), confirmation dialog return no for single user', fakeAsync(() => {
    spyOn(profileService, 'getTeamMembers').and.returnValues(of(teamMemberResponse));

    spyOn(component, 'setStatus');
    component.ngOnInit();
    spyOn(globalDialogService, 'confirm').and.callFake(({}, cb) => {
      expect(typeof cb).toBe('function');
      cb('no');
    });
    const result = component.setStatus('ACTIVE');
    expect(result).toBeFalsy();
  }));

  it('setStatus(), confirmation dialog return no for multiple user', fakeAsync(() => {
    spyOn(profileService, 'getTeamMembers').and.returnValues(of(teamMemberResponse));

    spyOn(component, 'setStatus');
    component.ngOnInit();
    spyOn(globalDialogService, 'confirm').and.callFake(({}, cb) => {
      expect(typeof cb).toBe('function');
      cb('no');
    });
    const result = component.setStatus('ACTIVE');
    expect(result).toBeFalsy();
  }));

  it('setSelectedRole(), should update selected roles to filter', async(() => {
    spyOn(profileService, 'getTeamMembers').and.returnValues(of(teamMemberResponse));

    component.ngOnInit();
    component.setSelectedRole(teamRoleResponse.listPage.content[0]);
    expect(component.selectedRoles.length).toBe(1);

    component.setSelectedRole(teamRoleResponse.listPage.content[0]);
    expect(component.selectedRoles.length).toBe(0);

    const result = component.setSelectedRole(null);
    expect(result).toBeFalsy();
  }));

  it('onPageChange(), should call getTableData with updated pagination', async(() => {
    spyOn(profileService, 'getTeamMembers').and.returnValues(of(teamMemberResponse), of(teamMemberResponse), of(teamMemberResponse));

    const pageEvent = {
      pageIndex: 2,
      pageSize: 10,
      length: 50,
    };
    component.ngOnInit();
    component.onPageChange(pageEvent);
    expect(component.recordsPageIndex).toBe(pageEvent.pageIndex);

    const result = component.onPageChange(pageEvent);
    expect(result).toBeFalsy();
  }));

  it('roleScrollEnd(), should get roles on scroll down', async(() => {
    spyOn(component, 'getRoles');
    component.roleScrollEnd();
    expect(component.rolePageIndex).toEqual(2);
    expect(component.getRoles).toHaveBeenCalled();

    component.roleInfinteScrollLoading = false;
    component.roleScrollEnd();
    expect(component.recordsPageIndex).toEqual(1);

    component.roleInfinteScrollLoading = true;
    const result = component.roleScrollEnd();
    expect(result).toBeNull();
  }));

  it('afterStatusAndRoleMenuClosed(), should get getTableData on filter applied', async(() => {
    spyOn(profileService, 'getTeamMembers').and.returnValues(of(teamMemberResponse));
    spyOn(component, 'getTableData');
    component.afterStatusAndRoleMenuClosed();
    expect(component.recordsPageIndex).toEqual(1);
    expect(component.getTableData).toHaveBeenCalled();
  }));
});


export const teamRoleResponse: TeamRoleResponse = {
  acknowledge: true,
  errorMsg: null,
  listPage: {
    content: [
      {
        uuid: '443176d6-8bf7-4c38-b621-2bf3621d3770',
        roleId: '600470494111405437',
        description: 'ADMIN10',
        lang: 'en',
        tenantId: '0' ,
      },
    ],
    pageable: {
      sort: {
        sorted: false,
        unsorted: true,
        empty: true,
      },
      pageNumber: 0,
      pageSize: 5,
      offset: 0,
      paged: true,
      unpaged: false,
    },
    totalElements: 1,
    last: true,
    totalPages: 1,
    sort: {
      sorted: false,
      unsorted: true,
      empty: true,
    },
    number: 0,
    numberOfElements: 1,
    first: true,
    size: 5,
    empty: false,
  },
};
export const teamMemberResponse: TeamMemberResponse = {
  acknowledge: true,
  errorMsg: 'string',
  userList: {
    content: [
      {
        userName: 'Merrill Rice',
        fname: 'Patrick',
        lname: 'Tanner',
        roles: [
          {
            roleDesc: 'Admin',
            roleId: '600470494111405437',
          },
          {
            roleDesc: 'Manager',
            roleId: '600470494111405438',
          },
        ],
        status: 'Active',
        joinedDate: '2020-11-21T12:32:44',
        lastActiveDate: '2020-07-02T09:36:52',
        email: 'Patrick@gmail.com',
      },
    ],
    empty: true,
    first: true,
    last: true,
    number: 0,
    numberOfElements: 0,
    pageable: {
      offset: 0,
      pageNumber: 0,
      pageSize: 0,
      paged: true,
      sort: {
        empty: true,
        sorted: true,
        unsorted: true,
      },
      unpaged: true,
    },
    size: 0,
    sort: {
      empty: true,
      sorted: true,
      unsorted: true,
    },
    totalElements: 0,
    totalPages: 0,
  },
};
export const allStatus: string[] = ['ACTIVE', 'LOCKED', 'INACTIVE', 'INVITED', 'REVOKED', 'INVITE_EXPIRED'];
