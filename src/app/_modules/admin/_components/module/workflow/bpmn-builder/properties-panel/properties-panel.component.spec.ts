import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertiesPanelComponent } from './properties-panel.component';

import { FormBuilder } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { WorkflowBuilderService } from '@services/workflow-builder.service';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';


describe('PropertiesPanelComponent', () => {
  let component: PropertiesPanelComponent;
  let fixture: ComponentFixture<PropertiesPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PropertiesPanelComponent ],
      imports : [HttpClientTestingModule, AppMaterialModuleForSpec],
      providers : [FormBuilder, WorkflowBuilderService],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertiesPanelComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('updateStepProperties() should update step properties', () =>{
    /*
    const attributes = true;
    component.updateStepProperties(attributes);
    expect(component.updateStepProperties).toBeTruthy();
    */

   spyOn(component.updateProperties, 'emit');
   component.updateStepProperties({}) ;
   expect(component.updateProperties.emit).toHaveBeenCalled();
  });

});
