import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionPropertiesComponent } from './connection-properties.component';
import { FormBuilder } from '@angular/forms';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

describe('ConnectionPropertiesComponent', () => {
  let component: ConnectionPropertiesComponent;
  let fixture: ComponentFixture<ConnectionPropertiesComponent>;
  let dialog: MatDialog;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnectionPropertiesComponent ],
      imports : [AppMaterialModuleForSpec],
      providers: [FormBuilder]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectionPropertiesComponent);
    component = fixture.componentInstance;
    dialog = TestBed.inject(MatDialog);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit()', () => {
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();
  });

  it('ngOnChanges(), should call reset when reset filter', ()=>{
    // mock data
    const chnages:import('@angular/core').SimpleChanges = {bpmnElement:{ currentValue: { businessObject: {$attrs:{}}}, previousValue: false, firstChange:null, isFirstChange:null}};
    component.ngOnChanges(chnages);
    expect(component.initForm).toBeTruthy();
    expect(component.updateStepProperties).toBeTruthy();


    // mock data
    const changes1:import('@angular/core').SimpleChanges = {bpmnElement:{ currentValue: { businessObject: {$attrs: {conditions: '["test"]'}, name:'test'}}, previousValue: false, firstChange:null, isFirstChange:null}};
    component.ngOnChanges(changes1);
    expect(component.conditionsList).toEqual(["test"]);
  });

  it('openConditionsModal()', ()=>{
    // mock data
    const resultConditions = {
      conditions: [{
        picklist: '1',
        value: {
          CODE:'TEST'
        },
        options: '',
        filteredOptions: '',
      }]
    }

    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(resultConditions), close: null });
    spyOn(dialog, 'open').and.returnValues(dialogRefSpyObj);
    component.openConditionsModal();
    expect(dialog.open).toHaveBeenCalled();
    expect(component.updateStepProperties).toBeTruthy();
  });

  it('should init the connection form with initial value', () => {
    const initialValue = {name : 'test'}
    component.initForm(initialValue);
    expect(component.connectionForm.value.name).toEqual('test');
  });

  it('should init the connection form without initial value', () => {
    component.initForm();
    expect(component.connectionForm.value.name).toBeDefined();

    spyOn(component, 'updateStepProperties');
    component.connectionForm.setValue({ name: 'test'});
    expect(component.updateStepProperties).toHaveBeenCalledWith(component.connectionForm.value);
  });

  it('should emit a properties update event', () => {
    spyOn(component.updateProperties, 'emit') ;
    component.initForm();
    component.updateStepProperties({name: 'test'}) ;
    expect(component.updateProperties.emit).toHaveBeenCalled();
  });


});
