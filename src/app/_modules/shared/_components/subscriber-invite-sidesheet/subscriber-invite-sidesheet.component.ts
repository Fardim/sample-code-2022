import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PermissionType, SchemaDashboardPermission } from '@models/collaborator';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { GlobaldialogService } from '@services/globaldialog.service';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { TransientService } from 'mdo-ui-library';

@Component({
  selector: 'pros-subscriber-invite-sidesheet',
  templateUrl: './subscriber-invite-sidesheet.component.html',
  styleUrls: ['./subscriber-invite-sidesheet.component.scss']
})
export class SubscriberInviteSidesheetComponent implements OnInit {

  /**
   * Form object for Invitation
   */
  invitationForm: FormGroup;
  submitted = false;
  /**
   * Id of schema for which subscribers will be invited
   */
  schemaId: string;

  /**
   * To hold outlet in which component exists
   */
  outlet: string;


  /**
   * constructor of the class
   * @param globalDialogService global dialog service object
   * @param schemaDetailsService schema details service
   */
  constructor(
    private _formBuilder: FormBuilder,
    private globalDialogService: GlobaldialogService,
    private schemaDetailsService: SchemaDetailsService,
    private sharedService: SharedServiceService,
    private transientService: TransientService,
    private activatedRoute: ActivatedRoute,
    private router: Router) { }

  /**
   * Angular hook
   */
  ngOnInit(): void {
    console.log('this is the component')
    this.activatedRoute.params.subscribe((params) => {
      this.schemaId = params.schemaId;
      this.outlet = params.outlet;
    })

    this.initInviteForm();
  }

  /**
   * Initiate the invitation form
   */
  initInviteForm() {
    this.invitationForm = this._formBuilder.group({
      invites: this._formBuilder.array([])
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
    this.router.navigate([{outlets: {outer: null}}], {queryParamsHandling: 'preserve'});
  }

  /**
   * Call api to send invite
   */
  sendInvitation() {
    this.submitted = true;
    if(!this.invitationForm.valid){
      (Object).values(this.invites().controls).forEach(outerControl => {
      (Object).values((outerControl as FormArray).controls).forEach(control=>{
        if(control.invalid)
        control.markAsTouched()})
      });
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

    if(this.outlet === 'outer') {
      this.schemaDetailsService.createUpdateUserDetails(body)
      .subscribe((res) => {
        this.sharedService.setAfterSubscriberSave(res);
        this.closeDialog();
        this.invitationForm.reset();
      })
    }
    else {
      this.sharedService.setAfterSubscriberSave(body);
      this.closeDialog();
    }
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
       schemaId: this.schemaId,
       sno: Math.floor(Math.random() * 100000000000).toString(),
       userMdoModel: null,
       userid: email,
       dataAllocation: null,
       isCopied: false,
       isInvited: true
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
