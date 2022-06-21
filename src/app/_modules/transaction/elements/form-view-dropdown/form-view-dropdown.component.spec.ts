import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormViewDropdownComponent } from './form-view-dropdown.component';

describe('FormViewDropdownComponent', () => {
  let component: FormViewDropdownComponent;
  let fixture: ComponentFixture<FormViewDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormViewDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormViewDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
