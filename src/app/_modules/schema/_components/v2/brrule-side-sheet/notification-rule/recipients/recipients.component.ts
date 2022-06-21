import { HttpErrorResponse } from '@angular/common/http';
import { Component, forwardRef, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import FormField from '@models/form-field';
import { GetRolesPost, RolesDescription } from '@models/roles';
import { TeamMemberResponse, UserListRequestDTO } from '@models/teams';
import { RoleService } from '@services/role/role.service';
import { UserProfileService } from '@services/user/user-profile.service';
import { Observable, of, Subject } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { EmailRecipientsTypes } from '../notification-rule.modal';

@Component({
  selector: 'pros-recipients',
  templateUrl: './recipients.component.html',
  styleUrls: ['./recipients.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => RecipientsComponent)
    }]
})
export class RecipientsComponent extends FormField implements OnInit {

  recipientsFormGroup: FormGroup;
  emailRecipientsTypes = EmailRecipientsTypes;

  recordsPageIndex = 1;
  pageSize = 10;

  roleList = [];

  fieldDropvalueSearchSub: Subject<{ s: string; type: string; index?: number }> = new Subject();
  fieldDropValuesSub: Observable<any> = of([]);

  isDropdownInitializing = false;

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private profileService: UserProfileService
  ) {
    super();
   }

  ngOnInit(): void {
    this.createRecipientsFormGroup();

    this.fieldDropvalueSearchSub.subscribe((data) => {
      const type = this.emailRecipientsCtrl.at(data.index).get('type').value;
      if (type?.value === 'ROLE') {
        this.getRoles();
      } else if (type?.value === 'USER') {
        this.getUserList(data.s);
      }
    });
  }

  initDropValueList(type, i?) {
    this.fieldDropValuesSub = of([]);
    this.fieldDropvalueSearchSub.next({ s: '', type, ...((i === 0 || i) && { index: i }) });
  }

  sourceFieldValueSelected($event, index) {
    const fieldValue = $event.option.value;
    const source = this.emailRecipientsCtrl.at(index) as FormGroup;
    source.patchValue({
      recipValue: fieldValue
    });
  }

  createRecipientsFormGroup() {
    this.recipientsFormGroup = this.fb.group({
      emailRecipients: this.fb.array([]),
      cc: ['']
    })

    this.addEmailRecipients();

    this.recipientsFormGroup.valueChanges.subscribe(data => {
      let payload = {
        cc: data?.cc || '',
        emailRecipients: []
      }
      if (data.emailRecipients.length) {
        payload.emailRecipients = data.emailRecipients.map(recipient => {
          return {
            recipType: recipient?.type?.value,
            recipValue: recipient?.sendTo
          }
        })
      }

      this.onChange(payload);
    })
  }

  addEmailRecipients() {
    this.emailRecipientsCtrl.push(this.addEmailRecipient());
  }

  get emailRecipientsCtrl(): FormArray {
    return this.recipientsFormGroup.get('emailRecipients') as FormArray;
  }

  addEmailRecipient(recipientsValue?): FormGroup {
    return this.fb.group({
      type: [recipientsValue?.type ? recipientsValue?.type : ''],
      sendTo: [recipientsValue?.sendTo ? recipientsValue?.sendTo : '']
    });
  }

  emailRecipientsSelected($event, index) {
    const fieldValue = $event.option.value;
    const emailRecipients = this.emailRecipientsCtrl.at(index) as FormGroup;
    emailRecipients.patchValue({
      type: fieldValue
    });
  }

  displayEmailRecipients(type) {
    return type.label
  }

  get getEmailsList() {
    return this.emailRecipientsCtrl.value.filter(recipients => recipients.type?.label !== 'Role').map(data => data.sendTo).toString();
  }

  removeEmailRecipients(index: number) {
    if (index !== 0) {
      this.emailRecipientsCtrl.removeAt(index);
    } else {
      this.emailRecipientsCtrl.at(index).patchValue({
        type: '',
        sendTo: ''
      });
    }
  }

  getRoles() {
    this.isDropdownInitializing = true;
    const postData: GetRolesPost = {
      pageNumer: this.recordsPageIndex - 1,
      pageSize: this.pageSize
    }

    this.roleService.getUserCountByRoles(postData)
    .pipe(
      catchError((err) => {
        console.log(err);
        return of([]);
      }),
      finalize(() => this.isDropdownInitializing = false)
    )
    .subscribe((data: RolesDescription) => {
      if(data && data.roleDescription) {
        this.roleList = data.roleDescription.map(role => role.roleName);
        this.fieldDropValuesSub = of(this.roleList);
      }
    }, (error: HttpErrorResponse) => {
      console.error(error);
    })
  }

  getUserList(searchString) {
    this.isDropdownInitializing = true;
    const userListRequestDTO: UserListRequestDTO = {
      pageInfo: {
        pageNumer: this.recordsPageIndex - 1,
        pageSize: 50,
      },
      roles: [],
      searchString,
      sortingInfo: [],
      status: ['ACTIVE'],
      isPartner: false
    };

    this.profileService
      .getTeamMembers(userListRequestDTO)
      .pipe(
        catchError((err) => {
          console.log(err);
          const emptyResponse = new TeamMemberResponse();
          return of(emptyResponse);
        }),
        finalize(() => this.isDropdownInitializing = false)
      )
      .subscribe(
        (res) => {
          if (res) {
            const userList = res.userList.content.map(user => user.userName || user.email);
            this.fieldDropValuesSub = of(userList);
          }
        },
        (error) => {
          console.error(`Error : ${error.message}`);
        }
      );
  }

  writeValue(formData): void {
    if (formData?.isUpdated) {
      this.patchMailRecipientsValues(formData?.emailRecipients);
    }
  }

  patchMailRecipientsValues(emailRecipients) {
    if (emailRecipients?.length) {
     const index = this.emailRecipientsCtrl.value.findIndex(recipients => !recipients.sendTo);
     this.emailRecipientsCtrl.removeAt(index);
      emailRecipients.forEach((recipient) => {
        const recipientValue = {
          type: EmailRecipientsTypes.find(type => type?.value === recipient?.recipType) || '',
          sendTo: recipient?.recipValue || ''
        }
        this.emailRecipientsCtrl.push(this.addEmailRecipient(recipientValue));
      });
    }
  }
}
