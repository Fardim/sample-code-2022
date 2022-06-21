import { teamRoleResponse } from './../team.component.spec';
import { GlobaldialogService } from './../../../../../_services/globaldialog.service';
import { Role, TeamActionResponse } from './../../../../../_models/teams';
import { MatChipInputEvent } from '@angular/material/chips';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { TeamService } from './../../../../../_services/user/team.service';
import { Router } from '@angular/router';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { TeamInviteComponent } from './team-invite.component';
import { TransientService } from 'mdo-ui-library';
import { UserProfileService } from '@services/user/user-profile.service';

describe('TeamInviteComponent', () => {
  let component: TeamInviteComponent;
  let fixture: ComponentFixture<TeamInviteComponent>;
  let router: Router;
  let teamService: TeamService;
  let profileService: UserProfileService;
  let globalDialogService: GlobaldialogService;
  let transientService: TransientService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TeamInviteComponent],
      imports: [AppMaterialModuleForSpec, RouterTestingModule, SharedModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamInviteComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
    teamService = fixture.debugElement.injector.get(TeamService);
    profileService = fixture.debugElement.injector.get(UserProfileService);
    router = TestBed.inject(Router);
    globalDialogService = fixture.debugElement.injector.get(GlobaldialogService);
    transientService = fixture.debugElement.injector.get(TransientService);
  });

  it('should create', () => {
    spyOn(profileService, 'getTeamRoles').and.returnValues(of(teamRoleResponse));
    expect(component).toBeTruthy();
  });

  it('should call ngOnInit()', () => {
    spyOn(profileService, 'getTeamRoles').and.returnValues(of(teamRoleResponse));
    spyOn(component, 'getRoles');
    spyOn(component, 'createInviteForm');
    fixture.detectChanges();

    expect(component.getRoles).toHaveBeenCalled();
    expect(component.createInviteForm).toHaveBeenCalled();
  });

  it('should call getRoles()', async(() => {
    spyOn(profileService, 'getTeamRoles').and.returnValues(of(teamRoleResponse));
    // fixture.detectChanges();
    component.getRoles();

    expect(component.allRoles.length).toBeGreaterThan(0);
    expect(component.showSkeleton).toBeFalse();
  }));

  it('close()', async(() => {
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { outer: null } }], {
      queryParamsHandling: 'preserve',
    });
  }));

  it('add() remove() addAnother() removeItem() invite()', async(() => {
    spyOn(profileService, 'getTeamRoles').and.returnValues(of(teamRoleResponse), of(teamRoleResponse), of(teamRoleResponse));
    spyOn(window, 'confirm').and.callFake(() => {
      return true;
    });
    spyOn(router, 'navigate');
    const inviteResponseSuccess: TeamActionResponse = {
      acknowledge: true,
      errorMsg: '',
    };
    const inviteResponseFailed: TeamActionResponse = {
      acknowledge: false,
      errorMsg: '',
    };
    spyOn(profileService, 'inviteTeamMembers').and.returnValues(of(inviteResponseSuccess), of(inviteResponseFailed));
    spyOn(globalDialogService, 'confirm').and.callFake(({}, cb) => {
      expect(typeof cb).toBe('function');
      cb('yes');
    });
    spyOn(component, 'close');
    spyOn(transientService, 'open');
    fixture.detectChanges();

    /**
     * add() remove()
     */
    let event = { input: { value: 'kaise@yopmail.com' }, value: 'kaise@yopmail.com' } as MatChipInputEvent;
    component.add(event);
    expect(component.multipleEmails.length).toEqual(1);

    event = { input: { value: '' }, value: '' } as MatChipInputEvent;
    let addResult = component.add(event);
    expect(addResult).toBeFalsy();

    event = { input: null, value: '' } as MatChipInputEvent;
    addResult = component.add(event);
    expect(addResult).toBeFalsy();

    component.remove('kaise@yopmail.com');
    expect(component.multipleEmails.length).toEqual(0);
    const removeResult = component.remove('kaise@yopmail.com');
    expect(removeResult).toBeFalsy();

    /**
     * addAnother() removeItem()
     */
    component.addAnother('kaiser@yopmail.com');
    expect(component.invitationsFormArray.value.length).toEqual(2);
    component.addAnother('');
    expect(component.invitationsFormArray.value.length).toEqual(3);
    component.removeItem(2);
    expect(component.invitationsFormArray.value.length).toEqual(2);

    /**
     * invite()
     */
    const payload = component.inviteForm.value.invitations;
    component.invite();
    expect(profileService.inviteTeamMembers).toHaveBeenCalledWith(payload,'');
    expect(component.close).toHaveBeenCalled();
  }));

  it('addMultipleUser', fakeAsync(() => {
    spyOn(profileService, 'getTeamRoles').and.returnValues(of(teamRoleResponse));
    spyOn(component, 'doUpdateEmailList');
    component.ngOnInit();

    component.multipleRoles = ['1701'];
    component.multipleEmails = ['fk@gmail.com', 'gk@gmail.com'];
    component.addMultipleUser();
    tick(15);
    expect(component.doUpdateEmailList).toHaveBeenCalled();
    expect(component.invitationsFormArray.value.length).toEqual(3);
  }));

  it('optionCtrl valuechanges', fakeAsync(() => {
    spyOn(component, 'getRoles');
    spyOn(profileService, 'getTeamRoles').and.returnValues(of(teamRoleResponse));
    component.ngOnInit();

    component.optionCtrl.setValue('guest');
    tick(1000);
    expect(component.getRoles).toHaveBeenCalled();
  }));

  it('ngOnDestroy()', () => {
    spyOn(component.unsubscribeAll$, 'unsubscribe');
    component.ngOnDestroy();
    expect(component.unsubscribeAll$.unsubscribe).toHaveBeenCalled();
  });

  it('toggleErrorsFilter', () => {
    component.createInviteForm();
    component.toggleErrorsFilter();
    expect(component.applyErrorsFilter).toBeTrue();
  });

  it('updateMultipleInvitRoles', () => {
    const role = {roleId: '1701', description: 'Admin'} as Role;
    component.updateMultipleInvitRoles(role.roleId);
    expect(component.multipleRoles.length).toEqual(1);

    component.updateMultipleInvitRoles(role.roleId);
    expect(component.multipleRoles.length).toEqual(0);
  });
});
