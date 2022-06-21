import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SendEmailComponent } from './send-email.component';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { UserService } from '../../../../../_services/user/userservice.service';
import { ReportService } from '../../../_service/report.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { Userdetails } from '@models/userdetails';
import { PermissionOn } from '../../../../../_models/collaborator'
import { EmailTemplateBody } from '../../../_models/email';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { Criteria } from '@modules/report/_models/widget';

describe('SendEmailComponent', () => {
  let component: SendEmailComponent;
  let fixture: ComponentFixture<SendEmailComponent>;
  let userService: UserService;
  let reportService: ReportService;
  let router: Router;
  let sharedService: SharedServiceService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SendEmailComponent],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        AppMaterialModuleForSpec,
        MdoUiLibraryModule]
    })
      .compileComponents();
      router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    userService = fixture.debugElement.injector.get(UserService);
    reportService = fixture.debugElement.injector.get(ReportService);
    sharedService = fixture.debugElement.injector.get(SharedServiceService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(), test all prerequired stuff', async(()=>{
    const res = [{fieldId:'MATL_TYPE', widgetType: 'FILTER'}] as Criteria[];
    component.emailTo.setValue('test');
    spyOn(component, 'setEmailFormGroup');
    spyOn(component, 'getCollaboratorPermission');
    spyOn(component, 'getSelectedTemplate');
    spyOn(sharedService, 'getFilterCriteriaData').and.returnValue(of(res));
    component.ngOnInit();

    expect(component.setEmailFormGroup).toHaveBeenCalledTimes(1);
    expect(component.getCollaboratorPermission).toHaveBeenCalledTimes(1);
    expect(component.getCollaboratorPermission).toHaveBeenCalledTimes(1);
    expect(component.filterCriteria.length).toEqual(1);
  }));

  it('close(), should close the current router' , () => {
    spyOn(router, 'navigate');
    component.close();
    expect(component.close).toBeTruthy();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: null }}]);
  });

  it('selectTemplate(), should navigate to select Teamplate' , () => {
    spyOn(router, 'navigate');
    component.reportId = '844806112923162960';
    component.selectTemplate();
    expect(component.selectTemplate).toBeTruthy();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb:`sb/report/send-email/${component.reportId}`, outer: 'outer/report/email-template' } }]);
  });

  it('setEmailFormGroup(), should build the email form' , () => {
    component.setEmailFormGroup();
    expect(component.emailFormGrp).toBeTruthy();
  });

  it('selectUser(), after user selected from Options' , () => {
    const event = {option:{ viewValue: 'test' }} as MatAutocompleteSelectedEvent;
    component.selectUser(event);
    expect(component.emailRecipients.length).toEqual(1);

    component.emailRecipients = ['test'];
    component.selectUser(event);
    expect(component.emailRecipients.length).toEqual(1);
    expect(component.emailTo.value).toBeNull();
  });

  it('sendEmail(), On click of send email validate form and then send' , () => {
    const emailResponse = [{
        email:'testuser@ymail.com.',
        acknowledge: true,
      }];

    component.emailRecipients = ['testuser@ymail.com'];
    component.emailFormGrp.patchValue({subject:'subject', message:'message', to : ['testuser@ymail.com'], conditionList:[{fieldId:'MATL_TYPE', widgetType: 'FILTER'}]});
    spyOn(reportService,'shareReport').and.returnValues(of(emailResponse),throwError('Error'));
    component.sendEmail();
    expect(component.successMsg).toBeDefined('');

    component.sendEmail();
    expect(component.errorMsg).toBeDefined('');
  });

  it('sendEmail(), On click of send email validate form' , () => {
    component.emailRecipients = [''];
    component.emailFormGrp.patchValue({subject:'', message:'', to : ['']});
    component.sendEmail();
    expect(component.errorMsg).toBeUndefined('');
  });

  it('addMyself(), On click of add myself set loggedIn user as recipient' , () => {
    const userDetails = {
      email: 'nikhil@prospecta.com',
    } as Userdetails

    spyOn(userService, 'getUserDetails').and.returnValues(of(userDetails),throwError('Error'));
    component.addMyself();
    expect(component.emailRecipients.length).toEqual(1);

    component.addMyself();
    expect(component.emailRecipients.length).toEqual(1);
  });

  it('getCollaboratorPermission(), On click of getCollaboratorPermission it should return users' , () => {
    const users: PermissionOn = {users:[{email: 'testemail@test.com', userId: '1234', userName: 'Test', fName:'', lName:'', fullName:''}],
                                 roles:[], groups:[]}
    spyOn(reportService,'getCollaboratorPermission').and.returnValue(of(users));
    component.getCollaboratorPermission('',0);
    expect(component.users).toBeDefined();
  });

  it('getCollaboratorPermission(), On click of getCollaboratorPermission error should be handled' , () => {
    spyOn(reportService,'getCollaboratorPermission').and.returnValue(throwError('Error'));

    component.getCollaboratorPermission(null,null);
    expect(component.users).toBeDefined();
  });

  it('remove(),should remove user from recipients list ',()=>{
    component.emailRecipients = ['testuser']
    component.remove('testuser');
    expect(component.emailRecipients.length).toEqual(0);
  });

  it('getSelectedTemplate(),should set template subject and message ',()=>{
    const templates: EmailTemplateBody = {subType: 'Dashboard', emailSubject: 'Subject', emailText: `<b>Test Template</b>`, templateDescription: 'test'}
    reportService.selectedTemplate = new BehaviorSubject<EmailTemplateBody>(templates);
    component.getSelectedTemplate();
    expect(component.emailFormGrp.controls.subject.value).toEqual(templates.emailSubject);
    expect(component.emailFormGrp.controls.message.value).toEqual(templates.emailText);

    reportService.selectedTemplate = new BehaviorSubject<EmailTemplateBody>(Object.assign({}));
    component.getSelectedTemplate();
    expect(component.emailFormGrp.controls.subject.value).toBeUndefined();
    expect(component.emailFormGrp.controls.message.value).toBeUndefined();

  });

  it('filterUsers(),should filter user ',()=>{
    component.users = [{ userName: 'Test', fname:'', lname:'', fullName:''}];
    component.emailTo.setValue('testemail@test.com');
    component.filterUsers();
    expect(component.filteredUsers).toBeTruthy();
  });

  it('addUserManually(),should add manually added user to emailrecipents ',()=>{
    component.emailTo.setValue('testemail@test.com');
    const event = { value : 'testemail@test.com' }
    component.addUserManually(event);
    expect(component.emailRecipients.length).toEqual(1);
  });

  it('_filter(),should filter users ',()=>{
    component.users = [{ userName: 'Test', fname:'', lname:'', fullName:''}];
    component._filter('test');
    expect(component.users.length).toEqual(1);

    component._filter('');
    expect(component.users.length).toEqual(1);
  });
});
