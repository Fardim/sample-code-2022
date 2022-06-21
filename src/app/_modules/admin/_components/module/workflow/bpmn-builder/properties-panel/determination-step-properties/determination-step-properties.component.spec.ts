import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeterminationStepPropertiesComponent } from './determination-step-properties.component';
import { FormBuilder, Validators } from '@angular/forms';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

describe('DeterminationStepPropertiesComponent', () => {
  let component: DeterminationStepPropertiesComponent;
  let fixture: ComponentFixture<DeterminationStepPropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeterminationStepPropertiesComponent ],
      imports : [AppMaterialModuleForSpec],
      providers: [FormBuilder]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeterminationStepPropertiesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit()', () => {
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();
  });

  it('ngOnChanges()', ()=>{
    // mock data
    const name = 'test';
    const changes:import('@angular/core').SimpleChanges = {bpmnElement:{ currentValue: { businessObject: {$attrs: {}, name: name}}, previousValue: false, firstChange:null, isFirstChange:null}};
    spyOn(component, 'initForm')
    spyOn(component, 'updateStepProperties')
    component.determinationForm = component.fb.group({
      name : [ name, Validators.required]
    }) ;
    component.ngOnChanges(changes);
    expect(component.initForm).toHaveBeenCalledWith({ name });
    expect(component.updateStepProperties).toHaveBeenCalledWith(component.determinationForm.value);
  });

  it('ngOnChanges(), updateStepProperties() not called', ()=>{
    spyOn(component, 'updateStepProperties')
 
    // mock data
    const changes1:import('@angular/core').SimpleChanges = {bpmnElement:{ currentValue: { businessObject: {$attrs: {conditions: '["test"]'}, name:'test'}}, previousValue: false, firstChange:null, isFirstChange:null}};
    component.ngOnChanges(changes1);
    expect(component.updateStepProperties).not.toHaveBeenCalled();
  });

  it('should init the determination form without initial value', () => {
    component.initForm();
    expect(component.determinationForm).toBeDefined() ;

    spyOn(component , 'updateStepProperties');
    component.determinationForm.controls.name.setValue('test');
    expect(component.updateStepProperties).toHaveBeenCalledWith(component.determinationForm.value);
  });

  it('should init the determination form with intial value', () => {
    const initialValue = {name : 'test'}
    component.initForm(initialValue);
    expect(component.determinationForm.value.name).toEqual('test');
  });

  it('should emit a properties update event', () => {
    spyOn(component.updateProperties, 'emit') ;
    component.updateStepProperties({name: 'test'}) ;
    expect(component.updateProperties.emit).toHaveBeenCalled();
  });

});
