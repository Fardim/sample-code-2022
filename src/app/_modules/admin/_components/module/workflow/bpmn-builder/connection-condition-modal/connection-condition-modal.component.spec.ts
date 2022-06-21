import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionConditionModalComponent } from './connection-condition-modal.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { WorkflowBuilderService } from '@services/workflow-builder.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

describe('ConnectionConditionModalComponent', () => {
  let component: ConnectionConditionModalComponent;
  let fixture: ComponentFixture<ConnectionConditionModalComponent>;
  let workflowBuilderService: WorkflowBuilderService;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnectionConditionModalComponent ],
      imports : [AppMaterialModuleForSpec, HttpClientTestingModule],
      providers: [
        FormBuilder,
        WorkflowBuilderService,
        { provide: MAT_DIALOG_DATA, useValue: {conditions : []} },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: ActivatedRoute, useValue: {
          queryParams: of({pathname: 'WF72', moduleId: '1005'})
        } }
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectionConditionModalComponent);
    component = fixture.componentInstance;
    workflowBuilderService = fixture.debugElement.injector.get(WorkflowBuilderService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit()', () => {
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();
  });

  it('removeCondition()', () => {
    spyOn(component,'updateView');
    const index = 1;
    component.removeCondition(index);
    expect(component.rows.length).toEqual(0);
    expect(component.updateView).toHaveBeenCalled();
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

  it('filterValueOptions()', () => {
    const value = 'test1';
    const options = [{
      TEXT: 'test1',
    },{
      TEXT: 'Test2',
    }]
    expect(component.filterValueOptions(value, options)).toEqual([{ TEXT: 'test1' }]);
  });

  it('getFieldOperators()', ()=> {

    const fieldId = null;
    expect(component.getFieldOperators(fieldId)).toEqual([]);
    component.workflowFields = [
      {datatype: 'CHAR', picklist: '1', checked: '0', id: 'PRICE_CTRL', label: 'Price control'}
    ];

    const fieldId1 = 'test1';
    component.getFieldOperators(fieldId1);
    expect(component.getFieldOperators(fieldId1)).toEqual(undefined);

    const fieldId3 = 'PRICE_CTRL';
    component.getFieldOperators(fieldId3);
    expect(component.getFieldOperators(fieldId3)).toEqual(component.STRING_OPERATORS);

    component.workflowFields = [
      {datatype: 'NUMC', picklist: '1', checked: '0', id: 'PRICE_CTRL', label: 'Price control'}
    ];
    component.getFieldOperators(fieldId3);
    expect(component.getFieldOperators(fieldId3)).toEqual(component.NUMERIC_OPERATORS);
  });

  it('should add a condition', () => {
    const currentLength = component.rows.length ;
    component.addCondition() ;
    expect(component.rows.length).toEqual(currentLength + 1 ) ;
  });

  it('should update the mat table', () => {
    spyOn(component.dataSource,'next');
    component.addCondition() ;
    expect(component.dataSource.next).toHaveBeenCalled();
  });

  it('should get the wf fields', () => {

    component.getWfFields();
    expect(component.workflowFields.length).toEqual(0);
  });

  it('should get the value option text', () => {
    const option = {
      TEXT : 'Standard price'
    }

    const result = component.getOptionText(option) ;
    expect(result).toEqual('Standard price');
  });

  it('should return the value option text', () => {

    const result = component.getOptionText(undefined) ;
    expect(result).toEqual('');
  });

  it('should return the field option text', ()=> {

    const option = 'PRICE_CTRL';
    component.workflowFields = [
      {datatype: 'CHAR', picklist: '1', checked: '0', id: 'PRICE_CTRL', label: 'Price control'}
    ];

    const result = component.getFieldOptionText(option);
    expect(result).toEqual('Price control');
  });

  it('should return a blank field option text', ()=> {

    const result = component.getFieldOptionText(undefined);
    expect(result).toEqual('');
  });

  it('should filter the field options', () => {

    component.workflowFields = [
      {datatype: 'CHAR', picklist: '1', checked: '0', id: 'PRICE_CTRL', label: 'Price control'}
    ];

    const result = component.filterFieldOptions('price');
    expect(result.length).toEqual(1);
  })

  it('onCancelClick()', () => {
    component.onCancelClick();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });


});
