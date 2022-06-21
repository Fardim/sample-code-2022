import { MdoUiLibraryModule } from 'mdo-ui-library';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { TransientService } from 'mdo-ui-library';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { FormInputComponent } from '../form-input/form-input.component';

import { SubscriberInviteSidesheetComponent } from './subscriber-invite-sidesheet.component';


describe('SubscriberInviteSidesheetComponent', () => {
  let component: SubscriberInviteSidesheetComponent;
  let fixture: ComponentFixture<SubscriberInviteSidesheetComponent>;
  const formBuilder: FormBuilder = new FormBuilder();
  let router: Router;
  let schemaDetailsService: SchemaDetailsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SubscriberInviteSidesheetComponent,
        FormInputComponent
      ],
      imports: [ MdoUiLibraryModule,
        HttpClientTestingModule,
        MatSnackBarModule,
        ReactiveFormsModule,
        RouterTestingModule,
        AppMaterialModuleForSpec
      ],
      providers: [
        { provide: FormBuilder, useValue: formBuilder },
        { provide: ActivatedRoute,
          useValue: { params: of({schemaId: 'schema', outlet: 'sb'}) }
        },
        TransientService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriberInviteSidesheetComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
    router = TestBed.inject(Router);
    schemaDetailsService = fixture.debugElement.injector.get(SchemaDetailsService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('initInviteForm(), should create invitation form', async () => {
    component.invitationForm = null;
    component.initInviteForm();
    expect(component.invitationForm.value.invites.length).toEqual(1);
  });

  it('addFormRow(), should add a new row to invites control', async () => {
    component.invitationForm = null;
    component.initInviteForm();
    expect(component.invitationForm.value.invites.length).toEqual(1);
  });

  it('invites().removeAt(inviteIndex), should remove a row based on the index', async () => {
    component.invitationForm = null;
    component.initInviteForm();
    expect(component.invitationForm.value.invites.length).toEqual(1);
    component.invites().removeAt(0);
    expect(component.invitationForm.value.invites.length).toEqual(0);
  });

  it('invites(), should return form array', async () => {
    component.invitationForm = null;
    component.initInviteForm();
    expect(component.invites().controls.length).toEqual(1);
  });

  it('should close sidesheet', () => {
    spyOn(router, 'navigate');
    component.closeDialog();
    expect(router.navigate).toHaveBeenCalledWith([{outlets: {outer: null}}], {queryParamsHandling: 'preserve'});
  });

  it('should mapSubscribers', () => {
    const result = component.mapSubscribers({email: 'bilel@prospecta.com', role: 'Reviewer'});
    expect(result.userid).toEqual('bilel@prospecta.com');
  });

  it('should setFormValue', () => {
    component.initInviteForm();
    component.setFormValue('bilel@prospecta.com', 'email', 0);
    expect(component.invites().at(0).value.email).toEqual('bilel@prospecta.com');
  });

  it('should remove invite after confim', () => {
    component.initInviteForm();
    component.removeInviteAfterConfirm('no', 0);
    component.removeInviteAfterConfirm('yes', 0);
    expect(component.invites().length).toEqual(0);
  })

  it('should init component', () => {
    spyOn(component, 'initInviteForm');
    component.ngOnInit();
    expect(component.initInviteForm).toHaveBeenCalled();
  });

  it('should create new invite', () => {
    component.initInviteForm();
    const group: FormGroup = component.newInvite();
    expect(group).toBeDefined();
  });

  it('should send invite', () => {

    spyOn(schemaDetailsService, 'createUpdateUserDetails').and.returnValue(of());

    component.initInviteForm();
    component.sendInvitation();

    component.invites().at(0).setValue({email : 'bilel@prospecta.com', role: 'Reviewer'});
    component.sendInvitation();

    component.outlet = 'outer';
    component.sendInvitation();
    expect(schemaDetailsService.createUpdateUserDetails).toHaveBeenCalledTimes(1);

  });


});
