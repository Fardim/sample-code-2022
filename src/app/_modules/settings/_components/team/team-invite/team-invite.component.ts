import { Role, RoleRequestDto } from './../../../../../_models/teams';
import { validationRegex } from './../../../../../_constants/globals';
import { GlobaldialogService } from './../../../../../_services/globaldialog.service';
import { MatChipInputEvent } from '@angular/material/chips';
import { ENTER, COMMA, SPACE, I } from '@angular/cdk/keycodes';
import { TeamService } from './../../../../../_services/user/team.service';
import { take, startWith, takeUntil, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy, Inject, LOCALE_ID } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { TransientService } from 'mdo-ui-library';
import { UserService } from '@services/user/userservice.service';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { UserProfileService } from '@services/user/user-profile.service';
import { Dataset } from '@models/schema/schema';
import { CoreService } from '@services/core/core.service';
import { FilterCriteria } from '@models/list-page/listpage';
import { ListService } from '@services/list/list.service';

@Component({
  selector: 'pros-team-invite',
  templateUrl: './team-invite.component.html',
  styleUrls: ['./team-invite.component.scss'],
})
export class TeamInviteComponent implements OnInit, OnDestroy {
  /**
   * All the roles of the team get from api
   */
  allRoles: Role[] = [];
  /**
   * Formgroup to create the Invitatin form array
   */
  inviteForm: FormGroup = null;
  /**
   * for each default invitation row the default role is assumed to be guest
   */
  defaultRole = 'guest';
  /**
   * To show input field for multiple Address input
   */
  enableMultipleAddress = false;
  /**
   * Emails array, to hold the multiple address input value
   */
  multipleEmails: string[] = [];
  multipleRoles: string[] = [];
  readonly separatorKeysCodes = [ENTER, COMMA, SPACE] as const;
  /**
   * when loading at first show skeleton
   */
  showSkeleton = true;
  /**
   * Form control for the input
   */
  optionCtrl = new FormControl();
  /**
   * hold the list of filtered options
   */
  filteredOptions: Observable<Role[]>;
  /**
   * role infinite scroll page size
   */
  rolePageSize = 10;
  /**
   * role page index of infinite scroll
   */
  rolePageIndex = 1;
  /**
   * role search text
   */
   roleSearchString = '';
   /**
    * to check if a current get call is running on the table
    */
    roleInfinteScrollLoading = false;
  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();

  /**
   * Flag to display only invalid invitation
   */
  applyErrorsFilter = false;

  /**
   * Error sending invite email
   */
  invitationNotSent = false;

  allSelectedRoles: Role[] = [];

  emailList: string[] = [];

  isFromPartner = false;

  submitted = false;

  datasetListObs: Observable<Dataset[]> = of([]);

  datasetSearchSub: Subject<string> = new Subject();
  recordSearchSub: Subject<{s: string, index: number}> = new Subject();

  recordsList: string[] = [];

