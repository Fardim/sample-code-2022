import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailEscalationPropertiesComponent } from './email-escalation-properties.component';
import { FormBuilder } from '@angular/forms';
import { WorkflowBuilderService } from '@services/workflow-builder.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { RouterTestingModule } from '@angular/router/testing';


describe('EmailEscalationPropertiesComponent', () => {
  let component: EmailEscalationPropertiesComponent;
  let fixture: ComponentFixture<EmailEscalationPropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailEscalationPropertiesComponent ],
      imports: [HttpClientTestingModule, AppMaterialModuleForSpec, RouterTestingModule],
      providers : [FormBuilder, WorkflowBuilderService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailEscalationPropertiesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should initialize the activity form', () => {
    component.initForm({name : 'first step'}) ;
    expect(component.emailForm).toBeDefined() ;
    expect(component.emailForm.value.name).toEqual('first step') ;
  });



  it('should emit updateProperties', () => {

      spyOn(component.updateProperties, 'emit');

      component.initForm() ;
      component.emailForm.controls.name.setValue('task');

      expect(component.updateProperties.emit).toHaveBeenCalled();
  });

  it('should check recipient pagination previous is enabled', () => {

    let enableResult = component.enablePreBtn ;
    expect(enableResult).toBeTrue();

    component.currentPageIdx = 1;

    enableResult = component.enablePreBtn ;
    expect(enableResult).toBeFalse();

  });

  it('should check recipient pagination next is enabled', () => {

    component.selectedRecipients = [
      {id: 'r1', value : 'recipient1'},
      {id: 'r2', value : 'recipient2'},
      {id: 'r3', value : 'recipient3'}
    ] ;


    component.currentPageIdx = 0;

    const selectedResult = component.enableNextBtn ;
    expect(selectedResult).toBeTrue();

  });

  it('should remove a recipient', () => {

    component.selectedRecipients = [
      {id: 'r1', value : 'recipient1'},
      {id: 'r2', value : 'recipient2'},
      {id: 'r3', value : 'recipient3'}
    ] ;

    component.possibleRecipients = component.selectedRecipients.slice(0,2) ;

    spyOn(component, 'paginateChip') ;
    component.removeRecipient(0) ;

    expect(component.selectedRecipients.length).toEqual(2);
    expect(component.paginateChip).toHaveBeenCalled();

  });


  it('should init the recipients list', () => {



    component.selectedRecipients = [
      {id: 'r1', value : 'recipient1'},
      {id: 'r2', value : 'recipient2'},
      {id: 'r3', value : 'recipient3'}
    ] ;

    component.initForm();
    component.oldFormValue = {recipientType : 'User'} ;

    component.emailForm.patchValue({recipientType : 'Role'});

    expect(component.selectedRecipients.length).toEqual(0);


  });

  it('should add a selected recipient', () => {

    component.selectedRecipients = [
      {id: 'r1', value : 'recipient1'},
      {id: 'r2', value : 'recipient2'},
      {id: 'r3', value : 'recipient3'}
    ] ;

    const optionData = {
      option : {
        value : {id: 'r4', value : 'recipient4'}
      }
    }

    component.recipientSelected(optionData) ;

    expect(component.selectedRecipients.length).toEqual(4) ;

  });

  it('should not add an already selected recipient', () => {

    component.selectedRecipients = [
      {id: 'r1', value : 'recipient1'},
      {id: 'r2', value : 'recipient2'},
      {id: 'r3', value : 'recipient3'}
    ] ;

    const optionData = {
      option : {
        value : {id: 'r1', value : 'recipient1'}
      }
    }

    component.recipientSelected(optionData) ;

    expect(component.selectedRecipients.length).toEqual(3) ;

  });

  it('should paginate recipients to prev', () => {

    component.selectedRecipients = [
      {id: 'r1', value : 'recipient1'},
      {id: 'r2', value : 'recipient2'},
      {id: 'r3', value : 'recipient3'}
    ] ;

    component.currentPageIdx = 1 ;
    component.paginateChip('prev');
    expect(component.currentPageIdx).toEqual(0) ;

  });

  it('should paginate recipients to next', () => {

    component.selectedRecipients = [
      {id: 'r1', value : 'recipient1'},
      {id: 'r2', value : 'recipient2'},
      {id: 'r3', value : 'recipient3'}
    ] ;

    component.currentPageIdx = 0 ;
    component.paginateChip('next');
    expect(component.currentPageIdx).toEqual(1) ;

  });

  it('should update the current displayed recipients', () => {

    component.selectedRecipients = [
      {id: 'r1', value : 'recipient1'},
      {id: 'r2', value : 'recipient2'},
      {id: 'r3', value : 'recipient3'}
    ] ;

    component.paginateChip();
    expect(component.possibleRecipients.length).toEqual(2) ;

  });


  it('should return option text', () => {

    const option = {
      id : 1,
      value : 'option 1'
    }
    const result = component.getOptionText(option) ;
    expect(result).toEqual('option 1');

  });

  it('should return an empty text', () => {


    const result = component.getOptionText(null) ;
    expect(result).toEqual('');

  });

  it('should get the recipient list', () => {

    component.initForm({
      recipientType : 'USER'
    });

    component.getRecipientsList();

    expect(component.recipientsList.length).toEqual(0);

  });

  it('should get the recipient list', () => {

    component.bpmnElement = {
      id : '02'
    }

    component.initForm({
      recipientType : 'USER'
    });

    component.getRecipientsList();

    expect(component.recipientsList.length).toEqual(0);

  });



});
