import { MdoUiLibraryModule } from 'mdo-ui-library';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { TransientService } from 'mdo-ui-library';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { FormInputComponent } from '../form-input/form-input.component';

import { SubscriberInviteComponent } from './subscriber-invite.component';

const mockDialogRef = {
  close: jasmine.createSpy('close')
};

describe('SubscriberInviteComponent', () => {
  let component: SubscriberInviteComponent;
  let fixture: ComponentFixture<SubscriberInviteComponent>;
  const formBuilder: FormBuilder = new FormBuilder();
  let schemaDetailsService : SchemaDetailsService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SubscriberInviteComponent,
        FormInputComponent
      ],
      imports: [ MdoUiLibraryModule,
        HttpClientTestingModule,
        HttpClientModule,
        MatSnackBarModule,
        AppMaterialModuleForSpec,
        ReactiveFormsModule
      ],
      providers: [
        { provide: FormBuilder, useValue: formBuilder },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: [] },
        TransientService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriberInviteComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();

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

  it('should init component', () => {
    spyOn(component, 'initInviteForm');
    component.ngOnInit();
    expect(component.initInviteForm).toHaveBeenCalled();
  });

  it('should create new invite', () => {
    component.initInviteForm();
    const group: FormGroup = component.newInvite();
    expect(group.value.email).toEqual('');
  });

  it('should close', () => {
    component.closeDialog();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should send invite', () => {

    spyOn(schemaDetailsService, 'createUpdateUserDetails').and.returnValue(of());
    component.initInviteForm();
    component.sendInvitation();

    component.invites().at(0).setValue({email : 'bilel@prospecta.com', role: 'Reviewer'});

    component.sendInvitation();
    expect(schemaDetailsService.createUpdateUserDetails).toHaveBeenCalledTimes(1);

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
  });

  it('should mapSubscribers', () => {
    const result = component.mapSubscribers({email: 'bilel@prospecta.com', role: 'Reviewer'});
    expect(result.userid).toEqual('bilel@prospecta.com');
  });

  it('should get form control', () => {
    component.initInviteForm();
    expect(component.formField(0, 'email')).toBeDefined();
  })

});