  datasetForBulk: any;
  recordIdForBulk: string;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private teamService: TeamService,
    private profileService: UserProfileService,
    private fb: FormBuilder,
    private globalDialogService: GlobaldialogService,
    private transientService: TransientService,
    private userService: UserService,
    private sharedService: SharedServiceService,
    private coreService: CoreService,
    private listService: ListService,
    @Inject(LOCALE_ID) public locale: string
  ) {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
  }

  /**
   * get roles and create the inviteform with a empty row
   */
  ngOnInit(): void {

    this.activatedRoute.fragment.subscribe(activeTab => {
      this.isFromPartner = !!(activeTab === '1');
      this.createInviteForm();
    });

    this.optionCtrl.valueChanges.pipe(
      debounceTime(1000), distinctUntilChanged(),
      takeUntil(this.unsubscribeAll$),
      startWith('')
    ).subscribe(searchString => {
      this.roleSearchString = searchString || '';
      this.rolePageIndex = 1;
      this.allRoles = [];
      this.getRoles();
    });

    this.datasetSearchSub.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(s => {
      this.getAllObjectType(s);
    });

    this.recordSearchSub.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(params => {
      this.getData(params.s, params.index);
    });
  }
  /**
   * Call api to get roles
   */
  getRoles() {
    const requestDto: RoleRequestDto = {
      pageInfo: {
        pageNumer: this.rolePageIndex - 1,
        pageSize: this.rolePageSize,
      },
      searchString: this.roleSearchString,
    };
    this.profileService
      .getTeamRoles(requestDto)
      .pipe(take(1))
      .subscribe((resp) => {
        this.allRoles = resp.listPage.content;
        this.filteredOptions = of(resp.listPage.content);
        this.showSkeleton = false;
      });
  }
  /**
   * inviteform with a empty row
   */
  createInviteForm() {
    this.inviteForm = this.fb.group({
      invitations: this.fb.array([
        this.createInvitationGroup()
      ]),
    });
  }

  /**
   * add a row in the formarray with empty or a email
   * @param email string field
   */
  addAnother(email?: string, roles?, dataset?, recordId?) {
    this.invitationsFormArray.push(
      this.createInvitationGroup(email, roles, dataset, recordId)
    );
  }

  createInvitationGroup(email?: string, roles?, dataset?, recordId?) {
    const group = this.fb.group({
      email: [email || '', [Validators.required, Validators.pattern(validationRegex.email), this.uniquenessValidator()]],
      roles: [roles|| [], [Validators.required, rolesValidator(1)]]
    });

    if(this.isFromPartner) {
      group.addControl('dataset', this.fb.control(dataset ? dataset: null, Validators.required));
      group.addControl('recordId', this.fb.control({value: recordId ? recordId : null, disabled: !dataset?.datasetId}, Validators.required));
      group.get('dataset').valueChanges.subscribe(v => {
        group.get('recordId').setValue(null);
        if(!group.value?.dataset?.datasetId) {
          group.get('recordId').disable();
        } else {
          group.get('recordId').enable();
        }
        this.recordsList = [];
      });
    }
    return group;
  }

  updateEmailList(email: string) {
    email = email.toLowerCase();
    // const index = this.emailList.indexOf(email);
    const matched = email.match(validationRegex.email);
    if (email && matched && matched.length > 0) {
      // this.emailList.push(email);
      const emails = this.inviteForm.value.invitations.map(d=> d.email);
      this.emailList = emails;
    }
  }

  /**
   * remove the formgroup from formarray with the index
   * @param idx index in the formarray
   */
  removeItem(idx) {
    this.transientService.confirm({
      data: { dialogTitle: 'Confirmation', label: $localize`:@@delete_message:Are you sure to delete ?` },
      disableClose: true,
      autoFocus: false,
      width: '600px',
    }, ((response) => {
        if (response === 'yes') {
          this.invitationsFormArray.removeAt(idx);
        }
    }));
  }

  /**
   * after inserting multiple address in the input field, this method will add those address to the formarray and makes the enableMultipleAddress to false
   */
  addMultipleUser() {
    if(!this.multipleRoles.length) {
      return;
    }
    this.enableMultipleAddress = false;
    this.multipleEmails.forEach((email) => {
      this.addAnother(email, JSON.parse(JSON.stringify(this.multipleRoles)), this.datasetForBulk, this.recordIdForBulk);
      this.invitationsFormArray.markAllAsTouched();
    });
    this.doUpdateEmailList();
  }

  /**
   * Detect if the invite button should be enabled
   */
  get canInvite() {
    if(this.enableMultipleAddress) {
      return !this.multipleEmails?.length || !this.multipleRoles?.length;
    } else {
      return !this.invitationsFormArray?.length || !this.inviteForm?.valid;
    }
  }

  doUpdateEmailList() {
    setTimeout(() => {
      this.multipleEmails.forEach((email) => {
        this.updateEmailList(email);
      });
      this.multipleEmails = [];
      this.multipleRoles = [];
    }, 10);
  }

  /**
   * onblur, enter, comma add the string email to the multipleEmails array if the string is a valid email address
   * @param event chipvalue
   */
  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = (event.value || '').trim().toLowerCase();
    const index = this.multipleEmails.indexOf(value);
    const matched = value.match(validationRegex.email);
    // Add our fruit
    if (value && index < 0 && matched && matched.length > 0) {
      this.multipleEmails.push(value);
    }

    // Clear the input value
    if (input) {
      input.value = '';
    }
  }

  /**
   * remove a email address on click of the chip cancel click from multipleEmails
   * @param email string email address
   */
  remove(email: string): void {
    const index = this.multipleEmails.indexOf(email);

    if (index >= 0) {
      this.multipleEmails.splice(index, 1);
    }
  }

  close() {
    this.router.navigate([{ outlets: { outer: null } }], { queryParamsHandling: 'preserve', preserveFragment: true });
  }



  /**
   * post the invitation fromarry to server to call the invitation
   */
  invite() {
    if(this.enableMultipleAddress) {
      this.multipleEmails.forEach((email: string, index: number) => {
        if(index === 0) {
          const formGroup = this.invitationsFormArray?.controls[index] as FormGroup;
          formGroup?.controls.email.setValue(email);
          formGroup?.controls.roles.setValue(this.multipleRoles);
        } else {
          this.addAnother(email, this.multipleRoles);
        }
      });
    }

    if(!this.inviteForm.valid) {
      this.transientService.open('Please complete the required field(s).', null, { duration: 2000, verticalPosition: 'bottom'});
      return;
    }
    let invitations;
    if(this.isFromPartner) {
      invitations = this.inviteForm.value.invitations.map(inv => {
        return {email: inv.email, roles: inv.roles, datasetId: inv.dataset.datasetId, recordNumber: inv.recordId}
      })
    } else {
      invitations = this.inviteForm.value.invitations;
    }

    this.userService.getUserDetails().pipe(distinctUntilChanged()).subscribe(user=>{
      this.profileService
      .inviteTeamMembers(invitations, user.orgId, this.isFromPartner)
      .pipe(take(1))
      .subscribe((resp) => {
        if (resp.acknowledge && (!resp.response || !resp.response.length)) {
          this.sharedService.isUserDetailsUpdated.next(true);
          this.transientService.open('The invitation has been sent');
          this.close();
        } else {
          const validInvites = [];
          this.invitationsFormArray.controls.forEach((ctrl, ctrlIndex) => {
            const index = resp.response.findIndex(inv => inv.email === ctrl.value.email);
            if(index !== -1) {
              this.invitationsFormArray.at(ctrlIndex).get('email').setErrors({inviteError: resp.response[index].errorMessage});
            } else {
              validInvites.push(index);
            }
          });
          validInvites.forEach(index => this.invitationsFormArray.removeAt(index));
        }
      }, error => {
        console.error(`There was an error with the email and the invite was not sent`);
        this.invitationNotSent = true;
        setTimeout(() => {
          this.invitationNotSent = false;
        }, 3000);
      });
    });

  }

  inviteSavedUser(invitations, inValidInvites) {
    const invitationList = invitations.map(invitation => {
      return {
        roleId: invitation.roles,
        userId: invitation.email
      }
    })

    if(invitationList.length) {
      this.teamService.inviteSaveUser(invitationList).subscribe(newUserResp => {
        if (newUserResp.acknowledge && !inValidInvites.length) {
          this.transientService.open('The invitation has been sent');
          this.close();
        }
      }, error => {
        console.error(`There was an error with the email and the invite was not sent`);
        this.invitationNotSent = true;
        setTimeout(() => {
          this.invitationNotSent = false;
        }, 3000);
      })
    }
  }

  get invitationsFormArray(): FormArray {
    if(this.inviteForm) {
      return this.inviteForm.get('invitations') as FormArray;
    }
    return null;
  }

  /**
   * returns an info message with the invitations count
   */
  get infoMessage() {
    if(this.invitationsFormArray) {
      let validUsersCount = 0;
      this.invitationsFormArray.controls.forEach(c => {
        if(c.get('email').valid && c.value.roles.length>0) {
          validUsersCount++;
        }
      })
      return validUsersCount;
    }
    return null;
  }

  /**
   * Returns a global validation message with the invalid fields count
   */
  get validationErrors() {
    let invalidFieldsCount = 0;
    if(this.invitationsFormArray) {
      this.invitationsFormArray.controls.forEach(c => {
        if(c.errors && c.errors.inviteError) {
          invalidFieldsCount++;
        }
        if(c.get('email').touched || c.get('roles').touched || c.get('dataset')?.touched || c.get('recordId')?.touched) {
          if(c.get('email').invalid && c.get('email').touched) {
            invalidFieldsCount++;
          }
          if(c.get('roles').invalid && c.get('roles').touched) {
            invalidFieldsCount++;
          }
          if(c.get('dataset')?.invalid && c.get('dataset')?.touched) {
            invalidFieldsCount++;
          }
          if(c.get('recordId')?.invalid && c.get('recordId')?.touched) {
            invalidFieldsCount++;
          }
        }
      });

    }
    if(!invalidFieldsCount) {
      this.applyErrorsFilter = false;
    }
    return invalidFieldsCount ? `${invalidFieldsCount}` : '';
  }

  /**
   * Display only invalid invitations
   */
  toggleErrorsFilter() {
    this.applyErrorsFilter = !this.applyErrorsFilter;
    // this.inviteForm.markAllAsTouched();
  }

  /**
   * Returns all selected roles for an invitation
   * @param rowIndex invitation row index
   * @returns all selected roles for an invitation
   */
  getSelectedRoles(rowIndex) {
    if(this.invitationsFormArray) {
      const group = this.invitationsFormArray.at(rowIndex);
      if(group) {
        return group.value.roles || [];
      }
    }
    return [];
  }

  /**
   * update selected invitation's roles
   * @param rowIndex invitation index
   * @param roleId the changed role id
   */
  updateSingleInvitRoles(rowIndex, roleId: string) {
    const selectedRoles = this.getSelectedRoles(rowIndex);
    const roleIndex = selectedRoles.findIndex(r => r === roleId);
    if(roleIndex !== -1) {
      selectedRoles.splice(roleIndex, 1)
    } else {
      selectedRoles.push(roleId);
      this.optionCtrl.reset();
    }
    this.invitationsFormArray.at(rowIndex).patchValue({roles: selectedRoles});
    this.invitationsFormArray.at(rowIndex).get('roles').markAsTouched();
    const role = this.allRoles.find(r => r.roleId === roleId);
    if(role && !this.allSelectedRoles.some(r => r.roleId === role.roleId)) {
      this.allSelectedRoles.push(role);
    }
  }

  /**
   * update selected roles for multiple invitations
   * @param roleId the changed role id
   */
  updateMultipleInvitRoles(roleId: string) {
    const roleIndex = this.multipleRoles.findIndex(r => r === roleId);
    if(roleIndex !== -1) {
      this.multipleRoles.splice(roleIndex, 1)
    } else {
      this.multipleRoles.push(roleId);
    }
    const role = this.allRoles.find(r => r.roleId === roleId);
    if(role && !this.allSelectedRoles.some(r => r.roleId === role.roleId)) {
      this.allSelectedRoles.push(role);
    }
  }

  /**
   * get role description based on role Id
   * @param roleId the role id
   * @returns the role description
   */
  getRoleDesc(roleId) {
    const role = this.allSelectedRoles.find(r => r.roleId === roleId);
    return role ? role.description || 'Unknown' : 'Unknown';
  }

  /**
   * paste multiple emails on bulk invite
   * @param event ClipboardEvent
   */
  paste(event: ClipboardEvent): void {
    event.preventDefault();
    event.clipboardData
    .getData('Text')
    .split(/,|\s/)
    .forEach(email => {
      const value = email.trim().toLowerCase();
      const index = this.multipleEmails.indexOf(value);
      const matched = value.match(validationRegex.email);
      if (value && index < 0 && matched && matched.length > 0) {
        this.multipleEmails.push(value);
      }
    });
  }

  uniquenessValidator = (): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
      // const invitations: {email: string; roles: string[]}[] =  this.inviteForm && this.inviteForm.value ? this.inviteForm.value.invitations.map(d=> d.email) : [];
      if(control.value.trim()) {
        if(this.emailList.indexOf(control.value.trim().toLowerCase()) >= 0) {
          return {uniqenessError: true};
        } else {
          return null;
        }
      } else {
        return null;
      }
    };
  }

  getAllObjectType(searchTerm='') {
    this.coreService.getDataSets(searchTerm, 0, 20, this.locale)
      .subscribe(resp => {
        this.datasetListObs = of(resp);
      }, error => {
        console.error(`Error:: ${error.message}`);
    });
  }

  getData(searchTerm, index?, moduleId?) {
    console.log('index ', index);
    console.log('Module ', moduleId);
    const datasetId = moduleId || this.invitationsFormArray.value[index]?.dataset?.datasetId;
    if(!datasetId) {
      return;
    }

    const filterCriteria = [];

    if(searchTerm && searchTerm.trim()) {
      const filterC = new FilterCriteria();
      filterC.fieldId = 'id';
      filterC.type = 'INLINE';
      filterC.values = [searchTerm];
      filterCriteria.push(filterC);
    }

    this.listService.getTableData(datasetId, '', 1, filterCriteria, '').pipe(
        map(resp => resp?.map(doc => doc.id))
    ).subscribe(res => {
        this.recordsList = res;
    }, error => {
        console.error(`Error : ${error.message}`);
    });
  }

  initRecordsList(i) {

  }

  displayDatasetFn(dataset): string {
    if (dataset) {
      return dataset.datasetDesc ? dataset.datasetDesc : '';
    }
    return '';
  }

  OnRoleInputBlur(control) {
    if(!control.touched) {
      control.markAsTouched();
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
  }
}

function rolesValidator(minLength: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valid =
      control.value && Array.isArray(control.value) && control.value.length >= minLength;
    return !valid ? { invalidRoles: { value: control.value } } : null;
  };
}
