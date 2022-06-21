import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DecisionsModalComponent } from './decisions-modal.component';
import { FormBuilder } from '@angular/forms';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkflowBuilderService } from '@services/workflow-builder.service';

describe('DecisionsModalComponent', () => {
  let component: DecisionsModalComponent;
  let fixture: ComponentFixture<DecisionsModalComponent>;
  let workflowBuilderService: WorkflowBuilderService;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DecisionsModalComponent ],
      imports : [AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule],
      providers: [
        FormBuilder,
        { provide: MAT_DIALOG_DATA, useValue: {recipient : 'recipient', fields : [{ id : 1, label : 'Moving price R', key : 'movingPriceR', type : 'input', value: 'test'}]} },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DecisionsModalComponent);
    component = fixture.componentInstance;
    workflowBuilderService = fixture.debugElement.injector.get(WorkflowBuilderService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create and initialize the fields form', () => {
    component.ngOnInit();
    expect(component.decisionForm.value['1']).toEqual('test');
  });

  it('it should close the dialog', () => {
   component.onCancelClick();
   expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('getOptionText()', () => {
    const option = {
      TEXT: 'test'
    }
    expect(component.getOptionText(option)).toEqual('test');

    const option1 = null;
    expect(component.getOptionText(option1)).toEqual('');
  });

  it('filterOptions()', () => {
    const value = {
      TEXT: 'test'
    }
    const field = {
      options: [
      {
        TEXT: 'TEST'
      },{
        TEXT: 'newValue'
      }]
    }
    expect(component.filterOptions(value, field)).toEqual( [{TEXT: 'TEST'}]);

    const value1 = 'test';
    expect(component.filterOptions(value1, field)).toEqual( [{TEXT: 'TEST'}]);
  });

  it('getFieldOptions()', () => {
    spyOn(workflowBuilderService,'getFieldOptions');
    const fieldId = 'test';
    const obj = {
      plantCode: 'MDO1003',
      objectType:'1005',
      fetchCount:'-1',
      lang:'en',
      fieldId:  ''
    }
    component.getFieldOptions(fieldId);
    expect(workflowBuilderService.getFieldOptions).toHaveBeenCalledWith({...obj, fieldId });
  });

});
