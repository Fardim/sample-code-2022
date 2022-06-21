import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityStepPropertiesComponent } from './activity-step-properties.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { WorkflowBuilderService } from '@services/workflow-builder.service';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('ActivityStepPropertiesComponent', () => {
  let component: ActivityStepPropertiesComponent;
  let fixture: ComponentFixture<ActivityStepPropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityStepPropertiesComponent ],
      imports : [HttpClientTestingModule, AppMaterialModuleForSpec, RouterTestingModule],
      providers : [FormBuilder, WorkflowBuilderService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityStepPropertiesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the activity form', () => {
    component.initActivityForm() ;
    expect(component.activityFormGroup).toBeDefined() ;
  });

  it('should update the activity form', () => {
    component.initActivityForm() ;
    component.activityFormGroup.controls.name.setValue('first task');
    expect(component.activityFormGroup.value.name).toEqual('first task') ;
  });

  it('should emit updateProperties', () => {

      spyOn(component.updateProperties, 'emit');

      component.initActivityForm() ;
      component.activityFormGroup.controls.name.setValue('task');

      expect(component.updateProperties.emit).toHaveBeenCalled();
  });

  /*
  it('filters recipients list', () => {

    component.recipientsList = ['recipient one', 'recipient two'] ;
    const filterResult = component.filterRecipients('one').length ;
    expect(filterResult).toEqual(1);

  });
  */

  /*
  it('uncheck all recipient', () => {

    component.bpmnElement = {
      businessObject : {
        name : 'task'
      },
      type : 'bpmn:UserTask'
    }

    component.recipientsList = ['recipient one', 'recipient two'] ;
    component.uncheckAllRecipients() ;
    expect(component.selectedRecipients.length).toEqual(0);

  });


  it('check all recipient', () => {

    component.bpmnElement = {
      businessObject : {
        name : 'task'
      },
      type : 'bpmn:UserTask'
    }

    component.recipientsList = ['recipient one', 'recipient two'] ;
    component.checkAllRecipients() ;
    expect(component.selectedRecipients.length).toEqual(2);

  });
  */

  /*
  it('should check if a recipient is selected', () => {

    component.selectedRecipients = ['recipient one', 'recipient two'] ;
    const selectedResult = component.isRecipientSelected('recipient one') ;
    expect(selectedResult).toBeTrue();

  });
  */

  it('should update activity step properties', () => {
    spyOn(component.updateProperties, 'emit');

    component.initActivityForm() ;
    component.updateStepProperties() ;


    expect(component.updateProperties.emit).toHaveBeenCalled();

  });

  it('should check if a workflow field is selected', () => {

    component.selectedWorkflowFields = [
          {id : 1, label : 'recipient one'},
          {id : 2, label : 'recipient two'}
        ] ;
    const selectedResult = component.isFieldSelected(1) ;
    expect(selectedResult).toBeTrue();

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
      {recipient : 'r1', fields : []},
      {recipient : 'r2', fields : []},
      {recipient : 'r3', fields : []}
    ] ;

    component.currentPageIdx = 0;

    const selectedResult = component.enableNextBtn ;
    expect(selectedResult).toBeTrue();

  });

  it('should remove a recipient', () => {

    component.selectedRecipients = [
      {recipient : {id: 'r1', value : 'recipient1'}, fields : []},
      {recipient : {id: 'r2', value : 'recipient2'}, fields : []},
      {recipient : {id: 'r3', value : 'recipient3'}, fields : []}
    ] ;

    component.possibleRecipients = component.selectedRecipients.slice(0,2) ;

    spyOn(component, 'paginateChip') ;
    component.removeRecipient(0) ;

    expect(component.selectedRecipients.length).toEqual(2);
    expect(component.paginateChip).toHaveBeenCalled();

  });

  it('should add a selected recipient', () => {

    component.selectedRecipients = [
      {recipient : {id: 'r1', value : 'recipient1'}, fields : []},
      {recipient : {id: 'r2', value : 'recipient2'}, fields : []},
      {recipient : {id: 'r3', value : 'recipient3'}, fields : []}
    ] ;

    const optionData = {
      option : {
        value : {id : 'r4', value: 'recipient4'}
      }
    }

    component.recipientSelected(optionData) ;

    expect(component.selectedRecipients.length).toEqual(4) ;

  });

  it('should not add an already selected recipient', () => {

    component.selectedRecipients = [
      {recipient : {id: 'r1', value : 'recipient1'}, fields : []},
      {recipient : {id: 'r2', value : 'recipient2'}, fields : []},
      {recipient : {id: 'r3', value : 'recipient3'}, fields : []}
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
      {recipient : {id: 'r1', value : 'recipient1'}, fields : []},
      {recipient : {id: 'r2', value : 'recipient2'}, fields : []},
      {recipient : {id: 'r3', value : 'recipient3'}, fields : []}
    ] ;

    component.currentPageIdx = 1 ;
    component.paginateChip('prev');
    expect(component.currentPageIdx).toEqual(0) ;

  });

  it('should paginate recipients to next', () => {

    component.selectedRecipients = [
      {recipient : {id: 'r1', value : 'recipient1'}, fields : []},
      {recipient : {id: 'r2', value : 'recipient2'}, fields : []},
      {recipient : {id: 'r3', value : 'recipient3'}, fields : []}
    ] ;

    component.currentPageIdx = 0 ;
    component.paginateChip('next');
    expect(component.currentPageIdx).toEqual(1) ;

  });

  it('should update the current displayed recipients', () => {

    component.selectedRecipients = [
      {recipient : {id: 'r1', value : 'recipient1'}, fields : []},
      {recipient : {id: 'r2', value : 'recipient2'}, fields : []},
      {recipient : {id: 'r3', value : 'recipient3'}, fields : []}
    ] ;

    component.paginateChip();
    expect(component.possibleRecipients.length).toEqual(2) ;

  });


  it('should add a selected field', () => {

    component.selectedWorkflowFields = [] ;
    component.workflowFields = [
      { id : 1, label : 'Moving price R', key : 'movingPriceR', type : 'input'},
      { id : 3, label : 'Storage bin', key : 'storageBin', type : 'input'}
    ];

    component.selectedRecipients = [
      {recipient : {
        id: 'r1', value: 'recipient1'
      },
    fields: []}
    ]

    const selectionData = {
            option: {
              selected : true,
              value : 1
            }
          }

    component.fieldSelectionChange(selectionData);

    expect(component.selectedWorkflowFields.length).toEqual(1);
    expect(component.selectedRecipients[0].fields.length).toEqual(1);

  });

  it('should remove a field', () => {

    component.selectedWorkflowFields = [
          {id : 1, label : 'recipient one'}
        ] ;

    component.selectedRecipients = [
          {recipient : {
            id: 'r1', value: 'recipient1'
          },
        fields: [
          {id : 1, label : 'recipient one', value:''}
        ]}
        ]

    const selectionData = {
            option: {
              selected : false,
              value : 1
            }
          }

    component.fieldSelectionChange(selectionData);

    expect(component.selectedWorkflowFields.length).toEqual(0);
    expect(component.selectedRecipients[0].fields.length).toEqual(0);

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

    component.initActivityForm();
    component.activityFormGroup.patchValue({
      recipientType : 'USER'
    })
    component.getRecipientsList();

    expect(component.recipientsList.length).toEqual(0);

  });

  it('should get the recipient list', () => {

    component.bpmnElement = {
      id : '02'
    }
    component.initActivityForm();
    component.activityFormGroup.patchValue({
      recipientType : 'USER'
    })
    component.getRecipientsList();

    expect(component.recipientsList.length).toEqual(0);

  });

  it('should get the wf fields', () => {
    component.getWfFileds();
    expect(component.workflowFields).toBeDefined();
  })


});
