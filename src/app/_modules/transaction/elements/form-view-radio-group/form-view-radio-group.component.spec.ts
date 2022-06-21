import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormViewRadioGroupComponent } from './form-view-radio-group.component';

describe('FormViewRadioGroupComponent', () => {
  let component: FormViewRadioGroupComponent;
  let fixture: ComponentFixture<FormViewRadioGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormViewRadioGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormViewRadioGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
