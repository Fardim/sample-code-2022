import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportReportDatatableComponent } from './export-report-datatable.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '@modules/shared/shared.module';
import { FormGroup, FormControl } from '@angular/forms';
import { ElementRef } from '@angular/core';
import { MockElementRef } from '@modules/shared/_directives/resizeable.directive.spec';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { WidgetDownloadUser } from '@models/collaborator';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

describe('ExportReportDatatableComponent', () => {
  let component: ExportReportDatatableComponent;
  let fixture: ComponentFixture<ExportReportDatatableComponent>;
  let router: Router;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExportReportDatatableComponent],
      imports: [ MdoUiLibraryModule,
        AppMaterialModuleForSpec,
        ReactiveFormsModule,
        FormsModule,
        SharedModule,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: ElementRef, useValue: MockElementRef },
        {provide: MatDialogRef,
        useValue: mockDialogRef},
        { provide: MAT_DIALOG_DATA, useValue: {}}

      ]
    }).compileComponents();
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportReportDatatableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit, loaded pre required', (() => {
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();
  }));

  it('close(), should close the current router' , () => {
    spyOn(router, 'navigate');
    component.close();
    expect(component.close).toBeTruthy();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: null }}],  {queryParamsHandling: 'preserve'});
  });

  it('testEmailValidity(), should check Email validity truthfully', () => {
    const email = 'user@email.com';
    expect(component.testEmailValidity(email)).toBeTruthy();
  });

  it('testEmailValidity(), should check Email validity Falsely', () => {
    const email = 'user@email@.com';
    expect(component.testEmailValidity(email)).toBeFalse();
  });

  it('changeAddUserControlValidity(), should init the selectedEmail value', () => {
    const email = 'user@email@.com';
    fixture.detectChanges();
    component.addwidgetSubsFrmGrp = new FormGroup({
      addUsersFilter: new FormControl('')
    });
    component.loosefocus = fixture.componentInstance.loosefocus;
    component.changeAddUserControlValidity(email);
    expect(component.selectedEmail).toBeTruthy();
  });

  it('remove(), method call at time remove from selected users', async(()=>{
    // mock data
    const removeAble = {userName:'srana', email:'user@email.com'} as WidgetDownloadUser;
    component.selectedUsers = [{userName:'srana'} as WidgetDownloadUser, {userName:'developer'} as WidgetDownloadUser, {} as WidgetDownloadUser, {} as WidgetDownloadUser];
    // call actual componenet method
    component.remove(removeAble);
    expect(component.selectedUsers.length).toEqual(4, 'Selected item should remove from selected collaborators');
  }));

  it('changeAddUserControlValidity(), method call on user selection', async(()=>{
    // mock data
    const userEmail='user@email.com';
    component.changeAddUserControlValidity(userEmail)
    expect(component.selectedEmail).toEqual(userEmail);
  }));

  // it('changeAddUserControlValidity(), method call on user selection', async(()=>{
  //   // mock data
  //   const userEmail='user@email.com';
  //   component.changeAddUserControlValidity(userEmail)
  //   expect(component.selectedEmail).toBeDefined();
  // }));

  it('displayWith(), should return the description', async(() => {
    const obj = {description :'NDC Type'} as WidgetDownloadUser;
    expect(component.displayWith(obj)).toEqual('NDC Type');
    expect(component.displayWith(null)).toEqual(null);
  }));

  it('onSelectUser()',async(()=>{
    const obj = { option :{value:{email:'abc@gmail.com',userName:'Admin'}}} as MatAutocompleteSelectedEvent;
    const event  = null as MatAutocompleteSelectedEvent;
    const objwrong = { option :{value:{email:'abc',userName:'Admin'}}} as MatAutocompleteSelectedEvent;
    component.selectedUsers = [{userName:'Admin'} as WidgetDownloadUser];
    component.onSelectUser(obj);
    expect(component.onSelectUser(objwrong)).toBeUndefined();
    expect(component.onSelectUser(event)).toBeUndefined();
    expect(component.selectedUsers.length).toEqual(1);
  }));
});
