import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BackgroundStepPropertiesComponent } from './background-step-properties.component';
import { WorkflowBuilderService } from '@services/workflow-builder.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

describe('BackgroundStepPropertiesComponent', () => {
  let component: BackgroundStepPropertiesComponent;
  let fixture: ComponentFixture<BackgroundStepPropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BackgroundStepPropertiesComponent ],
      imports: [HttpClientTestingModule, AppMaterialModuleForSpec],
      providers: [WorkflowBuilderService, FormBuilder],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BackgroundStepPropertiesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init the determination form without initial value', () => {
    component.initForm();
    expect(component.backgroundForm).toBeDefined() ;
  });

  it('should init the determination form with intial value', () => {
    const initialValue = {name : 'test'}
    component.initForm(initialValue);
    expect(component.backgroundForm.value.name).toEqual('test');
  });

  it('should emit a properties update event', () => {
    component.initForm();
    spyOn(component.updateProperties, 'emit') ;
    component.updateStepProperties() ;
    expect(component.updateProperties.emit).toHaveBeenCalled();
  });


});
