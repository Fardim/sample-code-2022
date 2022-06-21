import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PermissionType, SchemaDashboardPermission } from '@models/collaborator';
import { GlobaldialogService } from '@services/globaldialog.service';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { TransientService } from 'mdo-ui-library';

@Component({
  selector: 'pros-subscriber-invite',
  templateUrl: './subscriber-invite.component.html',
  styleUrls: ['./subscriber-invite.component.scss']
})
export class SubscriberInviteComponent implements OnInit {

  /**
   * Form object for Invitation
   */
  invitationForm: FormGroup;
  submitted = false;
  /**
   * constructor of the class
   * @param dialogRef mat dialog ref object
   * @param data data from parent component
   * @param globalDialogService global dialog service object
   * @param schemaDetailsService schema details service
   * @param transientService mat snackbar for notifications
   */
  constructor(
    public dialogRef: MatDialogRef<SubscriberInviteComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private _formBuilder: FormBuilder,
    private globalDialogService: GlobaldialogService,
    private schemaDetailsService: SchemaDetailsService,
    private transientService: TransientService) { }

  /**
   * Angular hook
   */
  ngOnInit(): void {
    this.initInviteForm();
  }

  /**
   * Initiate the invitation form
   */
  initInviteForm() {
    this.invitationForm = this._formBuilder.group({
      invites: this._formBuilder.array([])
    });

    this.invitationForm.valueChanges.subscribe((formData) => {
    });

    this.addFormRow();
  }

  /**
   * create new invite form group
   */
  newInvite(): FormGroup {
    return this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      role: ['viewer', Validators.required]
    });
  }

  /**
   * function to return formField
   */
  formField(index: number, field: string) {
    return this.invites().controls[index].get(field);
  }

  /**
   * Add a form row to invites array
   */
  addFormRow() {
    this.invites().push(this.newInvite());
  }

  /**
   * remove a form row to invites array
   * @param inviteIndex pass the row index to remove
   */
  removeInvite(inviteIndex: number) {
    this.globalDialogService.confirm({ label: 'Are you sure to delete ?' }, (res) => {
      this.removeInviteAfterConfirm(res, inviteIndex);
    });
  }

  removeInviteAfterConfirm(resp: string, inviteIndex: number) {
    if (resp === 'yes') {
      this.invites().removeAt(inviteIndex);
    }
  }

  /**
   * return the formArray value
   */
  invites(): FormArray {
    return this.invitationForm.get('invites') as FormArray;
  }

  /**
   * Close the dialog
   */
  closeDialog() {
    this.dialogRef.close()
  }

  /**
   * Call api to send invite
   */
  sendInvitation() {
    this.submitted = true;
    if(!this.invitationForm.valid){
      this.transientService.open('Please enter the required fields', 'Dismiss');
      return;
    }
    const body: SchemaDashboardPermission[] = []
    const formData = this.invitationForm.value.invites;
    formData.map((data) => {
      if(data.email){
        body.push(this.mapSubscribers(data));
      }
    });

    this.schemaDetailsService.createUpdateUserDetails(body)
      .subscribe((res) => {
        this.invitationForm.reset();
      })
  }

  /**
   * map subscribers data to correct format for api call
   * @param param pass the form data
   */
  mapSubscribers({email, role}): SchemaDashboardPermission {
    return {
       description: '',
       filterCriteria: [],
       groupHeaderModel: null,
       groupid: '',
       isAdmin: role === 'admin',
       isEditer: role === 'editer',
       isReviewer: role === 'reviewer',
       isViewer: role === 'viewer',
       permissionType: PermissionType.USER,
       plantCode: '',
       roleId: '',
       rolesModel: null,
       schemaId: '',
       sno: Math.floor(Math.random() * 100000000000).toString(),
       userMdoModel: null,
       userid: email,
       dataAllocation: null,
       isCopied: false
    }
  }

  /**
   * method to set value manually to inviteForm
   * @param val Pass the value
   * @param key Pass the form key
   * @param index Pass the index
   */
  setFormValue(val: any, key: string, index: number) {
    const availableControls: any = this.invites().controls[index];
    availableControls.controls[key].setValue(val);
  }
}
